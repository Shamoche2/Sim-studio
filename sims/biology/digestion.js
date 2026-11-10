const { C, text, rect, circle } = Sim;
const FOODS = {
  starch: { name: "Starch (bread, rice)", enzyme: "Amylase", where: "mouth and small intestine", product: "sugars (maltose → glucose)", col: "#ffd43b", stages: [0.05, 0.5, 0.55] },
  protein: { name: "Protein (meat, beans)", enzyme: "Protease (pepsin, trypsin)", where: "stomach and small intestine", product: "amino acids", col: "#ff8787", stages: [0.25, 0.55, 0.55] },
  fat: { name: "Fat (oil, butter)", enzyme: "Lipase (with bile)", where: "small intestine", product: "fatty acids and glycerol", col: "#ffec99", stages: [0.5, 0.55, 0.55] },
};
const ORGANS = [["Mouth", 0.05], ["Oesophagus", 0.15], ["Stomach", 0.3], ["Small intestine", 0.55], ["Large intestine", 0.8], ["Anus", 0.97]];
Sim({
  title: "Digestion and Enzymes",
  intro: "Large food molecules are too big to pass into the blood. Digestive enzymes break them into small soluble molecules that are absorbed in the small intestine. Follow a meal through the digestive system.",
  controls: [{ id: "food", label: "Food molecule", type: "select", options: Object.entries(FOODS).map(([k, v]) => [k, v.name]) }],
  readouts: [["where", "Now in"], ["enzyme", "Enzyme"], ["product", "Broken down into"], ["absorbed", "Absorbed"]],
  init(s) { s.x = 0; s.abs = 0; },
  change(s) { s.x = 0; s.abs = 0; },
  step(s, p, dt) { s.x = s.x >= 1 ? 0 : s.x + dt * 0.06; if (s.x < 0.01) s.abs = 0; const f = FOODS[p.food]; if (s.x > 0.55 && s.x < 0.75) s.abs = Math.min(1, s.abs + dt * 0.5); void f; },
  path(t, W, H) { if (t < 0.15) return [W * 0.2, H * (0.08 + t * 2)]; if (t < 0.35) { const u = (t - 0.15) / 0.2; return [W * (0.2 + u * 0.25), H * (0.38 + Math.sin(u * Math.PI) * 0.06)]; } if (t < 0.75) { const u = (t - 0.35) / 0.4; return [W * (0.45 - 0.2 * Math.sin(u * Math.PI * 4)), H * (0.5 + u * 0.25)]; } const u = (t - 0.75) / 0.25; return [W * (0.3 + u * 0.15), H * (0.78 + u * 0.15)]; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const f = FOODS[p.food];
    ctx.strokeStyle = "#ffc9c9"; ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const [x, y] = this.path(i / 200, W, H); ctx.lineTo(x, y); } ctx.stroke(); ctx.lineCap = "butt";
    for (const [name, t] of ORGANS) { const [x, y] = this.path(t, W, H); text(ctx, name, x + 30, y + 4, { size: 12, color: C.muted }); }
    const [sx, sy] = this.path(0.3, W, H); ctx.beginPath(); ctx.ellipse(sx, sy, 36, 22, 0, 0, Math.PI * 2); ctx.fillStyle = "#ffa8a8"; ctx.fill();
    const [x, y] = this.path(s.x, W, H), broken = s.x > f.stages[0];
    if (!broken) { for (let i = 0; i < 6; i++) circle(ctx, x - 15 + i * 6, y, 5, f.col, C.text, 1); }
    else if (s.abs < 1) { for (let i = 0; i < 6; i++) circle(ctx, x - 12 + (i % 3) * 12, y - 6 + Math.floor(i / 3) * 12, 4, f.col, C.text, 1); }
    // villi / blood
    const bx = W * 0.68, by = H * 0.15, bw = W * 0.28, bh = H * 0.7;
    text(ctx, "Villus in the small intestine", bx, by - 8, { weight: 700, size: 12 });
    ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw * 0.2, by + bh * 0.2); ctx.quadraticCurveTo(bx + bw / 2, by - 10, bx + bw * 0.8, by + bh * 0.2); ctx.lineTo(bx + bw, by + bh); ctx.fillStyle = "#ffe3e3"; ctx.fill(); ctx.strokeStyle = "#e03131"; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = "#c92a2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx + bw * 0.35, by + bh); ctx.lineTo(bx + bw * 0.4, by + bh * 0.25); ctx.lineTo(bx + bw * 0.6, by + bh * 0.25); ctx.lineTo(bx + bw * 0.65, by + bh); ctx.stroke();
    for (let i = 0; i < Math.round(s.abs * 10); i++) circle(ctx, bx + bw * 0.5, by + bh * 0.3 + i * (bh * 0.065), 3.5, f.col, C.text, 1);
    text(ctx, "blood capillary", bx + bw * 0.5, by + bh + 16, { align: "center", size: 11, color: C.red });
  },
  read(s, p) { const f = FOODS[p.food], organ = [...ORGANS].reverse().find(([, t]) => s.x >= t - 0.05) || ORGANS[0]; return { where: organ[0], enzyme: f.enzyme + " (" + f.where + ")", product: f.product, absorbed: (s.abs * 100).toFixed(0) + "%" }; },
  keyIdea: "<b>Key idea:</b> amylase breaks starch into sugars, proteases break proteins into amino acids, lipases break fats into fatty acids and glycerol. Villi give the small intestine a huge surface area for absorption into the blood.",
  tryThis: ["Where does protein digestion start? Why is the stomach acidic?", "Why do fats need bile before lipase can work well?", "Why are villi long, thin and covered in capillaries?"],
});
