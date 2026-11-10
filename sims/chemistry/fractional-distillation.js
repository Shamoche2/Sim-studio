const { C, text, rect, circle } = Sim;
const FRACS = [["Refinery gases", "1–4", "< 25 °C", "bottled gas (LPG)", 25, "#e9ecef"], ["Petrol", "5–10", "40–100 °C", "car fuel", 100, "#fff3bf"], ["Naphtha", "8–12", "90–150 °C", "making chemicals and plastics", 150, "#ffe066"], ["Kerosene", "10–16", "150–250 °C", "jet fuel", 250, "#ffd43b"], ["Diesel", "14–20", "250–350 °C", "lorries, trains", 350, "#fab005"], ["Fuel oil", "20–40", "350–400 °C", "ships, power stations", 400, "#e67700"], ["Bitumen", "> 40", "> 400 °C", "roads and roofing", 9999, "#212529"]];
Sim({
  title: "Fractional Distillation of Crude Oil",
  intro: "Crude oil is a mixture of hydrocarbons. It's heated and the vapour rises up a column that is hot at the bottom and cool at the top. Each fraction condenses where the temperature falls below its boiling point.",
  controls: [{ id: "f", label: "Highlight fraction", type: "select", options: FRACS.map((f, i) => [i, f[0]]) }],
  readouts: [["carbons", "Carbon atoms per molecule"], ["bp", "Boiling range"], ["use", "Used for"], ["props", "Compared with fractions above"]],
  init(s) { s.v = Array.from({ length: 60 }, () => ({ y: Math.random(), x: Math.random(), f: Math.floor(Math.random() * 6) })); },
  step(s, p, dt) { for (const q of s.v) { q.y += dt * 0.15; const stop = 1 - (q.f + 0.5) / 7; if (q.y > stop + 0.02) { q.y = 0; q.x = Math.random(); q.f = Math.floor(Math.random() * 6); } } },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const cx = W * 0.35, cw = 110, top = 20, bot = H - 50, n = FRACS.length, rh = (bot - top) / n;
    const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, "#d0ebff"); g.addColorStop(1, "#ffc9c9"); rect(ctx, cx - cw / 2, top, cw, bot - top, g, C.text, 4, 2);
    text(ctx, "25 °C (cool)", cx - cw / 2 - 8, top + 12, { align: "right", size: 11, color: C.blue }); text(ctx, "350 °C (hot)", cx - cw / 2 - 8, bot - 4, { align: "right", size: 11, color: C.red });
    FRACS.forEach(([name, , , , , col], i) => {
      const y = top + i * rh + rh / 2, sel = i === +p.f;
      Sim.line(ctx, cx - cw / 2 + 6, y + rh / 2 - 2, cx + cw / 2 - 6, y + rh / 2 - 2, "#adb5bd", 1.5, [4, 3]);
      Sim.line(ctx, cx + cw / 2, y, cx + cw / 2 + 40, y, C.text, 3);
      rect(ctx, cx + cw / 2 + 44, y - 12, 26, 24, col, C.text, 4, 1.2);
      text(ctx, name, cx + cw / 2 + 78, y + 5, { weight: sel ? 800 : 500, size: sel ? 15 : 13, color: sel ? C.blue : C.text });
    });
    for (const q of s.v) circle(ctx, cx - cw / 2 + 10 + q.x * (cw - 20), bot - q.y * (bot - top), 2.5, "rgba(134,142,150,.7)");
    rect(ctx, cx - 50, bot + 6, 100, 30, "#495057", null, 6); text(ctx, "crude oil heated", cx, bot + 26, { align: "center", color: "#fff", size: 12, weight: 600 });
  },
  read(s, p) { const f = FRACS[+p.f]; return { carbons: f[1], bp: f[2], use: f[3], props: +p.f === 0 ? "smallest molecules: most flammable, runniest" : `bigger molecules: higher boiling point, more viscous (thicker), less flammable` }; },
  keyIdea: "<b>Key idea:</b> fractions with small molecules have low boiling points and condense near the top; large molecules condense near the bottom. Bigger molecules are more viscous and harder to ignite.",
  tryThis: ["Where does petrol condense in the column? Why there?", "Which fraction has the largest molecules? What is it used for?", "Why is the column hottest at the bottom?"],
});
