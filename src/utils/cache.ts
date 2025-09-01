// Cache utilities for fast loading
export const CACHE_KEYS = {
  CURRENT_LESSONS: 'current_lessons',
  USER_COURSES: 'user_courses',
  COURSE_ACTIVITIES: 'course_activities'
};

export const CACHE_DURATION = {
  LESSONS: 5 * 60 * 1000, // 5 minutes
  COURSES: 10 * 60 * 1000, // 10 minutes
  ACTIVITIES: 3 * 60 * 1000 // 3 minutes
};

// Cache management functions
export const getCacheKey = (baseKey: string, userId: string) => `${baseKey}_${userId}`;

export const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION.LESSONS) {
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







