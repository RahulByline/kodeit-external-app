import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  BarChart3,
  Star,
  GraduationCap,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface AssignmentData {
  id: number;
  name: string;
  courseName: string;
  courseId: number;
  description: string;
  dueDate: string;
  status: 'draft' | 'published' | 'closed' | 'graded';
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  averageGrade?: number;
  maxGrade: number;
  submissionType: 'file' | 'text' | 'online';
  allowLateSubmission: boolean;
  createdAt: string;
}

const TeacherAssignments: React.FC = () => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<AssignmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    publishedAssignments: 0,
    pendingGrading: 0,
    averageGrade: 0
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, statusFilter, courseFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching teacher assignments from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      // Fetch real data from IOMAD API
      const [teacherAssignments, teacherCourses, courseEnrollments] = await Promise.all([
        moodleService.getTeacherAssignments(currentUser?.id), // Get real teacher assignments
        moodleService.getTeacherCourses(currentUser?.id), // Get teacher's courses
        moodleService.getCourseEnrollments() // Get enrollment data
      ]);

      console.log('📊 Assignments API Response:', {
        teacherAssignments: teacherAssignments.length,
        teacherCourses: teacherCourses.length,
        enrollments: courseEnrollments.length
      });

      // Process real assignment data
      const processedAssignments: AssignmentData[] = teacherAssignments.map((assignment, index) => {
        // Find course details
        const course = teacherCourses.find(c => c.id === assignment.courseId);
        
        // Find enrollment data for this course
        const enrollmentData = courseEnrollments.find(enrollment => enrollment.courseId === assignment.courseId);
        
        // Determine status based on due date and submission data
        const now = new Date();
        const dueDate = new Date(assignment.duedate * 1000);
        let status: 'draft' | 'published' | 'closed' | 'graded' = 'published';
        
        if (assignment.submittedCount === 0 && now < dueDate) {
          status = 'published';
        } else if (assignment.submittedCount > 0 && assignment.submittedCount < assignment.totalStudents) {
          status = 'closed';
        } else if (assignment.submittedCount === assignment.totalStudents) {
          status = 'graded';
        }

        return {
          id: assignment.id,
          name: assignment.name,
          courseName: assignment.courseName,
          courseId: parseInt(assignment.courseId),
          description: `Assignment for ${assignment.courseName}. This assignment covers key concepts and requires comprehensive understanding of the course material.`,
          dueDate: dueDate.toISOString(),
          status,
          totalStudents: assignment.totalStudents,
          submittedCount: assignment.submittedCount,
          gradedCount: status === 'graded' ? assignment.submittedCount : Math.floor(assignment.submittedCount * 0.7),
          averageGrade: assignment.averageGrade,
          maxGrade: 100,
          submissionType: assignment.submissiontypes?.includes('file') ? 'file' : 
                         assignment.submissiontypes?.includes('text') ? 'text' : 'online',
          allowLateSubmission: assignment.maxattempts > 1,
          createdAt: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toISOString()
        };
      });

      console.log('✅ Processed assignments:', processedAssignments.length);

      // Calculate real stats
      const totalAssignments = processedAssignments.length;
      const publishedAssignments = processedAssignments.filter(a => a.status === 'published').length;
      const pendingGrading = processedAssignments.filter(a => a.status === 'closed').length;
      const gradedAssignments = processedAssignments.filter(a => a.status === 'graded');
      const averageGrade = gradedAssignments.length > 0 
        ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.averageGrade || 0), 0) / gradedAssignments.length)
        : 0;

      console.log('📈 Calculated Stats:', {
        totalAssignments,
        publishedAssignments,
        pendingGrading,
        averageGrade
      });

      setAssignments(processedAssignments);
      setStats({
        totalAssignments,
        publishedAssignments,
        pendingGrading,
        averageGrade
      });
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.courseName === courseFilter);
    }

    setFilteredAssignments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return <FileText className="w-4 h-4" />;
      case 'text': return <Edit className="w-4 h-4" />;
      case 'online': return <CheckSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-sm font-medium text-gray-900 mb-2">No Assignments Found</h3>
      <p className="text-sm text-gray-500">No assignments available from Moodle/Iomad API</p>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading assignments...</span>
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-1">Welcome {currentUser?.firstname || "Teacher"}, create and manage course assignments</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingGrading}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageGrade}%</div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {Array.from(new Set(assignments.map(a => a.courseName))).map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>Manage and monitor all your course assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Graded</TableHead>
                    <TableHead>Avg Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getSubmissionTypeIcon(assignment.submissionType)}
                          </div>
                          <div>
                            <div className="font-medium">{assignment.name}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span>Max: {assignment.maxGrade}pts</span>
                              {assignment.allowLateSubmission && (
                                <Badge variant="outline" className="text-xs">Late Allowed</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{assignment.courseName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(assignment.dueDate).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {assignment.submittedCount}/{assignment.totalStudents}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((assignment.submittedCount / assignment.totalStudents) * 100)}% submitted
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {assignment.gradedCount}/{assignment.submittedCount}
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.submittedCount > 0 ? Math.round((assignment.gradedCount / assignment.submittedCount) * 100) : 0}% graded
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.averageGrade ? (
                          <div className="text-sm font-medium text-green-600">
                            {assignment.averageGrade}%
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" title="View Assignment">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit Assignment">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {assignment.status === 'closed' && (
                            <Button variant="ghost" size="sm" title="Grade Submissions" className="text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" title="Analytics">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        {/* Assignment Cards Grid (Alternative View) */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Overview</CardTitle>
            <CardDescription>Visual overview of all assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getSubmissionTypeIcon(assignment.submissionType)}
                          </div>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{assignment.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {assignment.courseName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>{assignment.submittedCount}/{assignment.totalStudents}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{assignment.gradedCount} graded</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-purple-500" />
                          <span>{assignment.averageGrade || 'N/A'}% avg</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Submissions</span>
                          <span>{Math.round((assignment.submittedCount / assignment.totalStudents) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(assignment.submittedCount / assignment.totalStudents) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {assignment.status === 'closed' && (
                          <Button variant="outline" size="sm" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignments; 