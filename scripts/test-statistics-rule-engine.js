/**
 * Phase 8E — Data Handling & Statistics Rule Engine tests
 * Run: node scripts/test-statistics-rule-engine.js
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
loadScript("resources/app/js/solver/providers/local-rule-engine/algebra.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/geometry.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/mensuration.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/statistics.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");

g.CurriculumMapper.loadFromData(formulaData);
g.FormulaCatalog.loadFromData(formulaData);

const cases = [
  {
    name: "Mean",
    text: "Find the mean of the data: 5, 8, 6, 7, 9",
    expect: "7",
    formulaId: "CBSE-C7-ST-001"
  },
  {
    name: "Median",
    text: "Find the median of 3, 8, 5, 2, 9",
    expect: "5",
    formulaId: "CBSE-C7-ST-003"
  },
  {
    name: "Mode",
    text: "Find the mode of 2, 3, 2, 5, 2, 4",
    expect: "2",
    formulaId: "CBSE-C7-ST-004"
  },
  {
    name: "Range",
    text: "Find the range of the data 3, 8, 5, 12, 7",
    expect: "9",
    formulaId: "CBSE-C7-ST-002"
  },
  {
    name: "Frequency Table",
    text: "Make a frequency table for the data: 2, 3, 2, 2, 5",
    expectContains: "2: 3",
    formulaId: "CBSE-C6-DH-001"
  },
  {
    name: "Bar Graph Interpretation",
    text:
      "In a bar graph, 1 unit = 10 students. The bar for Class 6 has height 4 units. How many students?",
    expect: "40",
    formulaId: "CBSE-C6-DH-003"
  },
  {
    name: "Pictograph",
    text: "In a pictograph, 1 symbol = 5 books. There are 7 symbols. How many books?",
    expect: "35",
    formulaId: "CBSE-C6-DH-002"
  }
];

const unsupportedCases = [
  {
    name: "Unsupported Probability",
    text: "What is the probability of getting a head when a coin is tossed?"
  },
  {
    name: "Unsupported variance",
    text: "Find the variance of the data 2, 4, 6, 8"
  },
  {
    name: "Unsupported pie chart",
    text: "Interpret the pie chart showing favourite fruits"
  }
];

async function run() {
  let passed = 0;
  let failed = 0;

  console.log("\n=== Statistics Rule Engine Results ===\n");

  for (const c of cases) {
    const sol = await g.LocalRuleEngineProvider.solve(
      {
        id: "st-" + c.name,
        recognizedText: c.text,
        text: c.text,
        containsMath: true
      },
      { formulaLibraryData: formulaData }
    );

    const hasId =
      Array.isArray(sol.formulaIds) && sol.formulaIds.indexOf(c.formulaId) >= 0;
    let answerOk = false;
    if (c.expectContains) {
      answerOk =
        sol &&
        String(sol.finalAnswer).indexOf(c.expectContains) >= 0;
    } else {
      answerOk = sol && String(sol.finalAnswer) === String(c.expect);
    }

    const ok =
      sol &&
      sol.status === "complete" &&
      answerOk &&
      sol.verification === "Verified" &&
      Array.isArray(sol.steps) &&
      sol.steps.length >= 3 &&
      hasId;

    if (ok) {
      passed += 1;
      console.log(
        "PASS  " + c.name + " → " + (c.expect || c.expectContains)
      );
    } else {
      failed += 1;
      console.log(
        "FAIL  " +
          c.name +
          " — got " +
          (sol && sol.finalAnswer) +
          " status=" +
          (sol && sol.status) +
          " ids=" +
          (sol && sol.formulaIds && sol.formulaIds.join(","))
      );
    }
  }

  for (const c of unsupportedCases) {
    const sol = await g.LocalRuleEngineProvider.solve(
      {
        id: "st-un-" + c.name,
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

  console.log("\n" + passed + "/" + (passed + failed) + " passed\n");
  if (failed) process.exit(1);
}

run().catch(function (err) {
  console.error(err);
  process.exit(1);
});
