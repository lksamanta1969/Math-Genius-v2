/**
 * Phase 8B.5 — Formula Library expansion tests
 * Run: node scripts/test-formula-library-8b5.js
 */
"use strict";

const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");

const g = global;
g.window = g;

function loadScript(rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const run = new Function("window", "globalThis", code + "\n//# sourceURL=" + rel);
  run(g, g);
}

loadScript("resources/app/js/solver/providers/local-rule-engine/formula-catalog.js");

const db = JSON.parse(fs.readFileSync(DATA, "utf8"));
const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));
g.FormulaCatalog.loadFromData(db);

const results = [];
let passed = 0;

function check(name, ok, detail) {
  results.push({ name: name, ok: !!ok, detail: detail });
  if (ok) passed += 1;
  else console.error("FAIL", name, detail);
}

// Arithmetic still present
check(
  "Arithmetic formula by ID",
  !!g.FormulaCatalog.getById("CBSE-C6-AR-001"),
  g.FormulaCatalog.getById("CBSE-C6-AR-001") &&
    g.FormulaCatalog.getById("CBSE-C6-AR-001").formulaName
);

// Algebra merged
const al = g.FormulaCatalog.getById("CBSE-C6-AL-007");
check(
  "Algebra formula by ID",
  !!(al && al.formulaName === "Simple Linear Equation (One Variable)"),
  al && al.formulaName
);

// Class 7 present
check(
  "Class 7 algebra formula by ID",
  !!g.FormulaCatalog.getById("CBSE-C7-AL-001"),
  g.FormulaCatalog.getById("CBSE-C7-AL-001") &&
    g.FormulaCatalog.getById("CBSE-C7-AL-001").formulaName
);

// Search index: name / keyword / chapter / topic
function search(field, needle) {
  const n = String(needle).toLowerCase();
  return index.entries.filter((e) => {
    if (field === "name") {
      return String(e.formulaName || e.name || "").toLowerCase().indexOf(n) >= 0;
    }
    if (field === "keyword") {
      return (e.keywords || []).some((k) => String(k).toLowerCase().indexOf(n) >= 0) ||
        String(e.searchText || "").indexOf(n) >= 0;
    }
    if (field === "chapter") {
      return String(e.chapter || "").toLowerCase().indexOf(n) >= 0;
    }
    if (field === "topic") {
      return String(e.topic || "").toLowerCase().indexOf(n) >= 0;
    }
    return false;
  });
}

check("Search by formula name", search("name", "Simple Linear Equation").length > 0);
check("Search by keyword", search("keyword", "circumference").length > 0);
check("Search by chapter", search("chapter", "Prime Time").length > 0);
check("Search by topic", search("topic", "Like terms").length > 0 || search("topic", "like terms").length > 0);

// Operation lookup still resolves algebra IDs
const resolved = g.FormulaCatalog.resolveForOperation("algebra_linear_equation");
check(
  "Formula lookup via operation key",
  resolved.length >= 1 && resolved.every((r) => r.formulaId && r.formulaName),
  resolved
);

// Validator exit 0
const val = spawnSync(process.execPath, [path.join(__dirname, "validate-formula-library.js")], {
  encoding: "utf8"
});
check("Validator script passes", val.status === 0, val.stderr || val.stdout.slice(0, 200));

console.log("\n=== Formula Library 8B.5 Tests ===");
results.forEach((r) => {
  console.log((r.ok ? "PASS" : "FAIL") + "  " + r.name);
});
console.log("\n" + passed + "/" + results.length + " passed");
console.log("Indexed formulas:", index.totalEntries);
if (passed !== results.length) process.exitCode = 1;
