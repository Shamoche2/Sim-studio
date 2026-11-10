const { C, line, text, circle, rect, arrow } = Sim;
Sim({
  title: "Waves on a String",
  intro: "A wave carries energy along a string while each bit of string only moves up and down. Change the frequency and amplitude, and see how the wavelength changes.",
  controls: [
    { id: "f", label: "Frequency", min: 0.2, max: 3, step: 0.1, value: 1, unit: "Hz", digits: 1 },
    { id: "A", label: "Amplitude", min: 0.1, max: 1, step: 0.05, value: 0.5, unit: "m", digits: 2 },
    { id: "v", label: "Wave speed", min: 1, max: 6, step: 0.5, value: 3, unit: "m/s", digits: 1 },
    { id: "slow", label: "Slow motion", type: "checkbox", value: false },
  ],
  readouts: [["lambda", "Wavelength λ"], ["T", "Period"], ["check", "v = f × λ"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt * (p.slow ? 0.25 : 1); },
  draw({ ctx, W, H }, s, p) {
    const L = 10, pad = 30, sx = (W - 2 * pad) / L, mid = H / 2, sy = (H * 0.35) / 1;
    rect(ctx, 0, 0, W, H, "#fff");
    line(ctx, pad, mid, W - pad, mid, C.grid, 1);
    const k = (2 * Math.PI * p.f) / p.v, w = 2 * Math.PI * p.f;
    const y = (x) => { const front = p.v * s.t; return x > front ? 0 : p.A * Math.sin(w * s.t - k * x); };
    ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const x = (L * i) / 400; ctx.lineTo(pad + x * sx, mid - y(x) * sy); }
    ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke();
    // tracked particle
    const xp = 2.5; circle(ctx, pad + xp * sx, mid - y(xp) * sy, 8, C.red, "#fff", 2);
    text(ctx, "this bit only moves up and down", pad + xp * sx + 12, mid + sy + 30, { color: C.red, size: 12 });
    line(ctx, pad + xp * sx, mid - sy * p.A - 6, pad + xp * sx, mid + sy * p.A + 6, C.red, 1, [3, 3]);
    // wavelength marker
    const lam = p.v / p.f;
    if (lam < L) {
      const start = pad + 0.5 * sx, end = start + lam * sx, yy = mid - sy * 1.05 - 10;
      arrow(ctx, (start + end) / 2, yy, start, yy, C.green, 2); arrow(ctx, (start + end) / 2, yy, end, yy, C.green, 2);
      text(ctx, `λ = ${lam.toFixed(2)} m`, (start + end) / 2, yy - 8, { align: "center", color: C.green, weight: 600 });
    }
    // amplitude marker
    arrow(ctx, W - pad + 14, mid, W - pad + 14, mid - p.A * sy, C.orange, 2);
    text(ctx, "A", W - pad + 18, mid - (p.A * sy) / 2, { color: C.orange, weight: 700 });
    for (let m = 0; m <= L; m += 2) text(ctx, m + " m", pad + m * sx, H - 10, { align: "center", size: 11, color: C.muted });
  },
  read(s, p) { const lam = p.v / p.f; return { lambda: lam.toFixed(2) + " m", T: (1 / p.f).toFixed(2) + " s", check: `${p.f.toFixed(1)} × ${lam.toFixed(2)} = ${p.v.toFixed(1)} m/s` }; },
  keyIdea: "<b>Key idea:</b> wave speed = frequency × wavelength (v = fλ). On the same string the speed stays fixed, so a higher frequency means a shorter wavelength.",
  tryThis: ["Double the frequency. What happens to the wavelength?", "Change the amplitude. Does the wave travel faster?", "Watch the red dot. Does it travel along the string with the wave?"],
});
