const { C, text, rect, circle } = Sim;
Sim({
  title: "Metallic Bonding",
  intro: "In a metal, positive ions sit in a regular lattice surrounded by a 'sea' of delocalised electrons that are free to move. This explains why metals conduct electricity and can be bent and hammered into shape.",
  controls: [
    { id: "V", label: "Voltage across the metal", min: 0, max: 10, step: 1, value: 0, unit: "V" },
    { id: "push", label: "Hammer the metal (shift layers)", min: 0, max: 1, step: 0.05, value: 0, digits: 2 },
    { id: "metal", label: "Metal", type: "select", options: [[1, "Sodium (1 delocalised e⁻ per atom)"], [2, "Magnesium (2 per atom)"], [3, "Aluminium (3 per atom)"]] },
  ],
  readouts: [["cond", "Current flowing?"], ["e", "Delocalised electrons shown"], ["mp", "Melting point"]],
  init(s) { s.e = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), vx: Sim.randn() * 0.05, vy: Sim.randn() * 0.05 })); },
  step(s, p, dt) { for (const e of s.e) { e.vx += Sim.randn() * 0.3 * dt + p.V * 0.004 * dt * 10; e.vy += Sim.randn() * 0.3 * dt; e.vx *= 0.97; e.vy *= 0.97; e.x = (e.x + e.vx * dt + 1) % 1; e.y = Sim.clamp(e.y + e.vy * dt, 0.02, 0.98); } },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff9db");
    const rows = 5, cols = 9, cw = W / cols, rh = H / rows, n = Math.round(40 * p.metal);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const shift = j >= 3 ? p.push * cw : 0, x = (i + 0.5) * cw + shift, y = (j + 0.5) * rh;
      circle(ctx, x, y, Math.min(cw, rh) * 0.33, "#ffa94d", "#d9480f", 1.5); text(ctx, "+".repeat(p.metal), x, y + 5, { align: "center", weight: 700, color: "#862e9c" });
    }
    if (p.push > 0) Sim.line(ctx, 0, rh * 3, W, rh * 3, C.gray, 1, [5, 5]);
    for (const e of s.e.slice(0, n)) circle(ctx, e.x * W, e.y * H, 3, C.blue);
    if (p.V > 0) text(ctx, "→ electrons drift towards the positive end", 10, 20, { weight: 700, color: C.blue });
    if (p.push > 0) text(ctx, "Layers slide over each other but the electron sea still holds them together", 10, H - 10, { size: 12, color: C.text, weight: 600 });
  },
  read(s, p) { return { cond: p.V > 0 ? "yes: electrons carry the current" : "no voltage applied", e: String(Math.round(40 * p.metal)), mp: { 1: "98 °C (weak)", 2: "650 °C", 3: "660 °C (strong)" }[p.metal] }; },
  keyIdea: "<b>Key idea:</b> metallic bonding is the attraction between positive metal ions and the sea of delocalised electrons. More delocalised electrons per atom and smaller ions make stronger bonding and higher melting points.",
  tryThis: ["Apply a voltage. Which particles move to carry the current?", "Slide the layers. Why doesn't the metal shatter like an ionic crystal would?", "Why does aluminium have a much higher melting point than sodium?"],
});
