const { C, text, rect, circle, line } = Sim;
Sim({
  title: "Work, Energy and Power",
  intro: "A crane lifts a load. Work done = force × distance. Power is how fast that work is done. A more powerful motor lifts the same load to the same height in less time.",
  controls: [
    { id: "m", label: "Load mass", min: 50, max: 1000, step: 50, value: 300, unit: "kg" },
    { id: "h", label: "Lift height", min: 2, max: 20, step: 1, value: 10, unit: "m" },
    { id: "P", label: "Motor power", min: 1, max: 20, step: 0.5, value: 5, unit: "kW", digits: 1 },
  ],
  readouts: [["W", "Work done (= energy gained)"], ["t", "Time needed"], ["now", "Height now"], ["v", "Lifting speed"]],
  resetOnChange: true,
  init(s) { s.y = 0; s.t = 0; },
  step(s, p, dt) { const v = (p.P * 1000) / (p.m * 9.81); if (s.y < p.h) { s.y = Math.min(p.h, s.y + v * dt); s.t += dt; } },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, C.sky); rect(ctx, 0, H - 24, W, 24, "#ced4da");
    const sc = (H - 70) / 20, base = H - 24, mx = W * 0.25;
    rect(ctx, mx - 10, base - 20 * sc - 20, 20, 20 * sc + 20, "#fab005", C.text, 0, 1.5);
    rect(ctx, mx - 10, base - 20 * sc - 30, W * 0.38, 14, "#fab005", C.text, 0, 1.5);
    const hx = mx + W * 0.3, y = base - s.y * sc;
    line(ctx, hx, base - 20 * sc - 16, hx, y - 30, C.text, 1.5);
    const sz = 20 + Math.sqrt(p.m) * 1.2; rect(ctx, hx - sz / 2, y - 30, sz, 30, C.gray, C.text, 3, 1.5); text(ctx, p.m + " kg", hx, y - 11, { align: "center", color: "#fff", size: 11, weight: 700 });
    line(ctx, hx + sz, base, hx + sz, base - p.h * sc, C.green, 1.5, [4, 4]); text(ctx, p.h + " m", hx + sz + 6, base - (p.h * sc) / 2, { color: C.green, weight: 600 });
    Sim.bars(ctx, { x: W * 0.68, y: 10, w: W * 0.3, h: H - 40 }, [{ label: "Energy gained", value: p.m * 9.81 * s.y / 1000, color: C.purple }], { max: (p.m * 9.81 * p.h) / 1000, title: "kJ", fmt: (v) => v.toFixed(1) });
  },
  read(s, p) { const W = p.m * 9.81 * p.h; return { W: (W / 1000).toFixed(1) + " kJ", t: (W / (p.P * 1000)).toFixed(1) + " s", now: s.y.toFixed(1) + " m", v: ((p.P * 1000) / (p.m * 9.81)).toFixed(2) + " m/s" }; },
  keyIdea: "<b>Key idea:</b> work done W = F × d (here the force is the weight, mg). Power P = W ÷ t, measured in watts (1 W = 1 J/s). The energy gained is gravitational potential energy, mgh.",
  tryThis: ["Double the motor power. What happens to the time needed?", "Lift 300 kg by 10 m. How much work is done? Check: 300 × 9.81 × 10.", "What power would lift 1000 kg by 20 m in 10 seconds?"],
  note: "Assumes a 100% efficient motor.",
});
