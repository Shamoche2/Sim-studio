const { C, text, rect, circle, line } = Sim;
const PREFIX = ["meth", "eth", "prop", "but", "pent", "hex", "hept", "oct"];
const SERIES = { alkane: ["Alkanes", "ane", (n) => [n, 2 * n + 2]], alkene: ["Alkenes", "ene", (n) => [n, 2 * n]], alcohol: ["Alcohols", "anol", (n) => [n, 2 * n + 2]], acid: ["Carboxylic acids", "anoic acid", (n) => [n, 2 * n]] };
const SUB = (n) => (n > 1 ? String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]) : "");
Sim({
  title: "Homologous Series: Organic Molecules",
  intro: "Organic compounds come in families called homologous series. Each member differs from the next by one CH₂ unit. Members share a functional group, so they react in similar ways.",
  controls: [
    { id: "ser", label: "Series", type: "select", options: Object.entries(SERIES).map(([k, v]) => [k, v[0]]) },
    { id: "n", label: "Carbon atoms", min: 1, max: 8, step: 1, value: 3 },
  ],
  readouts: [["name", "Name"], ["formula", "Molecular formula"], ["general", "General formula"], ["test", "Test / reaction"]],
  name(p) { if (p.ser === "alkene" && p.n === 1) return "(no alkene with 1 carbon)"; return PREFIX[p.n - 1] + SERIES[p.ser][1]; },
  formula(p) {
    const n = p.n; if (p.ser === "alkane") return `C${SUB(n)}H${SUB(2 * n + 2)}`; if (p.ser === "alkene") return n < 2 ? "—" : `C${SUB(n)}H${SUB(2 * n)}`;
    if (p.ser === "alcohol") return `C${SUB(n)}H${SUB(2 * n + 1)}OH`; return n === 1 ? "HCOOH" : `C${SUB(n - 1)}H${SUB(2 * n - 1)}COOH`;
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const n = p.n, fg = p.ser === "alcohol" || p.ser === "acid", step = Math.min(70, (W - 200) / Math.max(1, n)), x0 = (W - step * (n - 1)) / 2 - (fg ? 40 : 0), cy = H / 2, b = 34;
    if (p.ser === "alkene" && n < 2) { text(ctx, "An alkene needs at least 2 carbons for its C=C double bond.", W / 2, cy, { align: "center", weight: 600 }); return; }
    const atom = (x, y, sym) => { circle(ctx, x, y, sym === "H" ? 11 : 15, sym === "H" ? "#f8f9fa" : sym === "O" ? "#ffc9c9" : "#adb5bd", C.text, 1.2); text(ctx, sym, x, y + 5, { align: "center", weight: 700, size: sym === "H" ? 12 : 14 }); };
    const bond = (x1, y1, x2, y2, order = 1) => { const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; for (let k = 0; k < order; k++) { const o = (k - (order - 1) / 2) * 7; line(ctx, x1 + nx * o, y1 + ny * o, x2 + nx * o, y2 + ny * o, C.text, 2.2); } };
    const later = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + i * step, last = i === n - 1;
      let used = 0;
      if (i > 0) used += p.ser === "alkene" && i === 1 ? 2 : 1;
      if (!last) { const o = p.ser === "alkene" && i === 0 ? 2 : 1; bond(x, cy, x + step, cy, o); used += o; }
      if (last && p.ser === "alcohol") { bond(x, cy, x + b, cy); bond(x + b, cy, x + 2 * b, cy); later.push([x + b, cy, "O"], [x + 2 * b, cy, "H"]); used += 1; rect(ctx, x + b - 20, cy - 22, b + 42, 44, null, C.red, 8, 2); }
      if (last && p.ser === "acid") { bond(x, cy, x, cy - b, 2); bond(x, cy, x + b, cy); bond(x + b, cy, x + 2 * b, cy); later.push([x, cy - b, "O"], [x + b, cy, "O"], [x + 2 * b, cy, "H"]); used += 3; rect(ctx, x - 22, cy - b - 22, 2 * b + 44, b + 44, null, C.red, 8, 2); }
      const spots = [...(last && p.ser === "acid" ? [] : [[0, -b]]), [0, b], ...(i === 0 ? [[-b, 0]] : []), ...(last && !fg ? [[b, 0]] : [])]; // C=O of an acid sits in the "up" spot
      for (const [dx, dy] of spots.slice(0, Math.max(0, 4 - used))) { bond(x, cy, x + dx, cy + dy); later.push([x + dx, cy + dy, "H"]); }
      later.push([x, cy, "C"]);
    }
    for (const [x, y, sym] of later) atom(x, y, sym);
    if (p.ser === "alkene") rect(ctx, x0 - 20, cy - 22, step + 40, 44, null, C.red, 8, 2);
    text(ctx, p.ser === "alkane" ? "Alkanes have only single bonds (saturated)" : "Red box: the functional group", 12, H - 12, { size: 12, color: C.muted });
  },
  read(s, p) {
    const gen = { alkane: "CₙH₂ₙ₊₂", alkene: "CₙH₂ₙ", alcohol: "CₙH₂ₙ₊₁OH", acid: "Cₙ₋₁H₂ₙ₋₁COOH" }[p.ser];
    const test = { alkane: "no reaction with bromine water (stays orange)", alkene: "decolourises bromine water (orange → colourless)", alcohol: "burns cleanly; oxidises to a carboxylic acid", acid: "fizzes with carbonates, giving CO₂" }[p.ser];
    return { name: this.name(p), formula: this.formula(p), general: gen, test };
  },
  keyIdea: "<b>Key idea:</b> members of a homologous series share a general formula and functional group, and show a gradual trend in physical properties (boiling point rises with chain length).",
  tryThis: ["Write the formula of the alkane with 5 carbons. Check it with the general formula.", "How can you tell an alkene from an alkane in the lab?", "What do ethanol and ethanoic acid have in common, and how are they different?"],
});
