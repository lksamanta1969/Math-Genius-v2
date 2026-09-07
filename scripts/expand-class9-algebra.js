/**
 * CBSE Class 9 Algebra — Formula Library milestone.
 * Run: node scripts/expand-class9-algebra.js
 *
 * Curriculum: NCERT Class 9 Mathematics Algebra unit only
 *   (Polynomials; Linear Equations in Two Variables).
 * Does not copy Class 8 square identities or Class 10 quadratics.
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

function c9Formula(p) {
  return baseMeta(Object.assign({ class: "Class 9", subject: "Algebra" }, p));
}

const C9_POLYNOMIALS = [
  c9Formula({
    id: "CBSE-C9-AL-001",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Polynomials in One Variable",
    name: "Degree of a Polynomial",
    formula: "deg(p) = highest power of x with a non-zero coefficient",
    latex: "\\deg p(x)=n\\;\\text{if}\\;p(x)=a_n x^n+\\cdots+a_0,\\;a_n\\neq 0",
    variables: [
      { symbol: "p(x)", meaning: "Polynomial in one variable x" },
      { symbol: "n", meaning: "Degree (highest power with non-zero coefficient)" },
      { symbol: "a_n", meaning: "Leading coefficient (a_n ≠ 0)" }
    ],
    description:
      "The degree of a polynomial is the highest power of the variable whose coefficient is not zero. A non-zero constant polynomial has degree 0.",
    example: "For p(x) = 4x³ − 2x + 7, deg(p) = 3 (cubic polynomial).",
    notes: "The zero polynomial is not assigned a degree in Class 9.",
    keywords: ["polynomial", "degree", "leading coefficient", "cubic", "quadratic"],
    relatedFormulaIds: ["CBSE-C9-AL-002", "CBSE-C9-AL-003"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Polynomials"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-002",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Zeroes of a Polynomial",
    name: "Zero of a Polynomial",
    formula: "p(α) = 0",
    latex: "p(\\alpha)=0",
    variables: [
      { symbol: "p(x)", meaning: "Polynomial in x" },
      { symbol: "α", meaning: "A zero (root) of p(x)" }
    ],
    description:
      "A number α is a zero of the polynomial p(x) if substituting x = α makes the polynomial equal to zero.",
    example: "For p(x) = x − 2, p(2) = 0, so 2 is a zero of p(x).",
    keywords: ["zero", "root", "polynomial", "value of a polynomial"],
    relatedFormulaIds: ["CBSE-C9-AL-003", "CBSE-C9-AL-004"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Polynomials"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-003",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Remainder Theorem",
    name: "Remainder Theorem",
    formula: "If p(x) is divided by (x − a), then remainder = p(a)",
    latex: "p(x)=(x-a)q(x)+p(a)",
    variables: [
      { symbol: "p(x)", meaning: "Dividend polynomial" },
      { symbol: "x − a", meaning: "Linear divisor" },
      { symbol: "q(x)", meaning: "Quotient polynomial" },
      { symbol: "p(a)", meaning: "Remainder (a constant)" }
    ],
    description:
      "When a polynomial p(x) is divided by the linear polynomial (x − a), the remainder is the constant p(a).",
    example: "For p(x) = x² + 3x + 2 divided by (x − 1), remainder = p(1) = 1 + 3 + 2 = 6.",
    notes: "The divisor must be linear of the form x − a. If the divisor is x + a, rewrite it as x − (−a) and evaluate p(−a).",
    difficulty: "Medium",
    keywords: ["remainder theorem", "polynomial", "division", "evaluate"],
    relatedFormulaIds: ["CBSE-C9-AL-002", "CBSE-C9-AL-004"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Polynomials"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-004",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Factor Theorem",
    name: "Factor Theorem",
    formula: "(x − a) is a factor of p(x) ⇔ p(a) = 0",
    latex: "(x-a)\\text{ is a factor of }p(x)\\iff p(a)=0",
    variables: [
      { symbol: "p(x)", meaning: "Polynomial in x" },
      { symbol: "x − a", meaning: "Proposed linear factor" },
      { symbol: "a", meaning: "Number being tested as a zero" }
    ],
    description:
      "A linear polynomial (x − a) is a factor of p(x) if and only if p(a) = 0. This is the Remainder Theorem when the remainder is zero.",
    example: "For p(x) = x² − 5x + 6, p(2) = 4 − 10 + 6 = 0, so (x − 2) is a factor. Indeed p(x) = (x − 2)(x − 3).",
    difficulty: "Medium",
    keywords: ["factor theorem", "factorisation", "zero", "linear factor"],
    relatedFormulaIds: ["CBSE-C9-AL-002", "CBSE-C9-AL-003"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Polynomials"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-005",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Algebraic Identities",
    name: "Square of a Trinomial",
    formula: "(x + y + z)² = x² + y² + z² + 2xy + 2yz + 2zx",
    latex: "(x+y+z)^2=x^2+y^2+z^2+2xy+2yz+2zx",
    variables: [
      { symbol: "x", meaning: "First term" },
      { symbol: "y", meaning: "Second term" },
      { symbol: "z", meaning: "Third term" }
    ],
    description:
      "The square of a three-term sum is the sum of the three squares plus twice each pairwise product. This extends the Class 8 identity (a + b)² to three terms.",
    example: "(1 + 2 + 3)² = 36, and 1 + 4 + 9 + 2(1)(2) + 2(2)(3) + 2(3)(1) = 14 + 4 + 12 + 6 = 36.",
    difficulty: "Medium",
    keywords: ["identity", "trinomial", "square", "(x+y+z)²", "polynomials"],
    relatedFormulaIds: ["CBSE-C8-AL-002", "CBSE-C9-AL-006", "CBSE-C9-AL-010"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Identities"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-006",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Algebraic Identities",
    name: "Cube of a Sum",
    formula: "(x + y)³ = x³ + y³ + 3xy(x + y)",
    latex: "(x+y)^3=x^3+y^3+3xy(x+y)",
    variables: [
      { symbol: "x", meaning: "First term" },
      { symbol: "y", meaning: "Second term" }
    ],
    description:
      "The cube of a binomial sum expands to the two cubes plus three times the product of the terms times their sum. Equivalently, (x + y)³ = x³ + 3x²y + 3xy² + y³.",
    example: "(2 + 1)³ = 27, and 2³ + 1³ + 3(2)(1)(2 + 1) = 8 + 1 + 18 = 27.",
    difficulty: "Medium",
    keywords: ["identity", "cube", "(x+y)³", "binomial", "polynomials"],
    relatedFormulaIds: ["CBSE-C9-AL-007", "CBSE-C9-AL-008"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Identities"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-007",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Algebraic Identities",
    name: "Cube of a Difference",
    formula: "(x − y)³ = x³ − y³ − 3xy(x − y)",
    latex: "(x-y)^3=x^3-y^3-3xy(x-y)",
    variables: [
      { symbol: "x", meaning: "First term" },
      { symbol: "y", meaning: "Second term" }
    ],
    description:
      "The cube of a binomial difference expands to the two cubes minus three times the product of the terms times their difference. Equivalently, (x − y)³ = x³ − 3x²y + 3xy² − y³.",
    example: "(3 − 1)³ = 8, and 3³ − 1³ − 3(3)(1)(3 − 1) = 27 − 1 − 18 = 8.",
    difficulty: "Medium",
    keywords: ["identity", "cube", "(x-y)³", "binomial", "polynomials"],
    relatedFormulaIds: ["CBSE-C9-AL-006", "CBSE-C9-AL-009"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Identities"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-008",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Algebraic Identities",
    name: "Sum of Cubes",
    formula: "x³ + y³ = (x + y)(x² − xy + y²)",
    latex: "x^3+y^3=(x+y)(x^2-xy+y^2)",
    variables: [
      { symbol: "x", meaning: "First term" },
      { symbol: "y", meaning: "Second term" }
    ],
    description:
      "The sum of two cubes factors as the sum of the terms times a quadratic factor x² − xy + y². Linked to the cube-of-a-sum identity.",
    example: "2³ + 3³ = 8 + 27 = 35, and (2 + 3)(4 − 6 + 9) = 5 × 7 = 35.",
    difficulty: "Medium",
    keywords: ["identity", "sum of cubes", "factorisation", "x³+y³"],
    relatedFormulaIds: ["CBSE-C9-AL-006", "CBSE-C9-AL-009"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Identities"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-009",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Algebraic Identities",
    name: "Difference of Cubes",
    formula: "x³ − y³ = (x − y)(x² + xy + y²)",
    latex: "x^3-y^3=(x-y)(x^2+xy+y^2)",
    variables: [
      { symbol: "x", meaning: "First term" },
      { symbol: "y", meaning: "Second term" }
    ],
    description:
      "The difference of two cubes factors as the difference of the terms times a quadratic factor x² + xy + y². This is the Class 9 cube analogue of the Class 8 difference of squares.",
    example: "3³ − 2³ = 27 − 8 = 19, and (3 − 2)(9 + 6 + 4) = 1 × 19 = 19.",
    difficulty: "Medium",
    keywords: ["identity", "difference of cubes", "factorisation", "x³-y³"],
    relatedFormulaIds: ["CBSE-C9-AL-007", "CBSE-C9-AL-008", "CBSE-C8-AL-001"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Identities"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-010",
    chapter: "Polynomials",
    chapterNumber: 1,
    topic: "Algebraic Identities",
    name: "Sum of Cubes of Three Terms",
    formula: "x³ + y³ + z³ − 3xyz = (x + y + z)(x² + y² + z² − xy − yz − zx)",
    latex: "x^3+y^3+z^3-3xyz=(x+y+z)(x^2+y^2+z^2-xy-yz-zx)",
    variables: [
      { symbol: "x", meaning: "First term" },
      { symbol: "y", meaning: "Second term" },
      { symbol: "z", meaning: "Third term" }
    ],
    description:
      "The sum of three cubes minus three times their product factors using the sum of the terms and a quadratic expression in the pairwise products.",
    example:
      "For x = 1, y = 2, z = 3: 1 + 8 + 27 − 18 = 18, and (1 + 2 + 3)(1 + 4 + 9 − 2 − 6 − 3) = 6 × 3 = 18.",
    notes: "If x + y + z = 0, then x³ + y³ + z³ = 3xyz.",
    difficulty: "Medium",
    keywords: ["identity", "three cubes", "3xyz", "polynomials", "factorisation"],
    relatedFormulaIds: ["CBSE-C9-AL-005", "CBSE-C9-AL-008"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 9 Mathematics — Chapter 2: Polynomials"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Polynomials",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Identities"]
  })
];

const C9_LINEAR_TWO_VAR = [
  c9Formula({
    id: "CBSE-C9-AL-011",
    chapter: "Linear Equations in Two Variables",
    chapterNumber: 2,
    topic: "Standard Form",
    name: "Linear Equation in Two Variables",
    formula: "ax + by + c = 0  (a and b not both zero)",
    latex: "ax+by+c=0\\;(a,b\\text{ not both zero})",
    variables: [
      { symbol: "x", meaning: "First variable" },
      { symbol: "y", meaning: "Second variable" },
      { symbol: "a", meaning: "Coefficient of x" },
      { symbol: "b", meaning: "Coefficient of y" },
      { symbol: "c", meaning: "Constant term" }
    ],
    description:
      "A linear equation in two variables is an equation of the first degree in x and y. Any equation that can be rewritten in this form is linear in two variables.",
    example: "2x + 3y − 6 = 0 is linear in two variables, with a = 2, b = 3, c = −6.",
    notes: "The graph of ax + by + c = 0 is a straight line. This extends the Class 7 one-variable equation ax + b = c.",
    keywords: ["linear equation", "two variables", "standard form", "degree 1"],
    relatedFormulaIds: ["CBSE-C7-AL-001", "CBSE-C9-AL-012", "CBSE-C9-AL-013"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 9 Mathematics — Chapter 4: Linear Equations in Two Variables"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 4: Linear Equations in Two Variables",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Linear Equations"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-012",
    chapter: "Linear Equations in Two Variables",
    chapterNumber: 2,
    topic: "Solutions",
    name: "Solution of a Linear Equation in Two Variables",
    formula: "(x₀, y₀) is a solution ⇔ a x₀ + b y₀ + c = 0",
    latex: "(x_0,y_0)\\text{ is a solution}\\iff ax_0+by_0+c=0",
    variables: [
      { symbol: "(x₀, y₀)", meaning: "Ordered pair of numbers" },
      { symbol: "a, b, c", meaning: "Coefficients of the equation ax + by + c = 0" }
    ],
    description:
      "An ordered pair that satisfies the equation is a solution. A linear equation in two variables has infinitely many solutions; each solution is a point on the graph of the line.",
    example: "For x + y − 5 = 0, the pair (2, 3) is a solution because 2 + 3 − 5 = 0. Another solution is (0, 5).",
    notes: "Do not confuse this with a pair of linear equations (simultaneous equations), which is Class 10.",
    keywords: ["solution", "ordered pair", "linear equation", "infinitely many solutions"],
    relatedFormulaIds: ["CBSE-C9-AL-011", "CBSE-C9-AL-013", "CBSE-C9-AL-014"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 9 Mathematics — Chapter 4: Linear Equations in Two Variables"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 4: Linear Equations in Two Variables",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Linear Equations"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-013",
    chapter: "Linear Equations in Two Variables",
    chapterNumber: 2,
    topic: "Lines Parallel to the Axes",
    name: "Line Parallel to the y-axis",
    formula: "x = a",
    latex: "x=a",
    variables: [
      { symbol: "x", meaning: "Variable whose value is fixed" },
      { symbol: "a", meaning: "Constant x-intercept (the line meets the x-axis at (a, 0))" }
    ],
    description:
      "The equation x = a represents the vertical line through (a, 0), parallel to the y-axis. Every point on this line has x-coordinate a.",
    example: "x = 3 is the line through (3, 0), (3, 1) and (3, −2), parallel to the y-axis.",
    notes: "In standard form this is 1·x + 0·y − a = 0.",
    keywords: ["vertical line", "parallel to y-axis", "x = a", "graph"],
    relatedFormulaIds: ["CBSE-C9-AL-011", "CBSE-C9-AL-014"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 9 Mathematics — Chapter 4: Linear Equations in Two Variables"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 4: Linear Equations in Two Variables",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Linear Equations"]
  }),
  c9Formula({
    id: "CBSE-C9-AL-014",
    chapter: "Linear Equations in Two Variables",
    chapterNumber: 2,
    topic: "Lines Parallel to the Axes",
    name: "Line Parallel to the x-axis",
    formula: "y = b",
    latex: "y=b",
    variables: [
      { symbol: "y", meaning: "Variable whose value is fixed" },
      { symbol: "b", meaning: "Constant y-intercept (the line meets the y-axis at (0, b))" }
    ],
    description:
      "The equation y = b represents the horizontal line through (0, b), parallel to the x-axis. Every point on this line has y-coordinate b.",
    example: "y = −2 is the line through (0, −2), (1, −2) and (−3, −2), parallel to the x-axis.",
    notes: "In standard form this is 0·x + 1·y − b = 0.",
    keywords: ["horizontal line", "parallel to x-axis", "y = b", "graph"],
    relatedFormulaIds: ["CBSE-C9-AL-011", "CBSE-C9-AL-013"],
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference:
        "Class 9 Mathematics — Chapter 4: Linear Equations in Two Variables"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 4: Linear Equations in Two Variables",
      exercise: null,
      page: null
    },
    examTags: ["CBSE", "Class 9", "Linear Equations"]
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

function countSubject(subject) {
  return (subject.chapters || []).reduce(function (n, ch) {
    return n + (ch.formulas || []).length;
  }, 0);
}

function snapshotAlgebra(classId) {
  const cls = findCbseClass(classId);
  const sub = findAlgebraSubject(cls);
  return {
    class: cls.title,
    chapters: (sub.chapters || []).length,
    formulas: countSubject(sub),
    titles: (sub.chapters || []).map(function (ch) {
      return ch.title + " (" + (ch.formulas || []).length + ")";
    })
  };
}

const before = {
  c6: snapshotAlgebra("6"),
  c7: snapshotAlgebra("7"),
  c8: snapshotAlgebra("8"),
  c9: snapshotAlgebra("9")
};

const class9 = findCbseClass("9");
const algebra9 = findAlgebraSubject(class9);
if ((algebra9.chapters || []).length > 0) {
  console.error("Class 9 Algebra already has chapters; aborting to avoid overwrite");
  process.exit(1);
}

algebra9.chapters = [
  makeChapter(
    {
      id: "polynomials",
      title: "Polynomials",
      chapterNumber: 1,
      chapterCode: "CBSE-C9-AL-CH01",
      class: "Class 9",
      subject: "Algebra",
      difficulty: "Medium",
      estimatedStudyTime: "60 min"
    },
    C9_POLYNOMIALS
  ),
  makeChapter(
    {
      id: "linear-equations-in-two-variables",
      title: "Linear Equations in Two Variables",
      chapterNumber: 2,
      chapterCode: "CBSE-C9-AL-CH02",
      class: "Class 9",
      subject: "Algebra",
      difficulty: "Easy",
      estimatedStudyTime: "45 min"
    },
    C9_LINEAR_TWO_VAR
  )
];

C9_POLYNOMIALS.forEach(function (f) {
  console.log("Added: " + f.id + " — " + f.name);
});
C9_LINEAR_TWO_VAR.forEach(function (f) {
  console.log("Added: " + f.id + " — " + f.name);
});

db.version = "4.7";
db.phase = "phase-class9-algebra";
db.updatedAt = NOW;

const index = writeSearchIndex(db, INDEX_PATH, NOW);
fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");

const after = {
  c6: snapshotAlgebra("6"),
  c7: snapshotAlgebra("7"),
  c8: snapshotAlgebra("8"),
  c9: snapshotAlgebra("9")
};

function unchanged(label, a, b) {
  if (a.chapters !== b.chapters || a.formulas !== b.formulas) {
    throw new Error(label + " Algebra counts changed unexpectedly");
  }
}
unchanged("Class 6", before.c6, after.c6);
unchanged("Class 7", before.c7, after.c7);
unchanged("Class 8", before.c8, after.c8);

const globalIds = new Set();
db.boards.forEach(function (board) {
  (board.classes || []).forEach(function (cls) {
    (cls.subjects || []).forEach(function (s) {
      (s.chapters || []).forEach(function (ch) {
        (ch.formulas || []).forEach(function (f) {
          if (globalIds.has(f.id)) throw new Error("Duplicate ID: " + f.id);
          globalIds.add(f.id);
        });
      });
    });
  });
});

algebra9.chapters.forEach(function (ch) {
  (ch.formulas || []).forEach(function (f) {
    (f.relatedFormulaIds || []).forEach(function (rid) {
      if (!globalIds.has(rid)) {
        throw new Error(f.id + " broken relatedFormulaIds: " + rid);
      }
    });
  });
});

console.log(
  JSON.stringify(
    {
      wrote: DATA_PATH,
      version: db.version,
      phase: db.phase,
      indexCount: index.totalEntries,
      before: before,
      after: after,
      class9Algebra: after.c9
    },
    null,
    2
  )
);
