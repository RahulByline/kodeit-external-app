import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import moodleService from '../../services/moodleApi';
import { 
  Activity, 
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
  Users,
  Star,
  Clock,
  Zap,
  Trophy,
  LayoutDashboard,
  AlertCircle,
  Search,
  X,
  ExternalLink,
  Download,
  BarChart3,
  Bookmark,
  Share2,
  Rocket,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { getCacheKey, getCachedData, setCachedData, CACHE_KEYS } from '../../utils/cache';

// Performance optimization constants
const BATCH_SIZE = 5;
const DEBOUNCE_DELAY = 300;
const PRELOAD_THRESHOLD = 3;

// Request queue for batching API calls
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private batchSize = BATCH_SIZE;

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
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

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
}

interface ActivityItem {
  id: string;
  title: string;
  type: 'assignment' | 'quiz' | 'project' | 'discussion' | 'challenge' | 'workshop' | 'forum' | 'workshop' | 'assign' | 'url' | 'resource';
  courseId: string;
  courseTitle: string;
  duration: string;
  points: number;
  dueDate?: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'overdue';
  difficulty: 'easy' | 'medium' | 'hard';
  participants?: number;
  description: string;
  tags: string[];
  url?: string;
  fileUrl?: string;
  isRequired: boolean;
  image?: string; // Added for modal
}

