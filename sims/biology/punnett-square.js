const { C, text, rect, circle } = Sim;
const TRAITS = {
  pea: { name: "Pea flower colour", dom: "P", rec: "p", domTrait: "Purple", recTrait: "White", dc: C.purple, rc: "#f8f9fa" },
  seed: { name: "Pea seed shape", dom: "R", rec: "r", domTrait: "Round", recTrait: "Wrinkled", dc: "#94d82d", rc: "#d8f5a2" },
  cf: { name: "Cystic fibrosis (human)", dom: "F", rec: "f", domTrait: "Unaffected", recTrait: "Has cystic fibrosis", dc: C.green, rc: C.red },
};
Sim({
  title: "Genetic Crosses (Punnett Squares)",
  intro: "Each parent passes on one of their two alleles to each child. A Punnett square shows all the possible combinations and how likely each one is. Dominant alleles hide recessive ones.",
  controls: [
    { id: "trait", label: "Trait", type: "select", options: Object.entries(TRAITS).map(([k, v]) => [k, v.name]) },
    { id: "p1", label: "Parent 1 genotype", type: "select", options: [["DD", "Homozygous dominant"], ["Dd", "Heterozygous"], ["dd", "Homozygous recessive"]], value: "Dd" },
    { id: "p2", label: "Parent 2 genotype", type: "select", options: [["DD", "Homozygous dominant"], ["Dd", "Heterozygous"], ["dd", "Homozygous recessive"]], value: "Dd" },
  ],
  buttons: [{ label: "Breed 100 offspring", primary: true, click(s, p) { s.kids = Array.from({ length: 100 }, () => p.p1[Math.random() < 0.5 ? 0 : 1] + p.p2[Math.random() < 0.5 ? 0 : 1]); } }],
  readouts: [["ratio", "Expected phenotype ratio"], ["geno", "Expected genotypes"], ["obs", "Observed (100 offspring)"]],
  init(s) { s.kids = []; },
  change(s) { s.kids = []; },
  g(tr, gt) { return gt.split("").map((c) => (c === "D" ? tr.dom : tr.rec)).sort().join(""); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const tr = TRAITS[p.trait], size = Math.min(W * 0.45, H - 60) / 3, x0 = 30, y0 = 40;
    text(ctx, "Parent 2 →", x0 + size * 1.5, y0 - 18, { align: "center", color: C.muted, size: 12 });
    text(ctx, "Parent 1 ↓", x0 - 4, y0 + size * 0.5 + 4, { color: C.muted, size: 12, align: "left" });
    const a1 = p.p1.split(""), a2 = p.p2.split("");
    a2.forEach((a, j) => { rect(ctx, x0 + size * (j + 1), y0, size, size, "#e7f5ff", C.text, 0, 1.5); text(ctx, a === "D" ? tr.dom : tr.rec, x0 + size * (j + 1.5), y0 + size * 0.6, { align: "center", size: 26, weight: 700 }); });
    a1.forEach((a, i) => { rect(ctx, x0, y0 + size * (i + 1), size, size, "#fff4e6", C.text, 0, 1.5); text(ctx, a === "D" ? tr.dom : tr.rec, x0 + size * 0.5, y0 + size * (i + 1.6), { align: "center", size: 26, weight: 700 }); });
    a1.forEach((x, i) => a2.forEach((y, j) => {
      const gt = x + y, dom = gt.includes("D"), cx = x0 + size * (j + 1), cy = y0 + size * (i + 1);
      rect(ctx, cx, cy, size, size, "#fff", C.text, 0, 1.5);
      circle(ctx, cx + size / 2, cy + size * 0.38, size * 0.18, dom ? tr.dc : tr.rc, C.text, 1);
      text(ctx, this.g(tr, gt), cx + size / 2, cy + size * 0.82, { align: "center", size: 18, weight: 700 });
    }));
    // offspring
    const ox = W * 0.55, cols = 10, cell = Math.min((W - ox - 10) / cols, (H - 50) / 10);
    text(ctx, s.kids.length ? "100 offspring:" : "Press “Breed 100 offspring”", ox, 28, { weight: 600 });
    s.kids.forEach((k, i) => circle(ctx, ox + (i % cols) * cell + cell / 2, 40 + Math.floor(i / cols) * cell + cell / 2, cell * 0.36, k.includes("D") ? tr.dc : tr.rc, C.text, 1));
  },
  read(s, p) {
    const tr = TRAITS[p.trait], combos = []; for (const x of p.p1) for (const y of p.p2) combos.push(x + y);
    const nd = combos.filter((c) => c.includes("D")).length, counts = {};
    combos.forEach((c) => { const g = this.g(tr, c); counts[g] = (counts[g] || 0) + 1; });
    const od = s.kids.filter((k) => k.includes("D")).length;
    return { ratio: `${nd} ${tr.domTrait} : ${4 - nd} ${tr.recTrait}`, geno: Object.entries(counts).map(([g, n]) => `${n}/4 ${g}`).join(", "), obs: s.kids.length ? `${od} ${tr.domTrait}, ${100 - od} ${tr.recTrait}` : "—" };
  },
  keyIdea: "<b>Key idea:</b> a heterozygous × heterozygous cross (Aa × Aa) gives a 3 : 1 ratio of dominant to recessive phenotypes, and a 1 : 2 : 1 ratio of genotypes. Real offspring numbers vary by chance.",
  tryThis: ["Cross two heterozygous parents. What fraction of offspring show the recessive trait?", "Two parents without cystic fibrosis have a child with it. What must their genotypes be?", "Breed 100 offspring several times. Do you always get exactly 75 : 25? Why not?"],
});
