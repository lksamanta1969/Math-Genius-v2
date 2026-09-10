/**
 * Class 6 Mensuration — lightweight interactive examples.
 * Reuses LocalRuleMensuration (Phase 8D); does not change the engine.
 * This page accepts only Class 6 square / rectangle / triangle perimeter and area.
 */
(function () {
  "use strict";

  const Me = window.LocalRuleMensuration;
  const input = document.getElementById("meQuestionInput");
  const output = document.getElementById("meSolveOutput");
  const solveBtn = document.getElementById("meSolveBtn");

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

  function isOutsideClass6Scope(text) {
    const t = String(text || "").toLowerCase();
    if (
      /\bcircle\b/.test(t) ||
      /\bcircumference\b/.test(t) ||
      /\bradius\b/.test(t) ||
      /\bdiameter\b/.test(t) ||
      /\bπ\b/.test(t) ||
      /\bpi\b/.test(t) ||
      /cbse-c7-me-00[23]/i.test(t)
    ) {
      return true;
    }
    return false;
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

  function showResult(sol) {
    if (!sol) {
      output.innerHTML =
        '<p class="me-result-error">Could not analyse this question. Try a square, rectangle, or triangle perimeter or area question.</p>';
      output.hidden = false;
      return;
    }

    if (sol.unsupported) {
      output.innerHTML =
        '<p class="me-result-error"><strong>Not supported on this page:</strong> ' +
        escapeHtml(sol.reason || "Unsupported question type") +
        "</p>";
      output.hidden = false;
      return;
    }

    output.innerHTML =
      '<p class="me-result-ok"><strong>Answer:</strong> ' +
      escapeHtml(sol.finalAnswer) +
      "</p>" +
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

    if (isOutsideClass6Scope(q)) {
      showResult({
        unsupported: true,
        reason:
          "Circle circumference and circle area are Class 7 Mensuration. This Class 6 page covers only square, rectangle, and triangle perimeter and area."
      });
      return;
    }

    showResult(Me.trySolve(q));
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
