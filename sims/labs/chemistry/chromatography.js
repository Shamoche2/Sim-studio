const { C, text, rect, circle, line } = Sim;
const DYE = { red: ["#e03131", 0.72], blue: ["#1971c2", 0.35], yellow: ["#f59f00", 0.86], green: ["#2f9e44", 0.55], purple: ["#9c36b5", 0.18] };
const INKS = { A: ["Ink A", ["red", "yellow"]], B: ["Ink B", ["blue"]], Cc: ["Ink C", ["blue", "green", "purple"]], D: ["Ink D", ["red", "blue"]], X: ["Unknown ink X (from a crime scene)", ["red", "blue"]] };
Lab({
  title: "Virtual Lab: Paper Chromatography",
  aim: "Separate the dyes in different inks, calculate their Rf values, and identify which ink matches the unknown ink X.",
  equipment: ["Chromatography paper", "Pencil and ruler", "Beaker with a lid", "Solvent (water)", "Capillary tubes", "Ink samples A, B, C, D and X"],
  safety: ["Some solvents are flammable: no flames.", "Don't let the solvent touch your skin or eyes."],
  method: [
    "A pencil start line has been drawn 1 cm from the bottom and a spot of each ink is on it. The solvent level is below the line.",
    "Press <b>Run chromatogram</b> and wait until the solvent front is near the top.",
    "Press <b>Stop and dry</b>.",
    "Choose an <b>Ink to measure</b>, read the distances on the ruler and press <b>Record result</b>.",
    "Rf = distance moved by spot ÷ distance moved by solvent. Compare ink X with A, B, C and D.",
  ],
  controls: [{ id: "ink", label: "Ink to measure", type: "select", options: Object.entries(INKS).map(([k, v]) => [k, v[0]]) }],
  buttons: [{ label: "Run chromatogram", click(s) { if (!s.done) s.run = true; } }, { label: "Stop and dry", click(s) { if (s.front > 0.5) { s.run = false; s.done = true; } } }],
  readouts: [["front", "Solvent front"], ["spots", "Spots for this ink"]],
  init(s) { s.front = 0; s.run = false; s.done = false; s.jit = {}; for (const d in DYE) s.jit[d] = Sim.randn() * 0.012; },
  change() {},
  step(s, p, dt) { if (s.run) s.front = Math.min(0.95, s.front + dt * 0.06 * (1 - s.front * 0.6)); if (s.front >= 0.95) { s.run = false; s.done = true; } },
  FRONT_CM: 9,
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const px = W * 0.14, pw = W * 0.6, py = 30, ph = H - 70, base = py + ph - ph * 0.1, len = ph * 0.86;
    rect(ctx, px - 20, py - 10, pw + 40, ph + 30, "rgba(233,236,239,.6)", "#adb5bd", 6, 2);
    rect(ctx, px, py, pw, ph, "#fff", "#ced4da", 0, 1);
    rect(ctx, px - 18, py + ph - 12, pw + 36, 30, "rgba(116,192,252,.35)");
    if (s.front > 0) rect(ctx, px, base - s.front * len, pw, s.front * len, "rgba(116,192,252,.12)");
    line(ctx, px, base, px + pw, base, C.gray, 1.5); text(ctx, "pencil start line", px + pw + 6, base + 4, { size: 10, color: C.muted });
    if (s.front > 0) { line(ctx, px, base - s.front * len, px + pw, base - s.front * len, C.blue, 1.5, [4, 3]); text(ctx, "solvent front", px + pw + 6, base - s.front * len + 4, { size: 10, color: C.blue }); }
    const keys = Object.keys(INKS);
    keys.forEach((k, i) => {
      const x = px + ((i + 0.5) / keys.length) * pw;
      for (const d of INKS[k][1]) { const rf = DYE[d][1] + s.jit[d], y = base - Math.min(s.front * rf, s.front) * len; circle(ctx, x, y, 7 + s.front * 4, DYE[d][0] + "cc"); }
      text(ctx, k === "Cc" ? "C" : k, x, base + 22, { align: "center", weight: k === p.ink ? 800 : 400, color: k === p.ink ? C.blue : C.text });
      if (k === p.ink) rect(ctx, x - 26, py + 4, 52, ph - 8, null, C.blue, 4, 2);
    });
    const rx = W * 0.86; rect(ctx, rx - 12, base - len, 24, len, "#ffe066", "#e67700", 1, 1);
    for (let mm = 0; mm <= 90; mm += 1) { const y = base - (mm / 90) * len; line(ctx, rx - 12, y, rx - 12 + (mm % 10 === 0 ? 12 : mm % 5 === 0 ? 8 : 4), y, "#e67700", 1); if (mm % 10 === 0) text(ctx, String(mm / 10), rx + 16, y + 4, { size: 10 }); }
    text(ctx, "cm", rx, base - len - 8, { align: "center", size: 10 });
  },
  dist(s, d) { return Math.min(s.front * (DYE[d][1] + s.jit[d]), s.front) * this.FRONT_CM / 0.95 * 0.95 / 0.95; },
  read(s, p) { return { front: (s.front * this.FRONT_CM / 0.95).toFixed(1) + " cm", spots: s.front ? INKS[p.ink][1].length + "" : "—" }; },
  record(s, p) {
    if (!s.done) return "Run the chromatogram and press Stop and dry first.";
    const f = Lab.round(s.front * this.FRONT_CM / 0.95, 0.1), ds = INKS[p.ink][1].map((d) => Lab.round(Math.min(s.front * (DYE[d][1] + s.jit[d]), s.front) * this.FRONT_CM / 0.95, 0.1)).sort((a, b) => a - b);
    return { ink: p.ink === "Cc" ? "C" : p.ink, n: ds.length, f, d: ds.map((v) => v.toFixed(1)).join(", "), rf: ds.map((v) => (v / f).toFixed(2)).join(", ") };
  },
  table: { cols: [{ key: "ink", label: "Ink" }, { key: "n", label: "Number of spots", digits: 0 }, { key: "f", label: "Solvent front", unit: "cm", digits: 1 }, { key: "d", label: "Spot distances", unit: "cm" }, { key: "rf", label: "Rf values" }] },
  derived(rows) { const x = rows.find((r) => r.ink === "X"); if (!x) return { "Match for ink X": "record ink X and the others" }; const m = rows.filter((r) => r.ink !== "X" && r.n === x.n && r.rf.split(", ").every((v, i) => Math.abs(v - x.rf.split(", ")[i]) < 0.05)); return { "Ink X matches": m.length ? "Ink " + m.map((r) => r.ink).join(", ") : "no recorded ink matches yet" }; },
  questions: [
    { q: "Why is the start line drawn in pencil, not pen?", options: ["Pencil is easier to see", "Pencil (graphite) does not dissolve in the solvent and move up the paper", "Pen would tear the paper"], answer: 1, why: "Ink from a pen line would separate and spoil the chromatogram." },
    { q: "Why must the solvent level be below the start line?", options: ["So the inks don't dissolve into the solvent in the beaker", "To save solvent", "So the paper stays dry"], answer: 0, why: "Otherwise the spots wash away into the solvent." },
    { q: "A spot moved 3.6 cm while the solvent moved 9.0 cm. Its Rf is…", options: ["0.40", "2.5", "5.4"], answer: 0, why: "Rf = 3.6 ÷ 9.0 = 0.40." },
  ],
  conclusion: "Each dye has its own Rf value in a given solvent. Ink X gives the same spots with the same Rf values as ink D, so they are the same ink. A pure substance gives just one spot.",
});
