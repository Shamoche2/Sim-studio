const { C, text, rect, circle, line } = Sim;
const METALS = { Mg: [-2.37, 2, "#ced4da"], Zn: [-0.76, 2, "#adb5bd"], Fe: [-0.44, 2, "#868e96"], Pb: [-0.13, 2, "#495057"], Cu: [0.34, 2, "#d9480f"], Ag: [0.8, 1, "#dee2e6"] };
const lcm = (a, b) => (a * b) / (function g(x, y) { return y ? g(y, x % y) : x; })(a, b);
Sim({
  title: "Electrochemical (Galvanic) Cell",
  intro: "Two different metals in solutions of their own ions, joined by a wire and a salt bridge, make a battery. The more reactive metal gives away electrons, which flow through the wire to the other metal.",
  controls: [
    { id: "L", label: "Left metal", type: "select", options: Object.keys(METALS).map((k) => [k, `${k} (E° = ${METALS[k][0].toFixed(2)} V)`]), value: "Zn" },
    { id: "R", label: "Right metal", type: "select", options: Object.keys(METALS).map((k) => [k, `${k} (E° = ${METALS[k][0].toFixed(2)} V)`]), value: "Cu" },
    { id: "cL", label: "Left ion concentration", min: -3, max: 0.3, step: 0.1, value: 0, format: (v) => (10 ** v).toPrecision(2), unit: "mol/L" },
    { id: "cR", label: "Right ion concentration", min: -3, max: 0.3, step: 0.1, value: 0, format: (v) => (10 ** v).toPrecision(2), unit: "mol/L" },
  ],
  readouts: [["E", "Cell voltage"], ["anode", "Anode (−, oxidised)"], ["cathode", "Cathode (+, reduced)"], ["eq", "Overall reaction"]],
  calc(p) {
    const [eL, zL] = METALS[p.L], [eR, zR] = METALS[p.R];
    if (p.L === p.R) return { E: 0, same: true };
    const leftAnode = eL < eR, an = leftAnode ? p.L : p.R, ca = leftAnode ? p.R : p.L;
    const [ea, za] = METALS[an], [ec, zc] = METALS[ca], n = lcm(za, zc);
    const cA = 10 ** (leftAnode ? p.cL : p.cR), cC = 10 ** (leftAnode ? p.cR : p.cL);
    const Q = Math.pow(cA, n / za) / Math.pow(cC, n / zc);
    return { E: ec - ea - (0.0592 / n) * Math.log10(Q), an, ca, leftAnode, n, za, zc };
  },
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const r = this.calc(p), bw = W * 0.3, bh = H * 0.45, by = H * 0.45, lx = W * 0.08, rx = W * 0.62;
    for (const [x, m, c] of [[lx, p.L, p.cL], [rx, p.R, p.cR]]) {
      rect(ctx, x, by, bw, bh, `rgba(116,192,252,${0.15 + (c + 3) * 0.08})`, C.text, 4, 2);
      rect(ctx, x + bw / 2 - 12, by - 60, 24, bh * 0.8 + 60, METALS[m][2], C.text, 2, 1.5);
      text(ctx, m, x + bw / 2, by + bh + 22, { align: "center", weight: 700, size: 16 });
      text(ctx, `${m}${METALS[m][1] > 1 ? METALS[m][1] : ""}+ ions`, x + bw / 2, by + bh - 10, { align: "center", size: 12, color: C.muted });
    }
    // salt bridge
    ctx.strokeStyle = "#f2b705"; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(lx + bw * 0.8, by + 30); ctx.lineTo(lx + bw * 0.8, by - 20); ctx.lineTo(rx + bw * 0.2, by - 20); ctx.lineTo(rx + bw * 0.2, by + 30); ctx.stroke();
    text(ctx, "salt bridge", W / 2, by - 30, { align: "center", size: 12, color: C.muted });
    // wire and voltmeter
    const wy = 40, ax = lx + bw / 2, bx2 = rx + bw / 2;
    line(ctx, ax, by - 60, ax, wy, C.text, 2); line(ctx, bx2, by - 60, bx2, wy, C.text, 2); line(ctx, ax, wy, bx2, wy, C.text, 2);
    circle(ctx, W / 2, wy, 26, "#fff", C.text, 2);
    text(ctx, `${Math.abs(r.E).toFixed(2)} V`, W / 2, wy + 5, { align: "center", weight: 700 });
    if (!r.same && Math.abs(r.E) > 0.001) {
      const dir = r.leftAnode ? 1 : -1, span = bx2 - ax;
      for (let i = 0; i < 8; i++) { const f = ((i / 8 + s.t * 0.25 * Math.min(2, Math.abs(r.E))) % 1); const x = dir > 0 ? ax + f * span : bx2 - f * span; if (Math.abs(x - W / 2) > 28) circle(ctx, x, wy, 4, C.blue); }
      text(ctx, "e⁻ flow →".replace("→", dir > 0 ? "→" : "←"), W / 2, wy + 46, { align: "center", color: C.blue, weight: 600 });
      text(ctx, "anode (−)", (r.leftAnode ? ax : bx2), by - 70, { align: "center", color: C.red, weight: 600, size: 12 });
      text(ctx, "cathode (+)", (r.leftAnode ? bx2 : ax), by - 70, { align: "center", color: C.green, weight: 600, size: 12 });
    }
  },
  read(s, p) {
    const r = this.calc(p);
    if (r.same) return { E: "0.00 V", anode: "—", cathode: "—", eq: "same metal: no reaction" };
    const sup = (z) => (z > 1 ? z : "") + "+", mult = (k) => (k > 1 ? k + " " : "");
    return { E: r.E.toFixed(2) + " V", anode: `${r.an} → ${r.an}${sup(r.za)} + ${r.za}e⁻`, cathode: `${r.ca}${sup(r.zc)} + ${r.zc}e⁻ → ${r.ca}`, eq: `${mult(r.n / r.za)}${r.an} + ${mult(r.n / r.zc)}${r.ca}${sup(r.zc)} → ${mult(r.n / r.za)}${r.an}${sup(r.za)} + ${mult(r.n / r.zc)}${r.ca}` };
  },
  keyIdea: "<b>Key idea:</b> E<sub>cell</sub> = E°<sub>cathode</sub> − E°<sub>anode</sub>. The metal with the more negative E° is the anode and gets oxidised. Changing concentrations shifts the voltage a little (Nernst equation).",
  tryThis: ["Make a zinc–copper cell (the Daniell cell). What voltage do you get?", "Which pair of metals gives the biggest voltage?", "Lower the copper ion concentration. Does the voltage go up or down? Why?"],
  note: "Standard electrode potentials at 25 °C.",
});
