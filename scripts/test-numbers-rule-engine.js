/**
 * Phase 9 — Number System Rule Engine tests (Node).
 * Milestone 1: arithmetic / fractions / HCF-LCM
 * Milestone 2: integers (ops, absolute value, compare, order)
 * Milestone 3: decimals (ops, compare, order, round, place value, conversions)
 * Milestone 4: advanced decimal arithmetic (precision, arbitrary length, sci notation)
 * Milestone 5: ratio, proportion, percentage, advanced fractions, mixed numbers
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
loadScript("resources/app/js/solver/providers/local-rule-engine/decimal-math.js");
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

const decimalCases = [
  { name: "dec add", text: "2.5 + 1.75", expect: "4.25", opKey: "decimal_addition" },
  { name: "dec sub", text: "8.2 - 3.45", expect: "4.75", opKey: "decimal_subtraction" },
  { name: "dec mul", text: "1.5 × 2", expect: "3", opKey: "decimal_multiplication" },
  { name: "dec div", text: "7.5 ÷ 2.5", expect: "3", opKey: "decimal_division" },
  {
    name: "dec compare",
    text: "compare 2.35 and 2.305",
    expect: "2.35 > 2.305",
    opKey: "decimal_compare"
  },
  {
    name: "dec order asc",
    text: "arrange 2.5, 1.75, 3.1 in ascending order",
    expect: "1.75, 2.5, 3.1",
    opKey: "decimal_order"
  },
  {
    name: "dec order desc",
    text: "arrange 2.5, 1.75, 3.1 in descending order",
    expect: "3.1, 2.5, 1.75",
    opKey: "decimal_order"
  },
  {
    name: "dec to fraction 0.25",
    text: "convert 0.25 to fraction",
    expect: "1/4",
    opKey: "decimal_to_fraction"
  },
  {
    name: "dec to fraction 0.5",
    text: "convert 0.5 to fraction",
    expect: "1/2",
    opKey: "decimal_to_fraction"
  },
  {
    name: "fraction to decimal 3/4",
    text: "convert 3/4 to decimal",
    expect: "0.75",
    opKey: "fraction_to_decimal"
  },
  {
    name: "round 2 dp",
    text: "round 2.678 to 2 decimal places",
    expect: "2.68",
    opKey: "decimal_round"
  },
  {
    name: "round 1 dp",
    text: "round 2.678 to 1 decimal place",
    expect: "2.7",
    opKey: "decimal_round"
  },
  {
    name: "round whole",
    text: "round 2.678 to nearest whole",
    expect: "3",
    opKey: "decimal_round"
  },
  {
    name: "place value thousandths",
    text: "place value of 5 in 12.345",
    expect: "0.005",
    opKey: "decimal_place_value"
  },
  {
    name: "place value tenths",
    text: "place value of 3 in 12.345",
    expect: "0.3",
    opKey: "decimal_place_value"
  }
];

const decimalEdgeCases = [
  { name: "decimal div by zero", text: "2.5 / 0", expectUnsupported: true },
  {
    name: "non-terminating fraction",
    text: "convert 1/3 to decimal",
    expectUnsupported: true
  },
  {
    name: "digit missing place value",
    text: "place value of 9 in 12.345",
    expectUnsupported: true
  }
];

const advancedDecimalCases = [
  { name: "float trap 0.1+0.2", text: "0.1 + 0.2", expect: "0.3", opKey: "decimal_addition" },
  { name: "neg decimal add", text: "-2.5 + 1.25", expect: "-1.25", opKey: "decimal_addition" },
  { name: "neg decimal sub", text: "-8.5 - 1.25", expect: "-9.75", opKey: "decimal_subtraction" },
  { name: "neg decimal mul", text: "-1.5 × 2.4", expect: "-3.6", opKey: "decimal_multiplication" },
  { name: "neg decimal div", text: "-9.6 ÷ 3.2", expect: "-3", opKey: "decimal_division" },
  { name: "leading zeros", text: "00.50 + 0.25", expect: "0.75", opKey: "decimal_addition" },
  { name: "trailing zeros", text: "1.2500 + 2.7500", expect: "4", opKey: "decimal_addition" },
  {
    name: "large values",
    text: "999999999999.999 + 0.001",
    expect: "1000000000000",
    opKey: "decimal_addition"
  },
  {
    name: "small values",
    text: "0.000001 × 0.000001",
    expect: "0.000000000001",
    opKey: "decimal_multiplication"
  },
  { name: "mixed int/decimal", text: "12 + 0.75", expect: "12.75", opKey: "decimal_addition" },
  {
    name: "div precision 4",
    text: "1 ÷ 3 to 4 decimal places",
    expect: "0.3333",
    opKey: "decimal_division"
  },
  {
    name: "div precision 3 half-up",
    text: "22 ÷ 7 to 3 decimal places",
    expect: "3.143",
    opKey: "decimal_division"
  },
  {
    name: "divide by wording",
    text: "divide 2 by 3 correct to 2 decimal places",
    expect: "0.67",
    opKey: "decimal_division"
  },
  {
    name: "sci notation add",
    text: "1.5e2 + 2.5e1",
    expect: "175",
    opKey: "decimal_addition"
  },
  {
    name: "sci notation small",
    text: "2.5e-2 + 1.5e-2",
    expect: "0.04",
    opKey: "decimal_addition"
  },
  {
    name: "round half-up 5",
    text: "round 2.5 to nearest whole",
    expect: "3",
    opKey: "decimal_round"
  },
  {
    name: "round advanced value",
    text: "round 3.14159 to 4 decimal places",
    expect: "3.1416",
    opKey: "decimal_round"
  },
  {
    name: "add then round wording",
    text: "1.234 + 2.345 to 2 decimal places",
    expect: "3.58",
    opKey: "decimal_addition"
  }
];

const advancedDecimalEdgeCases = [
  { name: "invalid decimal format", text: "1.2.3 + 4", expectUnsupported: true },
  { name: "precision div by zero", text: "5 ÷ 0 to 2 decimal places", expectUnsupported: true }
];

const advancedFractionCases = [
  { name: "fraction mul 2/3*4/5", text: "2/3*4/5", expect: "8/15", opKey: "fraction_mul" },
  { name: "fraction div 2/3/4/5", text: "2/3/4/5", expect: "5/6", opKey: "fraction_div" },
  { name: "mixed to improper", text: "convert 2 1/3 to improper fraction", expect: "7/3", opKey: "mixed_number_convert" },
  { name: "improper to mixed", text: "convert 14/3 to mixed number", expect: "4 2/3", opKey: "mixed_number_convert" },
  { name: "mixed add", text: "2 1/3 + 1 1/2", expect: "3 5/6", opKey: "mixed_number_binary" },
  { name: "mixed sub", text: "3 1/2 - 1 1/4", expect: "2 1/4", opKey: "mixed_number_binary" }
];

const ratioProportionCases = [
  { name: "ratio simplify", text: "simplify ratio 12:18", expect: "2:3", opKey: "ratio_simplify", formulaId: "CBSE-C7-CQ-001" },
  { name: "ratio three terms", text: "simplify ratio 12:18:24", expect: "2:3:4", opKey: "ratio_simplify", formulaId: "CBSE-C7-CQ-001" },
  { name: "proportion colon", text: "2:3 = x:12 find x", expect: "8", opKey: "proportion_solve", formulaId: "CBSE-C7-CQ-002" },
  { name: "proportion fraction", text: "2/3 = x/12 find x", expect: "8", opKey: "proportion_solve", formulaId: "CBSE-C7-CQ-002" },
  { name: "proportion unknown denom", text: "3:4 = 9:x find x", expect: "12", opKey: "proportion_solve", formulaId: "CBSE-C7-CQ-002" }
];

const percentageCases = [
  { name: "percent of", text: "find 20% of 150", expect: "30", opKey: "percentage_of", formulaId: "CBSE-C7-AR-005" },
  { name: "percent of wording", text: "25% of 80", expect: "20", opKey: "percentage_of", formulaId: "CBSE-C7-AR-005" },
  { name: "what percent", text: "30 is what percent of 150", expect: "20%", opKey: "percentage_find", formulaId: "CBSE-C7-AR-005" },
  { name: "what percent alt", text: "what percent is 15 of 60", expect: "25%", opKey: "percentage_find", formulaId: "CBSE-C7-AR-005" },
  { name: "percent to fraction", text: "convert 25% to fraction", expect: "1/4", opKey: "percentage_convert", formulaId: "CBSE-C7-AR-005" },
  { name: "percent to decimal", text: "convert 25% to decimal", expect: "0.25", opKey: "percentage_convert", formulaId: "CBSE-C7-AR-005" },
  { name: "decimal to percent", text: "convert 0.75 to percent", expect: "75%", opKey: "percentage_convert", formulaId: "CBSE-C7-AR-005" },
  { name: "fraction to percent", text: "convert 3/4 to percent", expect: "75%", opKey: "percentage_convert", formulaId: "CBSE-C7-AR-005" }
];

const milestone5EdgeCases = [
  { name: "proportion two unknowns", text: "x:3 = y:12", expectUnsupported: true },
  { name: "percent of zero base", text: "20% of 0", expect: "0", opKey: "percentage_of" },
  { name: "fraction div by zero", text: "2/3/0/5", expectUnsupported: true }
];

const unsupportedCases = [
  { name: "simple interest rejected", text: "find simple interest P=1000 R=5 T=2" }
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

function collectFormulaIds(sol) {
  return (sol.formulaIds || []).concat(
    (sol.formulaUsed || []).map(function (f) {
      return f && (f.formulaId || f.id);
    })
  );
}

function catalogMapsTo(opKey, formulaId) {
  return g.FormulaCatalog.resolveIdsForOperation(opKey).indexOf(formulaId) >= 0;
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

  // Milestone 3 — Decimal cases
  for (const c of decimalCases) {
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
    mark("Decimal." + c.name, ok, {
      answer: sol && sol.finalAnswer,
      expected: c.expect,
      opKey: sol && sol.operationKey
    });
  }

  const decimalProviderCases = decimalCases.slice(0, 6);
  for (const c of decimalProviderCases) {
    total += 1;
    const intent = Handlers.classify(c.text);
    const sol = Handlers.solveIntent(intent);
    const ok = sol && !sol.unsupported && checkAnswer(sol, c);
    mark("Handlers.Decimal." + c.name, ok, {
      answer: sol && sol.finalAnswer,
      expected: c.expect
    });
  }

  for (const c of decimalProviderCases) {
    total += 1;
    const sol = await runProviderCase(c);
    const ok =
      sol.status === "complete" &&
      sol.verification === "Verified" &&
      checkAnswer(sol, c);
    mark("Provider.Decimal." + c.name, ok, {
      answer: sol.finalAnswer,
      expected: c.expect
    });
  }

  // Milestone 4 — Advanced decimal arithmetic
  for (const c of advancedDecimalCases) {
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
    mark("AdvDecimal." + c.name, ok, {
      answer: sol && sol.finalAnswer,
      expected: c.expect,
      opKey: sol && sol.operationKey,
      reason: sol && sol.reason
    });
  }

  for (const c of advancedDecimalCases.slice(0, 5)) {
    total += 1;
    const sol = await runProviderCase(c);
    const ok =
      sol.status === "complete" &&
      sol.verification === "Verified" &&
      checkAnswer(sol, c);
    mark("Provider.AdvDecimal." + c.name, ok, {
      answer: sol.finalAnswer,
      expected: c.expect
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

  // Formula IDs for decimal → fraction
  total += 1;
  {
    const sol = await runProviderCase({
      name: "dec-frac-formula",
      text: "convert 0.25 to fraction"
    });
    const ids = (sol.formulaIds || []).concat(
      (sol.formulaUsed || []).map(function (f) {
        return f && (f.formulaId || f.id);
      })
    );
    const ok =
      sol.status === "complete" &&
      String(sol.finalAnswer) === "1/4" &&
      ids.indexOf("CBSE-C6-AR-017") >= 0;
    mark("Provider.decimal_to_fraction formula ID", ok, { ids: ids, answer: sol.finalAnswer });
  }

  // Milestone 5 — Advanced fractions, ratio, proportion, percentage
  for (const c of advancedFractionCases.concat(ratioProportionCases, percentageCases)) {
    total += 1;
    const sol = Numbers.trySolve(c.text);
    const catalogOk =
      c.formulaId && c.opKey ? catalogMapsTo(c.opKey, c.formulaId) : true;
    const ok =
      sol &&
      !sol.unsupported &&
      sol.verified !== false &&
      Array.isArray(sol.steps) &&
      sol.steps.length > 0 &&
      checkAnswer(sol, c) &&
      (c.opKey ? sol.operationKey === c.opKey : true) &&
      catalogOk;
    mark("M5." + c.name, ok, {
      answer: sol && sol.finalAnswer,
      expected: c.expect,
      opKey: sol && sol.operationKey,
      formulaId: c.formulaId,
      catalogOk: catalogOk
    });
  }

  const m5ProviderCases = advancedFractionCases.slice(0, 3)
    .concat(ratioProportionCases.slice(0, 2))
    .concat(percentageCases.slice(0, 3));
  for (const c of m5ProviderCases) {
    total += 1;
    const sol = await runProviderCase(c);
    const ids = collectFormulaIds(sol);
    const formulaOk = c.formulaId ? ids.indexOf(c.formulaId) >= 0 : true;
    const ok =
      sol.status === "complete" &&
      sol.verification === "Verified" &&
      checkAnswer(sol, c) &&
      formulaOk;
    mark("Provider.M5." + c.name, ok, {
      answer: sol.finalAnswer,
      expected: c.expect,
      formulas: sol.formulaIds,
      formulaId: c.formulaId
    });
  }

  const formulaIdCases = [
    {
      name: "ratio formula ID",
      text: "simplify ratio 12:18",
      expect: "2:3",
      formulaId: "CBSE-C7-CQ-001",
      opKey: "ratio_simplify"
    },
    {
      name: "proportion formula ID",
      text: "2:3 = x:12 find x",
      expect: "8",
      formulaId: "CBSE-C7-CQ-002",
      opKey: "proportion_solve"
    },
    {
      name: "percentage formula ID",
      text: "find 20% of 150",
      expect: "30",
      formulaId: "CBSE-C7-AR-005",
      opKey: "percentage_of"
    }
  ];
  for (const c of formulaIdCases) {
    total += 1;
    const sol = await runProviderCase(c);
    const ids = collectFormulaIds(sol);
    const ok =
      sol.status === "complete" &&
      checkAnswer(sol, c) &&
      catalogMapsTo(c.opKey, c.formulaId) &&
      ids.indexOf(c.formulaId) >= 0;
    mark("Provider." + c.name, ok, { ids: ids, answer: sol.finalAnswer });
  }

  // Milestone 5 edge cases
  for (const c of milestone5EdgeCases) {
    total += 1;
    const sol = Numbers.trySolve(c.text);
    if (c.expectUnsupported) {
      mark("Edge.M5." + c.name, !!(sol && sol.unsupported), { sol: sol });
    } else {
      const ok =
        sol &&
        !sol.unsupported &&
        checkAnswer(sol, c) &&
        (c.opKey ? sol.operationKey === c.opKey : true);
      mark("Edge.M5." + c.name, ok, { answer: sol && sol.finalAnswer, expected: c.expect });
    }
  }

  // Edge cases
  for (const c of integerEdgeCases
    .concat(decimalEdgeCases)
    .concat(advancedDecimalEdgeCases)) {
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
    Numbers.looksLikeNumbers("2.5 + 1.75") &&
    Numbers.looksLikeNumbers("convert 0.25 to fraction") &&
    Numbers.looksLikeNumbers("round 2.678 to 2 decimal places") &&
    Numbers.looksLikeNumbers("place value of 5 in 12.345") &&
    Numbers.looksLikeNumbers("1 ÷ 3 to 4 decimal places") &&
    Numbers.looksLikeNumbers("1.5e2 + 2.5e1") &&
    Numbers.looksLikeNumbers("simplify ratio 12:18") &&
    Numbers.looksLikeNumbers("find 20% of 150") &&
    Numbers.looksLikeNumbers("2:3 = x:12 find x") &&
    Numbers.looksLikeNumbers("2 1/3 + 1 1/2") &&
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
