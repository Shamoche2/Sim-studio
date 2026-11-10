const { C, text, rect, circle } = Sim;
const SPEC = { onion: ["Onion skin cells", 250, "#fff4e6"], cheek: ["Human cheek cells", 60, "#fff0f6"], blood: ["Red blood cells", 8, "#fff5f5"], bacteria: ["Bacteria", 2, "#f8f9fa"] };
Sim({
  title: "Using a Microscope: Magnification",
  intro: "A light microscope uses two lenses. Total magnification = eyepiece × objective. Switch objectives to zoom in, and use the scale to work out real sizes.",
  controls: [
    { id: "spec", label: "Specimen", type: "select", options: Object.entries(SPEC).map(([k, v]) => [k, v[0]]) },
    { id: "obj", label: "Objective lens", type: "select", options: [[4, "×4"], [10, "×10"], [40, "×40"], [100, "×100 (oil)"]], value: 10 },
    { id: "eye", label: "Eyepiece lens", type: "select", options: [[10, "×10"], [15, "×15"]] },
    { id: "focus", label: "Focus", min: -1, max: 1, step: 0.05, value: 0, digits: 2 },
  ],
  readouts: [["mag", "Total magnification"], ["fov", "Field of view"], ["real", "Real size of one cell"], ["image", "Image size (as seen)"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#212529");
    const [name, size, bg] = SPEC[p.spec], mag = p.obj * p.eye, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.45;
    const fovUm = 18000 / mag, pxPerUm = (2 * R) / fovUm, blur = Math.abs(p.focus) * 8;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    rect(ctx, cx - R, cy - R, 2 * R, 2 * R, bg);
    ctx.filter = blur > 0.5 ? `blur(${blur}px)` : "none";
    const cs = size * pxPerUm;
    if (cs < 1.5) { for (let i = 0; i < 60; i++) circle(ctx, cx - R + ((i * 97) % (2 * R)), cy - R + ((i * 57) % (2 * R)), 1, "#868e96"); }
    else if (p.spec === "onion") { for (let y = -R - cs; y < R + cs; y += cs * 0.4) for (let x = -R - cs; x < R + cs; x += cs) { const off = Math.round(y / (cs * 0.4)) % 2 ? cs / 2 : 0; rect(ctx, cx + x + off, cy + y, cs, cs * 0.4, null, "#d9480f", 0, 1.5); circle(ctx, cx + x + off + cs * 0.5, cy + y + cs * 0.2, Math.max(1, cs * 0.06), "#862e9c"); } }
    else { let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); const n = Math.min(400, Math.ceil(((2 * R) / cs) ** 2 * 0.5)); for (let i = 0; i < n; i++) { const x = cx - R + rnd() * 2 * R, y = cy - R + rnd() * 2 * R; if (p.spec === "blood") { circle(ctx, x, y, cs / 2, "#ff8787", "#c92a2a", 1); circle(ctx, x, y, cs / 5, "#ffa8a8"); } else if (p.spec === "cheek") { ctx.beginPath(); ctx.ellipse(x, y, cs / 2, cs / 2.6, rnd() * 3, 0, Math.PI * 2); ctx.fillStyle = "rgba(252,194,215,.6)"; ctx.fill(); ctx.strokeStyle = "#c2255c"; ctx.stroke(); circle(ctx, x, y, cs * 0.1, "#7048e8"); } else { ctx.fillStyle = "#4c6ef5"; ctx.beginPath(); ctx.ellipse(x, y, cs / 2, cs / 5, rnd() * 3, 0, Math.PI * 2); ctx.fill(); } } }
    ctx.filter = "none";
    const bar = Sim.niceStep(fovUm / 5), bw = bar * pxPerUm;
    rect(ctx, cx - bw / 2, cy + R * 0.75, bw, 5, "#212529"); text(ctx, bar >= 1000 ? bar / 1000 + " mm" : bar + " μm", cx, cy + R * 0.75 - 6, { align: "center", weight: 700 });
    ctx.restore();
    circle(ctx, cx, cy, R, null, "#495057", 6);
    text(ctx, `×${mag}`, 14, 24, { color: "#fff", weight: 700, size: 18 }); text(ctx, name, 14, 46, { color: "#adb5bd", size: 12 });
    if (blur > 0.5) text(ctx, "out of focus: use the fine focus", 14, H - 14, { color: "#ffd43b", size: 12 });
  },
  read(s, p) { const [, size] = SPEC[p.spec], mag = p.obj * p.eye, f = 18000 / mag; return { mag: "×" + mag, fov: f >= 1000 ? (f / 1000).toFixed(2) + " mm" : f.toFixed(0) + " μm", real: size + " μm", image: ((size * mag) / 1000).toFixed(2) + " mm" }; },
  keyIdea: "<b>Key idea:</b> magnification = image size ÷ real size. Total magnification = eyepiece × objective. Higher magnification shows more detail but a smaller field of view. 1 mm = 1000 μm.",
  tryThis: ["Look at onion cells at ×40 and ×400. How many cells fit across the view each time?", "A red blood cell is 8 μm across. How big does it look at ×400?", "Why can't you see the inside of bacteria clearly with a light microscope?"],
  note: "Field of view assumes an 18 mm eyepiece field number.",
});
