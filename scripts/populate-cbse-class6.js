"use strict";

/**
 * Populate CBSE Class 6 only — syllabus-driven.
 * Textbook names appear only in optional referenceBooks / source metadata.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");

const YEAR = "2026-27";
const NOW = "2026-07-26T00:00:00.000Z";
const REF_BOOKS = ["NCERT", "Ganita Prakash"];

const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

db.version = "3.3";
db.phase = "phase-2-cbse-class-6";
db.schema.chapter.referenceBooks = ["string (optional textbook metadata only)"];
db.schema.formula = {
  id: "string (unique across all boards, e.g. CBSE-C6-AR-001)",
  board: "string",
  syllabusYear: "string",
  class: "string",
  subject: "string",
  chapter: "string",
  chapterNumber: "number",
  name: "string",
  formula: "string",
  latex: "string",
  variables: [{ symbol: "string", meaning: "string" }],
  description: "string",
  example: "string",
  notes: "string | null",
  practiceQuestions: [{ question: "string", answer: "string" }],
  difficulty: "Easy | Medium | Hard",
  examTags: ["string"],
  verification: "Draft | Reviewed | Verified",
  createdAt: "ISO datetime",
  updatedAt: "ISO datetime",
  version: "number",
  source: {
    board: "string",
    syllabusYear: "string",
    referenceBook: "string | null",
    chapterReference: "string"
  },
  ncertReference: {
    book: "string | null",
    chapter: "string | null",
    exercise: "string | null",
    page: "string | null"
  },
  videoExplanation: {
    title: "string",
    url: "string",
    duration: "string"
  },
  quiz: { enabled: "boolean", totalQuestions: "number" },
  relatedFormulas: ["string"],
  keywords: ["string"],
  isFavourite: "boolean",
  viewCount: "number",
  lastViewed: "ISO datetime | null"
};

function makeFormula(p) {
  return {
    id: p.id,
    board: "CBSE",
    syllabusYear: YEAR,
    class: "Class 6",
    subject: p.subject,
    chapter: p.chapter,
    chapterNumber: p.chapterNumber,
    name: p.name,
    formula: p.formula,
    latex: p.latex,
    variables: p.variables || [],
    description: p.description,
    example: p.example,
    notes: p.notes != null ? p.notes : null,
    practiceQuestions: p.practiceQuestions || [],
    difficulty: p.difficulty || "Easy",
    examTags: p.examTags || ["CBSE", "Class 6"],
    verification: p.verification || "Reviewed",
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: p.referenceBook != null ? p.referenceBook : "NCERT",
      chapterReference:
        p.chapterReference ||
        "Class 6 Mathematics — Chapter " + p.chapterNumber + ": " + p.chapter
    },
    ncertReference: p.ncertReference || {
      book: null,
      chapter: "Chapter " + p.chapterNumber + ": " + p.chapter,
      exercise: null,
      page: null
    },
    videoExplanation: null,
    quiz: { enabled: false, totalQuestions: 0 },
    relatedFormulas: p.relatedFormulas || [],
    keywords: p.keywords || [],
    isFavourite: false,
    viewCount: 0,
    lastViewed: null
  };
}

function makeChapter(meta, formulas) {
  return {
    id: meta.id,
    title: meta.title,
    chapterNumber: meta.chapterNumber,
    chapterCode: meta.chapterCode,
    board: "CBSE",
    class: "Class 6",
    subject: meta.subject,
    difficulty: meta.difficulty || "Easy",
    estimatedStudyTime: meta.estimatedStudyTime || "45 min",
    referenceBooks: meta.referenceBooks || REF_BOOKS.slice(),
    syllabus: {
      board: "CBSE",
      class: "Class 6",
      subject: meta.subject,
      chapter: meta.title,
      syllabusYear: YEAR
    },
    formulas: formulas
  };
}

/* ========== ARITHMETIC ========== */

