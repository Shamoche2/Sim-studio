const { C, text, rect } = Sim;
const STEPS = ["Boil in water (1 min)", "Boil in ethanol in a water bath", "Rinse in warm water", "Add iodine solution"];
const EXP = {
  normal: ["Leaf from a plant kept in light", (x, y) => true],
  dark: ["Leaf from a plant kept in the dark for 48 h (destarched)", () => false],
  variegated: ["Variegated leaf (green and white parts)", (x, y) => !(Math.abs(x) > 0.55 || Math.abs(y) > 0.7)],
  foil: ["Destarched leaf partly covered with foil, then lit", (x, y) => !(x > -0.25 && x < 0.25)],
  noco2: ["Destarched plant kept in light with soda lime (no CO₂)", () => false],
};
Lab({
  title: "Virtual Lab: Testing a Leaf for Starch",
  aim: "Show that light, chlorophyll and carbon dioxide are needed for photosynthesis, by testing leaves for starch.",
  equipment: ["Leaves from plants given different treatments", "Beaker of boiling water", "Boiling tube of ethanol", "Water bath (no flames)", "White tile", "Iodine solution", "Forceps"],
  safety: ["Ethanol is highly flammable: heat it in a water bath, never over a flame.", "Wear eye protection.", "Use forceps to handle hot leaves."],
  method: [
    "Choose a <b>Leaf</b>.",
    "Press <b>Next step</b> to boil it in water. This kills the cells and breaks the membranes.",
    "Press <b>Next step</b> to boil it in ethanol. This removes the green chlorophyll so colour changes can be seen.",
    "Press <b>Next step</b> to rinse it (softens the leaf), then <b>Next step</b> to add iodine.",
    "Blue-black parts contain starch, so photosynthesis happened there. Press <b>Record result</b>.",
  ],
  controls: [{ id: "leaf", label: "Leaf", type: "select", options: Object.entries(EXP).map(([k, v]) => [k, v[0]]) }],
  buttons: [{ label: "Next step", click(s) { if (s.k < 4) { s.k++; s.t = 0; } } }],
  readouts: [["stage", "Stage"], ["res", "Result"]],
  resetOnChange: true,
  init(s) { s.k = 0; s.t = 0; },
  step(s, p, dt) { s.t = Math.min(1, s.t + dt * 0.8); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, s.k >= 4 ? "#fff" : "#f8f9fa");
    const cx = W * 0.38, cy = H * 0.5, rx = W * 0.22, ry = H * 0.36, test = EXP[p.leaf][1];
    const green = s.k < 2 ? 1 : s.k === 2 ? 1 - s.t : 0;
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.clip();
    const n = 26;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = -1 + (2 * i + 1) / n, y = -1 + (2 * j + 1) / n;
      const varieg = p.leaf === "variegated" && !test(x, y);
      let col = varieg ? `rgb(${240},${245},${230})` : `rgb(${Math.round(60 + (1 - green) * 180)},${Math.round(150 + (1 - green) * 80)},${Math.round(60 + (1 - green) * 150)})`;
      if (s.k >= 4) col = test(x, y) && p.leaf !== "dark" && p.leaf !== "noco2" ? (s.t > 0.5 ? "#1f1d3d" : "#7a5a8c") : "#e8a33b";
      ctx.fillStyle = col; ctx.fillRect(cx + x * rx - rx / n, cy + y * ry - ry / n, (2 * rx) / n + 1, (2 * ry) / n + 1);
    }
    ctx.restore(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
    if (p.leaf === "foil" && s.k === 0) rect(ctx, cx - rx * 0.25, cy - ry - 6, rx * 0.5, 2 * ry + 12, "rgba(173,181,189,.9)", "#868e96", 2, 1);
    const lx = W * 0.68; STEPS.forEach((st, i) => text(ctx, `${i < s.k ? "✔" : i === s.k ? "▶" : "•"} ${st}`, lx, H * 0.25 + i * 30, { weight: i === s.k - 1 ? 800 : 400, color: i < s.k ? C.green : C.text, size: 13 }));
    text(ctx, EXP[p.leaf][0], lx, H * 0.25 + 140, { size: 12, color: C.muted, maxWidth: W * 0.3 });
  },
  outcome(p) { return { normal: "whole leaf blue-black: starch present", dark: "stays orange-brown: no starch", variegated: "green parts blue-black, white parts orange-brown", foil: "covered strip orange-brown, rest blue-black", noco2: "stays orange-brown: no starch" }[p.leaf]; },
  read(s, p) { return { stage: s.k ? STEPS[s.k - 1] : "fresh leaf", res: s.k >= 4 ? this.outcome(p) : "—" }; },
  record(s, p) { if (s.k < 4) return "Finish all four steps first."; const need = { normal: "—", dark: "light (and starch store removed)", variegated: "chlorophyll", foil: "light", noco2: "carbon dioxide" }[p.leaf]; return { leaf: EXP[p.leaf][0], res: this.outcome(p), shows: need === "—" ? "control: photosynthesis happened" : "photosynthesis needs " + need }; },
  table: { cols: [{ key: "leaf", label: "Leaf" }, { key: "res", label: "Result with iodine" }, { key: "shows", label: "What it shows" }] },
  questions: [
    { q: "Why is the leaf boiled in ethanol?", options: ["To kill it", "To remove the chlorophyll, so the iodine colour can be seen", "To add starch"], answer: 1, why: "Green chlorophyll would hide the colour change." },
    { q: "Why is the plant 'destarched' in the dark first?", options: ["So any starch found must have been made during the experiment", "To make it grow", "To kill the plant"], answer: 0, why: "This is a fair test." },
    { q: "In a variegated leaf, only the green parts turn blue-black. This shows photosynthesis needs…", options: ["light", "chlorophyll", "water"], answer: 1, why: "The white parts have no chlorophyll." },
  ],
  conclusion: "Starch is only made where there is light, chlorophyll and carbon dioxide. These are all needed for photosynthesis.",
});
