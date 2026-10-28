// =====================================================
// KIỂM TRA DỮ LIỆU: đỉnh hợp lệ, vòng khuyên, cạnh trùng, trọng số
// =====================================================
const kiemTraDinh = (x, N = n) => Number.isInteger(x) && x >= 0 && x < N;

// Trả về chuỗi lỗi (nếu có) hoặc null nếu cạnh hợp lệ
function kiemTraCanh(x, y, loai, list = edges, N = n) {
    if (!kiemTraDinh(x, N) || !kiemTraDinh(y, N)) return `Đỉnh phải nằm từ 0 đến ${N - 1}!`;
    const huong = loai >= 4; // loai 4, 5 là đồ thị có hướng
    // Vòng khuyên (x = y): chỉ loai 3 (giả đồ thị vô hướng) được phép
    if (x === y && loai !== 3) {
        return huong ? "Đồ thị có hướng không có vòng khuyên!"   // loai 4, 5
            : loai === 1 ? "Đơn đồ thị vô hướng không có vòng khuyên!"
            : "Đa đồ thị vô hướng không có vòng khuyên!";
    }
    // Kiểm tra cạnh trùng: CHỈ áp dụng cho đơn đồ thị (loai 1, 4).
    // Đa đồ thị / giả đồ thị (loai 2, 3, 5) cho phép nhiều cạnh song song (và nhiều vòng khuyên ở loai 3).
    // Vô hướng: (x,y) và (y,x) là một; có hướng: chỉ trùng khi cùng chiều (x→y và y→x là hai cạnh khác nhau).
    const choPhepSongSong = loai === 2 || loai === 3 || loai === 5;
    if (!choPhepSongSong && list.some(e => (e.x === x && e.y === y) || (!huong && e.x === y && e.y === x))) {
        return `Cạnh (${x},${y}) đã tồn tại! (đơn đồ thị không cho phép cạnh song song)`;
    }
    return null;
}

// Đọc trọng số: để trống -> undefined, không phải số -> NaN
const docTrongSo = s => (s === undefined || String(s).trim() === "") ? undefined : Number(s);
const taoCanh = (x, y, w) => w === undefined ? { x, y } : { x, y, w };
