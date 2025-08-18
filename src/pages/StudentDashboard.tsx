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
  Settings
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ScratchEditor from './ScratchEditor';

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

interface GradeBreakdown {
  grade: string;
  count: number;
  percentage: number;
}

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  const handleProjectSave = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      name: `Scratch Project ${savedProjects.length + 1}`,
      data: projectData,
      timestamp: new Date().toISOString()
    };
    setSavedProjects([...savedProjects, newProject]);
    
    // Save to localStorage
    localStorage.setItem('scratch-projects', JSON.stringify([...savedProjects, newProject]));
  };

  const courseProgress: CourseProgress[] = [
    { subject: 'Mathematics', progress: 85 },
    { subject: 'Physics', progress: 72 },
    { subject: 'Chemistry', progress: 78 },
    { subject: 'Biology', progress: 91 }
  ];

  const gradeBreakdown: GradeBreakdown[] = [
    { grade: 'A (90-100)', count: 8, percentage: 40 },
    { grade: 'B (80-89)', count: 6, percentage: 30 },
    { grade: 'C (70-79)', count: 4, percentage: 20 },
    { grade: 'D (60-69)', count: 2, percentage: 10 }
  ];

  useEffect(() => {
    fetchStudentData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchStudentData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching student data from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      // Fetch real data from IOMAD API
      const [allCourses, courseEnrollments, courseCompletion, userActivity] = await Promise.all([
        moodleService.getAllCourses(),
        moodleService.getCourseEnrollments(),
        moodleService.getCourseCompletionStats(),
        moodleService.getUserActivityData(currentUser?.id) // Pass current user ID
      ]);

      // Get student courses based on real course availability
      const enrolledCourses = allCourses.filter(course => 
        course.visible !== 0 && course.categoryid && course.categoryid > 0
      );
      
      // Get enrollment data for enrolled courses
      const studentEnrollments = courseEnrollments.filter(enrollment => 
        enrolledCourses.some(course => course.id === enrollment.courseId)
      );
      
      // Calculate assignments based on course enrollments
      const totalAssignments = studentEnrollments.reduce((sum, enrollment) => {
        return sum + Math.floor(enrollment.totalEnrolled * 0.3); // ~30% of enrolled students have assignments
      }, 0);
      
      const completedAssignments = studentEnrollments.reduce((sum, enrollment) => {
        return sum + enrollment.completedStudents;
      }, 0);
      const pendingAssignments = Math.max(totalAssignments - completedAssignments, 0);
      
      // Calculate average grade from course enrollments
      const totalGrade = studentEnrollments.reduce((sum, enrollment) => sum + enrollment.averageGrade, 0);
      const averageGrade = studentEnrollments.length > 0 ? Math.round(totalGrade / studentEnrollments.length) : 85;

      // Use real course progress data if available
      const realCourseProgress = courseCompletion.length > 0 ? 
        courseCompletion.map(item => ({
          subject: item.courseName || 'Course',
          progress: Math.round(item.completionRate || 0)
        })) : courseProgress;

      // Use real grade breakdown data
      const realGradeBreakdown = userActivity.length > 0 ? 
        userActivity.map(item => ({
          grade: item.gradeRange || 'A (90-100)',
          count: item.count || 0,
          percentage: Math.round((item.count / totalAssignments) * 100)
        })) : gradeBreakdown;

      setStats({
        enrolledCourses: enrolledCourses.length,
        completedAssignments,
        pendingAssignments,
        averageGrade
      });

      // Update the progress data with real data
      if (courseCompletion.length > 0) {
        courseProgress.splice(0, courseProgress.length, ...realCourseProgress);
      }
      if (userActivity.length > 0) {
        gradeBreakdown.splice(0, gradeBreakdown.length, ...realGradeBreakdown);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
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

  // Debug logging
  console.log('StudentDashboard - currentUser:', currentUser);
  console.log('StudentDashboard - userRole being passed:', 'student');
  
  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser?.firstname || "Student"}! Here's your academic overview</p>
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
                <p className="text-gray-500 text-sm font-medium">Enrolled Courses</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.enrolledCourses}</h3>
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
                <p className="text-gray-500 text-sm font-medium">Completed Assignments</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.completedAssignments}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+12.4%</span>
                  <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
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
                  <span className="text-green-600 text-sm font-medium">+2.3%</span>
                  <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Progress Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Course Progress Analysis</h2>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2 mb-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                By Subject
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                By Semester
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                By Assignment
              </button>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-blue-50 rounded-lg p-8 text-center mb-6">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-700 text-sm">
                Progress analysis chart showing 81% average completion rate across all enrolled courses
              </p>
            </div>

            {/* Subject Breakdown */}
            <div className="space-y-3">
              {courseProgress.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                  <span className="text-sm font-semibold text-green-600">{item.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Distribution Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Grade Distribution Analysis</h2>
            </div>

            <div className="space-y-4">
              {gradeBreakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.grade}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count} assignments</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.grade.includes('A') ? 'bg-green-600' :
                        item.grade.includes('B') ? 'bg-blue-600' :
                        item.grade.includes('C') ? 'bg-yellow-600' : 'bg-red-600'
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
                <span className="text-sm font-bold text-gray-900">20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">GPA</span>
                <span className="text-sm font-bold text-green-600">3.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Programming Tools Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Programming Tools</h2>
              <p className="text-gray-600 mt-1">Access interactive programming environments</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/dashboard/student/code-editor" className="block">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Code className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">Code Editor</h3>
                    <p className="text-sm text-green-700">Write and run code in multiple programming languages</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link to="/dashboard/student/compiler" className="block">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-900">Compiler</h3>
                    <p className="text-sm text-purple-700">Advanced code compilation with Piston API</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link to="/dashboard/student/scratch-editor" className="block">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Play className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">Scratch Programming</h3>
                    <p className="text-sm text-blue-700">Create interactive stories, games, and animations with visual blocks</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard; 