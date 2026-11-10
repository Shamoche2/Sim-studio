const { C, text, rect, circle, plot } = Sim;
const METALS = { Cs: ["Caesium", 2.1], Na: ["Sodium", 2.28], Zn: ["Zinc", 4.3], Cu: ["Copper", 4.7], Pt: ["Platinum", 5.6] };
Sim({
  title: "The Photoelectric Effect",
  intro: "Light shining on a metal can knock electrons out, but only if each photon has enough energy. Below a threshold frequency, no electrons come out however bright the light is. This showed that light comes in particles: photons.",
  controls: [
    { id: "metal", label: "Metal", type: "select", options: Object.entries(METALS).map(([k, v]) => [k, `${v[0]} (work function ${v[1]} eV)`]) },
    { id: "lam", label: "Wavelength of light", min: 150, max: 750, step: 5, value: 400, unit: "nm" },
    { id: "I", label: "Brightness (intensity)", min: 0, max: 100, step: 5, value: 50, unit: "%" },
  ],
  readouts: [["Ep", "Photon energy"], ["Ek", "Max kinetic energy of electrons"], ["out", "Electrons emitted?"]],
  init(s) { s.t = 0; s.ph = []; s.el = []; },
  calc(p) { const Ep = 1240 / p.lam, phi = METALS[p.metal][1]; return { Ep, phi, Ek: Math.max(0, Ep - phi) }; },
  step(s, p, dt) {
    s.t += dt;
    const { Ek } = this.calc(p);
    if (Math.random() < (p.I / 100) * dt * 25) s.ph.push({ x: Math.random() * 0.6, y: 0 });
    for (const q of s.ph) q.y += dt * 1.6;
    s.ph = s.ph.filter((q) => { if (q.y >= 1) { if (Ek > 0) s.el.push({ x: q.x + 0.2, y: 1, v: 0.3 + Math.sqrt(Ek) * 0.5 }); return false; } return true; });
    for (const e of s.el) { e.y -= e.v * dt; e.x += e.v * dt * 0.4; }
    s.el = s.el.filter((e) => e.y > -0.1);
  },
  hue(l) { return l < 380 ? 275 : l > 700 ? 0 : 275 - ((l - 380) / 320) * 275; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.48, plate = H * 0.78, col = p.lam < 380 ? "#7048e8" : `hsl(${this.hue(p.lam)},90%,50%)`;
    rect(ctx, 20, plate, left - 40, 26, "#adb5bd", C.text, 2, 1.5); text(ctx, METALS[p.metal][0] + " plate", left / 2, plate + 18, { align: "center", weight: 700, size: 12 });
    for (const q of s.ph) { const x = 20 + q.x * (left - 40), y = q.y * plate; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 14; k++) ctx.lineTo(x + Math.sin(k * 1.2) * 4 + k * 1.5, y - 20 + k * 1.5); ctx.stroke(); }
    for (const e of s.el) circle(ctx, 20 + e.x * (left - 40), e.y * plate, 4, C.blue);
    text(ctx, p.lam < 380 ? "ultraviolet (invisible)" : p.lam > 700 ? "infrared (invisible)" : "visible light", 20, 20, { color: col, weight: 700 });
    const { phi } = this.calc(p), line = Array.from({ length: 61 }, (_, i) => { const f = i * 0.025; return [f * 100, Math.max(0, 4.136 * f - phi)]; });
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Electron energy vs light frequency", xmin: 0, xmax: 150, ymin: 0, ymax: 5, xlabel: "frequency (×10¹³ Hz)", ylabel: "max KE (eV)", series: [{ data: line, color: C.blue }], vlines: [{ x: (phi / 4.136) * 100, color: C.red, label: "threshold" }], marks: [{ x: (3e8 / (p.lam * 1e-9)) / 1e13, y: this.calc(p).Ek, color: C.red }] });
  },
  read(s, p) { const { Ep, Ek } = this.calc(p); return { Ep: Ep.toFixed(2) + " eV", Ek: Ek.toFixed(2) + " eV", out: Ek > 0 ? (p.I > 0 ? "yes" : "yes, if light is on") : "no: photons don't have enough energy" }; },
  keyIdea: "<b>Key idea:</b> photon energy E = hf. An electron escapes only if hf ≥ the work function φ. Its maximum kinetic energy is hf − φ. Brighter light means more photons (more electrons), not more energetic ones.",
  tryThis: ["Use red light on zinc. Turn the brightness up to 100%. Are electrons emitted?", "Now use UV light (200 nm) on zinc at low brightness. What happens?", "Which metal releases electrons with visible light? Why are such metals used in light sensors?"],
});
