const { C, line, text, rect, circle } = Sim;
function resistor(ctx, x, y, horizontal, label, I) {
  const glow = Math.min(1, I / 2);
  if (horizontal) rect(ctx, x - 26, y - 10, 52, 20, `rgba(255,${180 - glow * 120},0,${0.25 + glow * 0.75})`, C.text, 3, 2);
  else rect(ctx, x - 10, y - 26, 20, 52, `rgba(255,${180 - glow * 120},0,${0.25 + glow * 0.75})`, C.text, 3, 2);
  text(ctx, label, horizontal ? x : x + 16, horizontal ? y - 16 : y + 4, { align: horizontal ? "center" : "left", size: 12, weight: 600 });
}
Sim({
  title: "Series and Parallel Circuits",
  intro: "Two resistors can be connected one after the other (series) or side by side (parallel). Compare how the current splits and how bright each resistor glows.",
  controls: [
    { id: "mode", label: "Connection", type: "select", options: [["series", "Series"], ["parallel", "Parallel"]] },
    { id: "V", label: "Battery voltage", min: 1, max: 24, step: 1, value: 12, unit: "V" },
    { id: "R1", label: "Resistor R₁", min: 1, max: 50, step: 1, value: 10, unit: "Ω" },
    { id: "R2", label: "Resistor R₂", min: 1, max: 50, step: 1, value: 20, unit: "Ω" },
  ],
  readouts: [["Rt", "Total resistance"], ["It", "Total current"], ["I1", "Current in R₁"], ["I2", "Current in R₂"], ["V1", "Voltage across R₁"], ["V2", "Voltage across R₂"]],
  calc(p) {
    if (p.mode === "series") { const Rt = p.R1 + p.R2, I = p.V / Rt; return { Rt, It: I, I1: I, I2: I, V1: I * p.R1, V2: I * p.R2 }; }
    const Rt = 1 / (1 / p.R1 + 1 / p.R2); return { Rt, It: p.V / Rt, I1: p.V / p.R1, I2: p.V / p.R2, V1: p.V, V2: p.V };
  },
  draw({ ctx, W, H }, s, p) {
    const r = this.calc(p), x1 = W * 0.15, x2 = W * 0.85, y1 = H * 0.18, y2 = H * 0.82, cx = (x1 + x2) / 2;
    rect(ctx, 0, 0, W, H, "#fff");
    ctx.strokeStyle = C.text; ctx.lineWidth = 3;
    // battery left side
    line(ctx, x1, y1, x2, y1, C.text, 3); line(ctx, x1, y2, x2, y2, C.text, 3); line(ctx, x1, y1, x1, y2, C.text, 3);
    rect(ctx, x1 - 20, (y1 + y2) / 2 - 22, 40, 44, "#fff");
    line(ctx, x1 - 18, (y1 + y2) / 2 - 6, x1 + 18, (y1 + y2) / 2 - 6, C.text, 3);
    line(ctx, x1 - 9, (y1 + y2) / 2 + 8, x1 + 9, (y1 + y2) / 2 + 8, C.text, 6);
    text(ctx, p.V + " V", x1 - 26, (y1 + y2) / 2 + 5, { align: "right", weight: 700 });
    if (p.mode === "series") {
      line(ctx, x2, y1, x2, y2, C.text, 3);
      resistor(ctx, cx - 60, y1, true, `R₁ ${p.R1} Ω`, r.I1);
      resistor(ctx, cx + 60, y1, true, `R₂ ${p.R2} Ω`, r.I2);
    } else {
      const xa = cx + 20, xb = x2;
      line(ctx, xa, y1, xa, y2, C.text, 3); line(ctx, xb, y1, xb, y2, C.text, 3);
      resistor(ctx, xa, (y1 + y2) / 2, false, `R₁ ${p.R1} Ω`, r.I1);
      resistor(ctx, xb, (y1 + y2) / 2, false, `R₂ ${p.R2} Ω`, r.I2);
      text(ctx, r.I1.toFixed(2) + " A", xa - 14, (y1 + y2) / 2 + 48, { align: "right", color: C.blue, weight: 600 });
      text(ctx, r.I2.toFixed(2) + " A", xb - 14, (y1 + y2) / 2 + 48, { align: "right", color: C.blue, weight: 600 });
      circle(ctx, xa, y1, 4, C.text); circle(ctx, xa, y2, 4, C.text);
    }
    text(ctx, `Total current ${r.It.toFixed(2)} A`, cx, y2 + 30, { align: "center", color: C.blue, weight: 700, size: 15 });
  },
  read(s, p) {
    const r = this.calc(p), f = (v, u) => v.toFixed(2) + " " + u;
    return { Rt: f(r.Rt, "Ω"), It: f(r.It, "A"), I1: f(r.I1, "A"), I2: f(r.I2, "A"), V1: f(r.V1, "V"), V2: f(r.V2, "V") };
  },
  keyIdea: "<b>Key idea:</b> series: R = R₁ + R₂, same current everywhere, voltages add up. Parallel: 1/R = 1/R₁ + 1/R₂, same voltage across each, currents add up.",
  tryThis: ["In series, which resistor gets the bigger share of the voltage?", "Switch to parallel. Is the total resistance bigger or smaller than either resistor alone?", "In parallel, which resistor carries more current: the big one or the small one?"],
  note: "Brighter orange = more power in that resistor.",
});
