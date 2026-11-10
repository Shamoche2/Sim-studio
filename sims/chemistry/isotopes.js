const { C, text, rect, circle } = Sim;
const ISO = {
  Cl: { name: "Chlorine", Z: 17, a: [35, 34.969], b: [37, 36.966], nat: 75.8 },
  Cu: { name: "Copper", Z: 29, a: [63, 62.930], b: [65, 64.928], nat: 69.2 },
  B: { name: "Boron", Z: 5, a: [10, 10.013], b: [11, 11.009], nat: 19.9 },
  Br: { name: "Bromine", Z: 35, a: [79, 78.918], b: [81, 80.916], nat: 50.7 },
  Li: { name: "Lithium", Z: 3, a: [6, 6.015], b: [7, 7.016], nat: 7.6 },
};
Sim({
  title: "Isotopes and Relative Atomic Mass",
  intro: "Isotopes are atoms of the same element with different numbers of neutrons. The atomic mass on the periodic table is an average weighted by how common each isotope is.",
  controls: [
    { id: "el", label: "Element", type: "select", options: Object.entries(ISO).map(([k, v]) => [k, v.name]) },
    { id: "ab", label: "Abundance of the lighter isotope", min: 0, max: 100, step: 0.1, value: 75.8, unit: "%", digits: 1 },
  ],
  buttons: [{ label: "Use natural abundance", primary: true, click(s, p) { const el = document.getElementById("ab"); el.value = ISO[p.el].nat; el.dispatchEvent(new Event("input")); } }],
  readouts: [["avg", "Average atomic mass"], ["table", "Periodic table value"], ["n", "Neutrons in each isotope"]],
  change(s, p, id) { if (id === "el") { const el = document.getElementById("ab"); el.value = ISO[p.el].nat; el.dispatchEvent(new Event("input")); } },
  avg(p) { const d = ISO[p.el]; return (d.a[1] * p.ab + d.b[1] * (100 - p.ab)) / 100; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const d = ISO[p.el], n = 100, cols = 20, cell = Math.min((W * 0.55) / cols, (H - 40) / 5);
    for (let i = 0; i < n; i++) { const light = i < Math.round(p.ab); circle(ctx, 20 + (i % cols) * cell + cell / 2, 30 + Math.floor(i / cols) * cell + cell / 2, cell * 0.38, light ? C.blue : C.orange); }
    text(ctx, "100 atoms in a sample:", 20, 20, { weight: 600 });
    const bx = W * 0.62;
    text(ctx, `${p.el}-${d.a[0]}`, bx, 60, { size: 22, weight: 700, color: C.blue });
    text(ctx, `${d.Z} protons, ${d.a[0] - d.Z} neutrons`, bx, 82, { color: C.muted });
    text(ctx, `${p.ab.toFixed(1)}%`, bx, 106, { weight: 700 });
    text(ctx, `${p.el}-${d.b[0]}`, bx, 150, { size: 22, weight: 700, color: C.orange });
    text(ctx, `${d.Z} protons, ${d.b[0] - d.Z} neutrons`, bx, 172, { color: C.muted });
    text(ctx, `${(100 - p.ab).toFixed(1)}%`, bx, 196, { weight: 700 });
    text(ctx, `Average = (${d.a[0]} × ${p.ab.toFixed(1)} + ${d.b[0]} × ${(100 - p.ab).toFixed(1)}) ÷ 100 ≈ ${this.avg(p).toFixed(2)}`, 20, H - 16, { weight: 600 });
  },
  read(s, p) { const d = ISO[p.el]; return { avg: this.avg(p).toFixed(3), table: ((d.a[1] * d.nat + d.b[1] * (100 - d.nat)) / 100).toFixed(3), n: `${d.a[0] - d.Z} and ${d.b[0] - d.Z}` }; },
  keyIdea: "<b>Key idea:</b> relative atomic mass = Σ (isotope mass × abundance) ÷ 100. That's why chlorine is 35.5, not a whole number.",
  tryThis: ["Why is chlorine's atomic mass 35.5 and not 36?", "Bromine's isotopes are almost 50:50. What do you expect its average mass to be?", "What abundance of copper-63 would give an average of exactly 64?"],
});
