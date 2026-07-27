/**
 * Number System Rule Engine (Phase 9)
 *
 * Natural numbers, whole numbers, integers, fractions, HCF/LCM,
 * factors, multiples, prime, even/odd, BODMAS, absolute value,
 * integer comparison and ordering.
 *
 * Reuses math-utils.js, expression.js, normalize.js.
 * Ratio, proportion, percentage, and advanced decimals — later milestones.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      require("./math-utils"),
      require("./expression"),
      require("./normalize")
    );
  } else {
    root.LocalRuleNumbers = factory(
      root.LocalRuleMath,
      root.LocalRuleExpression,
      root.LocalRuleNormalize
    );
  }
})(typeof window !== "undefined" ? window : globalThis, function (
  MathUtils,
  Expression,
  Normalize
) {
  "use strict";

  const NUMBER_INTENT_TYPES = Object.freeze([
    "hcf",
    "lcm",
    "factors",
    "multiples",
    "prime",
    "even_odd",
    "fraction_simplify",
    "fraction_binary",
    "addition",
    "subtraction",
    "multiplication",
    "division",
    "bodmas",
    "simplification",
    "absolute_value",
    "integer_compare",
    "integer_order"
  ]);

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

  function parseNumberList(chunk) {
    const matches = String(chunk).match(/-?\d+/g);
    if (!matches || !matches.length) return [];
    return matches.map(Number);
  }

  /** Extract binary fraction op: a/b + c/d */
  function matchFractionBinary(text) {
    const m = String(text)
      .replace(/\s+/g, "")
      .match(/^(-?\d+)\/(-?\d+)([+\-*/])(-?\d+)\/(-?\d+)$/);
    if (!m) return null;
    return {
      a: { num: Number(m[1]), den: Number(m[2]) },
      op: m[3],
      b: { num: Number(m[4]), den: Number(m[5]) }
    };
  }

  function formatNum(v) {
    if (typeof v !== "number" || !isFinite(v)) return String(v);
    if (Math.abs(v - Math.round(v)) < 1e-12) return String(Math.round(v));
    return String(parseFloat(v.toPrecision(12)));
  }

  function isNumberIntent(type) {
    return NUMBER_INTENT_TYPES.indexOf(type) >= 0;
  }

  /** Strip unary +/− so binary operator counting is accurate for integers. */
  function stripUnaryForCount(expr) {
    return String(expr || "").replace(/(^|[+\-*/(])([+\-])/g, "$1");
  }

  function expressionHasNegative(expr) {
    return /(^|[+\-*/(])-\d/.test(String(expr || ""));
  }

  function integerOperationKey(baseType, expression) {
    if (!expressionHasNegative(expression)) return baseType;
    if (baseType === "addition") return "integer_addition";
    if (baseType === "subtraction") return "integer_subtraction";
    if (baseType === "multiplication") return "integer_multiplication";
    if (baseType === "division") return "integer_division";
    if (baseType === "bodmas") return "integer_bodmas";
    return baseType;
  }

  /** Topics deferred to later Phase 9 milestones */
  function isUnsupportedNumbers(text) {
    const t = String(text || "").toLowerCase();
    if (/\b(ratio|proportion)\b/.test(t) && /\d+\s*:\s*\d+/.test(t)) {
      return "Ratio and proportion will be supported in a later Phase 9 milestone";
    }
    if (/\bpercent(age)?\b/.test(t) || /%/.test(t)) {
      return "Percentage calculations will be supported in a later Phase 9 milestone";
    }
    if (
      /\bdecimal\s+to\s+fraction\b/.test(t) ||
      /\bfraction\s+to\s+decimal\b/.test(t) ||
      (/\bconvert\b/.test(t) && /\bdecimal\b/.test(t))
    ) {
      return "Decimal conversion will be supported in a later Phase 9 milestone";
    }
    if (/\bmixed\s+number\b/.test(t) || /\d+\s+\d+\s*\/\s*\d+/.test(t)) {
      return "Mixed number operations will be supported in a later Phase 9 milestone";
    }
    return null;
  }

  function looksLikeNumbers(text) {
    const compact = Normalize.normalize(text).replace(/\s+/g, " ");
    if (!compact.trim()) return false;
    if (isUnsupportedNumbers(compact)) return true;
    if (/\b(?:HCF|GCD|GCF|LCM)\b/i.test(compact)) return true;
    if (/\bfactors?\s+of\b/i.test(compact)) return true;
    if (/\bmultiples?\s+of\b/i.test(compact) || /\bfirst\s+\d+\s+multiples?\b/i.test(compact)) {
      return true;
    }
    if (/\bprime\b/i.test(compact) || /\beven|\bodd/i.test(compact)) return true;
    if (/\bsimplif\w*\b/i.test(compact) && /\d+\s*\/\s*\d+/.test(compact)) return true;
    if (matchFractionBinary(compact.replace(/^=.*$/, "").split("=")[0].trim())) return true;
    if (/\d+\s*\/\s*\d+/.test(compact)) return true;
    if (
      /\babsolute\s+value\b/i.test(compact) ||
      /\|-?\d+\|/.test(compact) ||
      /\babs\s*\(/i.test(compact)
    ) {
      return true;
    }
    if (
      /\bcompare\b/i.test(compact) ||
      /\barrange\b/i.test(compact) ||
      /\b(ascending|descending)\s+order\b/i.test(compact) ||
      /\border\s+(?:the\s+)?(?:integers?|numbers?)\b/i.test(compact)
    ) {
      return true;
    }

    let expr = compact
      .replace(/^(find|calculate|evaluate|simplify|what\s+is|solve)\s*[:=]?\s*/i, "")
      .replace(/\?+\s*$/, "")
      .trim();
    expr = expr.replace(/=\s*\??\s*$/, "").trim();
    if (/=/.test(expr)) expr = expr.split("=")[0].trim();
    const exprNorm = Normalize.normalize(expr).replace(/\s+/g, "");
    return Expression.isPureArithmetic(exprNorm);
  }

  function classify(rawText) {
    const text = Normalize.normalize(rawText);
    const compact = text.replace(/\s+/g, " ");

    const unsupported = isUnsupportedNumbers(compact);
    if (unsupported) {
      return { type: "unsupported", reason: unsupported };
    }

    let m =
      compact.match(/\b(?:HCF|GCD|GCF)\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/i) ||
      compact.match(
        /\b(?:HCF|GCD|GCF)\s+(?:of\s+)?(-?\d+)\s*(?:and|,)\s*(-?\d+)/i
      );
    if (m) {
      return { type: "hcf", a: Number(m[1]), b: Number(m[2]), text: compact };
    }

    m =
      compact.match(/\bLCM\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/i) ||
      compact.match(/\bLCM\s+(?:of\s+)?(-?\d+)\s*(?:and|,)\s*(-?\d+)/i);
    if (m) {
      return { type: "lcm", a: Number(m[1]), b: Number(m[2]), text: compact };
    }

    m =
      compact.match(/\bfactors?\s+of\s+(-?\d+)/i) ||
      compact.match(/\bfind\s+factors?\s*(?:of\s*)?(-?\d+)/i);
    if (m) {
      return { type: "factors", n: Number(m[1]), text: compact };
    }

    m =
      compact.match(/\bmultiples?\s+of\s+(-?\d+)(?:\s*[:(]?\s*(?:first\s*)?(\d+))?/i) ||
      compact.match(/\bfirst\s+(\d+)\s+multiples?\s+of\s+(-?\d+)/i);
    if (m) {
      if (/\bfirst\s+(\d+)\s+multiples?\s+of\s+(-?\d+)/i.test(compact)) {
        const mm = compact.match(/\bfirst\s+(\d+)\s+multiples?\s+of\s+(-?\d+)/i);
        return {
          type: "multiples",
          n: Number(mm[2]),
          count: Number(mm[1]),
          text: compact
        };
      }
      return {
        type: "multiples",
        n: Number(m[1]),
        count: m[2] ? Number(m[2]) : 5,
        text: compact
      };
    }

    m =
      compact.match(/\bis\s+(-?\d+)\s+(?:a\s+)?prime(?:\s+number)?/i) ||
      compact.match(/\b(?:check\s+)?(?:if\s+)?(-?\d+)\s+is\s+prime/i) ||
      compact.match(/\bprime(?:\s+number)?\s*[?:]?\s*(-?\d+)/i);
    if (m) {
      return { type: "prime", n: Number(m[1]), text: compact };
    }

    m =
      compact.match(/\bis\s+(-?\d+)\s+(?:even|odd)/i) ||
      compact.match(/\b(-?\d+)\s+(?:even|odd)\s*\?/i) ||
      compact.match(/\beven\s*(?:or|\/)\s*odd\s*[?:]?\s*(-?\d+)/i) ||
      compact.match(/\b(?:even|odd)\s*(?:number\s*)?[?:]?\s*(-?\d+)/i);
    if (m || /\beven|\bodd/i.test(compact)) {
      const nums = parseNumberList(compact);
      if (nums.length === 1 && /\beven|\bodd/i.test(compact)) {
        return { type: "even_odd", n: nums[0], text: compact };
      }
      if (m) return { type: "even_odd", n: Number(m[1]), text: compact };
    }

    m = compact.match(/\bsimplif(?:y|ication)\s*(?:of\s*)?(-?\d+)\s*\/\s*(-?\d+)/i);
    if (m) {
      return {
        type: "fraction_simplify",
        frac: { num: Number(m[1]), den: Number(m[2]) },
        text: compact
      };
    }
    m = compact.match(/^(-?\d+)\s*\/\s*(-?\d+)\s*(?:in\s+)?lowest\s+terms/i);
    if (m) {
      return {
        type: "fraction_simplify",
        frac: { num: Number(m[1]), den: Number(m[2]) },
        text: compact
      };
    }

    const fracExpr = matchFractionBinary(
      compact.replace(/^=.*$/, "").split("=")[0].trim()
    );
    if (fracExpr) {
      return {
        type: "fraction_binary",
        a: fracExpr.a,
        b: fracExpr.b,
        op: fracExpr.op,
        text: compact
      };
    }

    // Absolute value: |−25|, abs(-25), absolute value of -25
    m =
      compact.match(/\babsolute\s+value\s+of\s+(-?\d+)/i) ||
      compact.match(/\babs\s*\(\s*(-?\d+)\s*\)/i) ||
      compact.match(/\|(-?\d+)\|/) ||
      compact.match(/\bfind\s+\|(-?\d+)\|/i);
    if (m) {
      return { type: "absolute_value", n: Number(m[1]), text: compact };
    }

    // Compare two integers
    m = compact.match(/\bcompare\s+(-?\d+)\s+(?:and|with|,)\s+(-?\d+)/i);
    if (m) {
      return {
        type: "integer_compare",
        a: Number(m[1]),
        b: Number(m[2]),
        op: null,
        text: compact
      };
    }
    m = compact.match(
      /\bwhich\s+is\s+(?:greater|larger|smaller|less)\s*[?:]?\s*(-?\d+)\s+(?:and|or|,)\s+(-?\d+)/i
    );
    if (m) {
      return {
        type: "integer_compare",
        a: Number(m[1]),
        b: Number(m[2]),
        op: null,
        text: compact
      };
    }
    m = compact.match(/(-?\d+)\s*(>=|<=|≠|!=|>|<|=)\s*(-?\d+)/);
    if (m) {
      return {
        type: "integer_compare",
        a: Number(m[1]),
        b: Number(m[3]),
        op: m[2],
        text: compact
      };
    }

    // Arrange / order integers on the number line
    if (
      /\b(arrange|order|sort)\b/i.test(compact) ||
      /\b(ascending|descending)\s+order\b/i.test(compact)
    ) {
      const nums = parseNumberList(compact);
      if (nums.length >= 2) {
        const descending =
          /\bdescending\b/i.test(compact) ||
          /\bfrom\s+(?:largest|greatest)\s+to\s+(?:smallest|least)\b/i.test(compact);
        return {
          type: "integer_order",
          values: nums,
          order: descending ? "descending" : "ascending",
          text: compact
        };
      }
    }

    let expr = compact
      .replace(/^(find|calculate|evaluate|simplify|what\s+is|solve)\s*[:=]?\s*/i, "")
      .replace(/\?+\s*$/, "")
      .trim();
    expr = expr.replace(/=\s*\??\s*$/, "").trim();
    if (/=/.test(expr)) expr = expr.split("=")[0].trim();

    const exprNorm = Normalize.normalize(expr).replace(/\s+/g, "");
    if (Expression.isPureArithmetic(exprNorm)) {
      const binaryForm = stripUnaryForCount(exprNorm);
      const ops = (binaryForm.match(/[+\-*/]/g) || []).length;
      let opType = "bodmas";
      if (ops === 1) {
        if (binaryForm.indexOf("+") >= 0) opType = "addition";
        else if (binaryForm.indexOf("-") >= 0) opType = "subtraction";
        else if (binaryForm.indexOf("*") >= 0) opType = "multiplication";
        else if (binaryForm.indexOf("/") >= 0) opType = "division";
      } else if (ops > 1) {
        opType = "bodmas";
      } else if (ops === 0) {
        return { type: "unsupported", reason: "No operation found" };
      }
      return { type: opType, expression: exprNorm, text: compact };
    }

    return null;
  }

  function solveHcf(intent) {
    const a = intent.a;
    const b = intent.b;
    const steps = [];
    steps.push(
      step(1, "Identify the numbers", "Find HCF of " + a + " and " + b + ".")
    );
    let x = Math.abs(a);
    let y = Math.abs(b);
    if (x < y) {
      const swap = x;
      x = y;
      y = swap;
    }
    let n = 2;
    while (y !== 0) {
      const q = Math.floor(x / y);
      const r = x % y;
      steps.push(
        step(
          n,
          "Divide " + x + " by " + y,
          x + " = " + y + " × " + q + " + " + r,
          { latex: x + " = " + y + " \\times " + q + " + " + r }
        )
      );
      x = y;
      y = r;
      n += 1;
    }
    const answer = x;
    steps.push(
      step(n, "HCF found", "When remainder is 0, HCF is " + answer + ".", {
        hint: "HCF is the last non-zero remainder."
      })
    );
    return {
      operationKey: "hcf",
      given: "a = " + a + ", b = " + b,
      find: "HCF(" + a + ", " + b + ")",
      steps: steps,
      finalAnswer: answer,
      verifyValue: answer,
      verifyFn: function () {
        return MathUtils.gcd(a, b);
      },
      verified: MathUtils.gcd(a, b) === answer
    };
  }

  function solveLcm(intent) {
    const a = intent.a;
    const b = intent.b;
    const h = MathUtils.gcd(a, b);
    const answer = MathUtils.lcm(a, b);
    const steps = [
      step(1, "Identify the numbers", "Find LCM of " + a + " and " + b + "."),
      step(2, "Find HCF first", "HCF(" + a + ", " + b + ") = " + h + "."),
      step(
        3,
        "Use HCF × LCM relation",
        "LCM = (" + a + " × " + b + ") ÷ HCF = " + a * b + " ÷ " + h + " = " + answer,
        {
          latex: "\\mathrm{LCM}=\\frac{" + a + "\\times " + b + "}{" + h + "}=" + answer,
          hint: "For two numbers, HCF × LCM = product of the numbers."
        }
      )
    ];
    return {
      operationKey: "lcm",
      given: "a = " + a + ", b = " + b,
      find: "LCM(" + a + ", " + b + ")",
      steps: steps,
      finalAnswer: answer,
      verifyFn: function () {
        return MathUtils.lcm(a, b);
      },
      verified: MathUtils.lcm(a, b) === answer
    };
  }

  function solveFactors(intent) {
    const n = intent.n;
    const list = MathUtils.factorsOf(n);
    const steps = [
      step(1, "Understand factors", "Factors of " + n + " divide " + n + " exactly."),
      step(
        2,
        "List factor pairs",
        "Check integers from 1 to " + n + " that leave remainder 0.",
        { hint: "If a is a factor, then n/a is also a factor." }
      ),
      step(3, "Write all factors", "Factors of " + n + " are: " + list.join(", ") + ".")
    ];
    return {
      operationKey: "factors",
      given: "n = " + n,
      find: "All factors of " + n,
      steps: steps,
      finalAnswer: list.join(", "),
      verifyFn: function () {
        return MathUtils.factorsOf(n).join(", ");
      },
      verified: true
    };
  }

  function solveMultiples(intent) {
    const n = intent.n;
    const count = intent.count || 5;
    const list = [];
    for (let i = 1; i <= count; i += 1) list.push(n * i);
    const steps = [
      step(1, "Recall multiples", "Multiples of " + n + " are " + n + ", 2×" + n + ", 3×" + n + ", …"),
      step(
        2,
        "Compute first " + count + " multiples",
        list
          .map(function (v, i) {
            return i + 1 + " × " + n + " = " + v;
          })
          .join("; ")
      ),
      step(3, "Result", "First " + count + " multiples: " + list.join(", ") + ".")
    ];
    return {
      operationKey: "multiples",
      given: "n = " + n + ", count = " + count,
      find: "First " + count + " multiples of " + n,
      steps: steps,
      finalAnswer: list.join(", "),
      verifyFn: function () {
        const check = [];
        for (let i = 1; i <= count; i += 1) check.push(n * i);
        return check.join(", ");
      },
      verified: true
    };
  }

  function solvePrime(intent) {
    const n = intent.n;
    const prime = MathUtils.isPrime(n);
    const steps = [
      step(1, "Definition", "A prime number has exactly two distinct factors: 1 and itself."),
      step(
        2,
        "Check " + n,
        n <= 1
          ? n + " is not greater than 1, so it is not prime."
          : "Test divisibility by integers from 2 to √" + n + "."
      )
    ];
    if (n > 1) {
      const fac = MathUtils.factorsOf(n);
      steps.push(step(3, "Factors", "Factors of " + n + ": " + fac.join(", ") + "."));
      steps.push(
        step(
          4,
          "Conclusion",
          prime ? n + " is a prime number." : n + " is not a prime number."
        )
      );
    } else {
      steps.push(step(3, "Conclusion", n + " is not a prime number."));
    }
    return {
      operationKey: "prime",
      given: "n = " + n,
      find: "Whether " + n + " is prime",
      steps: steps,
      finalAnswer: prime ? "Prime" : "Not prime",
      verifyFn: function () {
        return MathUtils.isPrime(n) ? "Prime" : "Not prime";
      },
      verified: true
    };
  }

  function solveEvenOdd(intent) {
    const n = intent.n;
    const even = MathUtils.isEven(n);
    const steps = [
      step(1, "Rule", "A number is even if divisible by 2; otherwise it is odd."),
      step(
        2,
        "Divide by 2",
        n + " ÷ 2 gives remainder " + (Math.abs(n) % 2) + ".",
        { latex: n + " \\bmod 2 = " + (Math.abs(n) % 2) }
      ),
      step(3, "Conclusion", n + " is " + (even ? "even" : "odd") + ".")
    ];
    return {
      operationKey: "even_odd",
      given: "n = " + n,
      find: "Even or odd",
      steps: steps,
      finalAnswer: even ? "Even" : "Odd",
      verifyFn: function () {
        return MathUtils.isEven(n) ? "Even" : "Odd";
      },
      verified: true
    };
  }

  function solveFractionSimplify(intent) {
    const f = intent.frac;
    const simp = MathUtils.simplifyFraction(f.num, f.den);
    const g = MathUtils.gcd(f.num, f.den);
    const steps = [
      step(1, "Given fraction", "Simplify " + f.num + "/" + f.den + "."),
      step(2, "Find HCF of numerator and denominator", "HCF(" + f.num + ", " + f.den + ") = " + g + "."),
      step(
        3,
        "Divide by HCF",
        "(" + f.num + " ÷ " + g + ") / (" + f.den + " ÷ " + g + ") = " +
          MathUtils.fractionToString(simp),
        {
          latex:
            "\\frac{" + f.num + "}{" + f.den + "}=\\frac{" + simp.num + "}{" + simp.den + "}"
        }
      )
    ];
    return {
      operationKey: "fraction_simplify",
      given: f.num + "/" + f.den,
      find: "Simplified fraction",
      steps: steps,
      finalAnswer: MathUtils.fractionToString(simp),
      verifyFn: function () {
        return MathUtils.fractionToString(MathUtils.simplifyFraction(f.num, f.den));
      },
      verified: true
    };
  }

  function solveFractionBinary(intent) {
    const a = intent.a;
    const b = intent.b;
    const op = intent.op;
    if (op !== "+" && op !== "-") {
      return {
        unsupported: true,
        reason: "Only fraction addition and subtraction are supported in Phase 8B.1"
      };
    }

    const steps = [];
    steps.push(
      step(
        1,
        "Write the expression",
        MathUtils.fractionToString(a) + " " + op + " " + MathUtils.fractionToString(b)
      )
    );

    let operationKey;
    let result;
    if (a.den === b.den) {
      operationKey = op === "+" ? "fraction_add_like" : "fraction_sub_like";
      const num = op === "+" ? a.num + b.num : a.num - b.num;
      steps.push(
        step(
          2,
          "Like denominators",
          "Same denominator " + a.den + ": combine numerators.",
          {
            latex:
              "\\frac{" + a.num + (op === "+" ? "+" : "-") + b.num + "}{" + a.den + "}"
          }
        )
      );
      result = MathUtils.simplifyFraction(num, a.den);
      steps.push(step(3, "Simplify", "Result = " + MathUtils.fractionToString(result)));
    } else {
      operationKey = op === "+" ? "fraction_add_unlike" : "fraction_sub_unlike";
      const L = MathUtils.lcm(a.den, b.den);
      const a2 = { num: a.num * (L / a.den), den: L };
      const b2 = { num: b.num * (L / b.den), den: L };
      steps.push(
        step(
          2,
          "Find common denominator",
          "LCM(" + a.den + ", " + b.den + ") = " + L + ".",
          { hint: "Use equivalent fractions." }
        )
      );
      steps.push(
        step(
          3,
          "Rewrite as like fractions",
          MathUtils.fractionToString(a) + " = " + MathUtils.fractionToString(a2) + ", " +
            MathUtils.fractionToString(b) + " = " + MathUtils.fractionToString(b2)
        )
      );
      const num = op === "+" ? a2.num + b2.num : a2.num - b2.num;
      steps.push(
        step(
          4,
          op === "+" ? "Add numerators" : "Subtract numerators",
          "(" + a2.num + " " + op + " " + b2.num + ")/" + L + " = " + num + "/" + L
        )
      );
      result = MathUtils.simplifyFraction(num, L);
      steps.push(step(5, "Simplify", "Final answer = " + MathUtils.fractionToString(result)));
    }

    return {
      operationKey: operationKey,
      given: MathUtils.fractionToString(a) + ", " + MathUtils.fractionToString(b),
      find: "Value of the fraction expression",
      steps: steps,
      finalAnswer: MathUtils.fractionToString(result),
      verifyFn: function () {
        const L = MathUtils.lcm(a.den, b.den);
        const n1 = a.num * (L / a.den);
        const n2 = b.num * (L / b.den);
        const num = op === "+" ? n1 + n2 : n1 - n2;
        return MathUtils.fractionToString(MathUtils.simplifyFraction(num, L));
      },
      verified: true
    };
  }

  function solveAbsoluteValue(intent) {
    const n = intent.n;
    if (typeof n !== "number" || !isFinite(n) || !Number.isInteger(n)) {
      return {
        unsupported: true,
        reason: "Absolute value requires an integer"
      };
    }
    const answer = Math.abs(n);
    const steps = [
      step(
        1,
        "Recall absolute value",
        "The absolute value of an integer is its distance from 0 on the number line."
      ),
      step(
        2,
        "Locate " + n + " on the number line",
        n >= 0
          ? n + " is " + n + " units to the right of 0."
          : n + " is " + answer + " units to the left of 0."
      ),
      step(
        3,
        "Result",
        "|" + n + "| = " + answer,
        {
          latex: "\\left|" + n + "\\right|=" + answer,
          hint: "Absolute value is never negative."
        }
      )
    ];
    return {
      operationKey: "absolute_value",
      given: "n = " + n,
      find: "|" + n + "|",
      steps: steps,
      finalAnswer: answer,
      verifyFn: function () {
        return Math.abs(n);
      },
      verified: true
    };
  }

  function solveIntegerCompare(intent) {
    const a = intent.a;
    const b = intent.b;
    if (
      typeof a !== "number" ||
      typeof b !== "number" ||
      !isFinite(a) ||
      !isFinite(b) ||
      !Number.isInteger(a) ||
      !Number.isInteger(b)
    ) {
      return {
        unsupported: true,
        reason: "Integer comparison requires two integers"
      };
    }

    let relation;
    let description;
    if (a > b) {
      relation = a + " > " + b;
      description = a + " lies to the right of " + b + " on the number line, so " + a + " is greater.";
    } else if (a < b) {
      relation = a + " < " + b;
      description = a + " lies to the left of " + b + " on the number line, so " + a + " is smaller.";
    } else {
      relation = a + " = " + b;
      description = a + " and " + b + " are at the same point on the number line.";
    }

    const steps = [
      step(1, "Place on the number line", "Integers farther right are greater."),
      step(2, "Compare " + a + " and " + b, description),
      step(3, "Result", relation, { latex: relation.replace(/>/g, ">").replace(/</g, "<") })
    ];

    return {
      operationKey: "integer_compare",
      given: "a = " + a + ", b = " + b,
      find: "Compare " + a + " and " + b,
      steps: steps,
      finalAnswer: relation,
      verifyFn: function () {
        if (a > b) return a + " > " + b;
        if (a < b) return a + " < " + b;
        return a + " = " + b;
      },
      verified: true
    };
  }

  function solveIntegerOrder(intent) {
    const values = Array.isArray(intent.values) ? intent.values.slice() : [];
    if (values.length < 2) {
      return {
        unsupported: true,
        reason: "Ordering requires at least two integers"
      };
    }
    for (let i = 0; i < values.length; i += 1) {
      if (!Number.isInteger(values[i])) {
        return {
          unsupported: true,
          reason: "Ordering requires integers only"
        };
      }
    }

    const descending = intent.order === "descending";
    const sorted = values.slice().sort(function (x, y) {
      return descending ? y - x : x - y;
    });
    const answer = sorted.join(", ");
    const orderLabel = descending ? "descending" : "ascending";

    const steps = [
      step(
        1,
        "Number line rule",
        descending
          ? "On the number line, larger integers are farther right. List from right to left."
          : "On the number line, smaller integers are farther left. List from left to right."
      ),
      step(2, "Given integers", values.join(", ")),
      step(
        3,
        "Arrange in " + orderLabel + " order",
        answer,
        { hint: "Moving right on the number line increases the value." }
      )
    ];

    return {
      operationKey: "integer_order",
      given: values.join(", "),
      find: "Integers in " + orderLabel + " order",
      steps: steps,
      finalAnswer: answer,
      verifyFn: function () {
        const check = values.slice().sort(function (x, y) {
          return descending ? y - x : x - y;
        });
        return check.join(", ");
      },
      verified: true
    };
  }

  function solveArithmetic(intent) {
    let evaluated;
    try {
      evaluated = Expression.evaluate(intent.expression);
    } catch (err) {
      return {
        unsupported: true,
        reason: (err && err.message) || "Invalid arithmetic expression"
      };
    }

    const steps = [];
    const isIntegerOp = expressionHasNegative(intent.expression);
    steps.push(
      step(1, "Write the expression", "Evaluate: " + intent.expression, {
        latex: intent.expression.replace(/\*/g, "\\times ").replace(/\//g, "\\div ")
      })
    );

    if (isIntegerOp) {
      steps.push(
        step(
          2,
          "Use integer number-line rules",
          "Positive moves right; negative moves left. Same signs multiply/divide to positive; different signs give negative."
        )
      );
    } else if (intent.type === "bodmas" || (evaluated.ops && evaluated.ops.length > 1)) {
      steps.push(
        step(
          2,
          "Apply BODMAS / order of operations",
          "Brackets, Orders, Division/Multiplication, Addition/Subtraction."
        )
      );
    }

    let n = steps.length + 1;
    evaluated.ops.forEach(function (op) {
      const sym = op.op === "*" ? "×" : op.op === "/" ? "÷" : op.op;
      steps.push(
        step(
          n,
          "Compute " + op.a + " " + sym + " " + op.b,
          op.a + " " + sym + " " + op.b + " = " + formatNum(op.result)
        )
      );
      n += 1;
    });

    const answer = formatNum(evaluated.value);
    steps.push(step(n, "Final result", "Answer = " + answer));

    let findLabel = "Value of the expression";
    if (intent.type === "addition") findLabel = "Sum";
    if (intent.type === "subtraction") findLabel = "Difference";
    if (intent.type === "multiplication") findLabel = "Product";
    if (intent.type === "division") findLabel = "Quotient";

    const operationKey = integerOperationKey(intent.type, intent.expression);

    return {
      operationKey: operationKey,
      given: intent.expression,
      find: findLabel,
      steps: steps,
      finalAnswer: answer,
      verifyFn: function () {
        return formatNum(Expression.evaluate(intent.expression).value);
      },
      verified: true
    };
  }

  function solveIntent(intent) {
    if (!intent || intent.type === "unsupported") {
      return {
        unsupported: true,
        reason: (intent && intent.reason) || "Unsupported"
      };
    }

    switch (intent.type) {
      case "hcf":
        return solveHcf(intent);
      case "lcm":
        return solveLcm(intent);
      case "factors":
        return solveFactors(intent);
      case "multiples":
        return solveMultiples(intent);
      case "prime":
        return solvePrime(intent);
      case "even_odd":
        return solveEvenOdd(intent);
      case "fraction_simplify":
        return solveFractionSimplify(intent);
      case "fraction_binary":
        return solveFractionBinary(intent);
      case "absolute_value":
        return solveAbsoluteValue(intent);
      case "integer_compare":
        return solveIntegerCompare(intent);
      case "integer_order":
        return solveIntegerOrder(intent);
      case "addition":
      case "subtraction":
      case "multiplication":
      case "division":
      case "bodmas":
      case "simplification":
        return solveArithmetic(intent);
      default:
        return {
          unsupported: true,
          reason: "Unsupported number operation: " + intent.type
        };
    }
  }

  function trySolve(rawText) {
    const intent = classify(rawText);
    if (!intent) {
      return { unsupported: true, reason: "Not a number system question" };
    }
    return solveIntent(intent);
  }

  return {
    looksLikeNumbers: looksLikeNumbers,
    isUnsupportedNumbers: isUnsupportedNumbers,
    isNumberIntent: isNumberIntent,
    classify: classify,
    solveIntent: solveIntent,
    trySolve: trySolve
  };
});
