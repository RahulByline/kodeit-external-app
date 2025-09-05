import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building,
  Info,
  CheckCircle,
  ArrowRight,
  User,
  Flame,
  Star,
  Coins,
  LayoutDashboard,
  BookOpen,
  Clock,
  Activity,
  Play,
  Calendar,
  Target,
  TrendingUp,
  Award,
  FileText,
  Code,
  Zap,
  Eye,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Clock as ClockIcon,
  Users,
  BarChart3,
  Plus,
  X,
  ExternalLink,
  Download,
  BarChart3 as BarChart3Icon,
  Video,
  RefreshCw,
  Settings,
  Trophy,
  Bell,
  LogOut,
  MessageSquare,
  Monitor,
  Brain,
  Sparkles,
  Heart,
  Crown,
  Rocket,
  Terminal,
  GripVertical,
  Maximize2,
  Minimize2,
  Globe,
  File,
  ChevronDown,
  ChevronLeft,
  Circle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { enhancedMoodleService } from '../../../services/enhancedMoodleApi';
import logo from '../../../assets/logo.png';
import ScratchEmulator from '../../../components/dashboard/Emulator/ScratchEmulator';
import CodeEditorContent from '../../../features/codeEditor/CodeEditorContent';

// Helper functions for course data processing
const getCourseImageFallback = (categoryname?: string, fullname?: string): string => {
  // Use category-based fallback images
  const category = categoryname?.toLowerCase() || '';
  const name = fullname?.toLowerCase() || '';
  if (category.includes('programming') || category.includes('coding') || name.includes('programming')) {
    return '/card1.webp';
  } else if (category.includes('design') || category.includes('art') || name.includes('design')) {
    return '/card2.webp';
  } else if (category.includes('business') || category.includes('management') || name.includes('business')) {
    return '/card3.webp';
  } else if (category.includes('science') || category.includes('math') || name.includes('science')) {
    return '/Innovative-ICT-Curricula.webp';
  } else if (category.includes('language') || category.includes('english') || name.includes('language')) {
    return '/home-carousal-for-teachers.webp';
  } else {
    // Default fallback based on course name
    const courseName = fullname?.toLowerCase() || '';
    if (courseName.includes('web') || courseName.includes('development')) {
      return '/card1.webp';
    } else if (courseName.includes('design') || courseName.includes('creative')) {
      return '/card2.webp';
    } else if (courseName.includes('business') || courseName.includes('management')) {
      return '/card3.webp';
    } else {
      return '/card1.webp';
    }
  }
};

const getCourseDifficulty = (categoryname?: string, fullname?: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
  const category = categoryname?.toLowerCase() || '';
  const name = fullname?.toLowerCase() || '';
  if (category.includes('advanced') || name.includes('advanced') || name.includes('expert')) {
    return 'Advanced';
  } else if (category.includes('intermediate') || name.includes('intermediate') || name.includes('intermediate')) {
    return 'Intermediate';
  } else {
    return 'Beginner';
  }
};

// Helper functions for Moodle activity processing
const getActivityDuration = (activityType: string): string => {
  const durations: { [key: string]: string } = {
    'assign': '45 min',
    'quiz': '30 min',
    'resource': '20 min',
    'url': '15 min',
    'forum': '25 min',
    'workshop': '60 min',
    'scorm': '40 min',
    'lti': '35 min'
  };
  return durations[activityType] || '30 min';
};

const mapActivityType = (moodleType: string): Activity['type'] => {
  const typeMap: { [key: string]: Activity['type'] } = {
    'assign': 'assignment',
    'quiz': 'quiz',
    'resource': 'resource',
    'url': 'url',
    'forum': 'discussion',
    'workshop': 'workshop',
    'scorm': 'resource',
    'lti': 'discussion'
  };
  return typeMap[moodleType] || 'assignment';
};

const mapLessonType = (moodleType: string): Lesson['type'] => {
  const typeMap: { [key: string]: Lesson['type'] } = {
    'assign': 'assignment',
    'quiz': 'quiz',
    'resource': 'video',
    'url': 'video',
    'forum': 'practice',
    'workshop': 'assignment',
    'scorm': 'video',
    'lti': 'practice'
  };
  return typeMap[moodleType] || 'video';
};

const getActivityStatus = (completion: any): 'completed' | 'in-progress' | 'not-started' => {
  if (!completion) return 'not-started';
  
  if (completion.state === 1) return 'completed';
  if (completion.state === 0) return 'in-progress';
  return 'not-started';
};

const getActivityProgress = (completion: any): number => {
  if (!completion) return 0;
  
  if (completion.state === 1) return 100;
  if (completion.state === 0) return 50;
  return 0;
};

const isNewActivity = (dates: any[]): boolean => {
  if (!dates || dates.length === 0) return false;
  
  // Check if any date is within the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return dates.some((date: any) => {
    const activityDate = new Date(date.timestamp * 1000);
    return activityDate > oneWeekAgo;
  });
};

const getActivityDueDate = (dates: any[]): string | undefined => {
  if (!dates || dates.length === 0) return undefined;
  
  // Find the due date (usually the last date in the array)
  const dueDate = dates.find((date: any) => date.label === 'Due date') || dates[dates.length - 1];
  
  if (dueDate) {
    return new Date(dueDate.timestamp * 1000).toISOString().split('T')[0];
  }
  
  return undefined;
};

const getActivityImage = (activityType: string, courseImage?: string): string => {
  const typeImages: { [key: string]: string } = {
    'assign': '/card1.webp',
    'quiz': '/card2.webp',
    'resource': '/card3.webp',
    'url': '/Innovative-ICT-Curricula.webp',
    'forum': '/home-carousal-for-teachers.webp',
    'workshop': '/card1.webp',
    'scorm': '/card2.webp',
    'lti': '/card3.webp'
  };
  
  return typeImages[activityType] || courseImage || '/card1.webp';
};

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  category: string;
  image: string;
  isActive: boolean;
  lastAccessed: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  // Real data fields
  completionStatus: string;
  enrollmentCount: number;
  averageGrade: number;
  timeSpent: number;
  certificates: number;
  type: string;
  tags: string[];
  completionData?: any;
  activitiesData?: any;
}

interface Lesson {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'practice';
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
  dueDate?: string;
  isNew?: boolean;
  prerequisites?: string;
  image?: string;
}

interface Activity {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'project' | 'discussion' | 'workshop' | 'url' | 'resource';
  courseId: string;
  courseTitle: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'completed' | 'in-progress';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRemaining: string;
}

interface Exam {
  id: string;
  title: string;
  schedule: string;
  daysLeft: number;
  isNew: boolean;
  courseTitle: string;
}

interface StudentStats {
  totalCourses: number;
  lessonsCompleted: number;
  totalPoints: number;
  weeklyGoal: string;
  streak: number;
  coins: number;
}

interface ScheduleEvent {
  date: string;
  day: string;
  hasActivity: boolean;
  isDisabled: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  type: 'learning' | 'practice';
  duration: string;
  progress: number;
  total: number;
}

interface G4G7DashboardProps {
  // Make props optional since we'll fetch everything internally
  userCourses?: any[];
  courseProgress?: any[];
  studentActivities?: any[];
  userAssignments?: any[];
}

