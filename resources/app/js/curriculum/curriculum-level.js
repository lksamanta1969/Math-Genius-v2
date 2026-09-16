/**
 * Curriculum level vs solver capability (shared helper).
 *
 * Capability (can the local engine solve it?) is independent of
 * classification (which Class VI–XII topic it belongs to) and of
 * the student's current class (used only for the higher-level notice).
 *
 * Conservative: never invent Class IX vs Class X when uncertain.
 * Does not solve problems. Does not change topic engines.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CurriculumLevel = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ROMAN = Object.freeze({
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII"
  });

  const ROMAN_TO_N = Object.freeze({
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12
  });

  /** Operation keys the existing engines already emit → class from Formula Library taxonomy. */
  const OPERATION_CLASS = Object.freeze({
    algebra_combine_like_terms: 6,
    algebra_linear_equation: 6,
    algebra_evaluate: 6,
    algebra_missing_number: 6,
    mensuration_square_area: 6,
    mensuration_square_perimeter: 6,
    mensuration_rectangle_area: 6,
    mensuration_rectangle_perimeter: 6,
    mensuration_triangle_area: 6,
    mensuration_triangle_perimeter: 6,
    mensuration_circle_area: 7,
    mensuration_circle_circumference: 7
  });

  function parseClassNumber(classValue) {
    if (classValue == null || classValue === "") return null;
    if (typeof classValue === "number" && ROMAN[classValue]) {
      return classValue;
    }
    const raw = String(classValue).trim();
    if (!raw) return null;
    const digit = raw.match(/\b(1[0-2]|[6-9])\b/);
    if (digit) {
      const n = Number(digit[1]);
      return ROMAN[n] ? n : null;
    }
    const key = raw.replace(/^Class\s+/i, "").trim().toUpperCase();
    return ROMAN_TO_N[key] || null;
  }

  function romanClass(level) {
    return ROMAN[level] || null;
  }

  function unknown() {
    return {
      classLevel: null,
      classMin: null,
      classMax: null,
      confidence: "unknown",
      topicHint: null
    };
  }

  function certain(level, topicHint) {
    const n = parseClassNumber(level);
    if (!n) return unknown();
    return {
      classLevel: n,
      classMin: n,
      classMax: n,
      confidence: "certain",
      topicHint: topicHint || null
    };
  }

  function approximate(minLevel, maxLevel, topicHint) {
    const min = parseClassNumber(minLevel);
    const max = parseClassNumber(maxLevel == null ? minLevel : maxLevel);
    if (!min && !max) return unknown();
    const a = min || max;
    const b = max || min;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const single = lo === hi;
    return {
      classLevel: single ? lo : null,
      classMin: lo,
      classMax: hi,
      confidence: "approximate",
      topicHint: topicHint || null
    };
  }

  function isFailedSolution(solution) {
    if (!solution) return true;
    if (solution.unsupported) return true;
    const st = String(solution.status || "").toLowerCase();
    if (st === "error" || st === "unsupported") return true;
    if (solution.error && solution.error.code) return true;
    if (solution.finalAnswer == null && !solution.steps) return true;
    return false;
  }

  function classFromFormulaId(id) {
    const m = String(id || "").match(/CBSE-C(\d{1,2})-/i);
    if (!m) return null;
    return parseClassNumber(m[1]);
  }

  function collectSolutionClasses(solution) {
    const found = [];
    if (!solution || isFailedSolution(solution)) return found;

    const fromClass = parseClassNumber(solution.class);
    if (fromClass) found.push(fromClass);

    const op = solution.operationKey;
    if (op && OPERATION_CLASS[op] != null) {
      found.push(OPERATION_CLASS[op]);
    }

    const ids = []
      .concat(Array.isArray(solution.formulaIds) ? solution.formulaIds : [])
      .concat(
        Array.isArray(solution.formulaUsed)
          ? solution.formulaUsed.map(function (f) {
              if (typeof f === "string") return f;
              return f && (f.formulaId || f.id);
            })
          : []
      );
    ids.forEach(function (id) {
      const n = classFromFormulaId(id);
      if (n) found.push(n);
    });

    (Array.isArray(solution.formulaUsed) ? solution.formulaUsed : []).forEach(
      function (f) {
        if (!f || typeof f === "string") return;
        const n = parseClassNumber(f.class);
        if (n) found.push(n);
      }
    );

    return found;
  }

  function fromCollected(found, topicHint) {
    if (!found.length) return null;
    const uniq = [];
    found.forEach(function (n) {
      if (uniq.indexOf(n) === -1) uniq.push(n);
    });
    uniq.sort(function (a, b) {
      return a - b;
    });
    if (uniq.length === 1) {
      return certain(uniq[0], topicHint);
    }
    return approximate(uniq[0], uniq[uniq.length - 1], topicHint);
  }

  function looksLikeIdentity(t) {
    if (
      /\(\s*[a-zA-Z]\s*[+\-]\s*[a-zA-Z]\s*\)\s*(?:\^2|²)/.test(t) ||
      /\b(a\s*\+\s*b)\s*(?:\^2|²)/.test(t)
    ) {
      return true;
    }
    if (
      /\b(identity|identities|difference\s+of\s+squares|square\s+of\s+a\s+(sum|difference))\b/.test(
        t
      )
    ) {
      return true;
    }
    return false;
  }

  function looksLikeQuadratic(t) {
    if (looksLikeIdentity(t)) return false;
    if (/\bquadratic\b/.test(t) || /\bpolynomials?\b/.test(t)) return true;
    if (/[a-zA-Z]\s*(?:\^2|²)/.test(t)) return true;
    return false;
  }

  function looksLikeApGp(t) {
    if (
      /\b(arithmetic|geometric)\s+progressions?\b/.test(t) ||
      /\bsequences?\s+(and|&)\s+series\b/.test(t) ||
      /\b(nth|n-th)\s+term\b/.test(t) ||
      /\bcommon\s+(difference|ratio)\b/.test(t)
    ) {
      return true;
    }
    if (/\b(a\.p\.|g\.p\.|aps?|gps?)\b/.test(t)) return true;
    return false;
  }

  function looksLikeCalculus(t) {
    return /\b(integral|integrals|differentiate|derivative|differential\s+equation|limits?\s+and\s+derivatives)\b/.test(
      t
    );
  }

  function looksLikeCircleMensuration(t) {
    if (/\bcircle\b/.test(t)) return true;
    if (/\bcircumference\b/.test(t)) return true;
    if (
      (/\bradius\b/.test(t) || /\bdiameter\b/.test(t) || /\b\u03c0\b/.test(t) || /\bpi\b/.test(t)) &&
      /\b(area|perimeter|circumference)\b/.test(t)
    ) {
      return true;
    }
    return false;
  }

  function estimateFromText(raw) {
    const original = String(raw || "").trim();
    if (!original) return unknown();
    if (/^[^0-9a-zA-Z]+$/.test(original) || original.length > 500) {
      return unknown();
    }

    const t = original.toLowerCase().replace(/[−–—]/g, "-");

    if (looksLikeCalculus(t)) {
      if (/\b(integral|integrals|differential\s+equation)\b/.test(t)) {
        return certain(12, "Calculus");
      }
      if (/\b(derivative|differentiate|limits?\s+and\s+derivatives)\b/.test(t)) {
        return certain(11, "Limits & Derivatives");
      }
      return unknown();
    }

    if (looksLikeApGp(t)) {
      return certain(11, "Sequences & Series");
    }

    if (
      /\b(remainder\s+theorem|factor\s+theorem|two\s+variables?|simultaneous)\b/.test(
        t
      )
    ) {
      return certain(9, "Algebra");
    }

    if (looksLikeIdentity(original) || looksLikeIdentity(t)) {
      return certain(8, "Algebra");
    }

    if (looksLikeQuadratic(original) || looksLikeQuadratic(t)) {
      return approximate(9, 10, "Algebra");
    }

    if (
      /\b(exponents?|powers?|distributive|expand|degree\s+of)\b/.test(t) ||
      /\bexpanding\s+brackets?\b/.test(t)
    ) {
      return certain(7, "Algebra");
    }

    if (looksLikeCircleMensuration(t)) {
      return certain(7, "Mensuration");
    }

    if (
      /\b(mean|median|mode)\b/.test(t) &&
      /\b(data|observations?|scores?|numbers?|values?|average)\b/.test(t)
    ) {
      return certain(7, "Data Handling & Statistics");
    }

    if (
      /\b(probability|fair\s+die|fair\s+dice|even\s+face)\b/.test(t) &&
      /\b(die|dice|coin|bag|spinner)\b/.test(t)
    ) {
      return certain(7, "Probability");
    }

    return unknown();
  }

  /**
   * @param {string} text
   * @param {{ solution?: object }} [options]
   * @returns {{ classLevel: number|null, classMin: number|null, classMax: number|null, confidence: string, topicHint: string|null }}
   */
  function estimateProblemClass(text, options) {
    const opts = options || {};
    const fromSol = fromCollected(collectSolutionClasses(opts.solution));
    if (fromSol && fromSol.confidence !== "unknown") {
      return fromSol;
    }
    return estimateFromText(text || (opts.solution && opts.solution.question) || "");
  }

  /**
   * @param {object} estimated
   * @param {number|string} currentClass
   * @returns {"below"|"same"|"higher"|"unknown"}
   */
  function compareToCurrentClass(estimated, currentClass) {
    const cur = parseClassNumber(currentClass);
    if (!estimated || estimated.confidence === "unknown" || !cur) {
      return "unknown";
    }
    const min =
      estimated.classMin != null ? estimated.classMin : estimated.classLevel;
    const max =
      estimated.classMax != null ? estimated.classMax : estimated.classLevel;
    if (min == null || max == null) return "unknown";
    if (min > cur) return "higher";
    if (max < cur) return "below";
    if (min === max && min === cur) return "same";
    return "unknown";
  }

  function classPhrase(estimated) {
    if (!estimated || estimated.confidence === "unknown") return null;
    const min =
      estimated.classMin != null ? estimated.classMin : estimated.classLevel;
    const max =
      estimated.classMax != null ? estimated.classMax : estimated.classLevel;
    if (min == null || max == null) return null;
    if (min === max) {
      const r = romanClass(min);
      return r ? "Class " + r : null;
    }
    const a = romanClass(min);
    const b = romanClass(max);
    if (!a || !b) return null;
    return "Class " + a + "–" + b;
  }

  /**
   * Notice only when the problem is above the current class and classification
   * is reliable enough. Never used as a substitute for the answer.
   */
  function noticeText(estimated, currentClass) {
    if (compareToCurrentClass(estimated, currentClass) !== "higher") {
      return "";
    }
    const phrase = classPhrase(estimated);
    if (!phrase) return "";
    if (estimated.confidence === "certain") {
      return "Higher-level problem — " + phrase + ".";
    }
    return "Higher-level problem — approximately " + phrase + ".";
  }

  function noticeHtml(estimated, currentClass) {
    const msg = noticeText(estimated, currentClass);
    if (!msg) return "";
    return (
      '<p class="curriculum-level-notice">' +
      String(msg)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;") +
      "</p>"
    );
  }

  return {
    ROMAN: ROMAN,
    parseClassNumber: parseClassNumber,
    romanClass: romanClass,
    estimateProblemClass: estimateProblemClass,
    compareToCurrentClass: compareToCurrentClass,
    noticeText: noticeText,
    noticeHtml: noticeHtml
  };
});
