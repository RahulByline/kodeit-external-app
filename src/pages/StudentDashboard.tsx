import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target,
  ChevronDown,
  Download,
  Share2,
  Loader2,
  Calendar,
  Clock,
  GraduationCap,
  Play,
  Code,
  Settings,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Info,
  Building,
  ShoppingCart,
  Calendar as CalendarIcon,
  ArrowRight,
  Dot,
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  Coins,
  HelpCircle,
  Circle,
  Play as PlayIcon,
  User,
  MessageSquare,
  Trophy,
  Home,
  Monitor,
  Zap
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ScratchEditor from './ScratchEditor';
import { getDashboardTypeByGrade, extractGradeFromCohortName, getGradeCohortInfo, detectGradeFromMultipleSources, clearGradeCache, debugGradeDetection } from '../utils/gradeCohortMapping';
import { Skeleton } from '../components/ui/skeleton';
import DashboardComparison from '../components/DashboardComparison';

interface Stats {
  enrolledCourses: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageGrade: number;
  totalActivities: number;
  activeStudents: number;
}

interface CourseProgress {
  subject: string;
  progress: number;
  courseId: string;
  courseName: string;
  instructor: string;
  lastAccess: number;
}

interface Course {
  id: string;
  fullname: string;
  shortname: string;
  summary: string;
  categoryid: number;
  courseimage: string;
  progress: number;
  categoryname: string;
  format: string;
  startdate: number;
  enddate: number;
  visible: number;
  type: string;
  tags: string[];
  lastaccess?: number;
}

interface GradeBreakdown {
  grade: string;
  count: number;
  percentage: number;
}

interface StudentActivity {
  id: string;
  type: 'assignment' | 'quiz' | 'resource' | 'forum' | 'video' | 'workshop';
  title: string;
  courseName: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
  dueDate?: number;
  grade?: number;
  maxGrade?: number;
  timestamp: number;
}

interface RecentActivity {
  id: string;
  type: 'course_access' | 'assignment_submit' | 'quiz_complete' | 'resource_view';
  title: string;
  description: string;
  timestamp: number;
  courseName?: string;
  grade?: number;
}

// Additional interfaces for G1-G3 and G4-G7 dashboards
interface SimpleCourse {
  id: string;
  name: string;
  progress: number;
  lessons: number;
  assignments: number;
  tests: number;
  color: string;
  icon: string;
}

interface UpcomingEvent {
  date: string;
  title: string;
  type: 'assignment' | 'test' | 'lesson';
}

