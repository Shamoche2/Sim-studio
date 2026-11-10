const { C, line, text, rect, arrow } = Sim;
Sim({
  title: "Refraction and Snell's Law",
  intro: "Light bends when it passes from one material into another, because it changes speed. Change the angle and the materials to see how much it bends, and find total internal reflection.",
  controls: [
    { id: "angle", label: "Angle of incidence", min: 0, max: 89, step: 1, value: 40, unit: "°" },
    { id: "n1", label: "Top material", type: "select", options: [[1.0, "Air (n = 1.00)"], [1.33, "Water (n = 1.33)"], [1.5, "Glass (n = 1.50)"], [2.42, "Diamond (n = 2.42)"]], value: 1.0 },
    { id: "n2", label: "Bottom material", type: "select", options: [[1.0, "Air (n = 1.00)"], [1.33, "Water (n = 1.33)"], [1.5, "Glass (n = 1.50)"], [2.42, "Diamond (n = 2.42)"]], value: 1.5 },
  ],
  readouts: [["r", "Angle of refraction"], ["crit", "Critical angle"], ["speed", "Light speed below"]],
  calc(p) {
    const s2 = (p.n1 * Math.sin((p.angle * Math.PI) / 180)) / p.n2;
    return { tir: s2 > 1, r: s2 > 1 ? null : (Math.asin(s2) * 180) / Math.PI };
  },
  draw({ ctx, W, H }, s, p) {
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.45;
    const shade = (n) => `rgba(47,111,237,${(n - 1) * 0.35})`;
    rect(ctx, 0, 0, W, cy, "#fff"); rect(ctx, 0, 0, W, cy, shade(p.n1));
    rect(ctx, 0, cy, W, H - cy, "#fff"); rect(ctx, 0, cy, W, H - cy, shade(p.n2));
    line(ctx, 0, cy, W, cy, C.text, 2);
    line(ctx, cx, 10, cx, H - 10, C.gray, 1.5, [6, 5]);
    text(ctx, "normal", cx + 6, 24, { color: C.muted, size: 12 });
    const a = (p.angle * Math.PI) / 180, { tir, r } = this.calc(p);
    const sx = cx - Math.sin(a) * R, sy = cy - Math.cos(a) * R;
    arrow(ctx, sx, sy, cx - Math.sin(a) * R * 0.3, cy - Math.cos(a) * R * 0.3, C.red, 4);
    line(ctx, sx, sy, cx, cy, C.red, 4);
    // reflected ray (always some, strong when TIR)
    ctx.globalAlpha = tir ? 1 : 0.25;
    arrow(ctx, cx, cy, cx + Math.sin(a) * R, cy - Math.cos(a) * R, C.red, tir ? 4 : 2);
    ctx.globalAlpha = 1;
    if (!tir) {
      const rr = (r * Math.PI) / 180;
      arrow(ctx, cx, cy, cx + Math.sin(rr) * R, cy + Math.cos(rr) * R, C.orange, 4);
      text(ctx, `${r.toFixed(1)}°`, cx + 12, cy + 40, { color: C.orange, weight: 700 });
    } else text(ctx, "Total internal reflection!", cx + 20, cy + 40, { color: C.red, weight: 700, size: 15 });
    text(ctx, `${p.angle}°`, cx - 40, cy - 30, { color: C.red, weight: 700 });
    const names = { 1: "Air", 1.33: "Water", 1.5: "Glass", 2.42: "Diamond" };
    text(ctx, names[p.n1], 14, 26, { weight: 600 }); text(ctx, names[p.n2], 14, H - 14, { weight: 600 });
  },
  read(s, p) {
    const { r } = this.calc(p);
    return { r: r == null ? "none (reflected)" : r.toFixed(1) + "°", crit: p.n1 > p.n2 ? ((Math.asin(p.n2 / p.n1) * 180) / Math.PI).toFixed(1) + "°" : "none", speed: (300000 / p.n2).toFixed(0) + " km/s" };
  },
  keyIdea: "<b>Key idea:</b> Snell's law, n₁ sin θ₁ = n₂ sin θ₂. Going into a denser material (bigger n), light slows down and bends <em>towards</em> the normal.",
  tryThis: ["Light goes from air into glass. Does it bend towards or away from the normal?", "Put glass on top and air below. Increase the angle until the light can't escape. What's the critical angle?", "Why do diamonds sparkle so much? Find diamond's critical angle."],
});
