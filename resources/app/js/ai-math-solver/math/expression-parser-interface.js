/**
 * Math Expression Object schema + parser interface.
 *
 * MathExpression {
 *   expressionId, latex, plainText, type
 * }
 *
 * Types: Equation | Fraction | Matrix | Integral | Summation | Limit | Geometry | Table
 */
(function (global) {
  "use strict";

  const MathExpressionTypes = Object.freeze({
    EQUATION: "Equation",
    FRACTION: "Fraction",
    MATRIX: "Matrix",
    INTEGRAL: "Integral",
    SUMMATION: "Summation",
    LIMIT: "Limit",
    GEOMETRY: "Geometry",
    TABLE: "Table"
  });

  function createExpression(partial) {
    const p = partial || {};
    return {
      expressionId: p.expressionId || null,
      latex: p.latex || "",
      plainText: p.plainText || "",
      type: p.type || MathExpressionTypes.EQUATION
    };
  }

  /**
   * Parser interface — implementations plug in later / Phase 8B refinements.
   * @typedef {Object} IMathExpressionParser
   * @property {string} id
   * @property {function(string, object=): Array} parse
   */

  const parsers = Object.create(null);

  const MathExpressionParser = {
    Types: MathExpressionTypes,
    create: createExpression,

    register: function (id, parser) {
      if (!parser || typeof parser.parse !== "function") {
        throw new Error("Math expression parser must implement parse()");
      }
      parsers[id] = parser;
    },

    /**
     * @param {string} text
     * @param {object} [options]
     * @returns {Array}
     */
    parse: function (text, options) {
      const opts = options || {};
      const id = opts.parser || Object.keys(parsers)[0];
      if (!id || !parsers[id]) {
        // Fallback heuristic adapter using MathDetector if present
        if (global.MathDetector && global.MathDetector.detect) {
          const detected = global.MathDetector.detect(text);
          return (detected.blocks || []).map(function (b, i) {
            return createExpression({
              expressionId: "expr-" + (i + 1),
              plainText: b.match || "",
              latex: "",
              type: mapLegacyType(b.type)
            });
          });
        }
        return [];
      }
      return parsers[id].parse(text, opts) || [];
    },

    list: function () {
      return Object.keys(parsers);
    }
  };

  function mapLegacyType(type) {
    const t = String(type || "").toLowerCase();
    if (t === "fraction") return MathExpressionTypes.FRACTION;
    if (t === "matrix") return MathExpressionTypes.MATRIX;
    if (t === "integral") return MathExpressionTypes.INTEGRAL;
    if (t === "equation") return MathExpressionTypes.EQUATION;
    if (t === "root" || t === "power" || t === "operator" || t === "greek") {
      return MathExpressionTypes.EQUATION;
    }
    return MathExpressionTypes.EQUATION;
  }

  global.MathExpressionTypes = MathExpressionTypes;
  global.MathExpressionParser = MathExpressionParser;
})(window);
