/**
 * Local Learning Analytics (on-device only in this phase)
 *
 * Tracks:
 * - Topics Solved
 * - Accuracy
 * - Average Time
 * - Favourite Topics
 * - Recently Solved
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "mathGenius.learningAnalytics.v1";

  function emptyStore() {
    return {
      topicsSolved: {},
      attempts: 0,
      correct: 0,
      totalTimeMs: 0,
      favouriteTopics: [],
      recentlySolved: []
    };
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyStore();
      return Object.assign(emptyStore(), JSON.parse(raw));
    } catch (err) {
      return emptyStore();
    }
  }

  function writeStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (err) {
      // ignore quota / private mode
    }
  }

  const LearningAnalytics = {
    storageKey: STORAGE_KEY,

    getSnapshot: function () {
      const s = readStore();
      return {
        topicsSolved: s.topicsSolved,
        accuracy:
          s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0,
        averageTimeMs:
          s.attempts > 0 ? Math.round(s.totalTimeMs / s.attempts) : 0,
        favouriteTopics: s.favouriteTopics.slice(),
        recentlySolved: s.recentlySolved.slice()
      };
    },

    /**
     * Record a local learning event (no network).
     * @param {object} event
     */
    track: function (event) {
      const e = event || {};
      const s = readStore();
      const topic = e.topic || "General";

      s.attempts += 1;
      if (e.correct) s.correct += 1;
      if (typeof e.timeMs === "number") s.totalTimeMs += e.timeMs;

      s.topicsSolved[topic] = (s.topicsSolved[topic] || 0) + 1;

      if (e.favouriteTopic) {
        if (s.favouriteTopics.indexOf(e.favouriteTopic) < 0) {
          s.favouriteTopics.unshift(e.favouriteTopic);
          s.favouriteTopics = s.favouriteTopics.slice(0, 20);
        }
      }

      if (e.questionId || e.topic) {
        s.recentlySolved.unshift({
          questionId: e.questionId || null,
          topic: topic,
          at: new Date().toISOString()
        });
        s.recentlySolved = s.recentlySolved.slice(0, 50);
      }

      writeStore(s);
      return this.getSnapshot();
    },

    clear: function () {
      writeStore(emptyStore());
    }
  };

  global.LearningAnalytics = LearningAnalytics;
})(window);
