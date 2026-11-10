const { C, text, rect, plot } = Sim;
Sim({
  title: "The Haber Process: Making Ammonia",
  intro: "Ammonia for fertilisers is made from nitrogen and hydrogen: N₂ + 3H₂ ⇌ 2NH₃, an exothermic, reversible reaction. Choose the temperature and pressure: high yield and a fast rate pull in different directions, so industry has to compromise.",
  controls: [
    { id: "T", label: "Temperature", min: 200, max: 700, step: 10, value: 450, unit: "°C" },
    { id: "P", label: "Pressure", min: 50, max: 400, step: 10, value: 200, unit: "atm" },
    { id: "cat", label: "Iron catalyst", type: "checkbox", value: true },
  ],
  readouts: [["yield", "Equilibrium yield of NH₃"], ["rate", "Rate (how fast equilibrium is reached)"], ["output", "Ammonia made per hour"], ["cost", "Plant cost and safety"]],
  yieldAt(T, P) { const Kp = Math.exp(-28.84 + 12300 / (T + 273)), r = Math.sqrt(Kp * P * P); return Sim.clamp((100 * r) / (1 + r), 0, 98); }, // calibrated: ~35% at 450 °C, 200 atm
  rate(p) { return Math.exp((p.T - 450) / 70) * (p.P / 200) * (p.cat ? 1 : 0.05); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const temps = [300, 400, 500, 600], cols = [C.blue, C.green, C.orange, C.red];
    plot(ctx, { x: 0, y: 0, w: W * 0.62, h: H }, { title: "Equilibrium yield vs pressure", xmin: 50, xmax: 400, ymin: 0, ymax: 100, xlabel: "pressure (atm)", ylabel: "% ammonia", series: temps.map((T, i) => ({ data: Array.from({ length: 36 }, (_, k) => [50 + k * 10, this.yieldAt(T, 50 + k * 10)]), color: cols[i], width: 2, label: T + " °C" })), marks: [{ x: p.P, y: this.yieldAt(p.T, p.P), color: C.text }] });
    const r = Math.min(3, this.rate(p)), y = this.yieldAt(p.T, p.P);
    Sim.bars(ctx, { x: W * 0.64, y: 6, w: W * 0.34, h: H - 12 }, [{ label: "Yield", value: y, color: C.purple }, { label: "Rate", value: r * 33, color: C.orange }, { label: "Output", value: Math.min(100, (y * r) / 1.2), color: C.green }], { max: 100, title: "Compare (relative)", fmt: (v) => v.toFixed(0) });
  },
  read(s, p) {
    const y = this.yieldAt(p.T, p.P), r = this.rate(p);
    return { yield: y.toFixed(0) + "%", rate: r < 0.3 ? "very slow" : r < 0.8 ? "slow" : r < 2 ? "good" : "fast", output: ((y * r) / 1.2).toFixed(0) + " (relative)", cost: p.P > 300 ? "very expensive, more dangerous" : p.P > 150 ? "moderate" : "cheap" };
  },
  keyIdea: "<b>Key idea:</b> lower temperature gives a higher yield (the forward reaction is exothermic) but a slower rate. Higher pressure gives a higher yield (4 gas molecules → 2) but costs more. The compromise is about 450 °C, 200 atm, with an iron catalyst.",
  tryThis: ["Set 250 °C. Is the yield high? Look at the output. Why isn't this used?", "Remove the catalyst. Does the yield change? Does the output?", "Why don't companies use 1000 atm to get a very high yield?"],
  note: "A simplified model for teaching; numbers are approximate. Unreacted gases are recycled in a real plant.",
});
