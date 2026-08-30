/**
 * Data Handling & Statistics Rule Engine (Phase 8E)
 *
 * Supported: Tally / Frequency table, Pictograph, Bar graph,
 * Mean, Median, Mode, Range.
 *
 * Rejects: Standard Deviation, Variance,
 * (Classical probability is handled by probability.js)
 * Pie Charts, Histograms, Box Plots.
 *
 * Formula text from Formula Library via FormulaCatalog IDs only.
 */
(function (root, factory) {
  "use strict";
  const Catalog =
    typeof module === "object" && module.exports
      ? require("./formula-catalog")
      : root.FormulaCatalog;
  const api = factory(Catalog);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.LocalRuleStatistics = api;
})(typeof window !== "undefined" ? window : globalThis, function (
  FormulaCatalog
) {
  "use strict";

  const IDS = Object.freeze({
    frequency: "CBSE-C6-DH-001",
    pictograph: "CBSE-C6-DH-002",
    barGraph: "CBSE-C6-DH-003",
    mean: "CBSE-C7-ST-001",
    range: "CBSE-C7-ST-002",
    median: "CBSE-C7-ST-003",
    mode: "CBSE-C7-ST-004"
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
      reason: reason || "Unsupported statistics topic"
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

  function formatNum(n) {
    if (typeof n !== "number" || !isFinite(n)) return String(n);
    if (Math.abs(n - Math.round(n)) < 1e-10) return String(Math.round(n));
    return String(parseFloat(n.toPrecision(10)));
  }

  function isUnsupportedStatistics(text) {
    const t = String(text || "").toLowerCase();
    if (
      /\bstandard\s+deviation\b/.test(t) ||
      /\bvariance\b/.test(t) ||
      /\b(quartile|percentile|z[- ]?score)\b/.test(t)
    ) {
      return "Standard deviation / variance is not supported in Phase 8E";
    }
    if (/\bpie\s*chart\b/.test(t) || /\bpie\s+graph\b/.test(t)) {
      return "Pie charts are not supported in Phase 8E";
    }
    if (/\bhistogram\b/.test(t)) {
      return "Histograms are not supported in Phase 8E";
    }
    if (/\bbox\s*plot\b/.test(t) || /\bbox\s+and\s+whisker\b/.test(t)) {
      return "Box plots are not supported in Phase 8E";
    }
    return null;
  }

  function looksLikeStatistics(text) {
    const t = String(text || "").toLowerCase();
    if (!t.trim()) return false;
    if (isUnsupportedStatistics(t)) return true;
    if (
      /\b(mean|median|mode|range|average|tally|frequency|pictograph|bar\s*graph|data\s+handling|statistics)\b/.test(
        t
      )
    ) {
      return true;
    }
    if (/\bfrequency\s+table\b/.test(t)) return true;
    if (/\bfind\s+the\s+(mean|median|mode|range|average)\b/.test(t)) return true;
    return false;
  }

  /** Extract numeric data list from question text */
  function parseDataList(text) {
    const s = String(text || "");
    // Prefer explicit "data:" / "observations:" / "scores:" blocks
    let chunk = s;
    const labeled = s.match(
      /\b(?:data|observations?|scores?|numbers?|values?)\s*(?:are|=|:)?\s*([-\d.,\s]+?)(?:\.|$|\bfind\b|\bwhat\b|\bmean\b|\bmedian\b|\bmode\b|\brange\b|\baverage\b|\bfrequency\b|\btally\b)/i
    );
    if (labeled) chunk = labeled[1];
    else {
      const afterOf = s.match(
        /\b(?:of|for)\s*[:\s]*([-\d.,\s]+?)(?:\.|$|\?)/i
      );
      if (afterOf && (s.match(/-?\d+/g) || []).length >= 2) {
        chunk = afterOf[1];
      }
    }
    const nums = String(chunk).match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 1) return null;
    return nums.map(Number);
  }

  function frequencyMap(data) {
    const map = Object.create(null);
    data.forEach(function (x) {
      const k = String(x);
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }

  function tallyFor(count) {
    const groups = Math.floor(count / 5);
    const rem = count % 5;
    let out = [];
    for (let i = 0; i < groups; i++) out.push("||||/");
    if (rem) out.push("|".repeat(rem));
    return out.join(" ") || "—";
  }

  function sortedUniqueKeys(map) {
    return Object.keys(map).sort(function (a, b) {
      return Number(a) - Number(b);
    });
  }

  function solveMean(data) {
    const n = data.length;
    const sum = data.reduce(function (a, b) {
      return a + b;
    }, 0);
    const mean = sum / n;
    const sumExpr = data.map(formatNum).join("+");
    const id = IDS.mean;
    return result({
      operationKey: "statistics_mean",
      given: "Data: " + data.map(formatNum).join(", "),
      find: "Mean",
      steps: [
        step(1, "Data", "Observations: " + data.map(formatNum).join(", ")),
        formulaStep(2, id),
        step(
          3,
          "Substitute",
          "Mean = (" + sumExpr + ") / " + n
        ),
        step(
          4,
          "Calculate",
          "Mean = " + formatNum(sum) + " / " + n + " = " + formatNum(mean)
        )
      ],
      finalAnswer: formatNum(mean)
    });
  }

  function solveMedian(data) {
    const sorted = data.slice().sort(function (a, b) {
      return a - b;
    });
    const n = sorted.length;
    let median;
    const steps = [
      step(1, "Data", "Observations: " + data.map(formatNum).join(", ")),
      step(
        2,
        "Arrange",
        "Ascending order: " + sorted.map(formatNum).join(", ")
      ),
      formulaStep(3, IDS.median)
    ];
    if (n % 2 === 1) {
      const mid = Math.floor(n / 2);
      median = sorted[mid];
      steps.push(
        step(
          4,
          "Middle value",
          "n = " +
            n +
            " (odd). Median is the middle observation (position " +
            (mid + 1) +
            ") = " +
            formatNum(median)
        )
      );
    } else {
      const i = n / 2 - 1;
      const j = n / 2;
      median = (sorted[i] + sorted[j]) / 2;
      steps.push(
        step(
          4,
          "Two middle values",
          "n = " +
            n +
            " (even). Median = (" +
            formatNum(sorted[i]) +
            " + " +
            formatNum(sorted[j]) +
            ") / 2 = " +
            formatNum(median)
        )
      );
    }
    return result({
      operationKey: "statistics_median",
      given: "Data: " + data.map(formatNum).join(", "),
      find: "Median",
      steps: steps,
      finalAnswer: formatNum(median)
    });
  }

  function solveMode(data) {
    const map = frequencyMap(data);
    let maxF = 0;
    Object.keys(map).forEach(function (k) {
      if (map[k] > maxF) maxF = map[k];
    });
    const modes = sortedUniqueKeys(map).filter(function (k) {
      return map[k] === maxF;
    });
    const allSame = modes.length === Object.keys(map).length && maxF === 1;
    const id = IDS.mode;
    const steps = [
      step(1, "Data", "Observations: " + data.map(formatNum).join(", ")),
      formulaStep(2, id),
      step(
        3,
        "Frequencies",
        sortedUniqueKeys(map)
          .map(function (k) {
            return k + " → " + map[k];
          })
          .join("; ")
      )
    ];
    let answer;
    if (allSame) {
      answer = "No mode";
      steps.push(
        step(4, "Conclusion", "Each value appears once — there is no mode.")
      );
    } else if (modes.length === 1) {
      answer = modes[0];
      steps.push(
        step(
          4,
          "Conclusion",
          "Mode = " + modes[0] + " (frequency " + maxF + ")"
        )
      );
    } else {
      answer = modes.join(", ");
      steps.push(
        step(
          4,
          "Conclusion",
          "Modes = " + answer + " (each with frequency " + maxF + ")"
        )
      );
    }
    return result({
      operationKey: "statistics_mode",
      given: "Data: " + data.map(formatNum).join(", "),
      find: "Mode",
      steps: steps,
      finalAnswer: answer
    });
  }

  function solveRange(data) {
    const hi = Math.max.apply(null, data);
    const lo = Math.min.apply(null, data);
    const range = hi - lo;
    return result({
      operationKey: "statistics_range",
      given: "Data: " + data.map(formatNum).join(", "),
      find: "Range",
      steps: [
        step(1, "Data", "Observations: " + data.map(formatNum).join(", ")),
        formulaStep(2, IDS.range),
        step(
          3,
          "Identify",
          "Highest = " + formatNum(hi) + ", Lowest = " + formatNum(lo)
        ),
        step(
          4,
          "Calculate",
          "Range = " +
            formatNum(hi) +
            " − " +
            formatNum(lo) +
            " = " +
            formatNum(range)
        )
      ],
      finalAnswer: formatNum(range)
    });
  }

  function solveFrequencyTable(data) {
    const map = frequencyMap(data);
    const keys = sortedUniqueKeys(map);
    const rows = keys.map(function (k) {
      return k + " → " + map[k] + "  (tally: " + tallyFor(map[k]) + ")";
    });
    const tableText = keys
      .map(function (k) {
        return k + ": " + map[k];
      })
      .join("; ");
    return result({
      operationKey: "statistics_frequency_table",
      given: "Data: " + data.map(formatNum).join(", "),
      find: "Frequency table",
      steps: [
        step(1, "Data", "Observations: " + data.map(formatNum).join(", ")),
        formulaStep(2, IDS.frequency),
        step(3, "Tally & count", rows.join("; ")),
        step(4, "Frequency table", tableText)
      ],
      finalAnswer: tableText
    });
  }

  function solveSingleFrequency(text, data) {
    const m = String(text).match(
      /\bfrequency\s+of\s+(-?\d+(?:\.\d+)?|[A-Za-z])\b/i
    );
    if (!m || !data) return null;
    const target = m[1];
    // numeric target in numeric data
    if (/^-?\d/.test(target)) {
      const tNum = Number(target);
      const count = data.filter(function (x) {
        return x === tNum;
      }).length;
      return result({
        operationKey: "statistics_frequency",
        given: "Data: " + data.map(formatNum).join(", "),
        find: "Frequency of " + target,
        steps: [
          step(1, "Data", "Observations: " + data.map(formatNum).join(", ")),
          formulaStep(2, IDS.frequency),
          step(
            3,
            "Count",
            "Value " + target + " appears " + count + " time(s)."
          )
        ],
        finalAnswer: formatNum(count)
      });
    }
    return null;
  }

  function parseScale(text) {
    const t = String(text || "");
    const m =
      t.match(
        /1\s*(?:symbol|icon|picture|unit|bar\s*unit)?\s*=\s*(\d+(?:\.\d+)?)/i
      ) ||
      t.match(
        /(?:scale|key)\s*[:=]?\s*1\s*(?:symbol|icon|picture|unit)?\s*=\s*(\d+(?:\.\d+)?)/i
      ) ||
      t.match(
        /(?:each|one)\s+(?:symbol|icon|picture|unit)\s*(?:represents?|=|stands\s+for)\s*(\d+(?:\.\d+)?)/i
      );
    return m ? Number(m[1]) : null;
  }

  function parseSymbolCount(text) {
    // Strip scale clause "1 symbol = N" so it is not counted as symbol count
    const t = String(text || "").replace(
      /1\s*(?:symbol|icon|picture|unit)\s*=\s*\d+(?:\.\d+)?/gi,
      " "
    );
    const m =
      t.match(/\b(?:there\s+are|has)\s+(\d+(?:\.\d+)?)\s*(?:symbols?|icons?|pictures?)/i) ||
      t.match(/\b(?:symbols?|icons?|pictures?)\s*=\s*(\d+(?:\.\d+)?)/i) ||
      t.match(/(\d+(?:\.\d+)?)\s*(?:symbols?|icons?|pictures?)\b/i);
    return m ? Number(m[1]) : null;
  }

  function parseBarHeight(text) {
    const t = String(text || "");
    const m =
      t.match(
        /\b(?:height|bar(?:\s+height)?|height\s+of\s+(?:the\s+)?bar)\s*(?:is|=|:|of)?\s*(\d+(?:\.\d+)?)\s*(?:units?)?/i
      ) ||
      t.match(/\b(\d+(?:\.\d+)?)\s*units?\s*(?:high|tall|height)?/i) ||
      t.match(/\bbar\s+(?:for\s+\w+\s+)?(?:is|=)\s*(\d+(?:\.\d+)?)/i);
    return m ? Number(m[1]) : null;
  }

  function solvePictograph(text) {
    const scale = parseScale(text);
    const n = parseSymbolCount(text);
    if (scale == null || n == null) {
      return unsupported("Pictograph needs scale and number of symbols");
    }
    const value = n * scale;
    return result({
      operationKey: "statistics_pictograph",
      given: "Scale: 1 symbol = " + formatNum(scale) + "; Symbols = " + formatNum(n),
      find: "Actual value from pictograph",
      steps: [
        step(
          1,
          "Read scale",
          "1 symbol represents " + formatNum(scale) + " items."
        ),
        step(2, "Count symbols", "Number of symbols = " + formatNum(n)),
        formulaStep(3, IDS.pictograph),
        step(
          4,
          "Calculate",
          "Value = " +
            formatNum(n) +
            " × " +
            formatNum(scale) +
            " = " +
            formatNum(value)
        )
      ],
      finalAnswer: formatNum(value)
    });
  }

  function solveBarGraph(text) {
    const scale = parseScale(text);
    const height = parseBarHeight(text);
    if (height == null) {
      return unsupported("Bar graph needs the bar height (in units)");
    }
    const s = scale != null ? scale : 1;
    const value = height * s;
    const steps = [
      step(
        1,
        "Read bar",
        "Height of the bar = " + formatNum(height) + " unit(s)."
      )
    ];
    if (scale != null) {
      steps.push(
        step(2, "Read scale", "1 unit = " + formatNum(scale) + ".")
      );
      steps.push(formulaStep(3, IDS.barGraph));
      steps.push(
        step(
          4,
          "Calculate",
          "Value = " +
            formatNum(height) +
            " × " +
            formatNum(scale) +
            " = " +
            formatNum(value)
        )
      );
    } else {
      steps.push(formulaStep(2, IDS.barGraph));
      steps.push(
        step(
          3,
          "Interpret",
          "With unit scale 1, value = height = " + formatNum(value)
        )
      );
    }
    return result({
      operationKey: "statistics_bar_graph",
      given:
        "Bar height = " +
        formatNum(height) +
        (scale != null ? "; Scale: 1 unit = " + formatNum(scale) : ""),
      find: "Value from bar graph",
      steps: steps,
      finalAnswer: formatNum(value)
    });
  }

  function detectOp(text) {
    const t = String(text || "").toLowerCase();
    if (/\bpictograph\b/.test(t) || (/\bsymbol\b/.test(t) && /\bscale\b|\bicon\b/.test(t))) {
      return "pictograph";
    }
    if (/\bbar\s*graph\b/.test(t) || /\bbar\s+for\b/.test(t)) return "bar_graph";
    if (/\bfrequency\s+table\b/.test(t) || /\btally\b/.test(t)) {
      return "frequency_table";
    }
    if (/\bfrequency\s+of\b/.test(t)) return "frequency";
    if (/\bmean\b/.test(t) || /\baverage\b/.test(t)) return "mean";
    if (/\bmedian\b/.test(t)) return "median";
    if (/\bmode\b/.test(t)) return "mode";
    if (/\brange\b/.test(t)) return "range";
    return null;
  }

  function trySolve(rawText) {
    const text = String(rawText || "").replace(/\s+/g, " ").trim();
    if (!text) return null;

    const bad = isUnsupportedStatistics(text);
    if (bad) return unsupported(bad);
    if (!looksLikeStatistics(text)) return null;

    const op = detectOp(text);
    if (!op) {
      return unsupported("Supported statistics operation not recognised");
    }

    if (op === "pictograph") return solvePictograph(text);
    if (op === "bar_graph") return solveBarGraph(text);

    const data = parseDataList(text);
    if (op === "frequency") {
      const freq = solveSingleFrequency(text, data);
      if (freq) return freq;
      return unsupported("Could not determine frequency target");
    }
    if (!data || data.length < 1) {
      return unsupported("Could not read data values");
    }
    if (op === "frequency_table") return solveFrequencyTable(data);
    if (op === "mean") {
      if (data.length < 1) return unsupported("Need at least one observation");
      return solveMean(data);
    }
    if (op === "median") {
      if (data.length < 1) return unsupported("Need at least one observation");
      return solveMedian(data);
    }
    if (op === "mode") {
      if (data.length < 1) return unsupported("Need at least one observation");
      return solveMode(data);
    }
    if (op === "range") {
      if (data.length < 2) {
        return unsupported("Range needs at least two observations");
      }
      return solveRange(data);
    }

    return unsupported("Unsupported statistics question");
  }

  return {
    trySolve: trySolve,
    looksLikeStatistics: looksLikeStatistics,
    isUnsupportedStatistics: isUnsupportedStatistics,
    IDS: IDS
  };
});
