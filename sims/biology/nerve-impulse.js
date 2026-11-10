const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Nerve Impulses",
  intro: "A nerve impulse is a wave of electrical change (an action potential) travelling along a neurone. Stimulate the neurone and watch the impulse move. Myelin insulation makes it jump and travel much faster.",
  controls: [
    { id: "myelin", label: "Myelinated (insulated) axon", type: "checkbox", value: true },
    { id: "stim", label: "Stimulus strength", min: 0, max: 100, step: 5, value: 60, unit: "%", help: "Below the threshold (about 30%) no impulse is sent: all or nothing." },
  ],
  buttons: [{ label: "Stimulate", primary: true, click(s, p) { if (p.stim >= 30) s.pulses.push({ x: 0, t0: s.t }); s.flash = s.t; } }],
  readouts: [["speed", "Conduction speed"], ["time", "Time to travel 1 m"], ["fired", "Last stimulus"]],
  init(s) { s.t = 0; s.pulses = []; s.trace = []; s.flash = -9; },
  step(s, p, dt) {
    s.t += dt;
    const v = p.myelin ? 0.9 : 0.15; // fraction of axon length per second (scaled)
    for (const pl of s.pulses) pl.x += v * dt;
    s.pulses = s.pulses.filter((pl) => pl.x < 1.15);
    // membrane potential at the recording electrode (x = 0.5)
    let Vm = -70;
    for (const pl of s.pulses) { const d = (pl.x - 0.5) / (p.myelin ? 0.06 : 0.04); if (d > -0.5 && d < 3) Vm = Math.max(Vm, d < 0.6 ? -70 + 110 * Math.exp(-((d - 0.3) ** 2) / 0.05) : -70 - 12 * Math.exp(-((d - 1.4) ** 2) / 0.4)); }
    s.trace.push([s.t, Vm]); if (s.trace.length > 600) s.trace.shift();
  },
  draw({ ctx, W, H }, s, p) {
    const top = H * 0.5, x0 = 60, x1 = W - 30, ay = top * 0.55;
    rect(ctx, 0, 0, W, H, "#fff");
    // cell body and dendrites
    circle(ctx, x0 - 20, ay, 26, "#ffd8a8", C.text, 1.5); circle(ctx, x0 - 20, ay, 8, C.purple);
    for (let k = 0; k < 5; k++) { const a = Math.PI * 0.6 + k * 0.4; Sim.line(ctx, x0 - 20 + Math.cos(a) * 26, ay + Math.sin(a) * 26, x0 - 20 + Math.cos(a) * 46, ay + Math.sin(a) * 46, "#e8590c", 2); }
    rect(ctx, x0, ay - 6, x1 - x0, 12, "#ffe8cc", C.text, 6, 1.2);
    if (p.myelin) for (let i = 0; i < 10; i++) { const x = x0 + ((i + 0.1) / 10) * (x1 - x0); rect(ctx, x, ay - 13, (x1 - x0) / 10 * 0.8, 26, "rgba(255,255,255,.95)", "#adb5bd", 10, 1.2); }
    // myelinated impulses jump from node to node
    for (const pl of s.pulses) { const x = x0 + (p.myelin ? Math.round(pl.x * 10) / 10 : pl.x) * (x1 - x0); if (x < x1) { ctx.globalAlpha = 0.85; circle(ctx, x, ay, 16, "rgba(250,82,82,.55)"); text(ctx, "+", x, ay - 20, { align: "center", color: C.red, weight: 700 }); ctx.globalAlpha = 1; } }
    if (s.t - s.flash < 0.3) text(ctx, p.stim >= 30 ? "⚡ impulse fired" : "below threshold: nothing happens", x0 - 40, 22, { color: p.stim >= 30 ? C.red : C.muted, weight: 700 });
    const ex = x0 + 0.5 * (x1 - x0); Sim.line(ctx, ex, ay + 16, ex, top - 4, C.gray, 1.5, [3, 3]); text(ctx, "recording electrode", ex + 4, top - 8, { size: 11, color: C.muted });
    text(ctx, "axon terminal →", x1, ay + 34, { align: "right", size: 12, color: C.muted });
    const t0 = Math.max(0, s.t - 6);
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { title: "Membrane potential at the electrode", xmin: t0, xmax: t0 + 6, ymin: -90, ymax: 50, ystep: 20, xlabel: "time (s, slowed down)", ylabel: "mV", series: [{ data: s.trace, color: C.red }], hlines: [{ y: -55, color: C.gray, label: "threshold" }, { y: -70, color: "#ced4da", label: "resting −70 mV" }] });
  },
  read(s, p) { const v = p.myelin ? 100 : 1; return { speed: `${v} m/s`, time: `${(1000 / v).toFixed(0)} ms`, fired: s.flash < 0 ? "—" : p.stim >= 30 ? "impulse sent" : "below threshold" }; },
  keyIdea: "<b>Key idea:</b> at rest the inside of a neurone is −70 mV. A strong enough stimulus opens sodium channels and the potential shoots up to about +40 mV, then recovers. Myelin makes the impulse jump between gaps, up to ~100× faster.",
  tryThis: ["Stimulate with 20% strength. Why does nothing happen?", "Compare myelinated and unmyelinated axons. Which reaches the end first?", "Does a stronger stimulus make a bigger impulse? (Look at the graph.)"],
  note: "Animation is slowed down a lot. Real impulses take milliseconds.",
});
