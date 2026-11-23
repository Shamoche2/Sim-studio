const { C, text, rect, circle, line } = Sim;
// Organs: [system, name, shape, colour, simple job, more detail, related simulations]
// Shapes use body coordinates: x 0..1 across the canvas, y 0..1 from head to feet (the person faces you, so their left is on your right).
const E = (x, y, rx, ry, rot = 0) => ({ e: [x, y, rx, ry, rot] });
const L = (...pts) => ({ l: pts }); // a thick line through points
const ORGANS = {
  brain: ["nervous", "Brain", E(0.5, 0.075, 0.05, 0.035), "#f783ac", "Controls your whole body. It thinks, remembers and sends messages along nerves.", "The brain receives signals from your senses and decides how to respond. The hypothalamus inside it controls body temperature and water balance.", ["nerve-impulse", "reflex-arc", "thermoregulation"]],
  eye: ["nervous", "Eye", E(0.475, 0.098, 0.012, 0.008), "#4dabf7", "Detects light so you can see. The lens focuses light onto the retina.", "The retina has light-sensitive cells that send impulses to the brain along the optic nerve.", ["eye-focusing", "reflex-arc"]],
  spine: ["nervous", "Spinal cord", L([0.5, 0.13], [0.5, 0.47]), "#e599f7", "A thick bundle of nerves down your back. It carries messages between the brain and body.", "Reflexes use the spinal cord so you can react before the brain has even noticed.", ["reflex-arc", "nerve-impulse"]],
  nerves: ["nervous", "Nerves", L([0.5, 0.2], [0.33, 0.3], [0.27, 0.45], [0.24, 0.55]), "#e599f7", "Carry electrical messages (impulses) to and from every part of the body.", "Sensory neurones carry messages to the brain and spinal cord; motor neurones carry messages to muscles.", ["nerve-impulse", "reflex-arc"]],
  heart: ["circulatory", "Heart", E(0.53, 0.25, 0.032, 0.036, 0.4), "#c92a2a", "A muscle that pumps blood around your body, about 70 times a minute.", "It has four chambers and pumps blood to the lungs and to the body: a double circulation. Valves stop blood flowing backwards.", ["blood-circulation", "cardiac-cycle", "blood-vessels"]],
  arteries: ["circulatory", "Arteries (red)", L([0.52, 0.24], [0.52, 0.19], [0.38, 0.2], [0.29, 0.45]), "#e03131", "Carry blood away from the heart at high pressure.", "Arteries have thick, stretchy walls. The main artery from the heart is the aorta.", ["blood-vessels", "cardiac-cycle"]],
  veins: ["circulatory", "Veins (blue)", L([0.47, 0.25], [0.47, 0.5], [0.44, 0.7], [0.43, 0.92]), "#1c7ed6", "Carry blood back to the heart at low pressure.", "Veins have thin walls, a wide space inside, and valves to stop blood flowing backwards.", ["blood-vessels"]],
  blood: ["circulatory", "Blood", E(0.57, 0.45, 0.02, 0.02), "#fa5252", "Carries oxygen, food and waste around the body. White blood cells fight germs.", "Red blood cells carry oxygen; white blood cells make antibodies; platelets help clots form; plasma carries dissolved food and CO₂.", ["immune-response", "disease-spread", "blood-glucose"]],
  trachea: ["respiratory", "Windpipe (trachea)", L([0.5, 0.135], [0.5, 0.21]), "#ffa8a8", "The tube that carries air down to your lungs.", "Rings of cartilage keep it open. It splits into two bronchi, one for each lung.", ["breathing"]],
  lungs: ["respiratory", "Lungs", E(0.5, 0.26, 0.105, 0.07), "#ff8787", "Take oxygen from the air into the blood, and get rid of carbon dioxide.", "Millions of tiny air sacs (alveoli) give a huge surface area for gas exchange.", ["breathing", "respiration", "surface-area-volume"]],
  diaphragm: ["respiratory", "Diaphragm", L([0.4, 0.33], [0.5, 0.31], [0.6, 0.33]), "#a61e4d", "A sheet of muscle under the lungs. It moves down when you breathe in.", "When it contracts and flattens, the chest gets bigger, pressure falls, and air rushes in.", ["breathing"]],
  mouth: ["digestive", "Mouth", E(0.5, 0.118, 0.02, 0.008), "#e64980", "Teeth break food into small pieces. Saliva starts digesting starch.", "Saliva contains the enzyme amylase, which breaks starch into sugars.", ["digestion", "enzymes"]],
  oesophagus: ["digestive", "Oesophagus (food pipe)", L([0.505, 0.13], [0.51, 0.3]), "#f08c00", "The tube that carries food from your mouth to your stomach.", "Muscles squeeze food along in waves (peristalsis).", ["digestion"]],
  stomach: ["digestive", "Stomach", E(0.555, 0.32, 0.045, 0.03, -0.5), "#fab005", "Churns food with acid and enzymes to start digesting protein.", "Stomach acid kills germs and helps the enzyme pepsin digest protein.", ["digestion", "enzymes", "ph-scale"]],
  liver: ["digestive", "Liver", E(0.445, 0.305, 0.07, 0.033, 0.15), "#a0522d", "Makes bile to help digest fat, and stores glucose as glycogen.", "The liver also breaks down toxins and helps control blood sugar with insulin and glucagon.", ["digestion", "blood-glucose"]],
  pancreas: ["digestive", "Pancreas", E(0.525, 0.345, 0.035, 0.01, -0.2), "#ffd8a8", "Makes digestive enzymes, and the hormones insulin and glucagon.", "Its enzymes (amylase, protease, lipase) flow into the small intestine.", ["digestion", "blood-glucose", "enzymes"]],
  smallint: ["digestive", "Small intestine", E(0.5, 0.41, 0.065, 0.045), "#ffc078", "Finishes digesting food and absorbs it into the blood.", "It is lined with villi, giving a huge surface area for absorption.", ["digestion", "surface-area-volume", "membrane-diffusion"]],
  largeint: ["digestive", "Large intestine", L([0.42, 0.46], [0.42, 0.36], [0.58, 0.36], [0.58, 0.46]), "#e8590c", "Absorbs water from leftover food. What's left leaves the body as faeces.", "Helpful bacteria live here.", ["digestion"]],
  kidneys: ["excretory", "Kidneys", E(0.5, 0.37, 0.065, 0.025), "#9c36b5", "Clean the blood and make urine from waste and extra water.", "The hormone ADH controls how much water the kidneys keep.", ["water-balance"]],
  bladder: ["excretory", "Bladder", E(0.5, 0.49, 0.025, 0.018), "#ffd43b", "Stores urine until you go to the toilet.", "Urine reaches it through two tubes called ureters.", ["water-balance"]],
  skin: ["excretory", "Skin", E(0.32, 0.4, 0.015, 0.03), "#e8b896", "Protects the body. Sweat from the skin cools you down.", "Blood vessels in the skin widen when you are hot and narrow when you are cold.", ["thermoregulation"]],
  pituitary: ["endocrine", "Pituitary gland", E(0.5, 0.09, 0.009, 0.008), "#7048e8", "A tiny gland in the brain that controls other glands.", "It releases ADH (water balance), FSH and LH (menstrual cycle) and other hormones.", ["water-balance", "menstrual-cycle"]],
  thyroid: ["endocrine", "Thyroid gland", E(0.5, 0.15, 0.02, 0.008), "#7048e8", "Makes the hormone thyroxine, which controls how fast your body uses energy.", "Thyroxine controls your metabolic rate.", ["respiration"]],
  adrenal: ["endocrine", "Adrenal glands", E(0.5, 0.352, 0.06, 0.008), "#7048e8", "Make adrenaline, the 'fight or flight' hormone.", "Adrenaline raises your heart rate and breathing rate when you are frightened or excited.", ["blood-circulation", "breathing"]],
  ovaries: ["endocrine", "Ovaries (female) / testes (male)", E(0.5, 0.505, 0.045, 0.01), "#7048e8", "Make sex cells and sex hormones: oestrogen, progesterone or testosterone.", "Ovaries release an egg each month in the menstrual cycle.", ["menstrual-cycle", "meiosis"]],
  skull: ["skeletal", "Skull", E(0.5, 0.085, 0.06, 0.06), "#e9ecef", "Protects your brain.", "It is made of bones joined together that cannot move, except the jaw.", ["arm-muscles"]],
  ribs: ["skeletal", "Ribcage", E(0.5, 0.26, 0.11, 0.075), "#dee2e6", "Protects your heart and lungs, and moves when you breathe.", "Muscles between the ribs lift them up and out when you breathe in.", ["breathing"]],
  bones: ["skeletal", "Arm bones", L([0.355, 0.19], [0.32, 0.32], [0.287, 0.45]), "#ced4da", "Support your body and let you move, with muscles pulling on them.", "Joints like the elbow and knee let bones move. Bone marrow makes blood cells.", ["arm-muscles"]],
  legbones: ["skeletal", "Leg bones", L([0.435, 0.53], [0.435, 0.92]), "#ced4da", "Hold up your body and let you walk, run and jump.", "The femur (thigh bone) is the longest bone in the body. The knee joint lets the leg bend.", ["arm-muscles"]],
  muscles: ["skeletal", "Biceps and triceps", E(0.343, 0.265, 0.014, 0.04, 0.35), "#f03e3e", "Muscles pull on bones to move you. The biceps bends your arm.", "Muscles can only pull, so they work in pairs: when one contracts, the other relaxes.", ["arm-muscles", "respiration"]],
};
const SYSTEMS = { digestive: "Digestive system", circulatory: "Circulatory system (heart and blood)", respiratory: "Breathing (respiratory) system", nervous: "Nervous system", excretory: "Excretion (kidneys and skin)", endocrine: "Hormones (endocrine system)", skeletal: "Skeleton and muscles" };
const q = new URLSearchParams(location.search);
const startSystem = SYSTEMS[q.get("system")] ? q.get("system") : "circulatory";
const organsIn = (sys) => Object.entries(ORGANS).filter(([, o]) => o[0] === sys);
let pageState = null, panel = null;

