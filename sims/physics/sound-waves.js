const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Sound Waves",
  intro: "Sound is a longitudinal wave: air particles vibrate back and forth in the same direction as the wave travels, making compressions and rarefactions. Frequency sets the pitch; amplitude sets the loudness.",
  controls: [
    { id: "f", label: "Frequency (pitch)", min: 1, max: 6, step: 0.5, value: 2, unit: "×100 Hz", digits: 1 },
    { id: "A", label: "Amplitude (loudness)", min: 0.2, max: 1, step: 0.1, value: 0.6, digits: 1 },
    { id: "medium", label: "Medium", type: "select", options: [[343, "Air (343 m/s)"], [1480, "Water (1480 m/s)"], [5100, "Steel (5100 m/s)"]] },
  ],
  readouts: [["freq", "Frequency"], ["lam", "Wavelength"], ["loud", "Loudness"]],
  init(s) { s.t = 0; s.cols = Array.from({ length: 18 }, (_, i) => Array.from({ length: 6 }, () => ({ x0: i, y: Math.random() }))); },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const top = H * 0.55, k = (p.f * 2 * Math.PI) / 16, w = p.f * 2 * Math.PI * 0.5;
    // speaker
    const cone = 8 * p.A * Math.sin(w * s.t);
    rect(ctx, 6, top / 2 - 30, 18, 60, C.text, null, 3);
    ctx.fillStyle = "#495057"; ctx.beginPath(); ctx.moveTo(24 + cone, top / 2 - 40); ctx.lineTo(40 + cone, top / 2 - 50); ctx.lineTo(40 + cone, top / 2 + 50); ctx.lineTo(24 + cone, top / 2 + 40); ctx.fill();
    const x0 = 60, span = W - 80, nx = 90, ny = 9;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const ex = (i / nx) * 16, disp = p.A * 0.35 * Math.sin(w * s.t - k * ex) * (16 / nx) * 8;
      const x = x0 + ((i + disp) / nx) * span, y = 14 + (j + ((i * 7 + j * 3) % 5) * 0.12) * ((top - 28) / ny);
      circle(ctx, x, y, 2.4, i === 30 && j === 4 ? C.red : C.blue);
    }
    text(ctx, "compression = particles bunched together", x0, top - 4, { size: 11, color: C.muted });
    const pressure = Array.from({ length: 201 }, (_, i) => { const ex = (i / 200) * 16; return [ex, -p.A * Math.cos(w * s.t - k * ex)]; });
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { title: "Air pressure along the wave", xmin: 0, xmax: 16, ymin: -1.1, ymax: 1.1, xstep: 4, xlabel: "distance", ylabel: "pressure", series: [{ data: pressure, color: C.purple }], hlines: [{ y: 0, color: "#dee2e6" }] });
  },
  read(s, p) { const f = p.f * 100; return { freq: f.toFixed(0) + " Hz", lam: (p.medium / f).toFixed(2) + " m", loud: (60 + 20 * Math.log10(p.A / 0.2) * 2).toFixed(0) + " dB (approx.)" }; },
  keyIdea: "<b>Key idea:</b> sound needs a medium (it can't travel through a vacuum). Higher frequency = higher pitch; larger amplitude = louder. Sound travels faster in liquids and solids than in air.",
  tryThis: ["Increase the frequency. What happens to the spacing between compressions?", "Watch the red particle. Does it travel along with the wave?", "Switch to steel. Why is the wavelength longer at the same frequency?"],
  note: "Animation is slowed down enormously: real sound vibrates hundreds of times per second.",
});
