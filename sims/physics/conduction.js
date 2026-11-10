const { C, text, rect, circle } = Sim;
const RODS = [["Copper", 400, "#e8590c"], ["Aluminium", 205, "#adb5bd"], ["Iron", 80, "#495057"], ["Glass", 1, "#99e9f2"], ["Wood", 0.15, "#d9a066"]];
Sim({
  title: "Thermal Conduction",
  intro: "Heat one end of rods made of different materials. In metals, free electrons carry energy along quickly. Wax blobs melt as the heat arrives: the further they melt, the better the conductor.",
  controls: [{ id: "T", label: "Flame temperature", min: 100, max: 800, step: 50, value: 500, unit: "°C" }],
  readouts: [["t", "Time"], ["best", "Best conductor"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.temps = RODS.map(() => new Array(30).fill(20)); },
  timeScale: 8,
  substeps: 10,
  step(s, p, dt) {
    s.t += dt;
    RODS.forEach(([, k], i) => {
      const T = s.temps[i], a = 0.45 * (k / 400) ** 0.7, n = T.length; T[0] = p.T;
      const next = T.slice();
      for (let j = 1; j < n - 1; j++) next[j] = T[j] + a * (T[j - 1] - 2 * T[j] + T[j + 1]) * Math.min(1, dt * 4) - 0.002 * (T[j] - 20);
      next[n - 1] = next[n - 2]; s.temps[i] = next;
    });
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const x0 = 90, x1 = W - 20, rowH = (H - 20) / RODS.length;
    RODS.forEach(([name, , col], i) => {
      const y = 10 + i * rowH + rowH / 2, T = s.temps[i], seg = (x1 - x0) / T.length;
      T.forEach((t, j) => { const f = Math.min(1, (t - 20) / 300); rect(ctx, x0 + j * seg, y - 7, seg + 0.5, 14, `rgb(${Math.round(Sim.lerp(parseInt(col.slice(1, 3), 16), 255, f))},${Math.round(Sim.lerp(parseInt(col.slice(3, 5), 16), 60, f))},${Math.round(Sim.lerp(parseInt(col.slice(5, 7), 16), 20, f))})`); });
      for (let w = 1; w <= 5; w++) { const j = Math.floor((w / 6) * T.length), melted = T[j] > 60; if (!melted) circle(ctx, x0 + j * seg, y + 12, 5, "#fff3bf", "#e67700", 1.2); else circle(ctx, x0 + j * seg, y + 20, 2, "#e67700"); }
      text(ctx, name, x0 - 10, y + 4, { align: "right", weight: 600 });
    });
    for (let i = 0; i < 3; i++) { ctx.fillStyle = ["#ffd43b", "#ff922b", "#fa5252"][i]; ctx.beginPath(); ctx.ellipse(x0 - 2, H / 2, 10 - i * 3, (H / 2 - 10) * (1 - i * 0.2), 0, 0, Math.PI * 2); ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1; }
  },
  read(s) { return { t: s.t.toFixed(0) + " s", best: "Copper (400 W/m·K)" }; },
  keyIdea: "<b>Key idea:</b> conduction passes energy through a material by particles vibrating and colliding. Metals conduct best because they also have free electrons. Glass and wood are insulators.",
  tryThis: ["Which rod's wax blobs melt first? Which melt last?", "Why are saucepans made of metal but have wooden or plastic handles?", "Why does a metal bench feel colder than a wooden one at the same temperature?"],
  note: "Time sped up 8×. Thermal conductivities in W/m·K: copper 400, aluminium 205, iron 80, glass 1, wood 0.15.",
});
