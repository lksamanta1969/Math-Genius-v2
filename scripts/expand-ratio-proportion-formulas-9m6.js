/**
 * Phase 9 M6 — Add Ratio & Proportion formulas (Class 7 Comparing Quantities).
 * Run: node scripts/expand-ratio-proportion-formulas-9m6.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { writeSearchIndex } = require("./lib/formula-search-index");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");
const NOW = "2026-08-30T18:00:00.000Z";
const YEAR = "2026-27";

const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

function baseMeta(p) {
  return Object.assign(
    {
      board: "CBSE",
      syllabusYear: YEAR,
      difficulty: "Easy",
      verification: "Reviewed",
      createdAt: NOW,
      updatedAt: NOW,
      version: 1,
      videoExplanation: null,
      quiz: { enabled: false, totalQuestions: 0 },
      isFavourite: false,
      viewCount: 0,
      lastViewed: null,
      practiceQuestions: [],
      practiceQuestionIds: [],
      notes: p.notes || null,
      example: p.example || null,
      latex: p.latex || "",
      variables: p.variables || [],
      relatedFormulas: (p.relatedFormulaIds || []).slice(),
      relatedFormulaIds: (p.relatedFormulaIds || []).slice(),
      keywords: p.keywords || [],
      formulaName: p.name,
      examTags: p.examTags || ["CBSE", p.class, p.subject]
    },
    p
  );
}

const RATIO = baseMeta({
  id: "CBSE-C7-CQ-001",
  class: "Class 7",
  subject: "Arithmetic",
  chapter: "Comparing Quantities",
  chapterNumber: 3,
  topic: "Ratio",
  name: "Ratio in Simplest Form",
  formulaName: "Ratio in Simplest Form",
  formula:
    "Simplest ratio a:b = (a÷HCF):(b÷HCF), where HCF is the highest common factor of all terms",
  latex: "a:b=\\frac{a\\div h}{b\\div h},\\;h=\\mathrm{HCF}",
  variables: [
    { symbol: "a, b", meaning: "Terms of the ratio" },
    { symbol: "HCF", meaning: "Highest common factor of all terms" }
  ],
  description:
    "A ratio compares two or more quantities of the same kind. Divide every term by their HCF to get the simplest form.",
  example: "12:18 → HCF(12,18)=6 → 12:18 = 2:3",
  keywords: ["ratio", "simplest form", "HCF", "comparing quantities"],
  relatedFormulaIds: ["CBSE-C7-CQ-002", "CBSE-C7-AR-005"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference: "Class 7 Mathematics — Chapter 3: Comparing Quantities"
  },
  ncertReference: {
    book: null,
    chapter: "Chapter 3: Comparing Quantities",
    exercise: null,
    page: null
  }
});

const PROPORTION = baseMeta({
  id: "CBSE-C7-CQ-002",
  class: "Class 7",
  subject: "Arithmetic",
  chapter: "Comparing Quantities",
  chapterNumber: 3,
  topic: "Proportion",
  name: "Proportion",
  formulaName: "Proportion",
  formula:
    "If a:b = c:d then a × d = b × c (product of extremes = product of means)",
  latex: "a:b=c:d\\Rightarrow ad=bc",
  variables: [
    { symbol: "a, d", meaning: "Extremes of the proportion" },
    { symbol: "b, c", meaning: "Means of the proportion" }
  ],
  description:
    "A proportion states that two ratios are equal. Cross-multiply to find an unknown when three values are known.",
  example: "2:3 = x:12 ⇒ 2×12 = 3×x ⇒ x = 8",
  keywords: ["proportion", "cross multiply", "extremes", "means"],
  relatedFormulaIds: ["CBSE-C7-CQ-001", "CBSE-C7-AR-005"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference: "Class 7 Mathematics — Chapter 3: Comparing Quantities"
  },
  ncertReference: {
    book: null,
    chapter: "Chapter 3: Comparing Quantities",
    exercise: null,
    page: null
  }
});

function findComparingQuantitiesChapter() {
  for (const board of db.boards || []) {
    if (board.board !== "CBSE") continue;
    for (const cls of board.classes || []) {
      if (!/7/.test(String(cls.title || ""))) continue;
      for (const sub of cls.subjects || []) {
        if (
          (sub.id || "").toLowerCase() === "arithmetic" ||
          sub.title === "Arithmetic"
        ) {
          for (const ch of sub.chapters || []) {
            if (
              ch.id === "comparing-quantities" ||
              ch.title === "Comparing Quantities"
            ) {
              return ch;
            }
          }
        }
      }
    }
  }
  return null;
}

function ensureFormula(chapter, formula) {
  chapter.formulas = chapter.formulas || [];
  if (chapter.formulas.some(function (f) { return f && f.id === formula.id; })) {
    console.log("Already present: " + formula.id);
    return false;
  }
  chapter.formulas.push(formula);
  console.log("Added: " + formula.id + " — " + formula.name);
  return true;
}

function linkRelated(chapter, id, relatedIds) {
  const f = (chapter.formulas || []).find(function (x) { return x && x.id === id; });
  if (!f) return;
  relatedIds.forEach(function (rid) {
    if (f.relatedFormulaIds.indexOf(rid) < 0) {
      f.relatedFormulaIds.push(rid);
      f.relatedFormulas = f.relatedFormulaIds.slice();
    }
  });
}

const cqChapter = findComparingQuantitiesChapter();
if (!cqChapter) {
  console.error("Class 7 Comparing Quantities chapter not found");
  process.exit(1);
}

ensureFormula(cqChapter, RATIO);
ensureFormula(cqChapter, PROPORTION);
linkRelated(cqChapter, "CBSE-C7-AR-005", ["CBSE-C7-CQ-001", "CBSE-C7-CQ-002"]);

db.version = "4.5";
db.phase = "phase-9m6-ratio-proportion-formula-catalog";
db.updatedAt = NOW;

const index = writeSearchIndex(db, INDEX_PATH, NOW);
fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
console.log("Library v" + db.version + ", index count=" + index.totalEntries);
