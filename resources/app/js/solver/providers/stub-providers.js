/**
 * Future solver providers — registered stubs (not hardcoded into UI).
 * Phase 8A/pre-8B: available=false. Solving is not implemented yet.
 */
(function (global) {
  "use strict";

  function notImplemented(name) {
    return async function () {
      throw new Error(
        name +
          " solver is architecture-ready but not implemented yet (await Phase 8B approval)."
      );
    };
  }

  const stubs = [
    {
      id: "local-rule-engine",
      label: "Local Rule Engine",
      local: true,
      available: false,
      supportsStreaming: false,
      supportsCancellation: true
    },
    {
      id: "ollama-local-llm",
      label: "Ollama / Local LLM",
      local: true,
      available: false,
      supportsStreaming: true,
      supportsCancellation: true
    },
    {
      id: "openai",
      label: "OpenAI",
      local: false,
      available: false,
      supportsStreaming: true,
      supportsCancellation: true
    },
    {
      id: "azure-openai",
      label: "Azure OpenAI",
      local: false,
      available: false,
      supportsStreaming: true,
      supportsCancellation: true
    },
    {
      id: "google-gemini",
      label: "Google Gemini",
      local: false,
      available: false,
      supportsStreaming: true,
      supportsCancellation: true
    },
    {
      id: "anthropic-claude",
      label: "Anthropic Claude",
      local: false,
      available: false,
      supportsStreaming: true,
      supportsCancellation: true
    }
  ];

  if (global.SolverEngine) {
    stubs.forEach(function (s) {
      global.SolverEngine.register(
        s.id,
        Object.assign({}, s, { solve: notImplemented(s.id) })
      );
    });
  }
})(window);
