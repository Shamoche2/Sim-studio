const { C, text, rect, circle } = Sim;
const SYM = { 4: "Be", 25: "Mn", 36: "Kr", 51: "Sb", 82: "Pb", 83: "Bi", 84: "Po", 85: "At", 86: "Rn", 87: "Fr", 88: "Ra", 89: "Ac", 90: "Th", 91: "Pa", 92: "U", 93: "Np", 94: "Pu", 5: "B", 6: "C", 7: "N", 8: "O", 18: "Ar", 19: "K", 20: "Ca", 26: "Fe", 27: "Co", 28: "Ni", 37: "Rb", 38: "Sr", 39: "Y", 52: "Te", 53: "I", 54: "Xe", 55: "Cs", 56: "Ba" };
const START = { u238: [92, 238], ra226: [88, 226], c14: [6, 14], co60: [27, 60], sr90: [38, 90], i131: [53, 131] };
Sim({
  title: "Nuclear Equations: Alpha and Beta Decay",
  intro: "Unstable nuclei decay by giving out radiation. In alpha decay the nucleus loses 2 protons and 2 neutrons; in beta decay a neutron turns into a proton and an electron is emitted. In every equation, mass numbers and atomic numbers must balance.",
  controls: [
    { id: "iso", label: "Starting isotope", type: "select", options: Object.entries(START).map(([k, [Z, A]]) => [k, `${SYM[Z]}-${A}`]) },
    { id: "type", label: "Decay type", type: "select", options: [["alpha", "Alpha (α)"], ["beta", "Beta minus (β⁻)"], ["gamma", "Gamma (γ)"]] },
  ],
  readouts: [["eq", "Equation"], ["A", "Mass numbers"], ["Z", "Atomic numbers"], ["pen", "Penetration"]],
  init(s) { s.t = 0; },
  change(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(1.2, s.t + dt * 0.5); },
  calc(p) { const [Z, A] = START[p.iso]; const [z, a] = p.type === "alpha" ? [Z - 2, A - 4] : p.type === "beta" ? [Z + 1, A] : [Z, A]; return { Z, A, z, a }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const { Z, A, z, a } = this.calc(p), cy = H * 0.42;
    const nuc = (x, y, n, pr, r) => { for (let i = 0; i < Math.min(40, n); i++) { const ang = i * 2.4, rr = r * Math.sqrt(i / 40); circle(ctx, x + Math.cos(ang) * rr, y + Math.sin(ang) * rr, 5, i % Math.round(n / pr) === 0 ? C.red : "#adb5bd"); } };
    const label = (x, y, A, Z, sym, col = C.text) => { text(ctx, String(A), x - 6, y - 18, { align: "right", size: 13, weight: 600 }); text(ctx, String(Z), x - 6, y + 14, { align: "right", size: 13, weight: 600 }); text(ctx, sym, x, y + 10, { size: 32, weight: 800, color: col }); };
    nuc(W * 0.18, cy, A, Z, 32); nuc(W * 0.55, cy, a, z, 30);
    const t = s.t, px = W * 0.55 + 40 + t * W * 0.3;
    if (p.type === "alpha") { circle(ctx, px, cy - 6, 6, C.red); circle(ctx, px + 10, cy - 6, 6, "#adb5bd"); circle(ctx, px, cy + 6, 6, "#adb5bd"); circle(ctx, px + 10, cy + 6, 6, C.red); }
    if (p.type === "beta") circle(ctx, px, cy, 5, C.blue);
    if (p.type === "gamma") { ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k < 30; k++) ctx.lineTo(px - 30 + k * 2, cy - Math.sin(k * 1.2) * 8); ctx.stroke(); }
    const ey = H * 0.82;
    label(W * 0.1, ey, A, Z, SYM[Z] || "?"); text(ctx, "→", W * 0.3, ey + 8, { size: 28 });
    label(W * 0.42, ey, a, z, SYM[z] || "?", C.blue); text(ctx, "+", W * 0.62, ey + 8, { size: 28 });
    if (p.type === "alpha") label(W * 0.74, ey, 4, 2, "He", C.red); else if (p.type === "beta") label(W * 0.74, ey, 0, -1, "e", C.blue); else text(ctx, "γ", W * 0.74, ey + 10, { size: 34, weight: 800, color: C.purple });
  },
  read(s, p) {
    const { Z, A, z, a } = this.calc(p), part = p.type === "alpha" ? "⁴₂He" : p.type === "beta" ? "⁰₋₁e" : "γ";
    return { eq: `${SYM[Z]}-${A} → ${SYM[z]}-${a} + ${part}`, A: `${A} = ${a} + ${p.type === "alpha" ? 4 : 0}`, Z: `${Z} = ${z} + ${p.type === "alpha" ? 2 : p.type === "beta" ? "(−1)" : 0}`, pen: { alpha: "stopped by paper; most ionising", beta: "stopped by a few mm of aluminium", gamma: "reduced by thick lead or concrete; least ionising" }[p.type] };
  },
  keyIdea: "<b>Key idea:</b> alpha decay: mass number −4, atomic number −2 (a new element 2 places back). Beta decay: mass number unchanged, atomic number +1 (1 place forward). Gamma rays change neither; the nucleus just loses energy.",
  tryThis: ["Uranium-238 undergoes alpha decay. What element does it become?", "Carbon-14 is a beta emitter. What does it decay into?", "Check that the top numbers and the bottom numbers balance on each side."],
});
