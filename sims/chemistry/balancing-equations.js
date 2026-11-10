const { C, text, rect } = Sim;
// Each species: [formula, {element: count}]
const RX = [
  { name: "Making water", left: [["H₂", { H: 2 }], ["O₂", { O: 2 }]], right: [["H₂O", { H: 2, O: 1 }]], ans: [2, 1, 2] },
  { name: "Making ammonia", left: [["N₂", { N: 2 }], ["H₂", { H: 2 }]], right: [["NH₃", { N: 1, H: 3 }]], ans: [1, 3, 2] },
  { name: "Burning methane", left: [["CH₄", { C: 1, H: 4 }], ["O₂", { O: 2 }]], right: [["CO₂", { C: 1, O: 2 }], ["H₂O", { H: 2, O: 1 }]], ans: [1, 2, 1, 2] },
  { name: "Rusting iron", left: [["Fe", { Fe: 1 }], ["O₂", { O: 2 }]], right: [["Fe₂O₃", { Fe: 2, O: 3 }]], ans: [4, 3, 2] },
  { name: "Burning propane", left: [["C₃H₈", { C: 3, H: 8 }], ["O₂", { O: 2 }]], right: [["CO₂", { C: 1, O: 2 }], ["H₂O", { H: 2, O: 1 }]], ans: [1, 5, 3, 4] },
  { name: "Aluminium + hydrochloric acid", left: [["Al", { Al: 1 }], ["HCl", { H: 1, Cl: 1 }]], right: [["AlCl₃", { Al: 1, Cl: 3 }], ["H₂", { H: 2 }]], ans: [2, 6, 2, 3] },
  { name: "Photosynthesis", left: [["CO₂", { C: 1, O: 2 }], ["H₂O", { H: 2, O: 1 }]], right: [["C₆H₁₂O₆", { C: 6, H: 12, O: 6 }], ["O₂", { O: 2 }]], ans: [6, 6, 1, 6] },
];
const COLORS = { H: "#adb5bd", O: C.red, N: C.blue, C: "#343a40", Fe: C.orange, Al: "#74c0fc", Cl: C.green };
Sim({
  title: "Balancing Chemical Equations",
  intro: "Atoms are not created or destroyed in a reaction, only rearranged. Change the numbers in front of each substance (the coefficients) until both sides have the same number of each type of atom.",
  controls: [
    { id: "rx", label: "Reaction", type: "select", options: RX.map((r, i) => [i, r.name]) },
    { id: "c1", label: "Coefficient 1", min: 1, max: 8, step: 1, value: 1 },
    { id: "c2", label: "Coefficient 2", min: 1, max: 8, step: 1, value: 1 },
    { id: "c3", label: "Coefficient 3", min: 1, max: 8, step: 1, value: 1 },
    { id: "c4", label: "Coefficient 4", min: 1, max: 8, step: 1, value: 1, help: "Only used when the reaction has 4 substances." },
  ],
  buttons: [{ label: "Show answer", click(s, p) { RX[p.rx].ans.forEach((v, i) => { const el = document.getElementById("c" + (i + 1)); el.value = v; el.dispatchEvent(new Event("input")); }); } }],
  readouts: [["status", "Balanced?"]],
  count(side, coefs) { const t = {}; side.forEach(([, atoms], i) => { for (const [e, n] of Object.entries(atoms)) t[e] = (t[e] || 0) + n * coefs[i]; }); return t; },
  coefs(p) { return [p.c1, p.c2, p.c3, p.c4]; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const r = RX[p.rx], cf = this.coefs(p), nl = r.left.length;
    const L = this.count(r.left, cf), R = this.count(r.right, cf.slice(nl));
    // equation line
    const parts = [];
    r.left.forEach(([f], i) => { if (i) parts.push(["+", C.muted]); parts.push([(cf[i] > 1 ? cf[i] : "") + f, C.text]); });
    parts.push(["→", C.muted]);
    r.right.forEach(([f], i) => { if (i) parts.push(["+", C.muted]); parts.push([(cf[nl + i] > 1 ? cf[nl + i] : "") + f, C.text]); });
    ctx.font = "700 26px system-ui"; const total = parts.reduce((a, [t]) => a + ctx.measureText(t).width + 16, 0);
    let x = (W - total) / 2;
    for (const [t, col] of parts) { text(ctx, t, x, 44, { size: 26, weight: 700, color: col }); ctx.font = "700 26px system-ui"; x += ctx.measureText(t).width + 16; }
    // molecules drawn as atom clusters
    const drawSide = (side, coefs, x0, x1) => {
      let cx = x0 + 10, cy = 90;
      side.forEach(([f, atoms], i) => {
        for (let k = 0; k < coefs[i]; k++) {
          const list = Object.entries(atoms).flatMap(([e, n]) => Array(n).fill(e));
          const w = list.length * 13 + 10;
          if (cx + w > x1) { cx = x0 + 10; cy += 34; }
          list.forEach((e, j) => { Sim.circle(ctx, cx + j * 13 + 6, cy, 7, COLORS[e], "#fff", 1); });
          cx += w;
        }
        cx += 12;
      });
    };
    drawSide(r.left, cf, 0, W / 2 - 10); drawSide(r.right, cf.slice(nl), W / 2 + 10, W);
    Sim.line(ctx, W / 2, 70, W / 2, H * 0.6, C.grid, 2);
    // atom count table
    const els = [...new Set([...Object.keys(L), ...Object.keys(R)])], ty = H * 0.66, cw = Math.min(110, W / (els.length + 1));
    text(ctx, "Left", 14, ty + 34, { weight: 600 }); text(ctx, "Right", 14, ty + 62, { weight: 600 });
    els.forEach((e, i) => {
      const xx = 80 + i * cw, ok = L[e] === R[e];
      Sim.circle(ctx, xx + 20, ty + 4, 8, COLORS[e]); text(ctx, e, xx + 32, ty + 9, { weight: 700 });
      text(ctx, String(L[e] || 0), xx + 26, ty + 34, { align: "center", weight: 700, color: ok ? C.green : C.red, size: 16 });
      text(ctx, String(R[e] || 0), xx + 26, ty + 62, { align: "center", weight: 700, color: ok ? C.green : C.red, size: 16 });
    });
  },
  read(s, p) {
    const r = RX[p.rx], cf = this.coefs(p), nl = r.left.length, L = this.count(r.left, cf), R = this.count(r.right, cf.slice(nl));
    const ok = Object.keys({ ...L, ...R }).every((e) => L[e] === R[e]);
    const g = (a, b) => (b ? g(b, a % b) : a), used = cf.slice(0, nl + r.right.length), div = used.reduce(g);
    return { status: ok ? (div > 1 ? "balanced, but can be simplified" : "yes, balanced!") : "not yet" };
  },
  keyIdea: "<b>Key idea:</b> only change the coefficients (big numbers in front), never the small subscripts. Changing a subscript makes a different substance.",
  tryThis: ["Balance 'Making water'. Why do you need 2 H₂O?", "Try 'Burning methane'. Balance carbon first, then hydrogen, then oxygen.", "Balance photosynthesis. How many CO₂ molecules make one glucose?"],
  note: "Coloured circles show the atoms in each molecule.",
});
