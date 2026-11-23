const { C, text, rect, circle, line } = Sim;
// Valence (number of bonds each atom makes), colour and size.
const ATOMS = { C: [4, "#343a40", 17, "#fff"], H: [1, "#f1f3f5", 12, "#1a2030"], O: [2, "#e03131", 16, "#fff"], N: [3, "#1c7ed6", 16, "#fff"], Cl: [1, "#2b8a3e", 17, "#fff"] };
const SUB = (n) => (n > 1 ? String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]) : "");

// Build example structures: a carbon chain with optional functional groups, laid out on a grid (units of ~1 bond length).
function organic(n, { double = false, alcohol = false, acid = false, chloro = false } = {}) {
  const atoms = [], bonds = [], add = (el, x, y) => (atoms.push({ el, x, y }), atoms.length - 1);
  const cs = []; for (let i = 0; i < n; i++) cs.push(add("C", i * 1.3, 0));
  for (let i = 0; i < n - 1; i++) bonds.push([cs[i], cs[i + 1], double && i === 0 ? 2 : 1]);
  cs.forEach((c, i) => {
    const used = (i > 0 ? (double && i === 1 ? 2 : 1) : 0) + (i < n - 1 ? (double && i === 0 ? 2 : 1) : 0);
    const last = i === n - 1, spots = [[0, -1], [0, 1]];
    if (i === 0) spots.push([-1, 0]);
    let fg = 0;
    if (last && acid) { const o1 = add("O", atoms[c].x, -1); bonds.push([c, o1, 2]); const o2 = add("O", atoms[c].x + 1, 0); bonds.push([c, o2, 1]); const h = add("H", atoms[c].x + 2, 0); bonds.push([o2, h, 1]); fg = 3; spots.splice(0, 1); }
    else if (last && alcohol) { const o = add("O", atoms[c].x + 1, 0); bonds.push([c, o, 1]); const h = add("H", atoms[c].x + 2, 0); bonds.push([o, h, 1]); fg = 1; }
    else if (last && chloro) { const cl = add("Cl", atoms[c].x + 1, 0); bonds.push([c, cl, 1]); fg = 1; }
    else if (last) spots.push([1, 0]);
    for (const [dx, dy] of spots.slice(0, 4 - used - fg)) { const h = add("H", atoms[c].x + dx, dy); bonds.push([c, h, 1]); }
  });
  return { atoms, bonds };
}
const simple = (list, bonds) => ({ atoms: list.map(([el, x, y]) => ({ el, x, y })), bonds });
const TARGETS = {
  free: ["Free build (no challenge)", null, null],
  h2: ["Hydrogen", "H2", simple([["H", 0, 0], ["H", 1, 0]], [[0, 1, 1]])],
  cl2: ["Chlorine", "Cl2", simple([["Cl", 0, 0], ["Cl", 1.2, 0]], [[0, 1, 1]])],
  o2: ["Oxygen", "O2", simple([["O", 0, 0], ["O", 1.2, 0]], [[0, 1, 2]])],
  n2: ["Nitrogen", "N2", simple([["N", 0, 0], ["N", 1.2, 0]], [[0, 1, 3]])],
  hcl: ["Hydrogen chloride", "HCl", simple([["H", 0, 0], ["Cl", 1.1, 0]], [[0, 1, 1]])],
  water: ["Water", "H2O", simple([["O", 0, 0], ["H", -0.9, 0.7], ["H", 0.9, 0.7]], [[0, 1, 1], [0, 2, 1]])],
  ammonia: ["Ammonia", "H3N", simple([["N", 0, 0], ["H", -1, 0.5], ["H", 1, 0.5], ["H", 0, 1.1]], [[0, 1, 1], [0, 2, 1], [0, 3, 1]])],
  methane: ["Methane", "CH4", organic(1)],
  co2: ["Carbon dioxide", "CO2", simple([["O", -1.2, 0], ["C", 0, 0], ["O", 1.2, 0]], [[0, 1, 2], [1, 2, 2]])],
  ethane: ["Ethane", "C2H6", organic(2)],
  propane: ["Propane", "C3H8", organic(3)],
  butane: ["Butane", "C4H10", organic(4)],
  ethene: ["Ethene", "C2H4", organic(2, { double: true })],
  propene: ["Propene", "C3H6", organic(3, { double: true })],
  methanol: ["Methanol", "CH4O", organic(1, { alcohol: true })],
  ethanol: ["Ethanol", "C2H6O", organic(2, { alcohol: true })],
  ethanoic: ["Ethanoic acid", "C2H4O2", organic(2, { acid: true })],
  chloromethane: ["Chloromethane", "CH3Cl", organic(1, { chloro: true })],
};
// Names for completed molecules, by formula (with a structure check where formulas are shared).
function nameOf(f, m) {
  const has = (a, b, order) => m.bonds.some(([i, j, o]) => (!order || o === order) && ((m.atoms[i].el === a && m.atoms[j].el === b) || (m.atoms[i].el === b && m.atoms[j].el === a)));
  const N = { H2: "hydrogen", O2: "oxygen", N2: "nitrogen", Cl2: "chlorine", HCl: "hydrogen chloride", H2O: "water", H3N: "ammonia", CH4: "methane", CO2: "carbon dioxide", C2H6: "ethane", C3H8: "propane", C4H10: "butane (or an isomer)", C2H4: "ethene", C2H2: "ethyne", C3H6: "propene (or cyclopropane)", CH4O: "methanol", CH3Cl: "chloromethane", CH2Cl2: "dichloromethane", CH2O: "methanal", H2O2: "hydrogen peroxide", C2H5Cl: "chloroethane", H4N2: "hydrazine", CHN: "hydrogen cyanide", C3H8O: "propanol (or an isomer)", CH2O2: "methanoic acid" };
  if (f === "C2H6O") return has("O", "H") ? "ethanol" : "methoxymethane (an ether)";
  if (f === "C2H4O2") return has("C", "O", 2) && has("O", "H") ? "ethanoic acid" : "an isomer of ethanoic acid";
  return N[f] || null;
}
function formula(m) {
  const c = {}; m.atoms.forEach((a) => (c[a.el] = (c[a.el] || 0) + 1));
  const rest = Object.keys(c).filter((k) => k !== "C" && k !== "H").sort(), order = c.C ? ["C", "H", ...rest] : ["H", ...rest]; // H first when there is no carbon (H2O, HCl, H3N)
  return order.filter((k) => c[k]).map((k) => k + (c[k] > 1 ? c[k] : "")).join("");
}
const pretty = (f) => ({ H3N: "NH3", H4N2: "N2H4", H2O2: "H2O2" }[f] || f).replace(/(\d+)/g, (d) => SUB(+d)); // conventional ways of writing some formulas
function bondsOf(m, i) { return m.bonds.reduce((s, [a, b, o]) => s + (a === i || b === i ? o : 0), 0); }
function connected(m) {
  if (!m.atoms.length) return false;
  const seen = new Set([0]), stack = [0];
  while (stack.length) { const i = stack.pop(); for (const [a, b] of m.bonds) { const j = a === i ? b : b === i ? a : -1; if (j >= 0 && !seen.has(j)) { seen.add(j); stack.push(j); } } }
  return seen.size === m.atoms.length;
}
function status(m) {
  const free = m.atoms.reduce((s, a, i) => s + Math.max(0, ATOMS[a.el][0] - bondsOf(m, i)), 0);
  const complete = m.atoms.length > 1 && free === 0 && connected(m);
  return { free, complete, f: m.atoms.length ? formula(m) : "" };
}
const q = new URLSearchParams(location.search);

