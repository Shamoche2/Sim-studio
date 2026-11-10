const { C, text, rect, circle, line } = Sim;
const STAGES = [["Start", "A body cell with 2 pairs of chromosomes (one of each pair from each parent)."], ["DNA copied", "Each chromosome is copied, making X shapes."], ["Pairs line up", "Matching pairs line up together. They can swap sections (crossing over)."], ["First division", "Pairs separate into two cells. Which way each pair goes is random."], ["Second division", "The copies separate again, making four cells."], ["Four gametes", "Four genetically different sex cells, each with half the chromosomes."]];
const COL = [["#e03131", "#ff8787"], ["#1c7ed6", "#74c0fc"]];
Sim({
  title: "Meiosis: Making Sex Cells",
  intro: "Meiosis makes gametes (sperm and egg cells) with half the normal number of chromosomes. It also shuffles genes, so every gamete is genetically different. Step through the stages, and press 'Shuffle' to see a different random outcome.",
  controls: [{ id: "stage", label: "Stage", min: 0, max: 5, step: 1, value: 0, format: (v) => STAGES[v][0] }, { id: "cross", label: "Show crossing over", type: "checkbox", value: true }],
  buttons: [{ label: "Shuffle (random assortment)", click(s) { s.flip = [Math.random() < 0.5, Math.random() < 0.5]; } }],
  readouts: [["what", "What happens"], ["n", "Chromosomes per cell"]],
  init(s) { s.flip = [false, true]; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const st = p.stage;
    const chrom = (x, y, len, col, dbl, col2) => { if (dbl) { line(ctx, x - 4, y - len / 2, x - 4, y + len / 2, col, 6); line(ctx, x + 4, y - len / 2, x + 4, y + len / 2, col2 || col, 6); circle(ctx, x, y, 3, C.text); } else line(ctx, x, y - len / 2, x, y + len / 2, col, 6); };
    const cell = (x, y, r) => circle(ctx, x, y, r, "#fff4e6", "#e8590c", 2);
    const pairs = [[0, 46], [1, 30]];
    if (st <= 2) {
      const cx = W / 2, cy = H / 2; cell(cx, cy, Math.min(W, H) * 0.36);
      pairs.forEach(([k, len], i) => {
        const dbl = st >= 1, x0 = cx - 60 + i * 80;
        if (st < 2) { chrom(x0, cy - 40 + i * 20, len, COL[k][0], dbl); chrom(x0 + 34, cy + 30 - i * 10, len, COL[k][1], dbl); }
        else { chrom(cx - 26, cy - 50 + i * 90, len, COL[k][0], true, p.cross && i === 0 ? COL[k][1] : null); chrom(cx + 26, cy - 50 + i * 90, len, COL[k][1], true, p.cross && i === 0 ? COL[k][0] : null); }
      });
      if (st === 2) line(ctx, W / 2, H * 0.18, W / 2, H * 0.82, "#ced4da", 1.5, [5, 5]);
    } else {
      const cells = st === 3 ? 2 : 4, r = Math.min(W / (cells * 2.4), H * 0.3);
      for (let c = 0; c < cells; c++) {
        const cx = (W / cells) * (c + 0.5), cy = H / 2, half = st === 3 ? c : Math.floor(c / 2); cell(cx, cy, r);
        pairs.forEach(([k, len], i) => {
          const side = s.flip[i] ? 1 - half : half, col = COL[k][side], other = p.cross && i === 0 ? COL[k][1 - side] : col;
          if (st === 3) chrom(cx - 16 + i * 32, cy, len, col, true, other);
          else chrom(cx - 12 + i * 24, cy, len, c % 2 === 0 ? col : other, false);
        });
      }
    }
    text(ctx, STAGES[st][0], 14, 26, { weight: 700, size: 18 });
  },
  read(s, p) { return { what: STAGES[p.stage][1], n: p.stage >= 3 && p.stage < 5 ? (p.stage === 3 ? "2 (each copied)" : "2") : p.stage === 5 ? "2 (half of 4)" : "4 (2 pairs)" }; },
  keyIdea: "<b>Key idea:</b> meiosis has two divisions and makes four genetically different cells with half the chromosome number (23 in humans). Fertilisation restores the full number (46). Random assortment and crossing over create variation.",
  tryThis: ["Count the chromosomes at the start and in each gamete.", "Press 'Shuffle' several times. How many different combinations of chromosomes can a gamete get here?", "Compare with mitosis: how many cells are made, and are they identical?"],
});
