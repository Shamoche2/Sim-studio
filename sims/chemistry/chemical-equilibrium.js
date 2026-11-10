const { C, text, rect, plot } = Sim;
Sim({
  title: "Chemical Equilibrium and Le Chatelier's Principle",
  intro: "In a reversible reaction A ⇌ B, the forward and backward reactions both keep happening. At equilibrium they run at the same rate, so the amounts stop changing. Disturb it and watch it shift.",
  controls: [
    { id: "T", label: "Temperature", min: 250, max: 450, step: 5, value: 300, unit: "K", help: "The forward reaction is exothermic (releases heat)." },
  ],
  buttons: [
    { label: "Add more A", primary: true, click(s) { s.A += 0.5; } },
    { label: "Remove some B", click(s) { s.B *= 0.4; } },
  ],
  readouts: [["A", "[A]"], ["B", "[B]"], ["Q", "Q = [B]/[A]"], ["K", "K (equilibrium constant)"], ["dir", "Net reaction"]],
  rates(p) {
    const kf = 0.6 * Math.exp(-2000 * (1 / p.T - 1 / 300)), K = 3 * Math.exp(3000 * (1 / p.T - 1 / 300)); // exothermic: K falls as T rises
    return { kf, kb: kf / K, K };
  },
  init(s) { s.A = 1; s.B = 0; s.t = 0; s.hA = []; s.hB = []; },
  step(s, p, dt) {
    const { kf, kb } = this.rates(p), r = kf * s.A - kb * s.B;
    s.A -= r * dt; s.B += r * dt; s.t += dt; s.r = r;
    if (!s.hA.length || s.t - s.hA.at(-1)[0] > 0.1) { s.hA.push([s.t, s.A]); s.hB.push([s.t, s.B]); }
    if (s.hA.length > 600) { s.hA.shift(); s.hB.shift(); }
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.3;
    rect(ctx, 0, 0, W, H, "#fff");
    const max = Math.max(1.6, s.A + s.B);
    Sim.bars(ctx, { x: 10, y: 10, w: left - 20, h: H - 20 }, [{ label: "[A]", value: s.A, color: C.blue }, { label: "[B]", value: s.B, color: C.orange }], { max, title: "Concentration", fmt: (v) => v.toFixed(2) });
    const t0 = Math.max(0, s.t - 60);
    plot(ctx, { x: left, y: 10, w: W - left - 10, h: H - 20 }, { title: "Concentration over time", xmin: t0, xmax: t0 + 60, ymin: 0, ymax: max, xlabel: "time (s)", ylabel: "mol/L", series: [{ data: s.hA, color: C.blue, label: "A" }, { data: s.hB, color: C.orange, label: "B" }] });
  },
  read(s, p) {
    const { K } = this.rates(p), Q = s.B / Math.max(1e-9, s.A);
    return { A: s.A.toFixed(3), B: s.B.toFixed(3), Q: Q.toFixed(2), K: K.toFixed(2), dir: Math.abs(Q - K) / K < 0.02 ? "at equilibrium" : Q < K ? "forward (→ B)" : "backward (→ A)" };
  },
  keyIdea: "<b>Key idea:</b> Le Chatelier's principle: if you disturb an equilibrium, it shifts to oppose the change. Add A → makes more B. Heat an exothermic reaction → it shifts backwards, so K gets smaller.",
  tryThis: ["Wait for equilibrium, then add more A. Which way does it shift? Does K change?", "Remove some B. What happens to [A]?", "Raise the temperature to 400 K. Does the equilibrium make more or less B? Why?"],
});
