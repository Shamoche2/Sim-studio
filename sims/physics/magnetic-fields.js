const { C, text, rect, arrow } = Sim;
Sim({
  title: "Magnetic Fields",
  intro: "A magnet is surrounded by a magnetic field. Field lines run from the north pole to the south pole, and compasses line up along them. Drag the magnets to see how fields combine.",
  controls: [
    { id: "two", label: "Second magnet", type: "select", options: [["none", "None"], ["attract", "North facing south (attract)"], ["repel", "North facing north (repel)"]] },
    { id: "strength", label: "Magnet strength", min: 1, max: 5, step: 1, value: 3 },
  ],
  readouts: [["force", "Force between magnets"]],
  init(s) { s.m = [{ x: 0.35, y: 0.5 }, { x: 0.68, y: 0.5 }]; s.drag = null; },
  pointer(s, p, e) { const nx = e.x / e.W, ny = e.y / e.H; if (e.type === "down") s.drag = s.m.find((m, i) => (i === 0 || p.two !== "none") && Math.abs(m.x - nx) * e.W < 50 && Math.abs(m.y - ny) * e.H < 20) || null; if (e.type === "drag" && s.drag) { s.drag.x = Sim.clamp(nx, 0.1, 0.9); s.drag.y = Sim.clamp(ny, 0.1, 0.9); } if (e.type === "up") s.drag = null; },
  field(s, p, x, y, W, H) {
    let bx = 0, by = 0;
    const mags = [{ ...s.m[0], dir: 1 }]; if (p.two !== "none") mags.push({ ...s.m[1], dir: p.two === "attract" ? 1 : -1 });
    for (const m of mags) {
      const half = 40, poles = [[m.x * W + half * m.dir, m.y * H, 1], [m.x * W - half * m.dir, m.y * H, -1]]; // [x, y, +N/-S]
      for (const [px, py, q] of poles) { const dx = x - px, dy = y - py, r2 = dx * dx + dy * dy + 30, r = Math.sqrt(r2); bx += (q * p.strength * dx) / (r2 * r); by += (q * p.strength * dy) / (r2 * r); }
    }
    return [bx, by];
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const step = 30;
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
      const [bx, by] = this.field(s, p, x, y, W, H), mag = Math.hypot(bx, by); if (!mag) continue;
      const ux = bx / mag, uy = by / mag, L = 11, a = Math.min(1, Math.log10(1 + mag * 3e5) / 2);
      ctx.globalAlpha = 0.25 + 0.75 * a;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(uy, ux));
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, -3); ctx.lineTo(0, 3); ctx.fill();
      ctx.fillStyle = "#adb5bd"; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -3); ctx.lineTo(0, 3); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;
    const drawMag = (m, dir) => { const x = m.x * W, y = m.y * H; rect(ctx, x - 50, y - 14, 50, 28, dir > 0 ? C.blue : C.red, C.text, 2, 1.5); rect(ctx, x, y - 14, 50, 28, dir > 0 ? C.red : C.blue, C.text, 2, 1.5); text(ctx, dir > 0 ? "S" : "N", x - 25, y + 5, { align: "center", color: "#fff", weight: 700 }); text(ctx, dir > 0 ? "N" : "S", x + 25, y + 5, { align: "center", color: "#fff", weight: 700 }); };
    drawMag(s.m[0], 1); if (p.two !== "none") drawMag(s.m[1], p.two === "attract" ? 1 : -1);
    text(ctx, "Compass needles: red end points north (along the field). Drag the magnets.", 10, H - 10, { size: 12, color: C.muted });
  },
  read(s, p) { if (p.two === "none") return { force: "—" }; const d = Math.hypot(s.m[0].x - s.m[1].x, (s.m[0].y - s.m[1].y) * 0.56); return { force: `${p.two === "attract" ? "attraction" : "repulsion"}, ${(p.strength * p.strength * 0.05 / (d * d)).toFixed(1)} units` }; },
  keyIdea: "<b>Key idea:</b> field lines go from north to south outside a magnet. Where they are closest together, the field is strongest. Like poles repel, unlike poles attract.",
  tryThis: ["Where is the field strongest around a single magnet?", "Place two magnets north to south. What does the field look like in the gap between them?", "Find a 'neutral point' between two repelling magnets where the field is zero."],
});
