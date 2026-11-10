const { C, text, rect, plot } = Sim;
const WIRES = { cu: ["Copper", 1.7e-8, "#e8590c"], al: ["Aluminium", 2.8e-8, "#adb5bd"], fe: ["Iron", 9.7e-8, "#495057"], nichrome: ["Nichrome", 1.1e-6, "#868e96"], constantan: ["Constantan", 4.9e-7, "#fab005"] };
Sim({
  title: "Resistance of a Wire",
  intro: "A wire's resistance depends on what it's made of, how long it is and how thick it is. Electrons collide with the metal's atoms as they flow, and a longer, thinner wire means more collisions.",
  controls: [
    { id: "mat", label: "Material", type: "select", options: Object.entries(WIRES).map(([k, v]) => [k, v[0]]), value: "nichrome" },
    { id: "L", label: "Length", min: 0.1, max: 2, step: 0.1, value: 1, unit: "m", digits: 1 },
    { id: "d", label: "Diameter", min: 0.1, max: 1, step: 0.05, value: 0.3, unit: "mm", digits: 2 },
  ],
  readouts: [["R", "Resistance"], ["A", "Cross-section area"], ["rho", "Resistivity"]],
  R(p, L = p.L) { const A = Math.PI * (p.d * 1e-3 / 2) ** 2; return (WIRES[p.mat][1] * L) / A; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const top = H * 0.38, x0 = 30, len = (W - 60) * (p.L / 2), th = 4 + p.d * 26;
    rect(ctx, x0, top / 2 - th / 2, len, th, WIRES[p.mat][2], C.text, th / 2, 1);
    text(ctx, `${WIRES[p.mat][0]}, ${p.L} m long, ${p.d} mm thick`, x0, top / 2 - th / 2 - 10, { weight: 600 });
    for (let m = 0; m <= 2; m += 0.5) { const x = x0 + (W - 60) * (m / 2); Sim.line(ctx, x, top / 2 + 26, x, top / 2 + 32, C.text, 1); text(ctx, m + " m", x, top / 2 + 44, { align: "center", size: 10, color: C.muted }); }
    const curve = Array.from({ length: 21 }, (_, i) => [i * 0.1, this.R(p, i * 0.1)]), ymax = Math.max(1, this.R(p, 2)) * 1.1;
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { title: "Resistance vs length", xmin: 0, xmax: 2, ymin: 0, ymax, xlabel: "length (m)", ylabel: "resistance (Ω)", series: [{ data: curve, color: C.blue }], marks: [{ x: p.L, y: this.R(p), color: C.red }] });
  },
  read(s, p) { const A = Math.PI * (p.d / 2) ** 2, R = this.R(p); return { R: R < 0.1 ? (R * 1000).toFixed(1) + " mΩ" : R.toFixed(2) + " Ω", A: A.toFixed(3) + " mm²", rho: WIRES[p.mat][1].toExponential(1) + " Ω·m" }; },
  keyIdea: "<b>Key idea:</b> R = ρL / A. Resistance is proportional to length and inversely proportional to cross-sectional area. Copper has low resistivity, so it's used for wiring; nichrome has high resistivity, so it's used in heaters.",
  tryThis: ["Double the length. What happens to the resistance?", "Double the diameter. Why does the resistance drop to a quarter?", "Why are the cables to an electric oven thicker than those to a lamp?"],
});
