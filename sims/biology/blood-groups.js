const { C, text, rect } = Sim;
const GENO = { AA: "A (IᴬIᴬ)", AO: "A (Iᴬi)", BB: "B (IᴮIᴮ)", BO: "B (Iᴮi)", AB: "AB (IᴬIᴮ)", OO: "O (ii)" };
const type = (g) => (g.includes("A") && g.includes("B") ? "AB" : g.includes("A") ? "A" : g.includes("B") ? "B" : "O");
const COLS = { A: "#ffc9c9", B: "#d0ebff", AB: "#e5dbff", O: "#fff3bf" };
const lab = (a) => ({ A: "Iᴬ", B: "Iᴮ", O: "i" }[a]);
Sim({
  title: "Blood Groups: Codominance",
  intro: "ABO blood groups are controlled by three alleles: Iᴬ, Iᴮ and i. Iᴬ and Iᴮ are codominant (both show if present together, giving AB), and both are dominant over i. Choose the parents' genotypes to see what blood groups their children could have.",
  controls: [
    { id: "m", label: "Parent 1", type: "select", options: Object.entries(GENO), value: "AO" },
    { id: "f", label: "Parent 2", type: "select", options: Object.entries(GENO), value: "BO" },
  ],
  readouts: [["kids", "Possible children"], ["donate", "Group O can donate to"], ["receive", "Group AB can receive from"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const size = Math.min(W * 0.5, H - 60) / 3, x0 = 30, y0 = 40, a = p.m.split(""), b = p.f.split("");
    b.forEach((x, j) => { rect(ctx, x0 + size * (j + 1), y0, size, size, "#e7f5ff", C.text, 0, 1.5); text(ctx, lab(x), x0 + size * (j + 1.5), y0 + size * 0.6, { align: "center", size: 24, weight: 700 }); });
    a.forEach((x, i) => { rect(ctx, x0, y0 + size * (i + 1), size, size, "#fff4e6", C.text, 0, 1.5); text(ctx, lab(x), x0 + size / 2, y0 + size * (i + 1.6), { align: "center", size: 24, weight: 700 }); });
    a.forEach((x, i) => b.forEach((y, j) => { const g = x + y, t = type(g), cx = x0 + size * (j + 1), cy = y0 + size * (i + 1); rect(ctx, cx, cy, size, size, COLS[t], C.text, 0, 1.5); text(ctx, lab(x) + lab(y), cx + size / 2, cy + size * 0.42, { align: "center", size: 16, weight: 600 }); text(ctx, "group " + t, cx + size / 2, cy + size * 0.75, { align: "center", size: 14, weight: 800 }); }));
    // donor chart
    const gx = W * 0.62, gy = 40, cell = Math.min(46, (W - gx - 20) / 5), groups = ["O", "A", "B", "AB"];
    text(ctx, "Can donate to? (donor → row)", gx, gy - 10, { size: 12, weight: 700 });
    groups.forEach((g, j) => text(ctx, g, gx + cell * (j + 1.5), gy + 18, { align: "center", weight: 700 }));
    groups.forEach((d, i) => { text(ctx, d, gx + cell * 0.5, gy + cell * (i + 1) + 22, { align: "center", weight: 700 }); groups.forEach((r, j) => { const ok = d === "O" || d === r || r === "AB"; rect(ctx, gx + cell * (j + 1) + 2, gy + cell * (i + 1) + 2, cell - 4, cell - 4, ok ? "#d3f9d8" : "#ffe3e3", null, 4); text(ctx, ok ? "✓" : "✗", gx + cell * (j + 1.5), gy + cell * (i + 1) + 28, { align: "center", color: ok ? C.green : C.red, weight: 700 }); }); });
  },
  read(s, p) { const k = {}; for (const x of p.m) for (const y of p.f) { const t = type(x + y); k[t] = (k[t] || 0) + 25; } return { kids: Object.entries(k).map(([t, n]) => `${n}% group ${t}`).join(", "), donate: "everyone (universal donor)", receive: "everyone (universal recipient)" }; },
  keyIdea: "<b>Key idea:</b> codominance means both alleles are expressed: IᴬIᴮ gives group AB. Group O (ii) is recessive. Two parents can have a child with a blood group different from both of theirs.",
  tryThis: ["Parents with groups A (Iᴬi) and B (Iᴮi): what blood groups can their children have?", "Can two group O parents have a group A child?", "Why is group O blood so useful in emergencies?"],
});
