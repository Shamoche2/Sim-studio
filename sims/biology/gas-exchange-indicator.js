const { C, text, rect, circle } = Sim;
const IND = [[0, "#fcc419", "yellow: lots of CO₂"], [0.35, "#f76707", "orange"], [0.5, "#e03131", "red: normal air"], [0.7, "#d6336c", "magenta"], [1, "#862e9c", "purple: very little CO₂"]];
const colAt = (v) => { for (let i = 1; i < IND.length; i++) if (v <= IND[i][0]) { const [a, ca] = IND[i - 1], [b, cb] = IND[i], t = (v - a) / (b - a), h = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)), A = h(ca), B = h(cb); return `rgb(${A.map((x, j) => Math.round(x + (B[j] - x) * t)).join(",")})`; } return IND.at(-1)[1]; };
const TUBES = [["Pondweed in the light", 1, 1], ["Pondweed in the dark", 0, 1], ["Pondweed, half-shaded", 0.35, 1], ["Snail (animal)", 0, 0], ["No organism (control)", 0, -1]];
Sim({
  title: "Photosynthesis and Respiration: Indicator Experiment",
  intro: "Hydrogencarbonate indicator changes colour with CO₂: yellow means more CO₂, purple means less. Plants respire all the time but only photosynthesise in light. Watch the tubes change over a few hours.",
  controls: [{ id: "light", label: "Light intensity", min: 0, max: 100, step: 5, value: 80, unit: "%" }],
  readouts: [["hours", "Time"], ["plant", "Plant in light"], ["dark", "Plant in dark"]],
  resetOnChange: true,
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(6, s.t + dt * 0.5); },
  val(i, s, p) { const [, lit, kind] = TUBES[i]; if (kind === -1) return 0.5; const photo = kind === 1 ? lit * (p.light / 100) * 1.6 : 0, resp = 0.4; return Sim.clamp(0.5 + (photo - resp) * (s.t / 6) * 0.6, 0, 1); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const n = TUBES.length, tw = W / n, top = 40, bot = H - 60;
    TUBES.forEach(([name, lit, kind], i) => {
      const x = i * tw + tw / 2, w = Math.min(44, tw * 0.5);
      rect(ctx, x - w / 2, top, w, bot - top, colAt(this.val(i, s, p)), C.text, 12, 1.5);
      if (kind === 1) { ctx.strokeStyle = "#2b8a3e"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, bot - 8); ctx.quadraticCurveTo(x - 8, (top + bot) / 2, x, top + 30); ctx.stroke(); }
      if (kind === 0) { circle(ctx, x, bot - 18, 9, "#8d6e63"); }
      if (lit === 0 && kind !== -1) { rect(ctx, x - w / 2 - 4, top - 4, w + 8, bot - top + 8, null, "#212529", 12, 5); text(ctx, "covered", x, top - 10, { align: "center", size: 10, weight: 700 }); }
      if (lit === 0.35) { rect(ctx, x - w / 2 - 4, top - 4, w + 8, (bot - top) / 2, null, "#868e96", 12, 5); text(ctx, "shaded", x, top - 10, { align: "center", size: 10, weight: 700 }); }
      text(ctx, name.split(" ").slice(0, 2).join(" "), x, bot + 18, { align: "center", size: 11, weight: 600 });
      text(ctx, name.split(" ").slice(2).join(" "), x, bot + 32, { align: "center", size: 11, weight: 600 });
    });
    text(ctx, "☀ " + p.light + "% light", 10, 22, { weight: 700, color: C.orange });
    const kx = W - 150; IND.forEach(([v, col], i) => rect(ctx, kx + i * 28, 10, 26, 14, col, null, 3)); text(ctx, "more CO₂  ←  →  less CO₂", kx, 38, { size: 10, color: C.muted });
  },
  read(s, p) { const name = (v) => (v < 0.3 ? "yellow (CO₂ rising)" : v < 0.6 ? "red (no change)" : "purple (CO₂ falling)"); return { hours: s.t.toFixed(1) + " h", plant: name(this.val(0, s, p)), dark: name(this.val(1, s, p)) }; },
  keyIdea: "<b>Key idea:</b> in bright light, photosynthesis uses CO₂ faster than respiration makes it, so CO₂ falls (purple). In the dark only respiration happens, so CO₂ rises (yellow). At the compensation point, the two rates are equal and there's no change.",
  tryThis: ["Why does the tube with the snail turn yellow?", "Find the light level where the plant tube stays red. What is happening there?", "Why is a tube with no organism included?"],
  note: "Simplified model; real experiments take a few hours.",
});
