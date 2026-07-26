/**
 * Phase 8E — Add Median, Mode, Bar Graph formulas for Data Handling / Statistics.
 * Run: node scripts/expand-statistics-formulas-8e.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");
const NOW = "2026-07-26T21:00:00.000Z";
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
      practiceQuestions: p.practiceQuestions || [],
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

const BAR = baseMeta({
  id: "CBSE-C6-DH-003",
  class: "Class 6",
  subject: "Data Handling",
  chapter: "Data Handling and Presentation",
  chapterNumber: 4,
  topic: "Bar Graph",
  name: "Bar Graph Scale",
  formula: "Actual value = (height of bar in units) × (value of one unit)",
  latex: "V=h\\times s",
  variables: [
    { symbol: "h", meaning: "Height of the bar in scale units" },
    { symbol: "s", meaning: "Value represented by one unit" },
    { symbol: "V", meaning: "Actual quantity" }
  ],
  description:
    "In a bar graph, read the height of the bar and multiply by the scale to get the actual value.",
  example: "If 1 unit = 10 students and height = 4, value = 40 students.",
  keywords: ["bar graph", "scale", "data"],
  relatedFormulaIds: ["CBSE-C6-DH-002", "CBSE-C6-DH-001"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference: "Class 6 Mathematics — Chapter 4: Data Handling and Presentation"
  },
  ncertReference: {
    book: null,
    chapter: "Chapter 4: Data Handling and Presentation",
    exercise: null,
    page: null
  }
});

const MEDIAN = baseMeta({
  id: "CBSE-C7-ST-003",
  class: "Class 7",
  subject: "Statistics",
  chapter: "Data Handling",
  chapterNumber: 1,
  topic: "Median",
  name: "Median of Data",
  formula:
    "Median = middle value (odd n) or average of two middle values (even n) after arranging in order",
  latex: "\\tilde{x}=\\text{middle value(s)}",
  variables: [
    { symbol: "n", meaning: "Number of observations" },
    { symbol: "x̃", meaning: "Median" }
  ],
  description:
    "The median is the central value of ordered data. For even n, take the mean of the two central observations.",
  example: "Data 3, 5, 7, 9 ⇒ median = (5+7)/2 = 6",
  keywords: ["median", "middle", "data"],
  relatedFormulaIds: ["CBSE-C7-ST-001", "CBSE-C7-ST-004"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference: "Class 7 Mathematics — Chapter 1: Data Handling"
  },
  ncertReference: {
    book: null,
    chapter: "Chapter 1: Data Handling",
    exercise: null,
    page: null
  }
});

const MODE = baseMeta({
  id: "CBSE-C7-ST-004",
  class: "Class 7",
  subject: "Statistics",
  chapter: "Data Handling",
  chapterNumber: 1,
  topic: "Mode",
  name: "Mode of Data",
  formula: "Mode = observation with the highest frequency",
  latex: "\\mathrm{Mode}=\\arg\\max f(x)",
  variables: [
    { symbol: "f(x)", meaning: "Frequency of observation x" }
  ],
  description:
    "The mode is the most frequent observation. A data set may have more than one mode, or no mode if all frequencies are 1.",
  example: "Data 2, 3, 2, 5, 2 ⇒ mode = 2",
  keywords: ["mode", "frequency", "data"],
  relatedFormulaIds: ["CBSE-C7-ST-001", "CBSE-C7-ST-003", "CBSE-C6-DH-001"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference: "Class 7 Mathematics — Chapter 1: Data Handling"
  },
  ncertReference: {
    book: null,
    chapter: "Chapter 1: Data Handling",
    exercise: null,
    page: null
  }
});

function findChapter(pred) {
  for (const board of db.boards || []) {
    if (board.board !== "CBSE") continue;
    for (const cls of board.classes || []) {
      for (const sub of cls.subjects || []) {
        for (const ch of sub.chapters || []) {
          if (pred(cls, sub, ch)) return ch;
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

const dhChapter = findChapter(function (cls, sub, ch) {
  return (
    /6/.test(String(cls.title || "")) &&
    ((sub.id || "").toLowerCase() === "data-handling" ||
      sub.title === "Data Handling") &&
    (ch.id === "data-handling-and-presentation" ||
      ch.title === "Data Handling and Presentation")
  );
});

const stChapter = findChapter(function (cls, sub, ch) {
  return (
    /7/.test(String(cls.title || "")) &&
    ((sub.id || "").toLowerCase() === "statistics" || sub.title === "Statistics") &&
    (ch.id === "data-handling" || ch.title === "Data Handling")
  );
});

if (!dhChapter || !stChapter) {
  console.error("Required chapters not found", {
    dh: !!dhChapter,
    st: !!stChapter
  });
  process.exit(1);
}

ensureFormula(dhChapter, BAR);
ensureFormula(stChapter, MEDIAN);
ensureFormula(stChapter, MODE);

db.version = "4.3";
db.phase = "phase-8e-statistics-rule-engine";
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
    { version: db.version, generatedAt: NOW, count: entries.length, formulas: entries },
    null,
    2
  ) + "\n",
  "utf8"
);
console.log("Library v" + db.version + ", index count=" + entries.length);
