const { C, plot } = Sim;
Sim({
  title: "Population Growth",
  intro: "With unlimited food and space, a population grows faster and faster (exponential growth). In the real world, resources run out and growth levels off at the carrying capacity (logistic growth).",
  controls: [
    { id: "r", label: "Growth rate per generation", min: 0.05, max: 1, step: 0.05, value: 0.4, digits: 2 },
    { id: "K", label: "Carrying capacity", min: 100, max: 1000, step: 50, value: 500 },
    { id: "N0", label: "Starting population", min: 2, max: 100, step: 1, value: 10 },
    { id: "model", label: "Model", type: "select", options: [["both", "Show both"], ["exp", "Exponential only"], ["log", "Logistic only"]] },
  ],
  readouts: [["t", "Generation"], ["exp", "Exponential population"], ["log", "Logistic population"], ["dbl", "Doubling time (early)"]],
  resetOnChange: true,
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(40, s.t + dt * 2.5); },
  calc(p, t) { const e = p.N0 * Math.exp(p.r * t), l = p.K / (1 + ((p.K - p.N0) / p.N0) * Math.exp(-p.r * t)); return { e, l }; },
  draw({ ctx, W, H }, s, p) {
    const pts = (f) => { const out = []; for (let t = 0; t <= s.t + 1e-9; t += 0.2) out.push([t, f(t)]); return out; };
    const series = [];
    if (p.model !== "log") series.push({ data: pts((t) => this.calc(p, t).e), color: C.red, label: "exponential (J-curve)" });
    if (p.model !== "exp") series.push({ data: pts((t) => this.calc(p, t).l), color: C.blue, label: "logistic (S-curve)" });
    plot(ctx, { x: 0, y: 0, w: W, h: H }, { title: "Population size", xmin: 0, xmax: 40, ymin: 0, ymax: p.K * 1.5, xlabel: "generations", ylabel: "population", series, hlines: p.model !== "exp" ? [{ y: p.K, color: C.green, label: "carrying capacity" }] : [] });
  },
  read(s, p) { const { e, l } = this.calc(p, s.t); return { t: s.t.toFixed(1), exp: e > 1e6 ? e.toExponential(2) : e.toFixed(0), log: l.toFixed(0), dbl: (Math.log(2) / p.r).toFixed(1) + " generations" }; },
  keyIdea: "<b>Key idea:</b> exponential: dN/dt = rN. Logistic: dN/dt = rN(1 − N/K). Growth is fastest at half the carrying capacity, then slows as food, space and other resources run short.",
  tryThis: ["Watch both curves. When do they start to separate?", "Double the growth rate. Does the population reach the same final size?", "What limits the carrying capacity for animals in a real habitat?"],
});
