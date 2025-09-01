import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  FileText,
  Video,
  Code,
  MessageSquare,
  Users,
  ExternalLink,
  Award,
  Target,
  TrendingUp,
  Star,
  Zap,
  ChevronRight,
  X,
  BookOpen,
  BarChart3,
  Activity,
  Lock,
  Info,
  Circle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'quiz' | 'resource' | 'forum' | 'video' | 'workshop' | 'url' | 'page';
  status: 'completed' | 'in_progress' | 'not_started' | 'locked';
  points?: number;
  duration?: string;
  dueDate?: number;
  grade?: number;
  maxGrade?: number;
  url?: string;
  content?: string;
  prerequisites?: string[];
  image?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'locked';
  progress: number;
  duration: string;
  prerequisites?: string;
  image?: string;
}

interface Course {
  id: string;
  fullname: string;
  shortname: string;
  summary?: string;
  categoryid: number;
  courseimage?: string;
  progress: number;
  categoryname?: string;
  format?: string;
  startdate: number;
  enddate?: number;
  visible: number;
  type?: string;
  tags?: string[];
  lastaccess?: number;
}

const LessonActivitiesJourney: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State management
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !lessonId) return;

      try {
        setLoading(true);
        
        // Load course data
        const courses = await moodleService.getUserCourses(currentUser?.id || '');
        const foundCourse = courses.find((c: Course) => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
        }

        // Load lesson and activities data
        const courseContents = await moodleService.getCourseContents(courseId);
        
        // Find the specific lesson
        let foundLesson: Lesson | null = null;
        const lessonActivities: Activity[] = [];
        
        courseContents.forEach((section: any, sectionIndex: number) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any, moduleIndex: number) => {
              if (module.id.toString() === lessonId) {
                foundLesson = {
                  id: module.id.toString(),
                  title: module.name || `Lesson ${moduleIndex + 1}`,
                  description: module.description || `Description for ${module.name}`,
                  courseId: courseId,
                  courseTitle: foundCourse?.fullname || 'Course',
                  status: module.completionstatus === 2 ? 'completed' : 
                         module.completionstatus === 1 ? 'in_progress' : 'not_started',
                  progress: module.completionstatus === 2 ? 100 : 
                          module.completionstatus === 1 ? 50 : 0,
                  duration: `${Math.floor(Math.random() * 30) + 15} min`,
                  prerequisites: Math.random() > 0.7 ? 'Previous lesson completion required' : undefined,
                  image: '/card1.webp'
                };

                // Create sample activities for this lesson
                const activityTypes: Activity['type'][] = ['assignment', 'quiz', 'video', 'resource', 'forum'];
                const statuses: Activity['status'][] = ['completed', 'in_progress', 'not_started', 'locked'];
                const activityTitles = [
                  'Digital Footprint Quiz',
                  'Online Safety Video', 
                  'Create a Digital Citizenship Poster',
                  'Hardware Components Lab',
                  'Build a Virtual Computer',
                  'Algorithm Design Challenge',
                  'Build Your Portfolio'
                ];
                
                for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
                  lessonActivities.push({
                    id: `${module.id}_activity_${i}`,
                    title: activityTitles[i] || `Activity ${i + 1}`,
                    description: `Complete this activity to reinforce your learning.`,
                    type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    points: Math.floor(Math.random() * 100) + 25,
                    duration: `${Math.floor(Math.random() * 45) + 15} min`,
                    dueDate: Date.now() + (Math.random() * 7 * 24 * 60 * 60 * 1000),
                    grade: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 60 : undefined,
                    maxGrade: 100,
                    url: '#',
                    content: 'Activity content will be displayed here.',
                    prerequisites: Math.random() > 0.8 ? ['Previous activity completion'] : undefined,
                    image: '/card1.webp'
                  });
                }
              }
            });
          }
        });
        
        if (foundLesson) {
          setLesson(foundLesson);
          setActivities(lessonActivities);
        } else {
          setError('Lesson not found');
        }
        
      } catch (error) {
        console.error('Error loading lesson data:', error);
        setError('Failed to load lesson data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, lessonId]);

  // Navigation handlers
  const handleBackToLessons = () => {
    navigate(`/dashboard/student/course-lessons/${courseId}`);
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white';
      case 'not_started': return 'bg-white border-2 border-gray-300 text-gray-400';
      case 'locked': return 'bg-gray-400 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Star className="w-4 h-4" />;
      case 'not_started': return <Star className="w-4 h-4" />;
      case 'locked': return <Lock className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'quiz': return <BarChart3 className="w-4 h-4" />;
      case 'resource': return <BookOpen className="w-4 h-4" />;
      case 'forum': return <Users className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'workshop': return <Activity className="w-4 h-4" />;
      case 'url': return <ExternalLink className="w-4 h-4" />;
      case 'page': return <FileText className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'assignment': return 'Assignment';
      case 'quiz': return 'Quiz';
      case 'resource': return 'Resource';
      case 'forum': return 'Forum';
      case 'video': return 'Video';
      case 'workshop': return 'Workshop';
      case 'url': return 'URL';
      case 'page': return 'Page';
      default: return 'Activity';
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
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
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Back Button */}
          <button
            onClick={handleBackToLessons}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Lessons</span>
          </button>

          {/* Lesson Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lesson</p>
                    <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                  </div>
                </div>
                <p className="text-gray-600 text-lg mb-4">{lesson.description}</p>
                
                {/* Lesson Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Activities</p>
                      <p className="text-2xl font-bold text-gray-900">{completedActivities}/{totalActivities}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-2xl font-bold text-gray-900">{lesson.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="text-2xl font-bold text-gray-900">{activities.reduce((sum, activity) => sum + (activity.points || 0), 0)}</p>
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
            </div>
          </div>

          {/* Learning Journey Section - Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Learning Journey</h2>
                <p className="text-gray-600 text-sm">Track your progress through activities in this lesson.</p>
              </div>
              
              {/* View Options */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-md">
                  Card View
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-md">
                  Tree View
                </button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                  Journey View
                </button>
              </div>
            </div>

            {/* Learning Path Container */}
            <div className="relative">
              {/* Horizontal Scrolling Container */}
              <div className="overflow-x-auto pb-4">
                <div className="flex items-center space-x-8 min-w-max px-4">
                  {/* Learning Path Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2 z-0"></div>
                  
                  {/* Learning Nodes - Activities */}
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="relative z-10">
                      <div 
                        className={`w-16 h-16 ${getStatusColor(activity.status)} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200`}
                        onClick={() => handleActivityClick(activity)}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-xs font-medium text-gray-900 mb-1">
                          {activity.title.length > 20 ? activity.title.substring(0, 20) + '...' : activity.title}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          {getActivityTypeLabel(activity.type)}
                        </div>
                        {activity.points && (
                          <div className="text-xs text-green-600">
                            {activity.points} pts
                          </div>
                        )}
                        {activity.status === 'in_progress' && (
                          <div className="flex items-center justify-center mt-1">
                            <Info className="w-3 h-3 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap items-center justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Upcoming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-700">Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {activities.length === 0 && (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                  {selectedActivity.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h2>
                <p className="text-gray-600 text-lg">{lesson.title}</p>
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
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="font-semibold text-gray-900">{selectedActivity.points || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700">{selectedActivity.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {selectedActivity.status === 'completed' ? (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <CheckCircle className="w-5 h-5" />
                    <span>Review Activity</span>
                  </button>
                ) : selectedActivity.status === 'in_progress' ? (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5" />
                    <span>Continue Activity</span>
                  </button>
                ) : selectedActivity.status === 'locked' ? (
                  <button className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Activity Locked</span>
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

export default LessonActivitiesJourney;
