import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Star,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Filter
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface ReportData {
  id: number;
  title: string;
  type: 'performance' | 'attendance' | 'progress' | 'analytics' | 'summary';
  courseName?: string;
  dateRange: string;
  status: 'generated' | 'pending' | 'failed';
  generatedAt: string;
  fileSize?: string;
  downloadUrl?: string;
  summary: {
    totalStudents: number;
    averageGrade: number;
    completionRate: number;
    attendanceRate: number;
  };
}

const TeacherReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from Moodle API
      const [allCourses] = await Promise.all([
        moodleService.getAllCourses()
      ]);

      // Get teacher courses
      const teacherCourses = allCourses
        .filter(course => course.visible !== 0 && course.categoryid && course.categoryid <= 10)
        .slice(0, 8);
      
      // Generate mock reports based on courses
      const mockReports: ReportData[] = [];
      
      teacherCourses.forEach((course, courseIndex) => {
        // Performance Report
        mockReports.push({
          id: courseIndex * 5 + 1,
          title: `${course.shortname} Performance Report`,
          type: 'performance',
          courseName: course.fullname,
          dateRange: 'Last 30 Days',
          status: 'generated',
          generatedAt: new Date(Date.now() - courseIndex * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '2.3 MB',
          downloadUrl: '#',
          summary: {
            totalStudents: Math.floor(Math.random() * 30) + 10,
            averageGrade: Math.floor(Math.random() * 30) + 70,
            completionRate: Math.floor(Math.random() * 30) + 70,
            attendanceRate: Math.floor(Math.random() * 20) + 80
          }
        });

        // Attendance Report
        mockReports.push({
          id: courseIndex * 5 + 2,
          title: `${course.shortname} Attendance Report`,
          type: 'attendance',
          courseName: course.fullname,
          dateRange: 'This Semester',
          status: 'generated',
          generatedAt: new Date(Date.now() - courseIndex * 2 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '1.8 MB',
          downloadUrl: '#',
          summary: {
            totalStudents: Math.floor(Math.random() * 30) + 10,
            averageGrade: 0,
            completionRate: 0,
            attendanceRate: Math.floor(Math.random() * 20) + 80
          }
        });

        // Progress Report
        mockReports.push({
          id: courseIndex * 5 + 3,
          title: `${course.shortname} Progress Report`,
          type: 'progress',
          courseName: course.fullname,
          dateRange: 'Last 3 Months',
          status: 'generated',
          generatedAt: new Date(Date.now() - courseIndex * 3 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '3.1 MB',
          downloadUrl: '#',
          summary: {
            totalStudents: Math.floor(Math.random() * 30) + 10,
            averageGrade: Math.floor(Math.random() * 30) + 70,
            completionRate: Math.floor(Math.random() * 30) + 70,
            attendanceRate: Math.floor(Math.random() * 20) + 80
          }
        });
      });

      // Add some general reports
      mockReports.push({
        id: 1000,
        title: 'Overall Teaching Performance',
        type: 'analytics',
        dateRange: 'This Academic Year',
        status: 'generated',
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        fileSize: '4.2 MB',
        downloadUrl: '#',
        summary: {
          totalStudents: 150,
          averageGrade: 82,
          completionRate: 78,
          attendanceRate: 85
        }
      });

      mockReports.push({
        id: 1001,
        title: 'Student Engagement Summary',
        type: 'summary',
        dateRange: 'Last 6 Months',
        status: 'pending',
        generatedAt: new Date().toISOString(),
        summary: {
          totalStudents: 0,
          averageGrade: 0,
          completionRate: 0,
          attendanceRate: 0
        }
      });

      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'attendance': return 'bg-green-100 text-green-800';
      case 'progress': return 'bg-purple-100 text-purple-800';
      case 'analytics': return 'bg-orange-100 text-orange-800';
      case 'summary': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    if (selectedType !== 'all' && report.type !== selectedType) return false;
    if (selectedCourse !== 'all' && report.courseName !== selectedCourse) return false;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading reports...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Welcome {currentUser?.firstname || "Teacher"}, generate and manage performance reports</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {Array.from(new Set(reports.map(r => r.courseName).filter(Boolean))).map(course => (
                      <SelectItem key={course} value={course || ''}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Reports Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge className={getReportTypeColor(report.type)}>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(report.status)}
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                {report.courseName && (
                  <CardDescription className="text-sm">
                    {report.courseName}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{report.dateRange}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>{report.summary.totalStudents} students</span>
                  </div>
                  {report.summary.averageGrade > 0 && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{report.summary.averageGrade}% avg</span>
                    </div>
                  )}
                  {report.summary.completionRate > 0 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>{report.summary.completionRate}% complete</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                  {report.fileSize && <span>{report.fileSize}</span>}
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {report.status === 'generated' && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                Generated this semester
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generated</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === 'generated').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for download
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
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.5 MB</div>
              <p className="text-xs text-muted-foreground">
                All reports combined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Generate common reports quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">Performance Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Attendance Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="text-sm">Progress Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-sm">Summary Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Report Activity</CardTitle>
            <CardDescription>Latest report generation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports
                .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                .slice(0, 5)
                .map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getReportTypeColor(report.type)}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{report.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(report.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      {report.status === 'generated' && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherReports; 