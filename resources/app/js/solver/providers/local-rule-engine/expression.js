/**
 * Safe BODMAS expression evaluator — numbers and + − × ÷ ( ) only.
 * Rejects algebra / unknown tokens.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LocalRuleExpression = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function tokenize(src) {
    const s = String(src).replace(/\s+/g, "");
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/[0-9.]/.test(ch)) {
        let j = i + 1;
        while (j < s.length && /[0-9.]/.test(s[j])) j += 1;
        const raw = s.slice(i, j);
        if ((raw.match(/\./g) || []).length > 1) {
          throw new Error("Invalid number: " + raw);
        }
        tokens.push({ type: "number", value: Number(raw) });
        i = j;
        continue;
      }
      if ("+-*/()".indexOf(ch) >= 0) {
        tokens.push({ type: "op", value: ch });
        i += 1;
        continue;
      }
      throw new Error("Unsupported token in expression: " + ch);
    }
    return tokens;
  }

  function toRpn(tokens) {
    const out = [];
    const stack = [];
    const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };
    let prevWasOpOrStart = true;

    for (let i = 0; i < tokens.length; i += 1) {
      const t = tokens[i];
      if (t.type === "number") {
        out.push(t);
        prevWasOpOrStart = false;
        continue;
      }
      if (t.value === "(") {
        stack.push(t);
        prevWasOpOrStart = true;
        continue;
      }
      if (t.value === ")") {
        while (stack.length && stack[stack.length - 1].value !== "(") {
          out.push(stack.pop());
        }
        if (!stack.length) throw new Error("Mismatched parentheses");
        stack.pop();
        prevWasOpOrStart = false;
        continue;
      }
      // unary minus / plus
      if ((t.value === "-" || t.value === "+") && prevWasOpOrStart) {
        out.push({ type: "number", value: 0 });
      }
      while (
        stack.length &&
        stack[stack.length - 1].value !== "(" &&
        prec[stack[stack.length - 1].value] >= prec[t.value]
      ) {
        out.push(stack.pop());
      }
      stack.push(t);
      prevWasOpOrStart = true;
    }
    while (stack.length) {
      const op = stack.pop();
      if (op.value === "(" || op.value === ")") {
        throw new Error("Mismatched parentheses");
      }
      out.push(op);
    }
    return out;
  }

  function evalRpn(rpn) {
    const stack = [];
    const steps = [];
    rpn.forEach(function (t) {
      if (t.type === "number") {
        stack.push(t.value);
        return;
      }
      if (stack.length < 2) throw new Error("Invalid expression");
      const b = stack.pop();
      const a = stack.pop();
      let result;
      if (t.value === "+") result = a + b;
      else if (t.value === "-") result = a - b;
      else if (t.value === "*") result = a * b;
      else if (t.value === "/") {
        if (b === 0) throw new Error("Division by zero");
        result = a / b;
      } else throw new Error("Unknown operator");
      steps.push({ a: a, op: t.value, b: b, result: result });
      stack.push(result);
    });
    if (stack.length !== 1) throw new Error("Invalid expression");
    return { value: stack[0], ops: steps };
  }

  /**
   * @param {string} expression already normalized (* / + -)
   * @returns {{ value: number, ops: object[] }}
   */
  function evaluate(expression) {
    const tokens = tokenize(expression);
    if (!tokens.length) throw new Error("Empty expression");
    const rpn = toRpn(tokens);
    return evalRpn(rpn);
  }

  /**
   * True if string is a pure numeric BODMAS expression (after normalize).
   */
  function isPureArithmetic(expression) {
    return /^[0-9+\-*/().\s]+$/.test(expression) && /[0-9]/.test(expression);
  }

  return {
    evaluate: evaluate,
    isPureArithmetic: isPureArithmetic
  };
});
