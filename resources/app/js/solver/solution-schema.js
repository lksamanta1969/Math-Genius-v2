/**
 * Solution + Step object schemas.
 *
 * Pedagogical presentation order (see SolutionPresentationSchema):
 *   Question → Given → Find → Concept → Formula Used
 *   → Steps → Final Answer → Verification
 *   → Common Mistakes → Related Formula → Practice Questions → Mini Quiz
 *
 * Solution {
 *   id, questionId, provider, status,
 *   question, given, find, concept, conceptId,
 *   formulaIds[] (solver emits IDs only),
 *   formulaUsed[] (rich objects via Curriculum Mapper),
 *   steps[], finalAnswer, verification, verificationBlock,
 *   commonMistakes[], relatedFormulas[], practiceQuestions[], miniQuiz,
 *   alternativeMethods[], confidence, difficulty, topic,
 *   chapter, subject, class, board, estimatedTime, insights, practiceSetId,
 *   curriculumErrors[]
 * }
 *
 * Step {
 *   stepNumber, title, description, latex, image, hint
 * }
 */

(function (global) {
  "use strict";

  const SolutionStatus = Object.freeze({
    PENDING: "pending",
    STREAMING: "streaming",
    COMPLETE: "complete",
    CANCELLED: "cancelled",
    ERROR: "error",
    NEEDS_REVIEW: "needs-review",
    UNSUPPORTED: "unsupported"
  });

  const VerificationStatus = Object.freeze({
    VERIFIED: "Verified",
    NEEDS_REVIEW: "Needs Review",
    AI_GENERATED: "AI Generated"
  });

  /**
   * @param {object} partial
   * @returns {object}
   */
  function createStep(partial) {
    const p = partial || {};
    return {
      stepNumber: p.stepNumber != null ? p.stepNumber : 0,
      title: p.title || "",
      description: p.description || "",
      latex: p.latex || "",
      image: p.image || null,
      hint: p.hint || null
    };
  }

  function createMiniQuiz(partial) {
    if (
      global.SolutionPresentationSchema &&
      global.SolutionPresentationSchema.createMiniQuiz
    ) {
      return global.SolutionPresentationSchema.createMiniQuiz(partial);
    }
    const p = partial || {};
    return {
      id: p.id || null,
      title: p.title || "Mini Quiz",
      questions: Array.isArray(p.questions) ? p.questions : [],
      enabled: p.enabled === true
    };
  }

  function createVerificationBlock(partial) {
    if (
      global.SolutionPresentationSchema &&
      global.SolutionPresentationSchema.createVerificationBlock
    ) {
      return global.SolutionPresentationSchema.createVerificationBlock(partial);
    }
    const p = partial || {};
    return {
      status: p.status || VerificationStatus.NEEDS_REVIEW,
      check: p.check || null,
      notes: Array.isArray(p.notes) ? p.notes : [],
      confidence: typeof p.confidence === "number" ? p.confidence : null
    };
  }

  /**
   * @param {object} partial
   * @returns {object}
   */
  function createSolution(partial) {
    const p = partial || {};
    const verificationStatus =
      p.verification || VerificationStatus.AI_GENERATED;

    return {
      id: p.id || null,
      questionId: p.questionId || null,
      provider: p.provider || null,
      status: p.status || SolutionStatus.PENDING,

      question: p.question || "",
      given: p.given || "",
      find: p.find || "",
      concept: p.concept || null,
      conceptId: p.conceptId || (p.concept && p.concept.id) || null,
      // Solver emits IDs; Curriculum Mapper hydrates formulaUsed
      formulaIds: Array.isArray(p.formulaIds)
        ? p.formulaIds.slice()
        : Array.isArray(p.formulaUsed)
          ? p.formulaUsed
              .map(function (f) {
                return typeof f === "string" ? f : f && (f.formulaId || f.id);
              })
              .filter(Boolean)
          : [],
      formulaUsed: Array.isArray(p.formulaUsed) ? p.formulaUsed : [],
      curriculumErrors: Array.isArray(p.curriculumErrors)
        ? p.curriculumErrors
        : [],
      steps: Array.isArray(p.steps)
        ? p.steps.map(function (s) {
            return createStep(s);
          })
        : [],
      finalAnswer: p.finalAnswer != null ? p.finalAnswer : null,
      verification: verificationStatus,
      verificationBlock:
        p.verificationBlock ||
        createVerificationBlock({
          status: verificationStatus,
          confidence: p.confidence,
          check: p.verificationCheck || null,
          notes: p.verificationNotes || []
        }),
      commonMistakes: Array.isArray(p.commonMistakes)
        ? p.commonMistakes
        : [],
      relatedFormulas: Array.isArray(p.relatedFormulas)
        ? p.relatedFormulas
        : [],
      practiceQuestions: Array.isArray(p.practiceQuestions)
        ? p.practiceQuestions
        : [],
      miniQuiz: p.miniQuiz || createMiniQuiz({ enabled: false }),

      alternativeMethods: Array.isArray(p.alternativeMethods)
        ? p.alternativeMethods
        : [],

      confidence: typeof p.confidence === "number" ? p.confidence : 0,
      difficulty: p.difficulty || null,
      topic: p.topic || null,

      chapter: p.chapter || null,
      subject: p.subject || null,
      class: p.class || null,
      board: p.board || null,

      estimatedTime: p.estimatedTime || null,

      insights: p.insights || null,
      practiceSetId: p.practiceSetId || null,

      // Pipeline / bridge errors (Phase 8B.2+)
      error: p.error || null,
      solveDurationMs:
        typeof p.solveDurationMs === "number" ? p.solveDurationMs : null,
      ocrDurationMs:
        typeof p.ocrDurationMs === "number" ? p.ocrDurationMs : null,

      explanationMode: p.explanationMode || "Standard",
      language: p.language || "en",
      runtimeMode: p.runtimeMode || "auto",
      createdAt: p.createdAt || null,
      updatedAt: p.updatedAt || null
    };
  }

  global.SolutionSchema = {
    Status: SolutionStatus,
    Verification: VerificationStatus,
    create: createSolution,
    createStep: createStep,
    createMiniQuiz: createMiniQuiz,
    createVerificationBlock: createVerificationBlock,
    toPresentation: function (solution, concept) {
      if (
        global.SolutionPresentationSchema &&
        global.SolutionPresentationSchema.toPresentation
      ) {
        return global.SolutionPresentationSchema.toPresentation(
          solution,
          concept
        );
      }
      return null;
    }
  };
})(window);
