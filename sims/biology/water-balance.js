const { C, text, rect, plot } = Sim;
Sim({
  title: "Water Balance and the Kidneys",
  intro: "Your kidneys keep the water level of your blood steady. If you're short of water, the pituitary gland releases ADH, which makes the kidneys reabsorb more water: you make a small amount of concentrated urine.",
  controls: [
    { id: "drink", label: "Drinking", min: 0, max: 3, step: 0.25, value: 1.5, unit: "L/day", digits: 2 },
    { id: "sweat", label: "Sweating (heat, exercise)", min: 0, max: 3, step: 0.25, value: 0.5, unit: "L/day", digits: 2 },
  ],
  readouts: [["blood", "Blood water level"], ["adh", "ADH released"], ["urine", "Urine produced"], ["colour", "Urine colour"]],
  init(s) { s.w = 0; s.t = 0; s.hist = []; s.adh = 0.5; },
  step(s, p, dt) {
    const h = dt * 2; s.t += h;
    s.adh = Sim.clamp(0.5 - s.w * 1.5, 0, 1);
    s.urine = Math.max(0.4, 2.2 * (1 - s.adh) + 0.4);
    s.w += (p.drink + 0.3 - p.sweat - 0.5 - s.urine * 0.5) * h * 0.1; s.w = Sim.clamp(s.w, -1, 1);
    if (!s.hist.length || s.t - s.hist.at(-1)[0] > 0.2) s.hist.push([s.t, s.w]); if (s.hist.length > 300) s.hist.shift();
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.38, cx = left / 2;
    ctx.beginPath(); ctx.ellipse(cx - 30, H * 0.3, 22, 40, 0.15, 0, Math.PI * 2); ctx.ellipse(cx + 30, H * 0.3, 22, 40, -0.15, 0, Math.PI * 2); ctx.fillStyle = "#c92a2a"; ctx.fill();
    text(ctx, "kidneys", cx, H * 0.3 + 58, { align: "center", size: 11 });
    const conc = s.adh, col = `rgb(${Math.round(255 - conc * 20)},${Math.round(240 - conc * 90)},${Math.round(150 - conc * 140)})`;
    const bh = H * 0.32 * Math.min(1, (s.urine || 1) / 2.6);
    rect(ctx, cx - 30, H - 30 - bh, 60, bh, col); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(cx - 30, H - 30 - H * 0.32, 60, H * 0.32);
    text(ctx, "bladder", cx, H - 12, { align: "center", size: 11 });
    text(ctx, `ADH ${"▮".repeat(Math.round(s.adh * 8))}`, 10, 20, { color: C.purple, weight: 700 });
    const t0 = Math.max(0, s.t - 40);
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Water level in the blood", xmin: t0, xmax: t0 + 40, ymin: -1, ymax: 1, xlabel: "time", ylabel: "water (relative)", series: [{ data: s.hist, color: C.blue }], hlines: [{ y: 0, color: C.green, label: "normal" }] });
  },
  read(s) { return { blood: Math.abs(s.w) < 0.08 ? "normal" : s.w < 0 ? "too low (dehydrated)" : "too high", adh: s.adh > 0.6 ? "high" : s.adh < 0.3 ? "low" : "normal", urine: (s.urine || 1).toFixed(1) + " L/day", colour: s.adh > 0.6 ? "dark yellow (concentrated)" : s.adh < 0.3 ? "pale (dilute)" : "straw coloured" }; },
  keyIdea: "<b>Key idea:</b> this is negative feedback. Low blood water → more ADH → kidney tubules reabsorb more water → less, more concentrated urine. High blood water → less ADH → more, dilute urine.",
  tryThis: ["Sweat a lot (3 L/day) without drinking more. What happens to ADH and urine?", "Drink 3 L/day. Why is the urine pale?", "Why does your urine look darker in the morning?"],
  note: "Simplified model of water balance.",
});
