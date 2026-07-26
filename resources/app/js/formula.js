"use strict";

/* ==========================================
   Math Genius — Formula Library
   Phase 1.5 Architecture (no formula content)
   Board → Class → Subject → Chapter →
   Formula List → Formula Details
   Data-driven: ../data/formula-library.json
========================================== */

const VIEWS = Object.freeze({
    BOARDS: "boards",
    CLASSES: "classes",
    SUBJECTS: "subjects",
    CHAPTERS: "chapters",
    FORMULAS: "formulas",
    DETAIL: "detail"
});

const DIFFICULTIES = Object.freeze(["Easy", "Medium", "Hard"]);

/** @type {object|null} */
let formulaDatabase = null;

const nav = {
    view: VIEWS.BOARDS,
    boardId: null,
    classId: null,
    subjectId: null,
    chapterId: null,
    formulaId: null,
    searching: false
};

/** Search / filter state — architecture ready for Phase 2+ */
const filters = {
    board: "",
    class: "",
    subject: "",
    chapter: "",
    difficulty: "",
    keyword: ""
};

/**
 * Client-side preference stores (architecture ready).
 * Persistence / UI activation waits for feature flags in JSON.
 */
const clientState = {
    favourites: [],
    recentlyViewed: []
};

const els = {
    breadcrumb: document.getElementById("formulaBreadcrumb"),
    sectionTitle: document.getElementById("navSectionTitle"),
    navGrid: document.getElementById("navGrid"),
    emptyState: document.getElementById("emptyState"),
    formulaSection: document.getElementById("formulaSection"),
    formulaCount: document.getElementById("formulaCount"),
    formulaList: document.getElementById("formulaList"),
    detailSection: document.getElementById("formulaDetailSection"),
    detailContent: document.getElementById("formulaDetailContent"),
    detailActions: document.getElementById("formulaDetailActions"),
    searchSection: document.getElementById("searchSection"),
    filterBoard: document.getElementById("filterBoard"),
    filterClass: document.getElementById("filterClass"),
    filterSubject: document.getElementById("filterSubject"),
    filterChapter: document.getElementById("filterChapter"),
    filterDifficulty: document.getElementById("filterDifficulty"),
    searchInput: document.getElementById("searchInput"),
    applyFiltersBtn: document.getElementById("applyFiltersBtn"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    resetBtn: document.getElementById("resetNavBtn"),
    backBtn: document.getElementById("formulaBackBtn"),
    syllabusMeta: document.getElementById("syllabusMeta")
};

/* ==========================================
   Feature flags (from JSON)
========================================== */

function feature(name) {
    return (
        formulaDatabase &&
        formulaDatabase.features &&
        formulaDatabase.features[name] &&
        formulaDatabase.features[name].enabled === true
    );
}

function featureConfig(name) {
    return (
        (formulaDatabase &&
            formulaDatabase.features &&
            formulaDatabase.features[name]) ||
        null
    );
}

/* ==========================================
   Data helpers (all chapter/subject titles
   come from JSON — never hardcoded)
========================================== */

function getEnabledBoards() {
    if (!formulaDatabase || !Array.isArray(formulaDatabase.boards)) return [];
    return formulaDatabase.boards.filter(function (b) {
        return b.enabled !== false;
    });
}

function getAllBoards() {
    if (!formulaDatabase || !Array.isArray(formulaDatabase.boards)) return [];
    return formulaDatabase.boards;
}

function getBoardById(boardId) {
    return getAllBoards().find(function (b) {
        return b.id === boardId;
    }) || null;
}

function getClassById(boardNode, classId) {
    if (!boardNode || !Array.isArray(boardNode.classes)) return null;
    return boardNode.classes.find(function (c) {
        return c.id === classId;
    }) || null;
}

function getSubjectById(classNode, subjectId) {
    if (!classNode || !Array.isArray(classNode.subjects)) return null;
    return classNode.subjects.find(function (s) {
        return s.id === subjectId;
    }) || null;
}

function getChapterById(subjectNode, chapterId) {
    if (!subjectNode || !Array.isArray(subjectNode.chapters)) return null;
    return subjectNode.chapters.find(function (ch) {
        return ch.id === chapterId;
    }) || null;
}

function getCurrentPath() {
    const boardNode = getBoardById(nav.boardId);
    const classNode = getClassById(boardNode, nav.classId);
    const subjectNode = getSubjectById(classNode, nav.subjectId);
    const chapterNode = getChapterById(subjectNode, nav.chapterId);
    const formulaNode =
        chapterNode && Array.isArray(chapterNode.formulas)
            ? chapterNode.formulas.find(function (f) {
                  return f.id === nav.formulaId;
              }) || null
            : null;
    return { boardNode, classNode, subjectNode, chapterNode, formulaNode };
}

function countFormulasInSubject(subjectNode) {
    if (!subjectNode || !Array.isArray(subjectNode.chapters)) return 0;
    return subjectNode.chapters.reduce(function (sum, ch) {
        return sum + (Array.isArray(ch.formulas) ? ch.formulas.length : 0);
    }, 0);
}

function countFormulasInClass(classNode) {
    if (!classNode || !Array.isArray(classNode.subjects)) return 0;
    return classNode.subjects.reduce(function (sum, s) {
        return sum + countFormulasInSubject(s);
    }, 0);
}

function countFormulasInBoard(boardNode) {
    if (!boardNode || !Array.isArray(boardNode.classes)) return 0;
    return boardNode.classes.reduce(function (sum, c) {
        return sum + countFormulasInClass(c);
    }, 0);
}

/** Dynamic formula count — always reflects visible list length */
function updateFormulaCount(count) {
    if (els.formulaCount) {
        els.formulaCount.textContent = String(count);
    }
}

function escapeHtml(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function flattenBoardFormulas(boardNode) {
    const results = [];
    if (!boardNode || !Array.isArray(boardNode.classes)) return results;

    boardNode.classes.forEach(function (classNode) {
        (classNode.subjects || []).forEach(function (subjectNode) {
            (subjectNode.chapters || []).forEach(function (chapterNode) {
                (chapterNode.formulas || []).forEach(function (formula) {
                    results.push({
                        formula: formula,
                        boardId: boardNode.id,
                        boardTitle: boardNode.title || boardNode.board,
                        syllabusYear: boardNode.syllabusYear,
                        classId: classNode.id,
                        classTitle: classNode.title,
                        subjectId: subjectNode.id,
                        subjectTitle: subjectNode.title,
                        chapterId: chapterNode.id,
                        chapterTitle: chapterNode.title,
                        chapterNumber: chapterNode.chapterNumber,
                        difficulty:
                            formula.difficulty || chapterNode.difficulty || ""
                    });
                });
            });
        });
    });

    return results;
}

function flattenAllEnabledFormulas() {
    const results = [];
    getEnabledBoards().forEach(function (board) {
        Array.prototype.push.apply(results, flattenBoardFormulas(board));
    });
    return results;
}

function findFormulaInBoard(boardNode, formulaId) {
    return (
        flattenBoardFormulas(boardNode).find(function (hit) {
            return hit.formula.id === formulaId;
        }) || null
    );
}

/* ==========================================
   Favourites / Recently Viewed (architecture)
========================================== */

function loadClientStores() {
    const favCfg = featureConfig("favourites");
    const recentCfg = featureConfig("recentlyViewed");

    try {
        if (favCfg && favCfg.storageKey) {
            clientState.favourites = JSON.parse(
                localStorage.getItem(favCfg.storageKey) || "[]"
            );
        }
        if (recentCfg && recentCfg.storageKey) {
            clientState.recentlyViewed = JSON.parse(
                localStorage.getItem(recentCfg.storageKey) || "[]"
            );
        }
    } catch (e) {
        clientState.favourites = [];
        clientState.recentlyViewed = [];
    }
}

/** Architecture stub — activate when features.favourites.enabled */
function toggleFavourite(formulaId) {
    if (!feature("favourites")) return;
    const cfg = featureConfig("favourites");
    const idx = clientState.favourites.indexOf(formulaId);
    if (idx >= 0) clientState.favourites.splice(idx, 1);
    else clientState.favourites.push(formulaId);
    localStorage.setItem(cfg.storageKey, JSON.stringify(clientState.favourites));
}

/** Architecture stub — activate when features.recentlyViewed.enabled */
function recordRecentlyViewed(hit) {
    if (!feature("recentlyViewed") || !hit) return;
    const cfg = featureConfig("recentlyViewed");
    const maxItems = cfg.maxItems || 20;
    clientState.recentlyViewed = clientState.recentlyViewed.filter(
        function (item) {
            return item.formulaId !== hit.formula.id;
        }
    );
    clientState.recentlyViewed.unshift({
        formulaId: hit.formula.id,
        boardId: hit.boardId,
        classId: hit.classId,
        subjectId: hit.subjectId,
        chapterId: hit.chapterId,
        viewedAt: new Date().toISOString()
    });
    clientState.recentlyViewed = clientState.recentlyViewed.slice(0, maxItems);
    localStorage.setItem(
        cfg.storageKey,
        JSON.stringify(clientState.recentlyViewed)
    );
}

/* ==========================================
   Print / Export (architecture only)
========================================== */

function printFormula() {
    /* Phase 2+: window.print() scoped to formula detail */
}

function exportFormulaPdf() {
    /* Phase 2+: PDF export of formula detail */
}

/* ==========================================
   Load
========================================== */

async function loadFormulaDatabase() {
    const response = await fetch("../data/formula-library.json");
    if (!response.ok) {
        throw new Error(
            "Failed to load formula-library.json (" + response.status + ")"
        );
    }
    formulaDatabase = await response.json();
}

/* ==========================================
   Navigation
========================================== */

function goToBoards() {
    nav.view = VIEWS.BOARDS;
    nav.boardId = null;
    nav.classId = null;
    nav.subjectId = null;
    nav.chapterId = null;
    nav.formulaId = null;
    nav.searching = false;
    clearKeywordOnly();
    render();
}

function selectBoard(boardId) {
    nav.view = VIEWS.CLASSES;
    nav.boardId = boardId;
    nav.classId = null;
    nav.subjectId = null;
    nav.chapterId = null;
    nav.formulaId = null;
    nav.searching = false;
    filters.board = boardId;
    syncFilterControlsFromState();
    clearKeywordOnly();
    render();
}

function selectClass(classId) {
    nav.view = VIEWS.SUBJECTS;
    nav.classId = classId;
    nav.subjectId = null;
    nav.chapterId = null;
    nav.formulaId = null;
    nav.searching = false;
    filters.class = classId;
    filters.subject = "";
    filters.chapter = "";
    syncFilterControlsFromState();
    populateDependentFilters();
    clearKeywordOnly();
    render();
}

function selectSubject(subjectId) {
    nav.view = VIEWS.CHAPTERS;
    nav.subjectId = subjectId;
    nav.chapterId = null;
    nav.formulaId = null;
    nav.searching = false;
    filters.subject = subjectId;
    filters.chapter = "";
    syncFilterControlsFromState();
    populateDependentFilters();
    clearKeywordOnly();
    render();
}

function selectChapter(chapterId) {
    nav.view = VIEWS.FORMULAS;
    nav.chapterId = chapterId;
    nav.formulaId = null;
    nav.searching = false;
    filters.chapter = chapterId;
    syncFilterControlsFromState();
    clearKeywordOnly();
    render();
}

function openFormulaDetail(formulaId) {
    nav.view = VIEWS.DETAIL;
    nav.formulaId = formulaId;
    nav.searching = false;

    const { boardNode } = getCurrentPath();
    const hit = findFormulaInBoard(boardNode, formulaId);
    if (hit) recordRecentlyViewed(hit);

    render();
}

function openFormulaFromSearch(hit) {
    nav.boardId = hit.boardId;
    nav.classId = hit.classId;
    nav.subjectId = hit.subjectId;
    nav.chapterId = hit.chapterId;
    nav.formulaId = hit.formula.id;
    nav.view = VIEWS.DETAIL;
    nav.searching = false;
    recordRecentlyViewed(hit);
    render();
}

function navigateUp() {
    if (nav.view === VIEWS.DETAIL) {
        nav.view = VIEWS.FORMULAS;
        nav.formulaId = null;
        render();
        return;
    }
    if (nav.view === VIEWS.FORMULAS) {
        nav.view = VIEWS.CHAPTERS;
        nav.chapterId = null;
        filters.chapter = "";
        syncFilterControlsFromState();
        clearKeywordOnly();
        render();
        return;
    }
    if (nav.view === VIEWS.CHAPTERS) {
        nav.view = VIEWS.SUBJECTS;
        nav.subjectId = null;
        filters.subject = "";
        filters.chapter = "";
        syncFilterControlsFromState();
        populateDependentFilters();
        render();
        return;
    }
    if (nav.view === VIEWS.SUBJECTS) {
        nav.view = VIEWS.CLASSES;
        nav.classId = null;
        filters.class = "";
        filters.subject = "";
        filters.chapter = "";
        syncFilterControlsFromState();
        populateDependentFilters();
        render();
        return;
    }
    if (nav.view === VIEWS.CLASSES) {
        goToBoards();
        return;
    }
    window.location.href = "home.html";
}

function clearKeywordOnly() {
    filters.keyword = "";
    if (els.searchInput) els.searchInput.value = "";
}

/* ==========================================
   Filters (Board, Class, Subject, Chapter,
   Difficulty, Keyword)
========================================== */

function fillSelect(selectEl, options, placeholder) {
    if (!selectEl) return;
    const current = selectEl.value;
    selectEl.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = placeholder;
    selectEl.appendChild(empty);
    options.forEach(function (opt) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        selectEl.appendChild(option);
    });
    selectEl.value = current;
}

function initFilterControls() {
    fillSelect(
        els.filterBoard,
        getAllBoards().map(function (b) {
            return {
                value: b.id,
                label: b.enabled === false ? b.title + " (soon)" : b.title
            };
        }),
        "Board"
    );

    fillSelect(
        els.filterDifficulty,
        DIFFICULTIES.map(function (d) {
            return { value: d, label: d };
        }),
        "Difficulty"
    );

    populateDependentFilters();
    syncFilterControlsFromState();
}

function populateDependentFilters() {
    const boardId = (els.filterBoard && els.filterBoard.value) || filters.board;
    const boardNode = getBoardById(boardId);

    const classOptions = boardNode
        ? (boardNode.classes || []).map(function (c) {
              return { value: c.id, label: c.title };
          })
        : [];
    fillSelect(els.filterClass, classOptions, "Class");

    const classId = (els.filterClass && els.filterClass.value) || filters.class;
    const classNode = getClassById(boardNode, classId);
    const subjectOptions = classNode
        ? (classNode.subjects || []).map(function (s) {
              return { value: s.id, label: s.title };
          })
        : [];
    fillSelect(els.filterSubject, subjectOptions, "Subject");

    const subjectId =
        (els.filterSubject && els.filterSubject.value) || filters.subject;
    const subjectNode = getSubjectById(classNode, subjectId);
    const chapterOptions = subjectNode
        ? (subjectNode.chapters || []).map(function (ch) {
              return { value: ch.id, label: ch.title };
          })
        : [];
    fillSelect(els.filterChapter, chapterOptions, "Chapter");
}

function syncFilterControlsFromState() {
    if (els.filterBoard) els.filterBoard.value = filters.board || "";
    if (els.filterClass) els.filterClass.value = filters.class || "";
    if (els.filterSubject) els.filterSubject.value = filters.subject || "";
    if (els.filterChapter) els.filterChapter.value = filters.chapter || "";
    if (els.filterDifficulty) {
        els.filterDifficulty.value = filters.difficulty || "";
    }
    if (els.searchInput) els.searchInput.value = filters.keyword || "";
}

function readFiltersFromControls() {
    filters.board = els.filterBoard ? els.filterBoard.value : "";
    filters.class = els.filterClass ? els.filterClass.value : "";
    filters.subject = els.filterSubject ? els.filterSubject.value : "";
    filters.chapter = els.filterChapter ? els.filterChapter.value : "";
    filters.difficulty = els.filterDifficulty
        ? els.filterDifficulty.value
        : "";
    filters.keyword = els.searchInput ? els.searchInput.value.trim() : "";
}

function hasActiveFilters() {
    return !!(
        filters.board ||
        filters.class ||
        filters.subject ||
        filters.chapter ||
        filters.difficulty ||
        filters.keyword
    );
}

function applyFilters() {
    readFiltersFromControls();
    nav.searching = hasActiveFilters();

    if (!nav.searching) {
        render();
        return;
    }

    renderSearchResults(runFilteredSearch());
}

function clearAllFilters() {
    filters.board = nav.boardId || "";
    filters.class = "";
    filters.subject = "";
    filters.chapter = "";
    filters.difficulty = "";
    filters.keyword = "";
    nav.searching = false;
    populateDependentFilters();
    syncFilterControlsFromState();
    render();
}

function runFilteredSearch() {
    let pool = flattenAllEnabledFormulas();

    if (filters.board) {
        pool = pool.filter(function (hit) {
            return hit.boardId === filters.board;
        });
    }
    if (filters.class) {
        pool = pool.filter(function (hit) {
            return hit.classId === filters.class;
        });
    }
    if (filters.subject) {
        pool = pool.filter(function (hit) {
            return hit.subjectId === filters.subject;
        });
    }
    if (filters.chapter) {
        pool = pool.filter(function (hit) {
            return hit.chapterId === filters.chapter;
        });
    }
    if (filters.difficulty) {
        pool = pool.filter(function (hit) {
            return (
                String(hit.difficulty).toLowerCase() ===
                filters.difficulty.toLowerCase()
            );
        });
    }
    if (filters.keyword) {
        const text = filters.keyword.toLowerCase();
        pool = pool.filter(function (hit) {
            const f = hit.formula;
            const haystack = [
                f.name,
                f.formula,
                f.latex,
                f.description,
                f.example,
                f.notes,
                Array.isArray(f.keywords) ? f.keywords.join(" ") : "",
                Array.isArray(f.examTags) ? f.examTags.join(" ") : "",
                Array.isArray(f.tags) ? f.tags.join(" ") : "",
                hit.chapterTitle,
                hit.subjectTitle,
                hit.classTitle,
                hit.boardTitle
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(text);
        });
    }

    return pool;
}

/* ==========================================
   Breadcrumb: Board → Class → Subject →
   Chapter → Formula
========================================== */

function renderBreadcrumb() {
    if (!els.breadcrumb) return;

    const { boardNode, classNode, subjectNode, chapterNode, formulaNode } =
        getCurrentPath();
    const parts = [{ label: "Formula Library", action: goToBoards }];

    if (boardNode) {
        parts.push({
            label: boardNode.title || boardNode.board,
            action: function () {
                selectBoard(boardNode.id);
            }
        });
    }
    if (classNode) {
        parts.push({
            label: classNode.title,
            action: function () {
                selectClass(classNode.id);
            }
        });
    }
    if (subjectNode) {
        parts.push({
            label: subjectNode.title,
            action: function () {
                selectSubject(subjectNode.id);
            }
        });
    }
    if (chapterNode) {
        parts.push({
            label: chapterNode.title,
            action: function () {
                selectChapter(chapterNode.id);
            }
        });
    }
    if (formulaNode) {
        parts.push({ label: formulaNode.name, action: null });
    }

    els.breadcrumb.innerHTML = "";
    parts.forEach(function (part, index) {
        if (index > 0) {
            const sep = document.createElement("span");
            sep.className = "breadcrumb-sep";
            sep.textContent = "→";
            els.breadcrumb.appendChild(sep);
        }

        if (part.action && index < parts.length - 1) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "breadcrumb-link";
            btn.textContent = part.label;
            btn.addEventListener("click", part.action);
            els.breadcrumb.appendChild(btn);
        } else {
            const span = document.createElement("span");
            span.className = "breadcrumb-current";
            span.textContent = part.label;
            els.breadcrumb.appendChild(span);
        }
    });
}

function renderSyllabusMeta(syllabus) {
    if (!els.syllabusMeta) return;

    if (!syllabus) {
        els.syllabusMeta.hidden = true;
        els.syllabusMeta.innerHTML = "";
        return;
    }

    const bits = [];
    if (syllabus.board) bits.push("Board: " + syllabus.board);
    if (syllabus.syllabusYear) bits.push("Year: " + syllabus.syllabusYear);
    if (syllabus.class) bits.push("Class: " + syllabus.class);
    if (syllabus.subject) bits.push("Subject: " + syllabus.subject);
    if (syllabus.chapter) bits.push("Chapter: " + syllabus.chapter);

    els.syllabusMeta.hidden = bits.length === 0;
    els.syllabusMeta.innerHTML = bits
        .map(function (bit) {
            return '<span class="syllabus-chip">' + escapeHtml(bit) + "</span>";
        })
        .join("");
}

/* ==========================================
   UI helpers
========================================== */

function createNavCard(options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nav-card";
    if (options.disabled) {
        button.disabled = true;
        button.classList.add("nav-card-disabled");
    }
    button.innerHTML =
        '<span class="nav-card-icon">' +
        escapeHtml(options.icon || "📘") +
        "</span>" +
        '<span class="nav-card-title">' +
        escapeHtml(options.title) +
        "</span>" +
        (options.meta
            ? '<span class="nav-card-meta">' + escapeHtml(options.meta) + "</span>"
            : "");
    if (!options.disabled) {
        button.addEventListener("click", options.onClick);
    }
    return button;
}

function setEmptyState(message) {
    if (!els.emptyState) return;
    if (message) {
        els.emptyState.hidden = false;
        els.emptyState.textContent = message;
    } else {
        els.emptyState.hidden = true;
        els.emptyState.textContent = "";
    }
}

function setPanelVisibility(options) {
    if (els.navGrid) els.navGrid.hidden = !options.nav;
    if (els.formulaSection) els.formulaSection.hidden = !options.list;
    if (els.detailSection) els.detailSection.hidden = !options.detail;
    if (els.searchSection) {
        els.searchSection.hidden = !!options.detail;
    }
}

/* ==========================================
   Hierarchy views
========================================== */

function renderBoardGrid() {
    els.sectionTitle.textContent = "Select Board";
    els.navGrid.innerHTML = "";
    setEmptyState(null);
    renderSyllabusMeta(null);
    setPanelVisibility({ nav: true, list: false, detail: false });

    getAllBoards().forEach(function (board) {
        const enabled = board.enabled !== false;
        const metaParts = [];
        if (board.syllabusYear) metaParts.push(board.syllabusYear);
        if (board.lastUpdated) metaParts.push("Updated " + board.lastUpdated);
        if (enabled) {
            metaParts.push(
                countFormulasInBoard(board) + " formulas"
            );
        } else {
            metaParts.push("Coming soon");
        }

        els.navGrid.appendChild(
            createNavCard({
                icon: board.id === "icse" ? "📗" : "📘",
                title: board.title || board.board,
                meta: metaParts.join(" · "),
                disabled: !enabled,
                onClick: function () {
                    selectBoard(board.id);
                }
            })
        );
    });
}

function renderClassGrid() {
    const { boardNode } = getCurrentPath();
    if (!boardNode) {
        goToBoards();
        return;
    }

    els.sectionTitle.textContent =
        "Select Class — " + (boardNode.title || boardNode.board);
    els.navGrid.innerHTML = "";
    setEmptyState(null);
    renderSyllabusMeta({
        board: boardNode.title || boardNode.board,
        syllabusYear: boardNode.syllabusYear
    });
    setPanelVisibility({ nav: true, list: false, detail: false });

    (boardNode.classes || []).forEach(function (classNode) {
        els.navGrid.appendChild(
            createNavCard({
                icon: "🎓",
                title: classNode.title,
                meta:
                    classNode.subjects.length +
                    " subjects · " +
                    countFormulasInClass(classNode) +
                    " formulas",
                onClick: function () {
                    selectClass(classNode.id);
                }
            })
        );
    });
}

function renderSubjectGrid() {
    const { boardNode, classNode } = getCurrentPath();
    if (!boardNode || !classNode) {
        goToBoards();
        return;
    }

    els.sectionTitle.textContent =
        "Select Subject — " +
        classNode.title +
        " (" +
        (boardNode.title || boardNode.board) +
        ")";
    els.navGrid.innerHTML = "";
    setEmptyState(null);
    renderSyllabusMeta({
        board: boardNode.title || boardNode.board,
        syllabusYear: boardNode.syllabusYear,
        class: classNode.title
    });
    setPanelVisibility({ nav: true, list: false, detail: false });

    if (!classNode.subjects.length) {
        setEmptyState("No subjects configured for this class.");
        return;
    }

    classNode.subjects.forEach(function (subject) {
        els.navGrid.appendChild(
            createNavCard({
                icon: subject.icon,
                title: subject.title,
                meta:
                    subject.chapters.length +
                    " chapters · " +
                    countFormulasInSubject(subject) +
                    " formulas",
                onClick: function () {
                    selectSubject(subject.id);
                }
            })
        );
    });
}

function renderChapterGrid() {
    const { boardNode, classNode, subjectNode } = getCurrentPath();
    if (!boardNode || !classNode || !subjectNode) {
        goToBoards();
        return;
    }

    els.sectionTitle.textContent =
        "Select Chapter — " +
        subjectNode.title +
        " (" +
        classNode.title +
        ", " +
        (boardNode.title || boardNode.board) +
        ")";
    els.navGrid.innerHTML = "";
    renderSyllabusMeta({
        board: boardNode.title || boardNode.board,
        syllabusYear: boardNode.syllabusYear,
        class: classNode.title,
        subject: subjectNode.title
    });
    setPanelVisibility({ nav: true, list: false, detail: false });

    if (!subjectNode.chapters.length) {
        setEmptyState(
            "Chapters for this subject will appear here once syllabus content is added."
        );
        return;
    }

    setEmptyState(null);
    subjectNode.chapters.forEach(function (chapter) {
        const formulaCount = Array.isArray(chapter.formulas)
            ? chapter.formulas.length
            : 0;
        const metaParts = [];
        if (chapter.chapterNumber != null) {
            metaParts.push("Ch. " + chapter.chapterNumber);
        }
        if (chapter.difficulty) metaParts.push(chapter.difficulty);
        if (chapter.estimatedStudyTime) {
            metaParts.push(chapter.estimatedStudyTime);
        }
        metaParts.push(formulaCount + " formulas");

        els.navGrid.appendChild(
            createNavCard({
                icon: "📖",
                title: chapter.title,
                meta: metaParts.join(" · "),
                onClick: function () {
                    selectChapter(chapter.id);
                }
            })
        );
    });
}

/* ==========================================
   Formula list + detail
========================================== */

function formatVariables(variables) {
    if (!Array.isArray(variables) || variables.length === 0) {
        return "<em>Not specified</em>";
    }
    return variables
        .map(function (v) {
            return (
                "<li><strong>" +
                escapeHtml(v.symbol) +
                "</strong> — " +
                escapeHtml(v.meaning) +
                "</li>"
            );
        })
        .join("");
}

function renderFormulaListCards(formulas) {
    if (!els.formulaList) return;

    els.formulaList.innerHTML = "";
    updateFormulaCount(formulas.length);

    if (!formulas.length) {
        els.formulaList.innerHTML =
            '<p class="formula-empty">No formulas in this chapter yet.</p>';
        return;
    }

    formulas.forEach(function (item) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "formula-card formula-card-button";
        card.innerHTML =
            "<h3>" +
            escapeHtml(item.name) +
            "</h3>" +
            '<div class="formula-text">' +
            escapeHtml(item.formula) +
            "</div>" +
            (item.difficulty
                ? '<span class="difficulty-badge">' +
                  escapeHtml(item.difficulty) +
                  "</span>"
                : "") +
            '<p class="formula-card-hint">View details →</p>';
        card.addEventListener("click", function () {
            openFormulaDetail(item.id);
        });
        els.formulaList.appendChild(card);
    });
}

