const { C, text, rect } = Sim;
Sim({
  title: "Moments and Balancing",
  intro: "A moment is the turning effect of a force: force × distance from the pivot. A seesaw balances when the clockwise moments equal the anticlockwise moments.",
  controls: [
    { id: "m1", label: "Left mass", min: 0, max: 10, step: 0.5, value: 4, unit: "kg", digits: 1 },
    { id: "d1", label: "Left distance from pivot", min: 0.2, max: 2, step: 0.1, value: 1, unit: "m", digits: 1 },
    { id: "m2", label: "Right mass", min: 0, max: 10, step: 0.5, value: 2, unit: "kg", digits: 1 },
    { id: "d2", label: "Right distance from pivot", min: 0.2, max: 2, step: 0.1, value: 1.5, unit: "m", digits: 1 },
  ],
  readouts: [["acw", "Anticlockwise moment"], ["cw", "Clockwise moment"], ["res", "Result"]],
  init(s) { s.ang = 0; },
  step(s, p, dt) { const net = (p.m2 * p.d2 - p.m1 * p.d1) * 9.81, target = Sim.clamp(net * 0.02, -0.28, 0.28); s.ang += (target - s.ang) * dt * 4; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const cx = W / 2, cy = H * 0.55, sc = (W * 0.42) / 2;
    ctx.fillStyle = C.brown; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 30, cy + 60); ctx.lineTo(cx + 30, cy + 60); ctx.fill();
    rect(ctx, 0, cy + 60, W, H - cy - 60, "#e9ecef");
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.ang);
    rect(ctx, -sc * 2.1, -8, sc * 4.2, 10, "#c69c6d", C.text, 3, 1.5);
    for (let d = -2; d <= 2; d += 0.5) { Sim.line(ctx, d * sc, -8, d * sc, -14, C.text, 1); if (d % 1 === 0) text(ctx, Math.abs(d) + " m", d * sc, 18, { align: "center", size: 10, color: C.muted }); }
    const box = (d, m, col) => { if (!m) return; const sz = 18 + m * 4; rect(ctx, d * sc - sz / 2, -8 - sz, sz, sz, col, C.text, 3, 1.5); text(ctx, m + " kg", d * sc, -8 - sz / 2 + 4, { align: "center", color: "#fff", size: 11, weight: 700 }); };
    box(-p.d1, p.m1, C.blue); box(p.d2, p.m2, C.orange);
    ctx.restore();
    text(ctx, `${p.m1} × 9.81 × ${p.d1} = ${(p.m1 * 9.81 * p.d1).toFixed(1)} N·m`, 14, 24, { color: C.blue, weight: 600 });
    text(ctx, `${p.m2} × 9.81 × ${p.d2} = ${(p.m2 * 9.81 * p.d2).toFixed(1)} N·m`, W - 14, 24, { color: C.orange, weight: 600, align: "right" });
  },
  read(s, p) { const a = p.m1 * 9.81 * p.d1, c = p.m2 * 9.81 * p.d2; return { acw: a.toFixed(1) + " N·m", cw: c.toFixed(1) + " N·m", res: Math.abs(a - c) < 0.05 ? "balanced" : a > c ? "tips left (anticlockwise)" : "tips right (clockwise)" }; },
  keyIdea: "<b>Key idea:</b> moment = force × perpendicular distance from the pivot. For balance, total clockwise moment = total anticlockwise moment (the principle of moments).",
  tryThis: ["Balance a 4 kg mass at 1 m using a 2 kg mass. Where must the 2 kg go?", "Why is it easier to open a door by pushing far from the hinge?", "Put 10 kg at 0.5 m. What's the smallest mass that can balance it, and where?"],
});
