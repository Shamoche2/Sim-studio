import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSimulation, hasCredentials, GRADES, UserFacingError } from "./lib/generate.js";
import { createStore } from "./lib/store.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const store = createStore(process.env.DATA_DIR || path.join(here, "data"), path.join(here, "samples"));
const app = express();

// Generated pages may run scripts and draw, but can't reach the network or the app's origin.
export const SIM_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:";

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(here, "public")));

app.get("/api/status", (req, res) => {
  res.json({ aiEnabled: hasCredentials(), grades: Object.keys(GRADES) });
});

app.get("/api/library", (req, res) => {
  res.json(store.list());
});

app.get("/api/sims/:id", (req, res) => {
  const sim = store.get(req.params.id);
  if (!sim) return res.status(404).json({ error: "Simulation not found" });
  res.json(sim);
});

// Shareable full-screen link for students.
app.get("/sim/:id", (req, res) => {
  const sim = store.get(req.params.id);
  if (!sim) return res.status(404).send("Simulation not found");
  res.set("Content-Security-Policy", `${SIM_CSP}; sandbox allow-scripts`);
  res.type("html").send(sim.html);
});

/**
 * Body: { topic, grade, force?, baseId?, change? }
 * Replies with newline-delimited JSON events:
 *   {type:"progress", chars} ... then {type:"done", sim, cached?, demo?} or {type:"error", message}
 */
app.post("/api/generate", async (req, res) => {
  const topic = String(req.body?.topic ?? "").trim().slice(0, 300);
  const grade = GRADES[req.body?.grade] ? req.body.grade : "high";
  const change = String(req.body?.change ?? "").trim().slice(0, 1000);
  const base = req.body?.baseId ? store.get(req.body.baseId) : null;

  res.type("application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  const send = (event) => res.write(JSON.stringify(event) + "\n");

  if (!topic && !base) {
    send({ type: "error", message: "Please type a topic first." });
    return res.end();
  }

  if (!change && !req.body?.force) {
    const cached = store.findCached(topic, grade);
    if (cached) {
      send({ type: "done", sim: cached, cached: true });
      return res.end();
    }
  }

  if (!hasCredentials()) {
    const sample = !change && store.findSample(topic);
    if (sample) {
      send({ type: "done", sim: sample, demo: true });
    } else {
      send({
        type: "error",
        message:
          "AI generation isn't connected yet (no API key). In demo mode, try a sample topic: projectile motion or predator-prey populations.",
      });
    }
    return res.end();
  }

  const abort = new AbortController();
  res.on("close", () => {
    if (!res.writableFinished) abort.abort();
  });

  try {
    const result = await generateSimulation({
      topic: base ? base.meta.topic : topic,
      grade: base ? base.meta.grade : grade,
      previousHtml: base && change ? base.html : undefined,
      changeRequest: base && change ? change : undefined,
      signal: abort.signal,
      onProgress: (chars) => send({ type: "progress", chars }),
    });
    const sim = store.add({
      topic: base ? base.meta.topic : topic,
      grade: base ? base.meta.grade : grade,
      html: result.html,
      parentId: base?.meta.id ?? null,
      change: change || null,
      model: result.model,
    });
    console.log(`Generated ${sim.id} (${result.usage.input_tokens} in / ${result.usage.output_tokens} out tokens)`);
    send({ type: "done", sim });
  } catch (err) {
    if (abort.signal.aborted) return;
    console.error(err);
    send({
      type: "error",
      message: err instanceof UserFacingError ? err.message : "Something went wrong while generating. Please try again.",
    });
  }
  res.end();
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Sim generator running at http://localhost:${port}`);
  if (!hasCredentials()) {
    console.log("No ANTHROPIC_API_KEY found: running in demo mode with the built-in sample simulations.");
  }
});
