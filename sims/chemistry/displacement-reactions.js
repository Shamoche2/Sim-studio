const { C, text, rect } = Sim;
const ORDER = ["Mg", "Zn", "Fe", "Pb", "Cu", "Ag"];
const NAME = { Mg: "magnesium", Zn: "zinc", Fe: "iron", Pb: "lead", Cu: "copper", Ag: "silver" };
const SOL = { Mg: ["magnesium sulfate", "rgba(240,240,240,.5)"], Zn: ["zinc sulfate", "rgba(240,240,240,.5)"], Fe: ["iron(II) sulfate", "rgba(140,200,140,.5)"], Pb: ["lead(II) nitrate", "rgba(240,240,240,.5)"], Cu: ["copper(II) sulfate", "rgba(34,139,230,.55)"], Ag: ["silver nitrate", "rgba(240,240,240,.5)"] };
const MCOL = { Mg: "#e9ecef", Zn: "#adb5bd", Fe: "#868e96", Pb: "#495057", Cu: "#d9480f", Ag: "#dee2e6" };
Sim({
  title: "Displacement Reactions",
  intro: "A more reactive metal will push a less reactive metal out of a solution of its salt. Dip a strip of metal into a salt solution and see whether a coating forms.",
  controls: [
    { id: "metal", label: "Metal strip", type: "select", options: ORDER.map((m) => [m, NAME[m]]), value: "Zn" },
    { id: "sol", label: "Salt solution", type: "select", options: ORDER.map((m) => [m, SOL[m][0]]), value: "Cu" },
  ],
  readouts: [["happens", "Reaction?"], ["eq", "Word equation"], ["see", "You would see"]],
  init(s) { s.t = 0; },
  change(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(1, s.t + dt * 0.25); },
  reacts(p) { return ORDER.indexOf(p.metal) < ORDER.indexOf(p.sol); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const r = this.reacts(p), t = r ? s.t : 0, bx = W * 0.3, bw = W * 0.4, by = H * 0.25, bh = H * 0.65;
    const fade = p.sol === "Cu" ? 1 - t * 0.8 : 1;
    rect(ctx, bx, by + 30, bw, bh - 30, SOL[p.sol][1].replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * fade})`));
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const sx = bx + bw / 2 - 14; rect(ctx, sx, by - 30, 28, bh - 10, MCOL[p.metal], C.text, 2, 1.5);
    if (t > 0) { ctx.globalAlpha = t; for (let i = 0; i < 40; i++) rect(ctx, sx - 3 + (i % 2) * 28, by + 40 + ((i * 37) % (bh - 60)), 4, 6, MCOL[p.sol], null, 1); rect(ctx, sx - 2, by + 30, 32, bh - 50, MCOL[p.sol] + "aa", null, 3); ctx.globalAlpha = 1; }
    text(ctx, `${NAME[p.metal]} strip`, sx + 14, by - 40, { align: "center", weight: 700 });
    text(ctx, SOL[p.sol][0] + " solution", bx + bw / 2, by + bh + 22, { align: "center", color: C.muted });
    const ly = 30; text(ctx, "Reactivity:", W * 0.78, ly, { weight: 700, size: 12 });
    ORDER.forEach((m, i) => text(ctx, `${i + 1}. ${NAME[m]}`, W * 0.78, ly + 22 + i * 20, { size: 12, weight: m === p.metal || m === p.sol ? 700 : 400, color: m === p.metal ? C.blue : m === p.sol ? C.orange : C.muted }));
  },
  read(s, p) {
    if (p.metal === p.sol) return { happens: "no (same metal)", eq: "—", see: "nothing" };
    const r = this.reacts(p), salt = SOL[p.sol][0], newSalt = salt.replace(/^\S+/, NAME[p.metal]).replace("(II) ", " ");
    return { happens: r ? "yes" : "no", eq: r ? `${NAME[p.metal]} + ${salt} → ${newSalt} + ${NAME[p.sol]}` : "no reaction", see: r ? `a ${NAME[p.sol]} coating on the strip${p.sol === "Cu" ? "; blue colour fades" : ""}` : "nothing changes" };
  },
  keyIdea: "<b>Key idea:</b> a metal displaces any metal below it in the reactivity series from its compounds. The more reactive metal is oxidised (loses electrons) and the less reactive metal's ions are reduced (gain electrons).",
  tryThis: ["Put zinc into copper sulfate. What do you see, and why does the blue colour fade?", "Put copper into zinc sulfate. Why does nothing happen?", "Predict: will iron displace lead from lead nitrate?"],
});
