/**
 * Learning Path schema (architecture)
 *
 * Supports:
 *   Learn Next Topic · Revise Previous Topic
 *   Practice Weak Area · Skip Already Mastered
 */
(function (global) {
  "use strict";

  const LearningPathActions = Object.freeze({
    LEARN_NEXT: "Learn Next Topic",
    REVISE_PREVIOUS: "Revise Previous Topic",
    PRACTICE_WEAK: "Practice Weak Area",
    SKIP_MASTERED: "Skip Already Mastered"
  });

  function createLearningPathStep(partial) {
    const p = partial || {};
    return {
      action: p.action || LearningPathActions.LEARN_NEXT,
      topicId: p.topicId || null,
      topic: p.topic || null,
      conceptId: p.conceptId || null,
      reason: p.reason || null,
      skipped: p.skipped === true
    };
  }

  function createLearningPath(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      currentTopicId: p.currentTopicId || null,
      steps: Array.isArray(p.steps) ? p.steps.map(createLearningPathStep) : [],
      suggestedAction: p.suggestedAction || LearningPathActions.LEARN_NEXT,
      masteredTopicIds: Array.isArray(p.masteredTopicIds)
        ? p.masteredTopicIds
        : [],
      weakTopicIds: Array.isArray(p.weakTopicIds) ? p.weakTopicIds : []
    };
  }

  const LearningPath = {
    Actions: LearningPathActions,
    createStep: createLearningPathStep,
    create: createLearningPath,

    /** Architecture stub — no adaptive path computation yet */
    build: async function (context) {
      const ctx = context || {};
      const concept = ctx.concept || {};
      const node =
        ctx.knowledgeGraph &&
        ctx.knowledgeGraph.nodes &&
        ctx.knowledgeGraph.nodes[0];

      return createLearningPath({
        id: null,
        currentTopicId: (node && node.id) || concept.id || null,
        steps: [],
        suggestedAction: LearningPathActions.LEARN_NEXT,
        masteredTopicIds: [],
        weakTopicIds: []
      });
    }
  };

  global.LearningPathSchema = LearningPath;
})(window);
