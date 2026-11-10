const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Eutrophication",
  intro: "Fertiliser washing from farms into a lake feeds algae, which grow into a thick layer. This blocks light, so plants below die. Bacteria decomposing them use up the oxygen, and fish suffocate. Control the fertiliser and watch the lake.",
  controls: [{ id: "fert", label: "Fertiliser run-off", min: 0, max: 100, step: 5, value: 60, unit: "%" }],
  readouts: [["algae", "Algae"], ["o2", "Dissolved oxygen"], ["fish", "Fish"], ["stage", "Stage"]],
  resetOnChange: true,
  init(s) { s.t = 0; s.nut = 0.1; s.alg = 0.1; s.plants = 1; s.dead = 0; s.o2 = 1; s.fish = 1; s.hist = { a: [], o: [], f: [] }; },
  step(s, p, dt) {
    const h = dt * 2; s.t += h;
    s.nut += (p.fert / 100 * 0.3 - s.nut * 0.2 - s.alg * s.nut * 0.3) * h;
    s.alg += (s.alg * s.nut * 1.2 * (1 - s.alg) - s.alg * 0.08) * h;
    const light = 1 - Math.min(0.95, s.alg);
    s.plants += ((light - 0.3) * 0.2 * s.plants * (s.plants < 1 ? 1 : 0) - (light < 0.3 ? 0.15 * s.plants : 0)) * h; s.plants = Sim.clamp(s.plants, 0, 1);
    s.dead += (s.alg * 0.08 + (light < 0.3 ? 0.15 : 0) * s.plants - s.dead * 0.1) * h;
    s.o2 += ((s.plants * light * 0.3 + 0.12) - s.dead * 0.5 - s.fish * 0.05 - (s.o2 - 1) * 0.1) * h; s.o2 = Sim.clamp(s.o2, 0, 1.3);
    s.fish += (s.o2 < 0.4 ? -0.3 * s.fish : 0.05 * s.fish * (1 - s.fish)) * h; s.fish = Sim.clamp(s.fish, 0, 1);
    if (!s.hist.a.length || s.t - s.hist.a.at(-1)[0] > 0.3) { s.hist.a.push([s.t, s.alg]); s.hist.o.push([s.t, s.o2]); s.hist.f.push([s.t, s.fish]); }
  },
  draw({ ctx, W, H }, s, p) {
    const top = H * 0.5;
    rect(ctx, 0, 0, W, top, `rgb(${Math.round(116 - s.alg * 60)},${Math.round(192 - s.alg * 20)},${Math.round(252 - s.alg * 180)})`);
    rect(ctx, 0, 0, W, 8 + s.alg * 26, `rgba(64,192,87,${0.3 + s.alg * 0.7})`);
    rect(ctx, 0, top - 16, W, 16, "#8d6e63");
    for (let i = 0; i < 10; i++) { const x = 20 + i * (W - 40) / 9; ctx.strokeStyle = s.plants > 0.3 ? "#2b8a3e" : "#868e96"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, top - 16); ctx.quadraticCurveTo(x + 8, top - 16 - 30 * s.plants, x, top - 16 - 60 * s.plants); ctx.stroke(); }
    const nf = Math.round(s.fish * 8); for (let i = 0; i < 8; i++) { const x = 40 + ((i * 97 + s.t * 30) % (W - 80)), y = 50 + (i % 4) * 30; if (i < nf) { ctx.fillStyle = "#fab005"; ctx.beginPath(); ctx.ellipse(x, y, 12, 6, 0, 0, Math.PI * 2); ctx.fill(); } else if (s.t > 5) { ctx.fillStyle = "#adb5bd"; ctx.beginPath(); ctx.ellipse(x, 14 + s.alg * 20, 12, 5, Math.PI, 0, Math.PI * 2); ctx.fill(); } }
    rect(ctx, W - 160, 10, 150, 22, "rgba(255,255,255,.8)", null, 4); text(ctx, `fertiliser run-off ${p.fert}%`, W - 152, 26, { size: 12, weight: 600 });
    plot(ctx, { x: 0, y: top + 4, w: W, h: H - top - 4 }, { xmin: 0, xmax: Math.max(40, s.t), ymin: 0, ymax: 1.3, ystep: 5, xlabel: "weeks", series: [{ data: s.hist.a, color: C.green, label: "algae" }, { data: s.hist.o, color: C.blue, label: "oxygen" }, { data: s.hist.f, color: C.orange, label: "fish" }] });
  },
  read(s) { return { algae: (s.alg * 100).toFixed(0) + "% cover", o2: (s.o2 * 100).toFixed(0) + "% of normal", fish: (s.fish * 100).toFixed(0) + "%", stage: s.fish < 0.1 ? "fish have died" : s.o2 < 0.5 ? "oxygen running out" : s.alg > 0.5 ? "algal bloom" : "healthy" }; },
  keyIdea: "<b>Key idea:</b> nutrients (nitrates, phosphates) → algal bloom → light blocked → plants die → decomposers multiply and use up oxygen → fish and other animals die. Reducing fertiliser use and leaving field margins help prevent it.",
  tryThis: ["With 60% run-off, put the stages of eutrophication in order as they happen.", "Set run-off to 10%. Does the lake stay healthy?", "Why do bacteria, not algae, use up most of the oxygen?"],
  note: "Simplified model; time sped up.",
});
