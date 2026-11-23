/*
 * Learning Support toolbar: helps students with dyslexia, attention difficulties,
 * low vision or other learning needs use any simulation, lab or tool page.
 *
 *  🔊 Read aloud     reads the page in simple words (uses the device's built-in voice; works offline)
 *  🔢 Say numbers    reads the live readings
 *  📖 Simple words   short, plain explanation and key words for the topic (window.EASY)
 *  👣 Guided steps   one instruction at a time, highlighting the control to use (window.HOWTO)
 *  🅰 Easy reading   bigger text, wider spacing, calm background, dyslexia-friendly font
 *  🎯 Focus          hides everything except the simulation and the current step
 *  🐢 Slow motion    runs animations at 40% speed
 *
 * Settings are remembered on the device.
 */
(function () {
  // Load the toolbar's stylesheet from the same folder as this script.
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = new URL("support.css", document.currentScript ? document.currentScript.src : location.href).href;
  document.head.append(css);
  const id = new URLSearchParams(location.search).get("sim") || new URLSearchParams(location.search).get("lab") || document.body.dataset.sim || "";
  const EASY = (window.EASY || {})[id];
  const STEPS = ((window.HOWTO || {})[id] || []).slice();
  const KEY = "sim-studio-support";
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} };
  const main = document.querySelector("main");
  if (!main) return;
  const h1 = main.querySelector("h1");

  const plain = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " ").trim(); };
  const make = (tag, attrs = {}, html = "") => { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (html) n.innerHTML = html; return n; };
  // ----- "More ways to learn": links to the topic's virtual lab and tools (data in ../extras.js) -----
  (function moreWays() {
    const base = new URL("../", document.currentScript ? document.currentScript.src : location.href).href;
    let links = ((window.EXTRAS || {})[id] || []).slice();
    const idx = window.EXTRAS_INDEX;
    const isLab = new URLSearchParams(location.search).has("lab");
    if (isLab && idx && idx.LABS[id]) links = idx.LABS[id][1].map((t) => { const e = (window.CATALOG || []).find((c) => c.subject + "/" + c.id === t); return { icon: "🖥️", label: "Simulation: " + (e ? e.title : t.split("/")[1].replace(/-/g, " ")), href: e ? "../" + e.file : "view.html?sim=" + t, note: e ? e.summary : "Explore the idea behind this practical." }; });
    else if (isLab) links = [];
    if (!links.length) return;
    const box = make("section", { class: "more-ways", "aria-label": "More ways to learn" }, "<h2>More ways to learn this topic</h2>");
    const list = make("div", { class: "mw-list" });
    for (const l of links) { const a = make("a", { class: "mw-link", href: base + l.href, target: "_top" }, `<span class="mw-icon" aria-hidden="true">${l.icon}</span><span><b>${l.label}</b><small>${l.note}</small></span>`); list.append(a); }
    box.append(list);
    const after = main.querySelector(".howto") || main.querySelector(".intro") || h1;
    if (after) after.after(box); else main.prepend(box);
  })();

  // ----- speech -----
  const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  let speaking = false;
  function speak(parts) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const text = parts.filter(Boolean).join(". ").replace(/\.\s*\./g, ".");
    const chunks = text.match(/[^.!?]+[.!?]*/g) || [text]; // short chunks avoid cut-offs on some phones
    speaking = true; updateSpeakButton();
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c.trim());
      u.rate = prefs.slowVoice ? 0.75 : 0.95;
      u.lang = document.documentElement.lang || "en";
      if (i === chunks.length - 1) u.onend = u.onerror = () => { speaking = false; updateSpeakButton(); };
      speechSynthesis.speak(u);
    });
  }
  function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); speaking = false; updateSpeakButton(); }
  function readPage() {
    const title = h1 ? h1.textContent : document.title;
    const words = EASY ? [EASY[0], "Key words. " + EASY[1].map(([w, m]) => `${w}: ${m}`).join(". ")] : [plain(main.querySelector(".intro")?.innerHTML || "")];
    const steps = STEPS.length ? ["How to use it. " + STEPS.map((s, i) => `Step ${i + 1}. ${plain(s)}`).join(" ")] : [];
    speak([title, ...words, ...steps]);
  }
  function readNumbers() {
    const items = [...document.querySelectorAll(".readout")].map((r) => `${r.querySelector("span")?.textContent}: ${r.querySelector("b")?.textContent}`);
    speak(items.length ? items : ["There are no numbers to read on this page."]);
  }

  // ----- toolbar -----
  const bar = make("div", { class: "sp-bar", role: "toolbar", "aria-label": "Learning support" });
  const btn = (key, icon, label, onClick, title) => {
    const b = make("button", { type: "button", class: "sp-btn", "data-key": key, title: title || label, "aria-pressed": "false" }, `<span aria-hidden="true">${icon}</span> ${label}`);
    b.addEventListener("click", onClick);
    bar.append(b);
    return b;
  };
  const speakBtn = canSpeak ? btn("speak", "🔊", "Read aloud", () => (speaking ? stopSpeaking() : readPage()), "Read this page aloud in simple words") : null;
  if (canSpeak && document.querySelector(".readout")) btn("numbers", "🔢", "Say numbers", readNumbers, "Read the live numbers aloud");
  function updateSpeakButton() { if (speakBtn) speakBtn.innerHTML = speaking ? `<span aria-hidden="true">⏹</span> Stop reading` : `<span aria-hidden="true">🔊</span> Read aloud`; }
  const toggles = {
    words: EASY ? btn("words", "📖", "Simple words", () => toggle("words"), "Show a short, simple explanation") : null,
    guide: STEPS.length ? btn("guide", "👣", "Guided steps", () => toggle("guide"), "Show one step at a time") : null,
    easy: btn("easy", "🅰", "Easy reading", () => toggle("easy"), "Bigger text, wider spacing, calm colours"),
    focus: btn("focus", "🎯", "Focus", () => toggle("focus"), "Hide everything except the simulation"),
    slow: window.Sim ? btn("slow", "🐢", "Slow motion", () => toggle("slow"), "Run animations more slowly") : null,
  };
  main.prepend(bar);

  // ----- simple words panel -----
  let wordsPanel = null;
  if (EASY) {
    wordsPanel = make("section", { class: "sp-words", "aria-label": "In simple words" });
    wordsPanel.innerHTML = `<h2>📖 In simple words</h2><p class="sp-summary"></p><h3>Key words</h3><dl></dl>`;
    wordsPanel.querySelector(".sp-summary").textContent = EASY[0];
    const dl = wordsPanel.querySelector("dl");
    for (const [w, m] of EASY[1]) { dl.append(make("dt", {}, ""), make("dd", {}, "")); dl.lastChild.previousSibling.textContent = w; dl.lastChild.textContent = m; }
    const say = make("button", { type: "button", class: "sp-mini" }, "🔊 Read this");
    say.addEventListener("click", () => speak([EASY[0], ...EASY[1].map(([w, m]) => `${w}: ${m}`)]));
    wordsPanel.querySelector("h2").append(say);
    (h1 || bar).after(wordsPanel);
  }

  // ----- guided steps -----
  let guide = null, stepIndex = 0, highlighted = [];
  function clearHighlight() { highlighted.forEach((n) => n.classList.remove("sp-highlight")); highlighted = []; }
  function highlightFor(stepHtml) {
    clearHighlight();
    const names = [...stepHtml.matchAll(/<b>(.*?)<\/b>/g)].map((m) => plain(m[1]).toLowerCase()).filter((t) => t.length > 1);
    const candidates = [...document.querySelectorAll(".ctrl, .buttons button, .readout, .lab-actions button")];
    for (const name of names) {
      const hit = candidates.find((n) => {
        const label = (n.matches(".ctrl") ? n.querySelector("label")?.firstChild?.textContent || n.querySelector("label")?.textContent : n.matches(".readout") ? n.querySelector("span")?.textContent : n.textContent) || "";
        const l = label.toLowerCase().trim();
        return l && (l.startsWith(name) || name.startsWith(l) || l.includes(name));
      });
      if (hit && !highlighted.includes(hit)) { hit.classList.add("sp-highlight"); highlighted.push(hit); }
    }
    if (highlighted[0]) highlighted[0].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function showStep() {
    const s = STEPS[stepIndex];
    guide.querySelector(".sp-count").textContent = `Step ${stepIndex + 1} of ${STEPS.length}`;
    guide.querySelector(".sp-step").innerHTML = s;
    guide.querySelector(".sp-prev").disabled = stepIndex === 0;
    guide.querySelector(".sp-next").textContent = stepIndex === STEPS.length - 1 ? "Finish ✓" : "Next ▶";
    highlightFor(s);
    if (prefs.autoRead) speak([`Step ${stepIndex + 1}`, plain(s)]);
  }
  if (STEPS.length) {
    guide = make("div", { class: "sp-guide", role: "region", "aria-label": "Guided steps", "aria-live": "polite" });
    guide.innerHTML = `<div class="sp-count"></div><div class="sp-step"></div>
      <div class="sp-guide-buttons"><button type="button" class="sp-prev">◀ Back</button>${canSpeak ? '<button type="button" class="sp-read">🔊 Read step</button>' : ""}<button type="button" class="sp-next">Next ▶</button></div>
      ${canSpeak ? '<label class="sp-auto"><input type="checkbox"> Read each step automatically</label>' : ""}`;
    guide.querySelector(".sp-prev").addEventListener("click", () => { stepIndex = Math.max(0, stepIndex - 1); showStep(); });
    guide.querySelector(".sp-next").addEventListener("click", () => { if (stepIndex < STEPS.length - 1) { stepIndex++; showStep(); } else toggle("guide", false); });
    guide.querySelector(".sp-read")?.addEventListener("click", () => speak([`Step ${stepIndex + 1}`, plain(STEPS[stepIndex])]));
    const auto = guide.querySelector(".sp-auto input");
    if (auto) { auto.checked = !!prefs.autoRead; auto.addEventListener("input", () => { prefs.autoRead = auto.checked; save(); }); }
    document.body.append(guide);
  }

  // ----- toggles -----
  function apply() {
    document.body.classList.toggle("sp-easy", !!prefs.easy);
    document.body.classList.toggle("sp-focus", !!prefs.focus);
    if (window.Sim) window.Sim.speed = prefs.slow ? 0.4 : 1;
    if (wordsPanel) wordsPanel.hidden = !prefs.words;
    if (guide) { guide.hidden = !prefs.guide; document.body.classList.toggle("sp-guiding", !!prefs.guide); if (prefs.guide) showStep(); else clearHighlight(); }
    for (const [k, b] of Object.entries(toggles)) if (b) b.setAttribute("aria-pressed", String(!!prefs[k]));
    window.dispatchEvent(new Event("resize")); // let canvases re-measure after layout changes
  }
  function toggle(k, force) { prefs[k] = force ?? !prefs[k]; if (k === "guide" && prefs.guide) stepIndex = 0; save(); apply(); }
  // "Guided steps" always starts closed on a new page, so it doesn't surprise anyone.
  prefs.guide = false;
  apply();
})();
