const { C, text, rect, plot } = Sim;
const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr".split(" ");
const DATA = {
  radius: { name: "Atomic radius (pm)", v: [31, 28, 128, 96, 84, 76, 71, 66, 57, 58, 166, 141, 121, 111, 107, 105, 102, 106, 203, 176, 170, 160, 153, 139, 139, 132, 126, 124, 132, 122, 122, 120, 119, 120, 120, 116] },
  en: { name: "Electronegativity (Pauling)", v: [2.2, null, 0.98, 1.57, 2.04, 2.55, 3.04, 3.44, 3.98, null, 0.93, 1.31, 1.61, 1.9, 2.19, 2.58, 3.16, null, 0.82, 1.0, 1.36, 1.54, 1.63, 1.66, 1.55, 1.83, 1.88, 1.91, 1.9, 1.65, 1.81, 2.01, 2.18, 2.55, 2.96, 3.0] },
  ie: { name: "First ionisation energy (kJ/mol)", v: [1312, 2372, 520, 900, 801, 1086, 1402, 1314, 1681, 2081, 496, 738, 578, 787, 1012, 1000, 1251, 1521, 419, 590, 633, 659, 651, 653, 717, 762, 760, 737, 746, 906, 579, 762, 947, 941, 1140, 1351] },
};
const pos = (z) => { if (z === 1) return [1, 1]; if (z === 2) return [18, 1]; if (z <= 10) return [z <= 4 ? z - 2 : z + 8, 2]; if (z <= 18) return [z <= 12 ? z - 10 : z, 3]; return [z - 18, 4]; };
Sim({
  title: "Periodic Table Trends",
  intro: "Properties of elements change in repeating patterns across periods (rows) and down groups (columns). Colour the table by a property and click an element to see its value.",
  controls: [{ id: "prop", label: "Property", type: "select", options: Object.entries(DATA).map(([k, v]) => [k, v.name]) }],
  readouts: [["el", "Selected element"], ["val", "Value"], ["where", "Position"]],
  init(s) { s.sel = 11; },
  pointer(s, p, e) { if (e.type !== "down") return; const cw = e.W / 18, ch = (e.H * 0.5) / 4; const gx = Math.floor(e.x / cw) + 1, gy = Math.floor(e.y / ch) + 1; for (let z = 1; z <= 36; z++) { const [x, y] = pos(z); if (x === gx && y === gy) s.sel = z; } },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const d = DATA[p.prop].v, vals = d.filter((v) => v != null), lo = Math.min(...vals), hi = Math.max(...vals);
    const cw = W / 18, ch = (H * 0.5) / 4;
    for (let z = 1; z <= 36; z++) {
      const [x, y] = pos(z), v = d[z - 1], t = v == null ? null : (v - lo) / (hi - lo);
      const fill = t == null ? "#f1f3f5" : `hsl(${220 - t * 220},70%,${75 - t * 20}%)`;
      rect(ctx, (x - 1) * cw + 1, (y - 1) * ch + 1, cw - 2, ch - 2, fill, z === s.sel ? C.text : "#fff", 3, z === s.sel ? 3 : 1);
      text(ctx, SYM[z - 1], (x - 0.5) * cw, (y - 0.5) * ch + 5, { align: "center", weight: 700, size: Math.min(15, cw * 0.4) });
      text(ctx, String(z), (x - 1) * cw + 4, (y - 1) * ch + 11, { size: 9, color: C.muted });
    }
    text(ctx, "low", 8, H * 0.5 + 16, { size: 11, color: C.muted });
    for (let i = 0; i < 100; i++) rect(ctx, 34 + i * 1.5, H * 0.5 + 8, 1.6, 10, `hsl(${220 - (i / 100) * 220},70%,${75 - (i / 100) * 20}%)`);
    text(ctx, "high", 190, H * 0.5 + 16, { size: 11, color: C.muted });
    const series = [{ data: d.map((v, i) => [i + 1, v]).filter(([, v]) => v != null), color: C.blue, width: 2 }];
    plot(ctx, { x: 0, y: H * 0.56, w: W, h: H * 0.44 }, { xmin: 1, xmax: 36, ymin: 0, ymax: hi * 1.08, xstep: 5, xlabel: "atomic number", ylabel: "", series, marks: d[s.sel - 1] != null ? [{ x: s.sel, y: d[s.sel - 1], color: C.red }] : [], vlines: [2.5, 10.5, 18.5].map((x) => ({ x, color: "#dee2e6" })) });
  },
  read(s, p) { const [g, per] = pos(s.sel), v = DATA[p.prop].v[s.sel - 1]; return { el: `${SYM[s.sel - 1]} (Z = ${s.sel})`, val: v == null ? "not defined" : String(v), where: `period ${per}, group ${g}` }; },
  keyIdea: "<b>Key idea:</b> across a period, atoms get smaller and hold electrons more tightly (more protons, same number of shells). Down a group, atoms get bigger because there are more shells.",
  tryThis: ["Colour by atomic radius. Which element in period 3 is largest? Smallest?", "Colour by ionisation energy. Which group has the peaks on the graph? Why?", "Why do noble gases have no electronegativity value?"],
  note: "Shows elements 1–36. Click an element to select it.",
});