function inShape(o, x, y, W, H) {
  const sh = o[2];
  if (sh.e) { const [cx, cy, rx, ry, rot] = sh.e, dx = x / W - cx, dy = y / H - cy, c = Math.cos(-rot), s = Math.sin(-rot), u = dx * c - dy * s, v = dx * s + dy * c; return (u / (rx + 0.012)) ** 2 + (v / (ry + 0.012)) ** 2 <= 1; }
  for (let i = 1; i < sh.l.length; i++) { const [x1, y1] = sh.l[i - 1], [x2, y2] = sh.l[i], ax = x1 * W, ay = y1 * H, bx = x2 * W, by = y2 * H, t = Sim.clamp(((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1), 0, 1); if (Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))) < 12) return true; }
  return false;
}

Sim({
  title: "Digital Human Body",
  intro: "Explore the systems of the human body. Choose a system, then click an organ (or pick it from the list) to find out what it does. Use <b>Quiz me</b> to test yourself.",
  aspect: 3 / 4,
  controls: [
    { id: "sys", label: "Body system", type: "select", options: Object.entries(SYSTEMS), value: startSystem },
    { id: "organ", label: "Organ", type: "select", options: Object.entries(ORGANS).map(([k, o]) => [k, o[1]]), value: organsIn(startSystem)[0][0] },
    { id: "labels", label: "Show labels", type: "checkbox", value: true },
  ],
  buttons: [{ label: "Quiz me", primary: true, click(s, p) { startQuiz(s, p); } }],
  readouts: [["name", "Organ"], ["job", "What it does"], ["more", "Find out more"]],
  init(s, p) { s.t = 0; s.quiz = null; pageState = { s, p }; syncOrganList(p); renderPanel(s, p); },
  change(s, p, id) { if (id === "sys") { syncOrganList(p); setSelect("organ", organsIn(p.sys)[0][0], p); s.quiz = null; renderPanel(s, p); } if (id === "organ") { if (ORGANS[p.organ][0] !== p.sys) setSelect("sys", ORGANS[p.organ][0], p); s.quiz = null; renderPanel(s, p); } },
  step(s, p, dt) { s.t += dt; },
  pointer(s, p, e) {
    if (e.type !== "down") return;
    const hit = organsIn(p.sys).reverse().find(([, o]) => inShape(o, e.x, e.y, e.W, e.H));
    if (hit) { setSelect("organ", hit[0], p); if (s.quiz && !s.quiz.answered) answerQuiz(s, p, hit[0]); renderPanel(s, p); }
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const X = (x) => x * W, Y = (y) => y * H, skin = "#f3d9c4", edge = "#d9a77f";
    // body outline
    ctx.fillStyle = skin; ctx.strokeStyle = edge; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(X(0.5), Y(0.085), W * 0.065, H * 0.065, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(0.47), Y(0.14)); ctx.lineTo(X(0.36), Y(0.17)); ctx.lineTo(X(0.27), Y(0.46)); ctx.lineTo(X(0.3), Y(0.47)); ctx.lineTo(X(0.37), Y(0.3)); ctx.lineTo(X(0.38), Y(0.52)); ctx.lineTo(X(0.4), Y(0.95)); ctx.lineTo(X(0.47), Y(0.95)); ctx.lineTo(X(0.5), Y(0.58)); ctx.lineTo(X(0.53), Y(0.95)); ctx.lineTo(X(0.6), Y(0.95)); ctx.lineTo(X(0.62), Y(0.52)); ctx.lineTo(X(0.63), Y(0.3)); ctx.lineTo(X(0.7), Y(0.47)); ctx.lineTo(X(0.73), Y(0.46)); ctx.lineTo(X(0.64), Y(0.17)); ctx.lineTo(X(0.53), Y(0.14)); ctx.closePath(); ctx.fill(); ctx.stroke();
    const breath = 1 + 0.06 * Math.sin(s.t * 1.6), beat = 1 + 0.1 * Math.max(0, Math.sin(s.t * 7));
    const quizId = s.quiz && !s.quiz.answered ? s.quiz.id : null;
    for (const [id, o] of organsIn(p.sys)) {
      const sel = id === p.organ && !quizId, flash = id === quizId && Math.sin(s.t * 8) > 0, sh = o[2];
      ctx.save(); ctx.globalAlpha = sel || flash ? 1 : 0.8;
      if (sh.e) {
        let [x, y, rx, ry, rot] = sh.e; const k = id === "lungs" ? breath : id === "heart" ? beat : 1;
        if (id === "lungs") { for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(X(x + side * 0.055), Y(y), W * 0.048 * k, H * ry * k, 0, 0, Math.PI * 2); ctx.fillStyle = o[3]; ctx.fill(); ctx.strokeStyle = sel || flash ? "#fab005" : "#c92a2a"; ctx.lineWidth = sel || flash ? 4 : 1.5; ctx.stroke(); } }
        else if (id === "kidneys" || id === "adrenal") { for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(X(x + side * rx * 0.7), Y(y), W * (id === "kidneys" ? 0.018 : 0.012), H * ry, 0, 0, Math.PI * 2); ctx.fillStyle = o[3]; ctx.fill(); ctx.strokeStyle = sel || flash ? "#fab005" : "#495057"; ctx.lineWidth = sel || flash ? 4 : 1; ctx.stroke(); } if (id === "kidneys") { line(ctx, X(0.455), Y(0.38), X(0.49), Y(0.48), "#ffd43b", 2); line(ctx, X(0.545), Y(0.38), X(0.51), Y(0.48), "#ffd43b", 2); } }
        else if (id === "ribs") { for (let r = 0; r < 6; r++) { ctx.beginPath(); ctx.ellipse(X(0.5), Y(0.205 + r * 0.022), W * (0.085 + r * 0.004), H * 0.02, 0, Math.PI * 0.05, Math.PI * 0.95); ctx.strokeStyle = sel || flash ? "#fab005" : "#adb5bd"; ctx.lineWidth = sel || flash ? 5 : 3; ctx.stroke(); } line(ctx, X(0.5), Y(0.19), X(0.5), Y(0.33), "#adb5bd", 4); }
        else if (id === "skull") { ctx.beginPath(); ctx.ellipse(X(x), Y(y), W * rx, H * ry, 0, 0, Math.PI * 2); ctx.strokeStyle = sel || flash ? "#fab005" : "#adb5bd"; ctx.lineWidth = sel || flash ? 6 : 4; ctx.stroke(); }
        else if (id === "smallint") { ctx.strokeStyle = sel || flash ? "#fab005" : o[3]; ctx.lineWidth = sel || flash ? 7 : 5; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const a = i * 0.42, r = 0.4 + 0.6 * (i / 120); ctx.lineTo(X(x + Math.cos(a) * rx * r), Y(y + Math.sin(a) * ry * r)); } ctx.stroke(); }
        else { ctx.beginPath(); ctx.ellipse(X(x), Y(y), W * rx * k, H * ry * k, rot, 0, Math.PI * 2); ctx.fillStyle = o[3]; ctx.fill(); ctx.strokeStyle = sel || flash ? "#fab005" : "rgba(0,0,0,.35)"; ctx.lineWidth = sel || flash ? 4 : 1; ctx.stroke(); }
      } else {
        const pts = sh.l, mirror = ["nerves", "arteries", "veins", "bones", "legbones"].includes(id);
        for (const m of mirror ? [1, -1] : [1]) {
          ctx.beginPath(); pts.forEach(([x, y], i) => { const xx = X(m === 1 ? x : 1 - x); i ? ctx.lineTo(xx, Y(y)) : ctx.moveTo(xx, Y(y)); });
          ctx.strokeStyle = sel || flash ? "#fab005" : o[3]; ctx.lineWidth = sel || flash ? 8 : id === "largeint" ? 9 : 5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
        }
      }
      ctx.restore();
      // moving things: blood cells, impulses, food
      if (p.sys === "circulatory" && id === "arteries") for (let k = 0; k < 6; k++) { const f = (s.t * 0.3 + k / 6) % 1, i = Math.floor(f * 3), u = f * 3 - i, a = sh.l[i], b = sh.l[i + 1]; for (const m of [1, -1]) circle(ctx, X(m === 1 ? Sim.lerp(a[0], b[0], u) : 1 - Sim.lerp(a[0], b[0], u)), Y(Sim.lerp(a[1], b[1], u)), 3, "#fff"); }
      if (p.sys === "nervous" && id === "spine") { const f = (s.t * 0.5) % 1; circle(ctx, X(0.5), Y(Sim.lerp(0.13, 0.47, f)), 5, "#ffd43b", "#e67700", 1.5); }
      if (p.sys === "digestive" && id === "oesophagus") { const f = (s.t * 0.25) % 1; circle(ctx, X(Sim.lerp(0.505, 0.51, f)), Y(Sim.lerp(0.13, 0.3, f)), 5, "#8d6e63"); }
      // label
      if (p.labels && !quizId) {
        const c = sh.e ? [sh.e[0], sh.e[1]] : sh.l[Math.floor(sh.l.length / 2)], right = c[0] >= 0.5, lx = right ? 0.8 : 0.2;
        line(ctx, X(c[0]), Y(c[1]), X(lx + (right ? -0.02 : 0.02)), Y(c[1]), "rgba(0,0,0,.25)", 1);
        text(ctx, o[1].replace(/ \(.*\)/, ""), X(lx), Y(c[1]) + 4, { align: right ? "left" : "right", size: 12, weight: id === p.organ ? 800 : 500, color: id === p.organ ? C.text : C.muted });
      }
    }
    if (quizId) text(ctx, "Which organ is flashing?", W / 2, H - 14, { align: "center", weight: 800, size: 15, color: C.purple });
  },
  read(s, p) { const o = ORGANS[p.organ]; return { name: o[1], job: o[4], more: o[5] }; },
  keyIdea: "<b>Key idea:</b> organs work together in organ systems. For example, the digestive system breaks food down, the circulatory system carries it around the body, and the respiratory system supplies the oxygen cells need to release its energy.",
  tryThis: ["Follow a piece of food: mouth → oesophagus → stomach → small intestine → large intestine.", "Which two systems work together to get oxygen to your muscles?", "Use Quiz me until you can name every organ in the digestive system."],
});

