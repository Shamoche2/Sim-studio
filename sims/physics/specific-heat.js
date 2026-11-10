const { C, text, rect, plot } = Sim;
const MAT = { water: ["Water", 4180, "#74c0fc"], oil: ["Cooking oil", 2000, "#ffd43b"], al: ["Aluminium", 900, "#ced4da"], copper: ["Copper", 385, "#e8590c"], iron: ["Iron", 450, "#868e96"] };
Sim({
  title: "Specific Heat Capacity",
  intro: "Heat 1 kg of different materials with the same heater. Some warm up quickly, others slowly. Specific heat capacity is the energy needed to raise 1 kg by 1 °C.",
  controls: [
    { id: "mat", label: "Material", type: "select", options: Object.entries(MAT).map(([k, v]) => [k, `${v[0]} (${v[1]} J/kg°C)`]) },
    { id: "m", label: "Mass", min: 0.2, max: 2, step: 0.1, value: 1, unit: "kg", digits: 1 },
    { id: "P", label: "Heater power", min: 100, max: 2000, step: 100, value: 1000, unit: "W" },
  ],
  readouts: [["t", "Time"], ["E", "Energy supplied"], ["T", "Temperature"], ["dT", "Rise"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.hist = Object.keys(MAT).reduce((o, k) => ((o[k] = [[0, 20]]), o), {}); },
  timeScale: 20,
  step(s, p, dt) {
    if (s.t >= 300) return;
    s.t += dt;
    for (const k in MAT) { const T = Math.min(100, 20 + (p.P * s.t) / (p.m * MAT[k][1])); if (s.t - s.hist[k].at(-1)[0] > 2) s.hist[k].push([s.t, T]); }
  },
  temp(s, p) { return Math.min(100, 20 + (p.P * s.t) / (p.m * MAT[p.mat][1])); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.3, T = this.temp(s, p), [, , col] = MAT[p.mat];
    const bx = left * 0.2, bw = left * 0.6, by = H * 0.25, bh = H * 0.55;
    rect(ctx, bx, by, bw, bh, col, C.text, 6, 2);
    rect(ctx, bx + bw * 0.4, by - 30, bw * 0.2, bh * 0.7, "#495057", null, 3); text(ctx, "heater", bx + bw / 2, by - 36, { align: "center", size: 11 });
    const glow = (T - 20) / 80; rect(ctx, bx + bw * 0.42, by + 10, bw * 0.16, bh * 0.4, `rgba(255,${120 - glow * 100},0,${0.3 + glow * 0.7})`, null, 2);
    text(ctx, `${T.toFixed(1)} °C`, bx + bw / 2, by + bh + 26, { align: "center", weight: 700, size: 18, color: `hsl(${220 - glow * 220},70%,45%)` });
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Temperature vs time (all materials, same mass and heater)", xmin: 0, xmax: 300, ymin: 0, ymax: 110, xlabel: "time (s)", ylabel: "°C", series: Object.keys(MAT).map((k) => ({ data: s.hist[k], color: k === p.mat ? C.red : "#ced4da", width: k === p.mat ? 3 : 1.5, label: k === p.mat ? MAT[k][0] : undefined })) });
  },
  read(s, p) { const T = this.temp(s, p); return { t: s.t.toFixed(0) + " s", E: ((p.P * s.t) / 1000).toFixed(0) + " kJ", T: T.toFixed(1) + " °C", dT: (T - 20).toFixed(1) + " °C" }; },
  keyIdea: "<b>Key idea:</b> energy E = m × c × ΔT. Water has a very high specific heat capacity, so it heats up and cools down slowly. That's why it's used in radiators and why coastal climates are milder.",
  tryThis: ["Which material reaches 100 °C first? Which is slowest?", "How much energy is needed to heat 1 kg of water from 20 °C to 100 °C?", "Double the mass of water. How does the heating time change?"],
  note: "Assumes no heat is lost to the surroundings. Time is sped up 20×.",
});
