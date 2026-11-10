const { C, text, rect, circle } = Sim;
const METALS = [["Potassium", "K", 10], ["Sodium", "Na", 9], ["Calcium", "Ca", 7.5], ["Magnesium", "Mg", 5.5], ["Zinc", "Zn", 3], ["Iron", "Fe", 1.8], ["Lead", "Pb", 0.4], ["Copper", "Cu", 0], ["Silver", "Ag", 0], ["Gold", "Au", 0]];
Sim({
  title: "The Reactivity Series",
  intro: "Drop small pieces of different metals into dilute hydrochloric acid. More reactive metals fizz faster, releasing hydrogen gas. Metals below hydrogen in the series don't react at all.",
  controls: [{ id: "conc", label: "Acid concentration", min: 0.5, max: 2, step: 0.5, value: 1, unit: "mol/L", digits: 1 }],
  readouts: [["fast", "Fastest reaction"], ["none", "No reaction"]],
  init(s) { s.b = METALS.map(() => []); s.t = 0; },
  step(s, p, dt) {
    s.t += dt;
    METALS.forEach(([, , r], i) => {
      const rate = (i < 2 ? 0 : r) * p.conc; // K and Na are too dangerous to put in acid
      if (Math.random() < rate * dt * 3) s.b[i].push({ x: Sim.rand(-0.3, 0.3), y: 0 });
      for (const b of s.b[i]) b.y += dt * (0.4 + Math.random() * 0.2);
      s.b[i] = s.b[i].filter((b) => b.y < 1);
    });
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const n = METALS.length, tw = W / n, top = 40, bot = H - 60;
    METALS.forEach(([name, sym, r], i) => {
      const x = i * tw + tw / 2, w = tw * 0.6;
      if (i < 2) { rect(ctx, x - w / 2, top + 30, w, bot - top - 30, "#fff5f5", "#ffa8a8", 6, 1.5); text(ctx, "⚠", x, (top + bot) / 2, { align: "center", size: 22 }); text(ctx, "too", x, (top + bot) / 2 + 22, { align: "center", size: 10, color: C.red }); text(ctx, "violent", x, (top + bot) / 2 + 34, { align: "center", size: 10, color: C.red }); }
      else {
        rect(ctx, x - w / 2, top + 30, w, bot - top - 30, "rgba(116,192,252,.25)", C.text, 6, 1.5);
        rect(ctx, x - w * 0.2, bot - 14, w * 0.4, 10, { Ca: "#e9ecef", Mg: "#ced4da", Zn: "#adb5bd", Fe: "#868e96", Pb: "#495057", Cu: "#e8590c", Ag: "#dee2e6", Au: "#fcc419" }[sym], null, 2);
        for (const b of s.b[i]) circle(ctx, x + b.x * w, bot - 18 - b.y * (bot - top - 50), 2.5, "#fff", C.blue, 1);
      }
      text(ctx, sym, x, bot + 20, { align: "center", weight: 700 }); text(ctx, name, x, bot + 36, { align: "center", size: 10, color: C.muted });
    });
    text(ctx, "most reactive", 10, 22, { color: C.red, weight: 700, size: 12 }); text(ctx, "least reactive", W - 10, 22, { color: C.blue, weight: 700, size: 12, align: "right" });
    Sim.arrow(ctx, 110, 18, W - 110, 18, C.gray, 1.5);
  },
  read() { return { fast: "Calcium (of the safe ones)", none: "Copper, silver, gold" }; },
  keyIdea: "<b>Key idea:</b> metal + acid → salt + hydrogen. The reactivity series: K > Na > Ca > Mg > Zn > Fe > Pb > (H) > Cu > Ag > Au. Metals above hydrogen react with acids; those below don't.",
  tryThis: ["Rank the metals by how fast they fizz. Does your order match the series?", "Why aren't potassium and sodium tested in acid in school labs?", "Why is gold found as the pure metal in nature, but iron isn't?"],
});
