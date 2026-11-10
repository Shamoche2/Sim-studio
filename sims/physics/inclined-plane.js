const { C, text, rect, arrow, line } = Sim;
Sim({
  title: "Forces on an Inclined Plane",
  intro: "A box sits on a ramp. Gravity pulls it straight down, but we split that into a part along the slope and a part into the slope. Friction resists sliding. When does the box start to slide?",
  controls: [
    { id: "ang", label: "Ramp angle", min: 0, max: 60, step: 1, value: 25, unit: "°" },
    { id: "m", label: "Mass", min: 1, max: 20, step: 1, value: 5, unit: "kg" },
    { id: "mu", label: "Friction coefficient", min: 0, max: 1, step: 0.01, value: 0.4, digits: 2 },
  ],
  readouts: [["along", "Weight along slope"], ["normal", "Normal force"], ["fric", "Friction"], ["a", "Acceleration"], ["slide", "Slides?"]],
  init(s) { s.d = 0; s.v = 0; },
  calc(p) {
    const g = 9.81, t = (p.ang * Math.PI) / 180, along = p.m * g * Math.sin(t), N = p.m * g * Math.cos(t), fmax = p.mu * N;
    const slides = along > fmax;
    return { along, N, fric: slides ? fmax : along, a: slides ? (along - fmax) / p.m : 0, slides };
  },
  step(s, p, dt) { const r = this.calc(p); if (r.slides) { s.v += r.a * dt; s.d += s.v * dt; } else s.v = 0; if (s.d > 6) { s.d = 0; s.v = 0; } },
  change(s) { s.d = 0; s.v = 0; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const t = (p.ang * Math.PI) / 180, L = Math.min(W * 0.8, (H - 40) / Math.max(0.2, Math.sin(t)) * 0.9), bx = W * 0.1, by = H - 30;
    const tx = bx + L * Math.cos(t), ty = by - L * Math.sin(t);
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + L * Math.cos(t), by); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fillStyle = "#e9ddc7"; ctx.fill(); ctx.strokeStyle = C.brown; ctx.lineWidth = 2; ctx.stroke();
    text(ctx, `${p.ang}°`, bx + 50, by - 8, { weight: 700 });
    const along = 0.35 + s.d * 0.08, px = tx - (L * along) * Math.cos(t), py = ty + (L * along) * Math.sin(t), size = 34 + p.m * 1.5;
    ctx.save(); ctx.translate(px, py); ctx.rotate(-t);
    rect(ctx, -size / 2, -size, size, size, C.blue, "#1c3f8f", 4);
    ctx.restore();
    const cxm = px - Math.sin(t) * size / 2, cym = py - Math.cos(t) * size / 2, r = this.calc(p), k = 0.9;
    arrow(ctx, cxm, cym, cxm, cym + p.m * 9.81 * k, C.red, 3); text(ctx, "weight", cxm + 6, cym + p.m * 9.81 * k, { color: C.red, size: 12, weight: 600 });
    arrow(ctx, cxm, cym, cxm - Math.sin(t) * r.N * k, cym - Math.cos(t) * r.N * k, C.green, 3); text(ctx, "normal", cxm - Math.sin(t) * r.N * k - 6, cym - Math.cos(t) * r.N * k, { color: C.green, size: 12, align: "right", weight: 600 });
    if (r.fric > 0.01) { arrow(ctx, cxm, cym, cxm + Math.cos(t) * r.fric * k, cym - Math.sin(t) * r.fric * k, C.orange, 3); text(ctx, "friction", cxm + Math.cos(t) * r.fric * k + 4, cym - Math.sin(t) * r.fric * k - 4, { color: C.orange, size: 12, weight: 600 }); }
    line(ctx, cxm, cym, cxm - Math.cos(t) * r.along * k, cym + Math.sin(t) * r.along * k, C.purple, 2, [4, 3]);
    text(ctx, r.slides ? "Sliding!" : "Staying still", W - 20, 30, { align: "right", weight: 700, size: 16, color: r.slides ? C.red : C.green });
  },
  read(s, p) { const r = this.calc(p); return { along: r.along.toFixed(1) + " N", normal: r.N.toFixed(1) + " N", fric: r.fric.toFixed(1) + " N", a: r.a.toFixed(2) + " m/s²", slide: r.slides ? "yes" : "no" }; },
  keyIdea: "<b>Key idea:</b> along the slope the weight component is mg sin θ; into the slope it's mg cos θ. The box slides when mg sin θ > μ mg cos θ, i.e. when tan θ > μ. Mass cancels out!",
  tryThis: ["With μ = 0.4, slowly raise the angle. At what angle does the box start sliding? Check: tan θ = 0.4.", "Change the mass. Does the sliding angle change?", "Set friction to 0. Is there any angle where the box stays still?"],
  note: "Purple dashed line: weight component along the slope.",
});
