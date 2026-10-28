// =====================================================
// CHU TRÌNH EULER: kiểm tra điều kiện, tìm chu trình, mô phỏng trên đồ thị
// =====================================================
// Điều kiện (xét trên các đỉnh có cạnh; đỉnh cô lập bị bỏ qua):
//   Vô hướng (loai 1-3): các cạnh cùng một thành phần liên thông VÀ mọi đỉnh có bậc chẵn
//                        (vòng khuyên tính bậc 2, nên không phá điều kiện).
//   Có hướng (loai 4-5): liên thông yếu VÀ mọi đỉnh có deg⁺ = deg⁻.
// Thuật toán tìm chu trình: Hierholzer (đi theo cạnh chưa dùng, kẹt thì lùi và ghép chu trình con).
//   Dùng "số thứ tự cạnh" để đánh dấu đã dùng -> đúng với cạnh song song và vòng khuyên.
// Tô màu trên hình: biến eulerHL (state.js) = { order: {chỉ số cạnh: thứ tự đi}, cur: đỉnh hiện tại }
//   draw.js đọc eulerHL khi vẽ cạnh / đỉnh.

const MAU_EULER = "#f59e0b";
let eulerTimer = null;   // bộ đếm giờ của phần mô phỏng từng bước
let eulerStart = null;   // đỉnh bắt đầu do người dùng chọn (null = đỉnh nhỏ nhất có cạnh)

// Dừng mô phỏng và bỏ tô màu (KHÔNG vẽ lại; nơi gọi tự vẽ lại nếu cần)
function resetEuler() {
    clearInterval(eulerTimer);
    eulerTimer = null;
    eulerHL = null;
}

