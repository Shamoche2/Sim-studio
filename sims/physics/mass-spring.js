const { C, circle, line, text, rect, plot } = Sim;
Sim({
  title: "Mass on a Spring (Simple Harmonic Motion)",
  intro: "Pull the mass and let it go. The spring pulls it back, it overshoots, and it oscillates. Watch how energy swaps between kinetic and elastic potential energy.",
  controls: [
    { id: "k", label: "Spring constant k", min: 5, max: 100, step: 1, value: 20, unit: "N/m" },
    { id: "m", label: "Mass", min: 0.2, max: 5, step: 0.1, value: 1, unit: "kg", digits: 1 },
    { id: "A", label: "Starting stretch", min: 0.05, max: 0.5, step: 0.01, value: 0.3, unit: "m", digits: 2 },
    { id: "b", label: "Damping (friction)", min: 0, max: 2, step: 0.05, value: 0, unit: "kg/s", digits: 2 },
  ],
  readouts: [["x", "Displacement"], ["T", "Period"], ["KE", "Kinetic energy"], ["PE", "Spring energy"]],
  resetOnChange: true,
  init(s, p) { s.x = p.A; s.v = 0; s.t = 0; s.hist = []; },
  substeps: 10,
  step(s, p, dt) {
    s.v += ((-p.k * s.x - p.b * s.v) / p.m) * dt; s.x += s.v * dt; s.t += dt;
    if (!s.hist.length || s.t - s.hist.at(-1)[0] > 0.02) s.hist.push([s.t, s.x]);
    if (s.hist.length > 700) s.hist.shift();
  },
  draw({ ctx, W, H }, s, p) {
    const top = H * 0.42, cy = top / 2 + 10, wallX = 30, eq = W * 0.5, scale = (W * 0.38) / 0.55;
    const mx = eq + s.x * scale, bw = 30 + Math.sqrt(p.m) * 14;
    rect(ctx, 0, 0, W, top, C.light);
    rect(ctx, wallX - 14, cy - 50, 14, 100, C.brown);
    line(ctx, 0, cy + bw / 2 + 2, W, cy + bw / 2 + 2, C.gray, 2);
    // zig-zag spring
    ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wallX, cy);
    const coils = 14, end = mx - bw / 2;
    for (let i = 1; i <= coils; i++) ctx.lineTo(wallX + ((end - wallX) * i) / (coils + 1), cy + (i % 2 ? -12 : 12));
    ctx.lineTo(end, cy); ctx.stroke();
    rect(ctx, mx - bw / 2, cy - bw / 2, bw, bw, C.blue, "#1c3f8f", 6);
    line(ctx, eq, cy - 50, eq, cy + 50, C.green, 1.5, [5, 4]);
    text(ctx, "equilibrium", eq, cy - 54, { color: C.green, align: "center", size: 12 });
    const KE = 0.5 * p.m * s.v ** 2, PE = 0.5 * p.k * s.x ** 2, E0 = 0.5 * p.k * p.A ** 2;
    // energy bars
    const bx = W - 130;
    [["KE", KE, C.orange], ["PE", PE, C.purple]].forEach(([l, v, c], i) => {
      const h = (v / E0) * (top - 50);
      rect(ctx, bx + i * 50, top - 20 - h, 34, h, c, null, 4);
      text(ctx, l, bx + i * 50 + 17, top - 6, { align: "center", size: 12, color: C.muted });
    });
    const t0 = Math.max(0, s.t - 8);
    plot(ctx, { x: 0, y: top + 6, w: W, h: H - top - 6 }, { title: "Displacement over time", xmin: t0, xmax: t0 + 8, ymin: -0.55, ymax: 0.55, xlabel: "time (s)", ylabel: "x (m)", series: [{ data: s.hist, color: C.blue }] });
  },
  read(s, p) {
    return { x: s.x.toFixed(3) + " m", T: (2 * Math.PI * Math.sqrt(p.m / p.k)).toFixed(2) + " s", KE: (0.5 * p.m * s.v ** 2).toFixed(2) + " J", PE: (0.5 * p.k * s.x ** 2).toFixed(2) + " J" };
  },
  keyIdea: "<b>Key idea:</b> the spring force is F = −kx (Hooke's law). The period is T = 2π√(m/k): heavier masses swing slower, stiffer springs faster. The amplitude doesn't change the period.",
  tryThis: ["Double the starting stretch. Does the period change?", "Make the mass 4× bigger. By how much does the period grow?", "Add damping. Where does the energy go?"],
});