function renderDetailActions(item) {
    if (!els.detailActions) return;

    const favOn = feature("favourites");
    const printOn = feature("print");
    const isFav =
        item &&
        (item.isFavourite === true ||
            clientState.favourites.indexOf(item.id) >= 0);

    els.detailActions.innerHTML =
        '<button type="button" class="detail-action-btn" id="favouriteBtn" ' +
        (favOn ? "" : "disabled title=\"Coming soon\"") +
        ">" +
        (isFav ? "★ Favourited" : "☆ Favourite") +
        "</button>" +
        '<button type="button" class="detail-action-btn" id="printFormulaBtn" ' +
        (printOn ? "" : "disabled title=\"Coming soon\"") +
        ">Print Formula</button>" +
        '<button type="button" class="detail-action-btn" id="exportPdfBtn" ' +
        (printOn ? "" : "disabled title=\"Coming soon\"") +
        ">Export PDF</button>";

    const favBtn = document.getElementById("favouriteBtn");
    const printBtn = document.getElementById("printFormulaBtn");
    const pdfBtn = document.getElementById("exportPdfBtn");

    if (favBtn && favOn) {
        favBtn.addEventListener("click", function () {
            toggleFavourite(item.id);
            renderDetailActions(item);
        });
    }
    if (printBtn && printOn) {
        printBtn.addEventListener("click", printFormula);
    }
    if (pdfBtn && printOn) {
        pdfBtn.addEventListener("click", exportFormulaPdf);
    }
}

