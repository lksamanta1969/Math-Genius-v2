/**
 * Pluggable OCR providers (stubs + local Tesseract registration hook).
 * Actual Tesseract implementation remains in tesseract-provider.js.
 */
(function (global) {
  "use strict";

  function unavailable(name) {
    return async function () {
      throw (
        (global.SolverErrors &&
          global.SolverErrors.providerUnavailable(name)) ||
        new Error(name + " is not available")
      );
    };
  }

  const stubs = [
    {
      id: "google-vision",
      label: "Google Vision",
      local: false,
      available: false
    },
    {
      id: "azure-vision",
      label: "Azure Vision",
      local: false,
      available: false
    },
    {
      id: "openai-vision",
      label: "OpenAI Vision (Future)",
      local: false,
      available: false
    },
    {
      id: "custom-local-ocr",
      label: "Custom Local OCR",
      local: true,
      available: false
    }
  ];

  if (global.OcrEngine) {
    stubs.forEach(function (s) {
      global.OcrEngine.register(
        s.id,
        Object.assign({}, s, { recognize: unavailable(s.id) })
      );
    });
  }
})(window);
