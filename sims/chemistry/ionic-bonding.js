const { C, text, rect, circle, arrow } = Sim;
// [metal, metal outer electrons, metal shells, non-metal, non-metal outer electrons, non-metal shells, metal atoms, non-metal atoms]
const PAIRS = {
  NaCl: ["Na", 1, [2, 8, 1], "Cl", 7, [2, 8, 7], 1, 1],
  MgO: ["Mg", 2, [2, 8, 2], "O", 6, [2, 6], 1, 1],
  LiF: ["Li", 1, [2, 1], "F", 7, [2, 7], 1, 1],
  MgCl2: ["Mg", 2, [2, 8, 2], "Cl", 7, [2, 8, 7], 1, 2],
  Na2O: ["Na", 1, [2, 8, 1], "O", 6, [2, 6], 2, 1],
  CaF2: ["Ca", 2, [2, 8, 8, 2], "F", 7, [2, 7], 1, 2],
};
const NAMES = { NaCl: "Sodium chloride", MgO: "Magnesium oxide", LiF: "Lithium fluoride", MgCl2: "Magnesium chloride", Na2O: "Sodium oxide", CaF2: "Calcium fluoride" };
const SUB = (n) => (n > 1 ? String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]) : "");
Sim({
  title: "Ionic Bonding",
  intro: "Metal atoms give away their outer electrons to non-metal atoms. Both end up with full outer shells, becoming oppositely charged ions that attract each other strongly.",
  controls: [{ id: "pair", label: "Compound", type: "select", options: Object.keys(PAIRS).map((k) => [k, NAMES[k]]) }],
  buttons: [{ label: "Transfer electrons", primary: true, click(s) { s.go = true; } }],
  readouts: [["formula", "Formula"], ["mi", "Metal ion"], ["ni", "Non-metal ion"], ["e", "Electrons moved"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.go = false; },
  step(s, p, dt) { if (s.go) s.t = Math.min(1, s.t + dt * 0.5); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const [m, me, msh, n, ne, nsh, mc, nc] = PAIRS[p.pair];
    const atoms = [...Array(mc).fill("m"), ...Array(nc).fill("n")], N = atoms.length, slot = W / N;
    const shellR = (i) => 22 + i * 17, centers = atoms.map((_, i) => ({ x: slot * (i + 0.5), y: H / 2 - 10 }));
    const moved = s.t; // 0..1 progress
    // which non-metal receives which metal electrons
    const nIdx = atoms.map((a, i) => (a === "n" ? i : -1)).filter((i) => i >= 0), mIdx = atoms.map((a, i) => (a === "m" ? i : -1)).filter((i) => i >= 0);
    const transfers = []; let k = 0;
    for (const mi of mIdx) for (let e = 0; e < me; e++) transfers.push({ from: mi, to: nIdx[k++ % nIdx.length], e });
    atoms.forEach((a, i) => {
      const sh = a === "m" ? msh : nsh, c = centers[i], done = moved >= 1;
      const shells = sh.slice(); if (done) { if (a === "m") shells.pop(); }
      circle(ctx, c.x, c.y, 16, a === "m" ? "#ffd8a8" : "#b2f2bb", C.text, 1.5);
      text(ctx, a === "m" ? m : n, c.x, c.y + 5, { align: "center", weight: 700 });
      shells.forEach((cnt, si) => {
        circle(ctx, c.x, c.y, shellR(si), null, "#ced4da", 1.2);
        let count = cnt; if (a === "n" && si === shells.length - 1 && done) count = 8;
        const outerMetal = a === "m" && si === sh.length - 1;
        for (let e = 0; e < count; e++) {
          if (outerMetal && moved > 0) continue;
          const ang = (e / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
          const received = a === "n" && done && si === shells.length - 1 && e >= ne;
          circle(ctx, c.x + Math.cos(ang) * shellR(si), c.y + Math.sin(ang) * shellR(si), 4.5, received ? C.orange : C.blue);
        }
      });
      if (done) { const ch = a === "m" ? me : 8 - ne; text(ctx, `[${a === "m" ? m : n}]${ch > 1 ? ch : ""}${a === "m" ? "+" : "−"}`, c.x, c.y + shellR(shells.length - 1) + 26, { align: "center", weight: 700, size: 16, color: a === "m" ? C.red : C.blue }); }
    });
    if (moved > 0 && moved < 1) for (const tr of transfers) {
      const a = centers[tr.from], b = centers[tr.to], r = shellR(msh.length - 1), ang = (tr.e / me) * Math.PI * 2;
      const sx = a.x + Math.cos(ang) * r, sy = a.y + Math.sin(ang) * r, ex = b.x, ey = b.y - shellR(nsh.length - 1);
      circle(ctx, Sim.lerp(sx, ex, moved), Sim.lerp(sy, ey, moved) - Math.sin(moved * Math.PI) * 40, 5, C.orange);
    }
    if (moved === 0) text(ctx, "Press “Transfer electrons”", W / 2, 26, { align: "center", color: C.muted });
    if (moved >= 1) text(ctx, "Opposite charges attract: an ionic bond", W / 2, 26, { align: "center", weight: 700 });
  },
  read(s, p) {
    const [m, me, , n, ne, , mc, nc] = PAIRS[p.pair];
    return { formula: m + SUB(mc) + n + SUB(nc), mi: `${m}${me > 1 ? me : ""}+ (lost ${me})`, ni: `${n}${8 - ne > 1 ? 8 - ne : ""}− (gained ${8 - ne})`, e: String(mc * me) };
  },
  keyIdea: "<b>Key idea:</b> metals lose electrons to form positive ions; non-metals gain electrons to form negative ions. The charges in the formula must add up to zero, e.g. Mg²⁺ + 2 Cl⁻ → MgCl₂.",
  tryThis: ["Why does magnesium chloride need two chlorine atoms but magnesium oxide only one oxygen?", "Count the electrons in the outer shell of each ion after transfer.", "Predict the formula of calcium oxide before checking with the pattern."],
  note: "Orange electrons came from the metal. Only outer-shell transfer is shown in motion.",
});
