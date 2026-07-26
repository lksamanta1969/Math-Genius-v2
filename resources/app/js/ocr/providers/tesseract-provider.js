/**
 * Tesseract OCR provider (local / on-device).
 * Registered with OcrEngine — swap via OcrEngine.setProvider().
 */
(function (global) {
  "use strict";

  function clampConfidence(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function mapBlocks(data) {
    const words = (data && data.words) || [];
    return words
      .filter(function (w) {
        return w && w.text && String(w.text).trim();
      })
      .map(function (w) {
        const box = w.bbox || {};
        return {
          text: String(w.text).trim(),
          confidence: clampConfidence(w.confidence),
          bbox: {
            x: box.x0 || 0,
            y: box.y0 || 0,
            width: (box.x1 || 0) - (box.x0 || 0),
            height: (box.y1 || 0) - (box.y0 || 0)
          }
        };
      });
  }

  const TesseractProvider = {
    id: "tesseract",
    label: "Tesseract (Local)",
    local: true,
    available: true,

    /**
     * @param {Blob|File|HTMLCanvasElement|HTMLImageElement} input
     * @param {object} options
     */
    recognize: async function (input, options) {
      if (typeof Tesseract === "undefined") {
        throw new Error("Tesseract.js library is not loaded");
      }

      const language = (options && options.language) || "eng";
      const onProgress = options && options.onProgress;

      const result = await Tesseract.recognize(input, language, {
        workerPath: "../vendor/tesseract/worker.min.js",
        logger: function (message) {
          if (typeof onProgress === "function") {
            onProgress(message);
          }
        }
      });

      const data = result.data || {};
      return {
        text: String(data.text || "").trim(),
        confidence: clampConfidence(data.confidence),
        language: language,
        blocks: mapBlocks(data),
        provider: "tesseract"
      };
    }
  };

  if (global.OcrEngine) {
    global.OcrEngine.register("tesseract", TesseractProvider);
  }

  global.TesseractOcrProvider = TesseractProvider;
})(window);
