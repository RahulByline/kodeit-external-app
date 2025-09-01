import axios from 'axios';

// Enhanced Moodle API Configuration for KodeIt LMS
const API_BASE_URL = 'https://kodeit.legatoserver.com/webservice/rest/server.php';
const API_TOKEN = '2eabaa23e0cf9a5442be25613c41abf5';

// Type definitions
interface MoodleUser {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  username: string;
  profileimageurl?: string;
  lastaccess?: number;
  roles?: MoodleRole[];
  companyid?: number;
  suspended?: number;
}

interface MoodleRole {
  shortname: string;
  name: string;
}

interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
  summary?: string;
  description?: string;
  categoryid?: number;
  categoryname?: string;
  courseimage?: string;
  imageurl?: string;
  overviewfiles?: any[];
  progress?: number;
  startdate?: number;
  enddate?: number;
  visible?: number;
}

interface MoodleActivity {
  id: number;
  name: string;
  type: string;
  description?: string;
  completion?: any;
  dates?: any[];
}

interface MoodleAssignment {
  id: number;
  name: string;
  courseid: number;
  coursemodule: number;
  duedate?: number;
  allowsubmissionsfromdate?: number;
  cutoffdate?: number;
  gradingduedate?: number;
  maxattempts?: number;
  submissiontypes?: string[];
  gradingtypes?: string[];
}

// Create enhanced axios instance for Moodle API
const enhancedMoodleApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
});

// Add request interceptor to include Moodle token
enhancedMoodleApi.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    wstoken: API_TOKEN,
    moodlewsrestformat: 'json',
  };
  return config;
});

// Add response interceptor to handle API errors gracefully
enhancedMoodleApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('Enhanced API request failed:', error.message);
    return Promise.reject(error);
  }
);

