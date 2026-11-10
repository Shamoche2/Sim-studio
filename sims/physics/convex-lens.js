const { C, line, text, circle, arrow } = Sim;
Sim({
  title: "Convex Lens Ray Diagram",
  intro: "A converging lens bends light to form an image. Move the object and change the focal length to see when the image is real or virtual, bigger or smaller, upright or upside down.",
  controls: [
    { id: "u", label: "Object distance", min: 2, max: 60, step: 0.5, value: 30, unit: "cm", digits: 1 },
    { id: "f", label: "Focal length", min: 5, max: 20, step: 0.5, value: 10, unit: "cm", digits: 1 },
    { id: "h", label: "Object height", min: 2, max: 8, step: 0.5, value: 5, unit: "cm", digits: 1 },
  ],
  readouts: [["v", "Image distance"], ["m", "Magnification"], ["type", "Image type"]],
  calc(p) { const v = p.u === p.f ? Infinity : (p.u * p.f) / (p.u - p.f); return { v, m: -v / p.u }; },
  draw({ ctx, W, H }, s, p) {
    const cx = W / 2, cy = H / 2, sc = (W / 2 - 20) / 62, { v, m } = this.calc(p);
    const X = (d) => cx + d * sc, Y = (h) => cy - h * sc;
    line(ctx, 0, cy, W, cy, C.gray, 1.5);
    // lens
    ctx.beginPath(); ctx.ellipse(cx, cy, 10, H * 0.42, 0, 0, Math.PI * 2); ctx.fillStyle = "rgba(47,111,237,.15)"; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke();
    for (const d of [-p.f, p.f, -2 * p.f, 2 * p.f]) { circle(ctx, X(d), cy, 4, C.text); text(ctx, Math.abs(d) === p.f ? "F" : "2F", X(d), cy + 18, { align: "center", size: 12 }); }
    const ox = X(-p.u), oy = Y(p.h);
    arrow(ctx, ox, cy, ox, oy, C.green, 4);
    text(ctx, "object", ox, cy + 34, { align: "center", color: C.green, size: 12 });
    const ext = (x1, y1, x2, y2, col, dash) => { const k = 4000; const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); line(ctx, x1, y1, x1 + (dx / L) * k, y1 + (dy / L) * k, col, 2, dash); };
    // ray 1: parallel, then through far focus
    line(ctx, ox, oy, cx, oy, C.red, 2); ext(cx, oy, X(p.f), cy, C.red);
    // ray 2: through centre
    ext(ox, oy, cx, cy, C.orange);
    // ray 3: through near focus, then parallel
    if (p.u > p.f + 0.01) { const slope = (cy - oy) / (X(-p.f) - ox), yAt = oy + slope * (cx - ox); line(ctx, ox, oy, cx, yAt, C.purple, 2); line(ctx, cx, yAt, W, yAt, C.purple, 2); }
    if (isFinite(v)) {
      const ix = X(v), iy = Y(p.h * m), virt = v < 0;
      if (virt) { line(ctx, cx, oy, ix, iy, C.red, 1.5, [5, 5]); line(ctx, cx, cy, ix, iy, C.orange, 1.5, [5, 5]); }
      if (ix > -50 && ix < W + 50) { ctx.globalAlpha = virt ? 0.6 : 1; arrow(ctx, ix, cy, ix, iy, C.blue, 4); ctx.globalAlpha = 1; text(ctx, virt ? "virtual image" : "real image", ix, cy + (iy < cy ? 34 : -10) , { align: "center", color: C.blue, size: 12 }); }
    } else text(ctx, "No image: rays come out parallel", cx + 20, 24, { color: C.blue, weight: 600 });
  },
  read(s, p) {
    const { v, m } = this.calc(p);
    if (!isFinite(v)) return { v: "at infinity", m: "—", type: "no image" };
    return { v: (v > 0 ? "" : "−") + Math.abs(v).toFixed(1) + " cm", m: m.toFixed(2) + "×", type: `${v > 0 ? "real" : "virtual"}, ${m < 0 ? "inverted" : "upright"}, ${Math.abs(m) > 1 ? "magnified" : "smaller"}` };
  },
  keyIdea: "<b>Key idea:</b> the lens formula is 1/f = 1/u + 1/v. Objects beyond F make real, upside-down images (a projector or camera). Objects inside F make virtual, upright, magnified images (a magnifying glass).",
  tryThis: ["Put the object at exactly 2F. How big is the image?", "Move the object between F and the lens. What kind of image do you get? Which tool works this way?", "Where must the object be for a projector, which makes a big upside-down image?"],
  note: "Three standard rays: parallel→through F (red), through the centre (orange), through F→parallel (purple).",
});
