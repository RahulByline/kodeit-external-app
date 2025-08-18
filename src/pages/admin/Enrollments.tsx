import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award,
  BarChart3,
  Search,
  Filter,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Target
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  newEnrollmentsThisMonth: number;
  dropoutRate: number;
  averageCompletionTime: number;
}

interface CourseEnrollment {
  courseId: string;
  courseName: string;
  category: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  lastEnrollment: string;
}

interface StudentEnrollment {
  studentId: string;
  studentName: string;
  courseName: string;
  enrollmentDate: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  lastActivity: string;
  expectedCompletion: string;
}

const Enrollments: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<EnrollmentStats>({
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    completionRate: 0,
    averageProgress: 0,
    newEnrollmentsThisMonth: 0,
    dropoutRate: 0,
    averageCompletionTime: 0
  });
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all users and courses for enrollment data
      const [users, courses, categories] = await Promise.all([
        moodleService.getAllUsers(),
        moodleService.getAllCourses(),
        moodleService.getCourseCategories()
      ]);

      // Filter students
      const students = users.filter(user => {
        const role = moodleService.detectUserRoleEnhanced(user.username, user, user.roles || []);
        return role === 'student';
      });

      // Generate mock enrollment data based on real data
      const enrollmentData: StudentEnrollment[] = [];
      const courseEnrollmentMap: { [key: string]: CourseEnrollment } = {};

      // Initialize course enrollment tracking
      courses.forEach(course => {
        const category = categories.find(cat => cat.id === course.categoryid)?.name || 'General';
        courseEnrollmentMap[course.id] = {
          courseId: course.id,
          courseName: course.fullname,
          category,
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          completionRate: 0,
          averageProgress: 0,
          lastEnrollment: new Date().toISOString()
        };
      });

      // Generate student enrollments
      students.forEach((student, index) => {
        // Each student enrolls in 1-3 courses
        const numEnrollments = Math.floor(Math.random() * 3) + 1;
        const selectedCourses = courses.slice(0, numEnrollments);
        
        selectedCourses.forEach(course => {
          const progress = Math.floor(Math.random() * 100);
          const status = progress === 100 ? 'completed' : progress > 0 ? 'active' : 'dropped';
          const enrollmentDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
          const lastActivity = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
          
          enrollmentData.push({
            studentId: student.id,
            studentName: student.fullname,
            courseName: course.fullname,
            enrollmentDate: enrollmentDate.toISOString(),
            progress,
            status,
            lastActivity: lastActivity.toISOString(),
            expectedCompletion: new Date(enrollmentDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
          });

          // Update course enrollment stats
          if (courseEnrollmentMap[course.id]) {
            courseEnrollmentMap[course.id].totalEnrollments++;
            if (status === 'active') courseEnrollmentMap[course.id].activeEnrollments++;
            if (status === 'completed') courseEnrollmentMap[course.id].completedEnrollments++;
          }
        });
      });

      // Calculate course completion rates and average progress
      Object.values(courseEnrollmentMap).forEach(course => {
        course.completionRate = course.totalEnrollments > 0 
          ? Math.round((course.completedEnrollments / course.totalEnrollments) * 100)
          : 0;
        
        const courseEnrollments = enrollmentData.filter(e => e.courseName === course.courseName);
        course.averageProgress = courseEnrollments.length > 0
          ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length)
          : 0;
      });

      // Calculate overall statistics
      const totalEnrollments = enrollmentData.length;
      const activeEnrollments = enrollmentData.filter(e => e.status === 'active').length;
      const completedEnrollments = enrollmentData.filter(e => e.status === 'completed').length;
      const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const newEnrollmentsThisMonth = enrollmentData.filter(e => 
        new Date(e.enrollmentDate).getTime() > oneMonthAgo
      ).length;

      setStats({
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
        averageProgress: Math.round(enrollmentData.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments),
        newEnrollmentsThisMonth,
        dropoutRate: totalEnrollments > 0 ? Math.round(((totalEnrollments - activeEnrollments - completedEnrollments) / totalEnrollments) * 100) : 0,
        averageCompletionTime: Math.floor(Math.random() * 60) + 30 // days
      });

      setCourseEnrollments(Object.values(courseEnrollmentMap));
      setStudentEnrollments(enrollmentData);

    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      setError('Failed to load enrollment data. Using fallback data.');
      
      // Set fallback data
      setStats({
        totalEnrollments: 450,
        activeEnrollments: 320,
        completedEnrollments: 95,
        completionRate: 21,
        averageProgress: 68,
        newEnrollmentsThisMonth: 45,
        dropoutRate: 8,
        averageCompletionTime: 45
      });

      setCourseEnrollments([
        {
          courseId: '1',
          courseName: 'Advanced Teaching Methods',
          category: 'Teaching Methods',
          totalEnrollments: 120,
          activeEnrollments: 85,
          completedEnrollments: 25,
          completionRate: 21,
          averageProgress: 72,
          lastEnrollment: new Date().toISOString()
        },
        {
          courseId: '2',
          courseName: 'Digital Learning Fundamentals',
          category: 'Technology Integration',
          totalEnrollments: 95,
          activeEnrollments: 68,
          completedEnrollments: 18,
          completionRate: 19,
          averageProgress: 65,
          lastEnrollment: new Date().toISOString()
        }
      ]);

      setStudentEnrollments([
        {
          studentId: '1',
          studentName: 'John Smith',
          courseName: 'Advanced Teaching Methods',
          enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 75,
          status: 'active',
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expectedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          studentId: '2',
          studentName: 'Sarah Johnson',
          courseName: 'Digital Learning Fundamentals',
          enrollmentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          status: 'completed',
          lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          expectedCompletion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudentEnrollments = studentEnrollments.filter(enrollment => {
    const matchesSearch = enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || enrollment.courseName === filterCourse;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'dropped':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin User"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading enrollment data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin User"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
            <p className="text-gray-600 mt-1">Track course enrollments and student progress</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Enrollment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Enrollments</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEnrollments.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+{stats.newEnrollmentsThisMonth}</span>
                  <span className="text-gray-500 text-sm ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Enrollments</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeEnrollments.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 text-sm font-medium">{Math.round((stats.activeEnrollments / stats.totalEnrollments) * 100)}%</span>
                  <span className="text-gray-500 text-sm ml-1">of total</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.completionRate}%</h3>
                <div className="flex items-center mt-2">
                  <Award className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 text-sm font-medium">{stats.completedEnrollments}</span>
                  <span className="text-gray-500 text-sm ml-1">completed</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Average Progress</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.averageProgress}%</h3>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 text-sm font-medium">{stats.averageCompletionTime} days</span>
                  <span className="text-gray-500 text-sm ml-1">avg completion</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Enrollment Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Course Enrollment Statistics</h2>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {courseEnrollments.map((course, index) => (
                <div key={course.courseId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{course.courseName}</h3>
                      <p className="text-xs text-gray-500">{course.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{course.completionRate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span>{course.totalEnrollments} total</span>
                    <span>{course.activeEnrollments} active</span>
                    <span>{course.completedEnrollments} completed</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${course.averageProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Average progress: {course.averageProgress}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Enrollments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Student Enrollments</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students or courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredStudentEnrollments.slice(0, 10).map((enrollment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(enrollment.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{enrollment.studentName}</p>
                      <p className="text-xs text-gray-500">{enrollment.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{enrollment.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Enrolled: {formatDate(enrollment.enrollmentDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enrollment Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Enrollment Insights</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.dropoutRate}%</div>
              <div className="text-sm text-gray-600">Dropout Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.averageCompletionTime}</div>
              <div className="text-sm text-gray-600">Avg Completion (days)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{courseEnrollments.length}</div>
              <div className="text-sm text-gray-600">Active Courses</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{Math.round(stats.totalEnrollments / courseEnrollments.length)}</div>
              <div className="text-sm text-gray-600">Avg Enrollments per Course</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Enrollments;
