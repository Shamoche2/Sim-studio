import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { extractHtml } from "../lib/generate.js";
import { createStore } from "../lib/store.js";

test("extractHtml strips markdown fences and commentary", () => {
  const doc = "<!DOCTYPE html><html><body>hi</body></html>";
  assert.equal(extractHtml("```html\n" + doc + "\n```"), doc);
  assert.equal(extractHtml("Here you go:\n" + doc + "\nEnjoy!"), doc);
});

test("extractHtml rejects truncated output", () => {
  assert.equal(extractHtml("<!DOCTYPE html><html><body>cut off"), null);
  assert.equal(extractHtml("no html here"), null);
});

test("store seeds samples, caches by topic and grade, and matches samples", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sims-"));
  const store = createStore(dir, path.join(import.meta.dirname, "..", "samples"));

  assert.equal(store.list().filter((s) => s.sample).length, 2);
  assert.equal(store.findSample("Predator-Prey Populations")?.id, "sample-predator-prey");
  assert.equal(store.findSample("photosynthesis"), null);

  const meta = store.add({ topic: "Photosynthesis", grade: "middle", html: "<html></html>" });
  assert.equal(store.findCached("  photosynthesis ", "middle")?.id, meta.id);
  assert.equal(store.findCached("photosynthesis", "high"), null);
  assert.equal(store.get(meta.id).html, "<html></html>");
});
