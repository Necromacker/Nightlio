// Local Storage API Service - replaces backend API calls

import {
  moodStorage,
  goalStorage,
  groupStorage,
  achievementStorage,
  statisticsStorage,
  goalCompletionStorage,
} from './localStorage';

class ApiService {
  constructor() {
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  // Public config
  async getPublicConfig() {
    return { enable_google_oauth: false };
  }

  // Mood entries endpoints
  async getMoodEntries(startDate, endDate) {
    if (startDate && endDate) {
      return moodStorage.getByDateRange(startDate, endDate);
    }
    return moodStorage.getAll();
  }

  async createMoodEntry(entryData) {
    const entry = moodStorage.create(entryData);
    
    // Convert selected_options IDs to selection objects
    if (entry.selected_options && entry.selected_options.length > 0) {
      const groups = groupStorage.getAll();
      const selections = [];
      
      for (const group of groups) {
        if (group.options) {
          for (const option of group.options) {
            if (entry.selected_options.includes(option.id)) {
              selections.push({
                id: option.id,
                name: option.name,
                group_id: group.id,
                group_name: group.name,
              });
            }
          }
        }
      }
      
      entry.selections = selections;
      moodStorage.update(entry.id, { selections });
    }
    
    // Check for new achievements
    const allEntries = moodStorage.getAll();
    const allGoals = goalStorage.getAll();
    const newAchievements = achievementStorage.checkAndUnlock(allEntries, allGoals);
    
    return {
      ...entry,
      new_achievements: newAchievements,
    };
  }

  async updateMoodEntry(entryId, entryData) {
    const updated = moodStorage.update(entryId, entryData);
    
    // Convert selected_options IDs to selection objects
    if (entryData.selected_options && entryData.selected_options.length > 0) {
      const groups = groupStorage.getAll();
      const selections = [];
      
      for (const group of groups) {
        if (group.options) {
          for (const option of group.options) {
            if (entryData.selected_options.includes(option.id)) {
              selections.push({
                id: option.id,
                name: option.name,
                group_id: group.id,
                group_name: group.name,
              });
            }
          }
        }
      }
      
      updated.selections = selections;
      moodStorage.update(entryId, { selections });
    }
    
    return updated;
  }

  async deleteMoodEntry(entryId) {
    return moodStorage.delete(entryId);
  }

  // Statistics endpoints
  async getStatistics() {
    const entries = moodStorage.getAll();
    return statisticsStorage.calculate(entries);
  }

  // Streak endpoint
  async getCurrentStreak() {
    const entries = moodStorage.getAll();
    const streak = statisticsStorage.calculate(entries).current_streak;
    return {
      current_streak: streak,
      message: streak > 0 ? `You're on a ${streak}-day streak! 🔥` : 'Start your streak today!',
    };
  }

  // Groups endpoints
  async getGroups() {
    return groupStorage.getAll();
  }

  async createGroup(groupData) {
    const group = groupStorage.create(groupData);
    return { group_id: group.id };
  }

  async createGroupOption(groupId, optionData) {
    const option = groupStorage.createOption(groupId, optionData);
    return { option_id: option.id };
  }

  async deleteGroup(groupId) {
    groupStorage.delete(groupId);
    return { success: true };
  }

  // Entry selections endpoint
  async getEntrySelections(entryId) {
    const entry = moodStorage.getById(entryId);
    if (!entry) return [];
    
    // If selections already exist as objects, return them
    if (entry.selections && Array.isArray(entry.selections) && entry.selections.length > 0) {
      if (typeof entry.selections[0] === 'object') {
        return entry.selections;
      }
    }
    
    // Otherwise, convert selected_options IDs to selection objects
    const selectedOptionIds = entry.selected_options || [];
    const groups = groupStorage.getAll();
    const selections = [];
    
    for (const group of groups) {
      if (group.options) {
        for (const option of group.options) {
          if (selectedOptionIds.includes(option.id)) {
            selections.push({
              id: option.id,
              name: option.name,
              group_id: group.id,
              group_name: group.name,
            });
          }
        }
      }
    }
    
    return selections;
  }

  // Achievement endpoints
  async getUserAchievements() {
    return achievementStorage.getAll();
  }

  async checkAchievements() {
    const entries = moodStorage.getAll();
    const goals = goalStorage.getAll();
    const newAchievements = achievementStorage.checkAndUnlock(entries, goals);
    return {
      new_achievements: newAchievements,
      count: newAchievements.length,
    };
  }

  async getAchievementsProgress() {
    const entries = moodStorage.getAll();
    return achievementStorage.getProgress(entries);
  }

  // Goals endpoints
  async getGoals() {
    return goalStorage.getAll();
  }

  async createGoal(goal) {
    const payload = { ...goal };
    if (payload.frequency && !payload.frequency_per_week) {
      const n = parseInt(String(payload.frequency).trim(), 10);
      if (!Number.isNaN(n)) payload.frequency_per_week = n;
      delete payload.frequency;
    }
    return goalStorage.create(payload);
  }

  async updateGoal(goalId, patch) {
    const payload = { ...patch };
    if (payload.frequency && !payload.frequency_per_week) {
      const n = parseInt(String(payload.frequency).trim(), 10);
      if (!Number.isNaN(n)) payload.frequency_per_week = n;
      delete payload.frequency;
    }
    return goalStorage.update(goalId, payload);
  }

  async deleteGoal(goalId) {
    goalStorage.delete(goalId);
    return { success: true };
  }

  async incrementGoalProgress(goalId) {
    return goalStorage.incrementProgress(goalId);
  }

  async getGoalCompletions(goalId, { start, end } = {}) {
    return goalCompletionStorage.getCompletions(goalId, start, end);
  }
}

const apiService = new ApiService();
export default apiService;
