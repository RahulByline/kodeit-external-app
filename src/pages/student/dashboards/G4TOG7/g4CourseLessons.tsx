import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  BookOpen,
  Clock,
  User,
  Play,
  CheckCircle,
  AlertCircle,
  FileText,
  Video,
  Code,
  MessageSquare,
  Users,
  ExternalLink,
  Calendar,
  Award,
  Target,
  TrendingUp,
  Star,
  Zap,
  Lightbulb,
  Brain,
  Rocket,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Edit,
  Share2,
  Bookmark,
  Download,
  Eye,
  BarChart3,
  Activity,
  LayoutDashboard,
  Circle,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../../../components/DashboardLayout';
import { enhancedMoodleService } from '../../../../services/enhancedMoodleApi';
import { useAuth } from '../../../../context/AuthContext';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Progress } from '../../../../components/ui/progress';
import { Skeleton } from '../../../../components/ui/skeleton';
// Cache utilities - simplified implementation
const getCacheKey = (key: string) => `g4_course_lessons_${key}`;
const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 15 * 60 * 1000) { // 15 minutes
        return data;
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }
  return null;
};
const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

// Performance optimization constants
const CACHE_DURATION = {
  COURSE_DATA: 15 * 60 * 1000, // 15 minutes
  LESSONS_DATA: 10 * 60 * 1000, // 10 minutes
  COURSE_DETAILS: 20 * 60 * 1000 // 20 minutes
};

// Request queue for batching API calls
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private batchSize = 3;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await Promise.allSettled(batch.map(request => request()));
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

interface Course {
  id: string;
  fullname: string;
  shortname: string;
  progress: number;
  grade?: number;
  status: 'in_progress' | 'completed' | 'not_started';
  categoryname?: string;
  description?: string;
  summary?: string;
  courseimage?: string;
  overviewfiles?: Array<{ fileurl: string; filename?: string }>;
  totalModules?: number;
  completedModules?: number;
  startdate?: number;
  enddate?: number;
}

interface Lesson {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'practice' | 'lesson';
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
  dueDate?: string;
  prerequisites?: string;
  image?: string;
  totalModules?: number;
  completedModules?: number;
  description?: string;
}

