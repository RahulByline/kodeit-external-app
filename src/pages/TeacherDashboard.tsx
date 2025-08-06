import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
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
  Clock
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  pendingAssignments: number;
  upcomingClasses: number;
}

interface StudentPerformance {
  subject: string;
  improvement: number;
}

interface AssignmentStatus {
  status: string;
  count: number;
  percentage: number;
}

interface TeacherAssignment {
  id: number;
  name: string;
  courseId: string;
  courseName: string;
  duedate: number;
  status: string;
  submittedCount: number;
  totalStudents: number;
  averageGrade: number;
}

const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    upcomingClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);

  const studentPerformance: StudentPerformance[] = [
    { subject: 'Mathematics', improvement: 15 },
    { subject: 'Physics', improvement: 12 },
    { subject: 'Chemistry', improvement: 18 },
    { subject: 'Biology', improvement: 14 }
  ];

  const assignmentStatus: AssignmentStatus[] = [
    { status: 'Submitted', count: 62, percentage: 72 },
    { status: 'Pending', count: 24, percentage: 28 },
    { status: 'Late', count: 8, percentage: 9 },
    { status: 'Not Started', count: 12, percentage: 14 }
  ];

  useEffect(() => {
    fetchTeacherData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchTeacherData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching teacher data from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      // Fetch real data from IOMAD API using new methods
      const [
        teacherCourses, 
        teacherAssignments, 
        courseEnrollments, 
        teacherPerformance, 
        courseCompletion
      ] = await Promise.all([
        moodleService.getTeacherCourses(currentUser?.id), // Get teacher's specific courses
        moodleService.getTeacherAssignments(currentUser?.id), // Get teacher's assignments
        moodleService.getCourseEnrollments(), // Get course enrollments
        moodleService.getTeacherPerformanceData(currentUser?.id), // Get performance data
        moodleService.getCourseCompletionStats() // Get completion stats
      ]);

      console.log('📊 API Response Data:', {
        teacherCourses: teacherCourses.length,
        teacherAssignments: teacherAssignments.length,
        enrollments: courseEnrollments.length,
        performance: teacherPerformance.length,
        completion: courseCompletion.length
      });

      // Calculate total students from course enrollments for teacher's courses
      const teacherCourseIds = teacherCourses.map(course => course.id);
      const totalStudents = courseEnrollments
        .filter(enrollment => teacherCourseIds.includes(enrollment.courseId))
        .reduce((sum, enrollment) => sum + enrollment.totalEnrolled, 0);
      
      // Calculate pending assignments from real assignment data
      const pendingAssignments = teacherAssignments
        .filter(assignment => assignment.status === 'Pending' || assignment.status === 'Not Started')
        .reduce((sum, assignment) => sum + (assignment.totalStudents - assignment.submittedCount), 0);
      
      // Upcoming classes based on active courses
      const upcomingClasses = Math.min(teacherCourses.length, 3);

      console.log('📈 Calculated Stats:', {
        totalCourses: teacherCourses.length,
        totalStudents,
        pendingAssignments,
        upcomingClasses
      });

      // Use real performance data if available
      const realStudentPerformance = teacherPerformance.length > 0 ? 
        teacherPerformance.map(item => ({
          subject: item.courseName || 'Course',
          improvement: Math.round(item.improvement || 0)
        })) : studentPerformance;

      // Use real assignment status data from assignments
      const realAssignmentStatus = teacherAssignments.length > 0 ? 
        teacherAssignments.reduce((acc, assignment) => {
          const status = assignment.status;
          const existing = acc.find(item => item.status === status);
          if (existing) {
            existing.count += assignment.submittedCount;
          } else {
            acc.push({
              status,
              count: assignment.submittedCount,
              percentage: Math.round((assignment.submittedCount / assignment.totalStudents) * 100)
            });
          }
          return acc;
        }, [] as AssignmentStatus[]) : assignmentStatus;

      setStats({
        totalCourses: teacherCourses.length,
        totalStudents,
        pendingAssignments,
        upcomingClasses
      });

      // Update the performance data with real data
      if (teacherPerformance.length > 0) {
        studentPerformance.splice(0, studentPerformance.length, ...realStudentPerformance);
      }
      if (realAssignmentStatus.length > 0) {
        assignmentStatus.splice(0, assignmentStatus.length, ...realAssignmentStatus);
      }

      // Store teacher assignments for display
      setTeacherAssignments(teacherAssignments);

      console.log('✅ Teacher dashboard data updated successfully!');
    } catch (error) {
      console.error('❌ Error fetching teacher data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchTeacherData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser?.firstname || "Teacher"}! Here's your teaching overview</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Courses</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCourses}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+1.0%</span>
                  <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+5.2%</span>
                  <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Assignments</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingAssignments}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-600 text-sm font-medium">+3.2%</span>
                  <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Upcoming Classes</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingClasses}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">Today</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Performance Improvement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Student Performance Improvement</h2>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2 mb-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                By Subject
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                By Class
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                By Assignment
              </button>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-blue-50 rounded-lg p-8 text-center mb-6">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-700 text-sm">
                Performance improvement chart showing 14% average increase in student scores after targeted interventions
              </p>
            </div>

            {/* Subject Breakdown */}
            <div className="space-y-3">
              {studentPerformance.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                  <span className="text-sm font-semibold text-green-600">+{item.improvement}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Status Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Assignment Status Analysis</h2>
            </div>

            <div className="space-y-4">
              {assignmentStatus.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.status === 'Submitted' ? 'bg-green-600' :
                        item.status === 'Pending' ? 'bg-yellow-600' :
                        item.status === 'Late' ? 'bg-red-600' : 'bg-gray-600'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Assignments</span>
                <span className="text-sm font-bold text-gray-900">{teacherAssignments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-green-600">72%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>

          {teacherAssignments.length > 0 ? (
            <div className="space-y-4">
              {teacherAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{assignment.name}</h3>
                    <p className="text-sm text-gray-600">{assignment.courseName}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        Due: {new Date(assignment.duedate * 1000).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {assignment.submittedCount}/{assignment.totalStudents} submitted
                      </span>
                      <span className="text-xs text-gray-500">
                        Avg: {assignment.averageGrade}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'Submitted' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      assignment.status === 'Late' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assignments found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard; 