// Developer check: opens every simulation in the catalog, moves every control
// to its extremes, presses every button, and reports errors or NaN readouts.
// Usage: node scripts/check-sims.cjs [filter] [--shots=DIR]
// Needs Playwright (npm i -D playwright && npx playwright install chromium).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "catalog.js"), "utf8"), sandbox);
const catalog = sandbox.window.CATALOG;
const filter = process.argv.slice(2).find((a) => !a.startsWith("--")) || "";
const shotsArg = process.argv.find((a) => a.startsWith("--shots="));
const shots = shotsArg && shotsArg.slice(8);
if (shots) fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  let failures = 0;
  for (const item of catalog.filter((c) => c.id.includes(filter))) {
    const errors = [];
    const onErr = (e) => errors.push(e.message || e.text());
    page.on("pageerror", onErr);
    const onConsole = (m) => m.type() === "error" && errors.push(m.text());
    page.on("console", onConsole);
    const file = path.join(root, item.file);
    if (!fs.existsSync(file.split("?")[0])) errors.push("missing file " + item.file);
    else {
      await page.goto("file://" + path.join(root, item.file.split("?")[0]) + (item.file.includes("?") ? "?" + item.file.split("?")[1] : ""));
      await page.waitForTimeout(900);
      if (shots) await page.screenshot({ path: path.join(shots, item.id + ".png") });
      const ranges = await page.$$("input[type=range]");
      for (const r of ranges) {
        for (const which of ["min", "max", "min"]) {
          await r.evaluate((el, w) => { el.value = el[w]; el.dispatchEvent(new Event("input", { bubbles: true })); }, which);
          await page.waitForTimeout(120);
          const bad = await page.evaluate(() => /NaN|Infinity|undefined/.test(document.querySelector(".readouts")?.innerText || ""));
          if (bad) errors.push(`bad readout after ${which} of a slider`);
        }
      }
      for (const sel of await page.$$("select")) {
        const n = await sel.evaluate((el) => el.options.length);
        for (let i = 0; i < n; i++) { await sel.selectOption({ index: i }); await page.waitForTimeout(80); }
      }
      for (const b of await page.$$("button")) { await b.click(); await page.waitForTimeout(150); }
      await page.waitForTimeout(600);
      const bad = await page.evaluate(() => /NaN|Infinity|undefined/.test(document.querySelector(".readouts")?.innerText || ""));
      if (bad) errors.push("bad readout at end");
    }
    page.off("pageerror", onErr);
    page.off("console", onConsole);
    const uniq = [...new Set(errors)];
    if (uniq.length) failures++;
    console.log(`${uniq.length ? "FAIL" : "ok  "} ${item.id}${uniq.length ? "  -> " + uniq.slice(0, 3).join(" | ") : ""}`);
  }
  await browser.close();
  console.log(failures ? `\n${failures} simulation(s) with problems` : "\nAll simulations passed");
  process.exit(failures ? 1 : 0);
})();
