const { C, rect, circle, plot } = Sim;
Sim({
  title: "Radioactive Decay and Half-Life",
  intro: "Each unstable nucleus has a fixed chance of decaying every second, so we can't predict when one atom decays, but we can predict a large group very well. The half-life is the time for half of them to decay.",
  controls: [
    { id: "hl", label: "Half-life", min: 1, max: 20, step: 1, value: 5, unit: "s" },
    { id: "N0", label: "Number of atoms", type: "select", options: [[100, "100"], [400, "400"], [1600, "1600"]], value: 400 },
  ],
  readouts: [["t", "Time"], ["N", "Undecayed"], ["exp", "Predicted"], ["halves", "Half-lives passed"]],
  resetOnChange: true,
  init(s, p) { s.t = 0; s.atoms = Array.from({ length: p.N0 }, () => false); s.hist = [[0, p.N0]]; },
  step(s, p, dt) {
    s.t += dt;
    const prob = 1 - Math.pow(0.5, dt / p.hl);
    for (let i = 0; i < s.atoms.length; i++) if (!s.atoms[i] && Math.random() < prob) s.atoms[i] = true;
    if (s.t - s.hist.at(-1)[0] > 0.1) s.hist.push([s.t, s.atoms.filter((d) => !d).length]);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.45;
    rect(ctx, 0, 0, left, H, "#fff");
    const n = s.atoms.length, cols = Math.ceil(Math.sqrt((n * left) / H)), cell = left / cols;
    s.atoms.forEach((d, i) => circle(ctx, (i % cols) * cell + cell / 2, Math.floor(i / cols) * cell + cell / 2, cell * 0.36, d ? "#ced4da" : C.green));
    const tmax = Math.max(p.hl * 5, s.t);
    const pred = Array.from({ length: 101 }, (_, i) => { const t = (tmax * i) / 100; return [t, p.N0 * Math.pow(0.5, t / p.hl)]; });
    plot(ctx, { x: left + 10, y: 10, w: W - left - 20, h: H - 20 }, { title: "Undecayed atoms", xmin: 0, xmax: tmax, ymin: 0, ymax: p.N0, xlabel: "time (s)", ylabel: "atoms", series: [{ data: pred, color: C.gray, dash: [5, 4], label: "prediction" }, { data: s.hist, color: C.green, label: "measured" }], vlines: [1, 2, 3, 4].map((k) => ({ x: k * p.hl, color: "#adb5bd" })) });
  },
  read(s, p) {
    const N = s.atoms.filter((d) => !d).length;
    return { t: s.t.toFixed(1) + " s", N: String(N), exp: (p.N0 * Math.pow(0.5, s.t / p.hl)).toFixed(0), halves: (s.t / p.hl).toFixed(2) };
  },
  keyIdea: "<b>Key idea:</b> after each half-life, half of what's left remains: N = N₀ × (½)<sup>t / t½</sup>. Decay is random for one atom but predictable for many.",
  tryThis: ["How many atoms are left after 1, 2 and 3 half-lives?", "Compare 100 atoms with 1600 atoms. Which one follows the prediction more closely, and why?", "Carbon-14 has a half-life of 5730 years. How old is a bone with ¼ of its carbon-14 left?"],
});
