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
    chemistry: [],
    biology: [
      ["predator-prey", "Predator-prey populations", "lotka volterra foxes rabbits ecology population cycle", "Watch fox and rabbit populations rise and fall in cycles."],
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
