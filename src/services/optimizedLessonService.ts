import moodleService from './moodleApi';
import { 
  getCacheKey, 
  getCachedData, 
  setCachedData, 
  CACHE_KEYS
} from '../utils/cache';

// Performance monitoring for lazy loading
class LazyLoadingMonitor {
  private metrics: Map<string, { startTime: number; endTime?: number; cacheHit: boolean }> = new Map();
  private cacheHits = 0;
  private totalRequests = 0;
  private lazyLoads = 0;

  startTimer(key: string) {
    this.metrics.set(key, { startTime: performance.now(), cacheHit: false });
  }

  endTimer(key: string, cacheHit: boolean = false) {
    const metric = this.metrics.get(key);
    if (metric) {
      metric.endTime = performance.now();
      metric.cacheHit = cacheHit;
      if (cacheHit) this.cacheHits++;
      this.totalRequests++;
    }
  }

  recordLazyLoad() {
    this.lazyLoads++;
  }

  getMetrics() {
    const totalTime = Array.from(this.metrics.values()).reduce((sum, m) => {
      return sum + (m.endTime ? m.endTime - m.startTime : 0);
    }, 0);
    
    return {
      totalRequests: this.totalRequests,
      cacheHits: this.cacheHits,
      lazyLoads: this.lazyLoads,
      cacheHitRate: this.totalRequests > 0 ? Math.round((this.cacheHits / this.totalRequests) * 100) : 0,
      averageResponseTime: this.totalRequests > 0 ? Math.round(totalTime / this.totalRequests) : 0,
      totalTime: Math.round(totalTime)
    };
  }

  reset() {
    this.metrics.clear();
    this.cacheHits = 0;
    this.totalRequests = 0;
    this.lazyLoads = 0;
  }
}

const lazyLoadingMonitor = new LazyLoadingMonitor();

// Lazy loading lesson service - only fetches when explicitly requested
class LazyLoadingLessonService {
  private userId: string | null = null;
  private loadedCourses: Set<string> = new Set();
  private loadedLessons: Set<string> = new Set();
  private loadedActivities: Set<string> = new Set();

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Only fetch courses - no lessons or activities
  async fetchUserCourses(): Promise<any[]> {
    if (!this.userId) return [];

    const cacheKey = getCacheKey(CACHE_KEYS.USER_COURSES, this.userId);
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      lazyLoadingMonitor.startTimer('fetchUserCourses');
      lazyLoadingMonitor.endTimer('fetchUserCourses', true);
      console.log('⚡ INSTANT: User courses from cache');
      return cached;
    }

    // Fetch only courses from API
    lazyLoadingMonitor.startTimer('fetchUserCourses');
    console.log('📚 Fetching user courses from Moodle API...');
    
