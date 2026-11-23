const { C, text, rect, circle, line } = Sim;
const COMP = { resistor: "Fixed resistor", lamp: "Filament lamp", diode: "Diode" };
function current(comp, V) {
  if (comp === "resistor") return V / 10;
  if (comp === "lamp") { const s = Math.sign(V), a = Math.abs(V); return s * (0.12 * Math.pow(a, 0.6)); } // resistance rises as it heats up
  return V > 0 ? 0.0005 * (Math.exp(V / 0.08) - 1) > 0.5 ? 0.5 : Math.max(0, (V - 0.62) * 1.6) : 0; // diode: ~0.6 V threshold, no reverse current
}
Lab({
  title: "Virtual Lab: Current–Voltage (I–V) Characteristics",
  aim: "Measure how the current through a fixed resistor, a filament lamp and a diode changes with the potential difference across it.",
  equipment: ["Variable power supply (−6 V to +6 V)", "Ammeter", "Voltmeter", "Fixed resistor, filament lamp and diode", "Connecting leads"],
  safety: ["Switch off between readings so components don't overheat.", "The lamp gets hot: don't touch it."],
  method: [
    "Choose a <b>Component</b>. The ammeter is in series with it and the voltmeter is in parallel across it.",
    "Set the <b>Supply voltage</b> and read the voltmeter and ammeter.",
    "Press <b>Record result</b>.",
    "Repeat in steps of 1 V from −6 V to +6 V (negative values mean the supply is reversed).",
    "Look at the shape of the I–V graph. Press <b>Clear table</b> before testing the next component.",
  ],
  controls: [
    { id: "comp", label: "Component", type: "select", options: Object.entries(COMP) },
    { id: "V", label: "Supply voltage", min: -6, max: 6, step: 0.5, value: 1, unit: "V", digits: 1 },
  ],
  readouts: [["v", "Voltmeter"], ["i", "Ammeter"], ["r", "Resistance V ÷ I"]],
  init(s) { s.nI = 0; s.nV = 0; s.t = 0; },
  change(s) { s.nI = Sim.randn() * 0.004; s.nV = Sim.randn() * 0.01; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const x1 = W * 0.12, x2 = W * 0.7, y1 = H * 0.2, y2 = H * 0.75, I = current(p.comp, p.V);
    ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    // supply
    rect(ctx, x1 - 26, (y1 + y2) / 2 - 22, 52, 44, "#f1f3f5", C.text, 6, 2); text(ctx, `${p.V.toFixed(1)} V`, x1, (y1 + y2) / 2 + 5, { align: "center", weight: 700, size: 12 });
    // ammeter (top)
    circle(ctx, (x1 + x2) / 2, y1, 22, "#fff", C.text, 2); text(ctx, "A", (x1 + x2) / 2, y1 + 6, { align: "center", weight: 800 });
    // component (right side)
    const cx = x2, cy = (y1 + y2) / 2;
    rect(ctx, cx - 20, cy - 34, 40, 68, "#fff");
    if (p.comp === "resistor") rect(ctx, cx - 10, cy - 28, 20, 56, "#ffe8cc", C.text, 2, 2);
    else if (p.comp === "lamp") { const glow = Math.min(1, Math.abs(I) / 0.35); circle(ctx, cx, cy, 18, `rgba(255,212,59,${0.15 + glow * 0.85})`, C.text, 2); line(ctx, cx - 12, cy - 12, cx + 12, cy + 12, C.text, 1.5); line(ctx, cx - 12, cy + 12, cx + 12, cy - 12, C.text, 1.5); }
    else { ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 12); ctx.lineTo(cx + 14, cy - 12); ctx.lineTo(cx, cy + 10); ctx.closePath(); ctx.fill(); line(ctx, cx - 14, cy + 12, cx + 14, cy + 12, C.text, 3); }
    // voltmeter in parallel
    const vx = x2 + 70; line(ctx, cx, cy - 34, vx, cy - 34, C.text, 2); line(ctx, cx, cy + 34, vx, cy + 34, C.text, 2); line(ctx, vx, cy - 34, vx, cy + 34, C.text, 2);
    circle(ctx, vx, cy, 22, "#fff", C.text, 2); text(ctx, "V", vx, cy + 6, { align: "center", weight: 800 });
    // moving charge
    const per = 2 * (x2 - x1 + y2 - y1), n = 16, sp = I * 400;
    for (let k = 0; k < n; k++) { let d = (((k / n) * per + s.t * sp) % per + per) % per, x, y; const w = x2 - x1, h = y2 - y1; if (d < w) { x = x1 + d; y = y1; } else if ((d -= w) < h) { x = x2; y = y1 + d; } else if ((d -= h) < w) { x = x2 - d; y = y2; } else { d -= w; x = x1; y = y2 - d; } if (Math.abs(I) > 0.002) circle(ctx, x, y, 3.5, "#fab005"); }
    text(ctx, COMP[p.comp], cx, y2 + 30, { align: "center", weight: 700 });
  },
  read(s, p) { const I = current(p.comp, p.V) + s.nI, V = p.V + s.nV; return { v: V.toFixed(2) + " V", i: I.toFixed(3) + " A", r: Math.abs(I) > 0.003 ? (V / I).toFixed(1) + " Ω" : "very high" }; },
  record(s, p) { const I = Lab.round(current(p.comp, p.V) + s.nI, 0.001), V = Lab.round(p.V + s.nV, 0.01); return { comp: COMP[p.comp], V, I, R: Math.abs(I) > 0.003 ? V / I : "—" }; },
  table: { cols: [{ key: "comp", label: "Component" }, { key: "V", label: "Voltage V", unit: "V", digits: 2 }, { key: "I", label: "Current I", unit: "A", digits: 3 }, { key: "R", label: "Resistance", unit: "Ω", digits: 1 }], x: "V", y: "I", xlabel: "potential difference (V)", ylabel: "current (A)", fit: "none", xmin: -6.5, ymin: -0.7, xmax: 6.5, ymax: 0.65, title: "I–V characteristic" },
  questions: [
    { q: "What shape is the I–V graph for a fixed resistor?", options: ["A straight line through the origin", "A curve that flattens", "Zero, then rising steeply"], answer: 0, why: "Current is proportional to voltage: it obeys Ohm's law." },
    { q: "Why does the filament lamp's graph curve?", options: ["Its resistance falls as it heats up", "Its resistance rises as it heats up", "The ammeter is faulty"], answer: 1, why: "Hotter metal ions vibrate more, so electrons collide more often: resistance increases." },
    { q: "What does a diode do?", options: ["Lets current flow equally both ways", "Lets current flow in one direction only", "Stores charge"], answer: 1, why: "A diode has a very high resistance in reverse, and conducts above about 0.6 V forwards." },
  ],
  conclusion: "A fixed resistor gives a straight line (Ohm's law). A filament lamp's resistance increases as it gets hotter, so its graph curves. A diode only conducts in one direction.",
});
