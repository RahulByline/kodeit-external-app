import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

interface UserProfile {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  department?: string;
  role: string;
  lastaccess?: string;
  profileimageurl?: string;
  company?: {
    id: number;
    name: string;
    shortname: string;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  assignmentReminders: boolean;
  gradeUpdates: boolean;
  courseAnnouncements: boolean;
  weeklyReports: boolean;
}

const StudentSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    courseAnnouncements: true,
    weeklyReports: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      if (!currentUser?.id) {
        setError('No logged-in user found');
        return;
      }
      const userSettings = await moodleService.getComprehensiveUserSettings(currentUser.id.toString());
      if (userSettings) {
        const processedProfile: UserProfile = {
          id: userSettings.profile.id.toString(),
          username: userSettings.profile.username,
          firstname: userSettings.profile.firstname,
          lastname: userSettings.profile.lastname,
          email: userSettings.profile.email,
          phone: userSettings.profile.phone,
          department: userSettings.profile.department,
          role: userSettings.profile.role,
          lastaccess: userSettings.profile.lastAccess ? new Date(parseInt(userSettings.profile.lastAccess) * 1000).toLocaleString() : 'Never',
          profileimageurl: userSettings.profile.profileImage,
          company: userSettings.profile.company
        };
        setProfile(processedProfile);
        console.log('✅ Student settings loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error fetching student settings:', error);
      setError('Failed to load profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Profile saved successfully');
      // Show success message or update UI
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Notification settings saved successfully');
      // Show success message or update UI
    } catch (error) {
      console.error('❌ Error saving notifications:', error);
      setError('Failed to save notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Password changed successfully');
      setPassword('');
      setConfirmPassword('');
      // Show success message
    } catch (error) {
      console.error('❌ Error changing password:', error);
      setError('Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
          <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600">Loading profile from Moodle API...</span>
        </div>
      </div>
    </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
          <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error Loading Profile</span>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <Button onClick={fetchProfile} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences • {currentUser?.fullname || 'Student'}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={fetchProfile}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  value={profile?.firstname || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, firstname: e.target.value } : null)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  value={profile?.lastname || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, lastname: e.target.value } : null)}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={profile?.department || ''} onValueChange={(value) => setProfile(prev => prev ? { ...prev, department: value } : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile?.username || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Username cannot be changed</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Last updated: {profile?.lastaccess || 'Never'}
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Change Password</span>
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} disabled={saving || !password || !confirmPassword}>
                <Lock className="w-4 h-4 mr-2" />
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Settings</span>
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming assignments</p>
                </div>
                <Switch
                  checked={notifications.assignmentReminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, assignmentReminders: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Grade Updates</Label>
                  <p className="text-sm text-gray-500">Notify when new grades are posted</p>
                </div>
                <Switch
                  checked={notifications.gradeUpdates}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, gradeUpdates: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Course Announcements</Label>
                  <p className="text-sm text-gray-500">Receive course announcements</p>
                </div>
                <Switch
                  checked={notifications.courseAnnouncements}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, courseAnnouncements: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Receive weekly progress reports</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Notifications'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your account details and security information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">User ID</Label>
                <p className="text-sm">{profile?.id}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <Badge variant="outline">{profile?.role}</Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Last Access</Label>
                <p className="text-sm">{profile?.lastaccess}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">School/Company</Label>
                <p className="text-sm">
                  {profile?.company ? `${profile.company.name} (ID: ${profile.company.id})` : 
                   currentUser?.companyid ? `Company ID: ${currentUser.companyid}` : 'Not assigned to any school'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings; 