function renderFormulaDetail(item, pathContext) {
    if (!els.detailContent || !item) return;

    const { boardNode, classNode, subjectNode, chapterNode } = pathContext;

    const relatedIds = Array.isArray(item.relatedFormulas)
        ? item.relatedFormulas
        : [];
    const relatedHtml = relatedIds.length
        ? '<ul class="related-formula-list">' +
          relatedIds
              .map(function (relId) {
                  const hit = findFormulaInBoard(boardNode, relId);
                  if (!hit) {
                      return (
                          "<li>" +
                          escapeHtml(relId) +
                          " <em>(not found)</em></li>"
                      );
                  }
                  return (
                      '<li><button type="button" class="related-formula-link" data-formula-id="' +
                      escapeHtml(hit.formula.id) +
                      '">' +
                      escapeHtml(hit.formula.name) +
                      "</button></li>"
                  );
              })
              .join("") +
          "</ul>"
        : "<em>None</em>";

    const notes =
        item.notes && String(item.notes).trim()
            ? '<p class="formula-notes"><strong>Important Notes:</strong> ' +
              escapeHtml(item.notes) +
              "</p>"
            : "";

    const latexBlock = item.latex
        ? '<p class="formula-label"><strong>LaTeX</strong></p>' +
          '<pre class="formula-latex">' +
          escapeHtml(item.latex) +
          "</pre>"
        : "";

    const practiceHtml =
        Array.isArray(item.practiceQuestions) && item.practiceQuestions.length
            ? '<div class="formula-meta-block"><strong>Practice</strong><ul class="formula-variables">' +
              item.practiceQuestions
                  .map(function (q) {
                      return (
                          "<li>" +
                          escapeHtml(q.question) +
                          (q.answer
                              ? " <em>(" + escapeHtml(q.answer) + ")</em>"
                              : "") +
                          "</li>"
                      );
                  })
                  .join("") +
              "</ul></div>"
            : "";

    const verificationBadge = item.verification
        ? '<span class="difficulty-badge">' +
          escapeHtml(item.verification) +
          "</span>"
        : "";

    const sourceBits = [];
    if (item.source) {
        if (item.source.board) sourceBits.push("Board: " + item.source.board);
        if (item.source.syllabusYear) {
            sourceBits.push("Syllabus Year: " + item.source.syllabusYear);
        }
        if (item.source.chapterReference) {
            sourceBits.push("Chapter: " + item.source.chapterReference);
        }
        // Reference book is optional metadata only (never used in navigation)
        if (item.source.referenceBook) {
            sourceBits.push("Reference: " + item.source.referenceBook);
        }
    }

    const chapterRefs =
        chapterNode && Array.isArray(chapterNode.referenceBooks)
            ? chapterNode.referenceBooks
            : [];

    els.detailContent.innerHTML =
        "<h3>" +
        escapeHtml(item.name) +
        "</h3>" +
        (item.difficulty
            ? '<span class="difficulty-badge">' +
              escapeHtml(item.difficulty) +
              "</span> "
            : "") +
        verificationBadge +
        '<p class="formula-label"><strong>Mathematical Formula</strong></p>' +
        '<div class="formula-text">' +
        escapeHtml(item.formula) +
        "</div>" +
        latexBlock +
        '<div class="formula-meta-block">' +
        "<strong>Variables &amp; Meaning</strong>" +
        '<ul class="formula-variables">' +
        formatVariables(item.variables) +
        "</ul>" +
        "</div>" +
        '<p class="formula-explanation"><strong>Short Explanation:</strong> ' +
        escapeHtml(item.description || "") +
        "</p>" +
        '<p class="formula-example"><strong>Worked Example:</strong> ' +
        escapeHtml(item.example || "") +
        "</p>" +
        notes +
        practiceHtml +
        '<div class="formula-meta-block">' +
        "<strong>Related Formulas</strong>" +
        relatedHtml +
        "</div>" +
        '<p class="formula-keywords"><strong>Keywords:</strong> ' +
        escapeHtml(
            Array.isArray(item.keywords) ? item.keywords.join(", ") : ""
        ) +
        "</p>" +
        '<p class="formula-keywords"><strong>Exam Tags:</strong> ' +
        escapeHtml(
            Array.isArray(item.examTags) ? item.examTags.join(", ") : ""
        ) +
        "</p>" +
        (sourceBits.length
            ? '<p class="formula-path-meta">' +
              escapeHtml(sourceBits.join(" · ")) +
              "</p>"
            : "") +
        (chapterRefs.length
            ? '<p class="formula-path-meta">Reference books (metadata): ' +
              escapeHtml(chapterRefs.join(", ")) +
              "</p>"
            : "") +
        '<p class="formula-path-meta">' +
        escapeHtml(
            [
                item.board || (boardNode && (boardNode.title || boardNode.board)),
                item.syllabusYear || (boardNode && boardNode.syllabusYear),
                item.class || (classNode && classNode.title),
                item.subject || (subjectNode && subjectNode.title),
                item.chapter || (chapterNode && chapterNode.title),
                item.chapterNumber != null ? "Ch. " + item.chapterNumber : null,
                item.id,
                item.version != null ? "v" + item.version : null
            ]
                .filter(Boolean)
                .join(" · ")
        ) +
        "</p>";

    els.detailContent.querySelectorAll(".related-formula-link").forEach(
        function (btn) {
            btn.addEventListener("click", function () {
                openFormulaDetail(btn.getAttribute("data-formula-id"));
            });
        }
    );

    renderDetailActions(item);
}

