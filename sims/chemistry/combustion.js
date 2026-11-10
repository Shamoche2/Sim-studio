const { C, text, rect } = Sim;
Sim({
  title: "Complete and Incomplete Combustion",
  intro: "When a fuel like methane burns with plenty of oxygen, it makes carbon dioxide and water: complete combustion. With too little oxygen, poisonous carbon monoxide and sooty carbon form instead. That's why gas appliances need ventilation.",
  controls: [{ id: "air", label: "Air hole on the Bunsen burner", min: 0, max: 100, step: 5, value: 100, unit: "% open" }],
  readouts: [["type", "Combustion"], ["products", "Products"], ["energy", "Energy released"], ["flame", "Flame"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  ox(p) { return 1 + (p.air / 100) * 1.2; }, // moles of O2 per CH4 available (complete needs 2)
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const cx = W * 0.3, base = H - 60, o = this.ox(p), complete = o >= 2;
    rect(ctx, cx - 14, base, 28, 50, "#868e96"); rect(ctx, cx - 40, base + 40, 80, 14, "#495057");
    rect(ctx, cx - 14, base + 22, 28, 10, "#212529"); rect(ctx, cx - 14, base + 22, 28 * (p.air / 100), 10, "#adb5bd");
    const blue = p.air / 100;
    for (let i = 0; i < 3; i++) {
      const h = H * (0.62 - blue * 0.25 - i * 0.1) * (1 + 0.04 * Math.sin(s.t * 10 + i)), w = 34 - i * 8;
      ctx.beginPath(); ctx.moveTo(cx - w / 2, base); ctx.quadraticCurveTo(cx - w, base - h * 0.5, cx + Math.sin(s.t * 5) * (1 - blue) * 6, base - h); ctx.quadraticCurveTo(cx + w, base - h * 0.5, cx + w / 2, base); ctx.closePath();
      ctx.fillStyle = `rgba(${Math.round(255 - blue * 200)},${Math.round(160 - blue * 30)},${Math.round(30 + blue * 220)},${0.5 + i * 0.15})`; ctx.fill();
    }
    if (!complete) for (let i = 0; i < 12; i++) Sim.circle(ctx, cx + Math.sin(i * 2 + s.t) * 20, base - H * 0.6 - ((s.t * 40 + i * 25) % 120), 3 + (i % 3), "rgba(33,37,41,.35)");
    const bx = W * 0.52;
    text(ctx, "Word equation", bx, 40, { weight: 700 });
    text(ctx, complete ? "methane + oxygen → carbon dioxide + water" : o > 1.5 ? "methane + oxygen → carbon monoxide + water" : "methane + oxygen → carbon (soot) + CO + water", bx, 66, { size: 13 });
    text(ctx, complete ? "CH₄ + 2O₂ → CO₂ + 2H₂O" : o > 1.5 ? "2CH₄ + 3O₂ → 2CO + 4H₂O" : "CH₄ + O₂ → C + 2H₂O", bx, 100, { size: 18, weight: 700, color: complete ? C.blue : C.orange });
    if (!complete) text(ctx, "⚠ Carbon monoxide is colourless, odourless and poisonous", bx, 136, { color: C.red, weight: 700, size: 12 });
  },
  read(s, p) { const o = this.ox(p), complete = o >= 2; return { type: complete ? "complete" : "incomplete", products: complete ? "CO₂ + H₂O" : o > 1.5 ? "CO + H₂O (some soot)" : "C (soot) + CO + H₂O", energy: complete ? "890 kJ/mol (maximum)" : `about ${Math.round(890 * (0.45 + (o - 1) * 0.4))} kJ/mol (less)`, flame: complete ? "blue, roaring, hot" : "yellow, smoky, cooler" }; },
  keyIdea: "<b>Key idea:</b> complete combustion needs plenty of oxygen and releases the most energy. Incomplete combustion releases less energy and makes carbon monoxide (toxic) and soot. A yellow flame means incomplete combustion.",
  tryThis: ["Close the air hole. What colour does the flame become? Why?", "Why do homes with gas boilers need carbon monoxide detectors?", "Which flame would you use to heat a test tube quickly: blue or yellow?"],
});
