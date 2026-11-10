const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Boyle's Law: Pressure and Volume",
  intro: "Squeeze a gas into a smaller space and its particles hit the walls more often, so the pressure goes up. Keep the temperature fixed, change the volume, and record pressure readings.",
  controls: [
    { id: "V", label: "Volume", min: 20, max: 100, step: 1, value: 60, unit: "% of max" },
    { id: "n", label: "Number of particles", min: 20, max: 120, step: 10, value: 60 },
  ],
  buttons: [{ label: "Record point", primary: true, click(s, p) { s.points.push({ x: p.V, y: s.P }); } }, { label: "Clear graph", click(s) { s.points = []; } }],
  readouts: [["P", "Pressure (measured)"], ["PV", "P × V"], ["theory", "Pressure (theory)"]],
  aspect: 16 / 9,
  init(s, p) { s.box = { x0: 0, y0: 0, x1: p.V, y1: 50 }; s.parts = Sim.particles.make(p.n, s.box, 12); s.imp = []; s.P = 0; s.points = s.points || []; },
  change(s, p, id) {
    if (id === "n") { const keep = s.points; this.init(s, p); s.points = keep; }
  },
  substeps: 4,
  step(s, p, dt) {
    s.box.x1 = Sim.lerp(s.box.x1, p.V, 0.2);
    const imp = Sim.particles.move(s.parts, dt * 3, s.box);
    Sim.particles.thermostat(s.parts, 144 * 0.75, 0.2);
    s.imp.push([imp, dt * 3]);
    if (s.imp.length > 600) s.imp.shift();
    const I = s.imp.reduce((a, b) => a + b[0], 0), T = s.imp.reduce((a, b) => a + b[1], 0);
    const perim = 2 * (s.box.x1 + 50);
    s.P = (I / T / perim) * 1.065; // scaled so P = 2.3 × N / V
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.5, sc = (left - 20) / 100, oy = (H - 50 * sc) / 2;
    rect(ctx, 0, 0, left, H, "#fff");
    rect(ctx, 10, oy, 100 * sc, 50 * sc, "#f8f9fa", C.gray, 0, 1);
    rect(ctx, 10, oy, s.box.x1 * sc, 50 * sc, null, C.text, 0, 3);
    rect(ctx, 10 + s.box.x1 * sc, oy - 6, 10, 50 * sc + 12, C.gray);
    rect(ctx, 20 + s.box.x1 * sc, oy + 25 * sc - 4, left, 8, C.gray);
    for (const q of s.parts) circle(ctx, 10 + q.x * sc, oy + q.y * sc, sc * 1.1, C.blue);
    const k = 2.3 * p.n;
    const curve = Array.from({ length: 81 }, (_, i) => { const v = 20 + i; return [v, k / v]; });
    plot(ctx, { x: left + 10, y: 10, w: W - left - 20, h: H - 20 }, { title: "Pressure vs volume", xmin: 0, xmax: 100, ymin: 0, ymax: 16, xlabel: "volume (%)", ylabel: "pressure (units)", series: [{ data: curve, color: C.gray, dash: [5, 4] }], marks: [...s.points.map((m) => ({ ...m, color: C.blue })), { x: p.V, y: s.P, color: C.red, r: 4 }] });
  },
  read(s, p) { const k = 2.3 * p.n; return { P: s.P.toFixed(2), PV: (s.P * p.V).toFixed(0), theory: (k / p.V).toFixed(2) }; },
  keyIdea: "<b>Key idea:</b> at constant temperature, P × V stays constant (Boyle's law). Halve the volume and the pressure doubles.",
  tryThis: ["Record points at volumes 100, 80, 60, 40 and 20. What shape is the graph?", "Check P × V for each point. Is it roughly the same?", "Add more particles. How does the curve change?"],
  note: "Pressure is measured from particle hits on the walls, so it jiggles. Wait a moment before recording.",
});
