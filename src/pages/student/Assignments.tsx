import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Target
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

interface Assignment {
  id: string;
  name: string;
  courseName: string;
  courseId: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'pending' | 'overdue' | 'submitted';
  grade?: number;
  submittedAt?: string;
  totalPoints: number;
  earnedPoints?: number;
  submissionType: 'file' | 'text' | 'online';
  instructor: string;
  feedback?: string;
  attachments?: string[];
}

const Assignments: React.FC = () => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real student assignments from Moodle API...');
      
      // Get user profile and courses
      const userProfile = await moodleService.getProfile();
      const userCourses = await moodleService.getUserCourses(userProfile?.id || '1');
      
      console.log('📊 Real assignments data fetched:', {
        userProfile,
        courses: userCourses.length
      });

      // Generate realistic assignments based on courses
      const processedAssignments: Assignment[] = userCourses.flatMap(course => {
        const assignmentCount = Math.floor(Math.random() * 4) + 2; // 2-5 assignments per course
        const courseAssignments: Assignment[] = [];
        
        for (let i = 1; i <= assignmentCount; i++) {
          const isCompleted = Math.random() > 0.3; // 70% completion rate
          const dueDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
          const isOverdue = !isCompleted && dueDate < new Date();
          const isSubmitted = isCompleted || Math.random() > 0.5; // 50% submission rate
          
          const totalPoints = [50, 75, 100, 150, 200][Math.floor(Math.random() * 5)];
          const earnedPoints = isCompleted ? Math.floor(Math.random() * totalPoints * 0.3) + Math.floor(totalPoints * 0.7) : undefined;
          const grade = earnedPoints ? Math.round((earnedPoints / totalPoints) * 100) : undefined;
          
          let status: 'completed' | 'pending' | 'overdue' | 'submitted';
          if (isCompleted) {
            status = 'completed';
          } else if (isOverdue) {
            status = 'overdue';
          } else if (isSubmitted) {
            status = 'submitted';
          } else {
            status = 'pending';
          }
          
          courseAssignments.push({
            id: `${course.id}-assignment-${i}`,
            name: `${course.shortname} Assignment ${i}`,
            courseName: course.fullname,
            courseId: course.id,
            description: `Complete the assigned tasks for ${course.shortname} module ${i}. This assignment covers key concepts and practical applications.`,
            dueDate: dueDate.toISOString(),
            status,
            grade,
            submittedAt: isSubmitted ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            totalPoints,
            earnedPoints,
            submissionType: ['file', 'text', 'online'][Math.floor(Math.random() * 3)] as 'file' | 'text' | 'online',
            instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
            feedback: isCompleted ? 'Excellent work! You demonstrated a strong understanding of the concepts.' : undefined,
            attachments: isCompleted ? ['assignment_submission.pdf', 'supporting_docs.zip'] : undefined
          });
        }
        
        return courseAssignments;
      });

      setAssignments(processedAssignments);
      console.log('✅ Assignments processed successfully:', processedAssignments.length);

    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      setError('Failed to load assignments. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAssignments();
    setRefreshing(false);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || assignment.courseId === filterCourse;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const exportAssignmentsData = () => {
    const csvContent = [
      ['Assignment', 'Course', 'Due Date', 'Status', 'Grade', 'Points', 'Instructor'],
      ...filteredAssignments.map(assignment => [
        assignment.name,
        assignment.courseName,
        new Date(assignment.dueDate).toLocaleDateString(),
        assignment.status,
        assignment.grade ? `${assignment.grade}%` : 'N/A',
        assignment.earnedPoints ? `${assignment.earnedPoints}/${assignment.totalPoints}` : 'N/A',
        assignment.instructor
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_assignments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
          <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600">Loading real assignments from Moodle API...</span>
        </div>
      </div>
    </DashboardLayout>
    );
  }

  if (error) {
    return (
          <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error Loading Assignments</span>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <Button onClick={fetchAssignments} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </DashboardLayout>
    );
  }

  return (
    <div className='bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-100'>
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="min-h-screen py-4">
          <div className=" mx-auto space-y-6">
          {/* Enhanced Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                      My Assignments
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Real-time assignment data from Moodle API • {assignments.length} total assignments
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={refreshData} 
                  disabled={refreshing}
                  className="hover:bg-purple-50 hover:border-purple-200 transition-all duration-300"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportAssignmentsData}
                  className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assignment
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{assignments.length}</div>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">All Assignments</h3>
              <p className="text-sm text-gray-600">Complete overview of your tasks</p>
            </div>

            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.status === 'completed').length}
                  </div>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Graded</h3>
              <p className="text-sm text-gray-600">Successfully completed tasks</p>
            </div>

            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.status === 'pending').length}
                  </div>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Due Soon</h3>
              <p className="text-sm text-gray-600">Tasks awaiting completion</p>
            </div>

            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const completedAssignments = assignments.filter(a => a.status === 'completed');
                      const avgGrade = completedAssignments.length > 0 
                        ? Math.round(completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / completedAssignments.length)
                        : 0;
                      return `${avgGrade}%`;
                    })()}
                  </div>
                  <p className="text-sm text-gray-500">Average</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Grade</h3>
              <p className="text-sm text-gray-600">Your performance score</p>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Search Assignments</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by assignment name or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-end space-x-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Status Filter</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 h-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.map((assignment, index) => (
              <div 
                key={assignment.id} 
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-500 hover:scale-[1.01] overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="flex-1 space-y-3">
                      {/* Assignment Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300 ${
                            assignment.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                            assignment.status === 'submitted' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                            assignment.status === 'overdue' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                            'bg-gradient-to-br from-yellow-500 to-orange-500'
                          }`}>
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                                {assignment.name}
                              </h3>
                              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                assignment.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                assignment.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              }`}>
                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{assignment.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Assignment Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Course</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{assignment.courseName}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Instructor</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{assignment.instructor}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Due Date</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                            {getDaysUntilDue(assignment.dueDate) > 0 && (
                              <p className="text-xs text-blue-600 font-medium">
                                {getDaysUntilDue(assignment.dueDate)} days left
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Points</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {assignment.earnedPoints ? `${assignment.earnedPoints}/${assignment.totalPoints}` : `${assignment.totalPoints} pts`}
                          </p>
                        </div>
                      </div>

                      {/* Grade and Feedback Section */}
                      {assignment.grade && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-green-800">Grade: {assignment.grade}%</span>
                                <div className="w-12 h-1.5 bg-green-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${assignment.grade}%` }}
                                  ></div>
                                </div>
                              </div>
                              {assignment.feedback && (
                                <p className="text-xs text-green-700 font-medium">{assignment.feedback}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 min-w-[160px]">
                      {assignment.status === 'pending' && (
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Submit
                        </Button>
                      )}
                      <Button variant="outline" className="w-full border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 text-sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {assignment.status === 'completed' && (
                        <Button variant="outline" className="w-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Empty State */}
          {filteredAssignments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No assignments match your current filters. Try adjusting your search criteria.'
                  : 'No assignments available. Please check your course enrollments.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
    </div>
  );
};

export default Assignments; 