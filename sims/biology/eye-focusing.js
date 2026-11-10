const { C, text, rect, circle, line } = Sim;
Sim({
  title: "The Eye: Focusing and Vision Defects",
  intro: "The lens changes shape to focus light on the retina: fatter for near objects, thinner for distant ones (accommodation). Short- and long-sighted eyes focus in the wrong place, and glasses correct this.",
  controls: [
    { id: "d", label: "Object distance", min: 0.1, max: 10, step: 0.1, value: 6, unit: "m", digits: 1 },
    { id: "eye", label: "Eye", type: "select", options: [["normal", "Normal"], ["myopia", "Short-sighted (myopia)"], ["hyper", "Long-sighted (hyperopia)"]] },
    { id: "glasses", label: "Wear corrective glasses", type: "checkbox", value: false },
  ],
  readouts: [["lens", "Lens shape"], ["focus", "Light focuses"], ["fix", "Correction"]],
  calc(p) {
    const len = 0.024, Pneed = 1 / len + 1 / p.d, maxAcc = p.eye === "hyper" ? 3 : 4; // power range of the lens (dioptres above relaxed)
    const relaxed = p.eye === "myopia" ? 1 / len + 2 : p.eye === "hyper" ? 1 / len - 2 : 1 / len;
    const corr = p.glasses ? (p.eye === "myopia" ? -2 : p.eye === "hyper" ? 3.5 : 0) : 0;
    const P = Sim.clamp(Pneed - corr, relaxed, relaxed + maxAcc) + corr, v = 1 / (P - 1 / p.d);
    return { P, v, err: v - len, relaxed, Pneed };
  },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const r = this.calc(p), cx = W * 0.62, cy = H / 2, R = H * 0.38, lensX = cx - R * 0.75, retinaX = cx + R * 0.95, sc = (retinaX - lensX) / 0.024;
    circle(ctx, cx, cy, R, "#f8f9fa", C.text, 2);
    ctx.beginPath(); ctx.arc(cx, cy, R - 4, -0.9, 0.9); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.stroke(); text(ctx, "retina", retinaX + 4, cy - R * 0.6, { size: 11, color: C.red });
    const fat = (r.P - 41) / 5;
    ctx.beginPath(); ctx.ellipse(lensX, cy, 6 + fat * 7, R * 0.42, 0, 0, Math.PI * 2); ctx.fillStyle = "rgba(116,192,252,.5)"; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.stroke();
    const ox = 20, spread = Math.min(R * 0.35, 0.3 / p.d * 400);
    const fx = lensX + r.v * sc;
    for (const k of [-1, 0, 1]) {
      const ly = cy + k * spread;
      line(ctx, ox, cy, lensX, ly, C.orange, 1.5);
      const endX = retinaX, t = (endX - lensX) / (fx - lensX || 1e-6), ey = ly + (cy - ly) * t;
      line(ctx, lensX, ly, Math.min(endX, Math.max(fx, lensX)), fx < endX ? cy : ey, C.orange, 1.5);
      if (fx < endX) line(ctx, fx, cy, endX, cy + (cy - ly) * ((endX - fx) / (fx - lensX)), C.orange, 1.5, [4, 4]);
    }
    circle(ctx, ox, cy, 5, C.text); text(ctx, `object ${p.d} m away`, ox, cy - 14, { size: 11 });
    if (p.glasses && p.eye !== "normal") { const gx = lensX - R * 0.6; ctx.beginPath(); ctx.ellipse(gx, cy, p.eye === "hyper" ? 9 : 4, R * 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = "rgba(173,181,189,.4)"; ctx.fill(); ctx.strokeStyle = C.gray; ctx.stroke(); text(ctx, p.eye === "hyper" ? "convex lens" : "concave lens", gx, cy + R * 0.6, { align: "center", size: 11, color: C.gray }); }
    const sharp = Math.abs(r.err) < 0.0004;
    text(ctx, sharp ? "In focus ✓" : "Blurred ✗", 14, 24, { weight: 700, size: 16, color: sharp ? C.green : C.red });
  },
  read(s, p) { const r = this.calc(p), sharp = Math.abs(r.err) < 0.0004; return { lens: r.P - r.relaxed > 1 ? "fatter (more curved)" : "thin (relaxed)", focus: sharp ? "on the retina" : r.err < 0 ? "in front of the retina" : "behind the retina", fix: p.eye === "myopia" ? "concave (diverging) lens" : p.eye === "hyper" ? "convex (converging) lens" : "none needed" }; },
  keyIdea: "<b>Key idea:</b> for near objects, ciliary muscles contract and the lens becomes fatter; for far objects, they relax and the lens becomes thinner. Short sight: image falls in front of the retina (corrected by a concave lens). Long sight: behind it (corrected by a convex lens).",
  tryThis: ["With a normal eye, move the object from 10 m to 0.2 m. How does the lens change?", "Choose short sight. Can it focus distant or near objects? Put on glasses.", "Choose long sight. Why is reading difficult? What kind of lens fixes it?"],
  note: "Simplified optical model; the eye is drawn larger than the distances.",
});
