/**
 * Phase 8D — Mensuration Rule Engine tests
 * Run: node scripts/test-mensuration-rule-engine.js
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
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");

g.CurriculumMapper.loadFromData(formulaData);
g.FormulaCatalog.loadFromData(formulaData);

const cases = [
  {
    name: "Square area",
    text: "Find the area of a square of side 6 cm",
    expect: "36 cm²",
    formulaId: "CBSE-C6-ME-005"
  },
  {
    name: "Square perimeter",
    text: "Find the perimeter of a square with side 5 cm",
    expect: "20 cm",
    formulaId: "CBSE-C6-ME-002"
  },
  {
    name: "Rectangle area",
    text: "Rectangle length = 8 cm, breadth = 5 cm. Find the area.",
    expect: "40 cm²",
    formulaId: "CBSE-C6-ME-004"
  },
  {
    name: "Rectangle perimeter",
    text: "Find the perimeter of a rectangle with length 9 m and breadth 4 m",
    expect: "26 m",
    formulaId: "CBSE-C6-ME-001"
  },
  {
    name: "Triangle area",
    text: "Find the area of a triangle with base 10 cm and height 6 cm",
    expect: "30 cm²",
    formulaId: "CBSE-C6-ME-006"
  },
  {
    name: "Triangle perimeter",
    text: "Find the perimeter of a triangle with sides 3 cm, 4 cm, 5 cm",
    expect: "12 cm",
    formulaId: "CBSE-C6-ME-003"
  },
  {
    name: "Circle circumference",
    text: "Find the circumference of a circle with radius 7 cm (π = 22/7)",
    expect: "44 cm",
    formulaId: "CBSE-C7-ME-002"
  },
  {
    name: "Circle area",
    text: "Find the area of a circle with radius 7 cm (π = 22/7)",
    expect: "154 cm²",
    formulaId: "CBSE-C7-ME-003"
  }
];

const unsupportedCases = [
  { name: "Unsupported 3D shape (cylinder)", text: "Find the volume of a cylinder with radius 7 cm and height 10 cm" },
  { name: "Cone surface area", text: "Find the surface area of a cone" },
  { name: "Sphere volume", text: "Find the volume of a sphere of radius 7 cm" },
  { name: "Composite figure", text: "Find the area of a composite L-shaped figure" }
];

async function run() {
  let passed = 0;
  let failed = 0;

  console.log("\n=== Mensuration Rule Engine Results ===\n");

  for (const c of cases) {
    const sol = await g.LocalRuleEngineProvider.solve(
      {
        id: "me-" + c.name,
        recognizedText: c.text,
        text: c.text,
        containsMath: true
      },
      { formulaLibraryData: formulaData }
    );

    const hasId =
      Array.isArray(sol.formulaIds) && sol.formulaIds.indexOf(c.formulaId) >= 0;
    const ok =
      sol &&
      sol.status === "complete" &&
      String(sol.finalAnswer) === String(c.expect) &&
      sol.verification === "Verified" &&
      Array.isArray(sol.steps) &&
      sol.steps.length >= 3 &&
      hasId;

    if (ok) {
      passed += 1;
      console.log("PASS  " + c.name + " → " + c.expect);
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
        id: "me-un-" + c.name,
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
