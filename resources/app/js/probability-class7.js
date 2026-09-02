/**
 * Class 7 Probability — lightweight interactive examples.
 * Reuses LocalRuleProbability (Phase 8F M1–M2); no duplicate engine.
 */
(function () {
  "use strict";

  const Pr = window.LocalRuleProbability;
  const input = document.getElementById("probQuestionInput");
  const output = document.getElementById("probSolveOutput");
  const solveBtn = document.getElementById("probSolveBtn");

  if (!Pr || !input || !output || !solveBtn) {
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
      "<ol class=\"prob-steps\">" +
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

  function showResult(question, sol) {
    if (!sol) {
      output.innerHTML =
        '<p class="prob-result-error">Could not analyse this question.</p>';
      output.hidden = false;
      return;
    }
    if (sol.unsupported) {
      output.innerHTML =
        '<p class="prob-result-error"><strong>Not supported on this page:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>";
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="prob-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
      (sol.given
        ? '<p class="prob-result-meta"><strong>Given:</strong> ' +
          escapeHtml(sol.given) +
          "</p>"
        : "") +
      (sol.find
        ? '<p class="prob-result-meta"><strong>Find:</strong> ' +
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
        '<p class="prob-result-error">Type or choose an example question first.</p>';
      output.hidden = false;
      return;
    }
    input.value = q;
    showResult(q, Pr.trySolve(q));
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

  document.querySelectorAll("[data-prob-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      solveQuestion(btn.getAttribute("data-prob-example") || "");
    });
  });
})();
