const { C, text, rect, circle, arrow } = Sim;
Sim({
  title: "Electric Fields and Charges",
  intro: "Charges create an electric field around them. The arrows show the force a small positive test charge would feel. Drag the charges around to change the field.",
  controls: [
    { id: "q1", label: "Charge A", min: -5, max: 5, step: 1, value: 3, unit: "μC" },
    { id: "q2", label: "Charge B", min: -5, max: 5, step: 1, value: -3, unit: "μC" },
  ],
  readouts: [["F", "Force between A and B"], ["kind", "Force type"], ["d", "Distance"]],
  init(s) { s.a = { x: 0.33, y: 0.5 }; s.b = { x: 0.67, y: 0.5 }; s.drag = null; },
  pointer(s, p, e) {
    const nx = e.x / e.W, ny = e.y / e.H;
    if (e.type === "down") s.drag = [s.a, s.b].find((c) => Math.hypot((c.x - nx) * e.W, (c.y - ny) * e.H) < 30) || null;
    if (e.type === "drag" && s.drag) { s.drag.x = Sim.clamp(nx, 0.03, 0.97); s.drag.y = Sim.clamp(ny, 0.05, 0.95); }
    if (e.type === "up") s.drag = null;
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const charges = [{ ...s.a, q: p.q1 }, { ...s.b, q: p.q2 }], step = 34;
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
      let ex = 0, ey = 0, near = false;
      for (const c of charges) {
        const dx = x - c.x * W, dy = y - c.y * H, r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
        if (r < 20) near = true;
        ex += (c.q * dx) / (r2 * r); ey += (c.q * dy) / (r2 * r);
      }
      const mag = Math.hypot(ex, ey);
      if (near || mag === 0) continue;
      const strength = Math.min(1, Math.log10(1 + mag * 4e4) / 2.2), len = 13;
      ctx.globalAlpha = 0.25 + 0.75 * strength;
      arrow(ctx, x - (ex / mag) * len / 2, y - (ey / mag) * len / 2, x + (ex / mag) * len / 2, y + (ey / mag) * len / 2, C.purple, 1.6, 6);
    }
    ctx.globalAlpha = 1;
    for (const [c, name] of [[charges[0], "A"], [charges[1], "B"]]) {
      const col = c.q > 0 ? C.red : c.q < 0 ? C.blue : C.gray;
      circle(ctx, c.x * W, c.y * H, 18, col, "#fff", 3);
      text(ctx, c.q > 0 ? "+" : c.q < 0 ? "−" : "0", c.x * W, c.y * H + 7, { align: "center", color: "#fff", size: 22, weight: 700 });
      text(ctx, name, c.x * W, c.y * H - 26, { align: "center", weight: 700 });
    }
    text(ctx, "Drag the charges", 10, H - 10, { color: C.muted, size: 12 });
  },
  read(s, p) {
    const d = Math.hypot((s.a.x - s.b.x) * 0.4, (s.a.y - s.b.y) * 0.225); // stage ≈ 0.4 m × 0.225 m
    const F = (8.99e9 * Math.abs(p.q1 * p.q2) * 1e-12) / (d * d);
    return { F: F.toFixed(2) + " N", kind: p.q1 * p.q2 > 0 ? "repulsion" : p.q1 * p.q2 < 0 ? "attraction" : "none", d: (d * 100).toFixed(1) + " cm" };
  },
  keyIdea: "<b>Key idea:</b> field arrows point away from positive charges and towards negative ones. Coulomb's law: F = kq₁q₂/r². Double the distance and the force drops to a quarter.",
  tryThis: ["Make both charges positive. What does the field look like between them?", "Drag the charges twice as far apart. What happens to the force?", "Set charge B to 0. What does the field of a single charge look like?"],
  note: "The canvas represents a 40 cm × 22.5 cm area.",
});
