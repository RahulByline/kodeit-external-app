import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Plus, Download, Eye, Award, Clock, CheckCircle, XCircle, Users, BarChart3, Edit, Trash2, Save, RefreshCw } from 'lucide-react';
import { moodleService } from '@/services/moodleApi';
import { useAuth } from '@/context/AuthContext';

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
  courseId?: number;
  courseName?: string;
}

interface CertificationFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  duration: string;
  requirements: string[];
  courseId?: number;
}

const Certifications: React.FC = () => {
  const { currentUser } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [formData, setFormData] = useState<CertificationFormData>({
    name: '',
    description: '',
    status: 'pending',
    duration: '3 months',
    requirements: ['Complete all course modules', 'Pass final assessment']
  });

  useEffect(() => {
    fetchCertifications();
    fetchAvailableCourses();
  }, []);

  // Auto-refresh every 30 seconds to keep data live
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing certifications data...');
      fetchCertifications();
      setLastSync(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterCertifications();
  }, [certifications, searchTerm, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCertifications();
      await fetchAvailableCourses();
      setLastSync(new Date());
      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Error during manual refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching live certifications from IOMAD API...');
      
      // Use the new live API function
      const result = await moodleService.getCertificationPrograms();
      
      if (result && result.success) {
        setCertifications(result.data || []);
        console.log('✅ Live certifications loaded:', result.data?.length || 0);
      } else {
        console.error('❌ Failed to load certifications:', result?.message || 'Unknown error');
        setCertifications([]);
      }
    } catch (error) {
      console.error('❌ Error fetching certifications:', error);
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const courses = await moodleService.getAllCourses();
      setAvailableCourses(courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAvailableCourses([]);
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

  const handleCreateCertification = async () => {
    try {
      console.log('🔍 Creating new live certification:', formData);
      
      // Use the live API function to create certification
      const result = await moodleService.createCertificationProgram({
        name: formData.name,
        description: formData.description,
        courseId: formData.courseId!,
        status: formData.status,
        duration: formData.duration,
        requirements: formData.requirements
      });

      if (result.success) {
        // Add the new certification to the list
        setCertifications(prev => [result.data, ...prev]);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          status: 'pending',
          duration: '3 months',
          requirements: ['Complete all course modules', 'Pass final assessment']
        });
        
        setShowCreateDialog(false);
        
        console.log('✅ Live certification created successfully');
        alert('Certification created successfully in IOMAD!');
      } else {
        console.error('❌ Failed to create certification:', result.message);
        alert(`Failed to create certification: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating certification:', error);
      alert('Failed to create certification. Please try again.');
    }
  };

  const handleEditCertification = async () => {
    if (!editingCertification) return;
    
    try {
      console.log('🔍 Updating live certification:', editingCertification.id);
      
      // Use the live API function to update certification
      const result = await moodleService.updateCertificationProgram(editingCertification.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        duration: formData.duration,
        requirements: formData.requirements
      });

      if (result.success) {
        // Update the certification in the list
        setCertifications(prev => prev.map(cert => 
          cert.id === editingCertification.id 
            ? { ...cert, ...formData }
            : cert
        ));
        
        setShowEditDialog(false);
        setEditingCertification(null);
        
        console.log('✅ Live certification updated successfully');
        alert('Certification updated successfully in IOMAD!');
      } else {
        console.error('❌ Failed to update certification:', result.message);
        alert(`Failed to update certification: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating certification:', error);
      alert('Failed to update certification. Please try again.');
    }
  };

  const handleDeleteCertification = async (certificationId: number) => {
    if (!confirm('Are you sure you want to delete this certification? This action cannot be undone.')) return;
    
    try {
      console.log('🔍 Deleting live certification:', certificationId);
      
      // Use the live API function to delete certification
      const result = await moodleService.deleteCertificationProgram(certificationId);

      if (result.success) {
        // Remove from the list
        setCertifications(prev => prev.filter(cert => cert.id !== certificationId));
        
        console.log('✅ Live certification deleted successfully');
        alert('Certification deleted successfully from IOMAD!');
      } else {
        console.error('❌ Failed to delete certification:', result.message);
        alert(`Failed to delete certification: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error deleting certification:', error);
      alert('Failed to delete certification. Please try again.');
    }
  };

  const openEditDialog = (certification: Certification) => {
    setEditingCertification(certification);
    setFormData({
      name: certification.name,
      description: certification.description,
      status: certification.status,
      duration: certification.duration,
      requirements: certification.requirements,
      courseId: certification.courseId
    });
    setShowEditDialog(true);
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
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Certification
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userRole="school_admin" userName={currentUser?.fullname || "School Admin"}>
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
    <DashboardLayout userRole="school_admin" userName={currentUser?.fullname || "School Admin"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
            <p className="text-muted-foreground">Manage certification programs and track student progress</p>
            <p className="text-xs text-gray-500 mt-1">
              Last synced: {lastSync.toLocaleTimeString()} | Auto-refresh every 30s
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Certification
            </Button>
          </div>
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
                          {certification.courseName && (
                            <div className="text-xs text-blue-600">Based on: {certification.courseName}</div>
                          )}
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
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(certification)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteCertification(certification.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Create Certification Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Certification</DialogTitle>
              <DialogDescription>
                Create a new certification program based on existing courses.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Certification Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter certification name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter certification description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course">Based on Course</Label>
                <Select value={formData.courseId?.toString()} onValueChange={(value) => setFormData({ ...formData, courseId: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'pending') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3 months"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCertification}>
                <Save className="w-4 h-4 mr-2" />
                Create Certification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Certification Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Certification</DialogTitle>
              <DialogDescription>
                Update the certification program details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Certification Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter certification name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter certification description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course">Based on Course</Label>
                <Select value={formData.courseId?.toString()} onValueChange={(value) => setFormData({ ...formData, courseId: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'pending') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3 months"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCertification}>
                <Save className="w-4 h-4 mr-2" />
                Update Certification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Certifications; 