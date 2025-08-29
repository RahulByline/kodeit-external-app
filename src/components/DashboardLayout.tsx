import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Monitor,
  Zap,
  Share2,
  Gamepad2
} from 'lucide-react';
import logo from '../assets/logo.png';
import LogoutDialog from './ui/logout-dialog';
import { authService } from '../services/authService';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from './ui/skeleton';

// Cache utilities for sidebar
const SIDEBAR_CACHE_PREFIX = 'sidebar_';
const SIDEBAR_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getSidebarCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(`${SIDEBAR_CACHE_PREFIX}${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < SIDEBAR_CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Sidebar cache read error:', error);
  }
  return null;
};

const setSidebarCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(`${SIDEBAR_CACHE_PREFIX}${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Sidebar cache write error:', error);
  }
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'school_admin' | 'teacher' | 'student';
  userName: string;
  dashboardType?: 'G1_G3' | 'G4_G7' | 'G8_PLUS';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole, userName, dashboardType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [cohortNavigationSettings, setCohortNavigationSettings] = useState<any>(() => {
    // Initialize with cached data if available
    if (userRole === 'student') {
      return getSidebarCachedData('cohortNavigationSettings');
    }
    return null;
  });
  const [studentCohort, setStudentCohort] = useState<any>(() => {
    // Initialize with cached data if available
    if (userRole === 'student') {
      return getSidebarCachedData('studentCohort');
    }
    return null;
  });
  const [isLoadingCohortSettings, setIsLoadingCohortSettings] = useState(false);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('DashboardLayout - userRole:', userRole);
  console.log('DashboardLayout - userName:', userName);
  console.log('DashboardLayout - current location:', location.pathname);

  // Enhanced sidebar loading with caching and progressive loading
  const fetchStudentCohortAndSettings = useCallback(async () => {
    if (!currentUser?.id || userRole !== 'student') return;

    try {
      setIsLoadingSidebar(true);
      console.log('🎓 Fetching student cohort and navigation settings...');
      
      // Check cache first for instant display
      const cachedCohort = getSidebarCachedData('studentCohort');
      const cachedSettings = getSidebarCachedData('cohortNavigationSettings');
      
      if (cachedCohort && cachedSettings) {
        setStudentCohort(cachedCohort);
        setCohortNavigationSettings(cachedSettings);
        console.log('✅ Using cached sidebar data');
      }
      
      // Fetch fresh data in background
      const fetchFreshData = async () => {
        try {
          setIsLoadingCohortSettings(true);
          
          // Get student's cohort
          const cohort = await moodleService.getStudentCohort(currentUser.id.toString());
          console.log('🎓 Student cohort:', cohort);
          setStudentCohort(cohort);
          setSidebarCachedData('studentCohort', cohort);
          
          if (cohort) {
            console.log('🎓 Cohort ID:', cohort.id);
            console.log('🎓 Cohort name:', cohort.name);
            
            // Get navigation settings for this cohort
            const settings = await moodleService.getCohortNavigationSettingsFromStorage(cohort.id.toString());
            console.log('⚙️ Cohort navigation settings loaded:', settings);
            setCohortNavigationSettings(settings);
            setSidebarCachedData('cohortNavigationSettings', settings);
            
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
            console.warn('⚠️ No cohort found for student, using default settings');
            // Use default settings if no cohort found
            const defaultSettings = moodleService.getDefaultNavigationSettings();
            console.log('⚙️ Using default navigation settings:', defaultSettings);
            setCohortNavigationSettings(defaultSettings);
            setSidebarCachedData('cohortNavigationSettings', defaultSettings);
          }
        } catch (error) {
          console.error('❌ Error fetching cohort settings:', error);
          // Fallback to default settings
          const defaultSettings = moodleService.getDefaultNavigationSettings();
          console.log('⚙️ Fallback to default settings:', defaultSettings);
          setCohortNavigationSettings(defaultSettings);
          setSidebarCachedData('cohortNavigationSettings', defaultSettings);
        } finally {
          setIsLoadingCohortSettings(false);
        }
      };

      // Start background fetch
      fetchFreshData();

    } catch (error) {
      console.error('❌ Error in sidebar data fetch:', error);
    } finally {
      setIsLoadingSidebar(false);
    }
  }, [currentUser?.id, userRole]);

  // Fetch student cohort and navigation settings
  useEffect(() => {
    if (userRole === 'student' && currentUser?.id) {
      fetchStudentCohortAndSettings();
    }
  }, [userRole, currentUser?.id, fetchStudentCohortAndSettings]);

  // Skeleton navigation components
  const SkeletonNavigationItem = () => (
    <div className="flex items-center space-x-3 px-3 py-2">
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-4 w-24 rounded" />
    </div>
  );

  const SkeletonNavigationSection = () => (
    <div className="space-y-3">
      <Skeleton className="h-3 w-16 rounded" />
      <div className="space-y-1">
        <SkeletonNavigationItem />
        <SkeletonNavigationItem />
        <SkeletonNavigationItem />
      </div>
    </div>
  );

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
          title: 'STUDENTS',
          items: [
            { name: 'Students', icon: Users, path: '/dashboard/admin/students' },
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
      // Define different navigation configurations for each dashboard type
      const getStudentNavigationByType = () => {
        // G1-G3 Dashboard Navigation (Simplified, focused on basics)
        if (dashboardType === 'G1_G3') {
          return [
            {
              title: 'DASHBOARD',
              items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${userRole}` },
                { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
              ]
            },
            {
              title: 'LEARNING',
              items: [
                { name: 'Assignments', icon: FileText, path: '/dashboard/student/assignments' },
                { name: 'My Grades', icon: BarChart3, path: '/dashboard/student/grades' },
              ]
            },
            {
              title: 'SETTINGS',
              items: [
                { name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' },
              ]
            },
            {
              title: 'QUICK ACTIONS',
              items: [
                { name: 'Scratch Editor', icon: Play, path: '/dashboard/student/scratch-editor' },
                { name: 'E-books', icon: BookOpen, path: '/dashboard/student/ebooks' },
                { name: 'Ask Teacher', icon: MessageSquare, path: '/dashboard/student/ask-teacher' },
              ]
            }
          ];
        }

        // G4-G7 Dashboard Navigation (Intermediate, more features)
        if (dashboardType === 'G4_G7') {
          return [
            {
              title: 'DASHBOARD',
              items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${userRole}` },
                { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
                { name: 'Community', icon: Users, path: `/dashboard/${userRole}/community` },
              ]
            },
            {
              title: 'LEARNING',
              items: [
                { name: 'Assignments', icon: FileText, path: '/dashboard/student/assignments' },
                { name: 'Assessments', icon: FileText, path: '/dashboard/student/assessments' },
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
              title: 'SETTINGS',
              items: [
                { name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' },
              ]
            },
            {
              title: 'QUICK ACTIONS',
              items: [
                { name: 'Code Editor', icon: Code, path: '/dashboard/student/code-editor' },
                { name: 'Scratch Editor', icon: Play, path: '/dashboard/student/scratch-editor' },
                { name: 'E-books', icon: BookOpen, path: '/dashboard/student/ebooks' },
                { name: 'Ask Teacher', icon: MessageSquare, path: '/dashboard/student/ask-teacher' },
                { name: 'KODEIT AI Buddy', icon: Zap, path: '/dashboard/student/ai-buddy' },
              ]
            }
          ];
        }

        // G8+ Dashboard Navigation (Full featured, all options)
        if (dashboardType === 'G8_PLUS') {
          return [
            {
              title: 'DASHBOARD',
              items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${userRole}` },
                { name: 'Community', icon: Users, path: `/dashboard/${userRole}/community` },
                { name: 'Enrollments', icon: GraduationCap, path: `/dashboard/${userRole}/enrollments` },
              ]
            },
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
              title: 'SETTINGS',
              items: [
                { name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' },
              ]
            },
            {
              title: 'QUICK ACTIONS',
              items: [
                { name: 'Code Editor', icon: Code, path: '/dashboard/student/code-editor' },
                { name: 'Scratch Editor', icon: Play, path: '/dashboard/student/scratch-editor' },
                { name: 'E-books', icon: BookOpen, path: '/dashboard/student/ebooks' },
                { name: 'Ask Teacher', icon: MessageSquare, path: '/dashboard/student/ask-teacher' },
                { name: 'KODEIT AI Buddy', icon: Zap, path: '/dashboard/student/ai-buddy' },
                { name: 'Share with Class', icon: Share2, path: '/dashboard/student/share' },
              ]
            }
          ];
        }

        // Default navigation (fallback)
        return [
          {
            title: 'DASHBOARD',
            items: [
              { name: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${userRole}` },
              { name: 'Community', icon: Users, path: `/dashboard/${userRole}/community` },
              { name: 'Enrollments', icon: GraduationCap, path: `/dashboard/${userRole}/enrollments` },
            ]
          },
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
            title: 'SETTINGS',
            items: [
              { name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' },
            ]
          },
          {
            title: 'QUICK ACTIONS',
            items: [
              { name: 'Code Editor', icon: Code, path: '/dashboard/student/code-editor' },
              { name: 'Scratch Editor', icon: Play, path: '/dashboard/student/scratch-editor' },
              { name: 'E-books', icon: BookOpen, path: '/dashboard/student/ebooks' },
              { name: 'Ask Teacher', icon: MessageSquare, path: '/dashboard/student/ask-teacher' },
              { name: 'KODEIT AI Buddy', icon: Zap, path: '/dashboard/student/ai-buddy' },
              { name: 'Share with Class', icon: Share2, path: '/dashboard/student/share' },
            ]
          }
        ];
      };

      // Show skeleton navigation while loading cohort settings
      if (isLoadingCohortSettings && !cohortNavigationSettings) {
        return getStudentNavigationByType();
      }
      
      // Use cohort-based navigation settings if available
      if (cohortNavigationSettings) {
        // For now, use the dashboard type-based navigation
        // In the future, this could be enhanced to merge cohort settings with dashboard type
        return getStudentNavigationByType();
      }

      // Fallback to dashboard type-based navigation
      return getStudentNavigationByType();
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  console.log('🧭 Generated navigation items:', navigationItems);
  console.log('⚙️ Current cohort navigation settings:', cohortNavigationSettings);
  console.log('📊 Dashboard type:', dashboardType);

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
          <div className="flex items-center space-x-3">
            <img src={logo} alt="kodeit" className="w-8 h-8" />
            <span className="text-lg font-semibold text-gray-800">kodeit</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6 pb-20">
          {isLoadingSidebar && userRole === 'student' ? (
            // Show skeleton navigation while loading
            <>
              <SkeletonNavigationSection />
              <SkeletonNavigationSection />
              <SkeletonNavigationSection />
              <SkeletonNavigationSection />
              <SkeletonNavigationSection />
            </>
          ) : (
            navigationItems.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    // Special styling for Quick Actions section
                    if (section.title === 'QUICK ACTIONS') {
                      const getQuickActionStyles = (itemName: string) => {
                        switch (itemName) {
                          case 'Code Editor':
                            return {
                              bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
                              border: 'border-purple-200',
                              text: 'text-purple-900',
                              hover: 'hover:from-purple-100 hover:to-pink-100',
                              iconBg: 'bg-purple-100',
                              iconColor: 'text-purple-600'
                            };
                          case 'Scratch Editor':
                            return {
                              bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
                              border: 'border-purple-200',
                              text: 'text-purple-900',
                              hover: 'hover:from-purple-100 hover:to-pink-100',
                              iconBg: 'bg-purple-100',
                              iconColor: 'text-purple-600'
                            };
                          case 'E-books':
                            return {
                              bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
                              border: 'border-blue-200',
                              text: 'text-blue-900',
                              hover: 'hover:from-blue-100 hover:to-blue-200',
                              iconBg: 'bg-blue-100',
                              iconColor: 'text-blue-600'
                            };
                          case 'Ask Teacher':
                            return {
                              bg: 'bg-gradient-to-br from-green-50 to-green-100',
                              border: 'border-green-200',
                              text: 'text-green-900',
                              hover: 'hover:from-green-100 hover:to-green-200',
                              iconBg: 'bg-green-100',
                              iconColor: 'text-green-600'
                            };
                          case 'KODEIT AI Buddy':
                            return {
                              bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
                              border: 'border-orange-200',
                              text: 'text-orange-900',
                              hover: 'hover:from-orange-100 hover:to-orange-200',
                              iconBg: 'bg-orange-100',
                              iconColor: 'text-orange-600'
                            };
                          case 'Share with Class':
                            return {
                              bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
                              border: 'border-purple-200',
                              text: 'text-purple-900',
                              hover: 'hover:from-purple-100 hover:to-purple-200',
                              iconBg: 'bg-purple-100',
                              iconColor: 'text-purple-600'
                            };
                          default:
                            return {
                              bg: 'bg-gray-50',
                              border: 'border-gray-200',
                              text: 'text-gray-900',
                              hover: 'hover:bg-gray-100',
                              iconBg: 'bg-gray-100',
                              iconColor: 'text-gray-600'
                            };
                        }
                      };

                      const styles = getQuickActionStyles(item.name);
                      
                      return (
                        <li key={itemIndex}>
                          <button
                            onClick={() => {
                              console.log('DashboardLayout - Navigation clicked:', item.name, 'Path:', item.path);
                              navigate(item.path);
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${styles.bg} ${styles.border} ${styles.text} ${styles.hover}`}
                          >
                            <div className={`p-2 rounded-lg ${styles.iconBg}`}>
                              <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs opacity-75 mt-0.5">
                                {item.name === 'Code Editor' && 'Practice coding in virtual environments'}
                                {item.name === 'Scratch Editor' && 'Create interactive projects'}
                                {item.name === 'E-books' && 'Access digital learning materials'}
                                {item.name === 'Ask Teacher' && 'Get help from your instructor'}
                                {item.name === 'KODEIT AI Buddy' && 'Get instant coding help'}
                                {item.name === 'Share with Class' && 'Collaborate with classmates'}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    }

                    // Default styling for other sections
                    return (
                      <li key={itemIndex}>
                        <button
                          onClick={() => {
                            console.log('DashboardLayout - Navigation clicked:', item.name, 'Path:', item.path);
                            navigate(item.path);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
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
                <button 
                  onClick={() => navigate('/dashboard/student/messages')}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
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
        <main className="bg-gray-50 min-h-screen pt-32 my-10 p-4 lg:p-6">
          <div className="max-w-full mx-auto">
            <div className="mt-4">
              {children}
            </div>
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