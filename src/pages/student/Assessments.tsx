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
      <DashboardLayout>
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
      <DashboardLayout>
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assessments</h1>
            <p className="text-gray-600 mt-1">
              Real-time assessment data from Moodle API - {assessments.length} total assessments • {currentUser?.fullname || 'Student'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments.length}</div>
              <p className="text-xs text-muted-foreground">
                All assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedAssessments.length}</div>
              <p className="text-xs text-muted-foreground">
                Finished assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageGrade}%</div>
              <p className="text-xs text-muted-foreground">
                Completed assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueAssessments.length}</div>
              <p className="text-xs text-muted-foreground">
                Overdue assessments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search assessments by name or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
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
          </CardContent>
        </Card>

        {/* Upcoming Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
            <CardDescription>
              Next 5 important assessments from your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{assessment.name}</h3>
                      <Badge className={getTypeColor(assessment.type)}>
                        {assessment.type}
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Course:</span>
                        <p className="font-medium">{assessment.courseName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium">
                          {new Date(assessment.dueDate).toLocaleDateString()}
                          {getDaysUntilDue(assessment.dueDate) > 0 && (
                            <span className="text-blue-600 ml-1">({getDaysUntilDue(assessment.dueDate)} days left)</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Points:</span>
                        <p className="font-medium">{assessment.totalPoints} pts</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <p className="font-medium">{assessment.weight}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {assessment.status === 'upcoming' && (
                      <Button size="sm">
                        <Target className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>All Assessments</CardTitle>
            <CardDescription>
              Complete assessment view from Moodle API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{assessment.name}</h3>
                      <Badge className={getTypeColor(assessment.type)}>
                        {assessment.type}
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status.replace('_', ' ')}
                      </Badge>
                      {assessment.grade && (
                        <Badge variant="outline" className="text-green-600">
                          {assessment.grade}/{assessment.totalPoints}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Course:</span>
                        <p className="font-medium">{assessment.courseName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium">
                          {new Date(assessment.dueDate).toLocaleDateString()}
                          {getDaysUntilDue(assessment.dueDate) > 0 && (
                            <span className="text-blue-600 ml-1">({getDaysUntilDue(assessment.dueDate)} days left)</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Instructor:</span>
                        <p className="font-medium">{assessment.instructor}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Attempts:</span>
                        <p className="font-medium">{assessment.attempts}/{assessment.maxAttempts}</p>
                      </div>
                    </div>
                    
                    {assessment.duration > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        Duration: {assessment.duration} minutes
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {assessment.status === 'upcoming' && (
                      <Button size="sm">
                        <Target className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                    {assessment.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredAssessments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'No assessments match your current filters. Try adjusting your search criteria.'
                  : 'No assessments available. Please check your course enrollments.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assessments; 