// The simulation library. Each entry: [id, title, keywords, summary]
// File path: standalone pages use sims/<subject>/<id>.html, kit pages use sims/view.html?sim=<subject>/<id>
(function () {
  const STANDALONE = new Set(["projectile-motion", "predator-prey"]);
  const data = {
    physics: [
      ["projectile-motion", "Projectile motion", "trajectory parabola launch cannon range kinematics", "Launch a ball at any angle and speed and see its curved path."],
      ["pendulum", "Simple pendulum", "swing period oscillation harmonic gravity", "What sets the time for one swing? Length, gravity or mass?"],
      ["mass-spring", "Mass on a spring (SHM)", "spring hooke oscillation simple harmonic motion energy", "A mass oscillates on a spring while energy swaps forms."],
      ["newtons-second-law", "Newton's second law (F = ma)", "force mass acceleration friction newton laws motion", "Push a cart against friction and measure its acceleration."],
      ["ohms-law", "Ohm's law", "voltage current resistance circuit electricity", "See how voltage and resistance set the current in a circuit."],
      ["series-parallel", "Series and parallel circuits", "resistors circuit current voltage electricity", "Compare how current and voltage split in series and parallel."],
      ["transverse-waves", "Waves on a string", "wave wavelength frequency amplitude speed transverse", "Explore wavelength, frequency, amplitude and wave speed."],
      ["wave-interference", "Wave interference", "interference constructive destructive two source waves superposition", "Two wave sources make bright and quiet bands."],
      ["refraction", "Refraction and Snell's law", "light refraction snell bending index total internal reflection optics", "Watch light bend between air, water, glass and diamond."],
      ["convex-lens", "Convex lens ray diagram", "lens optics image focal length magnification ray diagram", "Build real and virtual images with a converging lens."],
      ["terminal-velocity", "Free fall and terminal velocity", "skydiver air resistance drag falling gravity terminal velocity", "Why a skydiver stops speeding up."],
      ["collisions", "Momentum and collisions", "momentum collision elastic inelastic conservation impulse", "Crash carts together and check momentum conservation."],
      ["circular-motion", "Circular motion", "centripetal force acceleration circle rotation", "The force that keeps things moving in a circle."],
      ["orbits", "Orbits and gravity", "orbit satellite gravity planet escape velocity space kepler", "Launch a satellite into orbit, or out of it."],
      ["inclined-plane", "Forces on an inclined plane", "ramp slope incline friction normal force components", "When does a box start sliding down a ramp?"],
      ["energy-skate-park", "Energy skate park", "energy conservation kinetic potential thermal skateboard roller coaster", "Track kinetic, potential and thermal energy on a skate track."],
      ["doppler-effect", "The Doppler effect", "doppler sound pitch frequency siren moving source sonic boom", "Why a passing siren changes pitch."],
      ["electric-field", "Electric fields and charges", "electric field charge coulomb force electrostatics", "Drag charges and see their electric field."],
      ["radioactive-decay", "Radioactive decay and half-life", "radioactive decay half life nuclear isotope atoms", "Random decay of atoms gives a predictable half-life."],
      ["buoyancy", "Buoyancy and floating", "buoyancy archimedes float sink density fluid upthrust", "Why things float or sink: Archimedes' principle."],
    ],
    chemistry: [
      ["states-of-matter", "States of matter", "solid liquid gas melting boiling particles kinetic theory state change", "Heat a substance and watch it melt and boil at the particle level."],
      ["boyles-law", "Boyle's law: pressure and volume", "gas pressure volume boyle gas laws particles", "Squeeze a gas and measure its pressure."],
      ["charles-law", "Charles's law: volume and temperature", "gas volume temperature charles absolute zero kelvin gas laws", "Heat a gas and watch it expand."],
      ["diffusion", "Diffusion of gases", "diffusion graham gases mixing particles concentration", "Two gases mix by random motion; lighter ones faster."],
      ["reaction-rate", "Rates of reaction (collision theory)", "reaction rate collision theory activation energy catalyst temperature concentration kinetics", "What makes reactions go faster?"],
      ["atomic-structure", "Build an atom", "atom protons neutrons electrons shells element ion structure", "Build atoms and ions from protons, neutrons and electrons."],
      ["isotopes", "Isotopes and relative atomic mass", "isotopes atomic mass abundance neutrons relative", "Why atomic masses aren't whole numbers."],
      ["chemical-equilibrium", "Chemical equilibrium (Le Chatelier)", "equilibrium reversible le chatelier dynamic equilibrium constant", "Disturb a reversible reaction and watch it shift."],
      ["ph-scale", "The pH scale", "ph acid alkali base indicator hydrogen ions neutral", "Test everyday liquids with universal indicator."],
      ["titration", "Acid-base titration", "titration acid base neutralisation equivalence point indicator burette", "Neutralise an acid and plot the titration curve."],
      ["concentration", "Concentration and dilution", "concentration molarity dilution solution beer lambert colorimeter moles", "Make solutions and measure how concentrated they are."],
      ["balancing-equations", "Balancing chemical equations", "balancing equations coefficients conservation of mass atoms reactions", "Balance reactions by counting atoms on both sides."],
      ["ionic-bonding", "Ionic bonding", "ionic bonding ions electron transfer metals non-metals compounds", "Watch metals give electrons to non-metals."],
      ["molecular-shapes", "Molecular shapes (VSEPR)", "molecular shapes vsepr bond angle lone pairs geometry covalent", "3D shapes of molecules from electron pair repulsion."],
      ["electrolysis", "Electrolysis", "electrolysis electrodes cathode anode ions faraday", "Split ionic compounds with electricity."],
      ["energy-profiles", "Energy profiles and activation energy", "exothermic endothermic activation energy enthalpy catalyst energy profile", "Exothermic and endothermic reactions on an energy hill."],
      ["solubility", "Solubility and saturated solutions", "solubility saturated crystallisation solubility curve dissolving", "How much solid dissolves, and how temperature changes that."],
      ["periodic-trends", "Periodic table trends", "periodic table trends atomic radius electronegativity ionisation energy", "Colour the periodic table by radius, electronegativity and more."],
      ["chromatography", "Paper chromatography", "chromatography rf separation inks dyes mixtures", "Separate inks into dyes and measure Rf values."],
      ["electrochemical-cell", "Electrochemical (galvanic) cell", "galvanic cell battery electrode potential redox daniell voltage", "Build a battery from two metals."],
    ],
    biology: [
      ["predator-prey", "Predator-prey populations", "lotka volterra foxes rabbits ecology population cycle", "Watch fox and rabbit populations rise and fall in cycles."],
      ["photosynthesis", "Photosynthesis: limiting factors", "photosynthesis light carbon dioxide temperature limiting factor plants oxygen pondweed", "How light, CO₂ and temperature limit photosynthesis."],
      ["enzymes", "Enzyme activity", "enzymes temperature ph active site denature optimum catalyst", "Find each enzyme's optimum temperature and pH."],
      ["osmosis", "Osmosis in cells", "osmosis water membrane hypotonic hypertonic isotonic turgid plasmolysis cells", "Put cells in different solutions and watch water move."],
      ["natural-selection", "Natural selection: peppered moths", "natural selection evolution adaptation camouflage moths darwin", "Watch a moth population evolve over generations."],
      ["punnett-square", "Genetic crosses (Punnett squares)", "genetics inheritance punnett square alleles dominant recessive genotype phenotype", "Predict offspring with Punnett squares."],
      ["population-growth", "Population growth", "population growth exponential logistic carrying capacity ecology", "Exponential vs logistic growth and carrying capacity."],
      ["blood-circulation", "The heart and double circulation", "heart circulation blood cardiac output heart rate pulmonary systemic", "Follow blood around the lungs and body."],
      ["mitosis", "Mitosis: cell division", "mitosis cell division cell cycle chromosomes prophase metaphase anaphase telophase", "Step through the stages of mitosis."],
      ["energy-pyramid", "Food chains and energy pyramids", "food chain energy pyramid trophic levels ecosystem producers consumers", "Why only 10% of energy passes up each level."],
      ["disease-spread", "Spread of infectious disease", "disease epidemic infection vaccination herd immunity sir pandemic", "Model an outbreak with infection, recovery and vaccines."],
      ["nerve-impulse", "Nerve impulses", "nerve neurone action potential impulse myelin nervous system", "Send an action potential along a neurone."],
      ["breathing", "Breathing and lung volumes", "breathing lungs ventilation diaphragm tidal volume respiration spirometer", "How the diaphragm moves air in and out."],
      ["carbon-cycle", "The carbon cycle", "carbon cycle co2 climate photosynthesis respiration fossil fuels deforestation", "Change human activity and watch atmospheric CO₂."],
      ["protein-synthesis", "Protein synthesis: DNA → RNA → protein", "dna rna protein synthesis transcription translation codon mutation genetic code", "Transcribe and translate a gene, then mutate it."],
      ["surface-area-volume", "Surface area to volume ratio", "surface area volume ratio cell size diffusion exchange", "Why cells are small and lungs are folded."],
      ["antibiotic-resistance", "Antibiotic resistance", "antibiotic resistance bacteria evolution mutation selection medicine", "How stopping antibiotics early breeds resistant bacteria."],
      ["transpiration", "Transpiration in plants", "transpiration stomata xylem water plants humidity wind potometer", "How weather changes water loss from leaves."],
      ["blood-glucose", "Blood glucose regulation", "blood glucose insulin glucagon diabetes homeostasis negative feedback pancreas", "Insulin, glucagon and diabetes."],
      ["genetic-drift", "Genetic drift", "genetic drift allele frequency population evolution chance", "Random changes in alleles in small populations."],
    ],
  };
  const out = [];
  for (const [subject, list] of Object.entries(data)) {
    for (const [id, title, keywords, summary] of list) {
      out.push({
        id, subject, title, summary, keywords: keywords.split(" "),
        file: STANDALONE.has(id) ? `sims/${subject}/${id}.html` : `sims/view.html?sim=${subject}/${id}`,
      });
    }
  }
  window.CATALOG = out;
})();
