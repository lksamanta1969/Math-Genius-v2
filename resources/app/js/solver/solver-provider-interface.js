/**
 * Solver Provider Interface (contract)
 *
 * Question Objects → Solver Provider Interface → Solution Engine
 * → Step Generator → Explanation Generator → Final Answer → UI
 *
 * No provider is hardcoded. Selection comes from configuration.
 *
 * Modes:
 * - offline / online / auto
 *
 * Capabilities (future):
 * - cancellation (AbortSignal)
 * - retry
 * - streaming responses
 */

(function (global) {
  "use strict";

  /**
   * @typedef {Object} SolveOptions
   * @property {string} [explanationMode] Beginner|Standard|Exam Style|Teacher Mode
   * @property {string} [language] en|bn|hi
   * @property {string} [mode] offline|online|auto
   * @property {AbortSignal} [signal]
   * @property {boolean} [stream]
   * @property {function(Object):void} [onProgress]
   * @property {function(Object):void} [onToken] streaming chunk callback
   * @property {number} [timeoutMs]
   * @property {number} [retryCount]
   */

  /**
   * @typedef {Object} ISolverProvider
   * @property {string} id
   * @property {string} label
   * @property {boolean} local          true = offline-capable
   * @property {boolean} available
   * @property {boolean} [supportsStreaming]
   * @property {boolean} [supportsCancellation]
   * @property {function(object, SolveOptions=): Promise<object>} solve
   * @property {function(): Promise<boolean>} [isReady]
   * @property {function(): Promise<void>} [dispose]
   */

  const REQUIRED = ["id", "label", "local", "available", "solve"];

  const SolverProviderInterface = {
    ExplanationModes: Object.freeze({
      BEGINNER: "Beginner",
      STANDARD: "Standard",
      EXAM_STYLE: "Exam Style",
      TEACHER_MODE: "Teacher Mode"
    }),

    Languages: Object.freeze({
      EN: "en",
      BN: "bn", // বাংলা
      HI: "hi"
    }),

    RuntimeModes: Object.freeze({
      OFFLINE: "offline",
      ONLINE: "online",
      AUTO: "auto"
    }),

    requiredFields: REQUIRED.slice(),

    /**
     * @param {ISolverProvider} provider
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
      if (typeof provider.solve !== "function") {
        errors.push("solve() must be a function");
      }
      return { ok: errors.length === 0, errors: errors };
    }
  };

  global.SolverProviderInterface = SolverProviderInterface;
})(window);
