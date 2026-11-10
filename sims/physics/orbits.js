const { C, text, circle, arrow, rect } = Sim;
Sim({
  title: "Orbits and Gravity",
  intro: "A satellite is launched sideways from high above a planet. Too slow and it falls back; just right and it circles forever; faster still and its orbit stretches into an ellipse, or it escapes.",
  controls: [
    { id: "v", label: "Launch speed", min: 3, max: 12, step: 0.1, value: 7.6, unit: "km/s", digits: 1 },
    { id: "alt", label: "Launch height", min: 300, max: 5000, step: 100, value: 400, unit: "km" },
  ],
  readouts: [["speed", "Current speed"], ["height", "Current height"], ["vc", "Circular orbit speed"], ["ve", "Escape speed"], ["status", "Status"]],
  resetOnChange: true,
  init(s, p) { s.x = 6371 + p.alt; s.y = 0; s.vx = 0; s.vy = p.v; s.trail = []; s.status = "orbiting"; s.t = 0; },
  timeScale: 400,
  substeps: 40,
  step(s, p, dt) {
    if (s.status !== "orbiting") return;
    const GM = 398600, r = Math.hypot(s.x, s.y), a = -GM / (r * r * r);
    s.vx += a * s.x * dt; s.vy += a * s.y * dt;
    s.x += s.vx * dt; s.y += s.vy * dt; s.t += dt;
    const rn = Math.hypot(s.x, s.y);
    if (rn < 6371) s.status = "crashed";
    else if (rn > 60000) s.status = "escaped";
    if (!s.trail.length || Math.hypot(s.x - s.trail.at(-1)[0], s.y - s.trail.at(-1)[1]) > 150) s.trail.push([s.x, s.y]);
    if (s.trail.length > 4000) s.trail.shift();
  },
  draw({ ctx, W, H }, s, p) {
    const sc = Math.min(W, H) / 2 / 26000, cx = W / 2, cy = H / 2;
    rect(ctx, 0, 0, W, H, "#0b1020");
    for (let i = 0; i < 60; i++) circle(ctx, (i * 97) % W, (i * 57) % H, 1, "#ffffff55");
    circle(ctx, cx, cy, 6371 * sc, "#2f6fed", "#7fb3ff", 2);
    ctx.strokeStyle = "#ffd43b"; ctx.lineWidth = 1.5; ctx.beginPath();
    s.trail.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * sc, cy - y * sc) : ctx.moveTo(cx + x * sc, cy - y * sc))); ctx.stroke();
    circle(ctx, cx + s.x * sc, cy - s.y * sc, 5, "#fff");
    arrow(ctx, cx + s.x * sc, cy - s.y * sc, cx + (s.x + s.vx * 400) * sc, cy - (s.y + s.vy * 400) * sc, "#69db7c", 2);
    text(ctx, s.status === "crashed" ? "Crashed into the planet" : s.status === "escaped" ? "Escaped the planet's gravity!" : "", 14, 26, { color: "#fff", weight: 700, size: 15 });
  },
  read(s, p) {
    const GM = 398600, r0 = 6371 + p.alt;
    return { speed: Math.hypot(s.vx, s.vy).toFixed(2) + " km/s", height: Math.max(0, Math.hypot(s.x, s.y) - 6371).toFixed(0) + " km", vc: Math.sqrt(GM / r0).toFixed(2) + " km/s", ve: Math.sqrt((2 * GM) / r0).toFixed(2) + " km/s", status: s.status };
  },
  keyIdea: "<b>Key idea:</b> gravity provides the centripetal force. Circular orbit speed v = √(GM/r); escape speed is √2 times bigger. An orbiting satellite is always falling, but moving sideways fast enough to keep missing the planet.",
  tryThis: ["Find the speed that gives a near-perfect circle at 400 km (like the International Space Station).", "Launch a bit faster than circular speed. Where is the satellite fastest in its elliptical orbit?", "What is the slowest launch speed that escapes completely?"],
  note: "Uses Earth's real mass and radius. Time is sped up a lot.",
});
