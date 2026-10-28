// =====================================================
// CÁCH GIẢI CHI TIẾT: mỗi mục có 1 dòng "📖 Cách giải chi tiết", bấm vào mới xổ ra
// =====================================================
// Lời giải được viết trên CHÍNH đồ thị đang nhập (số liệu thật, không phải ví dụ mẫu).
// Mỗi hàm giaiXxx() trả về HTML của khung <details>; info.js ghép ngay sau phần tương ứng:
//   giaiDinhCanh | giaiBac | giaiDanhSachKe | giaiMaTranKe | giaiMaTranTrongSo | giaiEuler | giaiChiTietNPT
// Khi bảng thông tin dựng lại, info.js nhớ khung nào đang mở (data-key) để mở lại.

const gv = v => `<span class="g-v">${v}</span>`;                                  // ô đỉnh
const ge = i => `e<sub>${i + 1}</sub>`;                                           // nhãn cạnh
const gDong = s => `<div class="giai-line">${s}</div>`;
const gCT = s => `<span class="giai-formula">${s}</span>`;                        // công thức nổi bật
const gOk = s => `<span class="giai-ok">✔ ${s}</span>`;
const gXau = s => `<span class="giai-bad">✖ ${s}</span>`;
const gBuoc = (k, tieuDe, noiDung) => `<div class="giai-step"><b>Bước ${k}. ${tieuDe}</b>${noiDung}</div>`;
const gKhung = (key, noiDung) => `<details class="giai" data-key="${key}"><summary>📖 Cách giải chi tiết</summary><div class="giai-body">${noiDung}</div></details>`;
const gGach = () => (coHuong() ? "→" : "–");
const gTrongSo = e => (e.w !== undefined ? ` <small>(w = ${e.w})</small>` : "");
const gCanh = (e, i) => `${ge(i)} = (${e.x}${gGach()}${e.y})${gTrongSo(e)}`;
const gDS = a => (a.length ? a.join(", ") : "∅");
const gSoPhan = a => a.length ? a.join(" + ") : "0";

// Cạnh i có song song với cạnh nào đứng trước không? (vô hướng: (x,y) = (y,x); có hướng: phải cùng chiều)
function canhSongSongTruoc(i) {
    const e = edges[i], huong = coHuong();
    for (let j = 0; j < i; j++) {
        const f = edges[j];
        if ((f.x === e.x && f.y === e.y) || (!huong && f.x === e.y && f.y === e.x)) return j;
    }
    return -1;
}

// =====================================================
// 1) ĐỈNH VÀ CẠNH
// =====================================================
function giaiDinhCanh() {
    const huong = coHuong(), m = edges.length, loai = loaiHienTai();
    let s = gBuoc(1, "Xác định tập đỉnh",
        gDong(`Đồ thị có n = ${n} đỉnh, đánh số liên tiếp từ 0 đến ${n - 1}.`) + gCT(`V = { ${dsDinh().join(", ")} }`));

    let loops = 0, par = 0, nguoc = 0;
    const dong = edges.map((e, i) => {
        let nx = "cạnh thường";
        const j = canhSongSongTruoc(i);
        if (e.x === e.y) { nx = "<b>vòng khuyên</b> (hai đầu trùng nhau)"; loops++; }
        else if (j >= 0) { nx = `<b>song song</b> với ${ge(j)} (cùng nối ${e.x}${gGach()}${e.y})`; par++; }
        else if (huong && edges.some((f, k) => k < i && f.x === e.y && f.y === e.x)) { nx = "ngược chiều với một cạnh trước đó (khác nhau, <b>không</b> phải song song)"; nguoc++; }
        return gDong(`${gCanh(e, i)} → ${nx}`);
    });
    s += gBuoc(2, "Liệt kê từng cạnh theo thứ tự nhập",
        gDong(huong ? "Mỗi cạnh có hướng ghi là (x→y): đi <b>từ</b> x <b>đến</b> y." : "Mỗi cạnh vô hướng ghi là (x–y): (x,y) và (y,x) là cùng một cạnh.") +
        (m ? dong.join("") : gDong("<i>Chưa có cạnh nào, m = 0.</i>")) +
        gDong(`Đánh số e<sub>1</sub>, e<sub>2</sub>, … theo thứ tự nhập; các mục bên dưới đều dùng nhãn này.`));

    const luat = ["không vòng khuyên, không cạnh song song", "cho phép cạnh song song, không vòng khuyên", "cho phép cả cạnh song song và vòng khuyên",
        "không vòng khuyên, mỗi chiều x→y chỉ 1 cạnh", "cho phép cạnh song song cùng chiều, không vòng khuyên"][loai - 1];
    s += gBuoc(3, "Đếm và đối chiếu với loại đồ thị",
        gCT(`m = ${m} cạnh`) +
        gDong(`Số vòng khuyên: ${loops}. Số cạnh song song (tính từ cạnh thứ 2 trở đi): ${par}.${huong ? ` Cặp ngược chiều: ${nguoc}.` : ""}`) +
        gDong(`Loại đang chọn: <b>${TEN_LOAI[loai - 1]}</b> — ${luat}.`) +
        gDong(gOk("Đồ thị khớp với luật của loại đã chọn.")));
    return gKhung("dinhcanh", s);
}

