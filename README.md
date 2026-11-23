# Sim Studio

A library of interactive science simulations for physics, chemistry and biology classrooms. Teachers type a topic, press Enter, and the simulation opens instantly.

**Live site: https://sim-stud.netlify.app/**

- **No internet, no API, no installation.** Everything runs in the browser from local files.
- **Made for teaching.** Every simulation has step-by-step "How to use" directions, labelled controls with units, live readouts, a "Key idea" summary, and "Try this" experiments for students. All directions are collected in a printable [Teacher guide](https://sim-stud.netlify.app/guide.html).
- **Works on projectors and phones.**

## Use it

**Easiest:** download the repository (Code → Download ZIP), unzip it, and double-click `index.html`.

**Share with students on the same Wi-Fi** (needs [Node.js](https://nodejs.org) 22+):

```bash
npm start          # prints a link students can open, e.g. http://192.168.1.20:8080
```

**Put it online for free:** any static host works, for example Netlify or Cloudflare Pages (drag and drop the folder). GitHub Pages also works, but needs a public repository or a paid GitHub plan.

## What's inside

| Path | What it is |
|---|---|
| `index.html` | The library: search, subject tabs, viewer |
| `catalog.js` | List of every simulation (title, keywords, summary) |
| `sims/kit/` | Shared toolkit: page layout, controls, animation loop, charts, particle engine |
| `sims/<subject>/<topic>.js` | One file per simulation, opened through `sims/view.html?sim=<subject>/<topic>` |
| `sims/labs/<subject>/<lab>.js` | 18 virtual labs (results table, graph, calculations, questions), opened through `sims/view.html?lab=<subject>/<lab>` |
| `sims/tools/` | Learning tools: digital human body, molecule builder, formula helper |
| `labs-tools.js` | List of labs and tools for the library's "Virtual labs & tools" tab and the teacher guide |
| `sims/extras.js` | "More ways to learn" links from each topic to its lab and tools |
| `sims/kit/support.js` | Learning Support bar on every page: read aloud, simple words, guided steps, easy reading, focus, slow motion |
| `sims/howto/`, `sims/easy/` | Step-by-step directions and simple-word summaries for every topic |

## Add a virtual lab

1. Create `sims/labs/<subject>/<lab>.js` using `Lab({...})` (see `sims/kit/lab.js` for the options). Copy an existing lab.
2. Add it to `labs-tools.js` and link it to topics in `sims/extras.js`.
3. Run `node scripts/build-lab-methods.cjs` to update the teacher guide, then `npm test` and `npm run check labs`.

## Add a simulation

1. Create `sims/<subject>/<topic>.js` using `Sim({...})`. Copy an existing simulation as a starting point.
2. Add a line for it to `catalog.js`.
3. Run the checks:

```bash
npm test           # catalog and files match
npm run check      # opens every simulation in a browser, moves every control, reports errors
                   # (needs: npm i -D playwright && npx playwright install chromium)
```

## Accuracy

Simulations use standard textbook models and are simplified for teaching. Simplifications are stated on each page. Please report anything that looks wrong.
