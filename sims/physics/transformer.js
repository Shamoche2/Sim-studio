const { C, text, rect } = Sim;
Sim({
  title: "Transformers",
  intro: "A transformer changes the size of an alternating voltage. The primary coil makes a changing magnetic field in the iron core, which induces a voltage in the secondary coil. The turns ratio sets the output voltage.",
  controls: [
    { id: "Vp", label: "Primary voltage (AC)", min: 1, max: 240, step: 1, value: 230, unit: "V" },
    { id: "Np", label: "Primary turns", min: 10, max: 500, step: 10, value: 400 },
    { id: "Ns", label: "Secondary turns", min: 10, max: 500, step: 10, value: 20 },
    { id: "R", label: "Load resistance", min: 1, max: 100, step: 1, value: 10, unit: "Ω" },
  ],
  readouts: [["Vs", "Secondary voltage"], ["type", "Type"], ["Is", "Secondary current"], ["Ip", "Primary current"], ["P", "Power (in = out)"]],
  calc(p) { const Vs = (p.Vp * p.Ns) / p.Np, Is = Vs / p.R, P = Vs * Is; return { Vs, Is, Ip: P / p.Vp, P }; },
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const cx = W / 2, cy = H / 2, cw = W * 0.4, ch = H * 0.6, th = 26;
    rect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, "#868e96", null, 4); rect(ctx, cx - cw / 2 + th, cy - ch / 2 + th, cw - 2 * th, ch - 2 * th, "#fff", null, 2);
    const coil = (x, n, col) => { const k = Math.max(3, Math.round(n / 25)); for (let i = 0; i < k; i++) { const y = cy - ch / 2 + th + 6 + (i / k) * (ch - 2 * th - 12); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, th / 2 + 8, 5, 0, 0, Math.PI * 2); ctx.stroke(); } };
    coil(cx - cw / 2 + th / 2, p.Np, C.blue); coil(cx + cw / 2 - th / 2, p.Ns, C.orange);
    const r = this.calc(p), phase = Math.sin(s.t * 4);
    const wave = (x0, amp, col, label) => { ctx.beginPath(); for (let i = 0; i <= 80; i++) ctx.lineTo(x0 + i, cy - Math.sin(i / 8 + s.t * 4) * amp); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke(); text(ctx, label, x0 + 40, cy + 60, { align: "center", weight: 700, color: col }); };
    const maxV = Math.max(p.Vp, r.Vs);
    wave(20, (p.Vp / maxV) * 40, C.blue, `${p.Vp} V`); wave(W - 100, (r.Vs / maxV) * 40, C.orange, `${r.Vs.toFixed(1)} V`);
    text(ctx, `primary: ${p.Np} turns`, cx - cw / 2, cy - ch / 2 - 10, { color: C.blue, weight: 600 }); text(ctx, `secondary: ${p.Ns} turns`, cx + cw / 2, cy - ch / 2 - 10, { color: C.orange, weight: 600, align: "right" });
    ctx.globalAlpha = 0.3 + 0.3 * Math.abs(phase); text(ctx, "changing magnetic field in the iron core", cx, cy + ch / 2 + 22, { align: "center", color: C.purple, size: 12 }); ctx.globalAlpha = 1;
  },
  read(s, p) { const r = this.calc(p); return { Vs: r.Vs.toFixed(1) + " V", type: p.Ns > p.Np ? "step-up" : p.Ns < p.Np ? "step-down" : "1 : 1 (isolating)", Is: r.Is.toFixed(2) + " A", Ip: r.Ip.toFixed(3) + " A", P: r.P.toFixed(1) + " W" }; },
  keyIdea: "<b>Key idea:</b> Vs / Vp = Ns / Np. For an ideal transformer, power in = power out, so Vp × Ip = Vs × Is. Stepping voltage up steps current down. That's why power lines use very high voltages: less current means less energy wasted as heat.",
  tryThis: ["Make a phone charger: step 230 V down to about 5 V. What turns ratio do you need?", "Make a step-up transformer. What happens to the current in the secondary coil compared with the primary?", "Why don't transformers work with direct current (DC) from a battery?"],
  note: "Assumes an ideal (100% efficient) transformer.",
});
