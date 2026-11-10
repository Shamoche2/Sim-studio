const { C, text, rect, circle, arrow, plot } = Sim;
const FL = { 1000: "Fresh water", 1025: "Sea water", 800: "Oil", 13600: "Mercury" };
Sim({
  title: "Pressure in Liquids",
  intro: "The deeper you go in a liquid, the more liquid is above you pushing down, so the pressure increases. Water spurts out further from holes lower down a container.",
  controls: [
    { id: "h", label: "Depth of the probe", min: 0, max: 10, step: 0.1, value: 4, unit: "m", digits: 1 },
    { id: "rho", label: "Liquid", type: "select", options: Object.entries(FL).map(([k, v]) => [k, `${v} (${k} kg/m³)`]), value: 1000 },
    { id: "atm", label: "Include air pressure above", type: "checkbox", value: false },
  ],
  readouts: [["P", "Pressure from liquid"], ["Ptot", "Total pressure"], ["F", "Force on 1 cm² (eardrum-sized)"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.5, tx = 40, tw = left * 0.45, top = 30, bot = H - 20, sc = (bot - top) / 10;
    const col = { 1000: "rgba(116,192,252,.5)", 1025: "rgba(12,133,153,.45)", 800: "rgba(242,183,5,.45)", 13600: "rgba(134,142,150,.8)" }[p.rho];
    rect(ctx, tx, top, tw, bot - top, col, C.text, 0, 2);
    for (let d = 0; d <= 10; d += 2) text(ctx, d + " m", tx - 4, top + d * sc + 4, { align: "right", size: 10, color: C.muted });
    // jets from holes
    for (const d of [2, 5, 8]) {
      const y = top + d * sc, v = Math.sqrt(2 * 9.81 * d), reach = v * 6 * Math.sqrt(1000 / p.rho) ** 0;
      ctx.strokeStyle = "rgba(34,139,230,.8)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx + tw, y);
      for (let k = 0; k <= 20; k++) { const t = k / 20; ctx.lineTo(tx + tw + reach * t * 2.2, y + 60 * t * t); } ctx.stroke();
    }
    const py = top + p.h * sc, px = tx + tw / 2;
    circle(ctx, px, py, 9, "#fff", C.red, 2.5);
    Sim.line(ctx, px, top - 20, px, py - 9, C.red, 1.5);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, L = 6 + p.h * 2.2 * Math.sqrt(p.rho / 1000) ** 0.6; arrow(ctx, px + Math.cos(a) * (9 + L), py + Math.sin(a) * (9 + L), px + Math.cos(a) * 11, py + Math.sin(a) * 11, C.red, 1.5, 6); }
    const P = (d) => (p.rho * 9.81 * d) / 1000 + (p.atm ? 101.3 : 0);
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: "Pressure vs depth", xmin: 0, xmax: 10, ymin: 0, ymax: p.rho > 2000 ? 1400 : 220, xlabel: "depth (m)", ylabel: "pressure (kPa)", series: Object.keys(FL).map((r) => ({ data: [[0, p.atm ? 101.3 : 0], [10, (r * 9.81 * 10) / 1000 + (p.atm ? 101.3 : 0)]], color: +r === p.rho ? C.blue : "#e9ecef", width: +r === p.rho ? 3 : 1.5 })), marks: [{ x: p.h, y: P(p.h), color: C.red }] });
  },
  read(s, p) { const P = p.rho * 9.81 * p.h, tot = P + (p.atm ? 101300 : 0); return { P: (P / 1000).toFixed(1) + " kPa", Ptot: (tot / 1000).toFixed(1) + " kPa", F: (tot * 1e-4).toFixed(2) + " N" }; },
  keyIdea: "<b>Key idea:</b> pressure in a liquid = ρ × g × h (density × gravitational field strength × depth). It acts in all directions and doesn't depend on the shape of the container.",
  tryThis: ["How deep in fresh water must you go for the pressure to equal air pressure (about 101 kPa)?", "Why does water spurt furthest from the lowest hole?", "Why are dams built thicker at the bottom than at the top?"],
});
