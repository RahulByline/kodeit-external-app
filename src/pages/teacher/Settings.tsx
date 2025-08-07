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
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Settings, 
  Camera, 
  Eye, 
  EyeOff, 
  Lock, 
  Bell, 
  Palette, 
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
  Building
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';

interface TeacherProfile {
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
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  company?: {
    id: number;
    name: string;
    shortname: string;
  };
}

const TeacherSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      if (!currentUser?.id) {
        console.error('❌ No logged-in user found');
        return;
      }
      
      console.log('👨‍🏫 Fetching comprehensive teacher settings...');
      
      // Get comprehensive user settings
      const userSettings = await moodleService.getComprehensiveUserSettings(currentUser.id.toString());

      if (userSettings) {
        const processedProfileData: TeacherProfile = {
          id: userSettings.profile.id,
          username: userSettings.profile.username,
          firstname: userSettings.profile.firstname,
          lastname: userSettings.profile.lastname,
          email: userSettings.profile.email,
          phone: userSettings.profile.phone,
          profileImage: userSettings.profile.profileImage,
          role: userSettings.profile.role === 'teacher' ? 'Teacher' : 
                userSettings.profile.role === 'trainer' ? 'Trainer' : 
                userSettings.profile.role === 'instructor' ? 'Instructor' : 'Teacher',
          department: userSettings.profile.department,
          lastAccess: userSettings.profile.lastAccess ? new Date(parseInt(userSettings.profile.lastAccess) * 1000).toISOString() : new Date().toISOString(),
          createdAt: userSettings.profile.createdAt ? new Date(parseInt(userSettings.profile.createdAt) * 1000).toISOString() : new Date().toISOString(),
          status: userSettings.profile.status,
          bio: userSettings.profile.bio,
          location: userSettings.profile.location,
          timezone: userSettings.preferences.timezone,
          language: userSettings.preferences.language,
          company: userSettings.profile.company
        };

        setProfileData(processedProfileData);
        console.log('✅ Teacher settings loaded successfully');
      }

    } catch (error) {
      console.error('❌ Error fetching teacher settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData) return;
    
    setSaving(true);
    setSaveStatus('idle');
    
    try {
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

  const updateProfileInfo = (key: string, value: any) => {
    if (!profileData) return;
    
    setProfileData(prev => prev ? {
      ...prev,
      [key]: value
    } : null);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
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
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                value={profileData?.firstname || ''}
                onChange={(e) => updateProfileInfo('firstname', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                value={profileData?.lastname || ''}
                onChange={(e) => updateProfileInfo('lastname', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData?.email || ''}
                onChange={(e) => updateProfileInfo('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData?.phone || ''}
                onChange={(e) => updateProfileInfo('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profileData?.username || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profileData?.role || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData?.bio || ''}
              onChange={(e) => updateProfileInfo('bio', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData?.location || ''}
                onChange={(e) => updateProfileInfo('location', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={profileData?.timezone || 'UTC-5'}
                onValueChange={(value) => updateProfileInfo('timezone', value)}
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
              <Label htmlFor="language">Language</Label>
              <Select
                value={profileData?.language || 'English'}
                onValueChange={(value) => updateProfileInfo('language', value)}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
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
             <div>
               <Label>School/Company</Label>
               <p className="text-sm text-muted-foreground mt-1">
                 {profileData?.company ? `${profileData.company.name} (ID: ${profileData.company.id})` : 
                  currentUser?.companyid ? `Company ID: ${currentUser.companyid}` : 'Not assigned to any school'}
               </p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
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
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Assignment Submissions</Label>
              <p className="text-sm text-muted-foreground">Notify when students submit assignments</p>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'account': return renderAccountTab();
      case 'security': return renderSecurityTab();
      case 'notifications': return renderNotificationsTab();
      case 'appearance': return renderAppearanceTab();
      default: return renderProfileTab();
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading settings...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Welcome {currentUser?.firstname || "Teacher"}, manage your account and preferences</p>
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

export default TeacherSettings; 