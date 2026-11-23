const { C, text, rect, circle } = Sim;
// [name, starch, reducing sugar (0-3), protein, fat]
const FOODS = { glucose: ["Glucose solution", 0, 3, 0, 0], starch: ["Starch suspension", 1, 0, 0, 0], egg: ["Egg white", 0, 0, 1, 0], oil: ["Cooking oil", 0, 0, 0, 1], milk: ["Milk", 0, 2, 1, 1], bread: ["Bread", 1, 1, 1, 0], apple: ["Apple juice", 0, 3, 0, 0], groundnut: ["Groundnut (peanut) paste", 0, 0, 1, 1], water: ["Water (control)", 0, 0, 0, 0] };
const SUGAR = [["blue (no reducing sugar)", "#4dabf7"], ["green (a little sugar)", "#82c91e"], ["orange (more sugar)", "#fd7e14"], ["brick red (lots of reducing sugar)", "#c92a2a"]];
const TESTS = {
  iodine: ["Iodine test (starch)", (f) => (f[1] ? ["blue-black", "#1c1c3a", true] : ["stays orange-brown", "#e8a33b", false])],
  benedict: ["Benedict's test (reducing sugar), heated", (f) => [SUGAR[f[2]][0], SUGAR[f[2]][1], f[2] > 0]],
  biuret: ["Biuret test (protein)", (f) => (f[3] ? ["purple / lilac", "#9c36b5", true] : ["stays blue", "#4dabf7", false])],
  ethanol: ["Ethanol emulsion test (fats and oils)", (f) => (f[4] ? ["cloudy white emulsion", "#f1f3f5", true] : ["stays clear", "rgba(233,236,239,.5)", false])],
};
Lab({
  title: "Virtual Lab: Food Tests",
  aim: "Test foods for starch, reducing sugar, protein and fat, and record which nutrients each one contains.",
  equipment: ["Test tubes and rack", "Spotting tile", "Iodine solution", "Benedict's solution and a water bath at about 80 °C", "Biuret solution (or sodium hydroxide + copper sulfate)", "Ethanol and water", "Food samples"],
  safety: ["Wear eye protection.", "Ethanol is flammable: no flames when using it.", "Biuret reagent contains sodium hydroxide, which is corrosive."],
  method: [
    "Choose a <b>Food</b> and a <b>Test</b>.",
    "Press <b>Do the test</b> and watch the colour change.",
    "Press <b>Record result</b>.",
    "Do all four tests on each food. Always test water too, as a control.",
    "Use the table to decide which nutrients each food contains.",
  ],
  controls: [
    { id: "food", label: "Food", type: "select", options: Object.entries(FOODS).map(([k, v]) => [k, v[0]]) },
    { id: "test", label: "Test", type: "select", options: Object.entries(TESTS).map(([k, v]) => [k, v[0]]) },
  ],
  buttons: [{ label: "Do the test", click(s) { s.done = true; s.t = 0; } }],
  readouts: [["res", "Result"], ["mean", "This means"]],
  init(s) { s.done = false; s.t = 0; },
  change(s) { s.done = false; },
  step(s, p, dt) { s.t = Math.min(1, s.t + dt * 0.5); },
  result(p) { return TESTS[p.test][1](FOODS[p.food]); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const [res, col] = this.result(p), start = { iodine: "#e8a33b", benedict: "#4dabf7", biuret: "#4dabf7", ethanol: "rgba(233,236,239,.5)" }[p.test];
    const mix = (a, b, t) => (t < 0.5 ? a : b), cx = W * 0.32;
    if (p.test === "benedict") { rect(ctx, cx - 90, H * 0.4, 180, H * 0.5, "rgba(255,169,77,.25)", C.text, 6, 2); text(ctx, "water bath 80 °C", cx, H * 0.95, { align: "center", size: 11, color: C.muted }); for (let i = 0; i < 6; i++) circle(ctx, cx - 70 + i * 28, H * 0.86 - ((s.t * 120 + i * 13) % 80), 3, "#fff", "#ffa94d", 1); }
    rect(ctx, cx - 24, H * 0.12, 48, H * 0.66, "rgba(255,255,255,.7)", C.text, 0, 2);
    rect(ctx, cx - 22, H * 0.48, 44, H * 0.3, s.done ? mix(start, col, s.t) : start);
    circle(ctx, cx, H * 0.78, 23, s.done ? mix(start, col, s.t) : start, null);
    text(ctx, FOODS[p.food][0], W * 0.62, H * 0.3, { weight: 800 }); text(ctx, TESTS[p.test][0], W * 0.62, H * 0.3 + 22, { size: 12 });
    text(ctx, s.done && s.t >= 0.5 ? "Colour: " + res : "Press Do the test", W * 0.62, H * 0.3 + 54, { weight: 700, color: s.done ? C.text : C.muted });
  },
  read(s, p) { const [res, , pos] = this.result(p); const nut = { iodine: "starch", benedict: "reducing sugar", biuret: "protein", ethanol: "fat" }[p.test]; return s.done ? { res, mean: (pos ? nut + " is present" : "no " + nut) } : { res: "—", mean: "—" }; },
  record(s, p) { if (!s.done) return "Do the test first."; const [res, , pos] = this.result(p); return { food: FOODS[p.food][0], test: TESTS[p.test][0].split(" (")[0], res, pos: pos ? "✔ positive" : "✘ negative" }; },
  table: { cols: [{ key: "food", label: "Food" }, { key: "test", label: "Test" }, { key: "res", label: "Colour seen" }, { key: "pos", label: "Result" }] },
  questions: [
    { q: "Which reagent tests for protein?", options: ["Iodine", "Benedict's", "Biuret"], answer: 2, why: "Biuret turns from blue to purple when protein is present." },
    { q: "Benedict's solution must be…", options: ["heated in a water bath", "kept in the fridge", "mixed with ethanol"], answer: 0, why: "The colour change needs heat." },
    { q: "Why do we test water as well?", options: ["As a control, to show the reagent alone doesn't change colour", "Because water contains sugar", "To dilute the food"], answer: 0, why: "A control makes the test fair and reliable." },
  ],
  conclusion: "Iodine: starch (blue-black). Benedict's + heat: reducing sugar (blue → green → orange → brick red). Biuret: protein (purple). Ethanol: fat (cloudy white emulsion).",
});
