import React, { useState, useEffect } from 'react';
import { School, Search, Plus, Users, MapPin, Calendar, Award, TrendingUp, Building2, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { moodleService } from '@/services/moodleApi';

interface School {
  id: number;
  name: string;
  shortname?: string;
  address?: string;
  city?: string;
  country?: string;
  postcode?: string;
  teachersCount?: number;
  studentsCount?: number;
  coursesCount?: number;
  status: 'active' | 'inactive';
  created: number;
  lastAccess?: number;
}

const Schools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [companiesData, usersData, coursesData] = await Promise.all([
        moodleService.getCompanies(),
        moodleService.getAllUsers(),
        moodleService.getAllCourses()
      ]);
      
      // Enhance school data with additional information
      const enhancedSchools: School[] = companiesData.map(company => {
        // Calculate school-specific metrics
        const schoolUsers = usersData.filter(user => 
          user.roles && user.roles.some((role: any) => 
            role.contextlevel === 10 && role.roleid === 1 // Assuming roleid 1 is for school users
          )
        );
        
        const schoolTeachers = schoolUsers.filter(user => user.isTeacher);
        const schoolStudents = schoolUsers.filter(user => user.isStudent);
        
        const isActive = true; // Default to active since we don't have lastaccess
        
        return {
          id: parseInt(company.id),
          name: company.name,
          shortname: company.shortname,
          address: company.address,
          city: company.city,
          country: company.country,
          postcode: '',
          teachersCount: schoolTeachers.length,
          studentsCount: schoolStudents.length,
          coursesCount: company.courseCount || 0, // Real course count from API
          status: isActive ? 'active' : 'inactive',
          created: Date.now() / 1000,
          lastAccess: Date.now() / 1000
        };
      });

      setSchools(enhancedSchools);
      setUsers(usersData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching schools from IOMAD API:', error);
      setError(`Failed to load schools data from IOMAD API: ${error.message || error}`);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.shortname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || school.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === 'active').length,
    inactive: schools.filter(s => s.status === 'inactive').length,
    totalTeachers: schools.reduce((sum, s) => sum + (s.teachersCount || 0), 0),
    totalStudents: schools.reduce((sum, s) => sum + (s.studentsCount || 0), 0),
    totalCourses: schools.reduce((sum, s) => sum + (s.coursesCount || 0), 0)
  };

  if (loading) {
    return (
      <AdminDashboardLayout userName="Admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schools...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout userName="Admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
            <p className="text-gray-600 mt-1">Manage all schools and educational institutions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add School
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <School className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Schools</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Schools</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {school.name}
                    </CardTitle>
                    {school.shortname && (
                      <p className="text-sm text-gray-600 mt-1">{school.shortname}</p>
                    )}
                  </div>
                  <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                    {school.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {school.city}, {school.country}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Teachers</p>
                    <p className="text-lg font-semibold text-gray-900">{school.teachersCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-lg font-semibold text-gray-900">{school.studentsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Courses</p>
                    <p className="text-lg font-semibold text-gray-900">{school.coursesCount}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date(school.created * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  {school.lastAccess && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Last Access:</span>
                      <span className="text-gray-900">
                        {new Date(school.lastAccess * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Schools; 