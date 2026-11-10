const { C, text, rect, circle, arrow, plot } = Sim;
// species: name, x, y, colour, growth/death, eats
const SP = [
  ["Grass", 0.2, 0.85, "#40c057"], ["Algae", 0.75, 0.85, "#20c997"],
  ["Rabbit", 0.12, 0.55, "#d9a066"], ["Grasshopper", 0.38, 0.55, "#94d82d"], ["Small fish", 0.75, 0.55, "#74c0fc"],
  ["Frog", 0.45, 0.3, "#2b8a3e"], ["Fox", 0.15, 0.12, "#e8590c"], ["Heron", 0.72, 0.12, "#868e96"],
];
const EATS = { 2: [0], 3: [0], 4: [1], 5: [3], 6: [2, 5], 7: [4, 5] };
Sim({
  title: "Food Webs",
  intro: "In a food web, many food chains interlink. Arrows show the direction energy flows: from the food to the animal that eats it. Remove a species and watch the effects ripple through the web.",
  controls: SP.map(([n], i) => ({ id: "s" + i, label: `${n} present`, type: "checkbox", value: true })),
  readouts: [["prod", "Producers"], ["top", "Top predators"], ["note", "What happened"]],
  init(s) { s.pop = SP.map((_, i) => (i < 2 ? 1 : i < 5 ? 0.6 : 0.3)); s.t = 0; s.hist = SP.map(() => []); },
  change(s, p, id) { const i = +id.slice(1); if (p[id] && s.pop[i] < 0.05) s.pop[i] = 0.3; },
  step(s, p, dt) {
    s.t += dt; const P = s.pop, d = P.map(() => 0);
    for (let i = 0; i < SP.length; i++) {
      if (!p["s" + i]) { P[i] = 0; continue; }
      if (i < 2) d[i] += 0.5 * P[i] * (1 - P[i]);
      else { const food = (EATS[i] || []).reduce((a, j) => a + P[j], 0); d[i] += P[i] * (0.8 * food - 0.3); }
      for (const [k, list] of Object.entries(EATS)) if (list.includes(i)) d[i] -= 0.6 * P[i] * P[k];
    }
    for (let i = 0; i < SP.length; i++) P[i] = Sim.clamp(P[i] + d[i] * dt, 0, 1.5);
    if (s.t - (s.hist[0].at(-1)?.[0] ?? -1) > 0.2) SP.forEach((_, i) => { s.hist[i].push([s.t, P[i]]); if (s.hist[i].length > 300) s.hist[i].shift(); });
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.55, X = (x) => 20 + x * (left - 40), Y = (y) => 10 + y * (H - 30);
    for (const [k, list] of Object.entries(EATS)) for (const j of list) { const a = SP[j], b = SP[k]; ctx.globalAlpha = p["s" + j] && p["s" + k] ? 0.8 : 0.15; arrow(ctx, X(a[1]), Y(a[2]) - 14, X(b[1]), Y(b[2]) + 16, C.gray, 1.8); }
    ctx.globalAlpha = 1;
    SP.forEach(([n, x, y, col], i) => { const on = p["s" + i], r = 10 + Math.sqrt(s.pop[i]) * 12; circle(ctx, X(x), Y(y), r, on ? col : "#f1f3f5", C.text, 1); text(ctx, n, X(x), Y(y) + r + 12, { align: "center", size: 11, weight: 600, color: on ? C.text : "#adb5bd" }); });
    const t0 = Math.max(0, s.t - 40);
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Population sizes", xmin: t0, xmax: t0 + 40, ymin: 0, ymax: 1.6, ystep: 5, xlabel: "time", ylabel: "relative size", series: SP.map(([, , , col], i) => ({ data: s.hist[i], color: col, width: 2 })) });
  },
  read(s, p) {
    const gone = SP.filter((_, i) => p["s" + i] && s.pop[i] < 0.02).map((x) => x[0]);
    return { prod: "grass, algae", top: "fox, heron", note: gone.length ? `${gone.join(", ")} died out` : SP.some((_, i) => !p["s" + i]) ? "the web is adjusting" : "stable web" };
  },
  keyIdea: "<b>Key idea:</b> arrows point from the organism eaten to the organism that eats it, showing energy flow. Removing one species affects others: its predators lose food, and its prey may increase.",
  tryThis: ["Remove the frogs. What happens to the grasshoppers, foxes and herons?", "Remove the grass. Which animals are affected, and in what order?", "Why are food webs with more links more stable than single food chains?"],
  note: "Simplified population model.",
});
