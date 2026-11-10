const { C, text, rect } = Sim;
const AR = { C: 12.01, H: 1.008, O: 16.0, N: 14.01, Mg: 24.31, S: 32.06, Fe: 55.85 };
const SAMPLES = {
  mgo: { name: "Magnesium oxide (from burning Mg)", m: { Mg: 2.4, O: 1.6 } },
  ch: { name: "A hydrocarbon", m: { C: 4.8, H: 1.2 } },
  glucose: { name: "Glucose-like compound", m: { C: 7.2, H: 1.2, O: 9.6 } },
  fes: { name: "Iron sulfide", m: { Fe: 5.58, S: 3.2 } },
  nh: { name: "A nitrogen compound", m: { N: 8.4, H: 1.8 } },
};
Sim({
  title: "Empirical Formula from Experimental Data",
  intro: "An experiment tells you the mass of each element in a compound. Turn the masses into moles, divide by the smallest, and you get the simplest whole-number ratio of atoms: the empirical formula.",
  controls: [{ id: "smp", label: "Sample", type: "select", options: Object.entries(SAMPLES).map(([k, v]) => [k, v.name]) }],
  readouts: [["formula", "Empirical formula"]],
  calc(p) {
    const m = SAMPLES[p.smp].m, rows = Object.entries(m).map(([el, g]) => ({ el, g, mol: g / AR[el] })), min = Math.min(...rows.map((r) => r.mol));
    rows.forEach((r) => (r.ratio = r.mol / min));
    let mult = 1; for (const k of [1, 2, 3, 4]) { if (rows.every((r) => Math.abs(r.ratio * k - Math.round(r.ratio * k)) < 0.1)) { mult = k; break; } }
    rows.forEach((r) => (r.whole = Math.round(r.ratio * mult)));
    return rows;
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const rows = this.calc(p), cols = ["Element", "Mass (g)", "÷ Ar", "= moles", "÷ smallest", "Whole number"], cw = (W - 20) / cols.length, rh = 46;
    cols.forEach((c, i) => { rect(ctx, 10 + i * cw, 20, cw - 4, rh - 6, "#eceefc", null, 6); text(ctx, c, 10 + i * cw + cw / 2 - 2, 48, { align: "center", weight: 700, size: 13 }); });
    rows.forEach((r, j) => {
      const y = 20 + (j + 1) * rh, vals = [r.el, r.g.toFixed(2), AR[r.el].toFixed(2), r.mol.toFixed(3), r.ratio.toFixed(2), String(r.whole)];
      vals.forEach((v, i) => { rect(ctx, 10 + i * cw, y, cw - 4, rh - 6, i === 5 ? "#d3f9d8" : "#f8f9fa", null, 6); text(ctx, v, 10 + i * cw + cw / 2 - 2, y + 26, { align: "center", size: 15, weight: i === 0 || i === 5 ? 700 : 400 }); });
    });
    const f = rows.map((r) => r.el + (r.whole > 1 ? String(r.whole).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]) : "")).join("");
    text(ctx, `Empirical formula: ${f}`, W / 2, H - 30, { align: "center", size: 26, weight: 800, color: C.blue });
  },
  read(s, p) { return { formula: this.calc(p).map((r) => r.el + (r.whole > 1 ? r.whole : "")).join("") }; },
  keyIdea: "<b>Key idea:</b> mass → moles (÷ Ar) → divide by the smallest → whole numbers. If you get a ratio like 1.5, multiply everything by 2. The molecular formula is a whole-number multiple of the empirical formula.",
  tryThis: ["Work through the magnesium oxide example yourself before looking at the table.", "The hydrocarbon has an Mr of 30. What is its molecular formula?", "The glucose-like compound has Mr 180. What is its molecular formula?"],
});
