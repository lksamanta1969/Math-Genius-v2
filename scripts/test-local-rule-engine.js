/**
 * Phase 8B.1 — Local Rule Engine tests (Node).
 * Run: node scripts/test-local-rule-engine.js
 */
"use strict";

const path = require("path");
const assert = require("assert");

const formulaData = require("../resources/app/data/formula-library.json");
const FormulaCatalog = require("../resources/app/js/solver/providers/local-rule-engine/formula-catalog");
const provider = require("../resources/app/js/solver/providers/local-rule-engine/provider");

FormulaCatalog.loadFromData(formulaData);

const cases = [
  { name: "12 + 25", text: "12 + 25", expect: "37" },
  { name: "100 - 37", text: "100 - 37", expect: "63" },
  { name: "18 × 7", text: "18 × 7", expect: "126" },
  { name: "144 ÷ 12", text: "144 ÷ 12", expect: "12" },
  { name: "HCF(18,24)", text: "HCF(18,24)", expect: "6" },
  { name: "LCM(12,18)", text: "LCM(12,18)", expect: "36" },
  { name: "1/2 + 1/4", text: "1/2 + 1/4", expect: "3/4" }
];

async function run() {
  let passed = 0;
  const results = [];

  for (const c of cases) {
    const question = {
      id: "t-" + c.name,
      recognizedText: c.text,
      text: c.text,
      containsMath: true,
      equations: [c.text]
    };
    const sol = await provider.solve(question, {
      formulaLibraryData: formulaData
    });

    const ok =
      String(sol.finalAnswer) === String(c.expect) &&
      sol.status === "complete" &&
      sol.verification === "Verified" &&
      Array.isArray(sol.steps) &&
      sol.steps.length > 0 &&
      Array.isArray(sol.formulaUsed);

    results.push({
      name: c.name,
      ok: ok,
      answer: sol.finalAnswer,
      expected: c.expect,
      verification: sol.verification,
      steps: sol.steps.length,
      formulas: sol.formulaUsed
    });

    if (ok) passed += 1;
    else {
      console.error("FAIL", c.name, {
        answer: sol.finalAnswer,
        expected: c.expect,
        status: sol.status,
        verification: sol.verification,
        sol: sol
      });
    }
  }

  // Safety: advanced algebra must be unsupported (never guess)
  const algebra = await provider.solve(
    { recognizedText: "x^2 + 3 = 7", containsMath: true, equations: ["x^2+3=7"] },
    { formulaLibraryData: formulaData }
  );
  const algebraOk = algebra.status === "unsupported";
  results.push({ name: "quadratic rejected", ok: algebraOk, status: algebra.status });
  if (algebraOk) passed += 1;
  else console.error("FAIL quadratic should be unsupported", algebra);

  console.log("\n=== Local Rule Engine Test Results ===");
  results.forEach(function (r) {
    console.log(
      (r.ok ? "PASS" : "FAIL") +
        "  " +
        r.name +
        (r.answer != null ? " → " + r.answer : "") +
        (r.verification ? " [" + r.verification + "]" : "")
    );
  });
  console.log(
    "\n" + passed + "/" + (cases.length + 1) + " passed"
  );

  if (passed !== cases.length + 1) {
    process.exitCode = 1;
  }
}

run().catch(function (err) {
  console.error(err);
  process.exitCode = 1;
});
