const { C, text, rect, circle } = Sim;
Sim({
  title: "Electromagnets",
  intro: "A current in a coil of wire makes a magnetic field. Wrap the coil around an iron core and it becomes a strong electromagnet that can be switched on and off. See how many paperclips it can pick up.",
  controls: [
    { id: "I", label: "Current", min: 0, max: 5, step: 0.5, value: 2, unit: "A", digits: 1 },
    { id: "N", label: "Turns of wire", min: 5, max: 50, step: 5, value: 20 },
    { id: "core", label: "Core", type: "select", options: [["iron", "Iron"], ["steel", "Steel"], ["air", "No core (air)"]] },
  ],
  readouts: [["B", "Relative strength"], ["clips", "Paperclips lifted"], ["after", "When switched off"]],
  str(p) { const mu = { iron: 1, steel: 0.7, air: 0.02 }[p.core]; return p.I * p.N * mu; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const B = this.str(p), cx = W * 0.4, top = 40, coreH = H * 0.45, cw = 40;
    rect(ctx, cx - cw / 2, top, cw, coreH, p.core === "air" ? "#f8f9fa" : p.core === "iron" ? "#868e96" : "#495057", C.text, 3, 1.5);
    for (let i = 0; i < p.N; i++) { const y = top + 8 + (i / p.N) * (coreH - 16); ctx.strokeStyle = "#e8590c"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(cx, y, cw / 2 + 6, 4, 0, 0, Math.PI); ctx.stroke(); }
    // battery
    rect(ctx, W * 0.72, top + 20, 70, 34, "#fff", C.text, 4, 1.5); text(ctx, `${p.I} A`, W * 0.72 + 35, top + 42, { align: "center", weight: 700 });
    Sim.line(ctx, cx + cw / 2 + 6, top + 8, W * 0.72, top + 30, "#e8590c", 2); Sim.line(ctx, cx + cw / 2 + 6, top + coreH - 8, W * 0.72, top + 46, "#e8590c", 2);
    // field glow and clips
    if (B > 0) for (let r = 1; r <= 4; r++) { ctx.globalAlpha = Math.min(0.5, B / 250) / r; circle(ctx, cx, top + coreH, 20 * r, null, C.purple, 3); } ctx.globalAlpha = 1;
    const clips = Math.floor(B / 8), base = H - 18;
    rect(ctx, 0, base, W, 18, "#e9ecef");
    for (let i = 0; i < 30; i++) {
      const lifted = i < clips, x = lifted ? cx - 14 + (i % 3) * 14 : W * 0.15 + (i % 10) * 18 + (i > 9 ? 4 : 0), y = lifted ? top + coreH + 10 + Math.floor(i / 3) * 12 : base - 6 - Math.floor((i - (clips > i ? 0 : 0)) / 10) * 8;
      rect(ctx, x - 5, y - 3, 12, 6, null, "#495057", 3, 1.6);
    }
    text(ctx, "paperclips", W * 0.15, base + 14, { size: 11, color: C.muted });
  },
  read(s, p) { const B = this.str(p); return { B: B.toFixed(0), clips: String(Math.min(30, Math.floor(B / 8))), after: p.core === "steel" ? "stays a bit magnetic (steel keeps its magnetism)" : p.core === "iron" ? "loses its magnetism (soft iron)" : "no magnetism" }; },
  keyIdea: "<b>Key idea:</b> an electromagnet is stronger with more current, more turns of wire, and an iron core. Soft iron loses its magnetism when the current stops, which is why it's used for electromagnets that switch on and off.",
  tryThis: ["Double the number of turns. How many more paperclips are lifted?", "Remove the core. What happens to the strength?", "Why is steel a bad choice for a scrapyard crane magnet?"],
  note: "Strength shown in relative units.",
});
