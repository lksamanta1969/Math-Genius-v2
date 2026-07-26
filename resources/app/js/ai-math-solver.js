"use strict";

/* ==========================================
   AI Math Solver — Phase 8B.3 Controller
   Upload → OCR → Detect → Edit (optional) → Local Rule Engine → Solution
   Validation, timings, copy/retry. Offline. No Algebra.
========================================== */

const state = {
  config: null,
  mode: null, // image | pdf
  fileName: "",
  sourceCanvas: null,
  displayRotation: 0,
  cropMode: false,
  cropStart: null,
  cropRect: null,
  pdfPages: [],
  pageIndex: 0,
  questions: [],
  selectedQuestionId: null,
  /** @type {Record<string, object>} */
  solutions: Object.create(null),
  /** @type {Record<string, string>} pending|solving|done|error|needs-verify */
  solveStatus: Object.create(null),
  solveCancel: null,
  ocrDurationMs: null,
  lastOcrAt: null,
  cameraStream: null,
  busy: false,
  zoom: 1
};

const els = {
  fileInput: document.getElementById("fileInput"),
  cameraBtn: document.getElementById("cameraBtn"),
  runPipelineBtn: document.getElementById("runPipelineBtn"),
  clearBtn: document.getElementById("clearBtn"),
  ocrProvider: document.getElementById("ocrProvider"),
  dropZone: document.getElementById("dropZone"),
  imageTools: document.getElementById("imageTools"),
  rotateLeftBtn: document.getElementById("rotateLeftBtn"),
  rotateRightBtn: document.getElementById("rotateRightBtn"),
  cropToggleBtn: document.getElementById("cropToggleBtn"),
  applyCropBtn: document.getElementById("applyCropBtn"),
  cancelCropBtn: document.getElementById("cancelCropBtn"),
  pageNav: document.getElementById("pageNav"),
  prevPageBtn: document.getElementById("prevPageBtn"),
  nextPageBtn: document.getElementById("nextPageBtn"),
  pageLabel: document.getElementById("pageLabel"),
  docCanvas: document.getElementById("docCanvas"),
  docMeta: document.getElementById("docMeta"),
  questionList: document.getElementById("questionList"),
  questionCount: document.getElementById("questionCount"),
  questionPreview: document.getElementById("questionPreview"),
  previewMeta: document.getElementById("previewMeta"),
  solveStatusBanner: document.getElementById("solveStatusBanner"),
  questionEdit: document.getElementById("questionEdit"),
  solveBtn: document.getElementById("solveBtn"),
  retrySolveBtn: document.getElementById("retrySolveBtn"),
  clearResultBtn: document.getElementById("clearResultBtn"),
  copySolutionBtn: document.getElementById("copySolutionBtn"),
  copyAnswerBtn: document.getElementById("copyAnswerBtn"),
  timingRow: document.getElementById("timingRow"),
  solQuestion: document.getElementById("solQuestion"),
  solGiven: document.getElementById("solGiven"),
  solFind: document.getElementById("solFind"),
  solCurriculum: document.getElementById("solCurriculum"),
  solFormulas: document.getElementById("solFormulas"),
  solSteps: document.getElementById("solSteps"),
  solAnswer: document.getElementById("solAnswer"),
  solVerification: document.getElementById("solVerification"),
  solConfidence: document.getElementById("solConfidence"),
  ocrStatus: document.getElementById("ocrStatus"),
  ocrConfidence: document.getElementById("ocrConfidence"),
  ocrProgressBar: document.getElementById("ocrProgressBar"),
  cameraPanel: document.getElementById("cameraPanel"),
  cameraVideo: document.getElementById("cameraVideo"),
  cameraCanvas: document.getElementById("cameraCanvas"),
  captureBtn: document.getElementById("captureBtn"),
  closeCameraBtn: document.getElementById("closeCameraBtn")
};

function setStatus(msg) {
  els.ocrStatus.textContent = msg;
}

function setConfidence(value) {
  if (value == null || Number.isNaN(Number(value))) {
    els.ocrConfidence.textContent = "Confidence: —";
    return;
  }
  els.ocrConfidence.textContent = "Confidence: " + Math.round(Number(value)) + "%";
}

function setProgress(pct) {
  els.ocrProgressBar.style.width = Math.max(0, Math.min(100, pct)) + "%";
}

function mbLimit(key, fallback) {
  const limits = (state.config && state.config.limits) || {};
  return Number(limits[key] != null ? limits[key] : fallback);
}

function isImageFile(file) {
  if (!file) return false;
  if (/^image\/(jpeg|png|webp)$/i.test(file.type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name || "");
}

function isPdfFile(file) {
  if (!file) return false;
  if (file.type === "application/pdf") return true;
  return /\.pdf$/i.test(file.name || "");
}

function canvasFromImage(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);
  return canvas;
}

function loadImageFile(file) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      resolve(canvasFromImage(img));
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

function rotateCanvas(source, degrees) {
  const rad = ((degrees % 360) * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const w = source.width;
  const h = source.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * cos + h * sin);
  canvas.height = Math.round(w * sin + h * cos);
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -w / 2, -h / 2);
  return canvas;
}

function cropCanvas(source, rect) {
  const x = Math.max(0, Math.round(rect.x));
  const y = Math.max(0, Math.round(rect.y));
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(source, x, y, w, h, 0, 0, w, h);
  return canvas;
}

function getWorkingCanvas() {
  if (state.mode === "pdf") {
    const page = state.pdfPages[state.pageIndex];
    return page ? page.canvas : null;
  }
  if (!state.sourceCanvas) return null;
  return rotateCanvas(state.sourceCanvas, state.displayRotation);
}

