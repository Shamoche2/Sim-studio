const { C, text, rect, plot } = Sim;
Sim({
  title: "Young's Double-Slit Experiment",
  intro: "Shine light through two narrow slits and a pattern of bright and dark fringes appears on the screen. This interference pattern proves that light behaves as a wave.",
  controls: [
    { id: "lam", label: "Wavelength (colour)", min: 400, max: 700, step: 5, value: 550, unit: "nm" },
    { id: "d", label: "Slit separation", min: 0.1, max: 1, step: 0.05, value: 0.3, unit: "mm", digits: 2 },
    { id: "D", label: "Distance to screen", min: 0.5, max: 3, step: 0.1, value: 1.5, unit: "m", digits: 1 },
  ],
  readouts: [["w", "Fringe spacing"], ["formula", "Using w = λD/d"]],
  colour(l) { const h = l < 440 ? 270 : l < 490 ? 270 - ((l - 440) / 50) * 70 : l < 510 ? 200 - ((l - 490) / 20) * 60 : l < 580 ? 140 - ((l - 510) / 70) * 80 : l < 645 ? 60 - ((l - 580) / 65) * 60 : 0; return h; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#0b0d12");
    const hue = this.colour(p.lam), w = (p.lam * 1e-9 * p.D) / (p.d * 1e-3), span = 0.03, top = H * 0.08, bh = H * 0.42;
    for (let x = 0; x < W; x += 2) {
      const y = ((x / W) - 0.5) * span, I = Math.cos((Math.PI * y) / w) ** 2 * Math.exp(-((y / 0.012) ** 2));
      ctx.fillStyle = `hsla(${hue},100%,${10 + I * 50}%,1)`; ctx.fillRect(x, top, 2, bh);
    }
    text(ctx, "Pattern on the screen (3 cm wide)", 10, top - 6 > 10 ? top - 6 : 14, { color: "#adb5bd", size: 12 });
    const curve = Array.from({ length: 401 }, (_, i) => { const y = (i / 400 - 0.5) * span; return [y * 1000, Math.cos((Math.PI * y) / w) ** 2 * Math.exp(-((y / 0.012) ** 2))]; });
    ctx.save(); plot(ctx, { x: 0, y: top + bh + 6, w: W, h: H - top - bh - 6 }, { title: "Brightness", xmin: -15, xmax: 15, ymin: 0, ymax: 1.1, ystep: 2, xlabel: "position on screen (mm)", series: [{ data: curve, color: `hsl(${hue},90%,45%)` }] }); ctx.restore();
  },
  read(s, p) { const w = (p.lam * 1e-9 * p.D) / (p.d * 1e-3); return { w: (w * 1000).toFixed(2) + " mm", formula: `${p.lam} nm × ${p.D} m ÷ ${p.d} mm` }; },
  keyIdea: "<b>Key idea:</b> bright fringes appear where the path difference from the two slits is a whole number of wavelengths. Fringe spacing w = λD / d: longer wavelength or a farther screen spreads the fringes out; wider slit separation squeezes them together.",
  tryThis: ["Change from blue (450 nm) to red (650 nm) light. Which gives wider fringes?", "Halve the slit separation. What happens to the fringe spacing?", "Measure the fringe spacing from the graph and check it with the formula."],
  note: "The fading envelope comes from each slit's own width (single-slit diffraction).",
});
