const { C, text, rect, circle } = Sim;
const SOLUTES = { cuso4: { name: "Copper(II) sulfate", M: 159.6, rgb: [30, 110, 220], eps: 12 }, kmno4: { name: "Potassium permanganate", M: 158.0, rgb: [140, 20, 140], eps: 2400 }, nicl2: { name: "Nickel(II) chloride", M: 129.6, rgb: [40, 160, 70], eps: 6 } };
Sim({
  title: "Concentration and Dilution",
  intro: "Dissolve a solid in water to make a solution. Concentration is how much solute is in each litre. Add more water and the same amount of solute is spread out, so the colour fades.",
  controls: [
    { id: "sol", label: "Solute", type: "select", options: Object.entries(SOLUTES).map(([k, v]) => [k, v.name]) },
    { id: "g", label: "Mass of solute", min: 0, max: 20, step: 0.1, value: 4, unit: "g", digits: 1 },
    { id: "V", label: "Volume of solution", min: 100, max: 1000, step: 10, value: 250, unit: "mL" },
  ],
  readouts: [["mol", "Moles of solute"], ["c", "Concentration"], ["gL", "Mass concentration"], ["A", "Absorbance (1 cm)"]],
  calc(p) { const d = SOLUTES[p.sol], n = p.g / d.M, c = n / (p.V / 1000); return { n, c, A: d.eps * c * 1 * (p.sol === "kmno4" ? 0.01 : 1) }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const d = SOLUTES[p.sol], { n, c, A } = this.calc(p);
    const bw = W * 0.34, bh = H * 0.8, bx = W * 0.12, by = H * 0.1, fill = (p.V / 1000) * 0.95;
    const trans = Math.pow(10, -Math.min(3, A)), alpha = 1 - trans;
    rect(ctx, bx, by + bh * (1 - fill), bw, bh * fill, `rgba(${d.rgb.join(",")},${0.08 + alpha * 0.9})`);
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    for (let ml = 200; ml <= 1000; ml += 200) { const y = by + bh * (1 - (ml / 1000) * 0.95); Sim.line(ctx, bx, y, bx + 14, y, C.text, 1.5); text(ctx, ml + " mL", bx + 18, y + 4, { size: 11, color: C.muted }); }
    // particles representation
    const count = Math.round(n * 400), area = { x: bx + 4, y: by + bh * (1 - fill) + 4, w: bw - 8, h: bh * fill - 8 };
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < Math.min(count, 600); i++) circle(ctx, area.x + rnd() * area.w, area.y + rnd() * area.h, 2.2, `rgb(${d.rgb.join(",")})`);
    // light beam (colorimeter)
    const lx = W * 0.58, ly = H * 0.45;
    text(ctx, "Colorimeter", lx, ly - 50, { weight: 700 });
    rect(ctx, lx, ly - 25, 40, 50, "#ffe066", C.text, 6); text(ctx, "light", lx + 20, ly + 42, { align: "center", size: 11 });
    rect(ctx, lx + 70, ly - 30, 40, 60, `rgba(${d.rgb.join(",")},${0.08 + alpha * 0.9})`, C.text, 2);
    rect(ctx, lx + 140, ly - 25, 40, 50, "#dee2e6", C.text, 6); text(ctx, "detector", lx + 160, ly + 42, { align: "center", size: 11 });
    ctx.globalAlpha = 0.8; rect(ctx, lx + 40, ly - 5, 30, 10, "#ffd43b"); ctx.globalAlpha = Math.max(0.05, trans); rect(ctx, lx + 110, ly - 5, 30, 10, "#ffd43b"); ctx.globalAlpha = 1;
    text(ctx, `${(trans * 100).toFixed(0)}% of light gets through`, lx, ly + 80, { weight: 600 });
    text(ctx, `c = n ÷ V = ${n.toFixed(4)} ÷ ${(p.V / 1000).toFixed(3)} = ${c.toFixed(3)} mol/L`, lx, ly + 110, { color: C.muted });
  },
  read(s, p) { const { n, c, A } = this.calc(p); return { mol: n.toFixed(4) + " mol", c: c.toFixed(3) + " mol/L", gL: (p.g / (p.V / 1000)).toFixed(1) + " g/L", A: A.toFixed(3) }; },
  keyIdea: "<b>Key idea:</b> concentration c = n / V (mol/L). Diluting keeps the moles the same, so c₁V₁ = c₂V₂. The Beer–Lambert law says absorbance is proportional to concentration.",
  tryThis: ["Double the volume. What happens to the concentration?", "Double the mass of solute. What happens to the absorbance?", "What mass of copper sulfate gives a 0.1 mol/L solution in 250 mL?"],
  note: "Absorbance values are approximate.",
});
