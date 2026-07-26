"use strict";

/**
 * Phase 8B.5 — Formula Library Expansion
 * - Enrich schema (topic, formulaName, relatedFormulaIds, practiceQuestionIds)
 * - Merge formula-algebra-intro.json into main CBSE Class 6 Algebra
 * - Complete CBSE Class 7 formula chapters
 * - Regenerate search index
 * - Keep architecture ready for ICSE / WB / NCERT (scaffolding unchanged)
 *
 * Does NOT implement Geometry Solver.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");
const ALGEBRA_SEED = path.join(
  ROOT,
  "resources",
  "app",
  "data",
  "formula-algebra-intro.json"
);

const YEAR = "2026-27";
const NOW = "2026-07-26T12:00:00.000Z";
const TODAY = "2026-07-26";
const REF6 = ["NCERT", "Ganita Prakash"];
const REF7 = ["NCERT"];

const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const algebraSeed = JSON.parse(fs.readFileSync(ALGEBRA_SEED, "utf8"));

db.version = "4.0";
db.phase = "phase-8b5-formula-library-expansion";
db.schema.formula = Object.assign({}, db.schema.formula || {}, {
  topic: "string",
  formulaName: "string (display name; mirrors name)",
  relatedFormulaIds: ["string (preferred alias of relatedFormulas)"],
  practiceQuestionIds: ["string"],
  relatedFormulas: ["string (legacy alias; keep in sync with relatedFormulaIds)"]
});

function makeFormula(p) {
  const related = p.relatedFormulaIds || p.relatedFormulas || [];
  const practiceQs = p.practiceQuestions || [];
  const practiceIds = p.practiceQuestionIds || [];
  return {
    id: p.id,
    board: "CBSE",
    syllabusYear: YEAR,
    class: p.class || "Class 6",
    subject: p.subject,
    chapter: p.chapter,
    chapterNumber: p.chapterNumber,
    topic: p.topic || p.chapter,
    name: p.name,
    formulaName: p.formulaName || p.name,
    formula: p.formula,
    latex: p.latex,
    variables: p.variables || [],
    description: p.description,
    example: p.example,
    notes: p.notes != null ? p.notes : null,
    practiceQuestions: practiceQs,
    practiceQuestionIds: practiceIds,
    difficulty: p.difficulty || "Easy",
    examTags: p.examTags || ["CBSE", p.class || "Class 6"],
    verification: p.verification || "Reviewed",
    createdAt: NOW,
    updatedAt: NOW,
    version: p.version != null ? p.version : 1,
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: p.referenceBook != null ? p.referenceBook : "NCERT",
      chapterReference:
        p.chapterReference ||
        (p.class || "Class 6") +
          " Mathematics — Chapter " +
          p.chapterNumber +
          ": " +
          p.chapter
    },
    ncertReference: p.ncertReference || {
      book: null,
      chapter: "Chapter " + p.chapterNumber + ": " + p.chapter,
      exercise: null,
      page: null
    },
    videoExplanation: null,
    quiz: { enabled: false, totalQuestions: 0 },
    relatedFormulas: related.slice(),
    relatedFormulaIds: related.slice(),
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
    class: meta.class,
    subject: meta.subject,
    difficulty: meta.difficulty || "Easy",
    estimatedStudyTime: meta.estimatedStudyTime || "45 min",
    referenceBooks: meta.referenceBooks || REF7.slice(),
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

function enrichExistingFormula(f, chapterTitle) {
  const related = Array.isArray(f.relatedFormulaIds)
    ? f.relatedFormulaIds.slice()
    : Array.isArray(f.relatedFormulas)
      ? f.relatedFormulas.slice()
      : [];
  f.topic = f.topic || chapterTitle || f.chapter || null;
  f.formulaName = f.formulaName || f.name;
  f.relatedFormulaIds = related;
  f.relatedFormulas = related.slice();
  if (!Array.isArray(f.practiceQuestionIds)) {
    f.practiceQuestionIds = [];
  }
  f.updatedAt = NOW;
  return f;
}

function seedToFullFormula(seed, chapterNumber) {
  const relatedMap = {
    "CBSE-C6-AL-001": ["CBSE-C6-AL-002"],
    "CBSE-C6-AL-002": ["CBSE-C6-AL-001", "CBSE-C6-AL-003"],
    "CBSE-C6-AL-003": ["CBSE-C6-AL-004", "CBSE-C6-AL-005"],
    "CBSE-C6-AL-004": ["CBSE-C6-AL-003"],
    "CBSE-C6-AL-005": ["CBSE-C6-AL-003", "CBSE-C6-AL-002"],
    "CBSE-C6-AL-006": ["CBSE-C6-AL-002"],
    "CBSE-C6-AL-007": ["CBSE-C6-AL-008", "CBSE-C6-AL-009"],
    "CBSE-C6-AL-008": ["CBSE-C6-AL-007", "CBSE-C6-AL-009"],
    "CBSE-C6-AL-009": ["CBSE-C6-AL-007", "CBSE-C6-AL-008"],
    "CBSE-C6-AL-010": ["CBSE-C6-AL-007"]
  };

  const examples = {
    "CBSE-C6-AL-001": "In 5x + 3, x is a variable and 5, 3 are constants.",
    "CBSE-C6-AL-002": "2x + 7 is an algebraic expression.",
    "CBSE-C6-AL-003": "2a and 5a are like terms.",
    "CBSE-C6-AL-004": "2a and 3b are unlike terms.",
    "CBSE-C6-AL-005": "2a + 3a = 5a",
    "CBSE-C6-AL-006": "If x = 4, then 2x + 3 = 2×4 + 3 = 11.",
    "CBSE-C6-AL-007": "Solve 2x + 3 = 11. Then x = 4.",
    "CBSE-C6-AL-008": "From 2x + 3 = 11, subtract 3: 2x = 8.",
    "CBSE-C6-AL-009": "From 2x = 8, divide by 2: x = 4.",
    "CBSE-C6-AL-010": "Find □ in □ + 5 = 12. Missing number = 7."
  };

  const variables = {
    "CBSE-C6-AL-001": [
      { symbol: "x", meaning: "Variable" },
      { symbol: "c", meaning: "Constant" }
    ],
    "CBSE-C6-AL-002": [
      { symbol: "a", meaning: "Coefficient / constant" },
      { symbol: "x", meaning: "Variable" },
      { symbol: "b", meaning: "Constant term" }
    ],
    "CBSE-C6-AL-003": [{ symbol: "a", meaning: "Common variable of like terms" }],
    "CBSE-C6-AL-004": [
      { symbol: "a", meaning: "First variable" },
      { symbol: "b", meaning: "Second variable" }
    ],
    "CBSE-C6-AL-005": [
      { symbol: "p", meaning: "First coefficient" },
      { symbol: "q", meaning: "Second coefficient" },
      { symbol: "a", meaning: "Common variable" }
    ],
    "CBSE-C6-AL-006": [
      { symbol: "x", meaning: "Variable" },
      { symbol: "k", meaning: "Given value of the variable" }
    ],
    "CBSE-C6-AL-007": [
      { symbol: "a", meaning: "Coefficient of x (a ≠ 0)" },
      { symbol: "b", meaning: "Constant on LHS" },
      { symbol: "c", meaning: "Constant on RHS" },
      { symbol: "x", meaning: "Unknown" }
    ],
    "CBSE-C6-AL-008": [
      { symbol: "a", meaning: "Left side value" },
      { symbol: "b", meaning: "Right side value" },
      { symbol: "k", meaning: "Number added or subtracted" }
    ],
    "CBSE-C6-AL-009": [
      { symbol: "a", meaning: "Left side value" },
      { symbol: "b", meaning: "Right side value" },
      { symbol: "k", meaning: "Non-zero multiplier / divisor" }
    ],
    "CBSE-C6-AL-010": [
      { symbol: "□", meaning: "Missing number" },
      { symbol: "a", meaning: "Known addend" },
      { symbol: "b", meaning: "Sum" }
    ]
  };

  return makeFormula({
    id: seed.id,
    class: "Class 6",
    subject: "Algebra",
    chapter: seed.chapter,
    chapterNumber: chapterNumber,
    topic: seed.chapter,
    name: seed.name,
    formulaName: seed.name,
    formula: seed.formula,
    latex: seed.latex,
    variables: variables[seed.id] || [{ symbol: "x", meaning: "Variable" }],
    description: seed.formula,
    example: examples[seed.id] || seed.formula,
    relatedFormulaIds: relatedMap[seed.id] || [],
    keywords: [
      "algebra",
      seed.chapter.toLowerCase(),
      ...String(seed.name)
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    ],
    examTags: ["CBSE", "Class 6", "Algebra"],
    practiceQuestions: [
      {
        question: "Use: " + seed.name,
        answer: examples[seed.id] || "See formula"
      }
    ],
    verification: "Reviewed",
    referenceBooks: REF6
  });
}

/* ========== Enrich all existing formulas ========== */
db.boards.forEach((board) => {
  (board.classes || []).forEach((cls) => {
    (cls.subjects || []).forEach((subject) => {
      (subject.chapters || []).forEach((chapter) => {
        (chapter.formulas || []).forEach((f) => {
          enrichExistingFormula(f, chapter.title);
        });
      });
    });
  });
});

