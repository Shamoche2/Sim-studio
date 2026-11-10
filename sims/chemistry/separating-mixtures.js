const { C, text, rect, circle } = Sim;
const MIX = {
  sand: { name: "Sand and water", method: "filtration", why: "sand is insoluble, so the filter paper traps it" },
  salt: { name: "Salt solution (get the salt)", method: "evaporation", why: "the water evaporates and leaves the dissolved salt behind" },
  pure: { name: "Seawater (get pure water)", method: "simple distillation", why: "water boils off and condenses, leaving salt behind" },
  alcohol: { name: "Ethanol and water", method: "fractional distillation", why: "ethanol (78 °C) boils before water (100 °C)" },
  ink: { name: "Inks in a pen", method: "chromatography", why: "dyes travel different distances up the paper" },
  iron: { name: "Iron filings and sulfur", method: "magnet", why: "iron is magnetic, sulfur isn't" },
};
const METHODS = [["filtration", "Filtration"], ["evaporation", "Evaporation / crystallisation"], ["simple distillation", "Simple distillation"], ["fractional distillation", "Fractional distillation"], ["chromatography", "Chromatography"], ["magnet", "Using a magnet"]];
Sim({
  title: "Separating Mixtures",
  intro: "Mixtures can be separated by physical methods because their parts keep their own properties. Choose the mixture, then pick the method you think works best.",
  controls: [
    { id: "mix", label: "Mixture", type: "select", options: Object.entries(MIX).map(([k, v]) => [k, v.name]) },
    { id: "method", label: "Your choice of method", type: "select", options: METHODS },
  ],
  readouts: [["result", "Does it work?"], ["best", "Best method"], ["why", "Why"]],
  init(s) { s.t = 0; },
  change(s) { s.t = 0; },
  step(s, p, dt) { s.t = Math.min(1, s.t + dt * 0.4); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const m = MIX[p.mix], ok = m.method === p.method, cx = W / 2, t = s.t;
    if (p.method === "filtration") {
      ctx.beginPath(); ctx.moveTo(cx - 70, 60); ctx.lineTo(cx + 70, 60); ctx.lineTo(cx + 8, 150); ctx.lineTo(cx - 8, 150); ctx.closePath(); ctx.fillStyle = "#f8f9fa"; ctx.fill(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
      rect(ctx, cx - 50, H - 110, 100, 90, null, C.text, 4, 2); rect(ctx, cx - 48, H - 20 - 60 * t, 96, 60 * t, ok ? "rgba(116,192,252,.4)" : "rgba(116,192,252,.4)");
      if (p.mix === "sand") for (let i = 0; i < 20; i++) circle(ctx, cx - 30 + (i % 7) * 10, 130 - Math.floor(i / 7) * 8, 3, "#d9a066");
    } else if (p.method === "evaporation") {
      ctx.beginPath(); ctx.arc(cx, 120, 70, 0, Math.PI); ctx.fillStyle = `rgba(116,192,252,${0.4 * (1 - t)})`; ctx.fill(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.stroke();
      if (t > 0.5 && (p.mix === "salt" || p.mix === "pure")) for (let i = 0; i < 18; i++) rect(ctx, cx - 40 + (i % 9) * 9, 170 + Math.floor(i / 9) * 6, 6, 6, "#f1f3f5", "#adb5bd", 1, 1);
      for (let i = 0; i < 6; i++) text(ctx, "~", cx - 40 + i * 16, 100 - ((t * 60 + i * 13) % 50), { color: C.gray, size: 18 });
      for (let i = 0; i < 3; i++) { ctx.fillStyle = ["#ffd43b", "#ff922b", "#74c0fc"][i]; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.ellipse(cx, H - 40, 18 - i * 5, 26 - i * 7, 0, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
    } else if (p.method.includes("distillation")) {
      rect(ctx, cx - 160, 90, 80, 100, "rgba(116,192,252,.35)", C.text, 30, 2);
      if (p.method === "fractional distillation") rect(ctx, cx - 128, 30, 16, 60, "#f8f9fa", C.text, 2, 1.5);
      Sim.line(ctx, cx - 112, 40, cx + 80, 110, C.text, 10); Sim.line(ctx, cx - 112, 40, cx + 80, 110, "#e7f5ff", 6);
      text(ctx, "condenser (cold water)", cx - 20, 60, { size: 11, color: C.blue });
      rect(ctx, cx + 80, 120, 60, 80, null, C.text, 4, 2); rect(ctx, cx + 82, 198 - 60 * t, 56, 60 * t, ok ? "rgba(116,192,252,.3)" : "rgba(116,192,252,.3)");
    } else if (p.method === "chromatography") {
      rect(ctx, cx - 50, 30, 100, H - 70, "#fffdf5", C.gray, 2, 1);
      if (p.mix === "ink") ["#1c7ed6", "#e03131", "#f2b705"].forEach((c, i) => circle(ctx, cx, H - 60 - t * (60 + i * 50), 7, c));
      else circle(ctx, cx, H - 60, 8, "#868e96");
    } else {
      for (let i = 0; i < 40; i++) { const iron = i % 2 === 0, moved = iron && p.mix === "iron"; circle(ctx, cx - 80 + ((i * 37) % 160) + (moved ? t * 0 : 0), moved ? Sim.lerp(H - 40 - (i % 5) * 6, 90, t) : H - 40 - (i % 5) * 6, 3, iron ? "#495057" : "#ffd43b"); }
      rect(ctx, cx - 60, 60, 120, 22, C.red, null, 4); text(ctx, "magnet", cx, 76, { align: "center", color: "#fff", weight: 700, size: 12 });
    }
    text(ctx, ok ? "✓ This method works" : "✗ Not the best method for this mixture", 14, H - 10, { weight: 700, color: ok ? C.green : C.red });
  },
  read(s, p) { const m = MIX[p.mix]; return { result: m.method === p.method ? "yes!" : "no, try another", best: METHODS.find((x) => x[0] === m.method)[1], why: m.why }; },
  keyIdea: "<b>Key idea:</b> filtration separates an insoluble solid from a liquid; evaporation gets a dissolved solid; distillation gets a pure liquid; fractional distillation separates liquids with different boiling points; chromatography separates dissolved dyes.",
  tryThis: ["Choose the right method for every mixture.", "How would you get both pure water and salt from seawater?", "How could you separate sand, salt and water using two methods in order?"],
});
