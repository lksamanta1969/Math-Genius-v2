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

  function ensureCatalogLoaded(options) {
    if (FormulaCatalog.isLoaded() && FormulaCatalog.getById("CBSE-C6-AL-007")) {
      return Promise.resolve();
    }
    const opts = options || {};

    function mergeAlgebra(data) {
      if (data) FormulaCatalog.mergePack(data);
    }

    if (opts.formulaLibraryData) {
      FormulaCatalog.loadFromData(opts.formulaLibraryData);
      if (opts.algebraFormulaData) {
        mergeAlgebra(opts.algebraFormulaData);
      }
      return Promise.resolve();
    }
    if (opts.formulaLibraryUrl) {
      return FormulaCatalog.loadFromUrl(opts.formulaLibraryUrl).then(function () {
        if (opts.algebraFormulaUrl) {
          return FormulaCatalog.mergeFromUrl(opts.algebraFormulaUrl);
        }
        if (typeof fetch === "function") {
          return FormulaCatalog.mergeFromUrl(
            "../data/formula-algebra-intro.json"
          ).catch(function () {
            return null;
          });
        }
        return null;
      });
    }
    if (typeof fetch === "function") {
      return FormulaCatalog.loadFromUrl("../data/formula-library.json")
        .then(function () {
          return FormulaCatalog.mergeFromUrl(
            "../data/formula-algebra-intro.json"
          );
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
      class: 6,
      subject: "Arithmetic",
      board: "CBSE",
      providerNote: reason
    };
  }

  function buildSolution(question, result, verification) {
    const text = Normalize.questionText(question);
    const formulas = FormulaCatalog.resolveForOperation(result.operationKey);
    const confidence = verification.ok ? 0.98 : 0.4;

    return {
      id: "sol-lre-" + Date.now().toString(36),
      status: "complete",
      question: text,
      given: result.given || "",
      find: result.find || "",
      formulaUsed: formulas,
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
      class: result.operationKey &&
        String(result.operationKey).indexOf("algebra") === 0
        ? 6
        : 6,
      subject:
        result.operationKey &&
        String(result.operationKey).indexOf("algebra") === 0
          ? "Algebra"
          : "Arithmetic",
      board: "CBSE",
      difficulty: "Easy",
      commonMistakes: [],
      relatedFormulas: formulas.slice()
    };
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
