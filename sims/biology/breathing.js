const { C, text, rect, plot } = Sim;
Sim({
  title: "Breathing and Lung Volumes",
  intro: "When the diaphragm contracts and moves down, the chest gets bigger, pressure inside falls and air rushes in. Change the breathing rate and depth to see how much air you move each minute.",
  controls: [
    { id: "rate", label: "Breathing rate", min: 6, max: 40, step: 1, value: 12, unit: "breaths/min" },
    { id: "tv", label: "Tidal volume (depth)", min: 0.3, max: 3, step: 0.1, value: 0.5, unit: "L", digits: 1 },
  ],
  readouts: [["mv", "Minute ventilation"], ["phase", "Phase"], ["lung", "Lung volume now"], ["state", "Activity"]],
  init(s) { s.t = 0; s.hist = []; },
  vol(s, p) { return 2.4 + p.tv * (0.5 - 0.5 * Math.cos((2 * Math.PI * s.t * p.rate) / 60)); },
  step(s, p, dt) { s.t += dt; s.hist.push([s.t, this.vol(s, p)]); if (s.hist.length > 900) s.hist.shift(); },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.42, v = this.vol(s, p), f = (v - 2.4) / 3;
    rect(ctx, 0, 0, left, H, "#fff");
    const cx = left / 2, top = 40, ribW = left * 0.38 + f * 30, dia = H * 0.72 + f * 40;
    // trachea and bronchi
    rect(ctx, cx - 8, 10, 16, top + 20, "#ffc9c9", C.text, 4, 1.2);
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(cx + sx * ribW * 0.55, (top + dia) / 2 + 10, ribW * 0.45 + f * 10, (dia - top) / 2 - 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(250,82,82,${0.35 + f * 0.3})`; ctx.fill(); ctx.strokeStyle = "#c92a2a"; ctx.lineWidth = 2; ctx.stroke();
    }
    // ribs
    ctx.strokeStyle = "#adb5bd"; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(cx, top + 40 + i * 30, ribW * 1.15, 18, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
    // diaphragm
    ctx.beginPath(); ctx.moveTo(cx - ribW * 1.2, dia + 30); ctx.quadraticCurveTo(cx, dia - 30 + f * 50, cx + ribW * 1.2, dia + 30); ctx.strokeStyle = C.brown; ctx.lineWidth = 6; ctx.stroke();
    text(ctx, "diaphragm", cx, H - 8, { align: "center", size: 12, color: C.brown });
    const inhale = Math.sin((2 * Math.PI * s.t * p.rate) / 60) > 0;
    text(ctx, inhale ? "air in ↓" : "air out ↑", cx + 14, 30, { weight: 700, color: inhale ? C.blue : C.gray });
    const t0 = Math.max(0, s.t - 20);
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: "Spirometer trace", xmin: t0, xmax: t0 + 20, ymin: 0, ymax: 6, xlabel: "time (s)", ylabel: "lung volume (L)", series: [{ data: s.hist, color: C.blue }], hlines: [{ y: 2.4, color: "#ced4da", label: "after normal breath out" }] });
  },
  read(s, p) { const inhale = Math.sin((2 * Math.PI * s.t * p.rate) / 60) > 0, mv = p.rate * p.tv; return { mv: mv.toFixed(1) + " L/min", phase: inhale ? "breathing in" : "breathing out", lung: this.vol(s, p).toFixed(2) + " L", state: mv < 10 ? "resting" : mv < 40 ? "light exercise" : "hard exercise" }; },
  keyIdea: "<b>Key idea:</b> minute ventilation = breathing rate × tidal volume. Breathing in: diaphragm contracts and flattens, ribs move up and out, volume increases, pressure falls, air flows in.",
  tryThis: ["Calculate the minute ventilation at rest (12 breaths/min × 0.5 L).", "During exercise, which increases more: rate or depth? Try both.", "Why does the lung volume never drop to zero?"],
});
