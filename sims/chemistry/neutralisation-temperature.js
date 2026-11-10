const { C, text, rect, plot } = Sim;
Sim({
  title: "Neutralisation: Temperature Change",
  intro: "Neutralisation is exothermic: it releases heat. Add sodium hydroxide to hydrochloric acid in an insulated cup and measure the temperature. The peak tells you when the acid is exactly neutralised.",
  controls: [
    { id: "cA", label: "Acid concentration (25 cm³ HCl)", min: 0.5, max: 2, step: 0.25, value: 1, unit: "mol/L", digits: 2 },
    { id: "cB", label: "Alkali concentration (NaOH)", min: 0.5, max: 2, step: 0.25, value: 1, unit: "mol/L", digits: 2 },
    { id: "v", label: "Alkali added", min: 0, max: 50, step: 1, value: 15, unit: "cm³" },
  ],
  readouts: [["T", "Temperature"], ["eq", "Neutralisation point"], ["rise", "Max temperature rise"]],
  T(p, v) { const nA = (p.cA * 25) / 1000, nB = (p.cB * v) / 1000, n = Math.min(nA, nB), Vt = 25 + v; return 20 + (n * 57100) / (Vt * 4.18); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.3, T = this.T(p, p.v), cx = left / 2;
    // polystyrene cup + thermometer
    ctx.fillStyle = "#f8f9fa"; ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 50, H * 0.4); ctx.lineTo(cx - 38, H - 30); ctx.lineTo(cx + 38, H - 30); ctx.lineTo(cx + 50, H * 0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
    rect(ctx, cx - 44, H * 0.4 + 30 + (1 - (25 + p.v) / 75) * 60, 88, H - 30 - (H * 0.4 + 30 + (1 - (25 + p.v) / 75) * 60), "rgba(116,192,252,.35)");
    rect(ctx, cx + 10, 20, 10, H * 0.65, "#fff", C.text, 5, 1.5); const f = (T - 15) / 30; rect(ctx, cx + 12, 20 + H * 0.65 * (1 - f), 6, H * 0.65 * f, C.red, null, 3);
    text(ctx, T.toFixed(1) + " °C", cx - 20, 30, { align: "center", weight: 700, color: C.red });
    const curve = Array.from({ length: 51 }, (_, v) => [v, this.T(p, v)]);
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Temperature vs volume of alkali added", xmin: 0, xmax: 50, ymin: 18, ymax: 36, xlabel: "NaOH added (cm³)", ylabel: "temperature (°C)", series: [{ data: curve, color: C.red }], vlines: [{ x: (p.cA * 25) / p.cB, color: C.green, label: "neutralised" }], marks: [{ x: p.v, y: T, color: C.blue }] });
  },
  read(s, p) { const veq = (p.cA * 25) / p.cB; return { T: this.T(p, p.v).toFixed(1) + " °C", eq: veq <= 50 ? veq.toFixed(1) + " cm³ of alkali" : "beyond 50 cm³", rise: (this.T(p, Math.min(50, veq)) - 20).toFixed(1) + " °C" }; },
  keyIdea: "<b>Key idea:</b> H⁺ + OH⁻ → H₂O releases about 57 kJ per mole of water formed. The temperature rises until all the acid is used up; after that, adding more cold alkali just cools the mixture.",
  tryThis: ["At what volume does the temperature peak? Why there?", "Double both concentrations. What happens to the maximum temperature rise?", "Why is a polystyrene cup used instead of a glass beaker?"],
  note: "Starting temperature 20 °C; assumes no heat loss and that solutions behave like water.",
});
