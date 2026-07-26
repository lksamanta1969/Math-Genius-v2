/**
 * Local PDF page renderer (pdf.js).
 * Each page is rendered independently to a canvas / PNG blob for OCR.
 */
(function (global) {
  "use strict";

  let pdfjsLibPromise = null;

  async function loadPdfJs() {
    if (pdfjsLibPromise) return pdfjsLibPromise;
    pdfjsLibPromise = import("../vendor/pdfjs/pdf.min.mjs").then(function (mod) {
      const lib = mod.default || mod;
      if (lib && lib.GlobalWorkerOptions) {
        lib.GlobalWorkerOptions.workerSrc = "../vendor/pdfjs/pdf.worker.min.mjs";
      }
      return lib;
    });
    return pdfjsLibPromise;
  }

  /**
   * @param {ArrayBuffer} data
   * @param {object} [options]
   * @param {number} [options.scale]
   * @param {function} [options.onPage]
   * @returns {Promise<Array<{page:number, canvas:HTMLCanvasElement, blob:Blob}>>}
   */
  async function renderPdfPages(data, options) {
    const opts = options || {};
    const scale = opts.scale || 2;
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({ data: data });
    const pdf = await loadingTask.promise;
    const pages = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport: viewport }).promise;

      const blob = await new Promise(function (resolve) {
        canvas.toBlob(function (b) {
          resolve(b);
        }, "image/png");
      });

      const item = { page: pageNum, canvas: canvas, blob: blob };
      pages.push(item);
      if (typeof opts.onPage === "function") {
        opts.onPage(item, pdf.numPages);
      }
    }

    return pages;
  }

  global.PdfPageRenderer = {
    renderPages: renderPdfPages
  };
})(window);
