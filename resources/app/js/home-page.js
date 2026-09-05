(function () {
  const container = document.getElementById("class-grid");

  if (!container) {
    return;
  }

  if (typeof CLASS_LEVELS === "undefined" || !Array.isArray(CLASS_LEVELS)) {
    console.error("CLASS_LEVELS is missing. Load navigation.js before home-page.js.");
    return;
  }

  const base = document.body.dataset.navBase || "";

  container.innerHTML = CLASS_LEVELS.map(function (level) {
    const label = typeof classRoman === "function" ? classRoman(level) : level;
    return (
      '<a class="card" href="' +
      base +
      "class" +
      level +
      '/index.html">' +
      "Class " +
      label +
      "</a>"
    );
  }).join("");
})();
