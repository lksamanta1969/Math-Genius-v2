/**
 * Introductory Algebra engine (Phase 8B.4)
 * Class 6/7: variables, like terms, evaluate, simple linear (one variable).
 * Rejects quadratic, simultaneous, higher polynomials, inequalities.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LocalRuleAlgebra = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

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

  function formatNum(n) {
    if (typeof n !== "number" || !isFinite(n)) return String(n);
    if (Math.abs(n - Math.round(n)) < 1e-12) return String(Math.round(n));
    return String(parseFloat(n.toPrecision(12)));
  }

  function formatTerm(coef, variable) {
    if (!variable) return formatNum(coef);
    if (coef === 1) return variable;
    if (coef === -1) return "-" + variable;
    return formatNum(coef) + variable;
  }

  function formatExpr(terms) {
    if (!terms.length) return "0";
    let out = "";
    terms.forEach(function (t, i) {
      const c = t.coef;
      const v = t.variable;
      if (i === 0) {
        out += formatTerm(c, v);
        return;
      }
      if (c < 0) {
        out += " - " + formatTerm(Math.abs(c), v);
      } else {
        out += " + " + formatTerm(c, v);
      }
    });
    return out;
  }

  /**
   * Parse sum of terms: 2x, -3, 7+x, 2a+3a, 5m-2m
   * Only degree 0 or 1, single variable letter.
   */
  function parseExpression(expr) {
    let s = String(expr || "").replace(/\s+/g, "");
    if (!s) return { ok: false, reason: "Empty expression" };

    // Reject powers / quadratic
    if (/[\^²]|[a-zA-Z]\s*\*\s*[a-zA-Z]|[a-zA-Z]{2,}/.test(s)) {
      return { ok: false, reason: "Unsupported polynomial / power" };
    }
    if (/[a-zA-Z]\d|\d+[a-zA-Z]\d/.test(s) && /[a-zA-Z]\d/.test(s)) {
      // x2 style without ^ — treat as unsupported if digit after letter
      if (/[a-zA-Z]\d/.test(s)) {
        return { ok: false, reason: "Unsupported polynomial / power" };
      }
    }

    // Normalize unary: leading +
    if (s[0] !== "+" && s[0] !== "-") s = "+" + s;

    const termRe = /([+-])(\d*\.?\d*)([a-zA-Z]?)/g;
    const terms = [];
    let m;
    let lastIndex = 0;
    const matches = [];
    while ((m = termRe.exec(s)) !== null) {
      matches.push(m);
      lastIndex = termRe.lastIndex;
    }
    if (!matches.length || lastIndex !== s.length) {
      return { ok: false, reason: "Could not parse algebraic expression" };
    }

    const variables = {};
    matches.forEach(function (tm) {
      const sign = tm[1] === "-" ? -1 : 1;
      let coefStr = tm[2];
      const variable = tm[3] || null;
      let coef;
      if (coefStr === "" || coefStr === ".") {
        coef = variable ? 1 : 0;
      } else {
        coef = Number(coefStr);
      }
      coef *= sign;
      if (!variable && coef === 0 && coefStr === "") return;
      terms.push({ coef: coef, variable: variable, power: variable ? 1 : 0 });
      if (variable) variables[variable] = true;
    });

    const varNames = Object.keys(variables);
    if (varNames.length > 1) {
      return {
        ok: false,
        reason: "Multiple variables are not supported in Phase 8B.4"
      };
    }

    return {
      ok: true,
      terms: terms,
      variable: varNames[0] || null
    };
  }

  function combineLikeTerms(terms) {
    const map = Object.create(null);
    const order = [];
    terms.forEach(function (t) {
      const key = t.variable || "#const";
      if (!map[key]) {
        map[key] = { coef: 0, variable: t.variable || null, power: t.power || 0 };
        order.push(key);
      }
      map[key].coef += t.coef;
    });
    return order
      .map(function (k) {
        return map[k];
      })
      .filter(function (t) {
        return Math.abs(t.coef) > 1e-12;
      });
  }

  function isUnsupportedAlgebra(text) {
    const t = String(text || "");
    if (/[<>≤≥≠]/.test(t) || /\b(lt|gt|le|ge)\b/i.test(t)) {
      return "Inequalities are not supported.";
    }
    if (/[\^²]|(\w)\s*\^\s*2|[a-zA-Z]\s*\*\s*[a-zA-Z]/.test(t)) {
      return "Quadratic / higher-degree polynomials are not supported.";
    }
    // Simultaneous: two equals on separate lines or comma-separated equations
    const eqs = t.split(/[\n;]+/).filter(function (l) {
      return /=/.test(l);
    });
    if (eqs.length > 1) {
      return "Simultaneous equations are not supported.";
    }
    // Two different variables in an equation
    if (/=/.test(t)) {
      const letters = t.match(/[a-zA-Z]/g) || [];
      const uniq = Array.from(
        new Set(
          letters
            .join("")
            .replace(/HCF|LCM|GCD|GCF|Find|Solve|Evaluate|When/gi, "")
            .toLowerCase()
            .split("")
            .filter(Boolean)
        )
      );
      if (uniq.length > 1) {
        return "Equations with multiple variables are not supported.";
      }
    }
    return null;
  }

  function looksLikeIntroAlgebra(text) {
    const t = String(text || "").replace(/\s+/g, " ").trim();
    if (!t) return false;
    if (isUnsupportedAlgebra(t)) return false;
    // Has a single-letter variable used algebraically
    const cleaned = t
      .replace(/\b(HCF|LCM|GCD|GCF|Prime|Even|Odd|Factors?|Multiples?|Simplify|Find|What|is|of|and|or|the|number|numbers|whether|evaluate|when|solve)\b/gi, " ")
      .replace(/(\d)\s*[xX]\s*(\d)/g, "$1*$2");
    return /[a-zA-Z]/.test(cleaned) || /[□_?]|\bmissing\b/i.test(t);
  }

  function solveCombineLikeTerms(raw) {
    const parsed = parseExpression(raw);
    if (!parsed.ok) {
      return { unsupported: true, reason: parsed.reason };
    }
    if (!parsed.variable) {
      return { unsupported: true, reason: "No variable terms to combine" };
    }
    const before = formatExpr(parsed.terms);
    const combined = combineLikeTerms(parsed.terms);
    const after = formatExpr(combined);
    const steps = [
      step(1, "Identify the expression", "Expression: " + before),
      step(
        2,
        "Identify like terms",
        "Like terms share the same variable (here: " + parsed.variable + ").",
        { hint: "Unlike terms cannot be combined." }
      ),
      step(
        3,
        "Combine like terms",
        "Add/subtract coefficients of " + parsed.variable + ".",
        { latex: before + "=" + after }
      ),
      step(4, "Simplified expression", "Result: " + after)
    ];
    return {
      operationKey: "algebra_combine_like_terms",
      given: before,
      find: "Simplified expression",
      steps: steps,
      finalAnswer: after,
      verifyFn: function () {
        return formatExpr(combineLikeTerms(parseExpression(raw).terms));
      },
      verified: true
    };
  }

  function solveLinearEquation(raw) {
    let s = String(raw || "").replace(/\s+/g, "");
    const parts = s.split("=");
    if (parts.length !== 2) {
      return { unsupported: true, reason: "Not a simple equation" };
    }

    const left = parseExpression(parts[0]);
    const right = parseExpression(parts[1]);
    if (!left.ok || !right.ok) {
      return {
        unsupported: true,
        reason: (left.reason || right.reason || "Parse error")
      };
    }

    const variable = left.variable || right.variable;
    if (!variable) {
      return { unsupported: true, reason: "No variable in equation" };
    }
    if (
      (left.variable && right.variable && left.variable !== right.variable) ||
      (left.variable && left.variable !== variable) ||
      (right.variable && right.variable !== variable)
    ) {
      return {
        unsupported: true,
        reason: "Multiple variables are not supported"
      };
    }

    // Move all to LHS: left - right = 0
    const all = left.terms.concat(
      right.terms.map(function (t) {
        return { coef: -t.coef, variable: t.variable, power: t.power };
      })
    );
    const combined = combineLikeTerms(all);
    let a = 0;
    let b = 0;
    combined.forEach(function (t) {
      if (t.variable) a += t.coef;
      else b += t.coef;
    });

    if (Math.abs(a) < 1e-12) {
      return {
        unsupported: true,
        reason: "Not a linear equation in one variable"
      };
    }

    // a*x + b = 0  =>  a*x = -b  => x = -b/a
    // Present as ax + b = 0 form from original
    const steps = [];
    let n = 1;
    const original = parts[0] + " = " + parts[1];
    steps.push(
      step(n++, "Write the equation", original, {
        latex: parts[0] + "=" + parts[1]
      })
    );

    // Work on standard form from original sides
    // Collect coef and constant on left and right separately for pedagogy
    function sideParts(parsed) {
      let coef = 0;
      let constant = 0;
      parsed.terms.forEach(function (t) {
        if (t.variable) coef += t.coef;
        else constant += t.coef;
      });
      return { coef: coef, constant: constant };
    }

    const L = sideParts(left);
    const R = sideParts(right);

    // Current: L.coef * x + L.constant = R.coef * x + R.constant
    // Move variable terms to left, constants to right
    let leftCoef = L.coef - R.coef;
    let leftConst = L.constant;
    let rightConst = R.constant;

    if (R.coef !== 0) {
      steps.push(
        step(
          n++,
          "Collect variable terms on the left",
          "Move " +
            formatTerm(R.coef, variable) +
            " from the right to the left (subtract from both sides)."
        )
      );
    }

    if (leftConst !== 0) {
      const k = leftConst;
      const op = k > 0 ? "Subtract" : "Add";
      const absK = Math.abs(k);
      steps.push(
        step(
          n++,
          op + " " + absK + " " + (k > 0 ? "from" : "to") + " both sides",
          op +
            " " +
            absK +
            " " +
            (k > 0 ? "from" : "to") +
            " both sides to isolate the " +
            variable +
            " term.",
          {
            latex:
              formatTerm(leftCoef, variable) +
              (k > 0 ? "-" : "+") +
              absK +
              "=" +
              formatNum(rightConst - k)
          }
        )
      );
      rightConst = rightConst - k;
      leftConst = 0;
    }

    steps.push(
      step(
        n++,
        "Simplified equation",
        formatTerm(leftCoef, variable) + " = " + formatNum(rightConst),
        {
          latex: formatTerm(leftCoef, variable) + "=" + formatNum(rightConst)
        }
      )
    );

    if (leftCoef !== 1 && leftCoef !== -1) {
      steps.push(
        step(
          n++,
          "Divide both sides by " + formatNum(leftCoef),
          "Divide both sides by " +
            formatNum(leftCoef) +
            " to solve for " +
            variable +
            ".",
          {
            latex:
              variable +
              "=" +
              formatNum(rightConst) +
              "/" +
              formatNum(leftCoef),
            hint: "Multiplication / Division property of equality"
          }
        )
      );
    } else if (leftCoef === -1) {
      steps.push(
        step(
          n++,
          "Multiply both sides by −1",
          "Multiply both sides by −1.",
          { latex: variable + "=" + formatNum(-rightConst) }
        )
      );
      rightConst = -rightConst;
      leftCoef = 1;
    }

    const value = rightConst / leftCoef;
    const answer = formatNum(value);
    steps.push(
      step(n++, "Final answer", variable + " = " + answer, {
        latex: variable + "=" + answer
      })
    );

    return {
      operationKey: "algebra_linear_equation",
      given: original,
      find: "Value of " + variable,
      steps: steps,
      finalAnswer: variable + " = " + answer,
      verifyFn: function () {
        // Substitute back into original
        const checkLeft = L.coef * value + L.constant;
        const checkRight = R.coef * value + R.constant;
        if (Math.abs(checkLeft - checkRight) < 1e-9) {
          return variable + " = " + answer;
        }
        return "VERIFY_FAIL";
      },
      verified: true
    };
  }

  function solveEvaluate(raw) {
    // Patterns: evaluate 2x+3 when x=4 | 2x+3, x=4
    const t = String(raw || "");
    let m =
      t.match(
        /evaluat(?:e|ion)\s+(.+?)\s+(?:when|for|at)\s+([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)/i
      ) ||
      t.match(
        /^(.+?)\s*[;,]\s*([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)\s*$/i
      );
    if (!m) {
      return { unsupported: true, reason: "Not an evaluate expression" };
    }
    const expr = m[1].replace(/^=\s*/, "").trim();
    const variable = m[2];
    const value = Number(m[3]);
    const parsed = parseExpression(expr);
    if (!parsed.ok) {
      return { unsupported: true, reason: parsed.reason };
    }
    let result = 0;
    const steps = [
      step(1, "Write the expression", expr),
      step(2, "Substitute", "Put " + variable + " = " + formatNum(value))
    ];
    parsed.terms.forEach(function (term, i) {
      if (term.variable) {
        const part = term.coef * value;
        result += part;
        steps.push(
          step(
            3 + i,
            "Compute " + formatTerm(term.coef, term.variable),
            formatTerm(term.coef, term.variable) +
              " → " +
              formatNum(term.coef) +
              " × " +
              formatNum(value) +
              " = " +
              formatNum(part)
          )
        );
      } else {
        result += term.coef;
        steps.push(
          step(
            3 + i,
            "Constant term",
            "Add " + formatNum(term.coef)
          )
        );
      }
    });
    const answer = formatNum(result);
    steps.push(step(steps.length + 1, "Value", "Expression evaluates to " + answer));
    return {
      operationKey: "algebra_evaluate",
      given: expr + " when " + variable + " = " + formatNum(value),
      find: "Value of the expression",
      steps: steps,
      finalAnswer: answer,
      verifyFn: function () {
        let r = 0;
        parsed.terms.forEach(function (term) {
          r += term.variable ? term.coef * value : term.coef;
        });
        return formatNum(r);
      },
      verified: true
    };
  }

  function solveMissingNumber(raw) {
    // 5 + ? = 12  or  7 + __ = 10  or □
    let s = String(raw || "")
      .replace(/[□▢_?]+/g, "x")
      .replace(/\bmissing\b/gi, "x");
    if (!/=/.test(s)) {
      return { unsupported: true, reason: "Not a missing-number sentence" };
    }
    const result = solveLinearEquation(s);
    if (result && !result.unsupported) {
      result.operationKey = "algebra_missing_number";
      result.find = "Missing number";
    }
    return result;
  }

  /**
   * Try to classify + solve intro algebra. Returns null if not algebra.
   */
  function trySolve(rawText) {
    const text = String(rawText || "").replace(/\s+/g, " ").trim();
    if (!text) return null;

    const unsupported = isUnsupportedAlgebra(text);
    if (unsupported && looksLikeIntroAlgebra(text.replace(/[<>≤≥≠]/g, ""))) {
      // has algebra-ish but unsupported form
      return { unsupported: true, reason: unsupported };
    }
    if (unsupported && /[<>≤≥≠\^²]/.test(text)) {
      return { unsupported: true, reason: unsupported };
    }

    if (!looksLikeIntroAlgebra(text) && !/=/.test(text)) {
      // plain combine like 2a+3a still has letters
      if (!/[a-zA-Z]/.test(text)) return null;
    }

    // Evaluate
    if (/evaluat/i.test(text) || /,\s*[a-zA-Z]\s*=\s*-?\d/.test(text)) {
      const ev = solveEvaluate(text);
      if (!ev.unsupported) return ev;
    }

    // Missing number
    if (/[□▢_?]|missing/i.test(text)) {
      const miss = solveMissingNumber(text);
      if (!miss.unsupported) return miss;
      if (miss.unsupported) return miss;
    }

    // Equation
    if (/=/.test(text)) {
      const bad = isUnsupportedAlgebra(text);
      if (bad) return { unsupported: true, reason: bad };
      // Strip prompts
      const eq = text
        .replace(/^(find|solve|calculate|what\s+is)\s*[:=]?\s*/i, "")
        .replace(/\?+\s*$/, "")
        .trim();
      return solveLinearEquation(eq);
    }

    // Combine like terms / simplify expression
    if (/[a-zA-Z]/.test(text)) {
      const bad = isUnsupportedAlgebra(text);
      if (bad) return { unsupported: true, reason: bad };
      const expr = text
        .replace(/^(simplify|combine|find)\s*[:=]?\s*/i, "")
        .trim();
      return solveCombineLikeTerms(expr);
    }

    return null;
  }

  return {
    trySolve: trySolve,
    looksLikeIntroAlgebra: looksLikeIntroAlgebra,
    isUnsupportedAlgebra: isUnsupportedAlgebra,
    parseExpression: parseExpression,
    combineLikeTerms: combineLikeTerms
  };
});
