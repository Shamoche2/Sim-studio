const { C, text, rect, circle, line } = Sim;
const STAGES = [
  ["Interphase", "The cell grows and copies its DNA. Chromosomes are long and thin, not yet visible."],
  ["Prophase", "Chromosomes condense into X shapes (two identical chromatids). The nuclear membrane breaks down."],
  ["Metaphase", "Chromosomes line up across the middle of the cell. Spindle fibres attach to them."],
  ["Anaphase", "Spindle fibres pull the chromatids apart to opposite ends of the cell."],
  ["Telophase", "New nuclear membranes form around each set of chromosomes."],
  ["Cytokinesis", "The cytoplasm divides, making two genetically identical daughter cells."],
];
const COLS = [C.red, C.blue, C.green, C.orange];
Sim({
  title: "Mitosis: Cell Division",
  intro: "Mitosis makes two identical cells from one, for growth and repair. Step through the stages, or press Play to watch the whole cycle.",
  controls: [{ id: "stage", label: "Stage", min: 0, max: 5, step: 0.02, value: 0, format: (v) => STAGES[Math.min(5, Math.floor(v + 0.01))][0] }],
  readouts: [["name", "Stage"], ["desc", "What's happening"]],
  init(s) { s.t = 0; },
  autoplay: false,
  step(s, p, dt) { const el = document.getElementById("stage"); let v = +el.value + dt * 0.35; if (v > 5.99) v = 0; el.value = v; el.dispatchEvent(new Event("input")); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const v = p.stage, st = Math.min(5, Math.floor(v + 0.01)), f = v - st, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
    // cell membrane (pinches during cytokinesis)
    const pinch = st === 5 ? f : st === 4 ? f * 0.2 : 0, split = st >= 3 ? (st === 3 ? f : 1) : 0;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const a = (i / 120) * Math.PI * 2, x = Math.cos(a), y = Math.sin(a); const sq = 1 - pinch * 0.95 * Math.exp(-(x * x) / 0.08); ctx.lineTo(cx + x * R * (1 + split * 0.25), cy + y * R * 0.75 * sq); }
    ctx.closePath(); ctx.fillStyle = "#fff4e6"; ctx.fill(); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.stroke();
    if (st >= 5 && f > 0.9) line(ctx, cx, cy - R * 0.1, cx, cy + R * 0.1, C.orange, 3);
    // nuclear membrane
    const nucAlpha = st === 0 ? 1 : st === 1 ? 1 - f : st >= 4 ? (st === 4 ? f : 1) : 0;
    if (nucAlpha > 0.02) {
      ctx.globalAlpha = nucAlpha;
      if (st < 4) circle(ctx, cx, cy, R * 0.4, "rgba(208,191,255,.35)", C.purple, 2);
      else for (const sx of [-1, 1]) circle(ctx, cx + sx * R * 0.72, cy, R * 0.3, "rgba(208,191,255,.35)", C.purple, 2);
      ctx.globalAlpha = 1;
    }
    // spindle
    if (st >= 2 && st <= 3) for (const sx of [-1, 1]) for (let k = -2; k <= 2; k++) line(ctx, cx + sx * R * (1 + split * 0.2), cy, cx + sx * (st === 3 ? f * R * 0.75 : 4), cy + k * R * 0.12, "rgba(134,142,150,.6)", 1);
    // chromosomes: 4 (2 pairs)
    for (let c = 0; c < 4; c++) {
      const col = COLS[c], yy = cy + (c - 1.5) * R * 0.15;
      if (st === 0) { // tangled thin threads
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath();
        for (let i = 0; i < 30; i++) { const a = i * 0.7 + c * 2; ctx.lineTo(cx + Math.cos(a) * R * 0.25 * Math.sin(i * 0.3 + c), cy + Math.sin(a * 1.3) * R * 0.25 * Math.cos(i * 0.2)); } ctx.stroke();
        continue;
      }
      let x1, x2, y1;
      if (st === 1) { const ang = c * 1.6; x1 = x2 = cx + Math.cos(ang) * R * 0.2; y1 = cy + Math.sin(ang) * R * 0.2; }
      else if (st === 2) { x1 = x2 = cx; y1 = yy; }
      else if (st === 3) { x1 = cx - f * R * 0.7; x2 = cx + f * R * 0.7; y1 = yy; }
      else { x1 = cx - R * 0.72; x2 = cx + R * 0.72; y1 = cy + (c - 1.5) * R * 0.1; }
      const len = R * 0.11, thick = 5;
      const ch = (x, y, tilt) => { line(ctx, x - tilt, y - len, x + tilt, y + len, col, thick); };
      if (st <= 2) { ch(x1 - 3, y1, 3); ch(x1 + 3, y1, -3); circle(ctx, x1, y1, 3, C.text); }
      else { ch(x1, y1, 0); ch(x2, y1, 0); }
    }
    text(ctx, STAGES[st][0], 14, 26, { weight: 700, size: 18 });
  },
  read(s, p) { const st = Math.min(5, Math.floor(p.stage + 0.01)); return { name: `${st + 1} of 6: ${STAGES[st][0]}`, desc: STAGES[st][1] }; },
  keyIdea: "<b>Key idea:</b> the order is prophase, metaphase, anaphase, telophase (PMAT), then cytokinesis. Each daughter cell gets an identical copy of every chromosome.",
  tryThis: ["At which stage are the chromosomes easiest to count? Why?", "What would happen if the chromatids didn't separate properly in anaphase?", "How many chromosomes does each daughter cell end up with, compared with the parent cell?"],
  note: "Shows a cell with 4 chromosomes. Human cells have 46.",
});
