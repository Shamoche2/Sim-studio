const { C, text, rect, circle, plot } = Sim;
const V = {
  artery: ["Artery", "carries blood away from the heart at high pressure", "thick muscular, elastic walls; narrow lumen", 34, 10],
  capillary: ["Capillary", "exchanges substances with the tissues", "wall only one cell thick; very narrow", 6, 1],
  vein: ["Vein", "carries blood back to the heart at low pressure", "thin walls, wide lumen, valves stop backflow", 40, 3],
};
Sim({
  title: "Blood Vessels",
  intro: "Blood travels from the heart in arteries, through tiny capillaries in the tissues, and back in veins. Each vessel's structure suits its job. Compare their walls, and see how pressure falls along the way.",
  controls: [{ id: "v", label: "Vessel", type: "select", options: Object.entries(V).map(([k, v]) => [k, v[0]]) }],
  readouts: [["job", "Job"], ["structure", "Structure"], ["pressure", "Blood pressure"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const [name, , , lumen, wall] = V[p.v], cx = W * 0.25, cy = H * 0.28, sc = Math.min(2.6, (H * 0.42) / 60);
    const pulse = p.v === "artery" ? 1 + 0.06 * Math.max(0, Math.sin(s.t * 7)) : 1;
    circle(ctx, cx, cy, (lumen / 2 + wall * 1.6) * sc * pulse, "#ffc9c9", "#c92a2a", 2);
    circle(ctx, cx, cy, (lumen / 2) * sc * pulse, "#e03131");
    text(ctx, `${name} (cross-section)`, cx, cy + (lumen / 2 + wall * 1.6) * sc + 22, { align: "center", weight: 700 });
    if (p.v === "vein") { const vx = W * 0.62, vy = cy; rect(ctx, vx - 80, vy - 30, 160, 60, "#ffe3e3", "#c92a2a", 6, 2); const open = Math.sin(s.t * 2) > 0; ctx.strokeStyle = "#862e9c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(vx, vy - 28); ctx.lineTo(vx + (open ? 20 : 4), vy - 2); ctx.moveTo(vx, vy + 28); ctx.lineTo(vx + (open ? 20 : 4), vy + 2); ctx.stroke(); text(ctx, open ? "valve open: blood flows →" : "valve shut: stops backflow", vx, vy + 48, { align: "center", size: 12, color: C.purple }); }
    if (p.v === "capillary") { const vx = W * 0.62; for (let i = 0; i < 6; i++) { circle(ctx, vx - 60 + i * 24, cy, 8, "#ffc9c9", "#c92a2a", 1.5); } text(ctx, "O₂ and glucose out →, ← CO₂ in", vx, cy + 34, { align: "center", size: 12, color: C.blue }); }
    const path = [[0, 120], [0.15, 100], [0.3, 80], [0.45, 35], [0.55, 15], [0.75, 8], [1, 3]];
    plot(ctx, { x: 0, y: H * 0.62, w: W, h: H * 0.38 }, { xmin: 0, xmax: 1, ymin: 0, ymax: 130, xstep: 2, xlabel: "arteries → arterioles → capillaries → venules → veins", ylabel: "pressure (mmHg)", series: [{ data: path, color: C.red }], vlines: [{ x: { artery: 0.15, capillary: 0.5, vein: 0.85 }[p.v], color: C.blue, label: name }] });
  },
  read(s, p) { return { job: V[p.v][1], structure: V[p.v][2], pressure: { artery: "high, pulsing (~120 mmHg)", capillary: "falling (~35 → 15 mmHg)", vein: "low (~5 mmHg)" }[p.v] }; },
  keyIdea: "<b>Key idea:</b> arteries have thick, elastic walls to withstand high pressure. Capillaries have walls one cell thick for fast diffusion. Veins have wide lumens and valves because blood pressure there is low.",
  tryThis: ["Why do arteries need thick, elastic walls?", "Why are capillary walls only one cell thick?", "Why do veins need valves but arteries don't?"],
});
