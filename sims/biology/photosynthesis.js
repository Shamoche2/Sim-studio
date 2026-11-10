const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Photosynthesis: Limiting Factors",
  intro: "Pondweed makes oxygen bubbles as it photosynthesises. The rate depends on light intensity, carbon dioxide and temperature. Whichever factor is in shortest supply limits the rate.",
  controls: [
    { id: "light", label: "Light intensity", min: 0, max: 100, step: 1, value: 50, unit: "%" },
    { id: "co2", label: "Carbon dioxide", min: 0, max: 0.2, step: 0.005, value: 0.04, unit: "%", digits: 3 },
    { id: "T", label: "Temperature", min: 0, max: 50, step: 1, value: 25, unit: "°C" },
  ],
  readouts: [["rate", "Bubbles per minute"], ["limit", "Limiting factor"]],
  rate(p) {
    const L = p.light / (p.light + 30), K = p.co2 / (p.co2 + 0.04), Tf = Math.max(0, Math.exp(-((p.T - 30) ** 2) / 120) - (p.T > 40 ? (p.T - 40) * 0.08 : 0));
    return { r: 120 * Math.min(L * 1.3, K * 1.3, Tf), L: L * 1.3, K: K * 1.3, Tf };
  },
  init(s) { s.bubbles = []; s.acc = 0; },
  step(s, p, dt) {
    const { r } = this.rate(p); s.acc += (r / 60) * dt * 3;
    while (s.acc > 1) { s.acc--; s.bubbles.push({ x: Sim.rand(-6, 6), y: 0 }); }
    for (const b of s.bubbles) b.y += dt * 60;
    s.bubbles = s.bubbles.filter((b) => b.y < 400);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.42;
    rect(ctx, 0, 0, left, H, "#fff");
    // lamp
    const glow = p.light / 100;
    circle(ctx, 30, 40, 18, `rgba(255,212,59,${0.2 + glow * 0.8})`, C.text, 1.5);
    for (let i = 0; i < 5; i++) Sim.line(ctx, 52, 40, 52 + 40 * glow, 40 + (i - 2) * 12 * glow, `rgba(242,183,5,${glow})`, 2);
    // beaker
    const bx = left * 0.35, bw = left * 0.55, by = 30, bh = H - 50;
    rect(ctx, bx, by + 20, bw, bh - 20, "rgba(116,192,252,.25)", null);
    ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const px = bx + bw / 2, base = by + bh - 10;
    ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, base); ctx.bezierCurveTo(px - 20, base - 60, px + 20, base - 120, px, base - 170); ctx.stroke();
    for (let i = 0; i < 8; i++) { const y = base - 20 - i * 19; ctx.fillStyle = C.green; ctx.beginPath(); ctx.ellipse(px + (i % 2 ? 12 : -12), y, 12, 4, i % 2 ? -0.5 : 0.5, 0, Math.PI * 2); ctx.fill(); }
    for (const b of s.bubbles) { const y = base - 170 - b.y; if (y > by + 20) circle(ctx, px + b.x, y, 3.5, "#fff", C.blue, 1.2); }
    text(ctx, `${p.T} °C`, bx + bw - 6, by + 40, { align: "right", color: C.muted });
    // graph: rate vs light at current CO2 and T
    const series = [0.01, 0.04, 0.1].map((c, i) => ({ data: Array.from({ length: 51 }, (_, k) => [k * 2, this.rate({ ...p, light: k * 2, co2: c }).r]), color: [C.orange, C.blue, C.purple][i], width: c === p.co2 ? 3 : 1.5, label: `${c}% CO₂` }));
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: `Rate vs light (at ${p.T} °C)`, xmin: 0, xmax: 100, ymin: 0, ymax: 120, xlabel: "light intensity (%)", ylabel: "bubbles per minute", series, marks: [{ x: p.light, y: this.rate(p).r, color: C.red }] });
  },
  read(s, p) {
    const { r, L, K, Tf } = this.rate(p), m = Math.min(L, K, Tf);
    return { rate: r.toFixed(0), limit: m === L ? "light" : m === K ? "carbon dioxide" : "temperature" };
  },
  keyIdea: "<b>Key idea:</b> 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (using light energy). When a graph levels off, something other than the factor on the x-axis has become limiting.",
  tryThis: ["Increase the light from 0 to 100%. Where does the graph level off? What is limiting it there?", "Raise the CO₂ to 0.1%. Does the plateau go higher?", "What happens above 40 °C? Why? (Think about enzymes.)"],
  note: "Model values are illustrative.",
});