// Helper function to transform courses to lessons format
const transformCoursesToLessons = (courses: any[]): Lesson[] => {
  const lessons: Lesson[] = [];
  
  courses.forEach((course) => {
    // Create a lesson entry for each course
    lessons.push({
      id: `course-${course.id}`,
      title: course.fullname || course.title,
            courseId: course.id,
      courseTitle: course.fullname || course.title,
      duration: '45 min',
      type: 'video',
      status: course.progress > 80 ? 'completed' : course.progress > 0 ? 'in-progress' : 'not-started',
      progress: course.progress || 0,
      isNew: false,
      image: course.courseimage || getCourseImageFallback(course.categoryname, course.fullname)
    });
  });
  
  return lessons;
};

// Helper function to transform activities to our format
const transformActivities = (activities: any[]): Activity[] => {
  return activities.map((activity: any) => ({
    id: activity.id?.toString() || `activity-${Math.random()}`,
    title: activity.name || activity.title || 'Activity',
    type: mapActivityType(activity.type || activity.modname || 'assignment') as Activity['type'],
    courseId: activity.courseid || activity.course || '1',
    courseTitle: activity.coursename || activity.courseTitle || 'Course',
    dueDate: activity.duedate ? new Date(activity.duedate * 1000).toLocaleDateString() : 'No due date',
    status: getActivityStatus(activity.completion || activity.completiondata) as Activity['status'],
    points: getActivityPoints(activity.type || activity.modname),
    difficulty: getActivityDifficulty(activity.type || activity.modname),
    timeRemaining: 'No deadline'
  }));
};

// Helper functions for activity processing (standalone functions)
const getActivityPoints = (activityType: string): number => {
    const points: { [key: string]: number } = {
      'assign': 150,
      'quiz': 100,
      'forum': 50,
      'workshop': 200,
      'url': 25,
      'resource': 30
    };
    return points[activityType] || 100;
};

const getActivityDifficulty = (activityType: string): Activity['difficulty'] => {
    const difficulties: { [key: string]: Activity['difficulty'] } = {
      'assign': 'medium',
      'quiz': 'easy',
      'forum': 'easy',
      'workshop': 'hard',
      'url': 'easy',
      'resource': 'easy'
    };
    return difficulties[activityType] || 'medium';
};

// Mock data functions (same as G1G3Dashboard approach)
const getMockExams = (): Exam[] => [
    {
      id: '1',
          title: 'Web Development Fundamentals - Final Exam',
      schedule: 'Tue, 26th Aug - 06:55pm - 08:35pm',
      daysLeft: 4,
          isNew: true,
          courseTitle: 'Web Development Fundamentals'
        }
      ];

const getMockSchedule = (): ScheduleEvent[] => [
    { date: '20', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '21', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '22', day: 'SAT', hasActivity: true, isDisabled: false },
    { date: '23', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '24', day: 'MON', hasActivity: false, isDisabled: true },
    { date: '25', day: 'TUE', hasActivity: true, isDisabled: false },
        { date: '26', day: 'WED', hasActivity: true, isDisabled: false }
      ];

const getMockStats = (): StudentStats => ({
        totalCourses: 3,
        lessonsCompleted: 12,
        totalPoints: 850,
        weeklyGoal: '3/5',
        streak: 5,
        coins: 1250
});

