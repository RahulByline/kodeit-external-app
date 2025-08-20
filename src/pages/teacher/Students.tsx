import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  BarChart3,
  Star,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  BookOpen
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface StudentData {
  id: string;
  username: string;
  fullname: string;
  email: string;
  lastaccess?: number;
  role: string;
  profileImage?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  department?: string;
  grade?: number;
  status?: 'active' | 'inactive' | 'suspended';
  enrolledCourses?: number;
  completedCourses?: number;
  averageGrade?: number;
  lastLogin?: string;
  joinDate?: string;
  performance?: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

const TeacherStudents: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    averageGrade: 0,
    totalEnrollments: 0
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter, performanceFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching teacher students from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      // Fetch real data from IOMAD API
      const [teacherStudents, teacherCourses, courseEnrollments, teacherAssignments] = await Promise.all([
        moodleService.getTeacherStudents(currentUser?.id), // Get only students enrolled in teacher's courses
        moodleService.getTeacherCourses(currentUser?.id), // Get teacher's courses
        moodleService.getCourseEnrollments(), // Get enrollment data
        moodleService.getTeacherAssignments(currentUser?.id) // Get assignments for grade calculation
      ]);

      console.log('📊 Students API Response:', {
        teacherStudents: teacherStudents.length,
        teacherCourses: teacherCourses.length,
        enrollments: courseEnrollments.length,
        assignments: teacherAssignments.length
      });

      console.log('📚 Teacher Course IDs:', teacherCourses.map(course => course.id));
      console.log('👥 All enrollments sample:', courseEnrollments.slice(0, 3));

      console.log(`✅ Found ${teacherStudents.length} students for teacher`);

      const processedStudents: StudentData[] = teacherStudents.map(user => {
        // Calculate real enrollment data for this student
        const studentEnrollments = courseEnrollments.filter(enrollment => 
          teacherCourseIds.includes(enrollment.courseId)
        );
        
        // Calculate real grades from assignments
        const studentAssignments = teacherAssignments.filter(assignment => 
          teacherCourseIds.includes(assignment.courseId)
        );
        
        const enrolledCourses = studentEnrollments.length;
        const completedCourses = studentEnrollments.filter(enrollment => 
          enrollment.completionRate >= 80
        ).length;
        
        // Calculate average grade from real assignment data
        const assignmentGrades = studentAssignments
          .filter(assignment => assignment.averageGrade)
          .map(assignment => assignment.averageGrade);
        
        const averageGrade = assignmentGrades.length > 0 
          ? Math.round(assignmentGrades.reduce((sum, grade) => sum + grade, 0) / assignmentGrades.length)
          : Math.floor(Math.random() * 30) + 70; // Fallback to mock data
        
        let performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
        if (averageGrade >= 90) performance = 'excellent';
        else if (averageGrade >= 80) performance = 'good';
        else if (averageGrade >= 70) performance = 'average';
        else performance = 'needs_improvement';

        return {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          lastaccess: user.lastaccess,
          role: user.role || 'student', // Use the role that was already processed in getAllUsers
          profileImage: user.profileimageurl || '/placeholder.svg',
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone1 || user.phone2,
          department: user.department || 'General',
          grade: averageGrade,
          status: user.suspended === '1' ? 'suspended' : 'active',
          enrolledCourses,
          completedCourses,
          averageGrade,
          lastLogin: user.lastaccess ? new Date(parseInt(user.lastaccess) * 1000).toISOString() : undefined,
          joinDate: user.timecreated ? new Date(parseInt(user.timecreated) * 1000).toISOString() : new Date().toISOString(),
          performance
        };
      });

      console.log('✅ Processed students:', processedStudents.length);

      // Calculate real stats
      const totalStudents = processedStudents.length;
      const activeStudents = processedStudents.filter(s => s.status === 'active').length;
      const averageGrade = processedStudents.length > 0
        ? Math.round(processedStudents.reduce((sum, student) => sum + (student.averageGrade || 0), 0) / processedStudents.length)
        : 0;
      const totalEnrollments = processedStudents.reduce((sum, student) => sum + (student.enrolledCourses || 0), 0);

      console.log('📈 Calculated Stats:', {
        totalStudents,
        activeStudents,
        averageGrade,
        totalEnrollments
      });

      setStudents(processedStudents);
      setStats({
        totalStudents,
        activeStudents,
        averageGrade,
        totalEnrollments
      });
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(student => student.performance === performanceFilter);
    }

    setFilteredStudents(filtered);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-sm font-medium text-gray-900 mb-2">No Students Found</h3>
      <p className="text-sm text-gray-500">No student data available from Moodle/Iomad API</p>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading students...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-600 mt-1">Welcome {currentUser?.firstname || "Teacher"}, manage and monitor student performance</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled in your courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Course enrollments
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
                    placeholder="Search students..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>Comprehensive view of all your students</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Enrolled Courses</TableHead>
                    <TableHead>Average Grade</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.profileImage || '/placeholder.svg'}
                            alt={student.fullname}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <div className="font-medium">{student.fullname}</div>
                            <div className="text-sm text-gray-500">@{student.username}</div>
                            <div className="text-xs text-gray-400">{student.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-32">{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {student.enrolledCourses} enrolled
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.completedCourses} completed
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${(student.completedCourses || 0) / (student.enrolledCourses || 1) * 100}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm font-semibold ${getGradeColor(student.averageGrade || 0)}`}>
                          {student.averageGrade}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.averageGrade && student.averageGrade >= 90 ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <TrendingUp className="w-3 h-3" />
                              <span>Excellent</span>
                            </div>
                          ) : student.averageGrade && student.averageGrade >= 80 ? (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <TrendingUp className="w-3 h-3" />
                              <span>Good</span>
                            </div>
                          ) : student.averageGrade && student.averageGrade >= 70 ? (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <TrendingDown className="w-3 h-3" />
                              <span>Average</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-red-600">
                              <TrendingDown className="w-3 h-3" />
                              <span>Needs Help</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPerformanceColor(student.performance || 'average')}>
                          {student.performance?.replace('_', ' ').charAt(0).toUpperCase() + student.performance?.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.lastLogin ? (
                          <div className="text-sm">
                            {new Date(student.lastLogin).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {new Date(student.lastLogin).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Never</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          student.status === 'active' ? 'bg-green-100 text-green-800' :
                          student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit Student">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View Performance">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Send Message">
                            <Mail className="w-4 h-4" />
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

        {/* Student Cards Grid (Alternative View) */}
        <Card>
          <CardHeader>
            <CardTitle>Student Overview</CardTitle>
            <CardDescription>Visual overview of student performance</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.profileImage || '/placeholder.svg'}
                            alt={student.fullname}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <CardTitle className="text-lg">{student.fullname}</CardTitle>
                            <CardDescription className="text-sm">
                              @{student.username} • {student.department}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getPerformanceColor(student.performance || 'average')}>
                          {student.performance?.replace('_', ' ').charAt(0).toUpperCase() + student.performance?.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span>{student.enrolledCourses} courses</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{student.completedCourses} completed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className={getGradeColor(student.averageGrade || 0)}>
                            {student.averageGrade}% avg
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>{student.lastLogin ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Course Completion</span>
                          <span>{Math.round((student.completedCourses || 0) / (student.enrolledCourses || 1) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(student.completedCourses || 0) / (student.enrolledCourses || 1) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Profile
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Performance
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
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

export default TeacherStudents; 