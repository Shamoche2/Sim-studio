const { C, text, rect, circle } = Sim;
const rate = (T, pH) => { const tf = T <= 37 ? Math.pow(2, (T - 37) / 10) : Math.max(0, 1 - ((T - 37) / 23) ** 2); const pf = Math.exp(-(((pH - 7) / 1.6) ** 2)); return tf * pf; };
Lab({
  title: "Virtual Lab: Effect of Temperature on Amylase",
  aim: "Find how temperature (and pH) affects the time taken for amylase to break down starch, and find the optimum temperature.",
  equipment: ["Spotting tile with iodine solution in each well", "Amylase solution", "Starch solution", "Buffer solutions (pH)", "Water baths", "Test tubes", "Dropping pipettes", "Stopwatch"],
  safety: ["Wear eye protection: iodine stains and irritates.", "Wash off any enzyme solution on your skin."],
  method: [
    "Set the water bath <b>Temperature</b> and the buffer <b>pH</b>.",
    "Press <b>Mix and start timing</b>: amylase and starch are mixed.",
    "Every 30 seconds a drop of the mixture is put into the next well of iodine. Blue-black means starch is still there.",
    "When a drop stays orange-brown, all the starch has been digested. Press <b>Record result</b>.",
    "Repeat at 10, 20, 30, 40, 50 and 60 °C. Rate = 1000 ÷ time.",
  ],
  controls: [
    { id: "T", label: "Temperature", min: 10, max: 70, step: 10, value: 30, unit: "°C" },
    { id: "pH", label: "pH", min: 3, max: 11, step: 1, value: 7 },
  ],
  buttons: [{ label: "Mix and start timing", click(s) { s.run = true; s.t = 0; s.wells = []; } }],
  readouts: [["t", "Time"], ["last", "Last iodine test"]],
  resetOnChange: true,
  init(s) { s.run = false; s.t = 0; s.wells = []; s.need = 0; s.left = 1; },
  step(s, p, dt) {
    if (!s.run) return; dt *= 15; s.t += dt;
    s.left = Math.max(0, s.left - dt * 0.0055 * rate(p.T, p.pH) * (1 + Sim.randn() * 0.03));
    const n = Math.floor(s.t / 30); while (s.wells.length < Math.min(n, 24)) s.wells.push(s.left);
    if (s.wells.length >= 24) s.run = false;
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    rect(ctx, W * 0.08, H * 0.12, W * 0.62, H * 0.62, "#fff", "#ced4da", 12, 2);
    for (let i = 0; i < 24; i++) { const x = W * 0.08 + 40 + (i % 6) * (W * 0.62 - 80) / 5, y = H * 0.12 + 40 + Math.floor(i / 6) * (H * 0.62 - 80) / 3; const v = s.wells[i]; circle(ctx, x, y, 18, v == null ? "#f1d38b" : v > 0.08 ? `rgb(${40 + (1 - v) * 150},${30 + (1 - v) * 120},${70 + (1 - v) * 20})` : "#f1b45b", "#adb5bd", 1.5); text(ctx, String((i + 1) * 30), x, y + 32, { align: "center", size: 9, color: C.muted }); }
    text(ctx, "spotting tile (time of each drop, s)", W * 0.39, H * 0.8, { align: "center", size: 11, color: C.muted });
    const bx = W * 0.85; rect(ctx, bx - 50, H * 0.25, 100, H * 0.5, "rgba(116,192,252,.3)", C.text, 6, 2);
    text(ctx, `${p.T} °C`, bx, H * 0.2, { align: "center", weight: 800 }); text(ctx, `pH ${p.pH}`, bx, H * 0.82, { align: "center", weight: 700 });
    rect(ctx, bx - 12, H * 0.3, 24, H * 0.4, `rgba(${60 + (1 - s.left) * 180},${60 + (1 - s.left) * 160},200,.5)`, C.text, 3, 1.5);
  },
  read(s) { const v = s.wells[s.wells.length - 1]; return { t: s.t.toFixed(0) + " s", last: v == null ? "—" : v > 0.08 ? "blue-black (starch present)" : "orange-brown (no starch)" }; },
  record(s, p) {
    const i = s.wells.findIndex((v) => v <= 0.08);
    if (i < 0) return s.wells.length >= 24 ? "Starch was still present after 12 minutes. Record the time as 'more than 720 s'." : "The iodine is still turning blue-black. Keep waiting.";
    const t = (i + 1) * 30; s.run = false; return { T: p.T, pH: p.pH, t, rate: 1000 / t };
  },
  table: { cols: [{ key: "T", label: "Temperature", unit: "°C", digits: 0 }, { key: "pH", label: "pH", digits: 0 }, { key: "t", label: "Time for starch to disappear", unit: "s", digits: 0 }, { key: "rate", label: "Rate = 1000 ÷ time", unit: "s⁻¹ × 10⁻³", digits: 1 }], x: "T", y: "rate", xlabel: "temperature (°C)", ylabel: "rate (1000/t)", fit: "none", xmin: 0, xmax: 70, title: "Rate of reaction against temperature" },
  derived(rows) { if (rows.length < 3) return { "Optimum temperature": "record at least 3 temperatures" }; const b = rows.reduce((a, r) => (r.rate > a.rate ? r : a)); return { "Fastest rate measured at": b.T + " °C", "Human amylase optimum": "about 37 °C" }; },
  questions: [
    { q: "What does iodine solution turn when starch is present?", options: ["Orange-brown", "Blue-black", "Brick red"], answer: 1, why: "Iodine stays orange-brown when there is no starch." },
    { q: "Why does the rate fall above the optimum temperature?", options: ["The enzyme runs out", "The active site changes shape (the enzyme is denatured), so starch no longer fits", "The starch evaporates"], answer: 1, why: "High temperatures break the bonds holding the enzyme's shape." },
    { q: "Why is a buffer solution added?", options: ["To keep the pH constant", "To speed up the reaction", "To colour the mixture"], answer: 0, why: "pH is a control variable when temperature is being tested." },
  ],
  conclusion: "The rate increases with temperature up to the optimum (about 37 °C for human amylase), then falls quickly as the enzyme is denatured. Each enzyme also has an optimum pH.",
});
