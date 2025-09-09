import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Info
} from 'lucide-react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

interface NavigationSettings {
  dashboard: {
    Dashboard: boolean;
    Community: boolean;
    Enrollments: boolean;
  };
  courses: {
    'My Courses': boolean;
    Assignments: boolean;
    Assessments: boolean;
  };
  progress: {
    'My Grades': boolean;
    'Progress Tracking': boolean;
  };
  resources: {
    Calendar: boolean;
    Messages: boolean;
  };
  emulators: {
    'Code Editor': boolean;
    'Scratch Editor': boolean;
  };
  settings: {
    'Profile Settings': boolean;
  };
}

interface Cohort {
  id: number;
  name: string;
  description?: string;
  idnumber?: string;
}

const CohortNavigationSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [settings, setSettings] = useState<NavigationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCohorts();
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      fetchCohortSettings(selectedCohort);
    }
  }, [selectedCohort]);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const cohortsData = await moodleService.getCohorts();
      setCohorts(cohortsData);
      console.log('📚 Cohorts loaded:', cohortsData.length);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      setError('Failed to load cohorts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCohortSettings = async (cohortId: string) => {
    try {
      setLoading(true);
      const cohortSettings = await moodleService.getCohortNavigationSettingsFromStorage(cohortId);
      setSettings(cohortSettings);
      console.log('⚙️ Cohort settings loaded for:', cohortId);
    } catch (error) {
      console.error('Error fetching cohort settings:', error);
      setError('Failed to load cohort settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section: keyof NavigationSettings, item: string, value: boolean) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [item]: value
        }
      };
    });
  };

  const saveSettings = async () => {
    if (!selectedCohort || !settings) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      console.log('💾 Saving settings for cohort:', selectedCohort);
      console.log('⚙️ Settings to save:', settings);

      const success: boolean = await moodleService.updateCohortNavigationSettings(selectedCohort, settings);
      
      if (success) {
        setSuccess('Navigation settings saved successfully!');
        console.log('✅ Settings saved for cohort:', selectedCohort);
        
        // Verify the settings were saved by reading them back
        const savedSettings = await moodleService.getCohortNavigationSettingsFromStorage(selectedCohort);
        console.log('🔍 Verification - saved settings:', savedSettings);
      } else {
        setError('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!selectedCohort) return;

    try {
      setLoading(true);
      const defaultSettings = moodleService.getDefaultNavigationSettings();
      setSettings(defaultSettings);
      console.log('🔄 Reset to default settings');
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings');
    } finally {
      setLoading(false);
    }
  };

  const testCohortSettings = async () => {
    if (!selectedCohort) return;

    try {
      console.log('🧪 Testing cohort settings for:', selectedCohort);
      
      // Test 1: Save some test settings
      const testSettings = {
        dashboard: {
          Dashboard: true,
          Community: false,
          Enrollments: false
        },
        courses: {
          'My Courses': true,
          Assignments: false,
          Assessments: false
        },
        progress: {
          'My Grades': false,
          'Progress Tracking': false
        },
        resources: {
          Calendar: false,
          Messages: false
        },
        emulators: {
          'Code Editor': false,
          'Scratch Editor': false
        },
        settings: {
          'Profile Settings': false
        }
      };

      console.log('🧪 Test settings to save:', testSettings);
      
      // Save test settings
      const saveResult = await moodleService.updateCohortNavigationSettings(selectedCohort, testSettings);
      console.log('🧪 Save result:', saveResult);

      // Test 2: Read back the settings
      const readSettings = await moodleService.getCohortNavigationSettingsFromStorage(selectedCohort);
      console.log('🧪 Read back settings:', readSettings);

      // Test 3: Check backend API directly
      const apiResponse = await fetch(`http://localhost:5000/api/cohort-settings/${selectedCohort}`);
      const apiData = await apiResponse.json();
      console.log('🧪 Backend API response:', apiData);

      // Test 4: Simulate student login
      console.log('🧪 Simulating student login...');
      const studentCohort = await moodleService.getStudentCohort('1'); // Test with user ID 1
      console.log('🧪 Student cohort:', studentCohort);

      if (studentCohort && studentCohort.id.toString() === selectedCohort) {
        const studentSettings = await moodleService.getCohortNavigationSettingsFromStorage(studentCohort.id.toString());
        console.log('🧪 Student settings:', studentSettings);
      }

      setSuccess('Test completed! Check console for results.');
    } catch (error) {
      console.error('🧪 Test error:', error);
      setError('Test failed: ' + error.message);
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'dashboard': return <Settings className="w-4 h-4" />;
      case 'courses': return <Users className="w-4 h-4" />;
      case 'progress': return <CheckCircle className="w-4 h-4" />;
      case 'resources': return <Info className="w-4 h-4" />;
      case 'emulators': return <Eye className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'dashboard': return 'Dashboard';
      case 'courses': return 'Courses';
      case 'progress': return 'Progress';
      case 'resources': return 'Resources';
      case 'emulators': return 'Programming Tools';
      case 'settings': return 'Settings';
      default: return section;
    }
  };

  const getSectionDescription = (section: string) => {
    switch (section) {
      case 'dashboard': return 'Main dashboard and overview sections';
      case 'courses': return 'Course management and assignments';
      case 'progress': return 'Grades and progress tracking';
      case 'resources': return 'Calendar and messaging tools';
      case 'emulators': return 'Code editor and programming tools';
      case 'settings': return 'User profile and account settings';
      default: return '';
    }
  };

  if (loading && !selectedCohort) {
    return (
      <AdminDashboardLayout userName={currentUser?.fullname || "Admin"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading cohorts...</span>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout userName={currentUser?.fullname || "Admin"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cohort Navigation Settings</h1>
            <p className="text-gray-600 mt-1">
              Control which sidebar options are visible to students in different cohorts
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={fetchCohorts}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            {selectedCohort && (
              <Button
                onClick={testCohortSettings}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Info className="w-4 h-4" />
                <span>Test Settings</span>
              </Button>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Cohort Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Cohort</CardTitle>
            <CardDescription>
              Choose a cohort to manage its navigation settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select a cohort..." />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <span>{cohort.name}</span>
                        {cohort.idnumber && (
                          <Badge variant="outline" className="text-xs">
                            {cohort.idnumber}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCohort && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {cohorts.find(c => c.id.toString() === selectedCohort)?.name}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Settings */}
        {selectedCohort && settings && (
          <div className="space-y-6">
            {/* Settings Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Navigation Settings</h2>
                <p className="text-gray-600">
                  Configure which sidebar options are visible to students in this cohort
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={resetToDefaults}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  Reset to Defaults
                </Button>
                
                <Button
                  onClick={saveSettings}
                  disabled={saving || loading}
                  className="flex items-center space-x-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </Button>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(settings).map(([sectionKey, sectionItems]) => (
                <Card key={sectionKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getSectionIcon(sectionKey)}
                      <span>{getSectionTitle(sectionKey)}</span>
                    </CardTitle>
                    <CardDescription>
                      {getSectionDescription(sectionKey)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(sectionItems).map(([itemKey, isEnabled]) => (
                        <div key={itemKey} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {isEnabled as boolean ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {itemKey}
                            </span>
                          </div>
                          
                          <Switch
                            checked={isEnabled as boolean}
                            onCheckedChange={(value) => 
                              handleSettingChange(sectionKey as keyof NavigationSettings, itemKey, value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Settings Summary</CardTitle>
                <CardDescription>
                  Overview of enabled/disabled options for this cohort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(settings).map(([sectionKey, sectionItems]) => {
                    const enabledCount = Object.values(sectionItems).filter(Boolean).length;
                    const totalCount = Object.keys(sectionItems).length;
                    
                    return (
                      <div key={sectionKey} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {enabledCount}/{totalCount}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getSectionTitle(sectionKey)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {enabledCount === totalCount ? 'All enabled' : 
                           enabledCount === 0 ? 'All disabled' : 
                           `${enabledCount} enabled`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!selectedCohort && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span>How to Use</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. <strong>Select a cohort</strong> from the dropdown above to manage its navigation settings</p>
                <p>2. <strong>Toggle switches</strong> to enable or disable specific sidebar options for students in that cohort</p>
                <p>3. <strong>Save settings</strong> to apply the changes to all students in the selected cohort</p>
                <p>4. <strong>Use "Reset to Defaults"</strong> to restore all options to their default enabled state</p>
                <p className="text-blue-600 font-medium">
                  💡 Tip: Younger students (Grades 1-5) typically need fewer options, while older students (Grades 9-12) can access more advanced tools.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default CohortNavigationSettings;

