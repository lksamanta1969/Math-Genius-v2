/**
 * Mensuration Rule Engine (Phase 8D)
 *
 * Supported (Class 6/7 plane figures):
 *   Square, Rectangle, Triangle, Circle
 *   — perimeter / area / circumference
 *
 * Rejects: Volume, Surface Area, Cylinder, Cone, Sphere,
 * Composite figures, 3D Geometry, Parallelogram (not in 8D scope).
 *
 * Formula text comes from Formula Library via FormulaCatalog IDs only.
 * Units: mm, cm, m, km — convert only when explicitly asked.
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
  root.LocalRuleMensuration = api;
})(typeof window !== "undefined" ? window : globalThis, function (
  FormulaCatalog
) {
  "use strict";

  const PI_22_7 = 22 / 7;
  const PI_3_14 = 3.14;

  const IDS = Object.freeze({
    rectPerimeter: "CBSE-C6-ME-001",
    squarePerimeter: "CBSE-C6-ME-002",
    trianglePerimeter: "CBSE-C6-ME-003",
    rectArea: "CBSE-C6-ME-004",
    squareArea: "CBSE-C6-ME-005",
    triangleArea: "CBSE-C6-ME-006",
    circleCircumference: "CBSE-C7-ME-002",
    circleArea: "CBSE-C7-ME-003"
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
      reason: reason || "Unsupported mensuration topic"
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
      f
        ? f + "  [" + id + "]"
        : "Apply Formula Library entry " + id
    );
  }

  function formatNum(n) {
    if (typeof n !== "number" || !isFinite(n)) return String(n);
    if (Math.abs(n - Math.round(n)) < 1e-10) return String(Math.round(n));
    const s = parseFloat(n.toPrecision(10));
    return String(s);
  }

  function isUnsupportedMensuration(text) {
    const t = String(text || "").toLowerCase();
    if (
      /\b(volume|capacity)\b/.test(t) ||
      /\bsurface\s+area\b/.test(t) ||
      /\b(cylinder|cone|sphere|cuboid|cube|hemisphere|prism|pyramid)\b/.test(t) ||
      /\b3\s*-?\s*d\b|\bthree[- ]dimensional\b/.test(t)
    ) {
      return "3D / volume mensuration is not supported in Phase 8D";
    }
    if (
      /\bcomposite\b/.test(t) ||
      /\b(L[- ]?shaped|combination\s+of\s+figures|combined\s+figure)\b/.test(t)
    ) {
      return "Composite figures are not supported in Phase 8D";
    }
    if (/\bparallelogram\b/.test(t) || /\brhombus\b/.test(t) || /\btrapez\w*\b/.test(t)) {
      return "This plane figure is not supported in Phase 8D";
    }
    return null;
  }

  function looksLikeMensuration(text) {
    const t = String(text || "").toLowerCase();
    if (!t.trim()) return false;
    if (isUnsupportedMensuration(t)) return true;
    if (/\bmensuration\b/.test(t)) return true;
    if (
      /\b(perimeter|area|circumference)\b/.test(t) &&
      /\b(square|rectangle|triangle|circle)\b/.test(t)
    ) {
      return true;
    }
    if (
      /\b(square|rectangle|triangle|circle)\b/.test(t) &&
      /\b(side|length|breadth|width|base|height|radius|diameter)\b/.test(t) &&
      /\b(find|calculate|compute|what|area|perimeter|circumference)\b/.test(t)
    ) {
      return true;
    }
    // "area of a square of side 6 cm"
    if (
      /\b(area|perimeter|circumference)\s+of\b/.test(t) &&
      /\b(square|rectangle|triangle|circle)\b/.test(t)
    ) {
      return true;
    }
    return false;
  }

  function parseUnit(token) {
    const m = String(token || "")
      .trim()
      .toLowerCase()
      .match(/^(mm|cm|m|km)$/);
    return m ? m[1] : null;
  }

  function extractUnit(text) {
    const m = String(text || "").match(/\b(\d+(?:\.\d+)?)\s*(mm|cm|m|km)\b/i);
    return m ? m[2].toLowerCase() : null;
  }

  function wantsConversion(text) {
    const t = String(text || "").toLowerCase();
    if (!/\bconvert\b/.test(t) && !/\bin\s+(mm|cm|m|km)\b/.test(t)) {
      return null;
    }
    const m = t.match(/\b(?:convert(?:\s+to)?|in|to)\s+(mm|cm|m|km)\b/);
    return m ? m[1] : null;
  }

  const UNIT_TO_MM = { mm: 1, cm: 10, m: 1000, km: 1000000 };

  function convertLength(value, fromUnit, toUnit) {
    if (!fromUnit || !toUnit || fromUnit === toUnit) return value;
    const mm = value * UNIT_TO_MM[fromUnit];
    return mm / UNIT_TO_MM[toUnit];
  }

  function areaUnit(u) {
    return u ? u + "²" : "";
  }

  function withUnit(value, unit) {
    if (!unit) return formatNum(value);
    return formatNum(value) + " " + unit;
  }

  function pickPi(text, radius) {
    const t = String(text || "").toLowerCase();
    if (/22\s*\/\s*7|22⁄7/.test(t)) return { value: PI_22_7, label: "22/7" };
    if (/3\.14\b/.test(t) || /π\s*=\s*3\.14/.test(t)) {
      return { value: PI_3_14, label: "3.14" };
    }
    // Prefer 22/7 when radius (or diameter/2) works cleanly with sevenths
    if (radius != null && Math.abs((radius * 2) % 7) < 1e-9) {
      return { value: PI_22_7, label: "22/7" };
    }
    if (radius != null && Math.abs(radius % 7) < 1e-9) {
      return { value: PI_22_7, label: "22/7" };
    }
    return { value: PI_22_7, label: "22/7" };
  }

  function numAfter(text, labels) {
    const t = String(text || "");
    for (let i = 0; i < labels.length; i++) {
      const lab = labels[i];
      const re = new RegExp(
        "\\b" +
          lab +
          "\\b\\s*(?:=|is|:|of)?\\s*(\\d+(?:\\.\\d+)?)\\s*(mm|cm|m|km)?",
        "i"
      );
      const m = t.match(re);
      if (m) {
        return { value: Number(m[1]), unit: m[2] ? m[2].toLowerCase() : null };
      }
    }
    return null;
  }

  function allNumbersWithUnits(text) {
    const out = [];
    const re = /(\d+(?:\.\d+)?)\s*(mm|cm|m|km)?/gi;
    let m;
    while ((m = re.exec(String(text || ""))) !== null) {
      out.push({
        value: Number(m[1]),
        unit: m[2] ? m[2].toLowerCase() : null
      });
    }
    return out;
  }

  function resolveUnit(parts, fallbackText) {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] && parts[i].unit) return parts[i].unit;
    }
    return extractUnit(fallbackText);
  }

  function maybeConvertAnswer(text, value, unit, isArea) {
    const to = wantsConversion(text);
    if (!to || !unit) {
      return { value: value, unit: isArea ? areaUnit(unit) : unit || "" };
    }
    if (isArea) {
      // Convert side unit then square factor
      const factor = convertLength(1, unit, to);
      const converted = value * factor * factor;
      return { value: converted, unit: areaUnit(to) };
    }
    return {
      value: convertLength(value, unit, to),
      unit: to
    };
  }

  function solveSquare(text, want) {
    const side =
      numAfter(text, ["side", "a"]) ||
      (function () {
        const nums = allNumbersWithUnits(text);
        return nums.length === 1 ? nums[0] : null;
      })();
    if (!side) return unsupported("Could not read the side of the square");

    const unit = resolveUnit([side], text);
    const a = side.value;
    const id = want === "area" ? IDS.squareArea : IDS.squarePerimeter;
    const key =
      want === "area" ? "mensuration_square_area" : "mensuration_square_perimeter";

    if (want === "area") {
      const raw = a * a;
      const ans = maybeConvertAnswer(text, raw, unit, true);
      const steps = [
        step(1, "Given", "Side of square = " + withUnit(a, unit)),
        formulaStep(2, id),
        step(3, "Substitute", "Area = " + formatNum(a) + " × " + formatNum(a)),
        step(4, "Calculate", "Area = " + withUnit(ans.value, ans.unit))
      ];
      return result({
        operationKey: key,
        given: "Side = " + withUnit(a, unit),
        find: "Area of the square",
        steps: steps,
        finalAnswer: withUnit(ans.value, ans.unit),
        verifyFn: function () {
          return withUnit(ans.value, ans.unit);
        }
      });
    }

    const raw = 4 * a;
    const ans = maybeConvertAnswer(text, raw, unit, false);
    const steps = [
      step(1, "Given", "Side of square = " + withUnit(a, unit)),
      formulaStep(2, id),
      step(3, "Substitute", "Perimeter = 4 × " + formatNum(a)),
      step(4, "Calculate", "Perimeter = " + withUnit(ans.value, ans.unit))
    ];
    return result({
      operationKey: key,
      given: "Side = " + withUnit(a, unit),
      find: "Perimeter of the square",
      steps: steps,
      finalAnswer: withUnit(ans.value, ans.unit)
    });
  }

  function solveRectangle(text, want) {
    let length = numAfter(text, ["length", "l"]);
    let breadth = numAfter(text, ["breadth", "width", "b", "w"]);
    if (!length || !breadth) {
      const m = String(text).match(
        /(\d+(?:\.\d+)?)\s*(mm|cm|m|km)?\s*(?:by|×|x|\*)\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|km)?/i
      );
      if (m) {
        length = { value: Number(m[1]), unit: m[2] ? m[2].toLowerCase() : null };
        breadth = {
          value: Number(m[3]),
          unit: m[4] ? m[4].toLowerCase() : null
        };
      }
    }
    if (!length || !breadth) {
      return unsupported("Could not read length and breadth of the rectangle");
    }

    const unit = resolveUnit([length, breadth], text);
    const l = length.value;
    const b = breadth.value;
    const id = want === "area" ? IDS.rectArea : IDS.rectPerimeter;
    const key =
      want === "area"
        ? "mensuration_rectangle_area"
        : "mensuration_rectangle_perimeter";

    if (want === "area") {
      const raw = l * b;
      const ans = maybeConvertAnswer(text, raw, unit, true);
      return result({
        operationKey: key,
        given:
          "Length = " +
          withUnit(l, length.unit || unit) +
          ", Breadth = " +
          withUnit(b, breadth.unit || unit),
        find: "Area of the rectangle",
        steps: [
          step(
            1,
            "Given",
            "Length = " +
              withUnit(l, length.unit || unit) +
              "; Breadth = " +
              withUnit(b, breadth.unit || unit)
          ),
          formulaStep(2, id),
          step(
            3,
            "Substitute",
            "Area = " + formatNum(l) + " × " + formatNum(b)
          ),
          step(4, "Calculate", "Area = " + withUnit(ans.value, ans.unit))
        ],
        finalAnswer: withUnit(ans.value, ans.unit)
      });
    }

    const raw = 2 * (l + b);
    const ans = maybeConvertAnswer(text, raw, unit, false);
    return result({
      operationKey: key,
      given:
        "Length = " +
        withUnit(l, length.unit || unit) +
        ", Breadth = " +
        withUnit(b, breadth.unit || unit),
      find: "Perimeter of the rectangle",
      steps: [
        step(
          1,
          "Given",
          "Length = " +
            withUnit(l, length.unit || unit) +
            "; Breadth = " +
            withUnit(b, breadth.unit || unit)
        ),
        formulaStep(2, id),
        step(
          3,
          "Substitute",
          "Perimeter = 2(" + formatNum(l) + " + " + formatNum(b) + ")"
        ),
        step(
          4,
          "Calculate",
          "Perimeter = 2 × " +
            formatNum(l + b) +
            " = " +
            withUnit(ans.value, ans.unit)
        )
      ],
      finalAnswer: withUnit(ans.value, ans.unit)
    });
  }

  function solveTriangle(text, want) {
    if (want === "area") {
      const base = numAfter(text, ["base", "b"]);
      const height = numAfter(text, ["height", "h", "altitude"]);
      if (!base || !height) {
        return unsupported(
          "Triangle area needs base and height (Phase 8D)"
        );
      }
      const unit = resolveUnit([base, height], text);
      const raw = 0.5 * base.value * height.value;
      const ans = maybeConvertAnswer(text, raw, unit, true);
      const id = IDS.triangleArea;
      return result({
        operationKey: "mensuration_triangle_area",
        given:
          "Base = " +
          withUnit(base.value, base.unit || unit) +
          ", Height = " +
          withUnit(height.value, height.unit || unit),
        find: "Area of the triangle",
        steps: [
          step(
            1,
            "Given",
            "Base = " +
              withUnit(base.value, base.unit || unit) +
              "; Height = " +
              withUnit(height.value, height.unit || unit)
          ),
          formulaStep(2, id),
          step(
            3,
            "Substitute",
            "Area = ½ × " +
              formatNum(base.value) +
              " × " +
              formatNum(height.value)
          ),
          step(4, "Calculate", "Area = " + withUnit(ans.value, ans.unit))
        ],
        finalAnswer: withUnit(ans.value, ans.unit)
      });
    }

    // Perimeter: three sides
    const sidesMatch = String(text).match(
      /sides?\s*(?:are|=|:)?\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|km)?\s*,\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|km)?\s*(?:,|and)\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|km)?/i
    );
    let a = null;
    let b = null;
    let c = null;
    if (sidesMatch) {
      a = {
        value: Number(sidesMatch[1]),
        unit: sidesMatch[2] ? sidesMatch[2].toLowerCase() : null
      };
      b = {
        value: Number(sidesMatch[3]),
        unit: sidesMatch[4] ? sidesMatch[4].toLowerCase() : null
      };
      c = {
        value: Number(sidesMatch[5]),
        unit: sidesMatch[6] ? sidesMatch[6].toLowerCase() : null
      };
    } else {
      const nums = allNumbersWithUnits(text);
      if (nums.length >= 3) {
        a = nums[0];
        b = nums[1];
        c = nums[2];
      }
    }
    if (!a || !b || !c) {
      return unsupported("Could not read three sides of the triangle");
    }
    const unit = resolveUnit([a, b, c], text);
    const raw = a.value + b.value + c.value;
    const ans = maybeConvertAnswer(text, raw, unit, false);
    const id = IDS.trianglePerimeter;
    return result({
      operationKey: "mensuration_triangle_perimeter",
      given:
        "Sides = " +
        withUnit(a.value, a.unit || unit) +
        ", " +
        withUnit(b.value, b.unit || unit) +
        ", " +
        withUnit(c.value, c.unit || unit),
      find: "Perimeter of the triangle",
      steps: [
        step(
          1,
          "Given",
          "Sides = " +
            formatNum(a.value) +
            ", " +
            formatNum(b.value) +
            ", " +
            formatNum(c.value) +
            (unit ? " " + unit : "")
        ),
        formulaStep(2, id),
        step(
          3,
          "Substitute",
          "Perimeter = " +
            formatNum(a.value) +
            " + " +
            formatNum(b.value) +
            " + " +
            formatNum(c.value)
        ),
        step(4, "Calculate", "Perimeter = " + withUnit(ans.value, ans.unit))
      ],
      finalAnswer: withUnit(ans.value, ans.unit)
    });
  }

  function solveCircle(text, want) {
    let radius = numAfter(text, ["radius", "r"]);
    const diameter = numAfter(text, ["diameter", "d"]);
    if (!radius && diameter) {
      radius = { value: diameter.value / 2, unit: diameter.unit };
    }
    if (!radius) {
      const nums = allNumbersWithUnits(text);
      if (nums.length === 1) radius = nums[0];
    }
    if (!radius) return unsupported("Could not read radius/diameter of the circle");

    const unit = resolveUnit([radius, diameter], text);
    const r = radius.value;
    const pi = pickPi(text, r);

    if (want === "area") {
      const raw = pi.value * r * r;
      const ans = maybeConvertAnswer(text, raw, unit, true);
      const id = IDS.circleArea;
      return result({
        operationKey: "mensuration_circle_area",
        given: "Radius = " + withUnit(r, unit) + ", π = " + pi.label,
        find: "Area of the circle",
        steps: [
          step(
            1,
            "Given",
            "Radius = " +
              withUnit(r, unit) +
              (diameter
                ? " (from diameter " + withUnit(diameter.value, diameter.unit || unit) + ")"
                : "")
          ),
          step(2, "π value", "Take π = " + pi.label),
          formulaStep(3, id),
          step(
            4,
            "Substitute",
            "Area = " + pi.label + " × " + formatNum(r) + "²"
          ),
          step(5, "Calculate", "Area = " + withUnit(ans.value, ans.unit))
        ],
        finalAnswer: withUnit(ans.value, ans.unit)
      });
    }

    // circumference
    const raw = 2 * pi.value * r;
    const ans = maybeConvertAnswer(text, raw, unit, false);
    const id = IDS.circleCircumference;
    return result({
      operationKey: "mensuration_circle_circumference",
      given: "Radius = " + withUnit(r, unit) + ", π = " + pi.label,
      find: "Circumference of the circle",
      steps: [
        step(1, "Given", "Radius = " + withUnit(r, unit)),
        step(2, "π value", "Take π = " + pi.label),
        formulaStep(3, id),
        step(
          4,
          "Substitute",
          "Circumference = 2 × " + pi.label + " × " + formatNum(r)
        ),
        step(
          5,
          "Calculate",
          "Circumference = " + withUnit(ans.value, ans.unit)
        )
      ],
      finalAnswer: withUnit(ans.value, ans.unit)
    });
  }

  function detectWant(text) {
    const t = String(text || "").toLowerCase();
    if (/\bcircumference\b/.test(t) || /\bperimeter\s+of\s+(a\s+)?circle\b/.test(t)) {
      return "circumference";
    }
    if (/\bperimeter\b/.test(t)) return "perimeter";
    if (/\barea\b/.test(t)) return "area";
    return null;
  }

  function detectShape(text) {
    const t = String(text || "").toLowerCase();
    if (/\bsquare\b/.test(t)) return "square";
    if (/\brectangle\b/.test(t)) return "rectangle";
    if (/\btriangle\b/.test(t)) return "triangle";
    if (/\bcircle\b/.test(t)) return "circle";
    return null;
  }

  function trySolve(rawText) {
    const text = String(rawText || "").replace(/\s+/g, " ").trim();
    if (!text) return null;

    const bad = isUnsupportedMensuration(text);
    if (bad) return unsupported(bad);

    if (!looksLikeMensuration(text)) return null;

    const shape = detectShape(text);
    let want = detectWant(text);
    if (!shape) {
      return unsupported("Supported shape not recognised (square/rectangle/triangle/circle)");
    }
    if (!want) {
      // default: area if "area" missing but "find" with dimensions — still require explicit
      return unsupported("Specify area, perimeter, or circumference");
    }

    if (shape === "square") {
      if (want === "circumference") {
        return unsupported("Squares use perimeter, not circumference");
      }
      return solveSquare(text, want === "perimeter" ? "perimeter" : "area");
    }
    if (shape === "rectangle") {
      if (want === "circumference") {
        return unsupported("Rectangles use perimeter, not circumference");
      }
      return solveRectangle(text, want === "perimeter" ? "perimeter" : "area");
    }
    if (shape === "triangle") {
      if (want === "circumference") {
        return unsupported("Triangles use perimeter, not circumference");
      }
      return solveTriangle(text, want === "perimeter" ? "perimeter" : "area");
    }
    if (shape === "circle") {
      if (want === "perimeter") want = "circumference";
      return solveCircle(text, want === "area" ? "area" : "circumference");
    }

    return unsupported("Unsupported mensuration question");
  }

  return {
    trySolve: trySolve,
    looksLikeMensuration: looksLikeMensuration,
    isUnsupportedMensuration: isUnsupportedMensuration,
    IDS: IDS
  };
});
