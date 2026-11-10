const { C, text, rect, circle } = Sim;
const GASES = { H2: ["Hydrogen", 2.02, "#e9ecef"], O2: ["Oxygen", 32.0, C.red], CO2: ["Carbon dioxide", 44.01, "#495057"], N2: ["Nitrogen", 28.02, C.blue], CH4: ["Methane", 16.04, C.green] };
Sim({
  title: "Molar Volume of Gases",
  intro: "Here's a surprise: one mole of any gas takes up the same volume at the same temperature and pressure, about 24 dm³ at room temperature. A balloon of hydrogen and a balloon of carbon dioxide with the same number of molecules are the same size.",
  controls: [
    { id: "gas", label: "Gas", type: "select", options: Object.entries(GASES).map(([k, v]) => [k, `${v[0]} (Mr ${v[1]})`]) },
    { id: "n", label: "Amount of gas", min: 0.1, max: 2, step: 0.1, value: 1, unit: "mol", digits: 1 },
    { id: "T", label: "Temperature", min: 0, max: 100, step: 5, value: 20, unit: "°C" },
  ],
  readouts: [["V", "Volume"], ["m", "Mass of gas"], ["Vm", "Molar volume here"]],
  Vm(p) { return 24.0 * (p.T + 273.15) / 293.15; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const V = p.n * this.Vm(p), [, Mr, col] = GASES[p.gas], cx = W * 0.3, cy = H * 0.45, r = Math.cbrt(V) * 28;
    circle(ctx, cx, cy, r, `${col === "#e9ecef" ? "#f8f9fa" : col}55`, C.text, 2);
    for (let i = 0; i < Math.min(60, p.n * 30); i++) { const a = i * 2.39996, rr = r * 0.85 * Math.sqrt((i + 0.5) / (p.n * 30)); circle(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 3.5, col, C.text, 0.8); }
    Sim.line(ctx, cx, cy + r, cx, H - 20, C.gray, 1.5); text(ctx, `${GASES[p.gas][0]}: ${V.toFixed(1)} dm³`, cx, H - 6, { align: "center", weight: 700 });
    // comparison: same moles of every gas
    const bx = W * 0.58, rowH = (H - 40) / 5;
    text(ctx, `${p.n} mol of each gas at ${p.T} °C`, bx, 22, { weight: 700 });
    Object.entries(GASES).forEach(([k, [name, M, c]], i) => { const y = 34 + i * rowH; rect(ctx, bx, y + 4, (V / 50) * (W - bx - 20), rowH * 0.35, c === "#e9ecef" ? "#ced4da" : c, null, 3); text(ctx, `${name}: ${V.toFixed(1)} dm³, ${(p.n * M).toFixed(1)} g`, bx, y + rowH * 0.35 + 20, { size: 12, weight: k === p.gas ? 700 : 400 }); });
  },
  read(s, p) { return { V: (p.n * this.Vm(p)).toFixed(1) + " dm³", m: (p.n * GASES[p.gas][1]).toFixed(1) + " g", Vm: this.Vm(p).toFixed(1) + " dm³/mol" }; },
  keyIdea: "<b>Key idea:</b> volume of gas = moles × 24 dm³ (at room temperature and pressure). This is Avogadro's law: equal volumes of gases contain equal numbers of molecules. Heavier gases have the same volume but more mass.",
  tryThis: ["What volume does 0.5 mol of oxygen take up at room temperature?", "Switch between gases. Does the volume change? Does the mass?", "Heat the gas to 100 °C. Why does the molar volume increase?"],
  note: "Assumes 1 atmosphere pressure and ideal gas behaviour.",
});
