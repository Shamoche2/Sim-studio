const { C, text, rect, circle } = Sim;
Sim({
  title: "Standing Waves on a String",
  intro: "A guitar string fixed at both ends can only vibrate in certain patterns called harmonics. Waves reflect from the ends and interfere, making nodes (no movement) and antinodes (biggest movement).",
  controls: [
    { id: "n", label: "Harmonic number", min: 1, max: 8, step: 1, value: 2 },
    { id: "L", label: "String length", min: 0.3, max: 1.2, step: 0.05, value: 0.65, unit: "m", digits: 2 },
    { id: "v", label: "Wave speed on string", min: 100, max: 500, step: 10, value: 286, unit: "m/s" },
  ],
  readouts: [["f", "Frequency"], ["lam", "Wavelength"], ["nodes", "Nodes"], ["note", "Fundamental (1st harmonic)"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const x0 = 40, x1 = W - 40, cy = H / 2, A = H * 0.3, ph = Math.cos(2 * Math.PI * 1.2 * s.t);
    rect(ctx, x0 - 14, cy - 40, 14, 80, C.brown); rect(ctx, x1, cy - 40, 14, 80, C.brown);
    for (const k of [1, 0.5, -0.5, -1]) { ctx.beginPath(); for (let i = 0; i <= 200; i++) { const u = i / 200; ctx.lineTo(x0 + u * (x1 - x0), cy - A * k * Math.sin(p.n * Math.PI * u)); } ctx.strokeStyle = "rgba(47,111,237,.12)"; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.beginPath(); for (let i = 0; i <= 300; i++) { const u = i / 300; ctx.lineTo(x0 + u * (x1 - x0), cy - A * ph * Math.sin(p.n * Math.PI * u)); } ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke();
    for (let k = 0; k <= p.n; k++) { const x = x0 + (k / p.n) * (x1 - x0); circle(ctx, x, cy, 5, C.red); text(ctx, "N", x, cy + 22, { align: "center", color: C.red, size: 11, weight: 700 }); }
    for (let k = 0; k < p.n; k++) text(ctx, "A", x0 + ((k + 0.5) / p.n) * (x1 - x0), cy - A - 10, { align: "center", color: C.green, size: 11, weight: 700 });
    text(ctx, "N = node, A = antinode", 10, H - 10, { size: 12, color: C.muted });
  },
  read(s, p) { const f1 = p.v / (2 * p.L); return { f: (p.n * f1).toFixed(0) + " Hz", lam: ((2 * p.L) / p.n).toFixed(3) + " m", nodes: String(p.n + 1), note: f1.toFixed(0) + " Hz" }; },
  keyIdea: "<b>Key idea:</b> for a string fixed at both ends, λ = 2L/n and f = n × v/(2L). Shorter, tighter or lighter strings give higher notes. The harmonics are whole-number multiples of the fundamental.",
  tryThis: ["Count the nodes and antinodes for the 3rd harmonic.", "Halve the string length (like pressing a guitar string at the 12th fret). What happens to the frequency?", "The default settings are close to a guitar's A string (110 Hz). Which harmonic is 440 Hz?"],
});
