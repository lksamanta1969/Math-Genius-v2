/**
 * Misconception Engine schema (architecture only)
 *
 * Future detection categories:
 *   Calculation Mistake · Formula Selection Error · Concept Error
 *   Sign Error · Unit Error · Logic Error
 */
(function (global) {
  "use strict";

  const MisconceptionCategories = Object.freeze({
    CALCULATION_MISTAKE: "Calculation Mistake",
    FORMULA_SELECTION_ERROR: "Formula Selection Error",
    CONCEPT_ERROR: "Concept Error",
    SIGN_ERROR: "Sign Error",
    UNIT_ERROR: "Unit Error",
    LOGIC_ERROR: "Logic Error"
  });

  function createMisconception(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      category: p.category || null,
      description: p.description || "",
      severity: p.severity || null,
      relatedConceptId: p.relatedConceptId || null,
      relatedFormulaId: p.relatedFormulaId || null,
      remediationHint: p.remediationHint || null,
      detected: p.detected === true
    };
  }

  function createMisconceptionReport(partial) {
    const p = partial || {};
    return {
      questionId: p.questionId || null,
      solutionId: p.solutionId || null,
      misconceptions: Array.isArray(p.misconceptions)
        ? p.misconceptions.map(createMisconception)
        : [],
      primaryCategory: p.primaryCategory || null
    };
  }

  const MisconceptionEngine = {
    Categories: MisconceptionCategories,
    create: createMisconception,
    createReport: createMisconceptionReport,
    listCategories: function () {
      return Object.keys(MisconceptionCategories).map(function (k) {
        return MisconceptionCategories[k];
      });
    },

    /** Architecture stub — no detection yet */
    detect: async function (context) {
      const ctx = context || {};
      return createMisconceptionReport({
        questionId: (ctx.question && ctx.question.id) || null,
        solutionId: (ctx.solution && ctx.solution.id) || null,
        misconceptions: [],
        primaryCategory: null
      });
    }
  };

  global.MisconceptionSchema = MisconceptionEngine;
})(window);
