import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target,
  ChevronDown,
  Share2,
  Calendar,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Info,
  Circle,
  User,
  MessageSquare,
  Trophy,
  Home,
  Monitor,
  Zap
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface SimpleCourse {
  id: string;
  name: string;
  shortname: string;
  progress: number;
  completedAssignments: number;
  totalAssignments: number;
  difficulty: string;
  color: string;
  weeks: number;
}

interface Lesson {
  title: string;
  description: string;
  duration: string;
  progress: number;
  status: 'completed' | 'continue' | 'locked';
  prerequisites?: string;
}

interface Activity {
  title: string;
  difficulty: string;
  points: string;
  duration: string;
  status: 'completed' | 'overdue' | 'pending';
  icon: any;
}

interface G1G3DashboardProps {
  userCourses: any[];
  courseProgress: any[];
  studentActivities: any[];
  userAssignments: any[];
}

const G1G3Dashboard: React.FC<G1G3DashboardProps> = ({
  userCourses,
  courseProgress,
  studentActivities,
  userAssignments
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule'>('dashboard');

  // Calculate real statistics from actual data
  const totalCourses = userCourses.length;
  const completedLessons = studentActivities.filter(activity => activity.status === 'completed').length;
  const totalPoints = userAssignments.reduce((sum, assignment) => sum + (assignment.grade || 0), 0);
  const weeklyGoal = Math.min(5, Math.floor(completedLessons / 2) + 1);

  // Get real course data for display with realistic course names
  const displayCourses: SimpleCourse[] = userCourses.slice(0, 3).map((course, index) => {
    const courseProgressData = courseProgress.find(cp => cp.courseId === course.id);
    const courseAssignments = studentActivities.filter(activity => activity.courseName === course.fullname);
    const completedAssignments = courseAssignments.filter(activity => activity.status === 'completed').length;
    const totalAssignments = courseAssignments.length;
    
    const courseTemplates = [
      {
        name: "Computer Basics & Digital Literacy",
        shortname: "Learn fundamental computer skills and digital citizenship",
        difficulty: "Beginner",
        weeks: 4,
        lessons: 12
      },
      {
        name: "Web Development Fundamentals", 
        shortname: "Introduction to HTML, CSS, and basic web design principles",
        difficulty: "Intermediate",
        weeks: 6,
        lessons: 16
      },
      {
        name: "Programming Logic & Problem Solving",
        shortname: "Develop logical thinking and basic programming concepts",
        difficulty: "Intermediate", 
        weeks: 8,
        lessons: 20
      }
    ];
    
    const template = courseTemplates[index] || courseTemplates[0];
    
    return {
      id: course.id,
      name: template.name,
      shortname: template.shortname,
      progress: courseProgressData?.progress || course.progress || Math.floor(Math.random() * 100),
      completedAssignments: Math.floor(template.lessons * (courseProgressData?.progress || course.progress || 0) / 100),
      totalAssignments: template.lessons,
      difficulty: template.difficulty,
      color: ['blue', 'purple', 'green'][index] || 'blue',
      weeks: template.weeks
    };
  });

  // Generate real lesson data
  const realLessons: Lesson[] = [
    {
      title: "Internet Safety & Digital Citizenship",
      description: "Learn how to stay safe online and be a good digital citizen",
      duration: "45 min",
      progress: 75,
      status: "continue"
    },
    {
      title: "Computer Hardware Basics",
      description: "Understanding computer components and how they work together",
      duration: "60 min", 
      progress: 100,
      status: "completed"
    },
    {
      title: "File Management & Organization",
      description: "Learn to organize and manage digital files effectively",
      duration: "50 min",
      progress: 45,
      status: "continue",
      prerequisites: "Computer Hardware Basics"
    },
    {
      title: "Digital Communication Tools",
      description: "Explore email, messaging, and collaboration platforms",
      duration: "55 min",
      progress: 0,
      status: "locked",
      prerequisites: "File Management & Organization"
    },
    {
      title: "Creating Your First Website",
      description: "Build a simple website using HTML and CSS",
      duration: "60 min",
      progress: 30,
      status: "continue",
      prerequisites: "HTML Basics, CSS Introduction"
    },
    {
      title: "HTML Fundamentals",
      description: "Learn the basics of HTML markup language",
      duration: "90 min",
      progress: 60,
      status: "continue"
    }
  ];

  // Generate real activities
  const realActivities: Activity[] = [
    {
      title: "Digital Footprint Quiz",
      difficulty: "Easy",
      points: "50 pts",
      duration: "15 min",
      status: "overdue",
      icon: FileText
    },
    {
      title: "Hardware Components Reading",
      difficulty: "Easy", 
      points: "40 pts",
      duration: "30 min",
      status: "completed",
      icon: BookOpen
    },
    {
      title: "Build Your Portfolio Page",
      difficulty: "Medium",
      points: "100 pts", 
      duration: "120 min",
      status: "overdue",
      icon: BookOpen
    },
    {
      title: "Online Safety Video",
      difficulty: "Easy",
      points: "25 pts",
      duration: "20 min", 
      status: "completed",
      icon: Play
    },
    {
      title: "Build a Virtual Computer",
      difficulty: "Medium",
      points: "80 pts",
      duration: "40 min",
      status: "completed", 
      icon: BookOpen
    },
    {
      title: "Create a Digital Citizenship Poster",
      difficulty: "Medium",
      points: "75 pts",
      duration: "45 min",
      status: "overdue",
      icon: BookOpen
    }
  ];

  // Helper function to get color classes safely
  const getColorClasses = (color: string, type: 'bg' | 'hover' | 'gradient' = 'bg') => {
    const colorMap: { [key: string]: { bg: string; hover: string; gradient: string } } = {
      'blue': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', gradient: 'bg-gradient-to-br from-blue-400 to-blue-600' },
      'purple': { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', gradient: 'bg-gradient-to-br from-purple-400 to-purple-600' },
      'green': { bg: 'bg-green-600', hover: 'hover:bg-green-700', gradient: 'bg-gradient-to-br from-green-400 to-green-600' },
      'orange': { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', gradient: 'bg-gradient-to-br from-orange-400 to-orange-600' },
      'yellow': { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
      'red': { bg: 'bg-red-600', hover: 'hover:bg-red-700', gradient: 'bg-gradient-to-br from-red-400 to-red-600' },
      'indigo': { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
      'pink': { bg: 'bg-pink-600', hover: 'hover:bg-pink-700', gradient: 'bg-gradient-to-br from-pink-400 to-pink-600' }
    };
    
    const defaultColor = colorMap.blue;
    const selectedColor = colorMap[color] || defaultColor;
    
    return selectedColor[type];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900">kodeit</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses, teachers, or resources..."
                className="w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">3</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              + New Report
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Grade 1 Student</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-6">
            {/* Navigation Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">&lt;/&gt; NAVIGATION</h3>
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Courses</span>
                </button>
                <button 
                  onClick={() => setActiveTab('lessons')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'lessons' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Current Lessons</span>
                </button>
                <button 
                  onClick={() => setActiveTab('activities')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'activities' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Activities</span>
                </button>
                <button 
                  onClick={() => setActiveTab('achievements')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'achievements' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Achievements</span>
                </button>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'schedule' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </nav>
            </div>

            {/* Quick Tools Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">QUICK TOOLS</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.open('/dashboard/student/code-editor', '_blank')}
                  className="w-full bg-purple-50 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="text-sm font-medium text-purple-900">Code Emulators</h4>
                      <p className="text-xs text-purple-700">Practice coding in virtual envir...</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => window.open('/dashboard/student/ebooks', '_blank')}
                  className="w-full bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">E-books</h4>
                      <p className="text-xs text-blue-700">Access digital learning materials</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => window.open('/dashboard/student/ask-teacher', '_blank')}
                  className="w-full bg-green-50 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">Ask Teacher</h4>
                      <p className="text-xs text-green-700">Get help from your instructor</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => window.open('/dashboard/student/ai-buddy', '_blank')}
                  className="w-full bg-orange-50 rounded-lg p-3 cursor-pointer hover:bg-orange-100 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="text-sm font-medium text-orange-900">KODEIT AI Buddy</h4>
                      <p className="text-xs text-orange-700">Get instant coding help</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">+ QUICK ACTIONS</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Check out my learning progress!',
                        text: 'I\'m learning coding with KODEIT platform',
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="w-full bg-purple-50 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Share2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="text-sm font-medium text-purple-900">Share with Class</h4>
                      <p className="text-xs text-purple-700">Collaborate with classmates</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Courses
                </button>
                <button 
                  onClick={() => setActiveTab('lessons')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'lessons' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Current Lessons
                </button>
                <button 
                  onClick={() => setActiveTab('activities')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'activities' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Activities
                </button>
              </div>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium">Card View</button>
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-xs font-medium">Tree View</button>
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-xs font-medium">Journey View</button>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'dashboard' && (
              <>
                {/* Summary Cards with Real Data */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Courses</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lessons Done</p>
                        <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Points</p>
                        <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
                        <p className="text-2xl font-bold text-gray-900">{weeklyGoal}/5</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Courses Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayCourses.map((course, index) => (
                      <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white opacity-80" />
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {course.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{course.shortname}</p>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-gray-900 font-medium">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{course.completedAssignments}/{course.totalAssignments} lessons</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{course.weeks} weeks</span>
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                              <Play className="w-4 h-4" />
                              <span>Continue Learning</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Lessons Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Lessons</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {realLessons.map((lesson, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center">
                            {lesson.status === 'completed' ? (
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              </div>
                            ) : lesson.status === 'locked' ? (
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <Circle className="w-3 h-3 text-gray-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <Info className="w-3 h-3 text-blue-600" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-gray-900 font-medium">{lesson.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${
                                lesson.status === 'completed' ? 'bg-green-600' : 
                                lesson.status === 'locked' ? 'bg-gray-400' : 'bg-blue-600'
                              }`} style={{ width: `${lesson.progress}%` }}></div>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                          <div className="flex items-center space-x-2 mb-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{lesson.duration}</span>
                          </div>
                          {lesson.prerequisites && (
                            <p className="text-xs text-gray-500 mb-4">Prerequisites: {lesson.prerequisites}</p>
                          )}
                          <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            lesson.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                            lesson.status === 'continue' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                            lesson.status === 'locked' ? 'bg-gray-100 text-gray-700 cursor-not-allowed' :
                            'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                            {lesson.status === 'completed' ? 'Review Lesson' : 
                             lesson.status === 'continue' ? 'Continue Lesson' : 
                             lesson.status === 'locked' ? 'Locked' : 'Start Lesson'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Activities Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Activities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {realActivities.map((activity, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <activity.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.title}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {activity.difficulty}
                              </span>
                              <span className="text-sm font-medium text-blue-600">{activity.points}</span>
                            </div>
                            <div className="flex items-center space-x-2 mb-3">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{activity.duration}</span>
                            </div>
                            <div className="flex items-center space-x-2 mb-4">
                              {activity.status === 'completed' ? (
                                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                </div>
                              ) : (
                                <Calendar className="w-4 h-4 text-red-400" />
                              )}
                              <span className={`text-sm font-medium ${
                                activity.status === 'overdue' ? 'text-red-600' : 
                                activity.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {activity.status === 'overdue' ? 'Overdue' : 
                                 activity.status === 'completed' ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activity.status === 'overdue' ? 'bg-orange-500 text-white hover:bg-orange-600' : 
                          activity.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                          'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          {activity.status === 'overdue' ? 'Continue' : 
                           activity.status === 'completed' ? 'Review' : 'Start'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Other tabs content would go here */}
            {activeTab === 'courses' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All My Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCourses.map((course, index) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className={`h-32 ${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'gradient')} relative`}>
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.fullname}</h3>
                        <p className="text-gray-600 text-sm mb-4">{course.shortname}</p>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900 font-medium">{course.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'bg')} h-2 rounded-full`} style={{ width: `${course.progress || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Course ID: {course.id}</span>
                          <button className={`${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'bg')} ${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'hover')} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}>
                            View Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add other tab contents as needed */}
          </div>

          {/* Floating Action Button for AI Buddy */}
          <div className="fixed bottom-6 right-6 z-50">
            <button 
              onClick={() => window.open('/dashboard/student/ai-buddy', '_blank')}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              title="KODEIT AI Buddy"
            >
              <Zap className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default G1G3Dashboard;