// =====================================================
// 2) BẬC CỦA ĐỈNH
// =====================================================
function giaiBac() {
    const huong = coHuong(), m = edges.length;
    let s = gBuoc(1, "Nhớ định nghĩa",
        huong
            ? gDong("deg⁺(v) = số cạnh <b>đi ra</b> khỏi v (bán bậc ra); deg⁻(v) = số cạnh <b>đi vào</b> v (bán bậc vào); deg(v) = deg⁺(v) + deg⁻(v).")
            : gDong("deg(v) = số cạnh kề với v. Riêng <b>vòng khuyên</b> tính <b>2</b> (vì có cả hai đầu cùng nằm ở v)."));

    const bac = Array(n).fill(0), dong = [];
    dsDinh().forEach(v => {
        if (huong) {
            const ra = [], vao = [];
            edges.forEach((e, i) => { if (e.x === v) ra.push(i); if (e.y === v) vao.push(i); });
            bac[v] = ra.length + vao.length;
            dong.push(gDong(`${gv(v)} đi ra: ${gDS(ra.map(ge))} ⇒ deg⁺ = ${ra.length}; đi vào: ${gDS(vao.map(ge))} ⇒ deg⁻ = ${vao.length}; ` +
                `deg(${v}) = ${ra.length} + ${vao.length} = <b>${bac[v]}</b>`));
        } else {
            const phan = [];
            edges.forEach((e, i) => {
                if (e.x === v && e.y === v) { phan.push(2); }
                else if (e.x === v || e.y === v) phan.push(1);
            });
            const ten = edges.map((e, i) => (e.x === v || e.y === v) ? ge(i) + (e.x === e.y ? " (vòng khuyên, tính 2)" : "") : null).filter(Boolean);
            bac[v] = phan.reduce((a, b) => a + b, 0);
            const loaiDinh = bac[v] === 0 ? " — <b>đỉnh cô lập</b>" : bac[v] === 1 ? " — <b>đỉnh treo</b>" : "";
            dong.push(gDong(`${gv(v)} có cạnh kề: ${gDS(ten)} ⇒ deg(${v}) = ${phan.length > 1 ? gSoPhan(phan) + " = " : ""}<b>${bac[v]}</b>${loaiDinh}`));
        }
    });
    s += gBuoc(2, "Tính bậc từng đỉnh (đếm trên danh sách cạnh)", dong.join(""));

    if (huong) {
        const dau = dsDinh().filter(v => bac[v] === 0), treo = dsDinh().filter(v => bac[v] === 1);
        s += gBuoc(3, "Tìm đỉnh treo, đỉnh cô lập", gDong(`Đỉnh treo (deg = 1): ${gDS(treo)}.`) + gDong(`Đỉnh cô lập (deg = 0): ${gDS(dau)}.`));
        s += gBuoc(4, "Kiểm tra bằng tổng",
            gCT(`Σ deg⁺(v) = Σ deg⁻(v) = m = ${m}`) +
            gCT(`Σ deg(v) = ${bac.join(" + ") || 0} = ${bac.reduce((a, b) => a + b, 0)} = 2 × ${m}`) +
            gDong("Mỗi cạnh đóng góp đúng 1 vào deg⁺ của đầu và 1 vào deg⁻ của cuối, nên hai tổng bằng nhau và bằng số cạnh."));
    } else {
        const treo = dsDinh().filter(v => bac[v] === 1), co = dsDinh().filter(v => bac[v] === 0), le = dsDinh().filter(v => bac[v] % 2 === 1);
        s += gBuoc(3, "Tìm đỉnh treo, đỉnh cô lập, đỉnh bậc lẻ",
            gDong(`Đỉnh treo (deg = 1): ${gDS(treo)}.`) + gDong(`Đỉnh cô lập (deg = 0): ${gDS(co)}.`) + gDong(`Đỉnh bậc lẻ: ${gDS(le)} (${le.length} đỉnh).`));
        s += gBuoc(4, "Kiểm tra bằng định lý bắt tay",
            gCT(`Σ deg(v) = ${bac.join(" + ") || 0} = ${bac.reduce((a, b) => a + b, 0)} = 2 × ${m}`) +
            gDong("Mỗi cạnh có 2 đầu nên được đếm đúng 2 lần ⇒ tổng bậc luôn bằng 2m.") +
            gDong(le.length % 2 === 0 ? gOk(`Số đỉnh bậc lẻ là ${le.length} (số chẵn), đúng như hệ quả của định lý.`) : gXau("Số đỉnh bậc lẻ là số lẻ — không thể xảy ra, hãy kiểm tra lại cạnh.")));
    }
    return gKhung("bac", s);
}

