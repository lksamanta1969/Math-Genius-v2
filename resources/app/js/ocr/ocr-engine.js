/**
 * OCR Engine — plugin registry / facade.
 * Does not lock the app to any single OCR engine.
 */
(function (global) {
  "use strict";

  const providers = Object.create(null);
  let activeProviderId = null;
  let configRef = null;

  function assertInterface(provider) {
    const check =
      global.OcrProviderInterface &&
      global.OcrProviderInterface.validate(provider);
    if (check && !check.ok) {
      throw new Error(
        "Invalid OCR provider: " + (check.errors || []).join("; ")
      );
    }
  }

  const OcrEngine = {
    /**
     * Optional runtime config (from ai-math-solver.json).
     * Provider selection must come from configuration.
     */
    configure: function (config) {
      configRef = config || null;
      const defaultId =
        configRef &&
        configRef.ocr &&
        configRef.ocr.defaultProvider;
      if (defaultId && providers[defaultId] && providers[defaultId].available !== false) {
        activeProviderId = defaultId;
      }
    },

    register: function (id, provider) {
      assertInterface(provider);
      providers[id] = provider;
      if (!activeProviderId && provider.available !== false) {
        activeProviderId = id;
      }
    },

    list: function () {
      return Object.keys(providers).map(function (id) {
        const p = providers[id];
        return {
          id: id,
          label: p.label || id,
          local: p.local !== false,
          available: p.available !== false
        };
      });
    },

    setProvider: function (id) {
      const provider = providers[id];
      if (!provider) throw new Error("Unknown OCR provider: " + id);
      if (provider.available === false) {
        throw new Error("OCR provider unavailable: " + id);
      }
      // Security: cloud providers require explicit enable flag in config
      if (provider.local === false) {
        const allowed =
          configRef &&
          configRef.security &&
          configRef.security.allowCloudOcr === true &&
          configRef.ocr &&
          Array.isArray(configRef.ocr.enabledCloudProviders) &&
          configRef.ocr.enabledCloudProviders.indexOf(id) >= 0;
        if (!allowed) {
          throw new Error(
            "Cloud OCR provider is not explicitly enabled in configuration: " +
              id
          );
        }
      }
      activeProviderId = id;
      return activeProviderId;
    },

    getProvider: function () {
      return activeProviderId;
    },

    /**
     * Async OCR. Emits progress via options.onProgress and SolverEvents if present.
     */
    recognize: async function (input, options) {
      const opts = options || {};
      const id = opts.provider || activeProviderId;
      const provider = providers[id];
      if (!provider) {
        throw (global.SolverErrors && global.SolverErrors.providerUnavailable(id)) ||
          new Error("No OCR provider selected");
      }
      if (provider.available === false) {
        throw (global.SolverErrors && global.SolverErrors.providerUnavailable(id)) ||
          new Error("OCR provider unavailable: " + id);
      }

      const timeoutMs = opts.timeoutMs || 120000;
      const recognizePromise = provider.recognize(input, opts);
      const timeoutPromise = new Promise(function (_, reject) {
        const t = setTimeout(function () {
          reject(
            (global.SolverErrors && global.SolverErrors.timeout("OCR")) ||
              new Error("OCR timeout")
          );
        }, timeoutMs);
        recognizePromise.then(
          function () {
            clearTimeout(t);
          },
          function () {
            clearTimeout(t);
          }
        );
      });

      const result = await Promise.race([recognizePromise, timeoutPromise]);
      return Object.assign(
        {
          text: "",
          confidence: 0,
          language: opts.language || "eng",
          blocks: [],
          provider: id,
          page: opts.page
        },
        result
      );
    }
  };

  global.OcrEngine = OcrEngine;
})(window);