const ch1 = [
  makeFormula({
    id: "CBSE-C6-AR-001",
    subject: "Arithmetic",
    chapter: "Patterns in Mathematics",
    chapterNumber: 1,
    name: "nth Odd Number",
    formula: "nth odd number = 2n − 1",
    latex: "a_n = 2n - 1",
    variables: [
      { symbol: "n", meaning: "Position of the term (natural number, n ≥ 1)" },
      { symbol: "a_n", meaning: "The nth odd number" }
    ],
    description:
      "Odd numbers form the sequence 1, 3, 5, 7, … The nth odd number is obtained by doubling n and subtracting 1.",
    example:
      "Find the 8th odd number. a_8 = 2×8 − 1 = 16 − 1 = 15. So the 8th odd number is 15.",
    notes: "Class 6 pattern rule only — not an algebraic identity of higher classes.",
    practiceQuestions: [
      { question: "Find the 12th odd number.", answer: "2×12 − 1 = 23" },
      { question: "Which position has the odd number 21?", answer: "2n − 1 = 21 ⇒ n = 11" }
    ],
    relatedFormulas: ["CBSE-C6-AR-002"],
    keywords: ["odd", "pattern", "sequence", "2n-1"],
    examTags: ["CBSE", "Class 6", "Patterns"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-002",
    subject: "Arithmetic",
    chapter: "Patterns in Mathematics",
    chapterNumber: 1,
    name: "nth Even Number",
    formula: "nth even number = 2n",
    latex: "a_n = 2n",
    variables: [
      { symbol: "n", meaning: "Position of the term (n ≥ 1)" },
      { symbol: "a_n", meaning: "The nth even number" }
    ],
    description: "Even numbers form the sequence 2, 4, 6, 8, … The nth even number is twice n.",
    example: "Find the 9th even number. a_9 = 2×9 = 18.",
    notes: "For n = 1, the first even counting number in this pattern is taken as 2.",
    practiceQuestions: [{ question: "Find the 15th even number.", answer: "2×15 = 30" }],
    relatedFormulas: ["CBSE-C6-AR-001"],
    keywords: ["even", "pattern", "sequence", "2n"],
    examTags: ["CBSE", "Class 6", "Patterns"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-003",
    subject: "Arithmetic",
    chapter: "Patterns in Mathematics",
    chapterNumber: 1,
    name: "nth Triangular Number",
    formula: "T_n = n(n + 1)/2",
    latex: "T_n = \\frac{n(n+1)}{2}",
    variables: [
      { symbol: "n", meaning: "Position / number of rows in the triangle pattern" },
      { symbol: "T_n", meaning: "nth triangular number" }
    ],
    description:
      "Triangular numbers count dots arranged in a triangular pattern: 1, 3, 6, 10, 15, …",
    example: "Find T_5. T_5 = 5×6/2 = 15.",
    notes: "This is a Class 6 pattern formula, not a mensuration area formula.",
    practiceQuestions: [{ question: "Find the 7th triangular number.", answer: "7×8/2 = 28" }],
    difficulty: "Medium",
    relatedFormulas: ["CBSE-C6-AR-004"],
    keywords: ["triangular", "pattern", "T_n"],
    examTags: ["CBSE", "Class 6", "Patterns"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-004",
    subject: "Arithmetic",
    chapter: "Patterns in Mathematics",
    chapterNumber: 1,
    name: "nth Square Number",
    formula: "S_n = n²",
    latex: "S_n = n^2",
    variables: [
      { symbol: "n", meaning: "Natural number" },
      { symbol: "S_n", meaning: "nth square number" }
    ],
    description: "Square numbers are 1, 4, 9, 16, 25, … obtained by multiplying a number by itself.",
    example: "Find the 6th square number. S_6 = 6² = 36.",
    notes: null,
    practiceQuestions: [
      { question: "Is 50 a square number?", answer: "No. 7²=49 and 8²=64." }
    ],
    relatedFormulas: ["CBSE-C6-AR-003", "CBSE-C6-AR-005"],
    keywords: ["square number", "pattern"],
    examTags: ["CBSE", "Class 6", "Patterns"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-005",
    subject: "Arithmetic",
    chapter: "Patterns in Mathematics",
    chapterNumber: 1,
    name: "nth Cube Number",
    formula: "C_n = n³",
    latex: "C_n = n^3",
    variables: [
      { symbol: "n", meaning: "Natural number" },
      { symbol: "C_n", meaning: "nth cube number" }
    ],
    description: "Cube numbers are 1, 8, 27, 64, … obtained by multiplying a number by itself three times.",
    example: "Find the 4th cube number. C_4 = 4³ = 64.",
    notes: "Cube numbers as patterns only; solid volume formulas belong to higher classes.",
    practiceQuestions: [{ question: "Find 5³.", answer: "125" }],
    relatedFormulas: ["CBSE-C6-AR-004"],
    keywords: ["cube number", "pattern"],
    examTags: ["CBSE", "Class 6", "Patterns"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-006",
    subject: "Arithmetic",
    chapter: "Patterns in Mathematics",
    chapterNumber: 1,
    name: "Fibonacci Sequence Rule",
    formula: "F_n = F_{n−1} + F_{n−2} (with F_1 = 1, F_2 = 1)",
    latex: "F_n = F_{n-1} + F_{n-2},\\quad F_1=1,\\ F_2=1",
    variables: [
      { symbol: "F_n", meaning: "nth Fibonacci number" },
      { symbol: "n", meaning: "Position in the sequence (n ≥ 3)" }
    ],
    description:
      "Each Fibonacci number is the sum of the two numbers before it: 1, 1, 2, 3, 5, 8, 13, …",
    example: "Find F_7. Sequence: 1, 1, 2, 3, 5, 8, 13. So F_7 = 13.",
    notes: "Starting values may be shown as 1, 1 or 0, 1 depending on convention.",
    practiceQuestions: [
      { question: "Find the next term after 8, 13.", answer: "8+13=21" }
    ],
    difficulty: "Medium",
    relatedFormulas: ["CBSE-C6-AR-003"],
    keywords: ["fibonacci", "pattern", "sequence"],
    examTags: ["CBSE", "Class 6", "Patterns"]
  })
];

const ch3 = [
  makeFormula({
    id: "CBSE-C6-AR-007",
    subject: "Arithmetic",
    chapter: "Number Play",
    chapterNumber: 3,
    name: "Place Value of a Digit",
    formula: "Place value = digit × value of its place",
    latex: "\\text{Place value} = d \\times 10^{k}",
    variables: [
      { symbol: "d", meaning: "The digit (0–9)" },
      { symbol: "k", meaning: "Place index (ones ⇒ 0, tens ⇒ 1, hundreds ⇒ 2, …)" }
    ],
    description:
      "The place value of a digit depends on its position in the number (ones, tens, hundreds, …).",
    example: "In 4,582 the place value of 5 is 5 × 100 = 500.",
    notes: "Face value of a digit is the digit itself; place value depends on position.",
    practiceQuestions: [
      { question: "Find place value of 7 in 7,305.", answer: "7 × 1000 = 7000" }
    ],
    relatedFormulas: ["CBSE-C6-AR-008"],
    keywords: ["place value", "digit", "number"],
    examTags: ["CBSE", "Class 6", "Number Play"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-008",
    subject: "Arithmetic",
    chapter: "Number Play",
    chapterNumber: 3,
    name: "Expanded Form of a Number",
    formula: "Number = sum of (each digit × its place value)",
    latex: "N = \\sum d_i \\times 10^{i}",
    variables: [
      { symbol: "N", meaning: "The given number" },
      { symbol: "d_i", meaning: "Digit in the 10^i place" }
    ],
    description:
      "Expanded form writes a number as the sum of the place values of its digits.",
    example: "3,406 = 3×1000 + 4×100 + 0×10 + 6×1 = 3000 + 400 + 6.",
    notes: null,
    practiceQuestions: [
      { question: "Write 5208 in expanded form.", answer: "5000 + 200 + 8" }
    ],
    relatedFormulas: ["CBSE-C6-AR-007"],
    keywords: ["expanded form", "place value"],
    examTags: ["CBSE", "Class 6", "Number Play"]
  })
];

const ch5 = [
  makeFormula({
    id: "CBSE-C6-AR-009",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "Factor Relation",
    formula: "If a is a factor of b, then b = a × k for some whole number k",
    latex: "b = a \\times k",
    variables: [
      { symbol: "a", meaning: "Factor" },
      { symbol: "b", meaning: "Multiple / given number" },
      { symbol: "k", meaning: "Whole number quotient" }
    ],
    description: "A factor of a number divides it exactly, leaving no remainder.",
    example: "4 is a factor of 20 because 20 = 4 × 5.",
    notes: "1 is a factor of every whole number; every number is a factor of itself.",
    practiceQuestions: [{ question: "Is 6 a factor of 42?", answer: "Yes, 42 = 6 × 7" }],
    relatedFormulas: ["CBSE-C6-AR-010"],
    keywords: ["factor", "divides"],
    examTags: ["CBSE", "Class 6", "Factors"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-010",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "Multiple Relation",
    formula: "Multiples of a = a, 2a, 3a, 4a, …",
    latex: "m = a \\times n \\ (n = 1,2,3,\\ldots)",
    variables: [
      { symbol: "a", meaning: "Given whole number" },
      { symbol: "m", meaning: "A multiple of a" },
      { symbol: "n", meaning: "Natural number multiplier" }
    ],
    description: "Multiples of a number are obtained by multiplying it by 1, 2, 3, …",
    example: "Multiples of 5 include 5, 10, 15, 20, …",
    notes: null,
    practiceQuestions: [
      { question: "Write the first four multiples of 8.", answer: "8, 16, 24, 32" }
    ],
    relatedFormulas: ["CBSE-C6-AR-009", "CBSE-C6-AR-016"],
    keywords: ["multiple", "times table", "common multiple"],
    examTags: ["CBSE", "Class 6", "Multiples"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-011",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "Divisibility Rule for 2",
    formula: "A number is divisible by 2 if its ones digit is 0, 2, 4, 6 or 8",
    latex: "\\text{ones digit} \\in \\{0,2,4,6,8\\}",
    variables: [{ symbol: "ones digit", meaning: "Last digit of the number" }],
    description: "Even numbers are exactly the numbers divisible by 2.",
    example: "148 ends with 8, so 148 is divisible by 2.",
    notes: null,
    practiceQuestions: [
      { question: "Is 2,357 divisible by 2?", answer: "No, it ends with 7." }
    ],
    relatedFormulas: ["CBSE-C6-AR-013", "CBSE-C6-AR-015"],
    keywords: ["divisibility", "divisible by 2"],
    examTags: ["CBSE", "Class 6", "Divisibility"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-012",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "Divisibility Rule for 3",
    formula: "A number is divisible by 3 if the sum of its digits is divisible by 3",
    latex: "\\sum \\text{digits} \\equiv 0 \\pmod{3}",
    variables: [
      { symbol: "sum of digits", meaning: "Total obtained by adding all digits" }
    ],
    description: "Check divisibility by 3 without long division.",
    example: "For 252: 2+5+2=9, and 9 is divisible by 3, so 252 is divisible by 3.",
    notes: "You may repeatedly sum digits until a single digit remains.",
    practiceQuestions: [
      { question: "Is 471 divisible by 3?", answer: "4+7+1=12, yes." }
    ],
    relatedFormulas: ["CBSE-C6-AR-014"],
    keywords: ["divisibility by 3"],
    examTags: ["CBSE", "Class 6", "Divisibility"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-013",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "Divisibility Rule for 5",
    formula: "A number is divisible by 5 if its ones digit is 0 or 5",
    latex: "\\text{ones digit} \\in \\{0,5\\}",
    variables: [{ symbol: "ones digit", meaning: "Last digit of the number" }],
    description: "Numbers ending in 0 or 5 are divisible by 5.",
    example: "680 ends with 0, so it is divisible by 5.",
    notes: null,
    practiceQuestions: [{ question: "Is 1,234 divisible by 5?", answer: "No." }],
    relatedFormulas: ["CBSE-C6-AR-011", "CBSE-C6-AR-015"],
    keywords: ["divisibility by 5"],
    examTags: ["CBSE", "Class 6", "Divisibility"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-014",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "Divisibility Rule for 9",
    formula: "A number is divisible by 9 if the sum of its digits is divisible by 9",
    latex: "\\sum \\text{digits} \\equiv 0 \\pmod{9}",
    variables: [
      { symbol: "sum of digits", meaning: "Sum of all digits of the number" }
    ],
    description: "Similar to the rule for 3, but the digit sum must be divisible by 9.",
    example: "For 729: 7+2+9=18, and 18 is divisible by 9, so 729 is divisible by 9.",
    notes: null,
    practiceQuestions: [
      { question: "Is 405 divisible by 9?", answer: "4+0+5=9, yes." }
    ],
    relatedFormulas: ["CBSE-C6-AR-012"],
    keywords: ["divisibility by 9"],
    examTags: ["CBSE", "Class 6", "Divisibility"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-015",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "Divisibility Rule for 10",
    formula: "A number is divisible by 10 if its ones digit is 0",
    latex: "\\text{ones digit} = 0",
    variables: [{ symbol: "ones digit", meaning: "Last digit of the number" }],
    description: "A number ending with 0 is divisible by 10.",
    example: "940 ends with 0, so it is divisible by 10.",
    notes: null,
    practiceQuestions: [
      { question: "Is 505 divisible by 10?", answer: "No, it ends with 5." }
    ],
    relatedFormulas: ["CBSE-C6-AR-011", "CBSE-C6-AR-013"],
    keywords: ["divisibility by 10"],
    examTags: ["CBSE", "Class 6", "Divisibility"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-016",
    subject: "Arithmetic",
    chapter: "Prime Time",
    chapterNumber: 5,
    name: "HCF × LCM Relation (Two Numbers)",
    formula: "HCF(a, b) × LCM(a, b) = a × b",
    latex: "\\mathrm{HCF}(a,b)\\times \\mathrm{LCM}(a,b)=a\\times b",
    variables: [
      { symbol: "a, b", meaning: "Two positive whole numbers" },
      { symbol: "HCF", meaning: "Highest Common Factor" },
      { symbol: "LCM", meaning: "Lowest Common Multiple" }
    ],
    description:
      "For any two positive integers, the product of their HCF and LCM equals the product of the numbers.",
    example: "For 12 and 18: HCF=6, LCM=36. Check: 6×36=216 and 12×18=216.",
    notes: "This relation is stated for two numbers.",
    practiceQuestions: [
      { question: "If HCF(8,12)=4, find LCM(8,12).", answer: "LCM = (8×12)/4 = 24" }
    ],
    difficulty: "Medium",
    relatedFormulas: ["CBSE-C6-AR-009", "CBSE-C6-AR-010"],
    keywords: ["HCF", "LCM"],
    examTags: ["CBSE", "Class 6", "HCF", "LCM"]
  })
];

const ch7 = [
  makeFormula({
    id: "CBSE-C6-AR-017",
    subject: "Arithmetic",
    chapter: "Fractions",
    chapterNumber: 7,
    name: "Fraction Notation",
    formula: "Fraction = a/b (b ≠ 0)",
    latex: "\\frac{a}{b},\\quad b \\neq 0",
    variables: [
      { symbol: "a", meaning: "Numerator (parts taken)" },
      { symbol: "b", meaning: "Denominator (total equal parts)" }
    ],
    description: "A fraction represents equal parts of a whole.",
    example: "3 equal slices out of 8 give the fraction 3/8.",
    notes: "Denominator cannot be zero.",
    practiceQuestions: [
      { question: "What fraction is 5 shaded squares out of 12?", answer: "5/12" }
    ],
    relatedFormulas: ["CBSE-C6-AR-018"],
    keywords: ["fraction", "numerator", "denominator"],
    examTags: ["CBSE", "Class 6", "Fractions"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-018",
    subject: "Arithmetic",
    chapter: "Fractions",
    chapterNumber: 7,
    name: "Equivalent Fractions",
    formula: "a/b = (a × k)/(b × k) for any natural number k",
    latex: "\\frac{a}{b} = \\frac{a \\times k}{b \\times k}",
    variables: [
      { symbol: "a/b", meaning: "Given fraction" },
      { symbol: "k", meaning: "Natural number multiplier" }
    ],
    description:
      "Multiplying numerator and denominator by the same non-zero number gives an equivalent fraction.",
    example: "2/3 = (2×4)/(3×4) = 8/12.",
    notes: null,
    practiceQuestions: [
      { question: "Write two equivalent fractions of 3/5.", answer: "6/10, 9/15" }
    ],
    relatedFormulas: ["CBSE-C6-AR-017", "CBSE-C6-AR-019"],
    keywords: ["equivalent fractions"],
    examTags: ["CBSE", "Class 6", "Fractions"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-019",
    subject: "Arithmetic",
    chapter: "Fractions",
    chapterNumber: 7,
    name: "Addition of Like Fractions",
    formula: "a/c + b/c = (a + b)/c",
    latex: "\\frac{a}{c}+\\frac{b}{c}=\\frac{a+b}{c}",
    variables: [
      { symbol: "a, b", meaning: "Numerators" },
      { symbol: "c", meaning: "Common denominator" }
    ],
    description:
      "When denominators are the same, add the numerators and keep the denominator.",
    example: "2/7 + 3/7 = 5/7.",
    notes: "For unlike fractions, first make denominators equal.",
    practiceQuestions: [{ question: "Find 4/9 + 2/9.", answer: "6/9 = 2/3" }],
    relatedFormulas: ["CBSE-C6-AR-020", "CBSE-C6-AR-018"],
    keywords: ["add fractions", "like fractions"],
    examTags: ["CBSE", "Class 6", "Fractions"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-020",
    subject: "Arithmetic",
    chapter: "Fractions",
    chapterNumber: 7,
    name: "Subtraction of Like Fractions",
    formula: "a/c − b/c = (a − b)/c",
    latex: "\\frac{a}{c}-\\frac{b}{c}=\\frac{a-b}{c}",
    variables: [
      { symbol: "a, b", meaning: "Numerators" },
      { symbol: "c", meaning: "Common denominator" }
    ],
    description:
      "When denominators are the same, subtract the numerators and keep the denominator.",
    example: "7/10 − 3/10 = 4/10 = 2/5.",
    notes: null,
    practiceQuestions: [{ question: "Find 5/8 − 1/8.", answer: "4/8 = 1/2" }],
    relatedFormulas: ["CBSE-C6-AR-019"],
    keywords: ["subtract fractions"],
    examTags: ["CBSE", "Class 6", "Fractions"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-021",
    subject: "Arithmetic",
    chapter: "Fractions",
    chapterNumber: 7,
    name: "Improper Fraction to Mixed Number",
    formula: "a/b = q + r/b, where a = q×b + r",
    latex: "\\frac{a}{b} = q + \\frac{r}{b},\\quad a = qb + r",
    variables: [
      { symbol: "a/b", meaning: "Improper fraction (a ≥ b)" },
      { symbol: "q", meaning: "Whole-number quotient" },
      { symbol: "r", meaning: "Remainder (0 ≤ r < b)" }
    ],
    description:
      "Divide numerator by denominator; quotient is the whole part and remainder forms the fractional part.",
    example: "17/5 = 3 + 2/5, because 17 = 3×5 + 2 (mixed number: 3 2/5).",
    notes: null,
    practiceQuestions: [
      { question: "Convert 14/3 to a mixed number.", answer: "4 2/3" }
    ],
    difficulty: "Medium",
    relatedFormulas: ["CBSE-C6-AR-017"],
    keywords: ["improper fraction", "mixed number"],
    examTags: ["CBSE", "Class 6", "Fractions"]
  })
];

const ch10 = [
  makeFormula({
    id: "CBSE-C6-AR-022",
    subject: "Arithmetic",
    chapter: "The Other Side of Zero",
    chapterNumber: 10,
    name: "Absolute Value",
    formula: "|a| = distance of a from 0 on the number line",
    latex: "|a| = a \\text{ if } a \\ge 0;\\quad |a| = -a \\text{ if } a < 0",
    variables: [
      { symbol: "a", meaning: "An integer" },
      { symbol: "|a|", meaning: "Absolute value (non-negative)" }
    ],
    description: "Absolute value measures how far a number is from zero, ignoring direction.",
    example: "|−7| = 7 and |7| = 7.",
    notes: "Absolute value is never negative.",
    practiceQuestions: [{ question: "Find |−15|.", answer: "15" }],
    relatedFormulas: ["CBSE-C6-AR-023"],
    keywords: ["absolute value", "integers"],
    examTags: ["CBSE", "Class 6", "Integers"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-023",
    subject: "Arithmetic",
    chapter: "The Other Side of Zero",
    chapterNumber: 10,
    name: "Additive Inverse",
    formula: "a + (−a) = 0",
    latex: "a+(-a)=0",
    variables: [
      { symbol: "a", meaning: "An integer" },
      { symbol: "−a", meaning: "Additive inverse of a" }
    ],
    description: "Every integer has an opposite that sums with it to zero.",
    example: "The additive inverse of 9 is −9 because 9+(−9)=0.",
    notes: "The additive inverse of 0 is 0.",
    practiceQuestions: [
      { question: "What is the additive inverse of −4?", answer: "4" }
    ],
    relatedFormulas: ["CBSE-C6-AR-022", "CBSE-C6-AR-024"],
    keywords: ["additive inverse", "integers"],
    examTags: ["CBSE", "Class 6", "Integers"]
  }),
  makeFormula({
    id: "CBSE-C6-AR-024",
    subject: "Arithmetic",
    chapter: "The Other Side of Zero",
    chapterNumber: 10,
    name: "Integer Addition on the Number Line",
    formula: "Add +k → move k units right; add −k → move k units left",
    latex: "a+(+k)\\rightarrow\\text{right};\\ a+(-k)\\rightarrow\\text{left}",
    variables: [
      { symbol: "a", meaning: "Starting integer" },
      { symbol: "k", meaning: "Positive number of units to move" }
    ],
    description: "Integer addition can be modelled by moves on the number line.",
    example: "Start at 3; add −5 → move 5 left → −2. So 3+(−5)=−2.",
    notes: "Class 6 emphasises number-line understanding of integer operations.",
    practiceQuestions: [
      { question: "Using the number line, find (−2)+6.", answer: "4" }
    ],
    difficulty: "Medium",
    relatedFormulas: ["CBSE-C6-AR-023"],
    keywords: ["integer addition", "number line"],
    examTags: ["CBSE", "Class 6", "Integers"]
  })
];

/* ========== GEOMETRY ========== */

const ch2 = [
  makeFormula({
    id: "CBSE-C6-GE-001",
    subject: "Geometry",
    chapter: "Lines and Angles",
    chapterNumber: 2,
    name: "Right Angle",
    formula: "Right angle = 90°",
    latex: "\\angle=90^\\circ",
    variables: [{ symbol: "∠", meaning: "Angle measure in degrees" }],
    description: "An angle that measures exactly 90° is a right angle.",
    example: "The corner of a square page is a right angle (90°).",
    notes: "Acute < 90°, obtuse between 90° and 180°.",
    practiceQuestions: [{ question: "Classify 90°.", answer: "Right angle" }],
    relatedFormulas: ["CBSE-C6-GE-002", "CBSE-C6-GE-004"],
    keywords: ["right angle", "90 degrees"],
    examTags: ["CBSE", "Class 6", "Angles"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-002",
    subject: "Geometry",
    chapter: "Lines and Angles",
    chapterNumber: 2,
    name: "Straight Angle",
    formula: "Straight angle = 180°",
    latex: "\\angle=180^\\circ",
    variables: [{ symbol: "∠", meaning: "Angle measure in degrees" }],
    description: "An angle that forms a straight line measures 180°.",
    example: "A straight angle looks like a straight line and measures 180°.",
    notes: null,
    practiceQuestions: [
      { question: "Measure of a straight angle?", answer: "180°" }
    ],
    relatedFormulas: ["CBSE-C6-GE-005", "CBSE-C6-GE-003"],
    keywords: ["straight angle", "180 degrees"],
    examTags: ["CBSE", "Class 6", "Angles"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-003",
    subject: "Geometry",
    chapter: "Lines and Angles",
    chapterNumber: 2,
    name: "Complete Angle",
    formula: "Complete angle = 360°",
    latex: "\\angle=360^\\circ",
    variables: [{ symbol: "∠", meaning: "Full turn about a point" }],
    description: "A complete angle is one full rotation about a point.",
    example: "Turning fully around to the same direction is a 360° turn.",
    notes: null,
    practiceQuestions: [
      { question: "How many right angles make one complete angle?", answer: "4" }
    ],
    relatedFormulas: ["CBSE-C6-GE-001"],
    keywords: ["complete angle", "360 degrees"],
    examTags: ["CBSE", "Class 6", "Angles"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-004",
    subject: "Geometry",
    chapter: "Lines and Angles",
    chapterNumber: 2,
    name: "Complementary Angles",
    formula: "∠A + ∠B = 90°",
    latex: "\\angle A+\\angle B=90^\\circ",
    variables: [
      { symbol: "∠A, ∠B", meaning: "Two complementary angles" }
    ],
    description: "Two angles are complementary if their measures sum to 90°.",
    example: "If ∠A = 35°, complement = 90° − 35° = 55°.",
    notes: "Complementary angles need not be adjacent.",
    practiceQuestions: [
      { question: "Find the complement of 48°.", answer: "42°" }
    ],
    relatedFormulas: ["CBSE-C6-GE-005", "CBSE-C6-GE-001"],
    keywords: ["complementary angles"],
    examTags: ["CBSE", "Class 6", "Angles"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-005",
    subject: "Geometry",
    chapter: "Lines and Angles",
    chapterNumber: 2,
    name: "Supplementary Angles",
    formula: "∠A + ∠B = 180°",
    latex: "\\angle A+\\angle B=180^\\circ",
    variables: [
      { symbol: "∠A, ∠B", meaning: "Two supplementary angles" }
    ],
    description: "Two angles are supplementary if their measures sum to 180°.",
    example: "If ∠A = 110°, supplement = 180° − 110° = 70°.",
    notes: "Angles on a straight line are supplementary.",
    practiceQuestions: [
      { question: "Find the supplement of 125°.", answer: "55°" }
    ],
    relatedFormulas: ["CBSE-C6-GE-004", "CBSE-C6-GE-002"],
    keywords: ["supplementary angles"],
    examTags: ["CBSE", "Class 6", "Angles"]
  })
];

const ch8 = [
  makeFormula({
    id: "CBSE-C6-GE-006",
    subject: "Geometry",
    chapter: "Playing with Constructions",
    chapterNumber: 8,
    name: "Circle Defined by Radius",
    formula: "A circle is the set of all points at fixed distance r from centre O",
    latex: "\\{P: OP=r\\}",
    variables: [
      { symbol: "O", meaning: "Centre" },
      { symbol: "r", meaning: "Radius" },
      { symbol: "P", meaning: "Any point on the circle" }
    ],
    description:
      "With compass and ruler, a circle is drawn by keeping a constant radius from the centre.",
    example: "If radius is 4 cm, every point on the circle is 4 cm from the centre.",
    notes: "Class 6 focuses on construction; π-based circumference depth belongs later.",
    practiceQuestions: [
      {
        question: "If OP = 5 cm for every point P on a circle with centre O, find radius.",
        answer: "5 cm"
      }
    ],
    relatedFormulas: ["CBSE-C6-GE-007"],
    keywords: ["circle", "radius", "construction"],
    examTags: ["CBSE", "Class 6", "Constructions"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-007",
    subject: "Geometry",
    chapter: "Playing with Constructions",
    chapterNumber: 8,
    name: "Perpendicular Bisector Property",
    formula: "Any point on the perpendicular bisector of AB is equidistant from A and B",
    latex: "PA=PB\\text{ for }P\\text{ on the perpendicular bisector of }AB",
    variables: [
      { symbol: "A, B", meaning: "Endpoints of the segment" },
      { symbol: "M", meaning: "Midpoint of AB" },
      { symbol: "P", meaning: "Point on the perpendicular bisector" }
    ],
    description:
      "The perpendicular bisector meets a segment at its midpoint at 90° and is the locus of equidistant points.",
    example: "If M is midpoint of AB and line l ⊥ AB at M, then for any P on l, PA = PB.",
    notes: null,
    practiceQuestions: [
      {
        question: "Where does the perpendicular bisector meet AB?",
        answer: "At the midpoint, at 90°."
      }
    ],
    difficulty: "Medium",
    relatedFormulas: ["CBSE-C6-GE-006"],
    keywords: ["perpendicular bisector", "construction"],
    examTags: ["CBSE", "Class 6", "Constructions"]
  })
];

const ch9 = [
  makeFormula({
    id: "CBSE-C6-GE-008",
    subject: "Geometry",
    chapter: "Symmetry",
    chapterNumber: 9,
    name: "Line of Symmetry",
    formula: "A line of symmetry divides a figure into two mirror-image halves",
    latex: "\\text{reflection across }\\ell\\text{ maps the figure onto itself}",
    variables: [{ symbol: "ℓ", meaning: "Line of symmetry" }],
    description:
      "If one half of a figure is the mirror image of the other across a line, that line is a line of symmetry.",
    example: "A square has 4 lines of symmetry; a non-equilateral isosceles triangle has 1.",
    notes: "Some figures have no line of symmetry.",
    practiceQuestions: [
      {
        question: "How many lines of symmetry does an equilateral triangle have?",
        answer: "3"
      }
    ],
    relatedFormulas: ["CBSE-C6-GE-009"],
    keywords: ["line symmetry", "mirror"],
    examTags: ["CBSE", "Class 6", "Symmetry"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-009",
    subject: "Geometry",
    chapter: "Symmetry",
    chapterNumber: 9,
    name: "Order of Rotational Symmetry",
    formula: "Order = 360° ÷ (smallest angle of rotation that maps the figure onto itself)",
    latex: "\\text{Order}=\\frac{360^\\circ}{\\theta}",
    variables: [
      { symbol: "θ", meaning: "Smallest positive rotation angle of symmetry" },
      { symbol: "Order", meaning: "Number of matching positions in one full turn" }
    ],
    description:
      "Rotational symmetry exists when a figure looks the same after a turn less than 360° about its centre.",
    example: "A square matches every 90°, so order = 360/90 = 4.",
    notes: "Every figure has order at least 1.",
    practiceQuestions: [
      {
        question: "A regular hexagon matches every 60°. Find its order.",
        answer: "6"
      }
    ],
    difficulty: "Medium",
    relatedFormulas: ["CBSE-C6-GE-008", "CBSE-C6-GE-003"],
    keywords: ["rotational symmetry", "order"],
    examTags: ["CBSE", "Class 6", "Symmetry"]
  })
];

/* ========== MENSURATION ========== */

const ch6 = [
  makeFormula({
    id: "CBSE-C6-ME-001",
    subject: "Mensuration",
    chapter: "Perimeter and Area",
    chapterNumber: 6,
    name: "Perimeter of a Rectangle",
    formula: "P = 2(l + b)",
    latex: "P=2(l+b)",
    variables: [
      { symbol: "P", meaning: "Perimeter" },
      { symbol: "l", meaning: "Length" },
      { symbol: "b", meaning: "Breadth" }
    ],
    description: "Perimeter is the total boundary length. A rectangle has two lengths and two breadths.",
    example: "If l=12 cm and b=5 cm, P=2(12+5)=34 cm.",
    notes: "Perimeter units are units of length.",
    practiceQuestions: [
      { question: "Perimeter of a 9 m by 4 m rectangle?", answer: "26 m" }
    ],
    relatedFormulas: ["CBSE-C6-ME-004", "CBSE-C6-ME-002"],
    keywords: ["perimeter", "rectangle"],
    examTags: ["CBSE", "Class 6", "Perimeter"]
  }),
  makeFormula({
    id: "CBSE-C6-ME-002",
    subject: "Mensuration",
    chapter: "Perimeter and Area",
    chapterNumber: 6,
    name: "Perimeter of a Square",
    formula: "P = 4a",
    latex: "P=4a",
    variables: [
      { symbol: "P", meaning: "Perimeter" },
      { symbol: "a", meaning: "Side of the square" }
    ],
    description: "All four sides of a square are equal, so perimeter is four times one side.",
    example: "If a=6 cm, P=4×6=24 cm.",
    notes: null,
    practiceQuestions: [
      { question: "Square perimeter 40 cm. Find side.", answer: "10 cm" }
    ],
    relatedFormulas: ["CBSE-C6-ME-005", "CBSE-C6-ME-001"],
    keywords: ["perimeter", "square"],
    examTags: ["CBSE", "Class 6", "Perimeter"]
  }),
  makeFormula({
    id: "CBSE-C6-ME-003",
    subject: "Mensuration",
    chapter: "Perimeter and Area",
    chapterNumber: 6,
    name: "Perimeter of a Triangle",
    formula: "P = a + b + c",
    latex: "P=a+b+c",
    variables: [
      { symbol: "a, b, c", meaning: "Side lengths" },
      { symbol: "P", meaning: "Perimeter" }
    ],
    description: "The perimeter of a triangle is the sum of its three sides.",
    example: "Sides 3 cm, 4 cm, 5 cm ⇒ P=12 cm.",
    notes: null,
    practiceQuestions: [
      { question: "Perimeter of sides 7 cm, 8 cm, 9 cm?", answer: "24 cm" }
    ],
    relatedFormulas: ["CBSE-C6-ME-001"],
    keywords: ["perimeter", "triangle"],
    examTags: ["CBSE", "Class 6", "Perimeter"]
  }),
  makeFormula({
    id: "CBSE-C6-ME-004",
    subject: "Mensuration",
    chapter: "Perimeter and Area",
    chapterNumber: 6,
    name: "Area of a Rectangle",
    formula: "A = l × b",
    latex: "A=l\\times b",
    variables: [
      { symbol: "A", meaning: "Area" },
      { symbol: "l", meaning: "Length" },
      { symbol: "b", meaning: "Breadth" }
    ],
    description: "Area measures the enclosed region. For a rectangle, area is length times breadth.",
    example: "If l=10 cm and b=4 cm, A=40 cm².",
    notes: "Area units are square units. Perimeter and area are independent measures.",
    practiceQuestions: [
      { question: "Area of a 15 m by 6 m rectangle?", answer: "90 m²" }
    ],
    relatedFormulas: ["CBSE-C6-ME-001", "CBSE-C6-ME-005"],
    keywords: ["area", "rectangle"],
    examTags: ["CBSE", "Class 6", "Area"]
  }),
  makeFormula({
    id: "CBSE-C6-ME-005",
    subject: "Mensuration",
    chapter: "Perimeter and Area",
    chapterNumber: 6,
    name: "Area of a Square",
    formula: "A = a²",
    latex: "A=a^2",
    variables: [
      { symbol: "A", meaning: "Area" },
      { symbol: "a", meaning: "Side of the square" }
    ],
    description: "Area of a square is the side multiplied by itself.",
    example: "If a=9 cm, A=81 cm².",
    notes: "A larger perimeter does not always mean a larger area.",
    practiceQuestions: [
      { question: "Side 12 m. Find area of the square.", answer: "144 m²" }
    ],
    relatedFormulas: ["CBSE-C6-ME-002", "CBSE-C6-ME-004"],
    keywords: ["area", "square"],
    examTags: ["CBSE", "Class 6", "Area"]
  })
];

/* ========== DATA HANDLING ========== */

const ch4 = [
  makeFormula({
    id: "CBSE-C6-DH-001",
    subject: "Data Handling",
    chapter: "Data Handling and Presentation",
    chapterNumber: 4,
    name: "Frequency",
    formula: "Frequency of an item = number of times it occurs in the data",
    latex: "f(x)=\\text{count of }x",
    variables: [{ symbol: "f(x)", meaning: "Frequency of observation x" }],
    description:
      "Tally marks help count how often each value appears; that count is the frequency.",
    example: "In {2,3,2,2,5}, frequency of 2 is 3.",
    notes: "Tally marks are usually grouped in fives.",
    practiceQuestions: [
      { question: "Data: A,B,A,C,A,B. Frequency of A?", answer: "3" }
    ],
    relatedFormulas: ["CBSE-C6-DH-002"],
    keywords: ["frequency", "tally", "data"],
    examTags: ["CBSE", "Class 6", "Data Handling"]
  }),
  makeFormula({
    id: "CBSE-C6-DH-002",
    subject: "Data Handling",
    chapter: "Data Handling and Presentation",
    chapterNumber: 4,
    name: "Pictograph Scale",
    formula: "Actual value = (number of symbols) × (value of one symbol)",
    latex: "V=n\\times s",
    variables: [
      { symbol: "n", meaning: "Number of symbols" },
      { symbol: "s", meaning: "Scale value of one symbol" },
      { symbol: "V", meaning: "Actual quantity" }
    ],
    description:
      "In a pictograph, each picture stands for a fixed number of items according to the scale.",
    example: "If 1 symbol = 10 students and 4 symbols are shown, value = 40.",
    notes: "Always read the key/scale before interpreting.",
    practiceQuestions: [
      { question: "Scale: 1 icon = 5 books. Icons = 7. Books?", answer: "35" }
    ],
    relatedFormulas: ["CBSE-C6-DH-001", "CBSE-C6-DH-003"],
    keywords: ["pictograph", "scale"],
    examTags: ["CBSE", "Class 6", "Data Handling"]
  }),
  makeFormula({
    id: "CBSE-C6-DH-003",
    subject: "Data Handling",
    chapter: "Data Handling and Presentation",
    chapterNumber: 4,
    name: "Bar Graph Reading",
    formula: "Value = (bar height in axis units) × (scale of the axis)",
    latex: "V=h\\times s",
    variables: [
      { symbol: "h", meaning: "Bar height in axis units" },
      { symbol: "s", meaning: "Scale (value per unit)" },
      { symbol: "V", meaning: "Actual value" }
    ],
    description:
      "A bar graph uses bars of equal width; bar length represents the value for each category.",
    example: "If scale is 1 unit = 5 and bar reaches 6 units, value = 30.",
    notes: "Bars should be equally spaced with clear labels.",
    practiceQuestions: [
      { question: "Scale 1 cm = 2 goals. Bar height 9 cm. Goals?", answer: "18" }
    ],
    relatedFormulas: ["CBSE-C6-DH-002"],
    keywords: ["bar graph", "scale"],
    examTags: ["CBSE", "Class 6", "Data Handling"]
  })
];

const subjects = [
  {
    id: "arithmetic",
    title: "Arithmetic",
    icon: "➕",
    syllabus: {
      board: "CBSE",
      class: "Class 6",
      subject: "Arithmetic",
      syllabusYear: YEAR
    },
    chapters: [
      makeChapter(
        {
          id: "patterns-in-mathematics",
          title: "Patterns in Mathematics",
          chapterNumber: 1,
          chapterCode: "CBSE-C6-AR-CH01",
          subject: "Arithmetic",
          estimatedStudyTime: "50 min"
        },
        ch1
      ),
      makeChapter(
        {
          id: "number-play",
          title: "Number Play",
          chapterNumber: 3,
          chapterCode: "CBSE-C6-AR-CH03",
          subject: "Arithmetic",
          estimatedStudyTime: "40 min"
        },
        ch3
      ),
      makeChapter(
        {
          id: "prime-time",
          title: "Prime Time",
          chapterNumber: 5,
          chapterCode: "CBSE-C6-AR-CH05",
          subject: "Arithmetic",
          difficulty: "Medium",
          estimatedStudyTime: "60 min"
        },
        ch5
      ),
      makeChapter(
        {
          id: "fractions",
          title: "Fractions",
          chapterNumber: 7,
          chapterCode: "CBSE-C6-AR-CH07",
          subject: "Arithmetic",
          difficulty: "Medium",
          estimatedStudyTime: "55 min"
        },
        ch7
      ),
      makeChapter(
        {
          id: "the-other-side-of-zero",
          title: "The Other Side of Zero",
          chapterNumber: 10,
          chapterCode: "CBSE-C6-AR-CH10",
          subject: "Arithmetic",
          difficulty: "Medium",
          estimatedStudyTime: "50 min"
        },
        ch10
      )
    ]
  },
  {
    id: "geometry",
    title: "Geometry",
    icon: "📐",
    syllabus: {
      board: "CBSE",
      class: "Class 6",
      subject: "Geometry",
      syllabusYear: YEAR
    },
    chapters: [
      makeChapter(
        {
          id: "lines-and-angles",
          title: "Lines and Angles",
          chapterNumber: 2,
          chapterCode: "CBSE-C6-GE-CH02",
          subject: "Geometry",
          estimatedStudyTime: "50 min"
        },
        ch2
      ),
      makeChapter(
        {
          id: "playing-with-constructions",
          title: "Playing with Constructions",
          chapterNumber: 8,
          chapterCode: "CBSE-C6-GE-CH08",
          subject: "Geometry",
          difficulty: "Medium",
          estimatedStudyTime: "45 min"
        },
        ch8
      ),
      makeChapter(
        {
          id: "symmetry",
          title: "Symmetry",
          chapterNumber: 9,
          chapterCode: "CBSE-C6-GE-CH09",
          subject: "Geometry",
          estimatedStudyTime: "40 min"
        },
        ch9
      )
    ]
  },
  {
    id: "mensuration",
    title: "Mensuration",
    icon: "📏",
    syllabus: {
      board: "CBSE",
      class: "Class 6",
      subject: "Mensuration",
      syllabusYear: YEAR
    },
    chapters: [
      makeChapter(
        {
          id: "perimeter-and-area",
          title: "Perimeter and Area",
          chapterNumber: 6,
          chapterCode: "CBSE-C6-ME-CH06",
          subject: "Mensuration",
          estimatedStudyTime: "55 min"
        },
        ch6
      )
    ]
  },
  {
    id: "data-handling",
    title: "Data Handling",
    icon: "📊",
    syllabus: {
      board: "CBSE",
      class: "Class 6",
      subject: "Data Handling",
      syllabusYear: YEAR
    },
    chapters: [
      makeChapter(
        {
          id: "data-handling-and-presentation",
          title: "Data Handling and Presentation",
          chapterNumber: 4,
          chapterCode: "CBSE-C6-DH-CH04",
          subject: "Data Handling",
          estimatedStudyTime: "45 min"
        },
        ch4
      )
    ]
  }
];

const cbse = db.boards.find((b) => b.id === "cbse");
const class6 = cbse.classes.find((c) => c.id === "6");
class6.syllabus.scope.allowedSubjects = [
  "arithmetic",
  "geometry",
  "mensuration",
  "data-handling"
];
delete class6.syllabus.textbook;
class6.subjects = subjects;
cbse.lastUpdated = "2026-07-26";

fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n");

/* Build search index (all formulas currently present) */
const index = [];
db.boards.forEach((board) => {
  (board.classes || []).forEach((cls) => {
    (cls.subjects || []).forEach((subject) => {
      (subject.chapters || []).forEach((chapter) => {
        (chapter.formulas || []).forEach((f) => {
          index.push({
            id: f.id,
            boardId: board.id,
            board: f.board,
            classId: cls.id,
            class: f.class,
            subjectId: subject.id,
            subject: f.subject,
            chapterId: chapter.id,
            chapter: f.chapter,
            chapterNumber: f.chapterNumber,
            name: f.name,
            formula: f.formula,
            keywords: f.keywords || [],
            examTags: f.examTags || [],
            difficulty: f.difficulty,
            searchText: [
              f.name,
              f.formula,
              f.latex,
              f.description,
              f.example,
              f.notes,
              f.subject,
              f.chapter,
              f.class,
              f.board,
              (f.keywords || []).join(" "),
              (f.examTags || []).join(" ")
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
          });
        });
      });
    });
  });
});

fs.writeFileSync(
  INDEX_PATH,
  JSON.stringify(
    {
      generatedAt: NOW,
      totalEntries: index.length,
      entries: index
    },
    null,
    2
  ) + "\n"
);

console.log(
  JSON.stringify(
    {
      wrote: DATA_PATH,
      index: INDEX_PATH,
      subjects: subjects.map((s) => s.title),
      chapters: subjects.flatMap((s) =>
        s.chapters.map((c) => c.chapterNumber + ". " + c.title)
      ),
      formulaCount: index.length
    },
    null,
    2
  )
);
