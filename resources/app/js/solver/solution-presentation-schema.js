/**
 * Solution Presentation schema (architecture)
 *
 * Canonical pedagogical order for every solved question:
 *
 * Question → Given → Find → Concept → Formula Used
 * → Step 1 → Step 2 → Step 3 → Final Answer → Verification
 * → Common Mistakes → Related Formula → Practice Questions → Mini Quiz
 *
 * No AI solving. No content generation. Structure only.
 */
(function (global) {
  "use strict";

  const PresentationSections = Object.freeze({
    QUESTION: "question",
    GIVEN: "given",
    FIND: "find",
    CONCEPT: "concept",
    FORMULA_USED: "formula-used",
    STEPS: "steps",
    FINAL_ANSWER: "final-answer",
    VERIFICATION: "verification",
    COMMON_MISTAKES: "common-mistakes",
    RELATED_FORMULA: "related-formula",
    PRACTICE_QUESTIONS: "practice-questions",
    MINI_QUIZ: "mini-quiz"
  });

  /** Fixed display / generation order */
  const PRESENTATION_ORDER = Object.freeze([
    PresentationSections.QUESTION,
    PresentationSections.GIVEN,
    PresentationSections.FIND,
    PresentationSections.CONCEPT,
    PresentationSections.FORMULA_USED,
    PresentationSections.STEPS,
    PresentationSections.FINAL_ANSWER,
    PresentationSections.VERIFICATION,
    PresentationSections.COMMON_MISTAKES,
    PresentationSections.RELATED_FORMULA,
    PresentationSections.PRACTICE_QUESTIONS,
    PresentationSections.MINI_QUIZ
  ]);

  function createMiniQuiz(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      title: p.title || "Mini Quiz",
      questions: Array.isArray(p.questions) ? p.questions : [],
      enabled: p.enabled === true
    };
  }

  function createVerificationBlock(partial) {
    const p = partial || {};
    const Status =
      (global.SolutionSchema && global.SolutionSchema.Verification) || {
        AI_GENERATED: "AI Generated",
        NEEDS_REVIEW: "Needs Review",
        VERIFIED: "Verified"
      };

    return {
      status: p.status || Status.NEEDS_REVIEW,
      check: p.check || null,
      notes: Array.isArray(p.notes) ? p.notes : [],
      confidence: typeof p.confidence === "number" ? p.confidence : null
    };
  }

  /**
   * Flatten a Solution into presentation sections (empty shells until Phase 8B).
   * @param {object} solution
   * @param {object} [concept]
   * @returns {object}
   */
  function toPresentation(solution, concept) {
    const s = solution || {};
    const c = concept || s.concept || null;

    return {
      order: PRESENTATION_ORDER.slice(),
      sections: {
        question: s.question || "",
        given: s.given || "",
        find: s.find || "",
        concept: c || s.conceptLabel || null,
        formulaUsed: Array.isArray(s.formulaUsed) ? s.formulaUsed : [],
        steps: Array.isArray(s.steps) ? s.steps : [],
        finalAnswer: s.finalAnswer != null ? s.finalAnswer : null,
        verification:
          s.verificationBlock ||
          createVerificationBlock({
            status: s.verification,
            confidence: s.confidence
          }),
        commonMistakes: Array.isArray(s.commonMistakes)
          ? s.commonMistakes
          : [],
        relatedFormula: Array.isArray(s.relatedFormulas)
          ? s.relatedFormulas
          : [],
        practiceQuestions: Array.isArray(s.practiceQuestions)
          ? s.practiceQuestions
          : [],
        miniQuiz: s.miniQuiz || createMiniQuiz({ enabled: false })
      }
    };
  }

  /**
   * Empty presentation shell for a question (architecture stub).
   */
  function createEmptyPresentation(question) {
    const q = question || {};
    return toPresentation(
      {
        question: q.text || q.recognizedText || "",
        given: "",
        find: "",
        formulaUsed: [],
        steps: [],
        finalAnswer: null,
        verification: null,
        commonMistakes: [],
        relatedFormulas: [],
        practiceQuestions: [],
        miniQuiz: createMiniQuiz({ enabled: false })
      },
      null
    );
  }

  global.SolutionPresentationSchema = {
    Sections: PresentationSections,
    Order: PRESENTATION_ORDER,
    createMiniQuiz: createMiniQuiz,
    createVerificationBlock: createVerificationBlock,
    toPresentation: toPresentation,
    createEmpty: createEmptyPresentation
  };
})(window);
