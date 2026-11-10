const { C, text, rect, line, arrow, circle } = Sim;
Sim({
  title: "Reflection in Mirrors",
  intro: "Light bounces off a mirror so that the angle of reflection equals the angle of incidence. Curved mirrors use this rule to focus light (concave) or spread it out (convex).",
  controls: [
    { id: "type", label: "Mirror", type: "select", options: [["plane", "Plane (flat) mirror"], ["concave", "Concave mirror"], ["convex", "Convex mirror"]] },
    { id: "angle", label: "Angle of incidence (plane mirror)", min: 0, max: 80, step: 1, value: 35, unit: "°" },
    { id: "rays", label: "Parallel rays (curved mirrors)", min: 3, max: 9, step: 2, value: 5 },
  ],
  readouts: [["i", "Angle of incidence"], ["r", "Angle of reflection"], ["f", "Focal point"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    if (p.type === "plane") {
      const cx = W / 2, my = H - 40, L = H * 0.8, a = (p.angle * Math.PI) / 180;
      rect(ctx, 40, my, W - 80, 8, "#adb5bd"); for (let x = 40; x < W - 40; x += 12) line(ctx, x, my + 8, x - 8, my + 18, "#868e96", 1);
      line(ctx, cx, my, cx, my - L, C.gray, 1.5, [6, 5]); text(ctx, "normal", cx + 6, my - L + 14, { size: 12, color: C.muted });
      const sx = cx - Math.sin(a) * L, sy = my - Math.cos(a) * L;
      line(ctx, sx, sy, cx, my, C.red, 3); arrow(ctx, sx, sy, (sx + cx) / 2, (sy + my) / 2, C.red, 3);
      const ex = cx + Math.sin(a) * L, ey = my - Math.cos(a) * L;
      line(ctx, cx, my, ex, ey, C.orange, 3); arrow(ctx, cx, my, (cx + ex) / 2, (my + ey) / 2, C.orange, 3);
      for (const [dir, col] of [[-1, C.red], [1, C.orange]]) { ctx.beginPath(); ctx.arc(cx, my, 50, -Math.PI / 2, -Math.PI / 2 + dir * a, dir < 0); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); }
      text(ctx, `i = ${p.angle}°`, cx - 70, my - 60, { color: C.red, weight: 700 }); text(ctx, `r = ${p.angle}°`, cx + 30, my - 60, { color: C.orange, weight: 700 });
      return;
    }
    const mx = W * 0.8, cy = H / 2, R = W * 0.9, f = R / 2, concave = p.type === "concave";
    ctx.beginPath(); for (let y = -H * 0.42; y <= H * 0.42; y += 2) { const sag = (y * y) / (2 * R); ctx.lineTo(mx + (concave ? sag : -sag), cy + y); } ctx.strokeStyle = C.text; ctx.lineWidth = 4; ctx.stroke();
    line(ctx, 0, cy, W, cy, "#dee2e6", 1.5);
    const fx = concave ? mx - f : mx + f;
    for (let k = 0; k < p.rays; k++) {
      const y = cy + ((k - (p.rays - 1) / 2) / ((p.rays - 1) / 2 || 1)) * H * 0.35, sag = ((y - cy) ** 2) / (2 * R), hx = mx + (concave ? sag : -sag);
      line(ctx, 10, y, hx, y, C.red, 2); arrow(ctx, 10, y, 80, y, C.red, 2);
      const dx = fx - hx, dy = cy - y, len = Math.hypot(dx, dy) || 1;
      if (concave) { line(ctx, hx, y, hx + (dx / len) * W, y + (dy / len) * W, C.orange, 2); }
      else { line(ctx, hx, y, hx - (dx / len) * W, y - (dy / len) * W, C.orange, 2); line(ctx, hx, y, fx, cy, C.orange, 1, [4, 4]); }
    }
    circle(ctx, fx, cy, 5, C.green); text(ctx, "F", fx, cy - 10, { align: "center", color: C.green, weight: 700 });
  },
  read(s, p) { return p.type === "plane" ? { i: p.angle + "°", r: p.angle + "°", f: "none" } : { i: "varies", r: "= incidence at each point", f: p.type === "concave" ? "in front (real)" : "behind (virtual)" }; },
  keyIdea: "<b>Key idea:</b> the law of reflection: angle of incidence = angle of reflection, both measured from the normal. A concave mirror focuses parallel light to a real focal point; a convex mirror spreads it as if from a virtual focus behind.",
  tryThis: ["On the plane mirror, set the angle to 0°. Where does the light go?", "Where would you put a bulb in a concave mirror to make a parallel beam (like a torch)?", "Why are convex mirrors used on dangerous road corners and in shops?"],
});
