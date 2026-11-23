const { C, text, rect, line, arrow } = Sim;
const N_GLASS = 1.5;
const DEG = Math.PI / 180;
Lab({
  title: "Virtual Lab: Refraction Through a Glass Block",
  aim: "Measure the angle of refraction for different angles of incidence, and find the refractive index of glass.",
  equipment: ["Rectangular glass block", "Ray box with a single slit", "Protractor", "Ruler, pencil and plain paper"],
  safety: ["The ray box gets hot: don't touch the bulb.", "Work in a dimmed room, carefully."],
  method: [
    "Set the <b>Angle of incidence</b> to 20°. The ray enters the top of the block.",
    "Read the angle of refraction on the protractor (measured from the dashed normal line).",
    "Press <b>Record result</b>.",
    "Repeat for 30°, 40°, 50°, 60° and 70°.",
    "Look at the graph of sin i against sin r. Its gradient is the refractive index n.",
  ],
  controls: [{ id: "i", label: "Angle of incidence", min: 0, max: 80, step: 5, value: 20, unit: "°" }],
  readouts: [["i", "Angle of incidence i"], ["r", "Angle of refraction r (protractor)"]],
  init(s) { s.err = 0; },
  change(s) { s.err = Lab.round(Sim.randn() * 0.7, 0.5); },
  rTrue(p) { return Math.asin(Math.sin(p.i * DEG) / N_GLASS) / DEG; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fffdf5");
    const bx = W * 0.25, bw = W * 0.5, by = H * 0.4, bh = H * 0.4, px = bx + bw * 0.4;
    rect(ctx, bx, by, bw, bh, "rgba(153,233,242,.45)", "#0c8599", 2, 2);
    line(ctx, px, by - H * 0.3, px, by + bh + 20, C.gray, 1.2, [6, 5]);
    const i = p.i * DEG, r = (this.rTrue(p) + 0) * DEG, L = H * 0.32;
    const sx = px - Math.sin(i) * L, sy = by - Math.cos(i) * L;
    rect(ctx, sx - 18 - Math.sin(i) * 20, sy - 10 - Math.cos(i) * 20, 36, 20, "#495057", null, 4);
    line(ctx, sx, sy, px, by, C.red, 3); arrow(ctx, sx, sy, (sx + px) / 2, (sy + by) / 2, C.red, 3);
    const ex = px + Math.tan(r) * bh;
    line(ctx, px, by, ex, by + bh, C.red, 3);
    if (ex < bx + bw) { line(ctx, ex, by + bh, ex + Math.sin(i) * L * 0.6, by + bh + Math.cos(i) * L * 0.6, C.red, 3); }
    // protractor at the entry point
    ctx.save(); ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(px, by, 70, 0, Math.PI); ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 1; ctx.stroke();
    for (let d = 0; d <= 90; d += 5) for (const sgn of [-1, 1]) { const a = Math.PI / 2 - sgn * d * DEG; const r1 = d % 10 === 0 ? 58 : 63; line(ctx, px + Math.cos(a) * r1, by + Math.sin(a) * r1, px + Math.cos(a) * 70, by + Math.sin(a) * 70, C.blue, 1); if (d % 20 === 0 && d) Sim.text(ctx, String(d), px + Math.cos(a) * 48, by + Math.sin(a) * 48 + 4, { align: "center", size: 9, color: C.blue }); }
    ctx.restore();
    text(ctx, "glass block", bx + 8, by + bh - 8, { color: "#0c8599", size: 12 });
    text(ctx, "normal", px + 6, by - H * 0.3 + 12, { color: C.muted, size: 11 });
  },
  read(s, p) { return { i: p.i + "°", r: Math.max(0, this.rTrue(p) + s.err).toFixed(1) + "°" }; },
  record(s, p) { if (p.i === 0) return "Use an angle bigger than 0°: at 0° the ray goes straight through."; const r = Math.max(0.5, this.rTrue(p) + s.err); return { i: p.i, r, si: Math.sin(p.i * DEG), sr: Math.sin(r * DEG) }; },
  table: { cols: [{ key: "i", label: "Angle i", unit: "°", digits: 0 }, { key: "r", label: "Angle r", unit: "°", digits: 1 }, { key: "si", label: "sin i", digits: 3 }, { key: "sr", label: "sin r", digits: 3 }], x: "sr", y: "si", xlabel: "sin r", ylabel: "sin i", fit: "origin", title: "sin i against sin r" },
  derived(rows) { if (rows.length < 3) return { "Refractive index n": "record at least 3 angles" }; const m = rows.reduce((a, r) => a + r.sr * r.si, 0) / rows.reduce((a, r) => a + r.sr * r.sr, 0); return { "Refractive index n = gradient": m.toFixed(2), "Typical glass": "1.5" }; },
  questions: [
    { q: "When light enters glass from air, it bends…", options: ["towards the normal", "away from the normal", "it doesn't bend"], answer: 0, why: "It slows down in glass, so it bends towards the normal." },
    { q: "Angles of incidence and refraction are measured from…", options: ["the surface of the block", "the normal (a line at 90° to the surface)", "the ray box"], answer: 1, why: "Always measure from the normal." },
    { q: "sin i ÷ sin r is constant. What is this constant called?", options: ["The critical angle", "The refractive index", "The focal length"], answer: 1, why: "n = sin i ÷ sin r (Snell's law)." },
  ],
  conclusion: "Light bends towards the normal as it enters glass. sin i ÷ sin r is constant: the refractive index, about 1.5 for glass.",
});
