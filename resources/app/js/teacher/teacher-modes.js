/**
 * Teacher Modes (architecture)
 * Tutor · Exam · Revision · Challenge
 */
(function (global) {
  "use strict";

  const TeacherModes = Object.freeze({
    TUTOR: "Tutor Mode",
    EXAM: "Exam Mode",
    REVISION: "Revision Mode",
    CHALLENGE: "Challenge Mode"
  });

  function createModeContext(mode, partial) {
    const p = partial || {};
    return {
      mode: mode || TeacherModes.TUTOR,
      emphasis: p.emphasis || null,
      timed: mode === TeacherModes.EXAM || mode === TeacherModes.CHALLENGE,
      showHints: mode === TeacherModes.TUTOR || mode === TeacherModes.REVISION,
      allowSkipMastered: mode !== TeacherModes.EXAM
    };
  }

  global.TeacherModes = {
    Modes: TeacherModes,
    createContext: createModeContext,
    list: function () {
      return Object.keys(TeacherModes).map(function (k) {
        return TeacherModes[k];
      });
    }
  };
})(window);