function drawDocument() {
  const source = getWorkingCanvas();
  const canvas = els.docCanvas;
  const ctx = canvas.getContext("2d");

  if (!source) {
    canvas.width = 640;
    canvas.height = 360;
    ctx.fillStyle = "#08132f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#8fa3d4";
    ctx.font = "16px sans-serif";
    ctx.fillText("No document loaded", 24, 40);
    return;
  }

  canvas.width = source.width;
  canvas.height = source.height;
  ctx.drawImage(source, 0, 0);

  if (state.cropMode && state.cropRect) {
    const r = state.cropRect;
    ctx.fillStyle = "rgba(2, 11, 45, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(r.x, r.y, r.width, r.height);
    ctx.drawImage(source, r.x, r.y, r.width, r.height, r.x, r.y, r.width, r.height);
    ctx.strokeStyle = "#1ea7ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.width, r.height);
  }

  canvas.style.width = Math.round(canvas.width * state.zoom) + "px";
}

function updateChrome() {
  const hasDoc = !!(state.sourceCanvas || state.pdfPages.length);
  els.runPipelineBtn.disabled = !hasDoc || state.busy;
  els.imageTools.hidden = state.mode !== "image" || !state.sourceCanvas;
  els.pageNav.hidden = state.mode !== "pdf" || state.pdfPages.length < 1;

  if (state.mode === "pdf" && state.pdfPages.length) {
    els.pageLabel.textContent =
      "Page " + (state.pageIndex + 1) + " / " + state.pdfPages.length;
  }

  els.docMeta.textContent = state.fileName
    ? state.fileName +
      (state.mode === "pdf"
        ? " · " + state.pdfPages.length + " page(s)"
        : " · image")
    : "";
}

function canvasToBlob(canvas) {
  return new Promise(function (resolve, reject) {
    canvas.toBlob(function (blob) {
      if (!blob) reject(new Error("Failed to create image blob"));
      else resolve(blob);
    }, "image/png");
  });
}

function clearAll() {
  stopCamera();
  if (state.solveCancel) {
    state.solveCancel();
    state.solveCancel = null;
  }
  state.mode = null;
  state.fileName = "";
  state.sourceCanvas = null;
  state.displayRotation = 0;
  state.cropMode = false;
  state.cropStart = null;
  state.cropRect = null;
  state.pdfPages = [];
  state.pageIndex = 0;
  state.questions = [];
  state.selectedQuestionId = null;
  state.solutions = Object.create(null);
  state.solveStatus = Object.create(null);
  state.ocrDurationMs = null;
  state.busy = false;
  els.fileInput.value = "";
  els.questionPreview.hidden = true;
  els.applyCropBtn.hidden = true;
  els.cancelCropBtn.hidden = true;
  els.docCanvas.classList.remove("cropping");
  renderQuestions();
  drawDocument();
  updateChrome();
  setProgress(0);
  setConfidence(null);
  setStatus("Ready — select a local image or PDF.");
}

function badgeFor(qid) {
  const st = state.solveStatus[qid] || "pending";
  const label =
    st === "solving"
      ? "Solving"
      : st === "done"
        ? "Solved"
        : st === "error"
          ? "Error"
          : st === "needs-verify"
            ? "Verify"
            : "Queued";
  return '<span class="solve-badge ' + st + '">' + label + "</span>";
}

function formatMs(ms) {
  if (ms == null || Number.isNaN(Number(ms))) return "—";
  const n = Number(ms);
  if (n < 1000) return Math.round(n) + " ms";
  return (n / 1000).toFixed(2) + " s";
}

function updateTimingRow(solution) {
  if (!els.timingRow) return;
  const ocr = formatMs(state.ocrDurationMs);
  const solve =
    solution && solution.solveDurationMs != null
      ? formatMs(solution.solveDurationMs)
      : "—";
  els.timingRow.textContent = "OCR: " + ocr + " · Solve: " + solve;
}

function copyText(text, okMsg) {
  const value = String(text == null ? "" : text);
  if (!value || value === "—") {
    setStatus("Nothing to copy.");
    return;
  }
  const done = function () {
    setStatus(okMsg || "Copied.");
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(done).catch(function () {
      fallbackCopy(value, done);
    });
  } else {
    fallbackCopy(value, done);
  }
}

function fallbackCopy(value, done) {
  const ta = document.createElement("textarea");
  ta.value = value;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (e) {
    setStatus("Copy failed.");
  }
  document.body.removeChild(ta);
}

function buildSolutionCopyText(solution, question) {
  if (!solution) return "";
  const lines = [];
  lines.push("Question: " + (solution.question || (question && question.text) || ""));
  lines.push("Given: " + (solution.given || ""));
  lines.push("Find: " + (solution.find || ""));
  if (solution.formulaUsed && solution.formulaUsed.length) {
    lines.push(
      "Formula Used: " +
        solution.formulaUsed
          .map(function (f) {
            return (
              (f.formulaId || f.id || "") +
              " " +
              (f.formulaName || f.name || "")
            );
          })
          .join("; ")
    );
  }
  if (solution.board || solution.class || solution.subject || solution.chapter) {
    lines.push(
      "Curriculum: " +
        [solution.board, solution.class, solution.subject, solution.chapter]
          .filter(Boolean)
          .join(" · ")
    );
  }
  lines.push("Steps:");
  (solution.steps || []).forEach(function (s) {
    lines.push(
      "  " + s.stepNumber + ". " + (s.title || "") + " — " + (s.description || "")
    );
  });
  lines.push("Final Answer: " + (solution.finalAnswer != null ? solution.finalAnswer : ""));
  lines.push("Verification: " + (solution.verification || ""));
  if (solution.confidence != null) {
    lines.push("Confidence: " + Math.round(solution.confidence * 100) + "%");
  }
  return lines.join("\n");
}

