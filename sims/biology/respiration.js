const { C, text, rect, plot } = Sim;
Sim({
  title: "Aerobic and Anaerobic Respiration",
  intro: "Muscles get energy from respiration. With enough oxygen, glucose is fully broken down (aerobic). During hard exercise, oxygen runs short and muscles also respire anaerobically, making lactic acid and building an 'oxygen debt'.",
  controls: [{ id: "ex", label: "Exercise intensity", min: 0, max: 100, step: 5, value: 30, unit: "%" }],
  buttons: [{ label: "Stop and rest", click(s) { s.rest = true; } }],
  readouts: [["mode", "Respiration"], ["hr", "Heart rate"], ["br", "Breathing rate"], ["lac", "Lactic acid"], ["atp", "Energy per glucose"]],
  init(s) { s.t = 0; s.lac = 0; s.rest = false; s.hist = { lac: [], hr: [] }; },
  change(s) { s.rest = false; },
  step(s, p, dt) {
    s.t += dt; const ex = s.rest ? 0 : p.ex, demand = ex / 100, supply = Math.min(demand, 0.6);
    const anaer = Math.max(0, demand - supply);
    s.lac = Math.max(0, s.lac + (anaer * 2 - (s.rest || ex < 60 ? 0.15 : 0.03)) * dt);
    s.hr = 65 + demand * 120 + s.lac * 10; s.br = 12 + demand * 30 + s.lac * 6; s.an = anaer;
    if (!s.hist.lac.length || s.t - s.hist.lac.at(-1)[0] > 0.2) { s.hist.lac.push([s.t, s.lac]); s.hist.hr.push([s.t, s.hr]); }
    for (const k in s.hist) if (s.hist[k].length > 300) s.hist[k].shift();
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const t0 = Math.max(0, s.t - 60), half = (H - 10) / 2;
    plot(ctx, { x: 0, y: 0, w: W, h: half }, { title: "Heart rate", xmin: t0, xmax: t0 + 60, ymin: 50, ymax: 220, xlabel: "time (s)", ylabel: "beats/min", series: [{ data: s.hist.hr, color: C.red }] });
    plot(ctx, { x: 0, y: half + 10, w: W, h: half }, { title: "Lactic acid in muscles", xmin: t0, xmax: t0 + 60, ymin: 0, ymax: 10, xlabel: "time (s)", ylabel: "lactic acid", series: [{ data: s.hist.lac, color: C.purple }], hlines: [{ y: 6, color: C.orange, label: "muscle fatigue / cramp" }] });
  },
  read(s) { const an = s.an > 0.01; return { mode: an ? "aerobic + anaerobic" : "aerobic only", hr: (s.hr || 65).toFixed(0) + " bpm", br: (s.br || 12).toFixed(0) + " /min", lac: s.lac.toFixed(1) + (s.lac > 6 ? " (fatigue!)" : ""), atp: an ? "anaerobic gives ~1/19 as much" : "maximum (aerobic)" }; },
  keyIdea: "<b>Key idea:</b> aerobic: glucose + oxygen → carbon dioxide + water (lots of energy). Anaerobic in muscles: glucose → lactic acid (much less energy). After exercise, you keep breathing hard to repay the oxygen debt and break down the lactic acid.",
  tryThis: ["At what intensity does lactic acid start to build up?", "Exercise at 100%, then press 'Stop and rest'. Why do the heart and breathing rates stay high for a while?", "Why do sprinters get tired muscles faster than marathon runners?"],
  note: "A simplified model.",
});
