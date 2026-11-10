const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Controlling Body Temperature",
  intro: "Your body works best at about 37 °C. The hypothalamus in the brain detects changes and triggers responses: sweating and widening skin blood vessels to cool down, shivering and narrowing them to warm up.",
  controls: [
    { id: "air", label: "Air temperature", min: -10, max: 45, step: 1, value: 20, unit: "°C" },
    { id: "ex", label: "Exercise", min: 0, max: 100, step: 10, value: 0, unit: "%" },
  ],
  readouts: [["core", "Core temperature"], ["resp", "Response"], ["skin", "Skin blood vessels"]],
  init(s) { s.T = 37; s.t = 0; s.hist = []; },
  step(s, p, dt) {
    const h = dt * 2; s.t += h; const err = s.T - 37;
    s.sweat = Math.max(0, err * 3); s.shiver = Math.max(0, -err * 3); s.vaso = Sim.clamp(err * 2, -1, 1);
    const heatIn = 0.1 + p.ex * 0.012 + s.shiver * 0.3, loss = (s.T - p.air) * (0.012 + Math.max(0, s.vaso) * 0.012 - Math.max(0, -s.vaso) * 0.006) + s.sweat * 0.25;
    s.T += (heatIn - loss) * h * 0.4;
    if (!s.hist.length || s.t - s.hist.at(-1)[0] > 0.2) s.hist.push([s.t, s.T]); if (s.hist.length > 300) s.hist.shift();
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, `hsl(${210 - (p.air + 10) * 3.3},60%,92%)`);
    const left = W * 0.38, cx = left / 2 + (s.shiver > 0.2 ? Math.sin(s.t * 60) * 2 : 0), cy = H * 0.42;
    ctx.fillStyle = `hsl(${20 + (s.vaso || 0) * -10},${60 + (s.vaso || 0) * 30}%,${72 - (s.vaso || 0) * 8}%)`;
    circle(ctx, cx, cy - 70, 26, ctx.fillStyle); rect(ctx, cx - 30, cy - 42, 60, 110, ctx.fillStyle, null, 20);
    rect(ctx, cx - 52, cy - 36, 18, 80, ctx.fillStyle, null, 9); rect(ctx, cx + 34, cy - 36, 18, 80, ctx.fillStyle, null, 9);
    rect(ctx, cx - 26, cy + 64, 20, 70, ctx.fillStyle, null, 9); rect(ctx, cx + 6, cy + 64, 20, 70, ctx.fillStyle, null, 9);
    if (s.sweat > 0.2) for (let i = 0; i < Math.min(12, s.sweat * 6); i++) circle(ctx, cx - 40 + ((i * 29) % 80), cy - 60 + ((i * 41 + s.t * 30) % 140), 3, "#74c0fc");
    text(ctx, s.sweat > 0.2 ? "sweating" : s.shiver > 0.2 ? "shivering" : "", cx, H - 12, { align: "center", weight: 700, color: s.sweat > 0.2 ? C.blue : C.purple });
    const t0 = Math.max(0, s.t - 40);
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Core body temperature", xmin: t0, xmax: t0 + 40, ymin: 34, ymax: 40, xlabel: "time", ylabel: "°C", series: [{ data: s.hist, color: C.red }], hlines: [{ y: 37, color: C.green, label: "37 °C" }] });
  },
  read(s) { return { core: s.T.toFixed(2) + " °C", resp: s.sweat > 0.2 ? "sweating: evaporation cools the skin" : s.shiver > 0.2 ? "shivering: muscle contractions release heat" : "none needed", skin: (s.vaso || 0) > 0.2 ? "widened (vasodilation): more heat lost" : (s.vaso || 0) < -0.2 ? "narrowed (vasoconstriction): heat kept in" : "normal" }; },
  keyIdea: "<b>Key idea:</b> too hot: sweating and vasodilation (skin blood vessels widen, so more heat is lost by radiation). Too cold: shivering and vasoconstriction. This is negative feedback, controlled by the hypothalamus.",
  tryThis: ["Set the air to 40 °C. Which responses switch on?", "Set it to −5 °C. Why does the skin look paler?", "Exercise hard in hot weather. Can the body keep up? Why is drinking water important?"],
  note: "Simplified model.",
});
