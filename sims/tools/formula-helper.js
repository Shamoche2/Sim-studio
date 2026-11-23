const { C, text, rect, circle, line } = Sim;
// Formula triangles: top = left × right. Each quantity: [symbol, name, unit, unit name, picture]
const Q = (sym, name, unit, unitName, pic) => ({ sym, name, unit, unitName, pic });
const F = {
  speed: ["Speed", "distance = speed × time", Q("d", "distance", "m", "metres", "📏"), Q("s", "speed", "m/s", "metres per second", "🚗"), Q("t", "time", "s", "seconds", "⏱️"), "physics/motion-graphs"],
  density: ["Density", "mass = density × volume", Q("m", "mass", "g", "grams", "⚖️"), Q("ρ", "density", "g/cm³", "grams per cubic centimetre", "🧱"), Q("V", "volume", "cm³", "cubic centimetres", "🧊"), "physics/density"],
  ohm: ["Ohm's law", "voltage = current × resistance", Q("V", "voltage", "V", "volts", "🔋"), Q("I", "current", "A", "amps", "⚡"), Q("R", "resistance", "Ω", "ohms", "🚧"), "physics/ohms-law"],
  force: ["Force (Newton's 2nd law)", "force = mass × acceleration", Q("F", "force", "N", "newtons", "👊"), Q("m", "mass", "kg", "kilograms", "⚖️"), Q("a", "acceleration", "m/s²", "metres per second squared", "🚀"), "physics/newtons-second-law"],
  weight: ["Weight", "weight = mass × gravity", Q("W", "weight", "N", "newtons", "⬇️"), Q("m", "mass", "kg", "kilograms", "⚖️"), Q("g", "gravitational field strength", "N/kg", "newtons per kilogram", "🌍"), "physics/weight-planets"],
  energy: ["Power and energy", "energy = power × time", Q("E", "energy", "J", "joules", "🔥"), Q("P", "power", "W", "watts", "💡"), Q("t", "time", "s", "seconds", "⏱️"), "physics/work-power"],
  work: ["Work done", "work done = force × distance", Q("W", "work done", "J", "joules", "🏋️"), Q("F", "force", "N", "newtons", "👊"), Q("d", "distance", "m", "metres", "📏"), "physics/work-power"],
  pressure: ["Pressure", "force = pressure × area", Q("F", "force", "N", "newtons", "👊"), Q("p", "pressure", "Pa", "pascals", "🎈"), Q("A", "area", "m²", "square metres", "⬛"), "physics/fluid-pressure"],
  moment: ["Moments", "moment = force × distance from pivot", Q("M", "moment", "N m", "newton metres", "🔧"), Q("F", "force", "N", "newtons", "👊"), Q("d", "distance from pivot", "m", "metres", "📏"), "physics/moments"],
  wave: ["Wave speed", "wave speed = frequency × wavelength", Q("v", "wave speed", "m/s", "metres per second", "🌊"), Q("f", "frequency", "Hz", "hertz", "🔁"), Q("λ", "wavelength", "m", "metres", "〰️"), "physics/transverse-waves"],
  charge: ["Charge", "charge = current × time", Q("Q", "charge", "C", "coulombs", "🔋"), Q("I", "current", "A", "amps", "⚡"), Q("t", "time", "s", "seconds", "⏱️"), "physics/capacitor"],
  epower: ["Electrical power", "power = current × voltage", Q("P", "power", "W", "watts", "💡"), Q("I", "current", "A", "amps", "⚡"), Q("V", "voltage", "V", "volts", "🔋"), "physics/electricity-cost"],
  hooke: ["Hooke's law", "force = spring constant × extension", Q("F", "force", "N", "newtons", "👊"), Q("k", "spring constant", "N/m", "newtons per metre", "🌀"), Q("e", "extension", "m", "metres", "↕️"), "physics/hookes-law"],
  momentum: ["Momentum", "momentum = mass × velocity", Q("p", "momentum", "kg m/s", "kilogram metres per second", "🎳"), Q("m", "mass", "kg", "kilograms", "⚖️"), Q("v", "velocity", "m/s", "metres per second", "🚗"), "physics/collisions"],
};
const COLS = ["#e8590c", "#2f6fed", "#2b8a3e"]; // top, left, right
const start = new URLSearchParams(location.search).get("formula");
const nice = (v) => (Math.abs(v) >= 1e5 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(2) : String(+v.toPrecision(4)));
let panel = null;

