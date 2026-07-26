/**
 * Achievement System (future-ready architecture)
 *
 * Badges · Daily Streak · Weekly Goals · Milestones
 */
(function (global) {
  "use strict";

  function createBadge(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      name: p.name || "",
      description: p.description || "",
      earnedAt: p.earnedAt || null
    };
  }

  function createWeeklyGoal(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      label: p.label || "",
      target: p.target != null ? p.target : 0,
      progress: p.progress != null ? p.progress : 0
    };
  }

  function createMilestone(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      label: p.label || "",
      reachedAt: p.reachedAt || null
    };
  }

  function createAchievementState(partial) {
    const p = partial || {};
    return {
      badges: Array.isArray(p.badges) ? p.badges.map(createBadge) : [],
      dailyStreak: p.dailyStreak != null ? p.dailyStreak : 0,
      weeklyGoals: Array.isArray(p.weeklyGoals)
        ? p.weeklyGoals.map(createWeeklyGoal)
        : [],
      milestones: Array.isArray(p.milestones)
        ? p.milestones.map(createMilestone)
        : []
    };
  }

  const AchievementSystem = {
    createBadge: createBadge,
    createWeeklyGoal: createWeeklyGoal,
    createMilestone: createMilestone,
    createState: createAchievementState,

    /** Architecture stub */
    getEmptyState: function () {
      return createAchievementState({});
    }
  };

  global.AchievementSchema = AchievementSystem;
})(window);
