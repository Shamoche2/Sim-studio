const { C, text, rect, circle, line } = Sim;
const CELLS = {
  cucl2: { name: "Copper(II) chloride solution", cat: ["Cu²⁺", C.blue, 2], an: ["Cl⁻", C.green, 1], atCat: "copper metal", atAn: "chlorine gas", M: 63.5, n: 2 },
  nacl: { name: "Molten sodium chloride", cat: ["Na⁺", C.purple, 1], an: ["Cl⁻", C.green, 1], atCat: "sodium metal", atAn: "chlorine gas", M: 23.0, n: 1 },
  pbbr2: { name: "Molten lead(II) bromide", cat: ["Pb²⁺", C.gray, 2], an: ["Br⁻", C.orange, 1], atCat: "lead metal", atAn: "bromine vapour", M: 207.2, n: 2 },
};
Sim({
  title: "Electrolysis",
  intro: "Passing electricity through a liquid containing ions splits it up. Positive ions move to the negative electrode (cathode) and gain electrons; negative ions move to the positive electrode (anode) and lose electrons.",
  controls: [
    { id: "cell", label: "Electrolyte", type: "select", options: Object.entries(CELLS).map(([k, v]) => [k, v.name]) },
    { id: "I", label: "Current", min: 0, max: 5, step: 0.1, value: 2, unit: "A", digits: 1 },
  ],
  readouts: [["cat", "At the cathode (−)"], ["an", "At the anode (+)"], ["mass", "Metal deposited"], ["time", "Time running"]],
  resetOnChange: true,
  init(s, p) {
    const d = CELLS[p.cell], box = { x0: 15, y0: 15, x1: 85, y1: 55 };
    s.box = box; s.t = 0; s.depC = 0; s.depA = 0;
    s.ions = [...Sim.particles.make(14, box, 3, { type: "cat" }), ...Sim.particles.make(14 * (d.cat[2] / d.an[2]), box, 3, { type: "an" })];
  },
  step(s, p, dt) {
    const d = CELLS[p.cell], E = p.I * 2;
    s.t += dt * 600; // 1 real second = 10 minutes
    for (const q of s.ions) { q.vx += (q.type === "cat" ? -E : E) * dt; q.vx *= 0.98; q.vy *= 0.98; q.vy += Sim.randn() * 2 * dt * 10; }
    Sim.particles.move(s.ions, dt, s.box);
    for (const q of s.ions) {
      if (q.type === "cat" && q.x <= s.box.x0 + 1.2 && p.I > 0) { s.depC++; Object.assign(q, { x: Sim.rand(40, 84), y: Sim.rand(16, 54), vx: 0 }); }
      if (q.type === "an" && q.x >= s.box.x1 - 1.2 && p.I > 0) { s.depA++; Object.assign(q, { x: Sim.rand(16, 60), y: Sim.rand(16, 54), vx: 0 }); }
    }
    void d;
  },
  draw({ ctx, W, H }, s, p) {
    const d = CELLS[p.cell], sc = Math.min(W / 100, H / 72), ox = (W - 100 * sc) / 2, X = (x) => ox + x * sc, Y = (y) => (y + 7) * sc;
    rect(ctx, 0, 0, W, H, "#fff");
    rect(ctx, X(10), Y(12), 80 * sc, 46 * sc, "rgba(116,192,252,.18)", C.text, 4, 2);
    // electrodes
    rect(ctx, X(12), Y(6), 3 * sc, 46 * sc, "#495057"); rect(ctx, X(85), Y(6), 3 * sc, 46 * sc, "#495057");
    text(ctx, "cathode (−)", X(13.5), Y(4), { align: "center", size: 12, weight: 600, color: C.blue });
    text(ctx, "anode (+)", X(86.5), Y(4), { align: "center", size: 12, weight: 600, color: C.red });
    // deposit and bubbles
    rect(ctx, X(15), Y(10), Math.min(4, s.depC * 0.03) * sc, 42 * sc, d.cat[1]);
    for (let i = 0; i < Math.min(40, s.depA); i++) circle(ctx, X(83 - (i % 3) * 1.4), Y(50 - ((i * 7 + s.t / 30) % 38)), 0.9 * sc, null, d.an[1], 1.5);
    for (const q of s.ions) { const cat = q.type === "cat"; circle(ctx, X(q.x), Y(q.y), 1.6 * sc, cat ? d.cat[1] : d.an[1]); text(ctx, cat ? "+" : "−", X(q.x), Y(q.y) + 4, { align: "center", color: "#fff", size: 11, weight: 700 }); }
    // battery and wires
    line(ctx, X(13.5), Y(6), X(13.5), Y(1), C.text, 2); line(ctx, X(86.5), Y(6), X(86.5), Y(1), C.text, 2);
    line(ctx, X(13.5), Y(1), X(46), Y(1), C.text, 2); line(ctx, X(54), Y(1), X(86.5), Y(1), C.text, 2);
    line(ctx, X(47), Y(-1) + 4, X(47), Y(3), C.text, 4); line(ctx, X(53), Y(-2) + 4, X(53), Y(4), C.text, 2);
    text(ctx, `${d.cat[0]} → cathode    ${d.an[0]} → anode`, X(50), Y(61), { align: "center", weight: 600 });
  },
  read(s, p) {
    const d = CELLS[p.cell], mass = (p.I * s.t * d.M) / (d.n * 96485);
    return { cat: d.atCat, an: d.atAn, mass: mass.toFixed(3) + " g", time: (s.t / 60).toFixed(1) + " min" };
  },
  keyIdea: "<b>Key idea:</b> cathode: positive ions gain electrons (reduction), e.g. Cu²⁺ + 2e⁻ → Cu. Anode: negative ions lose electrons (oxidation), e.g. 2Cl⁻ → Cl₂ + 2e⁻. Mass deposited = (I × t × M) ÷ (n × 96 485).",
  tryThis: ["Which electrode do the positive ions move towards? Why?", "Double the current. What happens to the mass of metal made in the same time?", "Compare copper and sodium at the same current. Which deposits more mass per minute, and why?"],
  note: "Time is sped up: 1 second = 10 minutes. Solid ionic compounds must be melted or dissolved so ions can move.",
});
