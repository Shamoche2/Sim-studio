const { C, text, rect, circle, line } = Sim;
// [name, shape, density g/cm³, size info, colour]
const OBJ = {
  alblock: ["Aluminium block", "block", 2.70, [4, 3, 2], "#ced4da"],
  woodblock: ["Wooden block", "block", 0.65, [6, 4, 3], "#d9a066"],
  brassblock: ["Brass block", "block", 8.50, [3, 2, 2], "#fcc419"],
  stone: ["Stone (irregular)", "irregular", 2.60, 18.5, "#868e96"],
  key: ["Metal key (irregular)", "irregular", 8.40, 2.4, "#adb5bd"],
  marble: ["Glass marble (irregular)", "irregular", 2.50, 5.6, "#99e9f2"],
};
const MATS = [["cork", 0.24], ["wood (pine)", 0.65], ["ice", 0.92], ["plastic", 1.4], ["glass", 2.5], ["stone (granite)", 2.6], ["aluminium", 2.7], ["iron", 7.9], ["brass", 8.5], ["copper", 8.96], ["lead", 11.3], ["gold", 19.3]];
const vol = (o) => (o[1] === "block" ? o[3][0] * o[3][1] * o[3][2] : o[3]);
Lab({
  title: "Virtual Lab: Measuring Density",
  aim: "Measure the density of regular and irregular objects, and use it to identify what they are made of.",
  equipment: ["Electronic balance (to 0.1 g)", "Ruler (to 1 mm)", "Displacement (eureka) can", "Measuring cylinder (to 1 cm³)", "Objects to test"],
  safety: ["Wipe up spilled water so nobody slips.", "Don't drop heavy objects into the measuring cylinder: lower them in gently."],
  method: [
    "Choose an <b>Object</b>.",
    "Press <b>Weigh it</b> to read its mass on the balance.",
    "Press <b>Measure volume</b>. For a block, the ruler measures length × width × height. For an irregular object, it is lowered into the full displacement can and the water pushed out is collected in the measuring cylinder.",
    "Press <b>Record result</b>. Density = mass ÷ volume is worked out in the table.",
    "Repeat for every object, then compare the densities with the table of materials.",
  ],
  controls: [{ id: "obj", label: "Object", type: "select", options: Object.entries(OBJ).map(([k, o]) => [k, o[0]]) }],
  buttons: [{ label: "Weigh it", click(s, p) { const o = OBJ[p.obj]; s.mass = Lab.round(Lab.noise(o[2] * vol(o), 0.004), 0.1); } }, { label: "Measure volume", click(s, p) { const o = OBJ[p.obj]; s.v = o[1] === "block" ? o[3].map((d) => Lab.round(Lab.noise(d, 0.01), 0.1)) : Lab.round(Lab.noise(vol(o), 0.03), 0.5); s.t = 0; } }],
  readouts: [["m", "Mass (balance)"], ["v", "Volume"], ["d", "Density = mass ÷ volume"]],
  init(s) { s.mass = null; s.v = null; s.t = 1; },
  change(s) { s.mass = null; s.v = null; },
  step(s, p, dt) { s.t = Math.min(1, s.t + dt * 0.6); },
  volume(s) { return s.v == null ? null : Array.isArray(s.v) ? s.v[0] * s.v[1] * s.v[2] : s.v; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const o = OBJ[p.obj], col = o[4];
    // balance
    const bx = W * 0.22, by = H * 0.7;
    rect(ctx, bx - 80, by, 160, 50, "#495057", null, 8); rect(ctx, bx - 60, by + 14, 120, 24, "#a9e34b", null, 3);
    text(ctx, s.mass == null ? "0.0 g" : s.mass.toFixed(1) + " g", bx, by + 32, { align: "center", weight: 800 });
    rect(ctx, bx - 60, by - 6, 120, 6, "#adb5bd");
    const drawObj = (x, y, k = 1) => { if (o[1] === "block") { const [a, b] = o[3]; rect(ctx, x - a * 7 * k, y - b * 7 * k, a * 14 * k, b * 14 * k, col, C.text, 3, 1.5); } else { ctx.beginPath(); for (let i = 0; i <= 10; i++) { const ang = (i / 10) * Math.PI * 2, r = (14 + Math.cbrt(o[3]) * 6) * k * (1 + 0.18 * Math.sin(i * 2.3)); ctx.lineTo(x + Math.cos(ang) * r * 1.2, y + Math.sin(ang) * r); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.text; ctx.stroke(); } };
    if (s.mass != null) drawObj(bx, by - 30);
    text(ctx, "balance", bx, by + 66, { align: "center", size: 11, color: C.muted });
    // volume measurement
    const vx = W * 0.62;
    if (o[1] === "block") {
      drawObj(vx, H * 0.45, 1.6);
      if (s.v) { const [a, b, c] = s.v; text(ctx, `${a.toFixed(1)} cm × ${b.toFixed(1)} cm × ${c.toFixed(1)} cm`, vx, H * 0.45 + o[3][1] * 12 + 34, { align: "center", weight: 700 }); line(ctx, vx - o[3][0] * 11.2, H * 0.45 - o[3][1] * 11.2 - 14, vx + o[3][0] * 11.2, H * 0.45 - o[3][1] * 11.2 - 14, "#e67700", 3); text(ctx, "ruler", vx, H * 0.45 - o[3][1] * 11.2 - 20, { align: "center", size: 11, color: "#e67700" }); }
      else text(ctx, "Press Measure volume", vx, H * 0.45 + 70, { align: "center", color: C.muted });
    } else {
      const cx = vx - 50, cy = H * 0.3; rect(ctx, cx - 40, cy, 80, 120, "rgba(116,192,252,.35)", C.text, 4, 2); line(ctx, cx + 40, cy + 18, cx + 70, cy + 30, C.text, 4);
      if (s.v != null) drawObj(cx, cy + 90 * Math.min(1, s.t * 1.5), 0.8);
      const mx = vx + 70, mtop = H * 0.35, mh = H * 0.5; rect(ctx, mx - 16, mtop, 32, mh, "#fff", C.text, 3, 1.5);
      const filled = s.v == null ? 0 : (s.v / 30) * mh * s.t; rect(ctx, mx - 14, mtop + mh - filled, 28, filled, "rgba(116,192,252,.6)");
      for (let ml = 0; ml <= 30; ml += 5) { const y = mtop + mh - (ml / 30) * mh; line(ctx, mx - 16, y, mx - 6, y, C.text, 1); text(ctx, String(ml), mx + 22, y + 4, { size: 10 }); }
      if (s.v != null && s.t > 0.3) for (let i = 0; i < 4; i++) circle(ctx, cx + 55 + i * 4, cy + 40 + ((s.t * 300 + i * 15) % 60), 2.5, "#74c0fc");
      text(ctx, "displacement can → measuring cylinder (cm³)", vx, H - 14, { align: "center", size: 11, color: C.muted });
    }
  },
  read(s) { const V = this.volume(s); return { m: s.mass == null ? "press Weigh it" : s.mass.toFixed(1) + " g", v: V == null ? "press Measure volume" : V.toFixed(1) + " cm³", d: s.mass != null && V ? (s.mass / V).toFixed(2) + " g/cm³" : "—" }; },
  record(s, p) {
    const V = this.volume(s);
    if (s.mass == null || V == null) return "Weigh the object and measure its volume first.";
    const d = s.mass / V, best = MATS.reduce((a, m) => (Math.abs(m[1] - d) < Math.abs(a[1] - d) ? m : a));
    return { obj: OBJ[p.obj][0], m: s.mass, v: V, d, mat: best[0] };
  },
  table: { cols: [{ key: "obj", label: "Object" }, { key: "m", label: "Mass", unit: "g", digits: 1 }, { key: "v", label: "Volume", unit: "cm³", digits: 1 }, { key: "d", label: "Density", unit: "g/cm³", digits: 2 }, { key: "mat", label: "Probably made of" }] },
  derived() { return { "Densities (g/cm³)": MATS.map((m) => `${m[0]} ${m[1]}`).join(" · ") }; },
  questions: [
    { q: "How do you find the volume of an irregular object?", options: ["Measure it with a ruler", "Measure the water it displaces", "Weigh it"], answer: 1, why: "The volume of water pushed out equals the volume of the object." },
    { q: "A block has mass 54 g and volume 20 cm³. What is its density?", options: ["1080 g/cm³", "0.37 g/cm³", "2.7 g/cm³"], answer: 2, why: "Density = 54 ÷ 20 = 2.7 g/cm³ (aluminium)." },
    { q: "Which object would float in water (density 1.0 g/cm³)?", options: ["The wooden block", "The brass block", "The stone"], answer: 0, why: "Wood's density is less than water's." },
  ],
  conclusion: "Density = mass ÷ volume. Each material has its own density, so measuring density helps identify what an object is made of.",
});
