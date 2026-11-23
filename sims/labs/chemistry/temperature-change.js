const { C, text, rect, line } = Sim;
// name, ΔT (°C, for 50 cm³), type
const RX = {
  neut: ["HCl + NaOH (neutralisation)", 6.6, "exothermic"],
  mg: ["Magnesium ribbon + HCl", 17.5, "exothermic"],
  zn: ["Zinc powder + copper sulfate solution", 9.0, "exothermic"],
  nh4: ["Ammonium nitrate dissolving in water", -6.2, "endothermic"],
  citric: ["Citric acid + sodium hydrogencarbonate", -4.5, "endothermic"],
};
Lab({
  title: "Virtual Lab: Exothermic and Endothermic Reactions",
  aim: "Measure the temperature change of different reactions, decide whether each is exothermic or endothermic, and work out the energy change.",
  equipment: ["Polystyrene cup in a beaker (insulation)", "Lid", "Thermometer (to 0.1 °C)", "Measuring cylinder", "Reactants"],
  safety: ["Wear eye protection.", "Magnesium + acid makes flammable hydrogen: no flames nearby."],
  method: [
    "Choose a <b>Reaction</b>. 50 cm³ of solution is in the polystyrene cup.",
    "Read the starting temperature.",
    "Press <b>Mix and stir</b>. Watch the thermometer.",
    "When the temperature stops changing (highest or lowest value), press <b>Record result</b>.",
    "Repeat for each reaction. Energy change = 50 g × 4.18 J/g°C × temperature change.",
  ],
  controls: [{ id: "r", label: "Reaction", type: "select", options: Object.entries(RX).map(([k, v]) => [k, v[0]]) }],
  buttons: [{ label: "Mix and stir", click(s) { if (!s.mixed) { s.mixed = true; s.t = 0; } } }],
  readouts: [["T", "Thermometer"], ["dT", "Change so far"]],
  resetOnChange: true,
  init(s) { s.T0 = Lab.round(Sim.rand(19, 22), 0.1); s.T = s.T0; s.mixed = false; s.t = 0; s.ext = s.T0; s.hist = [[0, s.T0]]; },
  step(s, p, dt) {
    dt *= 6; s.t += dt;
    if (s.mixed) { const target = s.T0 + RX[p.r][1] * (1 - Math.exp(-s.t / 12)) - 0.012 * Math.max(0, s.t - 20) * Math.sign(RX[p.r][1]); s.T = target; if (RX[p.r][1] > 0 ? s.T > s.ext : s.T < s.ext) s.ext = s.T; }
    if (s.hist.length < 400 && s.t - s.hist[s.hist.length - 1][0] > 1) s.hist.push([s.t, s.T]);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const cx = W * 0.2, top = H * 0.25;
    rect(ctx, cx - 60, top + 40, 120, H * 0.55, "#e9ecef", C.text, 6, 2); rect(ctx, cx - 45, top + 50, 90, H * 0.5, "#fff", "#ced4da", 4, 1.5);
    const col = s.mixed ? (RX[p.r][1] > 0 ? "rgba(255,168,168,.55)" : "rgba(165,216,255,.6)") : "rgba(165,216,255,.35)";
    rect(ctx, cx - 43, top + 50 + H * 0.2, 86, H * 0.3, col);
    rect(ctx, cx - 62, top + 34, 124, 10, "#adb5bd", null, 3);
    rect(ctx, cx + 10, top - 30, 8, H * 0.6, "#fff", C.text, 4, 1.5); rect(ctx, cx + 12, top - 28 + H * 0.58 * (1 - s.T / 45), 4, H * 0.58 * (s.T / 45), C.red, null, 2);
    text(ctx, `${s.T.toFixed(1)} °C`, cx, H - 16, { align: "center", weight: 800, size: 18 });
    Sim.plot(ctx, { x: W * 0.4, y: 14, w: W * 0.58, h: H - 28 }, { title: "Temperature during the reaction", xmin: 0, xmax: Math.max(120, s.t), ymin: 10, ymax: 42, xlabel: "time (s)", ylabel: "temperature (°C)", series: [{ data: s.hist, color: C.red, width: 2.5 }] });
  },
  read(s) { return { T: s.T.toFixed(1) + " °C", dT: (s.T - s.T0 >= 0 ? "+" : "") + (s.T - s.T0).toFixed(1) + " °C" }; },
  record(s, p) {
    if (!s.mixed) return "Press Mix and stir first.";
    if (s.t < 25) return "Wait until the temperature stops changing.";
    const ext = Lab.round(s.ext, 0.1), dT = ext - s.T0, q = 50 * 4.18 * Math.abs(dT);
    return { r: RX[p.r][0], T0: s.T0, Te: ext, dT, type: dT > 0 ? "exothermic" : "endothermic", q };
  },
  table: { cols: [{ key: "r", label: "Reaction" }, { key: "T0", label: "Start temp", unit: "°C", digits: 1 }, { key: "Te", label: "Highest / lowest", unit: "°C", digits: 1 }, { key: "dT", label: "Change", unit: "°C", digits: 1 }, { key: "type", label: "Type" }, { key: "q", label: "Energy change", unit: "J", digits: 0 }] },
  questions: [
    { q: "The temperature of the mixture rises. The reaction is…", options: ["exothermic", "endothermic"], answer: 0, why: "Exothermic reactions give out energy to the surroundings." },
    { q: "Why use a polystyrene cup with a lid?", options: ["It is cheap", "It reduces heat lost to (or gained from) the surroundings", "It speeds up the reaction"], answer: 1, why: "Polystyrene is a good insulator." },
    { q: "Calculate the energy change for 50 g of solution warming by 6.0 °C (c = 4.18 J/g°C).", options: ["209 J", "1254 J", "300 J"], answer: 1, why: "Q = m c ΔT = 50 × 4.18 × 6.0 = 1254 J." },
  ],
  conclusion: "Exothermic reactions (neutralisation, metals with acids, displacement) make the temperature rise. Endothermic ones (dissolving ammonium nitrate, citric acid with hydrogencarbonate) make it fall. Q = m c ΔT.",
});
