import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.join(import.meta.dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "catalog.js"), "utf8"), sandbox);
const catalog = sandbox.window.CATALOG;

test("every catalog entry points to a file that exists", () => {
  for (const c of catalog) {
    const file = c.file.includes("view.html?sim=") ? `sims/${c.file.split("sim=")[1]}.js` : c.file;
    assert.ok(fs.existsSync(path.join(root, file)), `${c.id}: missing ${file}`);
  }
});

test("ids are unique and every entry has a title, summary and keywords", () => {
  const ids = new Set();
  for (const c of catalog) {
    assert.ok(!ids.has(c.id), `duplicate id ${c.id}`);
    ids.add(c.id);
    assert.ok(c.title && c.summary && c.keywords.length > 2, `${c.id} is missing details`);
  }
});

test("every simulation file on disk is listed in the catalog", () => {
  for (const subject of ["physics", "chemistry", "biology"]) {
    for (const f of fs.readdirSync(path.join(root, "sims", subject))) {
      const id = f.replace(/\.(js|html)$/, "");
      assert.ok(catalog.some((c) => c.id === id && c.subject === subject), `${subject}/${f} is not in catalog.js`);
    }
  }
});

test("the offline zip exists and includes every simulation", async () => {
  const zip = path.join(root, "sim-studio-offline.zip");
  assert.ok(fs.existsSync(zip), "run: python3 scripts/make-zip.py");
  const bytes = fs.readFileSync(zip).toString("latin1");
  for (const c of catalog) {
    const file = c.file.includes("view.html?sim=") ? `sims/${c.file.split("sim=")[1]}.js` : c.file;
    assert.ok(bytes.includes(`sim-studio/${file}`), `${file} missing from the zip: run python3 scripts/make-zip.py`);
  }
});

test("every simulation has a syllabus mapping", () => {
  const sb = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "syllabus.js"), "utf8"), sb);
  for (const c of catalog) assert.ok(sb.window.SYLLABUS.has(c.subject, c.id), `${c.id} has no syllabus mapping`);
});

test("every simulation has step-by-step directions", () => {
  const sb = { window: {} };
  for (const s of ["physics", "chemistry", "biology"]) vm.runInNewContext(fs.readFileSync(path.join(root, "sims", "howto", `${s}.js`), "utf8"), sb);
  const keys = new Set(catalog.map((c) => `${c.subject}/${c.id}`));
  for (const k of keys) assert.ok((sb.window.HOWTO[k] || []).length >= 3, `${k} has no directions in sims/howto/`);
  for (const k of Object.keys(sb.window.HOWTO)) assert.ok(keys.has(k), `sims/howto has directions for unknown simulation ${k}`);
});

// ----- Virtual labs, learning tools and Learning Support -----
const load = (rel, box = { window: {} }) => (vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), box), box.window);
const LT = load("labs-tools.js").LABS_TOOLS;
const W = { window: {} };
for (const f of ["sims/easy/physics.js", "sims/easy/chemistry.js", "sims/easy/biology.js", "sims/easy/tools.js", "sims/extras.js"]) load(f, W);

test("every lab and tool in the library has a page file", () => {
  for (const c of LT) {
    const file = c.kind === "lab" ? `sims/labs/${c.file.split("lab=")[1]}.js` : `sims/${c.file.split("sim=")[1]}.js`;
    assert.ok(fs.existsSync(path.join(root, file)), `${c.id}: missing ${file}`);
  }
  for (const subject of fs.readdirSync(path.join(root, "sims/labs"))) for (const f of fs.readdirSync(path.join(root, "sims/labs", subject)))
    assert.ok(LT.some((c) => c.file.endsWith(`lab=${subject}/${f.replace(/\.js$/, "")}`)), `lab ${subject}/${f} is not listed in labs-tools.js`);
});

test("every topic has simple-words support", () => {
  for (const c of catalog) assert.ok(W.window.EASY[`${c.subject}/${c.id}`], `no EASY entry for ${c.subject}/${c.id}`);
});

test("every 'More ways to learn' link points to a real topic and a real page", () => {
  const ids = new Set(catalog.map((c) => `${c.subject}/${c.id}`));
  const src = fs.readFileSync(path.join(root, "sims/tools/molecule-builder.js"), "utf8") + fs.readFileSync(path.join(root, "sims/tools/human-body.js"), "utf8") + fs.readFileSync(path.join(root, "sims/tools/formula-helper.js"), "utf8");
  let n = 0;
  for (const [topic, links] of Object.entries(W.window.EXTRAS)) {
    assert.ok(ids.has(topic), `extras for unknown topic ${topic}`);
    for (const l of links) {
      n++;
      const [page, query] = l.href.split("?"), q = new URLSearchParams(query), id = q.get("lab") || q.get("sim");
      const file = q.get("lab") ? `sims/labs/${id}.js` : `sims/${id}.js`;
      assert.equal(page, "view.html"); assert.ok(fs.existsSync(path.join(root, file)), `${topic}: missing ${file}`);
      for (const k of ["target", "system", "formula"]) if (q.get(k)) assert.ok(new RegExp(`\\b${q.get(k)}\\s*:`).test(src), `${topic}: unknown ${k}=${q.get(k)}`);
    }
  }
  assert.ok(n > 100, "expected over 100 links, got " + n);
});