// =====================================================
// 3) DANH SÁCH KỀ
// =====================================================
function giaiDanhSachKe() {
    const huong = coHuong(), m = edges.length;
    let s = gBuoc(1, "Khởi tạo", gDong(`Tạo ${n} danh sách rỗng, mỗi đỉnh 0…${n - 1} một danh sách ds(v).`));

    const dong = edges.map((e, i) => {
        if (huong) return gDong(`${gCanh(e, i)}: thêm ${gv(e.y)} vào ds(${e.x}).`);
        if (e.x === e.y) return gDong(`${gCanh(e, i)} là vòng khuyên: thêm ${gv(e.x)} vào ds(${e.x}) <b>2 lần</b> (khớp quy ước vòng khuyên tính bậc 2).`);
        return gDong(`${gCanh(e, i)}: thêm ${gv(e.y)} vào ds(${e.x}) <b>và</b> thêm ${gv(e.x)} vào ds(${e.y}).`);
    });
    s += gBuoc(2, "Duyệt từng cạnh theo thứ tự nhập",
        gDong(huong ? "Có hướng: cạnh x→y chỉ lưu <b>một chiều</b> (y vào danh sách của x)." : "Vô hướng: cạnh x–y lưu ở <b>cả hai đầu</b>.") +
        (m ? dong.join("") : gDong("<i>Không có cạnh nên mọi danh sách đều rỗng.</i>")));

    const ds = xayDanhSachKe();
    s += gBuoc(3, "Sắp tăng dần từng danh sách (cho dễ đối chiếu)",
        ds.map((l, v) => gDong(`ds(${v}) = ${l.length ? l.map(p => p.v).join(" → ") + " → " : ""}NULL`)).join(""));

    const tong = ds.reduce((a, l) => a + l.length, 0);
    s += gBuoc(4, "Kiểm tra",
        gCT(`Tổng số phần tử = ${ds.map(l => l.length).join(" + ") || 0} = ${tong} = ${huong ? "" : "2 × "}${m}`) +
        gDong(huong ? "Độ dài ds(v) chính là bán bậc ra deg⁺(v)." : "Độ dài ds(v) chính là bậc deg(v) (vòng khuyên xuất hiện 2 lần).") +
        (m && [2, 3, 5].includes(loaiHienTai()) ? gDong("Cạnh song song làm cùng một đỉnh kề xuất hiện nhiều lần trong danh sách (di chuột vào ô để biết là cạnh nào).") : ""));
    return gKhung("dske", s);
}

