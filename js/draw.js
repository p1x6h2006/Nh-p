// =====================================================
// VẼ ĐỒ THỊ: bố trí đỉnh, vẽ cạnh và đỉnh bằng SVG, kéo đỉnh
// =====================================================
// [Mục] SẮP XẾP: đặt các đỉnh đều trên một vòng tròn
function sapXep() {
    const cx = svg.clientWidth / 2, cy = svg.clientHeight / 2;
    const r = Math.min(svg.clientWidth, svg.clientHeight) * 0.35;
    for (let i = 0; i < n; i++) {
        const angle = 2 * Math.PI * i / n - Math.PI / 2;
        nodes[i].x = cx + r * Math.cos(angle);
        nodes[i].y = cy + r * Math.sin(angle);
    }
    veDoThi();
}

// =========================================
// VẼ ĐỒ THỊ
// =========================================
function el(tag, attrs = {}, parent = svg) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
}

// [Mục] VẼ TOÀN BỘ: xóa svg -> tạo mũi tên -> vẽ cạnh (trước) -> vẽ đỉnh (sau, nằm đè lên)
function veDoThi() {
    svg.innerHTML = "";
    const defs = el("defs");
    const marker = el("marker", { id: "arrow", markerWidth: 10, markerHeight: 10, refX: 9, refY: 3, orient: "auto", fill: graphPalette.edge }, defs);
    el("path", { d: "M0,0 L0,6 L9,3 z", fill: graphPalette.edge }, marker);
    // Mũi tên màu cam cho cạnh thuộc chu trình Euler đang tô (euler.js)
    const markerHL = el("marker", { id: "arrowHL", markerWidth: 10, markerHeight: 10, refX: 9, refY: 3, orient: "auto", fill: MAU_EULER }, defs);
    el("path", { d: "M0,0 L0,6 L9,3 z", fill: MAU_EULER }, markerHL);

    edges.forEach((e, index) => veCanh(e.x, e.y, index));
    for (const i in nodes) veDinh(Number(i));

    // Thông báo bước Euler đang chạy (euler.js), đặt góc trên bên trái hình
    if (eulerHL && eulerHL.msg) el("text", { x: 16, y: 26, class: "edge-label", style: "text-anchor:start;font-size:15px" }).textContent = eulerHL.msg;

    // Dòng thông báo của bài toán người phát thư (postman.js), góc dưới trái; bấm vào để xuống bảng kết quả
    if (nptThongBao) {
        const t = el("text", { x: 16, y: svg.clientHeight - 14, class: "edge-label", style: "text-anchor:start;font-size:14px;cursor:pointer;pointer-events:all" });
        t.textContent = nptThongBao;
        t.addEventListener("click", cuonDenKetQuaNPT);
    }
    if (typeof luuTuDong === "function") luuTuDong();   // tự động lưu (storage.js)
}

// [Mục] Nhãn của cạnh: "(x,y)" hoặc "(x,y) · w"
function nhanCanh(index) {
    const { x, y, w } = edges[index];
    return w !== undefined ? `(${x},${y}) · ${w}` : `(${x},${y})`;
}

function taoNhan(x, y, text, hl) {
    el("text", { x, y, class: hl ? "edge-label euler-label" : "edge-label" }).textContent = text;
}

