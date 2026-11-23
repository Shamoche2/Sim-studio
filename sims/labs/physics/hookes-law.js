const { C, text, rect, line } = Sim;
const K = 24.5; // N/m (this spring)
const lengthFor = (F) => { const lim = 6, e = F <= lim ? F / K : lim / K + ((F - lim) / K) * 1.9; return 0.15 + e; }; // natural length 15 cm
Lab({
  title: "Virtual Lab: Hooke's Law",
  aim: "Investigate how the extension of a spring depends on the force (load) stretching it, and find the spring constant.",
  equipment: ["Clamp stand, boss and clamp", "Spring with a pointer", "Metre rule (clamped vertically)", "100 g slotted masses and hanger"],
  safety: ["Wear eye protection: a spring can snap back.", "Don't stand with your feet under the masses."],
  method: [
    "With no masses on, read the length of the spring on the ruler and press <b>Record result</b>.",
    "Add one 100 g mass with <b>Masses on the hanger</b> (each 100 g gives a force of 0.98 N).",
    "Read the new length and press <b>Record result</b>.",
    "Repeat, adding one mass at a time, up to 800 g.",
    "Look at the graph of extension against force. Use the straight part to find the spring constant k.",
  ],
  controls: [{ id: "n", label: "Masses on the hanger", min: 0, max: 8, step: 1, value: 0, format: (v) => `${v * 100} g` }],
  readouts: [["F", "Force (weight of masses)"], ["len", "Pointer reading"]],
  init(s) { s.noise = 0; },
  change(s) { s.noise = Sim.randn() * 0.0008; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const F = p.n * 0.98, L = lengthFor(F), top = 40, sc = (H - 120) / 0.55, cx = W * 0.4;
    rect(ctx, cx - 140, 16, 14, H - 30, "#868e96"); rect(ctx, cx - 140, top - 10, 160, 10, "#495057");
    const end = top + L * sc;
    ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, top);
    for (let i = 1; i < 24; i++) ctx.lineTo(cx + (i % 2 ? -10 : 10), top + ((end - top) * i) / 24); ctx.lineTo(cx, end); ctx.stroke();
    line(ctx, cx, end, cx - 52, end, C.red, 2);
    rect(ctx, cx - 8, end, 16, 6, C.gray);
    for (let i = 0; i < p.n; i++) rect(ctx, cx - 20, end + 8 + i * 8, 40, 7, "#adb5bd", "#495057", 2, 1);
    // ruler
    const rx = cx - 80; rect(ctx, rx - 16, top, 22, 0.6 * sc, "#ffe066", "#e67700", 1, 1);
    for (let mm = 0; mm <= 600; mm += 10) { const y = top + (mm / 1000) * sc, big = mm % 50 === 0; line(ctx, rx + 6 - (big ? 14 : 7), y, rx + 6, y, "#e67700", 1); if (mm % 100 === 0) text(ctx, String(mm / 10), rx - 20, y + 4, { size: 10, align: "right" }); }
    text(ctx, "cm", rx - 18, top - 4, { size: 10, align: "right" });
    // magnifier on the pointer
    const mx = W * 0.75, my = H * 0.4; Sim.circle(ctx, mx, my, 60, "#fff", C.text, 2);
    const read = (L + s.noise) * 100;
    for (let k = -6; k <= 6; k++) { const v = Math.round(read) + k, y = my + (v - read) * 9; if (Math.abs(y - my) < 55) { line(ctx, mx - 30, y, mx - (v % 5 === 0 ? 5 : 15), y, "#e67700", 1.5); if (v % 5 === 0) text(ctx, String(v), mx - 34, y + 4, { size: 11, align: "right" }); } }
    line(ctx, mx - 40, my, mx + 40, my, C.red, 2.5); text(ctx, "pointer (close-up)", mx, my + 78, { align: "center", size: 11, color: C.muted });
  },
  read(s, p) { return { F: (p.n * 0.98).toFixed(2) + " N", len: ((lengthFor(p.n * 0.98) + s.noise) * 100).toFixed(1) + " cm" }; },
  record(s, p, rows) {
    const len = Lab.round((lengthFor(p.n * 0.98) + s.noise) * 100, 0.1);
    const first = this._L0 ?? (this._L0 = p.n === 0 ? len : 15.0);
    return { F: p.n * 0.98, len, ext: len - first };
  },
  table: { cols: [{ key: "F", label: "Force", unit: "N", digits: 2 }, { key: "len", label: "Spring length", unit: "cm", digits: 1 }, { key: "ext", label: "Extension", unit: "cm", digits: 1 }], x: "F", y: "ext", xlabel: "force (N)", ylabel: "extension (cm)", fit: "none", title: "Extension against force" },
  derived(rows) {
    const lin = rows.filter((r) => r.F > 0 && r.F <= 5.9);
    if (lin.length < 3) return { "Spring constant k": "record at least 3 loads up to 600 g" };
    const m = lin.reduce((a, r) => a + r.F * r.ext, 0) / lin.reduce((a, r) => a + r.F * r.F, 0);
    return { "Gradient (straight part)": m.toFixed(2) + " cm/N", "Spring constant k = 1 ÷ gradient": (100 / m).toFixed(1) + " N/m" };
  },
  questions: [
    { q: "What is the extension of a spring?", options: ["Its total length", "How much longer it is than its unloaded length", "The force on it"], answer: 1, why: "Extension = stretched length − original length." },
    { q: "Up to the limit of proportionality, extension is…", options: ["directly proportional to force", "inversely proportional to force", "not related to force"], answer: 0, why: "Hooke's law: F = k × e, a straight line through the origin." },
    { q: "Why should your eye be level with the pointer when you read the ruler?", options: ["To avoid parallax error", "To make the spring stretch more", "It doesn't matter"], answer: 0, why: "Looking from above or below makes the reading appear higher or lower than it really is." },
  ],
  conclusion: "Up to the limit of proportionality, the extension is directly proportional to the force (F = ke). Beyond it, the graph curves and the spring may be permanently stretched.",
});
