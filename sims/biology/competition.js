const { C, plot } = Sim;
Sim({
  title: "Competition Between Species",
  intro: "Two species that need the same resources (food, light, space) compete. If one is a better competitor, it can push the other out (competitive exclusion), like grey squirrels replacing red squirrels in Britain. Different needs let them coexist.",
  controls: [
    { id: "r1", label: "Red squirrel growth rate", min: 0.1, max: 1, step: 0.05, value: 0.5, digits: 2 },
    { id: "r2", label: "Grey squirrel growth rate", min: 0.1, max: 1, step: 0.05, value: 0.6, digits: 2 },
    { id: "overlap", label: "How much their diets overlap", min: 0, max: 1.5, step: 0.05, value: 1.1, digits: 2, help: "Above 1 = greys use shared food better" },
    { id: "intro", label: "Grey squirrels introduced", type: "checkbox", value: true },
  ],
  readouts: [["red", "Red squirrels"], ["grey", "Grey squirrels"], ["out", "Outcome"]],
  resetOnChange: true,
  init(s) { s.a = 0.9; s.b = 0.05; s.t = 0; s.ha = []; s.hb = []; },
  step(s, p, dt) {
    const h = dt * 3; s.t += h; const b = p.intro ? s.b : 0;
    const da = p.r1 * s.a * (1 - s.a - p.overlap * b), db = p.r2 * b * (1 - b - (2 - p.overlap) * 0.6 * s.a);
    s.a = Math.max(0, s.a + da * h); s.b = p.intro ? Math.max(0, s.b + db * h) : 0;
    if (!s.ha.length || s.t - s.ha.at(-1)[0] > 0.3) { s.ha.push([s.t, s.a]); s.hb.push([s.t, s.b]); }
  },
  draw({ ctx, W, H }, s) {
    plot(ctx, { x: 0, y: 0, w: W, h: H }, { title: "Population (fraction of carrying capacity)", xmin: 0, xmax: Math.max(80, s.t), ymin: 0, ymax: 1.1, xlabel: "years", ylabel: "population", series: [{ data: s.ha, color: "#e8590c", label: "red squirrels" }, { data: s.hb, color: "#868e96", label: "grey squirrels" }] });
  },
  read(s, p) { return { red: (s.a * 100).toFixed(0) + "%", grey: (s.b * 100).toFixed(0) + "%", out: !p.intro ? "no competition" : s.t < 30 ? "competing…" : s.a < 0.05 ? "reds pushed out (competitive exclusion)" : s.b < 0.05 ? "greys failed to establish" : "both coexist" }; },
  keyIdea: "<b>Key idea:</b> when two species compete for the same limited resources, the better competitor can drive the other to local extinction. Species can coexist if their needs (their niches) are different enough.",
  tryThis: ["With the default settings, what happens to the red squirrels over time?", "Reduce the diet overlap to 0.4. Can both species survive now?", "Untick 'grey squirrels introduced'. What size does the red population reach?"],
  note: "A Lotka–Volterra competition model, simplified.",
});
