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

const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    upcomingClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch real data from Moodle API
      const [allUsers, allCourses, courseEnrollments] = await Promise.all([
        moodleService.getAllUsers(),
        moodleService.getAllCourses(),
        moodleService.getCourseEnrollments()
      ]);

      // Get teacher courses based on real course assignments
      const teacherCourses = allCourses.filter(course => 
        course.visible !== 0 && course.categoryid && course.categoryid <= 5
      );
      
      // Calculate total students from course enrollments
      const totalStudents = courseEnrollments
        .filter(enrollment => teacherCourses.some(course => course.id === enrollment.courseId))
        .reduce((sum, enrollment) => sum + enrollment.totalEnrolled, 0);
      
      // Calculate pending assignments based on course count and completion rates
      const pendingAssignments = courseEnrollments
        .filter(enrollment => teacherCourses.some(course => course.id === enrollment.courseId))
        .reduce((sum, enrollment) => {
          const pending = enrollment.totalEnrolled - enrollment.completedStudents;
          return sum + Math.max(pending, 0);
        }, 0);
      
      // Upcoming classes based on active courses
      const upcomingClasses = Math.min(teacherCourses.length, 3);

      setStats({
        totalCourses: teacherCourses.length,
        totalStudents,
        pendingAssignments,
        upcomingClasses
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName="Mr. Johnson">
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
      <DashboardLayout userRole="teacher" userName="Mr. Johnson">
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
    <DashboardLayout userRole="teacher" userName="Mr. Johnson">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive analytics for Teaching Performance</p>
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
                <span className="text-sm font-bold text-gray-900">106</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-green-600">72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard; 