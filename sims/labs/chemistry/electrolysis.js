const { C, text, rect, circle, line } = Sim;
const F = 96500;
// name, cathode product, anode product, cathode: [type, molar mass or 0, electrons], anode: [type, electrons], solution colour
const EL = {
  cuso4: ["Copper sulfate with copper electrodes", "copper (pink-brown coating)", "copper dissolves", ["metal", 63.5, 2], ["dissolve", 2], "rgba(116,192,252,.55)"],
  cuso4c: ["Copper sulfate with carbon electrodes", "copper (pink-brown coating)", "oxygen gas (relights a glowing splint)", ["metal", 63.5, 2], ["gas", 4], "rgba(116,192,252,.55)"],
  nacl: ["Sodium chloride solution (brine)", "hydrogen gas (squeaky pop)", "chlorine gas (bleaches damp litmus)", ["gas", 0, 2], ["gas", 2], "rgba(233,236,239,.6)"],
  h2so4: ["Dilute sulfuric acid", "hydrogen gas (squeaky pop)", "oxygen gas (relights a glowing splint)", ["gas", 0, 2], ["gas", 4], "rgba(233,236,239,.6)"],
  cucl2: ["Copper chloride solution", "copper (pink-brown coating)", "chlorine gas (bleaches damp litmus)", ["metal", 63.5, 2], ["gas", 2], "rgba(56,217,169,.45)"],
};
Lab({
  title: "Virtual Lab: Electrolysis of Solutions",
  aim: "Identify the products of electrolysing different solutions, and show that the mass of copper deposited is proportional to the charge passed.",
  equipment: ["Beaker and electrolyte", "Two electrodes (copper or inert carbon)", "Power supply, ammeter and variable resistor", "Stopwatch", "Balance (to 0.001 g)", "Test tubes to collect gases"],
  safety: ["Wear eye protection.", "Chlorine is toxic: use a fume cupboard or very small amounts.", "Turn off the power before touching the electrodes."],
  method: [
    "Choose an <b>Electrolyte</b> and set the <b>Current</b>.",
    "Press <b>Switch on</b>. Watch what happens at each electrode. Time runs faster than real life.",
    "After a few minutes, press <b>Switch off</b>, then press <b>Record result</b>. The cathode is weighed (or the gas volume read).",
    "Press <b>Clean electrodes</b>, then repeat for different times or currents.",
    "For copper, plot mass of copper against charge (Q = I × t). It is a straight line through the origin.",
  ],
  controls: [
    { id: "el", label: "Electrolyte", type: "select", options: Object.entries(EL).map(([k, v]) => [k, v[0]]) },
    { id: "I", label: "Current", min: 0.2, max: 1.0, step: 0.1, value: 0.5, unit: "A", digits: 1 },
  ],
  buttons: [{ label: "Switch on", click(s) { s.on = true; } }, { label: "Switch off", click(s) { s.on = false; } }, { label: "Clean electrodes", click(s) { s.t = 0; s.on = false; s.Q = 0; } }],
  readouts: [["t", "Time"], ["Q", "Charge passed Q = I × t"], ["cat", "At the cathode (−)"], ["an", "At the anode (+)"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.on = false; s.Q = 0; s.bub = []; s.m0 = Lab.round(Sim.rand(5.2, 6.4), 0.001); },
  step(s, p, dt) {
    if (s.on) { const d = dt * 60; s.t += d; s.Q += p.I * d * (1 + Sim.randn() * 0.004); }
    const e = EL[p.el];
    if (s.on) for (const [side, kind] of [[0, e[3][0]], [1, e[4][0]]]) if (kind === "gas" && Math.random() < p.I * 0.6) s.bub.push([side, Math.random() * 16 - 8, 0]);
    s.bub.forEach((b) => (b[2] += dt * 80)); s.bub = s.bub.filter((b) => b[2] < 150);
  },
  amounts(s, p) {
    const e = EL[p.el], mol = s.Q / F;
    const cat = e[3][0] === "metal" ? { mass: (mol / e[3][2]) * e[3][1] } : { gas: (mol / e[3][2]) * 24000 };
    const an = e[4][0] === "gas" ? { gas: (mol / e[4][1]) * 24000 } : { mass: -(mol / 2) * 63.5 };
    return { cat, an };
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const e = EL[p.el], bx = W * 0.15, bw = W * 0.5, by = H * 0.35, bh = H * 0.55;
    rect(ctx, bx, by + 30, bw, bh - 30, e[5]); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const ex = [bx + bw * 0.3, bx + bw * 0.7], copperEl = p.el === "cuso4", a = this.amounts(s, p);
    ex.forEach((x, i) => {
      const plate = i === 0 && e[3][0] === "metal" ? Math.min(6, s.Q / 60) : 0;
      rect(ctx, x - 8 - plate / 2, by - 20, 16 + plate, bh - 10, copperEl ? "#e8590c" : "#343a40", C.text, 2, 1.5);
      if (plate) rect(ctx, x - 8 - plate / 2, by + 30, 16 + plate, bh - 60, "#d9480f");
      text(ctx, i === 0 ? "cathode (−)" : "anode (+)", x, by - 30, { align: "center", size: 11, weight: 700 });
    });
    for (const b of s.bub) circle(ctx, ex[b[0]] + b[1], by + bh - 30 - b[2], 3, "rgba(255,255,255,.9)", "#868e96", 1);
    rect(ctx, (ex[0] + ex[1]) / 2 - 40, 14, 80, 34, s.on ? "#ffd43b" : "#dee2e6", C.text, 6, 1.5);
    text(ctx, s.on ? `${p.I.toFixed(1)} A ON` : "OFF", (ex[0] + ex[1]) / 2, 36, { align: "center", weight: 800 });
    line(ctx, ex[0], by - 20, ex[0], 31, C.text, 1.5); line(ctx, ex[0], 31, (ex[0] + ex[1]) / 2 - 40, 31, C.text, 1.5); line(ctx, ex[1], by - 20, ex[1], 31, C.text, 1.5); line(ctx, ex[1], 31, (ex[0] + ex[1]) / 2 + 40, 31, C.text, 1.5);
    const tx = W * 0.72; text(ctx, "Cathode (−):", tx, H * 0.35, { weight: 700 }); text(ctx, e[1], tx, H * 0.35 + 20, { size: 12 });
    text(ctx, "Anode (+):", tx, H * 0.55, { weight: 700 }); text(ctx, e[2], tx, H * 0.55 + 20, { size: 12 });
    if (a.cat.mass != null) text(ctx, `cathode mass ${(s.m0 + a.cat.mass).toFixed(3)} g`, tx, H * 0.8, { size: 12, color: C.muted });
  },
  read(s, p) { const a = this.amounts(s, p), f = (o) => (o.mass != null ? (o.mass >= 0 ? "+" : "") + o.mass.toFixed(3) + " g" : o.gas.toFixed(1) + " cm³ gas"); return { t: `${Math.floor(s.t / 60)} min ${Math.floor(s.t % 60)} s`, Q: s.Q.toFixed(0) + " C", cat: s.Q ? f(a.cat) : "—", an: s.Q ? f(a.an) : "—" }; },
  record(s, p) {
    if (s.on) return "Switch off before you weigh the cathode.";
    if (s.Q < 1) return "Pass a current first.";
    const e = EL[p.el], a = this.amounts(s, p);
    return { el: e[0], I: p.I, t: s.t / 60, Q: Lab.round(s.Q, 1), cat: e[1].split(" (")[0], an: e[2].split(" (")[0], mass: a.cat.mass != null ? Lab.round(a.cat.mass + Sim.randn() * 0.001, 0.001) : "—", gas: a.cat.gas != null ? Lab.round(a.cat.gas, 0.5) : "—" };
  },
  table: { cols: [{ key: "el", label: "Electrolyte" }, { key: "Q", label: "Charge", unit: "C", digits: 0 }, { key: "cat", label: "Cathode product" }, { key: "an", label: "Anode product" }, { key: "mass", label: "Mass gained by cathode", unit: "g", digits: 3 }, { key: "gas", label: "Gas at cathode", unit: "cm³", digits: 1 }], x: "Q", y: "mass", xlabel: "charge (C)", ylabel: "mass of copper (g)", fit: "origin", title: "Mass of copper against charge" },
  derived(rows) { const r = rows.filter((x) => typeof x.mass === "number"); if (r.length < 2) return { "Copper per coulomb": "record at least 2 copper results" }; const m = r.reduce((a, x) => a + x.Q * x.mass, 0) / r.reduce((a, x) => a + x.Q * x.Q, 0); return { "Gradient": (m * 1000).toFixed(3) + " mg/C", "Mass of Cu for 2 × 96 500 C (1 mol)": (m * 2 * F).toFixed(1) + " g" }; },
  questions: [
    { q: "In copper sulfate solution, copper forms at the…", options: ["anode (+)", "cathode (−)", "both electrodes"], answer: 1, why: "Positive Cu²⁺ ions are attracted to the negative cathode: Cu²⁺ + 2e⁻ → Cu." },
    { q: "Brine (sodium chloride solution) gives hydrogen, not sodium, at the cathode because…", options: ["sodium is more reactive than hydrogen", "sodium is less reactive than hydrogen", "there are no sodium ions"], answer: 0, why: "The less reactive element (hydrogen) is discharged." },
    { q: "If you double the charge passed, the mass of copper deposited…", options: ["halves", "stays the same", "doubles"], answer: 2, why: "Mass deposited is proportional to the charge." },
  ],
  conclusion: "Positive ions go to the cathode, negative ions to the anode. The less reactive of metal/hydrogen forms at the cathode. Mass deposited is proportional to charge (Q = It): 2 × 96 500 C deposits 63.5 g of copper.",
});
