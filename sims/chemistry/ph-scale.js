const { C, text, rect } = Sim;
const LIQUIDS = [["Battery acid", 0.8], ["Lemon juice", 2.2], ["Vinegar", 2.9], ["Orange juice", 3.5], ["Coffee", 5], ["Milk", 6.6], ["Pure water", 7], ["Blood", 7.4], ["Sea water", 8.1], ["Baking soda solution", 8.3], ["Soap", 10], ["Ammonia cleaner", 11.5], ["Bleach", 12.5], ["Drain cleaner", 13.8]];
const indicator = (pH) => { const stops = [[0, [220, 30, 30]], [3, [245, 120, 30]], [5, [245, 220, 40]], [7, [60, 170, 60]], [9, [40, 120, 200]], [11, [70, 60, 180]], [14, [120, 40, 140]]]; for (let i = 1; i < stops.length; i++) if (pH <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i], t = (pH - a) / (b - a); return `rgb(${ca.map((v, k) => Math.round(v + (cb[k] - v) * t)).join(",")})`; } return "rgb(120,40,140)"; };
Sim({
  title: "The pH Scale",
  intro: "pH measures how acidic or alkaline a solution is, from 0 (strongly acidic) to 14 (strongly alkaline). Pick a liquid, add universal indicator, and dilute it with water.",
  controls: [
    { id: "liq", label: "Liquid", type: "select", options: LIQUIDS.map(([n], i) => [i, n]), value: 1 },
    { id: "dil", label: "Dilute with water", min: 0, max: 4, step: 0.1, value: 0, format: (v) => `${Math.round(10 ** v)}× `, help: "Each 10× dilution moves pH one unit towards 7." },
  ],
  readouts: [["pH", "pH"], ["type", "Type"], ["H", "[H⁺]"], ["OH", "[OH⁻]"]],
  pH(p) { const p0 = LIQUIDS[p.liq][1]; return p0 < 7 ? Math.min(7, p0 + p.dil) : Math.max(7, p0 - p.dil); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const pH = this.pH(p), bx = W * 0.1, bw = W * 0.28, by = H * 0.18, bh = H * 0.62;
    const fill = 0.35 + (p.dil / 4) * 0.55;
    rect(ctx, bx, by + bh * (1 - fill), bw, bh * fill, indicator(pH), null);
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    text(ctx, LIQUIDS[p.liq][0], bx + bw / 2, by + bh + 24, { align: "center", weight: 600 });
    // scale
    const sx = W * 0.48, sw = W * 0.48, sy = H * 0.4;
    for (let i = 0; i < 14; i++) rect(ctx, sx + (i * sw) / 14, sy, sw / 14 + 1, 40, indicator(i + 0.5));
    for (let i = 0; i <= 14; i++) text(ctx, String(i), sx + (i * sw) / 14, sy + 58, { align: "center", size: 12 });
    const mx = sx + (pH / 14) * sw;
    ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(mx, sy - 4); ctx.lineTo(mx - 9, sy - 18); ctx.lineTo(mx + 9, sy - 18); ctx.fill();
    text(ctx, `pH ${pH.toFixed(1)}`, mx, sy - 24, { align: "center", weight: 700, size: 16 });
    text(ctx, "acidic", sx, sy + 82, { color: C.red, weight: 600 }); text(ctx, "neutral", sx + sw / 2, sy + 82, { color: C.green, weight: 600, align: "center" }); text(ctx, "alkaline", sx + sw, sy + 82, { color: C.purple, weight: 600, align: "right" });
  },
  read(s, p) {
    const pH = this.pH(p), sci = (x) => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(1)} × 10^${e} mol/L`; };
    return { pH: pH.toFixed(1), type: pH < 6.95 ? "acid" : pH > 7.05 ? "alkali" : "neutral", H: sci(10 ** -pH), OH: sci(10 ** -(14 - pH)) };
  },
  keyIdea: "<b>Key idea:</b> pH = −log[H⁺]. Each step on the scale is a <em>10×</em> change in H⁺ concentration. Diluting an acid or alkali moves its pH towards 7 but never past it.",
  tryThis: ["How many times more H⁺ does lemon juice (pH 2.2) have than coffee (pH 5)?", "Dilute vinegar 100×. What is its new pH?", "Can you make bleach acidic by adding water? Why not?"],
  note: "Dilution model assumes strong acids/alkalis; real weak acids change pH a little less.",
});
