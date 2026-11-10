const $ = (id) => document.getElementById(id);
const els = {
  form: $("gen-form"), topic: $("topic"), grade: $("grade"), genBtn: $("gen-btn"),
  library: $("library"), title: $("sim-title"), meta: $("sim-meta"),
  regen: $("regen-btn"), share: $("share-link"), copy: $("copy-btn"),
  viewer: $("viewer"), status: $("status"), statusText: $("status-text"), statusSub: $("status-sub"),
  cancel: $("cancel-btn"), empty: $("empty"),
  reviseForm: $("revise-form"), change: $("change"), reviseBtn: $("revise-btn"),
  error: $("error"), banner: $("demo-banner"),
};

const GRADE_LABELS = { elementary: "Elementary", middle: "Middle school", high: "High school", university: "University" };
const SIM_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:";

let current = null; // { meta, html }
let controller = null;
let timer = null;

// Belt and braces: the iframe is already sandboxed, and this CSP also blocks any network access.
function withCsp(html) {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${SIM_CSP}">`;
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + meta) : meta + html;
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = !message;
}

function setBusy(busy, label = "Building your simulation…") {
  els.status.hidden = !busy;
  els.genBtn.disabled = busy;
  els.reviseBtn.disabled = busy || !current;
  els.regen.disabled = busy || !current || current.meta.sample;
  clearInterval(timer);
  if (busy) {
    const started = Date.now();
    els.statusText.textContent = label;
    els.statusSub.textContent = "This usually takes 20–60 seconds.";
    els.empty.hidden = true;
    timer = setInterval(() => {
      const s = Math.round((Date.now() - started) / 1000);
      els.statusSub.dataset.elapsed = `${s}s`;
      els.statusSub.textContent = `${s}s elapsed${els.statusSub.dataset.progress ?? ""}`;
    }, 500);
  } else {
    delete els.statusSub.dataset.progress;
  }
}

function show(sim, note = "") {
  current = sim;
  const { meta } = sim;
  els.viewer.srcdoc = withCsp(sim.html);
  els.empty.hidden = true;
  els.title.textContent = meta.topic;
  const bits = [GRADE_LABELS[meta.grade] ?? meta.grade];
  if (meta.sample) bits.push("built-in sample");
  if (meta.change) bits.push(`revised: “${meta.change}”`);
  if (note) bits.push(note);
  els.meta.textContent = bits.join(" · ");

  const link = `${location.origin}/sim/${encodeURIComponent(meta.id)}`;
  els.share.href = link;
  els.share.setAttribute("aria-disabled", "false");
  els.copy.disabled = false;
  els.copy.dataset.link = link;
  els.change.disabled = false;
  els.reviseBtn.disabled = false;
  els.regen.disabled = meta.sample;
  history.replaceState(null, "", `#${meta.id}`);
  renderLibrary();
}

async function openSim(id, note) {
  showError("");
  const res = await fetch(`/api/sims/${encodeURIComponent(id)}`);
  if (!res.ok) return showError("That simulation couldn't be found.");
  show(await res.json(), note);
}

let libraryCache = [];
async function loadLibrary() {
  libraryCache = await (await fetch("/api/library")).json();
  renderLibrary();
}

function renderLibrary() {
  els.library.replaceChildren(
    ...libraryCache.map((item) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      const name = document.createElement("span");
      name.textContent = item.change ? `${item.topic} (revised)` : item.topic;
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = item.sample ? "sample" : GRADE_LABELS[item.grade] ?? item.grade;
      btn.append(name, tag);
      btn.setAttribute("aria-current", String(current?.meta.id === item.id));
      btn.addEventListener("click", () => openSim(item.id));
      li.append(btn);
      return li;
    }),
  );
}

/** POST to /api/generate and read the newline-delimited JSON stream. */
async function generate(body, label) {
  showError("");
  controller = new AbortController();
  setBusy(true, label);
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    let finished = false;
    while (!finished) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      let nl;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        const event = JSON.parse(line);
        if (event.type === "progress") {
          els.statusText.textContent = "Writing the simulation…";
          els.statusSub.dataset.progress = ` · ${(event.chars / 1000).toFixed(1)}k characters written`;
        } else if (event.type === "done") {
          finished = true;
          await loadLibrary();
          await openSim(event.sim.id, event.cached ? "loaded instantly from library" : event.demo ? "demo mode" : "");
        } else if (event.type === "error") {
          finished = true;
          showError(event.message);
        }
      }
    }
    if (!finished) showError("The connection closed before the simulation finished. Please try again.");
  } catch (err) {
    if (err.name !== "AbortError") showError("Couldn't reach the server. Is it still running?");
  } finally {
    controller = null;
    setBusy(false);
    if (!current) els.empty.hidden = false;
  }
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const topic = els.topic.value.trim();
  if (topic) generate({ topic, grade: els.grade.value });
});

els.regen.addEventListener("click", () => {
  if (current) generate({ topic: current.meta.topic, grade: current.meta.grade, force: true }, "Building a fresh version…");
});

els.reviseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const change = els.change.value.trim();
  if (!change || !current) return;
  generate({ baseId: current.meta.id, change }, "Applying your changes…").then(() => {
    if (!els.error.textContent) els.change.value = "";
  });
});

els.cancel.addEventListener("click", () => controller?.abort());

els.copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.copy.dataset.link);
    els.copy.textContent = "Copied!";
  } catch {
    els.copy.textContent = "Copy failed";
  }
  setTimeout(() => (els.copy.textContent = "Copy student link"), 1500);
});

document.querySelectorAll(".chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    els.topic.value = chip.textContent;
    els.topic.focus();
  }),
);

(async function init() {
  const status = await (await fetch("/api/status")).json();
  els.banner.hidden = status.aiEnabled;
  await loadLibrary();
  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (fromHash) openSim(fromHash);
})();
