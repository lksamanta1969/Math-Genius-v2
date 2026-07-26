/**
 * Normalize question text for Local Rule Engine parsing.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LocalRuleNormalize = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function stripQuestionMarker(text) {
    return String(text || "")
      .replace(/^\s*(?:question|ques\.?|q)\s*[0-9]+\b[:.)\-]?\s*/i, "")
      .replace(
        /^\s*(?:ex(?:ercise)?|ex\.?)\s*[0-9]+(?:\.[0-9]+)?\b[:.)\-]?\s*/i,
        ""
      )
      // Numbered markers: "1. " / "2) " — never treat "100 - 37" as a marker
      .replace(/^\s*\d+\s*[.)]\s+/, "")
      .replace(/^\s*\(\d+\)\s+/, "")
      .replace(/^\s*\([a-z]\)\s+/i, "")
      .replace(/^\s*[a-z]\s*[.)]\s+/i, "")
      .replace(/^\s*\([ivxlcdm]+\)\s+/i, "")
      .replace(/^\s*[ivxlcdm]+\s*[.)]\s+/i, "")
      .trim();
  }

  function questionText(question) {
    if (!question) return "";

    function eqToString(eq) {
      if (typeof eq === "string") return eq.trim();
      if (eq && eq.text) return String(eq.text).trim();
      if (eq && eq.latex) return String(eq.latex).trim();
      return "";
    }

    const candidates = [];
    const seen = Object.create(null);

    function push(s) {
      const t = stripQuestionMarker(String(s || "").trim());
      if (!t || seen[t]) return;
      seen[t] = true;
      candidates.push(t);
    }

    push(question.recognizedText);
    push(question.text);
    if (Array.isArray(question.equations)) {
      question.equations.forEach(function (eq) {
        push(eqToString(eq));
      });
    }

    if (!candidates.length) return "";

    candidates.sort(function (a, b) {
      return a.length - b.length;
    });
    return candidates[0];
  }

  function normalize(raw) {
    let s = String(raw || "");
    s = s.replace(/\u00d7/g, "×").replace(/\u00f7/g, "÷");
    // multiplication / division glyphs → ascii
    s = s.replace(/[×✕✖⨯]/g, "*");
    s = s.replace(/[÷]/g, "/");
    // x between numbers → multiply (not algebra variable)
    s = s.replace(/(\d)\s*[xX]\s*(\d)/g, "$1*$2");
    // unicode minus
    s = s.replace(/[−–—]/g, "-");
    // strip equals trailing "? =" etc for expression part
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }

  /**
   * Detect advanced algebra that intro engine must refuse.
   * Intro algebra (one-variable linear) is handled by LocalRuleAlgebra.
   */
  function looksLikeUnsupportedAlgebra(text) {
    if (
      typeof window !== "undefined" &&
      window.LocalRuleAlgebra &&
      window.LocalRuleAlgebra.isUnsupportedAlgebra
    ) {
      return !!window.LocalRuleAlgebra.isUnsupportedAlgebra(text);
    }
    const t = String(text || "");
    return /[<>≤≥≠\^²]/.test(t);
  }

  /** @deprecated use looksLikeUnsupportedAlgebra */
  function looksLikeAlgebra(text) {
    return looksLikeUnsupportedAlgebra(text);
  }

  return {
    questionText: questionText,
    normalize: normalize,
    looksLikeAlgebra: looksLikeAlgebra,
    looksLikeUnsupportedAlgebra: looksLikeUnsupportedAlgebra,
    stripQuestionMarker: stripQuestionMarker
  };
});
