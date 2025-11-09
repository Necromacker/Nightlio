// Local Storage Service for storing all app data locally

const STORAGE_KEYS = {
  MOOD_ENTRIES: 'nightlio_mood_entries',
  GOALS: 'nightlio_goals',
  GROUPS: 'nightlio_groups',
  ACHIEVEMENTS: 'nightlio_achievements',
  STATISTICS: 'nightlio_statistics',
  GOAL_COMPLETIONS: 'nightlio_goal_completions',
};

// Helper functions
const getItem = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Mood Entries
export const moodStorage = {
  getAll: () => getItem(STORAGE_KEYS.MOOD_ENTRIES, []),
  
  getById: (id) => {
    const entries = moodStorage.getAll();
    return entries.find(entry => entry.id === id);
  },
  
  create: (entryData) => {
    const entries = moodStorage.getAll();
    const newEntry = {
      id: generateId(),
      ...entryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    entries.push(newEntry);
    setItem(STORAGE_KEYS.MOOD_ENTRIES, entries);
    return newEntry;
  },
  
  update: (id, updates) => {
    const entries = moodStorage.getAll();
    const index = entries.findIndex(entry => entry.id === id);
    if (index === -1) throw new Error('Entry not found');
    
    entries[index] = {
      ...entries[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.MOOD_ENTRIES, entries);
    return entries[index];
  },
  
  delete: (id) => {
    const entries = moodStorage.getAll();
    const filtered = entries.filter(entry => entry.id !== id);
    setItem(STORAGE_KEYS.MOOD_ENTRIES, filtered);
    return true;
  },
  
  getByDateRange: (startDate, endDate) => {
    const entries = moodStorage.getAll();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  },
};

// Goals
export const goalStorage = {
  getAll: () => getItem(STORAGE_KEYS.GOALS, []),
  
  getById: (id) => {
    const goals = goalStorage.getAll();
    return goals.find(goal => goal.id === id);
  },
  
  create: (goalData) => {
    const goals = goalStorage.getAll();
    const newGoal = {
      id: generateId(),
      ...goalData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 0,
      frequency_per_week: goalData.frequency_per_week || goalData.frequency || 0,
    };
    goals.push(newGoal);
    setItem(STORAGE_KEYS.GOALS, goals);
    return newGoal;
  },
  
  update: (id, updates) => {
    const goals = goalStorage.getAll();
    const index = goals.findIndex(goal => goal.id === id);
    if (index === -1) throw new Error('Goal not found');
    
    goals[index] = {
      ...goals[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.GOALS, goals);
    return goals[index];
  },
  
  delete: (id) => {
    const goals = goalStorage.getAll();
    const filtered = goals.filter(goal => goal.id !== id);
    setItem(STORAGE_KEYS.GOALS, filtered);
    return true;
  },
  
  incrementProgress: (id) => {
    const goal = goalStorage.getById(id);
    if (!goal) throw new Error('Goal not found');
    return goalStorage.update(id, { progress: (goal.progress || 0) + 1 });
  },
};

// Groups
export const groupStorage = {
  getAll: () => getItem(STORAGE_KEYS.GROUPS, []),
  
  getById: (id) => {
    const groups = groupStorage.getAll();
    return groups.find(group => group.id === id);
  },
  
  create: (groupData) => {
    const groups = groupStorage.getAll();
    const newGroup = {
      id: generateId(),
      name: groupData.name || groupData,
      options: [],
      created_at: new Date().toISOString(),
    };
    groups.push(newGroup);
    setItem(STORAGE_KEYS.GROUPS, groups);
    return newGroup;
  },
  
  createOption: (groupId, optionData) => {
    const groups = groupStorage.getAll();
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) throw new Error('Group not found');
    
    const newOption = {
      id: generateId(),
      name: optionData.name || optionData,
      group_id: groupId,
    };
    
    if (!groups[groupIndex].options) {
      groups[groupIndex].options = [];
    }
    groups[groupIndex].options.push(newOption);
    setItem(STORAGE_KEYS.GROUPS, groups);
    return newOption;
  },
  
  delete: (id) => {
    const groups = groupStorage.getAll();
    const filtered = groups.filter(group => group.id !== id);
    setItem(STORAGE_KEYS.GROUPS, filtered);
    return true;
  },
};

// Achievements
export const achievementStorage = {
  getAll: () => getItem(STORAGE_KEYS.ACHIEVEMENTS, []),
  
  create: (achievementData) => {
    const achievements = achievementStorage.getAll();
    const exists = achievements.find(a => a.achievement_type === achievementData.achievement_type);
    if (exists) return exists;
    
    const newAchievement = {
      id: generateId(),
      ...achievementData,
      earned_at: new Date().toISOString(),
    };
    achievements.push(newAchievement);
    setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    return newAchievement;
  },
  
  checkAndUnlock: (entries, goals) => {
    const achievements = achievementStorage.getAll();
    const newAchievements = [];
    
    // First Entry
    if (entries.length === 1 && !achievements.find(a => a.achievement_type === 'first_entry')) {
      newAchievements.push(achievementStorage.create({
        achievement_type: 'first_entry',
        name: 'First Entry',
        description: 'Log your first mood entry',
        icon: 'Zap',
        rarity: 'common',
      }));
    }
    
    // Week Warrior (7-day streak)
    const streak = calculateStreak(entries);
    if (streak >= 7 && !achievements.find(a => a.achievement_type === 'week_warrior')) {
      newAchievements.push(achievementStorage.create({
        achievement_type: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: 'Flame',
        rarity: 'uncommon',
      }));
    }
    
    // Consistency King (30-day streak)
    if (streak >= 30 && !achievements.find(a => a.achievement_type === 'consistency_king')) {
      newAchievements.push(achievementStorage.create({
        achievement_type: 'consistency_king',
        name: 'Consistency King',
        description: 'Maintain a 30-day streak',
        icon: 'Crown',
        rarity: 'rare',
      }));
    }
    
    // Mood Master (100 entries)
    if (entries.length >= 100 && !achievements.find(a => a.achievement_type === 'mood_master')) {
      newAchievements.push(achievementStorage.create({
        achievement_type: 'mood_master',
        name: 'Mood Master',
        description: 'Log 100 total entries',
        icon: 'Target',
        rarity: 'legendary',
      }));
    }
    
    return newAchievements;
  },
  
  getProgress: (entries) => {
    const achievements = achievementStorage.getAll();
    const streak = calculateStreak(entries);
    
    return {
      first_entry: { current: entries.length >= 1 ? 1 : 0, max: 1 },
      week_warrior: { current: Math.min(streak, 7), max: 7 },
      consistency_king: { current: Math.min(streak, 30), max: 30 },
      mood_master: { current: Math.min(entries.length, 100), max: 100 },
      data_lover: { current: 0, max: 10 }, // This would need to track stats views
    };
  },
};

// Statistics
export const calculateStreak = (entries) => {
  if (entries.length === 0) return 0;
  
  // Get unique dates (one entry per day counts)
  const dateSet = new Set();
  entries.forEach(entry => {
    if (entry.date) {
      // Handle both date strings and Date objects
      const dateStr = typeof entry.date === 'string' ? entry.date : entry.date.toISOString().split('T')[0];
      dateSet.add(dateStr);
    }
  });
  
  const uniqueDates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a));
  if (uniqueDates.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if today has an entry
  const todayStr = today.toISOString().split('T')[0];
  const hasToday = uniqueDates.includes(todayStr);
  
  // Start from today or yesterday
  let checkDate = new Date(today);
  if (!hasToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Count consecutive days
  for (let i = 0; i < uniqueDates.length; i++) {
    const entryDateStr = uniqueDates[i];
    const entryDate = new Date(entryDateStr);
    entryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((checkDate - entryDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      checkDate = new Date(entryDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
};

export const statisticsStorage = {
  calculate: (entries) => {
    if (entries.length === 0) {
      return {
        total_entries: 0,
        average_mood: 0,
        mood_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        current_streak: 0,
      };
    }
    
    const moodSum = entries.reduce((sum, entry) => sum + (entry.mood || 0), 0);
    const averageMood = moodSum / entries.length;
    
    const moodDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach(entry => {
      const mood = entry.mood || 0;
      if (mood >= 1 && mood <= 5) {
        moodDistribution[mood]++;
      }
    });
    
    const currentStreak = calculateStreak(entries);
    
    return {
      total_entries: entries.length,
      average_mood: Math.round(averageMood * 100) / 100,
      mood_distribution: moodDistribution,
      current_streak: currentStreak,
    };
  },
};

// Goal Completions
export const goalCompletionStorage = {
  getAll: () => getItem(STORAGE_KEYS.GOAL_COMPLETIONS, {}),
  
  recordCompletion: (goalId, date = new Date().toISOString().split('T')[0]) => {
    const completions = goalCompletionStorage.getAll();
    if (!completions[goalId]) {
      completions[goalId] = [];
    }
    if (!completions[goalId].includes(date)) {
      completions[goalId].push(date);
      setItem(STORAGE_KEYS.GOAL_COMPLETIONS, completions);
    }
    return completions[goalId];
  },
  
  getCompletions: (goalId, startDate, endDate) => {
    const completions = goalCompletionStorage.getAll();
    const goalCompletions = completions[goalId] || [];
    
    if (startDate && endDate) {
      return goalCompletions.filter(date => {
        return date >= startDate && date <= endDate;
      });
    }
    
    return goalCompletions;
  },
};

