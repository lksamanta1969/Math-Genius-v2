/**
 * Local OCR cache interface.
 * Reopening the same document fingerprint should not re-run OCR unless changed.
 *
 * Storage backend is swappable (memory now; IndexedDB later).
 */
(function (global) {
  "use strict";

  /**
   * @typedef {Object} IOcrCache
   * @property {function(string): Promise<any|null>} get
   * @property {function(string, any): Promise<void>} set
   * @property {function(string): Promise<void>} remove
   * @property {function(): Promise<void>} clear
   * @property {function(File|Blob|string, object=): Promise<string>} fingerprint
   */

  async function shaLikeFingerprint(file, meta) {
    const parts = [
      (file && file.name) || "blob",
      (file && file.size) || 0,
      (file && file.lastModified) || 0,
      (meta && meta.page) || 0,
      (meta && meta.provider) || "",
      (meta && meta.rotation) || 0,
      (meta && meta.cropKey) || ""
    ];
    return parts.join("::");
  }

  function createMemoryOcrCache() {
    const store = Object.create(null);
    return {
      id: "memory",
      get: async function (key) {
        return Object.prototype.hasOwnProperty.call(store, key)
          ? store[key]
          : null;
      },
      set: async function (key, value) {
        store[key] = {
          savedAt: Date.now(),
          value: value
        };
      },
      remove: async function (key) {
        delete store[key];
      },
      clear: async function () {
        Object.keys(store).forEach(function (k) {
          delete store[k];
        });
      },
      fingerprint: shaLikeFingerprint
    };
  }

  /** @type {IOcrCache} */
  let activeCache = createMemoryOcrCache();

  const OcrCache = {
    /**
     * Swap cache backend (memory → IndexedDB later).
     * @param {IOcrCache} cache
     */
    use: function (cache) {
      if (!cache || typeof cache.get !== "function" || typeof cache.set !== "function") {
        throw new Error("Invalid OCR cache backend");
      }
      activeCache = cache;
    },

    get: function (key) {
      return activeCache.get(key);
    },

    set: function (key, value) {
      return activeCache.set(key, value);
    },

    remove: function (key) {
      return activeCache.remove(key);
    },

    clear: function () {
      return activeCache.clear();
    },

    fingerprint: function (file, meta) {
      return activeCache.fingerprint(file, meta);
    },

    createMemoryBackend: createMemoryOcrCache
  };

  global.OcrCache = OcrCache;
})(window);
