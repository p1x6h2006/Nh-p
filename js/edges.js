// =====================================================
// CẠNH: tạo đồ thị, thêm / xóa / sửa cạnh
// =====================================================
// [Mục] TẠO ĐỒ THỊ MỚI: đọc số đỉnh/cạnh -> hỏi từng cạnh bằng prompt -> kiểm tra -> dựng đồ thị
function taoDoThi() {
    const soDinh = parseInt($("soDinh").value);
    const m = parseInt($("soCanh").value);
    const loai = loaiHienTai(); // loại đồ thị quyết định luật kiểm tra cạnh (xem validate.js)

    if (!Number.isInteger(soDinh) || soDinh < 1) return alert("Số đỉnh phải lớn hơn 0!");
    if (!Number.isInteger(m) || m < 0) return alert("Số cạnh không hợp lệ!");

    const list = [];
    for (let i = 0; i < m; i++) {
        while (true) {
            const input = prompt(`Nhập cạnh ${i + 1} theo dạng x y hoặc x y w (w = trọng số, có thể bỏ trống; đỉnh từ 0 đến ${soDinh - 1}):`);
            if (input === null) return;

            const a = input.trim().split(/\s+/);
            if (a.length !== 2 && a.length !== 3) { alert("Vui lòng nhập đúng dạng: x y hoặc x y w"); continue; }

            const x = parseInt(a[0]), y = parseInt(a[1]);
            if (!Number.isInteger(x) || !Number.isInteger(y)) { alert("x và y phải là số nguyên!"); continue; }

            const w = docTrongSo(a[2]);
            if (Number.isNaN(w)) { alert("Trọng số w phải là một số!"); continue; }

            const loi = kiemTraCanh(x, y, loai, list, soDinh);
            if (loi) { alert(loi); continue; }

            list.push(taoCanh(x, y, w));
            break;
        }
    }

    resetEuler();
    resetNguoiPhatThu();
    n = soDinh;
    edges = list;
    nodes = {};
    for (let i = 0; i < n; i++) nodes[i] = { x: 0, y: 0 };
    sapXep();
    hienThiThongTin();
}

// [Mục] Vẽ lại hình + cập nhật phần thông tin (dùng sau mỗi lần thêm/xóa/sửa)
function capNhat() {
    resetEuler();   // sửa đồ thị thì bỏ tô màu Euler cũ
    resetNguoiPhatThu();   // và bỏ kết quả người phát thư cũ (chỉ số cạnh đã đổi)
    veDoThi();
    hienThiThongTin();
}

// ---- Thêm cạnh: áp dụng luật của loại đồ thị đang chọn ----
function themCanh() {
    const x = parseInt($("themX").value), y = parseInt($("themY").value);
    const loi = kiemTraCanh(x, y, loaiHienTai());
    if (loi) return alert(loi);

    const w = docTrongSo($("themW").value);
    if (Number.isNaN(w)) return alert("Trọng số phải là một số!");

    edges.push(taoCanh(x, y, w));
    capNhat();
}

const timCanh = (x, y) => edges.findIndex(e => e.x === x && e.y === y);

// ---- Xóa cạnh: chỉ xóa 1 cạnh khớp đúng thứ tự (x,y) (tìm bằng timCanh) ----
function xoaCanh() {
    const index = timCanh(parseInt($("xoaX").value), parseInt($("xoaY").value));
    if (index === -1) return alert("Không tìm thấy cạnh!");
    edges.splice(index, 1); // chỉ xóa một cạnh
    capNhat();
}

// ---- Sửa cạnh: kiểm tra lại luật của loại đồ thị trên danh sách đã bỏ cạnh cũ ----
function suaCanh() {
    const [cuX, cuY, moiX, moiY] = ["cuX", "cuY", "moiX", "moiY"].map(id => parseInt($(id).value));
    if (![cuX, cuY, moiX, moiY].every(v => kiemTraDinh(v))) return alert(`Các đỉnh phải nằm từ 0 đến ${n - 1}!`);

    const index = timCanh(cuX, cuY);
    if (index === -1) return alert("Không tìm thấy cạnh!");

    let w = docTrongSo($("moiW").value);
    if (Number.isNaN(w)) return alert("Trọng số mới phải là một số!");
    if (w === undefined) w = edges[index].w; // bỏ trống = giữ trọng số cũ

    const loi = kiemTraCanh(moiX, moiY, loaiHienTai(), edges.filter((_, i) => i !== index));
if (loi) return alert(loi);
edges[index] = taoCanh(moiX, moiY, w);
    capNhat();
}
