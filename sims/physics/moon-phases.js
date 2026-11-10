const { C, text, rect, circle } = Sim;
const NAMES = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Third quarter", "Waning crescent"];
Sim({
  title: "Phases of the Moon",
  intro: "The Moon doesn't make its own light: half of it is always lit by the Sun. As it orbits Earth over about 29.5 days, we see different amounts of the lit half. That's why the Moon seems to change shape.",
  controls: [{ id: "d", label: "Day of the lunar cycle", min: 0, max: 29.5, step: 0.5, value: 7.4, unit: "days", digits: 1 }],
  readouts: [["phase", "Phase"], ["lit", "Fraction lit (as seen from Earth)"]],
  autoplay: false,
  step(s, p, dt) { const el = document.getElementById("d"); el.value = (+el.value + dt * 2) % 29.5; el.dispatchEvent(new Event("input")); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#0b1020");
    const left = W * 0.6, cx = left / 2 + 20, cy = H / 2, R = Math.min(left, H) * 0.36, a = (p.d / 29.5) * Math.PI * 2;
    text(ctx, "☀ Sunlight →", 10, 22, { color: "#ffd43b", weight: 700 });
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = "#ffd43b22"; ctx.beginPath(); ctx.moveTo(0, 40 + i * (H - 60) / 5); ctx.lineTo(left, 40 + i * (H - 60) / 5); ctx.stroke(); }
    ctx.strokeStyle = "#ffffff22"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    circle(ctx, cx, cy, 22, "#4dabf7"); text(ctx, "Earth", cx, cy + 38, { align: "center", color: "#adb5bd", size: 11 });
    const mx = cx - Math.cos(a) * R, my = cy + Math.sin(a) * R; // Sun on the left: new moon between Earth and Sun
    circle(ctx, mx, my, 12, "#343a40");
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 12, Math.PI / 2, -Math.PI / 2); ctx.fillStyle = "#f1f3f5"; ctx.fill(); ctx.restore();
    // view from Earth
    const vx = left + (W - left) / 2, vy = H / 2, r = Math.min(W - left, H) * 0.3, lit = (1 - Math.cos(a)) / 2;
    circle(ctx, vx, vy, r, "#343a40");
    ctx.fillStyle = "#f1f3f5"; ctx.beginPath();
    const waxing = p.d < 14.75, k = Math.cos(a); // terminator ellipse half-width = r * |k|
    ctx.arc(vx, vy, r, -Math.PI / 2, Math.PI / 2, !waxing);
    ctx.ellipse(vx, vy, r * Math.abs(k), r, 0, Math.PI / 2, -Math.PI / 2, waxing ? k > 0 : k < 0);
    ctx.fill();
    text(ctx, "What we see from Earth", vx, vy - r - 16, { align: "center", color: "#adb5bd", size: 12 });
    void lit;
  },
  read(s, p) { const i = Math.round((p.d / 29.5) * 8) % 8, a = (p.d / 29.5) * Math.PI * 2; return { phase: NAMES[i], lit: (((1 - Math.cos(a)) / 2) * 100).toFixed(0) + "%" }; },
  keyIdea: "<b>Key idea:</b> the phases repeat every 29.5 days. At new moon the Moon is between Earth and Sun, so we see its dark side; at full moon Earth is between them. Seen from the northern hemisphere, the lit part grows from the right (waxing).",
  tryThis: ["Where is the Moon in its orbit at full moon?", "How many days from new moon to full moon?", "Why don't we get an eclipse every month? (Hint: the Moon's orbit is slightly tilted.)"],
  note: "Not to scale. View shown for the northern hemisphere. Press Play to animate.",
});
