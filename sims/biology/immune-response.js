const { C, text, rect, plot } = Sim;
Sim({
  title: "The Immune Response and Vaccination",
  intro: "When a pathogen gets in, white blood cells make antibodies to destroy it, but the first time this takes days. Memory cells remember it, so a second infection is fought off fast. Vaccines create memory cells without you getting ill.",
  controls: [{ id: "vacc", label: "Vaccinated beforehand", type: "checkbox", value: false }],
  buttons: [{ label: "Infection!", primary: true, click(s) { s.infections.push(s.day); s.path += 1; } }],
  readouts: [["day", "Day"], ["path", "Pathogens"], ["ab", "Antibody level"], ["ill", "Feeling"]],
  init(s, p) { s.day = 0; s.path = 0; s.ab = 0; s.mem = p.vacc ? 1 : 0; s.infections = []; s.hist = { ab: [[0, 0]], path: [[0, 0]] }; s.lag = 0; },
  resetOnChange: true,
  step(s, p, dt) {
    s.day += dt * 2; const h = dt * 2;
    if (s.path > 0) { s.lag += h; const ready = s.lag > (s.mem ? 1.5 : 6); if (ready) s.ab += (s.mem ? 3 : 0.8) * h * (1 + s.mem * 2); }
    s.path = Math.max(0, s.path + (s.path * 0.9 - s.ab * 0.6 * s.path) * h);
    if (s.path > 0 && s.path < 0.01) s.path = 0;
    if (s.path === 0) { s.lag = 0; if (s.ab > 0.5) s.mem = 1; s.ab *= Math.exp(-0.08 * h); }
    s.path = Math.min(s.path, 50);
    if (s.day - s.hist.ab.at(-1)[0] > 0.2) { s.hist.ab.push([s.day, s.ab]); s.hist.path.push([s.day, s.path]); }
  },
  draw({ ctx, W, H }, s) {
    rect(ctx, 0, 0, W, H, "#fff");
    const t0 = Math.max(0, s.day - 60), half = (H - 10) / 2;
    plot(ctx, { x: 0, y: 0, w: W, h: half }, { title: "Pathogens in the body", xmin: t0, xmax: t0 + 60, ymin: 0, ymax: 55, xlabel: "days", ylabel: "pathogens", series: [{ data: s.hist.path, color: C.red }], hlines: [{ y: 20, color: C.orange, label: "you feel ill above this" }], vlines: s.infections.map((d) => ({ x: d, color: "#ced4da", label: "infection" })) });
    plot(ctx, { x: 0, y: half + 10, w: W, h: half }, { title: "Antibodies in the blood", xmin: t0, xmax: t0 + 60, ymin: 0, ymax: 20, xlabel: "days", ylabel: "antibodies", series: [{ data: s.hist.ab, color: C.blue }] });
  },
  read(s) { return { day: s.day.toFixed(0), path: s.path.toFixed(1), ab: s.ab.toFixed(1), ill: s.path > 20 ? "ill" : s.path > 0 ? "fighting it off" : "healthy" + (s.mem ? " (immune)" : "") }; },
  keyIdea: "<b>Key idea:</b> the primary response is slow and small; the secondary response (from memory cells) is fast and large, so the pathogen is destroyed before you feel ill. Vaccines contain dead or weakened pathogens (or parts of them) to trigger memory cells safely.",
  tryThis: ["Cause an infection without vaccination. How many days until antibodies appear? Do you get ill?", "After recovering, cause a second infection. What's different?", "Tick 'vaccinated', then cause an infection. Explain the result."],
  note: "Simplified model; time is sped up.",
});
