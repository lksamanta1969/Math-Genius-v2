(function () {
  const container = document.getElementById("class-grid");

  if (!container) {
    return;
  }

  if (typeof CLASS_LEVELS === "undefined" || !Array.isArray(CLASS_LEVELS)) {
    console.error("CLASS_LEVELS is missing. Load classes.js before subject-page.js.");
    return;
  }

  container.innerHTML = CLASS_LEVELS.map(function (level) {
    return (
      '<a class="card" href="class' +
      level +
      '.html">' +
      "Class " +
      level +
      "</a>"
    );
  }).join("");
})();
