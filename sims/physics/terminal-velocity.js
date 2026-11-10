const { C, line, text, rect, arrow, circle, plot } = Sim;
Sim({
  title: "Free Fall and Terminal Velocity",
  intro: "A skydiver falls. Gravity pulls down, air resistance pushes up and grows with speed. Eventually the forces balance and the speed stops increasing. That top speed is the terminal velocity.",
  controls: [
    { id: "m", label: "Mass", min: 40, max: 150, step: 5, value: 80, unit: "kg" },
    { id: "area", label: "Body position", type: "select", options: [[0.7, "Spread out (belly down)"], [0.25, "Head first (diving)"], [30, "Parachute open"]] },
    { id: "air", label: "Air resistance", type: "checkbox", value: true },
  ],
  readouts: [["t", "Time"], ["v", "Speed"], ["drag", "Air resistance"], ["vt", "Terminal velocity"], ["h", "Height"]],
  init(s) { s.v = 0; s.t = 0; s.h = 3000; s.hist = []; },
  drag(p, v) { return p.air ? 0.5 * 1.2 * 1.0 * p.area * v * v : 0; },
  substeps: 4,
  step(s, p, dt) {
    if (s.h <= 0) return;
    const a = 9.81 - this.drag(p, s.v) / p.m;
    s.v += a * dt; s.h -= s.v * dt; s.t += dt;
    if (s.h < 0) { s.h = 0; }
    if (!s.hist.length || s.t - s.hist.at(-1)[0] > 0.1) s.hist.push([s.t, s.v]);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.35;
    rect(ctx, 0, 0, left, H, C.sky);
    const y = 40 + (1 - s.h / 3000) * (H - 90);
    rect(ctx, 0, H - 20, left, 20, C.green);
    const cx = left / 2;
    if (p.area === 30) { ctx.beginPath(); ctx.arc(cx, y - 40, 34, Math.PI, 0); ctx.fillStyle = C.orange; ctx.fill(); line(ctx, cx - 34, y - 40, cx, y, C.text, 1); line(ctx, cx + 34, y - 40, cx, y, C.text, 1); }
    circle(ctx, cx, y, 10, C.blue);
    const W1 = p.m * 9.81, D = this.drag(p, s.v), k = 0.06;
    arrow(ctx, cx + 22, y, cx + 22, y + W1 * k, C.red, 3); text(ctx, "weight", cx + 28, y + W1 * k, { color: C.red, size: 12 });
    if (D > 1) { arrow(ctx, cx - 22, y, cx - 22, y - Math.min(D, 3000) * k, C.green, 3); text(ctx, "air resistance", cx - 28, y - Math.min(D, 3000) * k, { color: C.green, size: 12, align: "right" }); }
    const vt = p.air ? Math.sqrt((2 * p.m * 9.81) / (1.2 * p.area)) : null;
    plot(ctx, { x: left + 10, y: 10, w: W - left - 20, h: H - 20 }, { title: "Speed over time", xmin: 0, xmax: Math.max(20, s.t), ymin: 0, ymax: p.air ? Math.max(70, vt * 1.15) : 250, xlabel: "time (s)", ylabel: "speed (m/s)", series: [{ data: s.hist, color: C.blue }], hlines: vt ? [{ y: vt, color: C.green, label: "terminal velocity" }] : [] });
  },
  read(s, p) {
    const vt = p.air ? Math.sqrt((2 * p.m * 9.81) / (1.2 * p.area)) : null;
    return { t: s.t.toFixed(1) + " s", v: s.v.toFixed(1) + " m/s", drag: this.drag(p, s.v).toFixed(0) + " N", vt: vt ? vt.toFixed(1) + " m/s" : "none (no air)", h: s.h.toFixed(0) + " m" };
  },
  keyIdea: "<b>Key idea:</b> drag grows with speed squared. When drag equals weight, the net force is zero, so acceleration is zero and the speed stays constant (Newton's first law).",
  tryThis: ["Turn off air resistance. What does the speed–time graph look like now?", "Compare spread out vs head first. Which has the higher terminal velocity, and why?", "Open the parachute halfway down (change the position while it's falling). What happens to the speed?"],
  note: "Simplified: air density stays constant with height.",
});
