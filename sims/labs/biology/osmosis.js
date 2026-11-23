const { C, text, rect, line } = Sim;
const ISO = 0.27; // mol/dm³ sucrose equal to potato cell sap
const pct = (c) => 22 * (ISO - c) / (0.27 + c * 0.9); // % change in mass
Lab({
  title: "Virtual Lab: Osmosis in Potato Cylinders",
  aim: "Investigate how the concentration of sucrose solution affects the change in mass of potato cylinders, and estimate the concentration of the potato cell sap.",
  equipment: ["Potato, cork borer and white tile", "Scalpel and ruler", "Boiling tubes and rack", "Sucrose solutions 0.0–1.0 mol/dm³", "Balance (to 0.01 g)", "Paper towels"],
  safety: ["Take care with the scalpel and cork borer: cut away from your body, on a tile."],
  method: [
    "Choose the <b>Sucrose concentration</b>. A potato cylinder of the same length is weighed and put in the tube.",
    "Press <b>Leave for 30 minutes</b>. Time is sped up.",
    "When the time is up the cylinder is taken out, blotted dry and weighed again. Press <b>Record result</b>.",
    "Repeat for 0.0, 0.2, 0.4, 0.6, 0.8 and 1.0 mol/dm³.",
    "Plot percentage change in mass against concentration. Where the line crosses zero, the potato cells and the solution have the same water potential.",
  ],
  controls: [{ id: "c", label: "Sucrose concentration", min: 0, max: 1, step: 0.1, value: 0, unit: "mol/dm³", digits: 1 }],
  buttons: [{ label: "Leave for 30 minutes", click(s) { if (!s.run && !s.done) s.run = true; } }],
  readouts: [["clock", "Time in solution"], ["m", "Mass of cylinder"]],
  resetOnChange: true,
  init(s) { s.m0 = Lab.round(Sim.rand(2.3, 2.7), 0.01); s.t = 0; s.run = false; s.done = false; s.k = pct; s.err = Sim.randn() * 0.6; },
  step(s, p, dt) { if (!s.run) return; s.t = Math.min(30, s.t + dt * 6); if (s.t >= 30) { s.run = false; s.done = true; } },
  mass(s, p) { return s.m0 * (1 + ((pct(p.c) + s.err) / 100) * (1 - Math.exp(-s.t / 8)) / (1 - Math.exp(-30 / 8))); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const tx = W * 0.3, ty = 30, th = H - 70;
    rect(ctx, tx - 40, ty, 80, th, "rgba(255,255,255,.8)", C.text, 0, 2);
    rect(ctx, tx - 38, ty + th * 0.25, 76, th * 0.75 - 2, `rgba(116,192,252,${0.2 + p.c * 0.5})`);
    const scale = this.mass(s, p) / s.m0, len = 110 * scale, wid = 24 * Math.sqrt(scale);
    rect(ctx, tx - wid / 2, ty + th - 30 - len, wid, len, "#ffe8a3", "#c99a2e", 6, 2);
    text(ctx, `${p.c.toFixed(1)} mol/dm³ sucrose`, tx, ty + th + 24, { align: "center", weight: 700 });
    // cells close-up
    const cx = W * 0.72, cy = H * 0.42, sh = Math.min(1.08, Math.max(0.7, 1 + (pct(p.c) / 100) * 1.5 * (s.t / 30)));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x = cx - 90 + i * 70, y = cy - 50 + j * 70; rect(ctx, x, y, 64, 64, "#d3f9d8", "#2b8a3e", 4, 2);
      const v = 54 * sh; rect(ctx, x + 32 - v / 2, y + 32 - v / 2, v, v, "rgba(81,207,102,.45)", "#2f9e44", 6, 1);
    }
    text(ctx, sh < 0.95 ? "cells losing water (plasmolysing)" : sh > 1.02 ? "cells gaining water (turgid)" : "cells (close-up)", cx, cy + 110, { align: "center", size: 12, color: C.muted });
    const arrow = pct(p.c) > 0.5 ? "water moves INTO the potato" : pct(p.c) < -0.5 ? "water moves OUT of the potato" : "almost no net movement";
    if (s.t > 0) text(ctx, arrow, cx, cy + 132, { align: "center", weight: 700, color: C.blue });
  },
  read(s, p) { return { clock: `${s.t.toFixed(0)} min`, m: (s.t ? this.mass(s, p) : s.m0).toFixed(2) + " g" }; },
  record(s, p) { if (!s.done) return "Leave the cylinder for the full 30 minutes first."; const m1 = Lab.round(this.mass(s, p), 0.01); return { c: p.c, m0: s.m0, m1, dm: m1 - s.m0, pc: ((m1 - s.m0) / s.m0) * 100 }; },
  table: { cols: [{ key: "c", label: "Concentration", unit: "mol/dm³", digits: 1 }, { key: "m0", label: "Mass at start", unit: "g", digits: 2 }, { key: "m1", label: "Mass at end", unit: "g", digits: 2 }, { key: "dm", label: "Change", unit: "g", digits: 2 }, { key: "pc", label: "% change", unit: "%", digits: 1 }], x: "c", y: "pc", xlabel: "sucrose concentration (mol/dm³)", ylabel: "% change in mass", fit: "none", ymin: -25, ymax: 25, title: "% change in mass against concentration" },
  derived(rows) {
    const r = [...rows].sort((a, b) => a.c - b.c); for (let i = 0; i < r.length - 1; i++) if (r[i].pc >= 0 && r[i + 1].pc < 0) { const x = r[i].c + (r[i].pc / (r[i].pc - r[i + 1].pc)) * (r[i + 1].c - r[i].c); return { "Graph crosses 0% at about": x.toFixed(2) + " mol/dm³", "Meaning": "the concentration of the potato cell sap" }; }
    return { "Concentration of cell sap": "record results either side of 0% change" };
  },
  questions: [
    { q: "Why do we calculate percentage change in mass, not just change in mass?", options: ["It is easier", "The cylinders may start with slightly different masses", "Percentages are always positive"], answer: 1, why: "Percentage change lets us compare fairly." },
    { q: "In pure water, the potato cylinder…", options: ["gains mass, because water enters by osmosis", "loses mass", "stays the same"], answer: 0, why: "Water moves from a dilute solution (high water potential) to a more concentrated one, through the partially permeable membrane." },
    { q: "Why are the cylinders blotted dry before weighing?", options: ["To remove surface solution, which would add mass", "To stop osmosis", "To kill the cells"], answer: 0, why: "Only the water absorbed should be weighed." },
  ],
  conclusion: "In dilute solutions potato gains mass (water enters by osmosis). In concentrated solutions it loses mass. Where the graph crosses 0%, the solution matches the concentration of the cell sap (about 0.27 mol/dm³ here).",
});
