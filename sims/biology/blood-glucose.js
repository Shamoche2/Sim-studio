const { C, text, rect, plot } = Sim;
Sim({
  title: "Blood Glucose Regulation",
  intro: "Your body keeps blood glucose near 5 mmol/L. After a meal the pancreas releases insulin, which helps cells take in glucose. When glucose falls, it releases glucagon, which tells the liver to release glucose. In type 1 diabetes, no insulin is made.",
  controls: [
    { id: "dia", label: "Person", type: "select", options: [["healthy", "Healthy"], ["t1", "Type 1 diabetes (no insulin)"], ["t2", "Type 2 diabetes (cells respond less)"]] },
  ],
  buttons: [
    { label: "Eat a meal", primary: true, click(s) { s.gut += 60; } },
    { label: "Exercise", click(s) { s.ex = 1.5; } },
    { label: "Inject insulin", click(s) { s.injected += 3; } },
  ],
  readouts: [["g", "Blood glucose"], ["ins", "Insulin"], ["gcg", "Glucagon"], ["zone", "Status"]],
  init(s) { s.t = 0; s.G = 5; s.gut = 0; s.ex = 0; s.injected = 0; s.I = 1; s.Gc = 1; s.hist = { G: [[0, 5]], I: [[0, 1]], Gc: [[0, 1]] }; },
  timeScale: 1,
  step(s, p, dt) {
    const h = dt * 0.6; s.t += h;
    const absorb = s.gut * 0.6 * h; s.gut -= absorb;
    const target = p.dia === "t1" ? 0.05 : Math.max(0, 1 + (s.G - 5) * 0.9);
    s.I += (target - s.I) * h * 2; s.I = Math.max(0, s.I);
    const Itot = s.I + s.injected; s.injected *= Math.exp(-h * 0.5);
    s.Gc += (Math.max(0, 1 + (5 - s.G) * 0.8) - s.Gc) * h * 2;
    const sens = p.dia === "t2" ? 0.35 : 1;
    const uptake = 0.25 * Itot * sens * s.G * 0.2 + 0.15 + s.ex * 0.6 + Math.max(0, s.G - 10) * 0.05; // last term: kidneys excrete excess glucose
    const release = 0.3 * s.Gc + 0.1 + (p.dia === "t1" ? 0.25 : 0); // without insulin the liver keeps releasing glucose
    s.G += (absorb * 0.18 + release - uptake) * h; s.G = Math.max(1.5, s.G); s.ex = Math.max(0, s.ex - h * 0.4);
    if (s.t - s.hist.G.at(-1)[0] > 0.05) { s.hist.G.push([s.t, s.G]); s.hist.I.push([s.t, Itot]); s.hist.Gc.push([s.t, s.Gc]); }
    for (const k in s.hist) if (s.hist[k].length > 800) s.hist[k].shift();
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const t0 = Math.max(0, s.t - 24), top = H * 0.62;
    plot(ctx, { x: 0, y: 0, w: W, h: top }, { title: "Blood glucose", xmin: t0, xmax: t0 + 24, ymin: 0, ymax: 20, xlabel: "hours", ylabel: "mmol/L", series: [{ data: s.hist.G, color: C.red, width: 3 }], hlines: [{ y: 4, color: C.green, label: "normal range 4–7" }, { y: 7, color: C.green }, { y: 11, color: C.orange, label: "high" }] });
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { xmin: t0, xmax: t0 + 24, ymin: 0, ymax: 5, xlabel: "hours", ylabel: "hormone", series: [{ data: s.hist.I, color: C.blue, label: "insulin" }, { data: s.hist.Gc, color: C.purple, label: "glucagon" }] });
  },
  read(s) { return { g: s.G.toFixed(1) + " mmol/L", ins: (s.I + s.injected).toFixed(2), gcg: s.Gc.toFixed(2), zone: s.G < 4 ? "low (hypoglycaemia)" : s.G <= 7.5 ? "normal" : s.G < 11 ? "raised" : "high (hyperglycaemia)" }; },
  keyIdea: "<b>Key idea:</b> this is negative feedback. Glucose high → insulin → cells and liver take up glucose. Glucose low → glucagon → liver releases glucose. People with type 1 diabetes inject insulin.",
  tryThis: ["As a healthy person, eat a meal. How long until glucose returns to normal?", "Switch to type 1 diabetes and eat a meal. What happens? Then inject insulin.", "Exercise without eating. Which hormone rises, and why?"],
  note: "Simplified model for teaching; not medical advice. Time is sped up.",
});
