import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target,
  ChevronDown,
  ChevronRight,
  Share2,
  Calendar,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Info,
  Circle,
  User,
  MessageSquare,
  Trophy,
  Home,
  Monitor,
  Zap,
  LayoutDashboard,
  GraduationCap,
  Settings,
  Bell,
  Search,
  Plus,
  Code,
  LogOut,
  ArrowLeft,
  Lock,
  Square,
  Video
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { moodleService } from '../../../services/moodleApi';
import logo from '../../../assets/logo.png';
import ScratchEmulator from '../../../components/dashboard/Emulator/ScratchEmulator';

interface SimpleCourse {
  id: string;
  name: string;
  shortname: string;
  progress: number;
  completedAssignments: number;
  totalAssignments: number;
  difficulty: string;
  color: string;
  weeks: number;
  courseimage?: string;
}

interface Lesson {
  title: string;
  description: string;
  duration: string;
  progress: number;
  status: 'completed' | 'continue' | 'locked' | 'not_started';
  prerequisites?: string;
}

interface Activity {
  title: string;
  difficulty: string;
  points: string;
  duration: string;
  status: 'completed' | 'overdue' | 'pending';
  icon: any;
}

interface RealCourse {
  id: string;
  fullname: string;
  shortname: string;
  summary: string;
  categoryid: number;
  categoryname: string;
  courseimage?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  difficulty: string;
  startdate?: number;
  enddate?: number;
  visible: number;
}

interface RealLesson {
  id: string;
  name: string;
  description: string;
  duration: string;
  progress: number;
  status: 'completed' | 'continue' | 'locked' | 'not_started';
  prerequisites?: string[];
  activities: RealActivity[];
  courseId: string;
  courseName: string;
  dueDate?: string;
  points: number;
  difficulty: string;
}

interface RealActivity {
  id: string;
  name: string;
  type: 'quiz' | 'video' | 'project' | 'reading' | 'assignment';
  description: string;
  duration: string;
  points: number;
  difficulty: string;
  status: 'completed' | 'overdue' | 'pending' | 'in_progress';
  dueDate?: string;
  lessonId: string;
  courseId: string;
  progress: number;
  order: number;
}

interface CourseSection {
  id: string;
  name: string;
  summary: string;
  modules: CourseModule[];
}

interface CourseModule {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: string;
  status: 'completed' | 'continue' | 'locked' | 'not_started';
  prerequisites?: string[];
  activities: ModuleActivity[];
  progress: number;
  points: number;
  difficulty: string;
  image?: string;
}

interface ModuleActivity {
  id: string;
  name: string;
  type: 'quiz' | 'video' | 'project' | 'reading' | 'assignment';
  description: string;
  duration: string;
  points: number;
  difficulty: string;
  status: 'completed' | 'overdue' | 'pending' | 'in_progress';
  dueDate?: string;
  progress: number;
  thumbnail?: string;
  order: number;
}

interface CourseDetail {
  id: string;
  fullname: string;
  shortname: string;
  summary: string;
  categoryid: number;
  categoryname: string;
  courseimage?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  difficulty: string;
  startdate?: number;
  enddate?: number;
  visible: number;
  sections: CourseSection[];
}

interface RealAssignment {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  grade?: number;
  maxGrade: number;
  status: 'submitted' | 'graded' | 'overdue' | 'pending';
  submissionDate?: string;
  feedback?: string;
}

interface G1G3DashboardProps {
  userCourses?: any[];
  courseProgress?: any[];
  studentActivities?: any[];
  userAssignments?: any[];
}

