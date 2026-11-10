const { C, text, rect, circle, line } = Sim;
const t = Math.acos(-1 / 3);
const GEOM = {
  linear: [[1, 0, 0], [-1, 0, 0]],
  trigonal: [[1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0]],
  tetra: [[0, 1, 0], [Math.sin(t), Math.cos(t), 0], [Math.sin(t) * Math.cos(2.094), Math.cos(t), Math.sin(t) * Math.sin(2.094)], [Math.sin(t) * Math.cos(4.189), Math.cos(t), Math.sin(t) * Math.sin(4.189)]],
  tbp: [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]],
  octa: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
};
// [centre, outer, electron geometry, bonding pairs, lone pairs, shape name, angle]
const MOL = {
  CO2: ["C", "O", "linear", 2, 0, "Linear", "180°"], BeCl2: ["Be", "Cl", "linear", 2, 0, "Linear", "180°"],
  BF3: ["B", "F", "trigonal", 3, 0, "Trigonal planar", "120°"], CH4: ["C", "H", "tetra", 4, 0, "Tetrahedral", "109.5°"],
  NH3: ["N", "H", "tetra", 3, 1, "Trigonal pyramidal", "107°"], H2O: ["O", "H", "tetra", 2, 2, "Bent", "104.5°"],
  PCl5: ["P", "Cl", "tbp", 5, 0, "Trigonal bipyramidal", "90° and 120°"], SF6: ["S", "F", "octa", 6, 0, "Octahedral", "90°"],
};
const COL = { C: "#343a40", O: C.red, H: "#e9ecef", N: C.blue, B: "#ffa8a8", F: "#8ce99a", Cl: C.green, Be: "#c0eb75", P: C.orange, S: C.yellow };
Sim({
  title: "Molecular Shapes (VSEPR)",
  intro: "Electron pairs around a central atom repel each other and spread out as far as possible. Lone pairs repel even more strongly, squeezing the bonds closer together. That decides the molecule's shape.",
  controls: [
    { id: "mol", label: "Molecule", type: "select", options: Object.keys(MOL).map((k) => [k, k.replace(/(\d)/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d])]), value: "CH4" },
    { id: "spin", label: "Rotate", type: "checkbox", value: true },
  ],
  readouts: [["shape", "Shape"], ["angle", "Bond angle"], ["pairs", "Electron pairs"]],
  init(s) { s.a = 0.5; s.b = 0.35; },
  step(s, p, dt) { if (p.spin) s.a += dt * 0.6; },
  pointer(s, p, e) { if (e.type === "down") s.last = e; if (e.type === "drag" && s.last) { s.a += (e.x - s.last.x) * 0.01; s.b += (e.y - s.last.y) * 0.01; s.last = e; } },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const [ce, out, g, bp, lp] = MOL[p.mol], dirs = GEOM[g], R = Math.min(W, H) * 0.3, cx = W / 2, cy = H / 2;
    const rot = ([x, y, z]) => { const x1 = x * Math.cos(s.a) + z * Math.sin(s.a), z1 = -x * Math.sin(s.a) + z * Math.cos(s.a); const y1 = y * Math.cos(s.b) - z1 * Math.sin(s.b), z2 = y * Math.sin(s.b) + z1 * Math.cos(s.b); return [x1, y1, z2]; };
    // lone pairs take the first directions (top), bonds the rest
    const items = dirs.map((d, i) => ({ d: rot(d), lone: i < lp }));
    const sorted = items.map((it) => ({ ...it })).sort((a, b) => a.d[2] - b.d[2]);
    const drawCentre = () => circle(ctx, cx, cy, 24, COL[ce], C.text, 1.5);
    let centreDrawn = false;
    for (const it of sorted) {
      if (!centreDrawn && it.d[2] > 0) { drawCentre(); text(ctx, ce, cx, cy + 5, { align: "center", weight: 700, color: ce === "C" ? "#fff" : C.text }); centreDrawn = true; }
      const x = cx + it.d[0] * R, y = cy - it.d[1] * R, sc = 1 + it.d[2] * 0.25;
      if (it.lone) {
        ctx.save(); ctx.globalAlpha = 0.35; ctx.translate(cx + it.d[0] * R * 0.55, cy - it.d[1] * R * 0.55); ctx.rotate(Math.atan2(-it.d[1], it.d[0]));
        ctx.beginPath(); ctx.ellipse(0, 0, R * 0.32 * sc, R * 0.18 * sc, 0, 0, Math.PI * 2); ctx.fillStyle = C.purple; ctx.fill(); ctx.restore();
        circle(ctx, cx + it.d[0] * R * 0.55 + it.d[1] * 6, cy - it.d[1] * R * 0.55 + it.d[0] * 6, 3.5, C.purple); circle(ctx, cx + it.d[0] * R * 0.55 - it.d[1] * 6, cy - it.d[1] * R * 0.55 - it.d[0] * 6, 3.5, C.purple);
      } else {
        line(ctx, cx, cy, x, y, "#868e96", 7 * sc);
        circle(ctx, x, y, 18 * sc, COL[out], C.text, 1.5);
        text(ctx, out, x, y + 5, { align: "center", weight: 700, size: 13 * sc });
      }
    }
    if (!centreDrawn) { drawCentre(); text(ctx, ce, cx, cy + 5, { align: "center", weight: 700, color: ce === "C" ? "#fff" : C.text }); }
    text(ctx, "Drag to rotate · purple = lone pair", 10, H - 10, { size: 12, color: C.muted });
  },
  read(s, p) { const [, , , bp, lp, shape, ang] = MOL[p.mol]; return { shape, angle: ang, pairs: `${bp} bonding, ${lp} lone` }; },
  keyIdea: "<b>Key idea:</b> count the electron pairs around the central atom. 4 pairs make a tetrahedral arrangement; replacing bonds with lone pairs gives pyramidal (NH₃, 107°) and bent (H₂O, 104.5°) shapes.",
  tryThis: ["Compare CH₄, NH₃ and H₂O. All have 4 electron pairs. Why are the angles different?", "Why is CO₂ straight but H₂O bent?", "How many electron pairs surround the sulfur in SF₆?"],
});
