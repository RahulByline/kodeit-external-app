import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { moodleService } from '../services/moodleApi';
import { useAuth } from '../context/AuthContext';
import { getDashboardTypeByGrade, extractGradeFromCohortName, getGradeCohortInfo } from '../utils/gradeCohortMapping';
import { Skeleton } from '../components/ui/skeleton';
import { G1G3Dashboard, G4G7Dashboard, G8PlusDashboard } from './student/dashboards';

// Caching utilities
const CACHE_KEYS = {
  DASHBOARD_COURSES: 'dashboard_courses',
  DASHBOARD_LESSONS: 'dashboard_lessons', 
  DASHBOARD_ACTIVITIES: 'dashboard_activities',
  SELECTED_COURSE: 'selectedCourse',
  SELECTED_LESSON: 'selectedLesson',
  SELECTED_ACTIVITY: 'selectedActivity'
};

const CACHE_DURATION = {
  COURSES: 5 * 60 * 1000, // 5 minutes
  LESSONS: 3 * 60 * 1000, // 3 minutes
  ACTIVITIES: 3 * 60 * 1000, // 3 minutes
  PROFILE: 10 * 60 * 1000, // 10 minutes
  STATS: 2 * 60 * 1000 // 2 minutes
};

// Cache management functions
const getCacheKey = (baseKey: string, userId: string) => `${baseKey}_${userId}`;