Sim({
  title: "Formula Helper",
  intro: "A step-by-step helper for physics equations. Pick a formula, choose what you want to find, type the numbers you know, and the helper shows every step in words and colours. It's made for anyone who finds maths hard.",
  keyIdea: "<b>The triangle trick:</b> cover the quantity you want. If the other two are side by side, <b>multiply</b> them. If one is on top of the other, <b>divide</b> the top one by the bottom one.",
  tryThis: ["Find the speed of a car that travels 100 m in 20 s.", "Find the resistance when V = 12 V and I = 3 A.", "Press Practice question and try one on your own."],
  controls: [
    { id: "f", label: "Formula", type: "select", options: Object.entries(F).map(([k, v]) => [k, v[0]]), value: F[start] ? start : "speed" },
    { id: "find", label: "What do you want to find?", type: "select", options: [["0", "distance"], ["1", "speed"], ["2", "time"]], value: "1" },
  ],
  buttons: [{ label: "Practice question", click(s, p) { practice(s, p); } }],
  readouts: [["eq", "Formula"], ["how", "To find it"]],
  init(s, p) { s.vals = {}; s.result = null; s.quiz = null; queueMicrotask(() => { syncFind(p); renderPanel(s, p); }); },
  change(s, p, id) { if (id === "f") { syncFind(p); s.vals = {}; s.quiz = null; } s.result = null; renderPanel(s, p); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fffdf7");
    const f = F[p.f], qs = [f[2], f[3], f[4]], find = +p.find;
    const cx = W * 0.32, top = H * 0.1, size = Math.min(W * 0.5, H * 0.95), bot = top + size * 0.82, half = size * 0.52, mid = top + size * 0.45;
    ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx + half, bot); ctx.lineTo(cx - half, bot); ctx.closePath(); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.stroke();
    line(ctx, cx - half * 0.55, mid, cx + half * 0.55, mid, C.text, 3); line(ctx, cx, mid, cx, bot, C.text, 3);
    const pos = [[cx, top + (mid - top) * 0.62], [cx - half * 0.42, mid + (bot - mid) * 0.5], [cx + half * 0.42, mid + (bot - mid) * 0.5]];
    qs.forEach((q, i) => {
      const [x, y] = pos[i];
      if (i === find) { circle(ctx, x, y, size * 0.1, "rgba(255,212,59,.9)", "#e67700", 3); text(ctx, q.sym + "?", x, y + size * 0.03, { align: "center", weight: 800, size: size * 0.07, color: COLS[i] }); text(ctx, "✋", x + size * 0.09, y + size * 0.1, { align: "center", size: size * 0.07 }); }
      else { text(ctx, q.sym, x, y + 12, { align: "center", weight: 800, size: size * 0.11, color: COLS[i] }); }
    });
    if (find !== 0) text(ctx, "÷", cx + half * 0.68, mid + 8, { align: "center", size: 26, weight: 800, color: C.muted });
    else text(ctx, "×", cx, mid + (bot - mid) * 0.5 + 10, { align: "center", size: 22, weight: 800, color: C.muted });
    // key with pictures
    const kx = W * 0.64; text(ctx, "What the letters mean", kx, H * 0.14, { weight: 800 });
    qs.forEach((q, i) => { const y = H * 0.26 + i * H * 0.17; text(ctx, q.pic, kx, y + 6, { size: 26 }); text(ctx, `${q.sym} = ${q.name}`, kx + 42, y, { weight: 700, color: COLS[i] }); text(ctx, `measured in ${q.unitName} (${q.unit})`, kx + 42, y + 20, { size: 12, color: C.muted }); });
    text(ctx, "✋ covers the one you want to find", kx, H * 0.82, { size: 12, color: C.muted });
  },
  read(s, p) { const f = F[p.f], [a, b, c] = [f[2], f[3], f[4]], find = +p.find; return { eq: `${a.sym} = ${b.sym} × ${c.sym}`, how: find === 0 ? `${a.sym} = ${b.sym} × ${c.sym}` : find === 1 ? `${b.sym} = ${a.sym} ÷ ${c.sym}` : `${c.sym} = ${a.sym} ÷ ${b.sym}` }; },
});

