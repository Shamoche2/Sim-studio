const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Antibiotic Resistance",
  intro: "A few bacteria in an infection may carry a mutation that lets them survive an antibiotic. The antibiotic kills the others, and the resistant ones multiply. Finishing the full course matters!",
  controls: [
    { id: "dose", label: "Antibiotic strength", min: 0, max: 100, step: 5, value: 70, unit: "%" },
    { id: "days", label: "Course length", min: 1, max: 10, step: 1, value: 3, unit: "days" },
    { id: "res", label: "Resistance from mutation", min: 50, max: 100, step: 5, value: 80, unit: "%" },
  ],
  buttons: [{ label: "Start antibiotic course", primary: true, click(s) { s.courseStart = s.day; } }],
  readouts: [["day", "Day"], ["total", "Bacteria"], ["resist", "Resistant"], ["status", "Infection"]],
  init(s) { s.day = 0; s.courseStart = null; s.bac = Array.from({ length: 150 }, (_, i) => ({ r: i < 2, x: Math.random(), y: Math.random() })); s.hist = { n: [[0, 150]], r: [[0, 2]] }; s.acc = 0; },
  onAb(s, p) { return s.courseStart != null && s.day - s.courseStart < p.days; },
  step(s, p, dt) {
    s.day += dt * 0.8; s.acc += dt * 0.8;
    if (s.acc < 0.25) return;
    s.acc = 0;
    const ab = this.onAb(s, p), kill = (p.dose / 100) * 0.35;
    s.bac = s.bac.filter((b) => !(ab && Math.random() < kill * (b.r ? 1 - p.res / 100 : 1)));
    const room = 400 - s.bac.length, born = [];
    for (const b of s.bac) if (Math.random() < 0.12 * Math.max(0, room / 400)) born.push({ r: b.r || Math.random() < 0.002, x: Sim.clamp(b.x + Sim.rand(-0.05, 0.05), 0, 1), y: Sim.clamp(b.y + Sim.rand(-0.05, 0.05), 0, 1) });
    s.bac.push(...born);
    s.hist.n.push([s.day, s.bac.length]); s.hist.r.push([s.day, s.bac.filter((b) => b.r).length]);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.45;
    rect(ctx, 0, 0, left, H, this.onAb(s, p) ? "#fff9db" : "#fff");
    circle(ctx, left / 2, H / 2, Math.min(left, H) * 0.46, "#fff4e6", C.gray, 2);
    const R = Math.min(left, H) * 0.42;
    for (const b of s.bac) { const a = b.x * Math.PI * 2, rr = Math.sqrt(b.y) * R; ctx.fillStyle = b.r ? C.red : C.green; ctx.beginPath(); ctx.ellipse(left / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr, 5, 2.6, a, 0, Math.PI * 2); ctx.fill(); }
    if (this.onAb(s, p)) text(ctx, "antibiotic present", 10, 22, { color: C.orange, weight: 700 });
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: "Bacteria over time", xmin: 0, xmax: Math.max(20, s.day), ymin: 0, ymax: 420, xlabel: "days", ylabel: "bacteria", series: [{ data: s.hist.n, color: C.green, label: "all" }, { data: s.hist.r, color: C.red, label: "resistant" }], vlines: s.courseStart != null ? [{ x: s.courseStart, color: C.orange, label: "start" }, { x: s.courseStart + p.days, color: C.orange, label: "end" }] : [] });
  },
  read(s, p) { const n = s.bac.length, r = s.bac.filter((b) => b.r).length; return { day: s.day.toFixed(1), total: String(n), resist: `${r} (${n ? ((100 * r) / n).toFixed(0) : 0}%)`, status: n === 0 ? "cleared!" : this.onAb(s, p) ? "being treated" : "active" }; },
  keyIdea: "<b>Key idea:</b> antibiotics select for resistant bacteria. Stopping a course early, or using antibiotics when they aren't needed, leaves resistant bacteria to multiply and spread.",
  tryThis: ["Run a 3-day course. Is the infection cleared? What kind of bacteria are left?", "Try a 10-day course at full strength. What changes?", "Why don't antibiotics work against viruses like the common cold? (Think about what they target.)"],
  note: "Red = resistant, green = not resistant. Random model: results vary each run.",
});
