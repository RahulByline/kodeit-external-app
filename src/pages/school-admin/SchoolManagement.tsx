import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Settings, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  Save,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface SchoolUser {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
  lastaccess?: number;
  profileImage?: string;
  companyId?: number;
  status?: 'active' | 'suspended';
}

interface AvailableUser {
  id: number;
  username: string;
  fullname: string;
  email: string;
  currentRole: string;
  currentCompany: string;
  lastaccess?: number;
  profileImage?: string;
}

interface SchoolSettings {
  schoolInfo: {
    companyId: string;
    companyName: string;
    companyShortname: string;
    address: string;
    email: string;
    phone: string;
    description: string;
    city: string;
    country: string;
    url: string;
    logo?: string;
    suspended?: boolean;
    userCount?: number;
    courseCount?: number;
  };
  userStatistics: {
    totalUsers: number;
    teachers: number;
    students: number;
    admins: number;
    activeUsers?: number;
    inactiveUsers?: number;
  };
  courseStatistics?: {
    totalCourses: number;
    activeCourses: number;
    inactiveCourses: number;
    coursesWithEnrollments: number;
  };
  permissions: {
    canManageUsers: boolean;
    canManageRoles: boolean;
    canManageCourses: boolean;
    canManageEnrollments: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
  settings: {
    allowUserRegistration: boolean;
    requireApproval: boolean;
    maxUsers: number;
    maxCourses: number;
    autoEnrollment: boolean;
    emailNotifications: boolean;
    allowGuestAccess?: boolean;
    requireEmailVerification?: boolean;
    allowProfileEditing?: boolean;
    enableNotifications?: boolean;
  };
  recentActivity?: {
    lastUserLogin: number;
    recentEnrollments: number;
    newUsersThisMonth: number;
  };
}

const SchoolManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [schoolManagementData, setSchoolManagementData] = useState<any>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState('');

  useEffect(() => {
    fetchSchoolManagementData();
  }, []);

