/*
 * Sim kit: shared page layout, controls, animation loop and drawing helpers
 * for every simulation in the library.
 *
 * Usage (in a simulation page):
 *   Sim({
 *     title, intro, note, keyIdea, tryThis: [...],
 *     aspect: 16 / 9,
 *     controls: [{ id, label, min, max, step, value, unit, digits, help }, { id, type: "select", options: [[value, label]] }, ...],
 *     readouts: [[id, label], ...],
 *     init(s, p)          -> set up state object s from params p
 *     step(s, p, dt)      -> advance (omit for static sims)
 *     draw(g, s, p)       -> g = { ctx, W, H }
 *     read(s, p)          -> { readoutId: "text" }
 *     change(s, p, id)    -> optional, a control changed; return true to re-run init
 *     pointer(s, p, ev)   -> optional, ev = { type: "down"|"move"|"up", x, y }
 *   });
 */
(function () {
  const C = {
    blue: "#2f6fed", red: "#e03131", green: "#2b8a3e", orange: "#e8590c", purple: "#7048e8",
    teal: "#0c8599", yellow: "#f2b705", pink: "#d6336c", brown: "#8d6e63", gray: "#868e96",
    text: "#1a2030", muted: "#5d667a", grid: "rgba(0,0,0,.08)", light: "#f1f3f5", sky: "#e7f0ff",
  };

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    for (const c of children) if (c != null) node.append(c);
    return node;
  }

  const fmtNum = (v, digits) => (digits == null ? String(v) : Number(v).toFixed(digits));

  function Sim(cfg) {
    document.title = cfg.title;
    const p = {};
    const outputs = {};
    const controlsBox = el("div", { class: "card", "aria-label": "Controls" });
    const animated = typeof cfg.step === "function";
    let running = animated && cfg.autoplay !== false;
    let s = {};

    // ----- controls -----
    for (const c of cfg.controls || []) {
      const wrap = el("div", { class: "ctrl" });
      if (c.type === "select") {
        const sel = el("select", { id: c.id });
        for (const [value, label] of c.options) sel.append(el("option", { value }, label));
        sel.value = c.value ?? c.options[0][0];
        wrap.append(el("label", { for: c.id }, c.label), sel);
        const read = () => (p[c.id] = isNaN(+sel.value) || sel.value === "" ? sel.value : +sel.value);
        read();
        sel.addEventListener("input", () => { read(); onChange(c.id); });
      } else if (c.type === "checkbox") {
        const box = el("input", { id: c.id, type: "checkbox" });
        box.checked = !!c.value;
        p[c.id] = box.checked;
        wrap.append(el("label", { class: "check", for: c.id }, box, " " + c.label));
        box.addEventListener("input", () => { p[c.id] = box.checked; onChange(c.id); });
      } else {
        const input = el("input", { id: c.id, type: "range", min: c.min, max: c.max, step: c.step ?? 1, value: c.value });
        const out = el("output", { for: c.id });
        outputs[c.id] = () => (out.textContent = (c.format ? c.format(p[c.id]) : fmtNum(p[c.id], c.digits)) + (c.unit ? " " + c.unit : ""));
        p[c.id] = +input.value;
        wrap.append(el("label", { for: c.id }, c.label, out), input);
        input.addEventListener("input", () => { p[c.id] = +input.value; outputs[c.id](); onChange(c.id); });
      }
      if (c.help) wrap.append(el("small", {}, c.help));
      controlsBox.append(wrap);
    }
    Object.values(outputs).forEach((f) => f());

    // ----- buttons -----
    const buttons = el("div", { class: "buttons" });
    let playBtn;
    if (animated) {
      playBtn = el("button", { type: "button" }, running ? "Pause" : "Play");
      playBtn.addEventListener("click", () => setRunning(!running));
      buttons.append(playBtn);
    }
    for (const b of cfg.buttons || []) {
      const btn = el("button", { type: "button", class: b.primary ? "" : "secondary" }, b.label);
      btn.addEventListener("click", () => { b.click(s, p, api); redraw(); });
      buttons.append(btn);
    }
    if (cfg.reset !== false && (animated || cfg.init)) {
      const r = el("button", { type: "button", class: "secondary" }, "Reset");
      r.addEventListener("click", () => { reset(); });
      buttons.append(r);
    }
    if (buttons.children.length) controlsBox.prepend(buttons);
    if (cfg.note) controlsBox.append(el("p", { class: "note" }, cfg.note));

    // ----- layout -----
    const canvas = el("canvas", { role: "img", "aria-label": cfg.canvasLabel || cfg.title });
    const stage = el("div", { class: "stage" }, canvas);
    stage.style.aspectRatio = String(cfg.aspect || 16 / 9);
    const readBox = el("div", { class: "readouts" });
    const readEls = {};
    for (const [id, label] of cfg.readouts || []) {
      const b = el("b", {}, "–");
      readEls[id] = b;
      readBox.append(el("div", { class: "readout" }, el("span", {}, label), b));
    }
    const main = el("main", {},
      el("h1", {}, cfg.title),
      el("p", { class: "intro", html: cfg.intro || "" }),
      el("div", { class: "grid" }, el("div", { class: "card" }, stage, readBox), controlsBox),
      el("div", { class: "key", html: cfg.keyIdea || "" }),
      cfg.tryThis ? el("section", { class: "try" }, el("h2", {}, "Try this"), el("ol", {}, ...cfg.tryThis.map((t) => el("li", { html: t })))) : null,
    );
    document.body.append(main);

    const ctx = canvas.getContext("2d");
    const g = { ctx, W: 0, H: 0 };

    function resize() {
      const r = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      g.W = r.width; g.H = r.height;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }

    function redraw() {
      if (!g.W) return;
      ctx.save();
      ctx.clearRect(0, 0, g.W, g.H);
      cfg.draw(g, s, p);
      ctx.restore();
      if (cfg.read) {
        const vals = cfg.read(s, p);
        for (const id in vals) if (readEls[id]) readEls[id].textContent = vals[id];
      }
    }

    function reset() {
      s = {};
      cfg.init?.(s, p);
      redraw();
    }

    function onChange(id) {
      if (cfg.change ? cfg.change(s, p, id) : cfg.resetOnChange) cfg.init?.((s = {}), p);
      redraw();
    }

    function setRunning(on) {
      running = on;
      if (playBtn) playBtn.textContent = running ? "Pause" : "Play";
      last = null;
    }

    // ----- pointer input -----
    if (cfg.pointer) {
      const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      let down = false;
      canvas.addEventListener("pointerdown", (e) => { down = true; canvas.setPointerCapture(e.pointerId); cfg.pointer(s, p, { type: "down", ...pos(e), W: g.W, H: g.H }); redraw(); });
      canvas.addEventListener("pointermove", (e) => { cfg.pointer(s, p, { type: down ? "drag" : "move", ...pos(e), W: g.W, H: g.H }); if (down) redraw(); });
      canvas.addEventListener("pointerup", (e) => { down = false; cfg.pointer(s, p, { type: "up", ...pos(e), W: g.W, H: g.H }); redraw(); });
    }

    // ----- loop -----
    let last = null;
    function frame(now) {
      if (running) {
        const dt = Math.min(0.05, ((now - (last ?? now)) / 1000) * (cfg.timeScale || 1));
        last = now;
        const n = cfg.substeps || 1;
        for (let i = 0; i < n; i++) cfg.step(s, p, dt / n, api);
        redraw();
      }
      requestAnimationFrame(frame);
    }

    const api = { redraw, reset, setRunning, get running() { return running; }, p };
    cfg.init?.(s, p);
    new ResizeObserver(resize).observe(stage);
    if (animated) requestAnimationFrame(frame);
    return api;
  }

  // ----- drawing helpers -----
  Sim.C = C;
  Sim.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  Sim.lerp = (a, b, t) => a + (b - a) * t;
  Sim.rand = (a, b) => a + Math.random() * (b - a);
  Sim.randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  Sim.niceStep = (raw) => {
    if (!(raw > 0) || !isFinite(raw)) return 1;
    const pow = 10 ** Math.floor(Math.log10(raw)), n = raw / pow;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
  };

  Sim.text = (ctx, str, x, y, o = {}) => {
    ctx.save();
    ctx.font = `${o.weight || 400} ${o.size || 13}px system-ui, sans-serif`;
    ctx.fillStyle = o.color || C.text;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "alphabetic";
    if (o.rotate) { ctx.translate(x, y); ctx.rotate(o.rotate); ctx.fillText(str, 0, 0); }
    else ctx.fillText(str, x, y);
    ctx.restore();
  };

  Sim.circle = (ctx, x, y, r, fill, stroke, lw = 1.5) => {
    ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };

  Sim.line = (ctx, x1, y1, x2, y2, color = C.text, lw = 2, dash) => {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  };

  Sim.rect = (ctx, x, y, w, h, fill, stroke, r = 0, lw = 1.5) => {
    ctx.beginPath();
    if (r) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };

  Sim.arrow = (ctx, x1, y1, x2, y2, color = C.text, lw = 2, head = 9) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 1) return;
    const a = Math.atan2(y2 - y1, x2 - x1), h = Math.min(head, len * 0.6);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * h * 0.7, y2 - Math.sin(a) * h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42));
    ctx.lineTo(x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42));
    ctx.closePath(); ctx.fill(); ctx.restore();
  };

  /**
   * Line chart with axes and ticks.
   * box: { x, y, w, h }   o: { xmin, xmax, ymin, ymax, xlabel, ylabel, title, series: [{ data: [[x, y]], color, width, dash, label }], marks: [{x, y, color, r}], vlines: [{x, color, label}], hlines: [{y, color, label}] }
   * Returns { X, Y } mapping functions.
   */
  Sim.plot = (ctx, box, o) => {
    const padL = 44, padB = 34, padT = o.title ? 22 : 8, padR = 10;
    const x0 = box.x + padL, y0 = box.y + box.h - padB, w = box.w - padL - padR, h = box.h - padB - padT;
    const { xmin, xmax, ymin, ymax } = o;
    const X = (v) => x0 + ((v - xmin) / (xmax - xmin || 1)) * w;
    const Y = (v) => y0 - ((v - ymin) / (ymax - ymin || 1)) * h;
    ctx.save();
    Sim.rect(ctx, box.x, box.y, box.w, box.h, "#fff");
    if (o.title) Sim.text(ctx, o.title, box.x + 4, box.y + 15, { weight: 600, size: 13 });
    const xs = o.xstep || Sim.niceStep((xmax - xmin) / 6), ys = o.ystep || Sim.niceStep((ymax - ymin) / 5);
    ctx.lineWidth = 1;
    for (let v = Math.ceil(xmin / xs) * xs; v <= xmax + 1e-9; v += xs) {
      Sim.line(ctx, X(v), y0, X(v), y0 - h, C.grid, 1);
      Sim.text(ctx, +v.toFixed(6) + "", X(v), y0 + 14, { size: 11, color: C.muted, align: "center" });
    }
    for (let v = Math.ceil(ymin / ys) * ys; v <= ymax + 1e-9; v += ys) {
      Sim.line(ctx, x0, Y(v), x0 + w, Y(v), C.grid, 1);
      Sim.text(ctx, +v.toFixed(6) + "", x0 - 5, Y(v) + 4, { size: 11, color: C.muted, align: "right" });
    }
    Sim.line(ctx, x0, y0 - h, x0, y0, C.muted, 1.2);
    Sim.line(ctx, x0, y0, x0 + w, y0, C.muted, 1.2);
    if (o.xlabel) Sim.text(ctx, o.xlabel, x0 + w, y0 + 28, { size: 12, color: C.muted, align: "right" });
    if (o.ylabel) Sim.text(ctx, o.ylabel, box.x + 11, y0 - h / 2, { size: 12, color: C.muted, align: "center", rotate: -Math.PI / 2 });
    ctx.beginPath(); ctx.rect(x0, y0 - h - 2, w + 2, h + 4); ctx.clip();
    for (const l of o.hlines || []) { Sim.line(ctx, x0, Y(l.y), x0 + w, Y(l.y), l.color || C.gray, 1.5, [5, 4]); if (l.label) Sim.text(ctx, l.label, x0 + 4, Y(l.y) - 4, { size: 11, color: l.color || C.gray }); }
    for (const l of o.vlines || []) { Sim.line(ctx, X(l.x), y0, X(l.x), y0 - h, l.color || C.gray, 1.5, [5, 4]); if (l.label) Sim.text(ctx, l.label, X(l.x) + 4, y0 - h + 12, { size: 11, color: l.color || C.gray }); }
    for (const sr of o.series || []) {
      if (!sr.data.length) continue;
      ctx.strokeStyle = sr.color || C.blue; ctx.lineWidth = sr.width || 2.5; ctx.setLineDash(sr.dash || []);
      ctx.beginPath();
      sr.data.forEach(([a, b], i) => (i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b))));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const m of o.marks || []) Sim.circle(ctx, X(m.x), Y(m.y), m.r || 5, m.color || C.text, "#fff", 2);
    ctx.restore();
    const legend = (o.series || []).filter((sr) => sr.label);
    let lx = x0 + 8;
    for (const sr of legend) {
      Sim.rect(ctx, lx, y0 - h + 4, 12, 4, sr.color || C.blue);
      Sim.text(ctx, sr.label, lx + 16, y0 - h + 10, { size: 11, color: C.text });
      ctx.font = "11px system-ui"; lx += 28 + ctx.measureText(sr.label).width;
    }
    return { X, Y, x0, y0, w, h };
  };

  /** Bar chart. bars: [{ label, value, color }] */
  Sim.bars = (ctx, box, bars, o = {}) => {
    const max = o.max ?? Math.max(1e-9, ...bars.map((b) => b.value));
    const padB = 30, padT = o.title ? 22 : 6;
    const bw = box.w / bars.length;
    if (o.title) Sim.text(ctx, o.title, box.x + 4, box.y + 15, { weight: 600 });
    bars.forEach((b, i) => {
      const h = (Math.max(0, b.value) / max) * (box.h - padB - padT - 14);
      const x = box.x + i * bw + bw * 0.15, y = box.y + box.h - padB - h;
      Sim.rect(ctx, x, y, bw * 0.7, h, b.color || C.blue, null, 4);
      Sim.text(ctx, b.label, x + bw * 0.35, box.y + box.h - padB + 16, { size: 12, align: "center", color: C.muted });
      Sim.text(ctx, o.fmt ? o.fmt(b.value) : String(b.value), x + bw * 0.35, y - 4, { size: 12, align: "center", weight: 600 });
    });
  };

  /**
   * Particle helpers for gases, liquids, diffusion and reactions.
   * Particles: { x, y, vx, vy, r, type }. Units are canvas-independent "world" units.
   */
  Sim.particles = {
    make(n, box, speed, props = {}) {
      return Array.from({ length: n }, () => {
        const a = Math.random() * Math.PI * 2, v = speed * (0.5 + Math.random());
        return { x: Sim.rand(box.x0 + 1, box.x1 - 1), y: Sim.rand(box.y0 + 1, box.y1 - 1), vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1, ...props };
      });
    },
    /** Move and bounce off walls. Returns total wall impulse (for pressure). */
    move(parts, dt, box) {
      let impulse = 0;
      for (const q of parts) {
        q.x += q.vx * dt; q.y += q.vy * dt;
        const m = q.m || 1;
        if (q.x < box.x0 + q.r) { q.x = box.x0 + q.r; impulse += 2 * m * Math.abs(q.vx); q.vx = Math.abs(q.vx); }
        if (q.x > box.x1 - q.r) { q.x = box.x1 - q.r; impulse += 2 * m * Math.abs(q.vx); q.vx = -Math.abs(q.vx); }
        if (q.y < box.y0 + q.r) { q.y = box.y0 + q.r; impulse += 2 * m * Math.abs(q.vy); q.vy = Math.abs(q.vy); }
        if (q.y > box.y1 - q.r) { q.y = box.y1 - q.r; impulse += 2 * m * Math.abs(q.vy); q.vy = -Math.abs(q.vy); }
      }
      return impulse;
    },
    /** Elastic collisions between particles (grid-accelerated). onHit(a, b) may return true to skip the bounce. */
    collide(parts, onHit) {
      const cell = 4, grid = new Map();
      parts.forEach((q, i) => { const k = ((q.x / cell) | 0) + "," + ((q.y / cell) | 0); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
      for (const [k, list] of grid) {
        const [cx, cy] = k.split(",").map(Number);
        for (let dx = 0; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy < 0) continue;
          const other = dx || dy ? grid.get(cx + dx + "," + (cy + dy)) : list;
          if (!other) continue;
          for (const i of list) for (const j of other) {
            if ((dx || dy) ? false : j <= i) continue;
            const a = parts[i], b = parts[j];
            const ddx = b.x - a.x, ddy = b.y - a.y, d2 = ddx * ddx + ddy * ddy, rr = a.r + b.r;
            if (d2 >= rr * rr || d2 === 0) continue;
            if (onHit && onHit(a, b)) continue;
            const d = Math.sqrt(d2), nx = ddx / d, ny = ddy / d, ma = a.m || 1, mb = b.m || 1;
            const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (rel <= 0) continue;
            const imp = (2 * rel) / (ma + mb);
            a.vx -= imp * mb * nx; a.vy -= imp * mb * ny; b.vx += imp * ma * nx; b.vy += imp * ma * ny;
            const push = (rr - d) / 2; a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
          }
        }
      }
    },
    /** Rescale speeds so the average kinetic energy matches a temperature-like target. */
    thermostat(parts, target, rate = 0.05) {
      if (!parts.length) return;
      const ke = parts.reduce((s, q) => s + 0.5 * (q.m || 1) * (q.vx * q.vx + q.vy * q.vy), 0) / parts.length;
      if (ke <= 0) return;
      const f = Math.sqrt(1 + rate * (target / ke - 1));
      for (const q of parts) { q.vx *= f; q.vy *= f; }
    },
  };

  window.Sim = Sim;
})();
