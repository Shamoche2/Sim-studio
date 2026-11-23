const { C, text, rect, circle } = Sim;
const rateK = (conc, T) => 0.00125 * conc * Math.pow(2, (T - 20) / 10); // proportion of cross hidden per second
Lab({
  title: "Virtual Lab: Rate of Reaction (Disappearing Cross)",
  aim: "Investigate how the concentration of sodium thiosulfate (or the temperature) affects the rate of its reaction with hydrochloric acid.",
  equipment: ["Conical flask", "Paper with a black cross drawn on it", "Sodium thiosulfate solution at different concentrations", "Dilute hydrochloric acid", "Measuring cylinders", "Stopwatch", "Thermometer and water bath"],
  safety: ["Wear eye protection.", "The reaction makes sulfur dioxide, an irritating gas: keep the room well ventilated, and pour the mixture away as soon as you have your result."],
  method: [
    "Set the <b>Thiosulfate concentration</b> and keep the <b>Temperature</b> the same (it is a control variable).",
    "Press <b>Add acid and start timing</b>. Look down through the flask at the cross.",
    "When the cross can no longer be seen, press <b>Record result</b>.",
    "Repeat for at least five concentrations.",
    "The rate is 1 ÷ time. Plot rate against concentration. You can then change the temperature instead, keeping concentration fixed.",
  ],
  controls: [
    { id: "c", label: "Thiosulfate concentration", min: 10, max: 50, step: 10, value: 50, unit: "g/dm³" },
    { id: "T", label: "Temperature", min: 20, max: 60, step: 10, value: 20, unit: "°C" },
  ],
  buttons: [{ label: "Add acid and start timing", click(s) { s.t = 0; s.cloud = 0; s.run = true; } }],
  readouts: [["t", "Stopwatch"], ["see", "Cross"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.cloud = 0; s.run = false; },
  step(s, p, dt) { if (!s.run) return; dt *= 4; s.t += dt; s.cloud = Math.min(1.2, s.cloud + rateK(p.c, p.T) * dt * (1 + Sim.randn() * 0.02)); },
  draw({ ctx, W, H }, s) {
    rect(ctx, 0, 0, W, H, "#f1f3f5");
    const cx = W * 0.35, cy = H * 0.62;
    rect(ctx, cx - 150, cy + 40, 300, 40, "#fff", "#dee2e6", 2, 1);
    ctx.strokeStyle = "#111"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(cx - 40, cy + 46); ctx.lineTo(cx + 40, cy + 74); ctx.moveTo(cx + 40, cy + 46); ctx.lineTo(cx - 40, cy + 74); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 30, cy - 120); ctx.lineTo(cx + 30, cy - 120); ctx.lineTo(cx + 110, cy + 58); ctx.lineTo(cx - 110, cy + 58); ctx.closePath();
    ctx.fillStyle = `rgba(250,240,190,${Math.min(0.97, 0.15 + s.cloud * 0.85)})`; ctx.fill(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
    // view from above
    const vx = W * 0.78, vy = H * 0.42; circle(ctx, vx, vy, 80, "#fff", C.text, 2);
    ctx.save(); ctx.beginPath(); ctx.arc(vx, vy, 78, 0, 7); ctx.clip();
    ctx.strokeStyle = "#111"; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(vx - 45, vy - 45); ctx.lineTo(vx + 45, vy + 45); ctx.moveTo(vx + 45, vy - 45); ctx.lineTo(vx - 45, vy + 45); ctx.stroke();
    ctx.fillStyle = `rgba(245,235,180,${Math.min(1, s.cloud)})`; ctx.fillRect(vx - 80, vy - 80, 160, 160); ctx.restore();
    text(ctx, "looking down through the flask", vx, vy + 100, { align: "center", size: 11, color: C.muted });
    text(ctx, `${s.t.toFixed(0)} s`, cx, 30, { align: "center", weight: 800, size: 20 });
  },
  read(s) { return { t: s.t.toFixed(1) + " s", see: s.cloud >= 1 ? "can't be seen: record now" : s.run ? "still visible" : "press Add acid…" }; },
  record(s, p) { if (!s.run) return "Start the reaction first."; if (s.cloud < 1) return "The cross can still be seen. Wait until it disappears."; s.run = false; const t = Lab.round(s.t, 1); return { c: p.c, T: p.T, t, rate: 1000 / t }; },
  table: { cols: [{ key: "c", label: "Concentration", unit: "g/dm³", digits: 0 }, { key: "T", label: "Temperature", unit: "°C", digits: 0 }, { key: "t", label: "Time for cross to disappear", unit: "s", digits: 0 }, { key: "rate", label: "Rate = 1000 ÷ time", unit: "s⁻¹ × 10⁻³", digits: 1 }], x: "c", y: "rate", xlabel: "concentration (g/dm³)", ylabel: "rate (1000/t)", fit: "origin", title: "Rate against concentration (same temperature)" },
  questions: [
    { q: "Why does the cross disappear?", options: ["The solution turns blue", "A yellow precipitate of sulfur forms", "The paper gets wet"], answer: 1, why: "Na₂S₂O₃ + 2HCl → 2NaCl + SO₂ + S + H₂O. The sulfur makes the mixture cloudy." },
    { q: "Increasing the concentration increases the rate because…", options: ["particles move faster", "there are more particles in the same volume, so collisions are more frequent", "the activation energy decreases"], answer: 1, why: "More frequent successful collisions." },
    { q: "Increasing the temperature by 10 °C roughly…", options: ["halves the rate", "doubles the rate", "has no effect"], answer: 1, why: "Particles have more energy, so more collisions have at least the activation energy." },
  ],
  conclusion: "Rate is proportional to concentration: doubling the concentration halves the time. Higher temperature also increases the rate, because more collisions have enough energy to react.",
});
