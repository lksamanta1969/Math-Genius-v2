/**
 * Class 7 Mensuration — lightweight interactive examples.
 * Reuses LocalRuleMensuration (Phase 8D); does not change the engine.
 * Teaching content on this page is Class 7. Solving is not blocked by class.
 * Parallelogram is lesson content only; Try It uses circle circumference/area.
 */
(function () {
  "use strict";

  const Me = window.LocalRuleMensuration;
  const CL = window.CurriculumLevel;
  const input = document.getElementById("meQuestionInput");
  const output = document.getElementById("meSolveOutput");
  const solveBtn = document.getElementById("meSolveBtn");
  const CURRENT_CLASS = 7;

  if (!Me || !input || !output || !solveBtn) {
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
      "<ol class=\"me-steps\">" +
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
        '<p class="me-result-heading">Result</p>' +
        '<p class="me-result-error">Could not analyse this question. Try circumference or area of a circle. Parallelogram area is lesson content only.</p>' +
        notice;
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="me-result-heading">Result</p>' +
        '<p class="me-result-error"><strong>Not supported by the Mensuration engine:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>" +
        notice;
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="me-result-heading">Result</p>' +
      '<p class="me-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
      notice +
      '<p class="me-result-heading">Explanation</p>' +
      (sol.given
        ? '<p class="me-result-meta"><strong>Given:</strong> ' +
          escapeHtml(sol.given) +
          "</p>"
        : "") +
      (sol.find
        ? '<p class="me-result-meta"><strong>Find:</strong> ' +
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
        '<p class="me-result-heading">Result</p>' +
        '<p class="me-result-error">Type or edit a question in the box, then click Solve with Mensuration Engine.</p>';
      output.hidden = false;
      return;
    }

    input.value = raw;
    showResult(Me.trySolve(raw), raw);
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

  document.querySelectorAll("[data-me-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fillQuestion(btn.getAttribute("data-me-example") || "");
    });
  });
})();
