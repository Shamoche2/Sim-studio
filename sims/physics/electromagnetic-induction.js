const { C, text, rect, circle, line, plot } = Sim;
Sim({
  title: "Electromagnetic Induction",
  intro: "Move a magnet in and out of a coil and a current flows. A changing magnetic field induces a voltage. The faster the magnet moves, the bigger the voltage. This is how generators make electricity.",
  controls: [
    { id: "speed", label: "Magnet speed", min: 0, max: 3, step: 0.1, value: 1, digits: 1, unit: "×" },
    { id: "N", label: "Turns on the coil", min: 10, max: 100, step: 10, value: 50 },
    { id: "B", label: "Magnet strength", min: 1, max: 5, step: 1, value: 3 },
  ],
  readouts: [["V", "Induced voltage now"], ["peak", "Peak voltage"]],
  init(s) { s.t = 0; s.ph = 0; s.x = 0; s.hist = []; s.peak = 0; },
  flux(x, p) { return p.B / (1 + (x * 3) ** 2); },
  substeps: 4,
  step(s, p, dt) {
    s.t += dt;
    const xOld = s.x; s.ph += dt * p.speed * 1.4; s.x = 1.2 * Math.sin(s.ph);
    const V = -p.N * (this.flux(s.x, p) - this.flux(xOld, p)) / (dt || 1) * 0.012;
    s.V = V; s.peak = Math.max(s.peak * (1 - dt * 0.2), Math.abs(V));
    if (!s.hist.length || s.t - s.hist.at(-1)[0] > 0.02) s.hist.push([s.t, V]); if (s.hist.length > 500) s.hist.shift();
  },
  change(s) { s.peak = 0; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const top = H * 0.5, cx = W * 0.55, cy = top / 2;
    for (let i = 0; i < Math.min(20, p.N / 5); i++) { ctx.strokeStyle = "#e8590c"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(cx - 50 + i * 5, cy, 6, 34, 0, 0, Math.PI * 2); ctx.stroke(); }
    const mx = cx + s.x * W * 0.25 - 150;
    rect(ctx, mx, cy - 12, 50, 24, C.red, C.text, 2, 1.5); rect(ctx, mx + 50, cy - 12, 50, 24, C.blue, C.text, 2, 1.5);
    text(ctx, "N", mx + 25, cy + 5, { align: "center", color: "#fff", weight: 700 }); text(ctx, "S", mx + 75, cy + 5, { align: "center", color: "#fff", weight: 700 });
    // meter
    const gx = W * 0.85, gy = cy + 10;
    line(ctx, cx + 50, cy + 30, gx, gy + 20, C.text, 1.5); line(ctx, cx - 50, cy + 30, gx - 20, gy + 40, C.text, 1.5);
    circle(ctx, gx, gy, 34, "#fff", C.text, 2);
    const needle = Sim.clamp((s.V || 0) / 4, -1.2, 1.2);
    line(ctx, gx, gy + 14, gx + Math.sin(needle) * 28, gy + 14 - Math.cos(needle) * 28, C.red, 2.5);
    text(ctx, "0", gx, gy - 22, { align: "center", size: 10 }); text(ctx, "−", gx - 26, gy - 8, { size: 12 }); text(ctx, "+", gx + 20, gy - 8, { size: 12 });
    const t0 = Math.max(0, s.t - 8);
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { title: "Induced voltage over time", xmin: t0, xmax: t0 + 8, ymin: -6, ymax: 6, xlabel: "time (s)", ylabel: "voltage", series: [{ data: s.hist, color: C.purple }], hlines: [{ y: 0, color: "#dee2e6" }] });
  },
  read(s) { return { V: (s.V || 0).toFixed(2) + " V", peak: s.peak.toFixed(2) + " V" }; },
  keyIdea: "<b>Key idea:</b> a voltage is induced when the magnetic field through a coil changes. It's bigger with faster movement, a stronger magnet, or more turns. Reversing the motion reverses the current.",
  tryThis: ["Stop the magnet (speed 0). Is any voltage induced, even with the magnet inside the coil?", "Double the speed. What happens to the peak voltage?", "Why does the voltage change direction as the magnet moves in and then out?"],
  note: "Voltages are in illustrative units.",
});
