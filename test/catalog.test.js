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
