const { C, text, rect } = Sim;
const LEVELS = [["Producers (grass, algae)", "#2b8a3e"], ["Primary consumers (rabbits, insects)", "#94d82d"], ["Secondary consumers (frogs, small birds)", "#f59f00"], ["Tertiary consumers (hawks, snakes)", "#e8590c"], ["Apex predators (eagles)", "#c92a2a"]];
Sim({
  title: "Food Chains and Energy Pyramids",
  intro: "Energy enters a food chain when plants capture sunlight. At each step up, most energy is lost as heat from respiration, movement and waste. Only a small fraction passes to the next level.",
  controls: [
    { id: "sun", label: "Energy captured by producers", min: 1000, max: 50000, step: 1000, value: 10000, unit: "kJ/m²/yr" },
    { id: "eff", label: "Transfer efficiency", min: 1, max: 30, step: 1, value: 10, unit: "%" },
    { id: "n", label: "Number of levels", min: 2, max: 5, step: 1, value: 4 },
  ],
  readouts: [["top", "Energy reaching the top"], ["lost", "Lost as heat at each step"], ["min", "Can the top level survive?"]],
  levels(p) { const out = []; let e = p.sun; for (let i = 0; i < p.n; i++) { out.push(e); e *= p.eff / 100; } return out; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const L = this.levels(p), maxW = W * 0.62, rowH = (H - 40) / 5, base = H - 20;
    L.forEach((e, i) => {
      const w = Math.max(6, maxW * Math.sqrt(e / p.sun)), y = base - (i + 1) * rowH, x = W * 0.36 - w / 2;
      rect(ctx, x, y + 3, w, rowH - 6, LEVELS[i][1], null, 4);
      text(ctx, LEVELS[i][0], W * 0.64, y + rowH / 2 - 2, { weight: 600, size: 13 });
      text(ctx, `${e < 10 ? e.toFixed(2) : e.toFixed(0)} kJ`, W * 0.64, y + rowH / 2 + 15, { color: C.muted, size: 12 });
      if (i > 0) text(ctx, `−${(100 - p.eff)}% lost as heat`, W * 0.36 + maxW / 2 + 4 - maxW / 2 + w / 2 + 6, y + rowH + 2, { size: 11, color: C.red });
    });
    text(ctx, "☀ Sunlight", 12, 22, { weight: 700, color: C.orange });
  },
  read(s, p) { const L = this.levels(p), top = L.at(-1); return { top: `${top < 10 ? top.toFixed(2) : top.toFixed(0)} kJ/m²/yr (${((100 * top) / p.sun).toPrecision(2)}%)`, lost: `${100 - p.eff}%`, min: top > 10 ? "yes" : "unlikely: too little energy" }; },
  keyIdea: "<b>Key idea:</b> only about 10% of energy passes from one level to the next. That's why food chains rarely have more than 4–5 levels, and why there are far fewer predators than plants.",
  tryThis: ["With 10% efficiency, what percentage of the producers' energy reaches the 4th level?", "Why is it more energy-efficient for humans to eat plants than meat?", "Change the efficiency to 20%. Could a 5th level now survive?"],
  note: "Pyramid widths are scaled so even small levels stay visible.",
});