// =====================================================
// 4) MA TRẬN KỀ
// =====================================================
function giaiMaTranKe() {
    const huong = coHuong(), m = edges.length;
    let s = gBuoc(1, "Khởi tạo", gDong(`Lập ma trận A cỡ ${n} × ${n}, mọi ô bằng 0. Hàng i, cột j ứng với đỉnh i, đỉnh j; A[i][j] = số cạnh nối i với j.`));

    const A = dsDinh().map(() => Array(n).fill(0));
    const dong = edges.map((e, i) => {
        A[e.x][e.y]++;
        if (!huong && e.x !== e.y) { A[e.y][e.x]++; return gDong(`${gCanh(e, i)}: A[${e.x}][${e.y}] += 1 và A[${e.y}][${e.x}] += 1 (đối xứng).`); }
        if (!huong) return gDong(`${gCanh(e, i)} là vòng khuyên: A[${e.x}][${e.x}] += 1 (chỉ cộng 1 ô trên đường chéo).`);
        return gDong(`${gCanh(e, i)}: A[${e.x}][${e.y}] += 1 (hàng = đỉnh đi, cột = đỉnh đến).`);
    });
    s += gBuoc(2, "Duyệt từng cạnh, cộng 1 vào ô tương ứng", m ? dong.join("") : gDong("<i>Không có cạnh nên ma trận toàn số 0.</i>"));

    s += gBuoc(3, "Cách đọc kết quả", A.map((row, i) => {
        const ke = row.map((v, j) => v ? (v > 1 ? `${j} (${v} cạnh)` : j) : null).filter(x => x !== null);
        return gDong(`Hàng ${i}: [ ${row.join(" ")} ] ⇒ ${huong ? "đi ra tới" : "kề với"}: ${gDS(ke)}`);
    }).join(""));

    let kt = "";
    if (huong) {
        kt = A.map((row, i) => gDong(`Hàng ${i}: tổng = ${row.reduce((a, b) => a + b, 0)} = deg⁺(${i}); cột ${i}: tổng = ${A.reduce((a, r) => a + r[i], 0)} = deg⁻(${i})`)).join("") +
            gCT(`Tổng mọi ô = ${m} = số cạnh`);
    } else {
        kt = gDong("Ma trận <b>đối xứng</b> qua đường chéo chính: A[i][j] = A[j][i].") +
            A.map((row, i) => gDong(`Hàng ${i}: tổng = ${row.reduce((a, b) => a + b, 0)}${A[i][i] ? ` + A[${i}][${i}] (vòng khuyên tính thêm 1) = ${row.reduce((a, b) => a + b, 0) + A[i][i]}` : ""} = deg(${i})`)).join("");
    }
    s += gBuoc(4, "Kiểm tra", kt);
    return gKhung("mtke", s);
}

// =====================================================
// 5) MA TRẬN TRỌNG SỐ
// =====================================================
function giaiMaTranTrongSo() {
    const huong = coHuong();
    const D = dsDinh().map(i => dsDinh().map(j => i === j ? 0 : Infinity));
    const f = v => v === Infinity ? "∞" : fmt(v);
    let s = gBuoc(1, "Khởi tạo",
        gDong(`Lập ma trận W cỡ ${n} × ${n}: đường chéo W[i][i] = 0 (đi từ đỉnh đến chính nó không tốn gì); mọi ô còn lại = ∞ (tạm coi là chưa có cạnh nối).`));

    const dong = edges.map((e, i) => {
        const w = e.w === undefined ? 1 : e.w, ghi = e.w === undefined ? `không ghi trọng số nên w = 1` : `w = ${w}`;
        if (e.x === e.y) return gDong(`${gCanh(e, i)} là vòng khuyên: bỏ qua, vì W[${e.x}][${e.x}] luôn bằng 0.`);
        const cu = D[e.x][e.y];
        D[e.x][e.y] = Math.min(cu, w);
        if (!huong) D[e.y][e.x] = Math.min(D[e.y][e.x], w);
        const lay = cu === Infinity ? "" : cu <= w ? ` (đã có cạnh song song nhỏ hơn hoặc bằng nên giữ ${f(cu)})` : ` (nhỏ hơn giá trị cũ ${f(cu)} nên thay)`;
        return gDong(`${gCanh(e, i)} — ${ghi}: W[${e.x}][${e.y}] = min(${f(cu)}, ${fmt(w)}) = ${f(D[e.x][e.y])}${huong ? "" : ` và W[${e.y}][${e.x}] = ${f(D[e.y][e.x])}`}${lay}.`);
    });
    s += gBuoc(2, "Duyệt từng cạnh, ghi trọng số vào ô",
        gDong(huong ? "Có hướng: chỉ ghi ô [x][y] (hàng = đỉnh đi, cột = đỉnh đến)." : "Vô hướng: ghi cả [x][y] và [y][x] nên ma trận đối xứng.") +
        gDong("Cạnh không nhập trọng số được tính w = 1. Nhiều cạnh song song thì lấy trọng số <b>nhỏ nhất</b>.") +
        (edges.length ? dong.join("") : gDong("<i>Không có cạnh.</i>")));

    const inf = [];
    dsDinh().forEach(i => dsDinh().forEach(j => { if (i !== j && D[i][j] === Infinity && (huong || i < j)) inf.push(`(${i},${j})`); }));
    s += gBuoc(3, "Các ô còn ∞",
        gDong(`Những cặp đỉnh không có cạnh nối trực tiếp: ${gDS(inf)}.`) +
        gDong("Ô ∞ không có nghĩa là không đi được: có thể đi vòng qua đỉnh khác (xem bài toán người phát thư, mục khoảng cách ngắn nhất)."));
    return gKhung("mttrongso", s);
}

