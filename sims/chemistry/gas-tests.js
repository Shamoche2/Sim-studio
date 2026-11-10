const { C, text, rect, circle, line } = Sim;
const GASES = {
  h2: ["Hydrogen", "Hold a lit splint at the mouth of the tube", "squeaky pop", "the hydrogen burns with oxygen in the air"],
  o2: ["Oxygen", "Put a glowing splint into the tube", "the splint relights", "oxygen helps things burn"],
  co2: ["Carbon dioxide", "Bubble the gas through limewater", "limewater turns milky (cloudy)", "CO₂ reacts to make insoluble calcium carbonate"],
  cl2: ["Chlorine", "Hold damp blue litmus paper in the gas", "the paper turns red then bleaches white", "chlorine is acidic and a bleach"],
  nh3: ["Ammonia", "Hold damp red litmus paper in the gas", "the paper turns blue", "ammonia is alkaline"],
};
Sim({
  title: "Tests for Gases",
  intro: "Chemists identify common gases with simple tests. Choose a gas and press 'Do the test' to see the result. Turn on 'mystery gas' to practise identifying gases from their test results.",
  controls: [
    { id: "gas", label: "Gas in the test tube", type: "select", options: Object.entries(GASES).map(([k, v]) => [k, v[0]]) },
    { id: "mystery", label: "Mystery gas (hide the name)", type: "checkbox", value: false },
  ],
  buttons: [{ label: "Do the test", primary: true, click(s) { s.t = 0; s.go = true; } }],
  readouts: [["test", "Test"], ["result", "Result"], ["why", "Why"]],
  init(s) { s.t = 0; s.go = false; },
  change(s) { s.go = false; s.t = 0; },
  step(s, p, dt) { if (s.go) s.t = Math.min(1.5, s.t + dt); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const cx = W * 0.4, ty = 70, done = s.go && s.t > 0.6;
    rect(ctx, cx - 22, ty, 44, H - ty - 30, "rgba(233,236,239,.5)", C.text, 18, 2);
    text(ctx, p.mystery ? "?" : GASES[p.gas][0], cx, H - 10, { align: "center", weight: 700 });
    if (p.gas === "h2" || p.gas === "o2") {
      const sx = cx + 10, sy = s.go ? Sim.lerp(ty - 45, ty + (p.gas === "o2" ? 30 : -6), Math.min(1, s.t * 2)) : ty - 45;
      line(ctx, sx + 60, sy - 50, sx, sy, "#d9a066", 5);
      if (p.gas === "h2") { circle(ctx, sx, sy, 7, "#ff922b"); if (done) { text(ctx, "POP!", cx + 40, ty - 10, { size: 26, weight: 800, color: C.orange }); circle(ctx, cx, ty, 26 * Math.min(1, (s.t - 0.6) * 4), "rgba(255,212,59,.5)"); } }
      else circle(ctx, sx, sy, done ? 9 : 4, done ? "#ff922b" : "#e03131");
    }
    if (p.gas === "co2") {
      const lx = W * 0.68; rect(ctx, lx - 26, ty + 60, 52, H - ty - 90, done ? "rgba(248,249,250,.95)" : "rgba(231,245,255,.7)", C.text, 18, 2);
      line(ctx, cx, ty, cx, ty - 30, C.text, 3); line(ctx, cx, ty - 30, lx, ty - 30, C.text, 3); line(ctx, lx, ty - 30, lx, H - 60, C.text, 3);
      if (s.go) for (let i = 0; i < 6; i++) circle(ctx, lx + Math.sin(i) * 6, H - 60 - ((s.t * 120 + i * 20) % (H - ty - 130)), 3, "#fff", C.gray, 1);
      text(ctx, "limewater", lx, H - 10, { align: "center", size: 12 }); if (done) text(ctx, "milky!", lx + 34, ty + 90, { weight: 700, color: C.gray });
    }
    if (p.gas === "cl2" || p.gas === "nh3") {
      const start = p.gas === "cl2" ? "#4dabf7" : "#ff8787", end = p.gas === "cl2" ? (s.t > 1.1 ? "#f8f9fa" : "#ff8787") : "#4dabf7";
      rect(ctx, cx - 8, ty - 50 + (s.go ? 40 : 0), 16, 60, done ? end : start, C.text, 2, 1);
      text(ctx, "damp litmus", cx + 20, ty - 30, { size: 12 });
    }
    if (done) text(ctx, GASES[p.gas][2], W * 0.62, 40, { weight: 700, size: 15, color: C.green });
  },
  read(s, p) { const g = GASES[p.gas]; return { test: g[1], result: s.go && s.t > 0.6 ? g[2] : "press 'Do the test'", why: s.go && s.t > 0.6 ? g[3] + (p.mystery ? `, so it's ${g[0].toLowerCase()}` : "") : "—" }; },
  keyIdea: "<b>Key idea:</b> hydrogen: squeaky pop with a lit splint. Oxygen: relights a glowing splint. Carbon dioxide: turns limewater milky. Chlorine: bleaches damp litmus. Ammonia: turns damp red litmus blue.",
  tryThis: ["Use mystery mode to test yourself on all five gases.", "Why must the litmus paper be damp?", "Why is a lit splint used for hydrogen but a glowing splint for oxygen?"],
});
