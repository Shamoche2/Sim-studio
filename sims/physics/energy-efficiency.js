const { C, text, rect } = Sim;
const DEV = {
  bulb: { name: "Filament light bulb", in: "electrical", outs: [["light (useful)", 5, "#fcc419", true], ["heat (wasted)", 95, C.red, false]] },
  led: { name: "LED bulb", in: "electrical", outs: [["light (useful)", 40, "#fcc419", true], ["heat (wasted)", 60, C.red, false]] },
  motor: { name: "Electric motor", in: "electrical", outs: [["kinetic (useful)", 80, C.blue, true], ["heat (wasted)", 15, C.red, false], ["sound (wasted)", 5, C.purple, false]] },
  car: { name: "Petrol car engine", in: "chemical", outs: [["kinetic (useful)", 25, C.blue, true], ["heat (wasted)", 70, C.red, false], ["sound (wasted)", 5, C.purple, false]] },
  kettle: { name: "Electric kettle", in: "electrical", outs: [["heat in water (useful)", 90, C.orange, true], ["heat to surroundings (wasted)", 10, C.red, false]] },
  solar: { name: "Solar panel", in: "light", outs: [["electrical (useful)", 20, C.teal, true], ["heat (wasted)", 80, C.red, false]] },
};
Sim({
  title: "Energy Transfers and Efficiency",
  intro: "No device turns all its input energy into useful output. A Sankey diagram shows where the energy goes: arrow widths are proportional to the amount of energy. Efficiency is the useful fraction.",
  controls: [
    { id: "dev", label: "Device", type: "select", options: Object.entries(DEV).map(([k, v]) => [k, v.name]) },
    { id: "E", label: "Energy input", min: 100, max: 2000, step: 100, value: 1000, unit: "J" },
  ],
  readouts: [["useful", "Useful output"], ["wasted", "Wasted"], ["eff", "Efficiency"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const d = DEV[p.dev], maxW = H * 0.5, x0 = 30, xs = W * 0.35, cy = H / 2;
    rect(ctx, x0, cy - maxW / 2, xs - x0, maxW, "#adb5bd");
    text(ctx, `${d.in} energy in: ${p.E} J`, x0 + 6, cy - maxW / 2 - 8, { weight: 700 });
    let off = cy - maxW / 2;
    d.outs.forEach(([label, pct, col, useful], i) => {
      const w = (pct / 100) * maxW, y0 = off, ex = W * 0.8;
      ctx.fillStyle = col; ctx.beginPath();
      if (useful || i === 0) { ctx.moveTo(xs, y0); ctx.lineTo(ex, y0); ctx.lineTo(ex + 20, y0 + w / 2); ctx.lineTo(ex, y0 + w); ctx.lineTo(xs, y0 + w); }
      else { const bend = 40 + i * 30, by = H - 20 - (d.outs.length - i - 1) * 40; ctx.moveTo(xs, y0); ctx.quadraticCurveTo(xs + bend + w, y0, xs + bend + w, by - 20); ctx.lineTo(xs + bend + w + 10, by - 20); ctx.lineTo(xs + bend + w / 2, by); ctx.lineTo(xs + bend - 10, by - 20); ctx.lineTo(xs + bend, by - 20); ctx.quadraticCurveTo(xs + bend, y0 + w, xs, y0 + w); }
      ctx.closePath(); ctx.fill();
      const lx = useful || i === 0 ? W * 0.8 + 26 : xs + 40 + i * 30 + w + 16, ly = useful || i === 0 ? y0 + w / 2 + 4 : H - 30 - (d.outs.length - i - 1) * 40;
      text(ctx, `${label}: ${((pct / 100) * p.E).toFixed(0)} J`, Math.min(lx, W - 4), ly, { weight: 600, size: 12, align: lx > W - 150 ? "right" : "left", color: C.text });
      off += w;
    });
  },
  read(s, p) { const d = DEV[p.dev], u = d.outs.filter((o) => o[3]).reduce((a, o) => a + o[1], 0); return { useful: ((u / 100) * p.E).toFixed(0) + " J", wasted: (((100 - u) / 100) * p.E).toFixed(0) + " J", eff: u + "%" }; },
  keyIdea: "<b>Key idea:</b> efficiency = useful energy output ÷ total energy input (× 100%). Energy is never destroyed: the wasted energy usually spreads out as heat in the surroundings.",
  tryThis: ["Compare the filament bulb and the LED. How much less energy does an LED need for the same light?", "Where does most of a car engine's energy go?", "Why can no device be 100% efficient?"],
  note: "Typical approximate efficiencies.",
});
