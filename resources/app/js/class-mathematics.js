(function () {
  const container = document.getElementById("topic-grid");
  const pageDesc = document.querySelector(".page-desc");
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
    if (pageDesc) {
      pageDesc.textContent =
        "Published Mathematics study materials for Class " +
        roman +
        " are not available yet. New topics will appear here as content is completed.";
    }

    container.innerHTML =
      '<p class="page-desc empty-state">No study topics are available to open yet. Please check back later.</p>';
    return;
  }

  if (pageDesc) {
    pageDesc.textContent = "Select a topic to open study material for this class.";
  }

  container.innerHTML = materials
    .map(function (entry) {
      const href = entry.href || entry.path;

      return (
        '<a class="card topic-card" href="' +
        href +
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
