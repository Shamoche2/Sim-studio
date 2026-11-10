const { C, text, rect, circle } = Sim;
Sim({
  title: "Osmosis in Cells",
  intro: "Water moves across a partially permeable membrane from a dilute solution (lots of water) to a concentrated one (less water). Put a cell in different solutions and watch it swell or shrink.",
  controls: [
    { id: "out", label: "Salt concentration outside", min: 0, max: 3, step: 0.1, value: 0.9, unit: "%", digits: 1, help: "Cell contents are about 0.9% salt." },
    { id: "type", label: "Cell type", type: "select", options: [["animal", "Animal cell (red blood cell)"], ["plant", "Plant cell (with cell wall)"]] },
  ],
  readouts: [["dir", "Net water movement"], ["vol", "Cell volume"], ["state", "Cell state"]],
  init(s) { s.v = 1; s.t = 0; s.parts = []; },
  target(p) { const ratio = 0.9 / Math.max(0.05, p.out); return p.type === "plant" ? Sim.clamp(ratio, 0.55, 1.08) : Sim.clamp(ratio, 0.55, 1.7); },
  step(s, p, dt) { s.t += dt; s.v += (this.target(p) - s.v) * dt * 0.8; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, `rgba(116,192,252,${0.12 + p.out * 0.08})`);
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.24 * Math.sqrt(s.v);
    // salt particles outside
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < p.out * 60; i++) { const x = rnd() * W, y = rnd() * H; if (Math.hypot(x - cx, y - cy) > R + 30) circle(ctx, x, y, 3, C.orange); }
    if (p.type === "plant") {
      const wall = Math.min(W, H) * 0.25;
      rect(ctx, cx - wall * 1.3, cy - wall, wall * 2.6, wall * 2, null, C.green, 10, 6);
      const k = Math.sqrt(s.v);
      rect(ctx, cx - wall * 1.3 * k + 6, cy - wall * k + 6, (wall * 2.6 * k) - 12, (wall * 2 * k) - 12, "rgba(140,233,154,.6)", C.green, 16, 2);
      rect(ctx, cx - wall * 0.5 * k, cy - wall * 0.5 * k, wall * k, wall * k, "rgba(116,192,252,.5)", C.blue, 20, 1.5);
      text(ctx, "vacuole", cx, cy + 4, { align: "center", size: 12, color: C.blue });
    } else {
      const burst = s.v > 1.6;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const a = (i / 80) * Math.PI * 2, crenate = s.v < 0.8 ? 1 + 0.08 * Math.sin(a * 14) * (0.8 - s.v) * 5 : 1; ctx.lineTo(cx + Math.cos(a) * R * 1.2 * crenate, cy + Math.sin(a) * R * crenate); }
      ctx.closePath(); ctx.fillStyle = burst ? "rgba(224,49,49,.25)" : "rgba(224,49,49,.75)"; ctx.fill(); ctx.strokeStyle = "#a61e4d"; ctx.lineWidth = 2; ctx.setLineDash(burst ? [6, 6] : []); ctx.stroke(); ctx.setLineDash([]);
    }
    // water arrows
    const t = this.target(p), dir = Math.sign(t - s.v) || (t > 1.01 ? 1 : t < 0.99 ? -1 : 0);
    if (Math.abs(t - s.v) > 0.01) for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r1 = R + 50, r2 = R + 15, ph = (s.t * 0.8) % 1;
      const ra = dir > 0 ? r1 - (r1 - r2) * ph : r2 + (r1 - r2) * ph;
      circle(ctx, cx + Math.cos(a) * ra * 1.15, cy + Math.sin(a) * ra, 4, C.blue);
    }
    text(ctx, "● water moving   ● salt", 10, H - 10, { size: 12, color: C.muted });
  },
  read(s, p) {
    const t = this.target(p);
    const state = p.type === "plant" ? (s.v > 1.02 ? "turgid (firm)" : s.v < 0.8 ? "plasmolysed (membrane pulls from wall)" : s.v < 0.97 ? "flaccid (soft)" : "normal") : (s.v > 1.6 ? "burst (lysed)" : s.v > 1.05 ? "swelling" : s.v < 0.8 ? "shrivelled (crenated)" : "normal");
    return { dir: Math.abs(t - s.v) < 0.01 ? "none (balanced)" : t > s.v ? "into the cell" : "out of the cell", vol: (s.v * 100).toFixed(0) + "% of normal", state };
  },
  keyIdea: "<b>Key idea:</b> hypotonic (more dilute outside): water moves in. Hypertonic (more concentrated outside): water moves out. Isotonic: no net movement. Plant cell walls stop them bursting.",
  tryThis: ["Put a red blood cell in pure water (0%). What happens?", "Put it in 3% salt. Why does it shrivel?", "Repeat with a plant cell. Why doesn't it burst?"],
});
