/**
 * Formula Catalog — resolve Formula Library IDs to names.
 * Does not hardcode formula text; loads from formula-library.json.
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
        formulaName: node.name,
        formula: node.formula || null,
        board: node.board || null,
        class: node.class || null,
        subject: node.subject || null,
        chapter: node.chapter || null
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
    algebra_missing_number: ["CBSE-C6-AL-010", "CBSE-C6-AL-007"]
  });

  function ingestFormulasArray(list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (node) {
      if (node && typeof node.id === "string" && typeof node.name === "string") {
        indexById[node.id] = {
          formulaId: node.id,
          formulaName: node.name,
          formula: node.formula || null,
          board: node.board || null,
          class: node.class || null,
          subject: node.subject || null,
          chapter: node.chapter || null
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
     * @param {string} operationKey
     * @returns {{ formulaId: string, formulaName: string }[]}
     */
    resolveForOperation: function (operationKey) {
      const ids = OPERATION_FORMULA_IDS[operationKey] || [];
      const out = [];
      ids.forEach(function (id) {
        const entry = indexById[id];
        if (entry) {
          out.push({
            formulaId: entry.formulaId,
            formulaName: entry.formulaName
          });
        } else if (!loaded) {
          out.push({ formulaId: id, formulaName: null });
        }
      });
      return out;
    },

    operationFormulaIds: OPERATION_FORMULA_IDS
  };

  return FormulaCatalog;
});
