import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';

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

const CurrentLessons: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');

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
  const handleLessonClick = (lesson: Lesson) => {
    console.log('📚 Lesson clicked:', lesson.title);
    
    // Store selected lesson in localStorage
    localStorage.setItem('selectedLesson', JSON.stringify(lesson));
    localStorage.setItem('selectedCourse', JSON.stringify(selectedCourse));
    
    // Navigate to lesson detail view
    navigate(`/dashboard/student/lesson/${lesson.id}`, { 
      state: { 
        selectedLesson: lesson,
        selectedCourse: selectedCourse
      }
    });
  };

  useEffect(() => {
    const loadLessons = async () => {
      setLoading(true);
      
      try {
        // Get selected course from localStorage or route state
        let course: Course | null = null;
        
        // Try to get from route state first
        if (location.state?.selectedCourse) {
          course = location.state.selectedCourse;
        } else {
          // Try to get from localStorage
          const storedCourse = localStorage.getItem('selectedCourse');
          if (storedCourse) {
            course = JSON.parse(storedCourse);
          }
        }
        
        if (!course) {
          console.warn('No course selected, redirecting to dashboard');
          navigate('/dashboard/student');
          return;
        }
        
        setSelectedCourse(course);
        console.log('📚 Loading lessons for course:', course.title);
        
        // Fetch lessons for the specific course from Moodle API
        const courseActivities = await moodleService.getCourseActivities(course.id);
        
        // Transform Moodle activities to lessons
        const courseLessons = courseActivities.map((activity: any) => ({
          id: activity.id.toString(),
          title: activity.name,
          courseId: course.id,
          courseTitle: course.title,
          duration: getActivityDuration(activity.type),
          type: mapActivityType(activity.type),
          status: getActivityStatus(activity.completion),
          progress: getActivityProgress(activity.completion),
          dueDate: getActivityDueDate(activity.dates),
          isNew: isNewActivity(activity.dates),
          prerequisites: activity.availabilityinfo,
          image: getActivityImage(activity.type, course.image)
        }));
        
        console.log(`✅ Loaded ${courseLessons.length} lessons for course: ${course.title}`);
        setLessons(courseLessons);
        
      } catch (error) {
        console.error('Error loading lessons:', error);
        // Fallback to empty lessons array
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [location.state, navigate]);

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

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="p-6">
        {/* Top Navigation Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {topNavItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => handleTopNavClick(item.path)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rest of the component content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Current Lessons</h1>
              {selectedCourse && (
                <p className="text-gray-600 mt-1">
                  Lessons for: <span className="font-semibold text-blue-600">{selectedCourse.title}</span>
                </p>
              )}
              <p className="text-gray-600 mt-1">Track your learning progress and upcoming lessons</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/student')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {lessons.filter(l => l.status === 'in-progress').length}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Play className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {lessons.filter(l => l.status === 'completed').length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Not Started</p>
                  <p className="text-2xl font-bold text-red-600">
                    {lessons.filter(l => l.status === 'not-started').length}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Lessons</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Lessons</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons
                    .filter(lesson => {
                      if (filter === 'all') return true;
                      if (filter === 'in-progress') return lesson.status === 'in-progress';
                      if (filter === 'completed') return lesson.status === 'completed';
                      if (filter === 'not-started') return lesson.status === 'not-started';
                      return true;
                    })
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                          lesson.status === 'completed'
                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                            : lesson.status === 'not-started'
                            ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 rounded-lg ${
                                lesson.type === 'video' ? 'bg-blue-100' :
                                lesson.type === 'quiz' ? 'bg-purple-100' :
                                lesson.type === 'assignment' ? 'bg-orange-100' :
                                lesson.type === 'practice' ? 'bg-green-100' :
                                'bg-gray-100'
                              }`}>
                                {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                                {lesson.type === 'quiz' && <Target className="w-4 h-4 text-purple-600" />}
                                {lesson.type === 'assignment' && <Code className="w-4 h-4 text-orange-600" />}
                                {lesson.type === 'practice' && <FileText className="w-4 h-4 text-green-600" />}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                <p className="text-sm text-gray-600">{lesson.courseTitle}</p>
                              </div>
                            </div>
                            {lesson.prerequisites && (
                              <p className="text-sm text-gray-600 mb-3">{lesson.prerequisites}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{lesson.duration}</span>
                              </div>
                              {lesson.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {new Date(lesson.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-600">{lesson.progress}%</span>
                              </div>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    lesson.status === 'completed'
                                      ? 'bg-green-500'
                                      : lesson.status === 'not-started'
                                      ? 'bg-gray-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${lesson.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {lesson.status === 'completed' ? (
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              ) : lesson.status === 'not-started' ? (
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Clock className="w-5 h-5 text-gray-600" />
                                </div>
                              ) : (
                                <button 
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLessonClick(lesson);
                                  }}
                                >
                                  Continue
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CurrentLessons;
