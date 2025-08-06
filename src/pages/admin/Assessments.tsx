import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Plus, Download, Eye, FileText, Calendar, User, AlertCircle, CheckCircle, Clock, Edit, Trash2, BarChart3 } from 'lucide-react';
import { moodleService } from '@/services/moodleApi';
import { useAuth } from '@/context/AuthContext';

interface Assessment {
  id: number;
  name: string;
  courseName: string;
  type: 'quiz' | 'assignment' | 'exam' | 'project';
  status: 'draft' | 'active' | 'completed';
  totalStudents: number;
  submittedStudents: number;
  averageScore: number;
  dueDate: string;
  duration: string;
  passingScore: number;
  createdAt: string;
  teacher: string;
}

const AdminAssessments: React.FC = () => {
  const { currentUser } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchTerm, typeFilter, statusFilter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from Moodle API
      const [allCourses, allUsers] = await Promise.all([
        moodleService.getAllCourses(),
        moodleService.getAllUsers()
      ]);

      // Get teachers
      const teachers = allUsers.filter(user => user.isTeacher);
      
      // Generate assessments based on real courses
      const mockAssessments: Assessment[] = allCourses.flatMap((course, courseIndex) => {
        const courseAssessments: Assessment[] = [];
        
        // Generate different types of assessments for each course
        const assessmentTypes: ('quiz' | 'assignment' | 'exam' | 'project')[] = ['quiz', 'assignment', 'exam', 'project'];
        
        assessmentTypes.forEach((type, index) => {
          const isCompleted = Math.random() > 0.3; // 70% completion rate
          const isActive = !isCompleted && Math.random() > 0.5;
          
          let status: 'draft' | 'active' | 'completed';
          if (isCompleted) {
            status = 'completed';
          } else if (isActive) {
            status = 'active';
          } else {
            status = 'draft';
          }
          
          const teacher = teachers.length > 0 ? teachers[courseIndex % teachers.length] : null;
          
          courseAssessments.push({
            id: courseIndex * 10 + index + 1,
            name: `${course.shortname} ${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
            courseName: course.fullname,
            type,
            status,
            totalStudents: Math.floor(Math.random() * 30) + 10,
            submittedStudents: Math.floor(Math.random() * 25) + 5,
            averageScore: Math.floor(Math.random() * 30) + 70,
            dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            duration: `${Math.floor(Math.random() * 2) + 1} hour${Math.floor(Math.random() * 2) + 1 > 1 ? 's' : ''}`,
            passingScore: 70,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            teacher: teacher ? `${teacher.firstname} ${teacher.lastname}` : 'Unknown Teacher'
          });
        });
        
        return courseAssessments;
      });

      setAssessments(mockAssessments);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    let filtered = assessments;

    if (searchTerm) {
      filtered = filtered.filter(assessment => 
        assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === statusFilter);
    }

    setFilteredAssessments(filtered);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'quiz':
        return <Badge className="bg-blue-100 text-blue-800">Quiz</Badge>;
      case 'assignment':
        return <Badge className="bg-green-100 text-green-800">Assignment</Badge>;
      case 'exam':
        return <Badge className="bg-red-100 text-red-800">Exam</Badge>;
      case 'project':
        return <Badge className="bg-purple-100 text-purple-800">Project</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments found</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new assessment.</p>
      <div className="mt-6">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin"}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
              <p className="text-muted-foreground">Manage all assessments across the platform</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">...</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
            <p className="text-muted-foreground">Manage all assessments across the platform • {currentUser?.fullname || 'Admin'}</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments.filter(a => a.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments.reduce((sum, assessment) => sum + assessment.totalStudents, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments.length > 0 
                  ? Math.round(assessments.reduce((sum, assessment) => sum + assessment.averageScore, 0) / assessments.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Assessments</CardTitle>
            <CardDescription>A comprehensive list of all assessments across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAssessments.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assessment.name}</div>
                          <div className="text-sm text-muted-foreground">{assessment.duration}</div>
                        </div>
                      </TableCell>
                      <TableCell>{assessment.courseName}</TableCell>
                      <TableCell>{assessment.teacher}</TableCell>
                      <TableCell>{getTypeBadge(assessment.type)}</TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {assessment.submittedStudents}/{assessment.totalStudents}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{assessment.averageScore}%</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(assessment.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAssessments; 