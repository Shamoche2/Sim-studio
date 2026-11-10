const { C, text, rect } = Sim;
Sim({
  title: "Variation: Continuous and Discontinuous",
  intro: "Measure a class of students. Height varies continuously (any value in a range) and gives a bell-shaped curve. Blood group is discontinuous: there are only a few distinct categories. Generate a class and look at the shapes.",
  controls: [
    { id: "trait", label: "Trait measured", type: "select", options: [["height", "Height (continuous)"], ["hand", "Hand span (continuous)"], ["blood", "Blood group (discontinuous)"], ["tongue", "Tongue rolling (discontinuous)"]] },
    { id: "n", label: "Number of people", min: 20, max: 1000, step: 20, value: 100 },
  ],
  buttons: [{ label: "Measure a new group", primary: true, click(s, p) { s.seed = Math.random(); } }],
  readouts: [["type", "Type of variation"], ["mean", "Mean / most common"], ["cause", "Caused by"]],
  init(s) { s.seed = 0.3; },
  data(s, p) {
    let seed = Math.floor(s.seed * 1e6) + 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647), randn = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
    if (p.trait === "height") return Array.from({ length: p.n }, () => 160 + randn() * 8);
    if (p.trait === "hand") return Array.from({ length: p.n }, () => 19 + randn() * 1.6);
    if (p.trait === "blood") return Array.from({ length: p.n }, () => { const r = rnd(); return r < 0.44 ? "O" : r < 0.86 ? "A" : r < 0.96 ? "B" : "AB"; });
    return Array.from({ length: p.n }, () => (rnd() < 0.7 ? "can roll" : "can't roll"));
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const d = this.data(s, p);
    if (typeof d[0] === "number") {
      const lo = p.trait === "height" ? 130 : 14, hi = p.trait === "height" ? 190 : 24, nb = 15, w = (hi - lo) / nb, bins = new Array(nb).fill(0);
      d.forEach((v) => { const i = Math.floor((v - lo) / w); if (i >= 0 && i < nb) bins[i]++; });
      Sim.bars(ctx, { x: 10, y: 6, w: W - 20, h: H - 12 }, bins.map((c, i) => ({ label: (lo + i * w).toFixed(p.trait === "height" ? 0 : 1), value: c, color: C.blue })), { title: p.trait === "height" ? "Number of people in each height group (cm): a histogram" : "Hand span (cm)", fmt: (v) => (v ? v : "") });
    } else {
      const cats = [...new Set(d)].sort(), counts = cats.map((c) => d.filter((x) => x === c).length);
      Sim.bars(ctx, { x: W * 0.15, y: 6, w: W * 0.7, h: H - 12 }, cats.map((c, i) => ({ label: c, value: counts[i], color: [C.red, C.blue, C.purple, C.orange][i % 4] })), { title: "Number of people in each category: a bar chart", fmt: (v) => v });
    }
  },
  read(s, p) {
    const d = this.data(s, p);
    if (typeof d[0] === "number") return { type: "continuous", mean: (d.reduce((a, b) => a + b, 0) / d.length).toFixed(1) + (p.trait === "height" ? " cm" : " cm"), cause: "many genes plus the environment (diet, health)" };
    const c = {}; d.forEach((x) => (c[x] = (c[x] || 0) + 1)); const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    return { type: "discontinuous", mean: top, cause: p.trait === "blood" ? "genes only (single gene, 3 alleles)" : "mostly genes" };
  },
  keyIdea: "<b>Key idea:</b> continuous variation (height, mass) has a range of values, usually a bell-shaped (normal) distribution, and is caused by many genes and the environment. Discontinuous variation (blood group) falls into distinct groups and is usually controlled by one or a few genes.",
  tryThis: ["Measure 20 people, then 1000. What happens to the shape of the height graph?", "Why is height shown as a histogram but blood group as a bar chart?", "Give an example of a characteristic affected by both genes and environment."],
});
