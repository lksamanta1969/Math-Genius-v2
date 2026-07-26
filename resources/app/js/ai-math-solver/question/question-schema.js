/**
 * Question Object schema (Phase 8A+)
 *
 * Question {
 *   id, page, order, boundingBox, text, confidence,
 *   containsMath, language, images[], equations[], status
 * }
 */
(function (global) {
  "use strict";

  const QuestionStatus = Object.freeze({
    DETECTED: "detected",
    LOW_CONFIDENCE: "low-confidence",
    UNREADABLE: "unreadable",
    READY: "ready",
    ERROR: "error"
  });

  /**
   * @param {object} partial
   * @returns {object}
   */
  function createQuestion(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      page: p.page != null ? p.page : 1,
      order: p.order != null ? p.order : 0,
      boundingBox: p.boundingBox || null,
      text: p.text || p.recognizedText || "",
      confidence: typeof p.confidence === "number" ? p.confidence : 0,
      containsMath: !!p.containsMath,
      language: p.language || "eng",
      images: Array.isArray(p.images) ? p.images : [],
      equations: Array.isArray(p.equations) ? p.equations : [],
      status: p.status || QuestionStatus.DETECTED,
      // retained for compatibility with earlier 8A UI fields
      recognizedText: p.text || p.recognizedText || "",
      marker: p.marker || null,
      mathTypes: p.mathTypes || [],
      mathBlocks: p.mathBlocks || []
    };
  }

  global.QuestionSchema = {
    Status: QuestionStatus,
    create: createQuestion
  };
})(window);
