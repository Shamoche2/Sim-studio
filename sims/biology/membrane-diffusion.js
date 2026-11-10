const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Diffusion and Active Transport",
  intro: "Particles spread from high to low concentration by diffusion: it needs no energy. Active transport uses energy from respiration to pump particles the other way, against the concentration gradient, like root hair cells taking up minerals.",
  controls: [
    { id: "out", label: "Particles outside the cell", min: 0, max: 80, step: 5, value: 60 },
    { id: "pumps", label: "Active transport pumps", min: 0, max: 6, step: 1, value: 0 },
    { id: "T", label: "Temperature", min: 5, max: 40, step: 5, value: 20, unit: "°C" },
  ],
  readouts: [["inside", "Inside the cell"], ["outside", "Outside the cell"], ["net", "Net movement"]],
  resetOnChange: true,
  init(s, p) { s.parts = [...Sim.particles.make(p.out, { x0: 0, y0: 0, x1: 48, y1: 50 }, 6, { side: 0 }), ...Sim.particles.make(10, { x0: 52, y0: 0, x1: 100, y1: 50 }, 6, { side: 1 })]; s.t = 0; s.hist = []; },
  step(s, p, dt) {
    s.t += dt; const sp = 0.6 + p.T / 25;
    for (const q of s.parts) {
      q.x += q.vx * sp * dt; q.y += q.vy * sp * dt;
      if (q.y < 1 || q.y > 49) q.vy *= -1; if (q.x < 1 || q.x > 99) q.vx *= -1;
      q.x = Sim.clamp(q.x, 1, 99); q.y = Sim.clamp(q.y, 1, 49);
      const crossing = (q.side === 0 && q.x > 49) || (q.side === 1 && q.x < 51);
      if (crossing) { const pore = Math.abs((q.y % 12.5) - 6.25) < 1.6; if (pore) q.side = 1 - q.side; else { q.vx *= -1; q.x = q.side === 0 ? 48.9 : 51.1; } }
    }
    for (let k = 0; k < p.pumps; k++) if (Math.random() < dt * 1.2) { const c = s.parts.find((q) => q.side === 0 && q.x > 40); if (c) { c.side = 1; c.x = 53; c.vx = Math.abs(c.vx); } }
    if (!s.hist.length || s.t - s.hist.at(-1)[0] > 0.3) s.hist.push([s.t, s.parts.filter((q) => q.side === 1).length]);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const top = H * 0.6, sc = Math.min(W / 100, top / 50), ox = (W - 100 * sc) / 2;
    rect(ctx, ox, 0, 50 * sc, 50 * sc, "#e7f5ff"); rect(ctx, ox + 50 * sc, 0, 50 * sc, 50 * sc, "#fff4e6");
    for (let y = 0; y < 50; y += 12.5) { rect(ctx, ox + 48.5 * sc, y * sc, 3 * sc, 4.65 * sc, "#e8590c"); rect(ctx, ox + 48.5 * sc, (y + 7.85) * sc, 3 * sc, 4.65 * sc, "#e8590c"); }
    for (let k = 0; k < p.pumps; k++) { const y = (k / Math.max(1, p.pumps)) * 46 + 4; rect(ctx, ox + 47.5 * sc, y * sc, 5 * sc, 3 * sc, C.purple, null, 3); }
    for (const q of s.parts) circle(ctx, ox + q.x * sc, q.y * sc, sc * 0.9, C.blue);
    text(ctx, "outside", ox + 6, 16, { size: 12, weight: 600 }); text(ctx, "inside the cell", ox + 100 * sc - 6, 16, { size: 12, weight: 600, align: "right" });
    if (p.pumps) text(ctx, "purple = protein pumps (use ATP)", ox + 6, 50 * sc - 6, { size: 11, color: C.purple });
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { xmin: 0, xmax: Math.max(30, s.t), ymin: 0, ymax: p.out + 10, xlabel: "time (s)", ylabel: "inside", series: [{ data: s.hist, color: C.orange }], hlines: [{ y: (p.out + 10) / 2, color: C.gray, label: "equal both sides" }] });
  },
  read(s, p) { const i = s.parts.filter((q) => q.side === 1).length, o = s.parts.length - i; return { inside: String(i), outside: String(o), net: p.pumps ? "into the cell (active transport)" : Math.abs(i - o) < 5 ? "none (balanced)" : o > i ? "into the cell (diffusion)" : "out of the cell (diffusion)" }; },
  keyIdea: "<b>Key idea:</b> diffusion is passive: net movement from high to low concentration until both sides are equal. Active transport moves substances from low to high concentration and needs energy (ATP) from respiration.",
  tryThis: ["With no pumps, does diffusion ever push the inside concentration above the outside? Why not?", "Add pumps. What happens to the concentration inside?", "Raise the temperature. Does diffusion speed up?"],
});
