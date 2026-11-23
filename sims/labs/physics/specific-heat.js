const { C, text, rect, line, circle } = Sim;
const BLOCKS = { al: ["Aluminium", 900, "#ced4da"], cu: ["Copper", 385, "#e8590c"], fe: ["Iron", 450, "#868e96"], x: ["Unknown metal X", 500, "#adb5bd"] };
Lab({
  title: "Virtual Lab: Specific Heat Capacity of a Metal",
  aim: "Measure the specific heat capacity of a 1 kg metal block by heating it with a known amount of energy.",
  equipment: ["1 kg metal block with two holes", "Electric immersion heater (50 W)", "Thermometer", "Joulemeter (measures the energy supplied)", "Insulation to wrap the block", "Stopwatch"],
  safety: ["The heater and block get very hot: don't touch them.", "Keep water away from the electrical supply."],
  method: [
    "Choose a <b>Metal block</b>. Tick <b>Wrap in insulation</b> to reduce heat loss.",
    "Press <b>Switch heater on</b>. Time is sped up.",
    "Every minute, press <b>Record result</b> to note the joulemeter reading and the temperature.",
    "Record about 10 readings, then press <b>Switch heater off</b>.",
    "The gradient of temperature against energy is 1 ÷ (m × c). The value of c is worked out below the table.",
  ],
  controls: [
    { id: "b", label: "Metal block", type: "select", options: Object.entries(BLOCKS).map(([k, v]) => [k, v[0]]) },
    { id: "ins", label: "Wrap in insulation", type: "checkbox", value: true },
  ],
  buttons: [{ label: "Switch heater on", click(s) { s.on = true; } }, { label: "Switch heater off", click(s) { s.on = false; } }],
  readouts: [["time", "Time"], ["E", "Joulemeter"], ["T", "Thermometer"]],
  resetOnChange: true,
  init(s) { s.time = 0; s.E = 0; s.T = 20; s.on = false; s.Tair = 20; },
  substeps: 5,
  step(s, p, dt) {
    dt *= 120; // 1 real second ≈ 2 minutes of experiment
    const c = BLOCKS[p.b][1], loss = (p.ins ? 0.25 : 1.6) * (s.T - s.Tair); // W lost to the surroundings
    if (s.on) { s.E += 50 * dt; s.time += dt; }
    else if (s.time > 0) s.time += dt;
    s.T += (((s.on ? 50 : 0) - loss) * dt) / (1 * c);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const [, , col] = BLOCKS[p.b], bx = W * 0.3, by = H * 0.3, bw = W * 0.28, bh = H * 0.48;
    if (p.ins) rect(ctx, bx - 14, by - 14, bw + 28, bh + 14, "#fff3bf", "#e0b100", 8, 1.5);
    rect(ctx, bx, by, bw, bh, col, C.text, 4, 2);
    const glow = Math.min(1, (s.T - 20) / 40); rect(ctx, bx + bw * 0.25 - 8, by - 50, 16, bh * 0.7 + 50, `rgb(${120 + glow * 135},${80 - glow * 40},60)`, C.text, 3, 1.5);
    rect(ctx, bx + bw * 0.72 - 4, by - 70, 8, bh * 0.7 + 70, "#fff", C.text, 4, 1.5); rect(ctx, bx + bw * 0.72 - 2, by - 68 + (bh * 0.7 + 66) * (1 - (s.T - 0) / 100), 4, (bh * 0.7 + 66) * (s.T / 100), C.red, null, 2);
    text(ctx, "heater", bx + bw * 0.25, by - 56, { align: "center", size: 11 }); text(ctx, "thermometer", bx + bw * 0.72, by - 76, { align: "center", size: 11 });
    const jx = W * 0.8, jy = H * 0.35; rect(ctx, jx - 70, jy - 30, 140, 60, "#212529", null, 8); rect(ctx, jx - 58, jy - 18, 116, 36, "#a9e34b", null, 4);
    text(ctx, `${Math.round(s.E)} J`, jx, jy + 6, { align: "center", weight: 800 }); text(ctx, "joulemeter", jx, jy + 46, { align: "center", size: 11, color: C.muted });
    text(ctx, s.on ? "Heater ON" : "Heater off", jx, jy + 80, { align: "center", weight: 700, color: s.on ? C.red : C.muted });
    text(ctx, `${s.T.toFixed(1)} °C`, bx + bw / 2, by + bh + 40, { align: "center", weight: 800, size: 18 });
  },
  read(s) { return { time: `${Math.floor(s.time / 60)} min ${Math.floor(s.time % 60)} s`, E: Math.round(s.E) + " J", T: s.T.toFixed(1) + " °C" }; },
  record(s) { return { t: s.time / 60, E: Math.round(s.E), T: Lab.round(s.T + Sim.randn() * 0.1, 0.1) }; },
  table: { cols: [{ key: "t", label: "Time", unit: "min", digits: 1 }, { key: "E", label: "Energy supplied", unit: "J", digits: 0 }, { key: "T", label: "Temperature", unit: "°C", digits: 1 }], x: "E", y: "T", xlabel: "energy supplied (J)", ylabel: "temperature (°C)", fit: "line", ymin: 15, title: "Temperature against energy" },
  derived(rows) {
    if (rows.length < 3) return { "Specific heat capacity": "record at least 3 readings while heating" };
    const n = rows.length, mx = rows.reduce((a, r) => a + r.E, 0) / n, my = rows.reduce((a, r) => a + r.T, 0) / n;
    const m = rows.reduce((a, r) => a + (r.E - mx) * (r.T - my), 0) / rows.reduce((a, r) => a + (r.E - mx) ** 2, 0);
    return { "Gradient": m.toExponential(2) + " °C/J", "c = 1 ÷ (mass × gradient)": (1 / (1 * m)).toFixed(0) + " J/kg°C" };
  },
  questions: [
    { q: "Why is the block wrapped in insulation?", options: ["To make it heavier", "To reduce energy lost to the surroundings", "To make the thermometer more accurate"], answer: 1, why: "Less heat lost means more of the energy supplied heats the block, so c is closer to the true value." },
    { q: "Energy needed = mass × specific heat capacity × …", options: ["time", "temperature change", "power"], answer: 1, why: "E = m c ΔT." },
    { q: "Without insulation, your measured value of c would be…", options: ["too big", "too small", "exactly right"], answer: 0, why: "Some energy escapes, so the temperature rises less than it should, making c appear larger." },
  ],
  conclusion: "E = m c ΔT. Aluminium's specific heat capacity is about 900 J/kg°C, copper's about 385 J/kg°C. Heat loss makes measured values slightly too high.",
});
