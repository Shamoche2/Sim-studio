const { C, text, rect, circle } = Sim;
// atoms: [symbol, x, y, outer electrons, colour]; bonds: [i, j, order]; lone: [atom, count of lone pairs]
const MOLS = {
  H2: { name: "Hydrogen, H₂", atoms: [["H", -1, 0, 1], ["H", 1, 0, 1]], bonds: [[0, 1, 1]] },
  Cl2: { name: "Chlorine, Cl₂", atoms: [["Cl", -1, 0, 7], ["Cl", 1, 0, 7]], bonds: [[0, 1, 1]] },
  O2: { name: "Oxygen, O₂", atoms: [["O", -1, 0, 6], ["O", 1, 0, 6]], bonds: [[0, 1, 2]] },
  N2: { name: "Nitrogen, N₂", atoms: [["N", -1, 0, 5], ["N", 1, 0, 5]], bonds: [[0, 1, 3]] },
  H2O: { name: "Water, H₂O", atoms: [["O", 0, 0, 6], ["H", -1.3, 1, 1], ["H", 1.3, 1, 1]], bonds: [[0, 1, 1], [0, 2, 1]] },
  NH3: { name: "Ammonia, NH₃", atoms: [["N", 0, 0, 5], ["H", -1.4, 0.9, 1], ["H", 1.4, 0.9, 1], ["H", 0, 1.6, 1]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
  CH4: { name: "Methane, CH₄", atoms: [["C", 0, 0, 4], ["H", -1.5, 0, 1], ["H", 1.5, 0, 1], ["H", 0, -1.5, 1], ["H", 0, 1.5, 1]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
  CO2: { name: "Carbon dioxide, CO₂", atoms: [["C", 0, 0, 4], ["O", -1.8, 0, 6], ["O", 1.8, 0, 6]], bonds: [[0, 1, 2], [0, 2, 2]] },
};
const COL = { H: "#e9ecef", O: "#ffc9c9", N: "#d0ebff", C: "#ced4da", Cl: "#d3f9d8" };
Sim({
  title: "Covalent Bonding (Dot and Cross)",
  intro: "Non-metal atoms share pairs of electrons so that each gets a full outer shell. Each shared pair is a covalent bond. Dots are electrons from one atom, crosses from the other.",
  controls: [
    { id: "mol", label: "Molecule", type: "select", options: Object.entries(MOLS).map(([k, v]) => [k, v.name]), value: "H2O" },
    { id: "view", label: "Show as", type: "select", options: [["dot", "Dot-and-cross diagram"], ["stick", "Displayed formula (lines for bonds)"]] },
  ],
  readouts: [["bonds", "Covalent bonds"], ["shared", "Shared electrons"], ["lone", "Lone pairs"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const m = MOLS[p.mol], sc = Math.min(W, H) * 0.17, cx = W / 2, cy = H / 2 - 10, R = sc * 0.62;
    const pos = m.atoms.map(([, x, y]) => [cx + x * sc, cy + y * sc]);
    if (p.view === "stick") {
      for (const [i, j, o] of m.bonds) { const [x1, y1] = pos[i], [x2, y2] = pos[j], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; for (let k = 0; k < o; k++) { const off = (k - (o - 1) / 2) * 7; Sim.line(ctx, x1 + nx * off, y1 + ny * off, x2 + nx * off, y2 + ny * off, C.text, 3); } }
      m.atoms.forEach(([sym], i) => { circle(ctx, ...pos[i], 18, "#fff"); text(ctx, sym, pos[i][0], pos[i][1] + 7, { align: "center", size: 22, weight: 700 }); });
      return;
    }
    m.atoms.forEach(([sym], i) => { circle(ctx, ...pos[i], R, COL[sym] + "88", C.text, 1.5); text(ctx, sym, pos[i][0], pos[i][1] + 7, { align: "center", size: 20, weight: 700 }); });
    const used = m.atoms.map(() => 0);
    for (const [i, j, o] of m.bonds) {
      const [x1, y1] = pos[i], [x2, y2] = pos[j], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
      for (let k = 0; k < o; k++) { const off = (k - (o - 1) / 2) * 12; text(ctx, "•", mx + nx * off - (dx / L) * 6, my + ny * off - (dy / L) * 6 + 5, { align: "center", size: 18, color: C.blue }); text(ctx, "×", mx + nx * off + (dx / L) * 6, my + ny * off + (dy / L) * 6 + 5, { align: "center", size: 14, color: C.red, weight: 700 }); }
      used[i] += o; used[j] += o;
    }
    m.atoms.forEach(([sym, , , outer], i) => {
      const lone = outer - used[i], [x, y] = pos[i], mark = i === 0 ? "•" : "×", col = i === 0 ? C.blue : C.red; // dots: first (central) atom, crosses: the others
      const bondDirs = m.bonds.filter((b) => b[0] === i || b[1] === i).map((b) => { const o = b[0] === i ? b[1] : b[0]; return Math.atan2(pos[o][1] - y, pos[o][0] - x); });
      const slots = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI / 4, (3 * Math.PI) / 4, -Math.PI / 4, (-3 * Math.PI) / 4].filter((a) => bondDirs.every((b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) > 0.6));
      for (let k = 0; k < lone; k++) { const a = slots[Math.floor(k / 2) % slots.length], off = (k % 2 ? 6 : -6); text(ctx, mark, x + Math.cos(a) * R * 0.72 - Math.sin(a) * off, y + Math.sin(a) * R * 0.72 + Math.cos(a) * off + 5, { align: "center", size: mark === "•" ? 18 : 14, color: col, weight: 700 }); }
    });
  },
  read(s, p) {
    const m = MOLS[p.mol], b = m.bonds.reduce((a, x) => a + x[2], 0), used = m.atoms.map(() => 0); m.bonds.forEach(([i, j, o]) => { used[i] += o; used[j] += o; });
    const lone = m.atoms.reduce((a, [, , , outer], i) => a + (outer - used[i]) / 2, 0);
    return { bonds: `${m.bonds.length} (${m.bonds.some((x) => x[2] === 3) ? "includes a triple bond" : m.bonds.some((x) => x[2] === 2) ? "includes double bonds" : "all single"})`, shared: String(b * 2), lone: String(lone) };
  },
  keyIdea: "<b>Key idea:</b> a single bond is one shared pair, a double bond two pairs, a triple bond three. Count the electrons around each atom: hydrogen ends up with 2, other atoms with 8 (a full outer shell).",
  tryThis: ["Count the electrons around the oxygen in water. Is its outer shell full?", "Why does nitrogen form a triple bond in N₂?", "How many lone pairs does ammonia have? How do they affect its shape?"],
});
