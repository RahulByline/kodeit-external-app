import React, { useState, useEffect } from 'react';
import {  useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Users, 
  Award, 
  TrendingUp, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
  Video,
  MessageSquare,
  Target,
  Plus,
  X,
  Timer,
  Star,
  Bookmark,
  Share2,
  Edit,
  Trash2,
  Zap,
  Lightbulb,
  Brain,
  Rocket,
  Circle,
  ChevronRight,
  ChevronDown,
  File,
  Image,
  Link,
  ThumbsUp,
  ThumbsDown,
  Heart,
  BookOpenCheck,
  Target as TargetIcon,
  ArrowLeft,
  Bell,
  Info,
  LayoutDashboard,
  Activity
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import moodleService from '../../services/moodleApi';
// import CourseDetail from './CourseDetail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardTypeByGrade, extractGradeFromCohortName } from '../../utils/gradeCohortMapping';

interface Course {
  id: string;
  fullname: string;
  shortname: string;
  progress: number;
  grade?: number;
  lastAccess?: number;
  completionDate?: number;
  status: 'in_progress' | 'completed' | 'not_started';
  categoryname?: string;
  categoryid?: number;
  startdate?: number;
  enddate?: number;
  visible?: number;
  description?: string;
  summary?: string;
  instructor?: string;
  enrolledStudents?: number;
  totalModules?: number;
  completedModules?: number;
  // Image-related fields
  courseimage?: string;
  overviewfiles?: Array<{ fileurl: string; filename?: string }>;
  summaryfiles?: Array<{ fileurl: string; filename?: string }>;
  // Additional properties for enhanced course display
  categorizedItems?: {
    resources: any[];
    assignments: any[];
    quizzes: any[];
    forums: any[];
    lessons: any[];
    workshops: any[];
    videos: any[];
    other: any[];
  };
  allItems?: any[];
  totalActivities?: number;
  totalResources?: number;
  totalAssignments?: number;
  totalQuizzes?: number;
}

interface CourseActivity {
  id: string;
  name: string;
  type: 'assignment' | 'quiz' | 'resource' | 'forum' | 'video' | 'workshop';
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'submitted';
  dueDate?: number;
  grade?: number;
  maxGrade?: number;
  description: string;
  instructions?: string;
  attachments?: string[];
  submissionDate?: number;
  feedback?: string;
  timeSpent?: number;
  attempts?: number;
  maxAttempts?: number;
}

interface StudentActivity {
  id: string;
  courseId: string;
  activityId: string;
  type: 'study' | 'practice' | 'review' | 'assignment' | 'quiz';
  title: string;
  description: string;
  duration: number; // in minutes
  completed: boolean;
  timestamp: number;
  notes?: string;
  resources?: string[];
  goals?: string[];
  achievements?: string[];
}

interface CourseModule {
  id: number;
  name: string;
  type: string;
  description: string;
  url?: string;
  visible: number;
  completion: number;
  grade?: number;
  maxGrade?: number;
  dueDate?: number;
}

// Helper functions for course card enhancement
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

const getUnitName = (shortname: string, unitNumber: number): string => {
  // Use real course data to determine unit name
  const courseName = shortname.toLowerCase();
  
  if (courseName.includes('english') || courseName.includes('language')) {
    const englishUnits = [
      'Introduction',
      'Basic Vocabulary',
      'Grammar Fundamentals',
      'Reading Comprehension',
      'Writing Skills',
      'Speaking Practice',
      'Listening Exercises',
      'Advanced Topics',
      'Final Assessment'
    ];
    return englishUnits[unitNumber - 1] || `Unit ${unitNumber}`;
  } else if (courseName.includes('programming') || courseName.includes('coding')) {
    const programmingUnits = [
      'Introduction to Programming',
      'Variables and Data Types',
      'Control Structures',
      'Functions and Methods',
      'Object-Oriented Programming',
      'Data Structures',
      'Algorithms',
      'Project Development',
      'Final Project'
    ];
    return programmingUnits[unitNumber - 1] || `Unit ${unitNumber}`;
  } else if (courseName.includes('web') || courseName.includes('development')) {
    const webUnits = [
      'HTML Fundamentals',
      'CSS Styling',
      'JavaScript Basics',
      'Responsive Design',
      'Frontend Frameworks',
      'Backend Development',
      'Database Integration',
      'Deployment',
      'Final Project'
    ];
    return webUnits[unitNumber - 1] || `Unit ${unitNumber}`;
  } else {
    // Generic unit names
    const genericUnits = [
      'Introduction',
      'Basic Concepts',
      'Core Principles',
      'Advanced Topics',
      'Practical Applications',
      'Real-world Examples',
      'Best Practices',
      'Case Studies',
      'Final Assessment'
    ];
    return genericUnits[unitNumber - 1] || `Unit ${unitNumber}`;
  }
};

const getCertificationProvider = (course: Course): string => {
  const courseName = course.fullname?.toLowerCase() || '';
  const category = course.categoryname?.toLowerCase() || '';
  
  // Use real data to determine certification provider
  if (category.includes('business') || courseName.includes('business')) {
    return 'eClass';
  } else if (category.includes('safety') || courseName.includes('safety')) {
    return 'ACHS';
  } else if (category.includes('tech') || courseName.includes('programming')) {
    return 'KodeIT';
  } else if (category.includes('moodle') || courseName.includes('moodle')) {
    return 'Moodle';
  } else {
    return 'KodeIT'; // Default to KodeIT instead of random
  }
};



// Helper function to get colorful activity icons
const getActivityIcon = (activityType: string): { icon: any; color: string; bgColor: string } => {
  const type = activityType.toLowerCase();
  
  if (type.includes('reading') || type.includes('resource') || type.includes('file')) {
    return {
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
  }
  if (type.includes('interactive') || type.includes('activity') || type.includes('quiz')) {
    return {
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
  }
  if (type.includes('assignment') || type.includes('homework')) {
    return {
      icon: <Edit className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    };
  }
  if (type.includes('video') || type.includes('media')) {
    return {
      icon: <Video className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  }
  if (type.includes('forum') || type.includes('discussion')) {
    return {
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    };
  }
  if (type.includes('lesson') || type.includes('workshop')) {
    return {
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    };
  }
  
  // Default
  return {
    icon: <Circle className="w-5 h-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  };
};

// Helper function to get the best course image from a list of courses
const getBestCourseImage = (courses: Course[]): string => {
  if (!courses || courses.length === 0) {
    return '/card1.webp'; // Default fallback
  }
  
  // Find the first course with a real image
  for (const course of courses) {
    if (course.courseimage) {
      return course.courseimage;
    }
    if (course.overviewfiles && course.overviewfiles.length > 0) {
      return course.overviewfiles[0].fileurl;
    }
    if (course.summaryfiles && course.summaryfiles.length > 0) {
      return course.summaryfiles[0].fileurl;
    }
  }
  
  // If no real images found, use fallback
  return '/card1.webp'; // Default fallback
};

const Courses: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  
  // Debug logging to verify component mounting
  useEffect(() => {
    console.log('🎓 Courses component mounted');
    console.log('📍 Current location:', window.location.pathname);
    console.log('👤 Current user:', currentUser);
  }, [currentUser]);

  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Get student grade and dashboard type
  const [studentGrade, setStudentGrade] = useState<number | null>(null);
  const [dashboardType, setDashboardType] = useState<'G1_G3' | 'G4_G7' | 'G8_PLUS'>('G8_PLUS');

  // Get student grade from localStorage or determine from cohort
  useEffect(() => {
    if (currentUser?.id) {
      // Try to get grade from localStorage first
      const storedGrade = localStorage.getItem(`student_grade_${currentUser.id}`);
      if (storedGrade) {
        const grade = parseInt(storedGrade);
        setStudentGrade(grade);
        setDashboardType(getDashboardTypeByGrade(grade));
        console.log('🎓 Courses: Using stored grade:', grade, 'Dashboard type:', getDashboardTypeByGrade(grade));
      } else {
        // If no stored grade, try to get from cohort
        const fetchStudentGrade = async () => {
          try {
            const userCohorts = await moodleService.getCohorts();
            if (userCohorts && userCohorts.length > 0) {
              const cohort = userCohorts[0]; // Use first cohort
              const extractedGrade = extractGradeFromCohortName(cohort.name);
              if (extractedGrade) {
                setStudentGrade(extractedGrade);
                setDashboardType(getDashboardTypeByGrade(extractedGrade));
                localStorage.setItem(`student_grade_${currentUser.id}`, extractedGrade.toString());
                console.log('🎓 Courses: Extracted grade from cohort:', extractedGrade, 'Dashboard type:', getDashboardTypeByGrade(extractedGrade));
              }
            }
          } catch (error) {
            console.error('❌ Error fetching student grade:', error);
            // Default to G8+ if error
            setStudentGrade(8);
            setDashboardType('G8_PLUS');
          }
        };
        fetchStudentGrade();
      }
    }
  }, [currentUser?.id]);

  // Top navigation items - conditionally show based on dashboard type
  const topNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
    { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
    // Only show Current Lessons and Activities for G4G7 students
    ...(dashboardType === 'G4_G7' ? [
      { name: 'Current Lessons', icon: Clock, path: '/dashboard/student/current-lessons' },
      { name: 'Activities', icon: Activity, path: '/dashboard/student/activities' }
    ] : [])
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard/student') {
      return location.pathname === '/dashboard/student' || location.pathname === '/dashboard/student/';
    }
    return location.pathname === path;
  };

  const handleTopNavClick = (path: string) => {
    navigate(path);
  };
  
  // Course details and activities
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseActivities, setCourseActivities] = useState<CourseActivity[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  
  // Real course data state
  const [realCourseData, setRealCourseData] = useState<any>(null);
  const [realCourseContents, setRealCourseContents] = useState<any[]>([]);
  const [realCourseActivities, setRealCourseActivities] = useState<any[]>([]);
  const [realCourseCompletion, setRealCourseCompletion] = useState<any>(null);
  const [realCourseGrades, setRealCourseGrades] = useState<any>(null);
  const [isLoadingCourseData, setIsLoadingCourseData] = useState(false);
  
  // Completed courses state
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [isLoadingCompletedCourses, setIsLoadingCompletedCourses] = useState(false);
  
  // Selected activity state
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  // Course detail view state
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  
  // Direct course view - no categories for students
  const [viewMode, setViewMode] = useState<'courses'>('courses');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real courses from IOMAD Moodle API...');
      
      if (!currentUser?.id) {
        throw new Error('No current user ID available');
      }

      console.log('👤 Current user:', currentUser);
      
      // Fetch real user courses from IOMAD API
      const userCourses = await moodleService.getUserCourses(currentUser.id);

      console.log('📊 Real user courses fetched:', userCourses.length);

      // Process real course data - NO MOCK DATA
      const enrolledCourses = userCourses.filter(course => 
        course.visible !== 0 && course.categoryid && course.categoryid > 0
      );

      let processedCourses: Course[] = [];

      if (enrolledCourses && enrolledCourses.length > 0) {
        // Process real enrolled course data from IOMAD API - NO MOCK DATA
        processedCourses = await Promise.all(enrolledCourses.map(async (course) => {
          // Fetch real completion data for each course
          const courseCompletion = await moodleService.getCourseCompletion(course.id);
          const courseContents = await moodleService.getCourseContents(course.id);
          
          // Calculate real progress and statistics from actual data
          const totalModules = courseContents?.length || 0;
          const completedModules = courseCompletion?.completionstatus?.completed || 0;
          const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
            
          return {
            id: course.id,
            fullname: course.fullname,
            shortname: course.shortname,
            progress,
            grade: courseCompletion?.completionstatus?.grade || 0,
            lastAccess: course.startdate,
            completionDate: course.enddate,
            status: progress === 100 ? 'completed' : 
                   progress > 0 ? 'in_progress' : 'not_started',
            categoryname: course.categoryname || 'General',
            categoryid: course.categoryid,
            startdate: course.startdate,
            enddate: course.enddate,
            visible: course.visible,
            description: course.summary || '',
            summary: course.summary || '',
            instructor: 'Instructor',
            enrolledStudents: 0,
            totalModules,
            completedModules,
            // Image-related fields
            courseimage: course.courseimage || '',
            overviewfiles: [],
            summaryfiles: [],
            // Additional properties
            totalActivities: totalModules,
            totalResources: courseContents?.filter((content: any) => 
              content.modules?.some((module: any) => 
                ['resource', 'file', 'url', 'page'].includes(module.modname)
              )
            ).length || 0,
            totalAssignments: courseContents?.filter((content: any) => 
              content.modules?.some((module: any) => module.modname === 'assign')
            ).length || 0,
            totalQuizzes: courseContents?.filter((content: any) => 
              content.modules?.some((module: any) => module.modname === 'quiz')
            ).length || 0
          };
        }));

        setCourses(processedCourses);
        console.log('✅ Real enrolled courses processed successfully:', processedCourses.length);
      } else {
        console.log('⚠️ No enrolled courses found');
        setCourses([]);
        setError('No enrolled courses available.');
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

      const handleCourseClick = async (course: Course) => {
      // Navigate to course lessons page with course data
      navigate(`/dashboard/student/course-lessons/${course.id}`, { 
        state: { 
          selectedCourse: course
        }
      });
    };

  const handleCourseDetailsClick = async (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
    setIsLoadingCourseData(true);
    setIsLoadingCompletedCourses(true);
    
    console.log('📚 Opening course details for:', course.fullname);
    console.log('🔍 Fetching ALL real course data from IOMAD API...');
    
    try {
      // Fetch ALL real course data from IOMAD API in parallel
      const [
        courseContents,
        courseActivities,
        courseCompletion,
        courseGrades,
        courseDetails,
        userCourses
      ] = await Promise.all([
        moodleService.getCourseContents(course.id),
        moodleService.getCourseActivities(course.id),
        moodleService.getCourseCompletion(course.id),
        moodleService.getCourseGrades(course.id),
        moodleService.getCourseDetails(course.id),
        moodleService.getUserCourses(currentUser?.id || '1')
      ]);

      console.log('✅ All course data fetched successfully');

      // Process real course data
      setRealCourseData(courseDetails);
      setRealCourseContents(courseContents || []);
      setRealCourseActivities(courseActivities || []);
      setRealCourseCompletion(courseCompletion);
      setRealCourseGrades(courseGrades);

      // Process course activities
      if (courseContents && courseContents.length > 0) {
        const allActivities: CourseActivity[] = [];
        
        courseContents.forEach((section: any) => {
          if (section.modules && section.modules.length > 0) {
            section.modules.forEach((module: any) => {
              // Determine activity type based on modname
              let activityType: CourseActivity['type'] = 'resource';
              switch (module.modname) {
                case 'assign': activityType = 'assignment'; break;
                case 'quiz': activityType = 'quiz'; break;
                case 'forum': activityType = 'forum'; break;
                case 'url': 
                case 'resource': 
                case 'page': activityType = 'resource'; break;
                case 'lesson': 
                case 'scorm': 
                case 'h5pactivity': activityType = 'video'; break;
                case 'workshop': activityType = 'workshop'; break;
                default: activityType = 'resource';
              }
              
              // Determine status based on completion data
              let status: CourseActivity['status'] = 'not_started';
              if (module.completion) {
                if (module.completion.state === 1) {
                  status = 'completed';
                } else if (module.completion.state === 0) {
                  status = 'in_progress';
                }
              }
              
              allActivities.push({
                id: module.id.toString(),
                name: module.name || 'Unnamed Activity',
                type: activityType,
                status: status,
                dueDate: module.dates?.find((date: any) => date.label === 'Due date')?.timestamp,
                grade: module.grade || 0,
                maxGrade: module.grademax || 100,
                description: module.description || module.intro || 'Course activity',
                instructions: module.description || '',
                attachments: module.contents?.map((content: any) => content.fileurl) || [],
                submissionDate: module.timemodified,
                feedback: '',
                timeSpent: 0,
                attempts: module.attempts || 1,
                maxAttempts: module.maxattempts || 1
              });
            });
          }
        });
        
        setCourseActivities(allActivities);
        console.log('✅ Course activities processed:', allActivities.length);
      }

      // Process completed courses
      const completed = userCourses.filter((userCourse: any) => 
        userCourse.progress === 100 || userCourse.status === 'completed'
      );
      setCompletedCourses(completed);
      
    } catch (error) {
      console.error('❌ Error fetching course details:', error);
      setError('Failed to load course details. Please try again.');
    } finally {
      setIsLoadingCourseData(false);
      setIsLoadingCompletedCourses(false);
    }
  };

  const handleActivityClick = async (activity: any, index: number) => {
    console.log('🎯 Activity clicked:', activity.name);
    setSelectedActivity(activity);
    setIsActivityLoading(true);
    
    try {
      // Fetch detailed activity information
      const activityDetails = await moodleService.getCourseContents(selectedCourse?.id || '');
      
      if (activityDetails) {
        // Find the specific activity in the course contents
        const foundActivity = activityDetails.flatMap((section: any) => 
          section.modules || []
        ).find((module: any) => module.id.toString() === activity.id);
        
        if (foundActivity) {
          setSelectedActivity({
            ...activity,
            details: foundActivity,
            content: foundActivity.contents || [],
            description: foundActivity.description || activity.description,
            htmlContent: foundActivity.descriptionhtml || foundActivity.description
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching activity details:', error);
    } finally {
      setIsActivityLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const exportCoursesData = () => {
    const dataStr = JSON.stringify(courses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-courses-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter courses based on search term and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.shortname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.categoryname?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading your courses...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error Loading Courses</span>
            </div>
            <p className="text-red-700 mb-3">{error}</p>
            <Button onClick={fetchCourses} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (showCourseDetail && selectedCourseForDetail) {
    // return (
    //   // <CourseDetail 
    //   //   courseId={selectedCourseForDetail.id} 
    //   //   onBack={() => setShowCourseDetail(false)} 
    //   // />
    // );
  }

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
        {/* Top Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex space-x-2 p-2">
            {topNavItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => handleTopNavClick(item.path)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rest of the component content */}
        <div className=" mx-auto space-y-8">
                    {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
              <p className="text-gray-600 text-lg">
                Real-time course data from IOMAD Moodle API
              </p>
              <p className="text-gray-600 mt-2">{courses.length} available courses • {currentUser?.fullname || 'Student'}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/student')}
                className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/20"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-semibold">Back to Dashboard</span>
              </button>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Refresh</span>
              </button>
              <button
                onClick={exportCoursesData}
                className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/20"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Export</span>
              </button>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.length > 0 ? Math.round(courses.reduce((sum, course) => sum + (course.grade || 0), 0) / courses.length) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Filter Courses</h2>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-white/60 backdrop-blur-sm border border-white/20">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 pl-10 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid - Direct View for Students */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h2>
              <p className="text-gray-600 text-lg">All your available courses from IOMAD Moodle</p>
            </div>
          </div>

          {/* Enhanced Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              // Get course image with real data
              const courseImage = course.courseimage ||
                course.overviewfiles?.[0]?.fileurl ||
                getCourseImageFallback(course.categoryname, course.fullname);

              // Calculate course dates
              const startDate = course.startdate ? new Date(course.startdate * 1000) : null;
              const endDate = course.enddate ? new Date(course.enddate * 1000) : null;

              // Get current unit/progress info based on real data
              const currentUnit = course.totalModules && course.progress > 0 
                ? Math.min(Math.ceil(course.progress / 100 * course.totalModules), course.totalModules) 
                : course.progress > 0 ? 1 : 0;
              const unitName = currentUnit > 0 ? getUnitName(course.shortname, currentUnit) : 'Not Started';

              // Determine course status and badges based on real data only
              const isNew = course.startdate && (Date.now() / 1000 - course.startdate) < 30 * 24 * 60 * 60; // 30 days
              const isMandatory = course.categoryname?.toLowerCase().includes('obligatorio') ||
                course.categoryname?.toLowerCase().includes('mandatory') ||
                course.categoryname?.toLowerCase().includes('required');

              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md group cursor-pointer bg-white" onClick={() => handleCourseClick(course)}>
                  {/* Course Image Header */}
                  <div className="relative h-56 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <img
                      src={courseImage}
                      alt={course.fullname}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getCourseImageFallback(course.categoryname, course.fullname);
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {isMandatory && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 text-xs px-2 py-1">
                          Obligatorio
                        </Badge>
                      )}
                      {isNew && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs px-2 py-1">
                          New
                        </Badge>
                      )}
                    </div>

                    {/* Course Icon Overlay */}
                    <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center border-3 border-white group-hover:scale-105 transition-transform duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <CardContent className="pt-8 pb-6">
                    {/* Date Range */}
                    {(startDate || endDate) && (
                      <div className="text-xs text-gray-500 mb-2">
                        {startDate && `Inicia ${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        {startDate && endDate && ' | '}
                        {endDate && `Finaliza ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </div>
                    )}

                    {/* Course Title */}
                    <CardTitle className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {course.fullname}
                    </CardTitle>

                    {/* Progress Info */}
                    <div className="flex items-center space-x-2 mb-3">
                      <RefreshCw className={`w-4 h-4 text-blue-600 ${course.status === 'in_progress' ? 'animate-spin' : ''}`} />
                      <span className="text-sm text-gray-600">
                        {currentUnit > 0 
                          ? `Currently in: Unit ${currentUnit} '${unitName}'`
                          : course.status === 'completed' 
                            ? 'Course Completed'
                            : 'Course Not Started'
                        }
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{course.totalModules || 0}</div>
                        <div className="text-xs text-gray-500">Modules</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{course.totalActivities || 0}</div>
                        <div className="text-xs text-gray-500">Activities</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You are not enrolled in any courses yet.'
                }
              </p>
              {searchTerm || filterStatus !== 'all' ? (
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}>
                  Clear Filters
                </Button>
              ) : (
                <Button variant="outline" onClick={refreshData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses; 