// ----- extra page parts: related simulations and the quiz -----
panel = document.createElement("section");
panel.className = "card body-panel";
panel.style.marginTop = "14px";
document.querySelector("main .grid").after(panel);
function setSelect(id, value, p) { const el = document.getElementById(id); el.value = value; p[id] = value; }
function syncOrganList(p) {
  // Rebuild the organ menu so it lists only this system's organs.
  const sel = document.getElementById("organ"), keep = ORGANS[p.organ] && ORGANS[p.organ][0] === p.sys ? p.organ : organsIn(p.sys)[0][0];
  sel.replaceChildren(...organsIn(p.sys).map(([k, o]) => { const op = document.createElement("option"); op.value = k; op.textContent = o[1]; return op; }));
  sel.value = keep; p.organ = keep;
}
function renderPanel(s, p) {
  if (!panel) return;
  const o = ORGANS[p.organ], titles = Object.fromEntries((window.CATALOG || []).map((c) => [c.id, c.title]));
  let html = `<p style="margin:0 0 4px;font-weight:700">Explore the ${o[1].toLowerCase()} in a simulation:</p><ul style="margin:0;padding-left:20px">${o[6].map((id) => `<li><a target="_top" href="../#biology/${id}">${titles[id] || id.replace(/-/g, " ")}</a></li>`).join("")}</ul>`;
  if (s.quiz) html += quizHtml(s);
  panel.innerHTML = html;
  panel.querySelectorAll("[data-answer]").forEach((b) => b.addEventListener("click", () => { answerQuiz(s, p, b.dataset.answer); renderPanel(s, p); }));
}
function startQuiz(s, p) {
  const list = organsIn(p.sys), pick = list[Math.floor(Math.random() * list.length)][0];
  const others = list.map((x) => x[0]).filter((x) => x !== pick).sort(() => Math.random() - 0.5).slice(0, 2);
  s.quiz = { id: pick, options: [pick, ...others].sort(() => Math.random() - 0.5), answered: false, correct: null, score: (s.quiz?.score || 0), total: (s.quiz?.total || 0) };
  renderPanel(s, p);
}
function answerQuiz(s, p, id) {
  if (!s.quiz || s.quiz.answered) return;
  s.quiz.answered = true; s.quiz.total++; s.quiz.correct = id === s.quiz.id; if (s.quiz.correct) s.quiz.score++;
  setSelect("organ", s.quiz.id, p);
}
function quizHtml(s) {
  const z = s.quiz;
  let h = `<div style="margin-top:12px;padding:10px 12px;border-radius:10px;background:#f3f0ff;border:2px solid #b197fc"><b>Quiz</b> · score ${z.score} / ${z.total}<br>`;
  if (!z.answered) h += `Which organ is flashing? Click it on the body, or choose:<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${z.options.map((id) => `<button type="button" data-answer="${id}" style="font:inherit;padding:8px 12px;border-radius:8px;border:1px solid #7048e8;background:#fff;cursor:pointer">${ORGANS[id][1]}</button>`).join("")}</div>`;
  else h += z.correct ? `<span style="color:#2b8a3e;font-weight:800">✓ Correct! It's the ${ORGANS[z.id][1].toLowerCase()}.</span>` : `<span style="color:#e03131;font-weight:800">Not quite: it's the ${ORGANS[z.id][1].toLowerCase()}.</span>`;
  return h + (z.answered ? ` Press <b>Quiz me</b> for another.` : "") + "</div>";
}
renderPanel(pageState.s, pageState.p);
