const { C, text, rect, circle } = Sim;
Sim({
  title: "Plant Tropisms: Growing Towards Light",
  intro: "Plants grow towards light (phototropism) and roots grow down with gravity (gravitropism). A hormone called auxin builds up on the shaded side of a shoot, making those cells grow longer, so the shoot bends towards the light.",
  controls: [
    { id: "dir", label: "Light comes from", min: -90, max: 90, step: 5, value: 60, unit: "°", help: "0° = straight above" },
    { id: "foil", label: "Cover the shoot tip with foil", type: "checkbox", value: false },
  ],
  readouts: [["bend", "Shoot bends"], ["aux", "Auxin builds up on"], ["day", "Days of growth"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.ang = 0; s.len = 20; },
  step(s, p, dt) { s.t = Math.min(10, s.t + dt * 0.8); s.len = 20 + s.t * 12; const target = p.foil ? 0 : (p.dir * Math.PI) / 180 * 0.85; s.ang += (target - s.ang) * dt * 0.25; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff9db");
    const base = H * 0.68, cx = W / 2;
    rect(ctx, 0, base, W, H - base, "#c4a77d");
    const a = (p.dir * Math.PI) / 180, lx = cx + Math.sin(a) * H * 0.6, ly = base - Math.cos(a) * H * 0.6;
    circle(ctx, lx, ly, 18, "#ffd43b");
    for (let i = -1; i <= 1; i++) Sim.line(ctx, lx, ly, lx - Math.sin(a + i * 0.15) * 80, ly + Math.cos(a + i * 0.15) * 80, "rgba(250,176,5,.5)", 2);
    // shoot as a curve bending progressively
    let x = cx, y = base, prev = [x, y]; const segs = 30;
    ctx.strokeStyle = "#2f9e44"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 1; i <= segs; i++) { const f = i / segs, th = s.ang * f * f; x += Math.sin(th) * (s.len / segs) * 1.6; y -= Math.cos(th) * (s.len / segs) * 1.6; ctx.lineTo(x, y); if (i === segs - 4) prev = [x, y]; }
    ctx.stroke(); ctx.lineCap = "butt";
    if (p.foil) circle(ctx, x, y, 9, "#adb5bd", C.text, 1); else circle(ctx, x, y, 6, "#2b8a3e");
    // auxin dots on the shaded side
    if (!p.foil && Math.abs(p.dir) > 5) for (let i = 0; i < 6; i++) { const f = 0.5 + i * 0.08, side = p.dir > 0 ? -1 : 1; circle(ctx, cx + (prev[0] - cx) * f + side * 7, base + (prev[1] - base) * f, 2.5, C.orange); }
    // roots grow down
    ctx.strokeStyle = "#e9dcc9"; ctx.lineWidth = 3; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(cx, base); ctx.quadraticCurveTo(cx + k * 15, base + 20 + s.t * 3, cx + k * 25, base + 30 + s.t * 5); ctx.stroke(); }
    text(ctx, "● auxin", 10, 20, { color: C.orange, weight: 700, size: 12 });
  },
  read(s, p) { return { bend: p.foil ? "doesn't bend (tip can't detect light)" : Math.abs(p.dir) < 5 ? "grows straight up" : `towards the light (${p.dir > 0 ? "right" : "left"})`, aux: p.foil || Math.abs(p.dir) < 5 ? "both sides equally" : `the shaded (${p.dir > 0 ? "left" : "right"}) side`, day: s.t.toFixed(1) }; },
  keyIdea: "<b>Key idea:</b> the shoot tip detects light. Auxin moves to the shaded side, where it makes cells elongate, so the shoot curves towards the light. In roots, auxin has the opposite effect, so roots grow downwards.",
  tryThis: ["Shine light from the right. Which side of the shoot has more auxin?", "Cover the tip with foil. Why doesn't the shoot bend?", "Why is it useful for a shoot to grow towards light?"],
});
