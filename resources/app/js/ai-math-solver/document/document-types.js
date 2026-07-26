/**
 * Document types supported by Document Manager.
 * Current: Images, PDF
 * Future: DOCX, Scanned Books, Camera Stream
 */
(function (global) {
  "use strict";

  const DocumentTypes = Object.freeze({
    IMAGE: "image",
    PDF: "pdf",
    DOCX: "docx", // future
    SCANNED_BOOK: "scanned-book", // future
    CAMERA_STREAM: "camera-stream" // future
  });

  const DocumentTypeSupport = Object.freeze({
    image: { enabled: true, mime: ["image/jpeg", "image/png", "image/webp"] },
    pdf: { enabled: true, mime: ["application/pdf"] },
    docx: { enabled: false, mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
    "scanned-book": { enabled: false, mime: [] },
    "camera-stream": { enabled: true, mime: ["image/png"] } // capture → image pipeline
  });

  global.DocumentTypes = DocumentTypes;
  global.DocumentTypeSupport = DocumentTypeSupport;
})(window);
