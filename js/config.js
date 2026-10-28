// =====================================================
// CẤU HÌNH: tham chiếu DOM, tên 5 loại đồ thị, bảng màu 3 theme
// =====================================================
const $ = id => document.getElementById(id);
const svg = $("svg");
const NS = "http://www.w3.org/2000/svg";

// -----------------------------------------------------
// 5 LOẠI ĐỒ THỊ (giá trị loai = 1..5, dùng xuyên suốt các file)
//   loai 1 | Đơn đồ thị vô hướng : KHÔNG vòng khuyên, KHÔNG cạnh song song, cạnh không mũi tên
//   loai 2 | Đa đồ thị vô hướng  : cho phép cạnh song song, KHÔNG vòng khuyên
//   loai 3 | Giả đồ thị vô hướng : cho phép cạnh song song VÀ vòng khuyên
//   loai 4 | Đơn đồ thị có hướng : KHÔNG vòng khuyên, mỗi cặp (x→y) chỉ 1 cạnh, có mũi tên
//   loai 5 | Đa đồ thị có hướng  : cho phép cạnh song song (x→y), KHÔNG vòng khuyên, có mũi tên
// Tìm nhanh: gõ "loai ===" hoặc "coHuong()" để thấy chỗ xử lý riêng từng loại.
// -----------------------------------------------------
const TEN_LOAI = ["Đơn đồ thị vô hướng", "Đa đồ thị vô hướng", "Giả đồ thị vô hướng", "Đơn đồ thị có hướng", "Đa đồ thị có hướng"];
const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const PALETTES = {
    light:   { node: "#60a5fa", border: "#0f172a", edge: "#2563eb", glow: "#93c5fd" },
    dark:    { node: "#22d3ee", border: "#e2e8f0", edge: "#8b5cf6", glow: "#c084fc" },
    premium: { node: "#fbbf24", border: "#f8fafc", edge: "#38bdf8", glow: "#facc15" }
};
const COLOR_INPUTS = { node: "nodeColor", border: "nodeBorderColor", edge: "edgeColor", glow: "edgeGlowColor" };