const cbse = db.boards.find((b) => b.id === "cbse");
const class6 = cbse.classes.find((c) => c.id === "6");
const class7 = cbse.classes.find((c) => c.id === "7");

/* ========== Class 6 Algebra (merge seed) ========== */
const introSeeds = algebraSeed.formulas.filter(
  (f) => f.chapter === "Introduction to Algebra"
);
const eqSeeds = algebraSeed.formulas.filter(
  (f) => f.chapter === "Simple Equations"
);

const algebraSubject = {
  id: "algebra",
  title: "Algebra",
  icon: "𝑥",
  syllabus: {
    board: "CBSE",
    class: "Class 6",
    subject: "Algebra",
    syllabusYear: YEAR
  },
  chapters: [
    makeChapter(
      {
        id: "introduction-to-algebra",
        title: "Introduction to Algebra",
        chapterNumber: 11,
        chapterCode: "CBSE-C6-AL-CH01",
        class: "Class 6",
        subject: "Algebra",
        referenceBooks: REF6,
        estimatedStudyTime: "55 min"
      },
      introSeeds.map((s) => seedToFullFormula(s, 11))
    ),
    makeChapter(
      {
        id: "simple-equations",
        title: "Simple Equations",
        chapterNumber: 12,
        chapterCode: "CBSE-C6-AL-CH02",
        class: "Class 6",
        subject: "Algebra",
        referenceBooks: REF6,
        estimatedStudyTime: "60 min"
      },
      eqSeeds.map((s) => seedToFullFormula(s, 12))
    )
  ]
};

