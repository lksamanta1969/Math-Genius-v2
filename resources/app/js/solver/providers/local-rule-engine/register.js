/**
 * Registers Local Rule Engine with SolverEngine (browser).
 * Other cloud/local LLM providers remain stubs in stub-providers.js.
 */
(function (global) {
  "use strict";

  if (!global.SolverEngine || !global.LocalRuleEngineProvider) return;

  const provider = global.LocalRuleEngineProvider;
  global.SolverEngine.register(provider.id, {
    id: provider.id,
    label: provider.label,
    local: true,
    available: true,
    supportsStreaming: false,
    supportsCancellation: true,
    solve: function (question, options) {
      return provider.solve(question, options);
    },
    isReady: provider.isReady
  });
})(window);
