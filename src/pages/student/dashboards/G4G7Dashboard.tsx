import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building,
  Info,
  CheckCircle,
  ArrowRight,
  User,
  Flame,
  Star,
  Coins,
  LayoutDashboard,
  BookOpen,
  Clock,
  Activity,
  Play,
  Calendar,
  Target,
  TrendingUp,
  Award,
  FileText,
  Code,
  Zap,
  Eye,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Clock as ClockIcon,
  Users,
  BarChart3,
  Plus,
  X,
  ExternalLink,
  Download,
  BarChart3 as BarChart3Icon,
  Lock,
  RefreshCw,
  Database
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import moodleService from '../../../services/moodleApi';
import lazyLoadingLessonService from '../../../services/optimizedLessonService';
import { 
  getCacheKey, 
  getCachedData, 
  setCachedData, 
  getDashboardCacheKey,
  clearDashboardCache,
  CACHE_KEYS, 
  CACHE_DURATION
} from '../../../utils/cache';

// Helper functions for course data processing
const getCourseImageFallback = (categoryname?: string, fullname?: string): string => {
  // Use category-based fallback images
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
    // Default fallback based on course name
    const courseName = fullname?.toLowerCase() || '';
    if (courseName.includes('web') || courseName.includes('development')) {
      return '/card1.webp';
    } else if (courseName.includes('design') || courseName.includes('creative')) {
      return '/card2.webp';
    } else if (courseName.includes('business') || courseName.includes('management')) {
      return '/card3.webp';
    } else {
      return '/card1.webp';
    }
  }
};

const getCourseDifficulty = (categoryname?: string, fullname?: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
  const category = categoryname?.toLowerCase() || '';
  const name = fullname?.toLowerCase() || '';

  if (category.includes('advanced') || name.includes('advanced') || name.includes('expert')) {
    return 'Advanced';
  } else if (category.includes('intermediate') || name.includes('intermediate') || name.includes('intermediate')) {
    return 'Intermediate';
  } else {
    return 'Beginner';
  }
};

// Helper functions for Moodle activity processing
const getActivityDuration = (activityType: string): string => {
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
};

const mapActivityType = (moodleType: string): 'video' | 'quiz' | 'assignment' | 'practice' => {
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
};

const getActivityStatus = (completion: any): 'completed' | 'in-progress' | 'not-started' => {
  if (!completion) return 'not-started';

  if (completion.state === 1) return 'completed';
  if (completion.state === 0) return 'in-progress';
  return 'not-started';
};

const getActivityProgress = (completion: any): number => {
  if (!completion) return 0;

  if (completion.state === 1) return 100;
  if (completion.state === 0) return 50;
  return 0;
};

const isNewActivity = (dates: any[]): boolean => {
  if (!dates || dates.length === 0) return false;

  // Check if any date is within the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return dates.some((date: any) => {
    const activityDate = new Date(date.timestamp * 1000);
    return activityDate > oneWeekAgo;
  });
};

const getActivityDueDate = (dates: any[]): string | undefined => {
  if (!dates || dates.length === 0) return undefined;

  // Find the due date (usually the last date in the array)
  const dueDate = dates.find((date: any) => date.label === 'Due date') || dates[dates.length - 1];

  if (dueDate) {
    return new Date(dueDate.timestamp * 1000).toISOString().split('T')[0];
  }

  return undefined;
};

const getActivityImage = (activityType: string, courseImage?: string): string => {
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
};

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  category: string;
  image: string;
  isActive: boolean;
  lastAccessed: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  // Real data fields
  completionStatus: string;
  enrollmentCount: number;
  averageGrade: number;
  timeSpent: number;
  certificates: number;
  type: string;
  tags: string[];
  completionData?: any;
  activitiesData?: any;
}

interface Lesson {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'practice';
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
  dueDate?: string;
  isNew?: boolean;
  prerequisites?: string;
  image?: string;
}

interface Activity {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'project' | 'discussion';
  courseId: string;
  courseTitle: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRemaining: string;
}

interface Exam {
  id: string;
  title: string;
  schedule: string;
  daysLeft: number;
  isNew: boolean;
  courseTitle: string;
}

interface StudentStats {
  totalCourses: number;
  lessonsCompleted: number;
  totalPoints: number;
  weeklyGoal: string;
  streak: number;
  coins: number;
}

interface ScheduleEvent {
  date: string;
  day: string;
  hasActivity: boolean;
  isDisabled: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  type: 'learning' | 'practice';
  duration: string;
  progress: number;
  total: number;
}

interface G4G7DashboardProps {
  userCourses: any[];
  courseProgress: any[];
  studentActivities: any[];
  userAssignments: any[];
}

