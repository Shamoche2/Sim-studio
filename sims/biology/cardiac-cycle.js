const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "The Cardiac Cycle",
  intro: "Each heartbeat has phases: the atria contract to fill the ventricles, then the ventricles contract to push blood out. Valves open and close as the pressures change, preventing backflow. The 'lub-dub' sound is the valves closing.",
  controls: [{ id: "hr", label: "Heart rate", min: 40, max: 160, step: 5, value: 60, unit: "bpm" }],
  readouts: [["phase", "Phase"], ["av", "Valves between atria and ventricles"], ["sl", "Valves to the arteries"]],
  init(s) { s.ph = 0; },
  step(s, p, dt) { s.ph = (s.ph + (dt * p.hr) / 60 * 0.35) % 1; },
  P(f) {
    const atrium = 4 + 6 * Math.exp(-((f - 0.08) ** 2) / 0.002);
    const vent = f < 0.12 ? 4 + 6 * Math.exp(-((f - 0.08) ** 2) / 0.002) : f < 0.45 ? 5 + 115 * Math.sin(((f - 0.12) / 0.33) * Math.PI) ** 0.8 : 4;
    const aorta = f < 0.17 ? 80 + (0.17 - f) * 0 - f * 20 : f < 0.42 ? Math.max(80, vent) : 80 + 25 * Math.exp(-(f - 0.42) * 4) - (f - 0.42) * 8;
    return { atrium, vent, aorta: Math.max(78, aorta) };
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.32, cx = left / 2, cy = H / 2, P = this.P(s.ph), sys = P.vent > P.aorta - 1, atrSq = 1 - 0.15 * Math.exp(-((s.ph - 0.08) ** 2) / 0.002), venSq = s.ph > 0.12 && s.ph < 0.45 ? 1 - 0.18 * Math.sin(((s.ph - 0.12) / 0.33) * Math.PI) : 1;
    rect(ctx, cx - 60 * atrSq, cy - 90, 120 * atrSq, 60, "#ffa8a8", C.text, 14, 1.5); text(ctx, "atria", cx, cy - 56, { align: "center", size: 12, weight: 600 });
    rect(ctx, cx - 60 * venSq, cy - 22, 120 * venSq, 110 * venSq, "#e03131", C.text, 20, 1.5); text(ctx, "ventricles", cx, cy + 34, { align: "center", size: 12, weight: 600, color: "#fff" });
    const avOpen = P.atrium > P.vent, slOpen = sys;
    rect(ctx, cx - 40, cy - 30, 30, 6, avOpen ? "#d3f9d8" : "#495057"); rect(ctx, cx + 10, cy - 30, 30, 6, avOpen ? "#d3f9d8" : "#495057");
    rect(ctx, cx - 10, cy - 120, 20, 30, slOpen ? "#d3f9d8" : "#495057", C.text, 2, 1); text(ctx, "to arteries", cx, cy - 126, { align: "center", size: 11 });
    const xs = Array.from({ length: 101 }, (_, i) => i / 100), sc = 0.8 / 1, T = (60 / p.hr) * 1;
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Pressure during one heartbeat (left side)", xmin: 0, xmax: T, ymin: 0, ymax: 130, xlabel: "time (s)", ylabel: "pressure (mmHg)", series: [{ data: xs.map((f) => [f * T, this.P(f).aorta]), color: C.purple, label: "aorta" }, { data: xs.map((f) => [f * T, this.P(f).vent]), color: C.red, label: "ventricle" }, { data: xs.map((f) => [f * T, this.P(f).atrium]), color: C.orange, label: "atrium" }], vlines: [{ x: s.ph * T, color: C.text }] });
    void sc;
  },
  read(s) { const P = this.P(s.ph), f = s.ph; return { phase: f < 0.12 ? "atrial systole (atria contract)" : f < 0.45 ? "ventricular systole (ventricles contract)" : "diastole (heart relaxes and fills)", av: P.atrium > P.vent ? "open" : "closed (the 'lub' sound when they shut)", sl: P.vent > P.aorta - 1 ? "open: blood pumped out" : "closed (the 'dub' sound when they shut)" }; },
  keyIdea: "<b>Key idea:</b> valves open when the pressure behind them is higher than in front, and close when it's lower. That's how blood flows one way: atria → ventricles → arteries. The left ventricle reaches about 120 mmHg.",
  tryThis: ["When does the valve to the aorta open? Compare the ventricle and aorta pressures at that moment.", "Why is the ventricle wall thicker than the atrium wall?", "Increase the heart rate. Which phase gets shorter the most in real hearts?"],
  note: "Simplified pressure curves.",
});
