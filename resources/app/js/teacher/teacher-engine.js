/**
 * Teacher Engine (architecture)
 *
 * Math Genius behaves like a human teacher.
 *
 * Question
 *  → Concept Detection
 *  → Knowledge Graph
 *  → Prerequisite Check
 *  → Learning Path
 *  → Formula Recommendation
 *  → AI Solver
 *  → Explanation
 *  → Misconception Detection
 *  → Practice Recommendation
 *  → Quiz Recommendation
 *  → Revision Recommendation
 *  → Progress Update
 *
 * No AI solving. No content generation. Stages are pluggable stubs.
 */

(function (global) {
  "use strict";

  const TeacherStages = Object.freeze({
    CONCEPT_DETECTION: "concept-detection",
    KNOWLEDGE_GRAPH: "knowledge-graph",
    PREREQUISITE_CHECK: "prerequisite-check",
    LEARNING_PATH: "learning-path",
    FORMULA_RECOMMENDATION: "formula-recommendation",
    AI_SOLVER: "ai-solver",
    EXPLANATION: "explanation",
    MISCONCEPTION_DETECTION: "misconception-detection",
    PRACTICE_RECOMMENDATION: "practice-recommendation",
    QUIZ_RECOMMENDATION: "quiz-recommendation",
    REVISION_RECOMMENDATION: "revision-recommendation",
    PROGRESS_UPDATE: "progress-update"
  });

  const stageHandlers = Object.create(null);

  const SOLVER_STAGES = [
    TeacherStages.AI_SOLVER,
    TeacherStages.EXPLANATION
  ];

  const TeacherEngine = {
    Stages: TeacherStages,

    registerStage: function (stage, handler) {
      if (typeof handler !== "function") {
        throw new Error("Teacher stage handler must be a function: " + stage);
      }
      stageHandlers[stage] = handler;
    },

    listStages: function () {
      return Object.keys(TeacherStages).map(function (key) {
        const id = TeacherStages[key];
        return {
          id: id,
          registered: typeof stageHandlers[id] === "function"
        };
      });
    },

    /**
     * @param {object} question
     * @param {object} [options]
     * @returns {Promise<object>} TeacherContext
     */
    run: async function (question, options) {
      const opts = options || {};
      const mode =
        opts.teacherMode ||
        (global.TeacherModes && global.TeacherModes.Modes.TUTOR) ||
        "Tutor Mode";

      const profile =
        opts.studentProfile ||
        (global.PersonalisationSchema &&
          global.PersonalisationSchema.getDefaultProfile &&
          global.PersonalisationSchema.getDefaultProfile()) ||
        null;

      const ctx = {
        question: question || null,
        concept: null,
        knowledgeGraph: null,
        prerequisiteCheck: null,
        learningPath: null,
        recommendedFormulas: [],
        solution: null,
        explanation: null,
        misconceptionReport: null,
        practiceRecommendation: null,
        quizRecommendation: null,
        revisionRecommendation: null,
        progressUpdate: null,
        achievements: null,
        meta: {
          teacherMode: mode,
          modeContext:
            global.TeacherModes && global.TeacherModes.createContext
              ? global.TeacherModes.createContext(mode, opts)
              : { mode: mode },
          studentProfile: profile,
          board: opts.board || (profile && profile.board) || null,
          class: opts.class || (profile && profile.class) || null,
          language:
            opts.language ||
            (profile && profile.preferredLanguage) ||
            "en",
          explanationStyle:
            opts.explanationMode ||
            (profile && profile.preferredExplanationStyle) ||
            "Standard",
          skipSolver: opts.skipSolver !== false
        }
      };

      const order = [
        TeacherStages.CONCEPT_DETECTION,
        TeacherStages.KNOWLEDGE_GRAPH,
        TeacherStages.PREREQUISITE_CHECK,
        TeacherStages.LEARNING_PATH,
        TeacherStages.FORMULA_RECOMMENDATION,
        TeacherStages.AI_SOLVER,
        TeacherStages.EXPLANATION,
        TeacherStages.MISCONCEPTION_DETECTION,
        TeacherStages.PRACTICE_RECOMMENDATION,
        TeacherStages.QUIZ_RECOMMENDATION,
        TeacherStages.REVISION_RECOMMENDATION,
        TeacherStages.PROGRESS_UPDATE
      ];

      for (let i = 0; i < order.length; i += 1) {
        const stage = order[i];

        if (ctx.meta.skipSolver && SOLVER_STAGES.indexOf(stage) >= 0) {
          continue;
        }

        const handler = stageHandlers[stage];
        if (!handler) continue;

        if (global.SolverEvents) {
          global.SolverEvents.emit("teacher:stage", { stage: stage, mode: mode });
        }

        const result = await handler(ctx, opts);
        if (result && typeof result === "object") {
          Object.assign(ctx, result);
        }
      }

      if (global.SolverEvents) {
        global.SolverEvents.emit("teacher:done", {
          questionId: question && question.id,
          mode: mode
        });
      }

      return ctx;
    }
  };

  if (global.SolverEvents) {
    global.SolverEvents.TEACHER_STAGE = "teacher:stage";
    global.SolverEvents.TEACHER_DONE = "teacher:done";
  }

  global.TeacherEngine = TeacherEngine;
})(window);
