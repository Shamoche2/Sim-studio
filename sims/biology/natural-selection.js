const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Natural Selection: Peppered Moths",
  intro: "Moths rest on tree bark, and birds eat the ones they can spot. Moths that blend in survive to breed and pass on their colour. When pollution darkens the trees, the population changes over generations.",
  controls: [
    { id: "bark", label: "Tree bark", type: "select", options: [["light", "Light (clean air, lichen)"], ["dark", "Dark (sooty, polluted)"]] },
    { id: "pred", label: "Bird predation", min: 0, max: 80, step: 5, value: 40, unit: "%" },
    { id: "mut", label: "Mutation rate", min: 0, max: 5, step: 0.5, value: 1, unit: "%", digits: 1 },
  ],
  buttons: [{ label: "Next generation", primary: true, click(s, p) { nextGen(s, p); } }],
  readouts: [["gen", "Generation"], ["dark", "Dark moths"], ["light", "Light moths"]],
  init(s) { s.gen = 0; s.moths = Array.from({ length: 120 }, (_, i) => ({ dark: i < 6, x: Math.random(), y: Math.random() })); s.hist = [[0, 5]]; s.timer = 0; },
  step(s, p, dt) { s.timer += dt; if (s.timer > 1.2) { s.timer = 0; nextGen(s, p); } },
  autoplay: false,
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.5, dark = p.bark === "dark";
    rect(ctx, 0, 0, left, H, dark ? "#3b3b3b" : "#d8d2c4");
    let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) circle(ctx, rnd() * left, rnd() * H, 4 + rnd() * 10, dark ? "#2a2a2a" : "#bdb6a3");
    for (const m of s.moths) {
      const x = m.x * (left - 20) + 10, y = m.y * (H - 20) + 10, col = m.dark ? "#262626" : "#ece7da";
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x - 5, y, 6, 4, -0.5, 0, Math.PI * 2); ctx.ellipse(x + 5, y, 6, 4, 0.5, 0, Math.PI * 2); ctx.fill();
    }
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: "Dark moths in the population", xmin: 0, xmax: Math.max(20, s.gen), ymin: 0, ymax: 100, xlabel: "generation", ylabel: "% dark", series: [{ data: s.hist, color: C.text }] });
  },
  read(s) { const d = s.moths.filter((m) => m.dark).length; return { gen: String(s.gen), dark: `${d} (${((100 * d) / s.moths.length).toFixed(0)}%)`, light: String(s.moths.length - d) }; },
  keyIdea: "<b>Key idea:</b> variation + selection pressure + inheritance → evolution. The moths don't change colour on purpose: those that happen to be camouflaged survive and breed more.",
  tryThis: ["Set the bark to dark and press Play. How many generations until most moths are dark?", "Switch back to light bark (clean air). What happens next?", "Set predation to 0. Does the population still change? Why not?"],
  note: "Dark colour is treated as a simple inherited trait. Press Play to run many generations.",
});
function nextGen(s, p) {
  const dark = p.bark === "dark";
  const survivors = s.moths.filter((m) => { const visible = m.dark !== dark; return Math.random() > (visible ? p.pred / 100 : p.pred / 400); });
  const pool = survivors.length ? survivors : s.moths;
  s.moths = Array.from({ length: 120 }, () => { const parent = pool[Math.floor(Math.random() * pool.length)]; let d = parent.dark; if (Math.random() < p.mut / 100) d = !d; return { dark: d, x: Math.random(), y: Math.random() }; });
  s.gen++;
  s.hist.push([s.gen, (100 * s.moths.filter((m) => m.dark).length) / 120]);
}
