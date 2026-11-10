const { C, text, rect, circle } = Sim;
const MUM = { XX: "Normal vision (XᴺXᴺ)", Xx: "Carrier (XᴺXⁿ)", xx: "Colour blind (XⁿXⁿ)" }, DAD = { XY: "Normal vision (XᴺY)", xY: "Colour blind (XⁿY)" };
const lab = (a) => (a === "X" ? "Xᴺ" : a === "x" ? "Xⁿ" : "Y");
Sim({
  title: "Sex-Linked Inheritance: Colour Blindness",
  intro: "The gene for red-green colour vision is on the X chromosome. Females have two X chromosomes; males have one X and one Y. So a recessive allele on the X shows up much more often in boys.",
  controls: [
    { id: "mum", label: "Mother", type: "select", options: Object.entries(MUM), value: "Xx" },
    { id: "dad", label: "Father", type: "select", options: Object.entries(DAD), value: "XY" },
  ],
  readouts: [["daughters", "Daughters"], ["sons", "Sons"]],
  kids(p) { const out = []; for (const m of p.mum) for (const d of [p.dad[0], "Y"]) out.push(d === "Y" ? m + "Y" : [m, d].sort().join("")); return out; },
  pheno(g) { if (g.includes("Y")) return g[0] === "x" ? "colour blind" : "normal"; return g === "xx" ? "colour blind" : g.includes("x") ? "carrier" : "normal"; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const size = Math.min(W * 0.5, H - 60) / 3, x0 = 30, y0 = 40, ma = p.mum.split(""), da = [p.dad[0], "Y"];
    text(ctx, "Father's gametes →", x0 + size * 1.5, y0 - 14, { align: "center", size: 12, color: C.muted });
    da.forEach((a, j) => { rect(ctx, x0 + size * (j + 1), y0, size, size, "#e7f5ff", C.text, 0, 1.5); text(ctx, lab(a), x0 + size * (j + 1.5), y0 + size * 0.6, { align: "center", size: 24, weight: 700 }); });
    ma.forEach((a, i) => { rect(ctx, x0, y0 + size * (i + 1), size, size, "#fff0f6", C.text, 0, 1.5); text(ctx, lab(a), x0 + size / 2, y0 + size * (i + 1.6), { align: "center", size: 24, weight: 700 }); });
    ma.forEach((m, i) => da.forEach((d, j) => {
      const g = d === "Y" ? m + "Y" : [m, d].sort().join(""), ph = this.pheno(g), x = x0 + size * (j + 1), y = y0 + size * (i + 1);
      rect(ctx, x, y, size, size, ph === "colour blind" ? "#ffe3e3" : ph === "carrier" ? "#fff3bf" : "#fff", C.text, 0, 1.5);
      text(ctx, g.split("").map(lab).join(""), x + size / 2, y + size * 0.45, { align: "center", size: 17, weight: 700 });
      text(ctx, (d === "Y" ? "boy, " : "girl, ") + ph, x + size / 2, y + size * 0.75, { align: "center", size: 11 });
    }));
    // colour vision test plate
    const cx = W * 0.8, cy = H * 0.45, R = Math.min(W * 0.17, H * 0.35);
    let seed = 9; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * R, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, inNum = Math.abs(x - cx) < R * 0.3 && Math.abs(y - cy) < R * 0.5 && !(Math.abs(x - cx) < R * 0.12 && y - cy > -R * 0.2 && y - cy < R * 0.2); circle(ctx, x, y, 3 + rnd() * 3, inNum ? "#e8590c" : "#82c91e"); }
    text(ctx, "A colour test plate (people with normal vision see a shape)", cx, cy + R + 22, { align: "center", size: 11, color: C.muted });
  },
  read(s, p) {
    const k = this.kids(p), girls = k.filter((g) => !g.includes("Y")).map((g) => this.pheno(g)), boys = k.filter((g) => g.includes("Y")).map((g) => this.pheno(g));
    const sum = (arr) => { const c = {}; arr.forEach((x) => (c[x] = (c[x] || 0) + 1)); return Object.entries(c).map(([k2, n]) => `${(100 * n) / arr.length}% ${k2}`).join(", "); };
    return { daughters: sum(girls), sons: sum(boys) };
  },
  keyIdea: "<b>Key idea:</b> boys get their only X from their mother, so a son of a carrier mother has a 50% chance of being colour blind. A girl needs two copies of the recessive allele to be colour blind, which is much rarer.",
  tryThis: ["A carrier mother and a father with normal vision: what chance does a son have of being colour blind? A daughter?", "Can a colour-blind father pass colour blindness to his son? Why not?", "What parents would be needed to have a colour-blind daughter?"],
});
