const { C, text, rect, circle, plot } = Sim;
// grams per 100 g water at 0, 20, 40, 60, 80, 100 °C (approximate textbook data)
const SALTS = {
  kno3: { name: "Potassium nitrate", d: [13, 32, 64, 110, 169, 246], col: "#e9ecef" },
  nacl: { name: "Sodium chloride", d: [35.7, 36, 36.6, 37.3, 38.4, 39.8], col: "#f8f9fa" },
  kcl: { name: "Potassium chloride", d: [28, 34, 40, 45.5, 51, 56.7], col: "#f1f3f5" },
  nh4cl: { name: "Ammonium chloride", d: [29.4, 37.2, 45.8, 55.3, 65.6, 77.3], col: "#f8f9fa" },
  cuso4: { name: "Copper(II) sulfate", d: [14.3, 20.7, 28.5, 40, 55, 75.4], col: "#4dabf7" },
};
const sol = (k, T) => { const d = SALTS[k].d, i = Math.min(4, Math.floor(T / 20)), t = (T - i * 20) / 20; return d[i] + (d[i + 1] - d[i]) * t; };
Sim({
  title: "Solubility and Saturated Solutions",
  intro: "Only so much solid can dissolve in water. Once the solution is saturated, extra solid stays at the bottom. For most solids, hotter water dissolves more.",
  controls: [
    { id: "salt", label: "Solid", type: "select", options: Object.entries(SALTS).map(([k, v]) => [k, v.name]) },
    { id: "T", label: "Water temperature", min: 0, max: 100, step: 1, value: 20, unit: "°C" },
    { id: "g", label: "Solid added to 100 g water", min: 0, max: 250, step: 1, value: 50, unit: "g" },
  ],
  readouts: [["S", "Solubility at this temperature"], ["dis", "Dissolved"], ["undis", "Undissolved"], ["state", "Solution"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const S = sol(p.salt, p.T), dis = Math.min(p.g, S), undis = p.g - dis, left = W * 0.38;
    const bx = 20, bw = left - 40, by = 30, bh = H - 60;
    const conc = dis / 250;
    rect(ctx, bx, by + bh * 0.25, bw, bh * 0.75, p.salt === "cuso4" ? `rgba(34,139,230,${0.1 + conc * 2})` : "rgba(116,192,252,.25)");
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pile = Math.min(400, Math.round(undis * 2));
    for (let i = 0; i < pile; i++) { const x = bx + 6 + rnd() * (bw - 12), hgt = (pile / 400) * bh * 0.3 * (1 - Math.abs(x - (bx + bw / 2)) / (bw / 2)) ; rect(ctx, x, by + bh - 4 - rnd() * Math.max(4, hgt), 4, 4, SALTS[p.salt].col === "#4dabf7" ? "#1971c2" : "#adb5bd"); }
    const tcol = `hsl(${220 - p.T * 2.2},70%,50%)`;
    text(ctx, `${p.T} °C`, bx + bw / 2, by + 16, { align: "center", weight: 700, color: tcol });
    const series = Object.entries(SALTS).map(([k]) => ({ data: Array.from({ length: 101 }, (_, T) => [T, sol(k, T)]), color: k === p.salt ? C.blue : "#dee2e6", width: k === p.salt ? 3 : 1.5 }));
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Solubility curves", xmin: 0, xmax: 100, ymin: 0, ymax: 250, xlabel: "temperature (°C)", ylabel: "g per 100 g water", series, marks: [{ x: p.T, y: Math.min(p.g, 250), color: p.g > S ? C.red : C.green }] });
  },
  read(s, p) { const S = sol(p.salt, p.T), dis = Math.min(p.g, S); return { S: S.toFixed(1) + " g", dis: dis.toFixed(1) + " g", undis: (p.g - dis).toFixed(1) + " g", state: p.g < S - 0.5 ? "unsaturated" : "saturated" }; },
  keyIdea: "<b>Key idea:</b> a point below the curve is unsaturated; on or above it is saturated, and the extra solid won't dissolve. Cooling a hot saturated solution makes crystals form.",
  tryThis: ["Add 100 g of potassium nitrate at 20 °C. How much stays undissolved? Now heat it to 60 °C.", "Why is sodium chloride's curve almost flat?", "You dissolve 110 g of potassium nitrate at 60 °C and cool it to 20 °C. What mass of crystals forms?"],
  note: "Data are approximate textbook values.",
});
