const { C, text, rect, circle, line } = Sim;
const COND = { still: ["Still air, room temp", 1], wind: ["Fan blowing (wind)", 2.1], warm: ["Warm (heater on)", 1.7], humid: ["Humid (plastic bag over shoot)", 0.35], dark: ["Dark (stomata close)", 0.25] };
Lab({
  title: "Virtual Lab: Measuring Transpiration with a Potometer",
  aim: "Use a potometer to measure the rate of water uptake by a leafy shoot under different conditions.",
  equipment: ["Bubble potometer with capillary tube and scale", "Leafy shoot, cut under water", "Reservoir and tap", "Fan, lamp/heater, clear plastic bag", "Stopwatch", "Petroleum jelly to seal joints"],
  safety: ["Cut the shoot carefully with a sharp blade, away from your hand.", "Keep water away from electrical equipment."],
  method: [
    "Choose the <b>Conditions</b> around the shoot.",
    "Press <b>Introduce air bubble</b>. Its position is read on the scale.",
    "Press <b>Start timing</b>. After 5 minutes (time is sped up) the timer stops: press <b>Record result</b>.",
    "Press <b>Introduce air bubble</b> again to reset the bubble, and repeat under each condition.",
    "Rate = distance moved by bubble ÷ time. Compare the conditions.",
  ],
  controls: [{ id: "cond", label: "Conditions", type: "select", options: Object.entries(COND).map(([k, v]) => [k, v[0]]) }],
  buttons: [{ label: "Introduce air bubble", click(s) { s.x = 0; s.t = 0; s.run = false; s.bubble = true; } }, { label: "Start timing", click(s) { if (s.bubble) s.run = true; } }],
  readouts: [["t", "Timer"], ["x", "Bubble position"]],
  resetOnChange: true,
  init(s) { s.x = 0; s.t = 0; s.run = false; s.bubble = false; s.noise = 1 + Sim.randn() * 0.05; },
  step(s, p, dt) { if (!s.run) return; dt *= 75; s.t = Math.min(300, s.t + dt); s.x += dt * (6 / 60) * COND[p.cond][1] * s.noise; if (s.t >= 300) s.run = false; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, p.cond === "dark" ? "#dee2e6" : "#f8f9fa");
    const sx = W * 0.2, sy = H * 0.35;
    ctx.strokeStyle = "#2b8a3e"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, sy + 40); ctx.lineTo(sx, sy - 90); ctx.stroke();
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(sx + (i % 2 ? 26 : -26), sy - 20 - i * 14, 26, 9, i % 2 ? -0.4 : 0.4, 0, 7); ctx.fillStyle = "#51cf66"; ctx.fill(); }
    if (p.cond === "humid") rect(ctx, sx - 60, sy - 120, 120, 150, "rgba(233,236,239,.45)", "#adb5bd", 30, 1.5);
    if (p.cond === "wind") for (let i = 0; i < 4; i++) line(ctx, sx - 140, sy - 80 + i * 20, sx - 70, sy - 80 + i * 20, "#74c0fc", 2, [10, 6]);
    if (p.cond === "warm") circle(ctx, sx - 110, sy - 50, 18, "#ff922b", "#e8590c", 2);
    rect(ctx, sx - 10, sy + 40, 20, 50, "rgba(165,216,255,.6)", C.text, 3, 1.5);
    const ty = sy + 90, tx0 = sx, tx1 = W * 0.9; rect(ctx, tx0 - 8, ty, tx1 - tx0, 14, "rgba(165,216,255,.6)", C.text, 6, 1.5);
    for (let mm = 0; mm <= 100; mm += 5) { const x = tx0 + 60 + (mm / 100) * (tx1 - tx0 - 100); line(ctx, x, ty + 14, x, ty + (mm % 10 ? 20 : 26), C.text, 1); if (mm % 20 === 0) text(ctx, String(mm), x, ty + 40, { size: 10, align: "center" }); }
    text(ctx, "mm", tx1 - 20, ty + 40, { size: 10 });
    if (s.bubble) { const bx = tx0 + 60 + (Math.min(100, s.x) / 100) * (tx1 - tx0 - 100); rect(ctx, bx - 5, ty + 2, 10, 10, "#fff", C.blue, 5, 2); }
    rect(ctx, tx1 - 40, ty - 80, 50, 70, "rgba(165,216,255,.6)", C.text, 4, 1.5); text(ctx, "reservoir", tx1 - 15, ty - 88, { align: "center", size: 10, color: C.muted });
    text(ctx, "← water moves towards the shoot as it transpires", (tx0 + tx1) / 2, ty + 62, { align: "center", size: 11, color: C.muted });
    text(ctx, `${Math.floor(s.t / 60)}:${String(Math.floor(s.t % 60)).padStart(2, "0")}`, W * 0.75, H * 0.2, { align: "center", weight: 800, size: 22 });
  },
  read(s) { return { t: `${(s.t / 60).toFixed(1)} min`, x: s.bubble ? Math.min(100, s.x).toFixed(1) + " mm" : "no bubble yet" }; },
  record(s, p) { if (!s.bubble || s.t < 300) return "Introduce a bubble and time it for the full 5 minutes."; const d = Lab.round(Math.min(100, s.x), 0.5); return { cond: COND[p.cond][0], d, t: 5, rate: d / 5 }; },
  table: { cols: [{ key: "cond", label: "Conditions" }, { key: "d", label: "Distance moved by bubble", unit: "mm", digits: 1 }, { key: "t", label: "Time", unit: "min", digits: 0 }, { key: "rate", label: "Rate", unit: "mm/min", digits: 1 }] },
  derived(rows) { if (rows.length < 2) return null; const f = rows.reduce((a, r) => (r.rate > a.rate ? r : a)), sl = rows.reduce((a, r) => (r.rate < a.rate ? r : a)); return { "Fastest": f.cond, "Slowest": sl.cond }; },
  questions: [
    { q: "Why is the shoot cut under water?", options: ["To stop air entering the xylem", "To keep it cool", "To clean it"], answer: 0, why: "An air lock would stop water moving up the stem." },
    { q: "Why does wind increase the rate of transpiration?", options: ["It blows away water vapour, keeping a steep concentration gradient", "It opens the stomata", "It cools the leaf"], answer: 0, why: "Water vapour diffuses out of the stomata faster." },
    { q: "A potometer actually measures…", options: ["water lost from the leaves", "water uptake by the shoot", "oxygen made"], answer: 1, why: "Most, but not all, of the water taken up is lost by transpiration." },
  ],
  conclusion: "Transpiration is fastest in windy, warm, dry, bright conditions, and slowest in humid conditions or in the dark when the stomata close.",
});
