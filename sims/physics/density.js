const { C, text, rect } = Sim;
const MATS = { wood: ["Pine wood", 500, "#d9a066"], ice: ["Ice", 920, "#d0ebff"], plastic: ["Plastic (PVC)", 1400, "#e599f7"], glass: ["Glass", 2500, "#c3fae8"], al: ["Aluminium", 2700, "#ced4da"], iron: ["Iron", 7870, "#868e96"], gold: ["Gold", 19300, "#fcc419"] };
Sim({
  title: "Density",
  intro: "Density tells you how much mass is packed into each cubic centimetre. Pick a material and change the size of the block. Its mass changes, but its density stays the same.",
  controls: [
    { id: "mat", label: "Material", type: "select", options: Object.entries(MATS).map(([k, v]) => [k, v[0]]) },
    { id: "side", label: "Block side length", min: 1, max: 10, step: 0.5, value: 4, unit: "cm", digits: 1 },
  ],
  readouts: [["V", "Volume"], ["m", "Mass"], ["d", "Density"], ["water", "In water it would…"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const [name, rho, col] = MATS[p.mat], V = p.side ** 3, m = (rho / 1000) * V;
    const a = p.side * 16, cx = W * 0.3, base = H - 70, d = a * 0.35;
    // scale pan
    rect(ctx, cx - 110, base, 220, 10, C.gray, null, 3); rect(ctx, cx - 70, base + 10, 140, 40, "#495057", null, 6);
    rect(ctx, cx - 50, base + 18, 100, 24, "#a9e34b", null, 3);
    text(ctx, (m >= 1000 ? (m / 1000).toFixed(2) + " kg" : m.toFixed(0) + " g"), cx, base + 35, { align: "center", weight: 700 });
    ctx.fillStyle = col; ctx.strokeStyle = C.text; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.rect(cx - a / 2, base - a, a, a); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - a / 2, base - a); ctx.lineTo(cx - a / 2 + d, base - a - d); ctx.lineTo(cx + a / 2 + d, base - a - d); ctx.lineTo(cx + a / 2, base - a); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + a / 2, base - a); ctx.lineTo(cx + a / 2 + d, base - a - d); ctx.lineTo(cx + a / 2 + d, base - d); ctx.lineTo(cx + a / 2, base); ctx.closePath(); ctx.fill(); ctx.stroke();
    // density comparison bars
    const bx = W * 0.58, bw = W * 0.38, list = Object.values(MATS), rowH = (H - 40) / list.length;
    text(ctx, "Density (g/cm³)", bx, 20, { weight: 700 });
    list.forEach(([n, r, c], i) => { const y = 30 + i * rowH, w = (Math.log10(r / 100) / Math.log10(250)) * bw; rect(ctx, bx, y, w, rowH - 8, c, n === name ? C.text : null, 4, 2); text(ctx, `${n} ${(r / 1000).toFixed(2)}`, bx + 6, y + rowH / 2, { size: 12, weight: n === name ? 700 : 400 }); });
    Sim.line(ctx, bx + (Math.log10(10) / Math.log10(250)) * bw, 26, bx + (Math.log10(10) / Math.log10(250)) * bw, H - 6, C.blue, 1.5, [4, 4]);
    text(ctx, "water 1.00", bx + (Math.log10(10) / Math.log10(250)) * bw + 4, H - 8, { size: 11, color: C.blue });
  },
  read(s, p) { const [, rho] = MATS[p.mat], V = p.side ** 3; return { V: V.toFixed(1) + " cm³", m: ((rho / 1000) * V).toFixed(1) + " g", d: (rho / 1000).toFixed(2) + " g/cm³ (" + rho + " kg/m³)", water: rho < 1000 ? "float" : "sink" }; },
  keyIdea: "<b>Key idea:</b> density = mass ÷ volume (ρ = m / V). Every piece of the same material has the same density, however big it is. Objects less dense than water (1 g/cm³) float.",
  tryThis: ["Double the side of the block. By how much does the mass increase? Why 8 times?", "Which is heavier: 1 cm³ of gold or 1000 cm³ of wood?", "Which materials in the list would float in water?"],
  note: "Bar lengths use a logarithmic scale so all materials fit.",
});