function getActiveChapterFormulas() {
    const { chapterNode } = getCurrentPath();
    if (!chapterNode || !Array.isArray(chapterNode.formulas)) return [];
    return chapterNode.formulas;
}

function renderSearchResults(hits) {
    els.sectionTitle.textContent = "Filtered Results";
    els.navGrid.innerHTML = "";
    els.navGrid.hidden = true;
    setEmptyState(null);
    setPanelVisibility({ nav: false, list: true, detail: false });

    if (!els.formulaList) return;
    els.formulaList.innerHTML = "";
    updateFormulaCount(hits.length);

    if (!hits.length) {
        els.formulaList.innerHTML =
            '<p class="formula-empty">No formulas match the current filters.</p>';
        return;
    }

    hits.forEach(function (hit) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "formula-card formula-card-button";
        card.innerHTML =
            "<h3>" +
            escapeHtml(hit.formula.name) +
            "</h3>" +
            '<div class="formula-text">' +
            escapeHtml(hit.formula.formula) +
            "</div>" +
            '<p class="formula-card-hint">' +
            escapeHtml(
                hit.boardTitle +
                    " · " +
                    hit.classTitle +
                    " · " +
                    hit.subjectTitle +
                    " · " +
                    hit.chapterTitle
            ) +
            "</p>";
        card.addEventListener("click", function () {
            openFormulaFromSearch(hit);
        });
        els.formulaList.appendChild(card);
    });
}

