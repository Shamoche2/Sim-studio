# Sim Studio

A library of interactive science simulations for physics, chemistry and biology classrooms. Teachers type a topic, press Enter, and the simulation opens instantly.

**Live site: https://sim-stud.netlify.app/**

- **No internet, no API, no installation.** Everything runs in the browser from local files.
- **Made for teaching.** Every simulation has labelled controls with units, live readouts, a "Key idea" summary, and "Try this" experiments for students.
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
