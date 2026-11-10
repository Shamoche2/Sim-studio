const { C, text, rect, circle } = Sim;
const SUBSTANCES = { water: { name: "Water", mp: 0, bp: 100, color: C.blue }, ethanol: { name: "Ethanol", mp: -114, bp: 78, color: C.purple }, butane: { name: "Butane", mp: -138, bp: -1, color: C.orange } };
Sim({
  title: "States of Matter",
  intro: "Everything is made of particles that are always moving. Heat a substance and its particles move faster until they break free: solid → liquid → gas.",
  controls: [
    { id: "sub", label: "Substance", type: "select", options: Object.entries(SUBSTANCES).map(([k, v]) => [k, `${v.name} (melts ${v.mp} °C, boils ${v.bp} °C)`]) },
    { id: "T", label: "Temperature", min: -200, max: 200, step: 1, value: -20, unit: "°C" },
  ],
  readouts: [["state", "State"], ["mp", "Melting point"], ["bp", "Boiling point"], ["speed", "Average particle speed"]],
  aspect: 4 / 3,
  init(s) {
    s.box = { x0: 0, y0: 0, x1: 60, y1: 45 };
    s.parts = [];
    const cols = 8, rows = 6;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const hx = 30 - (cols - 1) * 1.1 + i * 2.2 + (j % 2) * 1.1, hy = 45 - 1.2 - j * 1.95;
      s.parts.push({ x: hx, y: hy, hx, hy, vx: 0, vy: 0, r: 1 });
    }
  },
  state(p) { const sb = SUBSTANCES[p.sub]; return p.T < sb.mp ? "solid" : p.T < sb.bp ? "liquid" : "gas"; },
  substeps: 6,
  step(s, p, dt) {
    const st = this.state(p), Tk = p.T + 273.15, target = Tk / 30, P = Sim.particles;
    dt *= 6;
    if (st === "solid") {
      const amp = Math.sqrt(Tk) * 0.025;
      for (const q of s.parts) { q.x = q.hx + Sim.randn() * amp; q.y = q.hy + Sim.randn() * amp; q.vx = q.vy = 0; }
      return;
    }
    if (st === "liquid") for (const q of s.parts) q.vy += 9 * dt; // gravity keeps liquid at the bottom
    if (s.parts.every((q) => q.vx === 0 && q.vy === 0)) for (const q of s.parts) { q.vx = Sim.randn(); q.vy = Sim.randn(); }
    P.move(s.parts, dt, s.box);
    P.collide(s.parts);
    if (st === "liquid") { // weak attraction: pull towards neighbours' centre
      const cx = s.parts.reduce((a, q) => a + q.x, 0) / s.parts.length;
      for (const q of s.parts) q.vx += (cx - q.x) * 0.02 * dt;
    }
    P.thermostat(s.parts, target, 0.1);
  },
  draw({ ctx, W, H }, s, p) {
    const sc = Math.min(W / 60, H / 45), ox = (W - 60 * sc) / 2;
    rect(ctx, 0, 0, W, H, "#fff");
    rect(ctx, ox, 0, 60 * sc, 45 * sc, null, C.text, 0, 3);
    const col = SUBSTANCES[p.sub].color;
    for (const q of s.parts) circle(ctx, ox + q.x * sc, q.y * sc, q.r * sc * 0.95, col, "#fff", 1);
    const st = this.state(p);
    text(ctx, st.toUpperCase(), ox + 10, 26, { weight: 700, size: 18, color: st === "solid" ? C.blue : st === "liquid" ? C.teal : C.red });
    // thermometer
    const tx = W - 30, frac = (p.T + 200) / 400;
    rect(ctx, tx - 6, 20, 12, H - 60, "#fff", C.text, 6, 1.5);
    rect(ctx, tx - 4, 20 + (H - 60) * (1 - frac), 8, (H - 60) * frac, C.red, null, 4);
    circle(ctx, tx, H - 30, 11, C.red);
  },
  read(s, p) { const sb = SUBSTANCES[p.sub]; return { state: this.state(p), mp: sb.mp + " °C", bp: sb.bp + " °C", speed: Math.sqrt((3 * 8.314 * (p.T + 273.15)) / 0.018).toFixed(0) + " m/s (for water)" }; },
  change(s, p, id) { if (id === "sub" || this.state(p) === "solid") return true; },
  keyIdea: "<b>Key idea:</b> in a solid, particles vibrate in fixed places. In a liquid, they slide past each other but stay close. In a gas, they move fast and freely. Temperature measures how fast the particles move.",
  tryThis: ["Heat water from −20 °C to 150 °C. At what temperatures does it change state?", "Compare water and butane at 20 °C. Why is butane a gas at room temperature?", "In which state do the particles take up the most space?"],
  note: "Simplified 2D particle model.",
});
