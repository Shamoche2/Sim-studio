const { C, text, rect, plot } = Sim;
const FUELS = { methanol: ["Methanol", 32.04, 726], ethanol: ["Ethanol", 46.07, 1367], propanol: ["Propan-1-ol", 60.1, 2021], butanol: ["Butan-1-ol", 74.12, 2676] };
Sim({
  title: "Calorimetry: Energy from Fuels",
  intro: "Burn a fuel in a spirit burner to heat 100 g of water in a copper can. From the temperature rise and the mass of fuel burned you can work out the energy released per mole, and compare fuels.",
  controls: [
    { id: "fuel", label: "Fuel", type: "select", options: Object.entries(FUELS).map(([k, v]) => [k, v[0]]), value: "ethanol" },
    { id: "eff", label: "Heat reaching the water", min: 20, max: 100, step: 5, value: 40, unit: "%", help: "Real school experiments lose a lot of heat to the air." },
  ],
  readouts: [["burnt", "Fuel burned"], ["dT", "Temperature rise"], ["q", "Energy into water (q = mcΔT)"], ["dH", "Measured ΔH"], ["book", "Data-book value"]],
  resetOnChange: true,
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(60, s.t + dt * 3); },
  calc(s, p) { const [, M, dHc] = FUELS[p.fuel], g = s.t * 0.012, n = g / M, q = n * dHc * 1000 * (p.eff / 100), dT = q / (100 * 4.18); return { g, n, q, dT: Math.min(dT, 80), dHm: n > 0 ? q / n / 1000 : 0 }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.38, r = this.calc(s, p), cx = left / 2;
    rect(ctx, cx - 40, H * 0.25, 80, 80, "#e8590c", C.text, 4, 1.5); rect(ctx, cx - 36, H * 0.25 + 18, 72, 58, "rgba(116,192,252,.6)");
    rect(ctx, cx + 20, 10, 8, H * 0.38, "#fff", C.text, 4, 1.2); rect(ctx, cx + 22, 10 + H * 0.38 * (1 - (20 + r.dT) / 100), 4, H * 0.38 * ((20 + r.dT) / 100), C.red, null, 2);
    text(ctx, (20 + r.dT).toFixed(1) + " °C", cx + 34, 30, { weight: 700, color: C.red });
    const fy = H * 0.25 + 120; for (let i = 0; i < 3; i++) { ctx.fillStyle = ["#ffd43b", "#ff922b", "#74c0fc"][i]; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.ellipse(cx, fy - 10 - i * 4, 12 - i * 3, 22 - i * 6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1; rect(ctx, cx - 30, fy + 10, 60, 40, "#f1f3f5", C.text, 6, 1.5); text(ctx, FUELS[p.fuel][0], cx, fy + 34, { align: "center", size: 11, weight: 600 });
    const bars = Object.entries(FUELS).map(([k, [n, , dH]]) => ({ label: n.split(" ")[0].replace("Propan-1-ol", "Propanol").replace("Butan-1-ol", "Butanol"), value: dH, color: k === p.fuel ? C.orange : "#ced4da" }));
    Sim.bars(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, bars, { title: "Data-book energy of combustion (kJ/mol)", max: 2800, fmt: (v) => v });
  },
  read(s, p) { const r = this.calc(s, p); return { burnt: r.g.toFixed(2) + " g (" + r.n.toFixed(4) + " mol)", dT: r.dT.toFixed(1) + " °C", q: (r.q / 1000).toFixed(2) + " kJ", dH: r.n ? "−" + r.dHm.toFixed(0) + " kJ/mol" : "—", book: "−" + FUELS[p.fuel][2] + " kJ/mol" }; },
  keyIdea: "<b>Key idea:</b> q = m × c × ΔT (with c for water = 4.18 J/g°C). ΔH = −q ÷ moles of fuel. School results are usually much smaller than data-book values because heat escapes to the surroundings.",
  tryThis: ["Burn ethanol. How does your measured ΔH compare with the data-book value?", "Set the heat reaching the water to 100%. Now what do you get?", "Look at the series methanol → butanol. By how much does ΔH increase for each extra CH₂?"],
});