// Replace or insert Algebra subject
class6.subjects = class6.subjects.filter((s) => s.id !== "algebra");
class6.subjects.push(algebraSubject);
if (class6.syllabus && class6.syllabus.scope) {
  const allowed = class6.syllabus.scope.allowedSubjects || [];
  if (allowed.indexOf("algebra") < 0) allowed.push("algebra");
  class6.syllabus.scope.allowedSubjects = allowed;
  // Remove Algebra from excluded if present
  class6.syllabus.scope.excludedTopics = (
    class6.syllabus.scope.excludedTopics || []
  ).filter((t) => !/algebraic identities/i.test(t));
}

/* ========== Class 7 population ========== */
function c7(p) {
  return makeFormula(Object.assign({ class: "Class 7" }, p));
}

const c7Arithmetic = [
  makeChapter(
    {
      id: "integers",
      title: "Integers",
      chapterNumber: 1,
      chapterCode: "CBSE-C7-AR-CH01",
      class: "Class 7",
      subject: "Arithmetic"
    },
    [
      c7({
        id: "CBSE-C7-AR-001",
        subject: "Arithmetic",
        chapter: "Integers",
        chapterNumber: 1,
        topic: "Integer operations",
        name: "Addition of Integers",
        formula: "a + (−b) = a − b",
        latex: "a+(-b)=a-b",
        variables: [
          { symbol: "a", meaning: "First integer" },
          { symbol: "b", meaning: "Positive integer being subtracted" }
        ],
        description: "Adding the additive inverse of b is the same as subtracting b.",
        example: "7 + (−3) = 7 − 3 = 4",
        keywords: ["integers", "addition", "negative"],
        relatedFormulaIds: ["CBSE-C7-AR-002"],
        examTags: ["CBSE", "Class 7", "Integers"]
      }),
      c7({
        id: "CBSE-C7-AR-002",
        subject: "Arithmetic",
        chapter: "Integers",
        chapterNumber: 1,
        topic: "Integer operations",
        name: "Product of Integers (Sign Rule)",
        formula: "(−a)×(−b)=ab; (−a)×b=−(ab)",
        latex: "(-a)(-b)=ab,\\;(-a)b=-(ab)",
        variables: [
          { symbol: "a", meaning: "Positive integer" },
          { symbol: "b", meaning: "Positive integer" }
        ],
        description: "Same signs give a positive product; different signs give a negative product.",
        example: "(−4)×(−5)=20; (−4)×5=−20",
        keywords: ["integers", "multiplication", "sign"],
        relatedFormulaIds: ["CBSE-C7-AR-001"],
        examTags: ["CBSE", "Class 7", "Integers"]
      })
    ]
  ),
  makeChapter(
    {
      id: "fractions-and-decimals",
      title: "Fractions and Decimals",
      chapterNumber: 2,
      chapterCode: "CBSE-C7-AR-CH02",
      class: "Class 7",
      subject: "Arithmetic"
    },
    [
      c7({
        id: "CBSE-C7-AR-003",
        subject: "Arithmetic",
        chapter: "Fractions and Decimals",
        chapterNumber: 2,
        topic: "Fraction multiplication",
        name: "Multiplication of Fractions",
        formula: "(a/b)×(c/d)=(ac)/(bd)",
        latex: "\\frac{a}{b}\\times\\frac{c}{d}=\\frac{ac}{bd}",
        variables: [
          { symbol: "a/b", meaning: "First fraction" },
          { symbol: "c/d", meaning: "Second fraction" }
        ],
        description: "Multiply numerators together and denominators together.",
        example: "(2/3)×(3/5)=6/15=2/5",
        keywords: ["fraction", "multiply", "product"],
        relatedFormulaIds: ["CBSE-C7-AR-004"],
        examTags: ["CBSE", "Class 7", "Fractions"]
      }),
      c7({
        id: "CBSE-C7-AR-004",
        subject: "Arithmetic",
        chapter: "Fractions and Decimals",
        chapterNumber: 2,
        topic: "Fraction division",
        name: "Division of Fractions",
        formula: "(a/b)÷(c/d)=(a/b)×(d/c)",
        latex: "\\frac{a}{b}\\div\\frac{c}{d}=\\frac{a}{b}\\times\\frac{d}{c}",
        variables: [
          { symbol: "a/b", meaning: "Dividend" },
          { symbol: "c/d", meaning: "Divisor (≠ 0)" }
        ],
        description: "Divide by a fraction by multiplying by its reciprocal.",
        example: "(2/3)÷(4/5)=(2/3)×(5/4)=10/12=5/6",
        keywords: ["fraction", "divide", "reciprocal"],
        relatedFormulaIds: ["CBSE-C7-AR-003"],
        examTags: ["CBSE", "Class 7", "Fractions"]
      })
    ]
  ),
  makeChapter(
    {
      id: "comparing-quantities",
      title: "Comparing Quantities",
      chapterNumber: 3,
      chapterCode: "CBSE-C7-AR-CH03",
      class: "Class 7",
      subject: "Arithmetic"
    },
    [
      c7({
        id: "CBSE-C7-AR-005",
        subject: "Arithmetic",
        chapter: "Comparing Quantities",
        chapterNumber: 3,
        topic: "Percentage",
        name: "Percentage",
        formula: "x% of N = (x/100)×N",
        latex: "x\\%\\text{ of }N=\\frac{x}{100}\\times N",
        variables: [
          { symbol: "x", meaning: "Percentage" },
          { symbol: "N", meaning: "Base quantity" }
        ],
        description: "A percentage is a fraction with denominator 100.",
        example: "20% of 150 = (20/100)×150 = 30",
        keywords: ["percent", "percentage", "ratio"],
        relatedFormulaIds: ["CBSE-C7-AR-006"],
        examTags: ["CBSE", "Class 7", "Percentage"]
      }),
      c7({
        id: "CBSE-C7-AR-006",
        subject: "Arithmetic",
        chapter: "Comparing Quantities",
        chapterNumber: 3,
        topic: "Simple interest",
        name: "Simple Interest",
        formula: "SI = (P × R × T)/100",
        latex: "SI=\\frac{PRT}{100}",
        variables: [
          { symbol: "P", meaning: "Principal" },
          { symbol: "R", meaning: "Rate percent per annum" },
          { symbol: "T", meaning: "Time in years" },
          { symbol: "SI", meaning: "Simple interest" }
        ],
        description: "Simple interest is proportional to principal, rate and time.",
        example: "P=1000, R=5%, T=2 ⇒ SI=(1000×5×2)/100=100",
        keywords: ["interest", "principal", "rate", "SI"],
        relatedFormulaIds: ["CBSE-C7-AR-005"],
        examTags: ["CBSE", "Class 7", "Interest"]
      })
    ]
  ),
  makeChapter(
    {
      id: "rational-numbers",
      title: "Rational Numbers",
      chapterNumber: 4,
      chapterCode: "CBSE-C7-AR-CH04",
      class: "Class 7",
      subject: "Arithmetic"
    },
    [
      c7({
        id: "CBSE-C7-AR-007",
        subject: "Arithmetic",
        chapter: "Rational Numbers",
        chapterNumber: 4,
        topic: "Rational numbers",
        name: "Rational Number Form",
        formula: "A rational number = p/q where p, q are integers and q ≠ 0",
        latex: "\\frac{p}{q},\\;q\\neq 0",
        variables: [
          { symbol: "p", meaning: "Integer numerator" },
          { symbol: "q", meaning: "Non-zero integer denominator" }
        ],
        description: "Integers and fractions are rational numbers of the form p/q.",
        example: "−3/4 and 5 (=5/1) are rational numbers.",
        keywords: ["rational", "p/q", "integer"],
        relatedFormulaIds: [],
        examTags: ["CBSE", "Class 7", "Rational Numbers"]
      })
    ]
  )
];

