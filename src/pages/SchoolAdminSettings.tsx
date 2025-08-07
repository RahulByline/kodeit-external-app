import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Users, 
  User,
  BookOpen, 
  GraduationCap, 
  Settings, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Check,
  X,
  AlertCircle,
  Info,
  Shield,
  Database,
  Key,
  Bell,
  Palette,
  Camera,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface ProfileData {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  profileImage: string;
  role: string;
  department: string;
  lastAccess: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface SchoolData {
  id: number;
  name: string;
  shortname: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  established: string;
  type: string;
  status: 'active' | 'inactive' | 'suspended';
  totalUsers: number;
  totalCourses: number;
  totalTeachers: number;
  totalStudents: number;
  settings: {
    allowEnrollments: boolean;
    requireApproval: boolean;
    maxStudentsPerCourse: number;
    autoBackup: boolean;
    notificationsEnabled: boolean;
    theme: string;
    language: string;
    timezone: string;
  };
}

const SchoolAdminSettings: React.FC = () => {
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      
      // Get current user's company first
      const currentUserCompany = await moodleService.getCurrentUserCompany();
      console.log('Current user company:', currentUserCompany);
      
      // Get current user's profile from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('Current user from localStorage:', currentUser);
      
      // Fetch real data from Moodle API
      const [companies, users, courses] = await Promise.all([
        moodleService.getCompanies(),
        moodleService.getAllUsers(),
        moodleService.getAllCourses()
      ]);

      // Use current user's company or fallback to first company
      let targetCompany = currentUserCompany;
      if (!targetCompany && companies.length > 0) {
        targetCompany = companies[0] as any;
        console.log('No current user company found, using first company:', targetCompany);
      }
      
      // Count users by role using enhanced detection
      const teachers = users.filter((user: any) => {
        const role = moodleService.detectUserRoleEnhanced(user.username, user, user.roles || []);
        return role === 'teacher' || role === 'trainer';
      });
      
      const students = users.filter((user: any) => {
        const role = moodleService.detectUserRoleEnhanced(user.username, user, user.roles || []);
        return role === 'student';
      });

      // Find current user's profile in the users array
      let currentUserProfile = null;
      if (currentUser.id) {
        currentUserProfile = users.find((user: any) => user.id === currentUser.id);
        console.log('Found current user profile:', currentUserProfile);
      }
      
      // If current user not found in users array, try to find by username
      if (!currentUserProfile && currentUser.username) {
        currentUserProfile = users.find((user: any) => user.username === currentUser.username);
        console.log('Found current user profile by username:', currentUserProfile);
      }
      
      // Fallback to first school admin if current user not found
      if (!currentUserProfile) {
        currentUserProfile = users.find((user: any) => {
          const username = user.username.toLowerCase();
          const roles = user.roles || [];
          
          // Check for specific school admin usernames
          if (username === 'school_admin1' || username.includes('school_admin')) {
            return true;
          }
          
          // Check for company manager roles
          const hasManagerRole = roles.some((role: any) => 
            role.shortname?.toLowerCase().includes('manager') ||
            role.shortname?.toLowerCase().includes('admin') ||
            role.shortname?.toLowerCase().includes('companymanager')
          );
          
          return hasManagerRole;
        }) as any || users.find((user: any) => 
          user.username.toLowerCase().includes('admin') || 
          user.username.toLowerCase().includes('manager')
        ) as any || users[0] as any;
        
        console.log('Using fallback user profile:', currentUserProfile);
      }

      const processedSchoolData: SchoolData = {
        id: parseInt(targetCompany?.id) || 1,
        name: targetCompany?.name || 'KodeIT Learning Institute',
        shortname: targetCompany?.shortname || 'KodeIT',
        description: targetCompany?.description || 'Leading technology education institute providing comprehensive training programs.',
        address: targetCompany?.address || '123 Technology Street',
        city: targetCompany?.city || 'Tech City',
        country: targetCompany?.country || 'United States',
        phone: targetCompany?.phone || '+1 (555) 123-4567',
        email: targetCompany?.email || 'info@kodeit.edu',
        website: targetCompany?.website || 'https://kodeit.edu',
        established: targetCompany?.established || '2020',
        type: targetCompany?.type || 'Educational Institution',
        status: targetCompany?.suspended === '1' ? 'suspended' : 'active',
        totalUsers: users.length,
        totalCourses: courses.length,
        totalTeachers: teachers.length,
        totalStudents: students.length,
        settings: {
          allowEnrollments: true,
          requireApproval: false,
          maxStudentsPerCourse: 50,
          autoBackup: true,
          notificationsEnabled: true,
          theme: 'light',
          language: 'English',
          timezone: 'UTC-5'
        }
      };

      // Process profile data with enhanced role detection for current user
      const detectedRole = moodleService.detectUserRoleEnhanced(
        currentUserProfile.username, 
        currentUserProfile, 
        currentUserProfile.roles || []
      );
      
      const processedProfileData: ProfileData = {
        id: parseInt(currentUserProfile.id) || 1,
        username: currentUserProfile.username || 'school_admin1',
        firstname: currentUserProfile.firstname || 'School',
        lastname: currentUserProfile.lastname || 'Administrator',
        email: currentUserProfile.email || 'school.admin@kodeit.edu',
        phone: currentUserProfile.phone1 || currentUserProfile.phone2 || '+1 (555) 123-4567',
        profileImage: currentUserProfile.profileimageurl || '/placeholder.svg',
        role: detectedRole === 'school_admin' ? 'School Administrator' : 
              detectedRole === 'admin' ? 'System Administrator' : 
              detectedRole === 'teacher' ? 'Teacher' : 
              detectedRole === 'student' ? 'Student' : 'School Administrator',
        department: currentUserProfile.department || 'Administration',
        lastAccess: currentUserProfile.lastaccess ? new Date(parseInt(currentUserProfile.lastaccess) * 1000).toISOString() : new Date().toISOString(),
        createdAt: currentUserProfile.timecreated ? new Date(parseInt(currentUserProfile.timecreated) * 1000).toISOString() : new Date().toISOString(),
        status: currentUserProfile.suspended === '1' ? 'suspended' : 'active'
      };

      setSchoolData(processedSchoolData);
      setProfileData(processedProfileData);
      
      console.log('✅ School Admin Settings - Dynamic data loaded for company:', targetCompany?.name);
      console.log('✅ Current user profile loaded:', processedProfileData.username);
    } catch (error) {
      console.error('Error fetching school data:', error);
      // Set default data if API fails
      setSchoolData({
        id: 1,
        name: 'KodeIT Learning Institute',
        shortname: 'KodeIT',
        description: 'Leading technology education institute providing comprehensive training programs.',
        address: '123 Technology Street',
        city: 'Tech City',
        country: 'United States',
        phone: '+1 (555) 123-4567',
        email: 'info@kodeit.edu',
        website: 'https://kodeit.edu',
        established: '2020',
        type: 'Educational Institution',
        status: 'active',
        totalUsers: 0,
        totalCourses: 0,
        totalTeachers: 0,
        totalStudents: 0,
        settings: {
          allowEnrollments: true,
          requireApproval: false,
          maxStudentsPerCourse: 50,
          autoBackup: true,
          notificationsEnabled: true,
          theme: 'light',
          language: 'English',
          timezone: 'UTC-5'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!schoolData) return;
    
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    if (!schoolData) return;
    
    setSchoolData(prev => prev ? {
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    } : null);
  };

  const updateSchoolInfo = (key: string, value: any) => {
    if (!schoolData) return;
    
    setSchoolData(prev => prev ? {
      ...prev,
      [key]: value
    } : null);
  };

  const updateProfileInfo = (key: string, value: any) => {
    if (!profileData) return;
    
    setProfileData(prev => prev ? {
      ...prev,
      [key]: value
    } : null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'information', label: 'School Information', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API Configuration', icon: Key }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Company Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>School Overview</span>
            {schoolData && (
              <Badge variant="outline" className="ml-2">
                {schoolData.name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Overview of your school's statistics and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Active School</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Currently managing: <strong>{schoolData?.name}</strong> with {schoolData?.totalUsers || 0} total users
            </p>
          </div>
        </CardContent>
      </Card>

      {/* School Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolData?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolData?.totalCourses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolData?.totalTeachers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolData?.totalStudents || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* School Status */}
      <Card>
        <CardHeader>
          <CardTitle>School Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge 
              className={schoolData?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            >
              {schoolData?.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              School is currently {schoolData?.status === 'active' ? 'operational' : 'suspended'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Manage Courses
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>My Profile</span>
            {profileData && (
              <Badge variant="outline" className="ml-2">
                {profileData.firstname} {profileData.lastname}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Current User</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              You are currently viewing and editing your profile: <strong>{profileData?.firstname} {profileData?.lastname}</strong> ({profileData?.username})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Image */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={profileData?.profileImage || '/placeholder.svg'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-medium">{profileData?.firstname} {profileData?.lastname}</h3>
              <p className="text-sm text-muted-foreground">{profileData?.role}</p>
              <p className="text-sm text-muted-foreground">{profileData?.department}</p>
              <p className="text-sm text-blue-600">@{profileData?.username}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profile-firstname">First Name</Label>
              <Input
                id="profile-firstname"
                value={profileData?.firstname || ''}
                onChange={(e) => updateProfileInfo('firstname', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-lastname">Last Name</Label>
              <Input
                id="profile-lastname"
                value={profileData?.lastname || ''}
                onChange={(e) => updateProfileInfo('lastname', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileData?.email || ''}
                onChange={(e) => updateProfileInfo('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={profileData?.phone || ''}
                onChange={(e) => updateProfileInfo('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-username">Username</Label>
              <Input
                id="profile-username"
                value={profileData?.username || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="profile-role">Role</Label>
              <Input
                id="profile-role"
                value={profileData?.role || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Account Status</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  className={profileData?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {profileData?.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Last Access</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {profileData?.lastAccess ? new Date(profileData.lastAccess).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <Label>Account Created</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <Label>User ID</Label>
              <p className="text-sm text-muted-foreground mt-1">{profileData?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInformationTab = () => (
    <div className="space-y-6">
      {/* Company Information Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>School Information</span>
            {schoolData && (
              <Badge variant="outline" className="ml-2">
                {schoolData.name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage your school's basic information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Current School</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              You are currently viewing and editing information for: <strong>{schoolData?.name}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={schoolData?.name || ''}
                onChange={(e) => updateSchoolInfo('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shortname">Short Name</Label>
              <Input
                id="shortname"
                value={schoolData?.shortname || ''}
                onChange={(e) => updateSchoolInfo('shortname', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={schoolData?.description || ''}
                onChange={(e) => updateSchoolInfo('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={schoolData?.email || ''}
                onChange={(e) => updateSchoolInfo('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={schoolData?.phone || ''}
                onChange={(e) => updateSchoolInfo('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={schoolData?.website || ''}
                onChange={(e) => updateSchoolInfo('website', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="established">Established</Label>
              <Input
                id="established"
                value={schoolData?.established || ''}
                onChange={(e) => updateSchoolInfo('established', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={schoolData?.address || ''}
                onChange={(e) => updateSchoolInfo('address', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={schoolData?.city || ''}
                onChange={(e) => updateSchoolInfo('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={schoolData?.country || ''}
                onChange={(e) => updateSchoolInfo('country', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Institution Type</Label>
              <Input
                id="type"
                value={schoolData?.type || ''}
                onChange={(e) => updateSchoolInfo('type', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowEnrollments">Allow Student Enrollments</Label>
              <p className="text-sm text-muted-foreground">Enable students to enroll in courses</p>
            </div>
            <Switch
              id="allowEnrollments"
              checked={schoolData?.settings.allowEnrollments || false}
              onCheckedChange={(checked) => updateSetting('allowEnrollments', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireApproval">Require Approval</Label>
              <p className="text-sm text-muted-foreground">Require admin approval for enrollments</p>
            </div>
            <Switch
              id="requireApproval"
              checked={schoolData?.settings.requireApproval || false}
              onCheckedChange={(checked) => updateSetting('requireApproval', checked)}
            />
          </div>
          <div>
            <Label htmlFor="maxStudents">Maximum Students per Course</Label>
            <Input
              id="maxStudents"
              type="number"
              value={schoolData?.settings.maxStudentsPerCourse || 50}
              onChange={(e) => updateSetting('maxStudentsPerCourse', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">Automatic Backup</Label>
              <p className="text-sm text-muted-foreground">Enable automatic system backups</p>
            </div>
            <Switch
              id="autoBackup"
              checked={schoolData?.settings.autoBackup || false}
              onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
            />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={schoolData?.settings.timezone || 'UTC-5'}
              onValueChange={(value) => updateSetting('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="language">Default Language</Label>
            <Select
              value={schoolData?.settings.language || 'English'}
              onValueChange={(value) => updateSetting('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Security Notice</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              These settings affect the security of your school's data. Please configure carefully.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="passwordPolicy">Password Policy</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (6 characters)</SelectItem>
                  <SelectItem value="standard">Standard (8 characters, mixed)</SelectItem>
                  <SelectItem value="strong">Strong (10 characters, complex)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Enable system-wide notifications</p>
            </div>
            <Switch
              id="notificationsEnabled"
              checked={schoolData?.settings.notificationsEnabled || false}
              onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Course Updates</Label>
                <p className="text-sm text-muted-foreground">Notify about course changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>System Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive system maintenance alerts</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 mt-1">
              Light Mode (Default)
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Theme is set to light mode for all users
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Animations</Label>
                <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">API Information</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Configure API endpoints and authentication settings for external integrations.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiUrl">Moodle API URL</Label>
              <Input
                id="apiUrl"
                type="url"
                defaultValue="https://kodeit.legatoserver.com/webservice/rest/server.php"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                defaultValue="••••••••••••••••••••••••••••••••"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                defaultValue="moodle_mobile_app"
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'profile':
        return renderProfileTab();
      case 'information':
        return renderInformationTab();
      case 'settings':
        return renderSettingsTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'api':
        return renderApiTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="school_admin" userName="School Admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
            <p className="text-muted-foreground">Loading school information...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
            <p className="text-muted-foreground">Manage your school's configuration and settings</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm">Settings saved successfully!</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <X className="w-4 h-4" />
            <span className="text-sm">Failed to save settings. Please try again.</span>
          </div>
        )}

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </CardHeader>
          <CardContent>
            {renderTabContent()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SchoolAdminSettings; 