// Self-contained G4G7Dashboard component (like G1G3Dashboard)
const G4G7Dashboard: React.FC<G4G7DashboardProps> = React.memo(({
  userCourses: propUserCourses,
  courseProgress: propCourseProgress,
  studentActivities: propStudentActivities,
  userAssignments: propUserAssignments
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Main dashboard state (completely self-contained like G1G3Dashboard)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'profile-settings' | 'scratch-editor' | 'code-editor' | 'ebooks' | 'ask-teacher' | 'share-class' | 'competencies'>('dashboard');
  const [codeEditorTab, setCodeEditorTab] = useState<'output' | 'errors' | 'terminal'>('output');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Core data state (fetched internally)
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  
  // Additional dashboard data (fetched internally)
  const [exams, setExams] = useState<Exam[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats>({
    totalCourses: 0,
    lessonsCompleted: 0,
    totalPoints: 0,
    weeklyGoal: '0/5',
    streak: 0,
    coins: 0
  });

  // Real IOMAD data states (like G1G3Dashboard)
  const [realLessons, setRealLessons] = useState<any[]>([]);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [realTreeData, setRealTreeData] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedTreeSections, setExpandedTreeSections] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Real upcoming lessons and activities from IOMAD
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);
  
  // Real upcoming course sessions for schedule
  const [upcomingCourseSessions, setUpcomingCourseSessions] = useState<any[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Notification system states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Competency system states
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [userCompetencies, setUserCompetencies] = useState<any[]>([]);
  const [competencyProgress, setCompetencyProgress] = useState<any[]>([]);
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<any>(null);
  const [showCompetencyDetail, setShowCompetencyDetail] = useState(false);

  // Course detail states with sections
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [courseSections, setCourseSections] = useState<any[]>([]);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState(false);

  // Section detail states
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [sectionActivities, setSectionActivities] = useState<any[]>([]);
  const [isLoadingSectionActivities, setIsLoadingSectionActivities] = useState(false);
  const [isInActivitiesView, setIsInActivitiesView] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'course-detail' | 'section-view'>('dashboard');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Activity detail states
  const [activityDetails, setActivityDetails] = useState<any>(null);
  const [isLoadingActivityDetails, setIsLoadingActivityDetails] = useState(false);
  const [isActivityStarted, setIsActivityStarted] = useState(false);
  const [activityProgress, setActivityProgress] = useState(0);

  // SCORM content states
  const [isScormLaunched, setIsScormLaunched] = useState(false);
  const [scormContent, setScormContent] = useState<any>(null);
  const [scormMeta, setScormMeta] = useState<any>(null);
  const [scormLoadingMeta, setScormLoadingMeta] = useState(false);

  // Modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Memoized top navigation items to prevent re-creation - G4 specific routes
  const topNavItems = useMemo(() => [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
    { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
    { name: 'Current Lessons', icon: Clock, path: '/dashboard/student/g4current-lessons' },
    { name: 'Activities', icon: Activity, path: '/dashboard/student/g4activities' }
  ], []);

  // Memoized helper functions
  const isActivePath = useCallback((path: string) => {
    if (path === '/dashboard/student') {
      return location.pathname === '/dashboard/student' || location.pathname === '/dashboard/student/';
    }
    return location.pathname === path;
  }, [location.pathname]);

  const handleTopNavClick = useCallback((path: string) => {
    console.log('🎯 G4G7 Dashboard: Navigating to:', path);
    
    // If navigating to courses, ensure we have fresh data
    if (path === '/dashboard/student/courses') {
      console.log('📚 Refreshing course data for navigation...');
      fetchDashboardData();
    }
    
    navigate(path);
  }, [navigate]);

  // Tab change handler
  const handleTabChange = useCallback((tab: 'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'profile-settings' | 'scratch-editor' | 'code-editor' | 'ebooks' | 'ask-teacher' | 'share-class' | 'competencies') => {
    setActiveTab(tab);
    // Reset course detail view when changing tabs
    if (tab !== 'courses') {
      setShowCourseDetail(false);
      setSelectedCourse(null);
      setSelectedSection(null);
      setCurrentPage('dashboard');
    }
  }, []);

  // Handle course click to show lessons (internal navigation)
  const handleCourseClickInternal = useCallback((course: Course) => {
    console.log('🎓 Course clicked:', course.title);
    setSelectedCourse(course);
    setShowCourseDetail(true);
    setCurrentPage('course-detail');
    fetchCourseDetail(course.id.toString());
  }, []);

  // Handle lesson click to open lesson content
  const handleLessonClick = useCallback((lesson: Lesson) => {
    console.log('📚 Lesson clicked:', lesson.title);
    
    // Store selected lesson in localStorage
    localStorage.setItem('selectedLesson', JSON.stringify(lesson));
    
    // Open modal with lesson details
    setSelectedLesson(lesson);
    setIsLessonModalOpen(true);
  }, []);

  // Handle activity click to open activity
  const handleActivityClick = useCallback((activity: Activity) => {
    console.log('🎯 Activity clicked:', activity.title);
    
    // Store selected activity in localStorage
    localStorage.setItem('selectedActivity', JSON.stringify(activity));
    
    // Open modal with activity details
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  }, []);

  // Cache data in localStorage
  const cacheData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, []);

  // Enhanced data fetching with parallel loading for G4G7 Dashboard
    const fetchDashboardData = async () => {
    if (!currentUser?.id) {
      console.log('⚠️ No current user, skipping data fetch');
      setIsLoading(false);
        return;
      }

    try {
      setIsLoading(true);
      setIsServerOffline(false);
      setServerError('');
      console.log('🚀 G4G7 Dashboard: Loading data with parallel API calls...');
      
      // Fetch all data in parallel for better performance
      const [dashboardData, realLessonsData, realActivitiesData, realTreeData] = await Promise.all([
        enhancedMoodleService.getDashboardData(currentUser.id.toString()),
          fetchRealLessons(),
          fetchRealActivities(),
          fetchRealTreeViewData()
        ]);

      // Set main dashboard data
      setCourses(dashboardData.courses);
      setActivities(dashboardData.activities);
      setAssignments(dashboardData.assignments);
      
      // Set additional IOMAD data
        setRealLessons(realLessonsData);
        setRealActivities(realActivitiesData);
        setRealTreeData(realTreeData);

      console.log(`✅ G4G7 Dashboard loaded successfully:`);
      console.log(`📊 Courses: ${dashboardData.courses.length}, Activities: ${dashboardData.activities.length}, Assignments: ${dashboardData.assignments.length}`);
      console.log(`📚 Real Data: ${realLessonsData.length} lessons, ${realActivitiesData.length} activities, ${realTreeData.length} tree items`);

    } catch (error: any) {
      console.error('❌ Error in G4G7 dashboard data loading:', error);
      
      // Check if it's a server connectivity issue
      if (error.code === 'ERR_NETWORK' || error.message?.includes('refused to connect')) {
        setIsServerOffline(true);
        setServerError('Unable to connect to the server. Please check your internet connection or try again later.');
      } else {
        setServerError(error.message || 'Failed to load dashboard data');
      }
      
      // Fallback to prop data or empty arrays
      setCourses(propUserCourses || []);
      setActivities(propStudentActivities || []);
      setAssignments(propUserAssignments || []);
      setRealLessons([]);
      setRealActivities([]);
      setRealTreeData([]);
    } finally {
              setIsLoading(false);
    }
  };

  // Fetch real IOMAD lessons data (same as G1G3Dashboard)
  const fetchRealLessons = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD lessons data...');
      const allLessons: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch lessons from each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              if (module.modname === 'lesson' || module.modname === 'resource' || module.modname === 'url') {
                allLessons.push({
                  id: module.id,
                  name: module.name,
                  description: module.description || module.intro || 'Complete this lesson to progress in your learning.',
                  duration: module.duration || '45 min',
                  points: module.grade || 25,
                  difficulty: module.difficulty || 'Easy',
                  status: module.completiondata?.state === 1 ? 'completed' : 
                         module.completiondata?.state === 2 ? 'in_progress' : 'pending',
                  progress: module.completiondata?.progress || 0,
                  courseName: course.fullname || course.shortname,
                  courseId: course.id,
                  sectionName: section.name,
                  sectionId: section.id,
                  moduleType: module.modname,
                  url: module.url,
                  visible: module.visible !== 0,
                  completion: module.completion,
                  completiondata: module.completiondata,
                  timemodified: module.timemodified,
                  added: module.added
                });
              }
            });
          }
        });
      }
      
      console.log(`✅ Fetched ${allLessons.length} real lessons from IOMAD`);
      return allLessons;
      } catch (error) {
      console.error('❌ Error fetching real lessons:', error);
      return [];
    }
  };

  // Fetch real IOMAD activities data (same as G1G3Dashboard)
  const fetchRealActivities = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD activities data...');
      const allActivities: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch activities from each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              // Include all module types as activities
              let activityType = 'activity';
              let icon = Activity;
              
              // Check if this is a video-related activity
              const isVideoActivity = module.modname === 'video' || 
                                    module.modname === 'url' || 
                                    module.modname === 'resource' ||
                                    (module.name && module.name.toLowerCase().includes('video')) ||
                                    (module.description && module.description.toLowerCase().includes('video'));
              
              if (isVideoActivity) {
                activityType = 'Video';
                icon = Video;
              } else if (module.modname === 'quiz') {
                activityType = 'Quiz';
                icon = FileText;
              } else if (module.modname === 'assign') {
                activityType = 'Assignment';
                icon = Code;
              } else if (module.modname === 'forum') {
                activityType = 'Discussion';
                icon = Users;
              } else if (module.modname === 'scorm') {
                activityType = 'SCORM';
                icon = BookOpen;
              }
              
              allActivities.push({
                id: module.id,
                name: module.name,
                type: activityType,
                icon: icon,
                description: module.description || module.intro || 'Complete this activity to progress in your learning.',
                duration: module.duration || '30 min',
                points: module.grade || 10,
                difficulty: module.difficulty || 'Easy',
                status: module.completiondata?.state === 1 ? 'Completed' : 
                       module.completiondata?.state === 2 ? 'In Progress' : 'Pending',
                progress: module.completiondata?.progress || 0,
                courseName: course.fullname || course.shortname,
                courseId: course.id,
                sectionName: section.name,
                sectionId: section.id,
                moduleType: module.modname,
                url: module.url,
                visible: module.visible !== 0,
                completion: module.completion,
                completiondata: module.completiondata,
                timemodified: module.timemodified,
                added: module.added
              });
            });
          }
        });
      }
      
      console.log(`✅ Fetched ${allActivities.length} real activities from IOMAD`);
      return allActivities;
    } catch (error) {
      console.error('❌ Error fetching real activities:', error);
      return [];
    }
  };

  // Fetch real IOMAD tree view data with sections (same as G1G3Dashboard)
  const fetchRealTreeViewData = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD tree view data with sections...');
      const treeData: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch detailed data for each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        const courseSections: any[] = [];
        let completedSections = 0;
        let totalSections = 0;

        // Process each section
        courseContents.forEach((section: any, sectionIndex: number) => {
          if (section.modules && Array.isArray(section.modules)) {
            const sectionActivities: any[] = [];
            let sectionCompletedCount = 0;
            let sectionTotalCount = 0;

            // Process modules in this section
            section.modules.forEach((module: any, moduleIndex: number) => {
              totalSections++;
              sectionTotalCount++;
              if (module.completiondata?.state === 1) {
                completedSections++;
                sectionCompletedCount++;
              }

              // Determine module type and icon
              let moduleType = 'Activity';
              let moduleIcon = Activity;
              
              if (module.modname === 'lesson') {
                moduleType = 'Lesson';
                moduleIcon = BookOpen;
              } else if (module.modname === 'quiz') {
                moduleType = 'Quiz';
                moduleIcon = FileText;
              } else if (module.modname === 'assign') {
                moduleType = 'Assignment';
                moduleIcon = Code;
              } else if (module.modname === 'forum') {
                moduleType = 'Discussion';
                moduleIcon = Users;
              } else if (module.modname === 'scorm') {
                moduleType = 'SCORM';
                moduleIcon = BookOpen;
              } else if (module.modname === 'resource' || module.modname === 'url') {
                moduleType = 'Resource';
                moduleIcon = Video;
              }

              const activity = {
                id: module.id,
                name: module.name,
                type: moduleType,
                status: module.completiondata?.state === 1 ? 'completed' : 
                       module.completiondata?.state === 2 ? 'in_progress' : 'pending',
                order: moduleIndex + 1,
                icon: moduleIcon,
                modname: module.modname,
                url: module.url,
                contents: module.contents,
                completiondata: module.completiondata,
                description: module.description || module.intro || `Complete this ${moduleType} to progress.`,
                sectionName: section.name,
                sectionId: section.id || sectionIndex
              };

              sectionActivities.push(activity);
            });

            // Create section structure
            const sectionProgress = sectionTotalCount > 0 ? Math.round((sectionCompletedCount / sectionTotalCount) * 100) : 0;
            const sectionData = {
              id: section.id || `section_${sectionIndex}`,
              name: section.name || `Section ${sectionIndex + 1}`,
              type: 'section',
              summary: section.summary || '',
              activities: sectionActivities,
              activityCount: sectionActivities.length,
              completedActivities: sectionCompletedCount,
              totalActivities: sectionTotalCount,
              progress: sectionProgress,
              sectionNumber: sectionIndex + 1
            };

            courseSections.push(sectionData);
          }
        });

        // Create course structure
        const courseProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
        const courseData = {
          id: course.id,
          name: course.fullname || course.shortname,
          type: 'course',
          summary: course.summary || '',
          sections: courseSections,
          sectionCount: courseSections.length,
          completedSections: completedSections,
          totalSections: totalSections,
          progress: courseProgress,
          courseImage: course.courseimage || getCourseImageFallback(course.categoryname, course.fullname)
        };

        treeData.push(courseData);
      }
      
      console.log(`✅ Fetched ${treeData.length} courses with sections from IOMAD`);
      return treeData;
      } catch (error) {
      console.error('❌ Error fetching real tree view data:', error);
      return [];
    }
  };

  // Fetch course detail with sections (same as G1G3Dashboard)
  const fetchCourseDetail = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      setIsLoadingCourseDetail(true);
      console.log('🔄 Fetching course detail for:', courseId);
      
      // Get course contents (modules and lessons)
      const response = await enhancedMoodleService.getCourseContents(courseId);
      
      if (response && Array.isArray(response)) {
        const modules: any[] = [];
        const lessons: any[] = [];
        const sections: any[] = [];
        
        response.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            const sectionModules: any[] = [];
            const sectionLessons: any[] = [];
            
            section.modules.forEach((module: any) => {
              if (module.modname === 'lesson') {
                lessons.push({
                  ...module,
                  sectionName: section.name
                });
                sectionLessons.push({
                  ...module,
                  sectionName: section.name
                });
              } else {
                modules.push({
                  ...module,
                  sectionName: section.name
                });
                sectionModules.push({
                  ...module,
                  sectionName: section.name
                });
              }
            });
            
            sections.push({
              ...section,
              modules: sectionModules,
              lessons: sectionLessons,
              totalModules: sectionModules.length,
              totalLessons: sectionLessons.length
            });
          }
        });
        
        setCourseModules(modules);
        setCourseLessons(lessons);
        setCourseSections(sections);
        console.log(`✅ Found ${modules.length} modules, ${lessons.length} lessons, ${sections.length} sections`);
      }
    } catch (error) {
      console.error('❌ Error fetching course detail:', error);
      } finally {
      setIsLoadingCourseDetail(false);
    }
  };

  const handleBackToCourses = () => {
    setShowCourseDetail(false);
    setSelectedCourse(null);
    setCourseModules([]);
    setCourseLessons([]);
    setCourseSections([]);
    setSelectedSection(null);
    setSectionActivities([]);
    setCurrentPage('dashboard');
  };

  const handleSectionClick = (section: any) => {
    console.log('🎯 Section clicked:', section);
    const sectionId = section.name;
    
    // Set the selected section to show activities
    setSelectedSection(section);
    
    // Reset activity view state
    setSelectedActivity(null);
    setActivityDetails(null);
    setIsActivityStarted(false);
    setActivityProgress(0);
    setIsInActivitiesView(false);
    
    // Navigate to section view page
    setCurrentPage('section-view');
    
    // Fetch real activities for this section
    fetchSectionActivities(section.name);
  };

  const fetchSectionActivities = async (sectionName: string) => {
    if (!sectionName || !selectedCourse) return;
    
    try {
      setIsLoadingSectionActivities(true);
      console.log('🔄 Fetching activities for section:', sectionName);
      
      const courseContents = await enhancedMoodleService.getCourseContents(selectedCourse.id.toString());
      console.log('📦 Course contents from API:', courseContents);
      
      // Find the specific section by name
      const targetSection = courseContents.find((section: any) => 
        section.name === sectionName || 
        section.summary?.includes(sectionName) ||
        section.section === sectionName
      );
      
      if (targetSection && targetSection.modules) {
        const activities = targetSection.modules.map((module: any) => ({
          id: module.id,
          name: module.name,
          type: module.modname,
          description: module.description || module.intro || 'Complete this activity to progress.',
          status: module.completiondata?.state === 1 ? 'completed' : 
                 module.completiondata?.state === 2 ? 'in_progress' : 'pending',
          progress: module.completiondata?.progress || 0,
          url: module.url,
          visible: module.visible !== 0,
          completion: module.completion,
          completiondata: module.completiondata,
          timemodified: module.timemodified,
          added: module.added
        }));
        
        setSectionActivities(activities);
        console.log(`✅ Found ${activities.length} activities in section ${sectionName}`);
      } else {
        console.log('⚠️ Section not found or has no modules');
        setSectionActivities([]);
      }
      } catch (error) {
      console.error('❌ Error fetching section activities:', error);
      setSectionActivities([]);
    } finally {
      setIsLoadingSectionActivities(false);
    }
  };

  const handleBackToCourseView = () => {
    setSelectedSection(null);
    setSectionActivities([]);
    setExpandedSections(new Set());
    setCurrentPage('course-detail');
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    setSelectedSection(null);
    setSelectedActivity(null);
    setActivityDetails(null);
    setShowCourseDetail(false);
    setCurrentPage('dashboard');
  };

  // Refresh function for manual data reloading
  const refreshData = useCallback(async () => {
    console.log('🔄 G4G7 Dashboard: Manual refresh triggered');
    await fetchDashboardData();
  }, []);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    if (currentUser?.id) {
      console.log('🚀 G4G7 Dashboard: Component mounted, fetching data...');
    fetchDashboardData();
      
      // Set mock data for other components
      setExams(getMockExams());
      setScheduleEvents(getMockSchedule());
      setStudentStats(getMockStats());
    }
  }, [currentUser?.id]);

  // Memoized helper functions for status colors
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'in-progress': return 'bg-blue-100 text-blue-600';
      case 'not-started': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }, []);

  const getActivityStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-600';
      case 'graded': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }, []);

  const getDifficultyBadgeColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  // Modal close functions
  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setSelectedLesson(null);
  };

  const closeActivityModal = () => {
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  // Memoized computed values with real data (using internal data like G1G3Dashboard)
  const activeCoursesCount = useMemo(() => courses.filter((c: any) => c.visible !== 0).length, [courses]);
  const completedLessonsCount = useMemo(() => {
    // Use real lessons data from IOMAD
    return realLessons.filter(l => l.status === 'completed').length;
  }, [realLessons]);
  const pendingActivitiesCount = useMemo(() => realActivities.filter(a => a.status === 'Pending').length, [realActivities]);
  
  // Additional real data stats from internal fetching
  const totalProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + (course.progress || 0), 0);
    return Math.round(totalProgress / courses.length);
  }, [courses]);
  
  const totalTimeSpent = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.timeSpent || 0), 0);
  }, [courses]);
  
  const totalCertificates = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.certificates || 0), 0);
  }, [courses]);

  // Transform real data for UI display
  const displayCourses = useMemo(() => {
    console.log('🔄 G4G7 Dashboard: Transforming course data...', courses.length, 'courses');
    
    return courses.map((course: any) => {
      const courseLessons = realLessons.filter(l => l.courseId === course.id);
      const completedLessons = courseLessons.filter(l => l.status === 'completed');
      
      return {
      id: course.id,
        title: course.fullname || course.title || 'Untitled Course',
        description: course.summary || course.description || 'No description available',
        instructor: course.instructor || 'Instructor TBD',
      progress: course.progress || 0,
        totalLessons: courseLessons.length,
        completedLessons: completedLessons.length,
        duration: course.duration || `${Math.floor(Math.random() * 8) + 4} weeks`,
        category: course.categoryname || course.category || 'General',
        image: course.courseimage || course.image || getCourseImageFallback(course.categoryname, course.fullname),
      isActive: course.visible !== 0,
      lastAccessed: course.lastAccess ? new Date(course.lastAccess * 1000).toLocaleDateString() : 'Recently',
      difficulty: getCourseDifficulty(course.categoryname, course.fullname),
        completionStatus: course.progress === 100 ? 'completed' : course.progress > 0 ? 'in_progress' : 'not_started',
        enrollmentCount: course.enrollmentCount || 0,
        averageGrade: course.averageGrade || 0,
        timeSpent: course.timeSpent || 0,
        certificates: course.certificates || 0,
        type: course.type || 'Self-paced',
        tags: course.tags || [],
      completionData: course.completionData,
      activitiesData: course.activitiesData
      };
    });
  }, [courses, realLessons]);

  const displayLessons = useMemo(() => {
    return realLessons.map((lesson: any) => ({
      id: lesson.id.toString(),
      title: lesson.name,
      courseId: lesson.courseId,
      courseTitle: lesson.courseName,
      duration: lesson.duration,
      type: mapLessonType(lesson.moduleType),
      status: lesson.status,
      progress: lesson.progress,
      isNew: false,
      dueDate: undefined,
      prerequisites: undefined,
      image: getActivityImage(lesson.moduleType)
    }));
  }, [realLessons]);

  const displayActivities = useMemo(() => {
    console.log('🔄 G4G7 Dashboard: Transforming activities data...', realActivities.length, 'activities');
    
    return realActivities.map((activity: any) => ({
      id: activity.id.toString(),
      title: activity.name || 'Untitled Activity',
      type: mapActivityType(activity.moduleType || activity.type),
      courseId: activity.courseId,
      courseTitle: activity.courseName || 'Unknown Course',
      dueDate: activity.dueDate || 'No due date',
      status: activity.status ? activity.status.toLowerCase().replace(' ', '-') : 'not-started',
      points: activity.points || 0,
      difficulty: activity.difficulty ? activity.difficulty.toLowerCase() : 'medium',
      timeRemaining: activity.timeRemaining || 'No deadline'
    }));
  }, [realActivities]);
  
  // Data status indicator - MUST be before early returns to maintain hooks order
  const dataStatus = useMemo(() => {
    if (isLoading) return { status: 'loading', message: 'Loading data...' };
    if (isServerOffline) return { status: 'error', message: 'Server offline' };
    if (serverError) return { status: 'error', message: serverError };
    if (courses.length === 0 && realLessons.length === 0 && realActivities.length === 0) {
      return { status: 'empty', message: 'No data available' };
    }
    return { status: 'success', message: 'Data loaded successfully' };
  }, [isLoading, isServerOffline, serverError, courses.length, realLessons.length, realActivities.length]);

  // Loading state (same as G1G3Dashboard)
  if (isLoading && !hasInitialized) {
  return (
      <div className="bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Loading your dashboard...</p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{loadingProgress}% complete</p>
          </div>
        </div>
      </div>
    );
  }

  // Server offline state
  if (isServerOffline) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Server Offline</h3>
            <p className="text-gray-600 mb-4">{serverError}</p>
            <button 
              onClick={() => {
                setIsServerOffline(false);
                setServerError('');
                fetchDashboardData();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Course Detail View Component
  const renderCourseDetailView = () => {
    if (!selectedCourse) return null;

    return (
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToCourses}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Courses</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Course Progress</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${selectedCourse.progress || 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{selectedCourse.progress || 0}%</span>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <img 
              src={selectedCourse.image || getCourseImageFallback(selectedCourse.category, selectedCourse.title)} 
              alt={selectedCourse.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h1>
              <p className="text-gray-600 mb-3">{selectedCourse.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{courseSections.length} Sections</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>{courseModules.length} Activities</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedCourse.duration}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Sections</h2>
          
          {isLoadingCourseDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading sections...</span>
            </div>
          ) : courseSections.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sections Available</h3>
              <p className="text-gray-600">This course doesn't have any sections yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courseSections.map((section, index) => (
                <div 
                  key={section.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {section.sectionNumber || index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{section.name}</h3>
                        <p className="text-sm text-gray-600">
                          {section.totalModules || 0} activities • {section.totalLessons || 0} lessons
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {section.completedActivities || 0}/{section.totalActivities || 0}
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${section.progress || 0}%` }}
                        ></div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Section Detail View Component
  const renderSectionDetailView = () => {
    if (!selectedSection) return null;

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToCourseView}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Course</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Section Progress</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${selectedSection.progress || 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{selectedSection.progress || 0}%</span>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-xl">
                {selectedSection.sectionNumber || 'S'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedSection.name}</h1>
              <p className="text-gray-600 mb-3">{selectedSection.summary || 'Complete the activities in this section to progress.'}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>{sectionActivities.length} Activities</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{sectionActivities.filter(a => a.status === 'completed').length} Completed</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Section Activities</h2>
          
          {isLoadingSectionActivities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading activities...</span>
            </div>
          ) : sectionActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Available</h3>
              <p className="text-gray-600">This section doesn't have any activities yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sectionActivities.map((activity, index) => (
                <div 
                  key={activity.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.status === 'completed' ? 'bg-green-100' : 
                        activity.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {activity.type === 'quiz' ? <FileText className="w-5 h-5 text-blue-600" /> :
                         activity.type === 'assign' ? <Code className="w-5 h-5 text-purple-600" /> :
                         activity.type === 'lesson' ? <BookOpen className="w-5 h-5 text-green-600" /> :
                         activity.type === 'forum' ? <Users className="w-5 h-5 text-orange-600" /> :
                         activity.type === 'scorm' ? <BookOpen className="w-5 h-5 text-indigo-600" /> :
                         <Activity className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                        activity.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.status === 'completed' ? 'Completed' :
                         activity.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Enhanced Fixed Sidebar */}
      <div className="fixed top-0 left-0 z-30 w-64 h-full bg-white shadow-xl border-r border-gray-200 overflow-y-auto hidden lg:block scrollbar-hide">
        {/* Enhanced Logo */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg">G4G7 Dashboard</h1>
              <p className="text-gray-600 text-xs">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="p-3 space-y-4 pb-16">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              DASHBOARD
            </h3>
            <ul className="space-y-1">
              <li>
              <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'dashboard' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
              </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('courses')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'courses' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Courses</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('lessons')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'lessons' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Lessons</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('activities')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'activities' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Activities</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('achievements')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'achievements' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Achievements</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('competencies')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'competencies' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Competencies</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('schedule')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'schedule' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </li>
            </ul>
        </div>

          {/* Tools & Resources Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              TOOLS & RESOURCES
            </h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => handleTabChange('tree-view')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'tree-view' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Tree View</span>
                </button>
              </li>
            </ul>
      </div>

          {/* Settings & Profile Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              SETTINGS & PROFILE
            </h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => handleTabChange('profile-settings')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'profile-settings' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              QUICK ACTIONS
            </h3>
            <div className="space-y-3">
              
              {/* E-books Card */}
              <div className="group relative overflow-hidden bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                   onClick={() => handleTabChange('ebooks')}>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">E-books</h4>
                    <p className="text-xs text-gray-600">Access digital learning materials</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Ask Teacher Card */}
              <div className="group relative overflow-hidden bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                   onClick={() => handleTabChange('ask-teacher')}>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Ask Teacher</h4>
                    <p className="text-xs text-gray-600">Get help from your instructor</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* KODEIT AI Buddy Card */}
              <div className="group relative overflow-hidden bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                   onClick={() => {
                     // AI Buddy functionality - could open a chat interface or redirect to AI help
                     console.log('KODEIT AI Buddy clicked');
                     alert('KODEIT AI Buddy feature coming soon!');
                   }}>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">KODEIT AI Buddy</h4>
                    <p className="text-xs text-gray-600">Get instant coding help</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Code Editor Card */}
              <div className="group relative overflow-hidden bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                   onClick={() => handleTabChange('code-editor')}>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Code Editor</h4>
                    <p className="text-xs text-gray-600">Write and run JavaScript code</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Share with Class Card */}
              <div className="group relative overflow-hidden bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                   onClick={() => handleTabChange('share-class')}>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Share with Class</h4>
                    <p className="text-xs text-gray-600">Collaborate with classmates</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Scratch Editor Card */}
              <div className="group relative overflow-hidden bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                   onClick={() => handleTabChange('scratch-editor')}>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Play className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Scratch Editor</h4>
                    <p className="text-xs text-gray-600">Create interactive projects</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        
          
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Server Error Banner */}
        {isServerOffline && (
          <div className="fixed top-0 left-0 lg:left-64 right-0 z-30 bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-800 font-medium">Server Offline</span>
                <span className="text-red-600 text-sm">{serverError}</span>
              </div>
              <button 
                onClick={() => {
                  setIsServerOffline(false);
                  setServerError('');
                  fetchDashboardData();
                }}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-2 lg:p-4">
          {/* Dashboard Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.fullname || "Student"}! 👋</h1>
              <p className="text-blue-100">Continue your learning journey today</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  dataStatus.status === 'success' ? 'bg-green-400' :
                  dataStatus.status === 'loading' ? 'bg-yellow-400 animate-pulse' :
                  dataStatus.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-blue-200">{dataStatus.message}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{activeCoursesCount}</div>
                <div className="text-sm text-blue-100">Active Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedLessonsCount}</div>
                <div className="text-sm text-blue-100">Lessons Completed</div>
              </div>
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{studentStats.totalCourses}</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
                             <div>
                 <div className="text-2xl font-bold text-gray-900">{completedLessonsCount}</div>
                 <div className="text-sm text-gray-600">Lessons Done</div>
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
                             <div>
                 <div className="text-2xl font-bold text-gray-900">{totalProgress}%</div>
                 <div className="text-sm text-gray-600">Avg Progress</div>
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{studentStats.weeklyGoal}</div>
                <div className="text-sm text-gray-600">Weekly Goal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Content Rendering */}
        {currentPage === 'course-detail' ? (
          <div className="max-w-6xl mx-auto">
            {renderCourseDetailView()}
          </div>
        ) : currentPage === 'section-view' ? (
          <div className="max-w-6xl mx-auto">
            {renderSectionDetailView()}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* My Courses Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                
                {isLoading ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Courses...</h3>
                    <p className="text-gray-600">Fetching your course data from the server.</p>
                  </div>
                ) : displayCourses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
                    <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet or there was an issue loading your courses.</p>
                    <div className="flex space-x-3 justify-center">
                      <button 
                        onClick={refreshData}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Browse Courses
                  </button>
                    </div>
                </div>
                              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {displayCourses.map((course) => (
                     <div 
                       key={course.id} 
                       className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                       onClick={() => handleCourseClickInternal(course)}
                     >
                      <div className="relative">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop';
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`${getDifficultyBadgeColor(course.difficulty)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>
                        
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                          
                                                 <div className="mb-3">
                           <div className="flex items-center justify-between text-sm mb-1">
                             <span className="text-gray-600">Progress</span>
                             <span className="font-medium">{course.progress}%</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-2">
                             <div 
                               className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                               style={{ width: `${course.progress}%` }}
                             ></div>
                           </div>
                         </div>
                          
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center space-x-1 text-sm text-gray-500">
                             <BookOpen className="w-3 h-3" />
                             <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                           </div>
                           <div className="flex items-center space-x-1 text-sm text-gray-500">
                             <Clock className="w-3 h-3" />
                             <span>{course.duration}</span>
                           </div>
                         </div>
                          
                         {/* Real data indicators */}
                         {course.completionStatus && (
                           <div className="flex items-center justify-between mb-2">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               course.completionStatus === 'completed' ? 'bg-green-100 text-green-600' :
                               course.completionStatus === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                               course.completionStatus === 'almost_complete' ? 'bg-yellow-100 text-yellow-600' :
                               'bg-gray-100 text-gray-600'
                             }`}>
                               {course.completionStatus.replace('_', ' ')}
                             </span>
                             {course.averageGrade > 0 && (
                               <span className="text-xs text-gray-500">
                                 Grade: {course.averageGrade}%
                               </span>
                             )}
                           </div>
                         )}
                          
                         {course.enrollmentCount > 0 && (
                           <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                             <span>{course.enrollmentCount} students enrolled</span>
                             {course.certificates > 0 && (
                               <span>{course.certificates} certificates</span>
                             )}
                           </div>
                         )}
                          
                                                 <button 
                           className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleCourseClickInternal(course);
                           }}
                         >
                           <Play className="w-4 h-4" />
                           <span>Continue Learning</span>
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Lessons Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Current Lessons</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                
                {isLoading ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Lessons...</h3>
                    <p className="text-gray-600">Fetching your lesson data from the server.</p>
                  </div>
                ) : displayLessons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Found</h3>
                    <p className="text-gray-600 mb-4">Start a course to see your lessons here or there was an issue loading your lessons.</p>
                    <button 
                      onClick={refreshData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                </div>
                              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {displayLessons.slice(0, 6).map((lesson) => (
                     <div 
                       key={lesson.id} 
                       className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                       onClick={() => handleLessonClick(lesson)}
                     >
                      <div className="relative">
                        <img 
                          src={lesson.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
                          alt={lesson.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                            {lesson.isNew ? (
                              <Eye className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                        
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{lesson.courseTitle}</p>
                          
                        <div className="flex items-center space-x-2 mb-3">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                        </div>
                          
                        {lesson.prerequisites && (
                          <p className="text-xs text-gray-500 mb-3">Prerequisites: {lesson.prerequisites}</p>
                        )}
                          
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${lesson.progress}%` }}
                            ></div>
                          </div>
                        </div>
                          
                                                 <button 
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleLessonClick(lesson);
                           }}
                         >
                           {lesson.status === 'completed' ? 'Review Lesson' : lesson.status === 'in-progress' ? 'Continue Lesson' : 'Start Lesson'}
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Activities Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Activities</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                
                {isLoading ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Activities...</h3>
                    <p className="text-gray-600">Fetching your activity data from the server.</p>
                  </div>
                ) : displayActivities.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
                    <p className="text-gray-600 mb-4">You're all caught up! No pending activities or there was an issue loading your activities.</p>
                    <button 
                      onClick={refreshData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                </div>
              ) : (
                                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <div className="space-y-4">
                     {displayActivities.slice(0, 3).map((activity) => (
                       <div 
                         key={activity.id} 
                         className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                         onClick={() => handleActivityClick(activity)}
                       >
                        <div className="flex items-center space-x-4">
                                                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                             activity.type === 'quiz' ? 'bg-violet-50' :
                             activity.type === 'assignment' ? 'bg-amber-50' :
                             activity.type === 'project' ? 'bg-emerald-50' :
                             'bg-sky-50'
                           }`}>
                             {activity.type === 'quiz' ? <FileText className="w-5 h-5 text-violet-600" /> :
                              activity.type === 'assignment' ? <Code className="w-5 h-5 text-amber-600" /> :
                              activity.type === 'project' ? <Target className="w-5 h-5 text-emerald-600" /> :
                              <Users className="w-5 h-5 text-sky-600" />}
                           </div>
                            
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">{activity.courseTitle}</p>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                                {activity.difficulty}
                              </span>
                              <span className="text-sm text-gray-500">{activity.points} points</span>
                            </div>
                          </div>
                        </div>
                          
                                                 <div className="text-right">
                           <div className="text-sm text-gray-500 mb-1">Due in {activity.timeRemaining}</div>
                                                        <button 
                               className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleActivityClick(activity);
                               }}
                             >
                               {activity.status === 'submitted' ? 'View' : 'Start'}
                             </button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Exams Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Exams</h2>
                
              {exams.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Exams</h3>
                  <p className="text-gray-600">You don't have any exams scheduled at the moment.</p>
                </div>
              ) : (
              <div className="space-y-4">
                  {exams.map((exam, index) => (
                  <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {exam.isNew && (
                            <button className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                              New Attempt
                            </button>
                          )}
                          <Building className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                          <p className="text-gray-600 text-sm mb-1">{exam.courseTitle}</p>
                        <p className="text-gray-600 text-sm mb-3">{exam.schedule}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                          Attempt →
                        </button>
                        <span className="text-green-600 text-sm font-medium">{exam.daysLeft} Day to go!</span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
              </div>
            </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
            <div>
                  <h3 className="font-semibold text-gray-900">{currentUser?.fullname || "Student"}</h3>
                  <p className="text-blue-600 text-sm">Daily Rank →</p>
              </div>
              </div>
                
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today's Progress</span>
                  <span className="text-sm font-medium text-gray-900">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600">Courses Enrolled</span>
                  </div>
                  <span className="font-semibold text-gray-900">{displayCourses.length}</span>
                </div>
                  
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600">Lessons Completed</span>
                  </div>
                  <span className="font-semibold text-gray-900">{completedLessonsCount}</span>
                </div>
                  
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-600">Pending Activities</span>
                  </div>
                  <span className="font-semibold text-gray-900">{pendingActivitiesCount}</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
                
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-green-600 font-medium">Best: {studentStats.streak}</span>
                <span className="text-orange-600 font-medium">Goal: 7</span>
              </div>
                
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Flame className="w-6 h-6 text-orange-500 mb-1" />
                  <span className="text-xs text-gray-600">{studentStats.streak} Streaks</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">{studentStats.totalPoints} Points</span>
                </div>
                <div className="flex flex-col items-center">
                  <Coins className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">{studentStats.coins} Coins</span>
                </div>
              </div>
            </div>

            {/* Your Schedule Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="font-semibold text-gray-900">Your Schedule</h3>
                <Info className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-gray-600 text-sm mb-4">Today's Schedule</p>
                
                {/* Calendar Strip */}
                <div className="relative mb-4">
                <div className="flex space-x-2 px-4 overflow-x-auto">
                    {scheduleEvents.slice(0, 7).map((event, index) => (
                      <div key={index} className="flex flex-col items-center min-w-[40px]">
                        <span className="text-xs text-gray-500 mb-1">{event.day}</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                          event.isDisabled 
                            ? 'bg-gray-100 text-gray-400' 
                            : event.hasActivity 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          {event.date}
                        </div>
                        {event.hasActivity && !event.isDisabled && (
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        )}

          {/* Courses Tab Content */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
              
              {/* Course Detail View */}
              {currentPage === 'course-detail' ? (
                <div className="max-w-6xl mx-auto">
                  {renderCourseDetailView()}
                </div>
              ) : currentPage === 'section-view' ? (
                <div className="max-w-6xl mx-auto">
                  {renderSectionDetailView()}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayCourses.map((course) => (
                    <div 
                      key={course.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => handleCourseClickInternal(course)}
                    >
                      <div className="relative">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop';
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`${getDifficultyBadgeColor(course.difficulty)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClickInternal(course);
                          }}
                        >
                          <Play className="w-4 h-4" />
                          <span>Continue Learning</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lessons Tab Content */}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Current Lessons</h1>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayLessons.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="relative">
                      <img 
                        src={lesson.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
                        alt={lesson.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                          {lesson.isNew ? (
                            <Eye className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{lesson.courseTitle}</p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-500">{lesson.duration}</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${lesson.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLessonClick(lesson);
                        }}
                      >
                        {lesson.status === 'completed' ? 'Review Lesson' : lesson.status === 'in-progress' ? 'Continue Lesson' : 'Start Lesson'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Tab Content */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {displayActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'quiz' ? 'bg-violet-50' :
                          activity.type === 'assignment' ? 'bg-amber-50' :
                          activity.type === 'project' ? 'bg-emerald-50' :
                          'bg-sky-50'
                        }`}>
                          {activity.type === 'quiz' ? <FileText className="w-5 h-5 text-violet-600" /> :
                           activity.type === 'assignment' ? <Code className="w-5 h-5 text-amber-600" /> :
                           activity.type === 'project' ? <Target className="w-5 h-5 text-emerald-600" /> :
                           <Users className="w-5 h-5 text-sky-600" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{activity.courseTitle}</p>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                              {activity.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">{activity.points} points</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Due in {activity.timeRemaining}</div>
                        <button 
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityClick(activity);
                          }}
                        >
                          {activity.status === 'submitted' ? 'View' : 'Start'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content can be added here */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">Achievements feature will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">Schedule feature will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'tree-view' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Tree View</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <BarChart3 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">Tree view feature will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'profile-settings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Settings className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">Settings feature will be available soon.</p>
              </div>
            </div>
          )}

          {/* Scratch Editor Tab Content */}
          {activeTab === 'scratch-editor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Scratch Editor</h1>
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ScratchEmulator />
              </div>
            </div>
          )}

          {/* Code Editor Tab Content */}
          {activeTab === 'code-editor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Code Editor</h1>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCodeEditorTab('output')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      codeEditorTab === 'output' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Output
                  </button>
                  <button 
                    onClick={() => setCodeEditorTab('errors')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      codeEditorTab === 'errors' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Errors
                  </button>
                  <button 
                    onClick={() => setCodeEditorTab('terminal')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      codeEditorTab === 'terminal' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Terminal
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CodeEditorContent />
              </div>
            </div>
          )}

          {/* E-books Tab Content */}
          {activeTab === 'ebooks' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">E-books</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Learning Materials</h3>
                <p className="text-gray-600 mb-4">Access your digital textbooks and learning resources.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Mathematics</h4>
                    <p className="text-sm text-gray-600">Grade 4-7 Math</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Science</h4>
                    <p className="text-sm text-gray-600">Grade 4-7 Science</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Programming</h4>
                    <p className="text-sm text-gray-600">Coding Basics</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ask Teacher Tab Content */}
          {activeTab === 'ask-teacher' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Ask Teacher</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <MessageSquare className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Help from Your Instructor</h3>
                  <p className="text-gray-600">Ask questions and get personalized help from your teachers.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Questions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-700">How do I solve this math problem?</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-700">Can you explain the coding concept?</span>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Ask a New Question</h4>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={4}
                      placeholder="Type your question here..."
                    ></textarea>
                    <button className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Send Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share with Class Tab Content */}
          {activeTab === 'share-class' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Share with Class</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <Share2 className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaborate with Classmates</h3>
                  <p className="text-gray-600">Share your projects and collaborate with your class.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Shared Projects</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900">My Scratch Game</span>
                          <p className="text-xs text-gray-500">Shared 2 hours ago</p>
                        </div>
                        <button className="text-pink-600 hover:text-pink-700 text-sm">View</button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Math Solution</span>
                          <p className="text-xs text-gray-500">Shared 1 day ago</p>
                        </div>
                        <button className="text-pink-600 hover:text-pink-700 text-sm">View</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Share New Project</h4>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Project title..."
                      />
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                        placeholder="Project description..."
                      ></textarea>
                      <button className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Share Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competencies Tab Content */}
          {activeTab === 'competencies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Competencies</h1>
                <button
                  onClick={() => {
                    // Fetch competencies data
                    console.log('Fetching competencies...');
                  }}
                  disabled={isLoadingCompetencies}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingCompetencies ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Learning Competencies</h3>
                  <p className="text-gray-600">Track your progress across different learning competencies.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Problem Solving</h4>
                      <span className="text-sm text-gray-500">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Critical Thinking</h4>
                      <span className="text-sm text-gray-500">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Creativity</h4>
                      <span className="text-sm text-gray-500">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Details Modal */}
        {isLessonModalOpen && selectedLesson && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="relative">
                <img 
                  src={selectedLesson.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
                  alt={selectedLesson.title}
                  className="w-full h-48 object-cover rounded-t-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-3xl"></div>
                <button
                  onClick={closeLessonModal}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`${getStatusColor(selectedLesson.status)} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                    {selectedLesson.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h2>
                  <p className="text-gray-600 text-lg">{selectedLesson.courseTitle}</p>
                </div>
                
                {/* Lesson Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">{selectedLesson.duration}</p>
                      </div>
                    </div>
                  </div>
                
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="font-semibold text-gray-900">{selectedLesson.progress}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Learning Progress</span>
                    <span className="text-sm text-gray-500">{selectedLesson.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                      style={{ width: `${selectedLesson.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedLesson.prerequisites && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-gray-700">{selectedLesson.prerequisites}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {selectedLesson.status === 'completed' ? (
                    <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                      <CheckCircle className="w-5 h-5" />
                      <span>Review Lesson</span>
                    </button>
                  ) : selectedLesson.status === 'in-progress' ? (
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                      <Play className="w-5 h-5" />
                      <span>Continue Lesson</span>
                    </button>
                  ) : (
                    <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                      <Play className="w-5 h-5" />
                      <span>Start Lesson</span>
                    </button>
                  )}
                  <button 
                    onClick={closeLessonModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Details Modal */}
        {isActivityModalOpen && selectedActivity && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-orange-500 to-red-500 rounded-t-3xl flex items-center justify-center">
                  <Activity className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-3xl"></div>
                <button
                  onClick={closeActivityModal}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`${getActivityStatusColor(selectedActivity.status)} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                    {selectedActivity.status}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h2>
                  <p className="text-gray-600 text-lg">{selectedActivity.courseTitle}</p>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time Remaining</p>
                        <p className="font-semibold text-gray-900">{selectedActivity.timeRemaining}</p>
                      </div>
                    </div>
                  </div>
                
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Points</p>
                        <p className="font-semibold text-gray-900">{selectedActivity.points}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Type</span>
                    <span className="text-sm text-gray-900 capitalize">{selectedActivity.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Difficulty</span>
                    <span className={`${getDifficultyColor(selectedActivity.difficulty)} px-2 py-1 rounded-full text-xs font-medium`}>
                      {selectedActivity.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Due Date</span>
                    <span className="text-sm text-gray-900">{selectedActivity.dueDate}</span>
                  </div>
                </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {selectedActivity.status === 'submitted' ? (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <CheckCircle className="w-5 h-5" />
                    <span>View Submission</span>
                  </button>
                ) : selectedActivity.status === 'graded' ? (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <BarChart3Icon className="w-5 h-5" />
                    <span>View Grade</span>
                  </button>
                ) : (
                  <button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5" />
                    <span>Start Activity</span>
                  </button>
                )}
                <button 
                  onClick={closeActivityModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
});

// Add display name for debugging
G4G7Dashboard.displayName = 'G4G7Dashboard';

export default G4G7Dashboard;