// =====================================================
// 6) CHU TRÌNH EULER
// =====================================================
// Chạy lại Hierholzer nhưng ghi nhật ký từng bước (cùng thứ tự chọn cạnh với euler.js)
function nhatKyHierholzer(E, s, huong) {
    const adj = dsDinh().map(() => []);
    E.forEach((e, id) => { adj[e.x].push({ to: e.y, id }); if (!huong) adj[e.y].push({ to: e.x, id }); });
    adj.forEach(l => l.sort((a, b) => a.to - b.to || a.id - b.id));
    const used = Array(E.length).fill(false), ptr = Array(n).fill(0), g = huong ? "→" : "–";
    const nhan = id => `e<sub>${id + 1}</sub>${id >= edges.length ? "*" : ""}`;
    const st = [s], res = [], out = [];
    while (st.length) {
        const v = st[st.length - 1], l = adj[v];
        while (ptr[v] < l.length && used[l[ptr[v]].id]) ptr[v]++;
        if (ptr[v] < l.length) {
            const { to, id } = l[ptr[v]++];
            used[id] = true; st.push(to);
            out.push(`Đang ở ${gv(v)}: còn cạnh chưa dùng, chọn ${nhan(id)} (${v}${g}${to}) → sang ${gv(to)}. Ngăn xếp: [${st.join(", ")}]`);
        } else {
            st.pop(); res.push(v);
            out.push(`Đang ở ${gv(v)}: <b>hết cạnh chưa dùng</b> → lùi lại, chép ${v} vào kết quả. Kết quả tạm (đọc ngược): ${res.join(", ")}`);
        }
    }
    return { out, res };
}

