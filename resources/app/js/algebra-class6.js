/**
 * Class 6 Algebra — lightweight interactive examples.
 * Reuses LocalRuleAlgebra (Phase 8B.4); does not change the engine.
 * Teaching content on this page is Class 6. Solving is not blocked by class.
 */
(function () {
  "use strict";

  const Al = window.LocalRuleAlgebra;
  const CL = window.CurriculumLevel;
  const input = document.getElementById("algQuestionInput");
  const output = document.getElementById("algSolveOutput");
  const solveBtn = document.getElementById("algSolveBtn");
  const CURRENT_CLASS = 6;

  if (!Al || !input || !output || !solveBtn) {
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
      "<ol class=\"alg-steps\">" +
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
        '<p class="alg-result-heading">Result</p>' +
        '<p class="alg-result-error">Could not analyse this question. Try like terms, evaluating an expression, a one-variable equation, or a missing-number sentence.</p>' +
        notice;
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="alg-result-heading">Result</p>' +
        '<p class="alg-result-error"><strong>Not supported by the Algebra engine:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>" +
        notice;
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="alg-result-heading">Result</p>' +
      '<p class="alg-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
      notice +
      '<p class="alg-result-heading">Explanation</p>' +
      (sol.given
        ? '<p class="alg-result-meta"><strong>Given:</strong> ' +
          escapeHtml(sol.given) +
          "</p>"
        : "") +
      (sol.find
        ? '<p class="alg-result-meta"><strong>Find:</strong> ' +
          escapeHtml(sol.find) +
          "</p>"
        : "") +
      renderSteps(sol.steps);
    output.hidden = false;
  }

  /**
   * Adapt Class 6 student wording to forms LocalRuleAlgebra already accepts.
   * Does not solve; does not change the engine.
   */
  function prepareQuestion(text) {
    var q = String(text || "")
      .replace(/\u2212/g, "-")
      .replace(/\s+/g, " ")
      .trim();

    var andEval = q.match(
      /^(.+?)\s+and\s+([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)\s*$/i
    );
    if (andEval && andEval[1].indexOf("=") === -1) {
      return (
        "evaluate " + andEval[1].trim() + " when " + andEval[2] + "=" + andEval[3]
      );
    }

    return q;
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
        '<p class="alg-result-heading">Result</p>' +
        '<p class="alg-result-error">Type or edit a question in the box, then click Solve with Algebra Engine.</p>';
      output.hidden = false;
      return;
    }

    input.value = raw;
    showResult(Al.trySolve(prepareQuestion(raw)), raw);
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

  document.querySelectorAll("[data-alg-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fillQuestion(btn.getAttribute("data-alg-example") || "");
    });
  });
})();