const c7Algebra = [
  makeChapter(
    {
      id: "simple-equations",
      title: "Simple Equations",
      chapterNumber: 1,
      chapterCode: "CBSE-C7-AL-CH01",
      class: "Class 7",
      subject: "Algebra"
    },
    [
      c7({
        id: "CBSE-C7-AL-001",
        subject: "Algebra",
        chapter: "Simple Equations",
        chapterNumber: 1,
        topic: "Linear equations",
        name: "Simple Linear Equation",
        formula: "ax + b = c (a ≠ 0)",
        latex: "ax+b=c\\;(a\\neq 0)",
        variables: [
          { symbol: "a", meaning: "Coefficient of x" },
          { symbol: "x", meaning: "Unknown" },
          { symbol: "b", meaning: "Constant on LHS" },
          { symbol: "c", meaning: "RHS constant" }
        ],
        description: "A first-degree equation in one variable.",
        example: "3x + 4 = 19 ⇒ x = 5",
        keywords: ["equation", "linear", "solve"],
        relatedFormulaIds: ["CBSE-C7-AL-002"],
        examTags: ["CBSE", "Class 7", "Equations"]
      }),
      c7({
        id: "CBSE-C7-AL-002",
        subject: "Algebra",
        chapter: "Simple Equations",
        chapterNumber: 1,
        topic: "Linear equations",
        name: "Transposition",
        formula: "Moving a term to the other side changes its sign",
        latex: "a+b=c\\Rightarrow a=c-b",
        variables: [
          { symbol: "a", meaning: "Term kept on left" },
          { symbol: "b", meaning: "Term transposed" },
          { symbol: "c", meaning: "Other side" }
        ],
        description: "Transposition is a shortcut for adding/subtracting the same number on both sides.",
        example: "x + 5 = 12 ⇒ x = 12 − 5 = 7",
        keywords: ["transposition", "equation"],
        relatedFormulaIds: ["CBSE-C7-AL-001"],
        examTags: ["CBSE", "Class 7", "Equations"]
      })
    ]
  ),
  makeChapter(
    {
      id: "algebraic-expressions",
      title: "Algebraic Expressions",
      chapterNumber: 2,
      chapterCode: "CBSE-C7-AL-CH02",
      class: "Class 7",
      subject: "Algebra"
    },
    [
      c7({
        id: "CBSE-C7-AL-003",
        subject: "Algebra",
        chapter: "Algebraic Expressions",
        chapterNumber: 2,
        topic: "Like terms",
        name: "Combine Like Terms",
        formula: "pa ± qa = (p ± q)a",
        latex: "pa\\pm qa=(p\\pm q)a",
        variables: [
          { symbol: "p", meaning: "First coefficient" },
          { symbol: "q", meaning: "Second coefficient" },
          { symbol: "a", meaning: "Common literal factor" }
        ],
        description: "Only like terms can be added or subtracted.",
        example: "5m − 2m = 3m",
        keywords: ["like terms", "simplify", "expression"],
        relatedFormulaIds: ["CBSE-C7-AL-004"],
        examTags: ["CBSE", "Class 7", "Expressions"]
      }),
      c7({
        id: "CBSE-C7-AL-004",
        subject: "Algebra",
        chapter: "Algebraic Expressions",
        chapterNumber: 2,
        topic: "Degree",
        name: "Degree of a Polynomial (one variable)",
        formula: "Degree = highest power of the variable in the expression",
        latex: "\\deg(a_nx^n+\\cdots+a_0)=n\\;(a_n\\neq 0)",
        variables: [
          { symbol: "n", meaning: "Highest power with non-zero coefficient" }
        ],
        description: "For Class 7, identify degree of simple expressions in one variable.",
        example: "Degree of 4x³ − x + 7 is 3.",
        keywords: ["degree", "polynomial", "power"],
        relatedFormulaIds: ["CBSE-C7-AL-003"],
        examTags: ["CBSE", "Class 7", "Expressions"],
        notes: "Identification only — solving higher-degree equations is out of Class 7 solver scope."
      })
    ]
  ),
  makeChapter(
    {
      id: "exponents-and-powers",
      title: "Exponents and Powers",
      chapterNumber: 3,
      chapterCode: "CBSE-C7-AL-CH03",
      class: "Class 7",
      subject: "Algebra"
    },
    [
      c7({
        id: "CBSE-C7-AL-005",
        subject: "Algebra",
        chapter: "Exponents and Powers",
        chapterNumber: 3,
        topic: "Laws of exponents",
        name: "Product Rule of Exponents",
        formula: "a^m × a^n = a^(m+n)",
        latex: "a^m a^n = a^{m+n}",
        variables: [
          { symbol: "a", meaning: "Base (a ≠ 0)" },
          { symbol: "m", meaning: "First exponent" },
          { symbol: "n", meaning: "Second exponent" }
        ],
        description: "When multiplying the same base, add the exponents.",
        example: "2³ × 2⁴ = 2⁷ = 128",
        keywords: ["exponent", "product rule", "powers"],
        relatedFormulaIds: ["CBSE-C7-AL-006"],
        examTags: ["CBSE", "Class 7", "Exponents"]
      }),
      c7({
        id: "CBSE-C7-AL-006",
        subject: "Algebra",
        chapter: "Exponents and Powers",
        chapterNumber: 3,
        topic: "Laws of exponents",
        name: "Quotient Rule of Exponents",
        formula: "a^m ÷ a^n = a^(m−n) (a ≠ 0)",
        latex: "\\frac{a^m}{a^n}=a^{m-n}",
        variables: [
          { symbol: "a", meaning: "Base" },
          { symbol: "m", meaning: "Numerator exponent" },
          { symbol: "n", meaning: "Denominator exponent" }
        ],
        description: "When dividing the same base, subtract the exponents.",
        example: "5^6 ÷ 5^2 = 5^4 = 625",
        keywords: ["exponent", "quotient rule", "powers"],
        relatedFormulaIds: ["CBSE-C7-AL-005"],
        examTags: ["CBSE", "Class 7", "Exponents"]
      })
    ]
  )
];

