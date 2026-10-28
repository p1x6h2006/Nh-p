// =====================================================
// DANH SÁCH KỀ (Adjacency List): mỗi đỉnh -> danh sách các đỉnh kề với nó
// =====================================================
// Cách lưu theo từng loại đồ thị:
//   Vô hướng (loai 1-3): cạnh x-y lưu 2 CHIỀU (y vào ds của x, x vào ds của y).
//                        Vòng khuyên x-x được ghi 2 lần (khớp quy ước vòng khuyên = bậc 2).
//   Có hướng (loai 4-5): cạnh x→y chỉ lưu 1 CHIỀU (y vào ds của x).
//   Đa đồ thị / giả đồ thị (loai 2, 3, 5): cạnh song song -> đỉnh kề xuất hiện NHIỀU LẦN.
// Mỗi phần tử: { v: đỉnh kề, w: trọng số (nếu có), e: số thứ tự cạnh }

// ---- Bước 1: dựng dữ liệu danh sách kề từ mảng edges ----
function xayDanhSachKe() {
    const ds = dsDinh().map(() => []);
    edges.forEach((e, i) => {
        ds[e.x].push({ v: e.y, w: e.w, e: i });
        if (!coHuong()) ds[e.y].push({ v: e.x, w: e.w, e: i });   // vô hướng: lưu thêm chiều ngược lại
    });
    ds.forEach(l => l.sort((a, b) => a.v - b.v || a.e - b.e));    // xếp tăng dần cho dễ đối chiếu
    return ds;
}

// ---- Bước 2: vẽ thành HTML giống hình minh họa: [đỉnh] → [kề] → [kề] → NULL ----
function htmlDanhSachKe() {
    const ds = xayDanhSachKe(), huong = coHuong(), m = edges.length;
    const tong = ds.reduce((s, l) => s + l.length, 0);
    const nut = p => `<span class="adj-node" title="cạnh e${p.e + 1}">${p.v}${p.w !== undefined ? `<small>w=${p.w}</small>` : ""}</span><span class="adj-arrow">→</span>`;
    const hang = ds.map((l, i) => `<div class="adj-row"><span class="adj-head">${i}</span><span class="adj-arrow">→</span>${l.map(nut).join("")}<span class="adj-null">NULL</span></div>`).join("");

    let text = `<h3>Danh sách kề (đồ thị ${loaiDoThi()})</h3><div class="adj-list-wrap">${hang}</div>`;
    text += ghiChu(huong ? "Có hướng: cạnh x→y chỉ lưu y trong danh sách của x." : "Vô hướng: mỗi cạnh x–y lưu ở cả hai đầu (y trong ds của x, x trong ds của y).");
    text += ghiChu(`Tổng số phần tử các danh sách = ${tong} = ${huong ? "" : "2 × "}${m} cạnh. Độ dài danh sách của đỉnh i = ${huong ? "bán bậc ra deg⁺(i)" : "bậc deg(i)"}.`);
    if (!huong && edges.some(e => e.x === e.y)) text += ghiChu("Vòng khuyên x–x xuất hiện 2 lần trong danh sách của x (tính bậc 2).");
    if ([2, 3, 5].includes(loaiHienTai())) text += ghiChu("Cạnh song song: đỉnh kề lặp lại nhiều lần (di chuột vào ô để xem là cạnh nào).");
    return text;
}
