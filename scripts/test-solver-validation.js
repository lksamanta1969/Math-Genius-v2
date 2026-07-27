/**
 * Phase 8B.3 — Validation & QA tests
 * Run: node scripts/test-solver-validation.js
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

loadScript("resources/app/js/solver/providers/local-rule-engine/normalize.js");
loadScript("resources/app/js/solver/input-validator.js");
loadScript("resources/app/js/ai-math-solver/question/question-schema.js");
loadScript("resources/app/js/solver/solver-provider-interface.js");
loadScript("resources/app/js/solver/solution-presentation-schema.js");
loadScript("resources/app/js/solver/solution-schema.js");
loadScript("resources/app/js/solver/solver-engine.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/formula-catalog.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/math-utils.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/expression.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/decimal-math.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/numbers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");
loadScript("resources/app/js/solver/ocr-solve-bridge.js");

g.FormulaCatalog.loadFromData(formulaData);
g.SolverEngine.register("local-rule-engine", {
  id: "local-rule-engine",
  label: "Local Rule Engine",
  local: true,
  available: true,
  supportsStreaming: false,
  supportsCancellation: true,
  solve: function (question, options) {
    return g.LocalRuleEngineProvider.solve(
      question,
      Object.assign({}, options || {}, { formulaLibraryData: formulaData })
    );
  }
});
g.SolverEngine.configure({
  solver: { defaultProvider: "local-rule-engine", allowCloudSolver: false }
});

const V = g.SolverInputValidator;
const Bridge = g.OcrSolveBridge;
const C = V.Codes;

const cases = [
  {
    name: "Divide by zero",
    text: "12 / 0",
    expectCode: C.DIVIDE_BY_ZERO
  },
  {
    name: "Invalid OCR text",
    text: "@@@###",
    expectCode: C.INVALID_OCR_TEXT
  },
  {
    name: "Malformed fraction",
    text: "1/",
    expectCode: C.MALFORMED_FRACTION
  },
  {
    name: "Unsupported symbols",
    text: "√16 + 2",
    expectCode: C.UNSUPPORTED_SYMBOLS
  },
  {
    name: "Low confidence OCR",
    text: "12 + 25",
    confidence: 25,
    threshold: 40,
    expectCode: C.LOW_CONFIDENCE,
    checkConfidence: true
  },
  {
    name: "Valid addition still ok",
    text: "12 + 25",
    expectOk: true
  },
  {
    name: "Empty expression",
    text: "   ",
    expectCode: C.EMPTY_EXPRESSION
  },
  {
    name: "Multiple expressions",
    text: "12 + 25\n100 - 37",
    expectCode: C.MULTIPLE_EXPRESSIONS
  }
];

async function run() {
  let passed = 0;
  const results = [];

  cases.forEach(function (c) {
    const r = V.validate(c.text, {
      checkConfidence: !!c.checkConfidence,
      confidence: c.confidence,
      threshold: c.threshold || 40,
      forceSolve: false
    });
    let ok = false;
    if (c.expectOk) {
      ok = r.ok === true;
    } else {
      ok = r.ok === false && r.code === c.expectCode;
    }
    results.push({
      name: c.name,
      ok: ok,
      detail: r.ok ? "ok" : r.code + " — " + r.message
    });
    if (ok) passed += 1;
    else console.error("FAIL validate", c.name, r);
  });

  // Bridge: low confidence must not auto-solve
  const lowQ = {
    id: "low1",
    text: "12 + 25",
    recognizedText: "12 + 25",
    confidence: 20
  };
  const can = Bridge.canAutoSolve(lowQ, {
    limits: { lowConfidenceThreshold: 40 }
  });
  const lowOk = can === false;
  results.push({ name: "canAutoSolve blocks low confidence", ok: lowOk });
  if (lowOk) passed += 1;

  const skipped = await Bridge.solveOne(lowQ, {
    config: { limits: { lowConfidenceThreshold: 40 } },
    forceSolve: false,
    checkConfidence: true
  });
  const skipOk =
    skipped &&
    skipped.error &&
    skipped.error.code === Bridge.ErrorCodes.LOW_CONFIDENCE &&
    /verify the detected question/i.test(skipped.error.message);
  results.push({ name: "solveOne low confidence message", ok: skipOk });
  if (skipOk) passed += 1;

  // forceSolve after verify still works
  const forced = await Bridge.solveOne(lowQ, {
    config: { limits: { lowConfidenceThreshold: 40 } },
    forceSolve: true,
    checkConfidence: false
  });
  const forceOk =
    forced &&
    String(forced.finalAnswer) === "37" &&
    typeof forced.solveDurationMs === "number";
  results.push({ name: "forceSolve after verify", ok: forceOk });
  if (forceOk) passed += 1;

  // Bridge divide by zero
  const div0 = await Bridge.solveOne(
    { id: "d0", text: "8/0", recognizedText: "8/0", confidence: 90 },
    { config: { limits: { lowConfidenceThreshold: 40 } }, forceSolve: true }
  );
  const divOk =
    div0 && div0.error && div0.error.code === Bridge.ErrorCodes.DIVIDE_BY_ZERO;
  results.push({ name: "bridge divide by zero", ok: divOk });
  if (divOk) passed += 1;

  console.log("\n=== Phase 8B.3 Validation Results ===");
  results.forEach(function (r) {
    console.log((r.ok ? "PASS" : "FAIL") + "  " + r.name + (r.detail ? " · " + r.detail : ""));
  });
  const total = cases.length + 4;
  console.log("\n" + passed + "/" + total + " passed");
  if (passed !== total) process.exitCode = 1;
}

run().catch(function (err) {
  console.error(err);
  process.exitCode = 1;
});
