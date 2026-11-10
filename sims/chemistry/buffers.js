const { C, text, rect, plot } = Sim;
Sim({
  title: "Buffer Solutions",
  intro: "A buffer resists changes in pH when small amounts of acid or alkali are added. Compare adding acid to pure water and to an ethanoic acid / sodium ethanoate buffer.",
  controls: [
    { id: "add", label: "Acid (+) or alkali (−) added", min: -10, max: 10, step: 0.5, value: 0, unit: "mmol", digits: 1 },
    { id: "ratio", label: "Buffer ratio [salt] : [acid]", min: 0.1, max: 10, step: 0.1, value: 1, digits: 1 },
  ],
  readouts: [["water", "pH of 100 cm³ water"], ["buffer", "pH of 100 cm³ buffer"]],
  pHwater(add) { const V = 0.1, c = add / 1000 / V; if (Math.abs(c) < 1e-7) return 7; return c > 0 ? -Math.log10(c) : 14 + Math.log10(-c); },
  pHbuf(p, add) { const tot = 20, HA0 = tot / (1 + p.ratio), A0 = tot - HA0, HA = HA0 + add, A = A0 - add; if (A <= 0.01) return this.pHwater(add - A0) ; if (HA <= 0.01) return Math.min(13, this.pHwater(add + HA0)); return 4.76 + Math.log10(A / HA); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const xs = Array.from({ length: 81 }, (_, i) => -10 + i * 0.25);
    plot(ctx, { x: 0, y: 0, w: W, h: H }, { title: "pH as acid or alkali is added", xmin: -10, xmax: 10, ymin: 0, ymax: 14, ystep: 2, xlabel: "← alkali added (mmol)      acid added (mmol) →", ylabel: "pH", series: [{ data: xs.map((a) => [a, this.pHwater(a)]), color: C.gray, label: "pure water" }, { data: xs.map((a) => [a, this.pHbuf(p, a)]), color: C.blue, label: "buffer" }], vlines: [{ x: 0, color: "#dee2e6" }], marks: [{ x: p.add, y: this.pHwater(p.add), color: C.gray }, { x: p.add, y: this.pHbuf(p, p.add), color: C.blue }] });
  },
  read(s, p) { return { water: this.pHwater(p.add).toFixed(2), buffer: this.pHbuf(p, p.add).toFixed(2) }; },
  keyIdea: "<b>Key idea:</b> a buffer contains a weak acid and its salt. Added H⁺ reacts with the salt's A⁻ ions; added OH⁻ reacts with the weak acid HA. pH = pKₐ + log([A⁻]/[HA]). Blood is buffered at pH 7.4.",
  tryThis: ["Add 2 mmol of acid. How much does the pH of water change? And the buffer?", "Change the ratio to 10. What is the buffer's pH now?", "Keep adding acid. At what point does the buffer stop working?"],
  note: "Buffer: 20 mmol in total of ethanoic acid (pKₐ 4.76) and sodium ethanoate, in 100 cm³.",
});
