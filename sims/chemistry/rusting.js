const { C, text, rect, circle } = Sim;
const TUBES = [
  ["Air and water", true, true, false, ""], ["Dry air only", true, false, false, "drying agent"], ["Boiled water, no air", false, true, false, "oil layer"],
  ["Salty water and air", true, true, true, ""], ["Painted nail", true, true, false, "paint"], ["Galvanised (zinc-coated)", true, true, false, "zinc"],
];
Sim({
  title: "Rusting of Iron",
  intro: "Iron rusts when it reacts with both oxygen and water. Watch nails in different test tubes over several days. Salt speeds rusting up; paint and zinc coatings prevent it.",
  controls: [{ id: "speed", label: "Speed", min: 1, max: 5, step: 1, value: 2, unit: "×" }],
  readouts: [["day", "Day"], ["worst", "Most rust"], ["none", "No rust"]],
  init(s) { s.day = 0; },
  step(s, p, dt) { s.day = Math.min(14, s.day + dt * p.speed * 0.5); },
  rust(i, day) { const [, air, water, salt, prot] = TUBES[i]; if (!air || !water || prot === "paint" || prot === "zinc") return 0; return Math.min(1, (day / 14) * (salt ? 1 : 0.55)); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const n = TUBES.length, tw = W / n, top = 40, bot = H - 60;
    TUBES.forEach(([name, air, water, salt, prot], i) => {
      const x = i * tw + tw / 2, w = Math.min(46, tw * 0.5);
      rect(ctx, x - w / 2, top, w, bot - top, "#f8f9fa", C.text, 10, 1.5);
      if (water) rect(ctx, x - w / 2 + 2, bot - (bot - top) * 0.45, w - 4, (bot - top) * 0.45 - 2, salt ? "rgba(116,192,252,.45)" : "rgba(116,192,252,.3)", null, 8);
      if (prot === "oil layer") rect(ctx, x - w / 2 + 2, bot - (bot - top) * 0.45 - 8, w - 4, 8, "#ffe066");
      if (prot === "drying agent") for (let k = 0; k < 8; k++) circle(ctx, x - w / 2 + 8 + (k % 4) * 9, bot - 8 - Math.floor(k / 4) * 8, 4, "#e9ecef", "#adb5bd", 1);
      if (!air) text(ctx, "sealed", x, top - 6, { align: "center", size: 10, color: C.muted }); else text(ctx, "open", x, top - 6, { align: "center", size: 10, color: C.muted });
      const r = this.rust(i, s.day), nailCol = prot === "paint" ? "#4dabf7" : prot === "zinc" ? "#ced4da" : `rgb(${Math.round(134 + r * 50)},${Math.round(142 - r * 70)},${Math.round(150 - r * 120)})`;
      rect(ctx, x - 4, top + 20, 8, bot - top - 40, nailCol, null, 2); rect(ctx, x - 9, top + 16, 18, 6, nailCol, null, 2);
      if (r > 0.1) for (let k = 0; k < r * 14; k++) circle(ctx, x + Math.sin(k * 7) * 6, top + 30 + ((k * 31) % (bot - top - 60)), 2.5 + r * 2, "#a0522d");
      text(ctx, name.split(" ").slice(0, 2).join(" "), x, bot + 18, { align: "center", size: 11, weight: 600 });
      text(ctx, name.split(" ").slice(2).join(" "), x, bot + 32, { align: "center", size: 11, weight: 600 });
    });
  },
  read(s) { return { day: s.day.toFixed(1), worst: "salty water and air", none: "dry air, no air, painted, galvanised" }; },
  keyIdea: "<b>Key idea:</b> iron + oxygen + water → hydrated iron(III) oxide (rust). Both oxygen and water are needed. Barriers (paint, oil, plastic) keep them out; zinc coating (galvanising) also protects by sacrificial protection, since zinc is more reactive and corrodes first.",
  tryThis: ["Which tubes show that both air and water are needed for rusting?", "Why does salty water make rusting faster? (Think of cars in winter or by the sea.)", "Why does galvanised iron stay protected even if the zinc coating is scratched?"],
});