const c7Geometry = [
  makeChapter(
    {
      id: "lines-and-angles",
      title: "Lines and Angles",
      chapterNumber: 1,
      chapterCode: "CBSE-C7-GE-CH01",
      class: "Class 7",
      subject: "Geometry"
    },
    [
      c7({
        id: "CBSE-C7-GE-001",
        subject: "Geometry",
        chapter: "Lines and Angles",
        chapterNumber: 1,
        topic: "Angles on a straight line",
        name: "Linear Pair",
        formula: "If two angles form a linear pair, their sum is 180°",
        latex: "\\angle A+\\angle B=180^\\circ",
        variables: [
          { symbol: "∠A", meaning: "First angle of the linear pair" },
          { symbol: "∠B", meaning: "Second angle of the linear pair" }
        ],
        description: "Adjacent angles on a straight line add to a straight angle.",
        example: "If ∠A = 110°, then ∠B = 70°.",
        keywords: ["linear pair", "straight line", "180"],
        relatedFormulaIds: ["CBSE-C7-GE-002"],
        examTags: ["CBSE", "Class 7", "Angles"]
      }),
      c7({
        id: "CBSE-C7-GE-002",
        subject: "Geometry",
        chapter: "Lines and Angles",
        chapterNumber: 1,
        topic: "Vertically opposite angles",
        name: "Vertically Opposite Angles",
        formula: "Vertically opposite angles are equal",
        latex: "\\angle A=\\angle C,\\;\\angle B=\\angle D",
        variables: [
          { symbol: "∠A,∠C", meaning: "One pair of vertically opposite angles" }
        ],
        description: "When two lines intersect, opposite angles are equal.",
        example: "If one angle is 65°, its vertically opposite angle is 65°.",
        keywords: ["vertically opposite", "intersect"],
        relatedFormulaIds: ["CBSE-C7-GE-001"],
        examTags: ["CBSE", "Class 7", "Angles"]
      })
    ]
  ),
  makeChapter(
    {
      id: "triangle-properties",
      title: "The Triangle and its Properties",
      chapterNumber: 2,
      chapterCode: "CBSE-C7-GE-CH02",
      class: "Class 7",
      subject: "Geometry"
    },
    [
      c7({
        id: "CBSE-C7-GE-003",
        subject: "Geometry",
        chapter: "The Triangle and its Properties",
        chapterNumber: 2,
        topic: "Angle sum",
        name: "Angle Sum Property of a Triangle",
        formula: "∠A + ∠B + ∠C = 180°",
        latex: "\\angle A+\\angle B+\\angle C=180^\\circ",
        variables: [
          { symbol: "∠A,∠B,∠C", meaning: "Interior angles of △ABC" }
        ],
        description: "The sum of the interior angles of any triangle is 180°.",
        example: "If ∠A=50° and ∠B=60°, then ∠C=70°.",
        keywords: ["triangle", "angle sum", "180"],
        relatedFormulaIds: ["CBSE-C7-GE-004"],
        examTags: ["CBSE", "Class 7", "Triangles"]
      }),
      c7({
        id: "CBSE-C7-GE-004",
        subject: "Geometry",
        chapter: "The Triangle and its Properties",
        chapterNumber: 2,
        topic: "Exterior angle",
        name: "Exterior Angle Property",
        formula: "Exterior angle = sum of two remote interior angles",
        latex: "\\angle_{ext}=\\angle B+\\angle C",
        variables: [
          { symbol: "∠ext", meaning: "Exterior angle at A" },
          { symbol: "∠B,∠C", meaning: "Interior opposite angles" }
        ],
        description: "An exterior angle equals the sum of the two non-adjacent interior angles.",
        example: "If ∠B=40° and ∠C=65°, exterior at A = 105°.",
        keywords: ["exterior angle", "triangle"],
        relatedFormulaIds: ["CBSE-C7-GE-003"],
        examTags: ["CBSE", "Class 7", "Triangles"]
      })
    ]
  )
];

