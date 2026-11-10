const { C, text, rect, circle, line } = Sim;
const TRACKS = {
  bowl: (x) => 0.12 * (x - 5) ** 2,
  hills: (x) => 1.8 + 1.2 * Math.cos(x * 1.1) + 0.04 * (x - 5) ** 2,
  ramp: (x) => (x < 3 ? 3 * (1 - x / 3) ** 2 * 1 + 0 : x > 7 ? 1.2 * ((x - 7) / 3) ** 2 : 0),
};
Sim({
  title: "Energy Skate Park",
  intro: "A skater rolls on a track. As they go down, gravitational potential energy turns into kinetic energy; going up, it turns back. With friction, some becomes thermal energy.",
  controls: [
    { id: "track", label: "Track shape", type: "select", options: [["bowl", "Half-pipe bowl"], ["hills", "Hills"], ["ramp", "Ramp and slope"]] },
    { id: "m", label: "Skater mass", min: 30, max: 100, step: 5, value: 60, unit: "kg" },
    { id: "fric", label: "Friction", min: 0, max: 0.3, step: 0.01, value: 0, digits: 2 },
    { id: "start", label: "Starting position", min: 0.2, max: 4.5, step: 0.1, value: 1, unit: "m from left", digits: 1 },
  ],
  readouts: [["h", "Height"], ["v", "Speed"], ["KE", "Kinetic"], ["PE", "Potential"], ["TH", "Thermal"]],
  resetOnChange: true,
  init(s, p) { s.x = p.start; s.v = 0; s.th = 0; s.E0 = p.m * 9.81 * TRACKS[p.track](p.start); },
  substeps: 20,
  step(s, p, dt) {
    const f = TRACKS[p.track], h = 1e-3, slope = (f(s.x + h) - f(s.x - h)) / (2 * h), cos = 1 / Math.sqrt(1 + slope * slope);
    const g = 9.81, at = -g * slope * cos - Math.sign(s.v) * p.fric * g * cos; // tangential accel
    const vOld = s.v;
    s.v += at * dt;
    if (p.fric && Math.sign(s.v) !== Math.sign(vOld) && Math.abs(-g * slope * cos) < p.fric * g * cos) s.v = 0;
    s.x += s.v * cos * dt;
    if (s.x < 0.02 || s.x > 9.98) { s.x = Sim.clamp(s.x, 0.02, 9.98); s.v = -s.v * 0.0; }
    const KE = 0.5 * p.m * s.v * s.v, PE = p.m * g * f(s.x);
    s.th = Math.max(0, s.E0 - KE - PE);
  },
  draw({ ctx, W, H }, s, p) {
    const f = TRACKS[p.track], left = W * 0.68, sx = (left - 30) / 10, base = H - 30, sy = (H - 70) / 4, X = (x) => 15 + x * sx, Y = (y) => base - y * sy;
    rect(ctx, 0, 0, left, H, C.sky);
    ctx.beginPath(); ctx.moveTo(X(0), H);
    for (let i = 0; i <= 200; i++) { const x = (10 * i) / 200; ctx.lineTo(X(x), Y(f(x))); }
    ctx.lineTo(X(10), H); ctx.closePath(); ctx.fillStyle = "#c9b79c"; ctx.fill();
    for (let hm = 0; hm <= 4; hm++) { line(ctx, 0, Y(hm), left, Y(hm), C.grid, 1); text(ctx, hm + " m", 4, Y(hm) - 3, { size: 11, color: C.muted }); }
    line(ctx, 0, Y(s.E0 / (p.m * 9.81)), left, Y(s.E0 / (p.m * 9.81)), C.purple, 1, [4, 4]);
    circle(ctx, X(s.x), Y(f(s.x)) - 12, 11, C.orange, C.text, 2);
    const g = 9.81, KE = 0.5 * p.m * s.v * s.v, PE = p.m * g * f(s.x), max = Math.max(s.E0, 1);
    Sim.bars(ctx, { x: left + 10, y: 10, w: W - left - 20, h: H - 20 }, [
      { label: "Kinetic", value: KE, color: C.orange }, { label: "Potential", value: PE, color: C.blue }, { label: "Thermal", value: s.th, color: C.red }, { label: "Total", value: KE + PE + s.th, color: C.green },
    ], { max: max * 1.05, title: "Energy (J)", fmt: (v) => v.toFixed(0) });
  },
  read(s, p) {
    const f = TRACKS[p.track], g = 9.81;
    return { h: f(s.x).toFixed(2) + " m", v: Math.abs(s.v).toFixed(2) + " m/s", KE: (0.5 * p.m * s.v * s.v).toFixed(0) + " J", PE: (p.m * g * f(s.x)).toFixed(0) + " J", TH: s.th.toFixed(0) + " J" };
  },
  keyIdea: "<b>Key idea:</b> energy is conserved: KE + PE + thermal stays constant. KE = ½mv², PE = mgh. Without friction the skater always returns to the starting height (purple line).",
  tryThis: ["With no friction, where on the track is the skater fastest?", "Double the mass. Does the top speed change?", "Add friction. What happens to the total energy, and where does the lost energy go?"],
});
