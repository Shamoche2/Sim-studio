const { C, text, rect, circle } = Sim;
Sim({
  title: "Convection Currents",
  intro: "Heat a liquid from below. The warm liquid expands, becomes less dense and rises; cooler, denser liquid sinks to take its place. This circulation is a convection current.",
  controls: [
    { id: "heat", label: "Heater power", min: 0, max: 100, step: 5, value: 60, unit: "%" },
    { id: "pos", label: "Heater position", type: "select", options: [["left", "Bottom left"], ["centre", "Bottom centre"]] },
  ],
  readouts: [["hot", "Average temperature"], ["flow", "Flow speed"]],
  init(s) { s.parts = Array.from({ length: 260 }, () => ({ x: Math.random(), y: Math.random(), T: 20 })); },
  step(s, p, dt) {
    const hx = p.pos === "left" ? 0.2 : 0.5, power = p.heat / 100;
    for (const q of s.parts) {
      if (q.y > 0.9 && Math.abs(q.x - hx) < 0.15) q.T += power * 60 * dt;
      if (q.y < 0.1) q.T -= (q.T - 20) * 0.8 * dt;
      q.T -= (q.T - 20) * 0.05 * dt;
      const buoy = (q.T - 30) * 0.004 * power;
      let vy = -buoy, vx = 0;
      if (q.y < 0.12) vx = (q.x < hx ? -1 : 1) * 0.15 * power;
      if (q.y > 0.88) vx = (q.x < hx ? 1 : -1) * 0.15 * power;
      q.x = Sim.clamp(q.x + (vx + Sim.randn() * 0.01) * dt, 0.01, 0.99); q.y = Sim.clamp(q.y + (vy + Sim.randn() * 0.01) * dt, 0.01, 0.99);
      if (q.x < 0.03 || q.x > 0.97) q.y += (q.T > 30 ? -0.02 : 0.08) * dt;
    }
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const bx = W * 0.15, bw = W * 0.7, by = 10, bh = H - 50;
    rect(ctx, bx, by, bw, bh, "rgba(116,192,252,.18)", C.text, 4, 2);
    for (const q of s.parts) { const f = Sim.clamp((q.T - 20) / 40, 0, 1); circle(ctx, bx + q.x * bw, by + q.y * bh, 3.5, `hsl(${220 - f * 220},80%,${55 - f * 5}%)`); }
    const hx = p.pos === "left" ? 0.2 : 0.5;
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.25 + (p.heat / 100) * 0.6; ctx.fillStyle = ["#ffd43b", "#ff922b", "#fa5252"][i]; ctx.beginPath(); ctx.ellipse(bx + hx * bw, by + bh + 22, 40 - i * 10, 16 - i * 4, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    text(ctx, "blue = cool, red = hot", 10, H - 8, { size: 12, color: C.muted });
  },
  read(s, p) { const avg = s.parts.reduce((a, q) => a + q.T, 0) / s.parts.length; return { hot: avg.toFixed(1) + " °C", flow: p.heat === 0 ? "none" : p.heat < 40 ? "slow" : "fast" }; },
  keyIdea: "<b>Key idea:</b> convection happens only in fluids (liquids and gases), because their particles can move around. Hot fluid rises because it is less dense; cool fluid sinks.",
  tryThis: ["Move the heater from the centre to the left. How does the pattern of circulation change?", "Turn the heater off. What happens to the movement?", "Why is a radiator usually placed low down in a room, and an air conditioner high up?"],
  note: "Simplified model of fluid flow.",
});
