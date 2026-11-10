const { C, line, text, rect, arrow, circle } = Sim;
Sim({
  title: "Newton's Second Law (F = ma)",
  intro: "Push a cart with a force and watch it speed up. Friction pushes back. The bigger the net force and the smaller the mass, the bigger the acceleration.",
  controls: [
    { id: "F", label: "Applied force", min: 0, max: 100, step: 1, value: 30, unit: "N" },
    { id: "m", label: "Cart mass", min: 1, max: 50, step: 1, value: 10, unit: "kg" },
    { id: "mu", label: "Friction coefficient", min: 0, max: 0.5, step: 0.01, value: 0.1, digits: 2, help: "0 = ice, 0.5 = rough carpet" },
  ],
  readouts: [["fric", "Friction force"], ["net", "Net force"], ["a", "Acceleration"], ["v", "Speed"], ["d", "Distance"]],
  init(s) { s.x = 0; s.v = 0; s.t = 0; },
  forces(p, v) {
    const g = 9.81, fmax = p.mu * p.m * g;
    let fric;
    if (v > 1e-6) fric = fmax; else fric = Math.min(p.F, fmax);
    return { fric, net: p.F - fric };
  },
  step(s, p, dt) {
    const { net } = this.forces(p, s.v);
    s.v = Math.max(0, s.v + (net / p.m) * dt); s.x += s.v * dt; s.t += dt;
  },
  draw({ ctx, W, H }, s, p) {
    const ground = H * 0.68, pxPerM = 40, camX = Math.max(0, s.x * pxPerM - W * 0.4);
    rect(ctx, 0, 0, W, ground, C.sky);
    rect(ctx, 0, ground, W, H - ground, "#c9b79c");
    for (let m = Math.floor(camX / pxPerM / 5) * 5; m * pxPerM < camX + W; m += 5) {
      const x = m * pxPerM - camX + 170;
      line(ctx, x, ground, x, ground + 10, C.text, 1.5); text(ctx, m + " m", x, ground + 24, { align: "center", size: 12 });
    }
    const cw = 70 + p.m * 1.6, ch = 40 + p.m * 0.6, cx = s.x * pxPerM - camX + 170, cy = ground - ch - 12;
    rect(ctx, cx, cy, cw, ch, C.blue, "#1c3f8f", 6);
    text(ctx, p.m + " kg", cx + cw / 2, cy + ch / 2 + 5, { align: "center", color: "#fff", weight: 700 });
    circle(ctx, cx + 16, ground - 8, 8, C.text); circle(ctx, cx + cw - 16, ground - 8, 8, C.text);
    const { fric, net } = this.forces(p, s.v), k = 1.6;
    if (p.F) { arrow(ctx, cx - p.F * k - 6, cy + ch / 2, cx - 6, cy + ch / 2, C.green, 4); text(ctx, `Push ${p.F} N`, cx - p.F * k / 2 - 6, cy + ch / 2 - 10, { align: "center", color: C.green, weight: 600 }); }
    if (fric > 0.01) { arrow(ctx, cx + cw / 2, ground - 2, cx + cw / 2 - fric * k, ground - 2, C.red, 4); text(ctx, `Friction ${fric.toFixed(0)} N`, cx + cw / 2 - 10, ground - 22 > cy + ch ? ground - 22 : ground + 40, { align: "right", color: C.red, weight: 600 }); }
    text(ctx, `Net force ${net.toFixed(1)} N  →  a = ${(net / p.m).toFixed(2)} m/s²`, 16, 26, { size: 15, weight: 600 });
  },
  read(s, p) {
    const { fric, net } = this.forces(p, s.v);
    return { fric: fric.toFixed(1) + " N", net: net.toFixed(1) + " N", a: (s.v > 0 || net > 0 ? net / p.m : 0).toFixed(2) + " m/s²", v: s.v.toFixed(2) + " m/s", d: s.x.toFixed(1) + " m" };
  },
  keyIdea: "<b>Key idea:</b> a = F<sub>net</sub> / m. If the push is smaller than the maximum friction (μmg), the cart doesn't move at all.",
  tryThis: ["Set friction to 0.3 with a 10 kg cart. What's the smallest push that makes it move?", "Keep the force at 50 N and double the mass. What happens to the acceleration?", "Set friction to 0 and the push to 0 while the cart is moving. Does it stop? (Newton's first law)"],
});