function renderQuestions() {
  els.questionCount.textContent = "(" + state.questions.length + ")";
  els.questionList.innerHTML = "";

  if (!state.questions.length) {
    els.questionList.innerHTML =
      '<p class="empty-state">Run OCR to detect questions.</p>';
    return;
  }

  state.questions.forEach(function (q) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "question-item" + (q.id === state.selectedQuestionId ? " active" : "");
    btn.innerHTML =
      "<strong>" +
      escapeHtml(q.id) +
      " · Page " +
      escapeHtml(String(q.page)) +
      (q.order != null ? " · #" + q.order : "") +
      (q.containsMath ? " · Math" : "") +
      badgeFor(q.id) +
      "</strong><p>" +
      escapeHtml(String(q.text || q.recognizedText || "").slice(0, 180)) +
      (String(q.text || q.recognizedText || "").length > 180 ? "…" : "") +
      "</p>";
    btn.addEventListener("click", function () {
      selectQuestion(q.id);
    });
    els.questionList.appendChild(btn);
  });
}

function setBanner(kind, message) {
  if (!els.solveStatusBanner) return;
  if (!message) {
    els.solveStatusBanner.hidden = true;
    els.solveStatusBanner.textContent = "";
    els.solveStatusBanner.className = "solve-status-banner";
    return;
  }
  els.solveStatusBanner.hidden = false;
  els.solveStatusBanner.textContent = message;
  els.solveStatusBanner.className =
    "solve-status-banner" + (kind ? " is-" + kind : "");
}

function hydrateSolutionForUi(solution) {
  if (!solution) return solution;
  if (
    window.CurriculumMapper &&
    window.CurriculumMapper.isLoaded() &&
    ((Array.isArray(solution.formulaIds) && solution.formulaIds.length) ||
      (Array.isArray(solution.formulaUsed) && solution.formulaUsed.length))
  ) {
    return window.CurriculumMapper.hydrateSolution(solution);
  }
  return solution;
}

function formatCurriculumLine(solution) {
  if (!solution) return "—";
  const parts = [
    solution.board,
    solution.class,
    solution.subject,
    solution.chapter,
    solution.topic && solution.topic !== solution.chapter
      ? "Topic: " + solution.topic
      : null,
    solution.difficulty ? "Difficulty: " + solution.difficulty : null
  ].filter(Boolean);
  if (!parts.length) {
    if (
      solution.curriculumErrors &&
      solution.curriculumErrors.length
    ) {
      return (
        "Curriculum error: " +
        solution.curriculumErrors
          .map(function (e) {
            return e.code || e.message;
          })
          .join("; ")
      );
    }
    return "—";
  }
  return parts.join(" · ");
}

