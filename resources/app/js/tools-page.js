(function () {
  const container = document.getElementById("tools-grid");

  if (!container) {
    return;
  }

  if (typeof GLOBAL_TOOLS === "undefined" || !Array.isArray(GLOBAL_TOOLS)) {
    console.error("GLOBAL_TOOLS is missing. Load navigation.js before tools-page.js.");
    return;
  }

  container.innerHTML = GLOBAL_TOOLS.map(function (tool) {
    return (
      '<a class="card" href="' +
      tool.href +
      '">' +
      tool.icon +
      "<br><br>" +
      tool.name +
      "</a>"
    );
  }).join("");
})();
