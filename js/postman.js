// =====================================================
// BÀI TOÁN NGƯỜI PHÁT THƯ (Chinese Postman) cho đồ thị VÔ HƯỚNG (loai 1-3)
// =====================================================
// Mục tiêu: hành trình ngắn nhất đi qua MỌI cạnh ít nhất 1 lần rồi quay về đỉnh đầu.
// Các bước (đúng như bài mẫu trên lớp):
//   1) Σw(e): tổng trọng số các cạnh (cạnh không có w tính w = 1).
//   2) V_o(G): tập các đỉnh bậc lẻ (luôn là số chẵn). Nếu rỗng -> đã có chu trình Euler, m(G) = 0.
//   3) P = {P1, P2, ...}: các PHÂN HOẠCH CẶP của V_o(G) (ghép các đỉnh lẻ thành từng cặp).
//      d(Pi) = tổng khoảng cách ngắn nhất giữa hai đỉnh của mỗi cặp (Floyd–Warshall).
//   4) m(G) = min d(Pi). Chọn Pi nhỏ nhất, thêm vào đồ thị các cạnh dọc theo đường đi ngắn nhất
//      của từng cặp (cạnh sao chép, màu xanh lá) -> mọi đỉnh bậc chẵn -> có chu trình Euler.
//   Tổng chiều dài hành trình = Σw(e) + m(G).
// Giới hạn: không có trọng số âm; tối đa 12 đỉnh bậc lẻ (10395 phân hoạch).
// Trạng thái dùng chung (state.js): npt (kết quả), canhThemNPT (chỉ số các cạnh đã thêm), nptThongBao.
// Cạnh thêm vào là cạnh SONG SONG nên đơn đồ thị (loai 1) tự chuyển sang đa đồ thị (loai 2).

const MAU_THEM = "#16a34a";
const fmt = v => String(Math.round(v * 1e6) / 1e6);
const trongSoCanh = e => e.w === undefined ? 1 : e.w;
const NHAN_LOAI_NPT = "Bài toán người phát thư chỉ hỗ trợ đồ thị vô hướng (loại 1–3).";

// Xóa kết quả và dấu cạnh thêm (KHÔNG khôi phục cạnh): dùng khi người dùng tự sửa đồ thị
function resetNguoiPhatThu() {
    npt = null;
    canhThemNPT = new Set();
    nptThongBao = "";
}

function capNhatTenLoai() {
    $("loaiDangChon").textContent = $("loai").selectedOptions[0].textContent;
}

function cuonDenKetQuaNPT() {
    const e = $("nptKetQua");
    if (e) e.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- Ghép cặp: mọi cách chia danh sách đỉnh lẻ thành các cặp (đỉnh đầu lần lượt ghép với từng đỉnh còn lại) ----
function cacPhanHoachCap(list) {
    if (!list.length) return [[]];
    const [a, ...rest] = list, out = [];
    rest.forEach((b, i) => {
        const con = rest.filter((_, j) => j !== i);
        cacPhanHoachCap(con).forEach(p => out.push([[a, b], ...p]));
    });
    return out;
}

// ---- Giải bài toán: tính mọi thứ rồi lưu vào npt ----
function tinhNguoiPhatThu() {
    const kq = { goc: edges.map(e => ({ ...e })), loaiGoc: loaiHienTai(), daApDung: null, loi: null };
    if (!edges.length) { kq.loi = "Đồ thị chưa có cạnh nào."; return kq; }
    if (edges.some(e => e.w !== undefined && e.w < 0)) { kq.loi = "Có trọng số âm. Bài toán này chỉ giải được khi mọi trọng số ≥ 0."; return kq; }

    // Bậc và liên thông (vòng khuyên tính bậc 2)
    const deg = Array(n).fill(0), cha = dsDinh();
    const goc = x => cha[x] === x ? x : (cha[x] = goc(cha[x]));
    edges.forEach(e => { deg[e.x]++; deg[e.y]++; cha[goc(e.x)] = goc(e.y); });
    const coCanh = dsDinh().filter(i => deg[i] > 0);
    if (new Set(coCanh.map(goc)).size > 1) { kq.loi = "Đồ thị không liên thông nên không có hành trình đi qua mọi cạnh."; return kq; }

    kq.tong = edges.reduce((s, e) => s + trongSoCanh(e), 0);
    kq.le = dsDinh().filter(i => deg[i] % 2 === 1);
    kq.ds = []; kq.best = null; kq.m = 0;
    if (!kq.le.length) return kq;
    if (kq.le.length > 12) { kq.loi = `Có ${kq.le.length} đỉnh bậc lẻ, quá nhiều để duyệt các phân hoạch cặp (tối đa 12).`; return kq; }

    // Khoảng cách ngắn nhất: Floyd–Warshall, có lưu đỉnh kế tiếp để dựng lại đường đi
    const D = dsDinh().map(i => dsDinh().map(j => i === j ? 0 : Infinity));
    const next = dsDinh().map(() => Array(n).fill(-1));
    edges.forEach(e => {
        const w = trongSoCanh(e);
        if (e.x !== e.y && w < D[e.x][e.y]) { D[e.x][e.y] = D[e.y][e.x] = w; next[e.x][e.y] = e.y; next[e.y][e.x] = e.x; }
    });
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (D[i][k] + D[k][j] < D[i][j] - 1e-9) { D[i][j] = D[i][k] + D[k][j]; next[i][j] = next[i][k]; }
    }
    const duong = (a, b) => { const p = [a]; while (a !== b) { a = next[a][b]; p.push(a); } return p; };

    kq.ds = cacPhanHoachCap(kq.le).map(p => {
        const pairs = p.map(([a, b]) => ({ a, b, d: D[a][b], path: duong(a, b) }));
        return { pairs, d: pairs.reduce((s, q) => s + q.d, 0) };
    });
    kq.best = 0;
    kq.ds.forEach((p, i) => { if (p.d < kq.ds[kq.best].d - 1e-9) kq.best = i; });
    kq.m = kq.ds[kq.best].d;
    return kq;
}

