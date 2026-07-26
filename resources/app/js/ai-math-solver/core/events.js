/**
 * Progress / pipeline events (async OCR & page-by-page PDF).
 */
(function (global) {
  "use strict";

  const listeners = Object.create(null);

  const SolverEvents = {
    DOCUMENT_LOADED: "document:loaded",
    PAGE_RENDERED: "document:page-rendered",
    OCR_STARTED: "ocr:started",
    OCR_PROGRESS: "ocr:progress",
    OCR_PAGE_DONE: "ocr:page-done",
    OCR_DONE: "ocr:done",
    OCR_CACHE_HIT: "ocr:cache-hit",
    QUESTIONS_DETECTED: "questions:detected",
    MATH_PARSED: "math:parsed",
    ERROR: "pipeline:error",

    on: function (event, handler) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return function off() {
        listeners[event] = (listeners[event] || []).filter(function (h) {
          return h !== handler;
        });
      };
    },

    emit: function (event, payload) {
      (listeners[event] || []).forEach(function (handler) {
        try {
          handler(payload || {});
        } catch (err) {
          console.error("SolverEvents handler error", event, err);
        }
      });
    }
  };

  global.SolverEvents = SolverEvents;
})(window);