function syncFind(p) {
  const f = F[p.f], sel = document.getElementById("find"), keep = sel.value;
  sel.replaceChildren(...[f[2], f[3], f[4]].map((q, i) => { const o = document.createElement("option"); o.value = String(i); o.textContent = `${q.name} (${q.sym})`; return o; }));
  sel.value = keep; p.find = +sel.value;
}
function solve(p, vals) { const f = F[p.f], find = +p.find, qs = [f[2], f[3], f[4]], known = [0, 1, 2].filter((i) => i !== find); const [x, y] = known.map((i) => vals[i]); return find === 0 ? x * y : x / y; }
function steps(p, vals) {
  const f = F[p.f], qs = [f[2], f[3], f[4]], find = +p.find, known = [0, 1, 2].filter((i) => i !== find), ans = solve(p, vals);
  const tag = (i, t) => `<b style="color:${COLS[i]}">${t}</b>`;
  const op = find === 0 ? "×" : "÷", opWord = find === 0 ? "multiply" : "divide";
  return [
    `Write the formula: ${tag(0, qs[0].sym)} = ${tag(1, qs[1].sym)} × ${tag(2, qs[2].sym)} (${f[1]}).`,
    `You want ${tag(find, qs[find].name)}. Cover it on the triangle. ${find === 0 ? "The other two are side by side, so <b>multiply</b>." : `${tag(0, qs[0].sym)} is on top, so <b>divide</b> ${tag(0, qs[0].name)} by ${tag(known[1], qs[known[1]].name)}.`}`,
    `Rearranged: ${tag(find, qs[find].sym)} = ${tag(known[0], qs[known[0]].sym)} ${op} ${tag(known[1], qs[known[1]].sym)}`,
    `Put in the numbers: ${tag(find, qs[find].sym)} = ${tag(known[0], nice(vals[known[0]]))} ${op} ${tag(known[1], nice(vals[known[1]]))}`,
    `Use the calculator to ${opWord}: ${nice(vals[known[0]])} ${op} ${nice(vals[known[1]])} = <b>${nice(ans)}</b>`,
    `Answer with the unit: ${tag(find, qs[find].name)} = <b style="font-size:1.25em">${nice(ans)} ${qs[find].unit}</b> (${qs[find].unitName}).`,
  ];
}
function practice(s, p) {
  const f = F[p.f], find = Math.floor(Math.random() * 3), b = Sim.rand(1, 12), c = Sim.rand(1, 12), r = (v) => Math.round(v * 2) / 2 || 0.5;
  const vals = { 1: r(b), 2: r(c) }; vals[0] = vals[1] * vals[2];
  const known = [0, 1, 2].filter((i) => i !== find); s.quiz = { find, vals, known, tries: 0, msg: "" };
  document.getElementById("find").value = String(find); p.find = find; s.result = null; renderPanel(s, p);
}
function say(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/<[^>]+>/g, "").replace(/÷/g, " divided by ").replace(/×/g, " times ")); u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {} }

