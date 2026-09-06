const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appRoot = path.join(__dirname, "..", "resources", "app");
const pagesRoot = path.join(appRoot, "pages");

function loadNavigationApi() {
  const script = fs.readFileSync(path.join(appRoot, "data", "navigation.js"), "utf8");
  const context = { console: console };
  vm.createContext(context);
  vm.runInContext(
    script +
      "\nthis.CLASS_LEVELS = CLASS_LEVELS;" +
      "\nthis.getClassStudyMaterials = getClassStudyMaterials;" +
      "\nthis.validateStudyReturnPath = validateStudyReturnPath;" +
      "\nthis.buildClassFirstStudyHref = buildClassFirstStudyHref;" +
      "\nthis.classMathematicsReturnPath = classMathematicsReturnPath;",
    context
  );
  return context;
}

const nav = loadNavigationApi();
let failed = 0;

function fail(message) {
  console.log("FAIL  " + message);
  failed++;
}

function ok(message) {
  console.log("OK  " + message);
}

console.log("=== Core pages ===");
const corePages = [
  "pages/home.html",
  "pages/tools.html",
  "pages/formula-library.html",
  "pages/probability/class7.html",
  "pages/probability/index.html",
  "pages/statistics/class7.html",
  "pages/statistics/index.html"
];

for (const rel of corePages) {
  const full = path.join(appRoot, rel.replace(/^pages\//, "pages/"));
  const exists = fs.existsSync(full);
  console.log((exists ? "OK" : "MISSING") + "  " + rel);
  if (!exists) failed++;
}

console.log("\n=== Class index pages ===");
for (const level of nav.CLASS_LEVELS) {
  const rel = "pages/class" + level + "/index.html";
  const full = path.join(pagesRoot, "class" + level, "index.html");
  const mathRel = "pages/class" + level + "/mathematics.html";
  const mathFull = path.join(pagesRoot, "class" + level, "mathematics.html");
  if (!fs.existsSync(full)) {
    console.log("MISSING  " + rel);
    failed++;
  } else {
    console.log("OK  " + rel);
  }
  if (!fs.existsSync(mathFull)) {
    console.log("MISSING  " + mathRel);
    failed++;
  } else {
    console.log("OK  " + mathRel);
  }
}

console.log("\n=== Available study-material navigation cards ===");
let manifestCount = 0;
const expectedCounts = {
  6: 0,
  7: 2,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0
};

for (const level of nav.CLASS_LEVELS) {
  const materials = nav.getClassStudyMaterials(level);
  console.log("\nClass " + level + " (" + materials.length + " topics):");

  if (materials.length !== expectedCounts[level]) {
    fail(
      "Class " + level + " expected " + expectedCounts[level] + " cards, got " + materials.length
    );
  } else {
    ok("Class " + level + " card count matches expectation (" + materials.length + ")");
  }

  for (const entry of materials) {
    manifestCount++;
    const rel = entry.path.replace(/^\.\.\//, "pages/");
    const full = path.join(pagesRoot, entry.path.replace(/^\.\.\//, ""));
    const exists = fs.existsSync(full);
    console.log(
      (exists ? "OK" : "MISSING") +
        "  [" +
        entry.category +
        "] " +
        entry.title +
        " -> " +
        rel
    );

    if (!exists) {
      failed++;
    }

    const html = exists ? fs.readFileSync(full, "utf8") : "";
    if (html.indexOf("Content is under development") !== -1) {
      fail("Placeholder page exposed in navigation: " + rel);
    }

    if (!entry.href || entry.href.indexOf("nav=class-first") === -1) {
      fail("Missing class-first navigation context on href for " + entry.title);
    } else {
      ok("Class-first href present for " + entry.title);
    }
  }
}

console.log("\n=== Back-navigation helpers ===");
if (nav.validateStudyReturnPath("../class7/mathematics.html")) {
  ok("validateStudyReturnPath accepts class mathematics return path");
} else {
  fail("validateStudyReturnPath rejected valid class mathematics return path");
}

if (!nav.validateStudyReturnPath("https://evil.example/phish")) {
  ok("validateStudyReturnPath rejects external URL");
} else {
  fail("validateStudyReturnPath accepted external URL");
}

if (!nav.validateStudyReturnPath("//evil.example/phish")) {
  ok("validateStudyReturnPath rejects protocol-relative URL");
} else {
  fail("validateStudyReturnPath accepted protocol-relative URL");
}

const classFirstHref = nav.buildClassFirstStudyHref("../probability/class7.html", 7);
if (
  classFirstHref.indexOf("nav=class-first") !== -1 &&
  classFirstHref.indexOf(encodeURIComponent("../class7/mathematics.html")) !== -1
) {
  ok("buildClassFirstStudyHref encodes class-first return context");
} else {
  fail("buildClassFirstStudyHref missing expected query parameters");
}

console.log("\n=== Summary ===");
console.log("Navigation cards exposed:", manifestCount);
console.log("Expected navigation cards:", 2);

if (manifestCount !== 2) {
  fail("Expected exactly 2 navigation cards across all classes, got " + manifestCount);
}

console.log(failed ? "\nFAILED: " + failed + " issues" : "\nAll navigation checks passed.");

process.exit(failed ? 1 : 0);
