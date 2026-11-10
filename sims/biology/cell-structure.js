const { C, text, rect, circle } = Sim;
const PARTS = {
  nucleus: ["Nucleus", "Contains DNA; controls the cell's activities.", true, true],
  membrane: ["Cell membrane", "Controls what goes in and out of the cell.", true, true],
  cytoplasm: ["Cytoplasm", "Jelly where most chemical reactions happen.", true, true],
  mito: ["Mitochondria", "Where aerobic respiration releases energy.", true, true],
  ribo: ["Ribosomes", "Where proteins are made.", true, true],
  wall: ["Cell wall", "Made of cellulose; supports and strengthens the cell.", false, true],
  chloro: ["Chloroplasts", "Contain chlorophyll; where photosynthesis happens.", false, true],
  vacuole: ["Permanent vacuole", "Filled with cell sap; keeps the cell firm.", false, true],
};
Sim({
  title: "Animal and Plant Cells",
  intro: "All living things are made of cells. Animal and plant cells share many parts, but plant cells also have a cell wall, chloroplasts and a large vacuole. Click on a part, or choose it from the list, to find out what it does.",
  controls: [
    { id: "cell", label: "Cell", type: "select", options: [["animal", "Animal cell"], ["plant", "Plant cell"]] },
    { id: "part", label: "Highlight part", type: "select", options: Object.entries(PARTS).map(([k, v]) => [k, v[0]]) },
  ],
  readouts: [["name", "Part"], ["job", "Function"], ["where", "Found in"]],
  init(s) { s.t = 0; },
  step(s, p, dt) { s.t += dt; },
  pointer(s, p, e) { if (e.type !== "down") return; const hit = (s.hits || []).find((h) => Math.hypot(e.x - h.x, e.y - h.y) < h.r); if (hit) { const el = document.getElementById("part"); el.value = hit.k; el.dispatchEvent(new Event("input")); } },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const plant = p.cell === "plant", cx = W * 0.4, cy = H / 2, hl = (k) => p.part === k;
    s.hits = [];
    const glow = (k, x, y, r) => { s.hits.push({ k, x, y, r: Math.max(r, 16) }); if (hl(k)) { ctx.save(); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(s.t * 4); circle(ctx, x, y, r + 8, "#ffd43b"); ctx.restore(); } };
    if (plant) {
      const w = W * 0.55, h = H * 0.8;
      if (hl("wall")) rect(ctx, cx - w / 2 - 6, cy - h / 2 - 6, w + 12, h + 12, "#ffd43b88", null, 10);
      rect(ctx, cx - w / 2, cy - h / 2, w, h, "#d8f5a2", "#2b8a3e", 8, 6); s.hits.push({ k: "wall", x: cx - w / 2, y: cy, r: 14 });
      rect(ctx, cx - w / 2 + 8, cy - h / 2 + 8, w - 16, h - 16, hl("cytoplasm") ? "#fff3bf" : "#f4fce3", hl("membrane") ? "#f59f00" : "#868e96", 6, hl("membrane") ? 4 : 1.5);
      s.hits.push({ k: "membrane", x: cx + w / 2 - 10, y: cy, r: 10 }, { k: "cytoplasm", x: cx - w / 2 + 30, y: cy + h / 2 - 30, r: 18 });
      glow("vacuole", cx + 20, cy, 60); rect(ctx, cx - w * 0.15, cy - h * 0.3, w * 0.4, h * 0.6, "#d0ebff", "#74c0fc", 30, 1.5);
      for (let i = 0; i < 7; i++) { const x = cx - w / 2 + 30 + (i % 4) * (w - 60) / 3, y = i < 4 ? cy - h / 2 + 30 : cy + h / 2 - 30; glow("chloro", x, y, 12); ctx.fillStyle = "#2f9e44"; ctx.beginPath(); ctx.ellipse(x, y, 14, 8, i, 0, Math.PI * 2); ctx.fill(); }
    } else {
      glow("membrane", cx + W * 0.25, cy, 6);
      ctx.beginPath(); for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 2, r = 1 + 0.06 * Math.sin(a * 3); ctx.lineTo(cx + Math.cos(a) * W * 0.25 * r, cy + Math.sin(a) * H * 0.38 * r); } ctx.closePath();
      ctx.fillStyle = hl("cytoplasm") ? "#fff3bf" : "#fff0f6"; ctx.fill(); ctx.strokeStyle = hl("membrane") ? "#f59f00" : "#c2255c"; ctx.lineWidth = hl("membrane") ? 4 : 2; ctx.stroke();
      s.hits.push({ k: "cytoplasm", x: cx - W * 0.15, y: cy + H * 0.2, r: 20 });
    }
    const nx = plant ? cx - W * 0.17 : cx - 10, ny = plant ? cy - H * 0.1 : cy;
    glow("nucleus", nx, ny, 30); circle(ctx, nx, ny, 30, "#d0bfff", "#7048e8", 2); circle(ctx, nx + 5, ny - 4, 9, "#9775fa");
    for (let i = 0; i < 4; i++) { const x = cx + (i % 2 ? 60 : -80) + (plant ? -40 : 0), y = cy + (i < 2 ? -60 : 60); glow("mito", x, y, 14); ctx.fillStyle = "#ffa8a8"; ctx.beginPath(); ctx.ellipse(x, y, 18, 9, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#e03131"; ctx.lineWidth = 1; ctx.stroke(); }
    for (let i = 0; i < 14; i++) { const x = cx + Math.cos(i * 1.7) * (plant ? 120 : 110) * 0.8, y = cy + Math.sin(i * 1.7) * 70; glow("ribo", x, y, 3); circle(ctx, x, y, 2.5, "#495057"); }
    const [name, job] = PARTS[p.part]; text(ctx, name, W - 16, 30, { align: "right", weight: 800, size: 18, color: C.blue });
    if (!plant && !PARTS[p.part][2]) text(ctx, "(not found in animal cells)", W - 16, 52, { align: "right", color: C.red, size: 12 });
    void job;
  },
  read(s, p) { const [name, job, a, pl] = PARTS[p.part]; return { name, job, where: a && pl ? "animal and plant cells" : "plant cells only" }; },
  keyIdea: "<b>Key idea:</b> both cell types have a nucleus, cytoplasm, cell membrane, mitochondria and ribosomes. Only plant cells have a cellulose cell wall, chloroplasts and a permanent vacuole.",
  tryThis: ["List the three parts found in plant cells but not animal cells.", "Why don't root cells in a plant have chloroplasts?", "Which part would a cell that needs lots of energy (like muscle) have many of?"],
  note: "Click a part of the cell to select it.",
});