function renderPanel(s, p) {
  if (!panel) { panel = document.createElement("section"); panel.className = "card fh-panel"; panel.style.marginTop = "14px"; document.querySelector("main .grid").after(panel); }
  const f = F[p.f], qs = [f[2], f[3], f[4]], find = +p.find, known = [0, 1, 2].filter((i) => i !== find);
  const btn = "font:inherit;font-weight:700;padding:10px 16px;border-radius:10px;cursor:pointer;";
  let h = "";
  if (s.quiz) {
    const z = s.quiz;
    h += `<h2>📝 Practice question</h2><p style="font-size:1.1em">${qs[z.known[0]].pic} The ${qs[z.known[0]].name} is <b style="color:${COLS[z.known[0]]}">${nice(z.vals[z.known[0]])} ${qs[z.known[0]].unit}</b> and the ${qs[z.known[1]].name} is <b style="color:${COLS[z.known[1]]}">${nice(z.vals[z.known[1]])} ${qs[z.known[1]].unit}</b>. What is the <b style="color:${COLS[z.find]}">${qs[z.find].name}</b>?</p>
      <p><label>Your answer: <input id="fh-ans" inputmode="decimal" style="font:inherit;font-size:1.2em;width:9em;padding:6px 8px;border:2px solid ${COLS[z.find]};border-radius:8px"> ${qs[z.find].unit}</label>
      <button type="button" data-act="check" style="${btn}background:#2f6fed;color:#fff;border:0">Check</button>
      <button type="button" data-act="hint" style="${btn}background:#fff;border:1px solid #2f6fed;color:#2f6fed">Show me the steps</button>
      <button type="button" data-act="end" style="${btn}background:#fff;border:1px solid #868e96;color:#495057">Stop practising</button></p><p class="fh-msg" style="font-weight:700">${z.msg}</p>`;
    if (z.showSteps) h += `<ol class="fh-steps" style="line-height:1.9;font-size:1.05em">${steps({ ...p, find: z.find }, z.vals).map((t) => `<li>${t}</li>`).join("")}</ol>`;
  } else {
    h += `<h2>🧮 Work it out</h2><p>Type the two numbers you know:</p><div style="display:flex;gap:16px;flex-wrap:wrap">` +
      known.map((i) => `<label style="display:flex;flex-direction:column;gap:4px;font-weight:700;color:${COLS[i]}">${qs[i].pic} ${qs[i].name} (${qs[i].sym})<span style="display:flex;align-items:center;gap:6px;color:#1a2030;font-weight:400"><input data-q="${i}" inputmode="decimal" value="${s.vals[i] ?? ""}" style="font:inherit;font-size:1.2em;width:8em;padding:6px 8px;border:2px solid ${COLS[i]};border-radius:8px"> ${qs[i].unit}</span></label>`).join("") +
      `</div><p><button type="button" data-act="solve" style="${btn}background:#2f6fed;color:#fff;border:0">Work it out</button></p><p class="fh-msg" style="font-weight:700;color:#e03131"></p>`;
    if (s.result) h += `<ol class="fh-steps" style="line-height:1.9;font-size:1.05em">${s.result.map((t) => `<li>${t}</li>`).join("")}</ol><p><button type="button" data-act="say" style="${btn}background:#fff;border:1px solid #2f6fed;color:#2f6fed">🔊 Read the steps aloud</button></p>`;
  }
  h += `<p style="color:#5d667a;font-size:.95em">See this formula in action: <a href="view.html?sim=${f[5]}">open the simulation</a>.</p>`;
  panel.innerHTML = h;
  panel.querySelectorAll("[data-q]").forEach((inp) => inp.addEventListener("input", () => { const v = parseFloat(inp.value); if (isFinite(v)) s.vals[inp.dataset.q] = v; else delete s.vals[inp.dataset.q]; }));
  const act = (a, fn) => { const b = panel.querySelector(`[data-act=${a}]`); if (b) b.addEventListener("click", fn); };
  act("solve", () => {
    const miss = known.filter((i) => !isFinite(s.vals[i]));
    if (miss.length) { panel.querySelector(".fh-msg").textContent = "Please type a number for " + miss.map((i) => qs[i].name).join(" and ") + "."; return; }
    if (find !== 0 && s.vals[known[1]] === 0) { panel.querySelector(".fh-msg").textContent = "You can't divide by zero. Check the " + qs[known[1]].name + "."; return; }
    s.result = steps(p, s.vals); renderPanel(s, p);
  });
  act("say", () => say(s.result.join(". ")));
  act("check", () => {
    const z = s.quiz, v = parseFloat(panel.querySelector("#fh-ans").value), ans = solve({ ...p, find: z.find }, z.vals); z.tries++;
    if (!isFinite(v)) z.msg = "Type a number first.";
    else if (Math.abs(v - ans) <= Math.abs(ans) * 0.02) { z.msg = `✅ Correct! ${qs[z.find].name} = ${nice(ans)} ${qs[z.find].unit}. Well done!`; say("Correct! Well done!"); }
    else { z.msg = z.tries >= 2 ? `Not quite. The answer is ${nice(ans)} ${qs[z.find].unit}. Look at the steps below.` : "Not quite. Try again, or press Show me the steps."; if (z.tries >= 2) z.showSteps = true; }
    renderPanel(s, p);
  });
  act("hint", () => { s.quiz.showSteps = true; renderPanel(s, p); });
  act("end", () => { s.quiz = null; renderPanel(s, p); });
}
