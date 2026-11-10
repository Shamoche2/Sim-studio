const { C, text, rect, circle } = Sim;
const ELEMENTS = ["", "Hydrogen H", "Helium He", "Lithium Li", "Beryllium Be", "Boron B", "Carbon C", "Nitrogen N", "Oxygen O", "Fluorine F", "Neon Ne", "Sodium Na", "Magnesium Mg", "Aluminium Al", "Silicon Si", "Phosphorus P", "Sulfur S", "Chlorine Cl", "Argon Ar", "Potassium K", "Calcium Ca"];
// Stable neutron counts for Z = 1..20
const STABLE = { 1: [0, 1], 2: [1, 2], 3: [3, 4], 4: [5], 5: [5, 6], 6: [6, 7], 7: [7, 8], 8: [8, 9, 10], 9: [10], 10: [10, 11, 12], 11: [12], 12: [12, 13, 14], 13: [14], 14: [14, 15, 16], 15: [16], 16: [16, 17, 18, 20], 17: [18, 20], 18: [18, 20, 22], 19: [20, 22], 20: [20, 22, 23, 24, 26, 28] };
Sim({
  title: "Build an Atom",
  intro: "Atoms are made of protons and neutrons in a tiny nucleus, with electrons arranged in shells around it. The number of protons decides which element it is.",
  controls: [
    { id: "pr", label: "Protons", min: 1, max: 20, step: 1, value: 6 },
    { id: "ne", label: "Neutrons", min: 0, max: 28, step: 1, value: 6 },
    { id: "el", label: "Electrons", min: 0, max: 20, step: 1, value: 6 },
  ],
  readouts: [["name", "Element"], ["A", "Mass number"], ["charge", "Charge"], ["config", "Electron shells"], ["stable", "Nucleus"]],
  shells(n) { const caps = [2, 8, 8, 2], out = []; for (const c of caps) { if (n <= 0) break; out.push(Math.min(c, n)); n -= c; } return out; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const cx = W * 0.4, cy = H / 2, sh = this.shells(p.el), base = Math.min(W, H) * 0.12, gap = Math.min(W, H) * 0.09;
    sh.forEach((n, i) => {
      const r = base + (i + 1) * gap;
      circle(ctx, cx, cy, r, null, "#ced4da", 1.5);
      for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 - Math.PI / 2; circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 7, C.blue, "#fff", 1.5); }
    });
    // nucleus: pack protons and neutrons in a spiral
    const order = [];
    for (let pr = p.pr, ne = p.ne, i = 0; pr + ne > 0; i++) {
      if (pr && (i % 2 === 0 || !ne)) { order.push(true); pr--; } else { order.push(false); ne--; }
    }
    order.forEach((isP, i) => { const a = i * 2.4, r = 5.5 * Math.sqrt(i); circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6.5, isP ? C.red : "#adb5bd", "#fff", 1); });
    const [name, sym] = ELEMENTS[p.pr].split(" "), A = p.pr + p.ne, ch = p.pr - p.el;
    const bx = W * 0.75, by = H * 0.3;
    rect(ctx, bx - 60, by - 50, 120, 130, "#f8f9fa", C.text, 8, 2);
    text(ctx, sym, bx, by + 30, { align: "center", size: 52, weight: 700 });
    text(ctx, String(A), bx - 48, by - 22, { size: 16, weight: 600 });
    text(ctx, String(p.pr), bx - 48, by + 66, { size: 16, weight: 600 });
    if (ch) text(ctx, (Math.abs(ch) > 1 ? Math.abs(ch) : "") + (ch > 0 ? "+" : "−"), bx + 44, by - 22, { size: 16, weight: 700, color: ch > 0 ? C.red : C.blue });
    text(ctx, name, bx, by + 104, { align: "center", weight: 600 });
    text(ctx, "● proton   ● neutron   ● electron", 12, H - 12, { size: 12, color: C.muted });
    circle(ctx, 14, H - 16, 5, C.red); circle(ctx, 78, H - 16, 5, "#adb5bd"); circle(ctx, 150, H - 16, 5, C.blue);
  },
  read(s, p) {
    const ch = p.pr - p.el, st = STABLE[p.pr].includes(p.ne);
    return { name: ELEMENTS[p.pr].split(" ")[0], A: String(p.pr + p.ne), charge: ch === 0 ? "0 (neutral atom)" : (ch > 0 ? "+" : "−") + Math.abs(ch) + (ch > 0 ? " (positive ion)" : " (negative ion)"), config: this.shells(p.el).join(", ") || "none", stable: st ? "stable" : "unstable (radioactive)" };
  },
  keyIdea: "<b>Key idea:</b> atomic number = number of protons. Mass number = protons + neutrons. Charge = protons − electrons. Electrons fill shells of 2, 8, 8…",
  tryThis: ["Make a neutral sodium atom (11 protons). How many electrons are in its outer shell?", "Remove one electron from sodium. What is the charge? This is the Na⁺ ion.", "Make carbon-14 (6 protons, 8 neutrons). Is the nucleus stable?"],
  note: "Shell model simplified for the first 20 elements. Drawing not to scale: the nucleus is really ~100 000× smaller than the atom.",
});