// ---- Bước 1: phân tích đồ thị, trả về { ok, lyDo[], vs[], es[], ... } ----
function phanTichEuler() {
    const huong = coHuong(), m = edges.length;
    const deg = Array(n).fill(0), dIn = Array(n).fill(0), dOut = Array(n).fill(0);
    edges.forEach(e => {
        if (huong) { dOut[e.x]++; dIn[e.y]++; }
        else { deg[e.x]++; deg[e.y]++; }          // vòng khuyên x = y: cộng 2 lần -> bậc 2
    });
    const coCanh = dsDinh().filter(i => (huong ? dIn[i] + dOut[i] : deg[i]) > 0);
    const r = { ok: false, lyDo: [], vs: [], es: [], coCanh, coDuongDi: null, start: null };

    if (m === 0) { r.lyDo.push("Đồ thị không có cạnh nào."); return r; }

    // Liên thông (yếu, với đồ thị có hướng): gộp các đỉnh bằng union-find
    const cha = dsDinh();
    const goc = x => cha[x] === x ? x : (cha[x] = goc(cha[x]));
    edges.forEach(e => { cha[goc(e.x)] = goc(e.y); });
    const lienThong = new Set(coCanh.map(goc)).size === 1;
    if (!lienThong) r.lyDo.push("Các cạnh không nằm trong cùng một thành phần liên thông.");

    // Điều kiện về bậc
    let le = [];
    if (huong) {
        le = coCanh.filter(i => dIn[i] !== dOut[i]);
        if (le.length) r.lyDo.push("Có đỉnh deg⁺ ≠ deg⁻: " + le.map(i => `${i} (deg⁺=${dOut[i]}, deg⁻=${dIn[i]})`).join(", ") + ".");
    } else {
        le = coCanh.filter(i => deg[i] % 2 === 1);
        if (le.length) r.lyDo.push("Có đỉnh bậc lẻ: " + le.map(i => `${i} (bậc ${deg[i]})`).join(", ") + ".");
    }

    // Không có chu trình: xét xem có ĐƯỜNG ĐI Euler không (để báo thêm 1 dòng)
    let canhEuler = edges;   // danh sách cạnh đem đi tìm chu trình (có thể thêm cạnh sao chép ở chế độ người phát thư)
    if (r.lyDo.length) {
        if (lienThong) {
            if (!huong && le.length === 2) r.coDuongDi = `từ đỉnh ${le[0]} đến đỉnh ${le[1]}`;
            if (huong) {
                const dau = le.filter(i => dOut[i] - dIn[i] === 1), cuoi = le.filter(i => dIn[i] - dOut[i] === 1);
                if (le.length === 2 && dau.length === 1 && cuoi.length === 1) r.coDuongDi = `từ đỉnh ${dau[0]} đến đỉnh ${cuoi[0]}`;
            }
        }
        // Vô hướng + liên thông: không có chu trình Euler thì tìm HÀNH TRÌNH NGẮN NHẤT đi qua mọi cạnh (bài toán người phát thư, postman.js)
        if (!huong && lienThong) {
            const k = tinhNguoiPhatThu();
            if (k.loi) r.postmanLoi = k.loi;
            else if (k.ds.length) {
                r.postman = { kq: k, extra: canhThemTheoPhanHoach(k.goc, k.ds[k.best]) };
                canhEuler = edges.concat(r.postman.extra);
            }
        }
        if (!r.postman) return r;
    }

    // ---- Bước 2: Hierholzer ----
    const E = canhEuler, mE = E.length;
    const adj = dsDinh().map(() => []);
    E.forEach((e, id) => {
        adj[e.x].push({ to: e.y, id });
        if (!huong) adj[e.y].push({ to: e.x, id });   // vô hướng: lưu cả 2 chiều (vòng khuyên: 2 lần, cùng id)
    });
    adj.forEach(l => l.sort((a, b) => a.to - b.to || a.id - b.id));

    const s = coCanh.includes(eulerStart) ? eulerStart : coCanh[0];
    const used = Array(mE).fill(false), ptr = Array(n).fill(0);
    const stV = [s], stE = [-1], resV = [], resE = [];
    while (stV.length) {
        const v = stV[stV.length - 1], l = adj[v];
        while (ptr[v] < l.length && used[l[ptr[v]].id]) ptr[v]++;
        if (ptr[v] < l.length) {
            const { to, id } = l[ptr[v]++];
            used[id] = true;
            stV.push(to); stE.push(id);
        } else {
            stV.pop(); resV.push(v); resE.push(stE.pop());
        }
    }
    r.vs = resV.reverse();              // dãy đỉnh: s, ..., s (m + 1 phần tử)
    r.es = resE.reverse().slice(1);     // dãy cạnh (chỉ số trong canhEuler; cạnh thêm đánh số tiếp sau cạnh gốc)
    r.start = s;
    r.ok = r.es.length === mE;          // phòng hờ
    r.tong = E.reduce((t, e) => t + trongSoCanh(e), 0);   // độ dài hành trình = tổng trọng số các cạnh đã đi (cạnh không có w tính 1)
    return r;
}

// ---- Tô màu / mô phỏng trên hình ----
// Ghi lời giải thích bước hiện tại: hiện ở khung thông tin VÀ ngay trên hình (vì khi mô phỏng trang đã cuộn lên chỗ đồ thị)
function datThongBaoEuler(msg) {
    if (eulerHL) eulerHL.msg = msg;
    const t = $("eulerStatus");
    if (t) t.textContent = msg;
}

// Cuộn trang lên chỗ đồ thị để xem luôn, khỏi phải lướt
function cuonDenDoThi() {
    svg.scrollIntoView({ behavior: "smooth", block: "start" });
}

function trangThaiEuler(r, k) {
    if (k === 0) datThongBaoEuler(`Bắt đầu tại đỉnh ${r.vs[0]}.`);
    else if (k < r.es.length) datThongBaoEuler(`Bước ${k}/${r.es.length}: đi ${r.vs[k - 1]} → ${r.vs[k]} qua cạnh e${r.es[k - 1] + 1}.`);
    else datThongBaoEuler(`Xong: đã đi hết ${r.es.length} cạnh và quay về đỉnh ${r.vs[k]}.`);
}