const CourseLessons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams<{ courseId: string }>();
  const { currentUser } = useAuth();
  
  // Advanced state management with performance optimizations
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for instant render
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Performance optimization states
  const [loadingStates, setLoadingStates] = useState({
    course: false,
    lessons: false
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    cacheHitRate: 0,
    apiCallCount: 0
  });
  
  // Refs for performance tracking
  const loadStartTime = useRef<number>(0);
  const apiCallCount = useRef<number>(0);
  const cacheHitCount = useRef<number>(0);

  // Top navigation items
  const topNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
    { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
    { name: 'Current Lessons', icon: Clock, path: '/dashboard/student/current-lessons' },
    { name: 'Activities', icon: Activity, path: '/dashboard/student/activities' }
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard/student') {
      return location.pathname === '/dashboard/student' || location.pathname === '/dashboard/student/';
    }
    return location.pathname === path;
  };

  const handleTopNavClick = (path: string) => {
    navigate(path);
  };

  // Enhanced course data retrieval with multiple cache layers
  const getCourseData = useCallback(() => {
    // 1. Try location state first (fastest)
    if (location.state?.selectedCourse) {
      console.log('⚡ Using course data from location state');
      return location.state.selectedCourse;
    }
    
    // 2. Try sessionStorage (fast for current session)
    const sessionCourse = sessionStorage.getItem(`course_${courseId}`);
    if (sessionCourse) {
      try {
        const parsed = JSON.parse(sessionCourse);
        console.log('⚡ Using course data from sessionStorage');
        return parsed;
      } catch (error) {
        console.warn('Invalid course data in sessionStorage');
        sessionStorage.removeItem(`course_${courseId}`);
      }
    }
    
    // 3. Try localStorage (persistent)
    const storedCourse = localStorage.getItem('selectedCourse');
    if (storedCourse) {
      try {
        const parsed = JSON.parse(storedCourse);
        console.log('⚡ Using course data from localStorage');
        return parsed;
      } catch (error) {
        console.warn('Invalid course data in localStorage');
        localStorage.removeItem('selectedCourse');
      }
    }
    
    return null;
  }, [location.state, courseId]);

  // Ultra-fast loading with advanced caching strategies
  const loadCourseDataWithCache = useCallback(async () => {
    if (!courseId || !currentUser?.id) return;

    loadStartTime.current = performance.now();
    apiCallCount.current = 0;
    cacheHitCount.current = 0;

    try {
      console.log('🚀 Loading course lessons with ULTRA-FAST optimizations...');
      
      // 1. Try to load cached data first for instant display
      const courseCacheKey = getCacheKey(`course_lessons_${courseId}_${currentUser.id}`);
      const lessonsCacheKey = getCacheKey(`lessons_${courseId}_${currentUser.id}`);
      
      const cachedCourse = getCachedData(courseCacheKey);
      const cachedLessons = getCachedData(lessonsCacheKey);
      
      if (cachedCourse && cachedLessons) {
        console.log('⚡ INSTANT: Loading course lessons from cache...');
        cacheHitCount.current += 2;
        setCourse(cachedCourse);
        setLessons(cachedLessons);
        setLoadingStates(prev => ({ ...prev, course: false, lessons: false }));
        
        // Update performance metrics
        const loadTime = performance.now() - loadStartTime.current;
        setPerformanceMetrics({
          loadTime: Math.round(loadTime),
          cacheHitRate: 100,
          apiCallCount: 0
        });
      } else {
        setLoadingStates(prev => ({ ...prev, course: true, lessons: true }));
      }
      
      // 2. Load fresh data in background with batching
      const loadFreshData = async () => {
        try {
          console.log('🔄 Loading fresh course lessons with batched requests...');
          
          // Get course data from multiple sources
          let targetCourse: Course;
          const courseData = getCourseData();
          
          if (courseData) {
            targetCourse = courseData;
          } else {
            // Fetch course by ID if not provided in state
            const userCourses = await requestQueue.add(() => 
              enhancedMoodleService.getUserCourses(currentUser.id)
            );
            apiCallCount.current++;
            
            const foundCourse = userCourses.find((c: any) => c.id === courseId);
            if (!foundCourse) {
              throw new Error('Course not found');
            }
            
            // Add required status property to match Course interface
            targetCourse = {
              ...foundCourse,
              id: foundCourse.id.toString(),
              progress: foundCourse.progress || 0,
              status: (foundCourse as any).status || 'in_progress'
            };
           }

          setCourse(targetCourse);
          setCachedData(courseCacheKey, targetCourse);
          setLoadingStates(prev => ({ ...prev, course: false }));
          
          // Store in sessionStorage for instant access
          sessionStorage.setItem(`course_${courseId}`, JSON.stringify(targetCourse));

          // Fetch lessons for this specific course with batching
          console.log(`🔍 Fetching lessons for course: ${targetCourse.fullname} (ID: ${targetCourse.id})`);
          const courseLessons = await requestQueue.add(() => 
            enhancedMoodleService.getCourseContents(targetCourse.id)
          );
          apiCallCount.current++;
          
          // Transform lessons to match our interface
          const transformedLessons: Lesson[] = courseLessons.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.name,
            courseId: targetCourse.id,
            courseTitle: targetCourse.fullname,
            duration: getLessonDuration(lesson.totalModules || 0),
            type: 'lesson',
            status: lesson.status,
            progress: lesson.progress,
            dueDate: getLessonDueDate(lesson.dates),
            prerequisites: lesson.prerequisites,
            image: getLessonImage(targetCourse.courseimage),
            totalModules: lesson.totalModules,
            completedModules: lesson.completedModules,
            description: lesson.description
          }));

          setLessons(transformedLessons);
          setCachedData(lessonsCacheKey, transformedLessons);
          setLoadingStates(prev => ({ ...prev, lessons: false }));
          
          console.log(`✅ Loaded ${transformedLessons.length} lessons for course`);
          
          // Update performance metrics
          const loadTime = performance.now() - loadStartTime.current;
          const cacheHitRate = cacheHitCount.current > 0 ? 100 : 0;
          
          setPerformanceMetrics({
            loadTime: Math.round(loadTime),
            cacheHitRate,
            apiCallCount: apiCallCount.current
          });
          
          console.log(`⚡ ULTRA-FAST: Course lessons loaded in ${Math.round(loadTime)}ms with ${apiCallCount.current} API calls`);
          
        } catch (error) {
          console.error('❌ Error loading fresh course lessons:', error);
          setError(error instanceof Error ? error.message : 'Failed to load course lessons');
          setLoadingStates(prev => ({ ...prev, course: false, lessons: false }));
          
          if (!cachedCourse && !cachedLessons) {
            setCourse(null);
            setLessons([]);
          }
        }
      };
      
      // Start background loading
      loadFreshData();
      
    } catch (error) {
      console.error('❌ Error in loadCourseDataWithCache:', error);
      setError(error instanceof Error ? error.message : 'Failed to load course lessons');
      setLoadingStates(prev => ({ ...prev, course: false, lessons: false }));
    }
  }, [courseId, currentUser?.id, getCourseData]);

  useEffect(() => {
    loadCourseDataWithCache();
  }, [loadCourseDataWithCache]);

  // Performance metrics display
  const performanceDisplay = useMemo(() => {
    if (performanceMetrics.loadTime === 0) return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center space-x-2 text-sm">
          <Rocket className="w-4 h-4 text-green-600" />
          <span className="text-green-800 font-medium">
            Loaded in {performanceMetrics.loadTime}ms
          </span>
        </div>
        <div className="text-xs text-green-600 mt-1">
          Cache: {performanceMetrics.cacheHitRate}% | API: {performanceMetrics.apiCallCount} calls
        </div>
      </div>
    );
  }, [performanceMetrics]);

  // Skeleton loader components
  const SkeletonLessonCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );

  // Helper functions
  const getLessonDuration = (totalModules: number): string => {
    const estimatedMinutes = totalModules * 15;
    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} min`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const getLessonDueDate = (dates: any[]): string | undefined => {
    if (!dates || dates.length === 0) return undefined;
    const dueDate = dates.find((date: any) => date.label === 'Due date') || dates[dates.length - 1];
    if (dueDate) {
      return new Date(dueDate.timestamp * 1000).toISOString().split('T')[0];
    }
    return undefined;
  };

  const getLessonImage = (courseImage?: string): string => {
    return courseImage || '/card1.webp';
  };

  const getStatusColor = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'not-started':
        return <Circle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColorClass = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'not-started':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    // Navigate to lesson activities journey page
    navigate(`/dashboard/student/lesson-activities-journey/${lesson.courseId}/${lesson.id}`, { 
      state: { 
        selectedLesson: lesson
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
  };

  const handleBackToCourses = () => {
    navigate('/dashboard/student/courses');
  };

  if (loadingStates.course || loadingStates.lessons) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
          {performanceDisplay}
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <SkeletonLessonCard key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error Loading Course</span>
              </div>
              <p className="text-red-700 mb-3">{error || 'Course not found'}</p>
              <button 
                onClick={handleBackToCourses}
                className="text-red-600 hover:text-red-800 underline"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completedLessons = lessons.filter(lesson => lesson.status === 'completed').length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
        {performanceDisplay}
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Back Button */}
          {/* <button
            onClick={handleBackToCourses}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Courses</span>
          </button> */}

          {/* Top Navigation Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
            <div className="flex space-x-2 p-2">
              {topNavItems.map((item) => {
                const isActive = isActivePath(item.path);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleTopNavClick(item.path)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
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

          {/* Course Header Banner */}
          <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={course.courseimage || course.overviewfiles?.[0]?.fileurl || '/card1.webp'}
              alt={course.fullname}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/card1.webp';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Course Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 mb-3">
                    Beginner
                  </Badge>
                  <h1 className="text-4xl font-bold text-white mb-2">{course.fullname}</h1>
                  <p className="text-white/90 text-lg">{course.summary || course.description || 'Learn fundamental skills and concepts.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">{completedLessons}/{totalLessons}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">4 weeks</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grade</p>
                  <p className="text-2xl font-bold text-gray-900">{course.grade || 0}%</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Course Progress</span>
                <span className="text-sm text-gray-500">{progressPercentage}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </div>

          {/* Course Lessons Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Course Lessons</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{totalLessons} lessons</span>
                <span>•</span>
                <span>{completedLessons} completed</span>
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleLessonClick(lesson)}
                >
                  {/* Lesson Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    <img
                      src={lesson.image || '/card1.webp'}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/card1.webp';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(lesson.status)}`}>
                        {getStatusIcon(lesson.status)}
                      </div>
                    </div>
                  </div>

                  {/* Lesson Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      Lesson {index + 1}: {lesson.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lesson.description || 'Learn important concepts and skills.'}
                    </p>

                    {/* Lesson Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration}</span>
                      </div>
                      
                      {lesson.prerequisites && (
                        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          Prerequisites: {lesson.prerequisites}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-medium text-gray-700">{lesson.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            lesson.status === 'completed' 
                              ? 'bg-green-500' 
                              : lesson.status === 'in-progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                          }`}
                          style={{ width: `${lesson.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        lesson.status === 'completed'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : lesson.status === 'in-progress'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {lesson.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Review Lesson</span>
                        </>
                      ) : lesson.status === 'in-progress' ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Continue Lesson</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Lesson</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {lessons.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons available</h3>
                <p className="text-gray-500 mb-4">
                  This course doesn't have any lessons yet.
                </p>
                <button
                  onClick={handleBackToCourses}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Back to Courses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Details Modal */}
      {isModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <img 
                src={selectedLesson.image || '/card1.webp'} 
                alt={selectedLesson.title}
                className="w-full h-48 object-cover rounded-t-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-3xl"></div>
              <button
                onClick={closeModal}
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
                <Progress value={selectedLesson.progress} className="h-3" />
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
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CourseLessons;