function renderFormulasView() {
    const { boardNode, classNode, subjectNode, chapterNode } = getCurrentPath();
    if (!boardNode || !classNode || !subjectNode || !chapterNode) {
        goToBoards();
        return;
    }

    els.sectionTitle.textContent =
        "Formula List — " + chapterNode.title;
    els.navGrid.innerHTML = "";
    setEmptyState(null);
    renderSyllabusMeta(
        chapterNode.syllabus || {
            board: boardNode.title || boardNode.board,
            syllabusYear: boardNode.syllabusYear,
            class: classNode.title,
            subject: subjectNode.title,
            chapter: chapterNode.title
        }
    );
    setPanelVisibility({ nav: false, list: true, detail: false });
    renderFormulaListCards(getActiveChapterFormulas());
}

function renderDetailView() {
    const path = getCurrentPath();
    if (
        !path.boardNode ||
        !path.classNode ||
        !path.subjectNode ||
        !path.chapterNode ||
        !path.formulaNode
    ) {
        nav.view = VIEWS.FORMULAS;
        nav.formulaId = null;
        renderFormulasView();
        return;
    }

    els.sectionTitle.textContent = "Formula Details";
    els.navGrid.innerHTML = "";
    setEmptyState(null);
    renderSyllabusMeta(
        path.chapterNode.syllabus || {
            board: path.boardNode.title || path.boardNode.board,
            syllabusYear: path.boardNode.syllabusYear,
            class: path.classNode.title,
            subject: path.subjectNode.title,
            chapter: path.chapterNode.title
        }
    );
    setPanelVisibility({ nav: false, list: false, detail: true });
    updateFormulaCount(1);
    renderFormulaDetail(path.formulaNode, path);
}

