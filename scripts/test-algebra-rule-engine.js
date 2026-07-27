/**
 * Phase 8B.4 — Algebra Rule Engine tests
 * Run: node scripts/test-algebra-rule-engine.js
 */
"use strict";

const path = require("path");
const fs = require("fs");

const g = global;
g.window = g;

function loadScript(rel) {
  const full = path.join(__dirname, "..", rel);
  const code = fs.readFileSync(full, "utf8");
  const run = new Function(
    "window",
    "globalThis",
    code + "\n//# sourceURL=" + rel
  );
  run(g, g);
}

const formulaData = require("../resources/app/data/formula-library.json");
const algebraPack = require("../resources/app/data/formula-algebra-intro.json");

loadScript("resources/app/js/solver/providers/local-rule-engine/formula-catalog.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/math-utils.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/expression.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/normalize.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/decimal-math.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/numbers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/algebra.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");
loadScript("resources/app/js/solver/solution-presentation-schema.js");
loadScript("resources/app/js/solver/solution-schema.js");

g.FormulaCatalog.loadFromData(formulaData);
// Algebra IDs now live in main library (8B.5); seed merge is optional fallback
if (!g.FormulaCatalog.getById("CBSE-C6-AL-007")) {
  g.FormulaCatalog.mergePack(algebraPack);
}

const cases = [
  { name: "x + 5 = 12", text: "x + 5 = 12", expect: "x = 7" },
  { name: "2x = 14", text: "2x = 14", expect: "x = 7" },
  { name: "3x + 4 = 19", text: "3x + 4 = 19", expect: "x = 5" },
  { name: "7 + x = 10", text: "7 + x = 10", expect: "x = 3" },
  { name: "2a + 3a", text: "2a + 3a", expect: "5a" },
  { name: "5m − 2m", text: "5m − 2m", expect: "3m" }
];

async function run() {
  let passed = 0;
  const results = [];

  for (const c of cases) {
    const sol = await g.LocalRuleEngineProvider.solve(
      {
        id: "alg-" + c.name,
        recognizedText: c.text,
        text: c.text,
        containsMath: true,
        equations: [c.text]
      },
      {
        formulaLibraryData: formulaData,
        algebraFormulaData: algebraPack
      }
    );

    const ok =
      sol &&
      sol.status === "complete" &&
      String(sol.finalAnswer) === String(c.expect) &&
      sol.verification === "Verified" &&
      Array.isArray(sol.steps) &&
      sol.steps.length > 0 &&
      Array.isArray(sol.formulaUsed) &&
      sol.formulaUsed.length > 0;

    results.push({
      name: c.name,
      ok: ok,
      answer: sol && sol.finalAnswer,
      expected: c.expect,
      verification: sol && sol.verification,
      formulas: sol && sol.formulaUsed,
      status: sol && sol.status
    });
    if (ok) passed += 1;
    else console.error("FAIL", c.name, sol);
  }

  // Unsupported: quadratic
  const quad = await g.LocalRuleEngineProvider.solve(
    { recognizedText: "x^2 + 5 = 0", text: "x^2 + 5 = 0" },
    { formulaLibraryData: formulaData, algebraFormulaData: algebraPack }
  );
  const quadOk = quad && quad.status === "unsupported";
  results.push({ name: "quadratic unsupported", ok: quadOk, status: quad && quad.status });
  if (quadOk) passed += 1;

  // Unsupported: inequality
  const ineq = await g.LocalRuleEngineProvider.solve(
    { recognizedText: "x + 3 > 10", text: "x + 3 > 10" },
    { formulaLibraryData: formulaData, algebraFormulaData: algebraPack }
  );
  const ineqOk = ineq && ineq.status === "unsupported";
  results.push({ name: "inequality unsupported", ok: ineqOk, status: ineq && ineq.status });
  if (ineqOk) passed += 1;

  // Step pedagogy check for 2x+3=11 style
  const demo = await g.LocalRuleEngineProvider.solve(
    { recognizedText: "2x + 3 = 11", text: "2x + 3 = 11" },
    { formulaLibraryData: formulaData, algebraFormulaData: algebraPack }
  );
  const titles = (demo.steps || []).map(function (s) {
    return s.title;
  }).join(" | ");
  const demoOk =
    demo.finalAnswer === "x = 4" &&
    /Subtract/i.test(titles) &&
    /Divide/i.test(titles);
  results.push({
    name: "2x+3=11 step pedagogy",
    ok: demoOk,
    answer: demo.finalAnswer,
    titles: titles
  });
  if (demoOk) passed += 1;

  console.log("\n=== Algebra Rule Engine Results ===");
  results.forEach(function (r) {
    console.log(
      (r.ok ? "PASS" : "FAIL") +
        "  " +
        r.name +
        (r.answer != null ? " → " + r.answer : "") +
        (r.verification ? " [" + r.verification + "]" : "")
    );
  });
  const total = cases.length + 3;
  console.log("\n" + passed + "/" + total + " passed");
  if (passed !== total) process.exitCode = 1;
}

run().catch(function (err) {
  console.error(err);
  process.exitCode = 1;
});
