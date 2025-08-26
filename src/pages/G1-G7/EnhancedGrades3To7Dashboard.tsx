import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target,
  ChevronDown,
  Download,
  Share2,
  Loader2,
  Calendar,
  Clock,
  GraduationCap,
  Play,
  Code,
  Settings,
  Star,
  Heart,
  Smile,
  Trophy,
  Zap,
  Lightbulb,
  Brain,
  Rocket,
  Gamepad2,
  Palette,
  Music,
  Camera,
  Video,
  MessageSquare,
  Users,
  Bookmark,
  CheckCircle,
  Circle,
  ArrowRight,
  Sparkles,
  Home,
  Monitor,
  HelpCircle,
  Flame,
  Eye,
  TreePine,
  Route
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';

// Import student pages
import Courses from '../student/Courses';
import Assignments from '../student/Assignments';
import Assessments from '../student/Assessments';
import Community from '../student/Community';
import Enrollments from '../student/Enrollments';
import Grades from '../student/Grades';
import ProgressPage from '../student/Progress';
import CalendarPage from '../student/Calendar';
import Messages from '../student/Messages';
import SettingsPage from '../student/Settings';
import ScratchCodeEditor from '../student/ScratchCodeEditor';
import Compiler from '../student/Compiler';
import BlockyPage from '../student/BlockyPage';
import CourseManagement from '../student/CourseManagement';
import CompetenciesMap from '../student/CompetenciesMap';
import Emulators from '../student/Emulators';

interface Stats {
  enrolledCourses: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageGrade: number;
  totalPoints: number;
  weeklyGoal: number;
  weeklyGoalCompleted: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  completedLessons: number;
  totalLessons: number;
  duration: string;
  image: string;
}

interface QuickTool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  path?: string;
  action?: () => void;
}

