/**
 * Registers default no-op / stub stage handlers for the Learning Pipeline.
 * AI Solver stages remain skipped until Phase 8B.
 */
(function (global) {
  "use strict";

  if (!global.LearningPipeline) return;

  const Stages = global.LearningPipeline.Stages;

  global.LearningPipeline.registerStage(
    Stages.CONCEPT_DETECTION,
    async function (ctx, options) {
      const concept =
        global.ConceptSchema && global.ConceptSchema.detect
          ? await global.ConceptSchema.detect(ctx.question, options)
          : null;
      return { concept: concept };
    }
  );

  global.LearningPipeline.registerStage(
    Stages.TOPIC_MAPPING,
    async function (ctx) {
      const concept = ctx.concept || {};
      return {
        topicMapping: {
          board: concept.board || null,
          class: concept.class || null,
          subject: concept.subject || null,
          chapter: concept.chapter || null,
          topic: concept.topic || null,
          subTopic: concept.subTopic || null
        }
      };
    }
  );

  global.LearningPipeline.registerStage(
    Stages.FORMULA_RECOMMENDATION,
    async function (ctx) {
      // Future: map concept → Formula Library IDs
      return {
        recommendedFormulas: Array.isArray(ctx.recommendedFormulas)
          ? ctx.recommendedFormulas
          : []
      };
    }
  );

  // AI_SOLVER / STEP / EXPLANATION intentionally not registered for solving yet.

  global.LearningPipeline.registerStage(
    Stages.LEARNING_INSIGHTS,
    async function (ctx) {
      const insights =
        global.LearningInsightsSchema && global.LearningInsightsSchema.generate
          ? await global.LearningInsightsSchema.generate(ctx)
          : null;
      return { insights: insights };
    }
  );

  global.LearningPipeline.registerStage(
    Stages.PRACTICE_GENERATOR,
    async function (ctx) {
      const practice =
        global.PracticeGeneratorSchema && global.PracticeGeneratorSchema.generate
          ? await global.PracticeGeneratorSchema.generate(ctx)
          : null;
      return { practice: practice };
    }
  );

  global.LearningPipeline.registerStage(
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

  global.LearningPipeline.registerStage(
    Stages.FINAL_UI,
    async function (ctx) {
      if (global.AdaptiveLearning && global.AdaptiveLearning.analyze) {
        ctx.adaptive = await global.AdaptiveLearning.analyze(ctx);
      }
      return {};
    }
  );
})(window);
