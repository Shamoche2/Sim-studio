const { C, text, rect, circle, line, arrow } = Sim;
const E = (n) => -13.6 / (n * n);
const hueFor = (nm) => (nm < 380 || nm > 700 ? null : Sim.clamp(270 * (1 - (nm - 380) / 320), 0, 270));
Sim({
  title: "Atomic Energy Levels and Spectra",
  intro: "Electrons in an atom can only have certain energies. When an electron drops from a higher level to a lower one, the atom gives out a photon with exactly that energy difference. That's why each element has its own line spectrum, like a fingerprint.",
  controls: [
    { id: "from", label: "Electron starts at level", min: 2, max: 6, step: 1, value: 3 },
    { id: "to", label: "Drops to level", min: 1, max: 5, step: 1, value: 2 },
  ],
  buttons: [{ label: "Emit photon", primary: true, click(s) { s.anim = 0; } }],
  readouts: [["dE", "Photon energy"], ["lam", "Wavelength"], ["region", "Region"], ["series", "Series"]],
  init(s) { s.anim = null; },
  step(s, p, dt) { if (s.anim != null) { s.anim += dt * 0.6; if (s.anim > 1.5) s.anim = null; } },
  calc(p) { const hi = Math.max(p.from, p.to), lo = Math.min(p.from, p.to); if (hi === lo) return null; const dE = E(hi) - E(lo); return { hi, lo, dE, nm: 1240 / dE }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.45, top = 20, bot = H * 0.7, Y = (e) => top + Math.sqrt(e / -13.6) * (bot - top); // squashed scale so upper levels are readable
    for (let n = 1; n <= 6; n++) { const y = Y(E(n)); line(ctx, 60, y, left - 20, y, n === p.from ? C.blue : "#adb5bd", n === p.from ? 3 : 1.5); text(ctx, `n = ${n}`, 54, y + 4, { align: "right", size: n > 3 ? 9 : 11 }); text(ctx, `${E(n).toFixed(2)} eV`, left - 16, y + 4, { size: 10, color: C.muted }); }
    const r = this.calc(p);
    if (r) {
      const xh = left / 2 + 10, ya = Y(E(p.from)), yb = Y(E(p.to)), t = s.anim == null ? 0 : Math.min(1, s.anim);
      arrow(ctx, xh, ya, xh, yb, p.from > p.to ? C.orange : C.green, 2.5);
      circle(ctx, xh, Sim.lerp(ya, yb, t), 7, C.blue, "#fff", 2);
      const hue = hueFor(r.nm), col = hue == null ? C.purple : `hsl(${hue},90%,50%)`;
      if (s.anim != null && s.anim > 1 && p.from > p.to) { const px = xh + (s.anim - 1) * 300; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k < 40; k++) ctx.lineTo(px + k * 2, yb - Math.sin(k * 0.8) * 6); ctx.stroke(); }
    }
    // hydrogen spectrum strip
    const sy = bot + 30, sx = 20, sw = W - 40;
    for (let x = 0; x < sw; x++) { const nm = 380 + (x / sw) * 320; rect(ctx, sx + x, sy, 1.5, 34, `hsla(${hueFor(nm)},90%,50%,0.12)`); }
    for (let hi = 3; hi <= 6; hi++) { const nm = 1240 / (E(hi) - E(2)), x = sx + ((nm - 380) / 320) * sw; rect(ctx, x - 1.5, sy, 3, 34, `hsl(${hueFor(nm)},90%,45%)`); text(ctx, nm.toFixed(0), x, sy + 48, { align: "center", size: 10, color: C.muted }); }
    text(ctx, "Hydrogen visible spectrum (Balmer lines, nm)", sx, sy - 6, { size: 12, weight: 600 });
    if (r && r.lo === 2 && r.nm >= 380 && r.nm <= 700) { const x = sx + ((r.nm - 380) / 320) * sw; ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(x - 5, sy - 3, 10, 40); }
    text(ctx, p.from < p.to ? "Moving up needs energy: the atom absorbs a photon" : "", left + 10, 30, { weight: 600, color: C.green });
  },
  read(s, p) {
    const r = this.calc(p); if (!r) return { dE: "—", lam: "—", region: "choose different levels", series: "—" };
    const nm = 1240 / r.dE;
    return { dE: r.dE.toFixed(2) + " eV", lam: nm.toFixed(0) + " nm", region: nm < 380 ? "ultraviolet" : nm > 700 ? "infrared" : "visible light", series: { 1: "Lyman (UV)", 2: "Balmer (visible)", 3: "Paschen (IR)", 4: "Brackett (IR)", 5: "Pfund (IR)" }[r.lo] + (p.from < p.to ? ", absorption" : ", emission") };
  },
  keyIdea: "<b>Key idea:</b> photon energy = difference between energy levels, E = hf. In hydrogen, Eₙ = −13.6 eV / n². Drops to n = 2 give visible light; drops to n = 1 give ultraviolet.",
  tryThis: ["Drop from level 3 to level 2. What colour is the light? Find its line on the spectrum.", "Which drop to level 2 gives violet light?", "Why does a drop to level 1 give ultraviolet instead of visible light?"],
  note: "Energy levels for hydrogen. The level diagram is not to scale.",
});
