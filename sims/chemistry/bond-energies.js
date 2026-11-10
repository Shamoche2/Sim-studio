const { C, text, rect, arrow } = Sim;
const BE = { "H–H": 436, "O=O": 498, "O–H": 464, "C–H": 413, "C=O": 805, "N≡N": 945, "N–H": 391, "Cl–Cl": 243, "H–Cl": 432, "C–C": 347 };
const RX = {
  water: { name: "2H₂ + O₂ → 2H₂O", broken: [["H–H", 2], ["O=O", 1]], made: [["O–H", 4]] },
  methane: { name: "CH₄ + 2O₂ → CO₂ + 2H₂O", broken: [["C–H", 4], ["O=O", 2]], made: [["C=O", 2], ["O–H", 4]] },
  ammonia: { name: "N₂ + 3H₂ → 2NH₃", broken: [["N≡N", 1], ["H–H", 3]], made: [["N–H", 6]] },
  hcl: { name: "H₂ + Cl₂ → 2HCl", broken: [["H–H", 1], ["Cl–Cl", 1]], made: [["H–Cl", 2]] },
};
Sim({
  title: "Bond Energies and Enthalpy Change",
  intro: "Breaking bonds takes in energy; making bonds gives energy out. Add up both, and the difference tells you whether a reaction is exothermic or endothermic, and by how much.",
  controls: [{ id: "rx", label: "Reaction", type: "select", options: Object.entries(RX).map(([k, v]) => [k, v.name]) }],
  readouts: [["in", "Energy in (bonds broken)"], ["out", "Energy out (bonds made)"], ["dH", "ΔH"], ["type", "Type"]],
  sums(p) { const r = RX[p.rx], inn = r.broken.reduce((a, [b, n]) => a + BE[b] * n, 0), out = r.made.reduce((a, [b, n]) => a + BE[b] * n, 0); return { inn, out, dH: inn - out }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const r = RX[p.rx], { inn, out, dH } = this.sums(p), max = Math.max(inn, out), sc = (H - 130) / max;
    const x1 = W * 0.12, x2 = W * 0.42, x3 = W * 0.72, wide = W * 0.16, atomsY = 56, reactY = atomsY + inn * sc, prodY = atomsY + out * sc;
    rect(ctx, x1, reactY - 3, wide, 6, C.blue); text(ctx, "reactants", x1 + wide / 2, reactY + 20, { align: "center", weight: 600 });
    rect(ctx, x2, atomsY - 3, wide, 6, C.gray); text(ctx, "separate atoms", x2 + wide / 2, atomsY + 20, { align: "center", weight: 600 });
    rect(ctx, x3, prodY - 3, wide, 6, C.green); text(ctx, "products", x3 + wide / 2, prodY + 20, { align: "center", weight: 600 });
    arrow(ctx, x1 + wide + 10, reactY, x2 - 10, atomsY, C.red, 3); text(ctx, `+${inn} kJ (break)`, (x1 + wide + x2) / 2 - 20, (reactY + atomsY) / 2, { color: C.red, weight: 700, size: 13, align: "right" });
    arrow(ctx, x2 + wide + 10, atomsY, x3 - 10, prodY, C.green, 3); text(ctx, `−${out} kJ (make)`, (x2 + wide + x3) / 2 + 24, (atomsY + prodY) / 2, { color: C.green, weight: 700, size: 13 });
    text(ctx, `ΔH = ${inn} − ${out} = ${dH > 0 ? "+" : ""}${dH} kJ/mol`, W / 2, 24, { align: "center", weight: 800, size: 17, color: dH < 0 ? C.orange : C.blue });
    text(ctx, "Broken: " + r.broken.map(([b, n]) => `${n}× ${b} (${BE[b]})`).join(", "), 10, H - 22, { size: 12 });
    text(ctx, "Made: " + r.made.map(([b, n]) => `${n}× ${b} (${BE[b]})`).join(", "), 10, H - 6, { size: 12 });
  },
  read(s, p) { const { inn, out, dH } = this.sums(p); return { in: inn + " kJ", out: out + " kJ", dH: (dH > 0 ? "+" : "") + dH + " kJ/mol", type: dH < 0 ? "exothermic" : "endothermic" }; },
  keyIdea: "<b>Key idea:</b> ΔH = energy to break bonds − energy released making bonds. If more energy is released making new bonds than was used breaking old ones, the reaction is exothermic (ΔH negative).",
  tryThis: ["Work out ΔH for making water yourself using the bond energies shown.", "Why is burning methane so exothermic? Which bonds release the most energy?", "Is making ammonia exothermic? Which bond is hardest to break?"],
  note: "Average bond energies in kJ/mol; real values vary slightly between molecules.",
});
