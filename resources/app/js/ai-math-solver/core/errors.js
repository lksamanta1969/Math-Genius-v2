/**
 * Typed pipeline errors for Phase 8A+.
 */
(function (global) {
  "use strict";

  function makeError(code, message, details) {
    const err = new Error(message || code);
    err.code = code;
    err.details = details || null;
    err.solvable = false;
    return err;
  }

  const SolverErrors = {
    CODES: {
      UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
      CORRUPTED_PDF: "CORRUPTED_PDF",
      UNREADABLE_PAGE: "UNREADABLE_PAGE",
      LOW_CONFIDENCE: "LOW_CONFIDENCE",
      TIMEOUT: "TIMEOUT",
      PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
      CACHE_ERROR: "CACHE_ERROR"
    },

    unsupportedFormat: function (format) {
      return makeError(
        "UNSUPPORTED_FORMAT",
        "Unsupported format: " + (format || "unknown"),
        { format: format }
      );
    },

    corruptedPdf: function (reason) {
      return makeError(
        "CORRUPTED_PDF",
        "Corrupted or unreadable PDF" + (reason ? ": " + reason : ""),
        { reason: reason }
      );
    },

    unreadablePage: function (page) {
      return makeError(
        "UNREADABLE_PAGE",
        "Unreadable page " + page,
        { page: page }
      );
    },

    lowConfidence: function (confidence, threshold) {
      return makeError(
        "LOW_CONFIDENCE",
        "OCR confidence below threshold (" +
          confidence +
          "% < " +
          threshold +
          "%)",
        { confidence: confidence, threshold: threshold }
      );
    },

    timeout: function (stage) {
      return makeError("TIMEOUT", "Timeout during " + (stage || "operation"), {
        stage: stage
      });
    },

    providerUnavailable: function (id) {
      return makeError(
        "PROVIDER_UNAVAILABLE",
        "OCR provider unavailable: " + (id || "unknown"),
        { provider: id }
      );
    }
  };

  global.SolverErrors = SolverErrors;
})(window);
