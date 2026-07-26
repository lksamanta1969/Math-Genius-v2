/**
 * Phase 8C — Add Class 6 geometry basics formulas (Point/Line/Ray/…)
 * into Lines and Angles chapter. Does NOT implement Mensuration.
 *
 * Run: node scripts/expand-geometry-formulas-8c.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");

const YEAR = "2026-27";
const NOW = "2026-07-26T18:00:00.000Z";

const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

function makeFormula(p) {
  const related = p.relatedFormulaIds || [];
  return {
    id: p.id,
    board: "CBSE",
    syllabusYear: YEAR,
    class: "Class 6",
    subject: "Geometry",
    chapter: "Lines and Angles",
    chapterNumber: 2,
    name: p.name,
    formula: p.formula,
    latex: p.latex || "",
    variables: p.variables || [],
    description: p.description,
    example: p.example || null,
    notes: p.notes || null,
    practiceQuestions: p.practiceQuestions || [],
    difficulty: "Easy",
    examTags: ["CBSE", "Class 6", "Geometry"],
    verification: "Reviewed",
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    source: {
      board: "CBSE",
      syllabusYear: YEAR,
      referenceBook: "NCERT",
      chapterReference: "Class 6 Mathematics — Chapter 2: Lines and Angles"
    },
    ncertReference: {
      book: null,
      chapter: "Chapter 2: Lines and Angles",
      exercise: null,
      page: null
    },
    videoExplanation: null,
    quiz: { enabled: false, totalQuestions: 0 },
    relatedFormulas: related.slice(),
    keywords: p.keywords || [],
    isFavourite: false,
    viewCount: 0,
    lastViewed: null,
    topic: p.topic || "Lines and Angles",
    formulaName: p.name,
    relatedFormulaIds: related.slice(),
    practiceQuestionIds: []
  };
}

const NEW_FORMULAS = [
  makeFormula({
    id: "CBSE-C6-GE-010",
    name: "Point",
    formula: "A point marks a location (no length or width)",
    latex: "P",
    description: "A point is an exact position in space. It has no size.",
    example: "Point A marks the tip of a pencil on paper.",
    keywords: ["point", "location"],
    relatedFormulaIds: ["CBSE-C6-GE-011", "CBSE-C6-GE-013"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-011",
    name: "Line",
    formula: "A line extends endlessly in both directions",
    latex: "\\overleftrightarrow{AB}",
    description: "A straight line has no endpoints and infinite length.",
    example: "Line AB passes through points A and B and goes on forever.",
    keywords: ["line", "straight line"],
    relatedFormulaIds: ["CBSE-C6-GE-012", "CBSE-C6-GE-013", "CBSE-C6-GE-014"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-012",
    name: "Ray",
    formula: "A ray has one endpoint and extends in one direction",
    latex: "\\overrightarrow{AB}",
    description: "Ray AB starts at A and passes through B without end.",
    example: "A sunbeam can be modelled as a ray.",
    keywords: ["ray", "endpoint"],
    relatedFormulaIds: ["CBSE-C6-GE-010", "CBSE-C6-GE-011", "CBSE-C6-GE-013"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-013",
    name: "Line Segment",
    formula: "A line segment joins two endpoints and has fixed length",
    latex: "\\overline{AB}",
    description: "Segment AB is the part of a line between A and B.",
    example: "The edge of a ruler between two marks is a line segment.",
    keywords: ["line segment", "segment", "endpoints"],
    relatedFormulaIds: ["CBSE-C6-GE-010", "CBSE-C6-GE-011"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-014",
    name: "Parallel Lines",
    formula: "Parallel lines never meet and stay the same distance apart",
    latex: "l \\parallel m",
    description: "Two lines in a plane that do not intersect are parallel.",
    example: "Opposite edges of a ruler are parallel.",
    keywords: ["parallel", "never meet"],
    relatedFormulaIds: ["CBSE-C6-GE-015", "CBSE-C6-GE-011"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-015",
    name: "Intersecting Lines",
    formula: "Intersecting lines meet at exactly one point",
    latex: "l \\cap m = \\{P\\}",
    description: "Two lines that cross form angles at their intersection point.",
    example: "The letter X is formed by intersecting line segments.",
    keywords: ["intersecting", "cross", "intersection"],
    relatedFormulaIds: ["CBSE-C6-GE-014", "CBSE-C6-GE-001"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-016",
    name: "Acute Angle",
    formula: "0° < acute angle < 90°",
    latex: "0^\\circ < \\angle < 90^\\circ",
    description: "An acute angle is smaller than a right angle.",
    example: "45° is an acute angle.",
    keywords: ["acute", "acute angle"],
    relatedFormulaIds: ["CBSE-C6-GE-001", "CBSE-C6-GE-017"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-017",
    name: "Obtuse Angle",
    formula: "90° < obtuse angle < 180°",
    latex: "90^\\circ < \\angle < 180^\\circ",
    description: "An obtuse angle is larger than a right angle but smaller than a straight angle.",
    example: "120° is an obtuse angle.",
    keywords: ["obtuse", "obtuse angle"],
    relatedFormulaIds: ["CBSE-C6-GE-001", "CBSE-C6-GE-002", "CBSE-C6-GE-016"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-018",
    name: "Reflex Angle",
    formula: "180° < reflex angle < 360°",
    latex: "180^\\circ < \\angle < 360^\\circ",
    description: "A reflex angle is greater than a straight angle and less than a complete angle.",
    example: "270° is a reflex angle.",
    keywords: ["reflex", "reflex angle"],
    relatedFormulaIds: ["CBSE-C6-GE-002", "CBSE-C6-GE-003"]
  }),
  makeFormula({
    id: "CBSE-C6-GE-019",
    name: "Triangle Basics",
    formula: "Triangle: 3 sides, 3 vertices, 3 angles; angle sum = 180°",
    latex: "\\angle A+\\angle B+\\angle C=180^\\circ",
    description:
      "A triangle is a closed three-sided figure. Triangles are classified by sides (equilateral, isosceles, scalene) or by angles (acute, right, obtuse).",
    example: "A triangle with sides 3, 4, 5 is scalene; angles 40°, 60°, 80° form an acute triangle.",
    keywords: ["triangle", "equilateral", "isosceles", "scalene"],
    relatedFormulaIds: ["CBSE-C7-GE-003", "CBSE-C6-GE-001"],
    topic: "Triangle Basics"
  })
];

function findClass6Geometry() {
  for (const board of db.boards || []) {
    if (board.board !== "CBSE") continue;
    for (const cls of board.classes || []) {
      if (!/6/.test(String(cls.title || cls.class || ""))) continue;
      for (const sub of cls.subjects || []) {
        if ((sub.id || "").toLowerCase() === "geometry" || sub.title === "Geometry") {
          return sub;
        }
      }
    }
  }
  return null;
}

const geo = findClass6Geometry();
if (!geo) {
  console.error("CBSE Class 6 Geometry subject not found");
  process.exit(1);
}

let chapter = (geo.chapters || []).find(function (c) {
  return c.id === "lines-and-angles" || c.title === "Lines and Angles";
});
if (!chapter) {
  console.error("Lines and Angles chapter not found");
  process.exit(1);
}

chapter.formulas = chapter.formulas || [];
const existing = Object.create(null);
chapter.formulas.forEach(function (f) {
  if (f && f.id) existing[f.id] = true;
});

let added = 0;
NEW_FORMULAS.forEach(function (f) {
  if (existing[f.id]) return;
  chapter.formulas.push(f);
  existing[f.id] = true;
  added += 1;
});

db.version = "4.1";
db.phase = "phase-8c-geometry-rule-engine";
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

const indexEntries = [];
walkFormulas(db, indexEntries);
const index = {
  version: db.version,
  generatedAt: NOW,
  count: indexEntries.length,
  formulas: indexEntries
};

fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n", "utf8");

console.log(
  "Geometry formulas: added " +
    added +
    " new (chapter now has " +
    chapter.formulas.length +
    "). Index count=" +
    index.count
);
