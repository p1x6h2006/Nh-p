// =====================================================
// LƯU / KHÔI PHỤC / RESET: tự động lưu đồ thị (kể cả màu) vào localStorage của trình duyệt
// =====================================================
// Lưu gì: loại đồ thị, theme, 4 màu đồ thị, số đỉnh, cạnh, vị trí đỉnh, phần tô màu Euler,
//         kết quả người phát thư (cạnh thêm màu xanh lá), đỉnh bắt đầu Euler.
// Khi nào lưu: tự động sau mỗi lần vẽ lại (veDoThi) / dựng lại thông tin (hienThiThongTin), và khi thoát trang.
// Khi mở lại trang: tự khôi phục (khoiPhuc) và vào thẳng màn hình chính. Muốn về ban đầu: bấm "Reset" (resetDoThi).
// Mô phỏng Euler đang chạy dở khi thoát: khôi phục đúng phần đã tô, KHÔNG tự chạy tiếp (bấm ▶ Mô phỏng để chạy lại).

const KHOA_LUU = "moPhongDoThi.v1";
let luuHen = null;          // bộ đếm giờ gom nhiều lần vẽ lại thành 1 lần lưu
let sanSangLuu = false;     // chỉ cho lưu sau khi đã khôi phục xong (tránh ghi đè dữ liệu cũ bằng trạng thái rỗng)

const dangOManHinhChinh = () => $("manHinhChinh").style.display === "flex";
const themeHienTai = () => document.body.classList.contains("theme-dark") ? "dark" : document.body.classList.contains("theme-premium") ? "premium" : "light";

function ghiTrangThaiLuu(msg) {
    const t = $("luuTrangThai");
    if (t) t.textContent = msg;
}

// Chụp trạng thái hiện tại thành 1 đối tượng JSON
function chupTrangThai() {
    return {
        v: 1, loai: $("loai").value, theme: themeHienTai(), palette: graphPalette,
        soDinh: $("soDinh").value, soCanh: $("soCanh").value,
        n, edges, nodes, eulerHL, eulerStart,
        npt, canhThemNPT: [...canhThemNPT], nptThongBao
    };
}

function luuNgay(hienThongBao) {
    clearTimeout(luuHen); luuHen = null;
    if (!sanSangLuu || !dangOManHinhChinh()) return;
    try {
        localStorage.setItem(KHOA_LUU, JSON.stringify(chupTrangThai()));
        ghiTrangThaiLuu((hienThongBao ? "✔ Đã lưu lúc " : "Tự động lưu lúc ") + new Date().toLocaleTimeString("vi-VN"));
    } catch (err) {
        ghiTrangThaiLuu("⚠ Không lưu được (trình duyệt chặn hoặc hết dung lượng)");
    }
}

// Gọi sau mỗi lần vẽ lại: chờ 400 ms rồi mới lưu (kéo đỉnh vẽ liên tục nên không lưu từng khung hình)
function luuTuDong() {
    if (!sanSangLuu) return;
    clearTimeout(luuHen);
    luuHen = setTimeout(() => luuNgay(false), 400);
}

// Đọc dữ liệu đã lưu và dựng lại đúng như lúc thoát
function khoiPhuc() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KHOA_LUU)); } catch (err) { d = null; }
    if (!d || d.v !== 1 || !Array.isArray(d.edges) || !d.nodes) return false;

    try {
        $("chonLoai").style.display = "none";
        $("manHinhChinh").style.display = "flex";
        $("loai").value = d.loai; capNhatTenLoai();
        $("soDinh").value = d.soDinh; $("soCanh").value = d.soCanh;

        chonGiaoDien(d.theme);                       // đổi theme trước, rồi mới ghi đè bằng màu người dùng đã chọn
        graphPalette = { ...graphPalette, ...d.palette };
        for (const k in COLOR_INPUTS) $(COLOR_INPUTS[k]).value = graphPalette[k];
        if (d.theme !== "light" || JSON.stringify(d.palette) !== JSON.stringify(PALETTES.light)) {
            document.documentElement.style.setProperty("--primary", graphPalette.edge);
            document.documentElement.style.setProperty("--primary-dark", graphPalette.edge);
        }

        n = d.n; edges = d.edges; nodes = d.nodes;
        eulerStart = d.eulerStart === undefined ? null : d.eulerStart;
        npt = d.npt || null;
        canhThemNPT = new Set(d.canhThemNPT || []);
        nptThongBao = d.nptThongBao || "";

        if (Object.keys(nodes).length) hienThiThongTin();   // dựng bảng thông tin (khi đó eulerHL còn rỗng nên không bị xóa)
        eulerHL = d.eulerHL || null;                        // rồi mới đặt lại phần tô màu Euler
        veDoThi();
        if (eulerHL && eulerHL.msg) { const t = $("eulerStatus"); if (t) t.textContent = eulerHL.msg; }
        ghiTrangThaiLuu("Đã khôi phục đồ thị đã lưu");
        return true;
    } catch (err) {
        console.error("Không khôi phục được dữ liệu đã lưu:", err);
        return false;
    }
}

// [Mục] RESET: xóa đồ thị, màu, phần tô Euler / người phát thư và dữ liệu đã lưu -> về như lúc mới mở
function resetDoThi() {
    if (!confirm("Reset sẽ xóa đồ thị hiện tại, mọi màu đã tô và dữ liệu đã lưu. Bạn chắc chắn chứ?")) return;
    resetEuler(); resetNguoiPhatThu(); eulerStart = null;
    n = 5; edges = []; nodes = {};
    $("soDinh").value = 5; $("soCanh").value = 5;
    ["themX", "themY", "themW", "xoaX", "xoaY", "cuX", "cuY", "moiX", "moiY", "moiW"].forEach(id => { $(id).value = ""; });
    chonGiaoDien("light");                           // về theme và 4 màu mặc định
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--primary-dark");
    svg.innerHTML = "";
    $("thongTin").textContent = "Chưa có đồ thị";
    clearTimeout(luuHen); luuHen = null;
    try { localStorage.removeItem(KHOA_LUU); } catch (err) { /* bỏ qua */ }
    ghiTrangThaiLuu("Đã reset về ban đầu");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Lưu nốt khi đóng / ẩn trang
window.addEventListener("beforeunload", () => luuNgay(false));
document.addEventListener("visibilitychange", () => { if (document.hidden) luuNgay(false); });

khoiPhuc();
sanSangLuu = true;