// Vẽ một cạnh. Cách vẽ theo loại đồ thị:
//   - Vòng khuyên (x = y)      : hình elip phía trên đỉnh          (loai 3)
//   - Cạnh thường              : đường cong bậc hai                 (loai 1-5)
//   - Cạnh song song           : cong ra hai bên để không chồng nhau (loai 2, 3, 5)
//   - Có hướng (coHuong())     : thêm mũi tên ở đầu y               (loai 4, 5)
function veCanh(x, y, index) {
    const p1 = nodes[x], p2 = nodes[y], P = graphPalette;
    const buoc = eulerHL ? eulerHL.order[index] : undefined;      // thứ tự đi của cạnh trong chu trình Euler (nếu đang tô)
    const them = canhThemNPT.has(index);                           // cạnh do bài toán người phát thư thêm vào (xanh lá)
    const mauCanh = buoc ? MAU_EULER : them ? MAU_THEM : P.edge, mauGlow = buoc ? MAU_EULER : them ? MAU_THEM : P.glow, dayNet = buoc ? 6 : them ? 5 : 4;
    const nhan = (buoc ? `#${buoc} ` : "") + nhanCanh(index);
    const mui = buoc ? "url(#arrowHL)" : "url(#arrow)";

    // --- Vòng khuyên (chỉ loai 3 mới có) ---
    if (x === y) {
        // Nhiều vòng khuyên trên cùng một đỉnh: vòng thứ k vẽ to dần lên phía trên để không chồng nhau
        const k = edges.slice(0, index).filter(e => e.x === x && e.y === y).length;
        const cy = p1.y - 35 - k * 25, ex = k * 15, ey = k * 25;
        el("ellipse", { cx: p1.x, cy, rx: 39 + ex, ry: 54 + ey, fill: "none", stroke: mauGlow, "stroke-width": 15, opacity: 0.25 });   // quầng sáng: nét to mờ, không dùng filter
        const loop = el("ellipse", { cx: p1.x, cy, rx: 35 + ex, ry: 50 + ey, class: "edge", stroke: mauCanh, "stroke-width": dayNet, fill: "none" });
        if (coHuong()) loop.setAttribute("marker-end", mui);
        taoNhan(p1.x, p1.y - 90 - k * 50, nhan, buoc);
        return;
    }

    // --- Cạnh thường: tính độ cong ---
    // Độ cong: các cạnh song song được tách ra hai bên
    const same = edges.filter(e => (e.x === x && e.y === y) || (e.x === y && e.y === x));
    const offset = (same.indexOf(edges[index]) - (same.length - 1) / 2) * 50;
    // Pháp tuyến luôn tính theo chiều CỐ ĐỊNH (đỉnh nhỏ -> đỉnh lớn), không phụ thuộc chiều cạnh.
    // Nhờ vậy (1,4) và (4,1) cong về HAI PHÍA KHÁC NHAU thành 2 đường riêng, thay vì chồng lên nhau.
    const [pa, pb] = x < y ? [p1, p2] : [p2, p1];
    const dx = pb.x - pa.x, dy = pb.y - pa.y, len = Math.hypot(dx, dy);
    const cx = (p1.x + p2.x) / 2 + (-dy / len) * offset;
    const cy = (p1.y + p2.y) / 2 + (dx / len) * offset;

    const diem = (a, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b;      // phần đầu + điều khiển
    const bez = (t, a, b, c) => diem(a, b, t) + t * t * c;                       // điểm trên đường cong bậc hai
    const d = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;

    el("path", { d, fill: "none", stroke: mauGlow, "stroke-width": 14, opacity: 0.25, "stroke-linecap": "round" });   // quầng sáng: nét to mờ, không dùng filter
    const path = el("path", { d, class: "edge", stroke: mauCanh, "stroke-width": dayNet, fill: "none" });

    // --- Mũi tên cho đồ thị có hướng (loai 4, 5) ---
    if (coHuong()) {
        // Đưa đầu mũi tên ra ngoài đỉnh (cách tâm 34px) để không bị hình tròn che
        const cachDich = t => Math.hypot(bez(t, p1.x, cx, p2.x) - p2.x, bez(t, p1.y, cy, p2.y) - p2.y);
        if (cachDich(0) >= 34) {
            let lo = 0, hi = 1;
            for (let i = 0; i < 30; i++) {
                const mid = (lo + hi) / 2;
                if (cachDich(mid) >= 34) lo = mid; else hi = mid;
            }
            const t = (lo + hi) / 2;
            path.setAttribute("d", `M ${p1.x} ${p1.y} Q ${p1.x + t * (cx - p1.x)} ${p1.y + t * (cy - p1.y)} ${bez(t, p1.x, cx, p2.x)} ${bez(t, p1.y, cy, p2.y)}`);
        }
        path.setAttribute("marker-end", mui);
    }

    // Nhãn cạnh (x,y) · w đặt ở giữa đường cong
    taoNhan((p1.x + 2 * cx + p2.x) / 4, (p1.y + 2 * cy + p2.y) / 4, nhan, buoc);
}

// Vẽ một đỉnh (hình tròn + số hiệu), có thể kéo bằng chuột
function veDinh(i) {
    const p = nodes[i], g = el("g");
    el("circle", { cx: p.x, cy: p.y + 7, r: 32, fill: "rgba(59, 130, 246, 0.22)", "pointer-events": "none" }, g);   // bóng đổ nhẹ, thay cho drop-shadow
    const c = el("circle", { cx: p.x, cy: p.y, r: 30, class: "node", fill: graphPalette.node, stroke: eulerHL && eulerHL.cur === i ? MAU_EULER : graphPalette.border, "stroke-width": eulerHL && eulerHL.cur === i ? 7 : 3 }, g);
    c.addEventListener("mousedown", e => { draggingNode = i; e.preventDefault(); });
    el("text", { x: p.x, y: p.y, class: "node-text" }, g).textContent = i;
}

// Kéo đỉnh bằng chuột
let veCho = false;   // gom nhiều lần di chuột thành 1 lần vẽ lại mỗi khung hình
svg.addEventListener("mousemove", e => {
    if (draggingNode === null) return;
    const rect = svg.getBoundingClientRect();
    nodes[draggingNode].x = e.clientX - rect.left;
    nodes[draggingNode].y = e.clientY - rect.top;
    if (veCho) return;
    veCho = true;
    requestAnimationFrame(() => { veCho = false; veDoThi(); });
});
document.addEventListener("mouseup", () => { draggingNode = null; });
