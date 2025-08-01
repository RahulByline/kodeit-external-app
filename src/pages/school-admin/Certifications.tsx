import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, Award, Clock, CheckCircle, XCircle, Users, BarChart3 } from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface Certification {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
  duration: string;
  requirements: string[];
  createdAt: string;
}

const Certifications: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  useEffect(() => {
    filterCertifications();
  }, [certifications, searchTerm, statusFilter]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      // Since there's no direct API for certifications, we'll create mock data based on courses
      const courses = await moodleService.getAllCourses();
      
      // Convert courses to certifications format
      const mockCertifications: Certification[] = courses.slice(0, 5).map((course, index) => ({
        id: parseInt(course.id),
        name: `${course.fullname} Certification`,
        description: course.summary || 'Professional certification program',
        status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'inactive' : 'pending',
        totalStudents: Math.floor(Math.random() * 50) + 10,
        completedStudents: Math.floor(Math.random() * 30) + 5,
        completionRate: Math.floor(Math.random() * 40) + 60,
        duration: `${Math.floor(Math.random() * 6) + 3} months`,
        requirements: [
          'Complete all course modules',
          'Pass final assessment',
          'Submit portfolio',
          'Attend workshops'
        ],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setCertifications(mockCertifications);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCertifications = () => {
    let filtered = certifications;

    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    setFilteredCertifications(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <Award className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No certifications found</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new certification program.</p>
      <div className="mt-6">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Certification
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
              <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
              <p className="text-muted-foreground">Manage certification programs and track student progress</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
            <p className="text-muted-foreground">Manage certification programs and track student progress</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Certification
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certifications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certifications.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certifications.reduce((sum, cert) => sum + cert.totalStudents, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certifications.length > 0 
                  ? Math.round(certifications.reduce((sum, cert) => sum + cert.completionRate, 0) / certifications.length)
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
                    placeholder="Search certifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Certification Programs</CardTitle>
            <CardDescription>A list of all certification programs and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCertifications.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertifications.map((certification) => (
                    <TableRow key={certification.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{certification.name}</div>
                          <div className="text-sm text-muted-foreground">{certification.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(certification.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {certification.completedStudents}/{certification.totalStudents}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${certification.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{certification.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{certification.duration}</TableCell>
                      <TableCell>
                        {new Date(certification.createdAt).toLocaleDateString()}
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

export default Certifications; 