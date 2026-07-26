/**
 * Curriculum Mapper (Phase 8B.6)
 *
 * Solver knows Formula IDs only.
 * Curriculum Mapper looks up the Formula Library and returns rich metadata.
 *
 * Formula ID → Formula Library → Board / Class / Subject / Chapter / Topic /
 * Difficulty / Related Formulas / Practice IDs
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.CurriculumMapper = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ErrorCodes = Object.freeze({
    BROKEN_FORMULA_ID: "Broken Formula ID",
    MISSING_CHAPTER: "Missing Chapter",
    UNKNOWN_SUBJECT: "Unknown Subject"
  });

  /** @type {Record<string, object>} */
  let byId = Object.create(null);
  let loaded = false;

  function fail(code, message, formulaId) {
    return {
      ok: false,
      formulaId: formulaId || null,
      error: {
        code: code,
        message: message || code
      },
      data: null
    };
  }

  function ok(data) {
    return {
      ok: true,
      formulaId: data && data.id,
      error: null,
      data: data
    };
  }

  function toRich(record) {
    const related =
      record.relatedFormulaIds ||
      record.relatedFormulas ||
      [];
    const practiceIds =
      record.practiceQuestionIds ||
      (Array.isArray(record.practiceQuestions)
        ? record.practiceQuestions.map(function (_q, i) {
            return (record.id || "formula") + "-PQ-" + String(i + 1).padStart(2, "0");
          })
        : []);

    return {
      id: record.id,
      formulaId: record.id,
      board: record.board || null,
      class: record.class || null,
      subject: record.subject || null,
      chapter: record.chapter || null,
      topic: record.topic || record.chapter || null,
      difficulty: record.difficulty || null,
      formulaName: record.formulaName || record.name || null,
      name: record.name || record.formulaName || null,
      formula: record.formula || null,
      latex: record.latex || null,
      variables: Array.isArray(record.variables) ? record.variables : [],
      description: record.description || null,
      example: record.example || null,
      relatedFormulas: related.slice(),
      relatedFormulaIds: related.slice(),
      practiceIds: practiceIds.slice(),
      practiceQuestionIds: practiceIds.slice(),
      keywords: Array.isArray(record.keywords) ? record.keywords : [],
      verification: record.verification || null,
      version: record.version != null ? record.version : null,
      // Hierarchy anchors from walk (for validation)
      _chapterId: record._chapterId || null,
      _subjectId: record._subjectId || null
    };
  }

  function walkLibrary(data) {
    const index = Object.create(null);
    if (!data || typeof data !== "object") return index;

    (data.boards || []).forEach(function (board) {
      (board.classes || []).forEach(function (cls) {
        (cls.subjects || []).forEach(function (subject) {
          (subject.chapters || []).forEach(function (chapter) {
            (chapter.formulas || []).forEach(function (f) {
              if (!f || !f.id) return;
              index[f.id] = Object.assign({}, f, {
                board: f.board || board.board || board.title || null,
                class: f.class || cls.title || null,
                subject: f.subject || subject.title || null,
                chapter: f.chapter || chapter.title || null,
                topic: f.topic || chapter.title || f.chapter || null,
                _chapterId: chapter.id || null,
                _chapterTitle: chapter.title || null,
                _subjectId: subject.id || null,
                _subjectTitle: subject.title || null
              });
            });
          });
        });
      });
    });

    // Also accept flat seed packs: { formulas: [...] }
    if (Array.isArray(data.formulas)) {
      data.formulas.forEach(function (f) {
        if (!f || !f.id) return;
        if (!index[f.id]) {
          index[f.id] = Object.assign({}, f, {
            _chapterId: null,
            _subjectId: null
          });
        }
      });
    }

    return index;
  }

  function validateRecord(raw, formulaId) {
    if (!raw) {
      return fail(
        ErrorCodes.BROKEN_FORMULA_ID,
        "Broken Formula ID — not found in Formula Library: " + formulaId,
        formulaId
      );
    }

    const subject = raw.subject || raw._subjectTitle;
    const subjectId = raw._subjectId;
    if (!subject && !subjectId) {
      return fail(
        ErrorCodes.UNKNOWN_SUBJECT,
        "Unknown Subject — formula has no subject in Formula Library: " +
          formulaId,
        formulaId
      );
    }

    const chapter = raw.chapter || raw._chapterTitle;
    const chapterId = raw._chapterId;
    // Flat seed without hierarchy: missing chapter is an error for curriculum mapping
    if (!chapter || !String(chapter).trim()) {
      return fail(
        ErrorCodes.MISSING_CHAPTER,
        "Missing Chapter — formula is not attached to a chapter: " + formulaId,
        formulaId
      );
    }

    return ok(toRich(raw));
  }

  const CurriculumMapper = {
    ErrorCodes: ErrorCodes,

    isLoaded: function () {
      return loaded;
    },

    /**
     * Load / replace index from Formula Library JSON.
     */
    loadFromData: function (libraryData) {
      byId = walkLibrary(libraryData || {});
      loaded = true;
      return this;
    },

    loadFromUrl: async function (url) {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to load Formula Library: " + res.status);
      }
      this.loadFromData(await res.json());
      return this;
    },

    /**
     * @param {string} formulaId
     * @returns {{ ok: boolean, formulaId: string|null, error: object|null, data: object|null }}
     */
    lookup: function (formulaId) {
      const id = String(formulaId || "").trim();
      if (!id) {
        return fail(
          ErrorCodes.BROKEN_FORMULA_ID,
          "Broken Formula ID — empty id",
          null
        );
      }
      if (!loaded) {
        return fail(
          ErrorCodes.BROKEN_FORMULA_ID,
          "Formula Library not loaded — cannot resolve " + id,
          id
        );
      }
      return validateRecord(byId[id], id);
    },

    /**
     * @param {string[]} formulaIds
     * @returns {{ ok: boolean, results: object[], errors: object[] }}
     */
    lookupMany: function (formulaIds) {
      const ids = Array.isArray(formulaIds) ? formulaIds : [];
      const results = [];
      const errors = [];
      ids.forEach(function (id) {
        const r = CurriculumMapper.lookup(id);
        if (r.ok) results.push(r.data);
        else errors.push(r.error);
      });
      return {
        ok: errors.length === 0,
        results: results,
        errors: errors
      };
    },

    /**
     * Hydrate solver formula ID refs into rich objects for UI.
     * Accepts formulaIds[] or formulaUsed[{formulaId}] .
     * @param {object} solution
     * @returns {object} solution with formulaUsed rich + curriculumErrors
     */
    hydrateSolution: function (solution) {
      const sol = solution ? Object.assign({}, solution) : {};
      const ids = [];

      if (Array.isArray(sol.formulaIds)) {
        sol.formulaIds.forEach(function (id) {
          if (id) ids.push(id);
        });
      }
      if (Array.isArray(sol.formulaUsed)) {
        sol.formulaUsed.forEach(function (f) {
          if (typeof f === "string") ids.push(f);
          else if (f && (f.formulaId || f.id)) ids.push(f.formulaId || f.id);
        });
      }

      // Unique preserve order
      const seen = Object.create(null);
      const unique = [];
      ids.forEach(function (id) {
        if (!seen[id]) {
          seen[id] = true;
          unique.push(id);
        }
      });

      const mapped = this.lookupMany(unique);
      sol.formulaIds = unique.slice();
      sol.formulaUsed = mapped.results.slice();
      sol.curriculumErrors = mapped.errors.slice();

      // Prefer curriculum metadata from first rich formula (solver must not invent it)
      if (mapped.results[0]) {
        const first = mapped.results[0];
        sol.board = first.board;
        sol.class = first.class;
        sol.subject = first.subject;
        sol.chapter = first.chapter;
        sol.topic = first.topic;
        sol.difficulty = first.difficulty;
        sol.relatedFormulas = first.relatedFormulaIds.slice();
      }

      return sol;
    },

    listIds: function () {
      return Object.keys(byId);
    }
  };

  return CurriculumMapper;
});
