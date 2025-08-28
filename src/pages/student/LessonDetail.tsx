import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  ArrowLeft,
  Download,
  ExternalLink,
  Eye,
  MessageSquare,
  Users,
  Star,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Zap,
  Lightbulb,
  Brain,
  Rocket
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

interface LessonContent {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'forum' | 'url' | 'file';
  description?: string;
  url?: string;
  fileUrl?: string;
  duration?: string;
  isCompleted: boolean;
  isRequired: boolean;
  order: number;
}

const LessonDetail: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleContentClick = (content: LessonContent) => {
    console.log('🎯 Content clicked:', content.title);
    
    if (content.url) {
      // Open external URL
      window.open(content.url, '_blank');
    } else if (content.fileUrl) {
      // Download or open file
      window.open(content.fileUrl, '_blank');
    } else {
      // Handle different content types
      switch (content.type) {
        case 'video':
          // Open video player
          console.log('Opening video:', content.title);
          break;
        case 'quiz':
          // Navigate to quiz
          navigate(`/dashboard/student/quiz/${content.id}`);
          break;
        case 'assignment':
          // Navigate to assignment
          navigate(`/dashboard/student/assignment/${content.id}`);
          break;
        default:
          console.log('Content type not handled:', content.type);
      }
    }
  };

  useEffect(() => {
    const loadLessonDetail = async () => {
      setLoading(true);
      
      try {
        // Get lesson and course data from route state or localStorage
        let lessonData: Lesson | null = null;
        let courseData: Course | null = null;
        
        if (location.state?.selectedLesson) {
          lessonData = location.state.selectedLesson;
          courseData = location.state.selectedCourse;
        } else {
          // Try to get from localStorage
          const storedLesson = localStorage.getItem('selectedLesson');
          const storedCourse = localStorage.getItem('selectedCourse');
          
          if (storedLesson) {
            lessonData = JSON.parse(storedLesson);
          }
          if (storedCourse) {
            courseData = JSON.parse(storedCourse);
          }
        }
        
        if (!lessonData || !courseData) {
          console.warn('No lesson data found, redirecting to dashboard');
          navigate('/dashboard/student');
          return;
        }
        
        setLesson(lessonData);
        setCourse(courseData);
        
        console.log('📚 Loading lesson content for:', lessonData.title);
        
        // Fetch lesson content from Moodle API
        const courseContents = await moodleService.getCourseContents(courseData.id);
        
        // Find the specific lesson/activity in the course contents
        let lessonModule = null;
        for (const section of courseContents) {
          if (section.modules && Array.isArray(section.modules)) {
            lessonModule = section.modules.find((module: any) => module.id.toString() === lessonId);
            if (lessonModule) break;
          }
        }
        
        if (lessonModule) {
          // Transform lesson content based on module type
          const content: LessonContent[] = [];
          
          // Add the main lesson content
          content.push({
            id: lessonModule.id.toString(),
            title: lessonModule.name,
            type: mapModuleType(lessonModule.modname),
            description: lessonModule.description || '',
            url: lessonModule.url,
            fileUrl: lessonModule.contents?.[0]?.fileurl,
            duration: getModuleDuration(lessonModule.modname),
            isCompleted: lessonData.status === 'completed',
            isRequired: true,
            order: 1
          });
          
          // Add additional content if available
          if (lessonModule.contents && Array.isArray(lessonModule.contents)) {
            lessonModule.contents.forEach((item: any, index: number) => {
              if (index > 0) { // Skip first item as it's the main content
                content.push({
                  id: `${lessonModule.id}-${index}`,
                  title: item.filename || `Additional Content ${index}`,
                  type: 'file',
                  description: item.filepath || '',
                  fileUrl: item.fileurl,
                  isCompleted: false,
                  isRequired: false,
                  order: index + 1
                });
              }
            });
          }
          
          setLessonContent(content);
          console.log(`✅ Loaded ${content.length} content items for lesson: ${lessonData.title}`);
        } else {
          console.warn('Lesson module not found in course contents');
          setLessonContent([]);
        }
        
      } catch (error) {
        console.error('Error loading lesson detail:', error);
        setLessonContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadLessonDetail();
  }, [lessonId, location.state, navigate]);

  // Helper functions
  const mapModuleType = (modname: string): 'video' | 'document' | 'quiz' | 'assignment' | 'forum' | 'url' | 'file' => {
    const typeMap: { [key: string]: 'video' | 'document' | 'quiz' | 'assignment' | 'forum' | 'url' | 'file' } = {
      'assign': 'assignment',
      'quiz': 'quiz',
      'resource': 'document',
      'url': 'url',
      'forum': 'forum',
      'workshop': 'assignment',
      'scorm': 'video',
      'lti': 'url'
    };
    return typeMap[modname] || 'file';
  };

  const getModuleDuration = (modname: string): string => {
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
    return durations[modname] || '30 min';
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'assignment': return <Code className="w-5 h-5" />;
      case 'forum': return <MessageSquare className="w-5 h-5" />;
      case 'url': return <ExternalLink className="w-5 h-5" />;
      case 'file': return <Download className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-blue-600 bg-blue-100';
      case 'document': return 'text-green-600 bg-green-100';
      case 'quiz': return 'text-purple-600 bg-purple-100';
      case 'assignment': return 'text-orange-600 bg-orange-100';
      case 'forum': return 'text-indigo-600 bg-indigo-100';
      case 'url': return 'text-cyan-600 bg-cyan-100';
      case 'file': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading lesson content...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson || !course) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lesson Not Found</h2>
            <p className="text-gray-600 mb-4">The lesson you're looking for could not be found.</p>
            <button
              onClick={() => navigate('/dashboard/student')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/student/current-lessons')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Lessons</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-gray-600">
                  Course: <span className="font-semibold text-blue-600">{course.title}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Duration: {lesson.duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>Type: {lesson.type}</span>
              </div>
            </div>
          </div>

          {/* Lesson Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lesson Progress</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold text-gray-900">{lesson.progress}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  lesson.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${lesson.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">
                Status: <span className="font-medium">{lesson.status.replace('-', ' ')}</span>
              </span>
              {lesson.dueDate && (
                <span className="text-sm text-gray-600">
                  Due: {new Date(lesson.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lesson Content</h2>
              <p className="text-gray-600 mt-1">Click on any item to open or view the content</p>
            </div>
            
            <div className="p-6">
              {lessonContent.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
                  <p className="text-gray-600">This lesson doesn't have any content yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessonContent.map((content) => (
                    <div
                      key={content.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleContentClick(content)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${getContentColor(content.type)}`}>
                            {getContentIcon(content.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{content.title}</h3>
                            {content.description && (
                              <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2">
                              {content.duration && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{content.duration}</span>
                                </div>
                              )}
                              {content.isRequired && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {content.isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lesson Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Actions</h2>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Play className="w-4 h-4" />
                <span>Start Lesson</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Bookmark className="w-4 h-4" />
                <span>Bookmark</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonDetail;
