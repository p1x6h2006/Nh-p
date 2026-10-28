// =====================================================
// MA TRẬN: ma trận kề và ma trận trọng số
// =====================================================

// [Mục] Hàm tiện ích dùng chung (ghiChu cũng được list.js dùng lại)
const ghiChu = s => `<div class="adjacency-matrix-note">${s}</div>`;
const dsDinh = () => Array.from({ length: n }, (_, i) => i);
const loaiDoThi = () => (coHuong() ? "có hướng" : "vô hướng");

// Vẽ một ma trận n x n thành bảng HTML; hienThiO quyết định cách hiện từng ô
function bangMa(M, hienThiO) {
    const head = Array.from({ length: n }, (_, c) => `<th>${c}</th>`).join("");
    const rows = M.map((row, r) => `<tr><th>${r}</th>${row.map((v, c) => hienThiO(v, r, c)).join("")}</tr>`).join("");
    return `<table class="adjacency-matrix"><thead><tr><th>Đỉnh</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

// ---- Ma trận kề ----
// Ô [i][j] = số cạnh nối i với j.
//   Vô hướng (loai 1-3): đối xứng, vòng khuyên ghi 1 trên đường chéo.
//   Có hướng (loai 4-5): chỉ ghi [x][y], hàng = đỉnh xuất phát, cột = đỉnh đích.
//   Đa đồ thị (loai 2, 5): ô có thể > 1 (cạnh song song).
function htmlMaTranKe() {
    const loai = loaiHienTai(), huong = coHuong();
    const adj = dsDinh().map(() => Array(n).fill(0));
    edges.forEach(({ x, y }) => {
        adj[x][y]++;
        if (!huong && x !== y) adj[y][x]++;
    });

    let text = `<h3 class="adjacency-matrix-heading">Ma trận kề (đồ thị ${loaiDoThi()})</h3><div class="adjacency-matrix-wrap">`;
    text += bangMa(adj, v => `<td>${v}</td>`);
    text += ghiChu(`Hàng và cột sử dụng cùng số hiệu đỉnh trên đồ thị (0–${n - 1}).`);
    if (huong) text += ghiChu("Hàng là đỉnh xuất phát, cột là đỉnh đích.");
    else if (edges.some(e => e.x === e.y)) text += ghiChu("Mỗi vòng khuyên ghi 1 trên đường chéo chính và đóng góp 2 vào bậc đỉnh.");
    if (loai === 2 || loai === 5) text += ghiChu("Mỗi ô ghi số cạnh song song giữa hai đỉnh.");
    return text + "</div>";
}

// ---- Ma trận trọng số (mọi loại): 0 khi trùng đỉnh, w(i,j) nếu có cạnh, ∞ nếu không có ----
function htmlMaTranTrongSo() {
    const huong = coHuong();
    const D = dsDinh().map(i => dsDinh().map(j => i === j ? 0 : Infinity));
    edges.forEach(({ x, y, w = 1 }) => {
        if (x === y) return;
        D[x][y] = Math.min(D[x][y], w);
        if (!huong) D[y][x] = Math.min(D[y][x], w);
    });

    let text = `<h3 class="adjacency-matrix-heading">Ma trận trọng số (đồ thị ${loaiDoThi()})</h3><div class="adjacency-matrix-wrap">`;
    text += bangMa(D, (v, r, c) => v === Infinity ? '<td class="weight-inf">∞</td>' : `<td class="${r === c ? "weight-diag" : ""}">${v}</td>`);
    text += ghiChu("d(i,j) = 0 khi i trùng j; = w(i,j) là trọng số cạnh nối hai đỉnh; = ∞ nếu không có cạnh nối.");
    text += ghiChu("Cạnh nhập không có trọng số được tính w = 1. Nếu có nhiều cạnh song song, lấy trọng số nhỏ nhất.");
    text += ghiChu(huong ? "Hàng là đỉnh xuất phát, cột là đỉnh đích." : "Đồ thị vô hướng nên ma trận đối xứng qua đường chéo chính.");
    return text + "</div>";
}