function giaiEuler() {
    const huong = coHuong(), m = edges.length, g = gGach();
    if (m === 0) return gKhung("euler", gBuoc(1, "Kiểm tra", gDong(gXau("Đồ thị không có cạnh nào nên không có chu trình Euler."))));

    const r = phanTichEuler();
    const deg = Array(n).fill(0), dIn = Array(n).fill(0), dOut = Array(n).fill(0);
    edges.forEach(e => { if (huong) { dOut[e.x]++; dIn[e.y]++; } else { deg[e.x]++; deg[e.y]++; } });
    const coCanh = r.coCanh;

    let s = gBuoc(1, "Nhớ điều kiện (định lý Euler)",
        gDong("<b>Chu trình Euler</b> là chu trình đi qua <b>mỗi cạnh đúng 1 lần</b> rồi quay về đỉnh xuất phát.") +
        gDong(huong
            ? "Đồ thị có hướng có chu trình Euler ⇔ (a) các đỉnh có cạnh thuộc <b>cùng một thành phần liên thông yếu</b> và (b) mọi đỉnh có <b>deg⁺ = deg⁻</b>."
            : "Đồ thị vô hướng có chu trình Euler ⇔ (a) các đỉnh có cạnh thuộc <b>cùng một thành phần liên thông</b> và (b) mọi đỉnh có <b>bậc chẵn</b>.") +
        gDong("Đỉnh cô lập (không có cạnh) được bỏ qua khi xét."));

    // Thành phần liên thông
    const cha = dsDinh(), goc = x => cha[x] === x ? x : (cha[x] = goc(cha[x]));
    edges.forEach(e => { cha[goc(e.x)] = goc(e.y); });
    const nhom = {};
    coCanh.forEach(v => (nhom[goc(v)] = nhom[goc(v)] || []).push(v));
    const cacNhom = Object.values(nhom), lienThong = cacNhom.length === 1;
    s += gBuoc(2, `Kiểm tra liên thông${huong ? " (yếu: bỏ qua chiều mũi tên)" : ""}`,
        gDong(`Các đỉnh có cạnh: ${gDS(coCanh)}. Gộp các đỉnh được nối với nhau bằng cạnh (union-find) ta được ${cacNhom.length} thành phần: ` +
            cacNhom.map(c => `{ ${c.join(", ")} }`).join(", ") + ".") +
        gDong(lienThong ? gOk("Chỉ có 1 thành phần ⇒ liên thông.") : gXau("Có nhiều hơn 1 thành phần ⇒ không liên thông.")));

    // Bậc
    let le;
    if (huong) {
        le = coCanh.filter(v => dIn[v] !== dOut[v]);
        s += gBuoc(3, "Kiểm tra bán bậc ra = bán bậc vào",
            coCanh.map(v => gDong(`${gv(v)}: deg⁺ = ${dOut[v]}, deg⁻ = ${dIn[v]} ⇒ ${dOut[v] === dIn[v] ? gOk("bằng nhau") : gXau("khác nhau")}`)).join("") +
            gDong(le.length ? gXau(`Có ${le.length} đỉnh lệch: ${le.join(", ")}.`) : gOk("Mọi đỉnh đều có deg⁺ = deg⁻.")));
    } else {
        le = coCanh.filter(v => deg[v] % 2 === 1);
        s += gBuoc(3, "Kiểm tra bậc chẵn",
            coCanh.map(v => gDong(`${gv(v)}: deg = ${deg[v]} ⇒ ${deg[v] % 2 === 0 ? gOk("chẵn") : gXau("lẻ")}`)).join("") +
            gDong(le.length ? gXau(`Có ${le.length} đỉnh bậc lẻ: ${le.join(", ")}.`) : gOk("Mọi đỉnh đều bậc chẵn.")));
    }

    const coThat = !r.lyDo.length;
    s += gBuoc(4, "Kết luận",
        gDong(coThat ? gOk("Thoả cả hai điều kiện ⇒ CÓ chu trình Euler.") : gXau("Vi phạm điều kiện ⇒ KHÔNG có chu trình Euler.")) +
        (!coThat && r.coDuongDi ? gDong(`Tuy vậy có <b>đường đi Euler</b> (đi qua mọi cạnh đúng 1 lần nhưng không quay về) ${r.coDuongDi}: ` +
            (huong ? "có đúng 1 đỉnh deg⁺ − deg⁻ = 1 (đỉnh đầu) và 1 đỉnh deg⁻ − deg⁺ = 1 (đỉnh cuối), còn lại bằng nhau." : "đúng 2 đỉnh bậc lẻ là điểm đầu và điểm cuối.")) : "") +
        (!coThat && !r.postman ? gDong(huong ? "Với đồ thị có hướng, hành trình ngắn nhất qua mọi cạnh chưa được hỗ trợ." : "") : ""));

    if (!r.ok) return gKhung("euler", s);

    // Có hành trình (chu trình thật hoặc đã thêm cạnh lặp theo người phát thư)
    let E = edges, buoc = 5;
    if (r.postman) {
        E = edges.concat(r.postman.extra);
        s += gBuoc(buoc++, "Biến thành đồ thị có chu trình Euler (người phát thư)",
            gDong(`Vì đồ thị vô hướng liên thông nhưng có đỉnh bậc lẻ, ta <b>thêm các cạnh sao chép</b> (đánh dấu *) dọc đường đi ngắn nhất giữa các cặp đỉnh lẻ để mọi đỉnh thành bậc chẵn:`) +
            r.postman.extra.map((e, i) => gDong(`${ge(edges.length + i)}* = (${e.x}–${e.y})${gTrongSo(e)}`)).join("") +
            gDong("Cách chọn cặp để thêm ít tốn nhất xem ở mục “Bài toán người phát thư” bên dưới. Sau đó chạy Hierholzer trên đồ thị đã thêm cạnh."));
    }
    const nk = nhatKyHierholzer(E, r.start, huong);
    s += gBuoc(buoc++, "Tìm chu trình bằng thuật toán Hierholzer",
        gDong(`Chọn đỉnh xuất phát s = ${gv(r.start)} (có thể đổi ở ô “Đỉnh bắt đầu”). Dùng một <b>ngăn xếp</b> và đánh dấu cạnh đã dùng theo số thứ tự cạnh (đúng với cả cạnh song song và vòng khuyên).`) +
        gDong("Luật: đứng ở đỉnh v trên đỉnh ngăn xếp — nếu còn cạnh chưa dùng thì đi theo cạnh đó (ưu tiên đỉnh đến nhỏ hơn) và đẩy đỉnh mới vào ngăn xếp; nếu <b>hết cạnh</b> thì lấy v ra và chép vào kết quả."));
    const MAX = 120;
    s += `<ol class="giai-log">${nk.out.slice(0, MAX).map(x => `<li>${x}</li>`).join("")}</ol>` +
        (nk.out.length > MAX ? gDong(`… còn ${nk.out.length - MAX} bước nữa (rút gọn cho dễ đọc).`) : "");
    s += gBuoc(buoc, "Đọc kết quả",
        gDong("Các đỉnh được chép vào kết quả theo thứ tự lùi, nên <b>đảo ngược</b> dãy đó sẽ được chu trình:") +
        gCT(r.vs.join(" → ")) +
        gDong(`Chu trình dùng ${r.es.length} cạnh = ${E.length} cạnh cần đi, bắt đầu và kết thúc tại ${gv(r.start)} ${gOk("đúng")}.`) +
        gDong(`Độ dài = Σ w(e) = ${fmt(r.tong)}.`));
    return gKhung("euler", s);
}

