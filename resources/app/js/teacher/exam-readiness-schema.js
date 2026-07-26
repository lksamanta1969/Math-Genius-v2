/**
 * Exam Readiness schema (architecture)
 *
 * Every concept should contain:
 *   Board Weightage · JEE Foundation Importance
 *   Olympiad Importance · Expected Difficulty
 */
(function (global) {
  "use strict";

  function createExamReadiness(partial) {
    const p = partial || {};
    return {
      boardWeightage: p.boardWeightage != null ? p.boardWeightage : null,
      jeeFoundationImportance:
        p.jeeFoundationImportance != null ? p.jeeFoundationImportance : null,
      olympiadImportance:
        p.olympiadImportance != null ? p.olympiadImportance : null,
      expectedDifficulty: p.expectedDifficulty || null
    };
  }

  global.ExamReadinessSchema = {
    create: createExamReadiness
  };
})(window);
