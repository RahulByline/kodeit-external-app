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
  Play as PlayIcon
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

interface Course {
  id: string;
  name: string;
  progress: number;
  lessons: number;
  assignments: number;
  tests: number;
  color: string;
  icon: string;
}

interface UpcomingEvent {
  date: string;
  title: string;
  type: 'assignment' | 'test' | 'lesson';
}

const Dashboard1: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showAnimations, setShowAnimations] = useState(false);

  const courses: Course[] = [
    {
      id: '1',
      name: 'Web Design : From Figma to Web',
      progress: 75,
      lessons: 15,
      assignments: 6,
      tests: 3,
      color: 'purple',
      icon: '🎨'
    },
    {
      id: '2',
      name: 'HTML Basics',
      progress: 45,
      lessons: 12,
      assignments: 4,
      tests: 2,
      color: 'orange',
      icon: '🌐'
    },
    {
      id: '3',
      name: 'Data with Python',
      progress: 90,
      lessons: 18,
      assignments: 8,
      tests: 4,
      color: 'yellow',
      icon: '🐍'
    },
    {
      id: '4',
      name: 'JavaScript Fundamentals',
      progress: 30,
      lessons: 10,
      assignments: 3,
      tests: 1,
      color: 'blue',
      icon: '⚡'
    }
  ];

  const upcomingEvents: UpcomingEvent[] = [
    { date: '29 Sept', title: 'Practical Theory', type: 'assignment' },
    { date: '30 Sept', title: 'Practical Theory 1', type: 'test' },
    { date: '01 Oct', title: 'Practical Theory 2', type: 'lesson' },
    { date: '02 Oct', title: 'Practical Theory 3', type: 'assignment' }
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

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
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
        <div className="min-h-screen py-4">
          <div className=" mx-auto space-y-6">
            {/* Enhanced Course Header */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-700 ${showAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center animate-pulse">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">The Name of the course</h1>
                    <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">15</span>
                    </div>
                    <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">6</span>
                    </div>
                    <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">3</span>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <PlayIcon className="w-4 h-4" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Section */}
                <div className={`transition-all duration-700 delay-200 ${showAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Lessons Card */}
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white relative hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-sm font-semibold">59%</span>
                      </div>
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">42</h3>
                      <p className="text-sm opacity-90">Lessons</p>
                      <p className="text-xs opacity-75 mt-1">of 73 completed</p>
                    </div>

                    {/* Assignments Card */}
                    <div className="bg-gradient-to-r from-pink-400 to-red-500 rounded-xl p-6 text-white relative hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-sm font-semibold">59%</span>
                      </div>
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">08</h3>
                      <p className="text-sm opacity-90">Assignments</p>
                      <p className="text-xs opacity-75 mt-1">of 24 completed</p>
                    </div>

                    {/* Tests Card */}
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-6 text-white relative hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-sm font-semibold">59%</span>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">03</h3>
                      <p className="text-sm opacity-90">Tests</p>
                      <p className="text-xs opacity-75 mt-1">of 15 completed</p>
                    </div>
                  </div>
                </div>

                {/* My Courses Section */}
                <div className={`transition-all duration-700 delay-400 ${showAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">My Courses</h2>
                      <p className="text-gray-600 text-sm">Track your learning progress and achievements</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Total: {courses.length} courses</span>
                    </div>
                  </div>

                  {/* Enhanced Tabs */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="flex bg-gray-50">
                      <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                          activeTab === 'active'
                            ? 'text-purple-600 bg-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${activeTab === 'active' ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                          <span>Active Courses</span>
                          <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                            {courses.filter(c => c.progress < 100).length}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                          activeTab === 'completed'
                            ? 'text-purple-600 bg-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${activeTab === 'completed' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>Completed</span>
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                            {courses.filter(c => c.progress === 100).length}
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Enhanced Course Cards */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map((course, index) => (
                          <div 
                            key={course.id} 
                            className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                course.progress === 100 
                                  ? 'bg-green-100 text-green-700' 
                                  : course.progress >= 75 
                                    ? 'bg-blue-100 text-blue-700'
                                    : course.progress >= 50
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-orange-100 text-orange-700'
                              }`}>
                                {course.progress === 100 ? 'Completed' : 
                                 course.progress >= 75 ? 'Almost Done' :
                                 course.progress >= 50 ? 'In Progress' : 'Getting Started'}
                              </div>
                            </div>

                            {/* Course Header */}
                            <div className="flex items-start space-x-4 mb-4">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                                course.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                course.color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                                course.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                <span className="text-white">{course.icon}</span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300 truncate">
                                  {course.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {course.lessons} lessons • {course.assignments} assignments • {course.tests} tests
                                </p>
                              </div>
                            </div>

                            {/* Enhanced Progress Section */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Progress</span>
                                <span className="text-lg font-bold text-purple-600">{course.progress}%</span>
                              </div>
                              <div className="relative">
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${
                                      course.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                                      course.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                      course.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                      'bg-gradient-to-r from-blue-500 to-blue-600'
                                    }`}
                                    style={{ width: `${course.progress}%` }}
                                  >
                                    {/* Animated Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Course Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors duration-300">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-semibold text-gray-700">{course.lessons}</span>
                                </div>
                                <span className="text-xs text-gray-500">Lessons</span>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors duration-300">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <Award className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-semibold text-gray-700">{course.assignments}</span>
                                </div>
                                <span className="text-xs text-gray-500">Assignments</span>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors duration-300">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <BarChart3 className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-semibold text-gray-700">{course.tests}</span>
                                </div>
                                <span className="text-xs text-gray-500">Tests</span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                {course.progress === 100 ? (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Completed</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-purple-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Continue Learning</span>
                                  </div>
                                )}
                              </div>
                              <button className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group-hover:scale-105 ${
                                course.progress === 100 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}>
                                {course.progress === 100 ? 'View Certificate' : 'Continue'}
                              </button>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        ))}
                      </div>

                      {/* Empty State */}
                      {courses.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                          <p className="text-gray-600 mb-4">Start your learning journey by enrolling in courses</p>
                          <button className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors">
                            Browse Courses
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Calendar Section */}
                <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-1 hover:bg-gray-100 rounded hover:scale-110 transition-transform duration-300"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                      </button>
                      <button 
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-1 hover:bg-gray-100 rounded hover:scale-110 transition-transform duration-300"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h4 className="font-medium text-gray-900">{getMonthName(currentMonth)}</h4>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                      <div key={day} className="text-center text-gray-500 font-medium py-2">
                        {day}
                      </div>
                    ))}
                    
                    {generateCalendarDays().map((day, index) => (
                      <div key={index} className={`text-center py-2 transition-all duration-300 hover:scale-110 ${
                        day === 23 || day === 27 
                          ? 'bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                          : day 
                            ? 'text-gray-900 hover:bg-gray-100 rounded cursor-pointer'
                            : ''
                      }`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Section */}
                <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${showAnimations ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div 
                        key={index} 
                        className="flex items-center space-x-3 hover:scale-105 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded hover:bg-purple-200 transition-colors duration-300">
                          {event.date}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${
                              event.type === 'assignment' ? 'bg-red-500' :
                              event.type === 'test' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}></div>
                            <span className="text-xs text-gray-500 capitalize">{event.type}s</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

export default Dashboard1;
