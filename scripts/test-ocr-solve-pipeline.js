/**
 * Phase 8B.2 — OCR → Question Detection → Local Rule Engine pipeline tests.
 * Simulates OCR text output (no Tesseract required in CI).
 *
 * Run: node scripts/test-ocr-solve-pipeline.js
 */
"use strict";

const path = require("path");
const fs = require("fs");

// Minimal browser globals for IIFE modules
const g = global;
g.window = g;
g.document = { createElement: function () { return {}; } };

function loadScript(rel) {
  const full = path.join(__dirname, "..", rel);
  const code = fs.readFileSync(full, "utf8");
  // Run as browser script (no CommonJS module in scope) so UMD picks window branch
  const run = new Function("window", "globalThis", code + "\n//# sourceURL=" + rel);
  run(g, g);
}

const formulaData = require("../resources/app/data/formula-library.json");

loadScript("resources/app/js/ai-math-solver/question/question-schema.js");
loadScript("resources/app/js/ai-math-solver/math-detector.js");
loadScript("resources/app/js/ai-math-solver/math/expression-parser-interface.js");
loadScript("resources/app/js/ai-math-solver/question-detector.js");
loadScript("resources/app/js/solver/solver-provider-interface.js");
loadScript("resources/app/js/solver/solution-presentation-schema.js");
loadScript("resources/app/js/solver/solution-schema.js");
loadScript("resources/app/js/solver/solver-engine.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/formula-catalog.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/math-utils.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/expression.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/normalize.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/numbers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/algebra.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");
loadScript("resources/app/js/solver/ocr-solve-bridge.js");

g.FormulaCatalog.loadFromData(formulaData);
g.FormulaCatalog.mergePack(require("../resources/app/data/formula-algebra-intro.json"));
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

const cases = [
  { text: "12 + 25", expect: "37" },
  { text: "100 − 37", expect: "63" },
  { text: "HCF(18,24)", expect: "6" },
  { text: "1/2 + 1/4", expect: "3/4" }
];

async function run() {
  // Simulate OCR page text with numbered questions (typical worksheet)
  const ocrText = cases
    .map(function (c, i) {
      return i + 1 + ". " + c.text;
    })
    .join("\n");

  console.log("=== Simulated OCR text ===");
  console.log(ocrText);
  console.log("");

  const questions = g.QuestionDetector.detect(ocrText, {
    page: 1,
    confidence: 92,
    language: "eng",
    ocrBlocks: []
  });

  console.log("Detected questions:", questions.length);
  questions.forEach(function (q) {
    console.log(" -", q.id, q.text);
  });

  if (questions.length < cases.length) {
    console.error("FAIL: expected at least", cases.length, "questions");
    process.exitCode = 1;
    return;
  }

  const job = g.OcrSolveBridge.solveAll(questions, {
    config: { limits: { lowConfidenceThreshold: 40 } }
  });

  const solutions = await job.promise;
  let passed = 0;
  const results = [];

  cases.forEach(function (c) {
    const q = questions.find(function (item) {
      return String(item.text || "").indexOf(c.text.replace("−", "-")) >= 0 ||
        String(item.text || "").indexOf(c.text) >= 0 ||
        String(item.text || "")
          .replace(/[−–—]/g, "-")
          .indexOf(c.text.replace(/[−–—]/g, "-")) >= 0;
    });
    const sol = q ? solutions[q.id] : null;
    const ok =
      !!sol &&
      String(sol.finalAnswer) === String(c.expect) &&
      sol.verification === "Verified" &&
      sol.status === "complete";
    results.push({
      name: c.text,
      ok: ok,
      answer: sol && sol.finalAnswer,
      expected: c.expect,
      verification: sol && sol.verification,
      questionId: q && q.id
    });
    if (ok) passed += 1;
  });

  // Error path: empty question
  const emptySol = await g.OcrSolveBridge.solveOne(
    { id: "empty", text: "", recognizedText: "", confidence: 90 },
    { config: { limits: { lowConfidenceThreshold: 40 } } }
  );
  const emptyOk =
    emptySol &&
    emptySol.error &&
    (emptySol.error.code === g.OcrSolveBridge.ErrorCodes.EMPTY_QUESTION ||
      emptySol.error.code === g.OcrSolveBridge.ErrorCodes.EMPTY_EXPRESSION ||
      emptySol.error.code === "Empty expression" ||
      emptySol.error.code === "Empty question");
  results.push({ name: "Empty question error", ok: emptyOk });
  if (emptyOk) passed += 1;

  // Unsupported quadratic via OCR pipeline
  const algQ = g.QuestionDetector.detect("1. x^2 + 3 = 7", {
    page: 2,
    confidence: 90
  })[0];
  const algSol = await g.OcrSolveBridge.solveOne(algQ, {
    config: { limits: { lowConfidenceThreshold: 40 } },
    forceSolve: true
  });
  const algOk =
    algSol &&
    (algSol.status === "unsupported" ||
      (algSol.error &&
        /unsupported/i.test(String(algSol.error.code + algSol.error.message))));
  results.push({ name: "Quadratic unsupported", ok: algOk });
  if (algOk) passed += 1;

  // PDF multi-page: each page → separate questions → separate solutions
  const page1 = g.QuestionDetector.detect("1. 12 + 25", {
    page: 1,
    confidence: 90
  });
  const page2 = g.QuestionDetector.detect("1. HCF(18,24)", {
    page: 2,
    confidence: 90
  });
  const pdfQs = page1.concat(page2);
  const pdfJob = g.OcrSolveBridge.solveAll(pdfQs, {
    config: { limits: { lowConfidenceThreshold: 40 } }
  });
  const pdfSols = await pdfJob.promise;
  const pdfOk =
    pdfQs.length === 2 &&
    String(pdfSols[pdfQs[0].id].finalAnswer) === "37" &&
    String(pdfSols[pdfQs[1].id].finalAnswer) === "6" &&
    pdfQs[0].page === 1 &&
    pdfQs[1].page === 2;
  results.push({ name: "PDF page→question→solution", ok: pdfOk });
  if (pdfOk) passed += 1;

  console.log("\n=== OCR → Solver Pipeline Results ===");
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
