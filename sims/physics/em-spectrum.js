const { C, text, rect } = Sim;
const BANDS = [
  [-1, 4, "Radio waves", "radio, TV, phones (long-range)", "safe at normal levels"],
  [-4, -1, "Microwaves", "cooking, satellites, Wi-Fi, mobile data", "can heat body tissue"],
  [-6.15, -4, "Infrared", "heaters, remote controls, thermal cameras", "can burn skin"],
  [-6.42, -6.15, "Visible light", "seeing, photography, fibre optics", "very bright light can damage eyes"],
  [-8, -6.42, "Ultraviolet", "sun tans, security marks, sterilising", "skin cancer, eye damage"],
  [-11, -8, "X-rays", "medical images, airport security", "ionising: can damage cells and DNA"],
  [-14, -11, "Gamma rays", "cancer treatment, sterilising equipment", "ionising: very damaging to cells"],
];
Sim({
  title: "The Electromagnetic Spectrum",
  intro: "Radio waves, light and X-rays are all electromagnetic waves travelling at the speed of light. They differ only in wavelength and frequency, which changes how they behave, what they're used for and how dangerous they are.",
  controls: [{ id: "logL", label: "Wavelength", min: -13, max: 3, step: 0.05, value: -6.3, format: (v) => { const m = 10 ** v; const r = (x) => String(Number(x.toPrecision(2))); return m >= 1 ? r(m) + " m" : m >= 1e-3 ? r(m * 1e3) + " mm" : m >= 1e-6 ? r(m * 1e6) + " μm" : r(m * 1e9) + " nm"; } }],
  readouts: [["band", "Type"], ["f", "Frequency"], ["E", "Photon energy"], ["use", "Uses"], ["risk", "Risks"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  band(p) { return BANDS.find(([lo, hi]) => p.logL >= lo && p.logL < hi) || BANDS[0]; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const X = (l) => 20 + ((3 - l) / 16) * (W - 40), barY = 30;
    BANDS.forEach(([lo, hi, name], i) => { const x1 = X(Math.min(hi, 3)), x2 = X(lo); rect(ctx, x1, barY, x2 - x1, 34, `hsl(${i * 45},55%,${85 - i * 3}%)`, "#fff", 0, 1); text(ctx, name.split(" ")[0], (x1 + x2) / 2, barY + 22, { align: "center", size: 11, weight: 600 }); });
    const vx1 = X(-6.15), vx2 = X(-6.42), grad = ctx.createLinearGradient(vx1, 0, vx2, 0);
    ["red", "orange", "yellow", "lime", "cyan", "blue", "violet"].forEach((c, i) => grad.addColorStop(i / 6, c)); ctx.fillStyle = grad; ctx.fillRect(vx1, barY, vx2 - vx1, 34);
    text(ctx, "← longer wavelength, lower frequency, lower energy", 20, barY + 52, { size: 11, color: C.muted });
    text(ctx, "shorter wavelength, higher energy →", W - 20, barY + 52, { size: 11, color: C.muted, align: "right" });
    const mx = X(p.logL); ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(mx, barY - 2); ctx.lineTo(mx - 7, barY - 14); ctx.lineTo(mx + 7, barY - 14); ctx.fill();
    // wave drawn with relative wavelength (log-compressed)
    const cy = H * 0.66, lamPx = 18 + ((p.logL + 13) / 16) * 260, b = this.band(p);
    const nm = 10 ** p.logL * 1e9, col = b[2] === "Visible light" ? `hsl(${Sim.clamp(270 * (1 - (nm - 380) / 320), 0, 270)},90%,45%)` : C.purple;
    ctx.beginPath(); for (let x = 20; x <= W - 20; x += 2) ctx.lineTo(x, cy - 40 * Math.sin(((x - s.t * 60) / lamPx) * Math.PI * 2)); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, "(wave drawn on a squashed scale)", W - 20, H - 8, { align: "right", size: 11, color: C.muted });
  },
  read(s, p) {
    const lam = 10 ** p.logL, f = 3e8 / lam, E = (6.63e-34 * f) / 1.6e-19, b = this.band(p);
    const sci = (x) => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(1)} × 10^${e}`; };
    return { band: b[2], f: sci(f) + " Hz", E: E < 0.01 ? sci(E) + " eV" : E.toPrecision(3) + " eV", use: b[3], risk: b[4] };
  },
  keyIdea: "<b>Key idea:</b> all EM waves travel at c = 3 × 10⁸ m/s in a vacuum, and c = f × λ. Shorter wavelength means higher frequency and more energy per photon. UV, X-rays and gamma rays are ionising.",
  tryThis: ["Find the wavelength range of visible light. Which colour has the shortest wavelength?", "Why are X-rays dangerous but radio waves aren't?", "Microwave ovens use about 12 cm waves. What frequency is that?"],
});
