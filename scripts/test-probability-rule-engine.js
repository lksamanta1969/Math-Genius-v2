/**
 * Phase 8F M1 — Classical Probability Rule Engine tests
 * Run: node scripts/test-probability-rule-engine.js
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

loadScript("resources/app/js/curriculum/curriculum-mapper.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/formula-catalog.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/math-utils.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/expression.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/normalize.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/decimal-math.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/numbers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/algebra.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/geometry.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/mensuration.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/probability.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/statistics.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");

g.CurriculumMapper.loadFromData(formulaData);
g.FormulaCatalog.loadFromData(formulaData);

const Pr = g.LocalRuleProbability;
const Handlers = g.LocalRuleHandlers;

const solveCases = [
  {
    name: "Coin head",
    text: "What is the probability of getting a head when a coin is tossed?",
    expect: "1/2",
    formulaId: "CBSE-C7-PR-001",
    op: "probability_single_event"
  },
  {
    name: "Die face 4",
    text: "Find the probability of rolling a 4 on a fair die.",
    expect: "1/6",
    formulaId: "CBSE-C7-PR-001",
    op: "probability_single_event"
  },
  {
    name: "Bag red ball",
    text:
      "A bag contains 3 red and 5 blue balls. What is the probability of drawing a red ball?",
    expect: "3/8",
    formulaId: "CBSE-C7-PR-001",
    op: "probability_single_event"
  },
  {
    name: "Spinner green",
    text:
      "A spinner has 2 red, 3 green and 5 blue sections of equal size. What is the probability of landing on green?",
    expect: "3/10",
    formulaId: "CBSE-C7-PR-001",
    op: "probability_single_event"
  },
  {
    name: "Explicit count",
    text: "3 favorable outcomes out of 8 equally likely outcomes. Find the probability.",
    expect: "3/8",
    formulaId: "CBSE-C7-PR-001",
    op: "probability_single_event"
  },
  {
    name: "Complement die not 6",
    text: "What is the probability of not rolling a 6 on a fair die?",
    expect: "5/6",
    formulaId: "CBSE-C7-PR-002",
    op: "probability_complement"
  },
  {
    name: "Complement coin not head",
    text: "Probability of not getting a head when a fair coin is tossed.",
    expect: "1/2",
    formulaId: "CBSE-C7-PR-002",
    op: "probability_complement"
  }
];

const engineEdgeCases = [
  {
    name: "Engine favorable > total",
    fn: function () {
      return Pr.trySolve("5 favorable outcomes out of 3 equally likely outcomes");
    },
    expectUnsupported: true
  },
  {
    name: "Engine zero total",
    fn: function () {
      return Pr.classify("0 favorable outcomes out of 0 equally likely outcomes");
    },
    expectUnsupported: true
  },
  {
    name: "Engine conditional",
    fn: function () {
      return Pr.trySolve(
        "What is the probability of rain given that it is cloudy?"
      );
    },
    expectUnsupported: true
  },
  {
    name: "Engine two dice",
    fn: function () {
      return Pr.trySolve("Find the probability of sum 7 when rolling two dice");
    },
    expectUnsupported: true
  }
];

const handlerCases = [
  {
    name: "Handler routes coin to probability",
    text: "What is the probability of getting a tail when a coin is tossed?",
    expectType: "probability_single_event"
  },
  {
    name: "Handler keeps mean as statistics",
    text: "Find the mean of the data: 5, 8, 6, 7, 9",
    expectType: "statistics"
  }
];

const unsupportedCases = [
  {
    name: "Malformed probability",
    text: "What is the probability of something unknown?"
  }
];

async function run() {
  let passed = 0;
  let failed = 0;

  console.log("\n=== Probability Rule Engine Results ===\n");

  for (const c of solveCases) {
    const direct = Pr.trySolve(c.text);
    const intent = Handlers.classify(c.text);
    const viaHandler =
      intent && intent.type !== "unsupported"
        ? Handlers.solveIntent(intent)
        : null;
    const sol = await g.LocalRuleEngineProvider.solve(
      {
        id: "pr-" + c.name,
        recognizedText: c.text,
        text: c.text,
        containsMath: true
      },
      { formulaLibraryData: formulaData }
    );

    const catalogIds = g.FormulaCatalog.resolveIdsForOperation(c.op);
    const hasCatalog = catalogIds.indexOf(c.formulaId) >= 0;
    const directOk =
      direct &&
      !direct.unsupported &&
      String(direct.finalAnswer) === c.expect &&
      direct.operationKey === c.op;
    const handlerOk =
      viaHandler &&
      !viaHandler.unsupported &&
      String(viaHandler.finalAnswer) === c.expect;
    const providerOk =
      sol &&
      sol.status === "complete" &&
      String(sol.finalAnswer) === c.expect &&
      sol.verification === "Verified" &&
      Array.isArray(sol.formulaIds) &&
      sol.formulaIds.indexOf(c.formulaId) >= 0;

    const ok = directOk && handlerOk && providerOk && hasCatalog;

    if (ok) {
      passed += 1;
      console.log("PASS  " + c.name + " → " + c.expect);
    } else {
      failed += 1;
      console.log(
        "FAIL  " +
          c.name +
          " direct=" +
          (direct && direct.finalAnswer) +
          " handler=" +
          (viaHandler && viaHandler.finalAnswer) +
          " provider=" +
          (sol && sol.status) +
          "/" +
          (sol && sol.finalAnswer) +
          " catalog=" +
          hasCatalog
      );
    }
  }

  for (const c of engineEdgeCases) {
    const out = c.fn();
    let ok = false;
    if (c.expectUnsupported) {
      ok =
        (out && out.unsupported) ||
        (out && out.type === "unsupported") ||
        (out && out.reason);
    }
    if (ok) {
      passed += 1;
      console.log("PASS  " + c.name);
    } else {
      failed += 1;
      console.log(
        "FAIL  " +
          c.name +
          " — got " +
          JSON.stringify(out && (out.reason || out.finalAnswer || out.type))
      );
    }
  }

  for (const c of handlerCases) {
    const intent = Handlers.classify(c.text);
    const ok = intent && intent.type === c.expectType;
    if (ok) {
      passed += 1;
      console.log("PASS  " + c.name + " → " + c.expectType);
    } else {
      failed += 1;
      console.log(
        "FAIL  " +
          c.name +
          " — type=" +
          (intent && intent.type) +
          " reason=" +
          (intent && intent.reason)
      );
    }
  }

  for (const c of unsupportedCases) {
    const sol = await g.LocalRuleEngineProvider.solve(
      {
        id: "pr-un-" + c.name,
        recognizedText: c.text,
        text: c.text,
        containsMath: true
      },
      { formulaLibraryData: formulaData }
    );
    const ok = sol && sol.status === "unsupported";
    if (ok) {
      passed += 1;
      console.log("PASS  " + c.name);
    } else {
      failed += 1;
      console.log(
        "FAIL  " +
          c.name +
          " — status=" +
          (sol && sol.status) +
          " answer=" +
          (sol && sol.finalAnswer)
      );
    }
  }

  const statsSol = await g.LocalRuleEngineProvider.solve(
    {
      id: "pr-stats-mean",
      recognizedText: "Find the mean of the data: 2, 4, 6",
      text: "Find the mean of the data: 2, 4, 6",
      containsMath: true
    },
    { formulaLibraryData: formulaData }
  );
  if (statsSol && statsSol.status === "complete" && statsSol.finalAnswer === "4") {
    passed += 1;
    console.log("PASS  Statistics mean still works");
  } else {
    failed += 1;
    console.log(
      "FAIL  Statistics mean still works — " +
        (statsSol && statsSol.status) +
        " " +
        (statsSol && statsSol.finalAnswer)
    );
  }

  console.log("\n" + passed + "/" + (passed + failed) + " passed\n");
  if (failed) process.exit(1);
}

run().catch(function (err) {
  console.error(err);
  process.exit(1);
});
