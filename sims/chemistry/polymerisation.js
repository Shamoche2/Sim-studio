const { C, text, rect, circle, line } = Sim;
const MONO = { ethene: ["Ethene → poly(ethene)", "H", "plastic bags, bottles"], propene: ["Propene → poly(propene)", "CH₃", "ropes, crates, food containers"], chloroethene: ["Chloroethene → PVC", "Cl", "window frames, pipes"], styrene: ["Styrene → polystyrene", "C₆H₅", "packaging, cups"] };
Sim({
  title: "Addition Polymerisation",
  intro: "Small molecules called monomers, each with a C=C double bond, join end to end to make a long chain called a polymer. The double bond opens up and links to the next monomer. Press Play to watch the chain grow.",
  controls: [
    { id: "mono", label: "Monomer", type: "select", options: Object.entries(MONO).map(([k, v]) => [k, v[0]]) },
  ],
  readouts: [["n", "Monomers joined"], ["repeat", "Repeating unit"], ["use", "Uses"]],
  init(s) { s.n = 0; s.acc = 0; },
  change(s) { s.n = 0; },
  step(s, p, dt) { s.acc += dt; if (s.acc > 0.6 && s.n < 8) { s.acc = 0; s.n++; } },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const X = MONO[p.mono][1], cy = H * 0.62, step = Math.min(70, (W - 60) / 16), b = 30;
    const atom = (x, y, sym) => { circle(ctx, x, y, sym === "H" ? 10 : sym === "C" ? 13 : 15, sym === "H" ? "#f8f9fa" : sym === "C" ? "#adb5bd" : sym === "Cl" ? "#b2f2bb" : "#ffd8a8", C.text, 1); text(ctx, sym, x, y + 4, { align: "center", size: sym.length > 2 ? 9 : 12, weight: 700 }); };
    // free monomers on top
    for (let k = s.n; k < 8; k++) {
      const x = 40 + (k - s.n) * (step * 2.2 + 10), y = H * 0.2;
      line(ctx, x, y - 3, x + step, y - 3, C.text, 2); line(ctx, x, y + 3, x + step, y + 3, C.text, 2);
      for (const [dx, sym] of [[0, "H"], [step, "H"]]) { line(ctx, x + dx, y, x + dx, y - b * 0.8, C.text, 1.5); atom(x + dx, y - b * 0.8, sym); }
      line(ctx, x, y, x, y + b * 0.8, C.text, 1.5); atom(x, y + b * 0.8, "H"); line(ctx, x + step, y, x + step, y + b * 0.8, C.text, 1.5); atom(x + step, y + b * 0.8, X);
      atom(x, y, "C"); atom(x + step, y, "C");
    }
    text(ctx, "monomers (C=C double bond)", 20, 20, { size: 12, color: C.muted });
    // chain
    const len = s.n * 2;
    if (len) {
      line(ctx, 20, cy, 30 + len * step, cy, C.text, 2.5);
      for (let i = 0; i < len; i++) { const x = 30 + i * step + step / 2; line(ctx, x, cy, x, cy - b, C.text, 1.5); atom(x, cy - b, "H"); line(ctx, x, cy, x, cy + b, C.text, 1.5); atom(x, cy + b, i % 2 ? X : "H"); atom(x, cy, "C"); }
      text(ctx, "polymer chain (single bonds only)", 20, cy - b - 24, { size: 12, color: C.muted });
      rect(ctx, 30, cy - b - 14, step * 2, 2 * b + 28, null, C.red, 6, 2); text(ctx, "repeating unit", 30 + step, cy + b + 30, { align: "center", color: C.red, size: 11, weight: 600 });
    }
  },
  read(s, p) { const X = MONO[p.mono][1]; return { n: String(s.n) + " (real chains have thousands)", repeat: `–[CH₂–CH${X === "H" ? "₂" : "(" + X + ")"}]ₙ–`, use: MONO[p.mono][2] }; },
  keyIdea: "<b>Key idea:</b> in addition polymerisation, the C=C double bond in each monomer breaks and joins to its neighbours. Nothing else is produced. The polymer has the same atoms as the monomers, just linked into a long chain.",
  tryThis: ["Count the atoms in one monomer and in the repeating unit. Are they the same?", "What does the polymer lack that the monomer had?", "Why are many plastics hard to dispose of? (Think about their strong C–C bonds.)"],
});
