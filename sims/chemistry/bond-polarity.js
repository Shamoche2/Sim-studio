const { C, text, rect, circle } = Sim;
const EN = { H: 2.2, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Cl: 3.16, Br: 2.96, I: 2.66, S: 2.58, Na: 0.93, Mg: 1.31, K: 0.82, Li: 0.98, Ca: 1.0 };
const opts = Object.keys(EN).map((k) => [k, `${k} (${EN[k]})`]);
Sim({
  title: "Electronegativity and Bond Polarity",
  intro: "Electronegativity is how strongly an atom pulls on the shared electrons in a bond. If two atoms pull differently, the electrons sit closer to one atom, making the bond polar. A big difference means the electron transfers completely: an ionic bond.",
  controls: [
    { id: "a", label: "Atom A (electronegativity)", type: "select", options: opts, value: "H" },
    { id: "b", label: "Atom B (electronegativity)", type: "select", options: opts, value: "Cl" },
  ],
  readouts: [["d", "Difference"], ["type", "Bond type"], ["neg", "Electrons pulled towards"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const ea = EN[p.a], eb = EN[p.b], d = Math.abs(ea - eb), cx = W / 2, cy = H * 0.42, sep = W * 0.22, shift = Sim.clamp((eb - ea) / 2.2, -1, 1);
    const grad = ctx.createLinearGradient(cx - sep, 0, cx + sep, 0);
    grad.addColorStop(0, `rgba(47,111,237,${0.15 + Math.max(0, -shift) * 0.6})`); grad.addColorStop(1, `rgba(47,111,237,${0.15 + Math.max(0, shift) * 0.6})`);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(cx + shift * sep * 0.5, cy, sep * 1.4, H * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    circle(ctx, cx - sep, cy, 34, "#fff", C.text, 2); circle(ctx, cx + sep, cy, 34, "#fff", C.text, 2);
    text(ctx, p.a, cx - sep, cy + 8, { align: "center", size: 24, weight: 800 }); text(ctx, p.b, cx + sep, cy + 8, { align: "center", size: 24, weight: 800 });
    const ex = cx + shift * sep * (d > 1.8 ? 1 : 0.6); circle(ctx, ex - 6, cy, 5, C.blue); circle(ctx, ex + 6, cy, 5, C.blue);
    if (d > 0.4) { const neg = eb > ea ? 1 : -1; text(ctx, d > 1.8 ? "−" : "δ−", cx + neg * sep, cy - 46, { align: "center", size: 20, weight: 700, color: C.blue }); text(ctx, d > 1.8 ? "+" : "δ+", cx - neg * sep, cy - 46, { align: "center", size: 20, weight: 700, color: C.red }); }
    // scale
    const sx = 40, sw = W - 80, sy = H * 0.78;
    [[0, 0.4, "#d3f9d8", "non-polar covalent"], [0.4, 1.8, "#fff3bf", "polar covalent"], [1.8, 3.3, "#ffd8a8", "ionic"]].forEach(([a, b, col, label]) => { rect(ctx, sx + (a / 3.3) * sw, sy, ((b - a) / 3.3) * sw, 24, col); text(ctx, label, sx + (((a + b) / 2) / 3.3) * sw, sy + 16, { align: "center", size: 12, weight: 600 }); });
    const mx = sx + (d / 3.3) * sw; ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(mx, sy - 2); ctx.lineTo(mx - 7, sy - 14); ctx.lineTo(mx + 7, sy - 14); ctx.fill();
    text(ctx, "difference in electronegativity →", sx, sy + 44, { size: 11, color: C.muted });
  },
  read(s, p) { const d = Math.abs(EN[p.a] - EN[p.b]); return { d: d.toFixed(2), type: d < 0.4 ? "non-polar covalent" : d < 1.8 ? "polar covalent" : "ionic", neg: d < 0.05 ? "shared equally" : EN[p.a] > EN[p.b] ? p.a : p.b }; },
  keyIdea: "<b>Key idea:</b> fluorine is the most electronegative element. Electronegativity increases across a period and decreases down a group. Difference < 0.4: non-polar; 0.4–1.8: polar covalent; > 1.8: mostly ionic.",
  tryThis: ["Compare H–H, H–Cl and Na–Cl bonds. How does the type change?", "Which end of the H–F bond is slightly negative (δ−)?", "Why is a C–H bond almost non-polar?"],
  note: "The 0.4 and 1.8 cut-offs are a common guide, not sharp boundaries.",
});
