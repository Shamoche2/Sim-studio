const { C, circle, line, text, arrow, plot } = Sim;
Sim({
  title: "Simple Pendulum",
  intro: "A mass swings on a string. Change the length, gravity and starting angle, and see what does (and doesn't) change the time for one swing.",
  controls: [
    { id: "L", label: "String length", min: 0.2, max: 3, step: 0.1, value: 1, unit: "m", digits: 1 },
    { id: "theta0", label: "Starting angle", min: 5, max: 80, step: 1, value: 20, unit: "°" },
    { id: "m", label: "Mass", min: 0.1, max: 5, step: 0.1, value: 1, unit: "kg", digits: 1 },
    { id: "g", label: "Gravity", type: "select", options: [[9.81, "Earth (9.81 m/s²)"], [1.62, "Moon (1.62 m/s²)"], [3.71, "Mars (3.71 m/s²)"], [24.79, "Jupiter (24.79 m/s²)"]] },
    { id: "damp", label: "Air resistance", type: "checkbox", value: false },
  ],
  readouts: [["t", "Time"], ["T", "Period (formula)"], ["Tm", "Period (measured)"], ["v", "Speed"]],
  resetOnChange: true,
  init(s, p) { s.th = (p.theta0 * Math.PI) / 180; s.w = 0; s.t = 0; s.hist = []; s.lastCross = null; s.Tm = null; },
  substeps: 10,
  step(s, p, dt) {
    const prev = s.th;
    const acc = -(p.g / p.L) * Math.sin(s.th) - (p.damp ? 0.3 * s.w : 0);
    s.w += acc * dt; s.th += s.w * dt; s.t += dt;
    if (prev < 0 && s.th >= 0) { if (s.lastCross != null) s.Tm = s.t - s.lastCross; s.lastCross = s.t; }
    if (!s.hist.length || s.t - s.hist[s.hist.length - 1][0] > 0.02) s.hist.push([s.t, (s.th * 180) / Math.PI]);
    if (s.hist.length > 800) s.hist.shift();
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.45, px = left / 2, py = 24, scale = (H - 70) / 3.1;
    const bx = px + Math.sin(s.th) * p.L * scale, by = py + Math.cos(s.th) * p.L * scale;
    ctx.fillStyle = C.sky; ctx.fillRect(0, 0, left, H);
    line(ctx, px - 50, py, px + 50, py, C.brown, 6);
    line(ctx, px, py, px, py + p.L * scale, C.gray, 1, [4, 4]);
    line(ctx, px, py, bx, by, C.text, 2);
    const r = 8 + Math.cbrt(p.m) * 7;
    circle(ctx, bx, by, r, C.blue, "#1c3f8f", 2);
    arrow(ctx, bx, by, bx + s.w * p.L * 14 * Math.cos(s.th), by - s.w * p.L * 14 * Math.sin(s.th), C.orange, 2.5);
    text(ctx, `${((s.th * 180) / Math.PI).toFixed(1)}°`, px + 8, py + 40, { color: C.muted });
    const t0 = Math.max(0, s.t - 10);
    plot(ctx, { x: left + 10, y: 10, w: W - left - 20, h: H - 20 }, { title: "Angle over time", xmin: t0, xmax: t0 + 10, ymin: -85, ymax: 85, xlabel: "time (s)", ylabel: "angle (°)", series: [{ data: s.hist, color: C.blue }] });
  },
  read(s, p) {
    const T = 2 * Math.PI * Math.sqrt(p.L / p.g);
    return { t: s.t.toFixed(1) + " s", T: T.toFixed(2) + " s", Tm: s.Tm ? s.Tm.toFixed(2) + " s" : "…", v: Math.abs(s.w * p.L).toFixed(2) + " m/s" };
  },
  keyIdea: "<b>Key idea:</b> for small angles the period is T = 2π√(L/g). It depends on length and gravity, but <em>not</em> on the mass.",
  tryThis: ["Change the mass from 0.1 kg to 5 kg. Does the period change?", "Make the string 4 times longer. What happens to the period? Compare with the formula.", "Use a big starting angle (70°). Is the measured period still equal to the formula? Why not?"],
  note: "Simplified: point mass, light string. The formula is exact only for small angles.",
});
