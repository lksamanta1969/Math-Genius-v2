/**
 * Math expression / symbol detection — returns structured blocks.
 */
(function (global) {
  "use strict";

  const PATTERNS = [
    { type: "integral", re: /∫|\\int|\bintegral\b/i },
    { type: "root", re: /√|\\sqrt|\bsqrt\b/i },
    { type: "power", re: /\^|\b\d+\s*[a-zA-Z]\b|[²³⁴]|[a-zA-Z]\^\d/ },
    { type: "fraction", re: /\d+\s*\/\s*\d+|\\frac/ },
    { type: "matrix", re: /\bmatrix\b|\[\[|\|/i },
    { type: "greek", re: /[αβγδεθηλμπσφωΔΣΠΩθφ]|\\alpha|\\beta|\\pi|\\theta/i },
    { type: "equation", re: /[=≠≈≤≥]/ },
    {
      type: "operator",
      re: /[+\-×÷*/±∞∑∏∂√]/
    },
    { type: "number", re: /\d+(\.\d+)?/ }
  ];

  function detectMathInText(text) {
    const source = String(text || "");
    const found = [];
    const types = new Set();

    PATTERNS.forEach(function (pattern) {
      const match = source.match(pattern.re);
      if (match) {
        types.add(pattern.type);
        found.push({
          type: pattern.type,
          match: match[0],
          index: match.index || 0
        });
      }
    });

    return {
      containsMath: types.size > 0,
      types: Array.from(types),
      blocks: found
    };
  }

  global.MathDetector = {
    detect: detectMathInText
  };
})(window);
