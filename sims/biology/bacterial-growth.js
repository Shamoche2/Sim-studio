const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Bacterial Growth",
  intro: "Bacteria reproduce by splitting in two (binary fission), as often as every 20 minutes in good conditions. Numbers double each generation, so they grow incredibly fast, until food runs out or waste builds up.",
  controls: [
    { id: "gen", label: "Time between divisions", min: 20, max: 120, step: 10, value: 20, unit: "min" },
    { id: "T", label: "Temperature", min: 5, max: 45, step: 5, value: 37, unit: "°C" },
    { id: "log", label: "Use a log scale on the graph", type: "checkbox", value: false },
  ],
  readouts: [["time", "Time"], ["n", "Bacteria"], ["phase", "Growth phase"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.n = 10; s.hist = [[0, 10]]; },
  rate(p) { const tf = p.T > 40 ? Math.max(0, 1 - (p.T - 40) / 6) : Math.pow(2, (p.T - 37) / 10); return (Math.LN2 / p.gen) * tf; },
  step(s, p, dt) {
    const h = dt * 60; s.t = Math.min(1440, s.t + h); const K = 1e9, lag = s.t < 60 ? 0.2 : 1;
    s.n += this.rate(p) * lag * s.n * (1 - s.n / K) * h; if (s.t > 900 && s.n > K * 0.95) s.n *= 1 - 0.0006 * h;
    if (s.t - s.hist.at(-1)[0] > 10) s.hist.push([s.t, s.n]);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.32, cx = left / 2, cy = H / 2, R = Math.min(left, H) * 0.42;
    circle(ctx, cx, cy, R, "#fff9db", C.text, 2);
    const shown = Math.min(400, Math.round(Math.log10(Math.max(10, s.n)) ** 2.4 * 2));
    let seed = 4; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < shown; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * R * 0.95; ctx.fillStyle = "#e8590c"; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3, 1.6, a, 0, Math.PI * 2); ctx.fill(); }
    text(ctx, "agar plate", cx, cy + R + 16, { align: "center", size: 11, color: C.muted });
    const data = s.hist.map(([t, n]) => [t / 60, p.log ? Math.log10(n) : n / 1e9]);
    plot(ctx, { x: left, y: 6, w: W - left - 6, h: H - 12 }, { title: p.log ? "log₁₀(number of bacteria)" : "Number of bacteria (billions)", xmin: 0, xmax: 24, ymin: 0, ymax: p.log ? 10 : 1.1, xstep: 4, xlabel: "hours", series: [{ data, color: C.orange }] });
  },
  read(s, p) { const n = s.n, ph = s.t < 60 ? "lag (adjusting)" : n < 5e8 ? "log (exponential) phase" : s.t > 900 ? "death phase (food used up, waste builds up)" : "stationary (no room or food)"; return { time: (s.t / 60).toFixed(1) + " h", n: n < 1e6 ? n.toFixed(0) : n.toExponential(2), phase: ph }; },
  keyIdea: "<b>Key idea:</b> number of bacteria = starting number × 2ⁿ, where n is the number of divisions. Growth curves have a lag, log (exponential), stationary and death phase. A log scale turns exponential growth into a straight line.",
  tryThis: ["Starting with 10 bacteria dividing every 20 minutes, how many are there after 3 hours?", "Switch on the log scale. What shape does the exponential phase become?", "Why do we keep food in a fridge at 5 °C?"],
});
