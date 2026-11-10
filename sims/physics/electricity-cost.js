const { C, text, rect } = Sim;
const APPS = [["LED bulb", 10], ["Phone charger", 5], ["Laptop", 60], ["TV", 100], ["Fridge", 150], ["Fan", 50], ["Iron", 1200], ["Kettle", 2200], ["Electric heater", 2000], ["Air conditioner", 1500]];
Sim({
  title: "Electrical Power and Energy Cost",
  intro: "Every appliance has a power rating in watts. The energy it uses depends on its power and how long it's on. Electricity companies charge per kilowatt-hour (kWh). Plan a household's daily use and see the bill.",
  controls: [
    ...APPS.map(([n], i) => ({ id: "h" + i, label: `${n} (${APPS[i][1]} W)`, min: 0, max: 24, step: 0.5, value: [5, 2, 4, 3, 24, 6, 0.5, 0.2, 0, 0][i], unit: "h/day", digits: 1 })),
    { id: "price", label: "Price per kWh", min: 0.05, max: 0.5, step: 0.01, value: 0.15, digits: 2, unit: "$" },
  ],
  readouts: [["day", "Energy per day"], ["cost", "Cost per day"], ["month", "Cost per month"], ["big", "Biggest user"]],
  aspect: 4 / 3,
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const kwh = APPS.map(([n, w], i) => [n, (w * p["h" + i]) / 1000]), max = Math.max(0.5, ...kwh.map((k) => k[1])), rowH = (H - 30) / APPS.length, x0 = W * 0.3;
    text(ctx, "Energy used per day (kWh)", x0, 18, { weight: 700 });
    kwh.forEach(([n, e], i) => { const y = 26 + i * rowH; text(ctx, n, x0 - 8, y + rowH / 2 + 4, { align: "right", size: 12 }); rect(ctx, x0, y + 3, (e / max) * (W - x0 - 90), rowH - 6, `hsl(${200 - (e / max) * 200},70%,55%)`, null, 3); text(ctx, `${e.toFixed(2)} kWh`, x0 + (e / max) * (W - x0 - 90) + 6, y + rowH / 2 + 4, { size: 11, color: C.muted }); });
  },
  read(s, p) { const kwh = APPS.map(([n, w], i) => [n, (w * p["h" + i]) / 1000]), tot = kwh.reduce((a, k) => a + k[1], 0), big = kwh.reduce((a, b) => (b[1] > a[1] ? b : a)); return { day: tot.toFixed(2) + " kWh", cost: "$" + (tot * p.price).toFixed(2), month: "$" + (tot * p.price * 30).toFixed(2), big: big[1] > 0 ? big[0] : "—" }; },
  keyIdea: "<b>Key idea:</b> energy (kWh) = power (kW) × time (hours). Cost = energy × price per kWh. A high-power appliance used briefly can cost less than a low-power one left on all day.",
  tryThis: ["Which uses more energy in a day: a kettle for 12 minutes or a TV for 3 hours?", "The fridge runs all day. How much does it cost per month?", "Switch from 4 old 60 W bulbs to 10 W LEDs for 5 hours a day. How much do you save in a month?"],
  note: "Set the price to match your local electricity tariff.",
});
