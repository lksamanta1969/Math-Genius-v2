(function () {
  const container = document.getElementById("topic-grid");
  const level = parseInt(document.body.dataset.classLevel, 10);

  if (!container || !level) {
    return;
  }

  if (typeof getClassStudyMaterials !== "function") {
    console.error("getClassStudyMaterials is missing. Load navigation.js before class-mathematics.js.");
    return;
  }

  const materials = getClassStudyMaterials(level);
  const roman = typeof classRoman === "function" ? classRoman(level) : level;
  const heading = document.getElementById("topic-heading");

  if (heading) {
    heading.textContent = "Class " + roman + " — Mathematics";
  }

  document.title = "Class " + roman + " Mathematics - Math Genius";

  if (materials.length === 0) {
    container.innerHTML =
      '<p class="page-desc">No study materials are listed for this class yet.</p>';
    return;
  }

  container.innerHTML = materials
    .map(function (entry) {
      return (
        '<a class="card topic-card" href="' +
        entry.path +
        '" data-category="' +
        entry.category +
        '">' +
        '<span class="topic-index">' +
        entry.order +
        ".</span> " +
        entry.icon +
        " " +
        entry.title +
        "</a>"
      );
    })
    .join("");
})();
