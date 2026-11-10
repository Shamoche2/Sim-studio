const { C, text, rect, arrow } = Sim;
const FLUIDS = { 1000: "Water", 1025: "Sea water", 800: "Oil", 13600: "Mercury" };
Sim({
  title: "Buoyancy and Floating",
  intro: "A fluid pushes up on anything in it with a force equal to the weight of fluid pushed aside (Archimedes' principle). An object floats if it is less dense than the fluid.",
  controls: [
    { id: "rho", label: "Object density", min: 100, max: 12000, step: 50, value: 600, unit: "kg/m³", help: "wood ≈ 600, ice ≈ 920, aluminium ≈ 2700, steel ≈ 7800" },
    { id: "V", label: "Object volume", min: 1, max: 10, step: 0.5, value: 4, unit: "litres", digits: 1 },
    { id: "fluid", label: "Fluid", type: "select", options: Object.entries(FLUIDS).map(([k, v]) => [k, `${v} (${k} kg/m³)`]), value: 1000 },
  ],
  readouts: [["W", "Weight"], ["B", "Buoyant force"], ["sub", "Fraction under fluid"], ["res", "Result"]],
  calc(p) {
    const g = 9.81, V = p.V / 1000, frac = Math.min(1, p.rho / p.fluid);
    return { W: p.rho * V * g, B: p.fluid * V * frac * g, frac, floats: p.rho < p.fluid };
  },
  draw({ ctx, W, H }, s, p) {
    const surf = H * 0.35, bottom = H - 20, r = this.calc(p), side = 50 + p.V * 9;
    rect(ctx, 0, 0, W, H, C.sky);
    const col = { 1000: "rgba(47,111,237,.35)", 1025: "rgba(12,133,153,.4)", 800: "rgba(242,183,5,.4)", 13600: "rgba(134,142,150,.75)" }[p.fluid];
    rect(ctx, 40, surf, W - 80, bottom - surf, col, C.text, 0, 2);
    const cx = W / 2, top = r.floats ? surf - side * (1 - r.frac) : bottom - side;
    const shade = Math.min(1, p.rho / 9000);
    rect(ctx, cx - side / 2, top, side, side, `rgb(${200 - shade * 140},${150 - shade * 90},${100 - shade * 40})`, C.text, 4, 2);
    const k = 1.2;
    arrow(ctx, cx + 12, top + side / 2, cx + 12, top + side / 2 + r.W * k, C.red, 4);
    text(ctx, `weight ${r.W.toFixed(1)} N`, cx + 18, top + side / 2 + r.W * k, { color: C.red, weight: 600, size: 12 });
    arrow(ctx, cx - 12, top + side, cx - 12, top + side - r.B * k, C.green, 4);
    text(ctx, `buoyancy ${r.B.toFixed(1)} N`, cx - 18, top + side - r.B * k, { color: C.green, weight: 600, size: 12, align: "right" });
    text(ctx, FLUIDS[p.fluid], 50, surf + 24, { weight: 600 });
    text(ctx, r.floats ? "Floats" : "Sinks", W - 50, 30, { align: "right", weight: 700, size: 18, color: r.floats ? C.green : C.red });
  },
  read(s, p) { const r = this.calc(p); return { W: r.W.toFixed(1) + " N", B: r.B.toFixed(1) + " N", sub: (r.frac * 100).toFixed(0) + "%", res: r.floats ? "floats" : "sinks" }; },
  keyIdea: "<b>Key idea:</b> buoyant force = ρ<sub>fluid</sub> × V<sub>submerged</sub> × g. A floating object sinks until the buoyant force equals its weight, so the fraction under the surface = ρ<sub>object</sub> / ρ<sub>fluid</sub>.",
  tryThis: ["Ice has a density of 920 kg/m³. What fraction of an iceberg is underwater?", "Put a steel block (7800) in water, then in mercury. What happens?", "Does changing the volume change whether something floats?"],
});
