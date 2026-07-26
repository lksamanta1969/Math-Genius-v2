/**
 * Document Manager (architecture)
 *
 * Upload → Document Manager → OCR Provider Interface → Question Detection
 *        → Math Expression Parser → Question Objects → UI
 *
 * Responsibilities:
 * - Accept images / PDF (future: DOCX, scanned books, camera stream)
 * - Normalize pages for async, page-by-page OCR
 * - Coordinate cache + progress events
 * - Never hardcode an OCR engine
 */
(function (global) {
  "use strict";

  /**
   * @typedef {Object} ManagedDocument
   * @property {string} id
   * @property {string} type
   * @property {string} name
   * @property {number} pageCount
   * @property {Array<{page:number, canvas?:HTMLCanvasElement, blob?:Blob}>} pages
   * @property {object} meta
   */

  function createId(prefix) {
    return (
      (prefix || "doc") +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  const DocumentManager = {
    /** @type {ManagedDocument|null} */
    current: null,

    /**
     * Load a user file into a managed document.
     * Implementation may delegate to PdfPageRenderer / image loaders.
     * @param {File|Blob} file
     * @param {object} [options]
     * @returns {Promise<ManagedDocument>}
     */
    load: async function (file, options) {
      throw new Error(
        "DocumentManager.load() must be wired by the Phase 8A controller adapter"
      );
    },

    /**
     * Iterate pages asynchronously for OCR.
     * @param {function({page:number, blob:Blob, canvas?:HTMLCanvasElement}, number): Promise<void>} worker
     */
    processPages: async function (worker) {
      const doc = this.current;
      if (!doc || !doc.pages || !doc.pages.length) {
        throw new Error("No document loaded");
      }
      const total = doc.pages.length;
      for (let i = 0; i < total; i += 1) {
        await worker(doc.pages[i], total);
      }
    },

    /**
     * Run OCR across pages using configured provider + cache.
     * Emits SolverEvents progress.
     * @param {object} [options]
     * @returns {Promise<Array>} page OCR results
     */
    runOcr: async function (options) {
      throw new Error(
        "DocumentManager.runOcr() must be wired by the Phase 8A controller adapter"
      );
    },

    clear: function () {
      this.current = null;
    },

    _createShell: function (type, name, pages, meta) {
      const doc = {
        id: createId("doc"),
        type: type,
        name: name || "untitled",
        pageCount: (pages && pages.length) || 0,
        pages: pages || [],
        meta: meta || {}
      };
      this.current = doc;
      if (global.SolverEvents) {
        global.SolverEvents.emit(global.SolverEvents.DOCUMENT_LOADED, {
          document: doc
        });
      }
      return doc;
    }
  };

  global.DocumentManager = DocumentManager;
})(window);
