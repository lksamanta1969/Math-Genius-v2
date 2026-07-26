/**
 * Registers Teacher Engine stage stubs.
 * AI Solver / Explanation remain unregistered for solving until Phase 8B.
 */
(function (global) {
  "use strict";

  if (!global.TeacherEngine) return;

  const Stages = global.TeacherEngine.Stages;

  global.TeacherEngine.registerStage(
    Stages.CONCEPT_DETECTION,
    async function (ctx, options) {
      const concept =
        global.ConceptSchema && global.ConceptSchema.detect
          ? await global.ConceptSchema.detect(ctx.question, options)
          : null;
      return { concept: concept };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.KNOWLEDGE_GRAPH,
    async function (ctx) {
      const graph =
        global.KnowledgeGraphSchema && global.KnowledgeGraphSchema.resolveForConcept
          ? await global.KnowledgeGraphSchema.resolveForConcept(ctx.concept)
          : null;
      return { knowledgeGraph: graph };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.PREREQUISITE_CHECK,
    async function (ctx) {
      const concept = ctx.concept || {};
      const prereqs =
        global.KnowledgeGraphSchema && global.KnowledgeGraphSchema.getPrerequisites
          ? global.KnowledgeGraphSchema.getPrerequisites(
              ctx.knowledgeGraph,
              concept.id || concept.topic
            )
          : Array.isArray(concept.prerequisites)
            ? concept.prerequisites.slice()
            : [];

      return {
        prerequisiteCheck: {
          required: prereqs,
          missing: [],
          ready: true,
          note: "Architecture stub — mastery checks arrive later"
        }
      };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.LEARNING_PATH,
    async function (ctx) {
      const path =
        global.LearningPathSchema && global.LearningPathSchema.build
          ? await global.LearningPathSchema.build(ctx)
          : null;
      return { learningPath: path };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.FORMULA_RECOMMENDATION,
    async function (ctx) {
      return {
        recommendedFormulas: Array.isArray(ctx.recommendedFormulas)
          ? ctx.recommendedFormulas
          : []
      };
    }
  );

  // AI_SOLVER / EXPLANATION intentionally not registered for solving.

  global.TeacherEngine.registerStage(
    Stages.MISCONCEPTION_DETECTION,
    async function (ctx) {
      const report =
        global.MisconceptionSchema && global.MisconceptionSchema.detect
          ? await global.MisconceptionSchema.detect(ctx)
          : null;
      return { misconceptionReport: report };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.PRACTICE_RECOMMENDATION,
    async function (ctx) {
      const practice =
        global.PracticeGeneratorSchema && global.PracticeGeneratorSchema.generate
          ? await global.PracticeGeneratorSchema.generate(ctx)
          : null;
      return {
        practiceRecommendation: {
          enabled: false,
          practiceSet: practice,
          focus: "weak-area"
        }
      };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.QUIZ_RECOMMENDATION,
    async function (ctx) {
      return {
        quizRecommendation: {
          enabled: false,
          topic: (ctx.concept && ctx.concept.topic) || null,
          suggestedQuizIds: []
        }
      };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.REVISION_RECOMMENDATION,
    async function (ctx) {
      const path = ctx.learningPath || {};
      return {
        revisionRecommendation: {
          enabled: false,
          action:
            (global.LearningPathSchema &&
              global.LearningPathSchema.Actions.REVISE_PREVIOUS) ||
            "Revise Previous Topic",
          topics: Array.isArray(path.weakTopicIds) ? path.weakTopicIds : []
        }
      };
    }
  );

  global.TeacherEngine.registerStage(
    Stages.PROGRESS_UPDATE,
    async function (ctx) {
      const achievements =
        global.AchievementSchema && global.AchievementSchema.getEmptyState
          ? global.AchievementSchema.getEmptyState()
          : null;

      // Local analytics hook only — no network
      if (global.LearningAnalytics && global.LearningAnalytics.getSnapshot) {
        // Read-only snapshot; track() reserved for real solve events in 8B+
        ctx._analyticsSnapshot = global.LearningAnalytics.getSnapshot();
      }

      return {
        progressUpdate: {
          recorded: false,
          topic: (ctx.concept && ctx.concept.topic) || null,
          note: "Architecture stub — progress writes after approved solving"
        },
        achievements: achievements
      };
    }
  );
})(window);
