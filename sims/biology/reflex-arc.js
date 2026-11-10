const { C, text, rect, circle, line } = Sim;
const STEPS = [["Stimulus", "the hand touches something hot"], ["Receptor", "pain receptors in the skin detect it"], ["Sensory neurone", "carries the impulse to the spinal cord"], ["Relay neurone", "in the spinal cord passes it on (no thinking needed)"], ["Motor neurone", "carries the impulse to the muscle"], ["Effector", "the biceps muscle contracts and pulls the hand away"]];
Sim({
  title: "The Reflex Arc",
  intro: "Reflexes are fast, automatic responses that protect you. The impulse travels through the spinal cord, not the conscious brain, so you pull your hand off something hot before you even feel the pain.",
  controls: [{ id: "speed", label: "Animation speed", min: 0.2, max: 1.5, step: 0.1, value: 0.6, digits: 1 }],
  buttons: [{ label: "Touch the hot pan", primary: true, click(s) { s.t = 0; s.go = true; } }],
  readouts: [["step", "Stage"], ["what", "What happens"], ["time", "Total time"]],
  init(s) { s.t = 0; s.go = false; },
  step(s, p, dt) { if (s.go) s.t = Math.min(6.5, s.t + dt * p.speed * 3); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const hand = [W * 0.12, H * 0.72], spine = [W * 0.72, H * 0.35], muscle = [W * 0.38, H * 0.42];
    rect(ctx, spine[0] - 30, 10, 60, H - 20, "#fff4e6", "#e8590c", 20, 2); text(ctx, "spinal cord", spine[0], H - 18, { align: "center", size: 11, color: "#e8590c" });
    rect(ctx, 20, H * 0.82, 90, 18, "#495057", null, 4); text(ctx, "hot pan", 65, H * 0.82 + 34, { align: "center", size: 11 });
    const pulled = s.t > 5.6;
    circle(ctx, hand[0], hand[1] - (pulled ? 40 : 0), 18, "#ffd8a8", C.text, 1.5);
    ctx.beginPath(); ctx.ellipse(muscle[0], muscle[1], pulled ? 38 : 48, pulled ? 20 : 14, -0.3, 0, Math.PI * 2); ctx.fillStyle = "#ff8787"; ctx.fill(); text(ctx, "biceps", muscle[0], muscle[1] - 26, { align: "center", size: 11 });
    const sens = [[hand[0] + 10, hand[1] - 10], [W * 0.45, H * 0.65], [spine[0] - 10, spine[1] + 40]];
    const motor = [[spine[0] - 10, spine[1] - 10], [W * 0.55, H * 0.2], [muscle[0] + 30, muscle[1] - 10]];
    const draw = (pts, col) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
    draw(sens, C.blue); draw(motor, C.red); line(ctx, spine[0] - 10, spine[1] + 40, spine[0] - 10, spine[1] - 10, C.purple, 3);
    text(ctx, "sensory neurone", W * 0.4, H * 0.72, { size: 11, color: C.blue }); text(ctx, "motor neurone", W * 0.5, H * 0.15, { size: 11, color: C.red }); text(ctx, "relay", spine[0] + 2, spine[1] + 18, { size: 11, color: C.purple });
    const along = (pts, f) => { const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])), tot = segs.reduce((a, b) => a + b); let d = f * tot; for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const u = d / segs[i]; return [Sim.lerp(pts[i][0], pts[i + 1][0], u), Sim.lerp(pts[i][1], pts[i + 1][1], u)]; } d -= segs[i]; } return pts.at(-1); };
    let dot = null;
    if (s.go) { if (s.t > 1.5 && s.t < 3) dot = along(sens, (s.t - 1.5) / 1.5); else if (s.t >= 3 && s.t < 3.6) dot = [spine[0] - 10, Sim.lerp(spine[1] + 40, spine[1] - 10, (s.t - 3) / 0.6)]; else if (s.t >= 3.6 && s.t < 5.2) dot = along(motor, (s.t - 3.6) / 1.6); }
    if (dot) circle(ctx, dot[0], dot[1], 8, "#ffd43b", C.text, 1.5);
    if (s.go && s.t > 0.2 && s.t < 1.5) text(ctx, "🔥", hand[0], hand[1] + 30, { align: "center", size: 20 });
  },
  read(s) { const i = Math.min(5, Math.floor(s.t)); return { step: s.go ? `${i + 1}. ${STEPS[i][0]}` : "press the button", what: s.go ? STEPS[i][1] : "—", time: s.go && s.t > 5.6 ? "about 0.05 seconds in real life" : "—" }; },
  keyIdea: "<b>Key idea:</b> stimulus → receptor → sensory neurone → relay neurone → motor neurone → effector. Reflexes are automatic and very fast because they don't need the conscious brain.",
  tryThis: ["Put the six stages in order without looking.", "Why is it useful that this reflex doesn't go through the brain first?", "Name two other reflexes in the body."],
  note: "The animation is slowed down enormously.",
});
