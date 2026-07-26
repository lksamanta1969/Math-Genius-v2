/**
 * OCR Provider Interface (contract)
 *
 * Every OCR plugin MUST implement this shape and register with OcrEngine.
 * The UI and Document Manager never call a provider directly.
 *
 * Provider selection comes ONLY from configuration
 * (resources/app/data/ai-math-solver.json → ocr.defaultProvider).
 *
 * Security:
 * - local: true  → on-device only (default)
 * - local: false → cloud; must be explicitly enabled in config later
 */

(function (global) {
  "use strict";

  /**
   * @typedef {Object} OcrBoundingBox
   * @property {number} x
   * @property {number} y
   * @property {number} width
   * @property {number} height
   */

  /**
   * @typedef {Object} OcrBlock
   * @property {string} text
   * @property {number} confidence
   * @property {OcrBoundingBox|null} bbox
   */

  /**
   * @typedef {Object} OcrRecognizeOptions
   * @property {string} [language]
   * @property {number} [page]
   * @property {number} [timeoutMs]
   * @property {function(Object):void} [onProgress]
   * @property {AbortSignal} [signal]
   */

  /**
   * @typedef {Object} OcrResult
   * @property {string} text
   * @property {number} confidence
   * @property {string} language
   * @property {OcrBlock[]} blocks
   * @property {string} provider
   * @property {number} [page]
   * @property {string} [warning]
   */

  /**
   * @typedef {Object} IOcrProvider
   * @property {string} id
   * @property {string} label
   * @property {boolean} local
   * @property {boolean} available
   * @property {function(any, OcrRecognizeOptions=): Promise<OcrResult>} recognize
   * @property {function(): Promise<boolean>} [isReady]
   * @property {function(): Promise<void>} [dispose]
   */

  const REQUIRED = ["id", "label", "local", "available", "recognize"];

  const OcrProviderInterface = {
    /**
     * Validate a provider plugin before registration.
     * @param {IOcrProvider} provider
     * @returns {{ ok:boolean, errors:string[] }}
     */
    validate: function (provider) {
      const errors = [];
      if (!provider || typeof provider !== "object") {
        return { ok: false, errors: ["Provider must be an object"] };
      }
      REQUIRED.forEach(function (key) {
        if (provider[key] === undefined || provider[key] === null) {
          errors.push("Missing required field: " + key);
        }
      });
      if (typeof provider.recognize !== "function") {
        errors.push("recognize() must be a function");
      }
      if (provider.local === false && provider.available === true) {
        // Cloud providers may exist, but enabling them is a config decision.
        // Interface allows them; Document Manager enforces local-by-default.
      }
      return { ok: errors.length === 0, errors: errors };
    },

    requiredFields: REQUIRED.slice()
  };

  global.OcrProviderInterface = OcrProviderInterface;
})(window);