const c7Mensuration = [
  makeChapter(
    {
      id: "perimeter-and-area",
      title: "Perimeter and Area",
      chapterNumber: 1,
      chapterCode: "CBSE-C7-ME-CH01",
      class: "Class 7",
      subject: "Mensuration"
    },
    [
      c7({
        id: "CBSE-C7-ME-001",
        subject: "Mensuration",
        chapter: "Perimeter and Area",
        chapterNumber: 1,
        topic: "Parallelogram",
        name: "Area of a Parallelogram",
        formula: "A = b × h",
        latex: "A=bh",
        variables: [
          { symbol: "b", meaning: "Base" },
          { symbol: "h", meaning: "Corresponding height" },
          { symbol: "A", meaning: "Area" }
        ],
        description: "Area equals base times the perpendicular height.",
        example: "b=8 cm, h=5 cm ⇒ A=40 cm²",
        keywords: ["parallelogram", "area", "base", "height"],
        relatedFormulaIds: ["CBSE-C7-ME-002"],
        examTags: ["CBSE", "Class 7", "Mensuration"]
      }),
      c7({
        id: "CBSE-C7-ME-002",
        subject: "Mensuration",
        chapter: "Perimeter and Area",
        chapterNumber: 1,
        topic: "Circle",
        name: "Circumference of a Circle",
        formula: "C = 2πr",
        latex: "C=2\\pi r",
        variables: [
          { symbol: "r", meaning: "Radius" },
          { symbol: "C", meaning: "Circumference" },
          { symbol: "π", meaning: "Pi (≈ 22/7 or 3.14)" }
        ],
        description: "The perimeter of a circle is 2π times its radius.",
        example: "r=7 cm, π=22/7 ⇒ C=2×22/7×7=44 cm",
        keywords: ["circle", "circumference", "perimeter"],
        relatedFormulaIds: ["CBSE-C7-ME-003"],
        examTags: ["CBSE", "Class 7", "Mensuration"]
      }),
      c7({
        id: "CBSE-C7-ME-003",
        subject: "Mensuration",
        chapter: "Perimeter and Area",
        chapterNumber: 1,
        topic: "Circle",
        name: "Area of a Circle",
        formula: "A = πr²",
        latex: "A=\\pi r^2",
        variables: [
          { symbol: "r", meaning: "Radius" },
          { symbol: "A", meaning: "Area" }
        ],
        description: "Area of a circle is π times the square of the radius.",
        example: "r=7 cm, π=22/7 ⇒ A=154 cm²",
        keywords: ["circle", "area", "pi"],
        relatedFormulaIds: ["CBSE-C7-ME-002"],
        examTags: ["CBSE", "Class 7", "Mensuration"]
      })
    ]
  )
];

