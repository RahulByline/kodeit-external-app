import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import moodleService from '../../services/moodleApi';
import { 
  Clock, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Calendar,
  Target,
  TrendingUp,
  FileText,
  Video,
  Code,
  Award,
  LayoutDashboard,
  Activity,
  Search,
  Eye,
  X,
  ExternalLink,
  Download,
  Star,
  BarChart3,
  Filter,
  RefreshCw,
  MessageSquare,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { getCacheKey, getCachedData, setCachedData, CACHE_KEYS } from '../../utils/cache';

interface Course {
  id: string;
  title: string;
  fullname: string;
  shortname: string;
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
}

interface Lesson {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  courseShortName: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'practice' | 'lesson';
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
  dueDate?: string;
  isNew?: boolean;
  prerequisites?: string;
  image?: string;
  totalModules?: number;
  completedModules?: number;
}

const CurrentLessons: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for instant render
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  
  // Individual loading states for progressive loading
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    lessons: false,
    activities: false
  });
  
  // Modal state (kept for compatibility)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Skeleton loader components for fast loading
  const SkeletonLessonCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div className="relative">
        <Skeleton className="w-full h-40" />
        <div className="absolute top-4 right-4">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="absolute bottom-4 left-4">
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </div>
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex items-center space-x-2 mb-4">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  );

  const SkeletonStatsCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );

  // Fast loading with caching and progressive loading
  const loadLessonsWithCache = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      console.log('🚀 Loading lessons with fast loading optimizations...');
      
      // 1. Try to load cached data first for instant display
      const lessonsCacheKey = getCacheKey(CACHE_KEYS.CURRENT_LESSONS, currentUser.id);
      const coursesCacheKey = getCacheKey(CACHE_KEYS.USER_COURSES, currentUser.id);
      
      const cachedLessons = getCachedData(lessonsCacheKey);
      const cachedCourses = getCachedData(coursesCacheKey);
      
      if (cachedLessons && cachedCourses) {
        console.log('✅ Loading lessons from cache for instant display...');
        setLessons(cachedLessons);
        setCourses(cachedCourses);
        setLoadingStates(prev => ({ ...prev, lessons: false, courses: false }));
      } else {
        setLoadingStates(prev => ({ ...prev, lessons: true, courses: true }));
      }
      
       
      const loadFreshData = async () => {
        try {
          console.log('🔄 Loading fresh lessons data in background...');
          
          // Fetch all user courses
          const userCourses = await moodleService.getUserCourses(currentUser.id);
          console.log('📚 Raw user courses:', userCourses);
          
          const enrolledCourses = userCourses.filter(course => 
            course.visible !== 0 && course.categoryid && course.categoryid > 0
          );
          
          console.log('📚 Enrolled courses after filtering:', enrolledCourses);
          
          if (enrolledCourses.length === 0) {
            console.warn('⚠️ No enrolled courses found, using sample data for testing');
            
            // Add sample data for testing
            const sampleCourses: Course[] = [
              {
                id: '1',
                title: 'Introduction to Programming',
                fullname: 'Introduction to Programming',
                shortname: 'PROG101',
                description: 'Learn the basics of programming',
                instructor: 'Dr. Sarah Johnson',
                progress: 75,
                totalLessons: 8,
                completedLessons: 6,
                duration: '8 weeks',
                category: 'Programming',
                image: '/card1.webp',
                isActive: true,
                lastAccessed: new Date().toISOString(),
                difficulty: 'Beginner' as const
              },
              {
                id: '2',
                title: 'Advanced Python',
                fullname: 'Advanced Python Programming',
                shortname: 'PYTHON201',
                description: 'Advanced Python concepts and applications',
                instructor: 'Prof. Michael Chen',
                progress: 45,
                totalLessons: 12,
                completedLessons: 5,
                duration: '12 weeks',
                category: 'Programming',
                image: '/card2.webp',
                isActive: true,
                lastAccessed: new Date().toISOString(),
                difficulty: 'Intermediate' as const
              }
            ];
            
            const sampleLessons: Lesson[] = [
              {
                id: '1',
                title: 'Variables and Data Types',
                courseId: '1',
                courseTitle: 'Introduction to Programming',
                courseShortName: 'PROG101',
                duration: '45 min',
                type: 'lesson',
                status: 'completed',
                progress: 100,
                isNew: false,
                prerequisites: 'Basic computer skills',
                image: '/card1.webp',
                totalModules: 5,
                completedModules: 5
              },
              {
                id: '2',
                title: 'Control Structures',
                courseId: '1',
                courseTitle: 'Introduction to Programming',
                courseShortName: 'PROG101',
                duration: '60 min',
                type: 'lesson',
                status: 'in-progress',
                progress: 60,
                isNew: false,
                prerequisites: 'Variables and Data Types',
                image: '/card1.webp',
                totalModules: 4,
                completedModules: 2
              },
              {
                id: '3',
                title: 'Functions and Methods',
                courseId: '2',
                courseTitle: 'Advanced Python Programming',
                courseShortName: 'PYTHON201',
                duration: '90 min',
                type: 'lesson',
                status: 'not-started',
                progress: 0,
                isNew: true,
                prerequisites: 'Basic Python knowledge',
                image: '/card2.webp',
                totalModules: 6,
                completedModules: 0
              }
            ];
            
            setCourses(sampleCourses);
            setLessons(sampleLessons);
            setLoadingStates(prev => ({ ...prev, lessons: false, courses: false }));
            return;
          }
          
          // Transform courses
          const transformedCourses: Course[] = enrolledCourses.map(course => ({
            id: course.id,
            title: course.fullname,
            fullname: course.fullname,
            shortname: course.shortname,
            description: course.summary || '',
            instructor: 'Instructor',
            progress: course.progress || 0,
            totalLessons: 0,
            completedLessons: 0,
            duration: '4 weeks',
            category: course.categoryname || 'General',
            image: course.courseimage || '/card1.webp',
            isActive: course.progress > 0,
            lastAccessed: course.startdate ? new Date(course.startdate * 1000).toISOString() : '',
            difficulty: 'Beginner' as const
          }));
          
          setCourses(transformedCourses);
          setCachedData(coursesCacheKey, transformedCourses);
          setLoadingStates(prev => ({ ...prev, courses: false }));
          
          // Fetch lessons from all courses in parallel for faster loading
          const courseLessonPromises = enrolledCourses.map(async (course) => {
            try {
              console.log(`🔍 Fetching lessons for course: ${course.fullname} (ID: ${course.id})`);
              const courseLessons = await moodleService.getCourseLessons(course.id);
              console.log(`📚 Lessons for course ${course.fullname}:`, courseLessons);
              
              return courseLessons.map((lesson: any) => ({
                id: lesson.id.toString(),
                title: lesson.name,
                courseId: course.id,
                courseTitle: course.fullname,
                courseShortName: course.shortname,
                duration: getLessonDuration(lesson.totalModules),
                type: 'lesson' as const,
                status: lesson.status,
                progress: lesson.progress,
                dueDate: getLessonDueDate(lesson.dates),
                isNew: isNewLesson(lesson.dates),
                prerequisites: lesson.description,
                image: getLessonImage(course.courseimage),
                totalModules: lesson.totalModules,
                completedModules: lesson.completedModules
              }));
            } catch (courseError) {
              console.error(`❌ Failed to fetch lessons for course ${course.fullname}:`, courseError);
              return [];
            }
          });
          
          // Wait for all course lessons to load in parallel
          const allCourseLessons = await Promise.all(courseLessonPromises);
          const allLessons = allCourseLessons.flat();
          
          console.log('📚 All lessons loaded:', allLessons);
          console.log('📚 Total lessons count:', allLessons.length);
          
          setLessons(allLessons);
          setCachedData(lessonsCacheKey, allLessons);
          setLoadingStates(prev => ({ ...prev, lessons: false }));
          
          console.log(`✅ Fresh lessons loaded and cached: ${allLessons.length} lessons`);
          
        } catch (error) {
          console.error('❌ Error loading fresh lessons data:', error);
          setLoadingStates(prev => ({ ...prev, lessons: false, courses: false }));
          
          // If no cached data and API fails, show empty state
          if (!cachedLessons && !cachedCourses) {
            setLessons([]);
            setCourses([]);
          }
        }
      };
      
      // Start background loading
      loadFreshData();
      
    } catch (error) {
      console.error('❌ Error in loadLessonsWithCache:', error);
      setLoadingStates(prev => ({ ...prev, lessons: false, courses: false }));
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadLessonsWithCache();
  }, [loadLessonsWithCache]);

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

  // Handle lesson click to open lesson content
  const handleLessonClick = async (lesson: Lesson) => {
    console.log('📚 Lesson clicked:', lesson.title);
    
    // Navigate to lesson activities page
    navigate(`/dashboard/student/lesson-activities/${lesson.courseId}/${lesson.id}`, { 
      state: { 
        selectedLesson: lesson
      }
    });
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
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
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return dates.some((date: any) => {
      const activityDate = new Date(date.timestamp * 1000);
      return activityDate > oneWeekAgo;
    });
  };

  const getActivityDueDate = (dates: any[]): string | undefined => {
    if (!dates || dates.length === 0) return undefined;
    
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

  // Helper functions for lesson processing
  const getLessonDuration = (totalModules: number): string => {
    // Estimate duration based on number of modules
    const estimatedMinutes = totalModules * 15; // 15 minutes per module
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

  const isNewLesson = (dates: any[]): boolean => {
    if (!dates || dates.length === 0) return false;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return dates.some((date: any) => {
      const lessonDate = new Date(date.timestamp * 1000);
      return lessonDate > oneWeekAgo;
    });
  };

  const getLessonImage = (courseImage?: string): string => {
    return courseImage || '/card1.webp';
  };



  const getStatusColor = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-started':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearchTerm = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              lesson.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || lesson.status === activeFilter;
    const matchesCourse = selectedCourseFilter === 'all' || lesson.courseId === selectedCourseFilter;
    return matchesSearchTerm && matchesFilter && matchesCourse;
  });

  // Debug logging for filtering
  console.log('🔍 Filtering debug:', {
    totalLessons: lessons.length,
    searchTerm,
    activeFilter,
    selectedCourseFilter,
    filteredCount: filteredLessons.length,
    courses: courses.map(c => ({ id: c.id, name: c.title }))
  });

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
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

        {/* Rest of the component content */}
        <div className=" mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Current Lessons</h1>
              <p className="text-gray-600 text-lg">
                Lessons from all your enrolled courses
              </p>
              <p className="text-gray-600 mt-2">Track your learning progress and upcoming lessons</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/student')}
                className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/20"
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">Back to Dashboard</span>
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  loadLessonsWithCache();
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-semibold">Refresh</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Debug Panel - Remove this in production
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>Total Lessons: {lessons.length}</p>
                <p>Total Courses: {courses.length}</p>
                <p>Filtered Lessons: {filteredLessons.length}</p>
                <p>Loading States: {JSON.stringify(loadingStates)}</p>
                <p>Selected Course Filter: {selectedCourseFilter}</p>
                <p>Active Filter: {activeFilter}</p>
                <p>Search Term: "{searchTerm}"</p>
              </div>
            </div>
          )} */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loadingStates.lessons ? (
              <>
                <SkeletonStatsCard />
                <SkeletonStatsCard />
                <SkeletonStatsCard />
                <SkeletonStatsCard />
              </>
            ) : (
              <>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                      <p className="text-3xl font-bold text-gray-900">{lessons.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">{lessons.filter(l => l.status === 'completed').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-gray-900">{lessons.filter(l => l.status === 'in-progress').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Not Started</p>
                      <p className="text-3xl font-bold text-gray-900">{lessons.filter(l => l.status === 'not-started').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Filter and Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">Filter Lessons</h2>
                <div className="flex space-x-2">
                  {['all', 'completed', 'in-progress', 'not-started'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeFilter === filter
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.replace('-', ' ').charAt(0).toUpperCase() + filter.replace('-', ' ').slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
                  <SelectTrigger className="w-48 bg-white/60 backdrop-blur-sm border border-white/20">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.shortname || course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search lessons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 pl-10 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Grid */}
          {loadingStates.lessons ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonLessonCard key={i} />
              ))}
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Lessons Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm ? 'No lessons match your search criteria.' : 'No lessons available for this course.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div className="relative">
                    <img 
                      src={lesson.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
                      alt={lesson.title}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                        {lesson.isNew ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Play className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`${getStatusColor(lesson.status)} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                        {lesson.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{lesson.courseTitle}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">{lesson.duration}</span>
                      </div>
                      {lesson.totalModules && (
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{lesson.completedModules}/{lesson.totalModules} modules</span>
                        </div>
                      )}
                    </div>
                    {lesson.prerequisites && (
                      <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">Prerequisites: {lesson.prerequisites}</p>
                    )}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${lesson.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Progress</span>
                        <span>{lesson.progress}%</span>
                      </div>
                    </div>
                    <button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonClick(lesson);
                      }}
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
          )}
        </div>

        {/* Lesson Details Modal */}
        {isModalOpen && selectedLesson && (
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
                
                {/* Module Information */}
                {selectedLesson.totalModules && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Modules</p>
                          <p className="font-semibold text-gray-900">{selectedLesson.totalModules}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="font-semibold text-gray-900">{selectedLesson.completedModules}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
      </div>
    </DashboardLayout>
  );
};

export default CurrentLessons;
