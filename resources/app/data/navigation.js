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

/** Default board key when no board is selected in the UI */
const DEFAULT_BOARD = "default";

/** Boards supported by the curriculum architecture (UI selection is future work) */
const SUPPORTED_BOARDS = ["cbse", "icse", "wbbse"];

/** Category for Study Material Index cards (Category A pages only) */
const STUDY_MATERIAL_CATEGORY = "study-material";

const STUDY_PAGE_STATUS_AVAILABLE = "available";

/**
 * Explicit registry of study-material pages that exist and are valid for navigation.
 * Add entries here only when a real study page is ready — never for placeholders.
 *
 * Key format: "{topicId}:{classLevel}"
 */
const STUDY_PAGE_REGISTRY = {
  "statistics:7": {
    id: "statistics:7",
    topicId: "statistics",
    classLevel: 7,
    path: "../statistics/class7.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Statistics",
    icon: "📊",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "probability:7": {
    id: "probability:7",
    topicId: "probability",
    classLevel: 7,
    path: "../probability/class7.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Probability",
    icon: "🎲",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "algebra:7": {
    id: "algebra:7",
    topicId: "algebra",
    classLevel: 7,
    path: "../algebra/class7.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Algebra",
    icon: "📐",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "algebra:9": {
    id: "algebra:9",
    topicId: "algebra",
    classLevel: 9,
    path: "../algebra/class9.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Algebra",
    icon: "📐",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "mensuration:6": {
    id: "mensuration:6",
    topicId: "mensuration",
    classLevel: 6,
    path: "../mensuration/class6.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Mensuration",
    icon: "📦",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "algebra:6": {
    id: "algebra:6",
    topicId: "algebra",
    classLevel: 6,
    path: "../algebra/class6.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Algebra",
    icon: "📐",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "geometry:6": {
    id: "geometry:6",
    topicId: "geometry",
    classLevel: 6,
    path: "../geometry/class6.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Geometry",
    icon: "📏",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "statistics:6": {
    id: "statistics:6",
    topicId: "statistics",
    classLevel: 6,
    path: "../statistics/class6.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Data Handling",
    icon: "📊",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "arithmetic:6": {
    id: "arithmetic:6",
    topicId: "arithmetic",
    classLevel: 6,
    path: "../arithmetic/class6.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Arithmetic",
    icon: "➕",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  },
  "fractions-decimals:6": {
    id: "fractions-decimals:6",
    topicId: "fractions-decimals",
    classLevel: 6,
    path: "../fractions-decimals/class6.html",
    status: STUDY_PAGE_STATUS_AVAILABLE,
    title: "Fractions & Decimals",
    icon: "➗",
    category: STUDY_MATERIAL_CATEGORY,
    boards: null
  }
};

/**
 * Common Mathematics syllabus taxonomy by class (board-agnostic baseline).
 * Topics without a matching available registry entry are metadata-only and do not appear as cards.
 *
 * studyPageKey links to STUDY_PAGE_REGISTRY when a page exists.
 */
const MATHEMATICS_CURRICULUM_BASE = {
  6: [
    { id: "number-system", title: "Number System", icon: "🔢" },
    { id: "arithmetic", title: "Arithmetic", icon: "➕", studyPageKey: "arithmetic:6" },
    { id: "fractions-decimals", title: "Fractions & Decimals", icon: "➗", studyPageKey: "fractions-decimals:6" },
    { id: "ratio-proportion", title: "Ratio & Proportion", icon: "⚖️" },
    { id: "algebra", title: "Algebra", icon: "📐", studyPageKey: "algebra:6" },
    { id: "geometry", title: "Geometry", icon: "📏", studyPageKey: "geometry:6" },
    { id: "mensuration", title: "Mensuration", icon: "📦", studyPageKey: "mensuration:6" },
    { id: "data-handling", title: "Data Handling", icon: "📊", studyPageKey: "statistics:6" }
  ],
  7: [
    { id: "number-system", title: "Number System", icon: "🔢" },
    { id: "arithmetic", title: "Arithmetic", icon: "➕", studyPageKey: "arithmetic:7" },
    {
      id: "fractions-decimals-rational",
      title: "Fractions, Decimals & Rational Numbers",
      icon: "➗"
    },
    { id: "ratio-proportion", title: "Ratio & Proportion", icon: "⚖️" },
    { id: "algebra", title: "Algebra", icon: "📐", studyPageKey: "algebra:7" },
    { id: "geometry", title: "Geometry", icon: "📏", studyPageKey: "geometry:7" },
    { id: "mensuration", title: "Mensuration", icon: "📦", studyPageKey: "mensuration:7" },
    {
      id: "data-handling-statistics",
      title: "Data Handling & Statistics",
      icon: "📊",
      studyPageKey: "statistics:7"
    },
    { id: "probability", title: "Probability", icon: "🎲", studyPageKey: "probability:7" }
  ],
  8: [
    { id: "number-system", title: "Number System", icon: "🔢" },
    { id: "arithmetic", title: "Arithmetic", icon: "➕", studyPageKey: "arithmetic:8" },
    {
      id: "ratio-proportion-percentage",
      title: "Ratio, Proportion & Percentage",
      icon: "⚖️"
    },
    { id: "algebra", title: "Algebra", icon: "📐", studyPageKey: "algebra:8" },
    { id: "geometry", title: "Geometry", icon: "📏", studyPageKey: "geometry:8" },
    { id: "mensuration", title: "Mensuration", icon: "📦", studyPageKey: "mensuration:8" },
    {
      id: "coordinate-geometry-graphs",
      title: "Coordinate Geometry & Graphs",
      icon: "📈"
    },
    {
      id: "data-handling-statistics",
      title: "Data Handling & Statistics",
      icon: "📊",
      studyPageKey: "statistics:8"
    },
    { id: "probability", title: "Probability", icon: "🎲", studyPageKey: "probability:8" }
  ],
  9: [
    { id: "number-system", title: "Number System", icon: "🔢" },
    {
      id: "arithmetic-commercial",
      title: "Arithmetic & Commercial Mathematics",
      icon: "➕",
      studyPageKey: "arithmetic:9"
    },
    { id: "algebra", title: "Algebra", icon: "📐", studyPageKey: "algebra:9" },
    { id: "coordinate-geometry", title: "Coordinate Geometry", icon: "📈" },
    { id: "geometry", title: "Geometry", icon: "📏", studyPageKey: "geometry:9" },
    { id: "mensuration", title: "Mensuration", icon: "📦", studyPageKey: "mensuration:9" },
    { id: "statistics", title: "Statistics", icon: "📊", studyPageKey: "statistics:9" },
    { id: "probability", title: "Probability", icon: "🎲", studyPageKey: "probability:9" },
    {
      id: "intro-trigonometry",
      title: "Introduction to Trigonometry",
      icon: "📐",
      studyPageKey: "trigonometry:9"
    }
  ],
  10: [
    {
      id: "real-numbers",
      title: "Real Numbers / Number System",
      icon: "🔢"
    },
    {
      id: "arithmetic-commercial",
      title: "Arithmetic & Commercial Mathematics",
      icon: "➕",
      studyPageKey: "arithmetic:10"
    },
    { id: "algebra", title: "Algebra", icon: "📐", studyPageKey: "algebra:10" },
    { id: "coordinate-geometry", title: "Coordinate Geometry", icon: "📈" },
    { id: "geometry", title: "Geometry", icon: "📏", studyPageKey: "geometry:10" },
    { id: "mensuration", title: "Mensuration", icon: "📦", studyPageKey: "mensuration:10" },
    { id: "trigonometry", title: "Trigonometry", icon: "📈", studyPageKey: "trigonometry:10" },
    { id: "statistics", title: "Statistics", icon: "📊", studyPageKey: "statistics:10" },
    { id: "probability", title: "Probability", icon: "🎲", studyPageKey: "probability:10" }
  ],
  11: [
    { id: "sets", title: "Sets", icon: "🔗" },
    { id: "relations-functions", title: "Relations & Functions", icon: "↔️" },
    { id: "trigonometric-functions", title: "Trigonometric Functions", icon: "📈", studyPageKey: "trigonometry:11" },
    { id: "algebra", title: "Algebra", icon: "📐", studyPageKey: "algebra:11" },
    { id: "sequences-series", title: "Sequences & Series", icon: "∞" },
    { id: "permutations-combinations", title: "Permutations & Combinations", icon: "🔀" },
    { id: "binomial-theorem", title: "Binomial Theorem", icon: "📘" },
    { id: "coordinate-geometry", title: "Coordinate Geometry", icon: "📈" },
    { id: "conic-sections", title: "Conic Sections", icon: "⭕" },
    { id: "3d-geometry", title: "3D Geometry", icon: "🧊", studyPageKey: "geometry:11" },
    { id: "limits-derivatives", title: "Limits & Derivatives", icon: "∫", studyPageKey: "calculus:11" },
    { id: "calculus", title: "Calculus", icon: "∫", studyPageKey: "calculus:11" },
    { id: "statistics", title: "Statistics", icon: "📊", studyPageKey: "statistics:11" },
    { id: "probability", title: "Probability", icon: "🎲", studyPageKey: "probability:11" },
    { id: "mathematical-reasoning", title: "Mathematical Reasoning", icon: "🧠" }
  ],
  12: [
    { id: "relations-functions", title: "Relations & Functions", icon: "↔️" },
    {
      id: "inverse-trigonometric",
      title: "Inverse Trigonometric Functions",
      icon: "📈",
      studyPageKey: "trigonometry:12"
    },
    { id: "algebra", title: "Algebra", icon: "📐", studyPageKey: "algebra:12" },
    { id: "matrices", title: "Matrices", icon: "▦" },
    { id: "determinants", title: "Determinants", icon: "▦" },
    { id: "continuity-differentiability", title: "Continuity & Differentiability", icon: "∫", studyPageKey: "calculus:12" },
    { id: "applications-derivatives", title: "Applications of Derivatives", icon: "∫" },
    { id: "integrals", title: "Integrals", icon: "∫" },
    { id: "applications-integrals", title: "Applications of Integrals", icon: "∫" },
    { id: "differential-equations", title: "Differential Equations", icon: "∫" },
    { id: "vectors", title: "Vectors", icon: "➡️" },
    { id: "3d-geometry", title: "3D Geometry", icon: "🧊", studyPageKey: "geometry:12" },
    { id: "linear-programming", title: "Linear Programming", icon: "📊" },
    { id: "probability", title: "Probability", icon: "🎲", studyPageKey: "probability:12" },
    { id: "statistics", title: "Statistics", icon: "📊", studyPageKey: "statistics:12" }
  ]
};

/**
 * Board-specific curriculum overrides. Empty objects inherit MATHEMATICS_CURRICULUM_BASE.
 * Future: patch or replace class topic lists per board without duplicating the full tree.
 */
const BOARD_CURRICULUM_OVERRIDES = {
  cbse: {},
  icse: {},
  wbbse: {}
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

function resolveBoardKey(boardId) {
  if (!boardId || boardId === DEFAULT_BOARD) {
    return DEFAULT_BOARD;
  }

  if (SUPPORTED_BOARDS.indexOf(boardId) !== -1) {
    return boardId;
  }

  return DEFAULT_BOARD;
}

function getMathematicsCurriculum(classLevel, boardId) {
  const boardKey = resolveBoardKey(boardId);
  const baseTopics = MATHEMATICS_CURRICULUM_BASE[classLevel];

  if (!Array.isArray(baseTopics)) {
    return [];
  }

  const overrides = BOARD_CURRICULUM_OVERRIDES[boardKey];

  if (boardKey !== DEFAULT_BOARD && overrides && Array.isArray(overrides[classLevel])) {
    return overrides[classLevel];
  }

  return baseTopics;
}

function isStudyPageAvailableForBoard(pageEntry, boardId) {
  if (!pageEntry || pageEntry.status !== STUDY_PAGE_STATUS_AVAILABLE) {
    return false;
  }

  const boardKey = resolveBoardKey(boardId);

  if (!pageEntry.boards || !Array.isArray(pageEntry.boards)) {
    return true;
  }

  return pageEntry.boards.indexOf(boardKey) !== -1;
}

function classMathematicsReturnPath(classLevel) {
  return "../class" + classLevel + "/mathematics.html";
}

/**
 * Validates a class-first back-navigation return target.
 * Accepts only same-app relative paths (no external URLs).
 */
function validateStudyReturnPath(returnPath) {
  if (!returnPath || typeof returnPath !== "string") {
    return false;
  }

  var trimmed = returnPath.trim();

  if (!trimmed || trimmed.charAt(0) === "/") {
    return false;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return false;
  }

  if (trimmed.indexOf("//") === 0) {
    return false;
  }

  if (trimmed.indexOf("\\") !== -1) {
    return false;
  }

  if (trimmed.indexOf("..\\") !== -1) {
    return false;
  }

  return /^\.\.\/class(6|7|8|9|10|11|12)\/mathematics\.html$/.test(trimmed);
}

/**
 * Builds a study-page href with explicit class-first navigation context.
 */
function buildClassFirstStudyHref(pagePath, classLevel) {
  if (!pagePath || !classLevel) {
    return pagePath || "";
  }

  var returnPath = classMathematicsReturnPath(classLevel);
  var separator = pagePath.indexOf("?") >= 0 ? "&" : "?";

  return (
    pagePath +
    separator +
    "nav=class-first&class=" +
    encodeURIComponent(String(classLevel)) +
    "&return=" +
    encodeURIComponent(returnPath)
  );
}

/**
 * Returns navigation card entries for a class Mathematics index.
 * Only topics with available registry pages are included.
 *
 * Each entry: { class, id, title, path, href, category, icon, order, studyPageKey }
 */
function getClassStudyMaterials(classLevel, boardId) {
  var curriculum = getMathematicsCurriculum(classLevel, boardId);
  var results = [];

  curriculum.forEach(function (topic) {
    if (!topic || !topic.studyPageKey) {
      return;
    }

    var pageEntry = STUDY_PAGE_REGISTRY[topic.studyPageKey];

    if (!isStudyPageAvailableForBoard(pageEntry, boardId)) {
      return;
    }

    if (pageEntry.classLevel !== classLevel) {
      console.warn(
        "Study page class mismatch:",
        topic.studyPageKey,
        "expected class",
        classLevel,
        "got",
        pageEntry.classLevel
      );
      return;
    }

    results.push({
      class: classLevel,
      id: topic.id,
      title: topic.title || pageEntry.title,
      path: pageEntry.path,
      href: buildClassFirstStudyHref(pageEntry.path, classLevel),
      category: pageEntry.category || STUDY_MATERIAL_CATEGORY,
      icon: topic.icon || pageEntry.icon,
      order: results.length + 1,
      studyPageKey: topic.studyPageKey
    });
  });

  return results;
}
