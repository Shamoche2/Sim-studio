const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Motion Graphs",
  intro: "A car drives along a straight road. Set its starting speed and acceleration, and watch the distance–time and velocity–time graphs being drawn. The shape of each graph tells the story of the motion.",
  controls: [
    { id: "u", label: "Starting velocity", min: -5, max: 10, step: 0.5, value: 2, unit: "m/s", digits: 1 },
    { id: "a", label: "Acceleration", min: -2, max: 2, step: 0.1, value: 0.5, unit: "m/s²", digits: 1 },
  ],
  readouts: [["t", "Time"], ["x", "Position"], ["v", "Velocity"]],
  resetOnChange: true,
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(10, s.t + dt); },
  pos(p, t) { return p.u * t + 0.5 * p.a * t * t; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const road = 54, xs = Array.from({ length: 101 }, (_, i) => this.pos(p, i / 10)), lo = Math.min(0, ...xs), hi = Math.max(10, ...xs);
    rect(ctx, 0, 14, W, 30, "#dee2e6");
    const X = (x) => 20 + ((x - lo) / (hi - lo)) * (W - 60);
    for (let m = Math.ceil(lo / 10) * 10; m <= hi; m += 10) text(ctx, m + " m", X(m), 12, { align: "center", size: 10, color: C.muted });
    const cx = X(this.pos(p, s.t));
    rect(ctx, cx - 14, 20, 28, 16, C.red, null, 5); circle(ctx, cx - 8, 38, 4, C.text); circle(ctx, cx + 8, 38, 4, C.text);
    const pts = (f) => { const o = []; for (let t = 0; t <= s.t + 1e-9; t += 0.05) o.push([t, f(t)]); return o; };
    const half = (W - 10) / 2, vmax = Math.max(Math.abs(p.u), Math.abs(p.u + 10 * p.a), 2) * 1.15;
    plot(ctx, { x: 0, y: road, w: half, h: H - road }, { title: "Distance (position)–time", xmin: 0, xmax: 10, ymin: lo, ymax: hi * 1.05, xlabel: "time (s)", ylabel: "position (m)", series: [{ data: pts((t) => this.pos(p, t)), color: C.blue }] });
    plot(ctx, { x: half + 10, y: road, w: half, h: H - road }, { title: "Velocity–time", xmin: 0, xmax: 10, ymin: -vmax, ymax: vmax, xlabel: "time (s)", ylabel: "velocity (m/s)", series: [{ data: pts((t) => p.u + p.a * t), color: C.orange }], hlines: [{ y: 0, color: "#ced4da" }] });
  },
  read(s, p) { return { t: s.t.toFixed(1) + " s", x: this.pos(p, s.t).toFixed(1) + " m", v: (p.u + p.a * s.t).toFixed(2) + " m/s" }; },
  keyIdea: "<b>Key idea:</b> the gradient of a distance–time graph is the velocity. The gradient of a velocity–time graph is the acceleration, and the area under it is the distance travelled.",
  tryThis: ["Set acceleration to 0. What shape are the two graphs?", "Start at 8 m/s with −1.5 m/s². When does the car stop? What happens after?", "Find the distance travelled from the area under the velocity–time graph and compare with the readout."],
});
