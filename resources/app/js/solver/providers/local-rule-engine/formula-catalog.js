/**
 * Formula Catalog — resolve operation → Formula Library IDs.
 * Curriculum metadata (names, board, chapter, …) comes from Curriculum Mapper.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.FormulaCatalog = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  let indexById = Object.create(null);
  let loaded = false;

  function walk(node, out) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(function (n) {
        walk(n, out);
      });
      return;
    }
    if (typeof node.id === "string" && typeof node.name === "string") {
      out[node.id] = {
        formulaId: node.id,
        formulaName: node.formulaName || node.name,
        formula: node.formula || null,
        board: node.board || null,
        class: node.class || null,
        subject: node.subject || null,
        chapter: node.chapter || null,
        topic: node.topic || null
      };
    }
    Object.keys(node).forEach(function (k) {
      if (k === "id" || k === "name" || k === "formula") return;
      walk(node[k], out);
    });
  }

  /**
   * Operation → Formula Library ID(s). IDs only — names come from catalog.
   * Ops with no library entry return [].
   */
  const OPERATION_FORMULA_IDS = Object.freeze({
    factors: ["CBSE-C6-AR-009"],
    multiples: ["CBSE-C6-AR-010"],
    hcf: ["CBSE-C6-AR-016"],
    lcm: ["CBSE-C6-AR-016"],
    even_odd: ["CBSE-C6-AR-011"],
    prime: ["CBSE-C6-AR-009"],
    fraction_notation: ["CBSE-C6-AR-017"],
    fraction_equivalent: ["CBSE-C6-AR-018"],
    fraction_add_like: ["CBSE-C6-AR-019"],
    fraction_sub_like: ["CBSE-C6-AR-020"],
    fraction_add_unlike: ["CBSE-C6-AR-018", "CBSE-C6-AR-019"],
    fraction_sub_unlike: ["CBSE-C6-AR-018", "CBSE-C6-AR-020"],
    fraction_simplify: ["CBSE-C6-AR-018"],
    addition: [],
    subtraction: [],
    multiplication: [],
    division: [],
    bodmas: [],
    simplification: [],
    algebra_variable_constant: ["CBSE-C6-AL-001"],
    algebra_expression: ["CBSE-C6-AL-002"],
    algebra_like_terms: ["CBSE-C6-AL-003"],
    algebra_unlike_terms: ["CBSE-C6-AL-004"],
    algebra_combine_like_terms: ["CBSE-C6-AL-003", "CBSE-C6-AL-005"],
    algebra_evaluate: ["CBSE-C6-AL-006"],
    algebra_linear_equation: [
      "CBSE-C6-AL-007",
      "CBSE-C6-AL-008",
      "CBSE-C6-AL-009"
    ],
    algebra_missing_number: ["CBSE-C6-AL-010", "CBSE-C6-AL-007"],
    // Phase 8C — Geometry basics
    geometry_point: ["CBSE-C6-GE-010"],
    geometry_line: ["CBSE-C6-GE-011"],
    geometry_ray: ["CBSE-C6-GE-012"],
    geometry_line_segment: ["CBSE-C6-GE-013"],
    geometry_parallel: ["CBSE-C6-GE-014"],
    geometry_intersecting: ["CBSE-C6-GE-015"],
    geometry_angle_acute: ["CBSE-C6-GE-016", "CBSE-C6-GE-001"],
    geometry_angle_right: ["CBSE-C6-GE-001"],
    geometry_angle_obtuse: ["CBSE-C6-GE-017", "CBSE-C6-GE-001"],
    geometry_angle_straight: ["CBSE-C6-GE-002"],
    geometry_angle_reflex: ["CBSE-C6-GE-018", "CBSE-C6-GE-003"],
    geometry_angle_complete: ["CBSE-C6-GE-003"],
    geometry_triangle_basics: ["CBSE-C6-GE-019", "CBSE-C7-GE-003"],
    geometry_triangle_classify_sides: ["CBSE-C6-GE-019"],
    geometry_triangle_classify_angles: ["CBSE-C6-GE-019", "CBSE-C7-GE-003"],
    // Phase 8D — Mensuration (plane figures)
    mensuration_square_perimeter: ["CBSE-C6-ME-002"],
    mensuration_square_area: ["CBSE-C6-ME-005"],
    mensuration_rectangle_perimeter: ["CBSE-C6-ME-001"],
    mensuration_rectangle_area: ["CBSE-C6-ME-004"],
    mensuration_triangle_perimeter: ["CBSE-C6-ME-003"],
    mensuration_triangle_area: ["CBSE-C6-ME-006"],
    mensuration_circle_circumference: ["CBSE-C7-ME-002"],
    mensuration_circle_area: ["CBSE-C7-ME-003"],
    // Phase 8E — Data Handling & Statistics
    statistics_mean: ["CBSE-C7-ST-001"],
    statistics_range: ["CBSE-C7-ST-002"],
    statistics_median: ["CBSE-C7-ST-003"],
    statistics_mode: ["CBSE-C7-ST-004"],
    statistics_frequency: ["CBSE-C6-DH-001"],
    statistics_frequency_table: ["CBSE-C6-DH-001"],
    statistics_pictograph: ["CBSE-C6-DH-002"],
    statistics_bar_graph: ["CBSE-C6-DH-003"]
  });

  function ingestFormulasArray(list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (node) {
      if (node && typeof node.id === "string" && typeof node.name === "string") {
        indexById[node.id] = {
          formulaId: node.id,
          formulaName: node.formulaName || node.name,
          formula: node.formula || null,
          board: node.board || null,
          class: node.class || null,
          subject: node.subject || null,
          chapter: node.chapter || null,
          topic: node.topic || null
        };
      }
    });
  }

  function ingest(data) {
    if (!data) return;
    if (!loaded) {
      indexById = Object.create(null);
    }
    if (Array.isArray(data.formulas)) {
      ingestFormulasArray(data.formulas);
      loaded = true;
      return;
    }
    // Full library load replaces index
    indexById = Object.create(null);
    walk(data, indexById);
    loaded = true;
  }

  const FormulaCatalog = {
    isLoaded: function () {
      return loaded;
    },

    loadFromData: function (data) {
      loaded = false;
      indexById = Object.create(null);
      ingest(data || {});
      return this;
    },

    /**
     * Merge an additional pack (e.g. intro algebra) without clearing existing IDs.
     */
    mergePack: function (data) {
      if (!data) return this;
      if (!loaded) {
        indexById = Object.create(null);
      }
      if (Array.isArray(data.formulas)) {
        ingestFormulasArray(data.formulas);
      } else {
        walk(data, indexById);
      }
      loaded = true;
      return this;
    },

    loadFromUrl: async function (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load formula library: " + res.status);
      ingest(await res.json());
      return this;
    },

    mergeFromUrl: async function (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load formula pack: " + res.status);
      this.mergePack(await res.json());
      return this;
    },

    getById: function (id) {
      return indexById[id] || null;
    },

    /**
     * Operation → Formula IDs only (solver must not read curriculum text).
     * @param {string} operationKey
     * @returns {string[]}
     */
    resolveIdsForOperation: function (operationKey) {
      const ids = OPERATION_FORMULA_IDS[operationKey] || [];
      if (!loaded) return ids.slice();
      return ids.filter(function (id) {
        return !!indexById[id];
      });
    },

    /**
     * @deprecated Prefer resolveIdsForOperation + CurriculumMapper.
     * Returns ID-only refs for solver compatibility.
     * @param {string} operationKey
     * @returns {{ formulaId: string }[]}
     */
    resolveForOperation: function (operationKey) {
      return this.resolveIdsForOperation(operationKey).map(function (id) {
        return { formulaId: id };
      });
    },

    operationFormulaIds: OPERATION_FORMULA_IDS
  };

  return FormulaCatalog;
});
