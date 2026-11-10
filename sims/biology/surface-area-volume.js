const { C, text, rect, plot } = Sim;
Sim({
  title: "Surface Area to Volume Ratio",
  intro: "Cells take in what they need through their surface, but they use it throughout their volume. As a cell gets bigger, its volume grows faster than its surface area, so the ratio falls. That limits how big cells can be.",
  controls: [
    { id: "side", label: "Cube side length", min: 1, max: 10, step: 0.5, value: 2, unit: "cm", digits: 1 },
    { id: "split", label: "Split into smaller cubes", min: 1, max: 4, step: 1, value: 1, format: (v) => `${v ** 3} cube${v > 1 ? "s" : ""}` },
  ],
  readouts: [["sa", "Total surface area"], ["vol", "Total volume"], ["ratio", "SA : V ratio"], ["diff", "Time for dye to reach the centre"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.5, n = p.split, sub = p.side / n, unit = Math.min(left, H) * 0.7 / 10, size = sub * unit, gap = 6;
    const cube = (x, y, a) => {
      const d = a * 0.4;
      ctx.fillStyle = "#ffc9c9"; ctx.strokeStyle = "#c92a2a"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.rect(x, y, a, a); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffa8a8"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d); ctx.lineTo(x + a + d, y - d); ctx.lineTo(x + a, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ff8787"; ctx.beginPath(); ctx.moveTo(x + a, y); ctx.lineTo(x + a + d, y - d); ctx.lineTo(x + a + d, y + a - d); ctx.lineTo(x + a, y + a); ctx.closePath(); ctx.fill(); ctx.stroke();
    };
    const total = n * size + (n - 1) * gap, ox = (left - total) / 2, oy = (H - total) / 2 + 20;
    for (let k = n - 1; k >= 0; k--) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) cube(ox + i * (size + gap) + k * size * 0.25, oy + j * (size + gap) - k * size * 0.25, size);
    const curve = Array.from({ length: 91 }, (_, i) => { const a = 1 + i * 0.1; return [a, 6 / a]; });
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: "SA : V ratio vs size", xmin: 0, xmax: 10, ymin: 0, ymax: 6.5, xlabel: "side length (cm)", ylabel: "ratio", series: [{ data: curve, color: C.red }], marks: [{ x: sub, y: 6 / sub, color: C.text }] });
  },
  read(s, p) {
    const n = p.split ** 3, a = p.side / p.split, sa = n * 6 * a * a, v = n * a ** 3;
    return { sa: sa.toFixed(1) + " cm²", vol: v.toFixed(1) + " cm³", ratio: (sa / v).toFixed(2) + " : 1", diff: ((a / 2) ** 2 / 0.05 / 60).toFixed(1) + " min" };
  },
  keyIdea: "<b>Key idea:</b> for a cube, SA:V = 6 ÷ side. Doubling the size halves the ratio. Large organisms solve this with specialised exchange surfaces (lungs, gills, villi, root hairs) and transport systems.",
  tryThis: ["Compare a 1 cm cube and a 4 cm cube. How do their SA:V ratios compare?", "Keep the side at 4 cm and split it into 64 cubes. What happens to the total volume? The surface area?", "Why do elephants have big flat ears, and why are cells so small?"],
  note: "Dye time assumes diffusion of about 0.05 cm² per second.",
});
