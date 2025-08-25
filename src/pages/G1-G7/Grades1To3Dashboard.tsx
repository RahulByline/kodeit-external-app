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
  Rainbow,
  Sun,
  Moon,
  Cloud
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

const Grades1To3Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);

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

      const enrolledCount = courseEnrollments?.length || 5;
      const completedCount = courseCompletion?.completedCourses || 12;
      const pendingCount = Math.max(0, enrolledCount - completedCount) || 3;
      const avgGrade = userActivity?.averageGrade || 85;

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
        enrolledCourses: 5,
        completedAssignments: 12,
        pendingAssignments: 3,
        averageGrade: 85
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
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          <Sparkles className="inline w-8 h-8 mr-2" />
          Welcome to Your Learning Adventure!
        </h1>
        <p className="text-lg text-purple-500">
          Hello {currentUser?.firstname || "Friend"}! Ready to learn and have fun? 🌟
        </p>
      </div>

      {/* Fun Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
          <div className="text-sm">Fun Courses</div>
          <BookOpen className="w-6 h-6 mx-auto mt-2" />
        </div>
        
        <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.completedAssignments}</div>
          <div className="text-sm">Completed Tasks</div>
          <CheckCircle className="w-6 h-6 mx-auto mt-2" />
        </div>
        
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
          <div className="text-sm">New Adventures</div>
          <Star className="w-6 h-6 mx-auto mt-2" />
        </div>
        
        <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl font-bold">{stats.averageGrade}%</div>
          <div className="text-sm">Super Score</div>
          <Trophy className="w-6 h-6 mx-auto mt-2" />
        </div>
      </div>

      {/* Fun Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'scratch-editor' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <Gamepad2 className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Create Games</h3>
              <p className="text-blue-100">Make your own fun games with Scratch!</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'code-editor' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <Code className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Learn Coding</h3>
              <p className="text-green-100">Write cool programs and see magic happen!</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'courses' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">My Fun Courses</h3>
              <p className="text-orange-100">Explore all your exciting classes!</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'assignments' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Fun Tasks</h3>
              <p className="text-purple-100">Complete awesome assignments!</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'grades' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">My Super Scores</h3>
              <p className="text-indigo-100">See how awesome you're doing!</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: 'messages' } }));
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-teal-400 to-green-500 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Chat with Friends</h3>
              <p className="text-teal-100">Talk to your classmates and teachers!</p>
            </div>
          </div>
        </button>
      </div>

      {/* Fun Learning Progress */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
          <Rainbow className="w-6 h-6 mr-2" />
          Your Learning Rainbow
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-700 font-medium">Reading Adventures</span>
            <div className="flex-1 bg-purple-200 rounded-full h-3 mx-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{width: '85%'}}></div>
            </div>
            <span className="text-purple-700 font-bold">85%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-purple-700 font-medium">Math Fun</span>
            <div className="flex-1 bg-purple-200 rounded-full h-3 mx-4">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full" style={{width: '72%'}}></div>
            </div>
            <span className="text-purple-700 font-bold">72%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-purple-700 font-medium">Science Explorations</span>
            <div className="flex-1 bg-purple-200 rounded-full h-3 mx-4">
              <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full" style={{width: '91%'}}></div>
            </div>
            <span className="text-purple-700 font-bold">91%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      userRole="student" 
      userName={currentUser?.fullname || "Student"}
      currentDashboard="grades1-3"
      onDashboardChange={() => {}}
    >
      {renderCurrentSection()}
    </DashboardLayout>
  );
};

export default Grades1To3Dashboard;
