const { C, text, rect, circle } = Sim;
Sim({
  title: "Sampling with Quadrats",
  intro: "You can't count every daisy in a field, so you count them in a few random squares (quadrats) and scale up. More quadrats give a more reliable estimate. Press 'Place quadrat' to sample.",
  controls: [{ id: "size", label: "Quadrat size", type: "select", options: [[1, "1 m × 1 m"], [0.5, "0.5 m × 0.5 m"]] }],
  buttons: [{ label: "Place quadrat", primary: true, click(s, p) { const q = Number(p.size); const x = Math.random() * (20 - q), y = Math.random() * (12 - q); const n = s.plants.filter((pl) => pl.x >= x && pl.x < x + q && pl.y >= y && pl.y < y + q).length; s.quads.push({ x, y, q, n }); } }, { label: "Place 10", click(s, p) { for (let i = 0; i < 10; i++) { const q = Number(p.size); const x = Math.random() * (20 - q), y = Math.random() * (12 - q); s.quads.push({ x, y, q, n: s.plants.filter((pl) => pl.x >= x && pl.x < x + q && pl.y >= y && pl.y < y + q).length }); } } }],
  readouts: [["nq", "Quadrats placed"], ["mean", "Mean per m²"], ["est", "Estimated total (240 m² field)"], ["true", "Actual total"]],
  resetOnChange: true,
  init(s) {
    s.quads = []; s.plants = [];
    const clumps = Array.from({ length: 7 }, () => [Math.random() * 20, Math.random() * 12]);
    for (let i = 0; i < 480; i++) { const [cx, cy] = clumps[i % 7], r = Math.random() < 0.6 ? Sim.randn() * 1.6 : 0; const x = r ? cx + r : Math.random() * 20, y = r ? cy + Sim.randn() * 1.6 : Math.random() * 12; if (x > 0 && x < 20 && y > 0 && y < 12) s.plants.push({ x, y }); }
  },
  draw({ ctx, W, H }, s) {
    const sc = Math.min(W / 20, H / 12), ox = (W - 20 * sc) / 2, oy = (H - 12 * sc) / 2;
    rect(ctx, 0, 0, W, H, "#fff"); rect(ctx, ox, oy, 20 * sc, 12 * sc, "#b2f2bb");
    for (const pl of s.plants) { circle(ctx, ox + pl.x * sc, oy + pl.y * sc, 3, "#fff", null); circle(ctx, ox + pl.x * sc, oy + pl.y * sc, 1.3, "#fab005"); }
    for (const q of s.quads) { rect(ctx, ox + q.x * sc, oy + q.y * sc, q.q * sc, q.q * sc, "rgba(255,255,255,.25)", C.red, 0, 2); text(ctx, String(q.n), ox + (q.x + q.q / 2) * sc, oy + (q.y + q.q / 2) * sc + 5, { align: "center", weight: 800, color: C.red }); }
    text(ctx, "Field: 20 m × 12 m", ox + 6, oy + 16, { size: 12, weight: 600 });
  },
  read(s) {
    if (!s.quads.length) return { nq: "0", mean: "—", est: "—", true: String(s.plants.length) };
    const dens = s.quads.reduce((a, q) => a + q.n / (q.q * q.q), 0) / s.quads.length;
    return { nq: String(s.quads.length), mean: dens.toFixed(2), est: (dens * 240).toFixed(0), true: String(s.plants.length) };
  },
  keyIdea: "<b>Key idea:</b> estimated population = mean number per m² × total area. Quadrats must be placed randomly to avoid bias, and using many quadrats makes the estimate more reliable, especially when plants grow in clumps.",
  tryThis: ["Place 3 quadrats. How close is your estimate to the real total?", "Now place 30. Does the estimate get closer?", "Why must quadrats be placed randomly rather than where there are most daisies?"],
});
