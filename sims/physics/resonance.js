const { C, text, rect, circle, line, plot } = Sim;
Sim({
  title: "Forced Oscillations and Resonance",
  intro: "Push a swing at just the right rhythm and it goes higher and higher. When the driving frequency matches an object's natural frequency, the amplitude becomes very large. This is resonance.",
  controls: [
    { id: "fd", label: "Driving frequency", min: 0.2, max: 2, step: 0.02, value: 0.6, unit: "Hz", digits: 2 },
    { id: "f0", label: "Natural frequency", min: 0.4, max: 1.6, step: 0.05, value: 1, unit: "Hz", digits: 2 },
    { id: "damp", label: "Damping", min: 0.05, max: 1, step: 0.05, value: 0.15, digits: 2 },
  ],
  readouts: [["amp", "Amplitude now"], ["ratio", "Driving ÷ natural"], ["state", "Status"]],
  init(s) { s.x = 0; s.v = 0; s.t = 0; s.ampHist = []; s.maxRecent = 0; },
  change(s) { s.maxRecent = 0; },
  substeps: 20,
  step(s, p, dt) {
    const w0 = 2 * Math.PI * p.f0, wd = 2 * Math.PI * p.fd, F = Math.cos(wd * s.t) * 3;
    s.v += (F - w0 * w0 * s.x - 2 * p.damp * s.v) * dt; s.x += s.v * dt; s.t += dt;
    s.maxRecent = Math.max(Math.abs(s.x), s.maxRecent * (1 - dt * 0.3));
  },
  steady(p, fd) { const w0 = 2 * Math.PI * p.f0, wd = 2 * Math.PI * fd; return 3 / Math.sqrt((w0 * w0 - wd * wd) ** 2 + (2 * p.damp * wd) ** 2); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.35, cx = left / 2, top = 30, L = H * 0.55;
    const drive = 12 * Math.cos(2 * Math.PI * p.fd * s.t);
    rect(ctx, cx - 50 + drive, top - 16, 100, 12, C.gray, null, 3);
    text(ctx, "driver", cx + drive, top - 22, { align: "center", size: 11, color: C.muted });
    const ang = Sim.clamp(s.x * 0.5, -1.3, 1.3), bx = cx + drive + Math.sin(ang) * L, by = top + Math.cos(ang) * L;
    line(ctx, cx + drive, top - 4, bx, by, C.text, 2);
    circle(ctx, bx, by, 16, C.blue, "#1c3f8f", 2);
    const curve = Array.from({ length: 181 }, (_, i) => { const f = 0.2 + i * 0.01; return [f, this.steady(p, f)]; });
    const ymax = Math.max(...curve.map((c) => c[1])) * 1.1;
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Steady amplitude vs driving frequency", xmin: 0.2, xmax: 2, ymin: 0, ymax, ystep: ymax * 2, xlabel: "driving frequency (Hz)", ylabel: "amplitude", series: [{ data: curve, color: C.red }], vlines: [{ x: p.f0, color: C.green, label: "natural frequency" }], marks: [{ x: p.fd, y: this.steady(p, p.fd), color: C.blue }] });
  },
  read(s, p) { const r = p.fd / p.f0; return { amp: s.maxRecent.toFixed(2), ratio: r.toFixed(2), state: Math.abs(r - 1) < 0.06 ? "resonance!" : r < 1 ? "below resonance" : "above resonance" }; },
  keyIdea: "<b>Key idea:</b> resonance occurs when driving frequency = natural frequency. More damping makes the peak lower and wider. Resonance can be useful (musical instruments, radio tuning) or dangerous (bridges, buildings in earthquakes).",
  tryThis: ["Slowly increase the driving frequency. At what value does the amplitude peak?", "Increase the damping. What happens to the height and width of the peak?", "Why do soldiers break step when marching across a bridge?"],
});
