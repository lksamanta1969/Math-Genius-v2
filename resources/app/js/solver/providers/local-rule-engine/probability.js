/**
 * Classical Probability Rule Engine (Phase 8F / M1)
 *
 * Supported: P(E) = favorable / total equally-likely outcomes
 * (coin, single die, bag draw, spinner / count-based).
 * Complement: P(not E) = 1 − P(E) when event counts are known.
 *
 * Rejects: conditional probability, permutations/combinations,
 * two-dice distributions, deck/card games, Class 9+ probability.
 *
 * Formula text from Formula Library via FormulaCatalog IDs only.
 */
(function (root, factory) {
  "use strict";
  const Catalog =
    typeof module === "object" && module.exports
      ? require("./formula-catalog")
      : root.FormulaCatalog;
  const MathU =
    typeof module === "object" && module.exports
      ? require("./math-utils")
      : root.LocalRuleMath;
  const api = factory(Catalog, MathU);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.LocalRuleProbability = api;
})(typeof window !== "undefined" ? window : globalThis, function (
  FormulaCatalog,
  MathUtils
) {
  "use strict";

  const PROBABILITY_INTENT_TYPES = Object.freeze([
    "probability_single_event",
    "probability_complement"
  ]);

  const IDS = Object.freeze({
    classical: "CBSE-C7-PR-001",
    complement: "CBSE-C7-PR-002"
  });

  const COLOR_WORDS =
    "red|blue|green|yellow|white|black|orange|purple|pink|brown|marble|ball|balls|marbles";

  const WORD_TO_FACE = Object.freeze({
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6
  });

  function step(n, title, description, extra) {
    const e = extra || {};
    return {
      stepNumber: n,
      title: title,
      description: description,
      latex: e.latex != null ? e.latex : "",
      image: null,
      hint: e.hint != null ? e.hint : null
    };
  }

  function result(opts) {
    return {
      operationKey: opts.operationKey,
      given: opts.given || "",
      find: opts.find || "",
      steps: opts.steps || [],
      finalAnswer: opts.finalAnswer,
      verifyFn:
        opts.verifyFn ||
        function () {
          return opts.finalAnswer;
        },
      verified: opts.verified !== false
    };
  }

  function unsupported(reason) {
    return {
      unsupported: true,
      reason: reason || "Unsupported probability topic"
    };
  }

  function libraryFormula(id) {
    if (FormulaCatalog && FormulaCatalog.getById) {
      const e = FormulaCatalog.getById(id);
      if (e && e.formula) return e.formula;
    }
    return null;
  }

  function formulaStep(n, id) {
    const f = libraryFormula(id);
    return step(
      n,
      "Formula",
      f ? f + "  [" + id + "]" : "Apply Formula Library entry " + id
    );
  }

  function formatProbFraction(favorable, total) {
    const simp = MathUtils.simplifyFraction(favorable, total);
    return MathUtils.fractionToString(simp);
  }

  function isUnsupportedProbability(text) {
    const t = String(text || "").toLowerCase();
    if (
      /\bgiven\s+that\b/.test(t) ||
      /\bconditional\b/.test(t) ||
      /\bP\s*\(\s*[A-Za-z]\s*\|\s*[A-Za-z]\s*\)/.test(text || "") ||
      (/\bif\b/.test(t) && /\bthen\b/.test(t) && /\bprobab/.test(t))
    ) {
      return "Conditional probability is not supported in Phase 8F M1";
    }
    if (
      /\b(permutation|combination|nCr|nPr|factorial|!\s*\)|choose\s+\d+\s+from)\b/.test(
        t
      )
    ) {
      return "Permutations and combinations are not supported in Phase 8F M1";
    }
    if (
      /\b(two|2)\s+dice\b/.test(t) ||
      /\bboth\s+dice\b/.test(t) ||
      /\bsum\s+of\s+(the\s+)?(two\s+)?dice\b/.test(t) ||
      /\brolling\s+two\s+dice\b/.test(t)
    ) {
      return "Two-dice probability is not supported in Phase 8F M1";
    }
    if (/\bdeck\s+of\s+cards\b/.test(t) || /\bplaying\s+cards?\b/.test(t)) {
      return "Card-deck probability is not supported in Phase 8F M1";
    }
    if (
      /\bbinomial\b/.test(t) ||
      /\bnormal\s+distribution\b/.test(t) ||
      /\bbayes\b/.test(t)
    ) {
      return "Advanced probability is not supported in Phase 8F M1";
    }
    return null;
  }

  function looksLikeProbability(text) {
    const t = String(text || "").toLowerCase();
    if (!t.trim()) return false;
    if (isUnsupportedProbability(t)) return true;
    if (/\bprobabilit\w*\b/.test(t) || /\b(chance|likelihood)\b/.test(t)) {
      return true;
    }
    if (/\b(coin|tossed|toss)\b/.test(t) && /\b(head|tail)\b/.test(t)) {
      return true;
    }
    if (/\b(die|dice)\b/.test(t) && !/\b(two|2)\s+dice\b/.test(t)) {
      return true;
    }
    if (/\b(bag|spinner|wheel)\b/.test(t) && /\bprobab/.test(t)) {
      return true;
    }
    if (
      /\b(\d+)\s+out\s+of\s+(\d+)\b/.test(t) &&
      (/\bequally\s+likely\b/.test(t) || /\bprobab/.test(t))
    ) {
      return true;
    }
    if (/\b(favorable|success)\s+outcomes?\b/.test(t)) return true;
    return false;
  }

  function isProbabilityIntent(type) {
    return PROBABILITY_INTENT_TYPES.indexOf(type) >= 0;
  }

  function parseColorCounts(text) {
    const counts = Object.create(null);
    const re = new RegExp(
      "(\\d+)\\s+(" + COLOR_WORDS.split("|").slice(0, 10).join("|") + ")\\b",
      "gi"
    );
    let m;
    while ((m = re.exec(text)) !== null) {
      const color = m[2].toLowerCase();
      if (color === "ball" || color === "balls" || color === "marble" || color === "marbles") {
        continue;
      }
      counts[color] = (counts[color] || 0) + parseInt(m[1], 10);
    }
    return counts;
  }

  function totalFromCounts(counts) {
    return Object.keys(counts).reduce(function (sum, k) {
      return sum + counts[k];
    }, 0);
  }

  function detectTargetColor(text) {
    const t = String(text || "").toLowerCase();
    const colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "white",
      "black",
      "orange",
      "purple",
      "pink",
      "brown"
    ];
    for (let i = 0; i < colors.length; i++) {
      const c = colors[i];
      if (
        new RegExp(
          "\\b(draw|pick|get|select|choos|land|stop|spin)\\w*(?:\\s+on)?\\s+(?:a\\s+)?" +
            c +
            "\\b"
        ).test(t)
      ) {
        return c;
      }
      if (
        new RegExp(
          "\\bprobabilit\\w*\\s+of\\s+(?:getting\\s+|drawing\\s+|picking\\s+|landing\\s+on\\s+)?(?:a\\s+)?" +
            c +
            "\\b"
        ).test(t)
      ) {
        return c;
      }
      if (new RegExp("\\bP\\s*\\(\\s*" + c + "\\s*\\)").test(t)) {
        return c;
      }
    }
    return null;
  }

  function isComplementQuestion(text) {
    const t = String(text || "").toLowerCase();
    return (
      /\bnot\b/.test(t) ||
      /\bcomplement\b/.test(t) ||
      /\bnon[- ]/.test(t) ||
      /\bdoes\s+not\b/.test(t)
    );
  }

  function parseDieFace(text) {
    const t = String(text || "").toLowerCase();
    const digit = t.match(/\b(?:rolling|getting|obtain|show|land)\w*\s+(?:a\s+)?(\d)\b/);
    if (digit) {
      const n = parseInt(digit[1], 10);
      if (n >= 1 && n <= 6) return n;
    }
    const faceWord = t.match(
      /\b(?:rolling|getting|obtain|show|land)\w*\s+(?:a\s+)?(one|two|three|four|five|six)\b/
    );
    if (faceWord) return WORD_TO_FACE[faceWord[1]];
    const simple = t.match(/\b(?:number|face)\s+(\d)\b/);
    if (simple) {
      const n = parseInt(simple[1], 10);
      if (n >= 1 && n <= 6) return n;
    }
    return null;
  }

  function detectCoinEvent(text) {
    const t = String(text || "").toLowerCase();
    if (/\bheads?\b/.test(t)) return "head";
    if (/\btails?\b/.test(t)) return "tail";
    return null;
  }

  function parseEventCounts(text) {
    const t = String(text || "").toLowerCase();

    const explicit = t.match(
      /(\d+)\s+(?:favorable|success)\s+outcomes?\s+(?:out\s+of|\/)\s+(\d+)\s+(?:total\s+)?(?:equally\s+likely\s+)?outcomes?/
    );
    if (explicit) {
      return {
        favorable: parseInt(explicit[1], 10),
        total: parseInt(explicit[2], 10),
        event: "specified event"
      };
    }

    const outOf = t.match(
      /(\d+)\s+out\s+of\s+(\d+)\s+(?:equally\s+likely\s+)?outcomes?/
    );
    if (outOf && (/\bprobab/.test(t) || /\bequally\s+likely\b/.test(t))) {
      return {
        favorable: parseInt(outOf[1], 10),
        total: parseInt(outOf[2], 10),
        event: "specified event"
      };
    }

    const frac = t.match(/\bprobabilit\w*\s*(?:is|=|:)?\s*(\d+)\s*\/\s*(\d+)\b/);
    if (frac) {
      return {
        favorable: parseInt(frac[1], 10),
        total: parseInt(frac[2], 10),
        event: "specified event"
      };
    }

    if (/\b(coin|tossed|toss)\b/.test(t) && /\b(head|tail)\b/.test(t)) {
      const ev = detectCoinEvent(t);
      return {
        favorable: 1,
        total: 2,
        event: ev === "tail" ? "tail" : "head"
      };
    }

    if (/\b(die|dice)\b/.test(t) && !/\b(two|2)\s+dice\b/.test(t)) {
      const face = parseDieFace(t);
      return {
        favorable: 1,
        total: 6,
        event: face ? "face " + face : "specified face"
      };
    }

    const counts = parseColorCounts(text);
    const total = totalFromCounts(counts);
    if (total > 0) {
      const color = detectTargetColor(text);
      if (color && counts[color] != null) {
        return {
          favorable: counts[color],
          total: total,
          event: color
        };
      }
    }

    const sectionMatch = t.match(
      /(\d+)\s+(?:sections?|parts?|sectors?)\s+(?:are\s+)?(?:equally\s+likely\s+)?(?:outcomes?|favorable)/
    );
    if (sectionMatch && /\bprobab/.test(t)) {
      const fav = parseInt(sectionMatch[1], 10);
      const totalMatch = t.match(/\b(?:total\s+of\s+|out\s+of\s+)(\d+)\s+(?:sections?|parts?|sectors?|outcomes?)/);
      if (totalMatch) {
        return {
          favorable: fav,
          total: parseInt(totalMatch[1], 10),
          event: "specified outcome"
        };
      }
    }

    return null;
  }

  function validateCounts(favorable, total) {
    if (!Number.isFinite(favorable) || !Number.isFinite(total)) {
      return "Could not read outcome counts";
    }
    if (total <= 0) {
      return "Total outcomes must be greater than zero";
    }
    if (favorable < 0) {
      return "Favorable outcomes cannot be negative";
    }
    if (favorable > total) {
      return "Favorable outcomes cannot exceed total outcomes";
    }
    return null;
  }

  function solveSingleEvent(spec) {
    const favorable = spec.favorable;
    const total = spec.total;
    const event = spec.event || "E";
    const bad = validateCounts(favorable, total);
    if (bad) return unsupported(bad);

    const answer = formatProbFraction(favorable, total);
    const id = IDS.classical;
    return result({
      operationKey: "probability_single_event",
      given:
        "Equally likely outcomes: " +
        total +
        "; favorable for " +
        event +
        ": " +
        favorable,
      find: "P(" + event + ")",
      steps: [
        step(
          1,
          "Identify outcomes",
          "Total equally likely outcomes = " +
            total +
            "; favorable outcomes for " +
            event +
            " = " +
            favorable
        ),
        formulaStep(2, id),
        step(
          3,
          "Calculate",
          "P(" +
            event +
            ") = " +
            favorable +
            "/" +
            total +
            " = " +
            answer
        )
      ],
      finalAnswer: answer,
      verifyFn: function () {
        return formatProbFraction(favorable, total);
      }
    });
  }

  function solveComplement(spec) {
    const favorable = spec.favorable;
    const total = spec.total;
    const event = spec.event || "E";
    const bad = validateCounts(favorable, total);
    if (bad) return unsupported(bad);

    const pEvent = formatProbFraction(favorable, total);
    const notFav = total - favorable;
    const answer = formatProbFraction(notFav, total);
    const idClass = IDS.classical;
    const idComp = IDS.complement;

    return result({
      operationKey: "probability_complement",
      given:
        "Equally likely outcomes: " +
        total +
        "; favorable for " +
        event +
        ": " +
        favorable,
      find: "P(not " + event + ")",
      steps: [
        step(
          1,
          "Event probability",
          "P(" +
            event +
            ") = " +
            favorable +
            "/" +
            total +
            " = " +
            pEvent
        ),
        formulaStep(2, idClass),
        formulaStep(3, idComp),
        step(
          4,
          "Calculate complement",
          "P(not " +
            event +
            ") = 1 − P(" +
            event +
            ") = " +
            total +
            "−" +
            favorable +
            "/" +
            total +
            " = " +
            answer
        )
      ],
      finalAnswer: answer,
      verifyFn: function () {
        return formatProbFraction(total - favorable, total);
      }
    });
  }

  function classify(text) {
    const compact = String(text || "").replace(/\s+/g, " ").trim();
    if (!compact) return null;

    const bad = isUnsupportedProbability(compact);
    if (bad) return { type: "unsupported", reason: bad };
    if (!looksLikeProbability(compact)) return null;

    const spec = parseEventCounts(compact);
    if (!spec) {
      return {
        type: "unsupported",
        reason: "Supported probability operation not recognised"
      };
    }

    const countBad = validateCounts(spec.favorable, spec.total);
    if (countBad) {
      return { type: "unsupported", reason: countBad };
    }

    const complement = isComplementQuestion(compact);
    return {
      type: complement ? "probability_complement" : "probability_single_event",
      text: compact,
      favorable: spec.favorable,
      total: spec.total,
      event: spec.event
    };
  }

  function solveIntent(intent) {
    if (!intent || intent.type === "unsupported") {
      return unsupported((intent && intent.reason) || "Unsupported");
    }

    const spec = {
      favorable: intent.favorable,
      total: intent.total,
      event: intent.event
    };

    if (intent.type === "probability_complement") {
      return solveComplement(spec);
    }
    if (intent.type === "probability_single_event") {
      return solveSingleEvent(spec);
    }
    return unsupported("Unsupported probability operation: " + intent.type);
  }

  function trySolve(rawText) {
    const text = String(rawText || "").replace(/\s+/g, " ").trim();
    if (!text) return null;

    const intent = classify(text);
    if (!intent) return null;
    if (intent.type === "unsupported") return unsupported(intent.reason);

    const spec = parseEventCounts(text);
    if (!spec) {
      return unsupported("Supported probability operation not recognised");
    }

    const countBad = validateCounts(spec.favorable, spec.total);
    if (countBad) return unsupported(countBad);

    if (isComplementQuestion(text)) return solveComplement(spec);
    return solveSingleEvent(spec);
  }

  return {
    PROBABILITY_INTENT_TYPES: PROBABILITY_INTENT_TYPES,
    IDS: IDS,
    isProbabilityIntent: isProbabilityIntent,
    looksLikeProbability: looksLikeProbability,
    isUnsupportedProbability: isUnsupportedProbability,
    classify: classify,
    solveIntent: solveIntent,
    trySolve: trySolve,
    parseEventCounts: parseEventCounts
  };
});
