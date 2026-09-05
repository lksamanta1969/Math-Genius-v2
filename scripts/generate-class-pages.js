const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "..", "resources", "app", "pages");
const romans = { 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII" };

function classIndexHtml(level, roman) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class ${roman} - Math Genius</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="../../css/theme.css">
    <link rel="stylesheet" href="../../css/cards.css">
    <link rel="stylesheet" href="../../css/formula.css">
</head>
<body data-class-level="${level}">
<div class="page-header">
    <a href="../home.html" class="back-btn">← Back to Home</a>
</div>
<div class="container">
    <h1 id="class-title">Class ${roman}</h1>
    <h2 id="class-subtitle">Study Materials</h2>
    <div id="subject-grid" class="card-grid"></div>
</div>
<script src="../../data/navigation.js"></script>
<script src="../../js/class-index.js"></script>
</body>
</html>`;
}

function mathematicsHtml(level, roman) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class ${roman} Mathematics - Math Genius</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="../../css/theme.css">
    <link rel="stylesheet" href="../../css/cards.css">
    <link rel="stylesheet" href="../../css/formula.css">
</head>
<body data-class-level="${level}">
<div class="page-header">
    <a href="index.html" class="back-btn">← Back to Class</a>
</div>
<div class="container">
    <h1 id="topic-heading">Class ${roman} — Mathematics</h1>
    <p class="page-desc">Select a topic to open study material for this class.</p>
    <div id="topic-grid" class="card-grid"></div>
</div>
<script src="../../data/navigation.js"></script>
<script src="../../js/class-mathematics.js"></script>
</body>
</html>`;
}

for (const level of [6, 7, 8, 9, 10, 11, 12]) {
  const dir = path.join(base, "class" + level);
  fs.mkdirSync(dir, { recursive: true });
  const roman = romans[level];
  fs.writeFileSync(path.join(dir, "index.html"), classIndexHtml(level, roman));
  fs.writeFileSync(path.join(dir, "mathematics.html"), mathematicsHtml(level, roman));
}

console.log("Generated class6–class12 index and mathematics pages.");
