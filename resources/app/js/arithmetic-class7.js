/**
 * Class 7 Arithmetic — Integers chapter only.
 * Reuses LocalRuleNumbers (Phase 9); does not change the engine.
 * Teaching content on this page is CBSE-C7-AR-001 and CBSE-C7-AR-002.
 * Solving is not blocked by class.
 */
(function () {
  "use strict";

  const Nu = window.LocalRuleNumbers;
  const CL = window.CurriculumLevel;
  const input = document.getElementById("arQuestionInput");
  const output = document.getElementById("arSolveOutput");
  const solveBtn = document.getElementById("arSolveBtn");
  const CURRENT_CLASS = 7;

  if (!Nu || !input || !output || !solveBtn) {
    return;
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function levelNoticeHtml(text, sol) {
    if (!CL || !CL.noticeHtml) return "";
    return CL.noticeHtml(
      CL.estimateProblemClass(text, { solution: sol }),
      CURRENT_CLASS
    );
  }

  function renderSteps(steps) {
    if (!Array.isArray(steps) || !steps.length) {
      return "";
    }

    return (
      "<ol class=\"ar-steps\">" +
      steps
        .map(function (s) {
          return (
            "<li><strong>" +
            escapeHtml(s.title) +
            ":</strong> " +
            escapeHtml(s.description) +
            "</li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  function showResult(sol, questionText) {
    const notice = levelNoticeHtml(questionText, sol);

    if (!sol) {
      output.innerHTML =
        '<p class="ar-result-heading">Result</p>' +
        '<p class="ar-result-error">Could not analyse this question. Try integer addition, subtraction, or multiplication (sign rule).</p>' +
        notice;
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="ar-result-heading">Result</p>' +
        '<p class="ar-result-error"><strong>Not supported by the Numbers engine:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>" +
        notice;
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="ar-result-heading">Result</p>' +
      '<p class="ar-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
      notice +
      '<p class="ar-result-heading">Explanation</p>' +
      (sol.given
        ? '<p class="ar-result-meta"><strong>Given:</strong> ' +
          escapeHtml(sol.given) +
          "</p>"
        : "") +
      (sol.find
        ? '<p class="ar-result-meta"><strong>Find:</strong> ' +
          escapeHtml(sol.find) +
          "</p>"
        : "") +
      renderSteps(sol.steps);
    output.hidden = false;
  }

  function fillQuestion(text) {
    input.value = String(text || "");
    input.focus();
    if (typeof input.select === "function") {
      input.select();
    }
  }

  function solveQuestion(text) {
    const raw = String(text || "").trim();

    if (!raw) {
      output.innerHTML =
        '<p class="ar-result-heading">Result</p>' +
        '<p class="ar-result-error">Type or edit a question in the box, then click Solve with Numbers Engine.</p>';
      output.hidden = false;
      return;
    }

    input.value = raw;
    showResult(Nu.trySolve(raw), raw);
  }

  solveBtn.addEventListener("click", function () {
    solveQuestion(input.value);
  });

  input.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") {
      ev.preventDefault();
      solveQuestion(input.value);
    }
  });

  document.querySelectorAll("[data-ar-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fillQuestion(btn.getAttribute("data-ar-example") || "");
    });
  });
})();
