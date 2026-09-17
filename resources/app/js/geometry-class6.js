/**
 * Class 6 Geometry — lightweight interactive examples.
 * Reuses LocalRuleGeometry (Phase 8C); does not change the engine.
 * Teaching content on this page is Class 6. Solving is not blocked by class.
 */
(function () {
  "use strict";

  const Ge = window.LocalRuleGeometry;
  const CL = window.CurriculumLevel;
  const input = document.getElementById("geQuestionInput");
  const output = document.getElementById("geSolveOutput");
  const solveBtn = document.getElementById("geSolveBtn");
  const CURRENT_CLASS = 6;

  if (!Ge || !input || !output || !solveBtn) {
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
      "<ol class=\"ge-steps\">" +
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
        '<p class="ge-result-heading">Result</p>' +
        '<p class="ge-result-error">Could not analyse this question. Try a point, line, ray, line segment, parallel or intersecting lines, an angle type, or triangle classification.</p>' +
        notice;
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="ge-result-heading">Result</p>' +
        '<p class="ge-result-error"><strong>Not supported by the Geometry engine:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>" +
        notice;
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="ge-result-heading">Result</p>' +
      '<p class="ge-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
      notice +
      '<p class="ge-result-heading">Explanation</p>' +
      (sol.given
        ? '<p class="ge-result-meta"><strong>Given:</strong> ' +
          escapeHtml(sol.given) +
          "</p>"
        : "") +
      (sol.find
        ? '<p class="ge-result-meta"><strong>Find:</strong> ' +
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
        '<p class="ge-result-heading">Result</p>' +
        '<p class="ge-result-error">Type or edit a question in the box, then click Solve with Geometry Engine.</p>';
      output.hidden = false;
      return;
    }

    input.value = raw;
    showResult(Ge.trySolve(raw), raw);
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

  document.querySelectorAll("[data-ge-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fillQuestion(btn.getAttribute("data-ge-example") || "");
    });
  });
})();
