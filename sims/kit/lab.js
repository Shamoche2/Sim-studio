/*
 * Virtual lab engine, built on the Sim kit.
 *
 * Lab({
 *   title, aim, equipment: [..], safety: [..], method: [..],      // shown in the lab sheet; method drives "Guided steps"
 *   ...any Sim options (controls, buttons, init, step, draw, readouts, read)
 *   record(s, p)  -> a row object for the results table, or a string explaining why nothing can be recorded yet
 *   table: { cols: [{ key, label, unit, digits }], x, y, xlabel, ylabel, fit: "line" | "origin" | "none", xmin, ymin },
 *   derived(rows) -> optional { label: value } summary from the results (e.g. gradient → g)
 *   questions: [{ q, options: [..], answer: index, why }],
 *   conclusion: "…"                                                 // shown as the Key idea
 * })
 */
(function () {
  const C = Sim.C;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function fitLine(pts, throughOrigin) {
    const n = pts.length; if (n < 2) return null;
    if (throughOrigin) { const sxy = pts.reduce((a, [x, y]) => a + x * y, 0), sxx = pts.reduce((a, [x]) => a + x * x, 0); return sxx ? { m: sxy / sxx, c: 0 } : null; }
    const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    const sxx = pts.reduce((a, [x]) => a + (x - mx) ** 2, 0); if (!sxx) return null;
    const m = pts.reduce((a, [x, y]) => a + (x - mx) * (y - my), 0) / sxx; return { m, c: my - m * mx };
  }

  window.Lab = function Lab(cfg) {
    const id = new URLSearchParams(location.search).get("lab") || cfg.id;
    window.HOWTO = window.HOWTO || {}; window.HOWTO[id] = cfg.method;
    if (cfg.easy) { window.EASY = window.EASY || {}; window.EASY[id] = cfg.easy; }
    const rows = [];
    let api, lastMsg = "";

    api = Sim({
      ...cfg,
      intro: `<b>Aim:</b> ${cfg.aim}`,
      howToTitle: "Method",
      keyIdea: cfg.conclusion ? `<b>Conclusion:</b> ${cfg.conclusion}` : "",
      tryThis: null,
      buttons: [
        ...(cfg.buttons || []),
        ...(cfg.record ? [{ label: "Record result", primary: true, click(s, p) { const r = cfg.record(s, p); if (typeof r === "string") lastMsg = r; else if (r) { rows.push(r); lastMsg = ""; } renderResults(); } }] : []),
      ],
    });

    // ----- lab sheet: equipment and safety (before the bench) -----
    const main = document.querySelector("main"), grid = main.querySelector(".grid");
    const sheet = document.createElement("section");
    sheet.className = "lab-info card";
    sheet.innerHTML = `<div class="lab-cols"><div><h2>🧰 Equipment</h2><ul>${cfg.equipment.map((e) => `<li>${e}</li>`).join("")}</ul></div>
      <div><h2>⚠️ Safety</h2><ul>${(cfg.safety || ["Follow your teacher's instructions."]).map((e) => `<li>${e}</li>`).join("")}</ul></div></div>`;
    grid.before(sheet);

    // ----- results table and graph -----
    const results = document.createElement("section");
    results.className = "card lab-results";
    results.innerHTML = `<h2>📋 Results</h2><p class="lab-msg" role="status"></p><div class="lab-table-wrap"><table class="lab-table"></table></div>
      <div class="lab-actions"><button type="button" class="secondary" data-act="undo">Delete last row</button><button type="button" class="secondary" data-act="clear">Clear table</button><button type="button" class="secondary" data-act="copy">Copy table</button></div>
      ${cfg.table.x ? '<div class="lab-graph"><canvas></canvas></div>' : ""}<div class="lab-derived"></div>`;
    grid.after(results);
    results.querySelector('[data-act="undo"]').addEventListener("click", () => { rows.pop(); renderResults(); });
    results.querySelector('[data-act="clear"]').addEventListener("click", () => { rows.length = 0; renderResults(); });
    results.querySelector('[data-act="copy"]').addEventListener("click", async (e) => {
      const tsv = [cfg.table.cols.map((c) => c.label + (c.unit ? ` (${c.unit})` : "")).join("\t"), ...rows.map((r) => cfg.table.cols.map((c) => fmt(r[c.key], c)).join("\t"))].join("\n");
      try { await navigator.clipboard.writeText(tsv); e.target.textContent = "Copied!"; } catch (err) { e.target.textContent = "Copy failed"; }
      setTimeout(() => (e.target.textContent = "Copy table"), 1500);
    });
    const fmt = (v, c) => (typeof v === "number" ? (c.digits != null ? v.toFixed(c.digits) : String(+v.toPrecision(4))) : v ?? "");

    function renderResults() {
      const t = cfg.table;
      results.querySelector(".lab-msg").textContent = lastMsg;
      results.querySelector(".lab-table").innerHTML = `<thead><tr>${t.cols.map((c) => `<th>${esc(c.label)}${c.unit ? `<br><small>(${esc(c.unit)})</small>` : ""}</th>`).join("")}</tr></thead>
        <tbody>${rows.length ? rows.map((r) => `<tr>${t.cols.map((c) => `<td>${esc(fmt(r[c.key], c))}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${t.cols.length}" class="lab-empty">No results yet. Do the experiment, then press <b>Record result</b>.</td></tr>`}</tbody>`;
      if (t.x) drawGraph();
      const d = cfg.derived ? cfg.derived(rows) : null;
      results.querySelector(".lab-derived").innerHTML = d ? Object.entries(d).map(([k, v]) => `<div class="readout"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("") : "";
    }

    function drawGraph() {
      const t = cfg.table, cv = results.querySelector(".lab-graph canvas"), wrap = cv.parentElement, r = wrap.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      if (!r.width) return;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const pts = rows.map((row) => [typeof t.x === "function" ? t.x(row) : row[t.x], typeof t.y === "function" ? t.y(row) : row[t.y]]).filter(([a, b]) => isFinite(a) && isFinite(b));
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const xmax = Math.max(t.xmax ?? 0, ...xs, 1e-9) * 1.1, ymax = Math.max(t.ymax ?? 0, ...ys, 1e-9) * 1.15;
      const xmin = t.xmin ?? Math.min(0, ...xs), ymin = t.ymin ?? Math.min(0, ...ys);
      const fit = t.fit && t.fit !== "none" ? fitLine(pts, t.fit === "origin") : null;
      const series = fit ? [{ data: [[xmin, fit.m * xmin + fit.c], [xmax, fit.m * xmax + fit.c]], color: C.orange, width: 2, dash: [6, 4], label: "line of best fit" }] : [];
      Sim.plot(ctx, { x: 0, y: 0, w: r.width, h: r.height }, { title: t.title || "Graph of results", xmin, xmax, ymin, ymax, xlabel: t.xlabel, ylabel: t.ylabel, series, marks: pts.map(([x, y]) => ({ x, y, color: C.blue, r: 5 })) });
      if (!pts.length) Sim.text(ctx, "Your results will be plotted here", r.width / 2, r.height / 2, { align: "center", color: C.muted });
    }
    window.addEventListener("resize", () => cfg.table.x && drawGraph());
    if (cfg.table.x) new ResizeObserver(drawGraph).observe(results.querySelector(".lab-graph"));
    renderResults();

    // ----- conclusion questions -----
    if (cfg.questions && cfg.questions.length) {
      const qs = document.createElement("section");
      qs.className = "card lab-questions";
      qs.innerHTML = `<h2>❓ Questions</h2>` + cfg.questions.map((q, i) => `<fieldset class="lab-q"><legend>${i + 1}. ${q.q}</legend>${q.options.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join("")}<p class="lab-feedback" aria-live="polite"></p></fieldset>`).join("") + `<button type="button" class="lab-check">Check my answers</button><p class="lab-score" aria-live="polite"></p>`;
      results.after(qs);
      qs.querySelector(".lab-check").addEventListener("click", () => {
        let score = 0;
        cfg.questions.forEach((q, i) => {
          const pick = qs.querySelector(`input[name=q${i}]:checked`), fb = qs.querySelectorAll(".lab-feedback")[i];
          if (!pick) { fb.textContent = "Choose an answer."; fb.className = "lab-feedback"; return; }
          const ok = +pick.value === q.answer; if (ok) score++;
          fb.innerHTML = (ok ? "✓ Correct. " : `✗ Not quite. The answer is: <b>${q.options[q.answer]}</b>. `) + (q.why || "");
          fb.className = "lab-feedback " + (ok ? "ok" : "no");
        });
        qs.querySelector(".lab-score").textContent = `Score: ${score} / ${cfg.questions.length}`;
      });
    }
    return { api, rows, render: renderResults };
  };

  // Random measurement error, so repeated readings differ slightly like real ones.
  Lab.noise = (value, fraction) => value * (1 + Sim.randn() * fraction);
  Lab.round = (v, step) => Math.round(v / step) * step;
})();