// =====================================================
// 7) BÀI TOÁN NGƯỜI PHÁT THƯ
// =====================================================
function giaiChiTietNPT() {
    if (coHuong()) return gKhung("npt", gBuoc(1, "Phạm vi", gDong(NHAN_LOAI_NPT)));
    // Nếu chưa bấm giải: tự tính trên đồ thị hiện tại (chưa thêm cạnh nào). Nếu đã giải: dùng kết quả (tính trên đồ thị gốc)
    const k = npt || tinhNguoiPhatThu();
    if (k.loi) return gKhung("npt", gBuoc(1, "Không giải được", gDong(gXau(k.loi))));

    const G = k.goc;
    let s = gBuoc(1, "Hiểu đề",
        gDong("Người phát thư phải đi qua <b>mọi cạnh ít nhất 1 lần</b> rồi quay về chỗ cũ, sao cho tổng đường đi <b>ngắn nhất</b>.") +
        gDong("Nếu mọi đỉnh bậc chẵn thì đã có chu trình Euler (mỗi cạnh đúng 1 lần). Nếu có đỉnh bậc lẻ thì phải đi <b>lặp lại</b> một số cạnh; ta chọn các cạnh lặp sao cho tốn ít nhất."));

    s += gBuoc(2, "Tính tổng trọng số các cạnh ban đầu",
        gDong("Cạnh không có w được tính w = 1.") +
        gCT(`Σw(e) = ${G.map(trongSoCanh).map(fmt).join(" + ")} = ${fmt(k.tong)}`));

    const deg = Array(n).fill(0);
    G.forEach(e => { deg[e.x]++; deg[e.y]++; });
    s += gBuoc(3, "Tính bậc và tìm tập đỉnh bậc lẻ V<sub>o</sub>(G)",
        gDong(dsDinh().map(v => `deg(${v}) = ${deg[v]}`).join("; ") + ".") +
        gCT(`V<sub>o</sub>(G) = { ${k.le.join(", ") || "∅"} }`) +
        gDong("Số đỉnh bậc lẻ luôn là số chẵn nên có thể ghép chúng thành từng cặp."));

    if (!k.le.length) {
        s += gBuoc(4, "Kết luận",
            gDong(gOk("V<sub>o</sub>(G) = ∅ ⇒ mọi đỉnh bậc chẵn, đồ thị đã có chu trình Euler.")) +
            gCT(`m(G) = 0 ⇒ độ dài ngắn nhất = Σw(e) + 0 = ${fmt(k.tong)}`) +
            gDong("Không cần thêm cạnh; xem mục Chu trình Euler để biết hành trình."));
        return gKhung("npt", s);
    }

    // Khoảng cách giữa các cặp đỉnh lẻ (lấy từ các phân hoạch đã tính)
    const cap = new Map();
    k.ds.forEach(p => p.pairs.forEach(q => { const key = q.a + "," + q.b; if (!cap.has(key)) cap.set(key, q); }));
    const tinhDuong = q => {
        const ws = [];
        for (let t = 0; t + 1 < q.path.length; t++) ws.push(trongSoCanh(canhGocGiua(G, q.path[t], q.path[t + 1])));
        return q.path.length === 2
            ? `d(${q.a},${q.b}) = ${fmt(q.d)} (đi thẳng bằng cạnh ${q.a}–${q.b}, hoặc không có đường nào ngắn hơn)`
            : `d(${q.a},${q.b}) = ${ws.map(fmt).join(" + ")} = ${fmt(q.d)}  qua đường [${q.path.join("→")}]`;
    };
    s += gBuoc(4, "Tính khoảng cách ngắn nhất giữa từng cặp đỉnh lẻ",
        gDong("d(a,b) là độ dài đường đi ngắn nhất từ a đến b. Tính bằng Floyd–Warshall (hoặc Dijkstra) trên đồ thị với trọng số w; từ bảng đó đọc ra đường đi cụ thể.") +
        [...cap.values()].map(q => gDong(tinhDuong(q))).join(""));

    const sub = i => `P<sub>${i + 1}</sub>`;
    let soPh = 1; for (let i = k.le.length - 1; i > 1; i -= 2) soPh *= i;
    const tatCa = k.ds.length <= 15;
    s += gBuoc(5, "Lập các phân hoạch cặp P",
        gDong(`Ghép ${k.le.length} đỉnh lẻ thành ${k.le.length / 2} cặp, có (${k.le.length}−1)!! = ${soPh} cách. Với mỗi cách P<sub>i</sub>, d(P<sub>i</sub>) = tổng khoảng cách của các cặp.`) +
        (tatCa ? k.ds.map((p, i) => gDong(`${sub(i)} = { ${p.pairs.map(q => `(${q.a},${q.b})`).join(", ")} } ⇒ d(${sub(i)}) = ${p.pairs.map(q => fmt(q.d)).join(" + ")}${p.pairs.length > 1 ? " = " + fmt(p.d) : ""}`)).join("")
            : gDong(`Có ${k.ds.length} phân hoạch, quá nhiều để liệt kê; chỉ nêu phân hoạch nhỏ nhất: ${sub(k.best)} = { ${k.ds[k.best].pairs.map(q => `(${q.a},${q.b})`).join(", ")} }.`)));

    const tot = k.ds[k.best];
    s += gBuoc(6, "Chọn phân hoạch nhỏ nhất",
        gCT(`m(G) = ${tatCa && k.ds.length > 1 ? `min{ ${k.ds.map((p, i) => fmt(p.d)).join(", ")} }` : `d(${sub(k.best)})`} = ${fmt(k.m)}`) +
        gDong(`Chọn ${sub(k.best)}${k.ds.filter(p => Math.abs(p.d - k.m) < 1e-9).length > 1 ? " (có nhiều phân hoạch bằng nhau, lấy cái đầu tiên)" : ""}.`));

    const extra = canhThemTheoPhanHoach(G, tot);
    const deg2 = deg.slice();
    extra.forEach(e => { deg2[e.x]++; deg2[e.y]++; });
    s += gBuoc(7, "Thêm các cạnh lặp dọc đường đi ngắn nhất",
        tot.pairs.map(q => gDong(`Cặp (${q.a},${q.b}): đi dọc [${q.path.join("→")}], sao chép ${q.path.length - 1} cạnh.`)).join("") +
        gDong(`Tổng cộng thêm ${extra.length} cạnh (tô xanh lá trên hình): ${extra.map(e => `(${e.x}–${e.y})`).join(", ")}.`) +
        gDong(`Bậc mới: ${dsDinh().map(v => `deg(${v}) = ${deg2[v]}`).join("; ")} ⇒ ` + (deg2.every(d => d % 2 === 0) ? gOk("mọi đỉnh đều bậc chẵn, đã có chu trình Euler.") : gXau("còn đỉnh bậc lẻ."))));

    s += gBuoc(8, "Kết luận",
        gCT(`Độ dài ngắn nhất = Σw(e) + m(G) = ${fmt(k.tong)} + ${fmt(k.m)} = ${fmt(k.tong + k.m)}`) +
        gDong("Bấm “Tự động thêm cạnh & vẽ lại đồ thị”, rồi dùng mục Chu trình Euler để xem hành trình từng bước."));
    return gKhung("npt", s);
}
