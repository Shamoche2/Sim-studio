// Virtual labs and learning tools shown in the library's "Labs & tools" tab and the teacher guide.
(function () {
  const L = (subject, id, title, summary, keywords) => ({ id: "lab-" + id, kind: "lab", area: subject, subject: "labs", title, summary, keywords: (keywords + " practical experiment lab virtual").split(" "), file: `sims/view.html?lab=${subject}/${id}`, howto: `${subject}/${id}` });
  const T = (id, title, summary, keywords) => ({ id: "tool-" + id, kind: "tool", area: "tools", subject: "labs", title, summary, keywords: keywords.split(" "), file: `sims/view.html?sim=tools/${id}`, howto: `tools/${id}` });
  window.LABS_TOOLS = [
    T("human-body", "Digital human body", "Explore 7 body systems and 30 organs with labels, animations, read-aloud and a quiz.", "body organs heart lungs digestive nervous skeleton anatomy human"),
    T("molecule-builder", "Molecule builder", "Build molecules atom by atom: water, methane, ethanol and more, with guided challenges.", "molecule atoms bonds covalent organic build structure"),
    T("formula-helper", "Formula helper", "Formula triangles with pictures, colours and worked steps in words. Made for learners who find maths hard.", "formula equation triangle rearrange calculate maths dyscalculia speed density ohm"),
    L("physics", "pendulum", "Virtual lab: The simple pendulum", "Time 10 swings at different lengths and find g from a graph.", "pendulum period gravity"),
    L("physics", "hookes-law", "Virtual lab: Hooke's law", "Load a spring, measure extension and find the spring constant.", "spring extension hooke"),
    L("physics", "density", "Virtual lab: Measuring density", "Weigh objects and find their volume by ruler or displacement can.", "density mass volume eureka"),
    L("physics", "ohms-law", "Virtual lab: I–V characteristics", "Plot current against voltage for a resistor, a lamp and a diode.", "ohm current voltage resistance diode lamp"),
    L("physics", "refraction", "Virtual lab: Refraction through a glass block", "Measure angles with a protractor and find the refractive index.", "refraction snell glass light"),
    L("physics", "specific-heat", "Virtual lab: Specific heat capacity", "Heat a metal block with a joulemeter and work out c.", "specific heat capacity energy temperature"),
    L("chemistry", "titration", "Virtual lab: Acid–alkali titration", "Use a burette and indicator, get concordant titres, calculate concentration.", "titration burette acid alkali indicator"),
    L("chemistry", "rates", "Virtual lab: Rate of reaction", "The disappearing-cross experiment with sodium thiosulfate.", "rate thiosulfate concentration temperature"),
    L("chemistry", "temperature-change", "Virtual lab: Exothermic and endothermic", "Measure temperature changes and calculate energy with Q = mcΔT.", "exothermic endothermic energy temperature"),
    L("chemistry", "chromatography", "Virtual lab: Paper chromatography", "Separate inks, measure Rf values and identify an unknown ink.", "chromatography rf ink separation"),
    L("chemistry", "electrolysis", "Virtual lab: Electrolysis of solutions", "Find the products at each electrode and weigh copper deposited.", "electrolysis electrode cathode anode copper"),
    L("chemistry", "qualitative-analysis", "Virtual lab: Identifying ions", "Flame tests, sodium hydroxide, silver nitrate and more on unknown salts.", "qualitative analysis ions flame test precipitate"),
    L("biology", "osmosis", "Virtual lab: Osmosis in potato", "Measure % change in mass in sucrose solutions and find the cell sap concentration.", "osmosis potato sucrose water"),
    L("biology", "enzymes", "Virtual lab: Temperature and amylase", "Time starch digestion with iodine on a spotting tile.", "enzyme amylase starch iodine temperature"),
    L("biology", "photosynthesis", "Virtual lab: Light and photosynthesis", "Count pondweed bubbles at different lamp distances.", "photosynthesis pondweed light oxygen"),
    L("biology", "food-tests", "Virtual lab: Food tests", "Iodine, Benedict's, biuret and ethanol tests on everyday foods.", "food test starch sugar protein fat benedict biuret"),
    L("biology", "leaf-starch", "Virtual lab: Testing a leaf for starch", "Show that light, chlorophyll and CO₂ are needed for photosynthesis.", "leaf starch iodine chlorophyll variegated"),
    L("biology", "transpiration", "Virtual lab: Potometer", "Measure transpiration in wind, warmth, humidity and darkness.", "transpiration potometer water stomata"),
  ];
})();