function giaiNguoiPhatThu() {
    if (coHuong()) return alert(NHAN_LOAI_NPT);
    if (npt && npt.daApDung !== null) traLaiDoThiGoc(true);   // đang hiện đồ thị đã thêm cạnh -> quay về gốc rồi giải lại
    npt = tinhNguoiPhatThu();
    canhThemNPT = new Set();
    nptThongBao = "";
    hienThiThongTin();
    cuonDenKetQuaNPT();   // nhảy thẳng xuống bảng kết quả
}

// Cạnh rẻ nhất nối u-v trong danh sách goc (để sao chép trọng số khi thêm cạnh)
function canhGocGiua(goc, u, v) {
    let tot = null;
    goc.forEach(e => {
        if (((e.x === u && e.y === v) || (e.x === v && e.y === u)) && (!tot || trongSoCanh(e) < trongSoCanh(tot))) tot = e;
    });
    return tot;
}

// Các cạnh cần thêm (sao chép dọc đường đi ngắn nhất của từng cặp) theo phân hoạch p; dùng chung với euler.js
function canhThemTheoPhanHoach(goc, p) {
    const out = [];
    p.pairs.forEach(pr => {
        for (let t = 0; t + 1 < pr.path.length; t++) {
            const u = pr.path[t], v = pr.path[t + 1], g = canhGocGiua(goc, u, v);
            out.push(taoCanh(u, v, g.w));
        }
    });
    return out;
}

// ---- Xem / áp dụng phân hoạch Pi: dựng lại đồ thị = gốc + các cạnh dọc đường đi ngắn nhất ----
function apDungPhanHoach(i) {
    if (!npt || npt.loi || !npt.ds[i]) return;
    edges = npt.goc.map(e => ({ ...e }));
    canhThemNPT = new Set();
    canhThemTheoPhanHoach(npt.goc, npt.ds[i]).forEach(e => {
        canhThemNPT.add(edges.length);
        edges.push(e);
    });
    if (npt.loaiGoc === 1) { $("loai").value = 2; capNhatTenLoai(); }   // có cạnh song song -> đa đồ thị
    npt.daApDung = i;
    nptThongBao = `Đã thêm ${canhThemNPT.size} cạnh (xanh lá) theo P${i + 1}. Bấm vào đây để xuống bảng kết quả ↓`;
    resetEuler();
    veDoThi();
    hienThiThongTin();
    cuonDenDoThi();       // nhảy lên chỗ đồ thị để xem luôn
}

function traLaiDoThiGoc(khongCuon) {
    if (!npt || npt.daApDung === null) return;
    edges = npt.goc.map(e => ({ ...e }));
    canhThemNPT = new Set();
    nptThongBao = "";
    $("loai").value = npt.loaiGoc; capNhatTenLoai();
    npt.daApDung = null;
    resetEuler();
    veDoThi();
    hienThiThongTin();
    if (!khongCuon) cuonDenDoThi();
}

