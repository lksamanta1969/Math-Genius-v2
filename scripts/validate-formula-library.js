"use strict";

/**
 * Validate Formula Library (Phase 8B.5) — CBSE Class 6 & 7 completion gate.
 * Checks: duplicate IDs, duplicate formulas, broken references,
 * missing chapters/variables/examples, search index sync.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");

const REQUIRED_FORMULA_FIELDS = [
  "id",
  "board",
  "syllabusYear",
  "class",
  "subject",
  "chapter",
  "chapterNumber",
  "topic",
  "name",
  "formulaName",
  "formula",
  "latex",
  "variables",
  "description",
  "example",
  "difficulty",
  "verification",
  "createdAt",
  "updatedAt",
  "version",
  "source",
  "keywords",
  "relatedFormulas",
  "relatedFormulaIds"
];

const report = {
  ok: true,
  checks: [],
  errors: [],
  warnings: [],
  summary: {}
};

function fail(msg) {
  report.ok = false;
  report.errors.push(msg);
}

function warn(msg) {
  report.warnings.push(msg);
}

function pass(msg) {
  report.checks.push("✓ " + msg);
}

const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const cbse = db.boards.find((b) => b.id === "cbse");
if (!cbse) fail("CBSE board missing");

const targetClasses = ["6", "7"];
const allIds = [];
const idMap = new Map();
let formulaCount = 0;
const nameFormulaKeys = new Map();
const classSummaries = [];

targetClasses.forEach((classId) => {
  const cls = cbse.classes.find((c) => c.id === classId);
  if (!cls) {
    fail("Missing CBSE Class " + classId);
    return;
  }
  const classLabel = cls.title || "Class " + classId;
  let classFormulas = 0;
  let classChapters = 0;

  if (!cls.subjects || !cls.subjects.length) {
    fail(classLabel + " has no subjects");
  }

  cls.subjects.forEach((subject) => {
    if (!subject.chapters || subject.chapters.length === 0) {
      fail("Empty subject (no chapters): " + classLabel + " / " + subject.title);
      return;
    }

    const namesInSubject = new Set();
    subject.chapters.forEach((chapter) => {
      classChapters += 1;
      if (namesInSubject.has(chapter.title)) {
        fail(
          "Duplicate chapter name within " +
            classLabel +
            " / " +
            subject.title +
            ": " +
            chapter.title
        );
      }
      namesInSubject.add(chapter.title);

      if (chapter.subject !== subject.title) {
        fail("Chapter subject mismatch: " + chapter.title);
      }
      if (chapter.class !== classLabel) {
        fail("Chapter class mismatch: " + chapter.title);
      }
      if (!Array.isArray(chapter.formulas) || chapter.formulas.length === 0) {
        fail("Empty chapter (no formulas): " + classLabel + " / " + chapter.title);
      }

      (chapter.formulas || []).forEach((f) => {
        formulaCount += 1;
        classFormulas += 1;
        allIds.push(f.id);
        idMap.set(f.id, f);

        REQUIRED_FORMULA_FIELDS.forEach((field) => {
          if (f[field] === undefined || f[field] === null || f[field] === "") {
            fail("Missing required field '" + field + "' on " + f.id);
          }
        });

        if (!Array.isArray(f.variables) || f.variables.length === 0) {
          fail("Missing variables on " + f.id);
        }
        if (!f.example || !String(f.example).trim()) {
          fail("Missing example on " + f.id);
        }
        if (!Array.isArray(f.keywords) || f.keywords.length === 0) {
          fail("Empty keywords on " + f.id);
        }
        if (!f.source || !f.source.board || !f.source.syllabusYear) {
          fail("Incomplete source metadata on " + f.id);
        }
        if (!["Draft", "Reviewed", "Verified"].includes(f.verification)) {
          fail("Invalid verification on " + f.id);
        }
        if (f.class !== classLabel || f.board !== "CBSE") {
          fail(f.id + " board/class scope mismatch");
        }
        if (f.subject !== subject.title) {
          fail(f.id + " subject field does not match parent");
        }
        if (f.chapter !== chapter.title) {
          fail(f.id + " chapter field does not match parent");
        }
        if (f.formulaName !== f.name) {
          warn(f.id + " formulaName differs from name");
        }

        const relatedA = (f.relatedFormulaIds || []).slice().sort().join(",");
        const relatedB = (f.relatedFormulas || []).slice().sort().join(",");
        if (relatedA !== relatedB) {
          fail(f.id + " relatedFormulaIds out of sync with relatedFormulas");
        }

        const expectedPrefix = "CBSE-C" + classId + "-";
        if (!String(f.id).startsWith(expectedPrefix)) {
          fail("Unexpected ID pattern for " + classLabel + ": " + f.id);
        }

        const dupKey =
          f.class +
          "||" +
          f.name.trim().toLowerCase() +
          "||" +
          String(f.formula).replace(/\s+/g, " ").trim().toLowerCase();
        if (nameFormulaKeys.has(dupKey)) {
          fail(
            "Duplicate name+formula: " +
              f.id +
              " and " +
              nameFormulaKeys.get(dupKey)
          );
        } else {
          nameFormulaKeys.set(dupKey, f.id);
        }
      });
    });
  });

  classSummaries.push({
    class: classLabel,
    subjects: cls.subjects.length,
    chapters: classChapters,
    formulas: classFormulas
  });
});

allIds.forEach((id) => {
  const f = idMap.get(id);
  (f.relatedFormulaIds || f.relatedFormulas || []).forEach((rid) => {
    if (!idMap.has(rid)) {
      // Allow cross-class later; for now require resolve within validated set OR entire DB
      // Check whole library
    }
  });
});

// Resolve related IDs against entire CBSE tree
const globalIds = new Set();
cbse.classes.forEach((cls) => {
  (cls.subjects || []).forEach((s) => {
    (s.chapters || []).forEach((ch) => {
      (ch.formulas || []).forEach((f) => globalIds.add(f.id));
    });
  });
});

allIds.forEach((id) => {
  const f = idMap.get(id);
  (f.relatedFormulaIds || []).forEach((rid) => {
    if (!globalIds.has(rid) && !idMap.has(rid)) {
      fail(id + " has broken relatedFormulaIds reference: " + rid);
    }
  });
});

const dupIds = allIds.filter((id, i) => allIds.indexOf(id) !== i);
if (dupIds.length) {
  fail("Duplicate formula IDs: " + [...new Set(dupIds)].join(", "));
} else {
  pass("No duplicate formula IDs (" + allIds.length + " unique in Class 6–7)");
}

pass("No duplicate name+formula pairs within a class");
pass("Required fields, variables, and examples present");

// Architecture-ready boards
["icse", "ncert", "wbchse", "wb-board", "isc"].forEach((id) => {
  const b = db.boards.find((x) => x.id === id);
  if (!b) fail("Missing board scaffold: " + id);
  else pass("Board scaffold present: " + id + " (enabled=" + !!b.enabled + ")");
});

let indexOk = false;
if (fs.existsSync(INDEX_PATH)) {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  // Index may include only formulas that exist globally; count all formulas in DB
  let globalCount = 0;
  db.boards.forEach((board) => {
    (board.classes || []).forEach((cls) => {
      (cls.subjects || []).forEach((s) => {
        (s.chapters || []).forEach((ch) => {
          globalCount += (ch.formulas || []).length;
        });
      });
    });
  });

  if (index.totalEntries === globalCount && index.entries.length === globalCount) {
    pass("Search index matches global formula count (" + globalCount + ")");
    indexOk = true;
  } else {
    fail(
      "Search index count mismatch: index=" +
        index.totalEntries +
        " formulas=" +
        globalCount
    );
  }

  const sample = index.entries[0];
  if (sample && sample.topic != null && (sample.formulaName || sample.name)) {
    pass("Search index includes topic and formula name fields");
  } else {
    fail("Search index missing topic/formulaName fields");
  }

  // Spot-check searchability for arithmetic + algebra IDs
  const byId = new Map(index.entries.map((e) => [e.id, e]));
  ["CBSE-C6-AR-001", "CBSE-C6-AL-007", "CBSE-C7-AL-001"].forEach((id) => {
    if (!byId.has(id)) fail("Search index missing " + id);
    else {
      const e = byId.get(id);
      if (!e.searchText || !e.chapter) fail("Incomplete search entry " + id);
    }
  });
  if (report.errors.filter((e) => e.includes("Search index")).length === 0) {
    pass("Arithmetic and Algebra formulas are indexed");
  }
} else {
  fail("Search index file missing");
}

const algebraInLibrary = idMap.has("CBSE-C6-AL-001") && idMap.has("CBSE-C6-AL-010");
if (algebraInLibrary) {
  pass("Algebra intro formulas merged into main library");
} else {
  fail("Algebra intro formulas missing from main library");
}

if (report.warnings.length) {
  report.warnings.forEach((w) => warn(w));
}

report.summary = {
  classes: classSummaries,
  totalFormulasClass6and7: formulaCount,
  searchIndexOk: indexOk,
  libraryVersion: db.version
};

if (!report.ok) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
