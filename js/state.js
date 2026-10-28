// =====================================================
// TRẠNG THÁI DÙNG CHUNG: số đỉnh, danh sách cạnh, vị trí đỉnh, màu
// =====================================================
let n = 5, edges = [], nodes = {}, draggingNode = null;
let eulerHL = null;   // tô màu chu trình Euler (xem euler.js): { order: {chỉ số cạnh: thứ tự}, cur: đỉnh hiện tại }
let npt = null, canhThemNPT = new Set(), nptThongBao = "";   // bài toán người phát thư (postman.js): kết quả, chỉ số cạnh đã thêm, dòng thông báo trên hình
let graphPalette = { ...PALETTES.light };
const loaiHienTai = () => parseInt($("loai").value);
// loai 1-3: vô hướng | loai 4-5: có hướng
const coHuong = () => loaiHienTai() >= 4;
