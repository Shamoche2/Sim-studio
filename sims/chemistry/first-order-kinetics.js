const { C, plot } = Sim;
Sim({
  title: "Reaction Order and Rate Graphs",
  intro: "How does a reaction's rate depend on concentration? For a zero-order reaction it doesn't; for first order it's proportional; for second order it depends on the square. The shapes of concentration–time graphs reveal the order.",
  controls: [
    { id: "order", label: "Order of reaction", type: "select", options: [[0, "Zero order"], [1, "First order"], [2, "Second order"]], value: 1 },
    { id: "k", label: "Rate constant k", min: 0.05, max: 0.5, step: 0.01, value: 0.1, digits: 2 },
    { id: "c0", label: "Starting concentration", min: 0.5, max: 2, step: 0.1, value: 1, unit: "mol/L", digits: 1 },
  ],
  readouts: [["t", "Time"], ["c", "Concentration"], ["rate", "Rate now"], ["half", "Half-life"]],
  resetOnChange: true,
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(60, s.t + dt * 4); },
  c(p, t) { if (p.order === 0) return Math.max(0, p.c0 - p.k * 0.1 * t * 2); if (p.order === 1) return p.c0 * Math.exp(-p.k * t); return 1 / (1 / p.c0 + p.k * t); },
  rate(p, c) { return p.order === 0 ? (c > 0 ? p.k * 0.2 : 0) : p.order === 1 ? p.k * c : p.k * c * c; },
  draw({ ctx, W, H }, s, p) {
    const pts = []; for (let t = 0; t <= s.t + 1e-9; t += 0.5) pts.push([t, this.c(p, t)]);
    const half = (W - 10) / 2, cs = Array.from({ length: 41 }, (_, i) => (i / 40) * 2.1);
    plot(ctx, { x: 0, y: 0, w: half, h: H }, { title: "Concentration vs time", xmin: 0, xmax: 60, ymin: 0, ymax: 2.1, xlabel: "time (s)", ylabel: "concentration (mol/L)", series: [{ data: pts, color: C.blue }], hlines: [{ y: p.c0 / 2, color: "#ced4da", label: "half" }] });
    plot(ctx, { x: half + 10, y: 0, w: half, h: H }, { title: "Rate vs concentration", xmin: 0, xmax: 2.1, ymin: 0, ymax: Math.max(0.2, this.rate(p, 2.1)) * 1.1, xlabel: "concentration (mol/L)", ylabel: "rate", series: [{ data: cs.map((c) => [c, this.rate(p, c)]), color: C.orange }], marks: [{ x: this.c(p, s.t), y: this.rate(p, this.c(p, s.t)), color: C.red }] });
  },
  read(s, p) {
    const c = this.c(p, s.t), hl = p.order === 0 ? p.c0 / 2 / (p.k * 0.2) : p.order === 1 ? Math.log(2) / p.k : 1 / (p.k * p.c0);
    return { t: s.t.toFixed(1) + " s", c: c.toFixed(3) + " mol/L", rate: this.rate(p, c).toFixed(4) + " mol/L/s", half: hl.toFixed(1) + " s" + (p.order === 1 ? " (constant)" : " (changes)") };
  },
  keyIdea: "<b>Key idea:</b> zero order: straight-line fall, rate constant. First order: the half-life is constant, the hallmark of first order (like radioactive decay). Second order: each half-life is longer than the last.",
  tryThis: ["For first order, measure two successive half-lives from the graph. Are they equal?", "Change the starting concentration. Does the first-order half-life change? The second-order one?", "What does the rate–concentration graph look like for each order?"],
});