    try {
      const courses = await moodleService.getUserCourses(this.userId);
      const transformedCourses = this.transformCourses(courses);
      
      // Cache the courses
      setCachedData(cacheKey, transformedCourses);
      
      lazyLoadingMonitor.endTimer('fetchUserCourses', false);
      console.log(`✅ Fetched ${transformedCourses.length} courses`);
      return transformedCourses;
    } catch (error) {
      lazyLoadingMonitor.endTimer('fetchUserCourses', false);
      console.error('❌ Error fetching courses:', error);
      return [];
    }
  }

  // Lazy load lessons only when course is expanded
  async fetchCourseLessons(courseId: string): Promise<any[]> {
    if (!this.userId) return [];
    
    // Check if already loaded
    if (this.loadedLessons.has(courseId)) {
      const cacheKey = getCacheKey(CACHE_KEYS.CURRENT_LESSONS, this.userId);
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log(`⚡ Course lessons already loaded for course ${courseId}`);
        return cached;
      }
    }

    const cacheKey = getCacheKey(CACHE_KEYS.CURRENT_LESSONS, this.userId);
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      lazyLoadingMonitor.startTimer('fetchCourseLessons');
      lazyLoadingMonitor.endTimer('fetchCourseLessons', true);
      this.loadedLessons.add(courseId);
      console.log(`⚡ INSTANT: Course lessons from cache for course ${courseId}`);
      return cached;
    }

    // Fetch lessons for specific course only
    lazyLoadingMonitor.startTimer('fetchCourseLessons');
    lazyLoadingMonitor.recordLazyLoad();
    console.log(`📖 Lazy loading lessons for course ${courseId}...`);
    
    try {
      const activities = await moodleService.getCourseActivities(courseId);
      const lessons = this.transformActivitiesToLessons(activities, { id: courseId });
      
      // Cache the lessons
      setCachedData(cacheKey, lessons);
      this.loadedLessons.add(courseId);
      
      lazyLoadingMonitor.endTimer('fetchCourseLessons', false);
      console.log(`✅ Lazy loaded ${lessons.length} lessons for course ${courseId}`);
      return lessons;
    } catch (error) {
      lazyLoadingMonitor.endTimer('fetchCourseLessons', false);
      console.error(`❌ Error lazy loading lessons for course ${courseId}:`, error);
      return [];
    }
  }

  // Lazy load activities only when lesson is expanded
  async fetchLessonActivities(lessonId: string, courseId: string): Promise<any[]> {
    if (!this.userId) return [];
    
    // Check if already loaded
    if (this.loadedActivities.has(lessonId)) {
      const cacheKey = getCacheKey(CACHE_KEYS.COURSE_ACTIVITIES, this.userId);
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log(`⚡ Lesson activities already loaded for lesson ${lessonId}`);
        return cached;
      }
    }

    const cacheKey = getCacheKey(CACHE_KEYS.COURSE_ACTIVITIES, this.userId);
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      lazyLoadingMonitor.startTimer('fetchLessonActivities');
      lazyLoadingMonitor.endTimer('fetchLessonActivities', true);
      this.loadedActivities.add(lessonId);
      console.log(`⚡ INSTANT: Lesson activities from cache for lesson ${lessonId}`);
      return cached;
    }

    // Fetch activities for specific lesson only
    lazyLoadingMonitor.startTimer('fetchLessonActivities');
    lazyLoadingMonitor.recordLazyLoad();
    console.log(`🎯 Lazy loading activities for lesson ${lessonId}...`);
    
    try {
      const activities = await moodleService.getCourseActivities(courseId);
      const lessonActivities = this.filterActivitiesForLesson(activities, lessonId);
      const transformedActivities = this.transformActivities(lessonActivities);
      
      // Cache the activities
      setCachedData(cacheKey, transformedActivities);
      this.loadedActivities.add(lessonId);
      
      lazyLoadingMonitor.endTimer('fetchLessonActivities', false);
      console.log(`✅ Lazy loaded ${transformedActivities.length} activities for lesson ${lessonId}`);
      return transformedActivities;
    } catch (error) {
      lazyLoadingMonitor.endTimer('fetchLessonActivities', false);
      console.error(`❌ Error lazy loading activities for lesson ${lessonId}:`, error);
      return [];
    }
  }

  // Check if data is already loaded (for UI state management)
  isCourseLessonsLoaded(courseId: string): boolean {
    return this.loadedLessons.has(courseId);
  }

  isLessonActivitiesLoaded(lessonId: string): boolean {
    return this.loadedActivities.has(lessonId);
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return lazyLoadingMonitor.getMetrics();
  }

  // Reset performance monitoring
  resetPerformanceMonitoring() {
    lazyLoadingMonitor.reset();
  }

  // Clear loaded state (useful for testing or user logout)
  clearLoadedState() {
    this.loadedCourses.clear();
    this.loadedLessons.clear();
    this.loadedActivities.clear();
  }

  // Background refresh for stale data
  async backgroundRefresh(): Promise<void> {
    if (!this.userId) return;

    try {
      console.log('🔄 Starting background refresh...');
      
      // Refresh courses in background
      await this.fetchUserCourses();
      
      console.log('✅ Background refresh completed');
    } catch (error) {
      console.warn('⚠️ Background refresh failed:', error);
    }
  }

  // Transform Moodle courses to our format
  private transformCourses(courses: any[]): any[] {
    return courses.map((course: any) => ({
      id: course.id,
      title: course.fullname,
      description: course.summary || 'No description available',
      instructor: 'Instructor TBD',
      progress: course.progress || 0,
      totalLessons: course.totalLessons || 0,
      completedLessons: course.completedLessons || 0,
      duration: course.duration || `${Math.floor(Math.random() * 8) + 4} weeks`,
      category: course.categoryname || 'General',
      image: course.courseimage || this.getCourseImageFallback(course.categoryname, course.fullname),
      isActive: course.visible !== 0,
      lastAccessed: course.lastAccess ? new Date(course.lastAccess * 1000).toLocaleDateString() : 'Recently',
      difficulty: this.getCourseDifficulty(course.categoryname, course.fullname),
      completionStatus: course.completionStatus || 'not_started',
      enrollmentCount: course.enrollmentCount || 0,
      averageGrade: course.averageGrade || 0,
      timeSpent: course.timeSpent || 0,
      certificates: course.certificates || 0,
      type: course.type || 'Self-paced',
      tags: course.tags || [],
      completionData: course.completionData,
      activitiesData: course.activitiesData
    }));
  }

  // Transform Moodle activities to lessons
  private transformActivitiesToLessons(activities: any[], course: any): any[] {
    return activities.map((activity: any) => ({
      id: activity.id.toString(),
      title: activity.name,
      courseId: course.id,
      courseTitle: course.fullname || 'Course',
      duration: this.getActivityDuration(activity.type),
      type: this.mapActivityType(activity.type),
      status: this.getActivityStatus(activity.completion),
      progress: this.getActivityProgress(activity.completion),
      isNew: this.isNewActivity(activity.dates),
      dueDate: this.getActivityDueDate(activity.dates),
      prerequisites: activity.availabilityinfo,
      image: this.getActivityImage(activity.type, course.courseimage)
    }));
  }

  // Filter activities for a specific lesson
  private filterActivitiesForLesson(activities: any[], lessonId: string): any[] {
    // This is a placeholder - you'll need to implement the actual logic
    // to filter activities that belong to a specific lesson
    // For now, return all activities
    return activities;
  }

  // Transform activities
  private transformActivities(activities: any[]): any[] {
    return activities.map((activity: any) => ({
      id: activity.id.toString(),
      title: activity.name,
      type: this.mapActivityType(activity.type),
      courseId: activity.courseid || '',
      courseTitle: activity.coursename || '',
      dueDate: this.getActivityDueDate(activity.dates) || 'No due date',
      status: this.getActivityStatus(activity.completion) === 'completed' ? 'submitted' :
        this.getActivityStatus(activity.completion) === 'in-progress' ? 'pending' : 'pending',
      points: Math.floor(Math.random() * 100) + 25,
      difficulty: Math.random() > 0.7 ? 'hard' : Math.random() > 0.4 ? 'medium' : 'easy',
      timeRemaining: 'Due soon'
    }));
  }

  // Helper methods
  private getCourseImageFallback(categoryname?: string, fullname?: string): string {
    const category = categoryname?.toLowerCase() || '';
    const name = fullname?.toLowerCase() || '';

    if (category.includes('programming') || category.includes('coding') || name.includes('programming')) {
      return '/card1.webp';
    } else if (category.includes('design') || category.includes('art') || name.includes('design')) {
      return '/card2.webp';
    } else if (category.includes('business') || category.includes('management') || name.includes('business')) {
      return '/card3.webp';
    } else if (category.includes('science') || category.includes('math') || name.includes('science')) {
      return '/Innovative-ICT-Curricula.webp';
    } else if (category.includes('language') || category.includes('english') || name.includes('language')) {
      return '/home-carousal-for-teachers.webp';
    } else {
      return '/card1.webp';
    }
  }

  private getCourseDifficulty(categoryname?: string, fullname?: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    const category = categoryname?.toLowerCase() || '';
    const name = fullname?.toLowerCase() || '';

    if (category.includes('advanced') || name.includes('advanced') || name.includes('expert')) {
      return 'Advanced';
    } else if (category.includes('intermediate') || name.includes('intermediate')) {
      return 'Intermediate';
    } else {
      return 'Beginner';
    }
  }

  private getActivityDuration(activityType: string): string {
    const durations: { [key: string]: string } = {
      'assign': '45 min',
      'quiz': '30 min',
      'resource': '20 min',
      'url': '15 min',
      'forum': '25 min',
      'workshop': '60 min',
      'scorm': '40 min',
      'lti': '35 min'
    };
    return durations[activityType] || '30 min';
  }

  private mapActivityType(moodleType: string): 'video' | 'quiz' | 'assignment' | 'practice' {
    const typeMap: { [key: string]: 'video' | 'quiz' | 'assignment' | 'practice' } = {
      'assign': 'assignment',
      'quiz': 'quiz',
      'resource': 'video',
      'url': 'video',
      'forum': 'practice',
      'workshop': 'assignment',
      'scorm': 'video',
      'lti': 'practice'
    };
    return typeMap[moodleType] || 'practice';
  }

  private getActivityStatus(completion: any): 'completed' | 'in-progress' | 'not-started' {
    if (!completion) return 'not-started';
    if (completion.state === 1) return 'completed';
    if (completion.state === 0) return 'in-progress';
    return 'not-started';
  }

  private getActivityProgress(completion: any): number {
    if (!completion) return 0;
    if (completion.state === 1) return 100;
    if (completion.state === 0) return 50;
    return 0;
  }

  private isNewActivity(dates: any[]): boolean {
    if (!dates || dates.length === 0) return false;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return dates.some((date: any) => {
      const activityDate = new Date(date.timestamp * 1000);
      return activityDate > oneWeekAgo;
    });
  }

  private getActivityDueDate(dates: any[]): string | undefined {
    if (!dates || dates.length === 0) return undefined;
    const dueDate = dates.find((date: any) => date.label === 'Due date') || dates[dates.length - 1];
    if (dueDate) {
      return new Date(dueDate.timestamp * 1000).toISOString().split('T')[0];
    }
    return undefined;
  }

  private getActivityImage(activityType: string, courseImage?: string): string {
    const typeImages: { [key: string]: string } = {
      'assign': '/card1.webp',
      'quiz': '/card2.webp',
      'resource': '/card3.webp',
      'url': '/Innovative-ICT-Curricula.webp',
      'forum': '/home-carousal-for-teachers.webp',
      'workshop': '/card1.webp',
      'scorm': '/card2.webp',
      'lti': '/card3.webp'
    };
    return typeImages[activityType] || courseImage || '/card1.webp';
  }
}

// Export singleton instance
const lazyLoadingLessonService = new LazyLoadingLessonService();
export default lazyLoadingLessonService;

