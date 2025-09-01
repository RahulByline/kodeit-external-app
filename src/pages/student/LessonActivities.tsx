import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
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
  BookOpen,
  Smartphone,
  Monitor,
  Handshake,
  Trophy,
  Minus,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { getCacheKey, getCachedData, setCachedData, CACHE_KEYS } from '../../utils/cache';

// Performance optimization constants
const CACHE_DURATION = {
  LESSON_DATA: 10 * 60 * 1000, // 10 minutes
  ACTIVITIES: 5 * 60 * 1000, // 5 minutes
  COURSE_DATA: 15 * 60 * 1000 // 15 minutes
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

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'video' | 'assignment' | 'discussion' | 'resource';
  duration: string;
  dueDate?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  status: 'completed' | 'in-progress' | 'not-started';
  image?: string;
  url?: string;
  progress: number;
}

const LessonActivities: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lessonId, courseId } = useParams<{ lessonId: string; courseId: string }>();
  const { currentUser } = useAuth();
  
  // Advanced state management with performance optimizations
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for instant render
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Performance optimization states
  const [loadingStates, setLoadingStates] = useState({
    lesson: false,
    activities: false,
    course: false
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
  
  // Preloading state
  const [preloadedData, setPreloadedData] = useState<{
    lesson?: Lesson;
    activities?: Activity[];
    course?: any;
  }>({});

  // Enhanced lesson data retrieval with multiple cache layers
  const getLessonData = useCallback(() => {
    // 1. Try location state first (fastest)
    if (location.state?.selectedLesson) {
      console.log('⚡ Using lesson data from location state');
      return location.state.selectedLesson;
    }
    
    // 2. Try localStorage (fast)
    const storedLesson = localStorage.getItem('selectedLesson');
    if (storedLesson) {
      try {
        const parsed = JSON.parse(storedLesson);
        console.log('⚡ Using lesson data from localStorage');
        return parsed;
      } catch (error) {
        console.warn('Invalid lesson data in localStorage');
        localStorage.removeItem('selectedLesson');
      }
    }
    
    // 3. Try sessionStorage (medium)
    const sessionLesson = sessionStorage.getItem(`lesson_${lessonId}`);
    if (sessionLesson) {
      try {
        const parsed = JSON.parse(sessionLesson);
        console.log('⚡ Using lesson data from sessionStorage');
        return parsed;
      } catch (error) {
        console.warn('Invalid lesson data in sessionStorage');
        sessionStorage.removeItem(`lesson_${lessonId}`);
      }
    }
    
    return null;
  }, [location.state, lessonId]);

  // Ultra-fast loading with advanced caching strategies
  const loadLessonDataWithCache = useCallback(async () => {
    if (!currentUser?.id) return;

    loadStartTime.current = performance.now();
    apiCallCount.current = 0;
    cacheHitCount.current = 0;

    try {
      console.log('🚀 Loading lesson activities with ULTRA-FAST optimizations...');
      
      // 1. Try to load cached data first for instant display
      const lessonCacheKey = getCacheKey(`lesson_${lessonId}`, currentUser.id);
      const activitiesCacheKey = getCacheKey(`activities_${lessonId}`, currentUser.id);
      
      const cachedLesson = getCachedData(lessonCacheKey);
      const cachedActivities = getCachedData(activitiesCacheKey);
      
      if (cachedLesson && cachedActivities) {
        console.log('⚡ INSTANT: Loading lesson data from cache...');
        cacheHitCount.current += 2;
        setLesson(cachedLesson);
        setActivities(cachedActivities);
        setLoadingStates(prev => ({ ...prev, lesson: false, activities: false }));
        
        // Update performance metrics
        const loadTime = performance.now() - loadStartTime.current;
        setPerformanceMetrics({
          loadTime: Math.round(loadTime),
          cacheHitRate: 100,
          apiCallCount: 0
        });
      } else {
        setLoadingStates(prev => ({ ...prev, lesson: true, activities: true }));
      }
      
      // 2. Load fresh data in background with batching
      const loadFreshData = async () => {
        try {
          console.log('🔄 Loading fresh lesson data with batched requests...');
          
          // Get lesson data from multiple sources
          let targetLesson: Lesson;
          const lessonData = getLessonData();
          
          if (lessonData) {
            targetLesson = lessonData;
          } else {
            // Fetch lesson by ID if not provided in state
            const userCourses = await requestQueue.add(() => 
              moodleService.getUserCourses(currentUser.id)
            );
            apiCallCount.current++;
            
            const course = userCourses.find((c: any) => c.id === courseId);
            if (!course) {
              throw new Error('Course not found');
            }
            
            const courseLessons = await requestQueue.add(() => 
              moodleService.getCourseLessons(course.id)
            );
            apiCallCount.current++;
            
            targetLesson = courseLessons.find((l: any) => l.id === lessonId);
            if (!targetLesson) {
              throw new Error('Lesson not found');
            }
          }

          setLesson(targetLesson);
          setCachedData(lessonCacheKey, targetLesson);
          setLoadingStates(prev => ({ ...prev, lesson: false }));

          // Fetch activities for this specific lesson with batching
          console.log(`🔍 Fetching activities for lesson: ${targetLesson.title} (ID: ${targetLesson.id})`);
          const courseActivities = await requestQueue.add(() => 
            moodleService.getCourseActivities(targetLesson.courseId)
          );
          apiCallCount.current++;
          
          // Filter activities that belong to this lesson (section)
          const lessonActivities = courseActivities.filter((activity: any) => 
            activity.section === targetLesson.title
          );
          
          // Transform activities to match our interface
          const transformedActivities: Activity[] = lessonActivities.map((activity: any, index: number) => ({
            id: activity.id,
            title: activity.name,
            description: getActivityDescription(activity.modname),
            type: mapActivityType(activity.modname),
            duration: getActivityDuration(activity.modname),
            dueDate: activity.dueDate ? new Date(activity.dueDate * 1000).toISOString().split('T')[0] : undefined,
            difficulty: getActivityDifficulty(activity.modname),
            points: getActivityPoints(activity.modname),
            status: getActivityStatus(activity.completionstatus),
            image: getActivityImage(activity.modname),
            url: activity.url,
            progress: activity.completionstatus?.progress || 0
          }));

                     // If no real activities found, create optimized sample activities
           let finalActivities: Activity[];
           if (transformedActivities.length === 0) {
             const sampleActivities: Activity[] = [
               {
                 id: '1',
                 title: 'Digital Footprint Quiz',
                 description: 'Test your knowledge about digital footprints and online presence',
                 type: 'quiz',
                 duration: '15 min',
                 dueDate: '2025-01-20',
                 difficulty: 'Easy',
                 points: 50,
                 status: 'not-started',
                 image: '/card1.webp',
                 progress: 0
               },
               {
                 id: '2',
                 title: 'Online Safety Video',
                 description: 'Watch an interactive video about staying safe online',
                 type: 'video',
                 duration: '20 min',
                 difficulty: 'Easy',
                 points: 25,
                 status: 'completed',
                 image: '/card2.webp',
                 progress: 100
               },
               {
                 id: '3',
                 title: 'Create a Digital Citizenship Poster',
                 description: 'Design a poster promoting good digital citizenship practices',
                 type: 'assignment',
                 duration: '45 min',
                 dueDate: '2025-01-25',
                 difficulty: 'Medium',
                 points: 75,
                 status: 'in-progress',
                 image: '/card3.webp',
                 progress: 30
               }
             ];
             
             finalActivities = sampleActivities;
           } else {
             finalActivities = transformedActivities;
           }
           
           setActivities(finalActivities);
           setCachedData(activitiesCacheKey, finalActivities);
           setLoadingStates(prev => ({ ...prev, activities: false }));
           
           // Update performance metrics
           const loadTime = performance.now() - loadStartTime.current;
           const cacheHitRate = cacheHitCount.current > 0 ? 100 : 0;
           
           setPerformanceMetrics({
             loadTime: Math.round(loadTime),
             cacheHitRate,
             apiCallCount: apiCallCount.current
           });
           
           console.log(`⚡ ULTRA-FAST: Lesson activities loaded in ${Math.round(loadTime)}ms with ${apiCallCount.current} API calls`);
           
         } catch (error) {
           console.error('❌ Error loading fresh lesson data:', error);
           setError(error instanceof Error ? error.message : 'Failed to load lesson data');
           setLoadingStates(prev => ({ ...prev, lesson: false, activities: false }));
           
           if (!cachedLesson && !cachedActivities) {
             setLesson(null);
             setActivities([]);
           }
         }
       };
       
       // Start background loading
       loadFreshData();
       
     } catch (error) {
       console.error('❌ Error in loadLessonDataWithCache:', error);
       setError(error instanceof Error ? error.message : 'Failed to load lesson data');
       setLoadingStates(prev => ({ ...prev, lesson: false, activities: false }));
     }
   }, [currentUser?.id, lessonId, courseId, getLessonData]);

   useEffect(() => {
     loadLessonDataWithCache();
   }, [loadLessonDataWithCache]);

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
  const SkeletonActivityCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
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
  const getActivityDescription = (modname: string): string => {
    const descriptions: { [key: string]: string } = {
      'quiz': 'Test your knowledge and understanding of the concepts',
      'video': 'Watch an interactive video to learn new concepts',
      'assign': 'Complete an assignment to demonstrate your skills',
      'forum': 'Participate in discussions with your peers',
      'resource': 'Review additional learning materials',
      'url': 'Explore external resources and links',
      'workshop': 'Collaborate with others on a project',
      'scorm': 'Complete an interactive learning module'
    };
    return descriptions[modname] || 'Complete this activity to progress';
  };

  const mapActivityType = (modname: string): 'quiz' | 'video' | 'assignment' | 'discussion' | 'resource' => {
    const typeMap: { [key: string]: 'quiz' | 'video' | 'assignment' | 'discussion' | 'resource' } = {
      'quiz': 'quiz',
      'video': 'video',
      'assign': 'assignment',
      'forum': 'discussion',
      'resource': 'resource',
      'url': 'resource',
      'workshop': 'assignment',
      'scorm': 'video'
    };
    return typeMap[modname] || 'resource';
  };

  const getActivityDuration = (modname: string): string => {
    const durations: { [key: string]: string } = {
      'quiz': '15 min',
      'video': '20 min',
      'assign': '45 min',
      'forum': '30 min',
      'resource': '10 min',
      'url': '15 min',
      'workshop': '60 min',
      'scorm': '25 min'
    };
    return durations[modname] || '30 min';
  };

  const getActivityDifficulty = (modname: string): 'Easy' | 'Medium' | 'Hard' => {
    const difficulties: { [key: string]: 'Easy' | 'Medium' | 'Hard' } = {
      'quiz': 'Easy',
      'video': 'Easy',
      'assign': 'Medium',
      'forum': 'Easy',
      'resource': 'Easy',
      'url': 'Easy',
      'workshop': 'Hard',
      'scorm': 'Medium'
    };
    return difficulties[modname] || 'Medium';
  };

  const getActivityPoints = (modname: string): number => {
    const points: { [key: string]: number } = {
      'quiz': 50,
      'video': 25,
      'assign': 75,
      'forum': 30,
      'resource': 15,
      'url': 20,
      'workshop': 100,
      'scorm': 40
    };
    return points[modname] || 50;
  };

  const getActivityStatus = (completionStatus: any): 'completed' | 'in-progress' | 'not-started' => {
    if (!completionStatus) return 'not-started';
    if (completionStatus.state === 1) return 'completed';
    if (completionStatus.progress > 0) return 'in-progress';
    return 'not-started';
  };

  const getActivityImage = (modname: string): string => {
    const images: { [key: string]: string } = {
      'quiz': '/card1.webp',
      'video': '/card2.webp',
      'assign': '/card3.webp',
      'forum': '/card1.webp',
      'resource': '/card2.webp',
      'url': '/card3.webp',
      'workshop': '/card1.webp',
      'scorm': '/card2.webp'
    };
    return images[modname] || '/card1.webp';
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

  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600';
      case 'Medium':
        return 'text-orange-600';
      case 'Hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'assignment':
        return <Edit className="w-4 h-4" />;
      case 'discussion':
        return <MessageSquare className="w-4 h-4" />;
      case 'resource':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleBackToLessons = () => {
    // Navigate back to the course lessons page
    if (courseId) {
      navigate(`/dashboard/student/course-lessons/${courseId}`);
    } else {
      navigate('/dashboard/student/current-lessons');
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lesson) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error Loading Lesson</span>
              </div>
              <p className="text-red-700 mb-3">{error || 'Lesson not found'}</p>
              <button 
                onClick={handleBackToLessons}
                className="text-red-600 hover:text-red-800 underline"
              >
                Back to Lessons
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completedActivities = activities.filter(activity => activity.status === 'completed').length;
  const totalActivities = activities.length;
  const progressPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
        {performanceDisplay}
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header with Back Button and Full Screen Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToLessons}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Course</span>
            </button>
            
            {isFullScreen && (
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
                To exit full screen, press and hold Esc
              </div>
            )}
          </div>

          {/* Lesson Header Banner */}
          <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={lesson.image || '/card1.webp'}
              alt={lesson.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/card1.webp';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Lesson Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={`${getStatusColor(lesson.status)} border-0 mb-3`}>
                    {lesson.status === 'completed' ? 'Completed' : lesson.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                  <h1 className="text-4xl font-bold text-white mb-2">{lesson.title}</h1>
                  <p className="text-white/90 text-lg">{lesson.description || 'Learn important concepts and skills.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{lesson.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activities</p>
                  <p className="text-2xl font-bold text-gray-900">{totalActivities} total</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Lesson Progress</span>
                <span className="text-sm text-gray-500">{progressPercentage}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </div>

          {/* Lesson Activities Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Lesson Activities</h2>
            </div>

            {/* Activity Progress Indicator */}
            <div className="flex items-center justify-center space-x-2">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : activity.status === 'in-progress'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < activities.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      activity.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Activities Timeline */}
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : activity.status === 'in-progress'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {activity.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < activities.length - 1 && (
                      <div className={`w-1 h-16 mt-2 ${
                        activity.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>

                  {/* Activity Card */}
                  <div 
                    className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Activity Thumbnail */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={activity.image || '/card1.webp'}
                            alt={activity.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/card1.webp';
                            }}
                          />
                        </div>

                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                            {activity.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {activity.description}
                          </p>

                          {/* Activity Details */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{activity.duration}</span>
                              </div>
                              {activity.dueDate && (
                                <div className="flex items-center space-x-1 text-red-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {new Date(activity.dueDate).toLocaleDateString('en-GB')}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}>
                                {activity.difficulty}
                              </span>
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <Trophy className="w-4 h-4" />
                                <span>{activity.points}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          <button
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                              activity.status === 'completed'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : activity.status === 'in-progress'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                            }`}
                          >
                            {activity.status === 'completed' ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Review</span>
                              </>
                            ) : activity.status === 'in-progress' ? (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Continue</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Start</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {activities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities available</h3>
                <p className="text-gray-500 mb-4">
                  This lesson doesn't have any activities yet.
                </p>
                <button
                  onClick={handleBackToLessons}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Back to Lessons
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      {isModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <img 
                src={selectedActivity.image || '/card1.webp'} 
                alt={selectedActivity.title}
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
                <span className={`${getStatusColor(selectedActivity.status)} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                  {selectedActivity.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h2>
                <p className="text-gray-600 text-lg">{selectedActivity.description}</p>
              </div>
              
              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">{selectedActivity.duration}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-green-600" />
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
                {selectedActivity.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Due Date</span>
                    <span className="text-sm text-red-600">{new Date(selectedActivity.dueDate).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {selectedActivity.status === 'completed' ? (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <CheckCircle className="w-5 h-5" />
                    <span>Review Activity</span>
                  </button>
                ) : selectedActivity.status === 'in-progress' ? (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5" />
                    <span>Continue Activity</span>
                  </button>
                ) : (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5" />
                    <span>Start Activity</span>
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

export default LessonActivities;

