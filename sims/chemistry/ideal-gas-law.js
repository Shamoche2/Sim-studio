const { C, text, rect, circle } = Sim;
Sim({
  title: "The Ideal Gas Law (PV = nRT)",
  intro: "Pressure, volume, temperature and amount of gas are all linked by one equation. Change any three and see what the fourth must be. The particle box shows why.",
  controls: [
    { id: "n", label: "Amount of gas (n)", min: 0.2, max: 3, step: 0.1, value: 1, unit: "mol", digits: 1 },
    { id: "T", label: "Temperature (T)", min: 100, max: 600, step: 10, value: 300, unit: "K" },
    { id: "V", label: "Volume (V)", min: 5, max: 50, step: 1, value: 25, unit: "dm³" },
  ],
  readouts: [["P", "Pressure (P)"], ["atm", "In atmospheres"], ["check", "PV ÷ nT"]],
  P(p) { return (p.n * 8.314 * p.T) / (p.V / 1000); },
  init(s, p) { s.box = { x0: 0, y0: 0, x1: 50, y1: 40 }; s.parts = Sim.particles.make(60, s.box, 10); },
  substeps: 3,
  step(s, p, dt) {
    const want = Math.round(p.n * 30);
    while (s.parts.length < want) s.parts.push(...Sim.particles.make(1, s.box, 10));
    if (s.parts.length > want) s.parts.length = want;
    s.box.x1 = Sim.lerp(s.box.x1, p.V * 2, 0.15);
    Sim.particles.move(s.parts, dt * 2, s.box);
    Sim.particles.thermostat(s.parts, p.T / 3, 0.3);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const sc = Math.min((W * 0.62) / 100, (H - 20) / 40), oy = (H - 40 * sc) / 2;
    rect(ctx, 10, oy, 100 * sc, 40 * sc, "#f8f9fa", "#dee2e6", 0, 1);
    rect(ctx, 10, oy, s.box.x1 * sc, 40 * sc, null, C.text, 0, 3);
    rect(ctx, 10 + s.box.x1 * sc, oy - 4, 8, 40 * sc + 8, C.gray);
    const heat = (p.T - 100) / 500;
    for (const q of s.parts) circle(ctx, 10 + q.x * sc, oy + q.y * sc, sc * 0.9, `hsl(${220 - heat * 220},75%,50%)`);
    const gx = W * 0.82, gy = H * 0.4, P = this.P(p) / 101325, a = Math.min(1, P / 6) * Math.PI * 1.5 - Math.PI * 1.25;
    circle(ctx, gx, gy, 52, "#fff", C.text, 3);
    for (let k = 0; k <= 6; k++) { const aa = (k / 6) * Math.PI * 1.5 - Math.PI * 1.25; text(ctx, String(k), gx + Math.cos(aa) * 38, gy + Math.sin(aa) * 38 + 4, { align: "center", size: 10 }); }
    Sim.line(ctx, gx, gy, gx + Math.cos(a) * 40, gy + Math.sin(a) * 40, C.red, 3);
    text(ctx, "pressure (atm)", gx, gy + 72, { align: "center", size: 12, color: C.muted });
  },
  read(s, p) { const P = this.P(p); return { P: (P / 1000).toFixed(1) + " kPa", atm: (P / 101325).toFixed(2) + " atm", check: ((P * p.V) / 1000 / (p.n * p.T)).toFixed(3) + " = R (8.314)" }; },
  keyIdea: "<b>Key idea:</b> PV = nRT, where R = 8.314 J/(mol·K) and T is in kelvin. Double the temperature at fixed volume and the pressure doubles; halve the volume and the pressure doubles.",
  tryThis: ["Double the amount of gas. What happens to the pressure?", "Find the pressure of 1 mol at 273 K in 22.4 dm³. (It should be about 1 atm.)", "Why must you always use kelvin, never °C, in this equation?"],
});
