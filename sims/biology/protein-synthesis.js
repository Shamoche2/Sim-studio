const { C, text, rect, circle } = Sim;
const CODE = { UUU: "Phe", UUC: "Phe", UUA: "Leu", UUG: "Leu", CUU: "Leu", CUC: "Leu", CUA: "Leu", CUG: "Leu", AUU: "Ile", AUC: "Ile", AUA: "Ile", AUG: "Met", GUU: "Val", GUC: "Val", GUA: "Val", GUG: "Val", UCU: "Ser", UCC: "Ser", UCA: "Ser", UCG: "Ser", CCU: "Pro", CCC: "Pro", CCA: "Pro", CCG: "Pro", ACU: "Thr", ACC: "Thr", ACA: "Thr", ACG: "Thr", GCU: "Ala", GCC: "Ala", GCA: "Ala", GCG: "Ala", UAU: "Tyr", UAC: "Tyr", UAA: "STOP", UAG: "STOP", CAU: "His", CAC: "His", CAA: "Gln", CAG: "Gln", AAU: "Asn", AAC: "Asn", AAA: "Lys", AAG: "Lys", GAU: "Asp", GAC: "Asp", GAA: "Glu", GAG: "Glu", UGU: "Cys", UGC: "Cys", UGA: "STOP", UGG: "Trp", CGU: "Arg", CGC: "Arg", CGA: "Arg", CGG: "Arg", AGU: "Ser", AGC: "Ser", AGA: "Arg", AGG: "Arg", GGU: "Gly", GGC: "Gly", GGA: "Gly", GGG: "Gly" };
const GENES = { a: "TACAAACCGTTTCGGATT", b: "TACGGTCTCATGCTTACT", c: "TACCTTGGACGAAAAATC" };
const BASE_COL = { A: C.red, T: C.yellow, U: C.orange, G: C.green, C: C.blue };
const COMP = { A: "U", T: "A", G: "C", C: "G" };
Sim({
  title: "Protein Synthesis: DNA → RNA → Protein",
  intro: "A gene's DNA code is copied into messenger RNA (transcription). A ribosome reads the mRNA three bases at a time (codons) and joins amino acids into a protein (translation). Try a mutation to see its effect.",
  controls: [
    { id: "gene", label: "Gene (template DNA strand)", type: "select", options: Object.entries(GENES).map(([k, v]) => [k, `Gene ${k.toUpperCase()}: ${v.slice(0, 9)}…`]) },
    { id: "mutPos", label: "Mutate base number", min: 0, max: 18, step: 1, value: 0, format: (v) => (v === 0 ? "no mutation" : `#${v}`) },
    { id: "mutTo", label: "Change it to", type: "select", options: [["A", "A"], ["T", "T"], ["G", "G"], ["C", "C"], ["del", "Delete it"]] },
  ],
  readouts: [["mrna", "mRNA"], ["protein", "Amino acids"], ["effect", "Effect of mutation"]],
  init(s) { s.t = 0; },
  autoplay: true,
  step(s, p, dt) { s.t = (s.t + dt * 0.25) % 2.4; },
  dna(p) { let d = GENES[p.gene].split(""); if (p.mutPos > 0) { const i = p.mutPos - 1; if (p.mutTo === "del") d.splice(i, 1); else d[i] = p.mutTo; } return d.join(""); },
  translate(dna) { const m = dna.split("").map((b) => COMP[b]).join(""), aa = []; for (let i = 0; i + 3 <= m.length; i += 3) { const a = CODE[m.slice(i, i + 3)]; aa.push(a); if (a === "STOP") break; } return { m, aa }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const dna = this.dna(p), { m, aa } = this.translate(dna), n = dna.length, cell = Math.min(36, (W - 40) / 18), x0 = (W - cell * 18) / 2;
    const prog = Math.min(1, s.t / 1), tprog = Math.max(0, Math.min(1, (s.t - 1) / 1.2));
    text(ctx, "DNA template", 10, 30, { weight: 700, size: 12 });
    dna.split("").forEach((b, i) => { const mut = p.mutPos > 0 && i === p.mutPos - 1 && p.mutTo !== "del"; rect(ctx, x0 + i * cell + 2, 40, cell - 4, cell - 4, BASE_COL[b], mut ? C.text : null, 4, 3); text(ctx, b, x0 + i * cell + cell / 2, 40 + cell / 2 + 5, { align: "center", color: "#fff", weight: 700 }); });
    text(ctx, "mRNA", 10, 40 + cell + 30, { weight: 700, size: 12 });
    const shown = Math.floor(prog * n);
    m.split("").forEach((b, i) => { if (i >= shown) return; rect(ctx, x0 + i * cell + 2, 50 + cell + 6, cell - 4, cell - 4, BASE_COL[b], null, 4); text(ctx, b, x0 + i * cell + cell / 2, 50 + cell + 6 + cell / 2 + 5, { align: "center", color: "#fff", weight: 700 }); });
    for (let c = 0; c <= n / 3; c++) Sim.line(ctx, x0 + c * 3 * cell, 50 + cell + 2, x0 + c * 3 * cell, 50 + 2 * cell + 6, C.gray, 1);
    // ribosome + chain
    if (tprog > 0) {
      const codons = Math.ceil(tprog * aa.length), ry = 60 + 2 * cell;
      const rx = x0 + Math.min(codons, aa.length) * 3 * cell - 1.5 * cell;
      rect(ctx, rx - 1.6 * cell, ry - cell * 0.2, 3.2 * cell, cell * 1.3, "rgba(132,94,247,.25)", C.purple, cell * 0.6, 2);
      text(ctx, "ribosome", rx, ry + cell * 1.5, { align: "center", size: 11, color: C.purple });
      const ay = H - 50;
      text(ctx, "Protein chain", 10, ay - 30, { weight: 700, size: 12 });
      aa.slice(0, codons).forEach((a, i) => { const x = x0 + i * 3 * cell + 1.5 * cell; if (i) Sim.line(ctx, x - 3 * cell + 22, ay, x - 22, ay, C.text, 2); circle(ctx, x, ay, 22, a === "STOP" ? C.light : `hsl(${(a.charCodeAt(0) * 37 + a.charCodeAt(1) * 11) % 360},60%,72%)`, C.text, 1.5); text(ctx, a, x, ay + 4, { align: "center", size: 11, weight: 700 }); });
    }
  },
  read(s, p) {
    const orig = this.translate(GENES[p.gene]).aa, now = this.translate(this.dna(p));
    let effect = "none";
    if (p.mutPos > 0) {
      if (p.mutTo === "del") effect = "frameshift: every codon after it changes";
      else if (now.aa.join() === orig.join()) effect = "silent: same protein (code is redundant)";
      else if (now.aa.indexOf("STOP") < orig.indexOf("STOP") && now.aa.includes("STOP") && now.aa.length < orig.length) effect = "nonsense: protein stops early";
      else effect = "missense: one amino acid changed";
    }
    return { mrna: now.m.match(/.{1,3}/g).join(" "), protein: now.aa.join("–"), effect };
  },
  keyIdea: "<b>Key idea:</b> DNA → mRNA by base pairing (A→U, T→A, G→C, C→G). Each 3-base codon codes for one amino acid. AUG starts the protein; UAA, UAG and UGA stop it.",
  tryThis: ["Find the start codon in each mRNA. Which amino acid does it code for?", "Change one base. Can you find a mutation that doesn't change the protein (a silent mutation)?", "Delete a base. Why does a deletion usually do more damage than a substitution?"],
});
