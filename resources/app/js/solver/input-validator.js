/**
 * Solver input validation (Phase 8B.3)
 *
 * Validates OCR / edited question text before Local Rule Engine.
 * Clear errors — never guess.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SolverInputValidator = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const Codes = Object.freeze({
    EMPTY_EXPRESSION: "Empty expression",
    INVALID_CHARACTERS: "Invalid characters",
    MULTIPLE_EXPRESSIONS: "Multiple expressions",
    UNSUPPORTED_SYMBOLS: "Unsupported symbols",
    DIVIDE_BY_ZERO: "Divide by zero",
    MALFORMED_FRACTION: "Malformed fraction",
    INVALID_OCR_TEXT: "Invalid OCR text",
    LOW_CONFIDENCE: "Low confidence"
  });

  const ALLOWED_WORDS =
    /\b(HCF|LCM|GCD|GCF|Prime|Even|Odd|Factors?|Multiples?|Simplify|Find|What|is|of|and|or|the|number|numbers|whether|first|lowest|terms|calculate|evaluate|check|if|when|solve|for|at|combine|missing)\b/gi;

  function stripMarker(text) {
    const g = typeof window !== "undefined" ? window : null;
    if (g && g.LocalRuleNormalize && g.LocalRuleNormalize.stripQuestionMarker) {
      return g.LocalRuleNormalize.stripQuestionMarker(text);
    }
    return String(text || "")
      .replace(/^\s*\d+\s*[.)]\s+/, "")
      .trim();
  }

  function prepare(raw) {
    let s = stripMarker(String(raw || ""));
    s = s.replace(/[×✕✖⨯]/g, "*").replace(/[÷]/g, "/");
    s = s.replace(/[−–—]/g, "-");
    // Only digit x digit → multiply; keep 2x as algebra
    s = s.replace(/(\d)\s*[xX]\s*(\d)/g, "$1*$2");
    return s.trim();
  }

  function isTypedMode(opts) {
    if (!opts) return false;
    // Do not use `opts.mode || validationMode`: SolverEngine uses mode
    // "offline"/"ocr"/"auto", which would hide a typed validation flag.
    if (opts.validationMode === "typed") return true;
    if (opts.source === "typed") return true;
    if (opts.mode === "typed") return true;
    if (opts.questionId === "typed-local") return true;
    if (opts.questionSource === "typed") return true;
    return false;
  }

  function isOwnedByWordedEngine(text) {
    const g = typeof window !== "undefined" ? window : globalThis;
    if (
      g.LocalRuleMensuration &&
      typeof g.LocalRuleMensuration.looksLikeMensuration === "function" &&
      g.LocalRuleMensuration.looksLikeMensuration(text)
    ) {
      return true;
    }
    if (
      g.LocalRuleStatistics &&
      typeof g.LocalRuleStatistics.looksLikeStatistics === "function" &&
      g.LocalRuleStatistics.looksLikeStatistics(text)
    ) {
      return true;
    }
    if (
      g.LocalRuleGeometry &&
      typeof g.LocalRuleGeometry.looksLikeGeometry === "function" &&
      g.LocalRuleGeometry.looksLikeGeometry(text)
    ) {
      return true;
    }
    if (
      g.LocalRuleProbability &&
      typeof g.LocalRuleProbability.looksLikeProbability === "function" &&
      g.LocalRuleProbability.looksLikeProbability(text)
    ) {
      return true;
    }
    return false;
  }

  function isIntroAlgebraAllowed(text, typedMode) {
    const g = typeof window !== "undefined" ? window : globalThis;
    if (g.LocalRuleAlgebra && g.LocalRuleAlgebra.isUnsupportedAlgebra) {
      const bad = g.LocalRuleAlgebra.isUnsupportedAlgebra(text);
      if (bad) return false;
    }
    if (typedMode || isOwnedByWordedEngine(text)) {
      return true;
    }
    // OCR path: single-letter variables only (intro algebra)
    const withoutWords = text.replace(ALLOWED_WORDS, " ");
    const letters = withoutWords.match(/[a-zA-Z]/g) || [];
    if (!letters.length) return true;
    // Reject multi-letter identifiers
    if (/[a-zA-Z]{2,}/.test(withoutWords.replace(ALLOWED_WORDS, " "))) {
      return false;
    }
    return true;
  }

  function fail(code, message) {
    return { ok: false, code: code, message: message || code };
  }

  function ok(normalized) {
    return { ok: true, normalized: normalized, code: null, message: null };
  }

  function hasDivideByZero(text) {
    const c = text.replace(/\s+/g, "");
    // n/0 or */0 or /0 at end; not 10, 0.5
    if (/\/0(?!\d|\.)/.test(c)) return true;
    if (/[+\-*/(]0\/0/.test(c)) return true;
    return false;
  }

  function hasMalformedFraction(text) {
    const c = text.replace(/\s+/g, "");
    if (!/\//.test(c)) return false;
    // trailing or leading slash: 1/ or /2 (when not part of a/b or ops)
    if (/\/$/.test(c) || /^\/\d/.test(c)) return true;
    if (/\/\/|\/\//.test(c)) return true;
    // incomplete token like +/2 or 3+/ 
    if (/[+\-*/]\/|\/[+\-*/]/.test(c)) return true;
    // digit/ without following digit (and not divide-by-zero already handled)
    if (/\d\/(?!\d)/.test(c) && !/\d\/0(?!\d)/.test(c)) return true;
    return false;
  }

  /**
   * @param {string} rawText
   * @param {object} [options]
   * @returns {{ ok: boolean, code: string|null, message: string|null, normalized?: string }}
   */
  function validate(rawText, options) {
    const opts = options || {};
    const typedMode = isTypedMode(opts);
    const original = String(rawText == null ? "" : rawText).trim();

    if (!original) {
      return fail(
        Codes.EMPTY_EXPRESSION,
        "Empty expression — nothing to solve."
      );
    }

    if (/^[^0-9a-zA-Z]+$/.test(original) || original.length > 500) {
      return fail(
        Codes.INVALID_OCR_TEXT,
        "Invalid OCR text — please edit the detected question."
      );
    }

    const text = prepare(original);
    if (!text) {
      return fail(
        Codes.EMPTY_EXPRESSION,
        "Empty expression — nothing to solve."
      );
    }

    if (/[√∫∑π∞≠≤≥≈^]|\\[a-zA-Z]+/.test(text)) {
      return fail(
        Codes.UNSUPPORTED_SYMBOLS,
        "Unsupported symbols detected (e.g. roots, integrals, powers)."
      );
    }

    // Intro algebra may use single-letter variables; reject advanced forms
    if (!isIntroAlgebraAllowed(text, typedMode)) {
      return fail(
        Codes.UNSUPPORTED_SYMBOLS,
        "Unsupported algebra type (quadratic, simultaneous, inequality, or multi-variable)."
      );
    }

    const withoutWords = text.replace(ALLOWED_WORDS, " ");
    // Allow single a-z variables; flag other letters only if multi-char words remain
    const scrubbedLetters = withoutWords.replace(/[a-zA-Z]/g, "");
    const scrubbed = withoutWords.replace(/(\d)\s*[xX]\s*(\d)/g, "$1*$2");
    if (/[^0-9+\-*/().,\s:?=a-zA-Z□_?]/.test(scrubbed)) {
      return fail(
        Codes.INVALID_CHARACTERS,
        "Invalid characters in the expression."
      );
    }
    // OCR path only: leftover multi-letter English is treated as OCR noise.
    // Typed path, and worded questions already owned by an existing topic
    // engine, must not be rejected here — that was converting a valid
    // mensuration solution into an error with confidence 0 / no answer.
    if (
      !typedMode &&
      !isOwnedByWordedEngine(text) &&
      /[a-zA-Z]{2,}/.test(withoutWords)
    ) {
      return fail(
        Codes.UNSUPPORTED_SYMBOLS,
        "Unsupported symbols or words in the expression."
      );
    }

    void scrubbedLetters;

    const lines = text
      .split(/\n+/)
      .map(function (l) {
        return l.trim();
      })
      .filter(Boolean);
    const mathLines = lines.filter(function (l) {
      return /[0-9]/.test(l) && /[+\-*/=]|HCF|LCM|GCD/i.test(l);
    });
    if (mathLines.length > 1 || (text.match(/=/g) || []).length > 1) {
      return fail(
        Codes.MULTIPLE_EXPRESSIONS,
        "Multiple expressions detected — solve one question at a time."
      );
    }

    if (hasDivideByZero(text)) {
      return fail(Codes.DIVIDE_BY_ZERO, "Divide by zero is not allowed.");
    }

    if (hasMalformedFraction(text)) {
      return fail(
        Codes.MALFORMED_FRACTION,
        "Malformed fraction — check numerators and denominators."
      );
    }

    if (opts.checkConfidence) {
      const conf =
        typeof opts.confidence === "number" ? opts.confidence : null;
      const threshold =
        typeof opts.threshold === "number" ? opts.threshold : 40;
      if (conf != null && conf < threshold && !opts.forceSolve) {
        return fail(
          Codes.LOW_CONFIDENCE,
          "Low OCR confidence. Please verify the detected question."
        );
      }
    }

    return ok(text);
  }

  return {
    Codes: Codes,
    validate: validate,
    prepare: prepare
  };
});