const c7Statistics = [
  makeChapter(
    {
      id: "data-handling",
      title: "Data Handling",
      chapterNumber: 1,
      chapterCode: "CBSE-C7-ST-CH01",
      class: "Class 7",
      subject: "Statistics"
    },
    [
      c7({
        id: "CBSE-C7-ST-001",
        subject: "Statistics",
        chapter: "Data Handling",
        chapterNumber: 1,
        topic: "Mean",
        name: "Arithmetic Mean",
        formula: "Mean = (sum of observations) / (number of observations)",
        latex: "\\bar{x}=\\frac{\\sum x_i}{n}",
        variables: [
          { symbol: "x_i", meaning: "Each observation" },
          { symbol: "n", meaning: "Number of observations" },
          { symbol: "x̄", meaning: "Mean" }
        ],
        description: "The mean is the average of a data set.",
        example: "Data 2, 4, 6 ⇒ mean = 12/3 = 4",
        keywords: ["mean", "average", "data"],
        relatedFormulaIds: ["CBSE-C7-ST-002"],
        examTags: ["CBSE", "Class 7", "Statistics"]
      }),
      c7({
        id: "CBSE-C7-ST-002",
        subject: "Statistics",
        chapter: "Data Handling",
        chapterNumber: 1,
        topic: "Range",
        name: "Range of Data",
        formula: "Range = highest value − lowest value",
        latex: "R=x_{max}-x_{min}",
        variables: [
          { symbol: "x_max", meaning: "Largest observation" },
          { symbol: "x_min", meaning: "Smallest observation" }
        ],
        description: "Range measures the spread of data.",
        example: "Data 3, 8, 5 ⇒ range = 8 − 3 = 5",
        keywords: ["range", "spread", "data"],
        relatedFormulaIds: ["CBSE-C7-ST-001"],
        examTags: ["CBSE", "Class 7", "Statistics"]
      })
    ]
  )
];

