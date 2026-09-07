/**
 * Phase Inventory A — Class 7 Distributive Law + Class 8 Algebra bootstrap.
 * Run: node scripts/expand-inventory-phase-a-class7-8-algebra.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { writeSearchIndex } = require("./lib/formula-search-index");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");
const NOW = new Date().toISOString();
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
      notes: p.notes != null ? p.notes : null,
      examTags: p.examTags || ["CBSE", p.class.replace("Class ", "Class "), p.subject]
    },
    p,
    {
      formulaName: p.name,
      relatedFormulas: (p.relatedFormulaIds || []).slice(),
      relatedFormulaIds: (p.relatedFormulaIds || []).slice()
    }
  );
}

const C7_DISTRIBUTIVE = baseMeta({
  id: "CBSE-C7-AL-007",
  class: "Class 7",
  subject: "Algebra",
  chapter: "Algebraic Expressions",
  chapterNumber: 2,
  topic: "Distributive Property",
  name: "Distributive Law",
  formula: "a(b + c) = ab + ac",
  latex: "a(b+c)=ab+ac",
  variables: [
    { symbol: "a", meaning: "Multiplier (coefficient or number)" },
    { symbol: "b", meaning: "First term inside the bracket" },
    { symbol: "c", meaning: "Second term inside the bracket" }
  ],
  description:
    "To multiply a number or coefficient by a bracketed sum, multiply it by each term inside the bracket and add the results.",
  example: "3(x + 4) = 3x + 12",
  keywords: ["distributive", "property", "expand", "expression", "algebraic expressions"],
  relatedFormulaIds: ["CBSE-C7-AL-003", "CBSE-C7-AL-004"],
  source: {
    board: "CBSE",
    syllabusYear: YEAR,
    referenceBook: "NCERT",
    chapterReference:
      "Class 7 Mathematics — Chapter 2: Algebraic Expressions (Golden Art #44)"
  },
  ncertReference: {
    book: null,
    chapter: "Chapter 2: Algebraic Expressions",
    exercise: null,
    page: null
  },
  examTags: ["CBSE", "Class 7", "Expressions"]
});

function c8Formula(p) {
  return baseMeta(Object.assign({ class: "Class 8", subject: "Algebra" }, p));
}

const C8_IDENTITIES = [
  c8Formula({
    id: "CBSE-C8-AL-001",
    chapter: "Algebraic Identities",
    chapterNumber: 1,
    topic: "Standard Algebraic Identities",
    name: "Difference of Squares",
    formula: "a² − b² = (a + b)(a − b)",
    latex: "a^2-b^2=(a+b)(a-b)",
    variables: [
      { symbol: "a", meaning: "First term" },
      { symbol: "b", meaning: "Second term" }
    ],
    description: "The difference of two squares factors into the product of their sum and difference.",
    example: "x² − 9 = (x + 3)(x − 3)",
    keywords: ["identity", "difference of squares", "factorisation", "a²-b²"],
    relatedFormulaIds: ["CBSE-C8-AL-002", "CBSE-C8-AL-003"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 8 Mathematics — Chapter 9: Algebraic Expressions and Identities (Golden Art #67)"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 9: Algebraic Expressions and Identities",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 8", "Identities"]
  }),
  c8Formula({
    id: "CBSE-C8-AL-002",
    chapter: "Algebraic Identities",
    chapterNumber: 1,
    topic: "Standard Algebraic Identities",
    name: "Square of a Sum",
    formula: "(a + b)² = a² + 2ab + b²",
    latex: "(a+b)^2=a^2+2ab+b^2",
    variables: [
      { symbol: "a", meaning: "First term" },
      { symbol: "b", meaning: "Second term" }
    ],
    description: "Expanding the square of a binomial sum gives three terms: both squares plus twice their product.",
    example: "(x + 3)² = x² + 6x + 9",
    keywords: ["identity", "perfect square", "expand", "(a+b)²"],
    relatedFormulaIds: ["CBSE-C8-AL-001", "CBSE-C8-AL-003"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 8 Mathematics — Chapter 9: Algebraic Expressions and Identities (Golden Art #68)"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 9: Algebraic Expressions and Identities",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 8", "Identities"]
  }),
  c8Formula({
    id: "CBSE-C8-AL-003",
    chapter: "Algebraic Identities",
    chapterNumber: 1,
    topic: "Standard Algebraic Identities",
    name: "Square of a Difference",
    formula: "(a − b)² = a² − 2ab + b²",
    latex: "(a-b)^2=a^2-2ab+b^2",
    variables: [
      { symbol: "a", meaning: "First term" },
      { symbol: "b", meaning: "Second term" }
    ],
    description:
      "Expanding the square of a binomial difference gives both squares minus twice their product.",
    example: "(2x − 1)² = 4x² − 4x + 1",
    keywords: ["identity", "perfect square", "expand", "(a-b)²"],
    relatedFormulaIds: ["CBSE-C8-AL-001", "CBSE-C8-AL-002"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 8 Mathematics — Chapter 9: Algebraic Expressions and Identities (Golden Art #69)"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 9: Algebraic Expressions and Identities",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 8", "Identities"]
  })
];

const C8_EXPONENTS = [
  c8Formula({
    id: "CBSE-C8-AL-004",
    chapter: "Exponents and Powers",
    chapterNumber: 2,
    topic: "Laws of Exponents",
    name: "Power of a Power",
    formula: "(a^m)^n = a^(mn)",
    latex: "(a^m)^n=a^{mn}",
    variables: [
      { symbol: "a", meaning: "Base (a ≠ 0)" },
      { symbol: "m", meaning: "Inner exponent" },
      { symbol: "n", meaning: "Outer exponent" }
    ],
    description: "When raising a power to another power, multiply the exponents.",
    example: "(2³)² = 2⁶ = 64",
    keywords: ["exponent", "power of a power", "laws of exponents"],
    relatedFormulaIds: ["CBSE-C8-AL-005", "CBSE-C8-AL-006", "CBSE-C8-AL-007", "CBSE-C7-AL-005"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 8 Mathematics — Chapter 12: Exponents and Powers (Golden Art #84)"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 12: Exponents and Powers",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 8", "Exponents"]
  }),
  c8Formula({
    id: "CBSE-C8-AL-005",
    chapter: "Exponents and Powers",
    chapterNumber: 2,
    topic: "Laws of Exponents",
    name: "Power of a Product",
    formula: "(ab)^n = a^n b^n",
    latex: "(ab)^n=a^n b^n",
    variables: [
      { symbol: "a", meaning: "First factor of the base" },
      { symbol: "b", meaning: "Second factor of the base" },
      { symbol: "n", meaning: "Exponent" }
    ],
    description: "A power of a product equals the product of each factor raised to that power.",
    example: "(2 × 5)³ = 2³ × 5³ = 8 × 125 = 1000",
    keywords: ["exponent", "power of a product", "laws of exponents"],
    relatedFormulaIds: ["CBSE-C8-AL-004", "CBSE-C8-AL-006", "CBSE-C8-AL-007"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 8 Mathematics — Chapter 12: Exponents and Powers (Golden Art #85)"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 12: Exponents and Powers",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 8", "Exponents"]
  }),
  c8Formula({
    id: "CBSE-C8-AL-006",
    chapter: "Exponents and Powers",
    chapterNumber: 2,
    topic: "Laws of Exponents",
    name: "Power of a Quotient",
    formula: "(a/b)^n = a^n/b^n  (b ≠ 0)",
    latex: "\\left(\\frac{a}{b}\\right)^n=\\frac{a^n}{b^n}\\;(b\\neq 0)",
    variables: [
      { symbol: "a", meaning: "Numerator of the base" },
      { symbol: "b", meaning: "Denominator of the base (b ≠ 0)" },
      { symbol: "n", meaning: "Exponent" }
    ],
    description:
      "A power of a quotient equals the numerator and denominator each raised to that power.",
    example: "(3/2)² = 3²/2² = 9/4",
    notes: "The denominator b must not be zero.",
    keywords: ["exponent", "power of a quotient", "laws of exponents", "fraction"],
    relatedFormulaIds: ["CBSE-C8-AL-004", "CBSE-C8-AL-005", "CBSE-C8-AL-007"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 8 Mathematics — Chapter 12: Exponents and Powers (Golden Art #86)"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 12: Exponents and Powers",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 8", "Exponents"]
  }),
  c8Formula({
    id: "CBSE-C8-AL-007",
    chapter: "Exponents and Powers",
    chapterNumber: 2,
    topic: "Negative Exponents",
    name: "Negative Exponent",
    formula: "a^(−n) = 1/a^n  (a ≠ 0)",
    latex: "a^{-n}=\\frac{1}{a^n}\\;(a\\neq 0)",
    variables: [
      { symbol: "a", meaning: "Base (a ≠ 0)" },
      { symbol: "n", meaning: "Positive exponent" }
    ],
    description:
      "A negative exponent means take the reciprocal of the base raised to the positive exponent.",
    example: "2^(−3) = 1/2³ = 1/8",
    notes: "The base a must not be zero.",
    keywords: ["exponent", "negative exponent", "reciprocal", "laws of exponents"],
    relatedFormulaIds: ["CBSE-C8-AL-004", "CBSE-C8-AL-005", "CBSE-C8-AL-006", "CBSE-C7-AL-006"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 8 Mathematics — Chapter 12: Exponents and Powers (Golden Art #89)"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 12: Exponents and Powers",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 8", "Exponents"]
  })
];

function makeChapter(meta, formulas) {
  return {
    id: meta.id,
    title: meta.title,
    chapterNumber: meta.chapterNumber,
    chapterCode: meta.chapterCode,
    board: "CBSE",
    class: meta.class,
    subject: meta.subject,
    difficulty: meta.difficulty || "Easy",
    estimatedStudyTime: meta.estimatedStudyTime || "45 min",
    referenceBooks: meta.referenceBooks || ["NCERT"],
    syllabus: {
      board: "CBSE",
      class: meta.class,
      subject: meta.subject,
      chapter: meta.title,
      syllabusYear: YEAR
    },
    formulas: formulas
  };
}

function findCbseClass(classId) {
  const board = db.boards.find(function (b) {
    return b.id === "cbse";
  });
  if (!board) throw new Error("CBSE board missing");
  const cls = (board.classes || []).find(function (c) {
    return String(c.id) === String(classId);
  });
  if (!cls) throw new Error("Class " + classId + " missing");
  return cls;
}

function findAlgebraSubject(cls) {
  const sub = (cls.subjects || []).find(function (s) {
    return s.id === "algebra";
  });
  if (!sub) throw new Error("Algebra subject missing for " + cls.title);
  return sub;
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
  const f = (chapter.formulas || []).find(function (x) {
    return x && x.id === id;
  });
  if (!f) return;
  relatedIds.forEach(function (rid) {
    if (f.relatedFormulaIds.indexOf(rid) < 0) {
      f.relatedFormulaIds.push(rid);
      f.relatedFormulas = f.relatedFormulaIds.slice();
    }
  });
}

// --- Class 7: append distributive law ---
const class7 = findCbseClass("7");
const algebra7 = findAlgebraSubject(class7);
const exprChapter = (algebra7.chapters || []).find(function (ch) {
  return ch.id === "algebraic-expressions";
});
if (!exprChapter) {
  console.error("Class 7 Algebraic Expressions chapter not found");
  process.exit(1);
}
ensureFormula(exprChapter, C7_DISTRIBUTIVE);
linkRelated(exprChapter, "CBSE-C7-AL-003", ["CBSE-C7-AL-007"]);
linkRelated(exprChapter, "CBSE-C7-AL-004", ["CBSE-C7-AL-007"]);

// --- Class 8: create two chapters ---
const class8 = findCbseClass("8");
const algebra8 = findAlgebraSubject(class8);
if ((algebra8.chapters || []).length > 0) {
  console.error("Class 8 Algebra already has chapters; aborting to avoid overwrite");
  process.exit(1);
}

algebra8.chapters = [
  makeChapter(
    {
      id: "algebraic-identities",
      title: "Algebraic Identities",
      chapterNumber: 1,
      chapterCode: "CBSE-C8-AL-CH01",
      class: "Class 8",
      subject: "Algebra"
    },
    C8_IDENTITIES
  ),
  makeChapter(
    {
      id: "exponents-and-powers",
      title: "Exponents and Powers",
      chapterNumber: 2,
      chapterCode: "CBSE-C8-AL-CH02",
      class: "Class 8",
      subject: "Algebra"
    },
    C8_EXPONENTS
  )
];

C8_IDENTITIES.forEach(function (f) {
  console.log("Added: " + f.id + " — " + f.name);
});
C8_EXPONENTS.forEach(function (f) {
  console.log("Added: " + f.id + " — " + f.name);
});

db.version = "4.6";
db.phase = "phase-inventory-a-class7-8-algebra";
db.updatedAt = NOW;

const index = writeSearchIndex(db, INDEX_PATH, NOW);
fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
console.log("Library v" + db.version + ", index count=" + index.totalEntries);
