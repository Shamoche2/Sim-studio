const { C, text, rect, circle, line } = Sim;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
Sim({
  title: "Seasons and Earth's Tilt",
  intro: "Earth's axis is tilted by 23.5°. As Earth orbits the Sun, first one hemisphere and then the other leans towards the Sun, getting more direct sunlight and longer days. That causes the seasons, not distance from the Sun.",
  controls: [
    { id: "day", label: "Day of the year", min: 0, max: 364, step: 1, value: 172, format: (v) => `${MONTHS[Math.floor(v / 30.42) % 12]} ${Math.floor(v % 30.42) + 1}` },
    { id: "lat", label: "Your latitude", min: -66, max: 66, step: 1, value: 40, unit: "°", help: "Positive = north of the equator." },
    { id: "tilt", label: "Axis tilt", min: 0, max: 45, step: 0.5, value: 23.5, unit: "°", digits: 1 },
  ],
  readouts: [["daylen", "Hours of daylight"], ["noon", "Noon Sun height"], ["season", "Season here"]],
  init(s) {},
  step(s, p, dt) { const el = document.getElementById("day"); el.value = (+el.value + dt * 30) % 365; el.dispatchEvent(new Event("input")); },
  autoplay: false,
  decl(p) { return p.tilt * Math.sin((2 * Math.PI * (p.day - 80)) / 365); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#0b1020");
    const left = W * 0.55, cx = left / 2, cy = H / 2, R = Math.min(left, H) * 0.38;
    ctx.strokeStyle = "#ffffff33"; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
    circle(ctx, cx, cy, 20, "#ffd43b");
    const a = (2 * Math.PI * (p.day - 172)) / 365, ex = cx - Math.cos(a) * R, ey = cy + Math.sin(a) * R * 0.4;
    circle(ctx, ex, ey, 12, "#4dabf7"); const t = (p.tilt * Math.PI) / 180; line(ctx, ex + Math.sin(t) * 18, ey - Math.cos(t) * 18, ex - Math.sin(t) * 18, ey + Math.cos(t) * 18, "#fff", 1.5);
    text(ctx, "N", ex + Math.sin(t) * 24, ey - Math.cos(t) * 24, { color: "#fff", size: 10, align: "center" });
    // close-up of Earth lit from the sun's direction
    const bx = left + (W - left) / 2, by = H * 0.4, r = Math.min(W - left, H) * 0.3, d = (this.decl(p) * Math.PI) / 180;
    ctx.save(); ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.clip();
    rect(ctx, bx - r, by - r, 2 * r, 2 * r, "#1c3f8f");
    for (let yy = -r; yy <= r; yy += 2) { const lat = Math.asin(Sim.clamp(-yy / r, -1, 1)), cosH = -Math.tan(lat) * Math.tan(d), frac = cosH <= -1 ? 1 : cosH >= 1 ? 0 : Math.acos(cosH) / Math.PI; const half = Math.sqrt(r * r - yy * yy); rect(ctx, bx - half, by + yy, 2 * half * frac, 2, "#74c0fc"); }
    ctx.restore(); circle(ctx, bx, by, r, null, "#fff", 1.5);
    const ly = by - Math.sin((p.lat * Math.PI) / 180) * r; line(ctx, bx - r, ly, bx + r, ly, C.red, 2); text(ctx, "you", bx + r + 4, ly + 4, { color: "#ff8787", size: 11 });
    text(ctx, "☀ sunlight from the left", bx - r, by + r + 22, { color: "#ffd43b", size: 12 });
    text(ctx, "light blue = daytime side", bx - r, by + r + 40, { color: "#adb5bd", size: 11 });
  },
  read(s, p) {
    const d = (this.decl(p) * Math.PI) / 180, lat = (p.lat * Math.PI) / 180, cosH = -Math.tan(lat) * Math.tan(d);
    const hrs = cosH <= -1 ? 24 : cosH >= 1 ? 0 : (2 * Math.acos(cosH) * 12) / Math.PI;
    const noon = 90 - Math.abs(p.lat - this.decl(p)), north = p.lat >= 0, m = Math.floor(p.day / 30.42) % 12;
    const seasN = [11, 0, 1].includes(m) ? "winter" : [2, 3, 4].includes(m) ? "spring" : [5, 6, 7].includes(m) ? "summer" : "autumn";
    const flip = { winter: "summer", summer: "winter", spring: "autumn", autumn: "spring" };
    return { daylen: hrs.toFixed(1) + " h", noon: noon.toFixed(1) + "°", season: p.tilt < 1 ? "no seasons (no tilt)" : Math.abs(p.lat) < 10 ? "tropical (small changes)" : north ? seasN : flip[seasN] };
  },
  keyIdea: "<b>Key idea:</b> in summer your hemisphere tilts towards the Sun: the Sun is higher in the sky, sunlight is more concentrated and days are longer. Northern and southern hemispheres have opposite seasons.",
  tryThis: ["Compare daylight hours on 21 June and 21 December at 40° N.", "Set the tilt to 0°. What happens to the seasons?", "Move to the equator (0°). How much does day length change through the year?"],
  note: "Press Play to move through the year.",
});
