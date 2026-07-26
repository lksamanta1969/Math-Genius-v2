/**
 * Phase 8D — Ensure triangle area formula exists in Class 6 Mensuration.
 * Run: node scripts/expand-mensuration-formulas-8d.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");
const NOW = "2026-07-26T20:00:00.000Z";
const YEAR = "2026-27";

const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

function makeTriangleArea() {
  return {
    id: "CBSE-C6-ME-006",
    board: "CBSE",
    syllabusYear: YEAR,
    class: "Class 6",
    subject: "Mensuration",
    chapter: "Perimeter and Area",
    chapterNumber: 6,
    name: "Area of a Triangle",
    formula: "A = ½ × base × height",
    latex: "A=\\frac{1}{2}bh",
    variables: [
      { symbol: "A", meaning: "Area" },
      { symbol: "b", meaning: "Base" },
      { symbol: "h", meaning: "Corresponding height" }
    ],
    description:
      "Area of a triangle is half the product of its base and the corresponding perpendicular height.",
    example: "If base = 10 cm and height = 6 cm, A = ½ × 10 × 6 = 30 cm².",
    notes: "Height must be perpendicular to the chosen base.",
    practiceQuestions: [
      {
        question: "Base 8 cm, height 5 cm. Find area of the triangle.",
        answer: "20 cm²"
      }
    ],
    difficulty: "Easy",
    examTags: ["CBSE", "Class 6", "Area"],
    verification: "Reviewed",
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 6 Mathematics — Chapter 6: Perimeter and Area"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 6: Perimeter and Area",
      exercise: null,
      page: null
    },
    videoExplanation: null,
    quiz: { enabled: false, totalQuestions: 0 },
    relatedFormulas: ["CBSE-C6-ME-003", "CBSE-C6-ME-004"],
    keywords: ["area", "triangle", "base", "height"],
    isFavourite: false,
    viewCount: 0,
    lastViewed: null,
    topic: "Perimeter and Area",
    formulaName: "Area of a Triangle",
    relatedFormulaIds: ["CBSE-C6-ME-003", "CBSE-C6-ME-004"],
    practiceQuestionIds: []
  };
}

function findChapter() {
  for (const board of db.boards || []) {
    if (board.board !== "CBSE") continue;
    for (const cls of board.classes || []) {
      if (!/6/.test(String(cls.title || ""))) continue;
      for (const sub of cls.subjects || []) {
        if ((sub.id || "").toLowerCase() === "mensuration" || sub.title === "Mensuration") {
          const ch = (sub.chapters || []).find(function (c) {
            return (
              c.id === "perimeter-and-area" || c.title === "Perimeter and Area"
            );
          });
          return ch;
        }
      }
    }
  }
  return null;
}

const chapter = findChapter();
if (!chapter) {
  console.error("Class 6 Mensuration chapter not found");
  process.exit(1);
}

chapter.formulas = chapter.formulas || [];
const exists = chapter.formulas.some(function (f) {
  return f && f.id === "CBSE-C6-ME-006";
});
if (!exists) {
  chapter.formulas.push(makeTriangleArea());
  console.log("Added CBSE-C6-ME-006 Area of a Triangle");
} else {
  console.log("CBSE-C6-ME-006 already present");
}

db.version = "4.2";
db.phase = "phase-8d-mensuration-rule-engine";
db.updatedAt = NOW;

function walkFormulas(node, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach(function (n) {
      walkFormulas(n, out);
    });
    return;
  }
  if (typeof node.id === "string" && typeof node.name === "string" && node.formula) {
    out.push({
      id: node.id,
      name: node.name,
      formulaName: node.formulaName || node.name,
      board: node.board || null,
      class: node.class || null,
      subject: node.subject || null,
      chapter: node.chapter || null,
      topic: node.topic || null,
      keywords: node.keywords || [],
      difficulty: node.difficulty || null
    });
  }
  Object.keys(node).forEach(function (k) {
    if (k === "id" || k === "name" || k === "formula") return;
    walkFormulas(node[k], out);
  });
}

const entries = [];
walkFormulas(db, entries);
fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
fs.writeFileSync(
  INDEX_PATH,
  JSON.stringify(
    {
      version: db.version,
      generatedAt: NOW,
      count: entries.length,
      formulas: entries
    },
    null,
    2
  ) + "\n",
  "utf8"
);
console.log("Library v" + db.version + ", index count=" + entries.length);