// Optimized API service functions using the new optimized lesson service
const dashboardService = {
  // Fetch student's courses using optimized service with advanced caching
  async fetchStudentCourses(studentId: string): Promise<Course[]> {
    try {
      console.log('🎓 Fetching courses using optimized service for student:', studentId);
      
      // Set user ID for the lazy loading service
      lazyLoadingLessonService.setUserId(studentId);
      
      // Use the lazy loading service to fetch only courses
      const courses = await lazyLoadingLessonService.fetchUserCourses();
      
      console.log('📚 Courses fetched with optimization:', courses.length);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses with optimized service:', error);
      return [];
    }
  },

  // Fetch student's lessons using optimized service with intelligent batching
  async fetchStudentLessons(studentId: string): Promise<Lesson[]> {
    try {
      console.log('📚 Fetching lessons using optimized service for student:', studentId);
      
      // Set user ID for the lazy loading service
      lazyLoadingLessonService.setUserId(studentId);
      
      // Use the lazy loading service to fetch lessons for specific course
      const lessons = await lazyLoadingLessonService.fetchCourseLessons(studentId);
      
      console.log(`✅ Fetched ${lessons.length} lessons with optimization`);
      return lessons;
    } catch (error) {
      console.error('Error fetching lessons with optimized service:', error);
      return [];
    }
  },

  // Fetch student's activities (optimized - mock data for performance)
  async fetchStudentActivities(studentId: string): Promise<Activity[]> {
    try {
      // Return mock activity data for better performance
      // This avoids additional API calls that slow down the dashboard
      return [
        {
          id: '1',
          title: 'HTML Structure Quiz',
          type: 'quiz',
          courseId: '1',
          courseTitle: 'Web Development Fundamentals',
          dueDate: '2024-01-25',
          status: 'pending',
          points: 50,
          difficulty: 'easy',
          timeRemaining: '2 days'
        },
        {
          id: '2',
          title: 'CSS Layout Assignment',
          type: 'assignment',
          courseId: '1',
          courseTitle: 'Web Development Fundamentals',
          dueDate: '2024-01-28',
          status: 'submitted',
          points: 100,
          difficulty: 'medium',
          timeRemaining: '5 days'
        },
        {
          id: '3',
          title: 'JavaScript Functions Project',
          type: 'project',
          courseId: '2',
          courseTitle: 'Advanced JavaScript Concepts',
          dueDate: '2024-01-30',
          status: 'pending',
          points: 150,
          difficulty: 'hard',
          timeRemaining: '7 days'
        }
      ];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },

  // Fetch student's exams (mock data for now)
  async fetchStudentExams(studentId: string): Promise<Exam[]> {
    try {
      // For now, return mock exam data
      return [
        {
          id: '1',
          title: 'Web Development Fundamentals - Final Exam',
          schedule: 'Tue, 26th Aug - 06:55pm - 08:35pm',
          daysLeft: 4,
          isNew: true,
          courseTitle: 'Web Development Fundamentals'
        }
      ];
    } catch (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
  },

  // Fetch student's schedule (mock data for now)
  async fetchStudentSchedule(studentId: string): Promise<ScheduleEvent[]> {
    try {
      // Return default schedule
      return [
        { date: '20', day: 'THU', hasActivity: true, isDisabled: false },
        { date: '21', day: 'FRI', hasActivity: true, isDisabled: false },
        { date: '22', day: 'SAT', hasActivity: true, isDisabled: false },
        { date: '23', day: 'SUN', hasActivity: true, isDisabled: false },
        { date: '24', day: 'MON', hasActivity: false, isDisabled: true },
        { date: '25', day: 'TUE', hasActivity: true, isDisabled: false },
        { date: '26', day: 'WED', hasActivity: true, isDisabled: false }
      ];
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
  },

  // Fetch student's stats (mock data for now)
  async fetchStudentStats(studentId: string): Promise<StudentStats> {
    try {
      // For now, return mock stats data
      // In the future, this could be calculated from actual course progress
      return {
        totalCourses: 3,
        lessonsCompleted: 12,
        totalPoints: 850,
        weeklyGoal: '3/5',
        streak: 5,
        coins: 1250
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalCourses: 0,
        lessonsCompleted: 0,
        totalPoints: 0,
        weeklyGoal: '0/5',
        streak: 0,
        coins: 0
      };
    }
  }
};

// Memoized component to prevent unnecessary re-renders
const G4G7Dashboard: React.FC<G4G7DashboardProps> = React.memo(({
  userCourses,
  courseProgress,
  studentActivities,
  userAssignments
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for fetched data with advanced caching
  const [courses, setCourses] = useState<Course[]>(() => {
    if (!currentUser?.id) return [];
    
    // Initialize with cached data using advanced cache utility
          const cached = getCachedData(getCacheKey(CACHE_KEYS.USER_COURSES, currentUser.id));
    return cached || [];
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    if (!currentUser?.id) return [];
    
    // Initialize with cached data using advanced cache utility
          const cached = getCachedData(getCacheKey(CACHE_KEYS.CURRENT_LESSONS, currentUser.id));
    return cached || [];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    if (!currentUser?.id) return [];
    
    // Initialize with cached data using advanced cache utility
          const cached = getCachedData(getCacheKey(CACHE_KEYS.COURSE_ACTIVITIES, currentUser.id));
    return cached || [];
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats>({
    totalCourses: 0,
    lessonsCompleted: 0,
    totalPoints: 0,
    weeklyGoal: '0/5',
    streak: 0,
    coins: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(90);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Performance monitoring and cache management
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [showCacheInfo, setShowCacheInfo] = useState(false);
  
  // Refs for performance tracking
  const loadStartTime = useRef<number>(0);
  const cacheHitCount = useRef<number>(0);
  const apiCallCount = useRef<number>(0);

  // Modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  // View mode state: 'card' | 'tree'
  const [viewMode, setViewMode] = useState<'card' | 'tree'>(() => {
    const cached = localStorage.getItem('g4g7_view_mode');
    return cached === 'tree' ? 'tree' : 'card';
  });
  useEffect(() => {
    try {
      localStorage.setItem('g4g7_view_mode', viewMode);
    } catch { }
  }, [viewMode]);

  // Tree state: track expanded nodes
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  // Track activities for each lesson
  const [lessonActivities, setLessonActivities] = useState<Record<string, Activity[]>>({});
  const [loadingActivities, setLoadingActivities] = useState<Record<string, boolean>>({});
  const [loadingCourseLessons, setLoadingCourseLessons] = useState<Record<string, boolean>>({});
  const [loadingAllLessons, setLoadingAllLessons] = useState(false);
  const [loadingFromCache, setLoadingFromCache] = useState(true);
  const [cacheHit, setCacheHit] = useState(false);

  // Memoized top navigation items to prevent re-creation
  const topNavItems = useMemo(() => [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
    { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
    { name: 'Current Lessons', icon: Clock, path: '/dashboard/student/current-lessons' },
    { name: 'Activities', icon: Activity, path: '/dashboard/student/activities' }
  ], []);

  // Memoized helper functions
  const isActivePath = useCallback((path: string) => {
    if (path === '/dashboard/student') {
      return location.pathname === '/dashboard/student' || location.pathname === '/dashboard/student/';
    }
    return location.pathname === path;
  }, [location.pathname]);

  const handleTopNavClick = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Handle course click to show lessons
  const handleCourseClick = useCallback((course: Course) => {
    console.log('🎓 Course clicked:', course.title);

    // Navigate to the course lessons page
    navigate(`/dashboard/student/course-lessons/${course.id}`, {
      state: {
        selectedCourse: course
      }
    });
  }, [navigate]);

  // Expand/collapse handlers for Tree View
  const toggleCourseExpanded = useCallback(async (courseId: string) => {
    const isCurrentlyExpanded = !!expandedCourses[courseId];
    
    if (!isCurrentlyExpanded) {
      // Course is being expanded - fetch lessons if not already loaded
      if (!lazyLoadingLessonService.isCourseLessonsLoaded(courseId)) {
        setLoadingCourseLessons(prev => ({ ...prev, [courseId]: true }));
        
        try {
          console.log(`📖 Fetching lessons for course ${courseId}...`);
          const courseLessons = await lazyLoadingLessonService.fetchCourseLessons(courseId);
          
          console.log(`📚 Course lessons received:`, courseLessons);
          
          // Update lessons state with the new course lessons
          setLessons(prev => {
            // Remove existing lessons for this course
            const otherLessons = prev.filter(l => l.courseId !== courseId);
            // Add new lessons for this course
            const updatedLessons = [...otherLessons, ...courseLessons];
            console.log(`🔄 Updated lessons state:`, updatedLessons);
            return updatedLessons;
          });
          
          console.log(`✅ Loaded ${courseLessons.length} lessons for course ${courseId}`);
        } catch (error) {
          console.error(`❌ Error fetching lessons for course ${courseId}:`, error);
        } finally {
          setLoadingCourseLessons(prev => ({ ...prev, [courseId]: false }));
        }
      } else {
        console.log(`⚡ Lessons already loaded for course ${courseId}`);
      }
    }
    
    // Toggle expansion state
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  }, [expandedCourses]);

  const toggleLessonExpanded = useCallback(async (lessonId: string) => {
    const isCurrentlyOpen = !!expandedLessons[lessonId];

    if (!isCurrentlyOpen) {
      // Opening lesson - fetch activities if not already loaded
      if (!lessonActivities[lessonId]) {
        setLoadingActivities(prev => ({ ...prev, [lessonId]: true }));
        try {
          // Find the lesson to get courseId
          const lesson = lessons.find(l => l.id === lessonId);
          if (lesson) {
            // Use lazy loading service to fetch activities
            const lessonActivitiesData = await lazyLoadingLessonService.fetchLessonActivities(lessonId, lesson.courseId);

            // Transform activities to match the expected format
            const filteredActivities: Activity[] = lessonActivitiesData.map((activity: any) => ({
              id: activity.id.toString(),
              title: activity.title,
              type: activity.type || 'practice',
              courseId: lesson.courseId,
              courseTitle: lesson.courseTitle || '',
              dueDate: activity.dueDate || 'No due date',
              status: activity.status || 'pending',
              points: activity.points || Math.floor(Math.random() * 100) + 25,
              difficulty: activity.difficulty || (Math.random() > 0.7 ? 'hard' : Math.random() > 0.4 ? 'medium' : 'easy'),
              timeRemaining: activity.timeRemaining || 'Due soon'
            }));

            setLessonActivities(prev => ({ ...prev, [lessonId]: filteredActivities }));
          }
        } catch (error) {
          console.error('Error fetching lesson activities:', error);
          setLessonActivities(prev => ({ ...prev, [lessonId]: [] }));
        } finally {
          setLoadingActivities(prev => ({ ...prev, [lessonId]: false }));
        }
      }
    }

    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  }, [expandedLessons, lessonActivities, lessons]);

  // Handle lesson click to navigate to activities page
  const handleLessonClick = useCallback((lesson: Lesson) => {
    console.log('📚 Lesson clicked:', lesson.title);

    // Navigate to the lesson activities journey page
    navigate(`/dashboard/student/lesson-activities-journey/${lesson.courseId}/${lesson.id}`);
  }, [navigate]);

  // Handle activity click to open activity
  const handleActivityClick = useCallback((activity: Activity) => {
    console.log('🎯 Activity clicked:', activity.title);

    // Store selected activity in localStorage
    localStorage.setItem('selectedActivity', JSON.stringify(activity));

    // Open modal with activity details
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  }, []);

  // Close modals
  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setSelectedLesson(null);
  };

  const closeActivityModal = () => {
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  // Cache data in localStorage
  const cacheData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, []);

  // Fetch all dashboard data only once on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id || hasInitialized) {
        return;
      }

      setIsLoading(true);
      setLoadingProgress(0);
      setError(null);

      try {
        console.log('🎓 Fetching dashboard data for student:', currentUser.id);

        // Set user ID for lazy loading service
        lazyLoadingLessonService.setUserId(currentUser.id.toString());

        // 2. Check advanced cache for immediate display
        const coursesCacheKey = getCacheKey(CACHE_KEYS.USER_COURSES, currentUser.id);
        const lessonsCacheKey = getCacheKey(CACHE_KEYS.CURRENT_LESSONS, currentUser.id);
        const activitiesCacheKey = getCacheKey(CACHE_KEYS.COURSE_ACTIVITIES, currentUser.id);

        const cachedCourses = getCachedData(coursesCacheKey);
        const cachedLessons = getCachedData(lessonsCacheKey);
        const cachedActivities = getCachedData(activitiesCacheKey);

        // If we have valid cached data, show it immediately
        if (cachedCourses && cachedLessons && cachedActivities) {
          console.log('⚡ INSTANT: Loading dashboard from advanced cache...');
          cacheHitCount.current += 3;
          setLoadingProgress(100);
          setCourses(cachedCourses);
          setLessons(cachedLessons);
          setActivities(cachedActivities);
          setHasInitialized(true);
          setIsLoading(false);

          // Update performance metrics
          const loadTime = performance.now() - loadStartTime.current;
          setPerformanceMetrics({
            loadTime: Math.round(loadTime),
            cacheHitRate: 100,
            apiCallCount: 0,
            cacheHits: cacheHitCount.current
          });

          // Fetch fresh data in background for next time
          fetchFreshDataInBackground();
          return;
        }

        // 3. Progressive loading: Show what we have, fetch what we need
        console.log('📊 Progressive loading: Fetching essential data first...');
        setLoadingProgress(20);

        // Fetch courses first (most important)
        const coursesData = await dashboardService.fetchStudentCourses(currentUser.id.toString());
        apiCallCount.current++;
        setLoadingProgress(40);
        setCourses(coursesData);

        // Fetch all lessons for all courses to populate the Current Lessons section
        setLoadingProgress(60);
        await fetchAllLessons();
        setLoadingProgress(80);

        // Fetch activities (mock data for performance)
        const activitiesData = await dashboardService.fetchStudentActivities(currentUser.id.toString());
        apiCallCount.current += 1;
        setActivities(activitiesData);

        // Fetch remaining data in background (non-blocking)
        Promise.allSettled([
          dashboardService.fetchStudentExams(currentUser.id.toString()),
          dashboardService.fetchStudentSchedule(currentUser.id.toString()),
          dashboardService.fetchStudentStats(currentUser.id.toString())
        ]).then((results) => {
          const [examsResult, scheduleResult, statsResult] = results;
          
          if (examsResult.status === 'fulfilled') setExams(examsResult.value);
          if (scheduleResult.status === 'fulfilled') setScheduleEvents(scheduleResult.value);
          if (statsResult.status === 'fulfilled') setStudentStats(statsResult.value);
          
          apiCallCount.current += results.filter(r => r.status === 'fulfilled').length;
        });

        setLoadingProgress(100);
        setHasInitialized(true);

        // Update performance metrics
        const loadTime = performance.now() - loadStartTime.current;
        setPerformanceMetrics({
          loadTime: Math.round(loadTime),
          cacheHitRate: Math.round((cacheHitCount.current / (cacheHitCount.current + apiCallCount.current)) * 100),
          apiCallCount: apiCallCount.current,
          cacheHits: cacheHitCount.current
        });



      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to fetch fresh data in background
    const fetchFreshDataInBackground = async () => {
      try {
        console.log('🔄 Background refresh started...');
        
        // Use lazy loading service for background refresh
        await lazyLoadingLessonService.backgroundRefresh();
        
        // Also refresh all lessons
        await fetchAllLessons();
        
        console.log('✅ Background refresh completed');
      } catch (error) {
        console.warn('Background refresh failed:', error);
      }
    };



    fetchDashboardData();
  }, [currentUser?.id, hasInitialized]);

  // Memoized helper functions for status colors
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'in-progress': return 'bg-blue-100 text-blue-600';
      case 'not-started': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }, []);

  const getActivityStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-600';
      case 'graded': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }, []);

  const getDifficultyBadgeColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  // Load dashboard data from cache
  const loadDashboardFromCache = useCallback(async () => {
    if (!currentUser?.id) return false;
    
    try {
      console.log('🔍 Loading dashboard data from cache...');
      
      const userId = currentUser.id.toString();
      
      // Try to load all dashboard data from cache
      const cachedCourses = getCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_COURSES, userId), CACHE_DURATION.DASHBOARD);
      const cachedLessons = getCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_LESSONS, userId), CACHE_DURATION.DASHBOARD);
      const cachedActivities = getCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_ACTIVITIES, userId), CACHE_DURATION.DASHBOARD);
      const cachedExams = getCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_EXAMS, userId), CACHE_DURATION.DASHBOARD);
      const cachedSchedule = getCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_SCHEDULE, userId), CACHE_DURATION.DASHBOARD);
      const cachedStats = getCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_STATS, userId), CACHE_DURATION.DASHBOARD);
      
      // Check if we have all the data
      if (cachedCourses && cachedLessons && cachedActivities && cachedExams && cachedSchedule && cachedStats) {
        console.log('✅ All dashboard data loaded from cache');
        
        // Set all cached data
        setCourses(cachedCourses);
        setLessons(cachedLessons);
        setActivities(cachedActivities);
        setExams(cachedExams);
        setScheduleEvents(cachedSchedule);
        setStudentStats(cachedStats);
        
        setCacheHit(true);
        setLoadingFromCache(false);
        return true;
      } else {
        console.log('⚠️ Incomplete cache data, will fetch fresh data');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error loading from cache:', error);
      return false;
    }
  }, [currentUser?.id]);

  // Fetch all lessons for all courses to populate the Current Lessons section
  const fetchAllLessons = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setLoadingAllLessons(true);
    
    try {
      console.log('📚 Fetching all lessons for Current Lessons section...');
      
      // Get all courses first
      const allCourses = await lazyLoadingLessonService.fetchUserCourses();
      
      // Fetch lessons for all courses in parallel
      const lessonPromises = allCourses.map(async (course) => {
        try {
          const courseLessons = await lazyLoadingLessonService.fetchCourseLessons(course.id);
          return courseLessons;
        } catch (error) {
          console.warn(`Failed to fetch lessons for course ${course.id}:`, error);
          return [];
        }
      });
      
      const allLessonsArrays = await Promise.allSettled(lessonPromises);
      const allLessons = allLessonsArrays
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<any[]>).value);
      
      console.log(`✅ Fetched ${allLessons.length} total lessons from all courses`);
      
      // Update lessons state with all lessons
      setLessons(allLessons);
      
    } catch (error) {
      console.error('❌ Error fetching all lessons:', error);
    } finally {
      setLoadingAllLessons(false);
    }
  }, [currentUser?.id]);

  // Cache dashboard data
  const cacheDashboardData = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      console.log('💾 Caching dashboard data...');
      
      const userId = currentUser.id.toString();
      
      // Cache all dashboard data
      setCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_COURSES, userId), courses);
      setCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_LESSONS, userId), lessons);
      setCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_ACTIVITIES, userId), activities);
      setCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_EXAMS, userId), exams);
      setCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_SCHEDULE, userId), scheduleEvents);
      setCachedData(getDashboardCacheKey(CACHE_KEYS.DASHBOARD_STATS, userId), studentStats);
      
      console.log('✅ Dashboard data cached successfully');
      
    } catch (error) {
      console.error('❌ Error caching dashboard data:', error);
    }
  }, [currentUser?.id, courses, lessons, activities, exams, scheduleEvents, studentStats]);

  // Memoized computed values with real data
  const activeCoursesCount = useMemo(() => courses.filter(c => c.isActive).length, [courses]);
  const completedLessonsCount = useMemo(() => {
    // Use real data from courses if available
    const totalCompletedFromCourses = courses.reduce((sum, course) => sum + (course.completedLessons || 0), 0);
    if (totalCompletedFromCourses > 0) {
      return totalCompletedFromCourses;
    }
    // Fallback to lessons data
    return lessons.filter(l => l.status === 'completed').length;
  }, [courses, lessons]);
  const pendingActivitiesCount = useMemo(() => activities.filter(a => a.status === 'pending').length, [activities]);

  // Additional real data stats
  const totalProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + (course.progress || 0), 0);
    return Math.round(totalProgress / courses.length);
  }, [courses]);

  const totalTimeSpent = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.timeSpent || 0), 0);
  }, [courses]);

  const totalCertificates = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.certificates || 0), 0);
  }, [courses]);
  return (
    <div className='bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6'>
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div className="flex space-x-2 p-2">
          {topNavItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <button
                key={item.name}
                onClick={() => handleTopNavClick(item.path)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className=" mx-auto space-y-8">
        {/* Welcome Section with Performance Indicator */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.fullname || "Student"}! 👋</h1>
              <p className="text-blue-100">Continue your learning journey today</p>
              
              {/* Performance Indicator */}
              {isLoading && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2 text-blue-100 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading with optimizations... {loadingProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200/30 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Cache Status Indicator */}
              {!isLoading && performanceMetrics && (
                <div className="mt-3 flex items-center space-x-4 text-blue-100 text-sm">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{performanceMetrics.loadTime}ms load time</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Database className="w-4 h-4" />
                    <span>{performanceMetrics.cacheHitRate}% cache hit rate</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{activeCoursesCount}</div>
                <div className="text-sm text-blue-100">Active Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedLessonsCount}</div>
                <div className="text-sm text-blue-100">Lessons Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle and Performance Monitoring */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">View Mode</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCacheInfo(!showCacheInfo)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cache & Performance Info"
              >
                <Database className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  // Cache cleanup functionality removed for lazy loading
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clean Cache"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'card' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:text-gray-900'}`}
              onClick={() => setViewMode('card')}
            >
              Card View
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'tree' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:text-gray-900'}`}
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </button>
          </div>

          {/* Performance & Cache Info Panel */}
          {showCacheInfo && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                {performanceMetrics && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Load Time:</span>
                      <span className="ml-2 text-green-600">{performanceMetrics.loadTime}ms</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cache Hit Rate:</span>
                      <span className="ml-2 text-blue-600">{performanceMetrics.cacheHitRate}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">API Calls:</span>
                      <span className="ml-2 text-orange-600">{performanceMetrics.apiCallCount}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cache Hits:</span>
                      <span className="ml-2 text-purple-600">{performanceMetrics.cacheHits}</span>
                    </div>
                  </>
                )}
                {cacheStats && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Cache Entries:</span>
                      <span className="ml-2 text-gray-600">{cacheStats.totalEntries}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Storage Used:</span>
                      <span className="ml-2 text-gray-600">{cacheStats.storageUsage}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{studentStats.totalCourses}</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedLessonsCount}</div>
                <div className="text-sm text-gray-600">Lessons Done</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalProgress}%</div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{studentStats.weeklyGoal}</div>
                <div className="text-sm text-gray-600">Weekly Goal</div>
              </div>
            </div>
          </div>
        </div>




        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* My Courses Section - conditional layouts */}
            {viewMode === 'card' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {courses.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Enrolled</h3>
                    <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                        onClick={() => handleCourseClick(course)}
                      >
                        <div className="relative">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop';
                            }}
                          />
                          <div className="absolute top-3 right-3">
                            <span className={`${getDifficultyBadgeColor(course.difficulty)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                              {course.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <BookOpen className="w-3 h-3" />
                              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                          {course.completionStatus && (
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.completionStatus === 'completed' ? 'bg-green-100 text-green-600' :
                                  course.completionStatus === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                    course.completionStatus === 'almost_complete' ? 'bg-yellow-100 text-yellow-600' :
                                      'bg-gray-100 text-gray-600'
                                }`}>
                                {course.completionStatus.replace('_', ' ')}
                              </span>
                              {course.averageGrade > 0 && (
                                <span className="text-xs text-gray-500">
                                  Grade: {course.averageGrade}%
                                </span>
                              )}
                            </div>
                          )}
                          {course.enrollmentCount > 0 && (
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span>{course.enrollmentCount} students enrolled</span>
                              {course.certificates > 0 && (
                                <span>{course.certificates} certificates</span>
                              )}
                            </div>
                          )}
                          <button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCourseClick(course);
                            }}
                          >
                            <Play className="w-4 h-4" />
                            <span>Continue Learning</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Tree View
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">My Courses (Tree)</h2>
                </div>
                {courses.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Enrolled</h3>
                    <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <ul className="divide-y divide-gray-100">
                      {courses.map(course => {
                        const isExpanded = !!expandedCourses[course.id];
                        const courseLessons = lessons.filter(l => l.courseId === course.id);
                        console.log(`🌳 Course ${course.id} (${course.title}): expanded=${isExpanded}, lessons=${courseLessons.length}`, courseLessons);
                        return (
                          <li key={course.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <button
                                  className={`w-7 h-7 rounded-md flex items-center justify-center bg-gray-100 ${isExpanded ? 'text-blue-600' : 'text-gray-600'}`}
                                  onClick={() => toggleCourseExpanded(course.id)}
                                  aria-label={isExpanded ? 'Collapse course' : 'Expand course'}
                                  disabled={loadingCourseLessons[course.id]}
                                >
                                  {loadingCourseLessons[course.id] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-600"></div>
                                  ) : (
                                    <ChevronRight className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  )}
                                </button>
                                {/* <img src={course.image} alt={course.title} className="w-2 h-2 rounded-md object-cover" /> */}
                                <button className="text-left" onClick={() => handleCourseClick(course)}>
                                  <div className="font-semibold text-gray-900">{course.title}</div>
                                  <div className="text-xs text-gray-500">
                                    {course.completedLessons}/{course.totalLessons} lessons • {course.progress}%
                                    {loadingCourseLessons[course.id] && (
                                      <span className="ml-2 text-blue-600">(Loading...)</span>
                                    )}
                                  </div>
                                </button>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="mt-3 ml-10">
                                {loadingCourseLessons[course.id] ? (
                                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                                    <span>Loading lessons...</span>
                                  </div>
                                ) : courseLessons.length === 0 ? (
                                  <div className="text-sm text-gray-500">No lessons found for this course.</div>
                                ) : (
                                  <ul className="space-y-2">
                                    {courseLessons.map(lesson => {
                                      const isLessonOpen = !!expandedLessons[lesson.id];
                                      const currentLessonActivities = lessonActivities[lesson.id] || [];
                                      const isLoading = loadingActivities[lesson.id];
                                      return (
                                        <li key={lesson.id}>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                              <button
                                                className={`w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 ${isLessonOpen ? 'text-blue-600' : 'text-gray-600'}`}
                                                onClick={() => toggleLessonExpanded(lesson.id)}
                                                aria-label={isLessonOpen ? 'Collapse lesson' : 'Expand lesson'}
                                              >
                                                <ChevronRight className={`w-4 h-4 transform transition-transform ${isLessonOpen ? 'rotate-90' : ''}`} />
                                              </button>
                                              <button className="text-left" onClick={() => handleLessonClick(lesson)}>
                                                <div className="font-medium text-gray-900">{lesson.title}</div>
                                                <div className="text-xs text-gray-500">{lesson.progress}% • {lesson.duration}</div>
                                              </button>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(lesson.status)}`}>{lesson.status.replace('-', ' ')}</span>
                                          </div>
                                          {isLessonOpen && (
                                            <ul className="mt-2 ml-8 space-y-1">
                                              {isLoading ? (
                                                <li className="text-xs text-gray-500 flex items-center space-x-2">
                                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                                                  <span>Loading activities...</span>
                                                </li>
                                              ) : currentLessonActivities.length === 0 ? (
                                                <li className="text-xs text-gray-500">No activities found for this lesson</li>
                                              ) : (
                                                currentLessonActivities.map(activity => (
                                                  <li key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                    <button className="text-left text-sm text-gray-700 hover:text-gray-900 flex-1" onClick={() => handleActivityClick(activity)}>
                                                      <div className="font-medium">{activity.title}</div>
                                                      <div className="text-xs text-gray-500">{activity.type} • {activity.points} points</div>
                                                    </button>
                                                    <div className="flex items-center space-x-2">
                                                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${getActivityStatusColor(activity.status)}`}>
                                                        {activity.status}
                                                      </span>
                                                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${getDifficultyColor(activity.difficulty)}`}>
                                                        {activity.difficulty}
                                                      </span>
                                                    </div>
                                                  </li>
                                                ))
                                              )}
                                            </ul>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Current Lessons Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900">Current Lessons</h2>
                  {!loadingAllLessons && lessons.length > 0 && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={fetchAllLessons}
                    disabled={loadingAllLessons}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAllLessons ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {loadingAllLessons ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Lessons...</h3>
                  <p className="text-gray-600">Fetching all lessons from your courses...</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Available</h3>
                  <p className="text-gray-600 mb-4">Start a course to see your lessons here.</p>
                  <button 
                    onClick={fetchAllLessons}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Load Lessons
                  </button>
                </div>
              ) : (
                <>
                  {/* Lessons Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
                        <div className="text-sm text-gray-600">Total Lessons</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {lessons.filter(l => l.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {lessons.filter(l => l.status === 'in-progress').length}
                        </div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-600">
                          {lessons.filter(l => l.status === 'not-started').length}
                        </div>
                        <div className="text-sm text-gray-600">Not Started</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lessons Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="relative">
                        <img
                          src={lesson.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'}
                          alt={lesson.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                            {lesson.isNew ? (
                              <Eye className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{lesson.courseTitle}</p>
                        <div className="flex items-center space-x-2 mb-3">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                        </div>
                        {lesson.prerequisites && (
                          <p className="text-xs text-gray-500 mb-3">Prerequisites: {lesson.prerequisites}</p>
                        )}
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${lesson.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLessonClick(lesson);
                          }}
                        >
                          {lesson.status === 'completed' ? 'Review Lesson' : lesson.status === 'in-progress' ? 'Continue Lesson' : 'Start Lesson'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}
            </div>

            {/* Upcoming Activities Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Activities</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {activities.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Due</h3>
                  <p className="text-gray-600">You're all caught up! No pending activities.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="space-y-4">
                    {activities.slice(0, 3).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'quiz' ? 'bg-purple-100' :
                              activity.type === 'assignment' ? 'bg-orange-100' :
                                activity.type === 'project' ? 'bg-green-100' :
                                  'bg-blue-100'
                            }`}>
                            {activity.type === 'quiz' ? <FileText className="w-5 h-5 text-purple-600" /> :
                              activity.type === 'assignment' ? <Code className="w-5 h-5 text-orange-600" /> :
                                activity.type === 'project' ? <Target className="w-5 h-5 text-green-600" /> :
                                  <Users className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">{activity.courseTitle}</p>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                                {activity.difficulty}
                              </span>
                              <span className="text-sm text-gray-500">{activity.points} points</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">Due in {activity.timeRemaining}</div>
                          <button
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivityClick(activity);
                            }}
                          >
                            {activity.status === 'submitted' ? 'View' : 'Start'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Exams Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Exams</h2>
              {exams.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Exams</h3>
                  <p className="text-gray-600">You don't have any exams scheduled at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam, index) => (
                    <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {exam.isNew && (
                              <button className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                                New Attempt
                              </button>
                            )}
                            <Building className="w-5 h-5 text-purple-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                          <p className="text-gray-600 text-sm mb-1">{exam.courseTitle}</p>
                          <p className="text-gray-600 text-sm mb-3">{exam.schedule}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                            Attempt →
                          </button>
                          <span className="text-green-600 text-sm font-medium">{exam.daysLeft} Day to go!</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentUser?.fullname || "Student"}</h3>
                  <p className="text-blue-600 text-sm">Daily Rank →</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today's Progress</span>
                  <span className="text-sm font-medium text-gray-900">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600">Courses Enrolled</span>
                  </div>
                  <span className="font-semibold text-gray-900">{courses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600">Lessons Completed</span>
                  </div>
                  <span className="font-semibold text-gray-900">{completedLessonsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-600">Pending Activities</span>
                  </div>
                  <span className="font-semibold text-gray-900">{pendingActivitiesCount}</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-green-600 font-medium">Best: {studentStats.streak}</span>
                <span className="text-orange-600 font-medium">Goal: 7</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Flame className="w-6 h-6 text-orange-500 mb-1" />
                  <span className="text-xs text-gray-600">{studentStats.streak} Streaks</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">{studentStats.totalPoints} Points</span>
                </div>
                <div className="flex flex-col items-center">
                  <Coins className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">{studentStats.coins} Coins</span>
                </div>
              </div>
            </div>

            {/* Cache Management Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="font-semibold text-gray-900">Cache Management</h3>
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              
              {cacheStats ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cache Entries</span>
                    <span className="font-medium text-gray-900">{cacheStats.totalEntries}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="font-medium text-gray-900">{cacheStats.storageUsage}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Size</span>
                    <span className="font-medium text-gray-900">{cacheStats.totalSizeKB}KB</span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        // Cache cleanup functionality removed for lazy loading
                      }}
                      className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Clean Cache</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-4">
                  <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Cache stats loading...</p>
                </div>
              )}
            </div>

            {/* Your Schedule Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="font-semibold text-gray-900">Your Schedule</h3>
                <Info className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-gray-600 text-sm mb-4">Today's Schedule</p>

              {/* Calendar Strip */}
              <div className="relative mb-4">
                <div className="flex space-x-2 px-4 overflow-x-auto">
                  {scheduleEvents.slice(0, 7).map((event, index) => (
                    <div key={index} className="flex flex-col items-center min-w-[40px]">
                      <span className="text-xs text-gray-500 mb-1">{event.day}</span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${event.isDisabled
                          ? 'bg-gray-100 text-gray-400'
                          : event.hasActivity
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {event.date}
                      </div>
                      {event.hasActivity && !event.isDisabled && (
                        <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Details Modal */}
      {isLessonModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <img
                src={selectedLesson.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'}
                alt={selectedLesson.title}
                className="w-full h-48 object-cover rounded-t-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-3xl"></div>
              <button
                onClick={closeLessonModal}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className={`${getStatusColor(selectedLesson.status)} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                  {selectedLesson.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h2>
                <p className="text-gray-600 text-lg">{selectedLesson.courseTitle}</p>
              </div>

              {/* Lesson Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">{selectedLesson.duration}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="font-semibold text-gray-900">{selectedLesson.progress}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Learning Progress</span>
                  <span className="text-sm text-gray-500">{selectedLesson.progress}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${selectedLesson.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Prerequisites */}
              {selectedLesson.prerequisites && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-gray-700">{selectedLesson.prerequisites}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {selectedLesson.status === 'completed' ? (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <CheckCircle className="w-5 h-5" />
                    <span>Review Lesson</span>
                  </button>
                ) : selectedLesson.status === 'in-progress' ? (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5" />
                    <span>Continue Lesson</span>
                  </button>
                ) : (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5" />
                    <span>Start Lesson</span>
                  </button>
                )}
                <button
                  onClick={closeLessonModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {isActivityModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-orange-500 to-red-500 rounded-t-3xl flex items-center justify-center">
                <Activity className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-3xl"></div>
              <button
                onClick={closeActivityModal}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className={`${getActivityStatusColor(selectedActivity.status)} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                  {selectedActivity.status}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h2>
                <p className="text-gray-600 text-lg">{selectedActivity.courseTitle}</p>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time Remaining</p>
                      <p className="font-semibold text-gray-900">{selectedActivity.timeRemaining}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="font-semibold text-gray-900">{selectedActivity.points}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Type</span>
                  <span className="text-sm text-gray-900 capitalize">{selectedActivity.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Difficulty</span>
                  <span className={`${getDifficultyColor(selectedActivity.difficulty)} px-2 py-1 rounded-full text-xs font-medium`}>
                    {selectedActivity.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Due Date</span>
                  <span className="text-sm text-gray-900">{selectedActivity.dueDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {selectedActivity.status === 'submitted' ? (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <CheckCircle className="w-5 h-5" />
                    <span>View Submission</span>
                  </button>
                ) : selectedActivity.status === 'graded' ? (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <BarChart3Icon className="w-5 h-5" />
                    <span>View Grade</span>
                  </button>
                ) : (
                  <button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5" />
                    <span>Start Activity</span>
                  </button>
                )}
                <button
                  onClick={closeActivityModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Add display name for debugging
G4G7Dashboard.displayName = 'G4G7Dashboard';

export default G4G7Dashboard;
