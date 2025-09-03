// Cache utilities for fast loading
export const CACHE_KEYS = {
  CURRENT_LESSONS: 'current_lessons',
  USER_COURSES: 'user_courses',
  COURSE_ACTIVITIES: 'course_activities',
  DASHBOARD_COURSES: 'dashboard_courses',
  DASHBOARD_LESSONS: 'dashboard_lessons',
  DASHBOARD_ACTIVITIES: 'dashboard_activities',
  DASHBOARD_EXAMS: 'dashboard_exams',
  DASHBOARD_SCHEDULE: 'dashboard_schedule',
  DASHBOARD_STATS: 'dashboard_stats'
};

export const CACHE_DURATION = {
  LESSONS: 5 * 60 * 1000, // 5 minutes
  COURSES: 10 * 60 * 1000, // 10 minutes
  ACTIVITIES: 3 * 60 * 1000, // 3 minutes
  DASHBOARD: 15 * 60 * 1000 // 15 minutes for dashboard data
};

// Cache management functions
export const getCacheKey = (baseKey: string, userId: string) => `${baseKey}_${userId}`;

export const getDashboardCacheKey = (baseKey: string, userId: string) => `${baseKey}_dashboard_${userId}`;

export const getCachedData = (key: string, duration?: number) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Use provided duration or default to LESSONS duration
    const cacheDuration = duration || CACHE_DURATION.LESSONS;
    
    // Check if cache is still valid
    if (now - timestamp < cacheDuration) {
      console.log(`✅ Using cached data for ${key}`);
      return data;
    } else {
      console.log(`⏰ Cache expired for ${key}`);
      localStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error reading cache for ${key}:`, error);
    return null;
  }
};

export const setCachedData = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`💾 Cached data for ${key}`);
  } catch (error) {
    console.error(`❌ Error caching data for ${key}:`, error);
  }
};

export const clearDashboardCache = (userId: string) => {
  try {
    const keysToRemove = [
      getDashboardCacheKey(CACHE_KEYS.DASHBOARD_COURSES, userId),
      getDashboardCacheKey(CACHE_KEYS.DASHBOARD_LESSONS, userId),
      getDashboardCacheKey(CACHE_KEYS.DASHBOARD_ACTIVITIES, userId),
      getDashboardCacheKey(CACHE_KEYS.DASHBOARD_EXAMS, userId),
      getDashboardCacheKey(CACHE_KEYS.DASHBOARD_SCHEDULE, userId),
      getDashboardCacheKey(CACHE_KEYS.DASHBOARD_STATS, userId)
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`🗑️ Cleared dashboard cache for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error clearing dashboard cache:`, error);
  }
};