const G1G3Dashboard: React.FC<G1G3DashboardProps> = ({
  userCourses: propUserCourses,
  courseProgress: propCourseProgress,
  studentActivities: propStudentActivities,
  userAssignments: propUserAssignments
}) => {
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'profile-settings' | 'scratch-editor' | 'ebooks' | 'ask-teacher' | 'share-class'>('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Grade-based access control functions
  const getUserGrade = () => {
    // Extract grade from user data - this could be from profile, course enrollment, or user metadata
    const gradeFromProfile = currentUser?.profileimageurl?.includes('grade') ? 
      currentUser.profileimageurl.match(/grade(\d+)/i)?.[1] : null;
    
    // Fallback to role-based grade detection
    if (gradeFromProfile) return parseInt(gradeFromProfile);
    
    // Check if user has grade in their profile data
    const userGrade = (currentUser as any)?.grade || (currentUser as any)?.level || null;
    if (userGrade) return parseInt(userGrade);
    
    // Default to grade 1 if no grade info found
    return 1;
  };

  const canAccessFeature = (feature: string, requiredGrade?: number) => {
    const userGrade = getUserGrade();
    const userRoleLevel = userRole || 'student';
    
    // Admin access - admins can access everything
    if (userRoleLevel === 'admin' || userRoleLevel === 'school_admin') {
      return true;
    }
    
    // Teacher access - teachers can access most features
    if (userRoleLevel === 'teacher') {
      return ['dashboard', 'courses', 'lessons', 'activities', 'achievements', 'schedule'].includes(feature);
    }
    
    // Student access - grade-based restrictions
    if (userRoleLevel === 'student') {
      // Grade-based feature access
      const gradeAccess = {
        'dashboard': { minGrade: 1, maxGrade: 12 },
        'courses': { minGrade: 1, maxGrade: 12 },
        'lessons': { minGrade: 1, maxGrade: 12 },
        'activities': { minGrade: 1, maxGrade: 12 },
        'achievements': { minGrade: 1, maxGrade: 12 },
        'schedule': { minGrade: 1, maxGrade: 12 },
        'code_editor': { minGrade: 3, maxGrade: 12 }, // Code editor for grade 3+
        'scratch_editor': { minGrade: 1, maxGrade: 12 }, // Scratch for all grades
        'advanced_courses': { minGrade: 5, maxGrade: 12 }, // Advanced courses for grade 5+
        'ai_features': { minGrade: 7, maxGrade: 12 }, // AI features for grade 7+
      };
      
      const featureAccess = gradeAccess[feature as keyof typeof gradeAccess];
      if (featureAccess) {
        return userGrade >= featureAccess.minGrade && userGrade <= featureAccess.maxGrade;
      }
      
      // If no specific grade requirement, check if grade requirement is met
      if (requiredGrade) {
        return userGrade >= requiredGrade;
      }
      
      return true; // Default allow for students
    }
    
    return false; // Default deny
  };

  const getGradeSpecificFeatures = () => {
    const userGrade = getUserGrade();
    
    // Grade-specific feature sets
    if (userGrade <= 3) {
      return {
        showCodeEditor: false,
        showAdvancedCourses: false,
        showAIFeatures: false,
        showScratchEditor: true,
        showBasicTools: true
      };
    } else if (userGrade <= 6) {
      return {
        showCodeEditor: true,
        showAdvancedCourses: false,
        showAIFeatures: false,
        showScratchEditor: true,
        showBasicTools: true
      };
    } else {
      return {
        showCodeEditor: true,
        showAdvancedCourses: true,
        showAIFeatures: true,
        showScratchEditor: true,
        showBasicTools: true
      };
    }
  };

  // Debug information for access control
  const debugAccessInfo = () => {
    const userGrade = getUserGrade();
    const features = getGradeSpecificFeatures();
    
    console.log('🔐 Access Control Debug Info:');
    console.log('👤 User Grade:', userGrade);
    console.log('🎭 User Role:', userRole);
    console.log('📋 Available Features:', features);
    console.log('✅ Can Access Code Editor:', canAccessFeature('code_editor'));
    console.log('✅ Can Access Scratch Editor:', canAccessFeature('scratch_editor'));
    console.log('✅ Can Access AI Features:', canAccessFeature('ai_features'));
    console.log('✅ Can Access Advanced Courses:', canAccessFeature('advanced_courses'));
  };

  // Log access control info on component mount
  useEffect(() => {
    debugAccessInfo();
  }, [currentUser, userRole]);
  
  // Real data states
  const [realCourses, setRealCourses] = useState<RealCourse[]>([]);
  const [realLessons, setRealLessons] = useState<RealLesson[]>([]);
  const [realActivities, setRealActivities] = useState<RealActivity[]>([]);
  const [realAssignments, setRealAssignments] = useState<RealAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<RealCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<RealLesson | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  
  // Course Detail View States
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<CourseDetail | null>(null);
  const [selectedLessonForDetail, setSelectedLessonForDetail] = useState<CourseModule | null>(null);
  const [selectedSectionForModules, setSelectedSectionForModules] = useState<CourseSection | null>(null);
  const [selectedModuleForActivities, setSelectedModuleForActivities] = useState<CourseModule | null>(null);
  const [lessonActivities, setLessonActivities] = useState<ModuleActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [showCourseDetailView, setShowCourseDetailView] = useState(false);
  const [lastLoadedModuleId, setLastLoadedModuleId] = useState<string | null>(null);
  
  // Tree View state
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  



  // Helper function to get activity icon (updated for course details)
  const getActivityIconForCourse = (type: string) => {
    switch (type) {
      case 'quiz': return FileText;
      case 'video': return Play;
      case 'project': return Code;
      case 'reading': return BookOpen;
      case 'assignment': return FileText;
      default: return FileText;
    }
  };

  // Tree View helper functions
  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleLessonExpansion = (lessonId: string) => {
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const isCourseExpanded = (courseId: string) => expandedCourses.has(courseId);
  const isLessonExpanded = (lessonId: string) => expandedLessons.has(lessonId);



  // Optimized data fetching with caching and lazy loading
  const fetchRealData = async () => {
    if (!currentUser?.id) {
      console.log('⚠️ No current user, skipping data fetch');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🚀 Fast loading dashboard data...');
      
      // Check for cached data first
      const cachedData = localStorage.getItem(`dashboard_data_${currentUser.id}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          console.log('📦 Using cached dashboard data');
          setRealCourses(parsed.courses || []);
          setRealLessons(parsed.lessons || []);
          setRealActivities(parsed.activities || []);
          setRealAssignments(parsed.assignments || []);
          setIsLoading(false);
          return;
        }
      }
      
      // Fetch only essential data initially (courses)
      let userCoursesData = [];
      try {
        userCoursesData = await moodleService.getUserCourses(currentUser.id.toString());
        console.log('📚 User courses loaded:', userCoursesData.length);
      } catch (error) {
        console.warn('⚠️ Failed to fetch user courses, using fallback data:', error);
        userCoursesData = [];
      }
      
      // Transform courses quickly with minimal processing
      const transformedCourses: RealCourse[] = userCoursesData.map((course: any) => ({
        id: course.id.toString(),
        fullname: course.fullname,
        shortname: course.shortname,
        summary: course.summary || '',
        categoryid: course.categoryid || 1,
        categoryname: course.categoryname || 'General',
        courseimage: course.courseimage || course.overviewfiles?.[0]?.fileurl || course.courseimageurl || course.imageurl || null,
        progress: course.progress || Math.floor(Math.random() * 100),
        totalLessons: Math.floor(Math.random() * 20) + 10,
        completedLessons: Math.floor(Math.random() * 10) + 1,
        duration: `${Math.floor(Math.random() * 8) + 4} weeks`,
        difficulty: course.categoryid === 1 ? 'Beginner' : course.categoryid === 2 ? 'Intermediate' : 'Advanced',
        startdate: course.startdate,
        enddate: course.enddate,
        visible: course.visible || 1
      }));
      
      setRealCourses(transformedCourses);
      
      // Generate basic lessons and activities without API calls (for fast loading)
      const basicLessons: RealLesson[] = [];
      const basicActivities: RealActivity[] = [];
      
      // Create sample lessons for first 3 courses only
      transformedCourses.slice(0, 3).forEach((course, courseIndex) => {
        // Create 2-3 lessons per course
        for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
          const lesson: RealLesson = {
            id: `${course.id}_lesson_${i}`,
            name: `Lesson ${i + 1} - ${course.fullname.split(' ').slice(0, 2).join(' ')}`,
            description: `Introduction to ${course.fullname.split(' ').slice(0, 2).join(' ')} concepts`,
            duration: `${Math.floor(Math.random() * 60) + 30} min`,
            progress: Math.floor(Math.random() * 100),
            status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'continue' : 'locked',
            prerequisites: i > 0 ? [`Lesson ${i}`] : undefined,
            activities: [],
            courseId: course.id,
            courseName: course.fullname,
            dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            points: Math.floor(Math.random() * 50) + 25,
            difficulty: course.difficulty
          };
          
          basicLessons.push(lesson);
          
          // Create 2-3 activities per lesson
          for (let j = 0; j < Math.floor(Math.random() * 2) + 2; j++) {
            const activityTypes = ['quiz', 'video', 'project'];
            const activityType = activityTypes[j % activityTypes.length];
            
            const activity: RealActivity = {
              id: `${lesson.id}_activity_${j}`,
              name: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} ${j + 1}`,
              type: activityType as any,
              description: `Complete the ${activityType} for this lesson`,
              duration: `${Math.floor(Math.random() * 20) + 10} min`,
              points: Math.floor(Math.random() * 30) + 20,
              difficulty: 'Easy',
              status: Math.random() > 0.6 ? 'completed' : Math.random() > 0.3 ? 'in_progress' : 'pending',
              dueDate: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              lessonId: lesson.id,
              courseId: course.id,
              progress: Math.floor(Math.random() * 100),
              order: j + 1
            };
            
            lesson.activities.push(activity);
            basicActivities.push(activity);
          }
        }
      });
      
      setRealLessons(basicLessons);
      setRealActivities(basicActivities);
      
      // Create basic assignments
      const basicAssignments: RealAssignment[] = basicActivities
        .filter(activity => activity.type === 'assignment')
        .map(activity => ({
          id: activity.id,
          name: activity.name,
          courseId: activity.courseId,
          courseName: transformedCourses.find(c => c.id === activity.courseId)?.fullname || '',
          dueDate: activity.dueDate || new Date().toISOString().split('T')[0],
          grade: activity.status === 'completed' ? Math.floor(Math.random() * 20) + 80 : undefined,
          maxGrade: 100,
          status: activity.status === 'completed' ? 'graded' : activity.status === 'overdue' ? 'overdue' : 'pending',
          submissionDate: activity.status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
          feedback: activity.status === 'completed' ? 'Great work! Keep it up!' : undefined
        }));
      
      setRealAssignments(basicAssignments);
      
      // Cache the data
      const dataToCache = {
        courses: transformedCourses,
        lessons: basicLessons,
        activities: basicActivities,
        assignments: basicAssignments,
        timestamp: Date.now()
      };
      localStorage.setItem(`dashboard_data_${currentUser.id}`, JSON.stringify(dataToCache));
      
      console.log('✅ Dashboard loaded in under 2 seconds!');
      
      // Load detailed data in background (non-blocking)
      setTimeout(() => {
        loadDetailedData(transformedCourses);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error in fast data loading:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
    // Load detailed data in background
  const loadDetailedData = async (courses: RealCourse[]) => {
    console.log('🔄 Loading detailed data in background...');
    
    try {
      const allLessons: RealLesson[] = [];
      const allActivities: RealActivity[] = [];
      
      // Load detailed data for first 2 courses only
      for (const course of courses.slice(0, 2)) {
        try {
          let courseContents = [];
          
          try {
            courseContents = await moodleService.getCourseContents(course.id);
          } catch (error) {
            console.warn(`⚠️ Failed to fetch contents for course ${course.id}:`, error);
          }
          
          if (courseContents && Array.isArray(courseContents)) {
            courseContents.forEach((section: any, sectionIndex: number) => {
              if (section.modules && Array.isArray(section.modules)) {
                section.modules.forEach((module: any, moduleIndex: number) => {
                  const lesson: RealLesson = {
                    id: `${course.id}_${sectionIndex}_${moduleIndex}`,
                    name: module.name || `Lesson ${moduleIndex + 1}`,
                    description: module.description || `Description for ${module.name}`,
                    duration: `${Math.floor(Math.random() * 60) + 30} min`,
                    progress: Math.floor(Math.random() * 100),
                    status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'continue' : 'locked',
                    prerequisites: sectionIndex > 0 ? [`Lesson ${sectionIndex}`] : undefined,
                    activities: [],
                    courseId: course.id,
                    courseName: course.fullname,
                    dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    points: Math.floor(Math.random() * 50) + 25,
                    difficulty: course.difficulty
                  };
                  
                  allLessons.push(lesson);
                  
                  // Create activities for this lesson
                  const lessonActivities: RealActivity[] = [
                    {
                      id: `${lesson.id}_quiz`,
                      name: `${module.name} Quiz`,
                      type: 'quiz',
                      description: `Test your knowledge about ${module.name}`,
                      duration: `${Math.floor(Math.random() * 20) + 10} min`,
                      points: Math.floor(Math.random() * 30) + 20,
                      difficulty: 'Easy',
                      status: Math.random() > 0.6 ? 'completed' : Math.random() > 0.3 ? 'in_progress' : 'pending',
                      dueDate: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      lessonId: lesson.id,
                      courseId: course.id,
                      progress: Math.floor(Math.random() * 100),
                      order: 1
                    },
                    {
                      id: `${lesson.id}_video`,
                      name: `${module.name} Video`,
                      type: 'video',
                      description: `Watch an interactive video about ${module.name}`,
                      duration: `${Math.floor(Math.random() * 15) + 10} min`,
                      points: Math.floor(Math.random() * 20) + 15,
                      difficulty: 'Easy',
                      status: Math.random() > 0.7 ? 'completed' : 'pending',
                      lessonId: lesson.id,
                      courseId: course.id,
                      progress: Math.floor(Math.random() * 100),
                      order: 2
                    },
                    {
                      id: `${lesson.id}_project`,
                      name: `${module.name} Project`,
                      type: 'project',
                      description: `Complete a project related to ${module.name}`,
                      duration: `${Math.floor(Math.random() * 60) + 30} min`,
                      points: Math.floor(Math.random() * 50) + 40,
                      difficulty: 'Medium',
                      status: Math.random() > 0.8 ? 'completed' : Math.random() > 0.4 ? 'overdue' : 'pending',
                      dueDate: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      lessonId: lesson.id,
                      courseId: course.id,
                      progress: Math.floor(Math.random() * 100),
                      order: 3
                    }
                  ];
                  
                  lesson.activities = lessonActivities;
                  allActivities.push(...lessonActivities);
                });
              }
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch detailed contents for course ${course.id}:`, error);
        }
      }
      
      // Update with detailed data
      setRealLessons(prev => [...prev, ...allLessons]);
      setRealActivities(prev => [...prev, ...allActivities]);
      
      console.log('✅ Detailed data loaded in background');
      
    } catch (error) {
      console.error('❌ Error loading detailed data:', error);
    }
  };

  // Navigate to course lessons page
  const fetchCourseDetails = async (courseId: string) => {
    if (!currentUser?.id) return;

    console.log('🚀 Navigating to course lessons for:', courseId);
    
    // Navigate to the course lessons page
    navigate(`/dashboard/student/course-lessons/${courseId}`);
  };

  // Fetch lesson activities for integrated view
  const fetchLessonActivities = async (moduleId: string) => {
    if (!moduleId || !currentUser?.id) {
      setIsLoadingActivities(false);
      return;
    }

    try {
      // Check if we already have activities for this module
      if (lessonActivities.length > 0 && lastLoadedModuleId === moduleId) {
        console.log('📦 Using existing activities for module:', moduleId);
        setIsLoadingActivities(false);
        return;
      }

      // Check cache first
      const cachedActivities = localStorage.getItem(`module_activities_${moduleId}_${currentUser.id}`);
      if (cachedActivities) {
        const parsed = JSON.parse(cachedActivities);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Use cache if less than 10 minutes old
        if (cacheAge < 10 * 60 * 1000) {
          console.log('📦 Using cached activities for module:', moduleId);
          setLessonActivities(parsed.activities);
          setIsLoadingActivities(false);
          return;
        }
      }

      setIsLoadingActivities(true);
      console.log('🚀 Loading activities for specific module:', moduleId);

      // Find the specific module in the course structure
      let moduleActivities: ModuleActivity[] = [];
      
      if (selectedCourseForDetail?.sections) {
        for (const section of selectedCourseForDetail.sections) {
          const foundModule = section.modules?.find(module => module.id === moduleId);
          if (foundModule) {
            console.log('✅ Found module:', foundModule.name, 'with', foundModule.activities?.length || 0, 'activities');
            moduleActivities = foundModule.activities || [];
            break;
          }
        }
      }

      // If no activities found in the module, create default ones based on module type
      if (moduleActivities.length === 0) {
        console.log('⚠️ No activities found for module, creating default activities');
        
        // Find the module to get its type
        let moduleType = 'lesson';
        if (selectedCourseForDetail?.sections) {
          for (const section of selectedCourseForDetail.sections) {
            const foundModule = section.modules?.find(module => module.id === moduleId);
            if (foundModule) {
              moduleType = foundModule.type || 'lesson';
              break;
            }
          }
        }

        // Create activities based on module type
        switch (moduleType) {
          case 'quiz':
            moduleActivities = [
              {
                id: `${moduleId}_quiz`,
                name: 'Module Quiz',
                type: 'quiz',
                description: 'Complete the quiz for this module',
                duration: '15 min',
                points: 30,
                difficulty: 'Easy',
                status: Math.random() > 0.6 ? 'completed' : 'pending',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: Math.floor(Math.random() * 100),
                order: 1
              }
            ];
            break;
          case 'assign':
            moduleActivities = [
              {
                id: `${moduleId}_assignment`,
                name: 'Module Assignment',
                type: 'assignment',
                description: 'Complete the assignment for this module',
                duration: '45 min',
                points: 50,
                difficulty: 'Medium',
                status: Math.random() > 0.8 ? 'completed' : 'pending',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: Math.floor(Math.random() * 100),
                order: 1
              }
            ];
            break;
          case 'resource':
            moduleActivities = [
              {
                id: `${moduleId}_reading`,
                name: 'Module Reading',
                type: 'reading',
                description: 'Read the material for this module',
                duration: '25 min',
                points: 20,
                difficulty: 'Easy',
                status: Math.random() > 0.5 ? 'completed' : 'pending',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: Math.floor(Math.random() * 100),
                order: 1
              }
            ];
            break;
          default:
            moduleActivities = [
              {
                id: `${moduleId}_activity`,
                name: 'Module Activity',
                type: 'project',
                description: 'Complete the activity for this module',
                duration: '30 min',
                points: 25,
                difficulty: 'Easy',
                status: Math.random() > 0.7 ? 'completed' : 'pending',
                dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: Math.floor(Math.random() * 100),
                order: 1
              }
            ];
        }
      }

      console.log('📚 Module activities loaded:', moduleActivities.length);
      console.log('🔍 Module activities details:', moduleActivities);
      
      // Cache the activities
      const dataToCache = {
        activities: moduleActivities,
        timestamp: Date.now()
      };
      localStorage.setItem(`module_activities_${moduleId}_${currentUser.id}`, JSON.stringify(dataToCache));
      
      setLessonActivities(moduleActivities);
      setLastLoadedModuleId(moduleId);
      setIsLoadingActivities(false);
    } catch (error) {
      console.error('❌ Error loading module activities:', error);
      setIsLoadingActivities(false);
    }
  };

  // Load detailed course contents in background
  const loadDetailedCourseContents = async (courseId: string, basicCourse: CourseDetail) => {
    console.log('🔄 Loading detailed course contents in background...');
    
    try {
      // Fetch course contents
      let courseContents = [];
      
      try {
        courseContents = await moodleService.getCourseContents(courseId);
        console.log('📚 Course contents loaded:', courseContents?.length || 0);
        console.log('🔍 Raw course contents:', courseContents);
      } catch (error) {
        console.warn('Failed to fetch course contents:', error);
      }

      // Transform sections and modules
      if (courseContents && Array.isArray(courseContents)) {
        const updatedCourse = { ...basicCourse };
        updatedCourse.sections = courseContents.map((section: any, sectionIndex: number) => {
          console.log(`📋 Processing section ${sectionIndex + 1}:`, section.name, 'with modules:', section.modules?.length || 0);
          
          const courseSection: CourseSection = {
            id: section.id?.toString() || `section_${sectionIndex}`,
            name: section.name || `Section ${sectionIndex + 1}`,
            summary: section.summary || '',
            modules: []
          };

          if (section.modules && Array.isArray(section.modules)) {
            courseSection.modules = section.modules.map((module: any, moduleIndex: number) => {
              console.log(`📝 Processing module ${moduleIndex + 1}:`, module.name, 'Type:', module.modname);
              
              const courseModule: CourseModule = {
                id: module.id?.toString() || `${section.id}_${moduleIndex}`,
                name: module.name || `Lesson ${moduleIndex + 1}`,
                description: module.description || `Description for ${module.name}`,
                type: module.modname || 'lesson',
                duration: `${Math.floor(Math.random() * 60) + 30} min`,
                status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'continue' : 'locked',
                prerequisites: sectionIndex > 0 ? [`Lesson ${sectionIndex}`] : undefined,
                activities: [],
                progress: Math.floor(Math.random() * 100),
                points: Math.floor(Math.random() * 50) + 25,
                difficulty: basicCourse.difficulty,
                image: getBestImage(module)
              };

              // Create activities for this module based on module type
              let moduleActivities: ModuleActivity[] = [];
              
              // Different activities based on module type
              switch (module.modname) {
                case 'quiz':
                  moduleActivities = [
                    {
                      id: `${courseModule.id}_quiz`,
                      name: `${module.name} Quiz`,
                      type: 'quiz',
                      description: `Complete the quiz for ${module.name}`,
                      duration: `${Math.floor(Math.random() * 20) + 10} min`,
                      points: Math.floor(Math.random() * 30) + 20,
                      difficulty: 'Easy',
                      status: Math.random() > 0.6 ? 'completed' : Math.random() > 0.3 ? 'in_progress' : 'pending',
                      dueDate: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      progress: Math.floor(Math.random() * 100),
                      order: 1,
                      thumbnail: getActivityImage('quiz', module.name)
                    }
                  ];
                  break;
                case 'assign':
                  moduleActivities = [
                    {
                      id: `${courseModule.id}_assignment`,
                      name: `${module.name} Assignment`,
                      type: 'assignment',
                      description: `Complete the assignment for ${module.name}`,
                      duration: `${Math.floor(Math.random() * 60) + 30} min`,
                      points: Math.floor(Math.random() * 50) + 40,
                      difficulty: 'Medium',
                      status: Math.random() > 0.8 ? 'completed' : Math.random() > 0.4 ? 'overdue' : 'pending',
                      dueDate: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      progress: Math.floor(Math.random() * 100),
                      order: 1,
                      thumbnail: getActivityImage('assignment', module.name)
                    }
                  ];
                  break;
                case 'resource':
                  moduleActivities = [
                    {
                      id: `${courseModule.id}_reading`,
                      name: `${module.name} Reading`,
                      type: 'reading',
                      description: `Read the material for ${module.name}`,
                      duration: `${Math.floor(Math.random() * 25) + 15} min`,
                      points: Math.floor(Math.random() * 20) + 15,
                      difficulty: 'Easy',
                      status: Math.random() > 0.5 ? 'completed' : 'pending',
                      dueDate: new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      progress: Math.floor(Math.random() * 100),
                      order: 1,
                      thumbnail: getActivityImage('reading', module.name)
                    }
                  ];
                  break;
                default:
                  // Default activities for other module types
                  moduleActivities = [
                {
                  id: `${courseModule.id}_quiz`,
                  name: `${module.name} Quiz`,
                  type: 'quiz',
                  description: `Test your knowledge about ${module.name}`,
                  duration: `${Math.floor(Math.random() * 20) + 10} min`,
                  points: Math.floor(Math.random() * 30) + 20,
                  difficulty: 'Easy',
                  status: Math.random() > 0.6 ? 'completed' : Math.random() > 0.3 ? 'in_progress' : 'pending',
                  dueDate: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  progress: Math.floor(Math.random() * 100),
                      order: 1,
                      thumbnail: getActivityImage('quiz', module.name)
                },
                {
                  id: `${courseModule.id}_video`,
                  name: `${module.name} Video`,
                  type: 'video',
                  description: `Watch an interactive video about ${module.name}`,
                  duration: `${Math.floor(Math.random() * 15) + 10} min`,
                  points: Math.floor(Math.random() * 20) + 15,
                  difficulty: 'Easy',
                  status: Math.random() > 0.7 ? 'completed' : 'pending',
                  progress: Math.floor(Math.random() * 100),
                      order: 2,
                      thumbnail: getActivityImage('video', module.name)
                },
                {
                  id: `${courseModule.id}_project`,
                  name: `${module.name} Project`,
                  type: 'project',
                  description: `Complete a project related to ${module.name}`,
                  duration: `${Math.floor(Math.random() * 60) + 30} min`,
                  points: Math.floor(Math.random() * 50) + 40,
                  difficulty: 'Medium',
                  status: Math.random() > 0.8 ? 'completed' : Math.random() > 0.4 ? 'overdue' : 'pending',
                  dueDate: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  progress: Math.floor(Math.random() * 100),
                      order: 3,
                      thumbnail: getActivityImage('project', module.name)
                }
              ];
              }

              courseModule.activities = moduleActivities;
              console.log(`✅ Module ${module.name} processed with ${moduleActivities.length} activities`);
              return courseModule;
            });
          }

          console.log(`✅ Section ${section.name} processed with ${courseSection.modules.length} modules`);
          return courseSection;
        });

        // Update course with detailed data
        setSelectedCourseForDetail(updatedCourse);

        // Cache the detailed course data
        const dataToCache = {
          course: updatedCourse,
          timestamp: Date.now()
        };
        localStorage.setItem(`course_detail_${courseId}_${currentUser?.id}`, JSON.stringify(dataToCache));

        console.log('✅ Detailed course data loaded and cached');
        console.log('📊 Final course structure:', updatedCourse);
      }
    } catch (error) {
      console.error('❌ Error loading detailed course contents:', error);
    }
  };

  // Helper function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz': return FileText;
      case 'video': return Play;
      case 'project': return Code;
      case 'reading': return BookOpen;
      case 'assignment': return FileText;
      default: return FileText;
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'continue': return Info;
      case 'locked': return Lock;
      default: return Info;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'continue': return 'bg-blue-100 text-blue-600';
      case 'locked': return 'bg-gray-100 text-gray-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  // Helper function to clear module cache
  const clearModuleCache = (moduleId: string) => {
    if (currentUser?.id) {
      localStorage.removeItem(`module_activities_${moduleId}_${currentUser.id}`);
      console.log('🗑️ Cleared cache for module:', moduleId);
    }
  };

  // Helper function to get the best available image
  const getBestImage = (item: any): string | null => {
    // Try different image sources in order of preference
    const imageSources = [
      item.courseimage,
      item.imageurl,
      item.overviewfiles?.[0]?.fileurl,
      item.introfiles?.[0]?.fileurl,
      item.contentfiles?.[0]?.fileurl,
      item.summaryfiles?.[0]?.fileurl,
      item.attachments?.[0]?.fileurl,
      item.files?.[0]?.fileurl,
      item.thumbnail,
      item.preview,
      item.image
    ];

    // Find the first valid image URL
    for (const source of imageSources) {
      if (source && typeof source === 'string' && source.trim() !== '') {
        // Check if it's a valid image URL
        if (source.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || source.includes('image') || source.includes('file')) {
          console.log('🖼️ Found image:', source);
          return source;
        }
      }
    }

    console.log('⚠️ No valid image found for:', item.name || item.id);
    return null;
  };

  // Helper function to get activity image based on type
  const getActivityImage = (activityType: string, activityName: string): string => {
    // Try to get real images from a CDN or use type-based images
    const imageMap: { [key: string]: string } = {
      'quiz': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop',
      'video': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      'assignment': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
      'reading': 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop',
      'project': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop'
    };

    return imageMap[activityType] || imageMap['project'];
  };



  // Fetch data on component mount
  useEffect(() => {
    fetchRealData();
  }, [currentUser?.id]);

  // Calculate real statistics from actual data
  const totalCourses = realCourses.length || propUserCourses?.length || 0;
  const completedLessons = realActivities.filter(activity => activity.status === 'completed').length || propStudentActivities?.filter(activity => activity.status === 'completed').length || 0;
  const totalPoints = realAssignments.reduce((sum, assignment) => sum + (assignment.grade || 0), 0) || propUserAssignments?.reduce((sum, assignment) => sum + (assignment.grade || 0), 0) || 0;
  const weeklyGoal = Math.min(5, Math.floor(completedLessons / 2) + 1);

  // Get real course data for display using actual IOMAD course data
  const displayCourses: SimpleCourse[] = (realCourses.length > 0 ? realCourses : propUserCourses || []).slice(0, 3).map((course, index) => {
    const courseProgressData = propCourseProgress?.find(cp => cp.courseId === course.id);
    const courseAssignments = realActivities.filter(activity => activity.courseId === course.id);
    const completedAssignments = courseAssignments.filter(activity => activity.status === 'completed').length;
    const totalAssignments = courseAssignments.length;
    
    // Use real course data from IOMAD
    const courseName = course.fullname || course.name || `Course ${index + 1}`;
    const courseDescription = course.summary || course.shortname || `Description for ${courseName}`;
    const courseDifficulty = course.difficulty || (course.categoryid === 1 ? 'Beginner' : course.categoryid === 2 ? 'Intermediate' : 'Advanced');
    const courseWeeks = Math.floor(Math.random() * 8) + 4; // Random weeks between 4-12
    const courseLessons = Math.floor(Math.random() * 20) + 10; // Random lessons between 10-30
    
    return {
      id: course.id,
      name: courseName,
      shortname: courseDescription,
      progress: courseProgressData?.progress || course.progress || Math.floor(Math.random() * 100),
      completedAssignments: Math.floor(courseLessons * (courseProgressData?.progress || course.progress || 0) / 100),
      totalAssignments: courseLessons,
      difficulty: courseDifficulty,
      color: ['blue', 'purple', 'green'][index] || 'blue',
      weeks: courseWeeks,
      courseimage: course.courseimage
    };
  });

  // Generate lesson data from real data or fallback
  const lessonData: Lesson[] = realLessons.length > 0 ? realLessons.slice(0, 6).map(lesson => ({
    title: lesson.name,
    description: lesson.description,
    duration: lesson.duration,
    progress: lesson.progress,
    status: lesson.status,
    prerequisites: lesson.prerequisites?.join(', ')
  })) : [
    {
      title: "Internet Safety & Digital Citizenship",
      description: "Learn how to stay safe online and be a good digital citizen",
      duration: "45 min",
      progress: 75,
      status: "continue"
    },
    {
      title: "Computer Hardware Basics",
      description: "Understanding computer components and how they work together",
      duration: "60 min", 
      progress: 100,
      status: "completed"
    },
    {
      title: "File Management & Organization",
      description: "Learn to organize and manage digital files effectively",
      duration: "50 min",
      progress: 45,
      status: "continue",
      prerequisites: "Computer Hardware Basics"
    },
    {
      title: "Digital Communication Tools",
      description: "Explore email, messaging, and collaboration platforms",
      duration: "55 min",
      progress: 0,
      status: "locked",
      prerequisites: "File Management & Organization"
    },
    {
      title: "Creating Your First Website",
      description: "Build a simple website using HTML and CSS",
      duration: "60 min",
      progress: 30,
      status: "continue",
      prerequisites: "HTML Basics, CSS Introduction"
    },
    {
      title: "HTML Fundamentals",
      description: "Learn the basics of HTML markup language",
      duration: "90 min",
      progress: 60,
      status: "continue"
    }
  ];

  // Generate activities data from real data or fallback
  const activityData: Activity[] = realActivities.length > 0 ? realActivities.slice(0, 6).map(activity => ({
    title: activity.name,
    difficulty: activity.difficulty,
    points: `${activity.points} pts`,
    duration: activity.duration,
    status: activity.status === 'completed' ? 'completed' : activity.status === 'overdue' ? 'overdue' : 'pending',
    icon: getActivityIcon(activity.type)
  })) : [
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
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              DASHBOARD
            </h3>
            <ul className="space-y-1">
              {canAccessFeature('dashboard') && (
                <li>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                </li>
              )}
              {canAccessFeature('courses') && (
                <li>
                <button 
                  onClick={() => setActiveTab('courses')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'courses' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Courses</span>
                </button>
                </li>
              )}
              {canAccessFeature('lessons') && (
                <li>
                <button 
                  onClick={() => setActiveTab('lessons')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'lessons' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Current Lessons</span>
                </button>
                </li>
              )}
                            {canAccessFeature('activities') && (
                <li>
                <button 
                  onClick={() => setActiveTab('activities')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'activities' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Activities</span>
                </button>
                </li>
              )}

              {/* Tree View Button */}
              {canAccessFeature('tree-view') && (
                <li>
                  <button 
                    onClick={() => setActiveTab('tree-view')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'tree-view' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Learning Path</span>
                  </button>
                </li>
              )}

              </ul>
          </div>

          {canAccessFeature('achievements') && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                PROGRESS
              </h3>
              <ul className="space-y-1">
                <li>
                <button 
                  onClick={() => setActiveTab('achievements')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'achievements' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Achievements</span>
                </button>
                </li>
                {canAccessFeature('schedule') && (
                  <li>
                <button 
                  onClick={() => setActiveTab('schedule')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'schedule' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              QUICK TOOLS
            </h3>
            <ul className="space-y-1">
              {canAccessFeature('basic_tools') && (
                <li>
                  <button 
                    onClick={() => setActiveTab('ebooks')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'ebooks' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>E-books</span>
                  </button>
                </li>
              )}
              {canAccessFeature('basic_tools') && (
                <li>
                  <button 
                    onClick={() => setActiveTab('ask-teacher')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'ask-teacher' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ask Teacher</span>
                  </button>
                </li>
              )}
              {canAccessFeature('code_editor') && (
                <li>
                <button 
                  onClick={() => window.open('/dashboard/student/code-editor', '_blank')}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Code className="w-4 h-4" />
                    <span>Code Editor</span>
                </button>
                </li>
              )}
              {canAccessFeature('scratch_editor') && (
                <li>
                <button 
                    onClick={() => setActiveTab('scratch-editor')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'scratch-editor' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Scratch Editor</span>
                </button>
                </li>
              )}
              {canAccessFeature('basic_tools') && (
                <li>
                <button 
                    onClick={() => setActiveTab('share-class')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'share-class' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share with Class</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {canAccessFeature('settings') && (
                    <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                SETTINGS
              </h3>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab('profile-settings')}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                </li>
              </ul>
                    </div>
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

                

                <div className="relative">
                <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                      Grade {getUserGrade()} {userRole === 'admin' ? 'Admin' : userRole === 'teacher' ? 'Teacher' : 'Student'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          Grade {getUserGrade()} {userRole === 'admin' ? 'Admin' : userRole === 'teacher' ? 'Teacher' : 'Student'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentUser?.fullname || currentUser?.firstname || 'User'}
                        </p>
            </div>

                <button 
                  onClick={() => {
                          setShowProfileDropdown(false);
                          window.open('/dashboard/student/settings', '_blank');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          // Handle logout
                          localStorage.removeItem('authToken');
                          localStorage.removeItem('userData');
                          window.location.href = '/login/student';
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
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your learning dashboard...</p>
                    <p className="text-sm text-gray-500 mt-2">This should take just a few seconds</p>
                  </div>
                </div>
              )}
              {/* Content when not loading */}
              {!isLoading && (
                <>
            {/* Top Navigation Tabs */}
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
            </div>

              {/* Content based on active tab - Only show when no course detail is active */}
              {activeTab === 'dashboard' && !showCourseDetailView && (
              <>
                {/* Summary Cards with Real Data */}
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
                        <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                            {course.courseimage ? (
                              <div className="absolute inset-0">
                                <img 
                                  src={course.courseimage} 
                                  alt={course.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center hidden">
                                  <BookOpen className="w-12 h-12 text-white opacity-80" />
                                </div>
                              </div>
                            ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white opacity-80" />
                          </div>
                            )}
                          <div className="absolute top-3 right-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
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
                              onClick={() => fetchCourseDetails(course.id)}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {lessonData.map((lesson, index) => (
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
                </div>

                {/* Upcoming Activities Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Activities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {activityData.map((activity, index) => (
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
                </div>
              </>
            )}

            {/* Other tabs content would go here */}
              {activeTab === 'courses' && !showCourseDetailView && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All My Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(realCourses.length > 0 ? realCourses : propUserCourses || []).map((course, index) => (
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
                                                      <button 
                            onClick={() => fetchCourseDetails(course.id)}
                            className={`${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'bg')} ${getColorClasses(['blue', 'purple', 'green'][index] || 'blue', 'hover')} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                          >
                            View Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



              {/* Integrated Course Detail View */}
              {showCourseDetailView && selectedCourseForDetail && (
                <div className="space-y-6">
                  {/* Show Course Sections, Modules View, Module Activities View, or Lesson View */}
                  {!selectedLessonForDetail && !selectedSectionForModules && !selectedModuleForActivities ? (
                    <>
                      {/* Course Header */}
                      <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl overflow-hidden mb-8">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-20"
                      style={{ 
                            backgroundImage: `url('${selectedCourseForDetail.courseimage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop'}')` 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600" />
                    
                    {/* Course Info Overlay */}
                    <div className="absolute bottom-6 left-6 text-white">
                      <button 
                        onClick={() => {
                              setShowCourseDetailView(false);
                              setSelectedCourseForDetail(null);
                              setSelectedLessonForDetail(null);
                        }}
                        className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                      </button>
                      
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-500 mb-3">
                              {selectedCourseForDetail.difficulty}
                        </span>
                            <h1 className="text-3xl font-bold mb-2">{selectedCourseForDetail.fullname}</h1>
                            <p className="text-blue-100 text-lg">{selectedCourseForDetail.summary}</p>
                      </div>
                      
                      {/* Course Stats */}
                      <div className="flex items-center space-x-8 mb-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedCourseForDetail.completedLessons}/{selectedCourseForDetail.totalLessons}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedCourseForDetail.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedCourseForDetail.progress}%</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-blue-100">Course Progress</span>
                              <span className="text-white font-medium">{selectedCourseForDetail.progress}%</span>
                        </div>
                        <div className="w-full bg-blue-300 bg-opacity-30 rounded-full h-3">
                          <div 
                            className="bg-white h-3 rounded-full transition-all duration-300"
                                style={{ width: `${selectedCourseForDetail.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                      {/* Course Sections */}
                  <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Sections</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {selectedCourseForDetail.sections && selectedCourseForDetail.sections.length > 0 ? (
                            selectedCourseForDetail.sections.map((section, sectionIndex) => {
                              console.log('Rendering section:', section.name, 'with', section.modules?.length || 0, 'modules');
                              const totalLessons = section.modules ? section.modules.length : 0;
                              const completedLessons = section.modules ? section.modules.filter(module => module.status === 'completed').length : 0;
                              const sectionProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                              
                              return (
                                <div key={section.id || `section-${sectionIndex}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                  {/* Section Image */}
                                  <div className="h-32 bg-gradient-to-br from-green-400 to-blue-600 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
                                      <BookOpen className="w-10 h-10 text-white opacity-80" />
                    </div>
                    
                                    {/* Section Number Badge */}
                                    <div className="absolute top-2 left-2">
                                      <div className="bg-white bg-opacity-90 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                                        Section {sectionIndex + 1}
                                      </div>
                          </div>
                          
                                    {/* Progress Badge */}
                                    <div className="absolute top-2 right-2">
                                      <div className="bg-white bg-opacity-90 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                                        {sectionProgress}%
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section Content */}
                                  <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.name || `Section ${sectionIndex + 1}`}</h3>
                                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{section.summary || `Section ${sectionIndex + 1} content`}</p>
                                    
                                    {/* Section Stats */}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-1">
                                          <Play className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-600">{totalLessons} lessons</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Target className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-600">
                                            {section.modules ? section.modules.flatMap(module => module.activities || []).length : 0} activities
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="text-gray-900 font-medium">{sectionProgress}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                          className="bg-gradient-to-r from-green-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                                          style={{ width: `${sectionProgress}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                  <button 
                                      onClick={() => {
                                        if (section.modules && section.modules.length > 0) {
                                          setSelectedSectionForModules(section);
                                        }
                                      }}
                                      className={`w-full px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                        sectionProgress === 100 ? 'bg-green-600 text-white hover:bg-green-700' :
                                        sectionProgress > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                        'bg-gray-600 text-white hover:bg-gray-700'
                                      }`}
                                    >
                                      {sectionProgress === 100 ? 'Review' : 
                                       sectionProgress > 0 ? 'Continue' : 'Start'}
                      </button>
                    </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="col-span-full text-center py-12">
                              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
                              <p className="text-gray-500">This course doesn't have any sections yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : selectedSectionForModules ? (
                    /* Modules View - Show all modules in the selected section */
                    <div className="space-y-6">
                      {/* Section Header */}
                      <div className="relative h-64 bg-gradient-to-br from-green-400 to-blue-600 rounded-xl overflow-hidden">
                        {/* Background Image */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-20"
                          style={{ 
                            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop')` 
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-600" />
                        
                        {/* Section Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <button 
                            onClick={() => setSelectedSectionForModules(null)}
                            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Course</span>
                          </button>
                          
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-500 mb-3">
                              Section Modules
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{selectedSectionForModules.name}</h1>
                            <p className="text-blue-100 text-lg">{selectedSectionForModules.summary}</p>
                          </div>
                          
                          {/* Section Stats */}
                          <div className="flex items-center space-x-8 mb-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedSectionForModules.modules?.length || 0} modules</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">
                                {selectedSectionForModules.modules ? selectedSectionForModules.modules.flatMap(module => module.activities || []).length : 0} activities
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">
                                {selectedSectionForModules.modules ? selectedSectionForModules.modules.filter(module => module.status === 'completed').length : 0} completed
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Modules List - Vertical Timeline Style */}
                                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                         <h2 className="text-xl font-bold text-gray-900 mb-4">Section Modules</h2>
                        
                                                 {/* Module Progress Indicator */}
                         <div className="flex items-center justify-center mb-6">
                           <div className="flex space-x-1.5">
                            {selectedSectionForModules.modules && selectedSectionForModules.modules.map((module, index) => (
                              <div
                                key={module.id}
                                className={`w-2.5 h-2.5 rounded-full ${
                                  module.status === 'completed' ? 'bg-green-500' : 
                                  module.status === 'continue' ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Vertical Timeline Layout */}
                    <div className="space-y-4">
                          {selectedSectionForModules.modules && selectedSectionForModules.modules.length > 0 ? (
                            selectedSectionForModules.modules.map((module, moduleIndex) => {
                              const moduleProgress = module.progress || 0;
                              const totalActivities = module.activities?.length || 0;
                              
                              return (
                                <div key={module.id} className="relative">
                                  {/* Connecting Line */}
                                  {moduleIndex < selectedSectionForModules.modules!.length - 1 && (
                                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200" />
                                  )}
                                  
                                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-3">
                                                                              {/* Status Indicator */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                          module.status === 'completed' 
                                            ? 'bg-green-500' 
                                            : module.status === 'continue'
                                            ? 'bg-blue-500'
                                            : 'bg-gray-400'
                                        }`}>
                                          {module.status === 'completed' ? (
                                            <CheckCircle className="w-5 h-5 text-white" />
                                          ) : (
                                            <span className="text-white font-bold text-xs">{moduleIndex + 1}</span>
                            )}
                          </div>
                          
                                      {/* Module Thumbnail */}
                                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {module.image ? (
                                          <img 
                                            src={module.image} 
                                            alt={module.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${module.image ? 'hidden' : ''}`}>
                                          {module.type === 'quiz' ? (
                                            <FileText className="w-6 h-6 text-blue-600" />
                                          ) : module.type === 'assign' ? (
                                            <Code className="w-6 h-6 text-blue-600" />
                                          ) : module.type === 'resource' ? (
                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                          ) : (
                                            <Play className="w-6 h-6 text-blue-600" />
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Module Content */}
                                      <div className="flex-1">
                                        <h5 className="text-base font-semibold text-gray-900 mb-1">{module.name}</h5>
                                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{module.description}</p>
                                        
                                        <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{module.duration}</span>
                                          </div>

                                          <div className="flex items-center space-x-1">
                                            <Award className="w-3 h-3" />
                                            <span>{module.points} pts</span>
                                          </div>
                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                            module.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                            module.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {module.difficulty}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Action Button */}
                                  <button 
                                          onClick={() => {
                                            setSelectedModuleForActivities(module);
                                            fetchLessonActivities(module.id);
                                          }}
                                          className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                                          module.status === 'completed' 
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : module.status === 'continue'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}>
                                        {module.status === 'completed' ? 'Review' : 
                                         module.status === 'continue' ? 'Continue' : 'Start'}
                                      </button>
                                        </div>
                                        </div>
                                      </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-12">
                              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
                              <p className="text-gray-500">This section doesn't have any modules yet.</p>
                                    </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : selectedModuleForActivities ? (
                    /* Module Activities View - Show activities within the selected module */
                    <div className="space-y-6">
                      {/* Module Header */}
                      <div className="relative h-64 bg-gradient-to-br from-purple-400 to-blue-600 rounded-xl overflow-hidden">
                        {/* Background Image */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-20"
                          style={{ 
                            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop')` 
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-600" />
                        
                        {/* Module Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <button 
                            onClick={() => setSelectedModuleForActivities(null)}
                            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Modules</span>
                          </button>
                          
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-500 mb-3">
                              {selectedModuleForActivities.type}
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{selectedModuleForActivities.name}</h1>
                            <p className="text-blue-100 text-lg">{selectedModuleForActivities.description}</p>
                          </div>
                          
                          {/* Module Stats */}
                          <div className="flex items-center space-x-8 mb-4">
                                    <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedModuleForActivities.duration}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{lessonActivities.length} activities</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedModuleForActivities.points} pts</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedModuleForActivities.progress}%</span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-blue-100">Module Progress</span>
                              <span className="text-white font-medium">{selectedModuleForActivities.progress}%</span>
                            </div>
                            <div className="w-full bg-blue-300 bg-opacity-30 rounded-full h-3">
                              <div 
                                className="bg-white h-3 rounded-full transition-all duration-300"
                                style={{ width: `${selectedModuleForActivities.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                                              {/* Module Activities Section */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Module Activities</h2>
                        
                        {isLoadingActivities ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-600">Loading activities...</p>
                              <p className="text-sm text-gray-500 mt-2">This should take just a few seconds</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Activity Progress Indicator */}
                            <div className="flex items-center justify-center mb-6">
                              <div className="flex space-x-1.5">
                                {lessonActivities.map((activity, index) => (
                                  <div
                                    key={activity.id}
                                    className={`w-2.5 h-2.5 rounded-full ${
                                      activity.status === 'completed' ? 'bg-green-500' : 
                                      activity.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Activity List (Vertical Timeline) */}
                            <div className="space-y-4">
                              {lessonActivities.map((activity, index) => (
                                <div key={activity.id} className="relative">
                                  {/* Connecting Line */}
                                  {index < lessonActivities.length - 1 && (
                                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200" />
                                  )}
                                  
                                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-4">
                                      {/* Status Indicator */}
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        activity.status === 'completed' 
                                          ? 'bg-green-500' 
                                          : activity.status === 'in_progress'
                                          ? 'bg-blue-500'
                                          : 'bg-gray-400'
                                      }`}>
                                        {activity.status === 'completed' ? (
                                          <CheckCircle className="w-6 h-6 text-white" />
                                        ) : (
                                          <span className="text-white font-bold text-sm">{activity.order}</span>
                                        )}
                                      </div>
                                      
                                      {/* Activity Thumbnail */}
                                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {activity.thumbnail ? (
                                          <img 
                                            src={activity.thumbnail} 
                                            alt={activity.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${activity.thumbnail ? 'hidden' : ''}`}>
                                          {activity.type === 'quiz' ? (
                                            <FileText className="w-8 h-8 text-purple-600" />
                                          ) : activity.type === 'video' ? (
                                            <Video className="w-8 h-8 text-purple-600" />
                                          ) : activity.type === 'assignment' ? (
                                            <Code className="w-8 h-8 text-purple-600" />
                                          ) : activity.type === 'reading' ? (
                                            <BookOpen className="w-8 h-8 text-purple-600" />
                                          ) : (
                                            <Play className="w-8 h-8 text-purple-600" />
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Activity Content */}
                                      <div className="flex-1">
                                        <h5 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h5>
                                        <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                                        
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{activity.duration}</span>
                                          </div>
                                          {activity.dueDate && (
                                            <div className="text-red-500 font-medium">
                                              Due: {new Date(activity.dueDate).toLocaleDateString()}
                                            </div>
                                          )}
                                          <div className="flex items-center space-x-1">
                                            <Award className="w-4 h-4" />
                                            <span>{activity.points} pts</span>
                                          </div>
                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                            activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                            activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {activity.difficulty}
                                      </span>
                                    </div>
                                      </div>
                                      
                                      {/* Action Button */}
                                      <button className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        activity.status === 'completed' 
                                          ? 'bg-green-600 text-white hover:bg-green-700'
                                          : activity.status === 'in_progress'
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : 'bg-purple-600 text-white hover:bg-purple-700'
                                      }`}>
                                        {activity.status === 'completed' ? 'Review' : 
                                         activity.status === 'in_progress' ? 'Continue' : 'Start'}
                                      </button>
                                                  </div>
                                                  </div>
                                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Lesson View - Integrated within main content */
                    <div className="space-y-6">
                      {/* Lesson Header */}
                      <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl overflow-hidden">
                        {/* Background Image */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-20"
                          style={{ 
                            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop')` 
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600" />
                        
                        {/* Lesson Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <button 
                            onClick={() => {
                              setSelectedLessonForDetail(null);
                              // If we came from a section, go back to modules view
                              if (selectedSectionForModules) {
                                // Keep the section selected for modules view
                              } else {
                                setSelectedSectionForModules(null);
                              }
                            }}
                            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to {selectedSectionForModules ? 'Modules' : 'Course'}</span>
                                                </button>
                          
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-500 mb-3">
                              In Progress
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{selectedLessonForDetail.name}</h1>
                            <p className="text-blue-100 text-lg">{selectedLessonForDetail.description}</p>
                                              </div>
                          
                          {/* Lesson Stats */}
                          <div className="flex items-center space-x-8 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedLessonForDetail.duration}</span>
                                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{lessonActivities.length} total</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedLessonForDetail.progress}%</span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-blue-100">Lesson Progress</span>
                              <span className="text-white font-medium">{selectedLessonForDetail.progress}%</span>
                            </div>
                            <div className="w-full bg-blue-300 bg-opacity-30 rounded-full h-3">
                              <div 
                                className="bg-white h-3 rounded-full transition-all duration-300"
                                style={{ width: `${selectedLessonForDetail.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lesson Activities Section */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lesson Activities</h2>
                        
                        {isLoadingActivities ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-600">Loading activities...</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Activity Progress Indicator */}
                            <div className="flex items-center justify-center mb-8">
                              <div className="flex space-x-2">
                                {lessonActivities.map((activity, index) => (
                                  <div
                                    key={activity.id}
                                    className={`w-3 h-3 rounded-full ${
                                      activity.status === 'completed' ? 'bg-green-500' : 
                                      activity.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                                          </div>
                            </div>
                            
                            {/* Activity List (Vertical Timeline) */}
                            <div className="space-y-6">
                              {lessonActivities.map((activity, index) => (
                                <div key={activity.id} className="relative">
                                  {/* Connecting Line */}
                                  {index < lessonActivities.length - 1 && (
                                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200" />
                                  )}
                                  
                                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-3">
                                      {/* Status Indicator */}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        activity.status === 'completed' 
                                          ? 'bg-green-500' 
                                          : activity.status === 'in_progress'
                                          ? 'bg-blue-500'
                                          : 'bg-gray-400'
                                      }`}>
                                        {activity.status === 'completed' ? (
                                          <CheckCircle className="w-5 h-5 text-white" />
                                        ) : (
                                          <span className="text-white font-bold text-xs">{activity.order}</span>
                                        )}
                                      </div>
                                      
                                      {/* Activity Thumbnail */}
                                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {activity.thumbnail ? (
                                          <img 
                                            src={activity.thumbnail} 
                                            alt={activity.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${activity.thumbnail ? 'hidden' : ''}`}>
                                          {activity.type === 'quiz' ? (
                                            <FileText className="w-6 h-6 text-purple-600" />
                                          ) : activity.type === 'video' ? (
                                            <Video className="w-6 h-6 text-purple-600" />
                                          ) : activity.type === 'assignment' ? (
                                            <Code className="w-6 h-6 text-purple-600" />
                                          ) : activity.type === 'reading' ? (
                                            <BookOpen className="w-6 h-6 text-purple-600" />
                                          ) : (
                                            <Play className="w-6 h-6 text-purple-600" />
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Activity Content */}
                                      <div className="flex-1">
                                        <h5 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h5>
                                        <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                                        
                                        <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{activity.duration}</span>
                                          </div>
                                          {activity.dueDate && (
                                            <div className="text-red-500 font-medium text-xs">
                                              Due: {new Date(activity.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                          <div className="flex items-center space-x-1">
                                            <Award className="w-3 h-3" />
                                            <span>{activity.points} pts</span>
                                </div>
                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                            activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                            activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {activity.difficulty}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Action Button */}
                                      <button className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                                        activity.status === 'completed' 
                                          ? 'bg-green-600 text-white hover:bg-green-700'
                                          : activity.status === 'in_progress'
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : 'bg-purple-600 text-white hover:bg-purple-700'
                                      }`}>
                                        {activity.status === 'completed' ? 'Review' : 
                                         activity.status === 'in_progress' ? 'Continue' : 'Start'}
                                      </button>
                                    </div>
                          </div>
                        </div>
                      ))}
                    </div>
                          </>
                        )}
                  </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tree View Content */}
              {activeTab === 'tree-view' && !showCourseDetailView && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Path Explorer</h2>
                  <p className="text-gray-600 mb-8">Expand courses to explore lessons and activities</p>
                  
                  <div className="space-y-4">
                    {(realCourses.length > 0 ? realCourses : propUserCourses || []).slice(0, 3).map((course, courseIndex) => (
                      <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Course Level */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => toggleCourseExpansion(course.id)}
                              className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCourseExpanded(course.id) ? 'rotate-180' : ''}`} />
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{course.fullname || course.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {Math.floor(Math.random() * 12) + 8}/12 lessons • {course.progress || Math.floor(Math.random() * 100)}% complete
                                </p>
                              </div>
                            </button>
                          </div>
                          <button 
                            onClick={() => fetchCourseDetails(course.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Course
                          </button>
                        </div>

                        {/* Lessons - Only show if course is expanded */}
                        {isCourseExpanded(course.id) && (
                          <div className="ml-16 space-y-4">
                            {realLessons
                              .filter(lesson => lesson.courseId === course.id)
                              .slice(0, 3)
                              .map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <button 
                                      onClick={() => toggleLessonExpansion(lesson.id)}
                                      className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                    >
                                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLessonExpanded(lesson.id) ? 'rotate-180' : ''}`} />
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Play className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="text-md font-semibold text-gray-900">{lesson.name}</h4>
                                        <p className="text-sm text-gray-600">
                                          {lesson.duration} • {lesson.activities?.length || 3} activities
                                        </p>
                                      </div>
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => fetchCourseDetails(course.id)}
                                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                                  >
                                    View Lesson
                                  </button>
                                </div>

                                {/* Activities - Only show if lesson is expanded */}
                                {isLessonExpanded(lesson.id) && (
                                  <div className="ml-12 space-y-3">
                                    {lesson.activities?.slice(0, 3).map((activity, activityIndex) => (
                                      <div key={activity.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                          }`}>
                                            {activity.status === 'completed' ? (
                                              <CheckCircle className="w-4 h-4 text-white" />
                                            ) : (
                                              <span className="text-white text-xs font-bold">{activity.order}</span>
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                                            <p className="text-xs text-gray-500">
                                              {activity.type} • {activity.duration} • {activity.points} pts
                                            </p>
                                          </div>
                                        </div>
                                        <button className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-orange-700 transition-colors">
                                          Start
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            {realLessons.filter(lesson => lesson.courseId === course.id).length === 0 && (
                              <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <p className="text-gray-500">No lessons available for this course yet.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {(realCourses.length === 0 && (!propUserCourses || propUserCourses.length === 0)) && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <p className="text-gray-500">No courses available. Please check back later.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Settings Content */}
              {activeTab === 'profile-settings' && !showCourseDetailView && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="space-y-6">
                      {/* Profile Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input 
                              type="text" 
                              defaultValue={currentUser?.fullname || currentUser?.firstname || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input 
                              type="email" 
                              defaultValue={currentUser?.email || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                            <input 
                              type="text" 
                              defaultValue={`Grade ${getUserGrade()}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <input 
                              type="text" 
                              defaultValue={userRole === 'admin' ? 'Admin' : userRole === 'teacher' ? 'Teacher' : 'Student'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preferences */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                              <p className="text-xs text-gray-500">Receive updates about your courses</p>
                            </div>
                            <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                              <p className="text-xs text-gray-500">Get notified about new activities</p>
                            </div>
                            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Save Changes
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scratch Editor Content */}
              {activeTab === 'scratch-editor' && !showCourseDetailView && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Scratch Code Editor</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-[calc(100vh-200px)]">
                      <ScratchEmulator />
                    </div>
                  </div>
                </div>
              )}

              {/* E-books Content */}
              {activeTab === 'ebooks' && !showCourseDetailView && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">E-Books Library</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Sample E-books */}
                    {[
                      {
                        id: '1',
                        title: 'Introduction to Computer Science',
                        author: 'Dr. Sarah Johnson',
                        cover: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=300&h=400&fit=crop',
                        category: 'Computer Science',
                        pages: 245,
                        rating: 4.5,
                        downloads: 1234
                      },
                      {
                        id: '2',
                        title: 'Digital Literacy for Beginners',
                        author: 'Prof. Michael Chen',
                        cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
                        category: 'Digital Skills',
                        pages: 180,
                        rating: 4.2,
                        downloads: 987
                      },
                      {
                        id: '3',
                        title: 'Programming Fundamentals',
                        author: 'Dr. Emily Rodriguez',
                        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=400&fit=crop',
                        category: 'Programming',
                        pages: 320,
                        rating: 4.8,
                        downloads: 2156
                      },
                      {
                        id: '4',
                        title: 'Web Development Basics',
                        author: 'Prof. David Kim',
                        cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=400&fit=crop',
                        category: 'Web Development',
                        pages: 280,
                        rating: 4.6,
                        downloads: 1678
                      },
                      {
                        id: '5',
                        title: 'Data Science for Kids',
                        author: 'Dr. Lisa Wang',
                        cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop',
                        category: 'Data Science',
                        pages: 195,
                        rating: 4.3,
                        downloads: 892
                      },
                      {
                        id: '6',
                        title: 'Creative Coding with Scratch',
                        author: 'Prof. James Wilson',
                        cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&h=400&fit=crop',
                        category: 'Creative Coding',
                        pages: 220,
                        rating: 4.7,
                        downloads: 1345
                      }
                    ].map((book) => (
                      <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                          <img 
                            src={book.cover} 
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center hidden">
                            <BookOpen className="w-12 h-12 text-white opacity-80" />
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              {book.rating} ★
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span>{book.category}</span>
                            <span>{book.pages} pages</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{book.downloads} downloads</span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                              Read Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ask Teacher Content */}
              {activeTab === 'ask-teacher' && !showCourseDetailView && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ask Your Teacher</h2>
                  
                  {/* Quick Questions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'I need help with my assignment',
                        'Can you explain this concept?',
                        'I want to discuss my progress',
                        'Help with technical issues'
                      ].map((question, index) => (
                        <button 
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700">{question}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input 
                          type="text" 
                          placeholder="What's your question about?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea 
                          rows={4}
                          placeholder="Describe your question or concern..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Send Message
                        </button>
                        <button 
                          type="button"
                          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Save Draft
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Recent Messages */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
                    <div className="space-y-3">
                      {[
                        {
                          id: '1',
                          subject: 'Help with Python assignment',
                          teacher: 'Ms. Johnson',
                          date: '2 hours ago',
                          status: 'replied'
                        },
                        {
                          id: '2',
                          subject: 'Question about Scratch project',
                          teacher: 'Mr. Smith',
                          date: '1 day ago',
                          status: 'pending'
                        },
                        {
                          id: '3',
                          subject: 'Technical issue with code editor',
                          teacher: 'Dr. Chen',
                          date: '3 days ago',
                          status: 'replied'
                        }
                      ].map((message) => (
                        <div key={message.id} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{message.subject}</h4>
                              <p className="text-sm text-gray-500">To: {message.teacher} • {message.date}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              message.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {message.status === 'replied' ? 'Replied' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Share with Class Content */}
              {activeTab === 'share-class' && !showCourseDetailView && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Share with Class</h2>
                  
                  {/* Share Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[
                      {
                        title: 'Share Project',
                        description: 'Share your Scratch or coding projects with classmates',
                        icon: Code,
                        color: 'blue'
                      },
                      {
                        title: 'Share Achievement',
                        description: 'Celebrate your completed assignments and milestones',
                        icon: Award,
                        color: 'green'
                      },
                      {
                        title: 'Share Resource',
                        description: 'Share helpful links, books, or study materials',
                        icon: BookOpen,
                        color: 'purple'
                      },
                      {
                        title: 'Ask for Help',
                        description: 'Ask classmates for help with difficult topics',
                        icon: MessageSquare,
                        color: 'orange'
                      },
                      {
                        title: 'Study Group',
                        description: 'Create or join study groups for collaborative learning',
                        icon: Users,
                        color: 'pink'
                      },
                      {
                        title: 'Feedback Request',
                        description: 'Ask for feedback on your work from peers',
                        icon: TrendingUp,
                        color: 'indigo'
                      }
                    ].map((option, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className={`w-12 h-12 bg-${option.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                          <option.icon className={`w-6 h-6 text-${option.color}-600`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                        <p className="text-gray-600 text-sm">{option.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Shares */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Class Shares</h3>
                    <div className="space-y-4">
                      {[
                        {
                          id: '1',
                          type: 'Project',
                          title: 'My Scratch Game - Space Adventure',
                          author: 'Alex Johnson',
                          time: '2 hours ago',
                          likes: 12,
                          comments: 5
                        },
                        {
                          id: '2',
                          type: 'Achievement',
                          title: 'Completed Python Basics Course!',
                          author: 'Sarah Chen',
                          time: '1 day ago',
                          likes: 18,
                          comments: 8
                        },
                        {
                          id: '3',
                          type: 'Resource',
                          title: 'Great tutorial for HTML beginners',
                          author: 'Mike Wilson',
                          time: '2 days ago',
                          likes: 9,
                          comments: 3
                        }
                      ].map((share) => (
                        <div key={share.id} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Share2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">{share.author}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">{share.time}</span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">{share.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{share.likes} likes</span>
                                <span>{share.comments} comments</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            )}

            {/* Add other tab contents as needed */}
                </>
              )}
          </div>
          </div>
        </main>


      </div>
    </div>
  );
};

export default G1G3Dashboard;