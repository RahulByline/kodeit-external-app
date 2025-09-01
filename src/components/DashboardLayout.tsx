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
  Activity,
  HelpCircle,
  Bot,
  Share2,
  X
} from 'lucide-react';
import logo from '../assets/logo.png';
import LogoutDialog from './ui/logout-dialog';
import { authService } from '../services/authService';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from './ui/skeleton';
import { getDashboardTypeByGrade, extractGradeFromCohortName } from '../utils/gradeCohortMapping';

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
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [showAskTeacherModal, setShowAskTeacherModal] = useState(false);
  const [showAIBuddyModal, setShowAIBuddyModal] = useState(false);
  const [showShareClassModal, setShowShareClassModal] = useState(false);
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

  const [isNavigating, setIsNavigating] = useState(false); // State for navigation loading

  const [studentGrade, setStudentGrade] = useState<number | null>(() => {
    // Try to get grade from localStorage first
    if (currentUser?.id) {
      const storedGrade = localStorage.getItem(`student_grade_${currentUser.id}`);
      if (storedGrade) {
        const grade = parseInt(storedGrade);
        console.log('🎓 DashboardLayout: Retrieved grade from localStorage:', grade);
        return grade;
      }
    }
    return null;
  });
  
  const [dashboardType, setDashboardType] = useState<'G1_G3' | 'G4_G7' | 'G8_PLUS' | null>(() => {
    // Try to get dashboard type from localStorage first
    if (currentUser?.id) {
      const storedGrade = localStorage.getItem(`student_grade_${currentUser.id}`);
      if (storedGrade) {
        const grade = parseInt(storedGrade);
        const dashboardType = getDashboardTypeByGrade(grade);
        console.log('🎓 DashboardLayout: Retrieved dashboard type from localStorage:', dashboardType);
        return dashboardType;
      }
    }
    return null;
  });

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
            
            // Determine student's grade from cohort name
            let grade ; // Default to grade 6 (G4-G7)
            if (cohort.name) {
              const extractedGrade = extractGradeFromCohortName(cohort.name);
              if (extractedGrade) {
                grade = extractedGrade;
                console.log('🎓 Grade extracted from cohort name:', grade);
              } else {
                console.log('🎓 No grade found in cohort name, using default grade 6 (G4-G7)');
              }
            } else {
              console.log('🎓 No cohort name, using default grade 6 (G4-G7)');
            }
            
            // Store grade in localStorage for future use
            localStorage.setItem(`student_grade_${currentUser.id}`, grade.toString());
            console.log('🎓 DashboardLayout: Grade stored in localStorage:', grade);
            
            setStudentGrade(grade);
            
            // Determine dashboard type based on grade
            const dashboardType = getDashboardTypeByGrade(grade);
            setDashboardType(dashboardType);
            
            console.log('🎓 Dashboard type determined:', {
              grade,
              dashboardType
            });
            
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
             
             // Set default grade to G8+ when no cohort is found (most restrictive)
             const defaultGrade = 8;
             const defaultDashboardType = 'G8_PLUS';
             
             // Store default values in localStorage
             localStorage.setItem(`student_grade_${currentUser.id}`, defaultGrade.toString());
             console.log('🎓 DashboardLayout: Default grade stored in localStorage:', defaultGrade);
             
             setStudentGrade(defaultGrade);
             setDashboardType(defaultDashboardType);
             console.log('🎓 No cohort found, defaulting to G8+ (most restrictive)');
           }
                 } catch (error) {
           console.error('❌ Error fetching cohort settings:', error);
           // Fallback to default settings
           const defaultSettings = moodleService.getDefaultNavigationSettings();
           console.log('⚙️ Fallback to default settings:', defaultSettings);
           setCohortNavigationSettings(defaultSettings);
           setSidebarCachedData('cohortNavigationSettings', defaultSettings);
           
           // Set default grade to G8+ on error (most restrictive)
           const defaultGrade = 8;
           const defaultDashboardType = 'G8_PLUS';
           
           // Store default values in localStorage
           localStorage.setItem(`student_grade_${currentUser.id}`, defaultGrade.toString());
           console.log('🎓 DashboardLayout: Error fallback grade stored in localStorage:', defaultGrade);
           
           setStudentGrade(defaultGrade);
           setDashboardType(defaultDashboardType);
           console.log('🎓 Error occurred, defaulting to G8+ (most restrictive)');
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
             // Show skeleton navigation while loading cohort settings
       if (isLoadingCohortSettings && !cohortNavigationSettings) {
         const skeletonItems = [
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
               // Only show Current Lessons and Activities for G4G7 students when grade is determined
               ...(dashboardType === 'G4_G7' ? [
                 { name: 'Current Lessons', icon: Clock, path: '/dashboard/student/current-lessons' },
                 { name: 'Activities', icon: Activity, path: '/dashboard/student/activities' },
               ] : []),
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
          // Only show EMULATORS section for G4G7 students when grade is determined
          ...(dashboardType === 'G4_G7' ? [{
            title: 'EMULATORS',
            items: [
              { name: 'Code Editor', icon: Code, path: '/dashboard/student/code-editor' },
              { name: 'Scratch Editor', icon: Play, path: '/dashboard/student/scratch-editor' },
              { name: 'E-books', icon: BookOpen, path: '#', isModal: true, modalType: 'ebook' },
              { name: 'Ask Teacher', icon: HelpCircle, path: '#', isModal: true, modalType: 'askTeacher' },
              { name: 'KODEIT AI Buddy', icon: Bot, path: '#', isModal: true, modalType: 'aiBuddy' },
              { name: 'Share with Class', icon: Share2, path: '#', isModal: true, modalType: 'shareClass' },
            ]
          }] : []),
          {
            title: 'SETTINGS',
            items: [
              { name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' },
            ]
          }
        ];
      }
      
      // Use cohort-based navigation settings if available
      if (cohortNavigationSettings) {
        const studentItems = [
          ...baseItems
        ];

        // Add COURSES section if any course items are enabled
        const courseItems = [];
        if (cohortNavigationSettings.courses['My Courses']) {
          courseItems.push({ name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' });
        }
        // Only show Current Lessons and Activities for G4G7 students when grade is determined
        if (cohortNavigationSettings.courses['Current Lessons'] && dashboardType === 'G4_G7') {
          courseItems.push({ name: 'Current Lessons', icon: Clock, path: '/dashboard/student/current-lessons' });
        }
        if (cohortNavigationSettings.courses['Activities'] && dashboardType === 'G4_G7') {
          courseItems.push({ name: 'Activities', icon: Activity, path: '/dashboard/student/activities' });
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

        // Add EMULATORS section if any emulator items are enabled (only for G4G7 students when grade is determined)
        if (dashboardType === 'G4_G7') {
          const emulatorItems = [];
          if (cohortNavigationSettings.emulators['Code Editor']) {
            emulatorItems.push({ name: 'Code Editor', icon: Code, path: '/dashboard/student/code-editor' });
          }
          if (cohortNavigationSettings.emulators['Scratch Editor']) {
            emulatorItems.push({ name: 'Scratch Editor', icon: Play, path: '/dashboard/student/scratch-editor' });
          }
          // Add new modal-based items
          emulatorItems.push(
            { name: 'E-books', icon: BookOpen, path: '#', isModal: true, modalType: 'ebook' },
            { name: 'Ask Teacher', icon: HelpCircle, path: '#', isModal: true, modalType: 'askTeacher' },
            { name: 'KODEIT AI Buddy', icon: Bot, path: '#', isModal: true, modalType: 'aiBuddy' },
            { name: 'Share with Class', icon: Share2, path: '#', isModal: true, modalType: 'shareClass' }
          );
          if (emulatorItems.length > 0) {
            studentItems.push({
              title: 'EMULATORS',
              items: emulatorItems
            });
          }
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
                         // Only show Current Lessons and Activities for G4G7 students when grade is determined
             ...(dashboardType === 'G4_G7' ? [
               { name: 'Current Lessons', icon: Clock, path: '/dashboard/student/current-lessons' },
               { name: 'Activities', icon: Activity, path: '/dashboard/student/activities' },
             ] : []),
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
                           // Only show EMULATORS section for G4G7 students when grade is determined
          ...(dashboardType === 'G4_G7' ? [{
            title: 'EMULATORS',
            items: [
              { name: 'Code Editor', icon: Code, path: '/dashboard/student/code-editor' },
              { name: 'Scratch Editor', icon: Play, path: '/dashboard/student/scratch-editor' },
              { name: 'E-books', icon: BookOpen, path: '#', isModal: true, modalType: 'ebook' },
              { name: 'Ask Teacher', icon: HelpCircle, path: '#', isModal: true, modalType: 'askTeacher' },
              { name: 'KODEIT AI Buddy', icon: Bot, path: '#', isModal: true, modalType: 'aiBuddy' },
              { name: 'Share with Class', icon: Share2, path: '#', isModal: true, modalType: 'shareClass' },
            ]
          }] : []),
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
  console.log('🎓 Student grade:', studentGrade);
  console.log('🎓 Dashboard type:', dashboardType);
  console.log('🎓 Is G4G7 student:', dashboardType === 'G4_G7');
  console.log('🎓 Grade detection status:', studentGrade ? 'Detected' : 'Not yet detected');

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
                                 <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center space-x-2 ${
                   section.title === 'EMULATORS' && dashboardType === 'G4_G7'
                     ? 'text-purple-600' 
                     : 'text-gray-500'
                 }`}>
                   {section.title === 'EMULATORS' && dashboardType === 'G4_G7' && (
                     <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                       <div className="w-2 h-2 bg-purple-600 rounded-sm"></div>
                     </div>
                   )}
                   <span>{section.title}</span>
                 </h3>
                 {section.title === 'EMULATORS' && dashboardType === 'G4_G7' ? (
                  // Special card-based layout for EMULATORS section
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      const isCodeEditor = item.name === 'Code Editor';
                      return (
                        <button
                          key={itemIndex}
                          onClick={() => {
                            console.log('🚀 DashboardLayout - Navigation clicked:', item.name, 'Path:', item.path);
                            
                            // Handle modal items
                            if (item.isModal) {
                              console.log('📱 Opening modal for:', item.modalType);
                              switch (item.modalType) {
                                case 'ebook':
                                  setShowEbookModal(true);
                                  break;
                                case 'askTeacher':
                                  setShowAskTeacherModal(true);
                                  break;
                                case 'aiBuddy':
                                  setShowAIBuddyModal(true);
                                  break;
                                case 'shareClass':
                                  setShowShareClassModal(true);
                                  break;
                                default:
                                  break;
                              }
                              return;
                            }
                            
                            console.log('📍 DashboardLayout - Current location:', location.pathname);
                            console.log('🎯 DashboardLayout - Navigating to:', item.path);
                            console.log('👤 DashboardLayout - User role:', userRole);
                            console.log('🔧 DashboardLayout - isNavigating state:', isNavigating);
                            
                            // Prevent multiple clicks
                            if (isNavigating) {
                              console.log('⚠️ DashboardLayout - Navigation already in progress, ignoring click');
                              return;
                            }
                            
                            setIsNavigating(true);
                            console.log('⏳ DashboardLayout - Set isNavigating to true');
                            
                            try {
                              // Use replace: true to replace the current history entry
                              // This prevents the course detail page from being in the back stack
                              console.log('🔄 DashboardLayout - Calling navigate with replace: true');
                              navigate(item.path, { replace: true });
                              console.log('✅ DashboardLayout - Navigation call completed');
                            } catch (error) {
                              console.error('❌ DashboardLayout - Navigation error:', error);
                            }
                            
                            // Reset navigation state after a short delay
                            setTimeout(() => {
                              console.log('🔄 DashboardLayout - Resetting isNavigating to false');
                              setIsNavigating(false);
                            }, 1000);
                          }}

                          disabled={isNavigating}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''} p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 shadow-sm'
                              : isCodeEditor
                                ? 'bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200'
                                : 'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200'
                          }`}

                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              isActive 
                                ? 'bg-purple-100 text-purple-600' 
                                : isCodeEditor
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-blue-100 text-blue-600'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <div className={`text-sm font-semibold ${
                                isActive ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {item.name}
                              </div>
                              <div className={`text-xs ${
                                isActive ? 'text-gray-600' : 'text-gray-500'
                              }`}>
                                {isCodeEditor ? 'Practice coding in virtual envir...' : 
                                 item.name === 'E-books' ? 'Access digital learning materials' :
                                 item.name === 'Ask Teacher' ? 'Get help from your instructor' :
                                 item.name === 'KODEIT AI Buddy' ? 'Get instant coding help' :
                                 item.name === 'Share with Class' ? 'Collaborate with classmates' :
                                 'Access digital learning materials'}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // Default layout for other sections
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
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
                )}
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

      {/* E-books Modal */}
      {showEbookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">E-books</h2>
                    <p className="text-gray-600">Access digital learning materials</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEbookModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sample E-books */}
                {[
                  { title: 'Introduction to Programming', author: 'Dr. Sarah Johnson', pages: 245, level: 'Beginner', cover: '/card1.webp' },
                  { title: 'Advanced Python Concepts', author: 'Prof. Michael Chen', pages: 320, level: 'Intermediate', cover: '/card2.webp' },
                  { title: 'Web Development Fundamentals', author: 'Dr. Emily Rodriguez', pages: 280, level: 'Beginner', cover: '/card3.webp' },
                  { title: 'Data Structures & Algorithms', author: 'Prof. David Kim', pages: 400, level: 'Advanced', cover: '/Innovative-ICT-Curricula.webp' },
                  { title: 'Machine Learning Basics', author: 'Dr. Lisa Wang', pages: 350, level: 'Intermediate', cover: '/home-carousal-for-teachers.webp' },
                  { title: 'Mobile App Development', author: 'Prof. James Wilson', pages: 290, level: 'Intermediate', cover: '/card1.webp' }
                ].map((book, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <img src={book.cover} alt={book.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{book.pages} pages</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{book.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ask Teacher Modal */}
      {showAskTeacherModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ask Teacher</h2>
                    <p className="text-gray-600">Get help from your instructor</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAskTeacherModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Available Teachers</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Dr. Sarah Johnson', subject: 'Programming', status: 'Online', avatar: '/card1.webp' },
                      { name: 'Prof. Michael Chen', subject: 'Python & AI', status: 'Online', avatar: '/card2.webp' },
                      { name: 'Dr. Emily Rodriguez', subject: 'Web Development', status: 'Busy', avatar: '/card3.webp' },
                      { name: 'Prof. David Kim', subject: 'Data Science', status: 'Offline', avatar: '/Innovative-ICT-Curricula.webp' }
                    ].map((teacher, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-medium text-gray-900">{teacher.name}</p>
                            <p className="text-sm text-gray-600">{teacher.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            teacher.status === 'Online' ? 'bg-green-500' : 
                            teacher.status === 'Busy' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></span>
                          <span className="text-sm text-gray-600">{teacher.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Questions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                      How do I start with Python programming?
                    </button>
                    <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                      What's the difference between arrays and lists?
                    </button>
                    <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                      Can you explain recursion with examples?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KODEIT AI Buddy Modal */}
      {showAIBuddyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">KODEIT AI Buddy</h2>
                    <p className="text-gray-600">Get instant coding help</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIBuddyModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">AI Features</h3>
                    <div className="space-y-3">
                      {[
                        { feature: 'Code Review', description: 'Get instant feedback on your code', icon: '🔍' },
                        { feature: 'Debug Help', description: 'Find and fix bugs quickly', icon: '🐛' },
                        { feature: 'Algorithm Suggestions', description: 'Learn better ways to solve problems', icon: '💡' },
                        { feature: 'Code Explanation', description: 'Understand complex code snippets', icon: '📚' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{item.feature}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full p-4 bg-white rounded-lg hover:bg-orange-50 transition-colors text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Review My Code</p>
                            <p className="text-sm text-gray-600">Upload your code for AI review</p>
                          </div>
                        </div>
                      </button>
                      <button className="w-full p-4 bg-white rounded-lg hover:bg-orange-50 transition-colors text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Ask Programming Question</p>
                            <p className="text-sm text-gray-600">Get help with coding concepts</p>
                          </div>
                        </div>
                      </button>
                      <button className="w-full p-4 bg-white rounded-lg hover:bg-orange-50 transition-colors text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Play className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Practice Problems</p>
                            <p className="text-sm text-gray-600">Get personalized practice questions</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share with Class Modal */}
      {showShareClassModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Share with Class</h2>
                    <p className="text-gray-600">Collaborate with classmates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareClassModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Class Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Python Calculator', members: 5, progress: 80, status: 'Active' },
                      { title: 'Web Portfolio', members: 3, progress: 60, status: 'Active' },
                      { title: 'Data Analysis Project', members: 4, progress: 90, status: 'Completed' },
                      { title: 'Mobile App Design', members: 6, progress: 30, status: 'Planning' }
                    ].map((project, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'Active' ? 'bg-green-100 text-green-800' :
                            project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{project.members} members</span>
                          <span>{project.progress}% complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Share Options</h3>
                  <div className="space-y-3">
                    <button className="w-full p-4 bg-white rounded-lg hover:bg-purple-50 transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Share Code Snippet</p>
                          <p className="text-sm text-gray-600">Share your code with the class</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 bg-white rounded-lg hover:bg-purple-50 transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Start Discussion</p>
                          <p className="text-sm text-gray-600">Create a new class discussion</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 bg-white rounded-lg hover:bg-purple-50 transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Form Study Group</p>
                          <p className="text-sm text-gray-600">Create a study group for a topic</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout; 