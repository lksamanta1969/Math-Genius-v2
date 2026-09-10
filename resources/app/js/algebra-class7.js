/**
 * Class 7 Algebra — lightweight interactive examples.
 * Reuses LocalRuleAlgebra (Phase 8B.4); no duplicate engine.
 */
(function () {
  "use strict";

  const Al = window.LocalRuleAlgebra;
  const input = document.getElementById("algQuestionInput");
  const output = document.getElementById("algSolveOutput");
  const solveBtn = document.getElementById("algSolveBtn");

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

  function showResult(sol) {
    if (!sol) {
      output.innerHTML =
        '<p class="alg-result-error">Could not analyse this question.</p>';
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="alg-result-error"><strong>Not supported on this page:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>";
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="alg-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
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

  function solveQuestion(text) {
    const q = String(text || "").trim();

    if (!q) {
      output.innerHTML =
        '<p class="alg-result-error">Type or choose an example question first.</p>';
      output.hidden = false;
      return;
    }

    input.value = q;
    showResult(Al.trySolve(q));
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
      solveQuestion(btn.getAttribute("data-alg-example") || "");
    });
  });
})();
