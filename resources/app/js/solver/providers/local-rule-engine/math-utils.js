/**
 * Shared arithmetic helpers for Local Rule Engine (Class 6).
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LocalRuleMath = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function gcd(a, b) {
    let x = Math.abs(Math.trunc(a));
    let y = Math.abs(Math.trunc(b));
    while (y !== 0) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  function lcm(a, b) {
    const A = Math.abs(Math.trunc(a));
    const B = Math.abs(Math.trunc(b));
    if (A === 0 || B === 0) return 0;
    return Math.abs(A / gcd(A, B)) * B;
  }

  function gcdMany(nums) {
    return nums.reduce(function (acc, n) {
      return gcd(acc, n);
    });
  }

  function lcmMany(nums) {
    return nums.reduce(function (acc, n) {
      return lcm(acc, n);
    });
  }

  function factorsOf(n) {
    const N = Math.abs(Math.trunc(n));
    const list = [];
    for (let i = 1; i * i <= N; i += 1) {
      if (N % i === 0) {
        list.push(i);
        if (i !== N / i) list.push(N / i);
      }
    }
    return list.sort(function (a, b) {
      return a - b;
    });
  }

  function isPrime(n) {
    const N = Math.trunc(n);
    if (N <= 1) return false;
    if (N <= 3) return true;
    if (N % 2 === 0 || N % 3 === 0) return false;
    for (let i = 5; i * i <= N; i += 6) {
      if (N % i === 0 || N % (i + 2) === 0) return false;
    }
    return true;
  }

  function isEven(n) {
    return Math.trunc(n) % 2 === 0;
  }

  function simplifyFraction(num, den) {
    if (den === 0) throw new Error("Division by zero in fraction");
    let n = Math.trunc(num);
    let d = Math.trunc(den);
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d) || 1;
    return { num: n / g, den: d / g };
  }

  function fractionToString(f) {
    if (f.den === 1) return String(f.num);
    return f.num + "/" + f.den;
  }

  function multiplyFractions(a, b) {
    return simplifyFraction(a.num * b.num, a.den * b.den);
  }

  function divideFractions(a, b) {
    if (b.num === 0) throw new Error("Division by zero in fraction");
    return simplifyFraction(a.num * b.den, a.den * b.num);
  }

  function improperToMixed(num, den) {
    const simp = simplifyFraction(num, den);
    const absNum = Math.abs(simp.num);
    const q = Math.floor(absNum / simp.den);
    const r = absNum % simp.den;
    const sign = simp.num < 0 ? -1 : 1;
    return {
      whole: sign * q,
      num: r,
      den: simp.den,
      sign: sign
    };
  }

  function mixedToImproper(whole, num, den) {
    if (den === 0) throw new Error("Division by zero in fraction");
    const w = Math.trunc(whole);
    const n = Math.abs(Math.trunc(num));
    const d = Math.abs(Math.trunc(den));
    const sign = w < 0 || num < 0 ? -1 : 1;
    const absWhole = Math.abs(w);
    const improperNum = sign * (absWhole * d + n);
    return simplifyFraction(improperNum, d);
  }

  function mixedToString(m) {
    if (!m || m.num === 0) return String(m.whole || 0);
    if (!m.whole) {
      return fractionToString({ num: (m.sign || 1) * m.num, den: m.den });
    }
    return m.whole + " " + m.num + "/" + m.den;
  }

  function nearlyEqual(a, b, eps) {
    const e = eps != null ? eps : 1e-9;
    if (typeof a === "number" && typeof b === "number") {
      return Math.abs(a - b) <= e;
    }
    return String(a) === String(b);
  }

  return {
    gcd: gcd,
    lcm: lcm,
    gcdMany: gcdMany,
    lcmMany: lcmMany,
    factorsOf: factorsOf,
    isPrime: isPrime,
    isEven: isEven,
    simplifyFraction: simplifyFraction,
    fractionToString: fractionToString,
    multiplyFractions: multiplyFractions,
    divideFractions: divideFractions,
    improperToMixed: improperToMixed,
    mixedToImproper: mixedToImproper,
    mixedToString: mixedToString,
    nearlyEqual: nearlyEqual
  };
});