function renderSolutionPanel(question, solution, jobStatus) {
  const qText = (question && (question.text || question.recognizedText)) || "";

  if (els.questionEdit && document.activeElement !== els.questionEdit) {
    els.questionEdit.value = qText;
  }

  updateTimingRow(solution);

  function clearCurriculum() {
    if (els.solCurriculum) els.solCurriculum.textContent = "—";
  }

  if (jobStatus === "needs-verify") {
    setBanner(
      "warn",
      "Low OCR confidence. Please verify the detected question."
    );
    els.solQuestion.textContent = qText || "—";
    els.solGiven.textContent = "—";
    els.solFind.textContent = "—";
    clearCurriculum();
    els.solFormulas.innerHTML =
      '<li class="sol-empty">Edit the question above, then click Solve</li>';
    els.solSteps.innerHTML = "";
    els.solAnswer.textContent = "—";
    els.solVerification.textContent = "—";
    els.solConfidence.textContent =
      question && question.confidence != null
        ? "OCR " + Math.round(question.confidence) + "% (below threshold)"
        : "—";
    return;
  }

  if (jobStatus === "solving" || jobStatus === "pending") {
    setBanner(
      "solving",
      jobStatus === "pending" ? "Queued for solving…" : "Solving…"
    );
    els.solQuestion.textContent = qText;
    els.solGiven.textContent = "—";
    els.solFind.textContent = "—";
    clearCurriculum();
    els.solFormulas.innerHTML = '<li class="sol-empty">Waiting…</li>';
    els.solSteps.innerHTML = '<li class="sol-empty">Waiting…</li>';
    els.solAnswer.textContent = "—";
    els.solVerification.textContent = "—";
    els.solConfidence.textContent = "—";
    return;
  }

  if (!solution) {
    setBanner("warn", "Edit the question if needed, then click Solve.");
    els.solQuestion.textContent = qText;
    els.solGiven.textContent = "—";
    els.solFind.textContent = "—";
    clearCurriculum();
    els.solFormulas.innerHTML = "";
    els.solSteps.innerHTML = "";
    els.solAnswer.textContent = "—";
    els.solVerification.textContent = "—";
    els.solConfidence.textContent = "—";
    return;
  }

  solution = hydrateSolutionForUi(solution);

  const err = solution.error;
  const isErr =
    jobStatus === "error" ||
    solution.status === "error" ||
    solution.status === "unsupported" ||
    !!err;

  if (isErr) {
    const code = (err && err.code) || solution.status || "Error";
    const msg = (err && err.message) || code;
    const low =
      code === "Low confidence" ||
      (msg && msg.indexOf("Low OCR confidence") >= 0);
    setBanner(
      low ? "warn" : "error",
      code + (msg && msg !== code ? " — " + msg : "")
    );
  } else {
    setBanner(
      "ok",
      "Solved · " + (solution.verification || "Needs Review")
    );
  }

  els.solQuestion.textContent = solution.question || qText || "—";
  els.solGiven.textContent = solution.given || "—";
  els.solFind.textContent = solution.find || "—";
  if (els.solCurriculum) {
    els.solCurriculum.textContent = formatCurriculumLine(solution);
  }

  const formulas = Array.isArray(solution.formulaUsed)
    ? solution.formulaUsed
    : [];
  if (!formulas.length) {
    const currErr =
      solution.curriculumErrors && solution.curriculumErrors.length
        ? solution.curriculumErrors
            .map(function (e) {
              return escapeHtml(e.code || e.message || "Curriculum error");
            })
            .join("; ")
        : null;
    els.solFormulas.innerHTML = isErr
      ? '<li class="sol-empty">—</li>'
      : currErr
        ? '<li class="sol-empty">' + currErr + "</li>"
        : '<li class="sol-empty">No Formula Library match for this operation</li>';
  } else {
    els.solFormulas.innerHTML = formulas
      .map(function (f) {
        const id = f.formulaId || f.id || "";
        const name = f.formulaName || f.name || "";
        const meta = [f.chapter, f.topic, f.difficulty]
          .filter(Boolean)
          .join(" · ");
        const related =
          Array.isArray(f.relatedFormulaIds) && f.relatedFormulaIds.length
            ? " · related: " + f.relatedFormulaIds.join(", ")
            : "";
        return (
          "<li><code>" +
          escapeHtml(id) +
          "</code> — " +
          escapeHtml(name) +
          (meta ? "<br><span class=\"sol-meta\">" + escapeHtml(meta) + "</span>" : "") +
          (related
            ? "<br><span class=\"sol-meta\">" + escapeHtml(related) + "</span>"
            : "") +
          "</li>"
        );
      })
      .join("");
  }

  const steps = Array.isArray(solution.steps) ? solution.steps : [];
  if (!steps.length) {
    els.solSteps.innerHTML = '<li class="sol-empty">No steps</li>';
  } else {
    els.solSteps.innerHTML = steps
      .map(function (s) {
        return (
          "<li><div class=\"step-title\">" +
          escapeHtml(s.stepNumber + ". " + (s.title || "Step")) +
          "</div><div class=\"step-desc\">" +
          escapeHtml(s.description || "") +
          "</div></li>"
        );
      })
      .join("");
  }

  els.solAnswer.textContent =
    solution.finalAnswer != null && solution.finalAnswer !== ""
      ? String(solution.finalAnswer)
      : "—";
  els.solVerification.textContent = solution.verification || "—";
  const conf =
    typeof solution.confidence === "number"
      ? Math.round(solution.confidence * 100) +
        "% (solver)" +
        (question && question.confidence != null
          ? " · OCR " + Math.round(question.confidence) + "%"
          : "")
      : question && question.confidence != null
        ? "OCR " + Math.round(question.confidence) + "%"
        : "—";
  els.solConfidence.textContent = conf;
  updateTimingRow(solution);
}

function selectQuestion(id) {
  const q = state.questions.find(function (item) {
    return item.id === id;
  });
  state.selectedQuestionId = id;
  renderQuestions();
  if (!q) {
    els.questionPreview.hidden = true;
    return;
  }
  els.questionPreview.hidden = false;

  const jobStatus = state.solveStatus[id] || "pending";
  const solution = state.solutions[id] || null;
  renderSolutionPanel(q, solution, jobStatus);

  els.previewMeta.innerHTML =
    "<dt>ID</dt><dd>" +
    escapeHtml(q.id) +
    "</dd>" +
    "<dt>Page</dt><dd>" +
    escapeHtml(String(q.page)) +
    "</dd>" +
    "<dt>Order</dt><dd>" +
    escapeHtml(String(q.order != null ? q.order : "—")) +
    "</dd>" +
    "<dt>OCR Confidence</dt><dd>" +
    escapeHtml(String(q.confidence)) +
    "%</dd>" +
    "<dt>Contains Math</dt><dd>" +
    (q.containsMath ? "Yes" : "No") +
    "</dd>" +
    "<dt>Solve Status</dt><dd>" +
    escapeHtml(jobStatus) +
    "</dd>";
}

/**
 * After OCR detection: auto-solve high-confidence questions only.
 * Low-confidence → needs-verify (user must edit + Solve).
 */