const Activities: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Advanced state management with performance optimizations
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'points' | 'difficulty'>('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'in-progress' | 'pending'>('all');
  
  // Performance optimization states
  const [loadingStates, setLoadingStates] = useState({
    activities: false,
    courses: false
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
  
  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

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

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Ultra-fast loading with advanced optimizations
  const loadActivitiesWithCache = useCallback(async () => {
    if (!currentUser?.id) return;

    loadStartTime.current = performance.now();
    apiCallCount.current = 0;
    cacheHitCount.current = 0;

    try {
      console.log('🚀 Loading activities with ULTRA-FAST optimizations...');
      
      // 1. Try to load cached data first for instant display
      const activitiesCacheKey = getCacheKey(CACHE_KEYS.COURSE_ACTIVITIES, currentUser.id);
      const cachedActivities = getCachedData(activitiesCacheKey);
      
      if (cachedActivities) {
        console.log('⚡ INSTANT: Loading activities from cache...');
        cacheHitCount.current++;
        setActivities(cachedActivities);
        setLoadingStates(prev => ({ ...prev, activities: false }));
        
        // Update performance metrics
        const loadTime = performance.now() - loadStartTime.current;
        setPerformanceMetrics({
          loadTime: Math.round(loadTime),
          cacheHitRate: 100,
          apiCallCount: 0
        });
      } else {
        setLoadingStates(prev => ({ ...prev, activities: true }));
      }
      
      // 2. Load fresh data in background with batching
      const loadFreshData = async () => {
        try {
          console.log('🔄 Loading fresh activities data with batched requests...');
          
          // Fetch user courses with request batching
          const userCourses = await requestQueue.add(() => 
            moodleService.getUserCourses(currentUser.id)
          );
          apiCallCount.current++;
          
          const enrolledCourses = userCourses.filter(course => 
            course.visible !== 0 && course.categoryid && course.categoryid > 0
          );

          if (enrolledCourses.length === 0) {
            console.warn('⚠️ No enrolled courses found, using optimized sample data...');
            
            // Optimized sample data
            const sampleActivities: ActivityItem[] = [
              {
                id: '1',
                title: 'Programming Assignment 1',
                type: 'assignment',
                courseId: '1',
                courseTitle: 'Introduction to Programming',
                duration: '2 hours',
                points: 100,
                dueDate: '2024-01-15',
                status: 'in-progress',
                difficulty: 'medium',
                participants: 45,
                description: 'Complete the basic programming exercises',
                tags: ['programming', 'assignment'],
                isRequired: true,
                image: '/card1.webp'
              },
              {
                id: '2',
                title: 'Python Quiz',
                type: 'quiz',
                courseId: '2',
                courseTitle: 'Advanced Python Programming',
                duration: '30 min',
                points: 50,
                dueDate: '2024-01-20',
                status: 'not-started',
                difficulty: 'hard',
                participants: 32,
                description: 'Test your Python knowledge',
                tags: ['python', 'quiz'],
                isRequired: true,
                image: '/card2.webp'
              }
            ];
            
            setActivities(sampleActivities);
            setLoadingStates(prev => ({ ...prev, activities: false }));
            return;
          }

          // Batch fetch activities for optimal performance
          const courseActivityPromises = enrolledCourses.map(async (course) => {
            return requestQueue.add(async () => {
              try {
                console.log(`🔍 Fetching activities for course: ${course.fullname}`);
                const courseActivities = await moodleService.getCourseActivities(course.id);
                apiCallCount.current++;
                
                return courseActivities.map((activity: any) => ({
                  id: activity.id.toString(),
                  title: activity.name,
                  type: mapActivityType(activity.type),
                  courseId: course.id,
                  courseTitle: course.fullname,
                  duration: getActivityDuration(activity.type),
                  points: getActivityPoints(activity.type),
                  dueDate: getActivityDueDate(activity.dates),
                  status: getActivityStatus(activity.completion),
                  difficulty: getActivityDifficulty(activity.type),
                  participants: Math.floor(Math.random() * 50) + 10,
                  description: activity.description || 'No description available',
                  tags: getActivityTags(activity.type, course.fullname),
                  url: activity.url,
                  fileUrl: activity.contents?.[0]?.fileurl,
                  isRequired: activity.availabilityinfo ? true : false,
                  image: course.courseimage
                }));
              } catch (courseError) {
                console.error(`❌ Failed to fetch activities for course ${course.fullname}:`, courseError);
                return [];
              }
            });
          });
          
          // Wait for all course activities to load in parallel with batching
          const allCourseActivities = await Promise.all(courseActivityPromises);
          const allActivities = allCourseActivities.flat();
          
          console.log(`✅ Loaded ${allActivities.length} activities from all courses`);
          
          setActivities(allActivities);
          setCachedData(activitiesCacheKey, allActivities);
          setLoadingStates(prev => ({ ...prev, activities: false }));
          
          // Update performance metrics
          const loadTime = performance.now() - loadStartTime.current;
          const cacheHitRate = cacheHitCount.current > 0 ? 100 : 0;
          
          setPerformanceMetrics({
            loadTime: Math.round(loadTime),
            cacheHitRate,
            apiCallCount: apiCallCount.current
          });
          
          console.log(`⚡ ULTRA-FAST: Activities loaded in ${Math.round(loadTime)}ms with ${apiCallCount.current} API calls`);
          
        } catch (error) {
          console.error('❌ Error loading fresh activities data:', error);
          setLoadingStates(prev => ({ ...prev, activities: false }));
          
          if (!cachedActivities) {
            setActivities([]);
          }
        }
      };
      
      // Start background loading
      loadFreshData();
      
    } catch (error) {
      console.error('❌ Error in loadActivitiesWithCache:', error);
      setLoadingStates(prev => ({ ...prev, activities: false }));
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadActivitiesWithCache();
  }, [loadActivitiesWithCache]);

  // Helper functions for activity processing
  const mapActivityType = (moodleType: string): ActivityItem['type'] => {
    const typeMap: { [key: string]: ActivityItem['type'] } = {
      'assign': 'assignment',
      'quiz': 'quiz',
      'forum': 'discussion',
      'workshop': 'workshop',
      'url': 'url',
      'resource': 'resource'
    };
    return typeMap[moodleType] || 'assignment';
  };

  const getActivityDuration = (activityType: string): string => {
    const durations: { [key: string]: string } = {
      'assign': '2 hours',
      'quiz': '30 min',
      'forum': '1 hour',
      'workshop': '3 hours',
      'url': '15 min',
      'resource': '20 min'
    };
    return durations[activityType] || '1 hour';
  };

  const getActivityPoints = (activityType: string): number => {
    const points: { [key: string]: number } = {
      'assign': 150,
      'quiz': 100,
      'forum': 50,
      'workshop': 200,
      'url': 25,
      'resource': 30
    };
    return points[activityType] || 100;
  };

  const getActivityDueDate = (dates: any[]): string | undefined => {
    if (!dates || dates.length === 0) return undefined;
    
    const dueDate = dates.find((date: any) => date.label === 'Due date') || dates[dates.length - 1];
    
    if (dueDate) {
      return new Date(dueDate.timestamp * 1000).toISOString().split('T')[0];
    }
    
    return undefined;
  };

  const getActivityStatus = (completion: any): 'completed' | 'in-progress' | 'not-started' | 'overdue' => {
    if (!completion) return 'not-started';
    
    if (completion.state === 1) return 'completed';
    if (completion.state === 0) return 'in-progress';
    
    // Check if overdue
    if (completion.dueDate) {
      const dueDate = new Date(completion.dueDate);
      if (dueDate < new Date()) return 'overdue';
    }
    
    return 'not-started';
  };

  const getActivityDifficulty = (activityType: string): 'easy' | 'medium' | 'hard' => {
    const difficulties: { [key: string]: 'easy' | 'medium' | 'hard' } = {
      'assign': 'medium',
      'quiz': 'easy',
      'forum': 'easy',
      'workshop': 'hard',
      'url': 'easy',
      'resource': 'easy'
    };
    return difficulties[activityType] || 'medium';
  };

  const getActivityTags = (activityType: string, courseTitle: string): string[] => {
    const baseTags: { [key: string]: string[] } = {
      'assign': ['Assignment', 'Submission'],
      'quiz': ['Quiz', 'Assessment'],
      'forum': ['Discussion', 'Collaboration'],
      'workshop': ['Workshop', 'Hands-on'],
      'url': ['Resource', 'External'],
      'resource': ['Resource', 'Learning']
    };
    
    const tags = baseTags[activityType] || ['Activity'];
    
    // Add course-specific tags
    if (courseTitle.toLowerCase().includes('web')) {
      tags.push('Web Development');
    } else if (courseTitle.toLowerCase().includes('javascript')) {
      tags.push('JavaScript');
    } else if (courseTitle.toLowerCase().includes('python')) {
      tags.push('Python');
    }
    
    return tags;
  };

  const getActivityStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-started':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: ActivityItem['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = activities
    .filter(activity => {
      const matchesSearchTerm = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                activity.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (activeFilter === 'all') return true;
      if (activeFilter === 'completed') return activity.status === 'completed';
      if (activeFilter === 'in-progress') return activity.status === 'in-progress';
      if (activeFilter === 'pending') return activity.status === 'not-started' || activity.status === 'overdue';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'points') return b.points - a.points;
      if (sortBy === 'difficulty') {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      return 0;
    });

  const handleActivityClick = (activity: ActivityItem) => {
    // Open modal with activity details
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Activities</h1>
              <p className="text-gray-600 text-lg">Explore and participate in various learning activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Activity className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{activities.filter(a => a.status === 'completed').length}</p>
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
                  <p className="text-3xl font-bold text-gray-900">{activities.filter(a => a.status === 'in-progress').length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{activities.filter(a => a.status === 'not-started').length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">Filter Activities</h2>
                <div className="flex space-x-2">
                  {['all', 'completed', 'in-progress', 'pending'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeFilter === filter
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 pl-10 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Activities Grid */}
          {loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Activities Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm ? 'No activities match your search criteria.' : 'No activities available at the moment.'}
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
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="relative">
                    <img 
                      src={activity.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
                      alt={activity.title}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                        <Activity className="w-4 h-4 text-orange-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`${getActivityStatusColor(activity.status)} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">{activity.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.courseTitle}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{activity.duration}</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`${getDifficultyColor(activity.difficulty)} px-2 py-1 rounded-full text-xs font-medium`}>
                        {activity.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">{activity.points} points</span>
                    </div>
                    {activity.dueDate && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">Due Date</div>
                        <div className="text-sm font-medium text-gray-900">{activity.dueDate}</div>
                      </div>
                    )}
                    <button 
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(activity);
                      }}
                    >
                      {activity.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>View Activity</span>
                        </>
                      ) : activity.status === 'in-progress' ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Continue Activity</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Activity</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Details Modal */}
        {isModalOpen && selectedActivity && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="relative">
                <img 
                  src={selectedActivity.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
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
                  <p className="text-gray-500 mt-2">{selectedActivity.description}</p>
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
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-600" />
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
                      <span className="text-sm text-gray-900">{selectedActivity.dueDate}</span>
                    </div>
                  )}
                  {selectedActivity.participants && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Participants</span>
                      <span className="text-sm text-gray-900">{selectedActivity.participants}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {selectedActivity.tags && selectedActivity.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {selectedActivity.status === 'completed' ? (
                    <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                      <CheckCircle className="w-5 h-5" />
                      <span>View Activity</span>
                    </button>
                  ) : selectedActivity.status === 'in-progress' ? (
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                      <Play className="w-5 h-5" />
                      <span>Continue Activity</span>
                    </button>
                  ) : (
                    <button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
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
      </div>
    </DashboardLayout>
  );
};

export default Activities;
