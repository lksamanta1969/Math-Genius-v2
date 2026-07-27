/**
 * Phase 8C — Geometry Rule Engine tests
 * Run: node scripts/test-geometry-rule-engine.js
 *
 * Angle identification · Triangle classification · Parallel lines
 * Plus unsupported: coordinate / congruence / transformations / circle theorems
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
loadScript("resources/app/js/solver/providers/local-rule-engine/statistics.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");

g.CurriculumMapper.loadFromData(formulaData);
g.FormulaCatalog.loadFromData(formulaData);

const cases = [
  // Angle identification
  { name: "acute 45°", text: "Classify the angle 45°", expect: "Acute angle" },
  { name: "right 90°", text: "What type of angle is 90 degrees?", expect: "Right angle" },
  { name: "obtuse 120°", text: "Classify 120° angle", expect: "Obtuse angle" },
  { name: "straight 180°", text: "Identify the angle 180°", expect: "Straight angle" },
  { name: "reflex 270°", text: "Classify angle 270°", expect: "Reflex angle" },
  { name: "complete 360°", text: "Classify 360°", expect: "Complete angle" },

  // Triangle classification
  {
    name: "equilateral sides",
    text: "Classify the triangle with sides 5, 5, 5",
    expect: "Equilateral triangle"
  },
  {
    name: "isosceles sides",
    text: "Classify triangle with sides 5, 5, 8",
    expect: "Isosceles triangle"
  },
  {
    name: "scalene sides",
    text: "Classify the triangle with sides 3, 4, 5",
    expect: "Scalene triangle"
  },
  {
    name: "right triangle angles",
    text: "Classify the triangle with angles 90°, 45°, 45°",
    expect: "Right triangle"
  },
  {
    name: "acute triangle angles",
    text: "Triangle angles 40°, 60°, 80° — classify",
    expect: "Acute triangle"
  },
  {
    name: "obtuse triangle angles",
    text: "Classify triangle with angles 20°, 30°, 130°",
    expect: "Obtuse triangle"
  },

  // Parallel / intersecting
  {
    name: "parallel lines",
    text: "Lines that never meet are called",
    expect: "Parallel lines"
  },
  {
    name: "intersecting lines",
    text: "What are intersecting lines?",
    expect: "Intersecting lines"
  },
  {
    name: "ray define",
    text: "What is a ray in geometry?",
    expect: "Ray"
  }
];

const unsupportedCases = [
  {
    name: "coordinate geometry",
    text: "Plot the point (3, 4) on the coordinate plane"
  },
  {
    name: "congruence proof",
    text: "Prove the triangles are congruent using SAS"
  },
  {
    name: "transformation",
    text: "Find the image after rotation of 90° about the origin"
  },
  {
    name: "circle theorem",
    text: "Apply the circle theorem for the angle in a semicircle"
  }
];

async function run() {
  let passed = 0;
  let failed = 0;

  console.log("\n=== Geometry Rule Engine Results ===\n");

  for (const c of cases) {
    const sol = await g.LocalRuleEngineProvider.solve(
      {
        id: "geo-" + c.name,
        recognizedText: c.text,
        text: c.text,
        containsMath: true
      },
      { formulaLibraryData: formulaData }
    );

    const ok =
      sol &&
      sol.status === "complete" &&
      String(sol.finalAnswer) === String(c.expect) &&
      sol.verification === "Verified" &&
      Array.isArray(sol.steps) &&
      sol.steps.length > 0 &&
      Array.isArray(sol.formulaIds) &&
      sol.formulaIds.length > 0;

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
        id: "geo-un-" + c.name,
        recognizedText: c.text,
        text: c.text,
        containsMath: true
      },
      { formulaLibraryData: formulaData }
    );
    const ok = sol && sol.status === "unsupported";
    if (ok) {
      passed += 1;
      console.log("PASS  unsupported: " + c.name);
    } else {
      failed += 1;
      console.log(
        "FAIL  unsupported: " +
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
