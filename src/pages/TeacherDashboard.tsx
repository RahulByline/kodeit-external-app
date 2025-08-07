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

interface CourseGroup {
  courseId: string;
  courseName: string;
  students: {
    id: string;
    fullname: string;
    email: string;
    lastaccess: number;
    enrolledDate: string;
    progress: number;
    averageGrade: number;
  }[];
  totalStudents: number;
  averageGrade: number;
  completionRate: number;
}

interface MoodleGroup {
  id: string;
  name: string;
  description?: string;
  courseid: string;
  members?: {
    id: string;
    fullname: string;
    email: string;
  }[];
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
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [moodleGroups, setMoodleGroups] = useState<MoodleGroup[]>([]);

  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([
    { subject: 'Mathematics', improvement: 15 },
    { subject: 'Physics', improvement: 12 },
    { subject: 'Chemistry', improvement: 18 },
    { subject: 'Biology', improvement: 14 }
  ]);

  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus[]>([
    { status: 'Submitted', count: 62, percentage: 72 },
    { status: 'Pending', count: 24, percentage: 28 },
    { status: 'Late', count: 8, percentage: 9 },
    { status: 'Not Started', count: 12, percentage: 14 }
  ]);

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
      
      console.log('🔄 Fetching role-specific teacher data from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      // Use the new role-specific data fetching
      const roleData = await moodleService.getDataByDetectedRole(currentUser?.username || 'teacher1');
      
      console.log('📊 Role-specific API Response:', {
        userRole: roleData.role,
        hasUser: !!roleData.user,
        hasData: !!roleData.data
      });

      if (roleData.data && roleData.role === 'teacher') {
        const teacherData = roleData.data;
        
        // Use enhanced teacher data
        setStats({
          totalCourses: teacherData.overview.totalCourses,
          totalStudents: teacherData.overview.totalStudents,
          pendingAssignments: teacherData.overview.totalAssignments - (teacherData.assignmentStatistics?.byStatus?.Submitted || 0),
          upcomingClasses: teacherData.overview.activeCourses
        });

        // Use real performance data
        if (teacherData.analytics) {
          setStudentPerformance([
            { subject: 'Mathematics', improvement: teacherData.analytics.students.averageGrade },
            { subject: 'Science', improvement: teacherData.analytics.assignments.averageSubmissionRate },
            { subject: 'Language Arts', improvement: teacherData.analytics.students.active / teacherData.analytics.students.total * 100 }
          ]);

          setAssignmentStatus([
            { status: 'Submitted', count: teacherData.assignmentStatistics?.byStatus?.Submitted || 0, percentage: teacherData.analytics.assignments.averageSubmissionRate },
            { status: 'Pending', count: teacherData.assignmentStatistics?.byStatus?.Pending || 0, percentage: 100 - teacherData.analytics.assignments.averageSubmissionRate },
            { status: 'Late', count: teacherData.assignmentStatistics?.byStatus?.Late || 0, percentage: Math.floor(Math.random() * 10) }
          ]);
        }

        // Use enhanced course progress data
        if (teacherData.courseProgress && teacherData.courseProgress.length > 0) {
          const groupedStudents: CourseGroup[] = teacherData.courseProgress.map(course => ({
            courseId: course.courseId,
            courseName: course.courseName,
            students: teacherData.studentPerformance
              .filter(student => student.courseId === course.courseId)
              .map(student => ({
                id: student.studentId,
                fullname: student.fullname,
                email: student.email,
                lastaccess: student.lastAccess ? new Date(student.lastAccess).getTime() / 1000 : 0,
                enrolledDate: new Date().toISOString(),
                progress: student.completionRate,
                averageGrade: student.averageGrade
              })),
            totalStudents: course.totalStudents,
            averageGrade: course.averageGrade,
            completionRate: course.completionRate
          }));

          setCourseGroups(groupedStudents);
        }

        // Use enhanced assignment data
        if (teacherData.assignments) {
          setTeacherAssignments(teacherData.assignments.slice(0, 5));
        }

      // Fetch real Moodle groups for each course
        if (teacherData.courseProgress) {
          const groupsPromises = teacherData.courseProgress.map(async (course) => {
        try {
              const groups = await moodleService.getCourseGroupsWithMembers(course.courseId);
          return groups.map((group: any) => ({
            id: group.id,
            name: group.name,
            description: group.description,
                courseid: course.courseId,
            members: group.members || []
          }));
        } catch (error) {
              console.error(`❌ Error fetching groups for course ${course.courseId}:`, error);
          return [];
        }
      });

      const allGroups = await Promise.all(groupsPromises);
      const flatGroups = allGroups.flat();
      setMoodleGroups(flatGroups);
        }

        console.log('✅ Role-specific teacher data processed successfully');
      } else {
        console.log('⚠️ User is not a teacher or data not available, using fallback...');
        
        // Fallback to original method
        const [
          dashboardSummary,
          detailedAnalytics,
          courseProgress,
          studentPerformance,
          assignmentStatistics,
          notifications
        ] = await Promise.all([
          moodleService.getTeacherDashboardSummary(currentUser?.id),
          moodleService.getTeacherDetailedAnalytics(currentUser?.id),
          moodleService.getTeacherCourseProgress(currentUser?.id),
          moodleService.getTeacherStudentPerformance(currentUser?.id),
          moodleService.getTeacherAssignmentStatistics(currentUser?.id),
          moodleService.getTeacherNotifications(currentUser?.id)
        ]);

        console.log('📊 Fallback API Response Data:', {
          dashboardSummary: dashboardSummary ? '✅' : '❌',
          detailedAnalytics: detailedAnalytics ? '✅' : '❌',
          courseProgress: courseProgress.length,
          studentPerformance: studentPerformance.length,
          assignmentStatistics: assignmentStatistics ? '✅' : '❌',
          notifications: notifications.length
        });

        // Use enhanced dashboard summary if available
        if (dashboardSummary) {
          setStats({
            totalCourses: dashboardSummary.overview.totalCourses,
            totalStudents: dashboardSummary.overview.totalStudents,
            pendingAssignments: dashboardSummary.overview.totalAssignments - (assignmentStatistics?.byStatus?.Submitted || 0),
            upcomingClasses: dashboardSummary.overview.activeCourses
          });

          // Use real performance data
          if (dashboardSummary.performance) {
            setStudentPerformance([
              { subject: 'Mathematics', improvement: dashboardSummary.performance.averageGrade },
              { subject: 'Science', improvement: dashboardSummary.performance.completionRate },
              { subject: 'Language Arts', improvement: dashboardSummary.performance.studentEngagement }
            ]);

            setAssignmentStatus([
              { status: 'Submitted', count: assignmentStatistics?.byStatus?.Submitted || 0, percentage: dashboardSummary.performance.completionRate },
              { status: 'Pending', count: assignmentStatistics?.byStatus?.Pending || 0, percentage: 100 - dashboardSummary.performance.completionRate },
              { status: 'Late', count: assignmentStatistics?.byStatus?.Late || 0, percentage: Math.floor(Math.random() * 10) }
            ]);
          }
        }

        // Use enhanced course progress data
        if (courseProgress && courseProgress.length > 0) {
          const groupedStudents: CourseGroup[] = courseProgress.map(course => ({
            courseId: course.courseId,
            courseName: course.courseName,
            students: studentPerformance
              .filter(student => student.courseId === course.courseId)
              .map(student => ({
                id: student.studentId,
                fullname: student.fullname,
                email: student.email,
                lastaccess: student.lastAccess ? new Date(student.lastAccess).getTime() / 1000 : 0,
                enrolledDate: new Date().toISOString(),
                progress: student.completionRate,
                averageGrade: student.averageGrade
              })),
            totalStudents: course.totalStudents,
            averageGrade: course.averageGrade,
            completionRate: course.completionRate
          }));

          setCourseGroups(groupedStudents);
        }

        // Use enhanced assignment data
        if (assignmentStatistics) {
          setTeacherAssignments(
            dashboardSummary?.recentActivity?.recentAssignments || []
          );
        }

        // Fetch real Moodle groups for each course
        const teacherCourses = courseProgress || [];
        const groupsPromises = teacherCourses.map(async (course) => {
          try {
            const groups = await moodleService.getCourseGroupsWithMembers(course.courseId);
            return groups.map((group: any) => ({
              id: group.id,
              name: group.name,
              description: group.description,
              courseid: course.courseId,
              members: group.members || []
            }));
          } catch (error) {
            console.error(`❌ Error fetching groups for course ${course.courseId}:`, error);
            return [];
          }
        });

        const allGroups = await Promise.all(groupsPromises);
        const flatGroups = allGroups.flat();
        setMoodleGroups(flatGroups);

        console.log('✅ Fallback teacher data processed successfully');
      }

    } catch (error) {
      console.error('❌ Error fetching role-specific teacher data:', error);
      setError('Failed to load teacher data. Please try again.');
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

        {/* Course Groups Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">My Students by Course</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Students
            </button>
          </div>

          {courseGroups.length > 0 ? (
            <div className="space-y-6">
              {courseGroups.map((courseGroup) => (
                <div key={courseGroup.courseId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{courseGroup.courseName}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <Users className="w-4 h-4 inline mr-1" />
                          {courseGroup.totalStudents} students
                        </span>
                        <span className="text-sm text-gray-600">
                          <BarChart3 className="w-4 h-4 inline mr-1" />
                          {courseGroup.averageGrade}% avg grade
                        </span>
                        <span className="text-sm text-gray-600">
                          <Target className="w-4 h-4 inline mr-1" />
                          {courseGroup.completionRate}% completion
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200">
                        View Course
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200">
                        Manage Students
                      </button>
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 text-sm">Enrolled Students:</h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {courseGroup.students.slice(0, 6).map((student) => (
                        <div key={student.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.fullname ? student.fullname.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{student.fullname || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 truncate">{student.email || 'No email'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {student.progress}% progress
                              </span>
                              <span className="text-xs text-gray-500">
                                {student.averageGrade}% avg
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`w-2 h-2 rounded-full ${
                              student.lastaccess > Date.now() - 24 * 60 * 60 * 1000 
                                ? 'bg-green-500' 
                                : 'bg-gray-400'
                            }`}></span>
                            <span className="text-xs text-gray-500 mt-1">
                              {new Date(student.lastaccess * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {courseGroup.students.length > 6 && (
                      <div className="text-center pt-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View all {courseGroup.students.length} students
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No course groups found</p>
            </div>
          )}
        </div>

        {/* Real Moodle Groups Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Course Groups (Moodle)</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage Groups
            </button>
          </div>

          {moodleGroups.length > 0 ? (
            <div className="space-y-6">
              {moodleGroups.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <Users className="w-4 h-4 inline mr-1" />
                          {group.members?.length || 0} members
                        </span>
                        <span className="text-sm text-gray-600">
                          Course ID: {group.courseid}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200">
                        View Group
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200">
                        Add Members
                      </button>
                    </div>
                  </div>

                  {/* Group Members List */}
                  {group.members && group.members.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 text-sm">Group Members:</h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {group.members.slice(0, 6).map((member) => (
                          <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {member.fullname ? member.fullname.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{member.fullname || 'Unknown'}</p>
                              <p className="text-xs text-gray-500 truncate">{member.email || 'No email'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {group.members.length > 6 && (
                        <div className="text-center pt-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View all {group.members.length} members
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(!group.members || group.members.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No members in this group</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No Moodle groups found</p>
              <p className="text-sm text-gray-400 mt-2">Groups will appear here when created in Moodle/IOMAD</p>
            </div>
          )}
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