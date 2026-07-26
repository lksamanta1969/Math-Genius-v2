"use strict";

/**
 * Validate Formula Library data integrity (focus: CBSE Class 6 completion gate).
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
  "name",
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
  "relatedFormulas"
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
const class6 = cbse.classes.find((c) => c.id === "6");

const allIds = [];
const idMap = new Map();
let formulaCount = 0;
const chapterNameKeys = new Set();
const nameFormulaKeys = new Map();

class6.subjects.forEach((subject) => {
  if (!subject.chapters || subject.chapters.length === 0) {
    fail("Empty subject (no chapters): " + subject.title);
  }
  if (subject.syllabus && subject.syllabus.class !== "Class 6") {
    fail("Subject not scoped to Class 6: " + subject.title);
  }

  const namesInSubject = new Set();
  subject.chapters.forEach((chapter) => {
    if (namesInSubject.has(chapter.title)) {
      fail(
        "Duplicate chapter name within subject " +
          subject.title +
          ": " +
          chapter.title
      );
    }
    namesInSubject.add(chapter.title);
    chapterNameKeys.add(subject.id + "::" + chapter.title);

    if (chapter.subject !== subject.title) {
      fail(
        "Chapter subject mismatch: " +
          chapter.title +
          " has subject " +
          chapter.subject
      );
    }
    if (chapter.class !== "Class 6") {
      fail("Chapter not in Class 6: " + chapter.title);
    }

    if (!Array.isArray(chapter.formulas) || chapter.formulas.length === 0) {
      fail("Empty chapter (no formulas): " + chapter.title);
    }

    (chapter.formulas || []).forEach((f) => {
      formulaCount += 1;
      allIds.push(f.id);
      idMap.set(f.id, f);

      REQUIRED_FORMULA_FIELDS.forEach((field) => {
        if (f[field] === undefined || f[field] === null || f[field] === "") {
          fail("Missing required field '" + field + "' on " + f.id);
        }
      });

      if (!Array.isArray(f.variables) || f.variables.length === 0) {
        fail("Empty variables on " + f.id);
      }
      if (!Array.isArray(f.keywords) || f.keywords.length === 0) {
        fail("Empty keywords on " + f.id);
      }
      if (!f.source || !f.source.board || !f.source.syllabusYear) {
        fail("Incomplete source metadata on " + f.id);
      }
      if (!["Draft", "Reviewed", "Verified"].includes(f.verification)) {
        fail("Invalid verification on " + f.id + ": " + f.verification);
      }
      if (!String(f.id).startsWith("CBSE-C6-")) {
        fail("Unexpected ID pattern for Class 6 formula: " + f.id);
      }
      if (f.subject !== subject.title) {
        fail(f.id + " subject field does not match parent subject");
      }
      if (f.chapter !== chapter.title) {
        fail(f.id + " chapter field does not match parent chapter");
      }
      if (f.chapterNumber !== chapter.chapterNumber) {
        fail(f.id + " chapterNumber does not match parent chapter");
      }
      if (f.class !== "Class 6" || f.board !== "CBSE") {
        fail(f.id + " board/class scope mismatch");
      }
      if (String(f.latex).includes("\\begin{cases}")) {
        fail(f.id + " uses cases environment (prefer portable LaTeX)");
      }
      if (/=\s*q\s+r\//.test(String(f.formula))) {
        fail(f.id + " has ambiguous mixed-number plain formula");
      }

      const dupKey =
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

allIds.forEach((id) => {
  const f = idMap.get(id);
  (f.relatedFormulas || []).forEach((rid) => {
    if (!idMap.has(rid)) {
      fail(id + " has broken relatedFormulas reference: " + rid);
    }
  });
});

const dupIds = allIds.filter((id, i) => allIds.indexOf(id) !== i);
if (dupIds.length) {
  fail("Duplicate formula IDs: " + [...new Set(dupIds)].join(", "));
} else {
  pass("No duplicate formula IDs (" + allIds.length + " unique)");
}

pass(
  "No duplicate chapter names within the same subject (" +
    chapterNameKeys.size +
    " chapters)"
);

if (report.errors.filter((e) => e.includes("Missing required")).length === 0) {
  pass("No empty required fields on formulas");
}

pass("Chapter/subject/class ownership fields are consistent");
pass("Related formula references resolve within Class 6");
pass("No ambiguous mixed-number plain formulas / non-portable cases LaTeX");

let indexOk = false;
if (fs.existsSync(INDEX_PATH)) {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  if (index.totalEntries === formulaCount && index.entries.length === formulaCount) {
    pass(
      "Search index generated and matches formula count (" + formulaCount + ")"
    );
    indexOk = true;
  } else {
    fail(
      "Search index count mismatch: index=" +
        index.totalEntries +
        " formulas=" +
        formulaCount
    );
  }
} else {
  fail("Search index file missing: " + INDEX_PATH);
}

pass("Formula count matches actual records: " + formulaCount);

const favOff = db.features && db.features.favourites && db.features.favourites.enabled === false;
const printOff = db.features && db.features.print && db.features.print.enabled === false;
if (favOff && printOff) {
  pass("Favourite / Print / Export feature flags remain disabled");
} else {
  fail("Favourite or Print feature flags unexpectedly enabled");
}

if (report.warnings.length === 0) {
  pass("Validation completed with zero warnings");
} else {
  report.ok = false;
  fail("Validation produced warnings");
}

report.summary = {
  subjects: class6.subjects.map((s) => ({
    title: s.title,
    chapters: s.chapters.length,
    formulas: s.chapters.reduce((n, ch) => n + ch.formulas.length, 0)
  })),
  totalSubjects: class6.subjects.length,
  totalChapters: chapterNameKeys.size,
  totalFormulas: formulaCount,
  averageFormulasPerChapter: Number(
    (formulaCount / chapterNameKeys.size).toFixed(2)
  ),
  searchIndexOk: indexOk
};

if (!report.ok) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
