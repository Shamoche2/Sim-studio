const { C, text, rect, circle } = Sim;
const PLANETS = [["Mercury", 3.7, "#adb5bd"], ["Venus", 8.87, "#f2b705"], ["Earth", 9.81, "#4dabf7"], ["Moon", 1.62, "#ced4da"], ["Mars", 3.71, "#e8590c"], ["Jupiter", 24.79, "#d9a066"], ["Saturn", 10.44, "#ffe066"], ["Uranus", 8.69, "#99e9f2"], ["Neptune", 11.15, "#4263eb"], ["Pluto", 0.62, "#e9ecef"]];
Sim({
  title: "Mass, Weight and Gravity on Other Planets",
  intro: "Your mass (how much matter you're made of) is the same everywhere. Your weight is the force of gravity pulling on you, so it changes from planet to planet. Find out how much you would weigh and how high you could jump.",
  controls: [
    { id: "m", label: "Your mass", min: 10, max: 120, step: 1, value: 50, unit: "kg" },
    { id: "jump", label: "Jump height on Earth", min: 0.1, max: 1, step: 0.05, value: 0.4, unit: "m", digits: 2 },
  ],
  readouts: [["earth", "Weight on Earth"], ["mass", "Mass (everywhere)"], ["max", "Heaviest on"]],
  aspect: 4 / 3,
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#0b1020");
    const rowH = (H - 30) / PLANETS.length, x0 = 110, maxW = W - x0 - 150;
    text(ctx, "Weight (N)", x0, 18, { color: "#adb5bd", weight: 700 }); text(ctx, "Jump height", W - 10, 18, { color: "#adb5bd", weight: 700, align: "right" });
    PLANETS.forEach(([n, g, col], i) => {
      const y = 26 + i * rowH, Wt = p.m * g;
      circle(ctx, 20, y + rowH / 2, Math.min(rowH * 0.4, 6 + Math.sqrt(g) * 2), col);
      text(ctx, n, 34, y + rowH / 2 + 4, { color: "#fff", size: 12, weight: n === "Earth" ? 700 : 400 });
      rect(ctx, x0, y + 4, (Wt / (120 * 24.79)) * maxW, rowH - 8, col, null, 3);
      text(ctx, `${Wt.toFixed(0)} N`, x0 + (Wt / (120 * 24.79)) * maxW + 6, y + rowH / 2 + 4, { color: "#fff", size: 12 });
      text(ctx, `${((p.jump * 9.81) / g).toFixed(2)} m`, W - 10, y + rowH / 2 + 4, { color: "#adb5bd", size: 12, align: "right" });
    });
  },
  read(s, p) { return { earth: (p.m * 9.81).toFixed(0) + " N", mass: p.m + " kg", max: "Jupiter (" + (p.m * 24.79).toFixed(0) + " N)" }; },
  keyIdea: "<b>Key idea:</b> weight W = m × g, where g is the gravitational field strength (N/kg). Mass is measured in kg and never changes; weight is a force measured in newtons.",
  tryThis: ["How much would you weigh on the Moon? What fraction of your Earth weight is that?", "On which planet could you jump the highest?", "Saturn is much bigger than Earth. Why is gravity there only a little stronger?"],
  note: "Values of g at the surface (cloud tops for the gas giants).",
});
