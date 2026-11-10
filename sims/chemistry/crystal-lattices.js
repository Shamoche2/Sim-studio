const { C, text, rect, circle, line } = Sim;
const TYPES = {
  nacl: { name: "Sodium chloride (ionic lattice)", props: ["high melting point (801 °C)", "conducts when melted or dissolved", "hard but brittle"] },
  diamond: { name: "Diamond (giant covalent)", props: ["very high melting point (~3550 °C)", "does not conduct", "hardest natural substance"] },
  graphite: { name: "Graphite (giant covalent, layers)", props: ["very high melting point", "conducts (delocalised electrons)", "soft and slippery: layers slide"] },
  metal: { name: "Copper (metallic lattice)", props: ["high melting point (1085 °C)", "conducts electricity and heat", "malleable and ductile"] },
};
Sim({
  title: "Crystal Lattices and Properties",
  intro: "Many solids are giant structures: a regular 3D arrangement repeated millions of times. How the particles are held together explains melting point, hardness and conductivity. Drag to rotate.",
  controls: [{ id: "type", label: "Structure", type: "select", options: Object.entries(TYPES).map(([k, v]) => [k, v.name]) }],
  readouts: [["mp", "Melting point"], ["cond", "Conductivity"], ["hard", "Hardness"]],
  init(s) { s.a = 0.6; s.b = 0.4; },
  step(s, p, dt) { s.a += dt * 0.35; },
  pointer(s, p, e) { if (e.type === "down") s.last = e; if (e.type === "drag" && s.last) { s.a += (e.x - s.last.x) * 0.01; s.b += (e.y - s.last.y) * 0.01; s.last = e; } },
  points(type) {
    const pts = [], bonds = [];
    if (type === "nacl" || type === "metal") { for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) pts.push([x - 1, y - 1, z - 1, (x + y + z) % 2]); pts.forEach((a, i) => pts.forEach((b, j) => { if (j > i && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) === 1) bonds.push([i, j]); })); }
    else if (type === "diamond") { const base = [[0, 0, 0], [0, 2, 2], [2, 0, 2], [2, 2, 0], [1, 1, 1], [1, 3, 3], [3, 1, 3], [3, 3, 1]]; for (const [x, y, z] of base) pts.push([x / 2 - 0.75, y / 2 - 0.75, z / 2 - 0.75, 0]); pts.forEach((a, i) => pts.forEach((b, j) => { if (j > i && Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - 0.866) < 0.05) bonds.push([i, j]); })); }
    else { for (let l = 0; l < 3; l++) for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + (l % 2) * 0.5; pts.push([Math.cos(ang), (l - 1) * 0.9, Math.sin(ang), 0]); if (k) bonds.push([pts.length - 2, pts.length - 1]); } for (let l = 0; l < 3; l++) bonds.push([l * 6, l * 6 + 5]); }
    return { pts, bonds };
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const { pts, bonds } = this.points(p.type), sc = Math.min(W * 0.55, H) * 0.32, cx = W * 0.32, cy = H / 2;
    const proj = pts.map(([x, y, z, k]) => { const x1 = x * Math.cos(s.a) + z * Math.sin(s.a), z1 = -x * Math.sin(s.a) + z * Math.cos(s.a), y1 = y * Math.cos(s.b) - z1 * Math.sin(s.b), z2 = y * Math.sin(s.b) + z1 * Math.cos(s.b); return [cx + x1 * sc, cy - y1 * sc, z2, k]; });
    for (const [i, j] of bonds) line(ctx, proj[i][0], proj[i][1], proj[j][0], proj[j][1], p.type === "nacl" ? "#dee2e6" : "#868e96", p.type === "nacl" ? 1.5 : 3);
    [...proj].sort((a, b) => a[2] - b[2]).forEach(([x, y, z, k]) => {
      const r = (p.type === "nacl" ? (k ? 9 : 15) : 11) * (1 + z * 0.15);
      const col = p.type === "nacl" ? (k ? "#be4bdb" : "#51cf66") : p.type === "metal" ? "#e8590c" : "#343a40";
      circle(ctx, x, y, r, col, "#fff", 1.5);
    });
    if (p.type === "nacl") text(ctx, "green = Cl⁻ (bigger), purple = Na⁺", 10, H - 10, { size: 12, color: C.muted });
    const bx = W * 0.62; text(ctx, "Properties", bx, 40, { weight: 700, size: 16 });
    TYPES[p.type].props.forEach((t, i) => text(ctx, "• " + t, bx, 70 + i * 28, { size: 14 }));
  },
  read(s, p) { const [mp, cond, hard] = TYPES[p.type].props; return { mp, cond, hard }; },
  keyIdea: "<b>Key idea:</b> giant ionic and giant covalent structures have high melting points because many strong bonds must break. Graphite conducts because each carbon has one delocalised electron; diamond doesn't because all four outer electrons are in bonds.",
  tryThis: ["Why does sodium chloride conduct when molten but not as a solid?", "Both diamond and graphite are pure carbon. Why is one hard and the other soft?", "Why is graphite used in pencils and as a lubricant?"],
});
