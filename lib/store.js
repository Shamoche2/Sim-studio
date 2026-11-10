import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Tiny file-based library: each simulation is data/sims/<id>.html, and
 * data/index.json holds the metadata. Good enough for one school; swap for a
 * database when it grows.
 */
export function createStore(rootDir, samplesDir) {
  const simsDir = path.join(rootDir, "sims");
  const indexPath = path.join(rootDir, "index.json");
  fs.mkdirSync(simsDir, { recursive: true });

  let index = [];
  try {
    index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  } catch {
    index = [];
  }

  const save = () => fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  // Seed the built-in sample simulations once.
  const sampleManifest = JSON.parse(fs.readFileSync(path.join(samplesDir, "samples.json"), "utf8"));
  for (const sample of sampleManifest) {
    if (!index.some((s) => s.id === sample.id)) {
      fs.copyFileSync(path.join(samplesDir, sample.file), path.join(simsDir, `${sample.id}.html`));
      index.push({
        id: sample.id,
        topic: sample.topic,
        grade: sample.grade,
        keywords: sample.keywords,
        sample: true,
        createdAt: new Date(0).toISOString(),
      });
    }
  }
  save();

  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

  return {
    list() {
      return [...index].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    get(id) {
      const meta = index.find((s) => s.id === id);
      if (!meta) return null;
      return { meta, html: fs.readFileSync(path.join(simsDir, `${meta.id}.html`), "utf8") };
    },

    /** Exact topic + grade match, for instant cached results. */
    findCached(topic, grade) {
      const key = normalize(topic);
      return index.find((s) => !s.sample && s.grade === grade && normalize(s.topic) === key) ?? null;
    },

    /** Used in demo mode (no API key): match a topic to a built-in sample. */
    findSample(topic) {
      const words = new Set(normalize(topic).split(" "));
      return index.find((s) => s.sample && s.keywords.some((k) => words.has(k))) ?? null;
    },

    add({ topic, grade, html, parentId = null, change = null, model = null }) {
      const slug = normalize(topic).replace(/ /g, "-").slice(0, 40) || "simulation";
      const id = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
      fs.writeFileSync(path.join(simsDir, `${id}.html`), html);
      const meta = { id, topic, grade, parentId, change, model, sample: false, createdAt: new Date().toISOString() };
      index.push(meta);
      save();
      return meta;
    },
  };
}
