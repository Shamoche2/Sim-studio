const { C, text, rect } = Sim;
const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr".split(" ");
const ORBS = [["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6], ["4s", 2], ["3d", 10], ["4p", 6]];
const SUP = (n) => String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
Sim({
  title: "Electron Configuration and Orbitals",
  intro: "Electrons fill sub-shells (s, p, d) in order of increasing energy. Each box is an orbital holding up to 2 electrons with opposite spins. Pick an element to see its configuration.",
  controls: [{ id: "Z", label: "Element", min: 1, max: 36, step: 1, value: 8, format: (v) => `${SYM[v - 1]} (Z = ${v})` }],
  readouts: [["cfg", "Configuration"], ["short", "Shells"], ["block", "Block"], ["unp", "Unpaired electrons"]],
  fill(Z) {
    const out = []; let left = Z;
    for (const [name, cap] of ORBS) { if (left <= 0) break; const n = Math.min(cap, left); out.push([name, n, cap]); left -= n; }
    if (Z === 24) { out.find((o) => o[0] === "4s")[1] = 1; out.find((o) => o[0] === "3d")[1] = 5; }
    if (Z === 29) { out.find((o) => o[0] === "4s")[1] = 1; out.find((o) => o[0] === "3d")[1] = 10; }
    return out;
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const f = this.fill(p.Z), level = { "1s": 0, "2s": 1, "2p": 1.6, "3s": 2.4, "3p": 3, "4s": 3.7, "3d": 4.1, "4p": 4.8 }, box = 30;
    const Y = (e) => H - 40 - (e / 5) * (H - 80);
    text(ctx, "energy ↑", 10, 20, { color: C.muted, size: 12 });
    for (const [name, cap] of ORBS) {
      const nb = cap / 2, y = Y(level[name]), x0 = 90 + ({ s: 0, p: 1, d: 2 }[name[1]]) * (W - 120) / 3;
      text(ctx, name, x0 - 10, y + 20, { align: "right", weight: 700 });
      const have = (f.find((o) => o[0] === name) || [0, 0])[1];
      for (let b = 0; b < nb; b++) {
        rect(ctx, x0 + b * (box + 4), y, box, box, have ? "#fff" : "#f8f9fa", have ? C.text : "#dee2e6", 3, 1.5);
        const up = have > b ? 1 : 0, down = have > nb + b ? 1 : 0; // Hund's rule: fill singly first
        if (up) text(ctx, "↑", x0 + b * (box + 4) + 9, y + 22, { size: 18, weight: 700, color: C.blue });
        if (down) text(ctx, "↓", x0 + b * (box + 4) + 19, y + 22, { size: 18, weight: 700, color: C.red });
      }
    }
    text(ctx, SYM[p.Z - 1], W - 30, 50, { align: "right", size: 44, weight: 800 });
  },
  read(s, p) {
    const f = this.fill(p.Z), shells = {}; f.forEach(([n, k]) => (shells[n[0]] = (shells[n[0]] || 0) + k));
    const last = f.filter((o) => o[1] > 0).at(-1)[0][1], unp = f.reduce((a, [n, k, cap]) => a + (k <= cap / 2 ? k : cap - k), 0);
    return { cfg: f.filter((o) => o[1]).map(([n, k]) => n + SUP(k)).join(" "), short: Object.values(shells).join(", "), block: (p.Z === 2 ? "s" : last) + "-block", unp: String(unp) };
  },
  keyIdea: "<b>Key idea:</b> fill order 1s 2s 2p 3s 3p 4s 3d 4p. Within a sub-shell, electrons occupy separate boxes first before pairing (Hund's rule). Chromium and copper are exceptions: a half-full or full 3d is extra stable.",
  tryThis: ["Write the configuration of sodium. Why does it react like lithium?", "Why does 4s fill before 3d?", "Look at chromium (Z = 24) and copper (Z = 29). What's unusual about them?"],
});
