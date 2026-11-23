const { C, text, rect, circle } = Sim;
// cation, anion
const SALTS = { A: ["Cu²⁺", "SO₄²⁻"], B: ["Fe²⁺", "Cl⁻"], Cc: ["Fe³⁺", "SO₄²⁻"], D: ["Na⁺", "CO₃²⁻"], E: ["K⁺", "I⁻"], F: ["Ca²⁺", "Br⁻"], G: ["Zn²⁺", "Cl⁻"], H: ["NH₄⁺", "SO₄²⁻"] };
const TESTS = {
  flame: ["Flame test", (c) => ({ "Cu²⁺": ["blue-green flame", "#20c997"], "Na⁺": ["yellow-orange flame", "#fab005"], "K⁺": ["lilac flame", "#cc5de8"], "Ca²⁺": ["orange-red (brick red) flame", "#f76707"] }[c] || ["no clear colour", "#74c0fc"])],
  naoh: ["Add sodium hydroxide solution", (c) => ({ "Cu²⁺": ["light blue precipitate", "#74c0fc"], "Fe²⁺": ["green precipitate", "#94d82d"], "Fe³⁺": ["orange-brown precipitate", "#d9480f"], "Ca²⁺": ["white precipitate, does not dissolve in excess", "#f1f3f5"], "Zn²⁺": ["white precipitate, dissolves in excess", "#f8f9fa"], "NH₄⁺": ["no precipitate; on warming, gas turns damp red litmus blue (ammonia)", "rgba(255,255,255,.2)"] }[c] || ["no precipitate", "rgba(255,255,255,.2)"])],
  hcl: ["Add dilute HCl, test gas with limewater", (c, a) => (a === "CO₃²⁻" ? ["fizzing; gas turns limewater milky (CO₂)", "rgba(255,255,255,.2)"] : ["no fizzing", "rgba(255,255,255,.2)"])],
  agno3: ["Add nitric acid, then silver nitrate", (c, a) => ({ "Cl⁻": ["white precipitate", "#f8f9fa"], "Br⁻": ["cream precipitate", "#fff3bf"], "I⁻": ["yellow precipitate", "#ffe066"] }[a] || ["no precipitate", "rgba(255,255,255,.2)"])],
  bacl2: ["Add HCl, then barium chloride", (c, a) => (a === "SO₄²⁻" ? ["white precipitate", "#f8f9fa"] : ["no precipitate", "rgba(255,255,255,.2)"])],
};
Lab({
  title: "Virtual Lab: Identifying Ions (Qualitative Analysis)",
  aim: "Carry out tests on unknown salts to identify the positive ion (cation) and negative ion (anion) in each.",
  equipment: ["Test tubes and rack", "Nichrome wire loop and Bunsen burner", "Dilute sodium hydroxide", "Dilute hydrochloric and nitric acid", "Silver nitrate and barium chloride solutions", "Limewater", "Unknown salts A–H"],
  safety: ["Wear eye protection.", "Sodium hydroxide is corrosive.", "Silver nitrate stains skin."],
  method: [
    "Choose an <b>Unknown salt</b> and a <b>Test</b>.",
    "Press <b>Do the test</b> and look carefully at the result.",
    "Press <b>Record result</b> to write the observation in the table.",
    "Do all five tests on each salt.",
    "Use the observations to name the cation and the anion. Check yourself with <b>Reveal answer</b>.",
  ],
  controls: [
    { id: "salt", label: "Unknown salt", type: "select", options: Object.keys(SALTS).map((k) => [k, "Salt " + (k === "Cc" ? "C" : k)]) },
    { id: "test", label: "Test", type: "select", options: Object.entries(TESTS).map(([k, v]) => [k, v[0]]) },
  ],
  buttons: [{ label: "Do the test", click(s) { s.done = true; s.t = 0; } }, { label: "Reveal answer", click(s) { s.reveal = true; } }],
  readouts: [["obs", "Observation"]],
  init(s) { s.done = false; s.t = 0; s.reveal = false; },
  change(s) { s.done = false; s.reveal = false; },
  step(s, p, dt) { s.t += dt; },
  result(p) { const [c, a] = SALTS[p.salt]; return TESTS[p.test][1](c, a); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const [obs, col] = this.result(p), cx = W * 0.35;
    if (p.test === "flame") {
      rect(ctx, cx - 18, H * 0.6, 36, H * 0.32, "#495057", null, 4);
      if (s.done) { ctx.beginPath(); const fl = H * 0.3 + Math.sin(s.t * 20) * 6; ctx.moveTo(cx - 20, H * 0.6); ctx.quadraticCurveTo(cx - 24, H * 0.6 - fl * 0.6, cx, H * 0.6 - fl); ctx.quadraticCurveTo(cx + 24, H * 0.6 - fl * 0.6, cx + 20, H * 0.6); ctx.closePath(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; }
      else { ctx.beginPath(); ctx.moveTo(cx - 14, H * 0.6); ctx.quadraticCurveTo(cx, H * 0.3, cx + 14, H * 0.6); ctx.fillStyle = "rgba(77,171,247,.6)"; ctx.fill(); }
      Sim.line(ctx, cx + 120, H * 0.25, cx + 4, H * 0.45, "#868e96", 3);
    } else {
      rect(ctx, cx - 26, H * 0.15, 52, H * 0.65, "rgba(255,255,255,.7)", C.text, 0, 2); circle(ctx, cx, H * 0.8, 26, "rgba(255,255,255,.7)", null);
      ctx.beginPath(); ctx.arc(cx, H * 0.8, 26, 0, Math.PI); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
      rect(ctx, cx - 24, H * 0.5, 48, H * 0.3, p.salt === "A" ? "rgba(116,192,252,.45)" : p.salt === "B" ? "rgba(148,216,45,.3)" : p.salt === "Cc" ? "rgba(255,212,59,.4)" : "rgba(233,236,239,.6)");
      if (s.done) { const k = Math.min(1, s.t); for (let i = 0; i < 40 * k; i++) circle(ctx, cx + Math.sin(i * 7.1) * 18, H * 0.82 - (i % 8) * 3 - (1 - k) * 60, 4, col); if (/fizz/.test(obs)) for (let i = 0; i < 12; i++) circle(ctx, cx + Math.sin(i * 3.3) * 16, H * 0.78 - ((s.t * 80 + i * 20) % (H * 0.28)), 3, "#fff", "#adb5bd", 1); }
    }
    text(ctx, `Salt ${p.salt === "Cc" ? "C" : p.salt}: ${TESTS[p.test][0]}`, W * 0.65, H * 0.3, { weight: 700, size: 13 });
    text(ctx, s.done ? obs : "Press Do the test", W * 0.65, H * 0.3 + 26, { size: 13, color: s.done ? C.text : C.muted, maxWidth: W * 0.33 });
    if (s.reveal) text(ctx, `Answer: ${SALTS[p.salt][0]} and ${SALTS[p.salt][1]}`, W * 0.65, H * 0.7, { weight: 800, color: C.green });
  },
  read(s, p) { return { obs: s.done ? this.result(p)[0] : "—" }; },
  record(s, p) { if (!s.done) return "Do the test first."; return { salt: p.salt === "Cc" ? "C" : p.salt, test: TESTS[p.test][0], obs: this.result(p)[0] }; },
  table: { cols: [{ key: "salt", label: "Salt" }, { key: "test", label: "Test" }, { key: "obs", label: "Observation" }] },
  questions: [
    { q: "Adding sodium hydroxide gives a green precipitate. The cation is…", options: ["Cu²⁺", "Fe²⁺", "Fe³⁺"], answer: 1, why: "Iron(II) hydroxide is green; iron(III) is orange-brown; copper(II) is light blue." },
    { q: "Silver nitrate gives a yellow precipitate. The anion is…", options: ["chloride", "bromide", "iodide"], answer: 2, why: "Chloride white, bromide cream, iodide yellow." },
    { q: "Which test shows a sulfate ion?", options: ["Barium chloride gives a white precipitate", "Limewater turns milky", "A lilac flame"], answer: 0, why: "Ba²⁺ + SO₄²⁻ → BaSO₄ (white)." },
  ],
  conclusion: "Flame tests and sodium hydroxide identify cations. Acid + limewater (carbonate), silver nitrate (halides) and barium chloride (sulfate) identify anions.",
});
