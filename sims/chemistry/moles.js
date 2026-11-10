const { C, text, rect, circle } = Sim;
const SUBS = { H2O: ["Water", 18.02], NaCl: ["Sodium chloride", 58.44], CO2: ["Carbon dioxide", 44.01], C: ["Carbon", 12.01], Fe: ["Iron", 55.85], C6H12O6: ["Glucose", 180.16], CaCO3: ["Calcium carbonate", 100.09] };
Sim({
  title: "The Mole",
  intro: "Atoms are far too small to count, so chemists count them in moles. One mole of anything contains 6.02 × 10²³ particles, and its mass in grams equals its relative formula mass.",
  controls: [
    { id: "sub", label: "Substance", type: "select", options: Object.entries(SUBS).map(([k, v]) => [k, `${v[0]} (Mr = ${v[1]})`]) },
    { id: "g", label: "Mass weighed out", min: 1, max: 200, step: 1, value: 36, unit: "g" },
  ],
  readouts: [["n", "Moles"], ["N", "Number of particles"], ["Mr", "Molar mass"], ["eq", "Calculation"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const [name, Mr] = SUBS[p.sub], n = p.g / Mr;
    // scale
    const cx = W * 0.25, base = H * 0.72;
    rect(ctx, cx - 90, base, 180, 12, C.gray, null, 3); rect(ctx, cx - 60, base + 12, 120, 44, "#495057", null, 6);
    rect(ctx, cx - 44, base + 20, 88, 26, "#a9e34b", null, 3); text(ctx, p.g + " g", cx, base + 38, { align: "center", weight: 700 });
    const pile = Math.min(60, Math.round(p.g / 4));
    for (let i = 0; i < pile; i++) circle(ctx, cx - 50 + (i % 12) * 9, base - 6 - Math.floor(i / 12) * 8, 4.5, C.blue);
    text(ctx, name, cx, base - 70, { align: "center", weight: 700 });
    // mole "bags"
    const bx = W * 0.52, full = Math.floor(n), frac = n - full;
    text(ctx, "Moles (each bag = 6.02 × 10²³ particles)", bx, 24, { weight: 700, size: 13 });
    for (let i = 0; i < Math.min(full + (frac > 0.01 ? 1 : 0), 24); i++) {
      const x = bx + (i % 6) * 66, y = 40 + Math.floor(i / 6) * 66, f = i < full ? 1 : frac;
      rect(ctx, x, y, 56, 56, "#f1f3f5", C.text, 8, 1.5); rect(ctx, x, y + 56 * (1 - f), 56, 56 * f, "rgba(75,91,220,.45)", null, 8);
      text(ctx, i < full ? "1 mol" : f.toFixed(2), x + 28, y + 33, { align: "center", size: 12, weight: 600 });
    }
    if (full > 24) text(ctx, `…${full} bags in total`, bx, H - 14, { color: C.muted });
  },
  read(s, p) { const [, Mr] = SUBS[p.sub], n = p.g / Mr, N = n * 6.02e23, e = Math.floor(Math.log10(N)); return { n: n.toFixed(3) + " mol", N: `${(N / 10 ** e).toFixed(2)} × 10^${e}`, Mr: Mr + " g/mol", eq: `${p.g} g ÷ ${Mr} g/mol` }; },
  keyIdea: "<b>Key idea:</b> moles = mass ÷ molar mass (n = m / M). Number of particles = moles × 6.02 × 10²³ (Avogadro's constant).",
  tryThis: ["How many grams of water make exactly 1 mole? 2 moles?", "Which contains more particles: 12 g of carbon or 18 g of water?", "How many moles are in 100 g of calcium carbonate?"],
});
