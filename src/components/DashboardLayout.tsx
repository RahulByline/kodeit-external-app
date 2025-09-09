import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  MessageSquare,
  FileText,
  Calendar,
  School,
  Target,
  TrendingUp,
  Award,
  Clock,
  LogOut,
  Settings as SettingsIcon,
  Play,
  Code,
  Map,
  Share2
} from 'lucide-react';
import logo from '../assets/logo.png';
import LogoutDialog from './ui/logout-dialog';
import { authService } from '../services/authService';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'school_admin' | 'teacher' | 'student';
  userName: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [cohortNavigationSettings, setCohortNavigationSettings] = useState<any>(null);
  const [studentCohort, setStudentCohort] = useState<any>(null);
  const [isLoadingCohortSettings, setIsLoadingCohortSettings] = useState(false);
  const [hasLoadedCohortSettings, setHasLoadedCohortSettings] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('DashboardLayout - userRole:', userRole);
  console.log('DashboardLayout - userName:', userName);
  console.log('DashboardLayout - current location:', location.pathname);

  // Fetch student cohort and navigation settings - optimized for fast loading
  useEffect(() => {
    if (userRole === 'student' && currentUser?.id) {
      // Load default settings immediately, then fetch cohort-specific settings in background
      const defaultSettings = moodleService.getDefaultNavigationSettings();
      setCohortNavigationSettings(defaultSettings);
      
      // Fetch cohort-specific settings in background without blocking UI
      fetchStudentCohortAndSettings();
    }
  }, [userRole, currentUser?.id]);

  const fetchStudentCohortAndSettings = async () => {
    try {
      setIsLoadingCohortSettings(true);
      console.log('🎓 Fetching student cohort and navigation settings in background...');
      console.log('👤 Current user ID:', currentUser.id);
      
      // Get student's cohort
      const cohort = await moodleService.getStudentCohort(currentUser.id.toString());
      console.log('🎓 Student cohort:', cohort);
      setStudentCohort(cohort);
      
      if (cohort) {
        console.log('🎓 Cohort ID:', cohort.id);
        console.log('🎓 Cohort name:', cohort.name);
        
        // Get navigation settings for this cohort
        const settings = await moodleService.getCohortNavigationSettingsFromStorage(cohort.id.toString());
        console.log('⚙️ Cohort navigation settings loaded:', settings);
        
        // Only update if settings are different from default to avoid unnecessary re-renders
        if (settings && JSON.stringify(settings) !== JSON.stringify(moodleService.getDefaultNavigationSettings())) {
          setCohortNavigationSettings(settings);
          console.log('✅ Updated navigation with cohort-specific settings');
        } else {
          console.log('ℹ️ Using default settings (no cohort-specific overrides)');
        }
        
        // Debug: Check backend API directly
        try {
          const apiResponse = await fetch(`http://localhost:5000/api/cohort-settings/${cohort.id}`);
          const apiData = await apiResponse.json();
          console.log('🔍 Backend API check for cohort:', cohort.id);
          console.log('🔍 Backend API response:', apiData);
        } catch (error) {
          console.log('🔍 Backend API check failed:', error);
        }
      } else {
        console.warn('⚠️ No cohort found for student, keeping default settings');
      }
    } catch (error) {
      console.error('❌ Error fetching cohort settings:', error);
      // Keep default settings that were already loaded
      console.log('ℹ️ Keeping default settings due to error');
    } finally {
      setIsLoadingCohortSettings(false);
      setHasLoadedCohortSettings(true);
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'DASHBOARD',
        items: [
          { name: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${userRole}` },
          { name: 'Community', icon: Users, path: `/dashboard/${userRole}/community` },
          { name: 'Enrollments', icon: GraduationCap, path: `/dashboard/${userRole}/enrollments` },
        ]
      }
    ];

    if (userRole === 'admin') {
      return [
        {
          title: 'DASHBOARD',
          items: [
            { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
            { name: 'Community', icon: Users, path: '/dashboard/admin/community' },
            { name: 'Enrollments', icon: GraduationCap, path: '/dashboard/admin/enrollments' },
          ]
        },
        {
          title: 'TEACHERS',
          items: [
            { name: 'Teachers', icon: Users, path: '/dashboard/admin/teachers' },
            { name: 'Master Trainers', icon: Award, path: '/dashboard/admin/master-trainers' },
          ]
        },
        {
          title: 'COURSES & PROGRAMS',
          items: [
            { name: 'Courses & Programs', icon: BookOpen, path: '/dashboard/admin/courses' },
            { name: 'Certifications', icon: GraduationCap, path: '/dashboard/admin/certifications' },
            { name: 'Assessments', icon: FileText, path: '/dashboard/admin/assessments' },
            { name: 'Schools', icon: School, path: '/dashboard/admin/schools' },
          ]
        },
        {
          title: 'INSIGHTS',
          items: [
            { name: 'Analytics', icon: BarChart3, path: '/dashboard/admin/analytics' },
            { name: 'Predictive Models', icon: TrendingUp, path: '/dashboard/admin/predictive' },
            { name: 'Reports', icon: FileText, path: '/dashboard/admin/reports' },
            { name: 'Competencies Map', icon: Map, path: '/dashboard/admin/competencies' },
          ]
        },
        {
          title: 'SETTINGS',
          items: [
            { name: 'System Settings', icon: Settings, path: '/dashboard/admin/settings' },
            { name: 'User Management', icon: Users, path: '/dashboard/admin/users' },
            { name: 'Cohort Navigation', icon: Users, path: '/dashboard/admin/cohort-navigation' },
          ]
        }
      ];
    }

    if (userRole === 'school_admin') {
      return [
        {
          title: 'DASHBOARD',
          items: [
            { name: 'School Management Dashboard', icon: LayoutDashboard, path: '/dashboard/school-admin' },
            { name: 'School Management', icon: School, path: '/dashboard/school-admin/school-management' },
            { name: 'Community', icon: Users, path: '/dashboard/school-admin/community' },
            { name: 'Enrollments', icon: GraduationCap, path: '/dashboard/school-admin/enrollments' },
          ]
        },
        {
          title: 'USERS',
          items: [
            { name: 'Teachers', icon: Users, path: '/dashboard/school-admin/teachers' },
            { name: 'Students', icon: GraduationCap, path: '/dashboard/school-admin/students' },
          ]
        },
        {
          title: 'COURSES & PROGRAMS',
          items: [
            { name: 'Courses', icon: BookOpen, path: '/dashboard/school-admin/courses' },
            { name: 'Certifications', icon: GraduationCap, path: '/dashboard/school-admin/certifications' },
            { name: 'Assessments', icon: FileText, path: '/dashboard/school-admin/assessments' },
          ]
        },
        {
          title: 'INSIGHTS',
          items: [
            { name: 'Analytics', icon: BarChart3, path: '/dashboard/school-admin/analytics' },
            { name: 'Reports', icon: FileText, path: '/dashboard/school-admin/reports' },
          ]
        },
        {
          title: 'SETTINGS',
          items: [
            { name: 'School Settings', icon: Settings, path: '/dashboard/school-admin/settings' },
            { name: 'User Management', icon: Users, path: '/dashboard/school-admin/users' },
          ]
        }
      ];
    }

    if (userRole === 'teacher') {
      return [
        ...baseItems,
        {
          title: 'COURSES',
          items: [
            { name: 'My Courses', icon: BookOpen, path: '/dashboard/teacher/courses' },
            { name: 'Assignments', icon: FileText, path: '/dashboard/teacher/assignments' },
            { name: 'Assessments', icon: FileText, path: '/dashboard/teacher/assessments' },
          ]
        },
        {
          title: 'STUDENTS',
          items: [
            { name: 'My Students', icon: Users, path: '/dashboard/teacher/students' },
            { name: 'Groups', icon: Users, path: '/dashboard/teacher/groups' },
            { name: 'Performance', icon: BarChart3, path: '/dashboard/teacher/performance' },
          ]
        },
        {
          title: 'INSIGHTS',
          items: [
            { name: 'Analytics', icon: BarChart3, path: '/dashboard/teacher/analytics' },
            { name: 'Reports', icon: FileText, path: '/dashboard/teacher/reports' },
          ]
        },
        {
          title: 'SETTINGS',
          items: [
            { name: 'Profile Settings', icon: Settings, path: '/dashboard/teacher/settings' },
            { name: 'Calendar', icon: Calendar, path: '/dashboard/teacher/calendar' },
          ]
        }
      ];
    }

    if (userRole === 'student') {
      // Always show navigation immediately - no more blocking loading state
      // Use cohort-based navigation settings if available, otherwise use default
      if (cohortNavigationSettings) {
        const studentItems = [
          ...baseItems
        ];

        // Add COURSES section if any course items are enabled
        const courseItems = [];
        if (cohortNavigationSettings.courses['My Courses']) {
          courseItems.push({ name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' });
        }
        if (cohortNavigationSettings.courses.Assignments) {
          courseItems.push({ name: 'Assignments', icon: FileText, path: '/dashboard/student/assignments' });
        }
        if (cohortNavigationSettings.courses.Assessments) {
          courseItems.push({ name: 'Assessments', icon: FileText, path: '/dashboard/student/assessments' });
        }
        if (courseItems.length > 0) {
          studentItems.push({
            title: 'COURSES',
            items: courseItems
          });
        }

        // Add PROGRESS section if any progress items are enabled
        const progressItems = [];
        if (cohortNavigationSettings.progress['My Grades']) {
          progressItems.push({ name: 'My Grades', icon: BarChart3, path: '/dashboard/student/grades' });
        }
        if (cohortNavigationSettings.progress['Progress Tracking']) {
          progressItems.push({ name: 'Progress Tracking', icon: TrendingUp, path: '/dashboard/student/progress' });
        }
        if (progressItems.length > 0) {
          studentItems.push({
            title: 'PROGRESS',
            items: progressItems
          });
        }

        // Add RESOURCES section if any resource items are enabled
        const resourceItems = [];
        if (cohortNavigationSettings.resources.Calendar) {
          resourceItems.push({ name: 'Calendar', icon: Calendar, path: '/dashboard/student/calendar' });
        }
        if (cohortNavigationSettings.resources.Messages) {
          resourceItems.push({ name: 'Messages', icon: MessageSquare, path: '/dashboard/student/messages' });
        }
        if (resourceItems.length > 0) {
          studentItems.push({
            title: 'RESOURCES',
            items: resourceItems
          });
        }

        // Add QUICK ACTIONS section with emulator items
        const quickActionItems = [];
        if (cohortNavigationSettings.emulators['Code Editor']) {
          quickActionItems.push({ 
            name: 'Code Emulators', 
            icon: Code, 
            path: '/dashboard/student/code-editor',
            description: 'Practice coding in virtual environment'
          });
        }
        if (cohortNavigationSettings.emulators['Scratch Editor']) {
          quickActionItems.push({ 
            name: 'Scratch Editor', 
            icon: Play, 
            path: '/dashboard/student/scratch-editor',
            description: 'Create interactive stories and games'
          });
        }
        // Add other quick actions
        quickActionItems.push(
          { 
            name: 'E-books', 
            icon: BookOpen, 
            path: '/dashboard/student/ebooks',
            description: 'Access digital learning materials'
          },
          { 
            name: 'Ask Teacher', 
            icon: MessageSquare, 
            path: '/dashboard/student/ask-teacher',
            description: 'Get help from your instructor'
          },
          { 
            name: 'KODEIT AI Buddy', 
            icon: Users, 
            path: '/dashboard/student/ai-buddy',
            description: 'Get instant coding help'
          },
          { 
            name: 'Share with Class', 
            icon: Share2, 
            path: '/dashboard/student/share',
            description: 'Collaborate with classmates'
          }
        );
        
        if (quickActionItems.length > 0) {
          studentItems.push({
            title: 'QUICK ACTIONS',
            items: quickActionItems
          });
        }

        // Add SETTINGS section if settings are enabled
        const settingsItems = [];
        if (cohortNavigationSettings.settings['Profile Settings']) {
          settingsItems.push({ name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' });
        }
        if (settingsItems.length > 0) {
          studentItems.push({
            title: 'SETTINGS',
            items: settingsItems
          });
        }

        return studentItems;
      }

      // Fallback to default student navigation
      return [
        ...baseItems,
        {
          title: 'COURSES',
          items: [
            { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
            { name: 'Assignments', icon: FileText, path: '/dashboard/student/assignments' },
            { name: 'Assessments', icon: FileText, path: '/dashboard/student/assessments' },
          ]
        },
        {
          title: 'PROGRESS',
          items: [
            { name: 'My Grades', icon: BarChart3, path: '/dashboard/student/grades' },
            { name: 'Progress Tracking', icon: TrendingUp, path: '/dashboard/student/progress' },
          ]
        },
        {
          title: 'RESOURCES',
          items: [
            { name: 'Calendar', icon: Calendar, path: '/dashboard/student/calendar' },
            { name: 'Messages', icon: MessageSquare, path: '/dashboard/student/messages' },
          ]
        },
        {
          title: 'QUICK ACTIONS',
          items: [
            { 
              name: 'Code Emulators', 
              icon: Code, 
              path: '/dashboard/student/code-editor',
              description: 'Practice coding in virtual environment'
            },
            { 
              name: 'Scratch Editor', 
              icon: Play, 
              path: '/dashboard/student/scratch-editor',
              description: 'Create interactive stories and games'
            },
            { 
              name: 'E-books', 
              icon: BookOpen, 
              path: '/dashboard/student/ebooks',
              description: 'Access digital learning materials'
            },
            { 
              name: 'Ask Teacher', 
              icon: MessageSquare, 
              path: '/dashboard/student/ask-teacher',
              description: 'Get help from your instructor'
            },
            { 
              name: 'KODEIT AI Buddy', 
              icon: Users, 
              path: '/dashboard/student/ai-buddy',
              description: 'Get instant coding help'
            },
            { 
              name: 'Share with Class', 
              icon: Share2, 
              path: '/dashboard/student/share',
              description: 'Collaborate with classmates'
            }
          ]
        },
        {
          title: 'SETTINGS',
          items: [
            { name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' },
          ]
        }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  console.log('🧭 Generated navigation items:', navigationItems);
  console.log('⚙️ Current cohort navigation settings:', cohortNavigationSettings);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setShowLogoutDialog(false);
      setShowProfileDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar - Hidden on mobile */}
      <div className="fixed top-0 left-0 z-30 w-64 h-full bg-white shadow-lg overflow-y-auto hidden lg:block scrollbar-hide">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="kodeit" className="w-8 h-8" />
              <span className="text-lg font-semibold text-gray-800">kodeit</span>
            </div>
            {/* Subtle loading indicator for cohort settings */}
            {userRole === 'student' && isLoadingCohortSettings && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-4 pb-16">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="transition-all duration-300 ease-in-out">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 transition-colors duration-200">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isQuickAction = section.title === 'QUICK ACTIONS';
                  
                  return (
                    <li key={itemIndex} className="transition-all duration-200 ease-in-out">
                      <button
                        onClick={() => {
                          console.log('DashboardLayout - Navigation clicked:', item.name, 'Path:', item.path);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-start space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        } ${isQuickAction ? 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100' : ''}`}
                      >
                        <div className={`p-2 rounded-lg ${isQuickAction ? 'bg-white shadow-sm' : ''}`}>
                          <Icon className={`w-4 h-4 transition-transform duration-200 ${isQuickAction ? 'text-purple-600' : ''}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold transition-colors duration-200">{item.name}</div>
                          {isQuickAction && item.description && (
                            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{item.description}</div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content - offset by sidebar width on desktop, full width on mobile */}
      <div className="lg:ml-64">
        {/* Fixed Top Bar */}
        <header className="fixed top-0 left-0 lg:left-64 right-0 z-20 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses, teachers, or resources..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 lg:space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                <button className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Report</span>
                </button>

                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{userName}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole.replace('_', ' ')}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate(`/dashboard/${userRole}/settings`);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowLogoutDialog(true);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - with proper top padding */}
        <main className="bg-gray-50 min-h-screen pt-16 px-2 lg:px-4">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        userName={userName}
      />
    </div>
  );
};

export default DashboardLayout;