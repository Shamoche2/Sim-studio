const { C, text, rect, plot } = Sim;
Sim({
  title: "Hooke's Law and Elastic Limit",
  intro: "Hang masses on a spring and measure how far it stretches. Up to a point, the extension is proportional to the force. Go past the elastic limit and the spring is permanently stretched.",
  controls: [
    { id: "m", label: "Mass hung on spring", min: 0, max: 1000, step: 50, value: 200, unit: "g" },
    { id: "k", label: "Spring constant", min: 10, max: 60, step: 5, value: 25, unit: "N/m" },
  ],
  buttons: [{ label: "Record point", primary: true, click(s, p) { s.pts.push({ x: (p.m / 1000) * 9.81, y: ext(s, p) * 100 }); } }, { label: "New spring", click(s) { s.perm = 0; s.pts = []; } }],
  readouts: [["F", "Force (weight)"], ["e", "Extension"], ["lim", "Elastic limit"], ["state", "Spring"]],
  init(s) { s.perm = 0; s.pts = []; },
  change(s, p) { const F = (p.m / 1000) * 9.81, lim = p.k * 0.25; if (F > lim) s.perm = Math.max(s.perm, (F - lim) / p.k * 0.8); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.3, e = ext(s, p), top = 20, L0 = 80, scale = 260;
    rect(ctx, 10, 6, left - 20, 12, C.brown);
    const bottom = top + L0 + e * scale, cx = left / 2;
    ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, top);
    for (let i = 1; i < 20; i++) ctx.lineTo(cx + (i % 2 ? -12 : 12), top + ((bottom - top) * i) / 20); ctx.lineTo(cx, bottom); ctx.stroke();
    if (p.m) { const h = 14 + p.m / 40; rect(ctx, cx - 22, bottom, 44, h, C.gray, C.text, 3); text(ctx, p.m + " g", cx, bottom + h / 2 + 4, { align: "center", color: "#fff", size: 11, weight: 700 }); }
    for (let cm = 0; cm <= 50; cm += 5) { const y = top + L0 + (cm / 100) * scale; Sim.line(ctx, left - 26, y, left - 16, y, C.text, 1); if (cm % 10 === 0) text(ctx, cm + "", left - 30, y + 4, { align: "right", size: 10 }); }
    const lim = p.k * 0.25, theory = [[0, 0], [lim, (lim / p.k) * 100], [10, (lim / p.k + (10 - lim) / p.k * 1.8) * 100]];
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Extension vs force", xmin: 0, xmax: 10, ymin: 0, ymax: 80, xlabel: "force (N)", ylabel: "extension (cm)", series: [{ data: theory, color: "#ced4da", dash: [5, 4] }], vlines: [{ x: lim, color: C.red, label: "elastic limit" }], marks: [...s.pts.map((q) => ({ ...q, color: C.blue })), { x: (p.m / 1000) * 9.81, y: e * 100, color: C.red, r: 4 }] });
  },
  read(s, p) { const F = (p.m / 1000) * 9.81, lim = p.k * 0.25; return { F: F.toFixed(2) + " N", e: (ext(s, p) * 100).toFixed(1) + " cm", lim: lim.toFixed(1) + " N", state: s.perm > 0.001 ? "permanently stretched" : F > lim ? "past elastic limit" : "elastic" }; },
  keyIdea: "<b>Key idea:</b> Hooke's law: F = k × e, so the graph is a straight line through the origin, up to the elastic limit. Beyond it, the spring won't return to its original length.",
  tryThis: ["Record points from 0 to 500 g. Is the graph a straight line through the origin?", "Use the gradient to work out the spring constant. Does it match the slider?", "Go past the elastic limit, then remove the mass (set it to 0). Does the spring return to its original length?"],
});
function ext(s, p) { const F = (p.m / 1000) * 9.81, lim = p.k * 0.25; return (F <= lim ? F / p.k : lim / p.k + ((F - lim) / p.k) * 1.8) + s.perm; }
