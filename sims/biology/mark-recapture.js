const { C, text, rect, circle } = Sim;
Sim({
  title: "Estimating Population Size: Mark and Recapture",
  intro: "How many woodlice live under the logs? Catch some, mark them, and let them go. Later, catch another sample and count how many are marked. The proportion marked tells you the population size.",
  controls: [
    { id: "N", label: "True population (hidden from scientists)", min: 50, max: 500, step: 10, value: 200 },
    { id: "c1", label: "First catch (marked)", min: 10, max: 100, step: 5, value: 40 },
    { id: "c2", label: "Second catch", min: 10, max: 100, step: 5, value: 40 },
  ],
  buttons: [{ label: "1. Catch and mark", primary: true, click(s, p) { s.an.forEach((a) => (a.marked = false)); [...s.an].sort(() => Math.random() - 0.5).slice(0, p.c1).forEach((a) => (a.marked = true)); s.stage = 1; s.caught = []; } }, { label: "2. Recapture", click(s, p) { if (s.stage < 1) return; s.an.forEach((a) => { a.x = Math.random(); a.y = Math.random(); }); s.caught = [...s.an].sort(() => Math.random() - 0.5).slice(0, p.c2); s.stage = 2; } }],
  readouts: [["m2", "Marked in second catch"], ["est", "Estimated population"], ["true", "True population"], ["err", "Error"]],
  resetOnChange: true,
  init(s, p) { s.an = Array.from({ length: p.N }, () => ({ x: Math.random(), y: Math.random(), marked: false })); s.stage = 0; s.caught = []; },
  step(s, p, dt) { for (const a of s.an) { a.x = Sim.clamp(a.x + Sim.randn() * 0.01 * dt * 10, 0, 1); a.y = Sim.clamp(a.y + Sim.randn() * 0.01 * dt * 10, 0, 1); } },
  draw({ ctx, W, H }, s) {
    rect(ctx, 0, 0, W, H, "#e9dcc9");
    const caught = new Set(s.caught);
    for (const a of s.an) { const x = 10 + a.x * (W - 20), y = 10 + a.y * (H - 20); ctx.fillStyle = "#868e96"; ctx.beginPath(); ctx.ellipse(x, y, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill(); if (a.marked) circle(ctx, x, y - 1, 2, C.red); if (caught.has(a)) circle(ctx, x, y, 9, null, C.blue, 2); }
    text(ctx, s.stage === 0 ? "Press '1. Catch and mark'" : s.stage === 1 ? "Marked animals (red dot) mix back in. Now recapture." : "Blue circles: second catch", 12, 22, { weight: 700 });
  },
  read(s, p) {
    if (s.stage < 2) return { m2: "—", est: "—", true: String(p.N), err: "—" };
    const m2 = s.caught.filter((a) => a.marked).length, est = m2 ? (p.c1 * p.c2) / m2 : Infinity;
    return { m2: String(m2), est: isFinite(est) ? est.toFixed(0) + ` (= ${p.c1} × ${p.c2} ÷ ${m2})` : "no marked animals caught", true: String(p.N), err: isFinite(est) ? (((est - p.N) / p.N) * 100).toFixed(0) + "%" : "—" };
  },
  keyIdea: "<b>Key idea:</b> population ≈ (number marked × number in second catch) ÷ number marked in second catch. This assumes marked animals mix in fully, marks don't come off, and no animals are born, die or move away between catches.",
  tryThis: ["Do a full experiment. How close is your estimate?", "Use bigger catches. Does the estimate become more accurate?", "What would happen to the estimate if the marks made animals easier for birds to see?"],
  note: "Use the same marked group for the recapture; repeat step 1 to start again.",
});
