/**
 * OCR → Solver bridge (Phase 8B.3)
 *
 * Validation → (optional edit) → Local Rule Engine → Solution
 * Low OCR confidence does NOT auto-solve unless forceSolve.
 * Tracks solveDurationMs on each solution.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.OcrSolveBridge = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ErrorCodes = Object.freeze({
    UNSUPPORTED: "Unsupported",
    UNREADABLE_OCR: "Unreadable OCR",
    LOW_CONFIDENCE: "Low confidence",
    INVALID_EXPRESSION: "Invalid expression",
    EMPTY_QUESTION: "Empty question",
    EMPTY_EXPRESSION: "Empty expression",
    INVALID_CHARACTERS: "Invalid characters",
    MULTIPLE_EXPRESSIONS: "Multiple expressions",
    UNSUPPORTED_SYMBOLS: "Unsupported symbols",
    DIVIDE_BY_ZERO: "Divide by zero",
    MALFORMED_FRACTION: "Malformed fraction",
    INVALID_OCR_TEXT: "Invalid OCR text"
  });

  const SolveJobStatus = Object.freeze({
    PENDING: "pending",
    SOLVING: "solving",
    DONE: "done",
    ERROR: "error",
    NEEDS_VERIFY: "needs-verify"
  });

  function getGlobals() {
    return typeof window !== "undefined" ? window : globalThis;
  }

  function lowConfidenceThreshold(config) {
    const limits = (config && config.limits) || {};
    return Number(
      limits.lowConfidenceThreshold != null
        ? limits.lowConfidenceThreshold
        : 40
    );
  }

  function questionText(q) {
    if (!q) return "";
    const g = getGlobals();
    const raw = String(q.recognizedText || q.text || "").trim();
    if (g.LocalRuleNormalize && g.LocalRuleNormalize.questionText) {
      return g.LocalRuleNormalize.questionText(q);
    }
    return raw;
  }

  function createErrorSolution(question, code, message, extras) {
    const g = getGlobals();
    const x = extras || {};
    const text = questionText(question);
    const payload = {
      id:
        "sol-err-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 6),
      questionId: question && question.id,
      provider: "local-rule-engine",
      status:
        code === ErrorCodes.UNSUPPORTED
          ? (g.SolutionSchema && g.SolutionSchema.Status.UNSUPPORTED) ||
            "unsupported"
          : (g.SolutionSchema && g.SolutionSchema.Status.ERROR) || "error",
      question: text,
      given: "",
      find: "",
      formulaUsed: [],
      steps: [],
      finalAnswer: null,
      verification:
        (g.SolutionSchema && g.SolutionSchema.Verification.NEEDS_REVIEW) ||
        "Needs Review",
      verificationBlock: {
        status: "Needs Review",
        check: null,
        notes: [message || code],
        confidence: 0
      },
      confidence: 0,
      error: { code: code, message: message || code },
      solveDurationMs: x.solveDurationMs != null ? x.solveDurationMs : 0,
      class: 6,
      subject: "Arithmetic",
      board: "CBSE"
    };
    Object.keys(x).forEach(function (k) {
      payload[k] = x[k];
    });
    if (g.SolutionSchema && g.SolutionSchema.create) {
      return g.SolutionSchema.create(payload);
    }
    return payload;
  }

  function runValidation(question, opts) {
    const g = getGlobals();
    const text = questionText(question);
    const config = opts.config || null;
    const threshold = lowConfidenceThreshold(config);
    const confidence =
      typeof question.confidence === "number" ? question.confidence : 0;

    if (!g.SolverInputValidator || !g.SolverInputValidator.validate) {
      if (!text) {
        return {
          ok: false,
          code: ErrorCodes.EMPTY_EXPRESSION,
          message: "Empty expression — nothing to solve."
        };
      }
      return { ok: true, normalized: text };
    }

    return g.SolverInputValidator.validate(text, {
      checkConfidence: opts.checkConfidence !== false,
      confidence: confidence,
      threshold: threshold,
      forceSolve: !!opts.forceSolve
    });
  }

  /**
   * Whether a question may be auto-solved after OCR.
   */
  function canAutoSolve(question, config) {
    const confidence =
      typeof question.confidence === "number" ? question.confidence : 0;
    const threshold = lowConfidenceThreshold(config);
    if (confidence > 0 && confidence < threshold) return false;
    const v = runValidation(question, {
      config: config,
      checkConfidence: false,
      forceSolve: true
    });
    return v.ok === true;
  }

  function mapSolverResult(question, solution) {
    if (!solution) {
      return createErrorSolution(
        question,
        ErrorCodes.UNSUPPORTED,
        "No solution returned."
      );
    }

    if (solution.status === "unsupported" || solution.status === "UNSUPPORTED") {
      const msg =
        (solution.error && solution.error.message) ||
        solution.providerNote ||
        ErrorCodes.UNSUPPORTED;
      solution.error = solution.error || {
        code: ErrorCodes.UNSUPPORTED,
        message: msg
      };
      return solution;
    }

    const notes =
      (solution.verificationBlock && solution.verificationBlock.notes) || [];
    const joined = notes.join(" ").toLowerCase();
    if (
      /invalid expression|division by zero|mismatched parentheses|unsupported token/.test(
        joined
      )
    ) {
      let code = ErrorCodes.INVALID_EXPRESSION;
      if (/division by zero|divide by zero/.test(joined)) {
        code = ErrorCodes.DIVIDE_BY_ZERO;
      }
      solution.error = {
        code: code,
        message: notes[0] || code
      };
      solution.status = "error";
    }

    return solution;
  }

  async function solveOne(question, options) {
    const opts = options || {};
    const g = getGlobals();
    const started = Date.now();

    const validation = runValidation(question, opts);
    if (!validation.ok) {
      return createErrorSolution(
        question,
        validation.code || ErrorCodes.INVALID_EXPRESSION,
        validation.message,
        { solveDurationMs: Date.now() - started }
      );
    }

    if (
      question.status === "unreadable" &&
      !(opts.forceSolve && questionText(question))
    ) {
      return createErrorSolution(
        question,
        ErrorCodes.UNREADABLE_OCR,
        "OCR text is unreadable.",
        { solveDurationMs: Date.now() - started }
      );
    }

    if (!g.SolverEngine || typeof g.SolverEngine.solve !== "function") {
      return createErrorSolution(
        question,
        ErrorCodes.UNSUPPORTED,
        "SolverEngine unavailable.",
        { solveDurationMs: Date.now() - started }
      );
    }

    try {
      // Prefer edited / validated text on the question object
      const qForSolve = Object.assign({}, question, {
        text: validation.normalized || questionText(question),
        recognizedText: validation.normalized || questionText(question)
      });

      const raw = await g.SolverEngine.solve(qForSolve, {
        mode: "offline",
        provider: "local-rule-engine",
        signal: opts.signal,
        explanationMode: opts.explanationMode || "Standard",
        language: opts.language || "en"
      });
      const mapped = mapSolverResult(question, raw);
      mapped.solveDurationMs = Date.now() - started;
      return mapped;
    } catch (err) {
      const msg = String((err && err.message) || err || "");
      if (/abort/i.test(msg)) throw err;
      let code = ErrorCodes.UNSUPPORTED;
      if (/division by zero|divide by zero/i.test(msg)) {
        code = ErrorCodes.DIVIDE_BY_ZERO;
      } else if (/invalid|expression|token|parenthes/i.test(msg)) {
        code = ErrorCodes.INVALID_EXPRESSION;
      }
      return createErrorSolution(question, code, msg, {
        solveDurationMs: Date.now() - started
      });
    }
  }

  function yieldToUi() {
    return new Promise(function (resolve) {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(function () {
          setTimeout(resolve, 0);
        });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  /**
   * Auto-solve eligible questions only (skips low-confidence).
   */
  function solveAll(questions, options) {
    const opts = options || {};
    const list = Array.isArray(questions) ? questions.slice() : [];
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const solutions = Object.create(null);
    let cancelled = false;

    const promise = (async function () {
      for (let i = 0; i < list.length; i += 1) {
        if (cancelled || (controller && controller.signal.aborted)) break;
        const q = list[i];

        if (!opts.forceSolve && !canAutoSolve(q, opts.config)) {
          const low = createErrorSolution(
            q,
            ErrorCodes.LOW_CONFIDENCE,
            "Low OCR confidence. Please verify the detected question."
          );
          solutions[q.id] = low;
          if (typeof opts.onQuestionSkipped === "function") {
            opts.onQuestionSkipped(q, low, i, list.length);
          }
          if (typeof opts.onQuestionDone === "function") {
            opts.onQuestionDone(q, low, i, list.length, {
              skipped: true,
              reason: "low-confidence"
            });
          }
          await yieldToUi();
          continue;
        }

        if (typeof opts.onQuestionStart === "function") {
          opts.onQuestionStart(q, i, list.length);
        }
        if (typeof opts.onProgress === "function") {
          opts.onProgress({
            index: i,
            total: list.length,
            questionId: q && q.id
          });
        }

        const sol = await solveOne(q, {
          config: opts.config,
          signal: controller ? controller.signal : opts.signal,
          explanationMode: opts.explanationMode,
          language: opts.language,
          forceSolve: !!opts.forceSolve,
          checkConfidence: !opts.forceSolve
        });
        solutions[q.id] = sol;

        if (typeof opts.onQuestionDone === "function") {
          opts.onQuestionDone(q, sol, i, list.length);
        }
        await yieldToUi();
      }
      return solutions;
    })();

    return {
      promise: promise,
      cancel: function () {
        cancelled = true;
        if (controller) controller.abort();
      },
      solutions: solutions
    };
  }

  return {
    ErrorCodes: ErrorCodes,
    SolveJobStatus: SolveJobStatus,
    createErrorSolution: createErrorSolution,
    canAutoSolve: canAutoSolve,
    validate: runValidation,
    solveOne: solveOne,
    solveAll: solveAll,
    lowConfidenceThreshold: lowConfidenceThreshold
  };
});
