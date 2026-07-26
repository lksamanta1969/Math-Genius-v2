/**
 * Geometry Rule Engine (Phase 8C)
 *
 * Supported: Point, Line, Ray, Line Segment, Parallel / Intersecting Lines,
 * Angle types (acute/right/obtuse/straight/reflex/complete), Triangle basics.
 *
 * Rejects: Coordinate Geometry, Congruence Proofs, Transformations,
 * Circle Theorems. (Plane mensuration is handled by Phase 8D.)
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.LocalRuleGeometry = api;
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
    return { unsupported: true, reason: reason || "Unsupported geometry topic" };
  }

  /** Topics explicitly out of Phase 8C geometry scope */
  function isUnsupportedGeometry(text) {
    const t = String(text || "").toLowerCase();
    if (
      /\b(coordinate|cartesian|ordered\s+pair|x[- ]?axis|y[- ]?axis|quadrant)\b/.test(
        t
      ) ||
      /\bplot\s+(the\s+)?point\b/.test(t) ||
      /\b\(-?\d+\s*,\s*-?\d+\)\b/.test(t)
    ) {
      return "Coordinate Geometry is not supported in Phase 8C";
    }
    if (
      /\bcongruen(t|ce)\b/.test(t) ||
      /\bprove\s+.*\b(triangle|congruent)\b/.test(t) ||
      /\bSAS\b|\bASA\b|\bSSS\b|\bRHS\b|\bAAS\b/.test(text)
    ) {
      return "Congruence proofs are not supported in Phase 8C";
    }
    if (
      /\b(translation|rotation|reflection|transformation|enlargement|dilation)\b/.test(
        t
      )
    ) {
      return "Transformations are not supported in Phase 8C";
    }
    if (
      /\b(circle\s+theorem|tangent\s+at|chord|circumference\s+theorem|central\s+angle\s+theorem|inscribed\s+angle)\b/.test(
        t
      ) ||
      /\btheorem\b.*\bcircle\b|\bcircle\b.*\btheorem\b/.test(t)
    ) {
      return "Circle theorems are not supported in Phase 8C";
    }
    return null;
  }

  function looksLikeGeometry(text) {
    const t = String(text || "").toLowerCase();
    if (!t.trim()) return false;
    if (isUnsupportedGeometry(t)) return true; // so classify can reject
    if (
      /\b(point|lines?|line\s+segment|ray|parallel|intersecting|acute|obtuse|reflex|straight\s+angle|right\s+angle|complete\s+angle|triangles?|geometry|angles?)\b/.test(
        t
      )
    ) {
      return true;
    }
    if (/\bnever\s+meet\b|\bdo\s+not\s+meet\b/.test(t)) return true;
    if (
      /\b\d+\s*(?:°|degrees?|deg)\b/.test(t) ||
      /\b\d+\s*\u00b0/.test(t)
    ) {
      if (/\b(classif\w*|type|kind|what|measure|angle)\b/.test(t)) return true;
      // Bare "classify 90°" style — classif may be the only cue
      if (/\bclassif\w*\b/.test(t)) return true;
    }
    if (/\b\d+\s*(?:°|degrees?|deg|\u00b0)/.test(t) && /\bclassif\w*\b/.test(t)) {
      return true;
    }
    if (/\btriangle\b/.test(t) && /\d/.test(t)) return true;
    if (/\bangles?\b/.test(t) && /\d/.test(t)) return true;
    return false;
  }

  function extractDegree(text) {
    const s = String(text || "");
    // Only treat a number as an angle measure when a degree unit is present
    const m = s.match(/(-?\d+(?:\.\d+)?)\s*(?:°|\u00b0|degrees?|deg)\b/i);
    if (m) return Number(m[1]);
    const mDeg = s.match(/(-?\d+(?:\.\d+)?)\s*(?:°|\u00b0)/);
    if (mDeg) return Number(mDeg[1]);
    // "angle of 90" / "angle 90" without symbol — not when talking about triangle sides
    if (/\btriangle\b|\bsides?\b/i.test(s)) return null;
    const m2 = s.match(
      /\bangles?\s*(?:of|measure|=|:)?\s*(-?\d+(?:\.\d+)?)\b/i
    );
    if (m2) return Number(m2[1]);
    return null;
  }

  function classifyAngleMeasure(deg) {
    if (typeof deg !== "number" || !isFinite(deg)) return null;
    if (deg < 0 || deg > 360) return null;
    if (deg === 0) return null;
    if (deg > 0 && deg < 90) {
      return {
        name: "Acute angle",
        operationKey: "geometry_angle_acute",
        range: "0° < angle < 90°"
      };
    }
    if (deg === 90) {
      return {
        name: "Right angle",
        operationKey: "geometry_angle_right",
        range: "angle = 90°"
      };
    }
    if (deg > 90 && deg < 180) {
      return {
        name: "Obtuse angle",
        operationKey: "geometry_angle_obtuse",
        range: "90° < angle < 180°"
      };
    }
    if (deg === 180) {
      return {
        name: "Straight angle",
        operationKey: "geometry_angle_straight",
        range: "angle = 180°"
      };
    }
    if (deg > 180 && deg < 360) {
      return {
        name: "Reflex angle",
        operationKey: "geometry_angle_reflex",
        range: "180° < angle < 360°"
      };
    }
    if (deg === 360) {
      return {
        name: "Complete angle",
        operationKey: "geometry_angle_complete",
        range: "angle = 360°"
      };
    }
    return null;
  }

  function solveAngleClassify(raw) {
    const deg = extractDegree(raw);
    if (deg == null) {
      return unsupported("Could not read an angle measure in degrees");
    }
    const cls = classifyAngleMeasure(deg);
    if (!cls) {
      return unsupported("Angle measure out of range for basic classification");
    }
    const steps = [
      step(1, "Read measure", "The given angle measures " + deg + "°."),
      step(
        2,
        "Compare with angle types",
        "Acute: 0°–90° (exclusive). Right: 90°. Obtuse: 90°–180°. Straight: 180°. Reflex: 180°–360°. Complete: 360°."
      ),
      step(
        3,
        "Match range",
        deg + "° satisfies " + cls.range + ", so it is a " + cls.name.toLowerCase() + "."
      )
    ];
    return result({
      operationKey: cls.operationKey,
      given: "Angle = " + deg + "°",
      find: "Type of angle",
      steps: steps,
      finalAnswer: cls.name
    });
  }

  function solveObjectDefine(raw) {
    const t = String(raw || "").toLowerCase();

    // Parallel before intersecting — "never meet" must not count as intersecting
    if (
      /\bparallel\b/.test(t) ||
      /\bnever\s+meet\b/.test(t) ||
      /\bdo\s+not\s+meet\b/.test(t) ||
      /\bdon'?t\s+meet\b/.test(t)
    ) {
      return result({
        operationKey: "geometry_parallel",
        given: "Relationship between lines",
        find: "Identify the relationship",
        steps: [
          step(
            1,
            "Recall",
            "Parallel lines lie in the same plane and never meet, no matter how far they are extended."
          ),
          step(2, "Property", "The distance between parallel lines stays constant."),
          step(3, "Identify", "The lines described are parallel.")
        ],
        finalAnswer: "Parallel lines"
      });
    }

    if (
      /\bintersect(ing|ion)?\b/.test(t) ||
      /\bcross(ing)?\b/.test(t) ||
      (/\bmeet\b/.test(t) && !/\bnever\s+meet\b/.test(t) && !/\bdo\s+not\s+meet\b/.test(t))
    ) {
      return result({
        operationKey: "geometry_intersecting",
        given: "Relationship between lines",
        find: "Identify the relationship",
        steps: [
          step(1, "Recall", "Intersecting lines cross each other at exactly one point."),
          step(2, "Property", "They form angles at the point of intersection."),
          step(3, "Identify", "The lines described are intersecting.")
        ],
        finalAnswer: "Intersecting lines"
      });
    }

    const defs = [
      {
        test: /\bpoint\b/,
        operationKey: "geometry_point",
        answer: "Point",
        given: "Basic geometry object",
        find: "Identify / define the object",
        steps: [
          step(1, "Recall", "A point marks an exact location. It has no length, width, or thickness."),
          step(2, "Notation", "Points are usually named with capital letters, e.g. A, B, P."),
          step(3, "Identify", "The object described is a point.")
        ]
      },
      {
        test: /\bline\s+segment\b|\bsegment\b/,
        operationKey: "geometry_line_segment",
        answer: "Line segment",
        given: "Basic geometry object",
        find: "Identify / define the object",
        steps: [
          step(1, "Recall", "A line segment is the part of a line between two endpoints."),
          step(2, "Properties", "It has fixed length and two endpoints (e.g. AB or segment AB)."),
          step(3, "Identify", "The object described is a line segment.")
        ]
      },
      {
        test: /\bray\b/,
        operationKey: "geometry_ray",
        answer: "Ray",
        given: "Basic geometry object",
        find: "Identify / define the object",
        steps: [
          step(1, "Recall", "A ray has one endpoint and extends endlessly in one direction."),
          step(2, "Notation", "Ray AB starts at A and passes through B."),
          step(3, "Identify", "The object described is a ray.")
        ]
      },
      {
        test: /\bline\b/,
        operationKey: "geometry_line",
        answer: "Line",
        given: "Basic geometry object",
        find: "Identify / define the object",
        steps: [
          step(1, "Recall", "A line extends endlessly in both directions and has no endpoints."),
          step(2, "Notation", "A line through A and B is written as line AB."),
          step(3, "Identify", "The object described is a line.")
        ]
      }
    ];

    for (let i = 0; i < defs.length; i++) {
      if (defs[i].test.test(t)) {
        const d = defs[i];
        if (d.operationKey === "geometry_line" && /\bstraight\s+angle\b/.test(t)) {
          continue;
        }
        return result({
          operationKey: d.operationKey,
          given: d.given,
          find: d.find,
          steps: d.steps,
          finalAnswer: d.answer
        });
      }
    }
    return null;
  }

  function parseThreeNumbers(text) {
    const nums = String(text || "").match(/\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 3) return null;
    return nums.slice(0, 3).map(Number);
  }

  function solveTriangle(raw) {
    const t = String(raw || "").toLowerCase();
    if (!/\btriangle\b/.test(t) && !/\btriangles?\b/.test(t)) {
      // "sides 3, 4, 5 classify" with classify triangle implied
      if (!/\b(equilateral|isosceles|scalene|acute|obtuse|right)\b/.test(t)) {
        return null;
      }
    }

    // Basics: what is a triangle / parts
    if (
      /\b(what\s+is\s+a\s+triangle|parts?\s+of\s+(a\s+)?triangle|vertices|sides\s+and\s+angles)\b/.test(
        t
      ) ||
      (/\btriangle\s+basics?\b/.test(t) || /\bdefine\s+(a\s+)?triangle\b/.test(t))
    ) {
      return result({
        operationKey: "geometry_triangle_basics",
        given: "Triangle",
        find: "Basic definition / parts",
        steps: [
          step(1, "Definition", "A triangle is a closed figure formed by three line segments."),
          step(2, "Parts", "It has 3 vertices, 3 sides, and 3 interior angles."),
          step(3, "Angle sum", "The sum of the three interior angles is 180°.")
        ],
        finalAnswer: "Triangle: 3 sides, 3 vertices, 3 angles (sum 180°)"
      });
    }

    const nums = parseThreeNumbers(raw);
    if (!nums) {
      if (/\btriangle\b/.test(t)) {
        return result({
          operationKey: "geometry_triangle_basics",
          given: "Triangle",
          find: "Basic properties",
          steps: [
            step(1, "Definition", "A triangle has three sides and three angles."),
            step(2, "Angle sum", "Interior angles add up to 180°."),
            step(3, "Types", "Triangles may be classified by sides (equilateral, isosceles, scalene) or by angles (acute, right, obtuse).")
          ],
          finalAnswer: "Triangle (3 sides, angle sum 180°)"
        });
      }
      return null;
    }

    // Decide: sides vs angles — if sum ≈ 180 and all < 180, treat as angles
    const sum = nums[0] + nums[1] + nums[2];
    const asAngles =
      /\bangles?\b/.test(t) ||
      (/\bdegree|°/.test(t) && sum >= 170 && sum <= 190) ||
      (sum === 180 && nums.every(function (n) {
        return n > 0 && n < 180;
      }));

    if (asAngles || (/\bclassif/.test(t) && sum === 180)) {
      const a = nums[0];
      const b = nums[1];
      const c = nums[2];
      if (Math.abs(sum - 180) > 0.01) {
        return unsupported(
          "Interior angles of a triangle must sum to 180° (got " + sum + "°)"
        );
      }
      let kind = "Acute triangle";
      let key = "geometry_triangle_classify_angles";
      if (a === 90 || b === 90 || c === 90) {
        kind = "Right triangle";
      } else if (a > 90 || b > 90 || c > 90) {
        kind = "Obtuse triangle";
      }
      return result({
        operationKey: key,
        given: "Angles " + a + "°, " + b + "°, " + c + "°",
        find: "Classify the triangle by angles",
        steps: [
          step(1, "Check angle sum", a + " + " + b + " + " + c + " = " + sum + "° (valid triangle)."),
          step(
            2,
            "Compare with 90°",
            "Right: one angle = 90°. Obtuse: one angle > 90°. Acute: all angles < 90°."
          ),
          step(3, "Classify", "This triangle is a " + kind.toLowerCase() + ".")
        ],
        finalAnswer: kind
      });
    }

    // Classify by sides
    const s = nums.slice().sort(function (x, y) {
      return x - y;
    });
    // Triangle inequality
    if (s[0] + s[1] <= s[2]) {
      return unsupported(
        "Side lengths do not satisfy the triangle inequality"
      );
    }
    let sideKind = "Scalene triangle";
    if (s[0] === s[1] && s[1] === s[2]) sideKind = "Equilateral triangle";
    else if (s[0] === s[1] || s[1] === s[2] || s[0] === s[2]) {
      sideKind = "Isosceles triangle";
    }

    return result({
      operationKey: "geometry_triangle_classify_sides",
      given: "Sides " + nums[0] + ", " + nums[1] + ", " + nums[2],
      find: "Classify the triangle by sides",
      steps: [
        step(
          1,
          "Triangle inequality",
          "Check " +
            s[0] +
            " + " +
            s[1] +
            " > " +
            s[2] +
            " → valid triangle."
        ),
        step(
          2,
          "Compare sides",
          "Equilateral: all equal. Isosceles: exactly two equal. Scalene: all different."
        ),
        step(3, "Classify", "This triangle is a " + sideKind.toLowerCase() + ".")
      ],
      finalAnswer: sideKind
    });
  }

  function solveNamedAngleType(raw) {
    const t = String(raw || "").toLowerCase();
    const named = [
      {
        re: /\bacute\b/,
        operationKey: "geometry_angle_acute",
        answer: "Acute angle",
        desc: "An acute angle measures greater than 0° and less than 90°."
      },
      {
        re: /\bright\s+angle\b/,
        operationKey: "geometry_angle_right",
        answer: "Right angle",
        desc: "A right angle measures exactly 90°."
      },
      {
        re: /\bobtuse\b/,
        operationKey: "geometry_angle_obtuse",
        answer: "Obtuse angle",
        desc: "An obtuse angle measures greater than 90° and less than 180°."
      },
      {
        re: /\bstraight\s+angle\b/,
        operationKey: "geometry_angle_straight",
        answer: "Straight angle",
        desc: "A straight angle measures exactly 180°."
      },
      {
        re: /\breflex\b/,
        operationKey: "geometry_angle_reflex",
        answer: "Reflex angle",
        desc: "A reflex angle measures greater than 180° and less than 360°."
      },
      {
        re: /\bcomplete\s+angle\b|\bfull\s+angle\b/,
        operationKey: "geometry_angle_complete",
        answer: "Complete angle",
        desc: "A complete (full) angle measures exactly 360°."
      }
    ];
    for (let i = 0; i < named.length; i++) {
      if (named[i].re.test(t) && /\b(what|define|meaning|is\s+an?|measure)\b/.test(t)) {
        const n = named[i];
        return result({
          operationKey: n.operationKey,
          given: n.answer,
          find: "Definition / measure",
          steps: [
            step(1, "Definition", n.desc),
            step(2, "Identify", "The angle type asked is a " + n.answer.toLowerCase() + ".")
          ],
          finalAnswer: n.answer
        });
      }
    }
    return null;
  }

  /**
   * Try to classify + solve intro geometry.
   * @returns {object|null} result, unsupported, or null if not geometry
   */
  function trySolve(rawText) {
    const text = String(rawText || "").replace(/\s+/g, " ").trim();
    if (!text) return null;

    const bad = isUnsupportedGeometry(text);
    if (bad) {
      if (looksLikeGeometry(text) || bad) {
        return unsupported(bad);
      }
    }

    if (!looksLikeGeometry(text)) return null;

    // Triangles before bare angle classification (avoid "sides 5,5,5" → 5°)
    const tri = solveTriangle(text);
    if (tri) return tri;

    // Angle measure classification when a degree is present
    if (
      extractDegree(text) != null &&
      /\b(classif\w*|type|kind|what\s+type|name\s+the\s+angle|identify|angle)\b/i.test(
        text
      )
    ) {
      return solveAngleClassify(text);
    }
    if (
      extractDegree(text) != null &&
      /\b\d+\s*(?:°|\u00b0|degrees?|deg)\b/i.test(text)
    ) {
      return solveAngleClassify(text);
    }
    // Bare "Classify 360°"
    if (extractDegree(text) != null && /\bclassif\w*\b/i.test(text)) {
      return solveAngleClassify(text);
    }

    const named = solveNamedAngleType(text);
    if (named) return named;

    const obj = solveObjectDefine(text);
    if (obj) return obj;

    if (extractDegree(text) != null) {
      return solveAngleClassify(text);
    }

    return unsupported("Supported geometry topic not recognised for this wording");
  }

  return {
    trySolve: trySolve,
    looksLikeGeometry: looksLikeGeometry,
    isUnsupportedGeometry: isUnsupportedGeometry,
    classifyAngleMeasure: classifyAngleMeasure
  };
});
