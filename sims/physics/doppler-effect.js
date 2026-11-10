const { C, text, rect, circle } = Sim;
Sim({
  title: "The Doppler Effect",
  intro: "A moving source sends out sound waves. Ahead of it the waves bunch up (higher pitch); behind it they spread out (lower pitch). That's why a passing siren changes pitch.",
  controls: [
    { id: "vs", label: "Source speed", min: 0, max: 400, step: 5, value: 120, unit: "m/s" },
    { id: "f", label: "Source frequency", min: 100, max: 1000, step: 10, value: 400, unit: "Hz" },
  ],
  readouts: [["front", "Heard in front"], ["back", "Heard behind"], ["mach", "Mach number"]],
  init(s) { s.t = 0; s.x = 0; s.waves = []; s.lastEmit = -1; },
  timeScale: 0.4,
  step(s, p, dt) {
    s.t += dt; s.x += p.vs * dt;
    if (s.x > 900) { s.x = -900; s.waves = []; }
    const period = 0.25;
    if (s.t - s.lastEmit >= period) { s.waves.push({ x: s.x, t: s.t }); s.lastEmit = s.t; }
    s.waves = s.waves.filter((w) => (s.t - w.t) * 343 < 1400);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const sc = W / 1800, cx = W / 2, cy = H / 2;
    for (const w of s.waves) circle(ctx, cx + w.x * sc, cy, (s.t - w.t) * 343 * sc, null, "rgba(47,111,237,.55)", 1.5);
    circle(ctx, cx + s.x * sc, cy, 9, C.red, "#fff", 2);
    // listeners
    const lf = cx + 800 * sc, lb = cx - 800 * sc;
    text(ctx, "👂", lf, cy + 6, { align: "center", size: 22 }); text(ctx, "👂", lb, cy + 6, { align: "center", size: 22 });
    if (p.vs >= 343) text(ctx, "Faster than sound: a shock wave (sonic boom) forms!", 14, 26, { color: C.red, weight: 700 });
  },
  read(s, p) {
    const v = 343;
    const front = p.vs < v ? (p.f * v) / (v - p.vs) : null;
    return { front: front ? front.toFixed(0) + " Hz" : "shock wave", back: ((p.f * v) / (v + p.vs)).toFixed(0) + " Hz", mach: (p.vs / v).toFixed(2) };
  },
  keyIdea: "<b>Key idea:</b> for a moving source, f<sub>heard</sub> = f × v / (v ∓ v<sub>s</sub>), using minus in front and plus behind. Sound travels at about 343 m/s in air.",
  tryThis: ["Set the speed to 0. Are the circles evenly spaced?", "At 170 m/s (half the speed of sound), what frequency does the front listener hear?", "Go past 343 m/s. What happens to the wave fronts?"],
  note: "Wave fronts are drawn more slowly than real time so you can see them.",
});
