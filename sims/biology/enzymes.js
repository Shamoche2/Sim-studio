const { C, text, rect, circle, plot } = Sim;
const ENZ = { amylase: { name: "Amylase (saliva)", Topt: 37, pHopt: 7 }, pepsin: { name: "Pepsin (stomach)", Topt: 37, pHopt: 2 }, trypsin: { name: "Trypsin (small intestine)", Topt: 37, pHopt: 8 }, taq: { name: "Taq polymerase (hot spring bacteria)", Topt: 72, pHopt: 8 } };
Sim({
  title: "Enzyme Activity",
  intro: "Enzymes are biological catalysts. Each works best at its optimum temperature and pH. Too hot, or the wrong pH, and the active site changes shape (the enzyme denatures), so the substrate no longer fits.",
  controls: [
    { id: "enz", label: "Enzyme", type: "select", options: Object.entries(ENZ).map(([k, v]) => [k, v.name]) },
    { id: "T", label: "Temperature", min: 0, max: 100, step: 1, value: 37, unit: "°C" },
    { id: "pH", label: "pH", min: 1, max: 13, step: 0.5, value: 7, digits: 1 },
    { id: "S", label: "Substrate concentration", min: 0, max: 100, step: 1, value: 50, unit: "%" },
  ],
  readouts: [["rate", "Reaction rate"], ["shape", "Active site"]],
  act(p, T = p.T, pH = p.pH, S = p.S) {
    const e = ENZ[p.enz];
    const tf = T <= e.Topt ? Math.pow(2, (T - e.Topt) / 10) : Math.max(0, 1 - ((T - e.Topt) / 12) ** 2);
    const pf = Math.exp(-((pH - e.pHopt) ** 2) / 3);
    return 100 * tf * pf * (S / (S + 20)) * 1.2;
  },
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.38, e = ENZ[p.enz];
    rect(ctx, 0, 0, left, H, "#fff");
    const tdam = Math.max(0, (p.T - e.Topt) / 12), pdam = Math.abs(p.pH - e.pHopt) / 4, dam = Math.min(1, Math.max(tdam * tdam, pdam * pdam));
    const cx = left / 2, cy = H / 2 + 20, r = Math.min(left, H) * 0.28;
    // enzyme blob with notch (active site) distorting with damage
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * Math.PI * 2, notch = Math.abs(a - Math.PI * 1.5) < 0.45 ? 1 - (1 - dam) * 0.45 : 1;
      const wob = 1 + dam * 0.15 * Math.sin(a * 5 + 1);
      ctx.lineTo(cx + Math.cos(a) * r * notch * wob, cy + Math.sin(a) * r * notch * wob);
    }
    ctx.closePath(); ctx.fillStyle = dam > 0.6 ? "#ced4da" : "#b197fc"; ctx.fill(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
    // substrate trying to fit
    const fits = dam < 0.35, bob = Math.sin(s.t * 3) * 6;
    rect(ctx, cx - r * 0.2, cy - r - (fits ? 0 : 30) + (fits ? 0 : bob) - r * 0.22, r * 0.4, r * 0.4, "#ffa94d", C.text, 4, 1.5);
    text(ctx, fits ? "substrate fits" : "doesn't fit: denatured", cx, 24, { align: "center", weight: 700, color: fits ? C.green : C.red });
    const tCurve = Array.from({ length: 101 }, (_, T) => [T, this.act(p, T, p.pH, p.S)]);
    const pCurve = Array.from({ length: 121 }, (_, i) => [1 + i * 0.1, this.act(p, p.T, 1 + i * 0.1, p.S)]);
    const half = (H - 12) / 2;
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: half }, { title: "Rate vs temperature", xmin: 0, xmax: 100, ymin: 0, ymax: 110, xlabel: "°C", series: [{ data: tCurve, color: C.red }], marks: [{ x: p.T, y: this.act(p), color: C.text }] });
    plot(ctx, { x: left + 6, y: 6 + half, w: W - left - 12, h: half }, { title: "Rate vs pH", xmin: 1, xmax: 13, ymin: 0, ymax: 110, xstep: 2, xlabel: "pH", series: [{ data: pCurve, color: C.blue }], marks: [{ x: p.pH, y: this.act(p), color: C.text }] });
  },
  read(s, p) { const e = ENZ[p.enz], dam = Math.max(((p.T - e.Topt) / 12) ** 2 * (p.T > e.Topt), (Math.abs(p.pH - e.pHopt) / 4) ** 2); return { rate: this.act(p).toFixed(0) + "% of max", shape: dam < 0.35 ? "normal" : dam < 1 ? "changing shape" : "denatured" }; },
  keyIdea: "<b>Key idea:</b> below the optimum, heating speeds up the reaction (more collisions). Above it, the enzyme denatures and the rate drops fast. Each enzyme's optimum pH matches where it works in the body.",
  tryThis: ["Find amylase's optimum temperature. What happens at 60 °C?", "Switch to pepsin. Why does it work best at pH 2?", "Taq polymerase comes from bacteria in hot springs. How is its curve different, and why is it useful in PCR?"],
});
