/**
 * Question Detection
 * Supports: 1. / Q1 / Question 1 / (a)(b) / Roman numerals / Exercise numbering
 */
(function (global) {
  "use strict";

  const START_PATTERNS = [
    /^\s*(?:question|ques\.?|q)\s*([0-9]+)\b[:.)\-]?\s*/i,
    /^\s*(?:ex(?:ercise)?|ex\.?)\s*([0-9]+(?:\.[0-9]+)?)\b[:.)\-]?\s*/i,
    /^\s*(\d+)\s*[.)\-]\s+/,
    /^\s*\((\d+)\)\s+/,
    /^\s*\(([a-z])\)\s+/i,
    /^\s*([a-z])\s*[.)]\s+/i,
    /^\s*\(([ivxlcdm]+)\)\s+/i,
    /^\s*([ivxlcdm]+)\s*[.)]\s+/i
  ];

  function normalizeLine(line) {
    return String(line || "")
      .replace(/\u00a0/g, " ")
      .replace(/[|]/g, "I")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchStart(line) {
    for (let i = 0; i < START_PATTERNS.length; i += 1) {
      const m = line.match(START_PATTERNS[i]);
      if (m) {
        return {
          marker: m[0].trim(),
          label: m[1] || String(i + 1),
          rest: line.slice(m[0].length).trim()
        };
      }
    }
    return null;
  }

  function looksLikeQuestionBody(text) {
    const t = text;
    if (!t) return false;
    return (
      /\?/.test(t) ||
      /\b(find|solve|evaluate|simplify|calculate|prove|show that|what is|how many)\b/i.test(
        t
      ) ||
      /[=+\-×÷*/^√∫]/.test(t) ||
      /\d/.test(t)
    );
  }

  /**
   * @param {string} text
   * @param {object} context
   * @param {number} context.page
   * @param {number} [context.confidence]
   * @param {string} [context.language]
   * @param {Array} [context.ocrBlocks]
   * @returns {Array<object>}
   */
  function detectQuestions(text, context) {
    const ctx = context || {};
    const page = ctx.page || 1;
    const language = ctx.language || "eng";
    const baseConfidence =
      typeof ctx.confidence === "number" ? ctx.confidence : 0;
    const ocrBlocks = Array.isArray(ctx.ocrBlocks) ? ctx.ocrBlocks : [];

    const lines = String(text || "")
      .replace(/\r/g, "")
      .split("\n")
      .map(normalizeLine)
      .filter(Boolean);

    const chunks = [];
    let current = null;

    function pushCurrent() {
      if (!current) return;
      const body = current.lines.join(" ").trim();
      if (body || current.marker) {
        chunks.push({
          marker: current.marker,
          label: current.label,
          text: (current.marker ? current.marker + " " : "") + body
        });
      }
      current = null;
    }

    lines.forEach(function (line) {
      const start = matchStart(line);
      if (start) {
        pushCurrent();
        current = {
          marker: start.marker,
          label: start.label,
          lines: start.rest ? [start.rest] : []
        };
        return;
      }

      // Split inline sub-questions occasionally produced by OCR on one line
      const inlineParts = line.split(
        /(?=\((?:[a-z]|\d+|[ivxlcdm]+)\)\s+)/i
      );
      if (inlineParts.length > 1) {
        inlineParts.forEach(function (part) {
          const partLine = normalizeLine(part);
          if (!partLine) return;
          const inlineStart = matchStart(partLine);
          if (inlineStart) {
            pushCurrent();
            current = {
              marker: inlineStart.marker,
              label: inlineStart.label,
              lines: inlineStart.rest ? [inlineStart.rest] : []
            };
          } else if (!current) {
            current = { marker: "", label: "", lines: [partLine] };
          } else {
            current.lines.push(partLine);
          }
        });
        return;
      }

      if (!current) {
        current = { marker: "", label: "", lines: [line] };
      } else {
        current.lines.push(line);
      }
    });
    pushCurrent();

    const mathDetect =
      (global.MathDetector && global.MathDetector.detect) ||
      function () {
        return { containsMath: false, types: [], blocks: [] };
      };

    const questions = [];
    const seen = new Set();

    chunks.forEach(function (chunk, index) {
      const raw = chunk.text.trim();
      if (!raw) return;
      if (!chunk.marker && !looksLikeQuestionBody(raw) && raw.length < 20) {
        return;
      }

      const key = raw.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const math = mathDetect(raw);
      const equations =
        global.MathExpressionParser && global.MathExpressionParser.parse
          ? global.MathExpressionParser.parse(raw)
          : [];
      const id =
        "P" +
        String(page).padStart(2, "0") +
        "-Q" +
        String(index + 1).padStart(2, "0");

      // Approximate bounding box from overlapping OCR word blocks
      let bbox = null;
      if (ocrBlocks.length) {
        const tokens = raw.split(/\s+/).slice(0, 8);
        const hits = ocrBlocks.filter(function (b) {
          return tokens.some(function (t) {
            return (
              b.text &&
              t &&
              b.text.toLowerCase().indexOf(t.toLowerCase().slice(0, 4)) >= 0
            );
          });
        });
        if (hits.length) {
          let minX = Infinity;
          let minY = Infinity;
          let maxX = 0;
          let maxY = 0;
          hits.forEach(function (h) {
            const box = h.bbox || {};
            minX = Math.min(minX, box.x || 0);
            minY = Math.min(minY, box.y || 0);
            maxX = Math.max(maxX, (box.x || 0) + (box.width || 0));
            maxY = Math.max(maxY, (box.y || 0) + (box.height || 0));
          });
          bbox = {
            x: minX,
            y: minY,
            width: Math.max(0, maxX - minX),
            height: Math.max(0, maxY - minY)
          };
        }
      }

      const confidence = Math.round(
        Math.max(
          0,
          Math.min(
            100,
            baseConfidence * (math.containsMath || chunk.marker ? 1 : 0.85)
          )
        )
      );

      const questionPartial = {
        id: id,
        page: page,
        order: questions.length + 1,
        boundingBox: bbox,
        text: raw,
        confidence: confidence,
        containsMath: math.containsMath || equations.length > 0,
        language: language,
        images: [],
        equations: equations,
        status:
          confidence < 40
            ? (global.QuestionSchema &&
                global.QuestionSchema.Status.LOW_CONFIDENCE) ||
              "low-confidence"
            : (global.QuestionSchema &&
                global.QuestionSchema.Status.DETECTED) ||
              "detected",
        marker: chunk.marker || null,
        mathTypes: math.types,
        mathBlocks: math.blocks
      };

      questions.push(
        global.QuestionSchema && global.QuestionSchema.create
          ? global.QuestionSchema.create(questionPartial)
          : questionPartial
      );
    });

    if (!questions.length && String(text || "").trim()) {
      const full = String(text).trim();
      const math = mathDetect(full);
      const equations =
        global.MathExpressionParser && global.MathExpressionParser.parse
          ? global.MathExpressionParser.parse(full)
          : [];
      const questionPartial = {
        id: "P" + String(page).padStart(2, "0") + "-Q01",
        page: page,
        order: 1,
        boundingBox: null,
        text: full,
        confidence: Math.round(baseConfidence * 0.7),
        containsMath: math.containsMath || equations.length > 0,
        language: language,
        images: [],
        equations: equations,
        status:
          (global.QuestionSchema && global.QuestionSchema.Status.DETECTED) ||
          "detected",
        marker: null,
        mathTypes: math.types,
        mathBlocks: math.blocks
      };
      questions.push(
        global.QuestionSchema && global.QuestionSchema.create
          ? global.QuestionSchema.create(questionPartial)
          : questionPartial
      );
    }

    return questions;
  }

  global.QuestionDetector = {
    detect: detectQuestions
  };
})(window);
