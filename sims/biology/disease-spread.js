const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Spread of Infectious Disease",
  intro: "Each dot is a person. Infected people can pass the disease to people they bump into, then recover with immunity. See how infection rate, recovery time and vaccination change an outbreak.",
  controls: [
    { id: "pInf", label: "Chance of infection per contact", min: 5, max: 100, step: 5, value: 50, unit: "%" },
    { id: "rec", label: "Days to recover", min: 3, max: 20, step: 1, value: 10, unit: "days" },
    { id: "vac", label: "Vaccinated at start", min: 0, max: 90, step: 5, value: 0, unit: "%" },
    { id: "move", label: "Movement (social contact)", min: 10, max: 100, step: 10, value: 60, unit: "%" },
  ],
  readouts: [["S", "Susceptible"], ["I", "Infected"], ["R", "Recovered / immune"], ["peak", "Peak infected"], ["day", "Day"]],
  resetOnChange: true,
  init(s, p) {
    s.box = { x0: 0, y0: 0, x1: 100, y1: 60 }; s.day = 0; s.peak = 0; s.hist = { S: [], I: [], R: [] };
    s.ppl = Sim.particles.make(200, s.box, 10 * (p.move / 100) + 1, { st: "S", r: 0.9 });
    s.ppl.forEach((q, i) => { if (i < 3) { q.st = "I"; q.t = 0; } else if (Math.random() < p.vac / 100) q.st = "R"; });
  },
  substeps: 2,
  step(s, p, dt) {
    s.day += dt * 2;
    Sim.particles.move(s.ppl, dt, s.box);
    Sim.particles.collide(s.ppl, (a, b) => {
      if (a.st === "I" && b.st === "S" && Math.random() < p.pInf / 100) { b.st = "I"; b.t = s.day; }
      else if (b.st === "I" && a.st === "S" && Math.random() < p.pInf / 100) { a.st = "I"; a.t = s.day; }
      return false;
    });
    for (const q of s.ppl) if (q.st === "I" && s.day - (q.t || 0) > p.rec) q.st = "R";
    const c = { S: 0, I: 0, R: 0 }; s.ppl.forEach((q) => c[q.st]++);
    s.peak = Math.max(s.peak, c.I); s.c = c;
    if (!s.hist.S.length || s.day - s.hist.S.at(-1)[0] > 0.5) for (const k of "SIR") s.hist[k].push([s.day, c[k]]);
  },
  draw({ ctx, W, H }, s, p) {
    const top = H * 0.55, sc = Math.min(W / 100, top / 60), ox = (W - 100 * sc) / 2;
    rect(ctx, 0, 0, W, H, "#fff");
    rect(ctx, ox, 0, 100 * sc, 60 * sc, "#f8f9fa", C.grid, 0, 1);
    const col = { S: C.blue, I: C.red, R: "#adb5bd" };
    for (const q of s.ppl) circle(ctx, ox + q.x * sc, q.y * sc, sc * 0.9, col[q.st]);
    plot(ctx, { x: 0, y: top + 4, w: W, h: H - top - 4 }, { xmin: 0, xmax: Math.max(60, s.day), ymin: 0, ymax: 200, xlabel: "days", ylabel: "people", series: [{ data: s.hist.S, color: C.blue, label: "susceptible" }, { data: s.hist.I, color: C.red, label: "infected" }, { data: s.hist.R, color: "#868e96", label: "recovered" }] });
  },
  read(s) { const c = s.c || { S: 0, I: 0, R: 0 }; return { S: String(c.S), I: String(c.I), R: String(c.R), peak: String(s.peak), day: s.day.toFixed(0) }; },
  keyIdea: "<b>Key idea:</b> an outbreak grows while each infected person infects more than one other (R > 1). Vaccination and reduced contact lower R. Once enough people are immune, the disease can't spread: herd immunity.",
  tryThis: ["Run with no vaccination. When does the number of infected people peak?", "Vaccinate 70% of people. Does the outbreak still take off?", "Reduce movement to 20% (social distancing). How does the peak change? Why does a lower peak help hospitals?"],
  note: "Random, simplified model (SIR). Each run is a little different.",
});
