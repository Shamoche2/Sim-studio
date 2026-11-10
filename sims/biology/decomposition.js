const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Decomposition and Decay",
  intro: "Bacteria and fungi break down dead material, releasing carbon dioxide and nutrients back into the environment. Decay is fastest when it's warm, moist and there's plenty of oxygen: perfect compost conditions.",
  controls: [
    { id: "T", label: "Temperature", min: 0, max: 60, step: 5, value: 25, unit: "°C" },
    { id: "water", label: "Moisture", min: 0, max: 100, step: 10, value: 60, unit: "%" },
    { id: "o2", label: "Oxygen (turned compost)", type: "checkbox", value: true },
  ],
  readouts: [["rate", "Decay rate"], ["left", "Material left"], ["why", "Limiting factor"]],
  resetOnChange: true,
  rate(p) { const tf = p.T > 45 ? Math.max(0, 1 - (p.T - 45) / 15) : Math.pow(2, (p.T - 35) / 10); const wf = Math.sin(Math.min(1, p.water / 70) * Math.PI / 2) * (p.water > 90 ? 0.6 : 1); return tf * wf * (p.o2 ? 1 : 0.25); },
  init(s) { s.t = 0; s.m = 100; s.hist = [[0, 100]]; },
  step(s, p, dt) { s.t += dt * 3; s.m *= Math.exp(-0.03 * this.rate(p) * dt * 3); if (s.t - s.hist.at(-1)[0] > 0.5) s.hist.push([s.t, s.m]); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.38, cx = left / 2, base = H - 30;
    rect(ctx, cx - 70, base - 150, 140, 150, null, "#8d6e63", 4, 3);
    const h = (s.m / 100) * 130; rect(ctx, cx - 66, base - 4 - h, 132, h, "#8f6b3e");
    let seed = 2; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 14; i++) { const x = cx - 60 + rnd() * 120, y = base - 8 - rnd() * h; ctx.fillStyle = ["#40c057", "#fab005", "#e8590c"][i % 3]; ctx.beginPath(); ctx.ellipse(x, y, 7 * (s.m / 100) + 2, 3, rnd() * 3, 0, Math.PI * 2); ctx.fill(); }
    const microbes = Math.round(this.rate(p) * 30); for (let i = 0; i < microbes; i++) circle(ctx, cx - 60 + rnd() * 120, base - 8 - rnd() * Math.max(10, h), 2, "#f8f9fa", "#495057", 0.8);
    if (this.rate(p) > 0.2) for (let i = 0; i < 5; i++) text(ctx, "CO₂", cx - 50 + i * 24, base - h - 20 - ((s.t * 10 + i * 11) % 40), { size: 10, color: C.gray });
    text(ctx, "compost heap", cx, base + 18, { align: "center", size: 11 });
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Dead material remaining", xmin: 0, xmax: Math.max(60, s.t), ymin: 0, ymax: 105, xlabel: "days", ylabel: "% remaining", series: [{ data: s.hist, color: "#8f6b3e" }] });
  },
  read(s, p) { const r = this.rate(p); return { rate: (r * 100).toFixed(0) + "% of maximum", left: s.m.toFixed(0) + "%", why: !p.o2 ? "oxygen" : p.water < 40 ? "too dry" : p.water > 90 ? "waterlogged" : p.T < 20 ? "too cold" : p.T > 45 ? "too hot: microbes' enzymes denature" : "conditions near ideal" }; },
  keyIdea: "<b>Key idea:</b> decomposers (bacteria, fungi) release enzymes that digest dead matter, then respire, returning CO₂ to the air and minerals to the soil. They need warmth, water and oxygen. Food is preserved by removing one of these (fridges, drying, vacuum packing).",
  tryThis: ["Find the best conditions for fast composting.", "Why does food last longer in a fridge?", "Why do gardeners turn their compost heaps?"],
});
