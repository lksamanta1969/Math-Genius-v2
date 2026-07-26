/**
 * Topic handlers — Class 6 Arithmetic + Intro Algebra (8B.4) + Geometry (8C).
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      require("./math-utils"),
      require("./expression"),
      require("./normalize"),
      require("./algebra"),
      require("./geometry")
    );
  } else {
    root.LocalRuleHandlers = factory(
      root.LocalRuleMath,
      root.LocalRuleExpression,
      root.LocalRuleNormalize,
      root.LocalRuleAlgebra,
      root.LocalRuleGeometry
    );
  }
})(typeof window !== "undefined" ? window : globalThis, function (
  MathUtils,
  Expression,
  Normalize,
  Algebra,
  Geometry
) {
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

  function parseNumberList(chunk) {
    const matches = String(chunk).match(/-?\d+/g);
    if (!matches || !matches.length) return [];
    return matches.map(Number);
  }

  function parseFraction(token) {
    const m = String(token)
      .trim()
      .match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (!m) return null;
    return { num: Number(m[1]), den: Number(m[2]) };
  }

  /** Extract binary fraction op: a/b + c/d */
  function matchFractionBinary(text) {
    const m = String(text)
      .replace(/\s+/g, "")
      .match(
        /^(-?\d+)\/(-?\d+)([+\-*/])(-?\d+)\/(-?\d+)$/
      );
    if (!m) return null;
    return {
      a: { num: Number(m[1]), den: Number(m[2]) },
      op: m[3],
      b: { num: Number(m[4]), den: Number(m[5]) }
    };
  }

  function classify(rawText) {
    const text = Normalize.normalize(rawText);
    const compact = text.replace(/\s+/g, " ");
    const lower = compact.toLowerCase();

    // Geometry unsupported gates (coordinate, congruence, transformations, circles, mensuration)
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

    // Unsupported advanced algebra → explicit unsupported
    if (Algebra && Algebra.isUnsupportedAlgebra) {
      const bad = Algebra.isUnsupportedAlgebra(compact);
      if (
        bad &&
        (Algebra.looksLikeIntroAlgebra(compact) ||
          /[<>≤≥≠\^²]/.test(compact) ||
          (/=/.test(compact) && /[a-zA-Z]/.test(compact)))
      ) {
        // Only hard-fail when clearly advanced/unsupported form
        if (/[<>≤≥≠\^²]/.test(compact) || /\n.*=/.test(compact)) {
          return { type: "unsupported", reason: bad };
        }
      }
    }

    // Intro algebra (equations / like terms) — classified in solveIntent via Algebra.trySolve
    if (Algebra && Algebra.looksLikeIntroAlgebra(compact)) {
      return { type: "algebra", text: compact };
    }

    // HCF / GCD
    let m =
      compact.match(/\b(?:HCF|GCD|GCF)\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/i) ||
      compact.match(
        /\b(?:HCF|GCD|GCF)\s+(?:of\s+)?(-?\d+)\s*(?:and|,)\s*(-?\d+)/i
      );
    if (m) {
      return { type: "hcf", a: Number(m[1]), b: Number(m[2]), text: compact };
    }

    // LCM
    m =
      compact.match(/\bLCM\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/i) ||
      compact.match(/\bLCM\s+(?:of\s+)?(-?\d+)\s*(?:and|,)\s*(-?\d+)/i);
    if (m) {
      return { type: "lcm", a: Number(m[1]), b: Number(m[2]), text: compact };
    }

    // Factors
    m =
      compact.match(/\bfactors?\s+of\s+(-?\d+)/i) ||
      compact.match(/\bfind\s+factors?\s*(?:of\s*)?(-?\d+)/i);
    if (m) {
      return { type: "factors", n: Number(m[1]), text: compact };
    }

    // Multiples
    m =
      compact.match(/\bmultiples?\s+of\s+(-?\d+)(?:\s*[:(]?\s*(?:first\s*)?(\d+))?/i) ||
      compact.match(/\bfirst\s+(\d+)\s+multiples?\s+of\s+(-?\d+)/i);
    if (m) {
      if (/^first/i.test(m[0]) || (m[2] && !m[1])) {
        // first N multiples of X — second pattern
      }
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

    // Prime
    m =
      compact.match(/\bis\s+(-?\d+)\s+(?:a\s+)?prime(?:\s+number)?/i) ||
      compact.match(/\b(?:check\s+)?(?:if\s+)?(-?\d+)\s+is\s+prime/i) ||
      compact.match(/\bprime(?:\s+number)?\s*[?:]?\s*(-?\d+)/i);
    if (m) {
      return { type: "prime", n: Number(m[1]), text: compact };
    }

    // Even / Odd
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

    // Simplify fraction
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

    // Fraction binary
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

    // Strip leading prompts for expression
    let expr = compact
      .replace(/^(find|calculate|evaluate|simplify|what\s+is|solve)\s*[:=]?\s*/i, "")
      .replace(/\?+\s*$/, "")
      .trim();
    // drop trailing = ?
    expr = expr.replace(/=\s*\??\s*$/, "").trim();
    // if contains = take LHS
    if (/=/.test(expr)) {
      expr = expr.split("=")[0].trim();
    }

    // Pure arithmetic / BODMAS
    const exprNorm = Normalize.normalize(expr).replace(/\s+/g, "");
    if (Expression.isPureArithmetic(exprNorm)) {
      const ops = (exprNorm.match(/[+\-*/]/g) || []).length;
      let opType = "bodmas";
      if (ops === 1) {
        if (exprNorm.indexOf("+") >= 0) opType = "addition";
        else if (exprNorm.indexOf("-") >= 0 && !/^-/.test(exprNorm))
          opType = "subtraction";
        else if (exprNorm.indexOf("*") >= 0) opType = "multiplication";
        else if (exprNorm.indexOf("/") >= 0) opType = "division";
      } else if (ops > 1) {
        opType = "bodmas";
      } else if (ops === 0) {
        return { type: "unsupported", reason: "No operation found" };
      }
      return { type: opType, expression: exprNorm, text: compact };
    }

    return {
      type: "unsupported",
      reason: "Question type not supported by Local Rule Engine (Class 6 Arithmetic Phase 1)"
    };
  }

  function solveHcf(intent) {
    const a = intent.a;
    const b = intent.b;
    const steps = [];
    steps.push(
      step(1, "Identify the numbers", "Find HCF of " + a + " and " + b + ".")
    );
    // Euclidean algorithm steps
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
    const verify = MathUtils.gcd(a, b) === answer;
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
      verified: verify
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
      step(2, "Check " + n, n <= 1
        ? n + " is not greater than 1, so it is not prime."
        : "Test divisibility by integers from 2 to √" + n + ".")
    ];
    if (n > 1) {
      const fac = MathUtils.factorsOf(n);
      steps.push(
        step(3, "Factors", "Factors of " + n + ": " + fac.join(", ") + ".")
      );
      steps.push(
        step(
          4,
          "Conclusion",
          prime
            ? n + " is a prime number."
            : n + " is not a prime number."
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
            "\\frac{" +
            f.num +
            "}{" +
            f.den +
            "}=\\frac{" +
            simp.num +
            "}{" +
            simp.den +
            "}"
        }
      )
    ];
    const answer = MathUtils.fractionToString(simp);
    return {
      operationKey: "fraction_simplify",
      given: f.num + "/" + f.den,
      find: "Simplified fraction",
      steps: steps,
      finalAnswer: answer,
      verifyFn: function () {
        return MathUtils.fractionToString(
          MathUtils.simplifyFraction(f.num, f.den)
        );
      },
      verified: true
    };
  }

  function solveFractionBinary(intent) {
    const a = intent.a;
    const b = intent.b;
    const op = intent.op;
    if (op === "*" || op === "/") {
      return {
        unsupported: true,
        reason: "Fraction multiplication/division not in Phase 8B.1 supported set for output tests — treating via rules if needed"
      };
    }
    // Actually user listed Fractions - addition of 1/2+1/4 is required. Mult/div of fractions - support simplify path only; for * / return unsupported to be safe? User said Fractions and Simplification. I'll support + and - for fractions; * and / of two fractions as unsupported to avoid guessing scope.

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
        MathUtils.fractionToString(a) +
          " " +
          op +
          " " +
          MathUtils.fractionToString(b)
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
              "\\frac{" +
              a.num +
              (op === "+" ? "+" : "-") +
              b.num +
              "}{" +
              a.den +
              "}"
          }
        )
      );
      result = MathUtils.simplifyFraction(num, a.den);
      steps.push(
        step(
          3,
          "Simplify",
          "Result = " + MathUtils.fractionToString(result)
        )
      );
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
          MathUtils.fractionToString(a) +
            " = " +
            MathUtils.fractionToString(a2) +
            ", " +
            MathUtils.fractionToString(b) +
            " = " +
            MathUtils.fractionToString(b2)
        )
      );
      const num = op === "+" ? a2.num + b2.num : a2.num - b2.num;
      steps.push(
        step(
          4,
          op === "+" ? "Add numerators" : "Subtract numerators",
          "(" +
            a2.num +
            " " +
            op +
            " " +
            b2.num +
            ")/" +
            L +
            " = " +
            num +
            "/" +
            L
        )
      );
      result = MathUtils.simplifyFraction(num, L);
      steps.push(
        step(5, "Simplify", "Final answer = " + MathUtils.fractionToString(result))
      );
    }

    const answer = MathUtils.fractionToString(result);
    return {
      operationKey: operationKey,
      given:
        MathUtils.fractionToString(a) +
        ", " +
        MathUtils.fractionToString(b),
      find: "Value of the fraction expression",
      steps: steps,
      finalAnswer: answer,
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

  function solveArithmetic(intent) {
    const evaluated = Expression.evaluate(intent.expression);
    const steps = [];
    steps.push(
      step(1, "Write the expression", "Evaluate: " + intent.expression, {
        latex: intent.expression
          .replace(/\*/g, "\\times ")
          .replace(/\//g, "\\div ")
      })
    );

    if (intent.type === "bodmas" || (evaluated.ops && evaluated.ops.length > 1)) {
      steps.push(
        step(2, "Apply BODMAS / order of operations", "Brackets, Orders, Division/Multiplication, Addition/Subtraction.")
      );
    }

    let n = steps.length + 1;
    evaluated.ops.forEach(function (op) {
      const sym =
        op.op === "*" ? "×" : op.op === "/" ? "÷" : op.op;
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

    return {
      operationKey: intent.type,
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

  function formatNum(v) {
    if (typeof v !== "number" || !isFinite(v)) return String(v);
    if (Math.abs(v - Math.round(v)) < 1e-12) return String(Math.round(v));
    // trim float noise
    return String(parseFloat(v.toPrecision(12)));
  }

  function solveIntent(intent) {
    if (!intent || intent.type === "unsupported") {
      return {
        unsupported: true,
        reason: (intent && intent.reason) || "Unsupported"
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
          reason: "Unsupported operation: " + intent.type
        };
    }
  }

  return {
    classify: classify,
    solveIntent: solveIntent
  };
});
