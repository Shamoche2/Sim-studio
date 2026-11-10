const { C, line, text, circle, arrow, rect } = Sim;
Sim({
  title: "Circular Motion",
  intro: "An object moving in a circle is always changing direction, so it's accelerating towards the centre. That needs a centripetal force. Cut the string to see what happens without it.",
  controls: [
    { id: "r", label: "Radius", min: 0.5, max: 3, step: 0.1, value: 2, unit: "m", digits: 1 },
    { id: "v", label: "Speed", min: 0.5, max: 8, step: 0.1, value: 3, unit: "m/s", digits: 1 },
    { id: "m", label: "Mass", min: 0.1, max: 5, step: 0.1, value: 1, unit: "kg", digits: 1 },
  ],
  buttons: [{ label: "Cut the string", primary: true, click(s) { if (!s.cut) { s.cut = true; s.fx = s.x; s.fy = s.y; s.fvx = s.vx; s.fvy = s.vy; } } }],
  readouts: [["a", "Centripetal acceleration"], ["F", "Centripetal force"], ["T", "Time for one lap"]],
  init(s, p) { s.th = 0; s.cut = false; s.x = p.r; s.y = 0; s.vx = 0; s.vy = p.v; },
  step(s, p, dt) {
    if (!s.cut) { s.th += (p.v / p.r) * dt; s.x = p.r * Math.cos(s.th); s.y = p.r * Math.sin(s.th); s.vx = -p.v * Math.sin(s.th); s.vy = p.v * Math.cos(s.th); }
    else { s.x += s.vx * dt; s.y += s.vy * dt; if (Math.hypot(s.x, s.y) > 8) { s.cut = false; s.th = 0; } }
  },
  draw({ ctx, W, H }, s, p) {
    const cx = W / 2, cy = H / 2, sc = (H / 2 - 20) / 3.3, X = (x) => cx + x * sc, Y = (y) => cy - y * sc;
    rect(ctx, 0, 0, W, H, "#fff");
    circle(ctx, cx, cy, p.r * sc, null, C.grid, 2);
    circle(ctx, cx, cy, 5, C.text);
    if (!s.cut) line(ctx, cx, cy, X(s.x), Y(s.y), C.text, 2);
    if (s.cut) line(ctx, X(s.fx), Y(s.fy), X(s.x), Y(s.y), C.gray, 1.5, [5, 5]);
    circle(ctx, X(s.x), Y(s.y), 8 + Math.cbrt(p.m) * 6, C.blue, "#1c3f8f", 2);
    arrow(ctx, X(s.x), Y(s.y), X(s.x + s.vx * 0.25), Y(s.y + s.vy * 0.25), C.green, 3);
    text(ctx, "velocity", X(s.x + s.vx * 0.25) + 6, Y(s.y + s.vy * 0.25), { color: C.green, size: 12, weight: 600 });
    if (!s.cut) { const a = (p.v * p.v) / p.r, L = Math.min(1.6, a * 0.08); arrow(ctx, X(s.x), Y(s.y), X(s.x * (1 - L / p.r)), Y(s.y * (1 - L / p.r)), C.red, 3); text(ctx, "force (to centre)", X(s.x * (1 - L / p.r)) + 6, Y(s.y * (1 - L / p.r)) + 14, { color: C.red, size: 12, weight: 600 }); }
    if (s.cut) text(ctx, "No force → it moves in a straight line", 14, 24, { weight: 700, color: C.text });
  },
  read(s, p) { const a = (p.v * p.v) / p.r; return { a: a.toFixed(2) + " m/s²", F: (p.m * a).toFixed(2) + " N", T: ((2 * Math.PI * p.r) / p.v).toFixed(2) + " s" }; },
  keyIdea: "<b>Key idea:</b> a = v²/r and F = mv²/r, always pointing to the centre. The velocity is always along the tangent.",
  tryThis: ["Double the speed. By how much does the force increase?", "Cut the string. In which direction does the ball fly off?", "Halve the radius at the same speed. What happens to the force needed?"],
});
