const { C, text, rect, circle, line } = Sim;
const PAIR = { A: "T", T: "A", G: "C", C: "G" }, COL = { A: C.red, T: "#f2b705", G: C.green, C: C.blue };
Sim({
  title: "DNA Structure and Base Pairing",
  intro: "DNA is a double helix: two strands twisted together, joined by pairs of bases. A always pairs with T, and G always pairs with C. Type a sequence for one strand and see the matching strand.",
  controls: [
    { id: "seq", label: "First strand", type: "select", options: [["ATGCGTAC", "ATGCGTAC"], ["GGATCCAT", "GGATCCAT"], ["TTAGCAGC", "TTAGCAGC"], ["CGCGATAT", "CGCGATAT"]] },
    { id: "view", label: "View", type: "select", options: [["helix", "Twisted double helix"], ["ladder", "Unwound (ladder)"]] },
  ],
  readouts: [["comp", "Complementary strand"], ["gc", "G + C content"], ["rule", "Base pairs"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const seq = p.seq.split(""), n = seq.length, x0 = 50, step = (W - 100) / (n - 1), cy = H / 2, A = H * 0.28, helix = p.view === "helix";
    const ys = seq.map((_, i) => helix ? Math.sin(i * 0.8 + s.t) : 1), zs = seq.map((_, i) => helix ? Math.cos(i * 0.8 + s.t) : 1);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * step, y1 = cy - A * ys[i], y2 = cy + A * ys[i], b = seq[i], c = PAIR[b];
      line(ctx, x, y1, x, (y1 + y2) / 2, COL[b], 8); line(ctx, x, (y1 + y2) / 2, x, y2, COL[c], 8);
      if (!helix || Math.abs(ys[i]) > 0.4) { text(ctx, b, x, y1 - 12 * Math.sign(ys[i] || 1), { align: "center", weight: 800, color: COL[b] }); text(ctx, c, x, y2 + 18 * Math.sign(ys[i] || 1), { align: "center", weight: 800, color: COL[c] }); }
    }
    ctx.strokeStyle = "#495057"; ctx.lineWidth = 4;
    for (const sgn of [-1, 1]) { ctx.beginPath(); for (let i = 0; i <= (n - 1) * 10; i++) { const u = i / 10, x = x0 + u * step, y = cy + sgn * A * (helix ? Math.sin(u * 0.8 + s.t) : 1); ctx.lineTo(x, y); } ctx.stroke(); }
    void zs;
    text(ctx, "sugar–phosphate backbone", 10, 18, { size: 11, color: C.muted });
  },
  read(s, p) { const seq = p.seq.split(""), comp = seq.map((b) => PAIR[b]).join(""), gc = seq.filter((b) => b === "G" || b === "C").length; return { comp, gc: Math.round((100 * gc) / seq.length) + "%", rule: "A–T and G–C" }; },
  keyIdea: "<b>Key idea:</b> DNA is made of nucleotides (sugar, phosphate and a base). The two strands are complementary: A pairs with T, G pairs with C, held by weak hydrogen bonds. The order of bases is the genetic code.",
  tryThis: ["Write the complementary strand for ATGCGTAC before checking.", "If a DNA molecule is 30% A, what percentage is T? And G?", "Why does complementary base pairing let DNA copy itself accurately?"],
});
