const { C, line, text, rect, circle, plot } = Sim;
Sim({
  title: "Ohm's Law",
  intro: "A battery pushes current through a resistor. Change the voltage and resistance, and watch the current (the flow of charge) change on the meter and on the graph.",
  controls: [
    { id: "V", label: "Battery voltage", min: 0, max: 24, step: 0.5, value: 9, unit: "V", digits: 1 },
    { id: "R", label: "Resistance", min: 1, max: 100, step: 1, value: 10, unit: "Ω" },
  ],
  readouts: [["I", "Current"], ["P", "Power"], ["ratio", "V ÷ I"]],
  init(s) { s.phase = 0; },
  step(s, p, dt) { s.phase = (s.phase + (p.V / p.R) * dt * 40) % 1000; },
  draw({ ctx, W, H }, s, p) {
    const I = p.V / p.R, cw = W * 0.5, x1 = 50, x2 = cw - 30, y1 = 50, y2 = H - 50;
    rect(ctx, 0, 0, cw, H, "#fff");
    // wires
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    // battery on left
    rect(ctx, x1 - 18, (y1 + y2) / 2 - 30, 36, 60, "#fff");
    line(ctx, x1 - 16, (y1 + y2) / 2 - 8, x1 + 16, (y1 + y2) / 2 - 8, C.text, 3);
    line(ctx, x1 - 8, (y1 + y2) / 2 + 8, x1 + 8, (y1 + y2) / 2 + 8, C.text, 5);
    text(ctx, p.V.toFixed(1) + " V", x1 + 24, (y1 + y2) / 2 + 5, { weight: 600 });
    // resistor on right
    const ry = (y1 + y2) / 2;
    rect(ctx, x2 - 12, ry - 40, 24, 80, "#fff");
    ctx.beginPath(); ctx.moveTo(x2, ry - 40);
    for (let i = 1; i <= 8; i++) ctx.lineTo(x2 + (i % 2 ? 10 : -10), ry - 40 + i * 10);
    ctx.lineTo(x2, ry + 40); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, p.R + " Ω", x2 - 18, ry + 5, { align: "right", weight: 600 });
    // moving charges (conventional current, clockwise from + terminal)
    const per = 2 * (x2 - x1 + y2 - y1), n = 24;
    for (let i = 0; i < n; i++) {
      let d = ((i / n) * per + s.phase) % per, x, y;
      const wdt = x2 - x1, hgt = y2 - y1;
      if (d < wdt) { x = x1 + d; y = y1; } else if ((d -= wdt) < hgt) { x = x2; y = y1 + d; } else if ((d -= hgt) < wdt) { x = x2 - d; y = y2; } else { d -= wdt; x = x1; y = y2 - d; }
      circle(ctx, x, y, 4, C.yellow, "#a37b00", 1);
    }
    // ammeter
    rect(ctx, (x1 + x2) / 2 - 34, y1 - 22, 68, 44, "#fff", C.text, 22, 2);
    text(ctx, I.toFixed(2) + " A", (x1 + x2) / 2, y1 + 5, { align: "center", weight: 700 });
    // I-V graph
    const plotted = plot(ctx, { x: cw + 10, y: 10, w: W - cw - 20, h: H - 20 }, { title: "Current vs voltage", xmin: 0, xmax: 24, ymin: 0, ymax: Math.max(0.5, 24 / p.R) * 1.05, xlabel: "voltage (V)", ylabel: "current (A)", series: [{ data: [[0, 0], [24, 24 / p.R]], color: C.orange }], marks: [{ x: p.V, y: I, color: C.blue }] });
    void plotted;
  },
  read(s, p) { const I = p.V / p.R; return { I: I.toFixed(3) + " A", P: (p.V * I).toFixed(2) + " W", ratio: p.V > 0 ? (p.V / I).toFixed(1) + " Ω" : "—" }; },
  keyIdea: "<b>Key idea:</b> V = I × R. For a fixed resistor, current is proportional to voltage, so the graph is a straight line. A steeper line means a smaller resistance.",
  tryThis: ["Double the voltage. What happens to the current?", "Keep 12 V and change the resistance from 10 Ω to 20 Ω. What happens to the current?", "Which resistor gives the steepest line on the graph?"],
  note: "The yellow dots show conventional current (from + to −).",
});
