/**
 * Learning Insights schema
 *
 * Each solution should generate:
 * - Concept Used
 * - Formula Used
 * - Common Mistakes
 * - Exam Tips
 * - Time Saving Tips
 * - Alternative Method
 * - Related Topics
 */
(function (global) {
  "use strict";

  function createLearningInsights(partial) {
    const p = partial || {};
    return {
      conceptUsed: p.conceptUsed || null,
      formulaUsed: Array.isArray(p.formulaUsed) ? p.formulaUsed : [],
      commonMistakes: Array.isArray(p.commonMistakes) ? p.commonMistakes : [],
      examTips: Array.isArray(p.examTips) ? p.examTips : [],
      timeSavingTips: Array.isArray(p.timeSavingTips) ? p.timeSavingTips : [],
      alternativeMethod: p.alternativeMethod || null,
      relatedTopics: Array.isArray(p.relatedTopics) ? p.relatedTopics : [],

      // Optional linkage
      solutionId: p.solutionId || null,
      questionId: p.questionId || null,
      conceptId: p.conceptId || null
    };
  }

  const LearningInsights = {
    create: createLearningInsights,

    /** Architecture stub — no AI content yet */
    generate: async function (context) {
      const ctx = context || {};
      const solution = ctx.solution || {};
      const concept = ctx.concept || {};
      return createLearningInsights({
        conceptUsed: concept.topic || concept.chapter || null,
        formulaUsed: solution.formulaUsed || [],
        commonMistakes: solution.commonMistakes || [],
        examTips: [],
        timeSavingTips: [],
        alternativeMethod:
          (solution.alternativeMethods && solution.alternativeMethods[0]) ||
          null,
        relatedTopics: [],
        solutionId: solution.id || null,
        questionId: (ctx.question && ctx.question.id) || solution.questionId || null,
        conceptId: concept.id || null
      });
    }
  };

  global.LearningInsightsSchema = LearningInsights;
})(window);