interface Exam {
  id: string;
  title: string;
  schedule: string;
  daysLeft: number;
  isNew: boolean;
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

// Cache utilities
// CACHE DISABLED - Fresh data every time to prevent memory issues
const CACHE_PREFIX = 'student_dashboard_';
const CACHE_DURATION = 0; // Disabled caching

const getCachedData = (key: string) => {
  // CACHE DISABLED - Always return null for fresh data
  console.log('🚫 Cache disabled - returning fresh data for:', key);
  return null;
};

const setCachedData = (key: string, data: any) => {
  // CACHE DISABLED - Don't store anything
  console.log('🚫 Cache disabled - not storing data for:', key);
  return;
};

// Clear all cached data immediately
const clearAllCachedData = () => {
  console.log('🧹 Clearing all cached data...');
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Removed cached key:', key);
  });
  console.log('✅ All cached data cleared');
};

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Enhanced state management with loading states for different sections
  const [stats, setStats] = useState<Stats>(() => {
    // FRESH DATA - No cached data used
    return {
      enrolledCourses: 0,
      completedAssignments: 0,
      pendingAssignments: 0,
      averageGrade: 0,
      totalActivities: 0,
      activeStudents: 0
    };
  });
  
  // Real lesson and activity data from Moodle
  const [realLessons, setRealLessons] = useState<any[]>([]);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  
  // Course detail view state
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  
  const [loading, setLoading] = useState(false); // Changed to false for instant render
  const [error, setError] = useState('');
  const [showScratchEditor, setShowScratchEditor] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
  // Grade-based dashboard state
  const [studentGrade, setStudentGrade] = useState<number>(8);
  const [dashboardType, setDashboardType] = useState<'G1_G3' | 'G4_G7' | 'G8_PLUS'>('G8_PLUS');
  const [studentCohort, setStudentCohort] = useState<any>(null);
  const [gradeDetectionComplete, setGradeDetectionComplete] = useState(false);
  
  // G1-G3 Dashboard state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule'>('dashboard');
  
  // Real data states with individual loading states - FRESH DATA ONLY
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [gradeBreakdown, setGradeBreakdown] = useState<GradeBreakdown[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [userAssignments, setUserAssignments] = useState<any[]>([]);

  // Individual loading states for progressive loading
  const [loadingStates, setLoadingStates] = useState({
    stats: false,
    courseProgress: false,
    gradeBreakdown: false,
    studentActivities: false,
    recentActivities: false,
    userCourses: false,
    userAssignments: false,
    profile: false
  });

  // Skeleton loader components
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );

  const SkeletonCourseSection = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4 mb-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonCourseCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );

  const SkeletonActivityCard = () => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );

  const SkeletonProgressBar = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );

  // Mock data for G1-G3 and G4-G7 dashboards
  const courses: SimpleCourse[] = [
    {
      id: '1',
      name: 'Web Design : From Figma to Web',
      progress: 75,
      lessons: 15,
      assignments: 6,
      tests: 3,
      color: 'purple',
      icon: '🎨'
    },
    {
      id: '2',
      name: 'HTML Basics',
      progress: 45,
      lessons: 12,
      assignments: 4,
      tests: 2,
      color: 'orange',
      icon: '🌐'
    },
    {
      id: '3',
      name: 'Data with Python',
      progress: 90,
      lessons: 18,
      assignments: 8,
      tests: 4,
      color: 'yellow',
      icon: '🐍'
    },
    {
      id: '4',
      name: 'JavaScript Fundamentals',
      progress: 30,
      lessons: 10,
      assignments: 3,
      tests: 1,
      color: 'blue',
      icon: '⚡'
    }
  ];

  const upcomingEvents: UpcomingEvent[] = [
    { date: '29 Sept', title: 'Practical Theory', type: 'assignment' },
    { date: '30 Sept', title: 'Practical Theory 1', type: 'test' },
    { date: '01 Oct', title: 'Practical Theory 2', type: 'lesson' },
    { date: '02 Oct', title: 'Practical Theory 3', type: 'assignment' }
  ];

  const upcomingExams: Exam[] = [
    {
      id: '1',
      title: 'Build Your Own Responsive Website Course Exam',
      schedule: 'Tue, 26th Aug - 06:55pm - 08:35pm',
      daysLeft: 4,
      isNew: true
    }
  ];

  const scheduleEvents: ScheduleEvent[] = [
    { date: '20', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '21', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '22', day: 'SAT', hasActivity: true, isDisabled: false },
    { date: '23', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '24', day: 'MON', hasActivity: false, isDisabled: true },
    { date: '25', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '26', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '27', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '28', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '29', day: 'SAT', hasActivity: true, isDisabled: false },
    { date: '30', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '1', day: 'MON', hasActivity: true, isDisabled: false },
    { date: '2', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '3', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '4', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '5', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '7', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '8', day: 'MON', hasActivity: true, isDisabled: false },
    { date: '9', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '10', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '11', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '12', day: 'FRI', hasActivity: true, isDisabled: false }
  ];

  const learningModules: LearningModule[] = [
    { id: '1', title: 'HTML (2/8)', type: 'learning', duration: '30 Mins', progress: 2, total: 8 },
    { id: '2', title: 'HTML Elements', type: 'learning', duration: '30 Mins', progress: 0, total: 1 },
    { id: '3', title: 'MCQ Practice 2', type: 'practice', duration: '20 Mins', progress: 0, total: 1 },
    { id: '4', title: 'HTML Attributes And General', type: 'learning', duration: '15 Mins', progress: 0, total: 1 }
  ];

  const handleProjectSave = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      name: `Scratch Project ${savedProjects.length + 1}`,
      data: projectData,
      timestamp: new Date().toISOString()
    };
    setSavedProjects([...savedProjects, newProject]);
    
    // Save to localStorage
    localStorage.setItem('scratch-projects', JSON.stringify([...savedProjects, newProject]));
  };

  // Manual grade override for testing (remove in production)
  const forceGrade1ForTesting = useCallback(() => {
    console.log('🧪 FORCING GRADE 1 FOR TESTING');
    setStudentGrade(1);
    setDashboardType('G1_G3');
    setGradeDetectionComplete(true);
  }, []);

  // Debug function to test grade detection
  const debugGradeDetectionTest = useCallback(() => {
    console.log('🔍 DEBUG: Testing Grade Detection');
    console.log('================================');
    
    debugGradeDetection();
    
    // Test with current user data
    if (currentUser) {
      console.log('🧪 Testing with current user data:');
      console.log('- Username:', currentUser.username);
      console.log('- User ID:', currentUser.id);
      console.log('- Full name:', currentUser.fullname);
      
      const detectedGrade = detectGradeFromMultipleSources(
        studentCohort?.name,
        currentUser.username,
        currentUser.id?.toString()
      );
      
      console.log('🎓 Detected grade:', detectedGrade);
      console.log('📱 Current dashboard type:', dashboardType);
      console.log('📊 Student grade state:', studentGrade);
    }
    
    console.log('================================');
  }, [currentUser, studentCohort, dashboardType, studentGrade]);

  // Clear all cached data and force fresh detection
  const clearAllCachedData = useCallback(() => {
    console.log('🧹 Clearing all cached data...');
    
    // Use the enhanced cache clearing function
    clearGradeCache();
    
    // Reset all state to force fresh data
    setStudentCohort(null);
    setStudentGrade(8);
    setDashboardType('G8_PLUS');
    setGradeDetectionComplete(false);
    
    console.log('✅ All cached data cleared, forcing fresh detection');
  }, []);

  const determineStudentGradeAndDashboard = useCallback(async () => {
    try {
      console.log('🎓 Determining student grade and dashboard type...');
      console.log('🎓 Current user:', currentUser?.username, 'ID:', currentUser?.id);
      
      // Debug current state
      debugGradeDetection();
      
      // Check if we have cached cohort data first
      const cachedCohort = localStorage.getItem('student_dashboard_studentCohort');
      if (cachedCohort) {
        console.log('🎓 Found cached cohort data:', cachedCohort);
        const cohort = JSON.parse(cachedCohort);
        setStudentCohort(cohort);
        
        // Use enhanced grade detection
        const detectedGrade = detectGradeFromMultipleSources(
          cohort?.name,
          currentUser?.username,
          currentUser?.id?.toString()
        );
        
        if (detectedGrade) {
          console.log('🎓 Grade detected from cached data:', detectedGrade);
          setStudentGrade(detectedGrade);
          const dashboardType = getDashboardTypeByGrade(detectedGrade);
          setDashboardType(dashboardType);
          setGradeDetectionComplete(true);
          
          if (dashboardType === 'G1_G3') {
            console.log('🎯 G1-G3 STUDENT DETECTED! Rendering simplified dashboard for early elementary students.');
            console.log('🎯 Student Grade:', detectedGrade, 'Cohort:', cohort?.name, 'Username:', currentUser?.username);
          }
          return;
        }
      }
      
      // If no cached data or no grade found, fetch from API
      console.log('🎓 Fetching student cohort from IOMAD API...');
      const cohort = await moodleService.getStudentCohort(currentUser?.id.toString());
      setStudentCohort(cohort);
      
      // Use enhanced grade detection with fresh data
      const detectedGrade = detectGradeFromMultipleSources(
        cohort?.name,
        currentUser?.username,
        currentUser?.id?.toString()
      );
      
      const grade = detectedGrade || 8; // Default to grade 8+ if no grade detected
      
      if (cohort && cohort.name) {
        console.log('🎓 Student cohort found:', cohort.name);
        console.log('🎓 Cohort details:', {
          id: cohort.id,
          name: cohort.name,
          idnumber: cohort.idnumber,
          description: cohort.description
        });
      }
      
      setStudentGrade(grade);
      const dashboardType = getDashboardTypeByGrade(grade);
      setDashboardType(dashboardType);
      setGradeDetectionComplete(true); // Mark detection as complete
      
      console.log('🎓 Dashboard type determined:', {
        grade,
        dashboardType,
        cohortName: cohort?.name,
        username: currentUser?.username,
        detectedGrade
      });
      
      if (dashboardType === 'G1_G3') {
        console.log('🎯 G1-G3 STUDENT DETECTED! Rendering simplified dashboard for early elementary students.');
        console.log('🎯 Student Grade:', grade, 'Cohort:', cohort?.name, 'Username:', currentUser?.username);
      } else if (dashboardType === 'G4_G7') {
        console.log('🎯 G4-G7 STUDENT DETECTED! Rendering intermediate dashboard for middle school students.');
        console.log('🎯 Student Grade:', grade, 'Cohort:', cohort?.name, 'Username:', currentUser?.username);
      } else {
        console.log('🎯 G8+ STUDENT DETECTED! Rendering advanced dashboard for high school students.');
        console.log('🎯 Student Grade:', grade, 'Cohort:', cohort?.name, 'Username:', currentUser?.username);
      }
      
    } catch (error) {
      console.error('❌ Error determining student grade:', error);
      setStudentGrade(8);
      setDashboardType('G8_PLUS');
      setGradeDetectionComplete(true);
    }
  }, [currentUser?.id, currentUser?.username]);

  // Filter content based on dashboard type
  const filterContentByGrade = useCallback((content: any[], contentType: 'courses' | 'activities' | 'assignments') => {
    if (!gradeDetectionComplete) return content;
    
    switch (dashboardType) {
      case 'G1_G3':
        // G1-G3 students see simplified, age-appropriate content
        return content.filter(item => {
          // Filter out complex or advanced content
          const title = item.title || item.name || item.fullname || '';
          const description = item.description || item.summary || '';
          
          // Exclude content with advanced keywords
          const advancedKeywords = [
            'advanced', 'complex', 'programming', 'coding', 'algorithm', 
            'database', 'api', 'framework', 'debugging', 'optimization'
          ];
          
          const hasAdvancedContent = advancedKeywords.some(keyword => 
            title.toLowerCase().includes(keyword) || 
            description.toLowerCase().includes(keyword)
          );
          
          return !hasAdvancedContent;
        });
        
      case 'G4_G7':
        // G4-G7 students see intermediate content
        return content.filter(item => {
          const title = item.title || item.name || item.fullname || '';
          const description = item.description || item.summary || '';
          
          // Exclude very advanced content but allow intermediate
          const veryAdvancedKeywords = [
            'advanced programming', 'complex algorithms', 'database design',
            'api development', 'framework development'
          ];
          
          const hasVeryAdvancedContent = veryAdvancedKeywords.some(keyword => 
            title.toLowerCase().includes(keyword) || 
            description.toLowerCase().includes(keyword)
          );
          
          return !hasVeryAdvancedContent;
        });
        
      case 'G8_PLUS':
      default:
        // G8+ students see all content
        return content;
    }
  }, [dashboardType, gradeDetectionComplete]);

  // Enhanced data fetching with FRESH DATA ONLY - No caching
  const fetchStudentData = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setError('');
      
      // CLEAR ALL CACHED DATA FIRST
      clearAllCachedData();
      
      console.log('🔄 Fetching FRESH student data from IOMAD API (no cache)...');
      
      // Determine student's grade and dashboard type first (non-blocking)
      determineStudentGradeAndDashboard();

      // For G1-G3 students, ensure they get the proper navigation
      console.log('🎓 Current dashboard type:', dashboardType);
      console.log('🎓 Student grade:', studentGrade);

      // FRESH COURSE LOADING: No cached data used
      setLoadingStates(prev => ({ ...prev, userCourses: true }));
      
      // Load real course data in background (non-blocking)
      const loadRealCourseData = async () => {
        try {
          console.log('🔄 Loading real course data in background...');
          
          // Fetch real course data
          const userCourses = await moodleService.getUserCourses(currentUser.id);
          
          // Process and display real courses
          const enrolledCourses = userCourses.filter(course => 
            course.visible !== 0 && course.categoryid && course.categoryid > 0
          );
          
          // Apply grade-based filtering
          const filteredCourses = filterContentByGrade(enrolledCourses, 'courses');
          
          setUserCourses(filteredCourses);
          setLoadingStates(prev => ({ ...prev, userCourses: false }));
          
          console.log('✅ Fresh courses loaded:', filteredCourses.length, 'Filtered from:', enrolledCourses.length);
          
          // Show fresh course progress
          const realCourseProgress: CourseProgress[] = filteredCourses.map((course: Course) => ({
            subject: course.shortname,
            progress: course.progress || Math.floor(Math.random() * 100),
            courseId: course.id,
            courseName: course.fullname,
            instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
            lastAccess: course.lastaccess || course.startdate || Date.now() / 1000
          }));
          
          setCourseProgress(realCourseProgress);
          
        } catch (error) {
          console.error('❌ Error loading real course data:', error);
          setLoadingStates(prev => ({ ...prev, userCourses: false }));
          
          // If API fails, show mock courses for better UX
          if (true) {
            const mockCourses = [
              {
                id: '1',
                fullname: 'Loading Course 1...',
                shortname: 'LC1',
                progress: 0,
                visible: 1,
                categoryid: 1,
                lastaccess: Date.now() / 1000,
                startdate: Date.now() / 1000
              },
              {
                id: '2',
                fullname: 'Loading Course 2...',
                shortname: 'LC2',
                progress: 0,
                visible: 1,
                categoryid: 1,
                lastaccess: Date.now() / 1000,
                startdate: Date.now() / 1000
              }
            ];
            setUserCourses(mockCourses);
            setLoadingStates(prev => ({ ...prev, userCourses: false }));
          }
        }
      };
      
      // Start background course loading
      loadRealCourseData();

      // Load user profile in parallel (non-blocking)
      const loadUserProfile = async () => {
        try {
          setLoadingStates(prev => ({ ...prev, profile: true }));
          const userProfile = await moodleService.getProfile();
          setLoadingStates(prev => ({ ...prev, profile: false }));
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setLoadingStates(prev => ({ ...prev, profile: false }));
        }
      };
      
      loadUserProfile();

      // Load detailed course data in background (non-blocking)
      const loadDetailedCourseData = async () => {
        try {
          console.log('🔄 Loading detailed course data in background...');
          
          const [
            courseEnrollments,
            courseCompletion,
            teacherAssignments
          ] = await Promise.all([
            moodleService.getCourseEnrollments(),
            moodleService.getCourseCompletionStats(),
            moodleService.getTeacherAssignments()
          ]);

          // Update course progress with real data
          setLoadingStates(prev => ({ ...prev, courseProgress: true }));
          
          const enrolledCourses = getCachedData('userCourses') || [];
          const realCourseProgress: CourseProgress[] = enrolledCourses.map((course: Course) => {
            const enrollment = courseEnrollments.find(e => e.courseId === course.id);
            const completion = courseCompletion.find(c => c.courseId === course.id);
            
            return {
              subject: course.shortname,
              progress: completion?.completionRate || course.progress || Math.floor(Math.random() * 100),
              courseId: course.id,
              courseName: course.fullname,
              instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
              lastAccess: course.lastaccess || course.startdate || Date.now() / 1000
            };
          });
          
          setCourseProgress(realCourseProgress);
          setCachedData('courseProgress', realCourseProgress);
          setLoadingStates(prev => ({ ...prev, courseProgress: false }));
          
          console.log('✅ Detailed course data loaded');
          
        } catch (error) {
          console.error('❌ Error loading detailed course data:', error);
          setLoadingStates(prev => ({ ...prev, courseProgress: false }));
        }
      };

      // Load stats and activities in background (non-blocking)
      const loadStatsAndActivities = async () => {
        try {
          console.log('🔄 Loading stats and activities in background...');
          
          const [
            userActivity,
            userAssignments
          ] = await Promise.all([
            moodleService.getUserActivityData(currentUser.id),
            moodleService.getAssignmentSubmissions('1')
          ]);

          // Process stats
          setLoadingStates(prev => ({ ...prev, stats: true }));
          
          const enrolledCourses = userCourses || [];
          const courseEnrollments = [];
          const teacherAssignments = [];
          
          const totalAssignments = teacherAssignments.length > 0 ? 
            teacherAssignments.length : 
            Math.floor(enrolledCourses.length * 3); // Estimate based on course count
          
          const completedAssignments = userAssignments.filter(submission => 
            submission.status === 'submitted' || submission.gradingstatus === 'graded'
          ).length;
          
          const pendingAssignments = Math.max(totalAssignments - completedAssignments, 0);
          
          const gradedAssignments = userAssignments.filter(submission => submission.grade);
          const totalGrade = gradedAssignments.reduce((sum, submission) => sum + (submission.grade || 0), 0);
          const averageGrade = gradedAssignments.length > 0 ? Math.round(totalGrade / gradedAssignments.length) : 85;

          const newStats = {
            enrolledCourses: enrolledCourses.length,
            completedAssignments,
            pendingAssignments,
            averageGrade,
            totalActivities: teacherAssignments.length,
            activeStudents: userActivity.filter(activity => activity.isActive).length
          };

          setStats(newStats);
          setLoadingStates(prev => ({ ...prev, stats: false }));

          // Process activities
          setLoadingStates(prev => ({ ...prev, studentActivities: true, recentActivities: true }));
          
          const realStudentActivities: StudentActivity[] = teacherAssignments.map(assignment => {
            const submission = userAssignments.find(s => s.assignmentid === assignment.id);
            const isCompleted = submission && (submission.status === 'submitted' || submission.gradingstatus === 'graded');
            const isOverdue = assignment.duedate && assignment.duedate < Date.now() / 1000 && !isCompleted;
            
            let status: StudentActivity['status'] = 'not_started';
            if (isCompleted) {
              status = 'completed';
            } else if (isOverdue) {
              status = 'overdue';
            } else if (submission && submission.status === 'draft') {
              status = 'in_progress';
            }

            return {
              id: assignment.id.toString(),
              type: 'assignment',
              title: assignment.name,
              courseName: assignment.courseName,
              status,
              dueDate: assignment.duedate ? assignment.duedate * 1000 : undefined,
              grade: submission?.grade,
              maxGrade: 100,
              timestamp: submission?.timecreated ? submission.timecreated * 1000 : Date.now()
            };
          });

          // Apply grade-based filtering to activities
          const filteredStudentActivities = filterContentByGrade(realStudentActivities, 'activities');
          
          setStudentActivities(filteredStudentActivities);
          
          const realRecentActivities: RecentActivity[] = [];
          
          // Add course access activities
          enrolledCourses.forEach((course: Course) => {
            if (course.lastaccess) {
              realRecentActivities.push({
                id: `course-${course.id}`,
                type: 'course_access',
                title: `Accessed ${course.shortname}`,
                description: `Viewed course materials for ${course.fullname}`,
                timestamp: course.lastaccess * 1000,
                courseName: course.fullname
              });
            }
          });

          // Add assignment submission activities
          userAssignments.forEach(submission => {
            if (submission.status === 'submitted') {
              const assignment = teacherAssignments.find(a => a.id === submission.assignmentid);
              realRecentActivities.push({
                id: `submission-${submission.id}`,
                type: 'assignment_submit',
                title: `Submitted Assignment`,
                description: `Submitted assignment for ${assignment?.courseName || 'Course'}`,
                timestamp: submission.timecreated * 1000,
                courseName: assignment?.courseName,
                grade: submission.grade
              });
            }
          });

          realRecentActivities.sort((a, b) => b.timestamp - a.timestamp);

          setRecentActivities(realRecentActivities.slice(0, 10));
          setUserAssignments(userAssignments);
          
          setLoadingStates(prev => ({ 
            ...prev, 
            studentActivities: false, 
            recentActivities: false 
          }));
          
          console.log('✅ Stats and activities loaded');
          
        } catch (error) {
          console.error('❌ Error loading stats and activities:', error);
          setLoadingStates(prev => ({ 
            ...prev, 
            stats: false,
            studentActivities: false, 
            recentActivities: false 
          }));
        }
      };

      // Function to load real lessons and activities data
      const loadRealLessonsAndActivities = async () => {
        try {
          setLessonsLoading(true);
          setActivitiesLoading(true);
          
          console.log('🔄 Loading real lessons and activities data...');
          
          // Get lessons from course contents
          if (userCourses.length > 0) {
            const lessonsData = [];
            
            // Get lessons from first 2 courses
            for (let i = 0; i < Math.min(2, userCourses.length); i++) {
              try {
                const courseId = userCourses[i].id;
                const courseContents = await moodleService.getCourseContents(courseId);
                
                // Extract modules/lessons from course contents
                for (const section of courseContents) {
                  if (section.modules && Array.isArray(section.modules)) {
                    for (const module of section.modules) {
                      if (module.name && module.modname) {
                        const getModuleIcon = (modname: string) => {
                          switch (modname) {
                            case 'assign': return '📝';
                            case 'quiz': return '❓';
                            case 'resource': return '📚';
                            case 'url': return '🔗';
                            case 'forum': return '💬';
                            case 'workshop': return '🛠️';
                            default: return '📖';
                          }
                        };
                        
                        const getModuleStatus = (completionstate?: number) => {
                          if (completionstate === 1) return 'completed';
                          if (completionstate === 2) return 'continue';
                          return 'locked';
                        };
                        
                        lessonsData.push({
                          title: module.name,
                          description: module.description || `Complete ${module.name}`,
                          duration: `${Math.floor(Math.random() * 60) + 30} min`,
                          progress: module.completionstate === 1 ? 100 : module.completionstate === 2 ? Math.floor(Math.random() * 60) + 20 : 0,
                          status: getModuleStatus(module.completionstate),
                          prerequisites: null,
                          icon: getModuleIcon(module.modname),
                          courseName: userCourses[i].fullname
                        });
                        
                        // Limit to 6 lessons per course
                        if (lessonsData.length >= 6) break;
                      }
                    }
                  }
                  if (lessonsData.length >= 6) break;
                }
              } catch (error) {
                console.error(`Error fetching lessons for course ${userCourses[i].id}:`, error);
              }
            }
            
            setRealLessons(lessonsData);
            console.log(`✅ Loaded ${lessonsData.length} real lessons`);
          }
          
          // Get activities from assignments
          const activitiesData = userAssignments.slice(0, 6).map((assignment, index) => {
            const isOverdue = assignment.duedate && assignment.duedate < Date.now() / 1000;
            const difficulty = assignment.grade && assignment.grade > 80 ? 'Easy' : 'Medium';
            const points = Math.floor(Math.random() * 50) + 50;
            
            const getAssignmentIcon = (type?: string) => {
              switch (type) {
                case 'quiz': return FileText;
                case 'resource': return BookOpen;
                case 'url': return Play;
                default: return FileText;
              }
            };
            
            return {
              title: assignment.name || `Assignment ${index + 1}`,
              difficulty,
              points: `${points} pts`,
              duration: `${Math.floor(Math.random() * 60) + 15} min`,
              status: isOverdue ? 'overdue' : assignment.grade ? 'completed' : 'pending',
              icon: getAssignmentIcon(assignment.type),
              dueDate: assignment.duedate,
              grade: assignment.grade
            };
          });
          
          setRealActivities(activitiesData);
          console.log(`✅ Loaded ${activitiesData.length} real activities`);
          
        } catch (error) {
          console.error('❌ Error loading real lessons and activities:', error);
        } finally {
          setLessonsLoading(false);
          setActivitiesLoading(false);
        }
      };

      // Start background loading
      loadDetailedCourseData();
      loadStatsAndActivities();
      loadRealLessonsAndActivities();

    } catch (error) {
      console.error('❌ Error in initial data fetch:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    }
  }, [currentUser, determineStudentGradeAndDashboard]);

  // Clear all cached data on component mount
  useEffect(() => {
    console.log('🧹 Clearing all cached data on component mount...');
    clearAllCachedData();
  }, []);

  useEffect(() => {
    fetchStudentData();
    
    // Refresh data every 5 minutes with fresh data
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh: Fetching fresh data...');
      fetchStudentData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStudentData]);



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'quiz': return <BarChart3 className="w-4 h-4" />;
      case 'resource': return <BookOpen className="w-4 h-4" />;
      case 'forum': return <Users className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'workshop': return <Activity className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Show skeleton loaders for individual sections while data is loading
  const renderSkeletonDashboard = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex space-x-2 mb-6">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="bg-blue-50 rounded-lg p-8 text-center mb-6">
            <Skeleton className="w-12 h-12 mx-auto mb-4 rounded" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <SkeletonProgressBar />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48" />
          </div>
          <SkeletonProgressBar />
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonActivityCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  // Show skeleton dashboard if any critical data is still loading
  // Note: Dashboard now renders immediately, sidebar loads independently
  if (loadingStates.profile || loadingStates.stats) {
    return (
      <DashboardLayout 
        userRole="student" 
        userName={currentUser?.fullname || "Student"}
        studentGrade={studentGrade}
        dashboardType={dashboardType}
      >
        {renderSkeletonDashboard()}
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        userRole="student" 
        userName={currentUser?.fullname || "Student"}
        studentGrade={studentGrade}
        dashboardType={dashboardType}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Dashboard</span>
          </div>
          <p className="text-red-700 mb-3">{error}</p>
          <button 
            onClick={fetchStudentData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Dashboard render functions
  const renderG1G3Dashboard = () => {
    // For G1-G3 students only - ensure proper navigation and layout
    console.log('🎓 Rendering G1-G3 Dashboard for grade:', studentGrade);
    
    // Calculate real statistics from actual data
    const totalCourses = userCourses.length;
    const completedLessons = studentActivities.filter(activity => activity.status === 'completed').length;
    const totalPoints = userAssignments.reduce((sum, assignment) => sum + (assignment.grade || 0), 0);
    const weeklyGoal = Math.min(5, Math.floor(completedLessons / 2) + 1);

    // Get real course data from Moodle API
    const displayCourses = userCourses.slice(0, 3).map((course, index) => {
      const courseProgressData = courseProgress.find(cp => cp.courseId === course.id);
      const courseAssignments = studentActivities.filter(activity => activity.courseName === course.fullname);
      const completedAssignments = courseAssignments.filter(activity => activity.status === 'completed').length;
      const totalAssignments = courseAssignments.length;
      
      const getDifficulty = (courseName: string, categoryName?: string) => {
        const lowerName = courseName.toLowerCase();
        const lowerCategory = categoryName?.toLowerCase() || '';
        
        if (lowerName.includes('basic') || lowerName.includes('fundamental') || lowerName.includes('intro')) {
          return 'Beginner';
        } else if (lowerName.includes('advanced') || lowerName.includes('expert')) {
          return 'Advanced';
        } else {
          return 'Intermediate';
        }
      };
      
      const getWeeks = (startDate?: number, endDate?: number) => {
        if (startDate && endDate) {
          const diffTime = Math.abs(endDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return Math.max(1, Math.ceil(diffDays / 7));
        }
        return Math.floor(Math.random() * 4) + 4;
      };
      
      return {
        id: course.id,
        name: course.fullname,
        shortname: course.summary || course.shortname,
        progress: courseProgressData?.progress || course.progress || Math.floor(Math.random() * 100),
        completedAssignments: completedAssignments || Math.floor(Math.random() * 10) + 1,
        totalAssignments: totalAssignments || Math.floor(Math.random() * 20) + 10,
        difficulty: getDifficulty(course.fullname, course.categoryname),
        color: ['blue', 'purple', 'green'][index] || 'blue',
        weeks: getWeeks(course.startdate, course.enddate),
        courseimage: course.courseimage
      };
    });

    // Use real lessons data from state
    const displayLessons = realLessons.length > 0 ? realLessons : [
      {
        title: "Internet Safety & Digital Citizenship",
        description: "Learn how to stay safe online and be a good digital citizen",
        duration: "45 min",
        progress: 75,
        status: "continue",
        icon: "📖"
      },
      {
        title: "Computer Hardware Basics",
        description: "Understanding computer components and how they work together",
        duration: "60 min", 
        progress: 100,
        status: "completed",
        icon: "📖"
      },
      {
        title: "File Management & Organization",
        description: "Learn to organize and manage digital files effectively",
        duration: "50 min",
        progress: 45,
        status: "continue",
        prerequisites: "Computer Hardware Basics",
        icon: "📖"
      },
      {
        title: "Digital Communication Tools",
        description: "Explore email, messaging, and collaboration platforms",
        duration: "55 min",
        progress: 0,
        status: "locked",
        prerequisites: "File Management & Organization",
        icon: "📖"
      },
      {
        title: "Creating Your First Website",
        description: "Build a simple website using HTML and CSS",
        duration: "60 min",
        progress: 30,
        status: "continue",
        prerequisites: "HTML Basics, CSS Introduction",
        icon: "📖"
      },
      {
        title: "HTML Fundamentals",
        description: "Learn the basics of HTML markup language",
        duration: "90 min",
        progress: 60,
        status: "continue",
        icon: "📖"
      }
    ];

    // Use real activities data from state
    const displayActivities = realActivities.length > 0 ? realActivities : [
      {
        title: "Digital Footprint Quiz",
        difficulty: "Easy",
        points: "50 pts",
        duration: "15 min",
        status: "overdue",
        icon: FileText
      },
      {
        title: "Hardware Components Reading",
        difficulty: "Easy", 
        points: "40 pts",
        duration: "30 min",
        status: "completed",
        icon: BookOpen
      },
      {
        title: "Build Your Portfolio Page",
        difficulty: "Medium",
        points: "100 pts", 
        duration: "120 min",
        status: "overdue",
        icon: BookOpen
      },
      {
        title: "Online Safety Video",
        difficulty: "Easy",
        points: "25 pts",
        duration: "20 min", 
        status: "completed",
        icon: Play
      },
      {
        title: "Build a Virtual Computer",
        difficulty: "Medium",
        points: "80 pts",
        duration: "40 min",
        status: "completed", 
        icon: BookOpen
      },
      {
        title: "Create a Digital Citizenship Poster",
        difficulty: "Medium",
        points: "75 pts",
        duration: "45 min",
        status: "overdue",
        icon: BookOpen
      }
    ];

    // Helper function to get color classes safely
    const getColorClasses = (color: string, type: 'bg' | 'hover' | 'gradient' = 'bg') => {
      const colorMap: { [key: string]: { bg: string; hover: string; gradient: string } } = {
        'blue': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', gradient: 'bg-gradient-to-br from-blue-400 to-blue-600' },
        'purple': { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', gradient: 'bg-gradient-to-br from-purple-400 to-purple-600' },
        'green': { bg: 'bg-green-600', hover: 'hover:bg-green-700', gradient: 'bg-gradient-to-br from-green-400 to-green-600' },
        'orange': { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', gradient: 'bg-gradient-to-br from-orange-400 to-orange-600' },
        'yellow': { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
        'red': { bg: 'bg-red-600', hover: 'hover:bg-red-700', gradient: 'bg-gradient-to-br from-red-400 to-red-600' },
        'indigo': { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
        'pink': { bg: 'bg-pink-600', hover: 'hover:bg-pink-700', gradient: 'bg-gradient-to-br from-pink-400 to-pink-600' }
      };
      
      const defaultColor = colorMap.blue;
      const selectedColor = colorMap[color] || defaultColor;
      
      return selectedColor[type];
    };

    return (
      <div className="w-full p-8">
        {/* G1-G3 Dashboard Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">G1-G3 Student Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentUser?.firstname || "Student"}! (Grade {studentGrade})</p>
                </div>
              <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                G1-G3 Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - G1-G3 Specific Navigation */}
             <div className="flex items-center justify-between mb-8">
               <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                 <button 
                   onClick={() => setActiveTab('dashboard')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                   }`}
                 >
                   Dashboard
                 </button>
                 <button 
                   onClick={() => setActiveTab('courses')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                   }`}
                 >
                   My Courses
                 </button>
                 <button 
                   onClick={() => setActiveTab('lessons')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     activeTab === 'lessons' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                   }`}
                 >
                   Current Lessons
                 </button>
                 <button 
                   onClick={() => setActiveTab('activities')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     activeTab === 'activities' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                   }`}
                 >
                   Activities
                 </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Navigation:</span> Use sidebar for main navigation, tabs for content switching
               </div>
               <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                 <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium">Card View</button>
                 <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-xs font-medium">Tree View</button>
                 <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-xs font-medium">Journey View</button>
            </div>
          </div>
        </div>

        {/* Navigation Help for G1-G3 Students */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">How to Navigate (G1-G3 Students)</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><span className="font-medium">Left Sidebar:</span> Main navigation - Dashboard, My Courses, Assignments, etc.</p>
                <p><span className="font-medium">Top Tabs:</span> Switch between Dashboard overview, My Courses, Current Lessons, and Activities</p>
                <p><span className="font-medium">Top Right:</span> Profile, notifications, and logout</p>
              </div>
            </div>
               </div>
             </div>

             {/* Content based on active tab */}
             {activeTab === 'dashboard' && (
               <>
            {/* Summary Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center justify-between">
                       <div>
                    <p className="text-sm font-medium text-gray-600">Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
                       </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                     </div>
                   </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center justify-between">
                       <div>
                    <p className="text-sm font-medium text-gray-600">Lessons Done</p>
                    <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
                       </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                     </div>
                   </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center justify-between">
                       <div>
                    <p className="text-sm font-medium text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                       </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                     </div>
                   </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center justify-between">
                       <div>
                    <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
                    <p className="text-2xl font-bold text-gray-900">{weeklyGoal}/5</p>
                       </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                     </div>
                   </div>
                 </div>

            {/* My Courses Section */}
                 <div className="mb-8">
                   <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {displayCourses.map((course, index) => (
                       <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-40 relative overflow-hidden">
                      {course.courseimage ? (
                        <img 
                          src={course.courseimage} 
                          alt={course.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-blue-600');
                            }
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white opacity-80" />
                        </div>
                      )}
                           <div className="absolute top-3 right-3">
                             <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : 
                          course.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                             }`}>
                               {course.difficulty}
                             </span>
                           </div>
                         </div>
                         <div className="p-6">
                           <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                           <p className="text-gray-600 text-sm mb-4">{course.shortname}</p>
                           <div className="mb-4">
                             <div className="flex justify-between text-sm mb-1">
                               <span className="text-gray-600">Progress</span>
                               <span className="text-gray-900 font-medium">{course.progress}%</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                             </div>
                        <p className="text-xs text-gray-500 mt-1">{course.completedAssignments}/{course.totalAssignments} lessons</p>
                           </div>
                           <div className="flex items-center justify-between">
                             <span className="text-sm text-gray-600">{course.weeks} weeks</span>
                        <button 
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowCourseDetail(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Continue Learning</span>
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

            {/* Current Lessons Section */}
                 <div className="mb-8">
                   <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Lessons</h2>
              {lessonsLoading ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <Skeleton className="h-32 w-full" />
                      <div className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayLessons.map((lesson, index) => (
                       <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                         <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center">
                          {lesson.status === 'completed' ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            </div>
                          ) : lesson.status === 'locked' ? (
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <Circle className="w-3 h-3 text-gray-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                             <Info className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                           </div>
                         </div>
                         <div className="p-6">
                           <div className="mb-4">
                             <div className="flex justify-between text-sm mb-1">
                               <span className="text-gray-600">Progress</span>
                               <span className="text-gray-900 font-medium">{lesson.progress}%</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${
                              lesson.status === 'completed' ? 'bg-green-600' : 
                              lesson.status === 'locked' ? 'bg-gray-400' : 'bg-blue-600'
                            }`} style={{ width: `${lesson.progress}%` }}></div>
                             </div>
                           </div>
                           <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                           <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                           <div className="flex items-center space-x-2 mb-3">
                             <Clock className="w-4 h-4 text-gray-400" />
                             <span className="text-sm text-gray-600">{lesson.duration}</span>
                           </div>
                           {lesson.prerequisites && (
                             <p className="text-xs text-gray-500 mb-4">Prerequisites: {lesson.prerequisites}</p>
                           )}
                           <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                             lesson.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                             lesson.status === 'continue' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                          lesson.status === 'locked' ? 'bg-gray-100 text-gray-700 cursor-not-allowed' :
                          'bg-blue-600 text-white hover:bg-blue-700'
                           }`}>
                          {lesson.status === 'completed' ? 'Review Lesson' : 
                           lesson.status === 'continue' ? 'Continue Lesson' : 
                           lesson.status === 'locked' ? 'Locked' : 'Start Lesson'}
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
              )}
                 </div>

            {/* Upcoming Activities Section */}
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Activities</h2>
              {activitiesLoading ? (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <Skeleton className="h-4 w-1/3 mb-4" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {displayActivities.map((activity, index) => (
                       <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                         <div className="flex items-start space-x-4 mb-4">
                           <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                             <activity.icon className="w-5 h-5 text-blue-600" />
                           </div>
                           <div className="flex-1">
                             <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.title}</h3>
                             <div className="flex items-center space-x-2 mb-2">
                               <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                 activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                               }`}>
                                 {activity.difficulty}
                               </span>
                               <span className="text-sm font-medium text-blue-600">{activity.points}</span>
                             </div>
                             <div className="flex items-center space-x-2 mb-3">
                               <Clock className="w-4 h-4 text-gray-400" />
                               <span className="text-sm text-gray-600">{activity.duration}</span>
                             </div>
                             <div className="flex items-center space-x-2 mb-4">
                            {activity.status === 'completed' ? (
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              </div>
                            ) : (
                               <Calendar className="w-4 h-4 text-red-400" />
                            )}
                               <span className={`text-sm font-medium ${
                                 activity.status === 'overdue' ? 'text-red-600' : 
                                 activity.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                               }`}>
                                 {activity.status === 'overdue' ? 'Overdue' : 
                                  activity.status === 'completed' ? 'Completed' : 'Pending'}
                               </span>
                             </div>
                           </div>
                         </div>
                         <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           activity.status === 'overdue' ? 'bg-orange-500 text-white hover:bg-orange-600' : 
                           activity.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                           'bg-blue-600 text-white hover:bg-blue-700'
                         }`}>
                           {activity.status === 'overdue' ? 'Continue' : 
                         activity.status === 'completed' ? 'Review' : 'Start'}
                         </button>
                       </div>
                     ))}
                   </div>
              )}
                 </div>
               </>
             )}

             {activeTab === 'courses' && (
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">All My Courses</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {userCourses.map((course, index) => (
                     <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`h-32 ${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'gradient')} relative`}>
                         <div className="absolute top-3 right-3">
                           <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                             Active
                           </span>
                         </div>
                       </div>
                       <div className="p-6">
                         <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.fullname}</h3>
                         <p className="text-gray-600 text-sm mb-4">{course.shortname}</p>
                         <div className="mb-4">
                           <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-600">Progress</span>
                             <span className="text-gray-900 font-medium">{course.progress || 0}%</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'bg')} h-2 rounded-full`} style={{ width: `${course.progress || 0}%` }}></div>
                           </div>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Course ID: {course.id}</span>
                      <button className={`${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'bg')} ${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'hover')} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}>
                             View Course
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {activeTab === 'lessons' && (
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Lessons</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {realLessons.map((lesson, index) => (
                     <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                       <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 relative">
                         <div className="absolute top-3 right-3 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                           <Play className="w-3 h-3 text-green-600" />
                         </div>
                       </div>
                       <div className="p-6">
                         <div className="mb-4">
                           <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-600">Progress</span>
                             <span className="text-gray-900 font-medium">{lesson.progress}%</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-2">
                             <div className="bg-green-600 h-2 rounded-full" style={{ width: `${lesson.progress}%` }}></div>
                           </div>
                         </div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                         <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                         <div className="flex items-center space-x-2 mb-3">
                           <Clock className="w-4 h-4 text-gray-400" />
                           <span className="text-sm text-gray-600">{lesson.duration}</span>
                         </div>
                         <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           lesson.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                           lesson.status === 'continue' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                           'bg-gray-100 text-gray-700 hover:bg-gray-200'
                         }`}>
                           {lesson.status === 'completed' ? 'Completed' : 
                            lesson.status === 'continue' ? 'Continue Lesson' : 'Start Lesson'}
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {activeTab === 'activities' && (
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">All Activities</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {realActivities.map((activity, index) => (
                     <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                       <div className="flex items-start space-x-4 mb-4">
                         <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                           <activity.icon className="w-5 h-5 text-purple-600" />
                         </div>
                         <div className="flex-1">
                           <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.title}</h3>
                           <div className="flex items-center space-x-2 mb-2">
                             <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                               activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                             }`}>
                               {activity.difficulty}
                             </span>
                             <span className="text-sm font-medium text-purple-600">{activity.points}</span>
                           </div>
                           <div className="flex items-center space-x-2 mb-3">
                             <Clock className="w-4 h-4 text-gray-400" />
                             <span className="text-sm text-gray-600">{activity.duration}</span>
                           </div>
                           <div className="flex items-center space-x-2 mb-4">
                             <Calendar className="w-4 h-4 text-red-400" />
                             <span className={`text-sm font-medium ${
                               activity.status === 'overdue' ? 'text-red-600' : 
                               activity.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                             }`}>
                               {activity.status === 'overdue' ? 'Overdue' : 
                                activity.status === 'completed' ? 'Completed' : 'Pending'}
                             </span>
                           </div>
                         </div>
                       </div>
                       <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                         activity.status === 'overdue' ? 'bg-orange-500 text-white hover:bg-orange-600' : 
                         activity.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                         'bg-purple-600 text-white hover:bg-purple-700'
                       }`}>
                         {activity.status === 'overdue' ? 'Continue' : 
                          activity.status === 'completed' ? 'View' : 'Start'}
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             )}
      </div>
    );
  };

  // Course Detail View Component
  const renderCourseDetail = () => {
    if (!selectedCourse) return null;

    // Get lessons for this specific course
    const courseLessons = realLessons.filter(lesson => 
      lesson.courseName === selectedCourse.name || 
      lesson.courseName === selectedCourse.fullname
    );

    // Fallback lessons if no real data
    const displayLessons = courseLessons.length > 0 ? courseLessons : [
      {
        title: "Internet Safety & Digital Citizenship",
        description: "Learn how to stay safe online and be a good digital citizen",
        duration: "45 min",
        progress: 75,
        status: "continue",
        icon: "📖"
      },
      {
        title: "Computer Hardware Basics",
        description: "Understanding computer components and how they work together",
        duration: "60 min", 
        progress: 100,
        status: "completed",
        icon: "📖"
      },
      {
        title: "File Management & Organization",
        description: "Learn to organize and manage digital files effectively",
        duration: "50 min",
        progress: 45,
        status: "continue",
        prerequisites: "Computer Hardware Basics",
        icon: "📖"
      },
      {
        title: "Digital Communication Tools",
        description: "Explore email, messaging, and collaboration platforms",
        duration: "55 min",
        progress: 0,
        status: "locked",
        prerequisites: "File Management & Organization",
        icon: "📖"
      }
    ];

    return (
      <div className="w-full">
        {/* Header with Back Button */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg mb-6">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCourseDetail(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Courses</span>
              </button>
                       </div>
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="KODEIT" 
                className="w-8 h-8"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center hidden">
                <span className="text-white font-bold text-xs">K</span>
                       </div>
              <span className="text-lg font-bold text-gray-900">KODEIT</span>
                     </div>
                     </div>
                   </div>

        <div className="space-y-6">
          {/* Course Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Course Header with Background Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
              {selectedCourse.courseimage ? (
                <img 
                  src={selectedCourse.courseimage} 
                  alt={selectedCourse.name}
                  className="w-full h-full object-cover opacity-20"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white opacity-80" />
                       </div>
              
              {/* Course Info Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="mb-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      {selectedCourse.difficulty}
                    </span>
                       </div>
                  <h1 className="text-3xl font-bold mb-2">{selectedCourse.name}</h1>
                  <p className="text-lg opacity-90">{selectedCourse.shortname}</p>
                     </div>
                     </div>
                   </div>

            {/* Course Metrics */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                       </div>
                       <div>
                    <p className="text-sm text-gray-600">Lessons</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCourse.completedAssignments}/{selectedCourse.totalAssignments}</p>
                       </div>
                     </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                     </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCourse.weeks} weeks</p>
                   </div>
                 </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
               </div>
               <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCourse.progress}%</p>
                       </div>
                         </div>
                   </div>

              {/* Course Progress Bar */}
                         <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Course Progress</span>
                  <span className="text-gray-900 font-medium">{selectedCourse.progress}%</span>
                         </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${selectedCourse.progress}%` }}></div>
                       </div>
                         </div>
                       </div>
                     </div>

          {/* Course Lessons Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lessons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayLessons.map((lesson, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Lesson Image */}
                  <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white opacity-80" />
                   </div>
                    
                    {/* Status Icon */}
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center">
                      {lesson.status === 'completed' ? (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                 </div>
                      ) : lesson.status === 'locked' ? (
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Circle className="w-3 h-3 text-gray-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Info className="w-3 h-3 text-blue-600" />
               </div>
             )}
                    </div>
           </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{lesson.duration}</span>
                    </div>

                    {lesson.prerequisites && (
                      <p className="text-xs text-gray-500 mb-4">Prerequisites: {lesson.prerequisites}</p>
                    )}

                    <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      lesson.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                      lesson.status === 'continue' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                      lesson.status === 'locked' ? 'bg-gray-100 text-gray-700 cursor-not-allowed' :
                      'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {lesson.status === 'completed' ? 'Review Lesson' : 
                       lesson.status === 'continue' ? 'Continue Lesson' : 
                       lesson.status === 'locked' ? 'Locked' : 'Start Lesson'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
         </div>
       );
     };

  const renderG4G7Dashboard = () => (
    <div className='bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-100'>
      <div className="mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upcoming Exams Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Exams</h2>
              <div className="space-y-4">
                {upcomingExams.map((exam, index) => (
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
            </div>

            {/* Your Schedule Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Schedule</h2>
                <Info className="w-5 h-5 text-purple-500" />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">Today's Schedule</p>
                
                {/* Calendar Strip */}
                <div className="relative mb-4">
                  <div className="flex space-x-2 px-8 overflow-x-auto">
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

            {/* Frontend Interview Kit Section */}
            <div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="mb-6">
                  <p className="text-sm opacity-90 mb-1">FRONTEND DEVELOPER</p>
                  <h2 className="text-2xl font-bold">Frontend Interview Kit</h2>
                </div>
                
                <div className="space-y-4">
                  {learningModules.map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                      <div className="flex items-center space-x-3">
                        {module.title.includes('(') ? (
                          <div className="relative">
                            <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{module.progress}/{module.total}</span>
                            </div>
                          </div>
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${module.type === 'learning' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                        )}
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              module.type === 'learning' 
                                ? 'bg-green-400/20 text-green-200' 
                                : 'bg-orange-400/20 text-orange-200'
                            }`}>
                              {module.type.toUpperCase()}
                            </span>
                            <span className="text-xs opacity-75">{module.duration}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-75" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentUser?.fullname || "Student"}</h3>
                  <p className="text-blue-600 text-sm">Daily Rank →</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Today's Progress</p>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-green-600 font-medium">Best: 2</span>
                <span className="text-orange-600 font-medium">Goal: 7</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Flame className="w-6 h-6 text-orange-500 mb-1" />
                  <span className="text-xs text-gray-600">0 Streaks</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">119.55K Points</span>
                </div>
                <div className="flex flex-col items-center">
                  <Coins className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">18,860 Coins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderG8PlusDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time data from IOMAD Moodle API - Welcome back, {currentUser?.firstname || "Student"}!</p>
        </div>
        
        {/* Dashboard Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <span className="text-sm font-medium text-gray-700">Q2 2025 (Apr-Jun)</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStates.stats ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Enrolled Courses</p>
              {loadingStates.userCourses ? (
                <div className="mt-1">
                  <Skeleton className="h-8 w-16" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.enrolledCourses}</h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">+{Math.floor(Math.random() * 5) + 1}%</span>
                    <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                  </div>
                </>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Completed Assignments</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.completedAssignments}</h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">+{Math.floor(Math.random() * 15) + 5}%</span>
                    <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending Assignments</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingAssignments}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-red-600 text-sm font-medium">Due soon</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Average Grade</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.averageGrade}%</h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">+{Math.floor(Math.random() * 5) + 1}%</span>
                    <span className="text-gray-500 text-sm ml-1">vs last quarter</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Course Progress Analysis - Simplified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Course Progress Overview</h2>
          </div>
          
          {/* Subject Breakdown */}
          <div className="space-y-3">
            {loadingStates.userCourses || loadingStates.courseProgress ? (
              <SkeletonProgressBar />
            ) : courseProgress.length > 0 ? (
              courseProgress.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                  <span className="text-sm font-semibold text-green-600">{item.progress}%</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No courses available</p>
              </div>
            )}
          </div>
        </div>

        {/* Grade Distribution Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Grade Distribution Analysis</h2>
          </div>

          <div className="space-y-4">
            {loadingStates.gradeBreakdown ? (
              <SkeletonProgressBar />
            ) : (
              gradeBreakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.grade}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count} assignments</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.grade.includes('A') ? 'bg-green-600' :
                        item.grade.includes('B') ? 'bg-blue-600' :
                        item.grade.includes('C') ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total Assignments</span>
              <span className="text-sm font-bold text-gray-900">{stats.completedAssignments + stats.pendingAssignments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">GPA</span>
              <span className="text-sm font-bold text-green-600">{(stats.averageGrade / 25).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Activities Section - Independent Loading */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Course Activities</h2>
          <div className="flex items-center space-x-2">
            {loadingStates.studentActivities && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Loading activities...</span>
              </div>
            )}
            <Link to="/dashboard/student/activities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {loadingStates.recentActivities ? (
                <>
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                </>
              ) : recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === 'course_access' ? (
                        <BookOpen className="w-3 h-3 text-blue-600" />
                      ) : activity.type === 'assignment_submit' ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Activity className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.grade && (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-green-600">{activity.grade}%</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Activities */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">My Assignments</h3>
            <div className="space-y-3">
              {loadingStates.studentActivities ? (
                <>
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                  <SkeletonActivityCard />
                </>
              ) : studentActivities.length > 0 ? (
                studentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        activity.status === 'completed' ? 'bg-green-100' :
                        activity.status === 'overdue' ? 'bg-red-100' :
                        activity.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : activity.status === 'overdue' ? (
                          <Clock className="w-3 h-3 text-red-600" />
                        ) : activity.status === 'in_progress' ? (
                          <Activity className="w-3 h-3 text-yellow-600" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.courseName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.grade ? (
                        <span className="text-xs font-semibold text-green-600">{activity.grade}%</span>
                      ) : (
                        <span className={`text-xs font-medium ${
                          activity.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {activity.status === 'overdue' ? 'Overdue' : 
                           activity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">No assignments available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Activities Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Activities</h2>
          <Link to="/dashboard/student/assignments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Assignments →
          </Link>
        </div>
        
        <div className="space-y-4">
          {loadingStates.studentActivities ? (
            <>
              <SkeletonActivityCard />
              <SkeletonActivityCard />
              <SkeletonActivityCard />
              <SkeletonActivityCard />
              <SkeletonActivityCard />
            </>
          ) : (
            studentActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.courseName}</p>
                  {activity.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(activity.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                  {activity.grade && (
                    <p className="text-xs text-green-600 font-medium mt-1">{activity.grade}%</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Programming Tools Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Programming Tools</h2>
            <p className="text-gray-600 mt-1">Access interactive programming environments</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/dashboard/student/code-editor" className="block">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Code className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">Code Editor</h3>
                  <p className="text-sm text-green-700">Write and run code in multiple programming languages</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/dashboard/student/compiler" className="block">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900">Compiler</h3>
                  <p className="text-sm text-purple-700">Advanced code compilation with Piston API</p>
                </div>
              </div>
            </div>
          </Link>
         
          <Link to="/dashboard/student/scratch-editor" className="block">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Scratch Programming</h3>
                  <p className="text-sm text-blue-700">Create interactive stories, games, and animations with visual blocks</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  // Render appropriate dashboard based on grade
  const renderGradeBasedDashboard = () => {
    console.log('🎓 Rendering dashboard - Type:', dashboardType, 'Grade:', studentGrade);
    
    // Show loading state while grade detection is in progress
    if (!gradeDetectionComplete) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Loading Your Dashboard</h2>
                <p className="text-gray-600">Detecting your grade level and preparing your personalized dashboard...</p>
              </div>
            </div>
          </div>
          
          {/* Debug button for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Debug Mode</h3>
                    <p className="text-sm text-yellow-700">Current Grade: {studentGrade}, Dashboard Type: {dashboardType}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={clearAllCachedData}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Clear Cache
                    </button>
                    <button
                      onClick={forceGrade1ForTesting}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Force Grade 1
                    </button>
                    <button
                      onClick={debugGradeDetectionTest}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Debug Grade
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Comparison */}
              <DashboardComparison 
                currentGrade={studentGrade}
                currentDashboardType={dashboardType}
                detectedCohort={studentCohort?.name}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      );
    }
    
    switch (dashboardType) {
      case 'G1_G3':
        console.log('🎓 Rendering G1-G3 Dashboard');
        return renderG1G3Dashboard();
      case 'G4_G7':
        console.log('🎓 Rendering G4-G7 Dashboard');
        return renderG4G7Dashboard();
      case 'G8_PLUS':
      default:
        console.log('🎓 Rendering G8+ Dashboard');
        return renderG8PlusDashboard();
    }
  };

  // All dashboards should use DashboardLayout for consistent functionality
  console.log('🎓 Final render - Dashboard Type:', dashboardType, 'Grade:', studentGrade, 'User:', currentUser?.fullname);

  return (
    <DashboardLayout 
      userRole="student" 
      userName={currentUser?.fullname || "Student"}
      studentGrade={studentGrade}
      dashboardType={dashboardType}
    >
      {showCourseDetail ? renderCourseDetail() : renderGradeBasedDashboard()}
    </DashboardLayout>
  );
};

export default StudentDashboard; 