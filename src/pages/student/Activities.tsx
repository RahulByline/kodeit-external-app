import React, { useState, useEffect } from 'react';
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
  LayoutDashboard
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
}

const Activities: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'points' | 'difficulty'>('dueDate');

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

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      
      try {
        console.log('🎯 Loading activities from Moodle API...');
        
        // Get user courses first
        const userCourses = await moodleService.getUserCourses(currentUser?.id || '1');
        const allActivities: ActivityItem[] = [];
        
        // Fetch activities from each course
        for (const course of userCourses) {
          try {
            console.log(`🔍 Fetching activities for course: ${course.fullname}`);
            
            // Get course activities from Moodle API
            const courseActivities = await moodleService.getCourseActivities(course.id);
            
            // Transform Moodle activities to our format
            const courseActivitiesList = courseActivities.map((activity: any) => ({
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
              participants: Math.floor(Math.random() * 50) + 10, // Mock participants count
              description: activity.description || 'No description available',
              tags: getActivityTags(activity.type, course.fullname),
              url: activity.url,
              fileUrl: activity.contents?.[0]?.fileurl,
              isRequired: activity.availabilityinfo ? true : false
            }));
            
            allActivities.push(...courseActivitiesList);
            
          } catch (courseError) {
            console.warn(`Failed to fetch activities for course ${course.fullname}:`, courseError);
          }
        }
        
        console.log(`✅ Loaded ${allActivities.length} activities from Moodle API`);
        setActivities(allActivities);
        
      } catch (error) {
        console.error('Error loading activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [currentUser?.id]);

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
              <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
              <p className="text-gray-600 mt-1">Explore and participate in various learning activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Activity className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {activities.filter(a => a.status === 'not-started' || a.status === 'in-progress').length}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activities.filter(a => a.status === 'completed').length}
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
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {activities.reduce((sum, a) => sum + a.points, 0)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Activities</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="points">Points</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Available Activities</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activities
                    .filter(activity => {
                      if (filter === 'all') return true;
                      if (filter === 'pending') return activity.status === 'not-started' || activity.status === 'in-progress';
                      if (filter === 'completed') return activity.status === 'completed';
                      if (filter === 'overdue') return activity.status === 'overdue';
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
                    })
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                          activity.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : activity.status === 'overdue'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 rounded-lg ${
                                activity.type === 'assignment' ? 'bg-blue-100' :
                                activity.type === 'quiz' ? 'bg-purple-100' :
                                activity.type === 'project' ? 'bg-green-100' :
                                activity.type === 'discussion' ? 'bg-orange-100' :
                                activity.type === 'challenge' ? 'bg-red-100' :
                                'bg-gray-100'
                              }`}>
                                {activity.type === 'assignment' && <FileText className="w-4 h-4 text-blue-600" />}
                                {activity.type === 'quiz' && <Target className="w-4 h-4 text-purple-600" />}
                                {activity.type === 'project' && <Code className="w-4 h-4 text-green-600" />}
                                {activity.type === 'discussion' && <Users className="w-4 h-4 text-orange-600" />}
                                {activity.type === 'challenge' && <Zap className="w-4 h-4 text-red-600" />}
                                {activity.type === 'workshop' && <Video className="w-4 h-4 text-gray-600" />}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                <p className="text-sm text-gray-600">{activity.courseTitle}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{activity.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Trophy className="w-4 h-4" />
                                <span>{activity.points} points</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{activity.participants} participants</span>
                              </div>
                              {activity.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {new Date(activity.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                activity.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                              </span>
                              {activity.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-700">Status</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {activity.status === 'completed' ? (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm">Completed</span>
                                  </div>
                                ) : activity.status === 'overdue' ? (
                                  <div className="flex items-center space-x-1 text-red-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Overdue</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Pending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {activity.status === 'completed' ? (
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              ) : activity.status === 'overdue' ? (
                                <div className="p-2 bg-red-100 rounded-lg">
                                  <Calendar className="w-5 h-5 text-red-600" />
                                </div>
                              ) : (
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                  Start
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

export default Activities;