const EnhancedGrades3To7Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [viewMode, setViewMode] = useState<'card' | 'tree' | 'journey'>('card');
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    totalPoints: 0,
    weeklyGoal: 5,
    weeklyGoalCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  // Sample course data matching the demo
  const sampleCourses: Course[] = [
    {
      id: '1',
      title: 'Computer Basics & Digital Literacy',
      description: 'Learn fundamental computer skills, internet safety, and digital citizenship for the modern world.',
      difficulty: 'Beginner',
      progress: 75,
      completedLessons: 9,
      totalLessons: 12,
      duration: '4 weeks',
      image: '/card1.webp'
    },
    {
      id: '2',
      title: 'Web Development Fundamentals',
      description: 'Master HTML, CSS, and JavaScript basics to create your first websites and web applications.',
      difficulty: 'Intermediate',
      progress: 45,
      completedLessons: 7,
      totalLessons: 16,
      duration: '6 weeks',
      image: '/card2.webp'
    },
    {
      id: '3',
      title: 'Programming Logic & Problem Solving',
      description: 'Develop critical thinking skills through coding challenges and algorithmic problem solving.',
      difficulty: 'Intermediate',
      progress: 20,
      completedLessons: 4,
      totalLessons: 20,
      duration: '8 weeks',
      image: '/card3.webp'
    }
  ];

  const quickTools: QuickTool[] = [
    {
      id: 'code-emulators',
      title: 'Code Emulators',
      description: 'Practice coding in virtual environments',
      icon: Monitor,
      color: 'bg-purple-500',
      path: '/dashboard/student/emulators'
    },
    {
      id: 'e-books',
      title: 'E-books',
      description: 'Access digital learning materials',
      icon: BookOpen,
      color: 'bg-blue-500',
      path: '/dashboard/student/courses'
    },
    {
      id: 'ask-teacher',
      title: 'Ask Teacher',
      description: 'Get help from your instructor',
      icon: HelpCircle,
      color: 'bg-green-500',
      path: '/dashboard/student/messages'
    },
    {
      id: 'ai-buddy',
      title: 'KODEIT AI Buddy',
      description: 'Get instant coding help',
      icon: Brain,
      color: 'bg-yellow-500',
      path: '/dashboard/student/ai-buddy'
    },
    {
      id: 'study-streak',
      title: 'Study Streak',
      description: '5 days in a row! Keep it up! 🔥',
      icon: Flame,
      color: 'bg-green-500'
    }
  ];

  useEffect(() => {
    fetchStudentData();
    
    // Listen for section changes
    const handleSectionChange = (event: CustomEvent) => {
      setCurrentSection(event.detail.section);
    };
    window.addEventListener('sectionChange', handleSectionChange as EventListener);
    
    return () => {
      window.removeEventListener('sectionChange', handleSectionChange as EventListener);
    };
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      const [allCourses, courseEnrollments, courseCompletion, userActivity] = await Promise.all([
        moodleService.getAllCourses(),
        moodleService.getCourseEnrollments(),
        moodleService.getCourseCompletionStats(),
        moodleService.getUserActivityData()
      ]);

      const enrolledCount = courseEnrollments?.length || 3;
      const completedCount = courseCompletion?.completedCourses || 1;
      const pendingCount = Math.max(0, enrolledCount - completedCount) || 2;
      const avgGrade = userActivity?.averageGrade || 85;
      const totalPoints = userActivity?.totalPoints || 470;
      const weeklyGoalCompleted = userActivity?.weeklyGoalCompleted || 3;

      setStats({
        enrolledCourses: enrolledCount,
        completedAssignments: completedCount,
        pendingAssignments: pendingCount,
        averageGrade: avgGrade,
        totalPoints: totalPoints,
        weeklyGoal: 5,
        weeklyGoalCompleted: weeklyGoalCompleted
      });

      // Set sample courses for now
      setCourses(sampleCourses);
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Use fallback data
      setStats({
        enrolledCourses: 3,
        completedAssignments: 1,
        pendingAssignments: 2,
        averageGrade: 85,
        totalPoints: 470,
        weeklyGoal: 5,
        weeklyGoalCompleted: 3
      });
      setCourses(sampleCourses);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderMainDashboard();
      case 'courses':
        return <Courses />;
      case 'assignments':
        return <Assignments />;
      case 'assessments':
        return <Assessments />;
      case 'community':
        return <Community />;
      case 'enrollments':
        return <Enrollments />;
      case 'grades':
        return <Grades />;
      case 'progress':
        return <ProgressPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'messages':
        return <Messages />;
      case 'scratch-editor':
        return <ScratchCodeEditor isEnhancedDashboard={true} />;
      case 'code-editor':
        return <ScratchCodeEditor isEnhancedDashboard={true} />;
      case 'compiler':
        return <Compiler />;
      case 'blocky':
        return <BlockyPage />;
      case 'course-management':
        return <CourseManagement />;
      case 'competencies':
        return <CompetenciesMap />;
      case 'emulators':
        return <Emulators />;
      case 'settings':
        return <SettingsPage isEnhancedDashboard={true} />;
      default:
        return renderMainDashboard();
    }
  };

  const renderMainDashboard = () => (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCurrentSection('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSection === 'dashboard'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentSection('courses')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSection === 'courses'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setCurrentSection('assignments')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSection === 'assignments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Current Lessons
          </button>
          <button
            onClick={() => setCurrentSection('assessments')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSection === 'assessments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activities
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'card'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'tree'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setViewMode('journey')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'journey'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Journey View
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Courses</p>
                <p className="text-2xl font-bold text-blue-800">{stats.enrolledCourses}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Lessons Done</p>
                <p className="text-2xl font-bold text-green-800">{stats.completedAssignments}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Total Points</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.totalPoints}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Weekly Goal</p>
                <p className="text-2xl font-bold text-purple-800">{stats.weeklyGoalCompleted}/{stats.weeklyGoal}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Courses Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <BookOpen className="w-16 h-16 text-blue-600 hidden" />
                </div>
                <Badge 
                  className={`absolute top-3 right-3 ${
                    course.difficulty === 'Beginner' ? 'bg-green-500' :
                    course.difficulty === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                >
                  {course.difficulty}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{course.completedLessons}/{course.totalLessons} lessons</span>
                  <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                </div>
                
                <Progress value={course.progress} className="mb-3" />
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{course.duration}</span>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Navigation Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          &lt;/&gt; NAVIGATION
        </h3>
      </div>

      {/* Primary Navigation */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => setCurrentSection('dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentSection === 'dashboard'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentSection('courses')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentSection === 'courses'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>My Courses</span>
        </button>

        <button
          onClick={() => setCurrentSection('assignments')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentSection === 'assignments'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Play className="w-5 h-5" />
          <span>Current Lessons</span>
        </button>

        <button
          onClick={() => setCurrentSection('assessments')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentSection === 'assessments'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Activities</span>
        </button>

        <button
          onClick={() => setCurrentSection('grades')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentSection === 'grades'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Achievements</span>
        </button>

        <button
          onClick={() => setCurrentSection('calendar')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentSection === 'calendar'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Schedule</span>
        </button>
      </div>

      {/* Quick Tools Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          QUICK TOOLS
        </h3>
        <div className="space-y-3">
          {quickTools.map((tool) => (
            <div
              key={tool.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                tool.color === 'bg-purple-500' ? 'bg-purple-100' :
                tool.color === 'bg-blue-500' ? 'bg-blue-100' :
                tool.color === 'bg-green-500' ? 'bg-green-100' :
                tool.color === 'bg-yellow-500' ? 'bg-yellow-100' : 'bg-gray-100'
              }`}
              onClick={() => {
                if (tool.path) {
                  setCurrentSection(tool.path.split('/').pop() || 'dashboard');
                } else if (tool.action) {
                  tool.action();
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.color} text-white`}>
                  <tool.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tool.title}</p>
                  <p className="text-xs text-gray-600">{tool.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser?.fullname || 'Student'}!</span>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            renderCurrentSection()
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedGrades3To7Dashboard;
