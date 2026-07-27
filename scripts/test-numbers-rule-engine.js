/**
 * Phase 9 — Number System Rule Engine tests (Node).
 * Run: node scripts/test-numbers-rule-engine.js
 */
"use strict";

const path = require("path");
const fs = require("fs");
const assert = require("assert");

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

loadScript("resources/app/js/solver/providers/local-rule-engine/formula-catalog.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/math-utils.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/expression.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/normalize.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/numbers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");

g.FormulaCatalog.loadFromData(formulaData);

const Numbers = g.LocalRuleNumbers;
const Handlers = g.LocalRuleHandlers;
const provider = require("../resources/app/js/solver/providers/local-rule-engine/provider");

const directCases = [
  { name: "12 + 25", text: "12 + 25", expect: "37", op: "addition" },
  { name: "100 - 37", text: "100 - 37", expect: "63", op: "subtraction" },
  { name: "18 × 7", text: "18 × 7", expect: "126", op: "multiplication" },
  { name: "144 ÷ 12", text: "144 ÷ 12", expect: "12", op: "division" },
  { name: "HCF(18,24)", text: "HCF(18,24)", expect: 6, op: "hcf" },
  { name: "LCM(12,18)", text: "LCM(12,18)", expect: 36, op: "lcm" },
  { name: "1/2 + 1/4", text: "1/2 + 1/4", expect: "3/4", op: "fraction_add_unlike" },
  { name: "simplify 8/12", text: "simplify 8/12", expect: "2/3", op: "fraction_simplify" },
  { name: "BODMAS", text: "2 + 3 * 4", expect: "14", op: "bodmas" },
  { name: "factors of 24", text: "factors of 24", expectContains: "24", op: "factors" },
  { name: "is 17 prime", text: "is 17 prime", expect: "Prime", op: "prime" },
  { name: "is 14 even", text: "is 14 even", expect: "Even", op: "even_odd" }
];

const unsupportedCases = [
  { name: "ratio rejected", text: "simplify ratio 12:18" },
  { name: "percentage rejected", text: "find 20% of 150" },
  { name: "mixed number rejected", text: "2 1/3 + 1 1/2" }
];

async function runProviderCase(c) {
  const question = {
    id: "t-" + c.name,
    recognizedText: c.text,
    text: c.text,
    containsMath: true,
    equations: [c.text]
  };
  return provider.solve(question, { formulaLibraryData: formulaData });
}

async function run() {
  let passed = 0;
  let total = 0;
  const results = [];

  // Direct module API
  for (const c of directCases) {
    total += 1;
    const intent = Numbers.classify(c.text);
    assert(intent, c.name + " should classify");
    assert.strictEqual(intent.type === c.op || Numbers.isNumberIntent(intent.type), true);

    const sol = Numbers.trySolve(c.text);
    const ok =
      sol &&
      !sol.unsupported &&
      sol.verified !== false &&
      Array.isArray(sol.steps) &&
      sol.steps.length > 0 &&
      (c.expectContains
        ? String(sol.finalAnswer).indexOf(c.expectContains) >= 0
        : String(sol.finalAnswer) === String(c.expect));

    results.push({ name: "Numbers." + c.name, ok: ok, answer: sol.finalAnswer });
    if (ok) passed += 1;
    else console.error("FAIL Numbers." + c.name, { answer: sol.finalAnswer, expected: c.expect });
  }

  // Handlers integration
  for (const c of directCases.slice(0, 7)) {
    total += 1;
    const intent = Handlers.classify(c.text);
    const sol = Handlers.solveIntent(intent);
    const ok =
      sol &&
      !sol.unsupported &&
      (c.expectContains
        ? String(sol.finalAnswer).indexOf(c.expectContains) >= 0
        : String(sol.finalAnswer) === String(c.expect));
    results.push({ name: "Handlers." + c.name, ok: ok, answer: sol.finalAnswer });
    if (ok) passed += 1;
    else console.error("FAIL Handlers." + c.name, { answer: sol.finalAnswer, expected: c.expect });
  }

  // Provider end-to-end
  for (const c of directCases.slice(0, 7)) {
    total += 1;
    const sol = await runProviderCase(c);
    const ok =
      sol.status === "complete" &&
      sol.verification === "Verified" &&
      (c.expectContains
        ? String(sol.finalAnswer).indexOf(c.expectContains) >= 0
        : String(sol.finalAnswer) === String(c.expect));
    results.push({ name: "Provider." + c.name, ok: ok, answer: sol.finalAnswer });
    if (ok) passed += 1;
    else console.error("FAIL Provider." + c.name, { answer: sol.finalAnswer, expected: c.expect, sol });
  }

  // Unsupported future topics
  for (const c of unsupportedCases) {
    total += 1;
    const intent = Handlers.classify(c.text);
    const unsupported = intent.type === "unsupported";
    results.push({ name: c.name, ok: unsupported, status: intent.type });
    if (unsupported) passed += 1;
    else console.error("FAIL " + c.name + " should be unsupported", intent);
  }

  // looksLikeNumbers
  total += 1;
  const looksOk =
    Numbers.looksLikeNumbers("12 + 25") &&
    Numbers.looksLikeNumbers("HCF(6,8)") &&
    !Numbers.looksLikeNumbers("Find the mean of 1,2,3");
  results.push({ name: "looksLikeNumbers", ok: looksOk });
  if (looksOk) passed += 1;
  else console.error("FAIL looksLikeNumbers");

  console.log("\nPhase 9 Number System Engine — test results");
  console.log("Passed:", passed, "/", total);
  results.forEach(function (r) {
    console.log((r.ok ? "  OK" : " FAIL") + "  " + r.name);
  });

  if (passed !== total) {
    process.exit(1);
  }
  console.log("\nAll number system tests passed.");
}

run().catch(function (err) {
  console.error(err);
  process.exit(1);
});
