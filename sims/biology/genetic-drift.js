const { C, plot } = Sim;
Sim({
  title: "Genetic Drift",
  intro: "In every generation, which alleles get passed on is partly down to chance. In small populations these random changes can be large, and an allele can disappear completely, even with no natural selection.",
  controls: [
    { id: "N", label: "Population size", min: 10, max: 1000, step: 10, value: 50 },
    { id: "p0", label: "Starting frequency of allele A", min: 5, max: 95, step: 5, value: 50, unit: "%" },
    { id: "runs", label: "Number of populations", min: 1, max: 10, step: 1, value: 6 },
  ],
  readouts: [["gen", "Generation"], ["lost", "Populations that lost A"], ["fixed", "Populations where A is 100%"]],
  resetOnChange: true,
  init(s, p) { s.gen = 0; s.freq = Array.from({ length: p.runs }, () => p.p0 / 100); s.hist = s.freq.map((f) => [[0, f * 100]]); s.acc = 0; },
  step(s, p, dt) {
    s.acc += dt; if (s.acc < 0.06 || s.gen >= 200) return; s.acc = 0; s.gen++;
    s.freq = s.freq.map((f, i) => {
      let k = 0; const n = 2 * p.N; for (let j = 0; j < n; j++) if (Math.random() < f) k++;
      const nf = k / n; s.hist[i].push([s.gen, nf * 100]); return nf;
    });
  },
  draw({ ctx, W, H }, s, p) {
    const cols = [C.blue, C.red, C.green, C.orange, C.purple, C.teal, C.pink, C.brown, C.yellow, C.gray];
    plot(ctx, { x: 0, y: 0, w: W, h: H }, { title: `Frequency of allele A (population of ${p.N})`, xmin: 0, xmax: 200, ymin: 0, ymax: 100, xlabel: "generation", ylabel: "% allele A", series: s.hist.map((d, i) => ({ data: d, color: cols[i], width: 2 })) });
  },
  read(s) { return { gen: String(s.gen), lost: String(s.freq.filter((f) => f === 0).length), fixed: String(s.freq.filter((f) => f === 1).length) }; },
  keyIdea: "<b>Key idea:</b> genetic drift is random change in allele frequency. It is strongest in small populations, which is why endangered species can lose genetic variety quickly.",
  tryThis: ["Run with a population of 20. How many populations lose or fix allele A by generation 200?", "Now try 1000. Do the lines wander as much?", "Why might a small island population end up very different from the mainland population it came from?"],
  note: "No selection: neither allele gives an advantage. Each run is random.",
});
