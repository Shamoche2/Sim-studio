const { C, text, rect, circle } = Sim;
const ACIDS = { hcl: ["Hydrochloric acid (strong)", 1e7, "Cl⁻"], hno3: ["Nitric acid (strong)", 1e2, "NO₃⁻"], ethanoic: ["Ethanoic acid (weak)", 1.8e-5, "CH₃COO⁻"], citric: ["Citric acid (weak)", 7.4e-4, "citrate"], carbonic: ["Carbonic acid (weak)", 4.3e-7, "HCO₃⁻"] };
Sim({
  title: "Strong and Weak Acids",
  intro: "Acids release hydrogen ions (H⁺) in water. A strong acid splits up (dissociates) completely; a weak acid only partly, so most of its molecules stay whole. Strength is not the same as concentration!",
  controls: [
    { id: "acid", label: "Acid", type: "select", options: Object.entries(ACIDS).map(([k, v]) => [k, v[0]]) },
    { id: "c", label: "Concentration", min: 0.01, max: 1, step: 0.01, value: 0.1, unit: "mol/L", digits: 2 },
  ],
  readouts: [["diss", "Molecules dissociated"], ["H", "[H⁺]"], ["pH", "pH"]],
  calc(p) { const Ka = ACIDS[p.acid][1], c = p.c, x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * c)) / 2; return { frac: Math.min(1, x / c), H: x, pH: -Math.log10(x) }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const { frac } = this.calc(p), n = Math.round(p.c * 60) + 16, cols = 10, cw = (W * 0.6) / cols, ch = (H - 40) / Math.ceil(n / cols);
    rect(ctx, 10, 10, W * 0.6, H - 20, "rgba(116,192,252,.15)", C.text, 6, 2);
    let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const x = 10 + (i % cols) * cw + cw / 2, y = 20 + Math.floor(i / cols) * ch + ch / 2, split = rnd() < frac || (frac > 0.99);
      if (split) { circle(ctx, x - 9, y, 6, C.red); text(ctx, "H⁺", x - 9, y - 9, { align: "center", size: 9, color: C.red }); circle(ctx, x + 9, y + 4, 9, C.green); }
      else { circle(ctx, x - 5, y, 6, C.red); circle(ctx, x + 5, y, 9, C.green); }
    }
    const bx = W * 0.66; text(ctx, "Key", bx, 30, { weight: 700 });
    circle(ctx, bx + 6, 52, 6, C.red); circle(ctx, bx + 16, 52, 9, C.green); text(ctx, "whole acid molecule (HA)", bx + 32, 56, { size: 12 });
    circle(ctx, bx + 6, 82, 6, C.red); text(ctx, "H⁺ ion", bx + 18, 86, { size: 12 }); circle(ctx, bx + 80, 82, 9, C.green); text(ctx, ACIDS[p.acid][2] + " ion", bx + 94, 86, { size: 12 });
    text(ctx, `HA ⇌ H⁺ + A⁻`, bx, 130, { size: 18, weight: 700 });
    text(ctx, `${(frac * 100).toPrecision(3)}% dissociated`, bx, 160, { weight: 700, color: frac > 0.9 ? C.red : C.blue });
  },
  read(s, p) { const r = this.calc(p); return { diss: (r.frac * 100).toPrecision(3) + "%", H: r.H.toExponential(2) + " mol/L", pH: r.pH.toFixed(2) }; },
  keyIdea: "<b>Key idea:</b> strong acids (HCl, HNO₃, H₂SO₄) dissociate completely; weak acids (ethanoic, citric, carbonic) only partly. At the same concentration, a strong acid has more H⁺ ions and a lower pH. A dilute strong acid can have a higher pH than a concentrated weak one.",
  tryThis: ["Compare 0.1 mol/L hydrochloric acid and 0.1 mol/L ethanoic acid. Which has the lower pH?", "Find a concentration of hydrochloric acid with the same pH as 1 mol/L ethanoic acid.", "Why does diluting a weak acid increase the fraction that dissociates?"],
});