function startSolvingDetectedQuestions(questions) {
  if (state.solveCancel) {
    state.solveCancel();
    state.solveCancel = null;
  }

  state.solutions = Object.create(null);
  state.solveStatus = Object.create(null);

  const threshold =
    window.OcrSolveBridge && window.OcrSolveBridge.lowConfidenceThreshold
      ? window.OcrSolveBridge.lowConfidenceThreshold(state.config)
      : Number(
          (state.config &&
            state.config.limits &&
            state.config.limits.lowConfidenceThreshold) ||
            40
        );

  (questions || []).forEach(function (q) {
    const conf = typeof q.confidence === "number" ? q.confidence : 0;
    if (conf > 0 && conf < threshold) {
      state.solveStatus[q.id] = "needs-verify";
      state.solutions[q.id] = null;
    } else {
      state.solveStatus[q.id] = "pending";
    }
  });
  renderQuestions();
  if (state.selectedQuestionId) {
    selectQuestion(state.selectedQuestionId);
  }

  if (!questions || !questions.length) {
    setStatus("No questions detected to solve.");
    return;
  }

  if (!window.OcrSolveBridge) {
    setStatus("OCR→Solver bridge unavailable.");
    return;
  }

  const autoList = questions.filter(function (q) {
    return state.solveStatus[q.id] !== "needs-verify";
  });
  const skipped = questions.length - autoList.length;

  if (!autoList.length) {
    setStatus(
      "Detected " +
        questions.length +
        " question(s). Low OCR confidence — verify and click Solve."
    );
    setProgress(100);
    return;
  }

  setStatus(
    "Solving " +
      autoList.length +
      " question(s)" +
      (skipped ? " (" + skipped + " need verification)" : "") +
      "…"
  );

  const job = window.OcrSolveBridge.solveAll(autoList, {
    config: state.config,
    onQuestionStart: function (q) {
      state.solveStatus[q.id] = "solving";
      renderQuestions();
      if (q.id === state.selectedQuestionId) selectQuestion(q.id);
    },
    onQuestionDone: function (q, sol, _i, _n, meta) {
      state.solutions[q.id] = sol;
      if (meta && meta.skipped) {
        state.solveStatus[q.id] = "needs-verify";
      } else {
        const failed =
          !sol ||
          sol.status === "error" ||
          sol.status === "unsupported" ||
          (sol.error && sol.error.code);
        state.solveStatus[q.id] = failed ? "error" : "done";
      }
      renderQuestions();
      if (q.id === state.selectedQuestionId) selectQuestion(q.id);
    },
    onProgress: function (p) {
      if (p.total > 0) {
        setProgress(Math.round(((p.index + 1) / p.total) * 100));
      }
    }
  });

  state.solveCancel = job.cancel;

  job.promise
    .then(function () {
      const done = questions.filter(function (q) {
        return state.solveStatus[q.id] === "done";
      }).length;
      const verify = questions.filter(function (q) {
        return state.solveStatus[q.id] === "needs-verify";
      }).length;
      setStatus(
        "Solved " +
          done +
          "/" +
          questions.length +
          (verify ? " · " + verify + " need verification" : "") +
          ". Select a question to review."
      );
      setProgress(100);
      state.solveCancel = null;
    })
    .catch(function (err) {
      if (err && err.name === "AbortError") return;
      console.error(err);
      setStatus(err.message || "Solving failed.");
      state.solveCancel = null;
    });
}

/**
 * Apply editor text and solve the selected question (user-initiated).
 */
async function solveSelectedQuestion() {
  const id = state.selectedQuestionId;
  const q = state.questions.find(function (item) {
    return item.id === id;
  });
  if (!q || !window.OcrSolveBridge) {
    setStatus("Select a detected question first.");
    return;
  }

  const edited = els.questionEdit
    ? String(els.questionEdit.value || "").trim()
    : "";
  if (edited) {
    q.text = edited;
    q.recognizedText = edited;
  }

  state.solveStatus[q.id] = "solving";
  renderQuestions();
  selectQuestion(q.id);
  setStatus("Solving…");

  try {
    const sol = await window.OcrSolveBridge.solveOne(q, {
      config: state.config,
      forceSolve: true,
      checkConfidence: false
    });
    if (state.ocrDurationMs != null) {
      sol.ocrDurationMs = state.ocrDurationMs;
    }
    state.solutions[q.id] = sol;
    const failed =
      !sol ||
      sol.status === "error" ||
      sol.status === "unsupported" ||
      (sol.error && sol.error.code);
    state.solveStatus[q.id] = failed ? "error" : "done";
    renderQuestions();
    selectQuestion(q.id);
    setStatus(
      failed
        ? (sol.error && sol.error.message) || "Solve failed — see error."
        : "Solved in " + formatMs(sol.solveDurationMs) + "."
    );
  } catch (err) {
    state.solveStatus[q.id] = "error";
    setStatus(err.message || "Solve failed.");
    renderQuestions();
    selectQuestion(q.id);
  }
}

