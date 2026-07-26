/**
 * Local Rule Engine — offline Class 6 Arithmetic solver (Phase 8B.1).
 *
 * Question Object → Local Rule Engine → Solution Object
 *
 * Does NOT call cloud AI. Never guesses: unsupported → status Unsupported.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      require("./formula-catalog"),
      require("./normalize"),
      require("./handlers"),
      require("./math-utils")
    );
  } else {
    root.LocalRuleEngineProvider = factory(
      root.FormulaCatalog,
      root.LocalRuleNormalize,
      root.LocalRuleHandlers,
      root.LocalRuleMath
    );
  }
})(typeof window !== "undefined" ? window : globalThis, function (
  FormulaCatalog,
  Normalize,
  Handlers,
  MathUtils
) {
  "use strict";

  const PROVIDER_ID = "local-rule-engine";

  function getCurriculumMapper() {
    const g =
      typeof window !== "undefined"
        ? window
        : typeof globalThis !== "undefined"
          ? globalThis
          : null;
    return g && g.CurriculumMapper ? g.CurriculumMapper : null;
  }

  function syncCurriculumMapper(data) {
    const Mapper = getCurriculumMapper();
    if (Mapper && data) {
      Mapper.loadFromData(data);
    }
  }

  function ensureCatalogLoaded(options) {
    const opts = options || {};
    const hasAlgebra = FormulaCatalog.getById("CBSE-C6-AL-007");
    const Mapper = getCurriculumMapper();
    if (FormulaCatalog.isLoaded() && hasAlgebra && Mapper && Mapper.isLoaded()) {
      return Promise.resolve();
    }

    function afterMain(libraryData) {
      if (libraryData) syncCurriculumMapper(libraryData);
      // Seed pack is migration-only; merge only if IDs still missing
      if (FormulaCatalog.getById("CBSE-C6-AL-007")) {
        return Promise.resolve();
      }
      if (opts.algebraFormulaData) {
        FormulaCatalog.mergePack(opts.algebraFormulaData);
        if (Mapper) Mapper.loadFromData(opts.algebraFormulaData);
        return Promise.resolve();
      }
      if (typeof fetch === "function") {
        return FormulaCatalog.mergeFromUrl(
          "../data/formula-algebra-intro.json"
        ).catch(function () {
          return null;
        });
      }
      return Promise.resolve();
    }

    if (opts.formulaLibraryData) {
      FormulaCatalog.loadFromData(opts.formulaLibraryData);
      return afterMain(opts.formulaLibraryData);
    }
    if (opts.formulaLibraryUrl) {
      return FormulaCatalog.loadFromUrl(opts.formulaLibraryUrl).then(function () {
        // Catalog already loaded; re-fetch for Curriculum Mapper if needed
        if (typeof fetch === "function") {
          return fetch(opts.formulaLibraryUrl)
            .then(function (res) {
              return res.ok ? res.json() : null;
            })
            .then(function (data) {
              return afterMain(data);
            })
            .catch(function () {
              return afterMain(null);
            });
        }
        return afterMain(null);
      });
    }
    if (typeof fetch === "function") {
      return FormulaCatalog.loadFromUrl("../data/formula-library.json")
        .then(function () {
          return fetch("../data/formula-library.json")
            .then(function (res) {
              return res.ok ? res.json() : null;
            })
            .then(function (data) {
              return afterMain(data);
            })
            .catch(function () {
              return afterMain(null);
            });
        })
        .catch(function () {
          return null;
        });
    }
    return Promise.resolve();
  }

  function verifyResult(result) {
    if (!result || result.unsupported) {
      return { ok: false, status: "Needs Review" };
    }
    try {
      if (typeof result.verifyFn === "function") {
        const independent = result.verifyFn();
        const ok = MathUtils.nearlyEqual(
          independent,
          result.finalAnswer
        ) || String(independent) === String(result.finalAnswer);
        return {
          ok: ok,
          status: ok ? "Verified" : "Needs Review",
          independent: independent
        };
      }
      return {
        ok: !!result.verified,
        status: result.verified ? "Verified" : "Needs Review"
      };
    } catch (err) {
      return { ok: false, status: "Needs Review", error: String(err.message) };
    }
  }

  function buildUnsupported(question, reason) {
    const text = Normalize.questionText(question);
    return {
      id: "sol-lre-" + Date.now().toString(36),
      status: "unsupported",
      question: text,
      given: "",
      find: "",
      formulaIds: [],
      formulaUsed: [],
      steps: [],
      finalAnswer: null,
      verification: "Needs Review",
      verificationBlock: {
        status: "Needs Review",
        check: null,
        notes: [reason || "Unsupported question type"],
        confidence: 0
      },
      confidence: 0,
      commonMistakes: [],
      relatedFormulas: [],
      practiceQuestions: [],
      // Curriculum left null — mapper/UI must not invent syllabus facts
      board: null,
      class: null,
      subject: null,
      providerNote: reason
    };
  }

  function buildSolution(question, result, verification) {
    const text = Normalize.questionText(question);
    // Solver knows Formula IDs only — curriculum comes from Curriculum Mapper
    const formulaIds = FormulaCatalog.resolveIdsForOperation
      ? FormulaCatalog.resolveIdsForOperation(result.operationKey)
      : (FormulaCatalog.resolveForOperation(result.operationKey) || []).map(
          function (f) {
            return f.formulaId || f.id;
          }
        );
    const confidence = verification.ok ? 0.98 : 0.4;

    const raw = {
      id: "sol-lre-" + Date.now().toString(36),
      status: "complete",
      question: text,
      given: result.given || "",
      find: result.find || "",
      formulaIds: formulaIds.slice(),
      formulaUsed: formulaIds.map(function (id) {
        return { formulaId: id };
      }),
      steps: result.steps || [],
      finalAnswer: result.finalAnswer,
      verification: verification.status,
      verificationBlock: {
        status: verification.status,
        check: verification.independent != null
          ? "Independent recompute: " + verification.independent
          : "Rule-engine self-check",
        notes: verification.ok
          ? ["Answer verified by independent recalculation"]
          : ["Verification mismatch — flagged for review"],
        confidence: confidence
      },
      confidence: confidence,
      board: null,
      class: null,
      subject: null,
      chapter: null,
      topic: null,
      difficulty: null,
      commonMistakes: [],
      relatedFormulas: []
    };

    const g =
      typeof window !== "undefined"
        ? window
        : typeof globalThis !== "undefined"
          ? globalThis
          : null;
    if (g && g.CurriculumMapper && g.CurriculumMapper.isLoaded()) {
      return g.CurriculumMapper.hydrateSolution(raw);
    }
    return raw;
  }

  /**
   * Core solve used by provider and Node tests.
   * @param {object} question
   * @param {object} [options]
   * @returns {Promise<object>} raw solution fields (SolutionSchema.create applied by engine)
   */
  async function solveQuestion(question, options) {
    await ensureCatalogLoaded(options);

    if (options && options.signal && options.signal.aborted) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }

    const text = Normalize.questionText(question);
    if (!text) {
      return buildUnsupported(question, "Empty question text");
    }

    const intent = Handlers.classify(text);
    const result = Handlers.solveIntent(intent);

    if (result.unsupported) {
      return buildUnsupported(
        question,
        result.reason || intent.reason || "Unsupported"
      );
    }

    const verification = verifyResult(result);
    return buildSolution(question, result, verification);
  }

  const provider = {
    id: PROVIDER_ID,
    label: "Local Rule Engine",
    local: true,
    available: true,
    supportsStreaming: false,
    supportsCancellation: true,
    solve: solveQuestion,
    isReady: async function () {
      await ensureCatalogLoaded({});
      return true;
    },
    // Exposed for tests
    _solveQuestion: solveQuestion,
    _classify: function (text) {
      return Handlers.classify(text);
    }
  };

  return provider;
});
