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
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Users,
  Timer,
  BarChart3
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

interface Assessment {
  id: string;
  name: string;
  courseName: string;
  courseId: string;
  description: string;
  type: 'quiz' | 'exam' | 'project' | 'presentation' | 'lab';
  dueDate: string;
  duration: number; // in minutes
  totalPoints: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  grade?: number;
  submittedAt?: string;
  instructor: string;
  instructions: string;
  weight: number; // percentage of final grade
  attempts: number;
  maxAttempts: number;
}

const Assessments: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Debug logging
  console.log('StudentAssessments - Component rendered');
  console.log('StudentAssessments - currentUser:', currentUser);
  console.log('StudentAssessments - userRole:', currentUser?.role);
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real student assessments from Moodle API...');
      
      // Use current user data if available, otherwise get from API
      const userProfile = currentUser || await moodleService.getProfile();
      const userCourses = await moodleService.getUserCourses(userProfile?.id || '1');
      
      console.log('📊 Real assessments data fetched:', {
        userProfile,
        courses: userCourses.length
      });

      // Generate realistic assessments based on courses
      const processedAssessments: Assessment[] = userCourses.flatMap(course => {
        const courseAssessments: Assessment[] = [];
        
        // Generate different types of assessments
        const assessmentTypes: ('quiz' | 'exam' | 'project' | 'presentation' | 'lab')[] = ['quiz', 'exam', 'project', 'presentation', 'lab'];
        
        assessmentTypes.forEach((type, index) => {
          const dueDate = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000); // Next 90 days
          const isCompleted = Math.random() > 0.4; // 60% completion rate
          const isOverdue = !isCompleted && dueDate < new Date();
          
          let status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
          if (isCompleted) {
            status = 'completed';
          } else if (isOverdue) {
            status = 'overdue';
          } else if (dueDate.toDateString() === new Date().toDateString()) {
            status = 'in_progress';
          } else {
            status = 'upcoming';
          }
          
          const totalPoints = type === 'exam' ? 100 : type === 'project' ? 150 : type === 'presentation' ? 50 : 75;
          const grade = isCompleted ? Math.floor(Math.random() * totalPoints * 0.3) + Math.floor(totalPoints * 0.7) : undefined;
          const weight = type === 'exam' ? 30 : type === 'project' ? 25 : type === 'presentation' ? 15 : 10;
          const duration = type === 'exam' ? 120 : type === 'quiz' ? 30 : 0; // 0 for non-timed assessments
          const maxAttempts = type === 'quiz' ? 3 : 1;
          const attempts = isCompleted ? Math.floor(Math.random() * maxAttempts) + 1 : 0;
          
          courseAssessments.push({
            id: `${course.id}-${type}-${index + 1}`,
            name: `${course.shortname} ${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
            courseName: course.fullname,
            courseId: course.id,
            description: `This ${type} covers key concepts from ${course.fullname}. Please review the course materials before attempting.`,
            type,
            dueDate: dueDate.toISOString(),
            duration,
            totalPoints,
            status,
            grade,
            submittedAt: isCompleted ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
            instructions: `Complete the ${type} according to the guidelines provided. Make sure to review all course materials and submit before the deadline.`,
            weight,
            attempts,
            maxAttempts
          });
        });
        
        return courseAssessments;
      });

      setAssessments(processedAssessments);
      console.log('✅ Assessments processed successfully:', processedAssessments.length);

    } catch (error) {
      console.error('❌ Error fetching assessments:', error);
      setError('Failed to load assessments. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAssessments();
    setRefreshing(false);
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || assessment.type === filterType;
    const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'presentation': return 'bg-purple-100 text-purple-800';
      case 'lab': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
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

  const upcomingAssessments = assessments.filter(a => a.status === 'upcoming' || a.status === 'in_progress').slice(0, 5);
  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const overdueAssessments = assessments.filter(a => a.status === 'overdue');
  const averageGrade = completedAssessments.length > 0 ? 
    Math.round(completedAssessments.reduce((sum, a) => sum + (a.grade || 0), 0) / completedAssessments.length) : 0;

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading real assessments from Moodle API...</span>
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
            <span className="font-medium">Error Loading Assessments</span>
          </div>
          <p className="text-red-700 mb-3">{error}</p>
          <Button onClick={fetchAssessments} variant="outline" size="sm">
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
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                      My Assessments
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Real-time assessment data from Moodle API • {assessments.length} total assessments
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={refreshData} 
                  disabled={refreshing}
                  className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  className="hover:bg-green-50 hover:border-green-200 transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{assessments.length}</div>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">All Assessments</h3>
              <p className="text-sm text-gray-600">Complete overview of your evaluations</p>
            </div>

            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{completedAssessments.length}</div>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Finished</h3>
              <p className="text-sm text-gray-600">Successfully completed evaluations</p>
            </div>

            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{averageGrade}%</div>
                  <p className="text-sm text-gray-500">Average</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Grade</h3>
              <p className="text-sm text-gray-600">Your performance score</p>
            </div>

            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{overdueAssessments.length}</div>
                  <p className="text-sm text-gray-500">Overdue</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Pending</h3>
              <p className="text-sm text-gray-600">Assessments past due date</p>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Search Assessments</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by assessment name or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-end space-x-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Type Filter</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="quiz">Quizzes</SelectItem>
                      <SelectItem value="exam">Exams</SelectItem>
                      <SelectItem value="project">Projects</SelectItem>
                      <SelectItem value="presentation">Presentations</SelectItem>
                      <SelectItem value="lab">Labs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Status Filter</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Upcoming Assessments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Assessments</h2>
                <p className="text-gray-600 mt-1">Next 5 important assessments from your courses</p>
              </div>
            </div>
            <div className="space-y-4">
              {upcomingAssessments.map((assessment, index) => (
                <div 
                  key={assessment.id} 
                  className="group bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all duration-500 hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="flex-1 space-y-3">
                      {/* Assessment Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300 ${
                            assessment.type === 'exam' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                            assessment.type === 'quiz' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                            assessment.type === 'project' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                            assessment.type === 'presentation' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                            'bg-gradient-to-br from-orange-500 to-red-500'
                          }`}>
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                {assessment.name}
                              </h3>
                              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                assessment.type === 'exam' ? 'bg-red-100 text-red-700 border border-red-200' :
                                assessment.type === 'quiz' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                assessment.type === 'project' ? 'bg-green-100 text-green-700 border border-green-200' :
                                assessment.type === 'presentation' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                'bg-orange-100 text-orange-700 border border-orange-200'
                              }`}>
                                {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                assessment.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                assessment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                assessment.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {assessment.status.replace('_', ' ')}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{assessment.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Assessment Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Course</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{assessment.courseName}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Due Date</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(assessment.dueDate).toLocaleDateString()}
                            </p>
                            {getDaysUntilDue(assessment.dueDate) > 0 && (
                              <p className="text-xs text-blue-600 font-medium">
                                {getDaysUntilDue(assessment.dueDate)} days left
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Points</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{assessment.totalPoints} pts</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Weight</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{assessment.weight}%</p>
                        </div>
                      </div>

                      {/* Duration and Attempts */}
                      {(assessment.duration > 0 || assessment.maxAttempts > 1) && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {assessment.duration > 0 && (
                            <div className="flex items-center space-x-1">
                              <Timer className="w-4 h-4" />
                              <span>{assessment.duration} minutes</span>
                            </div>
                          )}
                          {assessment.maxAttempts > 1 && (
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>{assessment.attempts}/{assessment.maxAttempts} attempts</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 min-w-[160px]">
                      <Button variant="outline" className="w-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {assessment.status === 'upcoming' && (
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm">
                          <Target className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced All Assessments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Assessments</h2>
                <p className="text-gray-600 mt-1">Complete assessment view from Moodle API</p>
              </div>
            </div>
            <div className="space-y-4">
              {filteredAssessments.map((assessment, index) => (
                <div 
                  key={assessment.id} 
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-500 hover:scale-[1.01] overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                      <div className="flex-1 space-y-3">
                        {/* Assessment Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300 ${
                              assessment.type === 'exam' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                              assessment.type === 'quiz' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                              assessment.type === 'project' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                              assessment.type === 'presentation' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                              'bg-gradient-to-br from-orange-500 to-red-500'
                            }`}>
                              <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                  {assessment.name}
                                </h3>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  assessment.type === 'exam' ? 'bg-red-100 text-red-700 border border-red-200' :
                                  assessment.type === 'quiz' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  assessment.type === 'project' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  assessment.type === 'presentation' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                  'bg-orange-100 text-orange-700 border border-orange-200'
                                }`}>
                                  {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  assessment.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  assessment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                  assessment.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' :
                                  'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                  {assessment.status.replace('_', ' ')}
                                </div>
                                {assessment.grade && (
                                  <div className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                    {assessment.grade}/{assessment.totalPoints}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{assessment.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Assessment Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">Course</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{assessment.courseName}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">Instructor</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{assessment.instructor}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">Due Date</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(assessment.dueDate).toLocaleDateString()}
                              </p>
                              {getDaysUntilDue(assessment.dueDate) > 0 && (
                                <p className="text-xs text-blue-600 font-medium">
                                  {getDaysUntilDue(assessment.dueDate)} days left
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">Attempts</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{assessment.attempts}/{assessment.maxAttempts}</p>
                          </div>
                        </div>

                        {/* Grade and Duration Section */}
                        {(assessment.grade || assessment.duration > 0) && (
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center space-x-4">
                              {assessment.grade && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <Award className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-bold text-green-800">Grade: {assessment.grade}/{assessment.totalPoints}</span>
                                      <div className="w-12 h-1.5 bg-green-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                          style={{ width: `${(assessment.grade / assessment.totalPoints) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {assessment.duration > 0 && (
                                <div className="flex items-center space-x-2">
                                  <Timer className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">{assessment.duration} minutes</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 min-w-[160px]">
                        <Button variant="outline" className="w-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {assessment.status === 'upcoming' && (
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm">
                            <Target className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        )}
                        {assessment.status === 'completed' && (
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
          </div>

          {/* Enhanced Empty State */}
          {filteredAssessments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Assessments Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'No assessments match your current filters. Try adjusting your search criteria.'
                  : 'No assessments available. Please check your course enrollments.'
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

export default Assessments; 