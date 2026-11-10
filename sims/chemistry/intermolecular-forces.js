const { C, text, rect, plot } = Sim;
const ALK = [["Methane", 1, -162], ["Ethane", 2, -89], ["Propane", 3, -42], ["Butane", 4, -1], ["Pentane", 5, 36], ["Hexane", 6, 69], ["Heptane", 7, 98], ["Octane", 8, 126], ["Nonane", 9, 151], ["Decane", 10, 174]];
Sim({
  title: "Intermolecular Forces and Boiling Points",
  intro: "Molecules are attracted to each other by weak intermolecular forces. Longer molecules have more contact and stronger forces, so more energy is needed to pull them apart: their boiling points are higher.",
  controls: [
    { id: "n", label: "Carbon atoms in the alkane", min: 1, max: 10, step: 1, value: 4 },
    { id: "T", label: "Room temperature", min: -50, max: 50, step: 5, value: 20, unit: "°C" },
  ],
  readouts: [["name", "Alkane"], ["bp", "Boiling point"], ["state", "State at this temperature"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const top = H * 0.42, [name, n, bp] = ALK[p.n - 1];
    // molecule zig-zag
    const sx = 30, step = Math.min(44, (W - 60) / 10);
    const draw = (y, col) => { let px, py; for (let i = 0; i < n; i++) { const x = sx + i * step, yy = y + (i % 2 ? 12 : -12); if (i) Sim.line(ctx, px, py, x, yy, C.text, 3); Sim.circle(ctx, x, yy, 9, col); px = x; py = yy; } };
    draw(top * 0.35, "#495057"); draw(top * 0.75, "#495057");
    for (let i = 0; i < n; i++) Sim.line(ctx, sx + i * step, top * 0.35 + 14, sx + i * step, top * 0.75 - 14, C.purple, 1.5, [3, 4]);
    text(ctx, `${name}: ${n} carbon${n > 1 ? "s" : ""}. Purple dashes show attractions between molecules`, sx, 18, { size: 12, weight: 600 });
    plot(ctx, { x: 0, y: top, w: W, h: H - top }, { xmin: 1, xmax: 10, ymin: -180, ymax: 200, xstep: 1, xlabel: "carbon atoms", ylabel: "boiling point (°C)", series: [{ data: ALK.map((a) => [a[1], a[2]]), color: C.orange }], hlines: [{ y: p.T, color: C.blue, label: `room temperature ${p.T} °C` }], marks: [{ x: n, y: bp, color: C.red }] });
  },
  read(s, p) { const [name, , bp] = ALK[p.n - 1]; return { name, bp: bp + " °C", state: p.T > bp ? "gas" : "liquid" }; },
  keyIdea: "<b>Key idea:</b> boiling a simple molecular substance breaks the intermolecular forces, not the covalent bonds inside molecules. Bigger molecules have stronger intermolecular forces, so higher boiling points.",
  tryThis: ["Which alkanes are gases at 20 °C?", "Why is the jump in boiling point from methane to ethane bigger than from nonane to decane?", "When butane boils in a lighter, are any covalent bonds broken?"],
});