  const fetchSchoolManagementData = async () => {
    try {
      setLoading(true);
      
      console.log('🏫 Fetching school management data...');
      
      // First get the management data to extract the company ID
      const managementData = await moodleService.getSchoolManagementData(currentUser?.id);
      
      if (!managementData?.schoolInfo?.companyId) {
        console.error('❌ No company ID found for school admin');
        return;
      }

      // Now get the settings using the correct company ID
      const settingsData = await moodleService.getSchoolSettings(managementData.schoolInfo.companyId);

      setSchoolManagementData(managementData);
      setSchoolSettings(settingsData);

      console.log('✅ School management data loaded:', {
        managementData: !!managementData,
        settingsData: !!settingsData,
        companyId: managementData.schoolInfo.companyId
      });

    } catch (error) {
      console.error('❌ Error fetching school management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUserToSchool = async (userId: string, roleId?: string) => {
    try {
      if (!schoolManagementData?.schoolInfo?.companyId) {
        alert('School information not available');
        return;
      }

      const result = await moodleService.assignUserToSchool(
        userId, 
        schoolManagementData.schoolInfo.companyId,
        roleId
      );

      if (result.success) {
        alert(result.message);
        fetchSchoolManagementData(); // Refresh data
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error assigning user to school:', error);
      alert('Failed to assign user to school');
    }
  };

  const handleRemoveUserFromSchool = async (userId: string) => {
    try {
      if (!schoolManagementData?.schoolInfo?.companyId) {
        alert('School information not available');
        return;
      }

      const result = await moodleService.removeUserFromSchool(
        userId, 
        schoolManagementData.schoolInfo.companyId
      );

      if (result.success) {
        alert(result.message);
        fetchSchoolManagementData(); // Refresh data
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error removing user from school:', error);
      alert('Failed to remove user from school');
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      if (!schoolManagementData?.schoolInfo?.companyId) {
        alert('School information not available');
        return;
      }

      const result = await moodleService.assignRoleToSchoolUser(
        userId,
        roleId,
        schoolManagementData.schoolInfo.companyId
      );

      if (result.success) {
        alert(result.message);
        fetchSchoolManagementData(); // Refresh data
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error assigning role:', error);
      alert('Failed to assign role');
    }
  };

  const filteredCurrentUsers = schoolManagementData?.userManagement?.currentSchoolUsers?.filter((user: SchoolUser) => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  const filteredAvailableUsers = schoolManagementData?.userManagement?.availableUsers?.filter((user: AvailableUser) => {
    return user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (loading) {
    return (
      <DashboardLayout userRole="school_admin" userName={currentUser?.fullname || "School Admin"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading school management...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="school_admin" userName={currentUser?.fullname || "School Admin"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">School Management</h1>
            <p className="text-gray-600 mt-1">
              Manage {schoolManagementData?.schoolInfo?.companyName || 'your school'} settings and users
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* School Information */}
        {schoolManagementData?.schoolInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{schoolManagementData.schoolInfo.companyName}</h3>
                    <p className="text-gray-600">{schoolManagementData.schoolInfo.companyShortname}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{schoolManagementData.schoolInfo.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{schoolManagementData.schoolInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{schoolManagementData.schoolInfo.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{schoolManagementData.currentUsers?.total || 0}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{schoolManagementData.currentUsers?.teachers || 0}</div>
                      <div className="text-sm text-gray-600">Teachers</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{schoolManagementData.currentUsers?.students || 0}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{schoolManagementData.currentUsers?.admins || 0}</div>
                      <div className="text-sm text-gray-600">Admins</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Current Users</TabsTrigger>
            <TabsTrigger value="available">Available Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <Badge variant="secondary">{schoolManagementData?.currentUsers?.total || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Teachers</span>
                      <Badge variant="secondary">{schoolManagementData?.currentUsers?.teachers || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Students</span>
                      <Badge variant="secondary">{schoolManagementData?.currentUsers?.students || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Admins</span>
                      <Badge variant="secondary">{schoolManagementData?.currentUsers?.admins || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Available Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Available</span>
                      <Badge variant="secondary">{schoolManagementData?.availableUsers?.total || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Unassigned</span>
                      <Badge variant="secondary">{schoolManagementData?.availableUsers?.unassigned || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Schools</span>
                      <Badge variant="secondary">{schoolManagementData?.availableUsers?.otherSchools || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {schoolManagementData?.schoolSettings && Object.entries(schoolManagementData.schoolSettings).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <Badge variant={value ? "default" : "secondary"}>
                          {value ? "Yes" : "No"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Current Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current School Users</CardTitle>
                <CardDescription>Manage users currently assigned to your school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="school_admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Last Access</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCurrentUsers.map((user: SchoolUser) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.fullname ? user.fullname.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.fullname}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.lastaccess ? new Date(user.lastaccess * 1000).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'suspended' ? 'destructive' : 'default'}>
                            {user.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRemoveUserFromSchool(user.id.toString())}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Users Tab */}
          <TabsContent value="available" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Users</CardTitle>
                <CardDescription>Assign users to your school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search available users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Current Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAvailableUsers.map((user: AvailableUser) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.fullname ? user.fullname.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.fullname}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.currentRole}</Badge>
                        </TableCell>
                        <TableCell>{user.currentCompany}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAssignUserModal(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {schoolSettings && (
              <>
                {/* School Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      School Overview
                    </CardTitle>
                    <CardDescription>Comprehensive information about your school</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* School Information */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">School Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">School Name</label>
                            <div className="text-sm font-medium">{schoolSettings.schoolInfo.companyName}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Short Name</label>
                            <div className="text-sm">{schoolSettings.schoolInfo.companyShortname}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <div className="text-sm">{schoolSettings.schoolInfo.email}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <div className="text-sm">{schoolSettings.schoolInfo.phone}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Address</label>
                            <div className="text-sm">{schoolSettings.schoolInfo.address}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">City, Country</label>
                            <div className="text-sm">{schoolSettings.schoolInfo.city}, {schoolSettings.schoolInfo.country}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Website</label>
                            <div className="text-sm">{schoolSettings.schoolInfo.url}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <Badge variant={schoolSettings.schoolInfo.suspended ? "destructive" : "default"}>
                              {schoolSettings.schoolInfo.suspended ? "Suspended" : "Active"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* User Statistics */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">User Statistics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Total Users</span>
                            <Badge variant="outline">{schoolSettings.userStatistics.totalUsers}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Teachers</span>
                            <Badge variant="outline">{schoolSettings.userStatistics.teachers}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Students</span>
                            <Badge variant="outline">{schoolSettings.userStatistics.students}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Admins</span>
                            <Badge variant="outline">{schoolSettings.userStatistics.admins}</Badge>
                          </div>
                          {schoolSettings.userStatistics.activeUsers !== undefined && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Active Users</span>
                              <Badge variant="default">{schoolSettings.userStatistics.activeUsers}</Badge>
                            </div>
                          )}
                          {schoolSettings.userStatistics.inactiveUsers !== undefined && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Inactive Users</span>
                              <Badge variant="secondary">{schoolSettings.userStatistics.inactiveUsers}</Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Course Statistics */}
                      {schoolSettings.courseStatistics && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Course Statistics</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Courses</span>
                              <Badge variant="outline">{schoolSettings.courseStatistics.totalCourses}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Active Courses</span>
                              <Badge variant="default">{schoolSettings.courseStatistics.activeCourses}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Inactive Courses</span>
                              <Badge variant="secondary">{schoolSettings.courseStatistics.inactiveCourses}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">With Enrollments</span>
                              <Badge variant="outline">{schoolSettings.courseStatistics.coursesWithEnrollments}</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* System Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      System Settings
                    </CardTitle>
                    <CardDescription>Configure your school's system preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Registration & Access</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Allow User Registration</span>
                            <Badge variant={schoolSettings.settings.allowUserRegistration ? "default" : "secondary"}>
                              {schoolSettings.settings.allowUserRegistration ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Require Approval</span>
                            <Badge variant={schoolSettings.settings.requireApproval ? "default" : "secondary"}>
                              {schoolSettings.settings.requireApproval ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email Verification</span>
                            <Badge variant={schoolSettings.settings.requireEmailVerification ? "default" : "secondary"}>
                              {schoolSettings.settings.requireEmailVerification ? "Required" : "Optional"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Guest Access</span>
                            <Badge variant={schoolSettings.settings.allowGuestAccess ? "default" : "secondary"}>
                              {schoolSettings.settings.allowGuestAccess ? "Allowed" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">Limits & Notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Max Users</span>
                            <Badge variant="outline">{schoolSettings.settings.maxUsers}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Max Courses</span>
                            <Badge variant="outline">{schoolSettings.settings.maxCourses}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email Notifications</span>
                            <Badge variant={schoolSettings.settings.emailNotifications ? "default" : "secondary"}>
                              {schoolSettings.settings.emailNotifications ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Auto Enrollment</span>
                            <Badge variant={schoolSettings.settings.autoEnrollment ? "default" : "secondary"}>
                              {schoolSettings.settings.autoEnrollment ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                {schoolSettings.recentActivity && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Latest activity and engagement metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {schoolSettings.recentActivity.recentEnrollments}
                          </div>
                          <div className="text-sm text-gray-600">Recent Enrollments (7 days)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {schoolSettings.recentActivity.newUsersThisMonth}
                          </div>
                          <div className="text-sm text-gray-600">New Users This Month</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {schoolSettings.recentActivity.lastUserLogin > 0 
                              ? new Date(schoolSettings.recentActivity.lastUserLogin * 1000).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                          <div className="text-sm text-gray-600">Last User Login</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SchoolManagement; 