const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Rates of Reaction (Collision Theory)",
  intro: "Particles react only when they collide with enough energy (the activation energy). Raise the temperature, the concentration, or add a catalyst, and watch the reaction speed up.",
  controls: [
    { id: "T", label: "Temperature", min: 200, max: 600, step: 10, value: 300, unit: "K" },
    { id: "n", label: "Concentration (particles of each)", min: 10, max: 80, step: 5, value: 40 },
    { id: "cat", label: "Add a catalyst", type: "checkbox", value: false },
  ],
  readouts: [["prod", "Product formed"], ["left", "Reactants left"], ["rate", "Current rate"], ["frac", "Collisions that react"]],
  resetOnChange: true,
  init(s, p) {
    s.box = { x0: 0, y0: 0, x1: 80, y1: 50 }; s.t = 0; s.hist = []; s.hits = 0; s.success = 0; s.recent = [];
    const v = Math.sqrt(p.T) * 0.6;
    s.parts = [...Sim.particles.make(p.n, s.box, v, { type: "A" }), ...Sim.particles.make(p.n, s.box, v, { type: "B" })];
  },
  change(s, p, id) { if (id === "T") { Sim.particles.thermostat(s.parts, (p.T * 0.36) / 2, 1); return false; } return id !== "cat"; },
  substeps: 3,
  step(s, p, dt) {
    dt *= 2; s.t += dt;
    const Ea = p.cat ? 130 : 230;
    Sim.particles.move(s.parts, dt, s.box);
    Sim.particles.collide(s.parts, (a, b) => {
      if (a.type === "C" || b.type === "C" || a.type === b.type) return false;
      s.hits++;
      const rel = 0.5 * ((a.vx - b.vx) ** 2 + (a.vy - b.vy) ** 2) * 0.5;
      if (rel > Ea) { a.type = "C"; a.vx = (a.vx + b.vx) / 2; a.vy = (a.vy + b.vy) / 2; a.r = 1.3; b.dead = true; s.success++; s.recent.push(s.t); return true; }
      return false;
    });
    s.parts = s.parts.filter((q) => !q.dead);
    Sim.particles.thermostat(s.parts, (p.T * 0.36) / 2, 0.05);
    s.recent = s.recent.filter((t) => s.t - t < 3);
    if (!s.hist.length || s.t - s.hist.at(-1)[0] > 0.3) s.hist.push([s.t, s.parts.filter((q) => q.type === "C").length]);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.52, sc = Math.min((left - 10) / 80, (H - 10) / 50), oy = (H - 50 * sc) / 2;
    rect(ctx, 0, 0, left, H, "#fff");
    rect(ctx, 5, oy, 80 * sc, 50 * sc, p.cat ? "#fff9db" : null, C.text, 0, 2);
    for (const q of s.parts) circle(ctx, 5 + q.x * sc, oy + q.y * sc, q.r * sc, q.type === "A" ? C.red : q.type === "B" ? C.blue : C.purple);
    if (p.cat) text(ctx, "catalyst present", 12, oy + 16, { color: C.orange, weight: 600, size: 12 });
    plot(ctx, { x: left + 8, y: 10, w: W - left - 16, h: H - 20 }, { title: "Product formed", xmin: 0, xmax: Math.max(20, s.t), ymin: 0, ymax: 80, xlabel: "time", ylabel: "product", series: [{ data: s.hist, color: C.purple }] });
  },
  read(s, p) {
    const prod = s.parts.filter((q) => q.type === "C").length;
    return { prod: String(prod), left: String(s.parts.length - prod), rate: (s.recent.length / 3).toFixed(1) + " /s", frac: s.hits ? ((100 * s.success) / s.hits).toFixed(1) + "%" : "—" };
  },
  keyIdea: "<b>Key idea:</b> rate depends on how often particles collide <em>and</em> what fraction of collisions have energy ≥ the activation energy. Heating increases both; a catalyst lowers the activation energy.",
  tryThis: ["Compare 250 K and 500 K. How much faster is the reaction?", "Double the concentration. Why does the rate increase?", "Add a catalyst. Does the percentage of successful collisions change?"],
  note: "Red + blue → purple. Simplified 2D model.",
});