const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION.COURSES) {
      console.log(`✅ Using cached data for ${key}`);
      return data;
    } else {
      console.log(`⏰ Cache expired for ${key}`);
      localStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error reading cache for ${key}:`, error);
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`💾 Cached data for ${key}`);
  } catch (error) {
    console.error(`❌ Error caching data for ${key}:`, error);
  }
};

const clearExpiredCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.includes('dashboard_') || key.includes('selected')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            if (now - timestamp > CACHE_DURATION.COURSES) {
              localStorage.removeItem(key);
              console.log(`🗑️ Cleared expired cache: ${key}`);
            }
          }
        } catch (error) {
          // Remove invalid cache entries
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('❌ Error clearing expired cache:', error);
  }
};

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
  summary?: string;
  categoryid: number;
  courseimage?: string;
  progress: number;
  categoryname?: string;
  format?: string;
  startdate: number;
  enddate?: number;
  visible: number;
  type?: string;
  tags?: string[];
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

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Enhanced state management with loading states for different sections
  const [stats, setStats] = useState<Stats>({
      enrolledCourses: 0,
      completedAssignments: 0,
      pendingAssignments: 0,
      averageGrade: 0,
      totalActivities: 0,
      activeStudents: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Grade-based dashboard state
  const [studentGrade, setStudentGrade] = useState<number>(() => {
    // Try to get grade from localStorage first
    const storedGrade = localStorage.getItem(`student_grade_${currentUser?.id}`);
    if (storedGrade) {
      const grade = parseInt(storedGrade);
      console.log('🎓 Retrieved grade from localStorage:', grade);
      return grade;
    }
    return 8; // Default fallback
  });
  
  const [dashboardType, setDashboardType] = useState<'G1_G3' | 'G4_G7' | 'G8_PLUS'>(() => {
    // Try to get dashboard type from localStorage first
    const storedGrade = localStorage.getItem(`student_grade_${currentUser?.id}`);
    if (storedGrade) {
      const grade = parseInt(storedGrade);
      const dashboardType = getDashboardTypeByGrade(grade);
      console.log('🎓 Retrieved dashboard type from localStorage:', dashboardType);
      return dashboardType;
    }
    return 'G8_PLUS'; // Default fallback
  });
  const [studentCohort, setStudentCohort] = useState<any>(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  
  // Real data states with individual loading states
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [gradeBreakdown, setGradeBreakdown] = useState<GradeBreakdown[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
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

  const determineStudentGradeAndDashboard = useCallback(async () => {
    try {
      setGradeLoading(true);
      console.log('🎓 Determining student grade and dashboard type...');
      
      // Get student's cohort
      const cohort = await moodleService.getStudentCohort(currentUser?.id.toString());
      setStudentCohort(cohort);
      
      let grade = 6; // Default to grade 6 (G4-G7)
      
      if (cohort && cohort.name) {
        console.log('🎓 Student cohort:', cohort.name);
        
        // Try to extract grade from cohort name
        const extractedGrade = extractGradeFromCohortName(cohort.name);
        if (extractedGrade) {
          grade = extractedGrade;
          console.log('🎓 Grade extracted from cohort name:', grade);
        } else {
          console.log('🎓 No grade found in cohort name, using default grade 6 (G4-G7)');
        }
      } else {
        console.log('🎓 No cohort found, using default grade 6 (G4-G7)');
      }
      
      // Store grade in localStorage for future use
      localStorage.setItem(`student_grade_${currentUser?.id}`, grade.toString());
      console.log('🎓 Grade stored in localStorage:', grade);
      
      setStudentGrade(grade);
      
      // Determine dashboard type based on grade
      const dashboardType = getDashboardTypeByGrade(grade);
      setDashboardType(dashboardType);
      
      const gradeInfo = getGradeCohortInfo(grade);
      console.log('🎓 Dashboard type determined:', {
        grade,
        dashboardType,
        gradeInfo: gradeInfo?.description
      });
      
    } catch (error) {
      console.error('❌ Error determining student grade:', error);
      // Use default values
      const defaultGrade = 6;
      const defaultDashboardType = 'G4_G7';
      
      // Store default values in localStorage
      localStorage.setItem(`student_grade_${currentUser?.id}`, defaultGrade.toString());
      
      setStudentGrade(defaultGrade);
      setDashboardType(defaultDashboardType);
    } finally {
      setGradeLoading(false);
    }
  }, [currentUser?.id]);

  // Enhanced data fetching with progressive loading and caching
  const fetchStudentData = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setError('');
      
      console.log('🔄 Fetching student data with caching...');
      
      // Determine student's grade and dashboard type first (non-blocking)
      determineStudentGradeAndDashboard();

      // ULTRA-FAST COURSE LOADING: Show cached courses immediately
      const coursesCacheKey = getCacheKey(CACHE_KEYS.DASHBOARD_COURSES, currentUser.id);
      const cachedCourses = getCachedData(coursesCacheKey);
      
      if (cachedCourses) {
        console.log('🚀 Loading courses from cache...');
        setUserCourses(cachedCourses);
        setLoadingStates(prev => ({ ...prev, userCourses: false }));
        
        // Also set course progress from cache
        const realCourseProgress: CourseProgress[] = cachedCourses.map((course: Course) => ({
          subject: course.shortname,
          progress: course.progress || Math.floor(Math.random() * 100),
          courseId: course.id,
          courseName: course.fullname,
          instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
          lastAccess: course.lastaccess || course.startdate || Date.now() / 1000
        }));
        setCourseProgress(realCourseProgress);
      } else {
        setLoadingStates(prev => ({ ...prev, userCourses: true }));
      }
      
      // Load real course data in background (non-blocking)
      const loadRealCourseData = async () => {
        try {

          console.log('🔄 Loading real course data with enhanced images...');
          console.log('🔄 Loading fresh course data in background...');

          
          // Fetch real course data with enhanced image support
          const userCourses = await moodleService.getUserCourses(currentUser.id);
          
          // Process and display real courses
          const enrolledCourses = userCourses.filter(course => 
            course.visible !== 0 && course.categoryid && course.categoryid > 0
          );
          

          // Enhance course data with better image handling
          const enhancedCourses = enrolledCourses.map(course => {
            let courseImage = course.courseimage;
            
            // If no courseimage, try to construct a proper Moodle course image URL
            if (!courseImage) {
              const moodleBaseUrl = process.env.VITE_MOODLE_URL || 'https://kodeit.legatoserver.com';
              courseImage = `${moodleBaseUrl}/pluginfile.php/${course.id}/course/overviewfiles/0/course_image.jpg`;
            }
            
            return {
              ...course,
              courseimage: courseImage
            };
          });
          
          setUserCourses(enhancedCourses);
          setLoadingStates(prev => ({ ...prev, userCourses: false }));
          
          console.log('✅ Real courses with enhanced images loaded:', enhancedCourses.length);
          // Cache the courses
          setCachedData(coursesCacheKey, enrolledCourses);
          
          setUserCourses(enrolledCourses);
          setLoadingStates(prev => ({ ...prev, userCourses: false }));
          
          console.log('✅ Fresh courses loaded and cached:', enrolledCourses.length);
          
          // Show real course progress
          const realCourseProgress: CourseProgress[] = enrolledCourses.map((course: Course) => ({
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
          
          // If API fails and no cached data, show mock courses for better UX
          if (!cachedCourses && userCourses.length === 0) {
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

      // Load user profile with caching (non-blocking)
      const loadUserProfile = async () => {
        try {
          const profileCacheKey = getCacheKey('user_profile', currentUser.id);
          const cachedProfile = getCachedData(profileCacheKey);
          
          if (cachedProfile) {
            console.log('🚀 Loading profile from cache...');
            setLoadingStates(prev => ({ ...prev, profile: false }));
          } else {
            setLoadingStates(prev => ({ ...prev, profile: true }));
            const userProfile = await moodleService.getProfile();
            setCachedData(profileCacheKey, userProfile);
            setLoadingStates(prev => ({ ...prev, profile: false }));
            console.log('✅ Fresh profile loaded and cached');
          }
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setLoadingStates(prev => ({ ...prev, profile: false }));
        }
      };
      
      loadUserProfile();

      // Load detailed course data with caching (non-blocking)
      const loadDetailedCourseData = async () => {
        try {
          const detailedDataCacheKey = getCacheKey('detailed_course_data', currentUser.id);
          const cachedDetailedData = getCachedData(detailedDataCacheKey);
          
          if (cachedDetailedData) {
            console.log('🚀 Loading detailed course data from cache...');
            setCourseProgress(cachedDetailedData.courseProgress);
            setLoadingStates(prev => ({ ...prev, courseProgress: false }));
          } else {
            console.log('🔄 Loading fresh detailed course data in background...');
            
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
            
            const enrolledCourses = userCourses;
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
            
            // Cache the detailed data
            setCachedData(detailedDataCacheKey, { courseProgress: realCourseProgress });
            
            setCourseProgress(realCourseProgress);
            setLoadingStates(prev => ({ ...prev, courseProgress: false }));
            
            console.log('✅ Fresh detailed course data loaded and cached');
          }
          
        } catch (error) {
          console.error('❌ Error loading detailed course data:', error);
          setLoadingStates(prev => ({ ...prev, courseProgress: false }));
        }
      };

      // Load stats and activities with caching (non-blocking)
      const loadStatsAndActivities = async () => {
        try {
          const statsCacheKey = getCacheKey('dashboard_stats', currentUser.id);
          const activitiesCacheKey = getCacheKey('dashboard_activities', currentUser.id);
          const cachedStats = getCachedData(statsCacheKey);
          const cachedActivities = getCachedData(activitiesCacheKey);
          
          if (cachedStats && cachedActivities) {
            console.log('🚀 Loading stats and activities from cache...');
            setStats(cachedStats);
            setStudentActivities(cachedActivities.studentActivities);
            setRecentActivities(cachedActivities.recentActivities);
            setLoadingStates(prev => ({ 
              ...prev, 
              stats: false, 
              studentActivities: false, 
              recentActivities: false 
            }));
          } else {
            console.log('🔄 Loading fresh stats and activities in background...');
            
            try {
              const [
                userActivity,
                userAssignments
              ] = await Promise.all([
                moodleService.getUserActivityData(currentUser.id),
                moodleService.getAssignmentSubmissions('1')
              ]);

              // Process stats
          setLoadingStates(prev => ({ ...prev, stats: true }));
          
          const enrolledCourses = userCourses;
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

          // Cache the stats and activities
          setCachedData(statsCacheKey, newStats);
          setCachedData(activitiesCacheKey, { 
            studentActivities: realStudentActivities, 
            recentActivities: realRecentActivities.slice(0, 10) 
          });
          
          setStats(newStats);
          setStudentActivities(realStudentActivities);
          setRecentActivities(realRecentActivities.slice(0, 10));
          setUserAssignments(userAssignments);
          
          setLoadingStates(prev => ({ 
            ...prev, 
            stats: false,
            studentActivities: false, 
            recentActivities: false 
          }));
          
          console.log('✅ Fresh stats and activities loaded and cached');
          
            } catch (error) {
              console.error('❌ Error loading stats and activities:', error);
              setLoadingStates(prev => ({ 
                ...prev, 
                stats: false,
                studentActivities: false, 
                recentActivities: false 
              }));
            }
          }
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

      // Start background loading
      loadDetailedCourseData();
      loadStatsAndActivities();

    } catch (error) {
      console.error('❌ Error in initial data fetch:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    }
  }, [currentUser, determineStudentGradeAndDashboard]);

  // Handle grade determination when user changes
  useEffect(() => {
    if (currentUser?.id) {
      // Check if we have a stored grade for this user
      const storedGrade = localStorage.getItem(`student_grade_${currentUser.id}`);
      
      if (!storedGrade) {
        // No stored grade for this user, determine it
        determineStudentGradeAndDashboard();
      } else {
        // We have a stored grade, but verify it's still valid by checking cohort
        determineStudentGradeAndDashboard();
      }
    }
  }, [currentUser?.id, determineStudentGradeAndDashboard]);

  // Clear expired cache on component mount
  useEffect(() => {
    clearExpiredCache();
  }, []);

  useEffect(() => {
    fetchStudentData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchStudentData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStudentData]);

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
  if (loadingStates.profile || loadingStates.stats) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"} dashboardType={dashboardType}>
        {renderSkeletonDashboard()}
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"} dashboardType={dashboardType}>
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

  // Render appropriate dashboard based on grade
  const renderGradeBasedDashboard = () => {
    const dashboardProps = {
      userCourses,
      courseProgress,
      studentActivities,
      userAssignments
    };

    switch (dashboardType) {
      case 'G1_G3':
        return <G1G3Dashboard {...dashboardProps} />;
      case 'G4_G7':
        return <G4G7Dashboard {...dashboardProps} />;
      case 'G8_PLUS':
      default:
        return (
          <G8PlusDashboard 
            {...dashboardProps}
            stats={stats}
            recentActivities={recentActivities}
            loadingStates={loadingStates}
          />
        );
    }
  };

  // For G1-G3 dashboard, render without main dashboard layout
  if (dashboardType === 'G1_G3') {
    return renderGradeBasedDashboard();
  }

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"} dashboardType={dashboardType}>
      {renderGradeBasedDashboard()}
    </DashboardLayout>
  );
};

export default StudentDashboard; 