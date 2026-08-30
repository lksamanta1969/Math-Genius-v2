"use strict";

/**
 * Canonical Formula Library search index builder (Phase 8B.5 schema).
 *
 * Output: { totalEntries, entries[], searchableFields, generatedAt, version? }
 * Used by expand scripts, validator, and formula-library tests.
 */

const fs = require("fs");
const path = require("path");

const SEARCHABLE_FIELDS = Object.freeze([
  "formulaName",
  "name",
  "keywords",
  "chapter",
  "topic",
  "searchText"
]);

function buildSearchIndex(db) {
  const entries = [];
  (db.boards || []).forEach(function (board) {
    (board.classes || []).forEach(function (cls) {
      (cls.subjects || []).forEach(function (subject) {
        (subject.chapters || []).forEach(function (chapter) {
          (chapter.formulas || []).forEach(function (f) {
            entries.push({
              id: f.id,
              boardId: board.id,
              board: f.board,
              classId: cls.id,
              class: f.class,
              subjectId: subject.id,
              subject: f.subject,
              chapterId: chapter.id,
              chapter: f.chapter,
              chapterNumber: f.chapterNumber,
              topic: f.topic || f.chapter,
              name: f.name,
              formulaName: f.formulaName || f.name,
              formula: f.formula,
              keywords: f.keywords || [],
              examTags: f.examTags || [],
              difficulty: f.difficulty,
              searchText: [
                f.name,
                f.formulaName,
                f.formula,
                f.latex,
                f.description,
                f.example,
                f.notes,
                f.subject,
                f.chapter,
                f.topic,
                f.class,
                f.board,
                (f.keywords || []).join(" "),
                (f.examTags || []).join(" ")
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
            });
          });
        });
      });
    });
  });

  return {
    version: db.version || null,
    generatedAt: new Date().toISOString(),
    totalEntries: entries.length,
    entries: entries,
    searchableFields: SEARCHABLE_FIELDS.slice()
  };
}

function writeSearchIndex(db, indexPath, generatedAt) {
  const index = buildSearchIndex(db);
  if (generatedAt) index.generatedAt = generatedAt;
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n", "utf8");
  return index;
}

if (require.main === module) {
  const ROOT = path.join(__dirname, "..", "..");
  const DATA_PATH = path.join(ROOT, "resources", "app", "data", "formula-library.json");
  const INDEX_PATH = path.join(ROOT, "resources", "app", "data", "formula-search-index.json");
  const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const index = writeSearchIndex(db, INDEX_PATH);
  console.log(
    JSON.stringify(
      {
        wrote: INDEX_PATH,
        totalEntries: index.totalEntries,
        version: index.version
      },
      null,
      2
    )
  );
}

module.exports = {
  SEARCHABLE_FIELDS: SEARCHABLE_FIELDS,
  buildSearchIndex: buildSearchIndex,
  writeSearchIndex: writeSearchIndex
};
