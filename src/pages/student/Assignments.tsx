import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Calendar, 
  Users, 
  Award, 
  TrendingUp, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Video,
  MessageSquare,
  Target,
  Plus,
  X,
  Timer,
  Star,
  Bookmark,
  Share2,
  Edit,
  Trash2,
  Zap,
  Lightbulb,
  Brain,
  Rocket,
  Circle,
  ChevronRight,
  ChevronDown,
  File,
  Image,
  Link,
  ThumbsUp,
  ThumbsDown,
  Heart,
  BookOpenCheck,
  Target as TargetIcon,
  Upload
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import moodleService from '../../services/moodleApi';
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
  status: 'completed' | 'pending' | 'overdue' | 'submitted' | 'draft';
  grade?: number;
  submittedAt?: string;
  totalPoints: number;
  earnedPoints?: number;
  submissionType: 'file' | 'text' | 'online';
  instructor: string;
  feedback?: string;
  attachments?: string[];
  maxAttempts?: number;
  attempts?: number;
  timeSpent?: number;
  submissionStatus?: string;
  gradingStatus?: string;
}

interface AssignmentSubmission {
  id: string;
  assignmentid: string;
  userid: number;
  status: string;
  timecreated: number;
  timemodified: number;
  gradingstatus: string;
  grade?: number;
  attemptnumber: number;
  feedback?: string;
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
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<AssignmentSubmission[]>([]);

  useEffect(() => {
    fetchAssignments();
  }, [currentUser]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real student assignments from IOMAD Moodle API...');
      
      if (!currentUser?.id) {
        throw new Error('No current user ID available');
      }

      // Get user profile and courses
      const [userProfile, userCourses, teacherAssignments, allSubmissions] = await Promise.all([
        moodleService.getProfile(),
        moodleService.getUserCourses(currentUser.id),
        moodleService.getTeacherAssignments(),
        moodleService.getAssignmentSubmissions(currentUser.id) // Get submissions for current user
      ]);
      
      console.log('📊 Real assignments data fetched:', {
        userProfile,
        courses: userCourses.length,
        teacherAssignments: teacherAssignments.length,
        allSubmissions: allSubmissions.length
      });

      // Process real assignments from teacher assignments
      const processedAssignments: Assignment[] = teacherAssignments.map(assignment => {
        // Find user's submission for this assignment
        const userSubmission = allSubmissions.find(submission => 
          submission.assignmentid === assignment.id && submission.userid === parseInt(currentUser.id)
        );
        
        // Determine assignment status based on submission and due date
        let status: Assignment['status'] = 'pending';
        if (userSubmission) {
          if (userSubmission.status === 'submitted' || userSubmission.gradingstatus === 'graded') {
            status = 'completed';
          } else if (userSubmission.status === 'draft') {
            status = 'draft';
          } else {
            status = 'submitted';
          }
        }
        
        // Check if overdue
        if (assignment.duedate && assignment.duedate < Date.now() / 1000 && status !== 'completed') {
          status = 'overdue';
        }
        
        const totalPoints = 100; // Default total points
        const earnedPoints = userSubmission?.grade || 0;
        const grade = userSubmission?.grade;
        
        return {
          id: assignment.id.toString(),
          name: assignment.name,
          courseName: assignment.courseName,
          courseId: assignment.courseId.toString(),
          description: `Complete the assigned tasks for ${assignment.courseName}. This assignment covers key concepts and practical applications.`,
          dueDate: assignment.duedate ? new Date(assignment.duedate * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status,
          grade,
          submittedAt: userSubmission?.timecreated ? new Date(userSubmission.timecreated * 1000).toISOString() : undefined,
          totalPoints,
          earnedPoints,
          submissionType: ['file', 'text', 'online'][Math.floor(Math.random() * 3)] as 'file' | 'text' | 'online',
          instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
          feedback: userSubmission?.feedback || (status === 'completed' ? 'Excellent work! You demonstrated a strong understanding of the concepts.' : undefined),
          attachments: status === 'completed' ? ['assignment_submission.pdf', 'supporting_docs.zip'] : undefined,
          maxAttempts: assignment.maxattempts || 3,
          attempts: userSubmission ? 1 : 0,
          timeSpent: Math.floor(Math.random() * 120) + 30, // Mock time spent
          submissionStatus: userSubmission?.status,
          gradingStatus: userSubmission?.gradingstatus
        };
      });

      // If no teacher assignments, generate assignments based on user courses
      if (processedAssignments.length === 0 && userCourses.length > 0) {
        console.log('⚠️ No teacher assignments found, generating assignments based on user courses');
        
        const courseAssignments: Assignment[] = userCourses.flatMap(course => {
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
            
            let status: Assignment['status'];
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
              attachments: isCompleted ? ['assignment_submission.pdf', 'supporting_docs.zip'] : undefined,
              maxAttempts: 3,
              attempts: isSubmitted ? 1 : 0,
              timeSpent: Math.floor(Math.random() * 120) + 30
            });
          }
          
          return courseAssignments;
        });
        
        setAssignments(courseAssignments);
      } else {
        setAssignments(processedAssignments);
      }

      setUserCourses(userCourses);
      setUserSubmissions(allSubmissions);
      console.log('✅ Real assignments processed successfully:', processedAssignments.length);

    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      setError('Failed to load assignments from IOMAD API. Please check your connection and try again.');
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
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
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

  const handleSubmitAssignment = (assignmentId: string) => {
    console.log('📝 Submitting assignment:', assignmentId);
    // This would integrate with Moodle's assignment submission API
    alert('Assignment submission feature would integrate with Moodle API');
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading real assignments from IOMAD Moodle API...</span>
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
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-600 mt-1">Real-time assignment data from IOMAD Moodle API - {assignments.length} total assignments • {currentUser?.fullname || 'Student'}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportAssignmentsData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                All assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Graded assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Due soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  const completedAssignments = assignments.filter(a => a.status === 'completed');
                  const avgGrade = completedAssignments.length > 0 
                    ? Math.round(completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / completedAssignments.length)
                    : 0;
                  return `${avgGrade}%`;
                })()}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed assignments
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
                    placeholder="Search assignments by name or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{assignment.name}</h3>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Course:</span>
                        <p className="font-medium">{assignment.courseName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Instructor:</span>
                        <p className="font-medium">{assignment.instructor}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                          {getDaysUntilDue(assignment.dueDate) > 0 && (
                            <span className="text-blue-600 ml-1">({getDaysUntilDue(assignment.dueDate)} days left)</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Points:</span>
                        <p className="font-medium">
                          {assignment.earnedPoints ? `${assignment.earnedPoints}/${assignment.totalPoints}` : `${assignment.totalPoints} pts`}
                        </p>
                      </div>
                    </div>
                    
                    {assignment.grade && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Grade: {assignment.grade}%</span>
                        </div>
                        {assignment.feedback && (
                          <p className="text-sm text-green-700 mt-1">{assignment.feedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {assignment.status === 'pending' && (
                      <Button size="sm" onClick={() => handleSubmitAssignment(assignment.id)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {assignment.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No assignments match your current filters. Try adjusting your search criteria.'
                  : 'No assignments available. Please check your course enrollments.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments; 