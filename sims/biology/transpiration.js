const { C, text, rect, circle } = Sim;
Sim({
  title: "Transpiration in Plants",
  intro: "Plants lose water vapour through tiny pores in their leaves called stomata. This pulls water up from the roots through the xylem. Light, heat, wind and humidity all change how fast this happens.",
  controls: [
    { id: "light", label: "Light intensity", min: 0, max: 100, step: 5, value: 60, unit: "%" },
    { id: "T", label: "Temperature", min: 5, max: 40, step: 1, value: 22, unit: "°C" },
    { id: "wind", label: "Wind speed", min: 0, max: 10, step: 1, value: 2, unit: "m/s" },
    { id: "hum", label: "Humidity", min: 10, max: 95, step: 5, value: 50, unit: "%" },
  ],
  readouts: [["rate", "Transpiration rate"], ["stomata", "Stomata"], ["bubble", "Potometer bubble moves"]],
  rate(p) { const open = Math.min(1, p.light / 40); const vpd = (1 - p.hum / 100) * Math.exp(0.06 * (p.T - 20)); return 2.2 * open * vpd * (1 + 0.15 * p.wind); },
  init(s) { s.t = 0; s.bub = 0; s.drops = []; },
  step(s, p, dt) {
    const r = this.rate(p); s.t += dt; s.bub = (s.bub + r * dt * 0.02) % 1;
    if (Math.random() < r * dt * 2) s.drops.push({ x: Sim.rand(-1, 1), y: 0, vx: 0.3 + p.wind * 0.15 });
    for (const d of s.drops) { d.y += dt * 40; d.x += d.vx * dt; }
    s.drops = s.drops.filter((d) => d.y < 140);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, `rgb(${235 - p.hum},${242 - p.hum * 0.4},255)`);
    const cx = W * 0.32, ground = H * 0.78;
    rect(ctx, 0, ground, W * 0.62, H - ground, "#c4a77d");
    // stem with xylem flow
    rect(ctx, cx - 5, H * 0.3, 10, ground - H * 0.3, C.green);
    for (let i = 0; i < 8; i++) { const y = ground - ((i / 8 + s.t * this.rate(p) * 0.08) % 1) * (ground - H * 0.3); circle(ctx, cx, y, 2.5, "#74c0fc"); }
    // roots
    for (let k = -2; k <= 2; k++) Sim.line(ctx, cx, ground, cx + k * 22, ground + 40 + Math.abs(k) * 6, "#8d6e63", 2);
    // leaves
    for (const [dx, dy, a] of [[-1, 0.38, -0.5], [1, 0.46, 0.5], [-1, 0.56, -0.4], [1, 0.64, 0.4]]) {
      ctx.save(); ctx.translate(cx + dx * 34, H * dy); ctx.rotate(a); ctx.fillStyle = "#40c057"; ctx.beginPath(); ctx.ellipse(0, 0, 34, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (const d of s.drops) circle(ctx, cx + d.x * 40 + d.vx * 30, H * 0.36 - d.y, 2.5, "rgba(116,192,252,.8)");
    if (p.wind > 0) for (let i = 0; i < 4; i++) text(ctx, "≋", 10 + ((s.t * p.wind * 20 + i * 70) % (W * 0.6)), 40 + i * 30, { color: "#adb5bd", size: 20 });
    // stoma close-up
    const sx = W * 0.8, sy = H * 0.32, open = Math.min(1, p.light / 40);
    rect(ctx, sx - 80, sy - 70, 160, 140, "#d3f9d8", C.green, 10, 1.5);
    text(ctx, "Stoma (close-up)", sx, sy - 78, { align: "center", weight: 700, size: 12 });
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx + side * (14 + open * 10), sy, 16, 44, 0, 0, Math.PI * 2); ctx.fillStyle = "#2f9e44"; ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(sx, sy, 2 + open * 9, 30, 0, 0, Math.PI * 2); ctx.fillStyle = "#1b4332"; ctx.fill();
    text(ctx, "guard cells", sx, sy + 62, { align: "center", size: 11, color: C.muted });
    // potometer
    const py = H * 0.86;
    rect(ctx, W * 0.66, py - 6, W * 0.3, 12, "#e7f5ff", C.text, 6, 1.5);
    circle(ctx, W * 0.96 - s.bub * W * 0.3, py, 5, "#fff", C.text, 1.5);
    text(ctx, "potometer: bubble shows water uptake", W * 0.66, py - 14, { size: 11, color: C.muted });
  },
  read(s, p) { const r = this.rate(p); return { rate: r.toFixed(2) + " g/h (relative)", stomata: p.light < 10 ? "closed (dark)" : p.light < 40 ? "partly open" : "open", bubble: (r * 6).toFixed(1) + " mm/min" }; },
  keyIdea: "<b>Key idea:</b> transpiration is faster when it is light (stomata open), warm, windy and dry. Humid air slows it because there is less difference in water vapour between the leaf and the air.",
  tryThis: ["Turn the light to 0. What happens to the stomata and the rate?", "Which change speeds transpiration up most: doubling wind or halving humidity?", "Why might a plant wilt on a hot, windy, dry day?"],
  note: "Rates are illustrative, not measured values.",
});
