const { C, text, circle } = Sim;
Sim({
  title: "Wave Interference",
  intro: "Two sources send out waves at the same frequency. Where crests meet crests they add up (constructive interference); where crests meet troughs they cancel (destructive interference).",
  controls: [
    { id: "lam", label: "Wavelength", min: 15, max: 60, step: 1, value: 30, unit: "px" },
    { id: "d", label: "Source separation", min: 20, max: 200, step: 5, value: 90, unit: "px" },
    { id: "view", label: "Show", type: "select", options: [["wave", "Waves moving"], ["intensity", "Loudness (time-averaged)"]] },
  ],
  readouts: [["ratio", "Separation ÷ wavelength"], ["lines", "Quiet lines (each side)"]],
  aspect: 4 / 3,
  init(s) { s.t = 0; s.img = null; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    const res = 4, cols = Math.ceil(W / res), rows = Math.ceil(H / res);
    const sx1 = W / 2 - p.d / 2, sx2 = W / 2 + p.d / 2, sy = 20, k = (2 * Math.PI) / p.lam, w = 2 * Math.PI * 1.2;
    const img = ctx.createImageData(cols, rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * res, y = j * res, r1 = Math.hypot(x - sx1, y - sy), r2 = Math.hypot(x - sx2, y - sy);
      let v;
      if (p.view === "wave") v = (Math.sin(k * r1 - w * s.t) + Math.sin(k * r2 - w * s.t)) / 2;
      else v = Math.abs(Math.cos((k * (r1 - r2)) / 2)) * 2 - 1;
      const idx = (j * cols + i) * 4, c = (v + 1) / 2;
      img.data[idx] = 20 + c * 60; img.data[idx + 1] = 40 + c * 140; img.data[idx + 2] = 90 + c * 165; img.data[idx + 3] = 255;
    }
    const off = s.img && s.img.width === cols && s.img.height === rows ? s.img : (s.img = Object.assign(document.createElement("canvas"), { width: cols, height: rows }));
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, W, H);
    circle(ctx, sx1, sy, 6, C.red, "#fff", 2); circle(ctx, sx2, sy, 6, C.red, "#fff", 2);
    text(ctx, "bright = big waves, dark = calm", 10, H - 10, { color: "#fff", size: 12 });
  },
  read(s, p) { return { ratio: (p.d / p.lam).toFixed(2), lines: String(Math.floor(p.d / p.lam + 0.5)) }; },
  keyIdea: "<b>Key idea:</b> constructive where the path difference is a whole number of wavelengths (0, λ, 2λ…); destructive where it's a half-number (½λ, 1½λ…).",
  tryThis: ["Switch to 'Loudness'. Count the quiet lines. What happens when you move the sources apart?", "Make the wavelength longer. Do the bright bands get wider or narrower?", "Where would you stand to hear two speakers playing the same note as quietly as possible?"],
});