function fillSubject(subjectId, chapters) {
  const subject = class7.subjects.find((s) => s.id === subjectId);
  if (!subject) throw new Error("Missing Class 7 subject: " + subjectId);
  subject.syllabus = {
    board: "CBSE",
    class: "Class 7",
    subject: subject.title,
    syllabusYear: YEAR
  };
  subject.chapters = chapters;
}

fillSubject("arithmetic", c7Arithmetic);
fillSubject("algebra", c7Algebra);
fillSubject("geometry", c7Geometry);
fillSubject("mensuration", c7Mensuration);
fillSubject("statistics", c7Statistics);

cbse.lastUpdated = TODAY;
cbse.syllabusYear = YEAR;

/* Ensure disabled boards remain scaffolded (architecture ready) */
["ncert", "wbchse", "wb-board", "isc"].forEach((id) => {
  const b = db.boards.find((x) => x.id === id);
  if (b) {
    b.enabled = false;
    if (!Array.isArray(b.classes)) b.classes = [];
  }
});
const icse = db.boards.find((b) => b.id === "icse");
if (icse) {
  // Keep enabled flag as-is; formulas may be empty — architecture ready
  icse.lastUpdated = TODAY;
}

/* ========== Search index ========== */
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
            topic: f.topic || f.chapter,
            name: f.name,
            formulaName: f.formulaName || f.name,
            formula: f.formula,
            keywords: f.keywords || [],
            examTags: f.examTags || [],
            difficulty: f.difficulty,
            searchText: [
              f.name,
              f.formulaName,
              f.formula,
              f.latex,
              f.description,
              f.example,
              f.notes,
              f.subject,
              f.chapter,
              f.topic,
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

fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n");
fs.writeFileSync(
  INDEX_PATH,
  JSON.stringify(
    {
      generatedAt: NOW,
      totalEntries: index.length,
      entries: index,
      searchableFields: ["formulaName", "name", "keywords", "chapter", "topic", "searchText"]
    },
    null,
    2
  ) + "\n"
);

/* Update algebra seed file to migration-only */
algebraSeed.role = "migration-seed";
algebraSeed.status = "merged-into-formula-library";
algebraSeed.mergedAt = NOW;
algebraSeed.description =
  "SEED / MIGRATION ONLY. Canonical formulas live in formula-library.json (CBSE Class 6 Algebra). Do not treat this file as the source of truth for solvers.";
algebraSeed.canonicalLibrary = "resources/app/data/formula-library.json";
fs.writeFileSync(ALGEBRA_SEED, JSON.stringify(algebraSeed, null, 2) + "\n");

function countClass(cls) {
  return (cls.subjects || []).reduce(
    (n, s) =>
      n +
      (s.chapters || []).reduce((m, ch) => m + (ch.formulas || []).length, 0),
    0
  );
}

console.log(
  JSON.stringify(
    {
      wrote: DATA_PATH,
      index: INDEX_PATH,
      version: db.version,
      class6Formulas: countClass(class6),
      class7Formulas: countClass(class7),
      totalIndexed: index.length,
      class6Subjects: class6.subjects.map((s) => ({
        title: s.title,
        chapters: (s.chapters || []).length,
        formulas: (s.chapters || []).reduce(
          (n, ch) => n + (ch.formulas || []).length,
          0
        )
      })),
      class7Subjects: class7.subjects.map((s) => ({
        title: s.title,
        chapters: (s.chapters || []).length,
        formulas: (s.chapters || []).reduce(
          (n, ch) => n + (ch.formulas || []).length,
          0
        )
      }))
    },
    null,
    2
  )
);
