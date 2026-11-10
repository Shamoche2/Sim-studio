const { C, text, rect, circle } = Sim;
Sim({
  title: "Limiting Reactants and Yield",
  intro: "Making water: 2 H₂ + O₂ → 2 H₂O. If you don't mix the reactants in exactly the right ratio, one runs out first. That limiting reactant decides how much product you can make.",
  controls: [
    { id: "h2", label: "Molecules of H₂", min: 0, max: 16, step: 1, value: 10 },
    { id: "o2", label: "Molecules of O₂", min: 0, max: 10, step: 1, value: 3 },
    { id: "yield", label: "Actual yield in the lab", min: 50, max: 100, step: 5, value: 100, unit: "%" },
  ],
  buttons: [{ label: "React", primary: true, click(s) { s.done = true; } }],
  readouts: [["lim", "Limiting reactant"], ["excess", "Left over"], ["prod", "Water made (theoretical)"], ["actual", "Water made (actual)"]],
  init(s) { s.done = false; },
  change(s) { s.done = false; },
  calc(p) { const ext = Math.min(p.h2 / 2, p.o2); return { ext, water: 2 * ext, h2Left: p.h2 - 2 * ext, o2Left: p.o2 - ext, lim: p.h2 / 2 < p.o2 ? "H₂" : p.o2 < p.h2 / 2 ? "O₂" : "neither (exact ratio)" }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const r = this.calc(p), mol = (x, y, atoms) => atoms.forEach(([dx, dy, col, rr], i) => circle(ctx, x + dx, y + dy, rr, col, "#fff", 1.2));
    const H2 = (x, y) => mol(x, y, [[-6, 0, "#e9ecef", 7], [6, 0, "#e9ecef", 7]]), O2 = (x, y) => mol(x, y, [[-8, 0, C.red, 9], [8, 0, C.red, 9]]), W2 = (x, y) => mol(x, y, [[0, 0, C.red, 9], [-10, 7, "#e9ecef", 6], [10, 7, "#e9ecef", 6]]);
    const grid = (n, x0, y0, f) => { for (let i = 0; i < n; i++) f(x0 + (i % 4) * 40, y0 + Math.floor(i / 4) * 34); };
    const half = W / 2;
    text(ctx, "Before", half / 2, 24, { align: "center", weight: 700 });
    grid(p.h2, 30, 50, H2); grid(p.o2, half - 150, 50, O2);
    rect(ctx, half - 1, 10, 2, H - 20, "#dee2e6");
    text(ctx, s.done ? "After" : "After (press React)", half + half / 2, 24, { align: "center", weight: 700 });
    if (s.done) {
      const actual = Math.round(r.water * (p.yield / 100));
      grid(actual, half + 20, 50, W2);
      grid(r.h2Left, half + 20, H * 0.6, H2); grid(r.o2Left, half + 180, H * 0.6, O2);
      text(ctx, "left over:", half + 20, H * 0.6 - 20, { color: C.muted, size: 12 });
    }
    text(ctx, "white = hydrogen, red = oxygen", 10, H - 8, { size: 11, color: C.muted });
  },
  read(s, p) { const r = this.calc(p); return { lim: r.lim, excess: `${r.h2Left} H₂, ${r.o2Left} O₂`, prod: `${r.water} molecules`, actual: `${Math.round(r.water * (p.yield / 100))} (${p.yield}% yield)` }; },
  keyIdea: "<b>Key idea:</b> compare the mole ratio you have with the ratio in the balanced equation (2 : 1 here). The reactant that runs out first is limiting. Percentage yield = actual ÷ theoretical × 100%.",
  tryThis: ["Mix 10 H₂ with 3 O₂. Which reactant is limiting? How much is left over?", "Find a mixture with nothing left over.", "Why is the actual yield in a real experiment usually less than 100%?"],
});