// Chế độ người phát thư: muốn tô / mô phỏng thì phải thêm các cạnh sao chép (màu xanh lá) vào đồ thị trước, rồi phân tích lại
function chuanBiEuler() {
    let r = phanTichEuler();
    if (r.ok && r.postman) {
        npt = r.postman.kq;
        apDungPhanHoach(npt.best);   // thêm cạnh + vẽ lại + dựng lại bảng thông tin
        r = phanTichEuler();
    }
    return r;
}

function chayEuler() {
    const r = chuanBiEuler();
    if (!r.ok) return;
    resetEuler();
    eulerHL = { order: {}, cur: r.vs[0] };
    trangThaiEuler(r, 0);
    veDoThi();
    cuonDenDoThi();
    let k = 0;
    eulerTimer = setInterval(() => {
        if (k >= r.es.length) { clearInterval(eulerTimer); eulerTimer = null; return; }
        eulerHL.order[r.es[k]] = k + 1;
        k++;
        eulerHL.cur = r.vs[k];
        trangThaiEuler(r, k);
        veDoThi();
    }, 800);
}

function hienEuler() {
    const r = chuanBiEuler();
    if (!r.ok) return;
    resetEuler();
    eulerHL = { order: {}, cur: null };
    r.es.forEach((id, i) => { eulerHL.order[id] = i + 1; });
    datThongBaoEuler(`Đã tô cả ${r.es.length} cạnh, số trên cạnh là thứ tự đi.`);
    veDoThi();
    cuonDenDoThi();
}

function boEuler() {
    resetEuler();
    veDoThi();
    const t = $("eulerStatus");
    if (t) t.textContent = "";
    cuonDenDoThi();   // nhảy lên chỗ đồ thị để xem luôn
}

function doiDinhEuler(v) {
    eulerStart = parseInt(v);
    hienThiThongTin();   // dựng lại bảng và tự bỏ tô màu cũ
}

// ---- Bước 3: vẽ phần Euler vào khung thông tin ----
// Dãy đỉnh – cạnh của hành trình; cạnh thêm (sao chép) ghi dấu * (chỉ có ở chế độ người phát thư)
function htmlDayEuler(r, soCanhGoc) {
    const huong = coHuong(), gach = huong ? "→" : "–";
    return '<div class="euler-seq">' + r.vs.map((v, i) =>
        `<span class="euler-v">${v}</span>` + (i < r.es.length
            ? `<span class="euler-e" title="cạnh e${r.es[i] + 1}${r.es[i] >= soCanhGoc ? " (cạnh thêm)" : ""}">${gach} e${r.es[i] + 1}${r.es[i] >= soCanhGoc ? "*" : ""} ${gach}</span>` : "")
    ).join("") + "</div>" +
    `<div class="euler-line">${r.vs.join(" → ")}</div>`;
}

function htmlNutEuler() {
    return '<div class="euler-btns"><button onclick="chayEuler()">▶ Mô phỏng</button><button class="success" onclick="hienEuler()">Tô cả chu trình</button><button class="danger" onclick="boEuler()">Bỏ tô màu</button></div>' +
        '<div class="euler-status" id="eulerStatus"></div>';
}

