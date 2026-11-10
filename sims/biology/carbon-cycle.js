const { C, text, rect, arrow, plot } = Sim;
Sim({
  title: "The Carbon Cycle",
  intro: "Carbon moves between the air, living things, the oceans and fossil fuels. Photosynthesis removes CO₂ from the air; respiration, decay and burning put it back. Change human activities and watch the CO₂ level.",
  controls: [
    { id: "fossil", label: "Burning fossil fuels", min: 0, max: 20, step: 1, value: 10, unit: "Gt C/yr" },
    { id: "forest", label: "Forest cover", min: 20, max: 120, step: 5, value: 100, unit: "%" },
  ],
  readouts: [["co2", "Atmospheric CO₂"], ["year", "Year"], ["net", "Net change per year"]],
  resetOnChange: false,
  init(s) { s.year = 2025; s.atm = 875; s.hist = [[2025, 420]]; },
  flows(s, p) {
    const photo = 120 * (p.forest / 100) * (1 + 0.0005 * (s.atm - 875)), resp = 60 * (p.forest / 100), decay = 60 * (p.forest / 100);
    const ocean = 5 + 0.02 * (s.atm - 875);
    return { photo, resp, decay, ocean, fossil: p.fossil, net: p.fossil + resp + decay - photo - ocean };
  },
  step(s, p, dt) {
    const f = this.flows(s, p), yrs = dt * 4;
    s.atm += f.net * yrs; s.year += yrs;
    if (s.year - s.hist.at(-1)[0] > 0.5) s.hist.push([s.year, (s.atm / 875) * 420]);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.6, f = this.flows(s, p);
    rect(ctx, 0, 0, left, H * 0.62, "#e7f5ff"); rect(ctx, 0, H * 0.62, left, H * 0.38, "#d3c4a5");
    const box = (x, y, label, val, col) => { rect(ctx, x - 62, y - 22, 124, 44, col, C.text, 8, 1.5); text(ctx, label, x, y - 3, { align: "center", weight: 700, size: 12 }); text(ctx, val, x, y + 13, { align: "center", size: 11 }); };
    const A = [left * 0.5, H * 0.13], P = [left * 0.18, H * 0.48], An = [left * 0.5, H * 0.52], Oc = [left * 0.85, H * 0.48], Fo = [left * 0.3, H * 0.85], De = [left * 0.72, H * 0.85];
    const fl = (a, b, label, amt, col) => { arrow(ctx, a[0], a[1], b[0], b[1], col, 1.5 + Math.min(8, amt / 15)); text(ctx, label, (a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2, { size: 11, color: col, weight: 600 }); };
    fl([A[0] - 70, A[1] + 10], [P[0] + 10, P[1] - 24], "photosynthesis", f.photo, C.green);
    fl([P[0] + 50, P[1] - 24], [A[0] - 40, A[1] + 24], "respiration", f.resp, C.orange);
    fl([An[0], An[1] - 24], [A[0], A[1] + 24], "", f.resp * 0.3, C.orange);
    fl([P[0] + 30, P[1] + 24], [De[0] - 60, De[1] - 10], "death & decay", f.decay, C.brown);
    fl([De[0], De[1] - 22], [A[0] + 30, A[1] + 24], "decomposers", f.decay, C.brown);
    fl([Fo[0] + 20, Fo[1] - 22], [A[0] - 10, A[1] + 24], "combustion", f.fossil * 6, C.red);
    fl([A[0] + 62, A[1] + 10], [Oc[0], Oc[1] - 24], "dissolves", Math.max(0, f.ocean) * 6, C.blue);
    box(...A, "Atmosphere", `${((s.atm / 875) * 420).toFixed(0)} ppm CO₂`, "#fff");
    box(...P, "Plants", `forest ${p.forest}%`, "#d3f9d8"); box(...An, "Animals", "eat plants", "#fff4e6");
    box(...Oc, "Oceans", "absorb CO₂", "#d0ebff"); box(...Fo, "Fossil fuels", "coal, oil, gas", "#495057"); box(...De, "Dead matter", "soil", "#e9dcc9");
    ctx.save(); ctx.fillStyle = "#fff"; ctx.font = "700 12px system-ui"; ctx.textAlign = "center"; ctx.fillText("Fossil fuels", Fo[0], Fo[1] - 3); ctx.font = "11px system-ui"; ctx.fillText("coal, oil, gas", Fo[0], Fo[1] + 13); ctx.restore();
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: "CO₂ in the atmosphere", xmin: 2025, xmax: Math.max(2125, s.year), ymin: 250, ymax: 900, xstep: 25, xlabel: "year", ylabel: "ppm", series: [{ data: s.hist, color: C.red }], hlines: [{ y: 280, color: C.green, label: "pre-industrial 280" }] });
  },
  read(s, p) { const f = this.flows(s, p); return { co2: ((s.atm / 875) * 420).toFixed(0) + " ppm", year: s.year.toFixed(0), net: (f.net > 0 ? "+" : "") + ((f.net / 875) * 420).toFixed(2) + " ppm/yr" }; },
  keyIdea: "<b>Key idea:</b> CO₂ rises when carbon is released faster than photosynthesis and the oceans can remove it. Burning fossil fuels releases carbon that was locked away for millions of years; deforestation reduces photosynthesis.",
  tryThis: ["With today's settings, what's the CO₂ level in 2100?", "Set fossil fuel burning to 0. Does the CO₂ level fall?", "Plant more forests (120%). Can trees alone balance the fossil fuel emissions?"],
  note: "A simplified model for teaching. Numbers are approximate (1 ppm ≈ 2.1 Gt of carbon).",
});
