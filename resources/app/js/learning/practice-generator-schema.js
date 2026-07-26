/**
 * Practice Generator schema (future)
 *
 * Supports:
 * - Easy / Medium / Hard Questions
 * - Previous Year Pattern
 * - Olympiad Practice
 */
(function (global) {
  "use strict";

  const PracticeLevels = Object.freeze({
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard"
  });

  const PracticePatterns = Object.freeze({
    STANDARD: "Standard",
    PREVIOUS_YEAR: "Previous Year Pattern",
    OLYMPIAD: "Olympiad Practice"
  });

  function createPracticeItem(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      prompt: p.prompt || "",
      level: p.level || PracticeLevels.EASY,
      pattern: p.pattern || PracticePatterns.STANDARD,
      conceptId: p.conceptId || null,
      topic: p.topic || null,
      answer: p.answer != null ? p.answer : null,
      hints: Array.isArray(p.hints) ? p.hints : []
    };
  }

  function createPracticeSet(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      questionId: p.questionId || null,
      conceptId: p.conceptId || null,
      easy: Array.isArray(p.easy) ? p.easy : [],
      medium: Array.isArray(p.medium) ? p.medium : [],
      hard: Array.isArray(p.hard) ? p.hard : [],
      previousYearPattern: Array.isArray(p.previousYearPattern)
        ? p.previousYearPattern
        : [],
      olympiadPractice: Array.isArray(p.olympiadPractice)
        ? p.olympiadPractice
        : []
    };
  }

  const PracticeGenerator = {
    Levels: PracticeLevels,
    Patterns: PracticePatterns,
    createItem: createPracticeItem,
    createSet: createPracticeSet,

    /** Architecture stub — generation arrives later */
    generate: async function () {
      return createPracticeSet({});
    }
  };

  global.PracticeGeneratorSchema = PracticeGenerator;
})(window);
