/**
 * Phase 8B.6 — Curriculum Mapper tests
 * Run: node scripts/test-curriculum-mapper.js
 *
 * Lookup: Arithmetic formula, Algebra formula, Unknown formula
 * Errors: Broken Formula ID, Missing Chapter, Unknown Subject
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
loadScript("resources/app/js/solver/providers/local-rule-engine/handlers.js");
loadScript("resources/app/js/solver/providers/local-rule-engine/provider.js");

const Mapper = g.CurriculumMapper;
Mapper.loadFromData(formulaData);
g.FormulaCatalog.loadFromData(formulaData);

const EC = Mapper.ErrorCodes;
let passed = 0;
let failed = 0;
const results = [];

function assert(name, cond, detail) {
  if (cond) {
    passed += 1;
    results.push({ name: name, ok: true });
    console.log("  PASS  " + name);
  } else {
    failed += 1;
    results.push({ name: name, ok: false, detail: detail });
    console.log("  FAIL  " + name + (detail ? " — " + detail : ""));
  }
}

console.log("\nPhase 8B.6 — Curriculum Mapper\n");

// --- Lookup: Arithmetic ---
const ar = Mapper.lookup("CBSE-C6-AR-009");
assert(
  "Arithmetic Formula lookup ok",
  ar.ok === true && ar.data && ar.data.id === "CBSE-C6-AR-009",
  ar.error && ar.error.message
);
assert(
  "Arithmetic returns Board/Class/Subject/Chapter",
  ar.ok &&
    ar.data.board === "CBSE" &&
    ar.data.class === "Class 6" &&
    ar.data.subject === "Arithmetic" &&
    !!ar.data.chapter,
  ar.ok
    ? JSON.stringify({
        board: ar.data.board,
        class: ar.data.class,
        subject: ar.data.subject,
        chapter: ar.data.chapter
      })
    : ar.error && ar.error.message
);
assert(
  "Arithmetic returns Difficulty + Related + Practice IDs",
  ar.ok &&
    ar.data.difficulty != null &&
    Array.isArray(ar.data.relatedFormulas) &&
    Array.isArray(ar.data.practiceIds),
  ar.ok
    ? "diff=" +
        ar.data.difficulty +
        " related=" +
        ar.data.relatedFormulas.length +
        " practice=" +
        ar.data.practiceIds.length
    : ""
);

// --- Lookup: Algebra ---
const al = Mapper.lookup("CBSE-C6-AL-007");
assert(
  "Algebra Formula lookup ok",
  al.ok === true && al.data && al.data.id === "CBSE-C6-AL-007",
  al.error && al.error.message
);
assert(
  "Algebra returns Subject Algebra + Chapter/Topic",
  al.ok &&
    al.data.subject === "Algebra" &&
    !!al.data.chapter &&
    !!al.data.topic,
  al.ok
    ? JSON.stringify({
        subject: al.data.subject,
        chapter: al.data.chapter,
        topic: al.data.topic
      })
    : al.error && al.error.message
);

// --- Unknown Formula / Broken Formula ID ---
const unk = Mapper.lookup("DOES-NOT-EXIST-XYZ");
assert(
  "Unknown Formula → Broken Formula ID",
  unk.ok === false &&
    unk.error &&
    unk.error.code === EC.BROKEN_FORMULA_ID,
  unk.error && JSON.stringify(unk.error)
);

const empty = Mapper.lookup("");
assert(
  "Empty Formula ID → Broken Formula ID",
  empty.ok === false &&
    empty.error &&
    empty.error.code === EC.BROKEN_FORMULA_ID,
  empty.error && JSON.stringify(empty.error)
);

// --- Missing Chapter ---
Mapper.loadFromData({
  formulas: [
    {
      id: "TEST-MISSING-CHAPTER",
      name: "No Chapter Formula",
      formulaName: "No Chapter Formula",
      subject: "Arithmetic",
      board: "CBSE",
      class: "Class 6",
      chapter: ""
    }
  ]
});
const missCh = Mapper.lookup("TEST-MISSING-CHAPTER");
assert(
  "Missing Chapter → structured error",
  missCh.ok === false &&
    missCh.error &&
    missCh.error.code === EC.MISSING_CHAPTER,
  missCh.error && JSON.stringify(missCh.error)
);

// --- Unknown Subject ---
Mapper.loadFromData({
  formulas: [
    {
      id: "TEST-UNKNOWN-SUBJECT",
      name: "No Subject Formula",
      formulaName: "No Subject Formula",
      subject: "",
      board: "CBSE",
      class: "Class 6",
      chapter: "Some Chapter"
    }
  ]
});
const unkSub = Mapper.lookup("TEST-UNKNOWN-SUBJECT");
assert(
  "Unknown Subject → structured error",
  unkSub.ok === false &&
    unkSub.error &&
    unkSub.error.code === EC.UNKNOWN_SUBJECT,
  unkSub.error && JSON.stringify(unkSub.error)
);

// Restore library for solver hydrate check
Mapper.loadFromData(formulaData);

// --- Solver emits IDs; hydrate fills curriculum ---
async function solverHydrate() {
  const sol = await g.LocalRuleEngineProvider.solve(
    {
      id: "cm-factors",
      recognizedText: "Find the factors of 12",
      text: "Find the factors of 12",
      containsMath: true
    },
    { formulaLibraryData: formulaData }
  );

  assert(
    "Solver emits formulaIds",
    Array.isArray(sol.formulaIds) && sol.formulaIds.length > 0,
    sol.formulaIds && sol.formulaIds.join(",")
  );
  assert(
    "Hydrated formulaUsed has Board/Chapter (not hardcoded by solver)",
    Array.isArray(sol.formulaUsed) &&
      sol.formulaUsed.length > 0 &&
      sol.formulaUsed[0].board === "CBSE" &&
      !!sol.formulaUsed[0].chapter &&
      sol.board === "CBSE" &&
      sol.subject === "Arithmetic",
    sol.formulaUsed && sol.formulaUsed[0]
      ? JSON.stringify({
          board: sol.board,
          subject: sol.subject,
          chapter: sol.chapter,
          formulaBoard: sol.formulaUsed[0].board
        })
      : "no formulas"
  );

  console.log(
    "\nResult: " + passed + " passed, " + failed + " failed of " + (passed + failed)
  );
  if (failed) process.exit(1);
}

solverHydrate().catch(function (err) {
  console.error(err);
  process.exit(1);
});
