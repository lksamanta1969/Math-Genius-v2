(function () {
  const container = document.getElementById("subject-grid");
  const level = parseInt(document.body.dataset.classLevel, 10);

  if (!container || !level) {
    return;
  }

  if (typeof CLASS_SUBJECTS === "undefined" || !Array.isArray(CLASS_SUBJECTS)) {
    console.error("CLASS_SUBJECTS is missing. Load navigation.js before class-index.js.");
    return;
  }

  const roman = typeof classRoman === "function" ? classRoman(level) : level;
  const title = document.getElementById("class-title");
  const subtitle = document.getElementById("class-subtitle");

  if (title) {
    title.textContent = "Class " + roman;
  }

  if (subtitle) {
    subtitle.textContent = "Study Materials";
  }

  document.title = "Class " + roman + " - Math Genius";

  container.innerHTML = CLASS_SUBJECTS.map(function (subject) {
    return (
      '<a class="card" href="mathematics.html">' +
      subject.icon +
      "<br><br>" +
      subject.name +
      "</a>"
    );
  }).join("");
})();
