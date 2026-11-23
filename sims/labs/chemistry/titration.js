const { C, text, rect, line, circle } = Sim;
const ACID = 0.100; // mol/dm³ HCl in the burette
const IND = { phph: ["Phenolphthalein", "#f783ac", "rgba(255,255,255,.0)"], mo: ["Methyl orange", "#fab005", "#ff6b6b"] };
Lab({
  title: "Virtual Lab: Acid–Alkali Titration",
  aim: "Find the exact volume of 0.100 mol/dm³ hydrochloric acid needed to neutralise 25.0 cm³ of sodium hydroxide, then work out the concentration of the sodium hydroxide.",
  equipment: ["50 cm³ burette, clamp and stand", "25.0 cm³ pipette and pipette filler", "Conical flask on a white tile", "Indicator", "0.100 mol/dm³ hydrochloric acid", "Sodium hydroxide of unknown concentration"],
  safety: ["Wear eye protection: both solutions are irritants.", "Always use a pipette filler, never your mouth.", "Fill the burette below eye level."],
  method: [
    "Choose an <b>Indicator</b>. 25.0 cm³ of sodium hydroxide is already in the flask.",
    "Read the burette at the start (from the bottom of the meniscus).",
    "Press <b>Open tap</b> to run acid in quickly, and <b>Close tap</b> when the colour starts to flash. This first rough titration tells you roughly where the end point is.",
    "Near the end point, press <b>Add 1 drop</b> until the colour just changes permanently, then press <b>Record result</b>.",
    "Press <b>New titration</b> and repeat until you have two titres within 0.10 cm³ of each other (concordant).",
  ],
  controls: [{ id: "ind", label: "Indicator", type: "select", options: Object.entries(IND).map(([k, v]) => [k, v[0]]) }],
  buttons: [
    { label: "Open tap", click(s) { s.open = true; } },
    { label: "Close tap", click(s) { s.open = false; } },
    { label: "Add 1 drop", click(s) { s.open = false; s.vol += 0.05; s.drop = 1; } },
    { label: "New titration", click(s) { s.open = false; s.start = Lab.round(Math.random() * 1.2, 0.05); s.vol = 0; s.run++; } },
  ],
  readouts: [["b", "Burette reading"], ["added", "Acid added"], ["col", "Flask colour"]],
  init(s) { s.end = Lab.round(Sim.rand(21.5, 25.5), 0.05); s.start = Lab.round(Math.random() * 1.2, 0.05); s.vol = 0; s.open = false; s.run = 1; s.drop = 0; },
  change() {},
  step(s, p, dt) { if (s.open) s.vol = Math.min(49 - s.start, s.vol + dt * 1.6); s.drop = Math.max(0, s.drop - dt * 2); },
  colour(s, p) { const past = s.vol >= s.end; return p.ind === "phph" ? (past ? ["colourless", "#f8f9fa"] : ["pink", IND.phph[1]]) : past ? ["red (orange-red)", "#ff6b6b"] : ["yellow", IND.mo[1]]; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const bx = W * 0.4, top = 20, bh = H * 0.55;
    rect(ctx, bx + 30, 10, 10, H - 30, "#868e96");
    rect(ctx, bx - 9, top, 18, bh, "#fff", C.text, 3, 1.5);
    const level = top + ((s.start + s.vol) / 50) * bh; rect(ctx, bx - 7, level, 14, top + bh - level, "rgba(116,192,252,.45)");
    for (let ml = 0; ml <= 50; ml += 5) { const y = top + (ml / 50) * bh; line(ctx, bx - 9, y, bx - 1, y, C.text, 1); text(ctx, String(ml), bx - 14, y + 4, { size: 10, align: "right" }); }
    rect(ctx, bx - 3, top + bh, 6, 24, "#adb5bd"); rect(ctx, bx - 10, top + bh + 6, 20, 6, s.open ? C.green : C.red);
    if (s.open) line(ctx, bx, top + bh + 24, bx, H * 0.78, "rgba(116,192,252,.8)", 3);
    if (s.drop > 0) circle(ctx, bx, top + bh + 26 + (1 - s.drop) * (H * 0.78 - top - bh - 26), 3, "#74c0fc");
    const [, col] = this.colour(s, p), fy = H * 0.86;
    ctx.beginPath(); ctx.moveTo(bx - 14, H * 0.74); ctx.lineTo(bx + 14, H * 0.74); ctx.lineTo(bx + 48, fy); ctx.lineTo(bx - 48, fy); ctx.closePath(); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 34, fy - 18); ctx.lineTo(bx + 34, fy - 18); ctx.lineTo(bx + 46, fy - 2); ctx.lineTo(bx - 46, fy - 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    rect(ctx, bx - 70, fy, 140, 8, "#fff", "#ced4da", 1, 1);
    // meniscus close-up
    const mx = W * 0.78, my = H * 0.35, r = (s.start + s.vol);
    circle(ctx, mx, my, 62, "#fff", C.text, 2); ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 60, 0, 7); ctx.clip();
    rect(ctx, mx - 20, my + 0, 40, 80, "rgba(116,192,252,.45)"); ctx.beginPath(); ctx.moveTo(mx - 20, my - 6); ctx.quadraticCurveTo(mx, my + 8, mx + 20, my - 6); ctx.strokeStyle = "#1c7ed6"; ctx.lineWidth = 2; ctx.stroke();
    for (let k = -12; k <= 12; k++) { const v = Math.round(r * 10) / 10 + k / 10, y = my + 1 + (v - r) * 60; line(ctx, mx - 20, y, mx - (Math.round(v * 10) % 10 === 0 ? 0 : 10), y, C.text, 1); if (Math.round(v * 10) % 10 === 0) text(ctx, v.toFixed(0), mx + 6, y + 4, { size: 11 }); }
    ctx.restore(); text(ctx, "burette close-up: read the bottom of the meniscus", mx, my + 82, { align: "center", size: 11, color: C.muted });
    text(ctx, `Titration ${s.run}`, 14, 22, { weight: 700 });
  },
  read(s, p) { return { b: (s.start + s.vol).toFixed(2) + " cm³", added: s.vol.toFixed(2) + " cm³", col: this.colour(s, p)[0] }; },
  record(s, p) {
    if (s.vol < 0.05) return "Add acid from the burette first.";
    const ini = Lab.round(s.start, 0.05), fin = Lab.round(s.start + s.vol, 0.05), titre = fin - ini, over = s.vol - s.end;
    return { run: s.run, ini, fin, titre, note: s.vol < s.end ? "colour not changed yet" : over > 0.3 ? "overshot (rough)" : "end point" };
  },
  table: { cols: [{ key: "run", label: "Titration", digits: 0 }, { key: "ini", label: "Initial reading", unit: "cm³", digits: 2 }, { key: "fin", label: "Final reading", unit: "cm³", digits: 2 }, { key: "titre", label: "Titre", unit: "cm³", digits: 2 }, { key: "note", label: "Note" }] },
  derived(rows) {
    const good = rows.filter((r) => r.note === "end point");
    let best = null;
    for (let i = 0; i < good.length; i++) for (let j = i + 1; j < good.length; j++) if (Math.abs(good[i].titre - good[j].titre) <= 0.1001) best = [good[i].titre, good[j].titre];
    if (!best) return { "Mean titre": "need two concordant titres (within 0.10 cm³)" };
    const mean = (best[0] + best[1]) / 2, molAcid = (ACID * mean) / 1000, conc = molAcid / 0.025;
    return { "Mean of concordant titres": mean.toFixed(2) + " cm³", "Moles of HCl = 0.100 × titre ÷ 1000": molAcid.toExponential(3) + " mol", "Moles of NaOH (1 : 1)": molAcid.toExponential(3) + " mol", "Concentration of NaOH = moles ÷ 0.0250 dm³": conc.toFixed(3) + " mol/dm³" };
  },
  questions: [
    { q: "Why is the conical flask placed on a white tile?", options: ["To keep it warm", "To see the colour change clearly", "To stop it moving"], answer: 1, why: "The end point is easier to spot against white." },
    { q: "What are concordant results?", options: ["Titres within 0.10 cm³ of each other", "The first and last titres", "Titres that are exactly 25.0 cm³"], answer: 0, why: "Only concordant titres are used to calculate the mean." },
    { q: "HCl + NaOH → NaCl + H₂O. If 0.0024 mol of HCl reacts, how many moles of NaOH reacted?", options: ["0.0012 mol", "0.0024 mol", "0.0048 mol"], answer: 1, why: "The equation is 1 : 1." },
  ],
  conclusion: "The titre is the volume of acid that exactly neutralises the alkali. Moles = concentration × volume (in dm³), and the mole ratio in the equation links the acid to the alkali.",
});
