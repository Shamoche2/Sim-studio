const { C, text, rect, circle, line } = Sim;
Lab({
  title: "Virtual Lab: Measuring g with a Pendulum",
  aim: "Find how the length of a pendulum affects its period, and use your results to measure the acceleration due to gravity, g.",
  equipment: ["Clamp stand, boss and clamp", "String and a metal bob", "Metre rule", "Stopwatch", "Protractor (to keep the swing small)"],
  safety: ["Clamp the stand firmly so it can't fall over.", "Keep the swing small so the bob doesn't hit anyone."],
  method: [
    "Set the <b>String length</b> to 0.40 m.",
    "Press <b>Start swinging</b>. The stopwatch times 10 complete swings.",
    "When it stops, press <b>Record result</b>. The period T is the time for 10 swings ÷ 10.",
    "Repeat for lengths 0.60, 0.80, 1.00 and 1.20 m.",
    "Look at the graph of T² against length. The gradient gives 4π²/g, shown below the table.",
  ],
  controls: [
    { id: "L", label: "String length", min: 0.2, max: 1.5, step: 0.05, value: 0.4, unit: "m", digits: 2 },
    { id: "angle", label: "Starting angle", min: 5, max: 20, step: 1, value: 10, unit: "°", help: "Keep it below about 15° for accurate results." },
  ],
  buttons: [{ label: "Start swinging", click(s, p) { s.run = true; s.t = 0; s.count = 0; s.T = 2 * Math.PI * Math.sqrt(p.L / 9.81) * (1 + ((p.angle * Math.PI) / 180) ** 2 / 16); s.done = false; s.react = Sim.randn() * 0.12; } }],
  readouts: [["watch", "Stopwatch"], ["swings", "Swings counted"]],
  init(s) { s.t = 0; s.run = false; s.done = false; s.count = 0; s.T = 1; },
  change(s, p, id) { if (id === "L" || id === "angle") { s.run = false; s.done = false; s.t = 0; } },
  step(s, p, dt) { if (!s.run) return; s.t += dt; s.count = Math.floor(s.t / s.T); if (s.count >= 10) { s.count = 10; s.run = false; s.done = true; s.t = 10 * s.T; } },
  timeScale: 2,
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const px = W * 0.38, py = 30, sc = (H - 80) / 1.6, a = ((p.angle * Math.PI) / 180) * Math.cos((2 * Math.PI * s.t) / s.T) * (s.run || s.done ? 1 : 1);
    rect(ctx, px - 120, 14, 16, H - 30, "#868e96"); rect(ctx, px - 120, py - 6, 140, 10, "#495057");
    const bx = px + Math.sin(s.run ? a : (p.angle * Math.PI) / 180) * p.L * sc, by = py + Math.cos(s.run ? a : (p.angle * Math.PI) / 180) * p.L * sc;
    line(ctx, px, py, px, py + p.L * sc, "#ced4da", 1, [4, 4]);
    line(ctx, px, py, bx, by, C.text, 1.5); circle(ctx, bx, by, 10, "#adb5bd", "#495057", 2);
    // metre rule
    rect(ctx, px - 70, py, 14, 1.5 * sc, "#ffe066", "#e67700", 1, 1);
    for (let cm = 0; cm <= 150; cm += 10) { line(ctx, px - 70, py + (cm / 100) * sc, px - 62, py + (cm / 100) * sc, "#e67700", 1); text(ctx, String(cm), px - 74, py + (cm / 100) * sc + 4, { size: 9, align: "right" }); }
    // stopwatch
    const sx = W * 0.78, sy = H * 0.4; circle(ctx, sx, sy, 52, "#fff", C.text, 3); rect(ctx, sx - 8, sy - 66, 16, 12, C.text, null, 2);
    text(ctx, (s.t + (s.done ? s.react : 0)).toFixed(2) + " s", sx, sy + 6, { align: "center", size: 20, weight: 800 });
    text(ctx, s.done ? "10 swings timed" : s.run ? "timing…" : "ready", sx, sy + 26, { align: "center", size: 11, color: C.muted });
  },
  read(s) { return { watch: (s.t + (s.done ? s.react : 0)).toFixed(2) + " s", swings: `${s.count} / 10` }; },
  record(s, p) {
    if (!s.done) return "Time 10 swings first: press Start swinging and wait for it to finish.";
    const t10 = s.t + s.react, T = t10 / 10;
    s.done = false;
    return { L: p.L, t10, T, T2: T * T };
  },
  table: { cols: [{ key: "L", label: "Length L", unit: "m", digits: 2 }, { key: "t10", label: "Time for 10 swings", unit: "s", digits: 2 }, { key: "T", label: "Period T", unit: "s", digits: 3 }, { key: "T2", label: "T²", unit: "s²", digits: 3 }], x: "L", y: "T2", xlabel: "length L (m)", ylabel: "T² (s²)", fit: "origin", title: "T² against length" },
  derived(rows) {
    if (rows.length < 3) return { "Measured g": "record at least 3 lengths" };
    const sxy = rows.reduce((a, r) => a + r.L * r.T2, 0), sxx = rows.reduce((a, r) => a + r.L * r.L, 0), m = sxy / sxx;
    return { "Gradient of T² vs L": m.toFixed(3) + " s²/m", "Measured g = 4π² ÷ gradient": ((4 * Math.PI * Math.PI) / m).toFixed(2) + " m/s²", "Accepted value": "9.81 m/s²" };
  },
  questions: [
    { q: "Why do we time 10 swings instead of 1?", options: ["To make the pendulum swing faster", "To reduce the effect of reaction time on the result", "Because one swing can't be timed"], answer: 1, why: "Your reaction time error is spread over 10 swings, so it becomes 10 times smaller per swing." },
    { q: "What happens to the period when the length increases?", options: ["It increases", "It decreases", "It stays the same"], answer: 0, why: "T = 2π√(L/g), so a longer pendulum swings more slowly." },
    { q: "Why do we plot T² against L instead of T against L?", options: ["It looks nicer", "T² is proportional to L, so it gives a straight line through the origin", "Because T is always bigger than L"], answer: 1, why: "T² = (4π²/g)L: a straight line whose gradient is 4π²/g." },
  ],
  conclusion: "The period increases with length. T² is directly proportional to L, and the gradient of the graph equals 4π²/g, giving g ≈ 9.8 m/s².",
});
