/**
 * Topic handlers — Numbers + Algebra + Geometry + Mensuration + Statistics.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      require("./normalize"),
      require("./numbers"),
      require("./algebra"),
      require("./geometry"),
      require("./mensuration"),
      require("./statistics")
    );
  } else {
    root.LocalRuleHandlers = factory(
      root.LocalRuleNormalize,
      root.LocalRuleNumbers,
      root.LocalRuleAlgebra,
      root.LocalRuleGeometry,
      root.LocalRuleMensuration,
      root.LocalRuleStatistics
    );
  }
})(typeof window !== "undefined" ? window : globalThis, function (
  Normalize,
  Numbers,
  Algebra,
  Geometry,
  Mensuration,
  Statistics
) {
  "use strict";

  function classify(rawText) {
    const text = Normalize.normalize(rawText);
    const compact = text.replace(/\s+/g, " ");

    // Statistics / data handling (before mensuration — "range" is stats not geometry)
    if (Statistics && Statistics.isUnsupportedStatistics) {
      const stBad = Statistics.isUnsupportedStatistics(compact);
      if (stBad && Statistics.looksLikeStatistics(compact)) {
        return { type: "unsupported", reason: stBad };
      }
    }
    if (Statistics && Statistics.looksLikeStatistics(compact)) {
      return { type: "statistics", text: compact };
    }

    // Mensuration first (area/perimeter/circumference) — before geometry
    if (Mensuration && Mensuration.isUnsupportedMensuration) {
      const meBad = Mensuration.isUnsupportedMensuration(compact);
      if (meBad && Mensuration.looksLikeMensuration(compact)) {
        return { type: "unsupported", reason: meBad };
      }
    }
    if (Mensuration && Mensuration.looksLikeMensuration(compact)) {
      return { type: "mensuration", text: compact };
    }

    // Geometry unsupported gates (coordinate, congruence, transformations, circle theorems)
    if (Geometry && Geometry.isUnsupportedGeometry) {
      const geoBad = Geometry.isUnsupportedGeometry(compact);
      if (geoBad && Geometry.looksLikeGeometry(compact)) {
        return { type: "unsupported", reason: geoBad };
      }
    }

    // Intro geometry (angles, lines, triangle basics)
    if (Geometry && Geometry.looksLikeGeometry(compact)) {
      return { type: "geometry", text: compact };
    }

    // Number system (Phase 9) — before algebra so worded integer
    // questions (absolute value, compare, order) are not misrouted.
    if (Numbers && Numbers.isUnsupportedNumbers) {
      const numBad = Numbers.isUnsupportedNumbers(compact);
      if (numBad && Numbers.looksLikeNumbers(compact)) {
        return { type: "unsupported", reason: numBad };
      }
    }
    if (Numbers && Numbers.looksLikeNumbers(compact)) {
      const numIntent = Numbers.classify(compact);
      if (numIntent) return numIntent;
    }

    // Unsupported advanced algebra → explicit unsupported
    if (Algebra && Algebra.isUnsupportedAlgebra) {
      const bad = Algebra.isUnsupportedAlgebra(compact);
      if (
        bad &&
        (Algebra.looksLikeIntroAlgebra(compact) ||
          /[<>≤≥≠\^²]/.test(compact) ||
          (/=/.test(compact) && /[a-zA-Z]/.test(compact)))
      ) {
        if (/[<>≤≥≠\^²]/.test(compact) || /\n.*=/.test(compact)) {
          return { type: "unsupported", reason: bad };
        }
      }
    }

    // Intro algebra (equations / like terms)
    if (Algebra && Algebra.looksLikeIntroAlgebra(compact)) {
      return { type: "algebra", text: compact };
    }

    return {
      type: "unsupported",
      reason: "Question type not supported by Local Rule Engine (Class 6 Arithmetic Phase 1)"
    };
  }

  function solveIntent(intent) {
    if (!intent || intent.type === "unsupported") {
      return {
        unsupported: true,
        reason: (intent && intent.reason) || "Unsupported"
      };
    }

    if (intent.type === "statistics" && Statistics && Statistics.trySolve) {
      const st = Statistics.trySolve(intent.text || "");
      if (st && st.unsupported) {
        return {
          unsupported: true,
          reason: st.reason || "Unsupported statistics"
        };
      }
      if (st) return st;
      return {
        unsupported: true,
        reason: "Unsupported statistics question type"
      };
    }

    if (intent.type === "mensuration" && Mensuration && Mensuration.trySolve) {
      const me = Mensuration.trySolve(intent.text || "");
      if (me && me.unsupported) {
        return {
          unsupported: true,
          reason: me.reason || "Unsupported mensuration"
        };
      }
      if (me) return me;
      return {
        unsupported: true,
        reason: "Unsupported mensuration question type"
      };
    }

    if (intent.type === "geometry" && Geometry && Geometry.trySolve) {
      const geo = Geometry.trySolve(intent.text || "");
      if (geo && geo.unsupported) {
        return {
          unsupported: true,
          reason: geo.reason || "Unsupported geometry"
        };
      }
      if (geo) return geo;
      return {
        unsupported: true,
        reason: "Unsupported geometry question type"
      };
    }

    if (intent.type === "algebra" && Algebra && Algebra.trySolve) {
      const alg = Algebra.trySolve(intent.text || "");
      if (alg && alg.unsupported) {
        return {
          unsupported: true,
          reason: alg.reason || "Unsupported algebra"
        };
      }
      if (alg) return alg;
      return {
        unsupported: true,
        reason: "Unsupported algebra question type"
      };
    }

    // Fallback: any leftover lettered expression
    if (Algebra && Algebra.trySolve && intent.text) {
      const alg2 = Algebra.trySolve(intent.text);
      if (alg2 && !alg2.unsupported) return alg2;
    }

    // Number system (Phase 9)
    if (Numbers && Numbers.isNumberIntent && Numbers.isNumberIntent(intent.type)) {
      return Numbers.solveIntent(intent);
    }

    return {
      unsupported: true,
      reason: "Unsupported operation: " + intent.type
    };
  }

  return {
    classify: classify,
    solveIntent: solveIntent
  };
});
