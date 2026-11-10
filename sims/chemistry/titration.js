const { C, text, rect, plot } = Sim;
const INDICATORS = { phenol: { name: "Phenolphthalein", lo: 8.2, hi: 10, a: "rgba(255,255,255,0)", b: "rgba(214,51,108,.75)" }, methyl: { name: "Methyl orange", lo: 3.1, hi: 4.4, a: "rgba(224,49,49,.75)", b: "rgba(245,180,30,.75)" }, btb: { name: "Bromothymol blue", lo: 6, hi: 7.6, a: "rgba(240,200,30,.75)", b: "rgba(40,100,220,.75)" } };
function mix(c1, c2, t) { const a = c1.match(/[\d.]+/g).map(Number), b = c2.match(/[\d.]+/g).map(Number); return `rgba(${a.map((v, i) => (i < 3 ? Math.round(v + (b[i] - v) * t) : (v + (b[i] - v) * t).toFixed(2))).join(",")})`; }
Sim({
  title: "Acid–Base Titration",
  intro: "Add sodium hydroxide (NaOH) from a burette to 25 mL of acid in a flask. The pH changes slowly at first, then jumps at the equivalence point, where the acid is exactly neutralised.",
  controls: [
    { id: "acid", label: "Acid in the flask (0.10 mol/L)", type: "select", options: [["strong", "Hydrochloric acid (strong)"], ["weak", "Ethanoic acid (weak)"]] },
    { id: "ind", label: "Indicator", type: "select", options: Object.entries(INDICATORS).map(([k, v]) => [k, v.name]) },
    { id: "vb", label: "NaOH added (0.10 mol/L)", min: 0, max: 50, step: 0.1, value: 0, unit: "mL", digits: 1 },
  ],
  readouts: [["pH", "pH"], ["eq", "Equivalence point"], ["stage", "Stage"]],
  pH(acid, vb) {
    const Ca = 0.1, Va = 25, Cb = 0.1, na = Ca * Va, nb = Cb * vb, Vt = (Va + vb) / 1000, Kw = 1e-14;
    if (acid === "strong") {
      if (nb < na) return -Math.log10((na - nb) / 1000 / Vt);
      if (nb > na) return 14 + Math.log10((nb - na) / 1000 / Vt);
      return 7;
    }
    const Ka = 1.8e-5;
    if (nb === 0) { const c = na / 1000 / Vt; return -Math.log10((-Ka + Math.sqrt(Ka * Ka + 4 * Ka * c)) / 2); }
    if (nb < na) return -Math.log10(Ka) + Math.log10(nb / (na - nb));
    if (nb === na) { const c = na / 1000 / Vt, Kb = Kw / Ka; return 14 + Math.log10(Math.sqrt(Kb * c)); }
    return 14 + Math.log10((nb - na) / 1000 / Vt);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.32, pH = this.pH(p.acid, p.vb), ind = INDICATORS[p.ind];
    rect(ctx, 0, 0, left, H, "#fff");
    // burette
    const bx = left / 2, bTop = 10, bH = H * 0.45;
    rect(ctx, bx - 8, bTop, 16, bH, "#f1f3f5", C.text, 2, 1.5);
    const level = (p.vb / 50) * bH;
    rect(ctx, bx - 6, bTop + level, 12, bH - level, "rgba(47,111,237,.25)");
    for (let i = 0; i <= 50; i += 10) text(ctx, String(i), bx + 12, bTop + (i / 50) * bH + 4, { size: 10, color: C.muted });
    rect(ctx, bx - 2, bTop + bH, 4, 18, C.gray);
    // flask
    const fy = bTop + bH + 30, fh = H - fy - 10, fw = Math.min(left * 0.7, fh * 1.2);
    const t = Sim.clamp((pH - ind.lo) / (ind.hi - ind.lo), 0, 1);
    ctx.beginPath(); ctx.moveTo(bx - 10, fy); ctx.lineTo(bx + 10, fy); ctx.lineTo(bx + 10, fy + fh * 0.3); ctx.lineTo(bx + fw / 2, fy + fh); ctx.lineTo(bx - fw / 2, fy + fh); ctx.lineTo(bx - 10, fy + fh * 0.3); ctx.closePath();
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.fillStyle = mix(ind.a, ind.b, t); ctx.fill(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
    const curve = Array.from({ length: 501 }, (_, i) => [i / 10, this.pH(p.acid, i / 10)]);
    plot(ctx, { x: left + 6, y: 10, w: W - left - 16, h: H - 20 }, { title: "Titration curve", xmin: 0, xmax: 50, ymin: 0, ymax: 14, ystep: 2, xlabel: "NaOH added (mL)", ylabel: "pH", series: [{ data: curve, color: C.gray, width: 2 }], marks: [{ x: p.vb, y: pH, color: C.red }], vlines: [{ x: 25, color: C.green, label: "equivalence" }], hlines: [{ y: ind.lo, color: "#adb5bd" }, { y: ind.hi, color: "#adb5bd" }] });
  },
  read(s, p) { const pH = this.pH(p.acid, p.vb); return { pH: pH.toFixed(2), eq: `25.0 mL (pH ${this.pH(p.acid, 25).toFixed(1)})`, stage: p.vb < 24.9 ? "excess acid" : p.vb > 25.1 ? "excess alkali" : "equivalence point" }; },
  keyIdea: "<b>Key idea:</b> at the equivalence point, moles of acid = moles of base. A good indicator changes colour inside the steep jump. For a weak acid the equivalence point is above pH 7, so phenolphthalein works but methyl orange doesn't.",
  tryThis: ["Add NaOH slowly near 25 mL. How much does 0.2 mL change the pH?", "Switch to ethanoic acid. What is the pH at the equivalence point?", "Which indicator would give the wrong answer for the weak acid titration? Why?"],
});
