const { C, text, rect, line, plot } = Sim;
Sim({
  title: "Charging and Discharging a Capacitor",
  intro: "A capacitor stores charge on two plates. Connected to a battery through a resistor it charges up quickly at first, then more and more slowly. The time constant RC sets how fast.",
  controls: [
    { id: "R", label: "Resistance", min: 1, max: 20, step: 1, value: 10, unit: "kΩ" },
    { id: "Cap", label: "Capacitance", min: 50, max: 500, step: 50, value: 200, unit: "μF" },
    { id: "V0", label: "Battery voltage", min: 1, max: 12, step: 1, value: 6, unit: "V" },
  ],
  buttons: [{ label: "Charge", primary: true, click(s) { s.mode = "charge"; s.t = 0; s.v0 = s.V; s.hist = [[0, s.V]]; } }, { label: "Discharge", click(s) { s.mode = "discharge"; s.t = 0; s.v0 = s.V; s.hist = [[0, s.V]]; } }],
  readouts: [["V", "Capacitor voltage"], ["I", "Current"], ["Q", "Charge stored"], ["tau", "Time constant RC"]],
  init(s) { s.V = 0; s.t = 0; s.mode = "charge"; s.v0 = 0; s.hist = [[0, 0]]; },
  step(s, p, dt) {
    const tau = (p.R * 1e3 * p.Cap * 1e-6); s.t += dt;
    s.V = s.mode === "charge" ? p.V0 + (s.v0 - p.V0) * Math.exp(-s.t / tau) : s.v0 * Math.exp(-s.t / tau);
    if (s.t < 12 && s.t - s.hist.at(-1)[0] > 0.03) s.hist.push([s.t, s.V]);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.38, x1 = 30, x2 = left - 30, y1 = 40, y2 = H - 40, tau = (p.R * p.Cap) / 1000;
    ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    rect(ctx, x1 - 14, (y1 + y2) / 2 - 20, 28, 40, "#fff"); line(ctx, x1 - 12, (y1 + y2) / 2 - 5, x1 + 12, (y1 + y2) / 2 - 5, C.text, 3); line(ctx, x1 - 6, (y1 + y2) / 2 + 6, x1 + 6, (y1 + y2) / 2 + 6, C.text, 5);
    text(ctx, s.mode === "charge" ? `${p.V0} V battery` : "battery disconnected", x1 + 16, (y1 + y2) / 2 + 4, { size: 11 });
    rect(ctx, (x1 + x2) / 2 - 22, y1 - 8, 44, 16, "#fff", C.text, 2, 1.5); text(ctx, p.R + " kΩ", (x1 + x2) / 2, y1 - 14, { align: "center", size: 11 });
    const cy = (y1 + y2) / 2; rect(ctx, x2 - 20, cy - 14, 40, 28, "#fff"); line(ctx, x2 - 16, cy - 6, x2 + 16, cy - 6, C.text, 4); line(ctx, x2 - 16, cy + 6, x2 + 16, cy + 6, C.text, 4);
    const q = Math.round((s.V / 12) * 8);
    for (let i = 0; i < q; i++) { text(ctx, "+", x2 - 14 + i * 4, cy - 10, { size: 10, color: C.red, weight: 700 }); text(ctx, "−", x2 - 14 + i * 4, cy + 18, { size: 10, color: C.blue, weight: 700 }); }
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: s.mode === "charge" ? "Charging" : "Discharging", xmin: 0, xmax: 12, ymin: 0, ymax: 12.5, xlabel: "time (s)", ylabel: "capacitor voltage (V)", series: [{ data: s.hist, color: C.blue }], vlines: [1, 2, 3].map((k) => ({ x: k * tau, color: "#ced4da", label: k + "RC" })) });
  },
  read(s, p) { const R = p.R * 1e3, I = s.mode === "charge" ? (p.V0 - s.V) / R : s.V / R; return { V: s.V.toFixed(2) + " V", I: (I * 1000).toFixed(3) + " mA", Q: (p.Cap * s.V).toFixed(0) + " μC", tau: ((R * p.Cap * 1e-6)).toFixed(2) + " s" }; },
  keyIdea: "<b>Key idea:</b> after one time constant (τ = RC), a charging capacitor reaches about 63% of the battery voltage; a discharging one falls to about 37%. Q = C × V.",
  tryThis: ["Charge the capacitor. What voltage is it at after one time constant (the 1RC line)?", "Double the resistance. How does the charging time change?", "Why does the current get smaller as the capacitor charges?"],
});
