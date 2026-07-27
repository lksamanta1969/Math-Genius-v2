/**
 * Decimal Math — string/BigInt-backed arithmetic for Phase 9 Milestone 4.
 *
 * Supports arbitrary-length decimals, negatives, leading/trailing zeros,
 * scientific notation, configurable division precision, and half-up rounding.
 *
 * Does not depend on floating-point Number arithmetic for results.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LocalRuleDecimalMath = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEFAULT_DIV_PRECISION = 12;
  const MAX_SCALE = 100;
  const MAX_DIGIT_LENGTH = 200;

  /**
   * Internal form: value = sign * digits / 10^scale
   * digits is a non-negative decimal digit string (no leading zeros unless "0").
   */
  function make(sign, digits, scale) {
    let d = String(digits || "0").replace(/^0+(?=\d)/, "");
    if (!d) d = "0";
    let s = scale;
    if (d === "0") {
      return { sign: 1, digits: "0", scale: 0 };
    }
    // Trim trailing fractional zeros
    while (s > 0 && d.charAt(d.length - 1) === "0") {
      d = d.slice(0, -1);
      s -= 1;
    }
    return { sign: sign < 0 ? -1 : 1, digits: d, scale: s };
  }

  function fail(message) {
    const err = new Error(message);
    err.code = "DECIMAL_MATH";
    throw err;
  }

  function isValidDecimalLiteral(raw) {
    return /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(String(raw || "").trim());
  }

  /**
   * Parse a decimal literal (optional scientific notation).
   * @returns {{ sign: number, digits: string, scale: number }}
   */
  function parse(input) {
    const raw = String(input == null ? "" : input).trim().replace(/\s+/g, "");
    if (!raw) fail("Invalid decimal format: empty input");
    if (!isValidDecimalLiteral(raw)) fail("Invalid decimal format: " + raw);

    let s = raw;
    let sign = 1;
    if (s.charAt(0) === "+") s = s.slice(1);
    if (s.charAt(0) === "-") {
      sign = -1;
      s = s.slice(1);
    }

    let exp = 0;
    const eMatch = s.match(/[eE]([+-]?\d+)$/);
    if (eMatch) {
      exp = Number(eMatch[1]);
      if (!isFinite(exp) || Math.abs(exp) > MAX_SCALE) {
        fail("Exponent out of supported range");
      }
      s = s.slice(0, eMatch.index);
    }

    if (!s || s === ".") fail("Invalid decimal format: " + raw);

    let whole;
    let frac = "";
    if (s.indexOf(".") >= 0) {
      const parts = s.split(".");
      if (parts.length !== 2) fail("Invalid decimal format: " + raw);
      whole = parts[0] === "" ? "0" : parts[0];
      frac = parts[1] || "";
    } else {
      whole = s;
    }

    if (!/^\d+$/.test(whole) || (frac && !/^\d+$/.test(frac))) {
      fail("Invalid decimal format: " + raw);
    }

    let digits = whole + frac;
    let scale = frac.length - exp;

    // scale < 0 means multiply digits by 10^|scale|
    if (scale < 0) {
      digits = digits + new Array(-scale + 1).join("0");
      scale = 0;
    }

    digits = digits.replace(/^0+(?=\d)/, "") || "0";
    if (digits.length > MAX_DIGIT_LENGTH) fail("Decimal overflow: too many digits");
    if (scale > MAX_SCALE) fail("Precision exceeds supported scale");

    return make(sign, digits, scale);
  }

  function fromNumber(n) {
    if (typeof n !== "number" || !isFinite(n)) fail("Invalid number");
    // Prefer precise string for common cases
    return parse(String(n));
  }

  function toPlainString(dec) {
    const d = dec.digits;
    const scale = dec.scale;
    const sign = dec.sign < 0 ? "-" : "";
    if (scale === 0) return sign + d;
    if (d.length <= scale) {
      return sign + "0." + new Array(scale - d.length + 1).join("0") + d;
    }
    const cut = d.length - scale;
    return sign + d.slice(0, cut) + "." + d.slice(cut);
  }

  function align(a, b) {
    const scale = Math.max(a.scale, b.scale);
    function scaled(x) {
      const pad = scale - x.scale;
      const digits = pad > 0 ? x.digits + new Array(pad + 1).join("0") : x.digits;
      return { sign: x.sign, digits: digits, scale: scale };
    }
    return { a: scaled(a), b: scaled(b), scale: scale };
  }

  function cmpAbsDigits(da, db) {
    if (da.length !== db.length) return da.length > db.length ? 1 : -1;
    if (da === db) return 0;
    return da > db ? 1 : -1;
  }

  function addDigitStrings(a, b) {
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;
    const out = [];
    while (i >= 0 || j >= 0 || carry) {
      const x = (i >= 0 ? a.charCodeAt(i) - 48 : 0) + (j >= 0 ? b.charCodeAt(j) - 48 : 0) + carry;
      out.push(String(x % 10));
      carry = (x / 10) | 0;
      i -= 1;
      j -= 1;
    }
    return out.reverse().join("").replace(/^0+(?=\d)/, "") || "0";
  }

  function subDigitStrings(a, b) {
    // assume a >= b
    let i = a.length - 1;
    let j = b.length - 1;
    let borrow = 0;
    const out = [];
    while (i >= 0) {
      let x = a.charCodeAt(i) - 48 - borrow - (j >= 0 ? b.charCodeAt(j) - 48 : 0);
      if (x < 0) {
        x += 10;
        borrow = 1;
      } else borrow = 0;
      out.push(String(x));
      i -= 1;
      j -= 1;
    }
    return out.reverse().join("").replace(/^0+(?=\d)/, "") || "0";
  }

  function mulDigitStrings(a, b) {
    if (a === "0" || b === "0") return "0";
    const m = a.length;
    const n = b.length;
    const res = new Array(m + n);
    for (let k = 0; k < m + n; k += 1) res[k] = 0;
    for (let i = m - 1; i >= 0; i -= 1) {
      for (let j = n - 1; j >= 0; j -= 1) {
        const mul = (a.charCodeAt(i) - 48) * (b.charCodeAt(j) - 48) + res[i + j + 1];
        res[i + j + 1] = mul % 10;
        res[i + j] += (mul / 10) | 0;
      }
    }
    let s = res.join("").replace(/^0+(?=\d)/, "");
    if (s.length > MAX_DIGIT_LENGTH) fail("Decimal overflow: product too large");
    return s || "0";
  }

  function add(aInput, bInput) {
    const A = typeof aInput === "object" && aInput.digits != null ? aInput : parse(aInput);
    const B = typeof bInput === "object" && bInput.digits != null ? bInput : parse(bInput);
    const aligned = align(A, B);
    const a = aligned.a;
    const b = aligned.b;
    if (a.sign === b.sign) {
      return make(a.sign, addDigitStrings(a.digits, b.digits), aligned.scale);
    }
    const cmp = cmpAbsDigits(a.digits, b.digits);
    if (cmp === 0) return make(1, "0", 0);
    if (cmp > 0) {
      return make(a.sign, subDigitStrings(a.digits, b.digits), aligned.scale);
    }
    return make(b.sign, subDigitStrings(b.digits, a.digits), aligned.scale);
  }

  function subtract(aInput, bInput) {
    const B = typeof bInput === "object" && bInput.digits != null ? bInput : parse(bInput);
    const negB = make(-B.sign, B.digits, B.scale);
    return add(aInput, negB);
  }

  function multiply(aInput, bInput) {
    const A = typeof aInput === "object" && aInput.digits != null ? aInput : parse(aInput);
    const B = typeof bInput === "object" && bInput.digits != null ? bInput : parse(bInput);
    const sign = A.sign * B.sign;
    const digits = mulDigitStrings(A.digits, B.digits);
    const scale = A.scale + B.scale;
    if (scale > MAX_SCALE) fail("Precision exceeds supported scale");
    return make(sign, digits, scale);
  }

  /**
   * Divide with half-up rounding to `precision` decimal places.
   * @param {string|object} aInput
   * @param {string|object} bInput
   * @param {number} [precision=DEFAULT_DIV_PRECISION]
   */
  function divide(aInput, bInput, precision) {
    const A = typeof aInput === "object" && aInput.digits != null ? aInput : parse(aInput);
    const B = typeof bInput === "object" && bInput.digits != null ? bInput : parse(bInput);
    if (B.digits === "0") fail("Division by zero");

    let prec = precision == null ? DEFAULT_DIV_PRECISION : Number(precision);
    if (!Number.isInteger(prec) || prec < 0) fail("Invalid precision");
    if (prec > MAX_SCALE) fail("Precision exceeds supported scale");

    // Compute (A.digits / B.digits) * 10^(B.scale - A.scale), then round to `prec`.
    // Work in integer long division producing (prec + 1) extra fractional digits for rounding.
    const sign = A.sign * B.sign;

    // Normalize both to integers: value = digits * 10^(-scale)
    // quotient ≈ (Ad/Bd) * 10^(Bs - As)
    // Produce integer result digits for value * 10^prec, plus one guard digit.
    const targetScale = prec + 1; // guard digit
    // dividend = Ad * 10^(Bs + targetScale)
    // divisor  = Bd * 10^As
    // quotient ≈ value * 10^targetScale
    let dividend = A.digits + new Array(B.scale + targetScale + 1).join("0");
    let divisor = B.digits + new Array(A.scale + 1).join("0");
    dividend = dividend.replace(/^0+(?=\d)/, "") || "0";
    divisor = divisor.replace(/^0+(?=\d)/, "") || "0";

    const q = divDigitStrings(dividend, divisor); // integer quotient
    // q has implicit scale = targetScale (= prec+1)
    const rounded = roundHalfUpScaled(q, 1); // remove 1 guard digit with half-up
    return make(sign, rounded, prec);
  }

  function divDigitStrings(dividend, divisor) {
    if (divisor === "0") fail("Division by zero");
    if (dividend === "0") return "0";
    if (cmpAbsDigits(dividend, divisor) < 0) return "0";

    let rem = "";
    let result = "";
    for (let i = 0; i < dividend.length; i += 1) {
      rem = (rem === "0" ? "" : rem) + dividend.charAt(i);
      rem = rem.replace(/^0+(?=\d)/, "") || "0";
      let qDigit = 0;
      // Find max q 0..9 such that divisor * q <= rem
      while (qDigit < 9) {
        const trial = mulDigitStrings(divisor, String(qDigit + 1));
        if (cmpAbsDigits(trial, rem) > 0) break;
        qDigit += 1;
      }
      result += String(qDigit);
      if (qDigit > 0) {
        rem = subDigitStrings(rem, mulDigitStrings(divisor, String(qDigit)));
      }
    }
    return result.replace(/^0+(?=\d)/, "") || "0";
  }

  /** Round scaled integer digit string by removing `guard` trailing digits (half-up). */
  function roundHalfUpScaled(digitStr, guard) {
    if (guard <= 0) return digitStr;
    let d = digitStr;
    if (d.length <= guard) {
      d = new Array(guard - d.length + 1).join("0") + d;
    }
    const keep = d.slice(0, d.length - guard);
    const firstGuard = d.charAt(d.length - guard);
    if (firstGuard >= "5") {
      return addDigitStrings(keep || "0", "1");
    }
    return keep.replace(/^0+(?=\d)/, "") || "0";
  }

  /**
   * Round a decimal value to `places` decimal places (half-up).
   */
  function round(input, places) {
    let p = Number(places);
    if (!Number.isInteger(p) || p < 0) fail("Invalid rounding places");
    if (p > MAX_SCALE) fail("Precision exceeds supported scale");
    const A = typeof input === "object" && input.digits != null ? input : parse(input);
    if (A.scale <= p) {
      // Pad visually but mathematically same
      return make(A.sign, A.digits + new Array(p - A.scale + 1).join("0"), p);
    }
    // Need to remove (A.scale - p) digits with half-up
    const remove = A.scale - p;
    const roundedDigits = roundHalfUpScaled(A.digits, remove);
    return make(A.sign, roundedDigits, p);
  }

  function format(input, opts) {
    const options = opts || {};
    const dec = typeof input === "object" && input.digits != null ? input : parse(input);
    let places = options.places;
    let value = dec;
    if (places != null) {
      value = round(dec, places);
      const plain = toPlainString(value);
      // Force exact places for fixed display when requested
      if (places === 0) return plain.indexOf(".") >= 0 ? plain.split(".")[0] : plain;
      const sign = plain.charAt(0) === "-" ? "-" : "";
      const abs = sign ? plain.slice(1) : plain;
      const parts = abs.split(".");
      const whole = parts[0] || "0";
      let frac = parts[1] || "";
      if (frac.length < places) frac += new Array(places - frac.length + 1).join("0");
      if (frac.length > places) frac = frac.slice(0, places);
      return sign + whole + "." + frac;
    }
    return toPlainString(value);
  }

  function compare(aInput, bInput) {
    const diff = subtract(aInput, bInput);
    if (diff.digits === "0") return 0;
    return diff.sign;
  }

  /**
   * Evaluate a simple binary expression: a op b
   * op in + - * /
   */
  function evaluateBinary(aStr, op, bStr, precision) {
    if (op === "+") return add(aStr, bStr);
    if (op === "-") return subtract(aStr, bStr);
    if (op === "*" || op === "×") return multiply(aStr, bStr);
    if (op === "/" || op === "÷") return divide(aStr, bStr, precision);
    fail("Unsupported operator: " + op);
  }

  return {
    DEFAULT_DIV_PRECISION: DEFAULT_DIV_PRECISION,
    MAX_SCALE: MAX_SCALE,
    parse: parse,
    fromNumber: fromNumber,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    round: round,
    format: format,
    compare: compare,
    toPlainString: toPlainString,
    evaluateBinary: evaluateBinary,
    isValidDecimalLiteral: isValidDecimalLiteral
  };
});