function clearSelectedResult() {
  const id = state.selectedQuestionId;
  if (!id) return;
  delete state.solutions[id];
  const q = state.questions.find(function (item) {
    return item.id === id;
  });
  const threshold =
    window.OcrSolveBridge && window.OcrSolveBridge.lowConfidenceThreshold
      ? window.OcrSolveBridge.lowConfidenceThreshold(state.config)
      : 40;
  if (
    q &&
    typeof q.confidence === "number" &&
    q.confidence > 0 &&
    q.confidence < threshold
  ) {
    state.solveStatus[id] = "needs-verify";
  } else {
    state.solveStatus[id] = "pending";
  }
  renderQuestions();
  selectQuestion(id);
  setStatus("Result cleared.");
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function handleFile(file) {
  if (!file) return;

  const maxImageMb = mbLimit("maxImageSizeMb", 15);
  const maxPdfMb = mbLimit("maxPdfSizeMb", 20);
  const maxPages = mbLimit("maxPdfPages", 50);

  if (isPdfFile(file)) {
    if (file.size > maxPdfMb * 1024 * 1024) {
      setStatus("PDF exceeds maximum size of " + maxPdfMb + " MB.");
      return;
    }
    setStatus("Rendering PDF pages locally…");
    setProgress(5);
    const buffer = await file.arrayBuffer();
    const pages = await window.PdfPageRenderer.renderPages(buffer, {
      scale: 2,
      onPage: function (page, total) {
        setProgress(Math.round((page.page / total) * 40));
        setStatus("Rendered page " + page.page + " / " + total);
      }
    });
    if (pages.length > maxPages) {
      setStatus("PDF has more than " + maxPages + " pages. Limit exceeded.");
      return;
    }
    state.mode = "pdf";
    state.fileName = file.name;
    state.sourceCanvas = null;
    state.pdfPages = pages;
    state.pageIndex = 0;
    state.displayRotation = 0;
    state.questions = [];
    renderQuestions();
    drawDocument();
    updateChrome();
    setProgress(0);
    setStatus("PDF ready (" + pages.length + " pages). Run OCR + Detect.");
    return;
  }

  if (!isImageFile(file)) {
    setStatus("Unsupported format. Use JPG, JPEG, PNG, WEBP, or PDF.");
    return;
  }

  if (file.size > maxImageMb * 1024 * 1024) {
    setStatus("Image exceeds maximum size of " + maxImageMb + " MB.");
    return;
  }

  const canvas = await loadImageFile(file);
  state.mode = "image";
  state.fileName = file.name;
  state.sourceCanvas = canvas;
  state.pdfPages = [];
  state.pageIndex = 0;
  state.displayRotation = 0;
  state.questions = [];
  renderQuestions();
  drawDocument();
  updateChrome();
  setStatus("Image ready. Optionally crop/rotate, then Run OCR + Detect.");
}

async function runPipeline() {
  if (state.busy) return;
  const providerId = els.ocrProvider.value || "tesseract";

  try {
    window.OcrEngine.setProvider(providerId);
  } catch (err) {
    setStatus(err.message);
    return;
  }

  state.busy = true;
  updateChrome();
  if (state.solveCancel) {
    state.solveCancel();
    state.solveCancel = null;
  }
  state.questions = [];
  state.solutions = Object.create(null);
  state.solveStatus = Object.create(null);
  state.selectedQuestionId = null;
  els.questionPreview.hidden = true;
  renderQuestions();

  try {
    if (state.mode === "image") {
      await processImageDocument();
    } else if (state.mode === "pdf") {
      await processPdfDocument();
    } else {
      setStatus("Load a document first.");
    }
  } catch (err) {
    console.error(err);
    setStatus(err.message || "OCR pipeline failed.");
    setProgress(0);
  } finally {
    state.busy = false;
    updateChrome();
  }
}

async function processImageDocument() {
  const canvas = getWorkingCanvas();
  if (!canvas) throw new Error("No image to process");
  setStatus("Running local OCR…");
  setProgress(10);
  const ocrStarted = Date.now();

  if (window.SolverEvents) {
    window.SolverEvents.emit(window.SolverEvents.OCR_STARTED, { mode: "image" });
  }

  const blob = await canvasToBlob(canvas);
  const cacheKey = window.OcrCache
    ? await window.OcrCache.fingerprint(
        { name: state.fileName, size: blob.size, lastModified: 0 },
        {
          page: 1,
          provider: window.OcrEngine.getProvider(),
          rotation: state.displayRotation
        }
      )
    : null;

  let result = null;
  if (cacheKey && window.OcrCache) {
    const cached = await window.OcrCache.get(cacheKey);
    if (cached && cached.value) {
      result = cached.value;
      if (window.SolverEvents) {
        window.SolverEvents.emit(window.SolverEvents.OCR_CACHE_HIT, {
          key: cacheKey
        });
      }
      setStatus("Loaded OCR from local cache.");
    }
  }

  if (!result) {
    result = await window.OcrEngine.recognize(blob, {
      language: "eng",
      page: 1,
      timeoutMs:
        (state.config &&
          state.config.limits &&
          state.config.limits.ocrTimeoutMs) ||
        120000,
      onProgress: function (m) {
        if (m.status === "recognizing text" && m.progress != null) {
          setProgress(10 + Math.round(m.progress * 80));
          setStatus("OCR " + Math.round(m.progress * 100) + "%");
          if (window.SolverEvents) {
            window.SolverEvents.emit(window.SolverEvents.OCR_PROGRESS, m);
          }
        }
      }
    });
    if (cacheKey && window.OcrCache) {
      await window.OcrCache.set(cacheKey, result);
    }
  }

  state.ocrDurationMs = Date.now() - ocrStarted;
  updateTimingRow(null);
  setConfidence(result.confidence);
  const ocrText = String(result.text || "").trim();
  if (!ocrText) {
    state.questions = [];
    renderQuestions();
    setProgress(100);
    setStatus(
      "Unreadable OCR — no text detected on page 1. (OCR " +
        formatMs(state.ocrDurationMs) +
        ")"
    );
    return;
  }

  const detected = window.QuestionDetector.detect(result.text, {
    page: 1,
    confidence: result.confidence,
    language: result.language,
    ocrBlocks: result.blocks
  });

  state.questions = detected;
  renderQuestions();
  if (window.SolverEvents) {
    window.SolverEvents.emit(window.SolverEvents.QUESTIONS_DETECTED, {
      count: detected.length
    });
    window.SolverEvents.emit(window.SolverEvents.OCR_DONE, {
      pages: 1,
      durationMs: state.ocrDurationMs
    });
  }
  setProgress(100);
  setStatus(
    "OCR " +
      formatMs(state.ocrDurationMs) +
      " · Detected " +
      detected.length +
      " question(s)."
  );
  if (detected[0]) selectQuestion(detected[0].id);
  startSolvingDetectedQuestions(detected);
}

async function processPdfDocument() {
  if (!state.pdfPages.length) throw new Error("No PDF pages loaded");
  const all = [];
  const total = state.pdfPages.length;
  let confidenceSum = 0;
  const ocrStarted = Date.now();

  for (let i = 0; i < total; i += 1) {
    const page = state.pdfPages[i];
    state.pageIndex = i;
    drawDocument();
    updateChrome();
    setStatus("OCR page " + page.page + " / " + total + " (local)…");
    setProgress(Math.round((i / total) * 100));

    const blob = page.blob || (await canvasToBlob(page.canvas));
    const result = await window.OcrEngine.recognize(blob, {
      language: "eng",
      onProgress: function (m) {
        if (m.status === "recognizing text" && m.progress != null) {
          const base = (i / total) * 100;
          const slice = (1 / total) * 100;
          setProgress(Math.round(base + m.progress * slice));
        }
      }
    });

    confidenceSum += Number(result.confidence) || 0;
    const pageText = String(result.text || "").trim();
    if (!pageText) {
      continue;
    }
    const detected = window.QuestionDetector.detect(result.text, {
      page: page.page,
      confidence: result.confidence,
      language: result.language,
      ocrBlocks: result.blocks
    });
    Array.prototype.push.apply(all, detected);
  }

  state.ocrDurationMs = Date.now() - ocrStarted;
  updateTimingRow(null);
  state.questions = all;
  renderQuestions();
  setConfidence(total ? confidenceSum / total : null);
  setProgress(100);
  setStatus(
    "OCR " +
      formatMs(state.ocrDurationMs) +
      " · " +
      total +
      " page(s) · " +
      all.length +
      " question(s)."
  );
  if (all[0]) selectQuestion(all[0].id);
  startSolvingDetectedQuestions(all);
}

/* Crop interaction (image only) */
function canvasPointFromEvent(evt) {
  const rect = els.docCanvas.getBoundingClientRect();
  const scaleX = els.docCanvas.width / rect.width;
  const scaleY = els.docCanvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}

function enableCrop(on) {
  state.cropMode = on;
  state.cropStart = null;
  state.cropRect = null;
  els.docCanvas.classList.toggle("cropping", on);
  els.applyCropBtn.hidden = !on;
  els.cancelCropBtn.hidden = !on;
  drawDocument();
}

function applyCrop() {
  if (state.mode !== "image" || !state.cropRect) return;
  const working = getWorkingCanvas();
  const cropped = cropCanvas(working, state.cropRect);
  state.sourceCanvas = cropped;
  state.displayRotation = 0;
  enableCrop(false);
  drawDocument();
  setStatus("Crop applied. Run OCR + Detect when ready.");
}

/* Camera */
async function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus("Camera not available.");
    return;
  }
  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    els.cameraVideo.srcObject = state.cameraStream;
    els.cameraPanel.hidden = false;
    setStatus("Camera open — capture a clear photo of the problem.");
  } catch (err) {
    setStatus("Camera permission denied or unavailable.");
  }
}

