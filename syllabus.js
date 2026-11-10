// Curriculum mapping for every simulation.
// IGCSE: topic numbers from Cambridge IGCSE Physics 0625, Chemistry 0620 and Biology 0610 (2023–2025 syllabuses).
// WAEC: grouped into the main themes of the WASSCE Physics, Chemistry and Biology syllabuses.
// Teachers: please check the mapping against your scheme of work and report anything that looks wrong.
(function () {
  const IGCSE_TOPICS = {
    physics: { 1: "Motion, forces and energy", 2: "Thermal physics", 3: "Waves", 4: "Electricity and magnetism", 5: "Nuclear physics", 6: "Space physics" },
    chemistry: { 1: "States of matter", 2: "Atoms, elements and compounds", 3: "Stoichiometry", 4: "Electrochemistry", 5: "Chemical energetics", 6: "Chemical reactions", 7: "Acids, bases and salts", 8: "The Periodic Table", 9: "Metals", 10: "Chemistry of the environment", 11: "Organic chemistry", 12: "Experimental techniques and chemical analysis" },
    biology: { 1: "Characteristics and classification of living organisms", 2: "Organisation of the organism", 3: "Movement into and out of cells", 4: "Biological molecules", 5: "Enzymes", 6: "Plant nutrition", 7: "Human nutrition", 8: "Transport in plants", 9: "Transport in animals", 10: "Diseases and immunity", 11: "Gas exchange in humans", 12: "Respiration", 13: "Excretion in humans", 14: "Coordination and response", 15: "Drugs", 16: "Reproduction", 17: "Inheritance", 18: "Variation and selection", 19: "Organisms and their environment", 20: "Human influences on ecosystems", 21: "Biotechnology and genetic modification" },
  };
  const WAEC_THEMES = {
    physics: ["Mechanics", "Heat", "Waves, light and sound", "Electricity and magnetism", "Atomic and nuclear physics", "Gravitation and space"],
    chemistry: ["States of matter and gas laws", "Atomic structure and the Periodic Table", "Chemical bonding", "Stoichiometry and the mole", "Energy changes", "Rates of reaction and equilibrium", "Acids, bases and salts", "Solutions and solubility", "Redox and electrochemistry", "Metals and their compounds", "Organic chemistry", "Separation and qualitative analysis", "Environmental and industrial chemistry"],
    biology: ["Cell biology and classification", "Nutrition", "Transport and gas exchange", "Respiration", "Excretion and homeostasis", "Coordination and response", "Support and movement", "Reproduction", "Genetics, variation and evolution", "Ecology", "Health and disease"],
  };
  // id: [IGCSE topic number or null, WAEC theme index]
  const MAP = {
    physics: {
      "projectile-motion": [1, 0], pendulum: [1, 0], "mass-spring": [1, 0], "newtons-second-law": [1, 0], "ohms-law": [4, 3], "series-parallel": [4, 3],
      "transverse-waves": [3, 2], "wave-interference": [3, 2], refraction: [3, 2], "convex-lens": [3, 2], "terminal-velocity": [1, 0], collisions: [1, 0],
      "circular-motion": [1, 0], orbits: [6, 5], "inclined-plane": [1, 0], "energy-skate-park": [1, 0], "doppler-effect": [3, 2], "electric-field": [4, 3],
      "radioactive-decay": [5, 4], buoyancy: [1, 0], "motion-graphs": [1, 0], "hookes-law": [1, 0], density: [1, 0], "fluid-pressure": [1, 0], moments: [1, 0],
      "work-power": [1, 0], "energy-efficiency": [1, 0], "specific-heat": [2, 1], conduction: [2, 1], convection: [2, 1], "sound-waves": [3, 2], resonance: [3, 2],
      "standing-waves": [3, 2], reflection: [3, 2], "colour-mixing": [3, 2], "em-spectrum": [3, 2], "double-slit": [3, 2], "photoelectric-effect": [5, 4],
      "magnetic-fields": [4, 3], electromagnet: [4, 3], "electromagnetic-induction": [4, 3], transformer: [4, 3], capacitor: [4, 3], "wire-resistance": [4, 3],
      "electricity-cost": [4, 3], seasons: [6, 5], "moon-phases": [6, 5], "weight-planets": [1, 5], "atomic-spectra": [5, 4], "nuclear-fission": [5, 4],
    },
    chemistry: {
      "states-of-matter": [1, 0], "boyles-law": [1, 0], "charles-law": [1, 0], diffusion: [1, 0], "reaction-rate": [6, 5], "atomic-structure": [2, 1], isotopes: [2, 1],
      "chemical-equilibrium": [6, 5], "ph-scale": [7, 6], titration: [7, 6], concentration: [3, 3], "balancing-equations": [3, 3], "ionic-bonding": [2, 2],
      "molecular-shapes": [2, 2], electrolysis: [4, 8], "energy-profiles": [5, 4], solubility: [1, 7], "periodic-trends": [8, 1], chromatography: [12, 11],
      "electrochemical-cell": [4, 8], moles: [3, 3], "empirical-formula": [3, 3], "limiting-reactant": [3, 3], "molar-gas-volume": [3, 3], "ideal-gas-law": [1, 0],
      "electron-configuration": [2, 1], "covalent-bonding": [2, 2], "metallic-bonding": [2, 2], "bond-polarity": [2, 2], "intermolecular-forces": [2, 2],
      "crystal-lattices": [2, 2], "reactivity-series": [9, 9], "displacement-reactions": [9, 8], "flame-tests": [12, 11], "acid-strength": [7, 6],
      "neutralisation-temperature": [5, 4], buffers: [7, 6], "surface-area-rate": [6, 5], "haber-process": [6, 12], combustion: [10, 12], "homologous-series": [11, 10],
      "fractional-distillation": [11, 10], polymerisation: [11, 10], rusting: [9, 9], "bond-energies": [5, 4], calorimetry: [5, 4], "nuclear-equations": [2, 1],
      "separating-mixtures": [12, 11], "gas-tests": [12, 11], "first-order-kinetics": [6, 5],
    },
    biology: {
      "predator-prey": [19, 9], photosynthesis: [6, 1], enzymes: [5, 1], osmosis: [3, 0], "natural-selection": [18, 8], "punnett-square": [17, 8], "population-growth": [19, 9],
      "blood-circulation": [9, 2], mitosis: [17, 0], "energy-pyramid": [19, 9], "disease-spread": [10, 10], "nerve-impulse": [14, 5], breathing: [11, 2],
      "carbon-cycle": [19, 9], "protein-synthesis": [17, 8], "surface-area-volume": [3, 0], "antibiotic-resistance": [18, 10], transpiration: [8, 2],
      "blood-glucose": [14, 4], "genetic-drift": [18, 8], "cell-structure": [2, 0], microscope: [2, 0], "membrane-diffusion": [3, 0], digestion: [7, 1],
      respiration: [12, 3], "blood-vessels": [9, 2], "immune-response": [10, 10], "eye-focusing": [14, 5], "reflex-arc": [14, 5], "menstrual-cycle": [16, 7],
      "water-balance": [13, 4], thermoregulation: [14, 4], tropisms: [14, 5], decomposition: [19, 9], "quadrat-sampling": [19, 9], "mark-recapture": [19, 9],
      "food-web": [19, 9], competition: [19, 9], meiosis: [17, 8], "dna-structure": [4, 8], "sex-linked-inheritance": [17, 8], "blood-groups": [17, 8],
      variation: [18, 8], speciation: [18, 8], "dichotomous-key": [1, 0], "cardiac-cycle": [9, 2], "arm-muscles": [null, 6], "gas-exchange-indicator": [6, 1],
      "bacterial-growth": [21, 10], eutrophication: [20, 9],
    },
  };
  window.SYLLABUS = {
    names: { igcse: "Cambridge IGCSE", waec: "WAEC (WASSCE)" },
    // Returns { key, label, order } for a simulation in a curriculum, or null if it isn't on that syllabus.
    topic(curriculum, subject, id) {
      const m = (MAP[subject] || {})[id];
      if (!m) return null;
      if (curriculum === "igcse") return m[0] == null ? null : { key: `${subject}-${m[0]}`, label: `${m[0]}. ${IGCSE_TOPICS[subject][m[0]]}`, order: m[0] };
      if (curriculum === "waec") return { key: `${subject}-w${m[1]}`, label: WAEC_THEMES[subject][m[1]], order: m[1] };
      return null;
    },
    has: (subject, id) => Boolean((MAP[subject] || {})[id]),
  };
})();