function htmlEuler() {
    const r = phanTichEuler(), huong = coHuong();
    let text = `<h3 class="adjacency-matrix-heading">Chu trình Euler (đồ thị ${loaiDoThi()})</h3><div class="euler-wrap">`;
    const chonDinh = () => `<div class="euler-start">Đỉnh bắt đầu: <select onchange="doiDinhEuler(this.value)">${
        r.coCanh.map(i => `<option value="${i}"${i === r.start ? " selected" : ""}>${i}</option>`).join("")}</select></div>`;

    // --- Không có chu trình Euler ---
    if (!r.ok) {
        text += '<div class="euler-no">✖ Không có chu trình Euler</div>';
        text += r.lyDo.map(s => `<div class="euler-reason">${s}</div>`).join("");
        if (r.coDuongDi) text += `<div class="euler-path">Nhưng có <b>đường đi Euler</b> ${r.coDuongDi}.</div>`;
        if (r.postmanLoi) text += `<div class="euler-reason">Không tính được hành trình ngắn nhất: ${r.postmanLoi}</div>`;
        text += "</div>";
        text += ghiChu(huong
            ? "Điều kiện: liên thông yếu và mọi đỉnh có deg⁺ = deg⁻. (Hành trình ngắn nhất qua mọi cạnh cho đồ thị có hướng chưa được hỗ trợ.)"
            : "Điều kiện: liên thông và mọi đỉnh có bậc chẵn (vòng khuyên tính bậc 2).");
        return text;
    }

    // --- Không có chu trình Euler thật, nhưng có HÀNH TRÌNH NGẮN NHẤT đi qua mọi cạnh (người phát thư) ---
    if (r.postman) {
        const k = r.postman.kq, soGoc = edges.length;
        text += '<div class="euler-no">✖ Không có chu trình Euler</div>';
        text += r.lyDo.map(s => `<div class="euler-reason">${s}</div>`).join("");
        text += '<div class="euler-yes" style="margin-top:12px">✔ Hành trình ngắn nhất đi qua mọi cạnh rồi quay về (người phát thư)</div>';
        text += `<div class="euler-reason">Phải đi lặp lại một số cạnh (cạnh có dấu *, tô xanh lá khi thêm vào đồ thị) để mọi đỉnh có bậc chẵn: nối ${k.ds[k.best].pairs.map(q => `[${q.path.join("→")}]`).join(" và ")}.</div>`;
        text += chonDinh();
        text += htmlDayEuler(r, soGoc);
        text += `<div class="npt-total">Độ dài ngắn nhất = Σw(e) + m(G) = ${fmt(k.tong)} + ${fmt(k.m)} = ${fmt(r.tong)}</div>`;
        text += htmlNutEuler() + "</div>";
        text += ghiChu("Bấm “Mô phỏng” hoặc “Tô cả chu trình” sẽ tự thêm các cạnh lặp vào đồ thị (xem chi tiết các phân hoạch ở mục Bài toán người phát thư bên dưới), rồi đi theo hành trình này.");
        if (k.goc.some(e => e.w === undefined)) text += ghiChu("Cạnh nhập không có trọng số được tính w = 1.");
        return text;
    }

    // --- Có chu trình Euler ---
    text += '<div class="euler-yes">✔ Có chu trình Euler</div>';
    text += chonDinh();
    text += htmlDayEuler(r, edges.length);
    const daThem = npt && npt.daApDung !== null && canhThemNPT.size > 0;
    text += daThem
        ? `<div class="npt-total">Độ dài ngắn nhất (đã thêm ${canhThemNPT.size} cạnh lặp) = ${fmt(r.tong)}</div>`
        : `<div class="npt-total">Độ dài hành trình = Σw(e) = ${fmt(r.tong)}</div>`;
    text += htmlNutEuler() + "</div>";
    text += ghiChu(`Chu trình đi qua đủ ${edges.length} cạnh, mỗi cạnh đúng 1 lần, rồi quay về đỉnh xuất phát. Thuật toán Hierholzer.`);
    if (!huong && !daThem) text += ghiChu("Mọi đỉnh đều bậc chẵn nên đây cũng là hành trình ngắn nhất qua mọi cạnh (m(G) = 0).");
    if (r.coCanh.length < n) text += ghiChu("Các đỉnh cô lập (không có cạnh) được bỏ qua khi xét liên thông.");
    return text;
}
