/**
 * Phase 8F M1 — Add Classical Probability formulas (Class 7).
 * Run: node scripts/expand-probability-formulas-8f.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { writeSearchIndex } = require("./lib/formula-search-index");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");
const NOW = "2026-08-30T12:00:00.000Z";
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
      examTags: p.examTags || ["CBSE", p.class, p.subject, "Probability"]
    },
    p
  );
}

const CLASSICAL = baseMeta({
  id: "CBSE-C7-PR-001",
  class: "Class 7",
  subject: "Statistics",
  chapter: "Probability",
  chapterNumber: 2,
  topic: "Classical Probability",
  name: "Classical Probability",
  formula:
    "P(E) = (number of favorable outcomes) / (total number of equally likely outcomes)",
  latex: "P(E)=\\frac{\\text{favorable outcomes}}{\\text{total outcomes}}",
  variables: [
    { symbol: "P(E)", meaning: "Probability of event E" },
    {
      symbol: "favorable outcomes",
      meaning: "Outcomes in which event E happens"
    },
    {
      symbol: "total outcomes",
      meaning: "All equally likely outcomes in the sample space"
    }
  ],
  description:
    "For equally likely outcomes, probability is the ratio of favorable outcomes to total outcomes.",
  example: "A fair coin: P(head) = 1/2",
  notes: "All outcomes must be equally likely.",
  keywords: ["probability", "classical", "coin", "die", "equally likely"],
  relatedFormulaIds: ["CBSE-C7-PR-002"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference: "Class 7 Mathematics — Probability (introductory)"
  },
  ncertReference: {
    book: null,
    chapter: "Probability",
    exercise: null,
    page: null
  }
});

const COMPLEMENT = baseMeta({
  id: "CBSE-C7-PR-002",
  class: "Class 7",
  subject: "Statistics",
  chapter: "Probability",
  chapterNumber: 2,
  topic: "Complementary Probability",
  name: "Complementary Probability",
  formula: "P(not E) = 1 − P(E)",
  latex: "P(\\overline{E})=1-P(E)",
  variables: [
    { symbol: "P(not E)", meaning: "Probability that event E does not occur" },
    { symbol: "P(E)", meaning: "Probability of event E" }
  ],
  description:
    "The complement of an event is everything in the sample space except the event.",
  example: "Fair die: P(not 6) = 1 − 1/6 = 5/6",
  keywords: ["complement", "not", "probability"],
  relatedFormulaIds: ["CBSE-C7-PR-001"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference: "Class 7 Mathematics — Probability (introductory)"
  },
  ncertReference: {
    book: null,
    chapter: "Probability",
    exercise: null,
    page: null
  }
});

function findClass7Statistics() {
  for (const board of db.boards || []) {
    if (board.board !== "CBSE") continue;
    for (const cls of board.classes || []) {
      if (!/7/.test(String(cls.title || ""))) continue;
      for (const sub of cls.subjects || []) {
        if (
          (sub.id || "").toLowerCase() === "statistics" ||
          sub.title === "Statistics"
        ) {
          return sub;
        }
      }
    }
  }
  return null;
}

function ensureProbabilityChapter(subject) {
  subject.chapters = subject.chapters || [];
  let chapter = subject.chapters.find(function (ch) {
    return ch.id === "probability" || ch.title === "Probability";
  });
  if (!chapter) {
    chapter = {
      id: "probability",
      title: "Probability",
      chapterNumber: 2,
      chapterCode: "CBSE-C7-PR-CH01",
      board: "CBSE",
      class: "Class 7",
      subject: "Statistics",
      difficulty: "Easy",
      estimatedStudyTime: "30 min",
      syllabus: {
        board: "CBSE",
        class: "Class 7",
        subject: "Statistics",
        chapter: "Probability",
        syllabusYear: YEAR
      },
      formulas: []
    };
    subject.chapters.push(chapter);
    console.log("Added Probability chapter to Class 7 Statistics");
  }
  return chapter;
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

const statsSubject = findClass7Statistics();
if (!statsSubject) {
  console.error("Class 7 Statistics subject not found");
  process.exit(1);
}

const prChapter = ensureProbabilityChapter(statsSubject);
ensureFormula(prChapter, CLASSICAL);
ensureFormula(prChapter, COMPLEMENT);

db.version = "4.4";
db.phase = "phase-8f-probability-rule-engine";
db.updatedAt = NOW;

const index = writeSearchIndex(db, INDEX_PATH, NOW);
fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
console.log("Library v" + db.version + ", index count=" + index.totalEntries);
