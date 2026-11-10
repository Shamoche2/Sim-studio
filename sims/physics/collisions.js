const { C, line, text, rect, arrow } = Sim;
Sim({
  title: "Momentum and Collisions",
  intro: "Two carts crash on a frictionless track. Momentum (mass × velocity) is always conserved. In an elastic collision kinetic energy is conserved too; in a sticky one it isn't.",
  controls: [
    { id: "m1", label: "Mass of A", min: 1, max: 10, step: 0.5, value: 2, unit: "kg", digits: 1 },
    { id: "u1", label: "Starting velocity of A", min: -5, max: 5, step: 0.5, value: 3, unit: "m/s", digits: 1 },
    { id: "m2", label: "Mass of B", min: 1, max: 10, step: 0.5, value: 4, unit: "kg", digits: 1 },
    { id: "u2", label: "Starting velocity of B", min: -5, max: 5, step: 0.5, value: -1, unit: "m/s", digits: 1 },
    { id: "type", label: "Collision type", type: "select", options: [["elastic", "Elastic (bouncy)"], ["inelastic", "Perfectly inelastic (sticky)"]] },
  ],
  readouts: [["pb", "Momentum before"], ["pa", "Momentum after"], ["kb", "Kinetic energy before"], ["ka", "Kinetic energy after"]],
  resetOnChange: true,
  init(s, p) { s.x1 = 2; s.x2 = 8; s.v1 = p.u1; s.v2 = p.u2; s.hit = false; },
  after(p) {
    const { m1, m2, u1, u2 } = p;
    if (p.type === "inelastic") { const v = (m1 * u1 + m2 * u2) / (m1 + m2); return [v, v]; }
    return [((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2), ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2)];
  },
  step(s, p, dt) {
    const w1 = 0.4 + p.m1 * 0.06, w2 = 0.4 + p.m2 * 0.06;
    s.x1 += s.v1 * dt; s.x2 += s.v2 * dt;
    if (!s.hit && s.x2 - s.x1 <= (w1 + w2) / 2 && s.v1 > s.v2) { [s.v1, s.v2] = this.after(p); s.hit = true; }
    // walls
    if (s.x1 < w1 / 2 || s.x2 > 10 - w2 / 2 || s.x1 > 10 || s.x2 < 0) { s.v1 = 0; s.v2 = 0; }
  },
  draw({ ctx, W, H }, s, p) {
    const sc = (W - 40) / 10, ground = H * 0.62, X = (x) => 20 + x * sc;
    rect(ctx, 0, 0, W, H, "#fff");
    line(ctx, 10, ground, W - 10, ground, C.text, 3);
    const cart = (x, m, v, col, name) => {
      const w = (0.4 + m * 0.06) * sc, h = 30 + m * 4;
      rect(ctx, X(x) - w / 2, ground - h, w, h, col, null, 6);
      text(ctx, `${name}  ${m} kg`, X(x), ground - h / 2 + 5, { align: "center", color: "#fff", weight: 700, size: 12 });
      if (Math.abs(v) > 0.01) arrow(ctx, X(x), ground - h - 14, X(x) + v * 22, ground - h - 14, col, 3);
      text(ctx, `${v.toFixed(2)} m/s`, X(x), ground - h - 24, { align: "center", color: col, size: 12, weight: 600 });
    };
    cart(s.x1, p.m1, s.v1, C.blue, "A"); cart(s.x2, p.m2, s.v2, C.orange, "B");
    const pv = (v1, v2) => p.m1 * v1 + p.m2 * v2;
    text(ctx, `Total momentum: ${pv(s.v1, s.v2).toFixed(2)} kg·m/s`, W / 2, H - 20, { align: "center", weight: 700, size: 15 });
  },
  read(s, p) {
    const [a1, a2] = this.after(p), ke = (v1, v2) => 0.5 * p.m1 * v1 * v1 + 0.5 * p.m2 * v2 * v2;
    return { pb: (p.m1 * p.u1 + p.m2 * p.u2).toFixed(2) + " kg·m/s", pa: (p.m1 * a1 + p.m2 * a2).toFixed(2) + " kg·m/s", kb: ke(p.u1, p.u2).toFixed(2) + " J", ka: ke(a1, a2).toFixed(2) + " J" };
  },
  keyIdea: "<b>Key idea:</b> total momentum before = total momentum after, in every collision. Kinetic energy is only conserved in elastic collisions; in sticky ones some turns into heat and sound.",
  tryThis: ["Make the masses equal and B stationary, with an elastic collision. What happens to A?", "Switch to sticky. How much kinetic energy is lost?", "A light cart hits a very heavy stationary cart elastically. What happens?"],
  note: "Carts stop when they reach the ends of the track.",
});
