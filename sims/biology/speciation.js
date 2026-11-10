const { C, text, rect, circle, line, plot } = Sim;
Sim({
  title: "Speciation by Isolation",
  intro: "A population of beetles is split in two by a new river. Each side has a different environment, so natural selection favours different traits. Over many generations they change so much they can no longer interbreed: they've become separate species.",
  controls: [
    { id: "barrier", label: "River separating the populations", type: "checkbox", value: true },
    { id: "diff", label: "How different the two habitats are", min: 0, max: 1, step: 0.1, value: 0.7, digits: 1 },
  ],
  readouts: [["gen", "Generation"], ["gap", "Difference between groups"], ["status", "Status"]],
  resetOnChange: true,
  init(s) { s.gen = 0; s.L = 0.5; s.R = 0.5; s.hist = { L: [[0, 0.5]], R: [[0, 0.5]] }; s.acc = 0; },
  step(s, p, dt) {
    s.acc += dt; if (s.acc < 0.05) return; s.acc = 0; s.gen += 10;
    const tL = 0.5 - p.diff * 0.4, tR = 0.5 + p.diff * 0.4;
    s.L += (tL - s.L) * 0.02 + Sim.randn() * 0.008; s.R += (tR - s.R) * 0.02 + Sim.randn() * 0.008;
    if (!p.barrier) { const m = (s.L + s.R) / 2; s.L += (m - s.L) * 0.3; s.R += (m - s.R) * 0.3; }
    s.hist.L.push([s.gen, s.L]); s.hist.R.push([s.gen, s.R]);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const top = H * 0.45;
    rect(ctx, 0, 0, W / 2, top, `hsl(100,${40 + p.diff * 20}%,${70 - p.diff * 25}%)`); rect(ctx, W / 2, 0, W / 2, top, `hsl(45,${40 + p.diff * 30}%,${75 + p.diff * 5}%)`);
    if (p.barrier) { ctx.fillStyle = "#74c0fc"; ctx.beginPath(); ctx.moveTo(W / 2 - 10, 0); for (let y = 0; y <= top; y += 10) ctx.lineTo(W / 2 - 10 + Math.sin(y / 15) * 6, y); for (let y = top; y >= 0; y -= 10) ctx.lineTo(W / 2 + 10 + Math.sin(y / 15) * 6, y); ctx.fill(); }
    const beetle = (x, y, v) => { ctx.fillStyle = `hsl(${30 + v * 60},60%,${20 + v * 45}%)`; ctx.beginPath(); ctx.ellipse(x, y, 8, 11, 0, 0, Math.PI * 2); ctx.fill(); circle(ctx, x, y - 12, 4, "#212529"); };
    for (let i = 0; i < 10; i++) { beetle(30 + (i % 5) * (W / 2 - 60) / 4, 30 + Math.floor(i / 5) * 60, Sim.clamp(s.L + (((i * 0.37) % 1) - 0.5) * 0.12, 0, 1)); beetle(W / 2 + 30 + (i % 5) * (W / 2 - 60) / 4, 30 + Math.floor(i / 5) * 60, Sim.clamp(s.R + (((i * 0.61) % 1) - 0.5) * 0.12, 0, 1)); }
    text(ctx, "forest side", 8, top - 8, { size: 11, weight: 600 }); text(ctx, "desert side", W - 8, top - 8, { size: 11, weight: 600, align: "right" });
    plot(ctx, { x: 0, y: top + 4, w: W, h: H - top - 4 }, { xmin: 0, xmax: Math.max(2000, s.gen), ymin: 0, ymax: 1, xlabel: "generations", ylabel: "colour (dark → light)", series: [{ data: s.hist.L, color: "#2b8a3e", label: "forest beetles" }, { data: s.hist.R, color: "#e67700", label: "desert beetles" }] });
  },
  read(s, p) { const gap = Math.abs(s.R - s.L); return { gen: String(s.gen), gap: gap.toFixed(2), status: gap > 0.45 ? "new species: can no longer interbreed" : gap > 0.2 ? "becoming different (subspecies)" : !p.barrier ? "one population: genes mix" : "still one species" }; },
  keyIdea: "<b>Key idea:</b> speciation needs isolation (so genes can't mix), different selection pressures on each side, and lots of time. Eventually the populations can't interbreed to produce fertile offspring: they're new species.",
  tryThis: ["With the river in place, how many generations until a new species forms?", "Remove the river. Why do the populations stay the same?", "Make the habitats almost identical. Does speciation still happen? Why is it slower?"],
  note: "Simplified model of one trait.",
});