Sim({
  title: "Molecule Builder",
  intro: "Build molecules atom by atom. Each atom makes a set number of bonds: carbon 4, nitrogen 3, oxygen 2, hydrogen and chlorine 1. When every atom has all its bonds, the molecule is complete and named.",
  aspect: 4 / 3,
  controls: [
    { id: "mode", label: "What does a click do?", type: "select", options: [["add", "Add atom (click an atom to attach to it)"], ["bond", "Bond: click two atoms (click again for double/triple)"], ["move", "Move atoms (drag)"], ["delete", "Delete atom"]] },
    { id: "el", label: "Atom to add", type: "select", options: Object.keys(ATOMS).map((k) => [k, `${k}: makes ${ATOMS[k][0]} bond${ATOMS[k][0] > 1 ? "s" : ""}`]) },
    { id: "target", label: "Challenge", type: "select", options: Object.entries(TARGETS).map(([k, v]) => [k, v[1] ? `Build ${v[0].toLowerCase()} (${pretty(v[1])})` : v[0]]), value: TARGETS[q.get("target")] ? q.get("target") : "free" },
  ],
  buttons: [
    { label: "Show me how", primary: true, click(s, p) { const t = TARGETS[p.target]; if (t[2]) { s.m = JSON.parse(JSON.stringify(t[2])); s.layout = true; s.sel = null; s.shown = true; } } },
    { label: "Clear", click(s) { s.m = { atoms: [], bonds: [] }; s.sel = null; s.shown = false; } },
  ],
  readouts: [["formula", "Formula"], ["name", "Molecule"], ["free", "Bonds still needed"], ["goal", "Challenge"]],
  init(s) { s.m = { atoms: [], bonds: [] }; s.sel = null; s.drag = null; s.layout = false; s.shown = false; },
  change(s, p, id) { if (id === "target") { s.shown = false; } },
  hit(s, x, y) { const i = s.m.atoms.findIndex((a) => Math.hypot(a.px - x, a.py - y) < ATOMS[a.el][2] + 6); return i; },
  pointer(s, p, e) {
    const m = s.m;
    if (s.layout) return;
    const i = this.hit(s, e.x, e.y);
    if (e.type === "down") {
      s.shown = false; s.msg = "";
      if (p.mode === "add") {
        if (i < 0) m.atoms.push({ el: p.el, px: e.x, py: e.y });
        else if (bondsOf(m, i) < ATOMS[m.atoms[i].el][0]) {
          // attach a new atom in the most open direction around the clicked atom
          const a = m.atoms[i], nb = m.bonds.filter(([u, v]) => u === i || v === i).map(([u, v]) => m.atoms[u === i ? v : u]);
          let best = 0, bestScore = -1;
          for (let k = 0; k < 12; k++) { const ang = (k / 12) * Math.PI * 2, nx = a.px + Math.cos(ang) * 55, ny = a.py + Math.sin(ang) * 55; const score = Math.min(1e9, ...m.atoms.map((o) => Math.hypot(o.px - nx, o.py - ny))); if (score > bestScore) { bestScore = score; best = ang; } }
          m.atoms.push({ el: p.el, px: a.px + Math.cos(best) * 55, py: a.py + Math.sin(best) * 55 });
          if (ATOMS[p.el][0] > 0) m.bonds.push([i, m.atoms.length - 1, 1]);
        } else s.msg = `That ${m.atoms[i].el} already has all its bonds.`;
      } else if (p.mode === "bond" && i >= 0) {
        if (s.sel == null || s.sel === i) s.sel = s.sel === i ? null : i;
        else {
          const j = s.sel, b = m.bonds.find(([u, v]) => (u === i && v === j) || (u === j && v === i));
          const room = (k) => ATOMS[m.atoms[k].el][0] - bondsOf(m, k);
          if (!b) { if (room(i) > 0 && room(j) > 0) m.bonds.push([j, i, 1]); else s.msg = "One of these atoms has no bonds left."; }
          else if (b[2] < 3 && room(i) > 0 && room(j) > 0) b[2]++;
          else m.bonds.splice(m.bonds.indexOf(b), 1); // cycles 1 → 2 → 3 → no bond
          s.sel = null;
        }
      } else if (p.mode === "move" && i >= 0) s.drag = i;
      else if (p.mode === "delete" && i >= 0) {
        m.bonds = m.bonds.filter(([u, v]) => u !== i && v !== i).map(([u, v, o]) => [u > i ? u - 1 : u, v > i ? v - 1 : v, o]);
        m.atoms.splice(i, 1); s.sel = null;
      }
    }
    if (e.type === "drag" && s.drag != null) { m.atoms[s.drag].px = Sim.clamp(e.x, 20, e.W - 20); m.atoms[s.drag].py = Sim.clamp(e.y, 20, e.H - 20); }
    if (e.type === "up") s.drag = null;
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const m = s.m;
    if (s.layout) { // place an example structure in the middle of the canvas
      const xs = m.atoms.map((a) => a.x), ys = m.atoms.map((a) => a.y), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, sc = Math.min(70, (W - 80) / Math.max(1, Math.max(...xs) - Math.min(...xs)));
      m.atoms.forEach((a) => { a.px = W / 2 + (a.x - cx) * sc; a.py = H / 2 + (a.y - cy) * sc; });
      s.layout = false;
    }
    for (let x = 20; x < W; x += 40) for (let y = 20; y < H; y += 40) circle(ctx, x, y, 1, "#e9ecef");
    for (const [i, j, o] of m.bonds) {
      const a = m.atoms[i], b = m.atoms[j], dx = b.px - a.px, dy = b.py - a.py, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      for (let k = 0; k < o; k++) { const off = (k - (o - 1) / 2) * 7; line(ctx, a.px + nx * off, a.py + ny * off, b.px + nx * off, b.py + ny * off, "#495057", 3); }
    }
    m.atoms.forEach((a, i) => {
      const [val, col, r, tc] = ATOMS[a.el], free = val - bondsOf(m, i);
      if (s.sel === i) circle(ctx, a.px, a.py, r + 7, "rgba(250,176,5,.45)");
      circle(ctx, a.px, a.py, r, col, "#212529", 1.5);
      text(ctx, a.el, a.px, a.py + 5, { align: "center", weight: 800, size: a.el === "Cl" ? 12 : 14, color: tc });
      for (let k = 0; k < free; k++) { const ang = -Math.PI / 2 + (k - (free - 1) / 2) * 0.6; circle(ctx, a.px + Math.cos(ang) * (r + 7), a.py + Math.sin(ang) * (r + 7), 3.5, "#fab005", "#e67700", 1); }
    });
    const st = status(m);
    if (!m.atoms.length) text(ctx, "Click anywhere to add your first atom", W / 2, H / 2, { align: "center", size: 16, color: C.muted });
    text(ctx, "yellow dots = bonds still needed", 10, H - 10, { size: 12, color: C.muted });
    if (s.msg) text(ctx, s.msg, W / 2, 24, { align: "center", color: C.red, weight: 700 });
    else if (st.complete) text(ctx, "✓ Complete molecule!", W / 2, 26, { align: "center", color: C.green, weight: 800, size: 18 });
  },
  reset: false,
  read(s, p) {
    const st = status(s.m), t = TARGETS[p.target], name = st.complete ? nameOf(st.f, s.m) : null;
    const goal = !t[1] ? "—" : st.complete && st.f === t[1] && name && name.startsWith(t[0].toLowerCase()) ? (s.shown ? "✓ example shown: now build it yourself" : "✓ Well done!") : `build ${t[0].toLowerCase()}`;
    return { formula: st.f ? pretty(st.f) : "—", name: st.complete ? name || "a molecule (not in our list)" : st.f ? "not finished yet" : "—", free: String(st.free), goal };
  },
  keyIdea: "<b>Key idea:</b> in a covalent bond, two atoms share a pair of electrons. Carbon forms 4 bonds, nitrogen 3, oxygen 2, hydrogen and chlorine 1. A double bond shares two pairs; a triple bond shares three.",
  tryThis: ["Build water. How many bonds does the oxygen make?", "Build ethane, then change one C–C bond to a double bond. What else must change to make ethene?", "Build ethanol. Then try to build a different molecule with the same formula, C₂H₆O."],
});
