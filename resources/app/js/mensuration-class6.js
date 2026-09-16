/**
 * Class 6 Mensuration — lightweight interactive examples.
 * Reuses LocalRuleMensuration (Phase 8D); does not change the engine.
 * Teaching content on this page is Class 6. Solving is not blocked by class.
 */
(function () {
  "use strict";

  const Me = window.LocalRuleMensuration;
  const CL = window.CurriculumLevel;
  const input = document.getElementById("meQuestionInput");
  const output = document.getElementById("meSolveOutput");
  const solveBtn = document.getElementById("meSolveBtn");
  const CURRENT_CLASS = 6;

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
        '<p class="me-result-error">Could not analyse this question. Try a square, rectangle, or triangle perimeter or area question.</p>' +
        notice;
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="me-result-error"><strong>Not supported by the Mensuration engine:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>" +
        notice;
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="me-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
      notice +
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

  function solveQuestion(text) {
    const q = String(text || "").trim();

    if (!q) {
      output.innerHTML =
        '<p class="me-result-error">Type or choose an example question first.</p>';
      output.hidden = false;
      return;
    }

    input.value = q;
    showResult(Me.trySolve(q), q);
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
      solveQuestion(btn.getAttribute("data-me-example") || "");
    });
  });
})();
