/**
 * Class 7 Data Handling & Statistics — lightweight interactive examples.
 * Reuses LocalRuleStatistics (Phase 8E); no duplicate engine.
 */
(function () {
  "use strict";

  const St = window.LocalRuleStatistics;
  const input = document.getElementById("statQuestionInput");
  const output = document.getElementById("statSolveOutput");
  const solveBtn = document.getElementById("statSolveBtn");

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

  function showResult(sol) {
    if (!sol) {
      output.innerHTML =
        '<p class="stat-result-error">Could not analyse this question.</p>';
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="stat-result-error"><strong>Not supported on this page:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>";
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="stat-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
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

  function solveQuestion(text) {
    const q = String(text || "").trim();

    if (!q) {
      output.innerHTML =
        '<p class="stat-result-error">Type or choose an example question first.</p>';
      output.hidden = false;
      return;
    }

    input.value = q;
    showResult(St.trySolve(q));
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
      solveQuestion(btn.getAttribute("data-stat-example") || "");
    });
  });
})();
