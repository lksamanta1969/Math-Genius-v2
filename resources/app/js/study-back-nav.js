(function () {
  var backBtn = document.querySelector(".back-btn");

  if (!backBtn) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var navMode = params.get("nav");
  var classLevel = parseInt(params.get("class"), 10);
  var returnPath = params.get("return");
  var legacyHref = backBtn.getAttribute("href") || "index.html";
  var legacyLabel = backBtn.textContent || "← Back";

  function resolveClassRoman(level) {
    if (typeof classRoman === "function") {
      return classRoman(level);
    }

    var romanMap = {
      6: "VI",
      7: "VII",
      8: "VIII",
      9: "IX",
      10: "X",
      11: "XI",
      12: "XII"
    };

    return romanMap[level] || String(level);
  }

  function applyLegacyBack() {
    backBtn.setAttribute("href", legacyHref);
    backBtn.textContent = legacyLabel;
  }

  if (navMode !== "class-first") {
    applyLegacyBack();
    return;
  }

  if (typeof validateStudyReturnPath !== "function") {
    applyLegacyBack();
    return;
  }

  if (!validateStudyReturnPath(returnPath)) {
    applyLegacyBack();
    return;
  }

  backBtn.setAttribute("href", returnPath);
  backBtn.textContent =
    "← Back to Class " + resolveClassRoman(classLevel) + " Mathematics";
})();
