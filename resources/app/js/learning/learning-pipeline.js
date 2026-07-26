/**
 * Learning Pipeline (architecture)
 *
 * Core learning slice. Full human-teacher flow lives in TeacherEngine:
 *   Question → Concept → Knowledge Graph → Prerequisites → Learning Path
 *   → Formula → AI Solver → Explanation → Misconception → Practice
 *   → Quiz → Revision → Progress
 *
 * This module retains the earlier Learning Platform stages for compatibility.
 * Prefer TeacherEngine.run() for the complete educational pipeline.
 *
 * Stages are pluggable. Solving is NOT implemented here.
 */

(function (global) {
  "use strict";

  const LearningPipelineStages = Object.freeze({
    CONCEPT_DETECTION: "concept-detection",
    TOPIC_MAPPING: "topic-mapping",
    FORMULA_RECOMMENDATION: "formula-recommendation",
    AI_SOLVER: "ai-solver",
    STEP_GENERATOR: "step-generator",
    EXPLANATION_GENERATOR: "explanation-generator",
    LEARNING_INSIGHTS: "learning-insights",
    PRACTICE_GENERATOR: "practice-generator",
    QUIZ_RECOMMENDATION: "quiz-recommendation",
    FINAL_UI: "final-ui"
  });

  const stageHandlers = Object.create(null);

  const LearningPipeline = {
    Stages: LearningPipelineStages,

    /**
     * Register a stage handler.
     * @param {string} stage
     * @param {function(object, object=): Promise<object>|object} handler
     */
    registerStage: function (stage, handler) {
      if (typeof handler !== "function") {
        throw new Error("Learning stage handler must be a function: " + stage);
      }
      stageHandlers[stage] = handler;
    },

    listStages: function () {
      return Object.keys(LearningPipelineStages).map(function (key) {
        const id = LearningPipelineStages[key];
        return {
          id: id,
          registered: typeof stageHandlers[id] === "function"
        };
      });
    },

    /**
     * Run pipeline up to (but not including) AI solving by default.
     * Phase 8B will enable solver stages when approved.
     * @param {object} question
     * @param {object} [options]
     * @returns {Promise<object>} LearningContext
     */
    run: async function (question, options) {
      const opts = options || {};
      const ctx = {
        question: question || null,
        concept: null,
        topicMapping: null,
        recommendedFormulas: [],
        solution: null,
        insights: null,
        practice: null,
        quizRecommendation: null,
        adaptive: null,
        meta: {
          board: opts.board || null,
          class: opts.class || null,
          language: opts.language || "en",
          explanationMode: opts.explanationMode || "Standard",
          skipSolver: opts.skipSolver !== false // default true until 8B
        }
      };

      const order = [
        LearningPipelineStages.CONCEPT_DETECTION,
        LearningPipelineStages.TOPIC_MAPPING,
        LearningPipelineStages.FORMULA_RECOMMENDATION,
        LearningPipelineStages.AI_SOLVER,
        LearningPipelineStages.STEP_GENERATOR,
        LearningPipelineStages.EXPLANATION_GENERATOR,
        LearningPipelineStages.LEARNING_INSIGHTS,
        LearningPipelineStages.PRACTICE_GENERATOR,
        LearningPipelineStages.QUIZ_RECOMMENDATION,
        LearningPipelineStages.FINAL_UI
      ];

      for (let i = 0; i < order.length; i += 1) {
        const stage = order[i];

        if (
          ctx.meta.skipSolver &&
          (stage === LearningPipelineStages.AI_SOLVER ||
            stage === LearningPipelineStages.STEP_GENERATOR ||
            stage === LearningPipelineStages.EXPLANATION_GENERATOR)
        ) {
          continue;
        }

        const handler = stageHandlers[stage];
        if (!handler) continue;

        if (global.SolverEvents) {
          global.SolverEvents.emit("learning:stage", { stage: stage });
        }

        const result = await handler(ctx, opts);
        if (result && typeof result === "object") {
          Object.assign(ctx, result);
        }
      }

      if (global.SolverEvents) {
        global.SolverEvents.emit("learning:done", {
          questionId: question && question.id
        });
      }

      return ctx;
    }
  };

  if (global.SolverEvents) {
    global.SolverEvents.LEARNING_STAGE = "learning:stage";
    global.SolverEvents.LEARNING_DONE = "learning:done";
  }

  global.LearningPipeline = LearningPipeline;
})(window);
