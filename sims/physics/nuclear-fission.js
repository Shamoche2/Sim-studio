const { C, text, rect, circle, plot } = Sim;
Sim({
  title: "Nuclear Fission and Chain Reactions",
  intro: "A slow neutron splits a uranium-235 nucleus into two smaller nuclei, releasing energy and 2–3 more neutrons. Those neutrons can split more nuclei: a chain reaction. Control rods absorb neutrons to keep it steady in a reactor.",
  controls: [
    { id: "n", label: "Uranium-235 nuclei", min: 20, max: 200, step: 10, value: 120 },
    { id: "rods", label: "Control rods (neutron absorption)", min: 0, max: 90, step: 5, value: 0, unit: "%" },
  ],
  buttons: [{ label: "Fire a neutron", primary: true, click(s) { s.neu.push({ x: 0, y: 0.5, vx: 0.5, vy: Sim.rand(-0.05, 0.05) }); } }],
  readouts: [["split", "Nuclei split"], ["neutrons", "Free neutrons"], ["energy", "Energy released"]],
  resetOnChange: true,
  init(s, p) { s.nuc = Array.from({ length: p.n }, () => ({ x: Sim.rand(0.08, 0.98), y: Sim.rand(0.05, 0.95), split: false, t: 0 })); s.neu = []; s.t = 0; s.hist = [[0, 0]]; },
  step(s, p, dt) {
    s.t += dt;
    for (const q of s.neu) { q.x += q.vx * dt; q.y += q.vy * dt; if (Math.random() < (p.rods / 100) * dt * 2.5) q.dead = true; }
    for (const q of s.neu) {
      if (q.dead) continue;
      for (const u of s.nuc) if (!u.split && Math.abs(u.x - q.x) < 0.02 && Math.abs(u.y - q.y) < 0.03) {
        u.split = true; u.t = s.t; q.dead = true;
        const k = Math.random() < 0.5 ? 2 : 3;
        for (let i = 0; i < k; i++) { const a = Math.random() * Math.PI * 2; s.neu.push({ x: u.x, y: u.y, vx: Math.cos(a) * 0.35, vy: Math.sin(a) * 0.35 }); }
        break;
      }
    }
    s.neu = s.neu.filter((q) => !q.dead && q.x > -0.05 && q.x < 1.05 && q.y > -0.05 && q.y < 1.05);
    if (s.t - s.hist.at(-1)[0] > 0.1) s.hist.push([s.t, s.nuc.filter((u) => u.split).length]);
  },
  draw({ ctx, W, H }, s, p) {
    const left = W * 0.6;
    rect(ctx, 0, 0, left, H, "#0b1020");
    for (const u of s.nuc) {
      const x = u.x * left, y = u.y * H;
      if (!u.split) circle(ctx, x, y, 7, "#51cf66", "#2b8a3e", 1);
      else { const age = Math.min(1, (s.t - u.t) * 2); if (s.t - u.t < 0.4) circle(ctx, x, y, 20 * (1 - (s.t - u.t) / 0.4) + 4, "rgba(255,212,59,.6)"); circle(ctx, x - 6 * age, y, 4.5, "#fa5252"); circle(ctx, x + 6 * age, y, 4, "#ff922b"); }
    }
    for (const q of s.neu) circle(ctx, q.x * left, q.y * H, 2.5, "#fff");
    if (p.rods > 0) for (let i = 1; i <= 4; i++) rect(ctx, (i / 5) * left - 3, 0, 6, H * (p.rods / 100), "#868e96");
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: "Nuclei split", xmin: 0, xmax: Math.max(8, s.t), ymin: 0, ymax: p.n, xlabel: "time (s)", ylabel: "count", series: [{ data: s.hist, color: C.orange }] });
  },
  read(s) { const k = s.nuc.filter((u) => u.split).length; return { split: String(k), neutrons: String(s.neu.length), energy: (k * 200) + " MeV" }; },
  keyIdea: "<b>Key idea:</b> each fission releases about 200 MeV and 2–3 neutrons. If on average more than one of those neutrons causes another fission, the reaction grows (as in a bomb); a reactor uses control rods to keep it at exactly one.",
  tryThis: ["Fire one neutron with no control rods. How fast does the reaction spread?", "Insert control rods to 50%. Does the chain reaction still grow?", "Reduce the number of nuclei. Why does a chain reaction need a 'critical mass'?"],
  note: "Grey bars show control rods. Simplified 2D model.",
});