function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(function (t) {
      t.stop();
    });
    state.cameraStream = null;
  }
  els.cameraVideo.srcObject = null;
  els.cameraPanel.hidden = true;
}

function capturePhoto() {
  const video = els.cameraVideo;
  const canvas = els.cameraCanvas;
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  out.getContext("2d").drawImage(canvas, 0, 0);
  state.mode = "image";
  state.fileName = "camera-capture.png";
  state.sourceCanvas = out;
  state.pdfPages = [];
  state.displayRotation = 0;
  stopCamera();
  drawDocument();
  updateChrome();
  setStatus("Capture saved locally. Optionally crop/rotate, then Run OCR + Detect.");
}

function fillProviders() {
  const list =
    (state.config && state.config.ocr && state.config.ocr.providers) ||
    window.OcrEngine.list();
  els.ocrProvider.innerHTML = "";
  list.forEach(function (p) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label + (p.available === false ? " (soon)" : "");
    opt.disabled = p.available === false;
    els.ocrProvider.appendChild(opt);
  });
  const defaultId =
    (state.config && state.config.ocr && state.config.ocr.defaultProvider) ||
    "tesseract";
  els.ocrProvider.value = defaultId;
  try {
    window.OcrEngine.setProvider(defaultId);
  } catch (e) {
    /* ignore */
  }
}

