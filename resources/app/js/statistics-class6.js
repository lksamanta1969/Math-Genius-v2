/**
 * Class 6 Data Handling — lightweight interactive examples.
 * Reuses LocalRuleStatistics (Phase 8E); does not change the engine.
 * Teaching content on this page is Class 6. Solving is not blocked by class.
 */
(function () {
  "use strict";

  const St = window.LocalRuleStatistics;
  const CL = window.CurriculumLevel;
  const input = document.getElementById("statQuestionInput");
  const output = document.getElementById("statSolveOutput");
  const solveBtn = document.getElementById("statSolveBtn");
  const CURRENT_CLASS = 6;

  if (!St || !input || !output || !solveBtn) {
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
      "<ol class=\"stat-steps\">" +
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
        '<p class="stat-result-heading">Result</p>' +
        '<p class="stat-result-error">Could not analyse this question. Try a frequency table, pictograph, or bar-graph reading question.</p>' +
        notice;
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="stat-result-heading">Result</p>' +
        '<p class="stat-result-error"><strong>Not supported by the Statistics engine:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>" +
        notice;
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="stat-result-heading">Result</p>' +
      '<p class="stat-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
      notice +
      '<p class="stat-result-heading">Explanation</p>' +
      (sol.given
        ? '<p class="stat-result-meta"><strong>Given:</strong> ' +
          escapeHtml(sol.given) +
          "</p>"
        : "") +
      (sol.find
        ? '<p class="stat-result-meta"><strong>Find:</strong> ' +
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
        '<p class="stat-result-heading">Result</p>' +
        '<p class="stat-result-error">Type or edit a question in the box, then click Solve with Statistics Engine.</p>';
      output.hidden = false;
      return;
    }

    input.value = raw;
    showResult(St.trySolve(raw), raw);
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

  document.querySelectorAll("[data-stat-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fillQuestion(btn.getAttribute("data-stat-example") || "");
    });
  });
})();
