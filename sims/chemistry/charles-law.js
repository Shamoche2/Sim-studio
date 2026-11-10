const { C, text, rect, circle, plot } = Sim;
const vol = (p) => ((p.T + 273.15) / 573.15) * 100 * 0.95;
Sim({
  title: "Charles's Law: Volume and Temperature",
  intro: "Heat a gas in a container with a free-moving piston. The particles move faster and push the piston out, so the gas expands. The pressure stays the same.",
  controls: [{ id: "T", label: "Temperature", min: -200, max: 300, step: 5, value: 20, unit: "°C" }],
  buttons: [{ label: "Record point", primary: true, click(s, p) { s.points.push({ x: p.T, y: vol(p) }); }, }, { label: "Clear graph", click(s) { s.points = []; } }],
  readouts: [["Tk", "Temperature (kelvin)"], ["V", "Volume"], ["ratio", "V ÷ T (kelvin)"]],
  init(s, p) { s.box = { x0: 0, y0: 0, x1: 50, y1: 40 }; s.parts = Sim.particles.make(50, s.box, 10); s.points = s.points || []; },
  substeps: 3,
  step(s, p, dt) {
    s.box.y0 = Sim.lerp(s.box.y0, 40 - (40 * (p.T + 273.15)) / 573.15, 0.05);
    Sim.particles.move(s.parts, dt * 3, s.box);
    Sim.particles.thermostat(s.parts, (p.T + 273.15) / 3, 0.2);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.42, sc = (H - 30) / 40, ox = (left - 50 * sc) / 2, oy = 15;
    rect(ctx, 0, 0, left, H, "#fff");
    rect(ctx, ox, oy, 50 * sc, 40 * sc, null, C.text, 0, 3);
    rect(ctx, ox + 2, oy + s.box.y0 * sc - 10, 50 * sc - 4, 10, C.gray);
    const heat = (p.T + 200) / 500;
    for (let i = 0; i < 5; i++) text(ctx, "🔥", ox + 50 * sc * (0.15 + i * 0.18), oy + 40 * sc + 14, { size: 8 + heat * 12, align: "center" });
    for (const q of s.parts) circle(ctx, ox + q.x * sc, oy + q.y * sc, sc * 0.9, `hsl(${220 - heat * 220},75%,50%)`);
    const line = [[-273, 0], [300, (573.15 / 573.15) * 95]];
    plot(ctx, { x: left + 10, y: 10, w: W - left - 20, h: H - 20 }, { title: "Volume vs temperature", xmin: -300, xmax: 300, ymin: 0, ymax: 100, xlabel: "temperature (°C)", ylabel: "volume (%)", series: [{ data: line, color: C.gray, dash: [5, 4] }], vlines: [{ x: -273, color: C.red, label: "absolute zero" }], marks: [...s.points.map((m) => ({ ...m, color: C.blue })), { x: p.T, y: vol(p), color: C.red, r: 4 }] });
  },
  read(s, p) { const Tk = p.T + 273.15; return { Tk: Tk.toFixed(0) + " K", V: vol(p).toFixed(1) + " %", ratio: (vol(p) / Tk).toFixed(3) }; },
  keyIdea: "<b>Key idea:</b> at constant pressure, volume is proportional to the temperature in kelvin: V/T = constant. Extend the line back and it hits zero volume at −273 °C: absolute zero.",
  tryThis: ["Record points at −100, 0, 100 and 200 °C. Is the graph a straight line?", "Where would the line hit zero volume?", "Double the temperature from 100 K to 200 K. What happens to the volume? Does it double from 100 °C to 200 °C?"],
});