// Cache management
const cache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Enhanced API service with parallel loading capabilities
export const enhancedMoodleService = {
  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'core_webservice_get_site_info'
      }));
      return response.status === 200;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  },

  // Get user courses with enhanced error handling
  async getUserCourses(userId: string): Promise<MoodleCourse[]> {
    const cacheKey = `courses_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔄 Fetching user courses for:', userId);
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'core_enrol_get_users_courses',
        userid: userId
      }));

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} courses for user ${userId}`);
        setCachedData(cacheKey, response.data);
        return response.data;
      } else {
        console.warn('⚠️ No courses found or invalid response format');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching user courses:', error);
      return [];
    }
  },

  // Get course contents with parallel loading
  async getCourseContents(courseId: string): Promise<any[]> {
    const cacheKey = `contents_${courseId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔄 Fetching course contents for:', courseId);
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'core_course_get_contents',
        courseid: courseId
      }));

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} sections for course ${courseId}`);
        setCachedData(cacheKey, response.data);
        return response.data;
      } else {
        console.warn('⚠️ No course contents found or invalid response format');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching course contents:', error);
      return [];
    }
  },



  // Get course activities
  async getCourseActivities(courseId: string): Promise<MoodleActivity[]> {
    const cacheKey = `activities_${courseId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔄 Fetching course activities for:', courseId);
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'core_course_get_contents',
        courseid: courseId
      }));

      if (response.data && Array.isArray(response.data)) {
        const activities: MoodleActivity[] = [];
        response.data.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            activities.push(...section.modules);
          }
        });
        
        console.log(`✅ Found ${activities.length} activities for course ${courseId}`);
        setCachedData(cacheKey, activities);
        return activities;
      } else {
        console.warn('⚠️ No activities found or invalid response format');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching course activities:', error);
      return [];
    }
  },

  // Get user assignments
  async getUserAssignments(userId: string): Promise<MoodleAssignment[]> {
    const cacheKey = `assignments_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔄 Fetching user assignments for:', userId);
      
      // First get user courses
      const courses = await this.getUserCourses(userId);
      
      // Then get assignments from each course
      const allAssignments: MoodleAssignment[] = [];
      
      for (const course of courses.slice(0, 3)) { // Limit to first 3 courses for performance
        try {
          const response = await enhancedMoodleApi.post('', new URLSearchParams({
            wsfunction: 'mod_assign_get_assignments',
            courseids: course.id.toString()
          }));

          if (response.data && response.data.courses && Array.isArray(response.data.courses)) {
            response.data.courses.forEach((courseData: any) => {
              if (courseData.assignments && Array.isArray(courseData.assignments)) {
                allAssignments.push(...courseData.assignments);
              }
            });
          }
        } catch (courseError) {
          console.warn(`⚠️ Failed to fetch assignments for course ${course.id}:`, courseError);
        }
      }
      
      console.log(`✅ Found ${allAssignments.length} assignments for user ${userId}`);
      setCachedData(cacheKey, allAssignments);
      return allAssignments;
    } catch (error) {
      console.error('❌ Error fetching user assignments:', error);
      return [];
    }
  },

  // Get user activity data
  async getUserActivity(userId: string): Promise<any[]> {
    const cacheKey = `activity_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔄 Fetching user activity for:', userId);
      
      // Get user courses first
      const courses = await this.getUserCourses(userId);
      
      // Get activities from each course
      const allActivities: any[] = [];
      
      for (const course of courses.slice(0, 3)) { // Limit to first 3 courses
        try {
          const activities = await this.getCourseActivities(course.id.toString());
          allActivities.push(...activities);
        } catch (courseError) {
          console.warn(`⚠️ Failed to fetch activities for course ${course.id}:`, courseError);
        }
      }
      
      console.log(`✅ Found ${allActivities.length} activities for user ${userId}`);
      setCachedData(cacheKey, allActivities);
      return allActivities;
    } catch (error) {
      console.error('❌ Error fetching user activity:', error);
      return [];
    }
  },

  // Parallel data loading for dashboard
  async getDashboardData(userId: string) {
    console.log('🚀 Starting parallel dashboard data loading for user:', userId);
    const startTime = Date.now();

    try {
      const [courses, assignments, activities] = await Promise.allSettled([
        this.getUserCourses(userId),
        this.getUserAssignments(userId),
        this.getUserActivity(userId)
      ]);

      const loadTime = Date.now() - startTime;
      console.log(`⚡ Parallel dashboard loading completed in ${loadTime}ms`);

      return {
        courses: courses.status === 'fulfilled' ? courses.value : [],
        assignments: assignments.status === 'fulfilled' ? assignments.value : [],
        activities: activities.status === 'fulfilled' ? activities.value : [],
        loadTime
      };
    } catch (error) {
      console.error('❌ Error in parallel dashboard loading:', error);
      return {
        courses: [],
        assignments: [],
        activities: [],
        loadTime: 0
      };
    }
  },

  // SCORM Web Services
  // Map course module id to SCORM instance id using mod_scorm_get_scorms_by_courses
  async getScormInstanceByCourseModule(courseId: number | string, courseModuleId: number | string): Promise<any | null> {
    try {
      const params = new URLSearchParams({
        wsfunction: 'mod_scorm_get_scorms_by_courses',
        'courseids[0]': String(courseId)
      });
      const response = await enhancedMoodleApi.post('', params);
      const scorms = response.data?.scorms || [];
      const match = scorms.find((s: any) => String(s.coursemodule) === String(courseModuleId));
      return match || null;
    } catch (error) {
      console.warn('Failed to get SCORM instances for course', courseId, error);
      return null;
    }
  },

  async getScormAccessInformation(scormId: number | string): Promise<any> {
    try {
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'mod_scorm_get_scorm_access_information',
        scormid: String(scormId)
      }));
      return response.data;
    } catch (error) {
      console.warn('Failed to get SCORM access information', error);
      return null;
    }
  },

  async getScormAttemptCount(scormId: number | string, userId: number | string, ignoreMissingCompletion: number = 0): Promise<number> {
    try {
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'mod_scorm_get_scorm_attempt_count',
        scormid: String(scormId),
        userid: String(userId),
        ignoremissingcompletion: String(ignoreMissingCompletion)
      }));
      return response.data?.attemptscount ?? 0;
    } catch (error) {
      console.warn('Failed to get SCORM attempt count', error);
      return 0;
    }
  },

  async getScormScoes(scormId: number | string, organization: string = ''): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        wsfunction: 'mod_scorm_get_scorm_scoes',
        scormid: String(scormId)
      });
      if (organization) params.append('organization', organization);
      const response = await enhancedMoodleApi.post('', params);
      return response.data?.scoes || [];
    } catch (error) {
      console.warn('Failed to get SCORM SCOes', error);
      return [];
    }
  },

  async getScormScoTracks(scoId: number | string, userId: number | string, attempt: number = 0): Promise<any> {
    try {
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'mod_scorm_get_scorm_sco_tracks',
        scoid: String(scoId),
        userid: String(userId),
        attempt: String(attempt)
      }));
      return response.data || null;
    } catch (error) {
      console.warn('Failed to get SCORM SCO tracks', error);
      return null;
    }
  },

  async getScormUserData(scormId: number | string, attempt: number): Promise<any> {
    try {
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'mod_scorm_get_scorm_user_data',
        scormid: String(scormId),
        attempt: String(attempt)
      }));
      return response.data || null;
    } catch (error) {
      console.warn('Failed to get SCORM user data', error);
      return null;
    }
  },

  async insertScormTracks(scoId: number | string, attempt: number, tracks: { element: string; value: string }[]): Promise<any> {
    try {
      const params = new URLSearchParams({
        wsfunction: 'mod_scorm_insert_scorm_tracks',
        scoid: String(scoId),
        attempt: String(attempt)
      });
      tracks.forEach((t, i) => {
        params.append(`tracks[${i}][element]`, t.element);
        params.append(`tracks[${i}][value]`, t.value);
      });
      const response = await enhancedMoodleApi.post('', params);
      return response.data || null;
    } catch (error) {
      console.warn('Failed to insert SCORM tracks', error);
      return null;
    }
  },

  async launchSco(scormId: number | string, scoId: number | string = 0): Promise<any> {
    try {
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'mod_scorm_launch_sco',
        scormid: String(scormId),
        scoid: String(scoId)
      }));
      return response.data || null;
    } catch (error) {
      console.warn('Failed to launch SCORM SCO', error);
      return null;
    }
  },

  async viewScorm(scormId: number | string): Promise<any> {
    try {
      const response = await enhancedMoodleApi.post('', new URLSearchParams({
        wsfunction: 'mod_scorm_view_scorm',
        scormid: String(scormId)
      }));
      return response.data || null;
    } catch (error) {
      console.warn('Failed to view SCORM', error);
      return null;
    }
  },

  // Clear cache for specific user
  clearUserCache(userId: string) {
    const keysToDelete = [
      `courses_${userId}`,
      `assignments_${userId}`,
      `activity_${userId}`
    ];
    
    keysToDelete.forEach(key => cache.delete(key));
    console.log('🗑️ Cleared cache for user:', userId);
  },

  // Clear all cache
  clearAllCache() {
    cache.clear();
    console.log('🗑️ Cleared all cache');
  }
};

export default enhancedMoodleService;
