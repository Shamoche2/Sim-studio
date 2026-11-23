const { C, text, rect, circle, line } = Sim;
const rateAt = (d, co2) => { const I = 100 / (d / 10) ** 2; return Math.min(42 * co2, (60 * I) / (I + 9)) ; };
Lab({
  title: "Virtual Lab: Light Intensity and Photosynthesis",
  aim: "Investigate how the distance of a lamp (light intensity) affects the rate of photosynthesis in pondweed, by counting oxygen bubbles.",
  equipment: ["Pondweed (Elodea) in a boiling tube", "Sodium hydrogencarbonate solution (gives CO₂)", "Lamp and metre rule", "Beaker of water as a heat filter", "Stopwatch"],
  safety: ["The lamp gets hot.", "Keep water away from the plug and mains cable."],
  method: [
    "Set the <b>Lamp distance</b> and the <b>CO₂ (hydrogencarbonate)</b> level.",
    "Leave the pondweed for a short time to adjust to the new light level.",
    "Press <b>Count bubbles for 1 minute</b>. Time is sped up.",
    "When the minute is over, press <b>Record result</b>.",
    "Repeat at 10, 15, 20, 30, 40 and 50 cm. Light intensity is proportional to 1 ÷ distance².",
  ],
  controls: [
    { id: "d", label: "Lamp distance", min: 10, max: 50, step: 5, value: 10, unit: "cm" },
    { id: "co2", label: "CO₂ (hydrogencarbonate)", type: "select", options: [["1", "Normal"], ["0.4", "Low"], ["1.6", "High"]] },
  ],
  buttons: [{ label: "Count bubbles for 1 minute", click(s) { s.count = 0; s.t = 0; s.counting = true; } }],
  readouts: [["t", "Timer"], ["n", "Bubbles counted"], ["I", "Relative light intensity"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.count = 0; s.counting = false; s.next = 0; s.bubbles = []; s.clock = 0; },
  step(s, p, dt) {
    dt *= 12; s.clock += dt;
    const r = rateAt(p.d, +p.co2) / 60; // bubbles per second
    s.next -= dt * r * (1 + Sim.randn() * 0.15);
    if (s.next <= 0) { s.next += 1; s.bubbles.push(0); if (s.counting) s.count++; }
    s.bubbles = s.bubbles.map((y) => y + dt * 20).filter((y) => y < 200);
    if (s.counting) { s.t += dt; if (s.t >= 60) { s.t = 60; s.counting = false; s.done = true; } }
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#f8f9fa");
    const tx = W * 0.62, base = H * 0.85, lx = tx - 40 - p.d * (W * 0.009);
    ctx.save(); const g = ctx.createRadialGradient(lx, H * 0.5, 10, lx, H * 0.5, 300); g.addColorStop(0, "rgba(255,236,153,.85)"); g.addColorStop(1, "rgba(255,236,153,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    rect(ctx, lx - 30, H * 0.42, 30, 60, "#495057", null, 4); circle(ctx, lx + 4, H * 0.5, 14, "#ffe066", "#f59f00", 2);
    rect(ctx, tx - 26, H * 0.12, 52, base - H * 0.12, "rgba(165,216,255,.35)", C.text, 0, 2);
    ctx.strokeStyle = "#2b8a3e"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tx, base - 10); ctx.bezierCurveTo(tx - 12, base - 80, tx + 12, base - 140, tx, H * 0.4); ctx.stroke();
    for (let i = 0; i < 8; i++) { const y = base - 30 - i * 22; ctx.beginPath(); ctx.ellipse(tx + (i % 2 ? 10 : -10), y, 10, 4, i % 2 ? 0.5 : -0.5, 0, 7); ctx.fillStyle = "#51cf66"; ctx.fill(); }
    for (const y of s.bubbles) circle(ctx, tx + Math.sin(y / 9) * 2, H * 0.4 - y, 4, "#fff", "#74c0fc", 1.5);
    line(ctx, lx + 4, base + 20, tx, base + 20, C.text, 1.5); text(ctx, `${p.d} cm`, (lx + tx) / 2, base + 38, { align: "center", weight: 700 });
    text(ctx, `${s.count}`, W * 0.86, H * 0.4, { align: "center", weight: 800, size: 40, color: C.blue }); text(ctx, "bubbles", W * 0.86, H * 0.4 + 22, { align: "center", size: 12, color: C.muted });
    text(ctx, s.counting ? `${s.t.toFixed(0)} s` : s.done ? "minute over" : "", W * 0.86, H * 0.4 + 50, { align: "center", weight: 700 });
  },
  read(s, p) { return { t: s.t.toFixed(0) + " s", n: String(s.count), I: (10000 / p.d ** 2).toFixed(1) }; },
  record(s, p) { if (s.counting) return "Wait until the minute is over."; if (!s.done) return "Press Count bubbles for 1 minute first."; s.done = false; return { d: p.d, I: 10000 / p.d ** 2, co2: { 1: "normal", 0.4: "low", 1.6: "high" }[p.co2], n: s.count }; },
  table: { cols: [{ key: "d", label: "Lamp distance", unit: "cm", digits: 0 }, { key: "I", label: "Light intensity 10000 ÷ d²", digits: 1 }, { key: "co2", label: "CO₂" }, { key: "n", label: "Bubbles per minute", digits: 0 }], x: "I", y: "n", xlabel: "relative light intensity (10000/d²)", ylabel: "bubbles per minute", fit: "none", title: "Rate of photosynthesis against light intensity" },
  questions: [
    { q: "What gas is in the bubbles?", options: ["Carbon dioxide", "Oxygen", "Nitrogen"], answer: 1, why: "Oxygen is a product of photosynthesis." },
    { q: "Why might a beaker of water be put between the lamp and the plant?", options: ["To absorb heat, so temperature stays constant", "To give the plant water", "To make the light brighter"], answer: 0, why: "Temperature is a control variable." },
    { q: "At high light intensity the rate stops increasing. Why?", options: ["Light is now the limiting factor", "Another factor, such as CO₂ or temperature, is now limiting", "The plant is dead"], answer: 1, why: "Raise the CO₂ level and the rate goes up again." },
  ],
  conclusion: "As the lamp gets closer, light intensity increases and so does the rate of photosynthesis, until another factor (CO₂ concentration or temperature) becomes limiting.",
});