// ---- Vẽ phần kết quả vào khung thông tin ----
function htmlNguoiPhatThu() {
    let text = '<h3 class="adjacency-matrix-heading">Bài toán người phát thư</h3>';
    if (coHuong()) return text + '<div class="npt-wrap" id="nptKetQua">' + NHAN_LOAI_NPT + "</div>";
    if (!npt) return text + '<div class="npt-wrap" id="nptKetQua"><i>Bấm nút “Phân tích &amp; giải bài toán” ở khung Điều khiển để xem lời giải.</i></div>';
    if (npt.loi) return text + `<div class="npt-wrap" id="nptKetQua"><div class="euler-no">✖ ${npt.loi}</div></div>`;

    const { ds, best, le, m } = npt, tatCa = ds.length <= 15;
    const sub = i => `P<sub>${i + 1}</sub>`;
    text += '<div class="npt-wrap" id="nptKetQua">';
    text += `<div class="npt-step"><b>1. Tổng các cạnh ban đầu:</b> Σw(e) = ${fmt(npt.tong)}</div>`;
    text += `<div class="npt-step"><b>2. Tập hợp các đỉnh bậc lẻ:</b> V<sub>o</sub>(G) = { ${le.join(", ") || "∅"} }</div>`;

    if (!le.length) {
        text += '<div class="euler-yes">✔ Mọi đỉnh đều bậc chẵn nên đồ thị đã có chu trình Euler: m(G) = 0, không cần thêm cạnh.</div>';
    } else {
        const hien = tatCa ? ds.map((_, i) => i) : [best];
        text += `<div class="npt-step"><b>3. ${tatCa
            ? `Tập hợp các phân hoạch cặp:</b> P = { ${ds.map((_, i) => sub(i)).join(", ")} }`
            : `Có ${ds.length} phân hoạch cặp (quá nhiều để liệt kê).</b> Chỉ hiện phân hoạch nhỏ nhất:`}</div>`;
        text += hien.map(i => {
            const p = ds[i], tot = Math.abs(p.d - m) < 1e-9, dang = npt.daApDung === i;
            const cap = p.pairs.map(q => `(${q.a},${q.b})`).join(", ");
            const tinh = p.pairs.map(q => fmt(q.d)).join(" + ");
            const qua = p.pairs.map(q => `[${q.path.join("→")}]`).join(" và ");
            return `<div class="npt-card${tot ? " npt-best" : ""}${dang ? " npt-on" : ""}"><div class="npt-card-main">` +
                `<b>${sub(i)} = { ${cap} }</b> → d(${sub(i)}) = ${tinh}${p.pairs.length > 1 ? " = " + fmt(p.d) : ""}` +
                `${tot ? ' <span class="npt-badge">nhỏ nhất</span>' : ""}<div class="npt-path">Nối qua: ${qua}</div></div>` +
                `<button onclick="apDungPhanHoach(${i})">${dang ? "Đang xem" : "Xem " + sub(i)}</button></div>`;
        }).join("");
        const ten = tatCa && ds.length > 1 ? `min(${ds.map((_, i) => `d(${sub(i)})`).join(", ")})` : `d(${sub(best)})`;
        text += `<div class="npt-m">4. m(G) = ${ten} = ${fmt(m)}</div>`;
    }
    text += `<div class="npt-total">Tổng chiều dài = Σw(e) + m(G) = ${fmt(npt.tong)} + ${fmt(m)} = ${fmt(npt.tong + m)}</div>`;

    if (le.length) {
        text += '<div class="npt-btns">' +
            `<button class="success" onclick="apDungPhanHoach(${best})">Tự động thêm cạnh &amp; vẽ lại đồ thị</button>` +
            `<button class="danger" onclick="traLaiDoThiGoc()"${npt.daApDung === null ? " disabled" : ""}>Trả lại đồ thị gốc</button></div>`;
        if (npt.daApDung !== null) {
            text += ghiChu(`Đang hiển thị đồ thị sau khi thêm ${canhThemNPT.size} cạnh theo ${sub(npt.daApDung)} (màu xanh lá). Lúc này mọi đỉnh có bậc chẵn; xem mục Chu trình Euler ở trên để mô phỏng hành trình.`);
            if (npt.loaiGoc === 1) text += ghiChu("Đồ thị đơn có thêm cạnh song song nên tự chuyển sang loại 2 (đa đồ thị); bấm “Trả lại đồ thị gốc” sẽ về loại 1.");
        }
    }
    if (npt.goc.some(e => e.w === undefined)) text += ghiChu("Cạnh nhập không có trọng số được tính w = 1.");
    return text + "</div>";
}
