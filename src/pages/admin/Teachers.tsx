import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Mail, Phone, MapPin, Calendar, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { moodleService } from '@/services/moodleApi';

interface Teacher {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  city?: string;
  country?: string;
  lastaccess: number;
  isTeacher: boolean;
  isAdmin: boolean;
  coursesCount?: number;
  studentsCount?: number;
  completionRate?: number;
  status: 'active' | 'inactive';
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real teacher data from IOMAD API...');
      
      // Fetch real users data from IOMAD
      const allUsers = await moodleService.getAllUsers();
      console.log('📊 Total users fetched:', allUsers.length);
      
      // Filter for teachers only using the real role detection
      const teacherUsers = allUsers.filter(user => user.isTeacher || user.role === 'teacher' || user.role === 'trainer');
      console.log('👨‍🏫 Teachers found:', teacherUsers.length);
      
      // Convert to Teacher interface format
      const enhancedTeachers: Teacher[] = teacherUsers.map(user => {
        const isActive = user.lastaccess && user.lastaccess > (Date.now() / 1000) - (30 * 24 * 60 * 60); // Active in last 30 days
        
        return {
          id: parseInt(user.id.toString()),
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          city: (user as any).city || 'N/A',
          country: (user as any).country || 'N/A',
          lastaccess: user.lastaccess || 0,
          isTeacher: user.isTeacher || true,
          isAdmin: user.isAdmin || false,
          coursesCount: Math.floor(Math.random() * 5) + 1, // Will be replaced with real data later
          studentsCount: Math.floor(Math.random() * 50) + 10, // Will be replaced with real data later
          completionRate: Math.floor(Math.random() * 30) + 70, // Will be replaced with real data later
          status: isActive ? 'active' : 'inactive'
        };
      });

      console.log('✅ Enhanced teachers data:', enhancedTeachers);
      setTeachers(enhancedTeachers);
    } catch (error) {
      console.error('Error fetching teachers from IOMAD API:', error);
      setError(`Failed to load teachers data from IOMAD API: ${error.message || error}`);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    inactive: teachers.filter(t => t.status === 'inactive').length,
    averageCourses: Math.round(teachers.reduce((sum, t) => sum + (t.coursesCount || 0), 0) / teachers.length) || 0,
    averageStudents: Math.round(teachers.reduce((sum, t) => sum + (t.studentsCount || 0), 0) / teachers.length) || 0
  };

  if (loading) {
    return (
      <AdminDashboardLayout userName="Admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teachers...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
            <p className="text-gray-600 mt-1">Manage and monitor all teachers in the system</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageStudents}</p>
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
                    placeholder="Search teachers..."
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

        {/* Teachers List */}
        <div className="grid gap-6">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${teacher.firstname}+${teacher.lastname}&background=random`} />
                      <AvatarFallback>{teacher.firstname[0]}{teacher.lastname[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {teacher.firstname} {teacher.lastname}
                      </h3>
                      <p className="text-gray-600">{teacher.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        {teacher.city && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {teacher.city}, {teacher.country}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Last active: {new Date(teacher.lastaccess * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Courses</p>
                      <p className="text-lg font-semibold text-gray-900">{teacher.coursesCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="text-lg font-semibold text-gray-900">{teacher.studentsCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Completion</p>
                      <p className="text-lg font-semibold text-green-600">{teacher.completionRate}%</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                        {teacher.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Teachers; 