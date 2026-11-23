// "More ways to learn" links from each topic to its virtual lab and learning tools.
// Rendered on every topic page by kit/support.js.
window.EXTRAS = window.EXTRAS || {};
(function () {
  const LABS = {
    "physics/pendulum": ["The simple pendulum (finding g)", ["physics/pendulum"]],
    "physics/hookes-law": ["Hooke's law", ["physics/hookes-law", "physics/mass-spring"]],
    "physics/density": ["Measuring density", ["physics/density", "physics/buoyancy"]],
    "physics/ohms-law": ["I–V characteristics", ["physics/ohms-law", "physics/wire-resistance", "physics/series-parallel"]],
    "physics/refraction": ["Refraction through a glass block", ["physics/refraction", "physics/convex-lens", "physics/reflection"]],
    "physics/specific-heat": ["Specific heat capacity of a metal", ["physics/specific-heat", "physics/conduction", "physics/energy-efficiency"]],
    "chemistry/titration": ["Acid–alkali titration", ["chemistry/titration", "chemistry/ph-scale", "chemistry/concentration", "chemistry/acid-strength", "chemistry/moles"]],
    "chemistry/rates": ["Rate of reaction (disappearing cross)", ["chemistry/reaction-rate", "chemistry/surface-area-rate", "chemistry/first-order-kinetics"]],
    "chemistry/temperature-change": ["Exothermic and endothermic reactions", ["chemistry/neutralisation-temperature", "chemistry/calorimetry", "chemistry/bond-energies", "chemistry/energy-profiles", "chemistry/combustion"]],
    "chemistry/chromatography": ["Paper chromatography", ["chemistry/chromatography", "chemistry/separating-mixtures"]],
    "chemistry/electrolysis": ["Electrolysis of solutions", ["chemistry/electrolysis", "chemistry/electrochemical-cell", "chemistry/reactivity-series"]],
    "chemistry/qualitative-analysis": ["Identifying ions", ["chemistry/flame-tests", "chemistry/gas-tests", "chemistry/solubility"]],
    "biology/osmosis": ["Osmosis in potato cylinders", ["biology/osmosis", "biology/membrane-diffusion", "biology/surface-area-volume", "biology/water-balance"]],
    "biology/enzymes": ["Temperature and amylase", ["biology/enzymes", "biology/digestion"]],
    "biology/photosynthesis": ["Light intensity and photosynthesis", ["biology/photosynthesis", "biology/carbon-cycle", "biology/gas-exchange-indicator"]],
    "biology/food-tests": ["Food tests", ["biology/digestion", "biology/enzymes"]],
    "biology/leaf-starch": ["Testing a leaf for starch", ["biology/photosynthesis", "biology/carbon-cycle"]],
    "biology/transpiration": ["Measuring transpiration (potometer)", ["biology/transpiration"]],
  };
  const MOLECULES = {
    "chemistry/covalent-bonding": "water", "chemistry/molecular-shapes": "methane", "chemistry/homologous-series": "propane", "chemistry/polymerisation": "ethene",
    "chemistry/combustion": "methane", "chemistry/bond-energies": "methane", "chemistry/bond-polarity": "hcl", "chemistry/intermolecular-forces": "water",
    "chemistry/balancing-equations": "water", "chemistry/haber-process": "ammonia", "chemistry/chemical-equilibrium": "ammonia", "chemistry/gas-tests": "co2",
    "chemistry/empirical-formula": "ethane", "chemistry/moles": "co2", "chemistry/limiting-reactant": "water", "chemistry/fractional-distillation": "butane",
    "chemistry/molar-gas-volume": "o2", "chemistry/diffusion": "ammonia", "chemistry/acid-strength": "ethanoic", "chemistry/buffers": "ethanoic", "chemistry/rusting": "o2",
    "chemistry/electron-configuration": "n2", "chemistry/states-of-matter": "water", "chemistry/periodic-trends": "cl2",
  };
  const BODY = {
    "biology/digestion": "digestive", "biology/enzymes": "digestive", "biology/blood-circulation": "circulatory", "biology/cardiac-cycle": "circulatory",
    "biology/blood-vessels": "circulatory", "biology/blood-groups": "circulatory", "biology/immune-response": "circulatory", "biology/breathing": "respiratory",
    "biology/gas-exchange-indicator": "respiratory", "biology/respiration": "respiratory", "biology/nerve-impulse": "nervous", "biology/reflex-arc": "nervous",
    "biology/eye-focusing": "nervous", "biology/water-balance": "excretory", "biology/thermoregulation": "excretory", "biology/blood-glucose": "endocrine",
    "biology/menstrual-cycle": "endocrine", "biology/arm-muscles": "skeletal", "biology/cell-structure": "digestive",
  };
  const FORMULA = {
    "physics/motion-graphs": "speed", "physics/projectile-motion": "speed", "physics/terminal-velocity": "force", "physics/newtons-second-law": "force",
    "physics/circular-motion": "force", "physics/weight-planets": "weight", "physics/orbits": "weight", "physics/density": "density", "physics/buoyancy": "density",
    "physics/ohms-law": "ohm", "physics/wire-resistance": "ohm", "physics/series-parallel": "ohm", "physics/electricity-cost": "epower", "physics/transformer": "epower",
    "physics/work-power": "work", "physics/inclined-plane": "work", "physics/energy-skate-park": "energy", "physics/energy-efficiency": "energy", "physics/specific-heat": "energy",
    "physics/fluid-pressure": "pressure", "physics/moments": "moment", "physics/transverse-waves": "wave", "physics/sound-waves": "wave", "physics/standing-waves": "wave",
    "physics/wave-interference": "wave", "physics/doppler-effect": "wave", "physics/em-spectrum": "wave", "physics/double-slit": "wave", "physics/resonance": "wave",
    "physics/capacitor": "charge", "physics/hookes-law": "hooke", "physics/mass-spring": "hooke", "physics/collisions": "momentum", "physics/pendulum": "speed",
  };
  const BODY_NAMES = { digestive: "digestive system", circulatory: "heart and blood", respiratory: "breathing system", nervous: "nervous system", excretory: "kidneys and skin", endocrine: "hormones", skeletal: "skeleton and muscles" };
  const add = (id, link) => (window.EXTRAS[id] = window.EXTRAS[id] || []).push(link);
  for (const [lab, [title, topics]] of Object.entries(LABS)) for (const t of topics) add(t, { kind: "lab", icon: "🧪", label: "Virtual lab: " + title, href: "view.html?lab=" + lab, note: "Do the practical: take readings, fill in a results table and draw a graph." });
  for (const [t, target] of Object.entries(MOLECULES)) add(t, { kind: "tool", icon: "⚛️", label: "Molecule builder", href: "view.html?sim=tools/molecule-builder&target=" + target, note: "Build the molecule yourself, atom by atom." });
  for (const [t, sys] of Object.entries(BODY)) add(t, { kind: "tool", icon: "🫀", label: "Digital human body: " + BODY_NAMES[sys], href: "view.html?sim=tools/human-body&system=" + sys, note: "See where this happens in the body, with labels, animations and a quiz." });
  for (const [t, f] of Object.entries(FORMULA)) add(t, { kind: "tool", icon: "🧮", label: "Formula helper", href: "view.html?sim=tools/formula-helper&formula=" + f, note: "Step-by-step help with the equation, in words, pictures and colours." });
  window.EXTRAS_INDEX = { LABS, MOLECULES, BODY, FORMULA };
})();
