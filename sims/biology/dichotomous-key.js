const { C, text, rect, circle, line } = Sim;
const ANIMALS = {
  spider: { name: "Spider", legs: 8, wings: false, shell: false, col: "#495057" },
  beetle: { name: "Beetle", legs: 6, wings: true, shell: true, col: "#2b8a3e" },
  butterfly: { name: "Butterfly", legs: 6, wings: true, shell: false, col: "#f59f00" },
  ant: { name: "Ant", legs: 6, wings: false, shell: false, col: "#c92a2a" },
  woodlouse: { name: "Woodlouse", legs: 14, wings: false, shell: true, col: "#868e96" },
  centipede: { name: "Centipede", legs: 30, wings: false, shell: false, col: "#d9480f" },
};
const KEY = [
  { q: "Does it have 6 legs?", yes: 1, no: 2 },
  { q: "Does it have wings?", yes: 3, no: "ant" },
  { q: "Does it have exactly 8 legs?", yes: "spider", no: 4 },
  { q: "Are the front wings a hard case (wing covers)?", yes: "beetle", no: "butterfly" },
  { q: "Does it have a hard shell of overlapping plates?", yes: "woodlouse", no: "centipede" },
];
const answer = (a, i) => [a.legs === 6, a.wings, a.legs === 8, a.shell, a.shell][i];
Sim({
  title: "Classification: Using a Dichotomous Key",
  intro: "A dichotomous key identifies an organism by asking a series of yes/no questions about its features. Each answer leads to the next question, until you reach a name. Pick a mystery minibeast and follow the key.",
  controls: [{ id: "a", label: "Mystery minibeast", type: "select", options: Object.keys(ANIMALS).map((k, i) => [k, `Specimen ${String.fromCharCode(65 + i)}`]) }],
  readouts: [["path", "Answers"], ["id", "Identified as"]],
  path(p) { const a = ANIMALS[p.a], out = []; let node = 0; while (typeof node === "number") { const yes = answer(a, node); out.push([node, yes]); node = yes ? KEY[node].yes : KEY[node].no; } return { out, end: node }; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const a = ANIMALS[p.a], { out, end } = this.path(p);
    // draw the specimen
    const cx = W * 0.15, cy = H * 0.45, segs = a.legs > 8 ? 7 : a.legs === 8 ? 2 : 3;
    for (let i = 0; i < segs; i++) circle(ctx, cx, cy - 30 + i * (60 / segs) * 1.3, a.legs > 8 ? 9 : 14 - i, a.col);
    const pairs = a.legs / 2; for (let i = 0; i < Math.min(pairs, 15); i++) { const y = cy - 20 + (i / Math.max(1, Math.min(pairs, 15) - 1)) * 60; line(ctx, cx - 10, y, cx - 34, y + 8, C.text, 1.5); line(ctx, cx + 10, y, cx + 34, y + 8, C.text, 1.5); }
    if (a.wings) { ctx.globalAlpha = 0.5; ctx.fillStyle = a.shell ? "#1b4332" : "#ffd43b"; ctx.beginPath(); ctx.ellipse(cx - 22, cy - 6, 18, 30, -0.3, 0, Math.PI * 2); ctx.ellipse(cx + 22, cy - 6, 18, 30, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    text(ctx, "Specimen", cx, cy + 70, { align: "center", weight: 700 });
    // the key
    const x0 = W * 0.32, rowH = Math.min(48, (H - 20) / KEY.length);
    KEY.forEach((k, i) => {
      const step = out.find(([n]) => n === i), y = 14 + i * rowH;
      rect(ctx, x0, y, W - x0 - 10, rowH - 8, step ? "#e7f5ff" : "#f8f9fa", step ? C.blue : "#dee2e6", 6, step ? 2 : 1);
      text(ctx, `${i + 1}. ${k.q}`, x0 + 10, y + 18, { size: 13, weight: step ? 700 : 400 });
      const fmt = (v) => (typeof v === "number" ? `go to ${v + 1}` : ANIMALS[v].name);
      text(ctx, `Yes → ${fmt(k.yes)}    No → ${fmt(k.no)}`, x0 + 10, y + 34, { size: 11, color: C.muted });
      if (step) text(ctx, step[1] ? "YES" : "NO", W - 20, y + 26, { align: "right", weight: 800, color: step[1] ? C.green : C.red });
    });
    void end;
  },
  read(s, p) { const { out, end } = this.path(p); return { path: out.map(([n, y]) => `${n + 1}: ${y ? "yes" : "no"}`).join(" → "), id: ANIMALS[end].name }; },
  keyIdea: "<b>Key idea:</b> a good key uses features that are easy to see and don't change (number of legs, wings), not things like size or colour that vary between individuals.",
  tryThis: ["Identify every specimen using the key.", "Why is 'Is it big?' a poor question for a key?", "Add a new animal, such as a fly. Which question would you change or add?"],
});
