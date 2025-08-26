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
  Sparkles
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Import student pages
import Courses from './student/Courses';
import Assignments from './student/Assignments';
import Assessments from './student/Assessments';
import Community from './student/Community';
import Enrollments from './student/Enrollments';
import Grades from './student/Grades';
import Progress from './student/Progress';
import CalendarPage from './student/Calendar';
import Messages from './student/Messages';
import SettingsPage from './student/Settings';
import ScratchCodeEditor from './student/ScratchCodeEditor';
import Compiler from './student/Compiler';
import BlockyPage from './student/BlockyPage';
import CourseManagement from './student/CourseManagement';
import CompetenciesMap from './student/CompetenciesMap';
import Emulators from './student/Emulators';

interface Stats {
  enrolledCourses: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageGrade: number;
}

interface CourseProgress {
  subject: string;
  progress: number;
}

const Grades4To7Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);

  const courseProgress: CourseProgress[] = [
    { subject: 'Mathematics', progress: 85 },
    { subject: 'Physics', progress: 72 },
    { subject: 'Chemistry', progress: 78 },
    { subject: 'Biology', progress: 91 }
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

      const enrolledCount = courseEnrollments?.length || 6;
      const completedCount = courseCompletion?.completedCourses || 15;
      const pendingCount = Math.max(0, enrolledCount - completedCount) || 4;
      const avgGrade = userActivity?.averageGrade || 88;

      setStats({
        enrolledCourses: enrolledCount,
        completedAssignments: completedCount,
        pendingAssignments: pendingCount,
        averageGrade: avgGrade
      });
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Use fallback data
      setStats({
        enrolledCourses: 6,
        completedAssignments: 15,
        pendingAssignments: 4,
        averageGrade: 88
      });
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
        return <Progress />;
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          <Brain className="inline w-8 h-8 mr-2" />
          Welcome to Your Learning Hub!
        </h1>
        <p className="text-lg text-blue-600">
          Hello {currentUser?.firstname || "Student"}! Ready to explore and achieve? 📚
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
          <div className="text-sm">Active Courses</div>
          <BookOpen className="w-6 h-6 mx-auto mt-2" />
        </div>
        
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.completedAssignments}</div>
          <div className="text-sm">Assignments Done</div>
          <CheckCircle className="w-6 h-6 mx-auto mt-2" />
        </div>
        
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
          <div className="text-sm">Pending Tasks</div>
          <Clock className="w-6 h-6 mx-auto mt-2" />
        </div>
        
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.averageGrade}%</div>
          <div className="text-sm">Average Grade</div>
          <Trophy className="w-6 h-6 mx-auto mt-2" />
        </div>
      </div>

      {/* Learning Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'scratch-editor' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Scratch Programming</h3>
              <p className="text-blue-100">Create interactive stories, games, and animations</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'code-editor' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <Code className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Code Editor</h3>
              <p className="text-green-100">Write and run code in multiple programming languages</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'courses' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">My Courses</h3>
              <p className="text-orange-100">Access all your enrolled courses and materials</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'assignments' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Assignments</h3>
              <p className="text-purple-100">View and submit your assignments</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'grades' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">My Grades</h3>
              <p className="text-indigo-100">Track your academic performance</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'messages' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-teal-500 to-green-600 rounded-xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Messages</h3>
              <p className="text-teal-100">Communicate with teachers and classmates</p>
            </div>
          </div>
        </button>
      </div>

      {/* Course Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Course Progress
        </h2>
        
        <div className="space-y-4">
          {courseProgress.map((course, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-blue-700 font-medium w-24">{course.subject}</span>
              <div className="flex-1 bg-blue-200 rounded-full h-3 mx-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300" 
                  style={{width: `${course.progress}%`}}
                ></div>
              </div>
              <span className="text-blue-700 font-bold w-12 text-right">{course.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Clock className="w-6 h-6 mr-2" />
          Recent Activities
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Completed Math Assignment #5</span>
            </div>
            <span className="text-green-600 text-sm">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Started Physics Chapter 3</span>
            </div>
            <span className="text-blue-600 text-sm">5 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800">Received 95% on Chemistry Quiz</span>
            </div>
            <span className="text-yellow-600 text-sm">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      userRole="student" 
      userName={currentUser?.fullname || "Student"}
      currentDashboard="grades4-7"
      onDashboardChange={() => {}}
    >
      {renderCurrentSection()}
    </DashboardLayout>
  );
};

export default Grades4To7Dashboard;
