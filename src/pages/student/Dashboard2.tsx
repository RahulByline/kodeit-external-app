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
  Search,
  Bell,
  User,
  MessageSquare,
  Trophy,
  Star,
  Flame,
  Coins,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Play as PlayIcon,
  Info,
  Building,
  ShoppingCart,
  Calendar as CalendarIcon,
  ArrowRight,
  Dot
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface Stats {
  enrolledCourses: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageGrade: number;
}

interface Exam {
  id: string;
  title: string;
  schedule: string;
  daysLeft: number;
  isNew: boolean;
}

interface ScheduleEvent {
  date: string;
  day: string;
  hasActivity: boolean;
  isDisabled: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  type: 'learning' | 'practice';
  duration: string;
  progress: number;
  total: number;
}

const Dashboard2: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);
  const [weeklyGoalProgress, setWeeklyGoalProgress] = useState(1);
  const [showAnimations, setShowAnimations] = useState(false);

  const upcomingExams: Exam[] = [
    {
      id: '1',
      title: 'Build Your Own Responsive Website Course Exam',
      schedule: 'Tue, 26th Aug - 06:55pm - 08:35pm',
      daysLeft: 4,
      isNew: true
    }
  ];

  const scheduleEvents: ScheduleEvent[] = [
    { date: '20', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '21', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '22', day: 'SAT', hasActivity: true, isDisabled: false },
    { date: '23', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '24', day: 'MON', hasActivity: false, isDisabled: true },
    { date: '25', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '26', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '27', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '28', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '29', day: 'SAT', hasActivity: true, isDisabled: false },
    { date: '30', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '1', day: 'MON', hasActivity: true, isDisabled: false },
    { date: '2', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '3', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '4', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '5', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '7', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '8', day: 'MON', hasActivity: true, isDisabled: false },
    { date: '9', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '10', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '11', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '12', day: 'FRI', hasActivity: true, isDisabled: false }
  ];

  const learningModules: LearningModule[] = [
    { id: '1', title: 'HTML (2/8)', type: 'learning', duration: '30 Mins', progress: 2, total: 8 },
    { id: '2', title: 'HTML Elements', type: 'learning', duration: '30 Mins', progress: 0, total: 1 },
    { id: '3', title: 'MCQ Practice 2', type: 'practice', duration: '20 Mins', progress: 0, total: 1 },
    { id: '4', title: 'HTML Attributes And General', type: 'learning', duration: '15 Mins', progress: 0, total: 1 }
  ];

  useEffect(() => {
    fetchStudentData();
    
    const interval = setInterval(() => {
      fetchStudentData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setShowAnimations(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching student data from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      const [allCourses, courseEnrollments, courseCompletion, userActivity] = await Promise.all([
        moodleService.getAllCourses(),
        moodleService.getCourseEnrollments(),
        moodleService.getCourseCompletionStats(),
        moodleService.getUserActivityData(currentUser?.id)
      ]);

      const enrolledCourses = allCourses.filter(course => 
        course.visible !== 0 && course.categoryid && course.categoryid > 0
      );
      
      const studentEnrollments = courseEnrollments.filter(enrollment => 
        enrolledCourses.some(course => course.id === enrollment.courseId)
      );
      
      const totalAssignments = studentEnrollments.reduce((sum, enrollment) => {
        return sum + Math.floor(enrollment.totalEnrolled * 0.3);
      }, 0);
      
      const completedAssignments = studentEnrollments.reduce((sum, enrollment) => {
        return sum + enrollment.completedStudents;
      }, 0);
      const pendingAssignments = Math.max(totalAssignments - completedAssignments, 0);
      
      const totalGrade = studentEnrollments.reduce((sum, enrollment) => sum + enrollment.averageGrade, 0);
      const averageGrade = studentEnrollments.length > 0 ? Math.round(totalGrade / studentEnrollments.length) : 85;

      setStats({
        enrolledCourses: enrolledCourses.length,
        completedAssignments,
        pendingAssignments,
        averageGrade
      });

    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateString = () => {
    return currentDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
            <span className="text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchStudentData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className='bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-100'>
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        {/* <div className="min-h-screen py-4"> */}
          <div className=" mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Upcoming Exams Section */}
                <div className={`transition-all duration-700 ${showAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Exams</h2>
                  <div className="space-y-4">
                    {upcomingExams.map((exam, index) => (
                      <div 
                        key={exam.id}
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-500 hover:shadow-lg ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {exam.isNew && (
                                <button className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors">
                                  New Attempt
                                </button>
                              )}
                              <Building className="w-5 h-5 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{exam.schedule}</p>
                            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                              <CalendarIcon className="w-4 h-4" />
                              <span className="text-sm">Add to Calendar</span>
                            </button>
                          </div>
                          <div className="flex flex-col items-end space-y-3">
                            <Link to="/exams" className="text-blue-600 hover:text-blue-700 text-sm">
                              All Course Exams →
                            </Link>
                            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                              Attempt →
                            </button>
                            <span className="text-green-600 text-sm font-medium">{exam.daysLeft} Day to go!</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>

              {/* Your Schedule Section */}
              <div className={`transition-all duration-700 delay-300 ${showAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center space-x-2 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Your Schedule</h2>
                  <Info className="w-5 h-5 text-purple-500" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-gray-600 mb-4">{getCurrentDateString()}</p>
                  
                  {/* Calendar Strip */}
                  <div className="relative mb-4">
                    <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="flex space-x-2 px-8 overflow-x-auto">
                      {scheduleEvents.map((event, index) => (
                        <div key={index} className="flex flex-col items-center min-w-[40px]">
                          <span className="text-xs text-gray-500 mb-1">{event.day}</span>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                            event.isDisabled 
                              ? 'bg-gray-100 text-gray-400' 
                              : event.hasActivity 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                            {event.date}
                          </div>
                          {event.hasActivity && !event.isDisabled && (
                            <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                    <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Information Banner */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      Learning content of next Growth Cycle will unlock once you complete all the{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline">assignments</a>
                      {' '}in the current Growth Cycle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Frontend Interview Kit Section */}
              <div className={`transition-all duration-700 delay-500 ${showAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                  <div className="mb-6">
                    <p className="text-sm opacity-90 mb-1">FRONTEND DEVELOPER</p>
                    <h2 className="text-2xl font-bold">Frontend Interview Kit</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {learningModules.map((module, index) => (
                      <div 
                        key={module.id}
                        className={`flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/20 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                        style={{ animationDelay: `${(index + 1) * 200}ms` }}
                      >
                        <div className="flex items-center space-x-3">
                          {module.title.includes('(') ? (
                            <div className="relative">
                              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">{module.progress}/{module.total}</span>
                              </div>
                              <div 
                                className="absolute inset-0 border-2 border-green-400 rounded-full"
                                style={{ 
                                  clipPath: `polygon(0 0, ${(module.progress / module.total) * 100}% 0, ${(module.progress / module.total) * 100}% 100%, 0 100%)`
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${module.type === 'learning' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                          )}
                          <div>
                            <h3 className="font-medium">{module.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                module.type === 'learning' 
                                  ? 'bg-green-400/20 text-green-200' 
                                  : 'bg-orange-400/20 text-orange-200'
                              }`}>
                                {module.type.toUpperCase()}
                              </span>
                              <span className="text-xs opacity-75">{module.duration}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-75" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* User Profile */}
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-700 delay-100 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Katakam koteswararao</h3>
                    <p className="text-blue-600 text-sm">Daily Rank →</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">22nd August 2025</p>
              </div>

              {/* Live Sessions */}
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-700 delay-200 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Live Sessions</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-sm">Live</span>
                  </div>
                </div>
                <Link to="/live-sessions" className="text-blue-600 hover:text-blue-700 text-sm">
                  View more →
                </Link>
              </div>

              {/* Achievements */}
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-700 delay-300 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-green-600 font-medium">Best: 2</span>
                  <span className="text-orange-600 font-medium">Goal: 7</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Flame className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-xs text-gray-600">0 Streaks</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Star className="w-6 h-6 text-yellow-500 mb-1" />
                    <span className="text-xs text-gray-600">119.55K Points</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Coins className="w-6 h-6 text-yellow-500 mb-1" />
                    <span className="text-xs text-gray-600">18,860 Coins</span>
                  </div>
                </div>
              </div>

              {/* Daily Goal */}
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-700 delay-400 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Daily Goal</h3>
                  <Info className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-green-600 text-sm mb-4">12Hrs Left</p>
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="220"
                      strokeDashoffset="220"
                      className="text-purple-500 transition-all duration-1000 ease-out"
                      style={{ 
                        strokeDashoffset: `${220 - (220 * dailyGoalProgress) / 100}`,
                        animationDelay: '1s'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">{dailyGoalProgress}/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-gray-700">Daily Goal Reward 50</span>
                  <Coins className="w-4 h-4 text-yellow-500" />
                </div>
              </div>

              {/* Weekly Goal */}
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-700 delay-500 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Weekly Goal</h3>
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-gray-600 text-sm mb-4">{weeklyGoalProgress}/5 Days This Week</p>
                <div className="flex justify-between mb-4">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <div key={day} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        index === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {day}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-sm text-gray-700">Weekly Goal Reward - 300</span>
                  <Coins className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 text-center">No. of Weekly Goals Achieved - 25 Weeks</p>
              </div>

              {/* Store */}
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-700 delay-600 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <h3 className="font-semibold text-gray-900 mb-4">Store</h3>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <User className="w-8 h-8 text-gray-400" />
                    <ShoppingCart className="w-6 h-6 text-gray-400 absolute -bottom-1 -right-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Help Button */}
        <button 
          className={`fixed bottom-6 right-6 w-16 h-16 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-all duration-300 hover:scale-110 ${showAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '1s' }}
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        {/* Custom CSS for animations */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .animate-fade-in-left {
            animation: fadeInLeft 0.6s ease-out forwards;
          }
          
          .animate-fade-in-right {
            animation: fadeInRight 0.6s ease-out forwards;
          }
        `}</style>
      </DashboardLayout>
    </div>
  );
};

export default Dashboard2;
