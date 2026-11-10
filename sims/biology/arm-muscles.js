const { C, text, rect, circle, line, arrow } = Sim;
Sim({
  title: "Muscles, Bones and Levers: The Arm",
  intro: "Muscles can only pull, never push, so they work in antagonistic pairs. The biceps contracts to bend the arm and the triceps contracts to straighten it. The forearm is a lever with the elbow as the pivot.",
  controls: [
    { id: "angle", label: "Elbow angle", min: 30, max: 170, step: 5, value: 90, unit: "°" },
    { id: "m", label: "Mass held in the hand", min: 0, max: 20, step: 1, value: 5, unit: "kg" },
  ],
  readouts: [["con", "Contracting"], ["rel", "Relaxed"], ["force", "Biceps force needed"], ["ratio", "Biceps force ÷ load"]],
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const ex = W * 0.4, ey = H * 0.55, a = (p.angle * Math.PI) / 180, upper = H * 0.38, fore = W * 0.36;
    const sx = ex, sy = ey - upper, hx = ex + fore * Math.sin(a), hy = ey - fore * Math.cos(a); // angle measured from the upper arm
    line(ctx, sx, sy, ex, ey, "#dee2e6", 16); line(ctx, ex, ey, hx, hy, "#dee2e6", 14);
    line(ctx, sx, sy, ex, ey, C.text, 2); line(ctx, ex, ey, hx, hy, C.text, 2);
    circle(ctx, ex, ey, 9, "#fff", C.text, 2); text(ctx, "elbow (pivot)", ex - 14, ey + 26, { size: 11, align: "right" });
    const ins = 0.12, bx = ex + (hx - ex) * ins, by = ey + (hy - ey) * ins, bendF = 1 - (p.angle - 30) / 140;
    ctx.strokeStyle = "#e03131"; ctx.lineWidth = 10 + bendF * 14; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(sx + 12, sy + 10); ctx.quadraticCurveTo(sx + 30 + bendF * 20, (sy + by) / 2, bx, by); ctx.stroke();
    ctx.strokeStyle = "#f783ac"; ctx.lineWidth = 10 + (1 - bendF) * 12; ctx.beginPath(); ctx.moveTo(sx - 12, sy + 10); ctx.quadraticCurveTo(sx - 26, (sy + ey) / 2, ex - 10, ey + 6); ctx.stroke(); ctx.lineCap = "butt";
    text(ctx, "biceps", sx + 40 + bendF * 20, (sy + ey) / 2, { color: "#c92a2a", weight: 700 }); text(ctx, "triceps", sx - 40, (sy + ey) / 2, { color: "#d6336c", weight: 700, align: "right" });
    if (p.m) { rect(ctx, hx - 12, hy, 24, 12 + p.m, C.gray, null, 3); text(ctx, p.m + " kg", hx, hy + 24 + p.m, { align: "center", size: 11 }); arrow(ctx, hx, hy + 14 + p.m, hx, hy + 44 + p.m, C.blue, 2.5); }
  },
  read(s, p) {
    const load = p.m * 9.81, F = (load * 0.35) / 0.04; // moments about the elbow: F × 4 cm = load × 35 cm
    const bending = p.angle < 165;
    return { con: bending ? "biceps (holding the arm bent)" : "triceps (arm straight)", rel: bending ? "triceps" : "biceps", force: p.m ? (F).toFixed(0) + " N" : "0 N", ratio: p.m ? (0.35 / 0.04).toFixed(1) + "×" : "—" };
  },
  keyIdea: "<b>Key idea:</b> antagonistic muscles work in pairs: when one contracts, the other relaxes. Because the biceps attaches very close to the elbow, it needs a force about 9 times the load, but it moves the hand much further and faster.",
  tryThis: ["Bend the arm. Which muscle gets shorter and fatter?", "Why can't one muscle both bend and straighten the arm?", "Holding 5 kg, how much force does the biceps need? Why so much?"],
  note: "Assumes the biceps attaches 4 cm from the elbow and the hand is 35 cm away.",
});
