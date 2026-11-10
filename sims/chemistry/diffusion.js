const { C, text, rect, circle, plot, line } = Sim;
Sim({
  title: "Diffusion of Gases",
  intro: "Two gases start on opposite sides of a barrier. Remove it and random particle motion mixes them, with no stirring needed. Lighter particles move faster and spread more quickly.",
  controls: [
    { id: "mA", label: "Mass of red particles", min: 1, max: 10, step: 1, value: 2, unit: "u" },
    { id: "mB", label: "Mass of blue particles", min: 1, max: 10, step: 1, value: 8, unit: "u" },
    { id: "T", label: "Temperature", min: 100, max: 600, step: 10, value: 300, unit: "K" },
  ],
  buttons: [{ label: "Remove barrier", primary: true, click(s) { s.open = true; } }],
  readouts: [["redR", "Red on right side"], ["blueL", "Blue on left side"], ["speeds", "Speed ratio (red : blue)"]],
  resetOnChange: true,
  init(s, p) {
    s.box = { x0: 0, y0: 0, x1: 100, y1: 50 }; s.open = false; s.t = 0; s.hist = { a: [], b: [] };
    const v = (m) => Math.sqrt(p.T / m) * 0.6;
    s.parts = [...Sim.particles.make(60, { x0: 0, y0: 0, x1: 49, y1: 50 }, v(p.mA), { m: p.mA, type: "A" }), ...Sim.particles.make(60, { x0: 51, y0: 0, x1: 100, y1: 50 }, v(p.mB), { m: p.mB, type: "B" })];
  },
  substeps: 3,
  step(s, p, dt) {
    dt *= 2;
    if (!s.open) {
      for (const q of s.parts) {
        const b = q.type === "A" ? { x0: 0, y0: 0, x1: 50, y1: 50 } : { x0: 50, y0: 0, x1: 100, y1: 50 };
        Sim.particles.move([q], dt, b);
      }
    } else { Sim.particles.move(s.parts, dt, s.box); s.t += dt; }
    Sim.particles.collide(s.parts);
    if (s.open && (!s.hist.a.length || s.t - s.hist.a.at(-1)[0] > 0.3)) {
      s.hist.a.push([s.t, s.parts.filter((q) => q.type === "A" && q.x > 50).length]);
      s.hist.b.push([s.t, s.parts.filter((q) => q.type === "B" && q.x < 50).length]);
    }
  },
  draw({ ctx, W, H }, s, p) {
    const top = H * 0.55, sc = Math.min((W - 20) / 100, (top - 10) / 50), ox = (W - 100 * sc) / 2;
    rect(ctx, 0, 0, W, H, "#fff");
    rect(ctx, ox, 5, 100 * sc, 50 * sc, null, C.text, 0, 2);
    if (!s.open) line(ctx, ox + 50 * sc, 5, ox + 50 * sc, 5 + 50 * sc, C.text, 4);
    else line(ctx, ox + 50 * sc, 5, ox + 50 * sc, 5 + 50 * sc, C.gray, 1, [4, 4]);
    for (const q of s.parts) circle(ctx, ox + q.x * sc, 5 + q.y * sc, sc * (0.7 + q.m * 0.06), q.type === "A" ? C.red : C.blue);
    plot(ctx, { x: 0, y: top + 4, w: W, h: H - top - 4 }, { title: "Particles that crossed over", xmin: 0, xmax: Math.max(20, s.t), ymin: 0, ymax: 40, xlabel: "time", ylabel: "count", series: [{ data: s.hist.a, color: C.red, label: "red → right" }, { data: s.hist.b, color: C.blue, label: "blue → left" }], hlines: [{ y: 30, color: C.gray, label: "fully mixed" }] });
  },
  read(s, p) {
    return { redR: String(s.parts.filter((q) => q.type === "A" && q.x > 50).length), blueL: String(s.parts.filter((q) => q.type === "B" && q.x < 50).length), speeds: (Math.sqrt(p.mB / p.mA)).toFixed(2) + " : 1" };
  },
  keyIdea: "<b>Key idea:</b> diffusion is the net movement of particles from high to low concentration, caused by random motion. Graham's law: rate ∝ 1/√(mass), so lighter gases diffuse faster.",
  tryThis: ["Remove the barrier. Which colour crosses over faster? Why?", "Make both masses equal. Do they mix at the same rate?", "Raise the temperature. Does mixing speed up?"],
});
