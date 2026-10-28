// =====================================================
// THÔNG TIN: danh sách đỉnh/cạnh, bậc của đỉnh, ghép các bảng ma trận
// =====================================================

// Danh sách đỉnh và cạnh
function htmlDinhCanh() {
    const text = `<b>Đỉnh:</b> ${dsDinh().join(", ")}<br><b>Cạnh:</b><br>`;
    return text + (edges.length ? edges.map((e, i) => `e${i + 1}: (${e.x},${e.y})<br>`).join("") : "<i>(Không có cạnh)</i><br>");
}

// Bậc của đỉnh
//   Vô hướng (loai 1-3): deg(v) = số cạnh kề, vòng khuyên tính 2.
//   Có hướng (loai 4-5): deg(v) = deg⁻ + deg⁺, kèm bảng bán bậc ra / vào.
function htmlBac() {
    const huong = coHuong(), range = dsDinh(), m = edges.length;
    const degIn = Array(n).fill(0), degOut = Array(n).fill(0), deg = Array(n).fill(0);
    edges.forEach(e => {
        if (huong) { degOut[e.x]++; degIn[e.y]++; }
        else if (e.x === e.y) deg[e.x] += 2;   // vòng khuyên tính bậc 2
        else { deg[e.x]++; deg[e.y]++; }
    });
    const bac = range.map(i => huong ? degIn[i] + degOut[i] : deg[i]);
    const dsBac = range.map(i => huong ? `deg(${i}) = ${bac[i]} (deg⁻=${degIn[i]}, deg⁺=${degOut[i]})` : `deg(${i}) = ${bac[i]}`);
    const loc = k => range.filter(i => bac[i] === k).join(", ") || "Không có";

    let text = `<br><b>Bậc của đỉnh</b><br><div class="degree-values">${dsBac.join(", ")}</div>`;
    text += `<div class="degree-category">Đỉnh treo: ${loc(1)}</div>`;
    text += `<div class="degree-category">Đỉnh cô lập: ${loc(0)}</div>`;
    text += '<h3 class="degree-total-heading">Tổng tất cả các bậc của đỉnh:</h3>';
    text += `<div class="degree-total">Σ deg(v) = ${bac.reduce((a, b) => a + b, 0)} = 2 × ${m} cạnh</div>`;

    if (huong) {
        text += '<h3 class="directed-degree-heading">Bán bậc ra và bán bậc vào của đồ thị</h3>';
        text += '<div class="directed-degree-table-wrap"><table class="directed-degree-table"><thead><tr><th>Đỉnh</th><th>deg⁺(v)<br><small>Bán bậc ra</small></th><th>deg⁻(v)<br><small>Bán bậc vào</small></th></tr></thead><tbody>';
        text += range.map(i => `<tr><td>${i}</td><td>${degOut[i]}</td><td>${degIn[i]}</td></tr>`).join("");
        text += `</tbody></table><div class="directed-degree-sums">Σ deg⁺(v) = ${m} = ${m} cạnh<br>Σ deg⁻(v) = ${m}</div></div>`;
    }
    return text;
}

// Ghép tất cả vào khung thông tin bên dưới đồ thị. Thứ tự hiển thị:
//   1) Đỉnh/cạnh  2) Bậc  3) DANH SÁCH KỀ (list.js)  4) Ma trận kề  5) Ma trận trọng số  6) CHU TRÌNH EULER (euler.js)  7) NGƯỜI PHÁT THƯ (postman.js)
function hienThiThongTin() {
    if (eulerHL) { resetEuler(); veDoThi(); }   // dựng lại thông tin thì bỏ tô màu Euler cũ
    // Nhớ các khung "Cách giải chi tiết" đang mở (giai.js) để mở lại sau khi dựng lại
    const dangMo = new Set([...document.querySelectorAll("#thongTin details.giai[open]")].map(d => d.dataset.key));
    $("thongTin").innerHTML =
        htmlDinhCanh() + giaiDinhCanh() +
        htmlBac() + giaiBac() +
        htmlDanhSachKe() + giaiDanhSachKe() +
        htmlMaTranKe() + giaiMaTranKe() +
        htmlMaTranTrongSo() + giaiMaTranTrongSo() +
        htmlEuler() + giaiEuler() +
        htmlNguoiPhatThu() + giaiChiTietNPT();
    document.querySelectorAll("#thongTin details.giai").forEach(d => { if (dangMo.has(d.dataset.key)) d.open = true; });
    if (typeof luuTuDong === "function") luuTuDong();   // tự động lưu (storage.js)
}
