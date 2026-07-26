/**
 * Solution pipeline stage interfaces (architecture only).
 *
 * Presentation order (SolutionPresentationSchema):
 *   Question → Given → Find → Concept → Formula Used
 *   → Steps → Final Answer → Verification
 *   → Common Mistakes → Related Formula → Practice Questions → Mini Quiz
 *
 * Nested inside Teacher / Learning pipelines.
 * Implementations arrive in Phase 8B — no AI work here.
 */
(function (global) {
  "use strict";

  const SolutionPipeline = {
    /**
     * @param {object} question
     * @param {object} [options]
     * @returns {object} Solution shell (no AI work yet)
     */
    createPendingSolution: function (question, options) {
      const opts = options || {};
      if (!global.SolutionSchema) {
        return {
          questionId: question && question.id,
          status: "pending"
        };
      }
      return global.SolutionSchema.create({
        id: "sol-pending-" + Date.now().toString(36),
        questionId: question && question.id,
        provider: null,
        status: global.SolutionSchema.Status.PENDING,
        question:
          (question && (question.text || question.recognizedText)) || "",
        given: "",
        find: "",
        concept: opts.concept || null,
        conceptId: opts.conceptId || null,
        formulaUsed: [],
        steps: [],
        finalAnswer: null,
        verification: global.SolutionSchema.Verification.NEEDS_REVIEW,
        commonMistakes: [],
        relatedFormulas: [],
        practiceQuestions: [],
        miniQuiz:
          global.SolutionSchema.createMiniQuiz &&
          global.SolutionSchema.createMiniQuiz({ enabled: false }),
        insights: null,
        practiceSetId: null,
        explanationMode:
          opts.explanationMode ||
          (global.SolverProviderInterface &&
            global.SolverProviderInterface.ExplanationModes.STANDARD) ||
          "Standard",
        language: opts.language || "en",
        runtimeMode: opts.mode || "auto",
        createdAt: new Date().toISOString()
      });
    },

    /**
     * Build empty presentation shell for UI wiring (no content generation).
     * @param {object} question
     * @param {object} [solution]
     * @returns {object|null}
     */
    createPresentation: function (question, solution) {
      if (
        global.SolutionPresentationSchema &&
        global.SolutionPresentationSchema.toPresentation
      ) {
        return global.SolutionPresentationSchema.toPresentation(
          solution || this.createPendingSolution(question),
          (solution && solution.concept) || null
        );
      }
      if (
        global.SolutionPresentationSchema &&
        global.SolutionPresentationSchema.createEmpty
      ) {
        return global.SolutionPresentationSchema.createEmpty(question);
      }
      return null;
    },

    runLearningContext: async function (question, options) {
      if (!global.LearningPipeline || !global.LearningPipeline.run) {
        return null;
      }
      return global.LearningPipeline.run(question, options || {});
    },

    runTeacherContext: async function (question, options) {
      if (!global.TeacherEngine || !global.TeacherEngine.run) {
        return null;
      }
      return global.TeacherEngine.run(question, options || {});
    },

    generateSteps: async function () {
      throw new Error("Step Generator not implemented (Phase 8B)");
    },

    generateExplanation: async function () {
      throw new Error("Explanation Generator not implemented (Phase 8B)");
    },

    finalizeAnswer: async function () {
      throw new Error("Final Answer stage not implemented (Phase 8B)");
    }
  };

  global.SolutionPipeline = SolutionPipeline;
})(window);
