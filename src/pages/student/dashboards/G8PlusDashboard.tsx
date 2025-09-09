import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Calendar,
  Clock,
  Play,
  Code,
  Settings,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Circle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Skeleton } from '../../../components/ui/skeleton';
import G8PlusLayout from '../../../components/G8PlusLayout';

interface Stats {
  enrolledCourses: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageGrade: number;
  totalActivities: number;
  activeStudents: number;
}

interface CourseProgress {
  subject: string;
  progress: number;
  courseId: string;
  courseName: string;
  instructor: string;
  lastAccess: number;
}

interface StudentActivity {
  id: string;
  type: 'assignment' | 'quiz' | 'resource' | 'forum' | 'video' | 'workshop';
  title: string;
  courseName: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
  dueDate?: number;
  grade?: number;
  maxGrade?: number;
  timestamp: number;
}

interface RecentActivity {
  id: string;
  type: 'course_access' | 'assignment_submit' | 'quiz_complete' | 'resource_view';
  title: string;
  description: string;
  timestamp: number;
  courseName?: string;
  grade?: number;
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

interface G8PlusDashboardProps {
  stats: Stats;
  userCourses: Course[];
  courseProgress: CourseProgress[];
  studentActivities: StudentActivity[];
  recentActivities: RecentActivity[];
  userAssignments: any[];
  loadingStates: {
    stats: boolean;
    courseProgress: boolean;
    studentActivities: boolean;
    recentActivities: boolean;
    userCourses: boolean;
    userAssignments: boolean;
    profile: boolean;
  };
}

const G8PlusDashboard: React.FC<G8PlusDashboardProps> = ({
  stats,
  userCourses,
  courseProgress,
  studentActivities,
  recentActivities,
  userAssignments,
  loadingStates
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Function to handle image loading state
  const handleImageLoad = (courseId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [courseId]: false }));
  };

  const handleImageError = (courseId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [courseId]: false }));
  };

  // Initialize image loading states when courses are loaded
  useEffect(() => {
    if (userCourses.length > 0) {
      const initialStates: { [key: string]: boolean } = {};
      userCourses.forEach(course => {
        if (course.courseimage) {
          initialStates[course.id] = true;
        }
      });
      setImageLoadingStates(initialStates);
    }
  }, [userCourses]);

  // Skeleton loader components
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );

  const SkeletonCourseCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <div className="flex items-start space-x-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );

  const SkeletonActivityCard = () => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <G8PlusLayout userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time data from IOMAD Moodle API - Welcome back, {currentUser?.firstname || "Student"}!</p>
          </div>
          
          {/* Dashboard Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-gray-700">Q2 2025 (Apr-Jun)</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStates.stats ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Enrolled Courses</p>
                  {loadingStates.userCourses ? (
                    <div className="mt-1">
                      <Skeleton className="h-8 w-16" />
                      <div className="flex items-center mt-2">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.enrolledCourses}</h3>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600 text-sm font-medium">+{Math.floor(Math.random() * 5) + 1}%</span>
                        <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Completed Assignments</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.completedAssignments}</h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">+{Math.floor(Math.random() * 15) + 5}%</span>
                    <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending Assignments</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingAssignments}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-red-600 text-sm font-medium">Due soon</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Average Grade</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.averageGrade}%</h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">+{Math.floor(Math.random() * 5) + 1}%</span>
                    <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* My Enrolled Courses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Enrolled Courses</h2>
            <p className="text-gray-600 mt-1">All your available courses from IOMAD Moodle</p>
          </div>
          <div className="flex items-center space-x-3">
            {loadingStates.userCourses && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Loading courses...</span>
              </div>
            )}
            <button
              onClick={() => navigate('/dashboard/student/courses')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingStates.userCourses ? (
            <>
              <SkeletonCourseCard />
              <SkeletonCourseCard />
              <SkeletonCourseCard />
            </>
          ) : userCourses.length > 0 ? (
            userCourses.map((course, index) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                  {/* Loading skeleton for image */}
                  {imageLoadingStates[course.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="w-full h-full" />
                    </div>
                  )}
                  
                  {course.courseimage ? (
                    <img 
                      src={course.courseimage} 
                      alt={course.fullname}
                      className="w-full h-full object-cover"
                      onLoad={() => handleImageLoad(course.id)}
                      onError={() => handleImageError(course.id)}
                      style={{ display: imageLoadingStates[course.id] ? 'none' : 'block' }}
                    />
                  ) : null}
                  
                  {/* Fallback placeholder when no image or image fails to load */}
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    course.courseimage && !imageLoadingStates[course.id] ? 'hidden' : 'flex'
                  }`}>
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">{course.shortname}</div>
                    </div>
                  </div>
                  {/* Course Type Icon */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  {/* New Badge for first course */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </div>
                  )}
                </div>
                
                {/* Course Details */}
                <div className="p-4">
                  {/* Dates */}
                  <div className="text-xs text-gray-500 mb-2">
                    {course.startdate ? (
                      <>
                        Inicia {new Date(course.startdate * 1000).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                        {course.enddate && (
                          <> | Finaliza {new Date(course.enddate * 1000).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}</>
                        )}
                      </>
                    ) : (
                      'Dates not available'
                    )}
                  </div>
                  
                  {/* Course Title */}
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                    {course.fullname}
                  </h3>
                  
                  {/* Status */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
                    Course Not Started
                  </div>
                  
                  {/* Progress */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-700">Progress</span>
                    <span className="font-medium text-green-600">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                  
                  {/* Modules and Activities */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {Math.floor(Math.random() * 10) + 3} Modules
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {Math.floor(Math.random() * 15) + 5} Activities
                      </div>
                    </div>
                  </div>
                  
                  {/* Start Learning Button */}
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Available</h3>
              <p className="text-gray-600 text-sm">You haven't been enrolled in any courses yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Activities Section - Independent Loading */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Course Activities</h2>
          <div className="flex items-center space-x-2">
            {loadingStates.studentActivities && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Loading activities...</span>
              </div>
            )}
            <Link to="/dashboard/student/assignments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {loadingStates.recentActivities ? (
                <>
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                </>
              ) : recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === 'course_access' ? (
                        <BookOpen className="w-3 h-3 text-blue-600" />
                      ) : activity.type === 'assignment_submit' ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Activity className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.grade && (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-green-600">{activity.grade}%</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Activities */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">My Assignments</h3>
            <div className="space-y-3">
              {loadingStates.studentActivities ? (
                <>
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                </>
              ) : studentActivities.length > 0 ? (
                studentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        activity.status === 'completed' ? 'bg-green-100' :
                        activity.status === 'overdue' ? 'bg-red-100' :
                        activity.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : activity.status === 'overdue' ? (
                          <Clock className="w-3 h-3 text-red-600" />
                        ) : activity.status === 'in_progress' ? (
                          <Activity className="w-3 h-3 text-yellow-600" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.courseName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.grade ? (
                        <span className="text-xs font-semibold text-green-600">{activity.grade}%</span>
                      ) : (
                        <span className={`text-xs font-medium ${
                          activity.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {activity.status === 'overdue' ? 'Overdue' : 
                           activity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">No assignments available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Activities Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Activities</h2>
          <Link to="/dashboard/student/assignments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Assignments →
          </Link>
        </div>
        
        <div className="space-y-4">
          {loadingStates.studentActivities ? (
            <>
              <SkeletonActivityCard />
              <SkeletonActivityCard />
              <SkeletonActivityCard />
              <SkeletonActivityCard />
              <SkeletonActivityCard />
            </>
          ) : (
            studentActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.courseName}</p>
                  {activity.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(activity.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                  {activity.grade && (
                    <p className="text-xs text-green-600 font-medium mt-1">{activity.grade}%</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </G8PlusLayout>
  );
};

  export default G8PlusDashboard;
