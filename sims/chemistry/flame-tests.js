const { C, text, rect } = Sim;
const IONS = { li: ["Lithium, Li⁺", "#e03131", "crimson red"], na: ["Sodium, Na⁺", "#fab005", "yellow-orange"], k: ["Potassium, K⁺", "#b197fc", "lilac"], ca: ["Calcium, Ca²⁺", "#ff6b00", "orange-red (brick red)"], cu: ["Copper, Cu²⁺", "#38d9a9", "blue-green"], sr: ["Strontium, Sr²⁺", "#c2255c", "red"], ba: ["Barium, Ba²⁺", "#a9e34b", "pale green"] };
Sim({
  title: "Flame Tests",
  intro: "Dip a clean wire loop into a sample and hold it in a hot flame. Electrons in the metal ions absorb energy, jump to higher levels, then fall back and give out light of specific colours. Each metal ion has its own colour.",
  controls: [
    { id: "ion", label: "Metal ion in the sample", type: "select", options: Object.entries(IONS).map(([k, v]) => [k, v[0]]) },
    { id: "mystery", label: "Hide the name (mystery sample)", type: "checkbox", value: false },
  ],
  readouts: [["colour", "Flame colour"], ["ion", "Metal ion"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#212529");
    const cx = W / 2, base = H - 40, col = IONS[p.ion][1];
    rect(ctx, cx - 18, base, 36, 40, "#868e96");
    for (let i = 0; i < 4; i++) {
      const h = H * (0.55 - i * 0.08) * (1 + 0.05 * Math.sin(s.t * 9 + i)), w = 48 - i * 9;
      ctx.beginPath(); ctx.moveTo(cx - w / 2, base); ctx.quadraticCurveTo(cx - w * 0.7, base - h * 0.5, cx + Math.sin(s.t * 6) * 4, base - h); ctx.quadraticCurveTo(cx + w * 0.7, base - h * 0.5, cx + w / 2, base); ctx.closePath();
      ctx.fillStyle = i === 3 ? "rgba(116,192,252,.7)" : col; ctx.globalAlpha = 0.35 + i * 0.1; ctx.fill();
    }
    ctx.globalAlpha = 1;
    Sim.line(ctx, cx + 120, base - H * 0.25, cx + 6, base - H * 0.2, "#adb5bd", 2); Sim.circle(ctx, cx + 4, base - H * 0.2, 5, null, "#adb5bd", 2);
    text(ctx, "nichrome wire loop", cx + 124, base - H * 0.25, { color: "#adb5bd", size: 12 });
  },
  read(s, p) { return { colour: IONS[p.ion][2], ion: p.mystery ? "? (identify it from the colour)" : IONS[p.ion][0] }; },
  keyIdea: "<b>Key idea:</b> flame colours identify metal ions: lithium crimson, sodium yellow, potassium lilac, calcium orange-red, copper blue-green. Fireworks use these same compounds.",
  tryThis: ["Turn on 'mystery sample', choose any option and identify the ion from its colour.", "Why must the wire loop be cleaned in acid between tests?", "A sample with both sodium and potassium looks yellow. Why might the lilac colour be hidden?"],
});