/* ==========================================
   Main render
========================================== */

function render() {
    if (!formulaDatabase) return;

    renderBreadcrumb();

    if (nav.searching && hasActiveFilters()) {
        renderSearchResults(runFilteredSearch());
        return;
    }

    if (nav.view === VIEWS.BOARDS) {
        renderBoardGrid();
        updateFormulaCount(0);
        return;
    }
    if (nav.view === VIEWS.CLASSES) {
        renderClassGrid();
        updateFormulaCount(0);
        return;
    }
    if (nav.view === VIEWS.SUBJECTS) {
        renderSubjectGrid();
        updateFormulaCount(0);
        return;
    }
    if (nav.view === VIEWS.CHAPTERS) {
        renderChapterGrid();
        updateFormulaCount(0);
        return;
    }
    if (nav.view === VIEWS.FORMULAS) {
        renderFormulasView();
        return;
    }
    if (nav.view === VIEWS.DETAIL) {
        renderDetailView();
    }
}

/* ==========================================
   Start
========================================== */

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await loadFormulaDatabase();
    } catch (error) {
        console.error(error);
        if (els.sectionTitle) {
            els.sectionTitle.textContent = "Unable to load Formula Library";
        }
        setEmptyState(
            "Could not load formula data. Check formula-library.json and try again."
        );
        return;
    }

    loadClientStores();
    initFilterControls();

    if (els.backBtn) {
        els.backBtn.addEventListener("click", navigateUp);
    }
    if (els.resetBtn) {
        els.resetBtn.addEventListener("click", goToBoards);
    }
    if (els.applyFiltersBtn) {
        els.applyFiltersBtn.addEventListener("click", applyFilters);
    }
    if (els.clearFiltersBtn) {
        els.clearFiltersBtn.addEventListener("click", clearAllFilters);
    }
    if (els.filterBoard) {
        els.filterBoard.addEventListener("change", function () {
            filters.board = els.filterBoard.value;
            filters.class = "";
            filters.subject = "";
            filters.chapter = "";
            populateDependentFilters();
            syncFilterControlsFromState();
        });
    }
    if (els.filterClass) {
        els.filterClass.addEventListener("change", function () {
            filters.class = els.filterClass.value;
            filters.subject = "";
            filters.chapter = "";
            populateDependentFilters();
            syncFilterControlsFromState();
        });
    }
    if (els.filterSubject) {
        els.filterSubject.addEventListener("change", function () {
            filters.subject = els.filterSubject.value;
            filters.chapter = "";
            populateDependentFilters();
            syncFilterControlsFromState();
        });
    }
    if (els.searchInput) {
        els.searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                applyFilters();
            }
        });
    }

    goToBoards();
});
