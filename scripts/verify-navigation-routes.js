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
      "\nthis.getClassStudyMaterials = getClassStudyMaterials;",
    context
  );
  return context;
}

const nav = loadNavigationApi();
let failed = 0;

console.log("=== Core pages ===");
const corePages = [
  "pages/home.html",
  "pages/tools.html",
  "pages/formula-library.html",
  "pages/probability/class7.html",
  "pages/probability/index.html"
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

console.log("\n=== Manifest study-material paths ===");
let manifestCount = 0;

for (const level of nav.CLASS_LEVELS) {
  const materials = nav.getClassStudyMaterials(level);
  console.log("\nClass " + level + " (" + materials.length + " topics):");

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
    if (!exists) failed++;
  }
}

console.log("\n=== Summary ===");
console.log("Manifest entries:", manifestCount);
console.log("Expected study pages:", manifestCount);

if (manifestCount !== 56) {
  console.log("WARNING: expected 56 manifest entries, got " + manifestCount);
  failed++;
}

console.log(failed ? "\nFAILED: " + failed + " issues" : "\nAll manifest routes valid.");

process.exit(failed ? 1 : 0);
