const { C, plot } = Sim;
const g = (x, m, w) => Math.exp(-((x - m) ** 2) / (2 * w * w));
Sim({
  title: "Hormones in the Menstrual Cycle",
  intro: "Four hormones control the roughly 28-day menstrual cycle: FSH, LH, oestrogen and progesterone. Watch how they rise and fall to release an egg and prepare the uterus lining.",
  controls: [
    { id: "day", label: "Day of the cycle", min: 1, max: 28, step: 1, value: 14 },
    { id: "pill", label: "Taking the contraceptive pill", type: "checkbox", value: false },
  ],
  readouts: [["phase", "Phase"], ["event", "What's happening"], ["lining", "Uterus lining"]],
  levels(d, pill) {
    if (pill) return { FSH: 0.15, LH: 0.1, oes: 0.5, prog: 0.6, lining: 0.5 };
    return { FSH: 0.3 + 0.4 * g(d, 3, 3) + 0.5 * g(d, 14, 1.2), LH: 0.1 + 1.0 * g(d, 14, 1.2), oes: 0.15 + 0.8 * g(d, 12.5, 2.5) + 0.35 * g(d, 21, 3), prog: 0.05 + 0.85 * g(d, 21, 3.2), lining: d <= 5 ? 0.25 - d * 0.03 : Math.min(1, 0.1 + (d - 5) * 0.05) };
  },
  draw({ ctx, W, H }, s, p) {
    const days = Array.from({ length: 113 }, (_, i) => 1 + i * 0.24), L = (k) => days.map((d) => [d, this.levels(d, p.pill)[k]]);
    const top = H * 0.68;
    plot(ctx, { x: 0, y: 0, w: W, h: top }, { title: "Hormone levels", xmin: 1, xmax: 28, ymin: 0, ymax: 1.25, xstep: 7, ystep: 5, xlabel: "day", ylabel: "level", series: [{ data: L("FSH"), color: C.blue, label: "FSH" }, { data: L("LH"), color: C.red, label: "LH" }, { data: L("oes"), color: C.purple, label: "oestrogen" }, { data: L("prog"), color: C.green, label: "progesterone" }], vlines: [{ x: p.day, color: C.text }, ...(!p.pill ? [{ x: 14, color: C.orange, label: "ovulation" }] : [])] });
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { title: "Uterus lining thickness", xmin: 1, xmax: 28, ymin: 0, ymax: 1.1, xstep: 7, ystep: 5, xlabel: "day", series: [{ data: L("lining"), color: "#c2255c", width: 4 }], vlines: [{ x: p.day, color: C.text }] });
  },
  read(s, p) {
    if (p.pill) return { phase: "no ovulation", event: "the pill keeps FSH and LH low, so no egg matures or is released", lining: "stays thin-to-moderate" };
    const d = p.day;
    const phase = d <= 5 ? "menstruation (period)" : d < 14 ? "follicular phase" : d === 14 ? "ovulation" : "luteal phase";
    const event = d <= 5 ? "the uterus lining breaks down and is lost" : d < 14 ? "FSH makes an egg mature; oestrogen rebuilds the lining" : d === 14 ? "an LH surge releases the egg from the ovary" : "progesterone keeps the lining thick, ready for a fertilised egg";
    return { phase, event, lining: d <= 5 ? "breaking down" : d < 14 ? "thickening" : "thick, maintained" };
  },
  keyIdea: "<b>Key idea:</b> FSH (pituitary) makes an egg mature and triggers oestrogen. Oestrogen rebuilds the lining and triggers an LH surge, which causes ovulation around day 14. Progesterone maintains the lining; if it falls, menstruation starts.",
  tryThis: ["Which hormone peaks just before ovulation?", "What happens to progesterone at the end of the cycle, and what does that cause?", "Tick 'contraceptive pill'. Why does no ovulation happen?"],
  note: "Typical 28-day cycle; real cycles vary.",
});
