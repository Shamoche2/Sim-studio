const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Surface Area and Rate of Reaction",
  intro: "Marble chips (calcium carbonate) react with hydrochloric acid, giving off carbon dioxide. Crush the same mass of marble into smaller pieces and there's more surface for acid particles to hit, so it reacts faster.",
  controls: [
    { id: "size", label: "Marble pieces", type: "select", options: [[1, "Large chips"], [3, "Small chips"], [10, "Powder"]] },
    { id: "T", label: "Acid temperature", min: 10, max: 60, step: 5, value: 20, unit: "°C" },
  ],
  readouts: [["co2", "CO₂ collected"], ["rate", "Initial rate"], ["left", "Marble left"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.ext = 0; s.hist = [[0, 0]]; s.bub = []; },
  k(p) { return 0.015 * p.size * Math.pow(2, (p.T - 20) / 10); },
  step(s, p, dt) {
    s.t += dt; const k = this.k(p); s.ext = 1 - Math.exp(-k * s.t * 4);
    if (s.t - s.hist.at(-1)[0] > 0.2) s.hist.push([s.t * 4, s.ext * 120]);
    if (Math.random() < (1 - s.ext) * k * 60 * dt) s.bub.push({ x: Math.random(), y: 0 });
    for (const b of s.bub) b.y += dt * 0.8; s.bub = s.bub.filter((b) => b.y < 1);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.38, fx = left * 0.15, fw = left * 0.55, top = H * 0.3, bot = H - 30;
    rect(ctx, fx, top, fw, bot - top, "rgba(116,192,252,.25)", C.text, 8, 2);
    const n = Math.round(Math.max(0, 1 - s.ext) * (p.size === 10 ? 80 : p.size === 3 ? 18 : 5)), r = p.size === 10 ? 3 : p.size === 3 ? 7 : 13;
    for (let i = 0; i < n; i++) circle(ctx, fx + 14 + ((i * 23) % (fw - 28)), bot - r - 4 - Math.floor((i * 23) / (fw - 28)) * r * 1.6, r, "#f1f3f5", "#adb5bd", 1.2);
    for (const b of s.bub) circle(ctx, fx + 10 + b.x * (fw - 20), bot - 20 - b.y * (bot - top - 30), 3, "#fff", C.gray, 1);
    // gas syringe
    rect(ctx, fx + fw + 6, top - 40, 10, 40, "#dee2e6"); rect(ctx, fx + fw + 6, top - 52, left - fx - fw - 10, 22, "#fff", C.text, 3, 1.5);
    rect(ctx, fx + fw + 8, top - 49, (left - fx - fw - 14) * s.ext, 16, "rgba(173,181,189,.5)");
    text(ctx, "gas syringe", fx + fw + 8, top - 58, { size: 11, color: C.muted });
    const series = [[1, C.orange, "large"], [3, C.blue, "small"], [10, C.purple, "powder"]].map(([sz, col, lab]) => ({ data: +p.size === sz ? s.hist : [], color: col, label: +p.size === sz ? lab : undefined }));
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Volume of CO₂", xmin: 0, xmax: 300, ymin: 0, ymax: 130, xlabel: "time (s)", ylabel: "CO₂ (cm³)", series, hlines: [{ y: 120, color: C.gray, label: "maximum (all marble used)" }] });
  },
  read(s, p) { return { co2: (s.ext * 120).toFixed(0) + " cm³", rate: (120 * this.k(p) * 4 * 60 / 60).toFixed(1) + " cm³/s", left: ((1 - s.ext) * 100).toFixed(0) + "%" }; },
  keyIdea: "<b>Key idea:</b> CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂. Smaller pieces have a larger surface area, so more frequent collisions and a faster rate. The final volume of gas is the same because the same mass of marble was used.",
  tryThis: ["Compare large chips and powder. Which curve is steeper at the start?", "Why do all the curves end at the same volume?", "Why is flour dust in a factory an explosion risk, but a bag of flour isn't?"],
  note: "Time sped up 4×. Acid is in excess.",
});
