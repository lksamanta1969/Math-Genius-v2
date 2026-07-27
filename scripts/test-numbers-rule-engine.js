/**
 * Phase 9 — Number System Rule Engine tests (Node).
 * Milestone 1: arithmetic / fractions / HCF-LCM
 * Milestone 2: integers (ops, absolute value, compare, order)
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

const integerCases = [
  { name: "int add -5+8", text: "-5 + 8", expect: "3", opKey: "integer_addition" },
  { name: "int add (-2)+6", text: "(-2)+6", expect: "4", opKey: "integer_addition" },
  { name: "int sub -12-7", text: "-12 - 7", expect: "-19", opKey: "integer_subtraction" },
  { name: "int sub 5-8", text: "5 - 8", expect: "-3", opKey: "subtraction" },
  { name: "int mul -3×9", text: "-3 × 9", expect: "-27", opKey: "integer_multiplication" },
  { name: "int mul (-4)×(-5)", text: "(-4)*(-5)", expect: "20", opKey: "integer_multiplication" },
  { name: "int div -18÷6", text: "-18 ÷ 6", expect: "-3", opKey: "integer_division" },
  { name: "int div (-20)/(-4)", text: "(-20)/(-4)", expect: "5", opKey: "integer_division" },
  { name: "abs of -25", text: "absolute value of -25", expect: 25, opKey: "absolute_value" },
  { name: "abs bars |-7|", text: "|-7|", expect: 7, opKey: "absolute_value" },
  { name: "abs of 0", text: "absolute value of 0", expect: 0, opKey: "absolute_value" },
  { name: "abs of 15", text: "absolute value of 15", expect: 15, opKey: "absolute_value" },
  { name: "compare -4 and 7", text: "compare -4 and 7", expect: "-4 < 7", opKey: "integer_compare" },
  { name: "compare 9 and -2", text: "compare 9 and -2", expect: "9 > -2", opKey: "integer_compare" },
  { name: "compare equals", text: "compare -3 and -3", expect: "-3 = -3", opKey: "integer_compare" },
  {
    name: "order ascending",
    text: "arrange -3, 5, -9, 2 in ascending order",
    expect: "-9, -3, 2, 5",
    opKey: "integer_order"
  },
  {
    name: "order descending",
    text: "arrange -3, 5, -9, 2 in descending order",
    expect: "5, 2, -3, -9",
    opKey: "integer_order"
  },
  { name: "zero + negative", text: "0 + (-5)", expect: "-5", opKey: "integer_addition" },
  { name: "zero product", text: "-7 * 0", expect: "0", opKey: "integer_multiplication" },
  { name: "positive integers still work", text: "4 + 9", expect: "13", opKey: "addition" }
];

const integerEdgeCases = [
  {
    name: "div by zero unsupported",
    text: "-8 / 0",
    expectUnsupported: true
  },
  {
    name: "order needs two numbers",
    text: "arrange 5 in ascending order",
    expectUnsupported: true
  }
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

function checkAnswer(sol, c) {
  if (c.expectContains) {
    return String(sol.finalAnswer).indexOf(c.expectContains) >= 0;
  }
  return String(sol.finalAnswer) === String(c.expect);
}

async function run() {
  let passed = 0;
  let total = 0;
  const results = [];

  function mark(name, ok, extra) {
    results.push(Object.assign({ name: name, ok: ok }, extra || {}));
    if (ok) passed += 1;
    else console.error("FAIL", name, extra || {});
  }

  // Milestone 1 — Direct module API
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
      checkAnswer(sol, c);
    mark("Numbers." + c.name, ok, { answer: sol && sol.finalAnswer, expected: c.expect });
  }

  // Milestone 1 — Handlers integration
  for (const c of directCases.slice(0, 7)) {
    total += 1;
    const intent = Handlers.classify(c.text);
    const sol = Handlers.solveIntent(intent);
    const ok = sol && !sol.unsupported && checkAnswer(sol, c);
    mark("Handlers." + c.name, ok, { answer: sol && sol.finalAnswer, expected: c.expect });
  }

  // Milestone 1 — Provider end-to-end
  for (const c of directCases.slice(0, 7)) {
    total += 1;
    const sol = await runProviderCase(c);
    const ok =
      sol.status === "complete" &&
      sol.verification === "Verified" &&
      checkAnswer(sol, c);
    mark("Provider." + c.name, ok, { answer: sol.finalAnswer, expected: c.expect });
  }

  // Milestone 2 — Integer cases
  for (const c of integerCases) {
    total += 1;
    const sol = Numbers.trySolve(c.text);
    const ok =
      sol &&
      !sol.unsupported &&
      sol.verified !== false &&
      Array.isArray(sol.steps) &&
      sol.steps.length > 0 &&
      checkAnswer(sol, c) &&
      (c.opKey ? sol.operationKey === c.opKey : true);
    mark("Integer." + c.name, ok, {
      answer: sol && sol.finalAnswer,
      expected: c.expect,
      opKey: sol && sol.operationKey
    });
  }

  // Milestone 2 — Handlers + Provider for key integer examples
  const integerProviderCases = integerCases.slice(0, 7);
  for (const c of integerProviderCases) {
    total += 1;
    const intent = Handlers.classify(c.text);
    const sol = Handlers.solveIntent(intent);
    const ok = sol && !sol.unsupported && checkAnswer(sol, c);
    mark("Handlers.Integer." + c.name, ok, {
      answer: sol && sol.finalAnswer,
      expected: c.expect
    });
  }

  for (const c of integerProviderCases) {
    total += 1;
    const sol = await runProviderCase(c);
    const ok =
      sol.status === "complete" &&
      sol.verification === "Verified" &&
      checkAnswer(sol, c);
    mark("Provider.Integer." + c.name, ok, {
      answer: sol.finalAnswer,
      expected: c.expect,
      formulas: sol.formulaUsed
    });
  }

  // Formula IDs for absolute value
  total += 1;
  {
    const sol = await runProviderCase({
      name: "abs-formula",
      text: "absolute value of -25"
    });
    const ids = (sol.formulaIds || []).concat(
      (sol.formulaUsed || []).map(function (f) {
        return f && (f.formulaId || f.id);
      })
    );
    const ok =
      sol.status === "complete" &&
      String(sol.finalAnswer) === "25" &&
      ids.indexOf("CBSE-C6-AR-022") >= 0;
    mark("Provider.absolute_value formula ID", ok, { ids: ids, answer: sol.finalAnswer });
  }

  // Edge cases
  for (const c of integerEdgeCases) {
    total += 1;
    const sol = Numbers.trySolve(c.text);
    const ok = !!(sol && sol.unsupported);
    mark("Edge." + c.name, ok, { sol: sol });
  }

  // Unsupported future topics
  for (const c of unsupportedCases) {
    total += 1;
    const intent = Handlers.classify(c.text);
    const unsupported = intent.type === "unsupported";
    mark(c.name, unsupported, { status: intent.type });
  }

  // looksLikeNumbers
  total += 1;
  const looksOk =
    Numbers.looksLikeNumbers("12 + 25") &&
    Numbers.looksLikeNumbers("HCF(6,8)") &&
    Numbers.looksLikeNumbers("-5 + 8") &&
    Numbers.looksLikeNumbers("absolute value of -25") &&
    Numbers.looksLikeNumbers("compare -4 and 7") &&
    Numbers.looksLikeNumbers("arrange -3, 5, -9, 2 in ascending order") &&
    !Numbers.looksLikeNumbers("Find the mean of 1,2,3");
  mark("looksLikeNumbers", looksOk);

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