function bindEvents() {
  els.fileInput.addEventListener("change", function () {
    handleFile(els.fileInput.files[0]).catch(function (err) {
      setStatus(err.message || "Failed to load file");
    });
  });

  els.cameraBtn.addEventListener("click", openCamera);
  els.captureBtn.addEventListener("click", capturePhoto);
  els.closeCameraBtn.addEventListener("click", stopCamera);
  els.runPipelineBtn.addEventListener("click", runPipeline);
  els.clearBtn.addEventListener("click", clearAll);

  if (els.solveBtn) {
    els.solveBtn.addEventListener("click", function () {
      solveSelectedQuestion();
    });
  }
  if (els.retrySolveBtn) {
    els.retrySolveBtn.addEventListener("click", function () {
      solveSelectedQuestion();
    });
  }
  if (els.clearResultBtn) {
    els.clearResultBtn.addEventListener("click", clearSelectedResult);
  }
  if (els.copySolutionBtn) {
    els.copySolutionBtn.addEventListener("click", function () {
      const id = state.selectedQuestionId;
      const q = state.questions.find(function (item) {
        return item.id === id;
      });
      const sol = state.solutions[id];
      copyText(buildSolutionCopyText(sol, q), "Solution copied.");
    });
  }
  if (els.copyAnswerBtn) {
    els.copyAnswerBtn.addEventListener("click", function () {
      const sol = state.solutions[state.selectedQuestionId];
      copyText(
        sol && sol.finalAnswer != null ? String(sol.finalAnswer) : "",
        "Final answer copied."
      );
    });
  }

  els.rotateLeftBtn.addEventListener("click", function () {
    if (state.mode !== "image") return;
    state.displayRotation = (state.displayRotation - 90) % 360;
    drawDocument();
  });
  els.rotateRightBtn.addEventListener("click", function () {
    if (state.mode !== "image") return;
    state.displayRotation = (state.displayRotation + 90) % 360;
    drawDocument();
  });
  els.cropToggleBtn.addEventListener("click", function () {
    if (state.mode !== "image") return;
    enableCrop(!state.cropMode);
  });
  els.applyCropBtn.addEventListener("click", applyCrop);
  els.cancelCropBtn.addEventListener("click", function () {
    enableCrop(false);
  });

  els.prevPageBtn.addEventListener("click", function () {
    if (state.pageIndex > 0) {
      state.pageIndex -= 1;
      drawDocument();
      updateChrome();
    }
  });
  els.nextPageBtn.addEventListener("click", function () {
    if (state.pageIndex < state.pdfPages.length - 1) {
      state.pageIndex += 1;
      drawDocument();
      updateChrome();
    }
  });

  els.docCanvas.addEventListener("mousedown", function (evt) {
    if (!state.cropMode || state.mode !== "image") return;
    state.cropStart = canvasPointFromEvent(evt);
    state.cropRect = {
      x: state.cropStart.x,
      y: state.cropStart.y,
      width: 0,
      height: 0
    };
  });
  els.docCanvas.addEventListener("mousemove", function (evt) {
    if (!state.cropMode || !state.cropStart) return;
    const pt = canvasPointFromEvent(evt);
    state.cropRect = {
      x: Math.min(state.cropStart.x, pt.x),
      y: Math.min(state.cropStart.y, pt.y),
      width: Math.abs(pt.x - state.cropStart.x),
      height: Math.abs(pt.y - state.cropStart.y)
    };
    drawDocument();
  });
  window.addEventListener("mouseup", function () {
    state.cropStart = null;
  });

  ["dragenter", "dragover"].forEach(function (name) {
    els.dropZone.addEventListener(name, function (e) {
      e.preventDefault();
      els.dropZone.classList.add("drag-over");
    });
  });
  ["dragleave", "drop"].forEach(function (name) {
    els.dropZone.addEventListener(name, function (e) {
      e.preventDefault();
      els.dropZone.classList.remove("drag-over");
    });
  });
  els.dropZone.addEventListener("drop", function (e) {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file).catch(function (err) {
      setStatus(err.message || "Failed to load file");
    });
  });
  els.dropZone.addEventListener("click", function () {
    els.fileInput.click();
  });

  const zoomIn = document.getElementById("zoomInBtn");
  const zoomOut = document.getElementById("zoomOutBtn");
  const zoomReset = document.getElementById("zoomResetBtn");
  if (zoomIn) {
    zoomIn.addEventListener("click", function () {
      state.zoom = Math.min(3, state.zoom + 0.1);
      drawDocument();
    });
  }
  if (zoomOut) {
    zoomOut.addEventListener("click", function () {
      state.zoom = Math.max(0.4, state.zoom - 0.1);
      drawDocument();
    });
  }
  if (zoomReset) {
    zoomReset.addEventListener("click", function () {
      state.zoom = 1;
      drawDocument();
    });
  }

  window.addEventListener("beforeunload", stopCamera);
}

async function boot() {
  try {
    const res = await fetch("../data/ai-math-solver.json");
    state.config = await res.json();
  } catch (err) {
    state.config = {
      limits: { maxPdfSizeMb: 20, maxImageSizeMb: 15, maxPdfPages: 50 },
      ocr: { defaultProvider: "tesseract", providers: window.OcrEngine.list() },
      accessibility: { darkMode: true, highContrast: true }
    };
  }

  if (window.OcrEngine && window.OcrEngine.configure) {
    window.OcrEngine.configure(state.config);
  }
  if (window.SolverEngine && window.SolverEngine.configure) {
    window.SolverEngine.configure(state.config);
  }

  if (state.config.accessibility) {
    if (state.config.accessibility.darkMode !== false) {
      document.body.classList.add("solver-dark");
    }
    if (state.config.accessibility.highContrast) {
      document.body.classList.add("solver-high-contrast");
    }
  }

  fillProviders();
  bindEvents();
  drawDocument();
  updateChrome();
  setStatus("Phase 8C ready — Geometry Rule Engine (angles, lines, triangle basics).");

  window.MathGeniusSolver = {
    phase: "8C",
    architecture: "plugin-based",
    getQuestions: function () {
      return state.questions.slice();
    },
    getSolutions: function () {
      return Object.assign({}, state.solutions);
    },
    lookupFormula: function (formulaId) {
      return window.CurriculumMapper
        ? window.CurriculumMapper.lookup(formulaId)
        : null;
    },
    getOcrProviders: function () {
      return window.OcrEngine.list();
    },
    getSolverProviders: function () {
      return window.SolverEngine ? window.SolverEngine.list() : [];
    },
    solveQuestion: function (question, options) {
      if (window.OcrSolveBridge) {
        return window.OcrSolveBridge.solveOne(question, {
          config: state.config,
          explanationMode: options && options.explanationMode,
          language: options && options.language,
          signal: options && options.signal
        });
      }
      if (!window.SolverEngine) {
        return Promise.reject(new Error("SolverEngine unavailable"));
      }
      return window.SolverEngine.solve(question, options);
    },
    events: window.SolverEvents || null,
    documentManager: window.DocumentManager || null,
    solverEngine: window.SolverEngine || null,
    solutionPipeline: window.SolutionPipeline || null,
    ocrSolveBridge: window.OcrSolveBridge || null
  };
}

document.addEventListener("DOMContentLoaded", boot);
