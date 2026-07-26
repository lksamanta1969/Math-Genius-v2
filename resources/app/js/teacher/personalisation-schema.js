/**
 * Personalisation architecture (ready, inactive)
 *
 * Student Profile · Learning Speed · Preferred Language
 * Preferred Explanation Style · Target Exam
 */
(function (global) {
  "use strict";

  const LearningSpeeds = Object.freeze({
    SLOW: "slow",
    NORMAL: "normal",
    FAST: "fast"
  });

  function createStudentProfile(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      displayName: p.displayName || null,
      board: p.board || null,
      class: p.class || null,
      learningSpeed: p.learningSpeed || LearningSpeeds.NORMAL,
      preferredLanguage: p.preferredLanguage || "en",
      preferredExplanationStyle:
        p.preferredExplanationStyle || "Standard",
      targetExam: p.targetExam || null,
      teacherMode: p.teacherMode || null
    };
  }

  const Personalisation = {
    Speeds: LearningSpeeds,
    createProfile: createStudentProfile,

    /** Architecture stub — local profile shell only */
    getDefaultProfile: function () {
      return createStudentProfile({});
    }
  };

  global.PersonalisationSchema = Personalisation;
})(window);
