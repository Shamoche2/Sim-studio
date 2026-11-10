const { C, text, rect, circle, line } = Sim;
// dye: [name, colour, Rf in water, Rf in ethanol]
const INKS = {
  black: [["Blue dye", "#1c7ed6", 0.75, 0.4], ["Red dye", "#e03131", 0.45, 0.65], ["Yellow dye", "#f2b705", 0.2, 0.85]],
  green: [["Blue dye", "#1c7ed6", 0.75, 0.4], ["Yellow dye", "#f2b705", 0.2, 0.85]],
  purple: [["Blue dye", "#1c7ed6", 0.75, 0.4], ["Red dye", "#e03131", 0.45, 0.65], ["Pink dye", "#d6336c", 0.6, 0.3]],
  brown: [["Red dye", "#e03131", 0.45, 0.65], ["Yellow dye", "#f2b705", 0.2, 0.85], ["Green dye", "#2b8a3e", 0.1, 0.55]],
};
Sim({
  title: "Paper Chromatography",
  intro: "A spot of ink is placed on paper dipped in a solvent. As the solvent soaks up the paper, it carries each dye a different distance, separating the mixture into its colours.",
  controls: [
    { id: "solv", label: "Solvent", type: "select", options: [[0, "Water"], [1, "Ethanol"]] },
    { id: "speed", label: "Speed", min: 0.5, max: 3, step: 0.5, value: 1, unit: "×", digits: 1 },
  ],
  readouts: [["front", "Solvent front"], ["rf", "Rf values"]],
  resetOnChange: true,
  init(s) { s.front = 0; },
  step(s, p, dt) { s.front = Math.min(1, s.front + dt * 0.06 * p.speed * (1 - s.front * 0.5)); },
  change(s, p, id) { return id === "solv"; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const inks = Object.keys(INKS), pw = W / (inks.length + 0.5), top = 30, base = H - 70, len = base - top;
    rect(ctx, 0, base + 18, W, H - base - 18, p.solv ? "rgba(255,212,59,.25)" : "rgba(116,192,252,.3)");
    const fy = base - len * s.front;
    inks.forEach((k, i) => {
      const x = pw * (i + 0.5) + pw * 0.25, w = pw * 0.7;
      rect(ctx, x - w / 2, top - 10, w, base - top + 40, "#fffdf5", C.gray, 2, 1);
      rect(ctx, x - w / 2, fy, w, base + 30 - fy, p.solv ? "rgba(255,212,59,.18)" : "rgba(116,192,252,.18)");
      line(ctx, x - w / 2, base, x + w / 2, base, C.gray, 1, [3, 3]);
      for (const [, col, rw, re] of INKS[k]) { const rf = p.solv ? re : rw, y = base - len * s.front * rf; ctx.globalAlpha = 0.75; circle(ctx, x, y, 7 + (1 - s.front) * 2, col); ctx.globalAlpha = 1; }
      text(ctx, k + " ink", x, base + 50, { align: "center", weight: 600, size: 12 });
    });
    line(ctx, 0, fy, W, fy, C.teal, 1.5, [6, 4]);
    text(ctx, "solvent front", 6, fy - 4, { size: 11, color: C.teal });
    text(ctx, "start line (pencil)", 6, base + 14, { size: 11, color: C.muted });
  },
  read(s, p) {
    const dyes = {}; for (const list of Object.values(INKS)) for (const [n, , rw, re] of list) dyes[n] = p.solv ? re : rw;
    return { front: (s.front * 10).toFixed(1) + " cm", rf: Object.entries(dyes).map(([n, r]) => `${n.split(" ")[0]} ${r.toFixed(2)}`).join(", ") };
  },
  keyIdea: "<b>Key idea:</b> Rf = distance moved by dye ÷ distance moved by solvent. Each dye has its own Rf in a given solvent, so matching Rf values identifies substances. Dyes that dissolve better in the solvent travel further.",
  tryThis: ["Which inks contain the same blue dye? How can you tell?", "Measure the Rf of the red dye. Does it change as the solvent rises further?", "Switch to ethanol. Why do the dyes end up in a different order?"],
  note: "The start line is drawn in pencil because pencil doesn't dissolve.",
});
