const { C, text, rect, circle } = Sim;
Sim({
  title: "The Heart and Double Circulation",
  intro: "The heart pumps blood around two loops: to the lungs to collect oxygen (pulmonary circulation) and around the body to deliver it (systemic circulation). Change the heart rate and see how much blood is pumped.",
  controls: [
    { id: "hr", label: "Heart rate", min: 40, max: 180, step: 5, value: 70, unit: "beats/min" },
    { id: "sv", label: "Stroke volume", min: 40, max: 120, step: 5, value: 70, unit: "mL" },
  ],
  readouts: [["co", "Cardiac output"], ["lap", "Time for one full circuit"], ["state", "Activity level"]],
  init(s) { s.t = 0; s.phase = 0; s.cells = Array.from({ length: 70 }, (_, i) => i / 70); },
  path(f, W, H) {
    // loop: heart (centre) → lungs (top) → heart → body (bottom) → heart. f in [0,1)
    const cx = W / 2, cy = H / 2, lungY = H * 0.12, bodyY = H * 0.88, rx = W * 0.32;
    if (f < 0.5) { const a = (f / 0.5) * Math.PI * 2; return { x: cx - Math.sin(a) * rx * 0.7, y: cy - (1 - Math.cos(a)) / 2 * (cy - lungY), loop: "lung", oxy: f > 0.25 }; }
    const a = ((f - 0.5) / 0.5) * Math.PI * 2; return { x: cx + Math.sin(a) * rx, y: cy + (1 - Math.cos(a)) / 2 * (bodyY - cy), loop: "body", oxy: f < 0.75 };
  },
  step(s, p, dt) {
    s.t += dt; s.phase = (s.phase + (dt * p.hr) / 60) % 1;
    const co = (p.hr * p.sv) / 1000, speed = co / 5 / 60 * 3.2; // fraction of loop per second, scaled
    const pulse = 0.6 + 0.8 * Math.max(0, Math.sin(s.phase * Math.PI * 2));
    s.cells = s.cells.map((f) => (f + speed * pulse * dt) % 1);
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    // vessels
    for (let i = 0; i <= 200; i++) { const f = i / 200, q = this.path(f, W, H); circle(ctx, q.x, q.y, 9, q.oxy ? "rgba(224,49,49,.15)" : "rgba(47,111,237,.15)"); }
    // organs
    const lung = this.path(0.25, W, H), body = this.path(0.75, W, H);
    rect(ctx, lung.x - 60, lung.y - 18, 120, 36, "#ffc9c9", C.text, 18, 1.5); text(ctx, "Lungs", lung.x, lung.y + 5, { align: "center", weight: 700 });
    rect(ctx, body.x - 70, body.y - 18, 140, 36, "#ffe8cc", C.text, 10, 1.5); text(ctx, "Body organs", body.x, body.y + 5, { align: "center", weight: 700 });
    const beat = 1 + 0.12 * Math.max(0, Math.sin(s.phase * Math.PI * 2));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(beat, beat);
    ctx.fillStyle = "#c92a2a"; ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -35, -50, 0, -22); ctx.bezierCurveTo(35, -50, 60, -10, 0, 30); ctx.fill();
    ctx.restore();
    text(ctx, "Heart", W / 2, H / 2 + 50, { align: "center", weight: 700 });
    for (const f of s.cells) { const q = this.path(f, W, H); circle(ctx, q.x, q.y, 4.5, q.oxy ? C.red : "#4263eb"); }
    text(ctx, "● oxygenated   ● deoxygenated", 10, H - 10, { size: 12, color: C.muted });
    circle(ctx, 14, H - 14, 5, C.red); circle(ctx, 112, H - 14, 5, "#4263eb");
    text(ctx, "pulmonary circulation", 10, 24, { color: C.muted, size: 12 }); text(ctx, "systemic circulation", W - 10, H - 30, { color: C.muted, size: 12, align: "right" });
  },
  read(s, p) { const co = (p.hr * p.sv) / 1000; return { co: co.toFixed(1) + " L/min", lap: (5 / co * 60).toFixed(0) + " s (5 L of blood)", state: p.hr < 60 ? "resting athlete" : p.hr < 100 ? "resting" : p.hr < 140 ? "light exercise" : "hard exercise" }; },
  keyIdea: "<b>Key idea:</b> cardiac output = heart rate × stroke volume. During exercise both increase so muscles get more oxygen. Blood passes through the heart twice per circuit.",
  tryThis: ["Calculate the cardiac output at rest (70 beats/min, 70 mL). Check with the readout.", "Set 'hard exercise'. Why does the body need more blood flow?", "Trained athletes have a larger stroke volume. How does that let them have a lower resting heart rate?"],
  note: "Simplified diagram: the heart's four chambers aren't drawn separately.",
});
