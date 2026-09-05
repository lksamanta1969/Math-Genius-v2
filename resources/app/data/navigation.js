/* Class-first navigation manifest (Class 6–12 study materials + global tools) */
const CLASS_LEVELS = [6, 7, 8, 9, 10, 11, 12];

const CLASS_ROMAN = {
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
  11: "XI",
  12: "XII"
};

/** Category for Study Material Index cards (Category A pages only) */
const STUDY_MATERIAL_CATEGORY = "study-material";

/**
 * Study topic catalog — metadata for topics that may appear in class indexes.
 * Add entries here when new study-material HTML pages are created.
 */
const STUDY_TOPIC_CATALOG = {
  arithmetic: { title: "Arithmetic", icon: "➕", category: STUDY_MATERIAL_CATEGORY },
  algebra: { title: "Algebra", icon: "📐", category: STUDY_MATERIAL_CATEGORY },
  geometry: { title: "Geometry", icon: "📏", category: STUDY_MATERIAL_CATEGORY },
  mensuration: { title: "Mensuration", icon: "📦", category: STUDY_MATERIAL_CATEGORY },
  trigonometry: { title: "Trigonometry", icon: "📈", category: STUDY_MATERIAL_CATEGORY },
  statistics: { title: "Statistics", icon: "📊", category: STUDY_MATERIAL_CATEGORY },
  probability: { title: "Probability", icon: "🎲", category: STUDY_MATERIAL_CATEGORY },
  calculus: { title: "Calculus", icon: "∫", category: STUDY_MATERIAL_CATEGORY }
};

/**
 * Class-specific Mathematics index manifest.
 * Lists topic ids available as study-material pages for each class.
 * Paths resolve to pages/{topicId}/class{level}.html
 *
 * Future topics (Differentiation, Integration, AP, GP, Binomial Theorem,
 * Coordinate Geometry, 3D Geometry, etc.) are added here when HTML pages exist.
 */
const CLASS_MATHEMATICS_MANIFEST = {
  6: [
    "arithmetic",
    "algebra",
    "geometry",
    "mensuration",
    "trigonometry",
    "statistics",
    "probability",
    "calculus"
  ],
  7: [
    "arithmetic",
    "algebra",
    "geometry",
    "mensuration",
    "trigonometry",
    "statistics",
    "probability",
    "calculus"
  ],
  8: [
    "arithmetic",
    "algebra",
    "geometry",
    "mensuration",
    "trigonometry",
    "statistics",
    "probability",
    "calculus"
  ],
  9: [
    "arithmetic",
    "algebra",
    "geometry",
    "mensuration",
    "trigonometry",
    "statistics",
    "probability",
    "calculus"
  ],
  10: [
    "arithmetic",
    "algebra",
    "geometry",
    "mensuration",
    "trigonometry",
    "statistics",
    "probability",
    "calculus"
  ],
  11: [
    "arithmetic",
    "algebra",
    "geometry",
    "mensuration",
    "trigonometry",
    "statistics",
    "probability",
    "calculus"
  ],
  12: [
    "arithmetic",
    "algebra",
    "geometry",
    "mensuration",
    "trigonometry",
    "statistics",
    "probability",
    "calculus"
  ]
};

/** Subjects offered per class (repository currently supports Mathematics only) */
const CLASS_SUBJECTS = [
  { id: "mathematics", name: "Mathematics", icon: "📐" }
];

/** Global tools — separate from class study materials */
const GLOBAL_TOOLS = [
  { id: "formula-library", name: "Formula Library", icon: "📚", href: "formula-library.html", category: "tool" },
  { id: "ai-math-solver", name: "AI Math Solver", icon: "🧠", href: "ai-math-solver.html", category: "tool" },
  { id: "calculator", name: "Calculator", icon: "🧮", href: "calculator.html", category: "tool" },
  { id: "quiz", name: "Quiz", icon: "📝", href: "quiz.html", category: "tool" },
  { id: "mock-test", name: "Mock Test", icon: "📄", href: "mock-test.html", category: "tool" }
];

function classRoman(level) {
  return CLASS_ROMAN[level] || String(level);
}

function studyMaterialPath(topicId, classLevel) {
  return "../" + topicId + "/class" + classLevel + ".html";
}

/**
 * Returns manifest entries for a class Mathematics index.
 * Each entry: { class, id, title, path, category, icon, order }
 */
function getClassStudyMaterials(classLevel) {
  const topicIds = CLASS_MATHEMATICS_MANIFEST[classLevel];

  if (!Array.isArray(topicIds)) {
    return [];
  }

  return topicIds.map(function (topicId, index) {
    const topic = STUDY_TOPIC_CATALOG[topicId];

    if (!topic) {
      console.warn("Unknown study topic id in manifest:", topicId, "for class", classLevel);
      return null;
    }

    return {
      class: classLevel,
      id: topicId,
      title: topic.title,
      path: studyMaterialPath(topicId, classLevel),
      category: topic.category,
      icon: topic.icon,
      order: index + 1
    };
  }).filter(Boolean);
}
