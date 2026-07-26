/**
 * Solver Engine — plugin registry / facade.
 * Question Objects enter here; providers return Solution Objects.
 * No provider is hardcoded.
 */
(function (global) {
  "use strict";

  const providers = Object.create(null);
  let activeProviderId = null;
  let configRef = null;
  /** @type {AbortController|null} */
  let activeRun = null;

  function assertInterface(provider) {
    const check =
      global.SolverProviderInterface &&
      global.SolverProviderInterface.validate(provider);
    if (check && !check.ok) {
      throw new Error(
        "Invalid solver provider: " + (check.errors || []).join("; ")
      );
    }
  }

  function pickAutoProvider() {
    // Prefer available local providers when offline/auto; else first available.
    const ids = Object.keys(providers);
    const localReady = ids.find(function (id) {
      return providers[id].available !== false && providers[id].local === true;
    });
    if (localReady) return localReady;
    return ids.find(function (id) {
      return providers[id].available !== false;
    }) || null;
  }

  function cloudAllowed(id) {
    return (
      configRef &&
      configRef.solver &&
      configRef.solver.allowCloudSolver === true &&
      Array.isArray(configRef.solver.enabledCloudProviders) &&
      configRef.solver.enabledCloudProviders.indexOf(id) >= 0
    );
  }

  const SolverEngine = {
    configure: function (config) {
      configRef = config || null;
      const defaultId =
        configRef &&
        configRef.solver &&
        configRef.solver.defaultProvider;
      if (
        defaultId &&
        providers[defaultId] &&
        providers[defaultId].available !== false
      ) {
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
          available: p.available !== false,
          supportsStreaming: !!p.supportsStreaming,
          supportsCancellation: !!p.supportsCancellation
        };
      });
    },

    setProvider: function (id) {
      const provider = providers[id];
      if (!provider) throw new Error("Unknown solver provider: " + id);
      if (provider.available === false) {
        throw new Error("Solver provider unavailable: " + id);
      }
      if (provider.local === false && !cloudAllowed(id)) {
        throw new Error(
          "Cloud solver provider is not explicitly enabled in configuration: " +
            id
        );
      }
      activeProviderId = id;
      return activeProviderId;
    },

    getProvider: function () {
      return activeProviderId;
    },

    /**
     * Resolve provider for offline | online | auto.
     * @param {string} runtimeMode
     * @returns {string|null}
     */
    resolveProviderId: function (runtimeMode) {
      const mode = runtimeMode || "auto";
      if (mode === "auto") {
        return pickAutoProvider();
      }
      if (mode === "offline") {
        const localId = Object.keys(providers).find(function (id) {
          return (
            providers[id].available !== false && providers[id].local === true
          );
        });
        return localId || null;
      }
      // online: prefer non-local available + allowed
      const onlineId = Object.keys(providers).find(function (id) {
        return (
          providers[id].available !== false &&
          providers[id].local === false &&
          cloudAllowed(id)
        );
      });
      return onlineId || activeProviderId;
    },

    /**
     * Cancel the in-flight solve (if provider supports AbortSignal).
     */
    cancel: function () {
      if (activeRun) {
        activeRun.abort();
        activeRun = null;
        if (global.SolverEvents) {
          global.SolverEvents.emit("solver:cancelled", {});
        }
      }
    },

    /**
     * @param {object} question Question Object
     * @param {object} [options] SolveOptions
     * @returns {Promise<object>} Solution Object
     */
    solve: async function (question, options) {
      const opts = Object.assign({}, options || {});
      const runtimeMode = opts.mode || "auto";
      const resolved =
        opts.provider ||
        this.resolveProviderId(runtimeMode) ||
        activeProviderId;
      const provider = providers[resolved];

      if (!provider || provider.available === false) {
        throw new Error(
          "No solver provider available for mode: " + runtimeMode
        );
      }
      if (provider.local === false && !cloudAllowed(resolved)) {
        throw new Error(
          "Cloud solver provider is not explicitly enabled: " + resolved
        );
      }

      // Cancellation support
      activeRun = new AbortController();
      if (opts.signal) {
        opts.signal.addEventListener("abort", function () {
          activeRun && activeRun.abort();
        });
      }
      opts.signal = activeRun.signal;
      opts.mode = runtimeMode;

      const retryCount =
        typeof opts.retryCount === "number"
          ? opts.retryCount
          : (configRef &&
              configRef.solver &&
              configRef.solver.retryCount) ||
            0;

      let attempt = 0;
      let lastError = null;

      if (global.SolverEvents) {
        global.SolverEvents.emit("solver:started", {
          questionId: question && question.id,
          provider: resolved
        });
      }

      while (attempt <= retryCount) {
        try {
          if (opts.signal && opts.signal.aborted) {
            const cancelled =
              global.SolutionSchema &&
              global.SolutionSchema.create({
                questionId: question && question.id,
                provider: resolved,
                status: global.SolutionSchema.Status.CANCELLED,
                question: (question && (question.text || question.recognizedText)) || "",
                verification: global.SolutionSchema.Verification.NEEDS_REVIEW
              });
            return cancelled;
          }

          const raw = await provider.solve(question, opts);
          const solution =
            global.SolutionSchema && global.SolutionSchema.create
              ? global.SolutionSchema.create(
                  Object.assign(
                    {
                      questionId: question && question.id,
                      provider: resolved,
                      status: global.SolutionSchema.Status.COMPLETE,
                      question:
                        (question &&
                          (question.text || question.recognizedText)) ||
                        "",
                      explanationMode: opts.explanationMode || "Standard",
                      language: opts.language || "en",
                      runtimeMode: runtimeMode,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    },
                    raw || {}
                  )
                )
              : raw;

          if (global.SolverEvents) {
            global.SolverEvents.emit("solver:done", {
              solutionId: solution && solution.id,
              provider: resolved
            });
          }

          activeRun = null;
          return solution;
        } catch (err) {
          lastError = err;
          if (opts.signal && opts.signal.aborted) {
            activeRun = null;
            throw err;
          }
          attempt += 1;
          if (attempt <= retryCount && global.SolverEvents) {
            global.SolverEvents.emit("solver:retry", {
              attempt: attempt,
              provider: resolved,
              error: String(err && err.message)
            });
          }
        }
      }

      activeRun = null;
      if (global.SolverEvents) {
        global.SolverEvents.emit("solver:error", {
          provider: resolved,
          error: String(lastError && lastError.message)
        });
      }
      throw lastError || new Error("Solver failed");
    }
  };

  // Extend event name constants if SolverEvents exists
  if (global.SolverEvents) {
    global.SolverEvents.SOLVER_STARTED = "solver:started";
    global.SolverEvents.SOLVER_DONE = "solver:done";
    global.SolverEvents.SOLVER_ERROR = "solver:error";
    global.SolverEvents.SOLVER_RETRY = "solver:retry";
    global.SolverEvents.SOLVER_CANCELLED = "solver:cancelled";
    global.SolverEvents.SOLVER_STREAM = "solver:stream";
  }

  global.SolverEngine = SolverEngine;
})(window);
