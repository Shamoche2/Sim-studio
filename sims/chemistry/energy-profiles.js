const { C, text, rect, arrow, plot } = Sim;
Sim({
  title: "Energy Profiles and Activation Energy",
  intro: "Every reaction must climb an energy hill (the activation energy) before it can happen. Exothermic reactions end lower than they started and release heat; endothermic ones end higher.",
  controls: [
    { id: "dH", label: "Energy change ΔH", min: -200, max: 200, step: 5, value: -80, unit: "kJ/mol" },
    { id: "Ea", label: "Activation energy", min: 20, max: 250, step: 5, value: 120, unit: "kJ/mol" },
    { id: "cat", label: "Add a catalyst", type: "checkbox", value: false },
    { id: "T", label: "Temperature", min: 250, max: 700, step: 10, value: 300, unit: "K" },
  ],
  readouts: [["type", "Type"], ["ea", "Activation energy used"], ["frac", "Molecules with enough energy"]],
  Ea(p) { return Math.max(p.cat ? p.Ea * 0.55 : p.Ea, p.dH > 0 ? p.dH + 5 : 5); },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#fff");
    const left = W * 0.58, Ea = this.Ea(p), r0 = 200, top = r0 + Math.max(Ea, p.dH + 10);
    const curve = (ea) => Array.from({ length: 201 }, (_, i) => { const x = i / 200; const base = r0 + p.dH * (1 / (1 + Math.exp(-(x - 0.5) * 14))); const hump = (ea - p.dH * 0.5) * Math.exp(-((x - 0.5) ** 2) / 0.012); return [x, base + hump]; });
    const ymax = Math.max(top, r0 + p.dH, r0) + 60;
    const g = plot(ctx, { x: 0, y: 6, w: left, h: H - 12 }, { title: "Energy profile", xmin: 0, xmax: 1, ymin: Math.min(r0, r0 + p.dH) - 60, ymax, xstep: 2, xlabel: "progress of reaction →", ylabel: "energy (kJ/mol)", series: [...(p.cat ? [{ data: curve(p.Ea), color: "#adb5bd", dash: [5, 4] }] : []), { data: curve(Ea), color: p.cat ? C.green : C.blue, width: 3 }] });
    const peak = curve(Ea)[100][1];
    arrow(ctx, g.X(0.18), g.Y(r0), g.X(0.18), g.Y(peak), C.red, 2); text(ctx, "Eₐ", g.X(0.18) - 6, g.Y((r0 + peak) / 2), { color: C.red, weight: 700, align: "right" });
    arrow(ctx, g.X(0.86), g.Y(r0), g.X(0.86), g.Y(r0 + p.dH), C.purple, 2); text(ctx, "ΔH", g.X(0.86) + 6, g.Y(r0 + p.dH / 2), { color: C.purple, weight: 700 });
    text(ctx, "reactants", g.X(0.04), g.Y(r0) - 8, { size: 12, color: C.muted }); text(ctx, "products", g.X(0.96), g.Y(r0 + p.dH) - 8, { size: 12, color: C.muted, align: "right" });
    // Maxwell-Boltzmann style distribution (kinetic energy)
    const kT = (8.314 * p.T) / 1000 * 8, dist = Array.from({ length: 201 }, (_, i) => { const E = (i / 200) * 300; return [E, Math.sqrt(E) * Math.exp(-E / kT)]; });
    const ym = Math.max(...dist.map((d) => d[1])) * 1.15;
    plot(ctx, { x: left + 6, y: 6, w: W - left - 12, h: H - 12 }, { title: "Molecule energies", xmin: 0, xmax: 300, ymin: 0, ymax: ym, ystep: ym * 2, xlabel: "energy", ylabel: "number of molecules", series: [{ data: dist, color: C.orange }], vlines: [{ x: Ea, color: C.red, label: "Eₐ" }] });
  },
  read(s, p) {
    const Ea = this.Ea(p), kT = (8.314 * p.T) / 1000 * 8;
    let tot = 0, above = 0; for (let E = 0.5; E < 1500; E += 1) { const f = Math.sqrt(E) * Math.exp(-E / kT); tot += f; if (E >= Ea) above += f; }
    return { type: p.dH < 0 ? "exothermic (releases heat)" : p.dH > 0 ? "endothermic (takes in heat)" : "thermoneutral", ea: Ea.toFixed(0) + " kJ/mol", frac: ((100 * above) / tot).toFixed(2) + "%" };
  },
  keyIdea: "<b>Key idea:</b> ΔH = energy of products − energy of reactants (negative = exothermic). A catalyst gives a lower-energy route, so more molecules have enough energy to react. It doesn't change ΔH.",
  tryThis: ["Make the reaction endothermic. What does the energy profile look like now?", "Add a catalyst. Does ΔH change? What happens to the fraction of molecules with enough energy?", "Raise the temperature. Why does this speed up the reaction?"],
  note: "Molecule energies use a scaled Maxwell–Boltzmann shape for illustration.",
});
