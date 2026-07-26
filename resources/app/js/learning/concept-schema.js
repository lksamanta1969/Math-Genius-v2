/**
 * Concept Object schema
 *
 * Concept {
 *   id, board, class, subject, chapter, topic, subTopic,
 *   difficulty, prerequisites[], learningObjectives[],
 *   examReadiness { boardWeightage, jeeFoundationImportance,
 *                   olympiadImportance, expectedDifficulty }
 * }
 */
(function (global) {
  "use strict";

  function createExamReadiness(partial) {
    if (global.ExamReadinessSchema && global.ExamReadinessSchema.create) {
      return global.ExamReadinessSchema.create(partial);
    }
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

  function createConcept(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      board: p.board || null,
      class: p.class || null,
      subject: p.subject || null,
      chapter: p.chapter || null,
      topic: p.topic || null,
      subTopic: p.subTopic || null,
      difficulty: p.difficulty || null,
      prerequisites: Array.isArray(p.prerequisites) ? p.prerequisites : [],
      learningObjectives: Array.isArray(p.learningObjectives)
        ? p.learningObjectives
        : [],
      examReadiness: createExamReadiness(p.examReadiness)
    };
  }

  /**
   * Concept Detection stage interface (plugin).
   * Used by Learning Pipeline and Teacher Engine.
   */
  const ConceptDetection = {
    create: createConcept,

    /**
     * Architecture stub — returns empty concept shell from question metadata.
     * Real detection arrives with curriculum mapping / Phase 8B+.
     */
    detect: async function (question, options) {
      const opts = options || {};
      return createConcept({
        id: null,
        board: opts.board || null,
        class: opts.class || (question && question.class) || null,
        subject: opts.subject || (question && question.subject) || null,
        chapter: opts.chapter || (question && question.chapter) || null,
        topic: null,
        subTopic: null,
        difficulty: (question && question.difficulty) || null,
        prerequisites: [],
        learningObjectives: [],
        examReadiness: {}
      });
    }
  };

  global.ConceptSchema = {
    create: createConcept,
    detect: ConceptDetection.detect
  };
})(window);
