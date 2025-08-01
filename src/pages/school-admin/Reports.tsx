import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, FileText, Clock, CheckCircle, XCircle, Users, BarChart3, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface Report {
  id: number;
  name: string;
  type: 'academic' | 'attendance' | 'performance' | 'financial' | 'enrollment';
  status: 'generated' | 'pending' | 'failed';
  generatedBy: string;
  generatedAt: string;
  fileSize: string;
  recordCount: number;
  description: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, typeFilter, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Since there's no direct API for reports, we'll create mock data
      const mockReports: Report[] = [
        {
          id: 1,
          name: 'Student Performance Report Q1 2024',
          type: 'performance',
          status: 'generated',
          generatedBy: 'School Admin',
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '2.4 MB',
          recordCount: 156,
          description: 'Comprehensive analysis of student performance across all courses'
        },
        {
          id: 2,
          name: 'Course Enrollment Summary',
          type: 'enrollment',
          status: 'generated',
          generatedBy: 'System',
          generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '1.8 MB',
          recordCount: 89,
          description: 'Monthly enrollment statistics and trends'
        },
        {
          id: 3,
          name: 'Teacher Attendance Report',
          type: 'attendance',
          status: 'pending',
          generatedBy: 'School Admin',
          generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '0.9 MB',
          recordCount: 23,
          description: 'Teacher attendance and participation metrics'
        },
        {
          id: 4,
          name: 'Academic Progress Report',
          type: 'academic',
          status: 'generated',
          generatedBy: 'System',
          generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '3.2 MB',
          recordCount: 234,
          description: 'Detailed academic progress tracking for all students'
        },
        {
          id: 5,
          name: 'Financial Summary Q1',
          type: 'financial',
          status: 'failed',
          generatedBy: 'School Admin',
          generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: '0 MB',
          recordCount: 0,
          description: 'Financial overview and budget analysis'
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'academic':
        return <Badge className="bg-blue-100 text-blue-800">Academic</Badge>;
      case 'attendance':
        return <Badge className="bg-green-100 text-green-800">Attendance</Badge>;
      case 'performance':
        return <Badge className="bg-purple-100 text-purple-800">Performance</Badge>;
      case 'financial':
        return <Badge className="bg-yellow-100 text-yellow-800">Financial</Badge>;
      case 'enrollment':
        return <Badge className="bg-orange-100 text-orange-800">Enrollment</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Generated</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by generating a new report.</p>
      <div className="mt-6">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userRole="school_admin" userName="School Admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <p className="text-muted-foreground">Generate and manage school reports</p>
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
    <DashboardLayout userRole="school_admin" userName="School Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Generate and manage school reports</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.reduce((sum, report) => sum + report.recordCount, 0)}
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
                    placeholder="Search reports..."
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
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="enrollment">Enrollment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>A list of all generated reports and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated By</TableHead>
                    <TableHead>Generated At</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">{report.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(report.type)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.generatedBy}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{report.fileSize}</TableCell>
                      <TableCell>{report.recordCount}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" disabled={report.status !== 'generated'}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled={report.status !== 'generated'}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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

export default Reports; 