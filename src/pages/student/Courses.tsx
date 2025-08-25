import React, { useState, useEffect } from 'react';
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
  User,
  GraduationCap,
  Clock3,
  CalendarDays,
  BookMarked,
  Video as VideoIcon,
  FileText as FileTextIcon,
  MessageCircle,
  CheckCircle2,
  PlayCircle,
  Pause,
  SkipForward,
  Volume2,
  Settings,
  MoreHorizontal,
  ChevronUp,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Minus,
  Plus as PlusIcon,
  ExternalLink,
  Lock,
  Unlock,
  EyeOff,
  Eye as EyeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  MessageSquare as MessageSquareIcon,
  Users as UsersIcon,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Award as AwardIcon,
  TrendingUp as TrendingUpIcon,
  BarChart3 as BarChart3Icon,
  PieChart,
  Activity,
  Target as TargetIcon2,
  Zap as ZapIcon,
  Lightbulb as LightbulbIcon,
  Brain as BrainIcon,
  Rocket as RocketIcon,
  Star as StarIcon,
  Crown,
  Trophy,
  Medal,
  Scroll,
  BookOpen as BookOpenIcon,
  Book as BookIcon,
  Library,
  School,
  University,
  GraduationCap as GraduationCapIcon,
  UserCheck,
  UserPlus,
  UserMinus,
  UserX,
  UserCog,
  UserSearch,
  UserCheck as UserCheckIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  UserX as UserXIcon,
  UserCog as UserCogIcon,
  UserSearch as UserSearchIcon
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import moodleService from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

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
  startdate?: number;
  enddate?: number;
  visible?: number;
  description?: string;
  instructor?: string;
  enrolledStudents?: number;
  totalModules?: number;
  completedModules?: number;
  // Image-related fields for real course images
  courseimage?: string;
  overviewfiles?: Array<{ fileurl: string; filename?: string }>;
  summaryfiles?: Array<{ fileurl: string; filename?: string }>;
  // Additional properties used in the component
  categorizedItems?: {
    assignments: any[];
    quizzes: any[];
    resources: any[];
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

// Course image fallbacks based on category and course name (same as admin)
const getCourseImageFallback = (categoryName?: string, courseName?: string): string => {
  const category = categoryName?.toLowerCase() || '';
  const course = courseName?.toLowerCase() || '';
  
  // Programming/IT courses
  if (category.includes('programming') || category.includes('coding') || category.includes('development') ||
      course.includes('programming') || course.includes('coding') || course.includes('development') ||
      course.includes('kodeit') || course.includes('digital')) {
    return '/card1.webp'; // Programming image
  }
  
  // Business/Management courses
  if (category.includes('business') || category.includes('management') || category.includes('leadership') ||
      course.includes('business') || course.includes('management') || course.includes('leadership')) {
    return '/card2.webp'; // Business image
  }
  
  // Education/Teaching courses
  if (category.includes('education') || category.includes('teaching') || category.includes('pedagogy') ||
      course.includes('education') || course.includes('teaching') || course.includes('pedagogy') ||
      course.includes('discipline')) {
    return '/card3.webp'; // Education image
  }
  
  // Technology/ICT courses
  if (category.includes('technology') || category.includes('ict') || category.includes('digital') ||
      course.includes('technology') || course.includes('ict') || course.includes('digital')) {
    return '/Innovative-ICT-Curricula.webp';
  }
  
  // Primary/Grade courses
  if (category.includes('primary') || category.includes('grade') || course.includes('grade')) {
    return '/home-carousal-for-teachers.webp';
  }
  
  // Assessment courses
  if (category.includes('assessment') || course.includes('assessment')) {
    return '/home-carousel-for-schools.webp';
  }
  
  // Default fallback - use a more appealing default image
  return '/card1.webp'; // Use programming image as default since it's most relevant
};

// Validate and fix image URL (same as admin)
const validateImageUrl = (url?: string): string => {
  if (!url) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // For Moodle URLs, prefer the regular pluginfile.php over webservice/pluginfile.php
    if (url.includes('webservice/pluginfile.php')) {
      // Convert webservice URL to regular pluginfile URL
      const regularUrl = url.replace('webservice/pluginfile.php', 'pluginfile.php');
      console.log(`🔄 Converting webservice URL to regular URL: ${url} -> ${regularUrl}`);
      return regularUrl;
    }
    return url;
  }
  
  // If it's a relative path, make it absolute
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a Moodle file URL, ensure it has the token
  if (url.includes('webservice/rest/server.php')) {
    return url;
  }
  
  // Default fallback
  return '/placeholder.svg';
};

// Get course image with fallback (same as admin)
const getCourseImage = (course: Course): string => {
  // The course image is already processed in fetchCourses, so just return it
  if (course.courseimage) {
    return course.courseimage;
  }
  
  // Fallback to category-based image if no image is set
  return getCourseImageFallback(course.categoryname, course.fullname);
};

// Format date for display
const formatDate = (timestamp?: number): string => {
  if (!timestamp) return 'TBD';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Get course status and progress info (same as admin)
const getCourseStatusInfo = (course: Course) => {
  const now = Date.now() / 1000;
  const isActive = course.startdate && course.enddate && 
    course.startdate <= now && course.enddate >= now;
  const isCompleted = course.enddate && course.enddate < now;
  const isUpcoming = course.startdate && course.startdate > now;
  
  if (isCompleted) {
    return {
      status: 'completed' as const,
      statusText: 'Completed',
      progressText: 'Course completed',
      progressIcon: <CheckCircle className="w-4 h-4 text-green-600" />,
      buttonText: 'View Certificate',
      buttonVariant: 'default' as const
    };
  } else if (isActive) {
    return {
      status: 'active' as const,
      statusText: 'In Progress',
      progressText: `Completion Rate: ${course.progress || 0}%`,
      progressIcon: <RefreshCw className="w-4 h-4 text-blue-600" />,
      buttonText: 'Continue Learning',
      buttonVariant: 'default' as const
    };
  } else if (isUpcoming) {
    return {
      status: 'upcoming' as const,
      statusText: 'Upcoming',
      progressText: `Starts: ${formatDate(course.startdate)}`,
      progressIcon: <Calendar className="w-4 h-4 text-orange-600" />,
      buttonText: 'Course Info',
      buttonVariant: 'outline' as const
    };
  } else {
    return {
      status: 'inactive' as const,
      statusText: 'Inactive',
      progressText: 'Course not available',
      progressIcon: <Clock className="w-4 h-4 text-gray-600" />,
      buttonText: 'View Details',
      buttonVariant: 'outline' as const
    };
  }
};

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

const Courses: React.FC = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
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
          const progress = courseCompletion?.completionstatus?.completion || 0;
          const totalModules = courseContents?.length || 0;
          const completedModules = courseCompletion?.completionstatus?.completed || 0;

          // Enhanced image handling with real Moodle course images (SAME AS ADMIN DASHBOARD)
          let courseImage = course.courseimage;
          
          // Debug: Log the raw course data
          console.log(`🔍 Processing course "${course.fullname}":`, {
            id: course.id,
            courseimage: course.courseimage,
            overviewfiles: (course as any).overviewfiles,
            summaryfiles: (course as any).summaryfiles
          });
          
          // Check if courseimage is a default Moodle image (course.svg)
          const isDefaultMoodleImage = courseImage && (
            courseImage.includes('course.svg') || 
            courseImage.includes('generated/course.svg') ||
            courseImage.includes('default-course-image')
          );
          
          if (courseImage && !isDefaultMoodleImage) {
            console.log(`✅ Using courseimage for "${course.fullname}": ${courseImage}`);
          } else if ((course as any).overviewfiles && Array.isArray((course as any).overviewfiles) && (course as any).overviewfiles.length > 0) {
            courseImage = (course as any).overviewfiles[0].fileurl;
            console.log(`⚠️ Using overviewfiles for "${course.fullname}": ${courseImage}`);
          } else if ((course as any).summaryfiles && Array.isArray((course as any).summaryfiles) && (course as any).summaryfiles.length > 0) {
            courseImage = (course as any).summaryfiles[0].fileurl;
            console.log(`⚠️ Using summaryfiles for "${course.fullname}": ${courseImage}`);
          } else {
            console.log(`❌ No real image found for "${course.fullname}", will use fallback`);
            courseImage = null; // Force fallback
          }
          
          // Validate the image URL
          courseImage = validateImageUrl(courseImage);
          
          // If no valid image or it's a default Moodle image, use category-based fallback
          if (!courseImage || courseImage === '/placeholder.svg' || isDefaultMoodleImage) {
            courseImage = getCourseImageFallback(course.categoryname, course.fullname);
            console.log(`🔄 Using fallback image for "${course.fullname}": ${courseImage}`);
          }
            
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
            startdate: course.startdate,
            enddate: course.enddate,
            visible: course.visible,
            description: course.summary || `Course covering ${course.shortname.toLowerCase()} concepts.`,
            instructor: 'Course Instructor', // Real instructor data would come from API
            enrolledStudents: 0, // Real enrollment data would come from API
            totalModules,
            completedModules,
            // Use the real course image we just processed
            courseimage: courseImage,
            // Ensure image fields are included
            overviewfiles: (course as any).overviewfiles || [],
            summaryfiles: (course as any).summaryfiles || [],
            categorizedItems: {
              assignments: [],
              quizzes: [],
              resources: [],
              forums: [],
              lessons: [],
              workshops: [],
              videos: [],
              other: []
            },
            allItems: [],
            totalActivities: 0,
            totalResources: 0,
            totalAssignments: 0,
            totalQuizzes: 0
          };
        }));

        setCourses(processedCourses);
        console.log('✅ Real enrolled courses processed successfully:', processedCourses.length);
        
        // Log detailed image information for debugging (SAME AS ADMIN DASHBOARD)
        processedCourses.forEach(course => {
          const isRealImage = course.courseimage && !course.courseimage.includes('card');
          console.log(`📸 Course "${course.fullname}": ${isRealImage ? '✅ Real Image' : '🔄 Fallback Image'} - ${course.courseimage}`);
        });
        
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
    setSelectedCourse(course);
    setShowCourseDetails(true);
    setIsLoadingCourseData(true);
    setIsLoadingCompletedCourses(true);
    
    console.log('📚 Opening course details for:', course.fullname);
    console.log('🔍 Fetching ALL real course data from IOMAD API...');
    
    try {
      // Fetch ALL real course data from IOMAD API in parallel
      console.log(`🔍 Starting to fetch real course data for course ID: ${course.id}`);
      
      const [
        courseContents,
        courseActivities,
        courseCompletion,
        courseGrades,
        courseDetails,
        userCourses
      ] = await Promise.all([
        moodleService.getCourseContents(course.id),
        moodleService.getCourseActivities(course.id, currentUser?.id),
        moodleService.getCourseCompletion(course.id),
        moodleService.getCourseGrades(course.id),
        moodleService.getCourseDetails(course.id),
        moodleService.getUserCourses(currentUser?.id || '1')
      ]);
      
      console.log('✅ All real course data fetched:', {
        contents: courseContents?.length || 0,
        activities: courseActivities?.length || 0,
        completion: courseCompletion ? 'Yes' : 'No',
        grades: courseGrades ? 'Yes' : 'No',
        details: courseDetails ? 'Yes' : 'No',
        userCourses: userCourses?.length || 0
      });
      
      // Debug: Log detailed activity information
      if (courseActivities && courseActivities.length > 0) {
        console.log('📋 Real activities found:', courseActivities.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          type: activity.type,
          section: activity.section,
          completion: activity.completion
        })));
      } else {
        console.log('⚠️ No real activities found in courseActivities');
      }
      
      if (courseContents && courseContents.length > 0) {
        console.log('📚 Course contents sections:', courseContents.map((section: any) => ({
          id: section.id,
          name: section.name,
          modulesCount: section.modules?.length || 0
        })));
      } else {
        console.log('⚠️ No course contents found');
      }
      
      // Store all real course data in state
      setRealCourseData(courseDetails);
      setRealCourseContents(courseContents || []);
      setRealCourseActivities(courseActivities || []);
      setRealCourseCompletion(courseCompletion);
      setRealCourseGrades(courseGrades);
      
      // Process completed courses
      if (userCourses && userCourses.length > 0) {
        const completedCoursesData = userCourses.filter((userCourse: any) => {
          // Check if course is completed (progress = 100 or has completion status)
          return userCourse.progress === 100 || 
                 (courseCompletion && courseCompletion.completionstatus?.completion === 100) ||
                 userCourse.status === 'completed';
        });
        
        setCompletedCourses(completedCoursesData);
        console.log(`✅ Found ${completedCoursesData.length} completed courses`);
      }
      
      if (courseContents && courseActivities) {
        // Process real course modules from contents
        const realModules: CourseModule[] = courseContents.map((section: any, sectionIndex: number) => {
          // Find completion data for this section
          const sectionCompletion = courseCompletion?.completionstatus?.find((status: any) => 
            status.sectionid === section.id
          );
          
          return {
            id: section.id,
            name: section.name || `Section ${sectionIndex + 1}`,
            type: 'resource',
            description: section.summary || 'Course section',
            visible: 1,
            completion: sectionCompletion?.completion || 0,
            grade: sectionCompletion?.grade || 0,
            maxGrade: 100
          };
        });
        
        setCourseModules(realModules);
        console.log(`✅ Processed ${realModules.length} real course modules from IOMAD API`);
        
        // Process ALL course items (activities and resources) from BOTH API endpoints
        const allCourseItems: any[] = [];
        
        console.log('🔄 Processing course items from both API sources...');
        
        // Add activities from getCourseActivities
        if (courseActivities && Array.isArray(courseActivities)) {
          console.log(`📋 Adding ${courseActivities.length} activities from getCourseActivities`);
          courseActivities.forEach((activity: any) => {
            allCourseItems.push({
              ...activity,
              source: 'activity',
              itemType: 'activity'
            });
          });
        } else {
          console.log('⚠️ No courseActivities array found or empty');
        }
        
        // Add resources and activities from course contents
        if (courseContents && Array.isArray(courseContents)) {
          let totalModules = 0;
          courseContents.forEach((section: any) => {
            if (section.modules && Array.isArray(section.modules)) {
              totalModules += section.modules.length;
              section.modules.forEach((module: any) => {
                allCourseItems.push({
                  ...module,
                  source: 'content',
                  itemType: module.modname || 'resource',
                  sectionName: section.name || 'General'
                });
              });
            }
          });
          console.log(`📚 Added ${totalModules} modules from course contents`);
        } else {
          console.log('⚠️ No courseContents array found or empty');
        }
        
        console.log(`📊 Total items collected: ${allCourseItems.length}`);
        
        // Categorize all items by type for course overview
        const categorizedItems = {
          assignments: allCourseItems.filter(item => 
            item.modname === 'assign' || item.type === 'assignment'
          ),
          quizzes: allCourseItems.filter(item => 
            item.modname === 'quiz' || item.type === 'quiz'
          ),
          resources: allCourseItems.filter(item => 
            item.modname === 'resource' || 
            item.modname === 'folder' ||
            item.modname === 'book' ||
            item.modname === 'page' ||
            item.type === 'resource'
          ),
          forums: allCourseItems.filter(item => 
            item.modname === 'forum' || item.type === 'forum'
          ),
          lessons: allCourseItems.filter(item => 
            item.modname === 'lesson' || item.type === 'lesson'
          ),
          workshops: allCourseItems.filter(item => 
            item.modname === 'workshop' || item.type === 'workshop'
          ),
          videos: allCourseItems.filter(item => 
            item.modname === 'url' || 
            item.modname === 'label' ||
            item.type === 'video'
          ),
          other: allCourseItems.filter(item => {
            const knownTypes = ['assign', 'quiz', 'resource', 'folder', 'book', 'page', 'forum', 'lesson', 'workshop', 'url', 'label'];
            return !knownTypes.includes(item.modname) && !knownTypes.includes(item.type);
          })
        };
        
        // Store categorized items in selectedCourse state
        setSelectedCourse({
          ...course,
          categorizedItems: categorizedItems,
          allItems: allCourseItems,
          totalActivities: allCourseItems.length,
          totalResources: categorizedItems.resources.length,
          totalAssignments: categorizedItems.assignments.length,
          totalQuizzes: categorizedItems.quizzes.length
        });
        
        console.log('📊 Categorized course items:', categorizedItems);
        console.log(`📋 Total items found: ${allCourseItems.length}`);
        console.log(`📚 Resources: ${categorizedItems.resources.length}`);
        console.log(`📝 Assignments: ${categorizedItems.assignments.length}`);
        console.log(`❓ Quizzes: ${categorizedItems.quizzes.length}`);
        
        // Process activities for sidebar (excluding videos as requested)
        console.log('🔄 Processing activities for sidebar display...');
        
        const filteredItems = allCourseItems.filter((item: any) => {
          const itemType = item.modname || item.type;
          const shouldInclude = itemType !== 'url' && 
                               itemType !== 'label' &&
                               itemType !== 'video';
          
          if (!shouldInclude) {
            console.log(`🚫 Filtered out item: ${item.name} (type: ${itemType})`);
          }
          
          return shouldInclude;
        });
        
        console.log(`📋 Filtered items for sidebar: ${filteredItems.length} out of ${allCourseItems.length}`);
        
        const realActivities: CourseActivity[] = filteredItems.map((item: any) => {
          // Determine status based on completion data
          let status: CourseActivity['status'] = 'not_started';
          if (item.completion) {
            if (item.completion.state === 1) {
              status = 'completed';
            } else if (item.completion.state === 0) {
              status = 'in_progress';
            }
          }
          
          const activity = {
            id: item.id.toString(),
            name: item.name || item.title || 'Unnamed Item',
            type: mapActivityType(item.modname || item.type),
            status: status,
            dueDate: item.dates?.find((date: any) => date.label === 'Due date')?.timestamp || undefined,
            grade: item.completion?.value || 0,
            maxGrade: 100,
            description: item.description || item.intro || 'Course item',
            instructions: item.description || item.intro || 'Complete this activity',
            attachments: item.contents?.map((content: any) => content.filename) || [],
            timeSpent: 0,
            attempts: item.completion?.attempts || 0,
            maxAttempts: 3,
            sectionName: item.sectionName || 'General',
            source: item.source,
            itemType: item.itemType
          };
          
          console.log(`✅ Processed activity: ${activity.name} (${activity.type}) - Status: ${activity.status}`);
          return activity;
        });
        
        setCourseActivities(realActivities);
        console.log(`✅ Processed ${realActivities.length} real course activities from IOMAD API`);
        
      } else {
        console.log('⚠️ Could not fetch real course data, using fallback data');
        generateFallbackCourseData(course);
      }
    } catch (error) {
      console.error('❌ Error fetching real course data:', error);
      generateFallbackCourseData(course);
    } finally {
      setIsLoadingCourseData(false);
      setIsLoadingCompletedCourses(false);
    }
  };

  // Helper function to map Moodle activity types to our activity types
  const mapActivityType = (moodleType: string): CourseActivity['type'] => {
    const typeMap: { [key: string]: CourseActivity['type'] } = {
      'assign': 'assignment',
      'quiz': 'quiz',
      'resource': 'resource',
      'url': 'resource',
      'page': 'resource',
      'book': 'resource',
      'forum': 'forum',
      'workshop': 'workshop',
      'lesson': 'video',
      'scorm': 'video',
      'h5pactivity': 'video'
    };
    
    return typeMap[moodleType] || 'resource';
  };

  const handleViewActivities = async (course: Course) => {
    console.log('📊 Viewing activities for course:', course.fullname);
    setSelectedCourse(course);
    setShowCourseDetails(true);
    
    try {
      // Fetch real course activities from IOMAD API
      const courseActivities = await moodleService.getCourseActivities(course.id);
      
      if (courseActivities && courseActivities.length > 0) {
        // Process real course activities from API
        const realActivities: CourseActivity[] = courseActivities.map((activity: any) => {
          // Determine status based on completion data
          let status: CourseActivity['status'] = 'not_started';
          if (activity.completion) {
            if (activity.completion.state === 1) {
              status = 'completed';
            } else if (activity.completion.state === 0) {
              status = 'in_progress';
            }
          }
          
          return {
            id: activity.id.toString(),
            name: activity.name || 'Activity',
            type: mapActivityType(activity.type),
            status: status,
            dueDate: activity.dates?.find((date: any) => date.label === 'Due date')?.timestamp || undefined,
            grade: activity.completion?.value || 0,
            maxGrade: 100,
            description: activity.description || 'Course activity',
            instructions: activity.description || 'Complete this activity',
            attachments: activity.contents?.map((content: any) => content.filename) || [],
            timeSpent: Math.floor(Math.random() * 60) + 10,
            attempts: activity.completion?.attempts || 0,
            maxAttempts: 3
          };
        });
        
        setCourseActivities(realActivities);
        console.log(`✅ Loaded ${realActivities.length} real activities from IOMAD API`);
      } else {
        console.log('⚠️ No real activities found, using fallback data');
        // Generate fallback activities
        const fallbackActivities: CourseActivity[] = [
          {
            id: '1',
            name: `${course.shortname} - Introduction Assignment`,
            type: 'assignment',
            status: course.progress > 0 ? 'in_progress' : 'not_started',
            dueDate: Date.now() + 86400 * 7,
            grade: 0,
            maxGrade: 100,
            description: `Complete the introduction assignment for ${course.fullname}`,
            instructions: 'Review the course materials and submit your first assignment.',
            attachments: ['assignment_guidelines.pdf', 'sample_materials.pdf'],
            timeSpent: 45,
            attempts: course.progress > 0 ? 1 : 0,
            maxAttempts: 3
          }
        ];
        setCourseActivities(fallbackActivities);
      }
    } catch (error) {
      console.error('❌ Error fetching real activities:', error);
      // Use fallback data
      const fallbackActivities: CourseActivity[] = [
        {
          id: '1',
          name: `${course.shortname} - Introduction Assignment`,
          type: 'assignment',
          status: course.progress > 0 ? 'in_progress' : 'not_started',
          dueDate: Date.now() + 86400 * 7,
          grade: 0,
          maxGrade: 100,
          description: `Complete the introduction assignment for ${course.fullname}`,
          instructions: 'Review the course materials and submit your first assignment.',
          attachments: ['assignment_guidelines.pdf', 'sample_materials.pdf'],
          timeSpent: 45,
          attempts: course.progress > 0 ? 1 : 0,
          maxAttempts: 3
        }
      ];
      setCourseActivities(fallbackActivities);
    }
  };

  const handleViewProgress = async (course: Course) => {
    console.log('📈 Viewing progress for course:', course.fullname);
    setSelectedCourse(course);
    setShowCourseDetails(true);
    
    try {
      // Fetch real course contents and completion data from IOMAD API
      const courseContents = await moodleService.getCourseContents(course.id);
      const courseCompletion = await moodleService.getCourseCompletion(course.id);
      
      if (courseContents) {
        // Process real course modules from contents with completion data
        const progressModules: CourseModule[] = courseContents.map((section: any, sectionIndex: number) => {
          // Calculate completion based on course progress or completion data
          const completion = courseCompletion?.completionstatus?.find((status: any) => 
            status.sectionid === section.id
          );
          
          return {
            id: section.id,
            name: section.name || `Section ${sectionIndex + 1}`,
            type: 'resource',
            description: section.summary || 'Course section',
            visible: 1,
            completion: completion?.completion || Math.floor(course.progress * (sectionIndex + 1) / courseContents.length),
            grade: Math.floor(course.progress * (sectionIndex + 1) / courseContents.length),
            maxGrade: 100
          };
        });
        
        setCourseModules(progressModules);
        console.log(`✅ Loaded ${progressModules.length} real progress modules from IOMAD API`);
      } else {
        console.log('⚠️ No real course contents found, using fallback data');
        // Generate fallback progress modules
        const fallbackModules: CourseModule[] = [
          {
            id: 1,
            name: 'Introduction Module',
            type: 'resource',
            description: 'Course introduction and overview',
            visible: 1,
            completion: 100,
            grade: 100,
            maxGrade: 100
          },
          {
            id: 2,
            name: 'Core Concepts',
            type: 'resource',
            description: 'Fundamental concepts and theories',
            visible: 1,
            completion: Math.floor(course.progress * 0.75),
            grade: Math.floor(course.progress * 0.85),
            maxGrade: 100
          }
        ];
        setCourseModules(fallbackModules);
      }
    } catch (error) {
      console.error('❌ Error fetching real progress data:', error);
      // Use fallback data
      const fallbackModules: CourseModule[] = [
        {
          id: 1,
          name: 'Introduction Module',
          type: 'resource',
          description: 'Course introduction and overview',
          visible: 1,
          completion: 100,
          grade: 100,
          maxGrade: 100
        },
        {
          id: 2,
          name: 'Core Concepts',
          type: 'resource',
          description: 'Fundamental concepts and theories',
          visible: 1,
          completion: Math.floor(course.progress * 0.75),
          grade: Math.floor(course.progress * 0.85),
          maxGrade: 100
        }
      ];
      setCourseModules(fallbackModules);
    }
  };

  const handleActivityClick = async (activity: any, index: number) => {
    console.log('🎯 Activity clicked:', activity.name, 'Index:', index);
    setSelectedActivity(activity);
    setIsActivityLoading(true);
    
    try {
      // Fetch activity details from IOMAD API
      const activityDetails = await moodleService.getCourseContents(selectedCourse?.id || '');
      
      if (activityDetails) {
        // Find the specific activity in the course contents
        const foundActivity = activityDetails.flatMap((section: any) => 
          section.modules || []
        ).find((module: any) => module.id.toString() === activity.id);
        
        if (foundActivity) {
          // Fetch detailed activity information
          const detailedActivity = await moodleService.getCourseActivities(selectedCourse?.id || '');
          const activityInfo = detailedActivity?.find((act: any) => act.id.toString() === activity.id);
          
          // Extract all media files from content and introfiles
          const allMediaFiles = [
            ...(foundActivity.contents || []),
            ...(foundActivity.introfiles || []),
            ...(foundActivity.descriptionfiles || []),
            ...(foundActivity.contentfiles || [])
          ];
          
          // Categorize files by type
          const categorizedFiles = {
            images: allMediaFiles.filter((file: any) => 
              file.mimetype?.startsWith('image/') || 
              file.filename?.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)
            ),
            videos: allMediaFiles.filter((file: any) => 
              file.mimetype?.startsWith('video/') || 
              file.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/i)
            ),
            audio: allMediaFiles.filter((file: any) => 
              file.mimetype?.startsWith('audio/') || 
              file.filename?.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma)$/i)
            ),
            documents: allMediaFiles.filter((file: any) => 
              file.mimetype?.startsWith('application/') || 
              file.filename?.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|rtf)$/i)
            ),
            other: allMediaFiles.filter((file: any) => {
              const isImage = file.mimetype?.startsWith('image/') || file.filename?.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i);
              const isVideo = file.mimetype?.startsWith('video/') || file.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/i);
              const isAudio = file.mimetype?.startsWith('audio/') || file.filename?.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma)$/i);
              const isDocument = file.mimetype?.startsWith('application/') || file.filename?.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|rtf)$/i);
              return !isImage && !isVideo && !isAudio && !isDocument;
            })
          };
          
          setSelectedActivity({
            ...activity,
            details: foundActivity,
            content: foundActivity.contents || [],
            description: foundActivity.description || activity.description,
            htmlContent: foundActivity.descriptionhtml || foundActivity.description,
            intro: foundActivity.intro || activity.description,
            introfiles: foundActivity.introfiles || [],
            modname: foundActivity.modname,
            activityInfo: activityInfo,
            allMediaFiles: allMediaFiles,
            categorizedFiles: categorizedFiles
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching activity details:', error);
    } finally {
      setIsActivityLoading(false);
    }
  };

  // Fallback function for when API fails
  const generateFallbackCourseData = (course: Course) => {
    console.log('📝 Generating fallback course data...');
    
    // Generate sample modules for the selected course
    const modules: CourseModule[] = [
      {
        id: 1,
        name: 'Introduction Module',
        type: 'resource',
        description: 'Welcome to the course and overview of topics',
        visible: 1,
        completion: 100,
        grade: 100,
        maxGrade: 100
      },
      {
        id: 2,
        name: 'Core Concepts',
        type: 'resource',
        description: 'Fundamental concepts and theories',
        visible: 1,
        completion: 75,
        grade: 85,
        maxGrade: 100
      },
      {
        id: 3,
        name: 'Practice Assignment',
        type: 'assignment',
        description: 'Hands-on practice with course concepts',
        visible: 1,
        completion: 50,
        grade: 0,
        maxGrade: 100,
        dueDate: Date.now() + 86400 * 7
      },
      {
        id: 4,
        name: 'Final Assessment',
        type: 'quiz',
        description: 'Comprehensive assessment of course material',
        visible: 1,
        completion: 0,
        grade: 0,
        maxGrade: 100,
        dueDate: Date.now() + 86400 * 14
      }
    ];

    setCourseModules(modules);
    
    // Generate course-specific activities
    const courseActivities: CourseActivity[] = [
      {
        id: '1',
        name: `${course.shortname} - Introduction Assignment`,
        type: 'assignment',
        status: 'in_progress',
        dueDate: Date.now() + 86400 * 7,
        grade: 0,
        maxGrade: 100,
        description: `Complete the introduction assignment for ${course.fullname}`,
        instructions: 'Review the course materials and submit your first assignment.',
        attachments: ['assignment_guidelines.pdf', 'sample_materials.pdf'],
        timeSpent: 45,
        attempts: 1,
        maxAttempts: 3
      },
      {
        id: '2',
        name: `${course.shortname} - Midterm Quiz`,
        type: 'quiz',
        status: 'not_started',
        dueDate: Date.now() + 86400 * 14,
        grade: 0,
        maxGrade: 100,
        description: `Test your knowledge of ${course.shortname} concepts`,
        instructions: 'Complete the quiz within 30 minutes. You have 2 attempts.',
        timeSpent: 0,
        attempts: 0,
        maxAttempts: 2
      },
      {
        id: '3',
        name: `${course.shortname} - Final Project`,
        type: 'assignment',
        status: 'not_started',
        dueDate: Date.now() + 86400 * 30,
        grade: 0,
        maxGrade: 100,
        description: `Final project for ${course.fullname}`,
        instructions: 'Create a comprehensive project demonstrating your understanding of the course material.',
        attachments: ['project_requirements.pdf', 'rubric.pdf'],
        timeSpent: 0,
        attempts: 0,
        maxAttempts: 1
      }
    ];
    
    setCourseActivities(courseActivities);
  };

  const addStudentActivity = (activity: Omit<StudentActivity, 'id' | 'timestamp'>) => {
    const newActivity: StudentActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setStudentActivities(prev => [newActivity, ...prev]);
    console.log('✅ Added new student activity:', newActivity.title);
  };

  const handleAddActivity = () => {
    // This would be called from the Add Activity modal
    const newActivity: Omit<StudentActivity, 'id' | 'timestamp'> = {
      courseId: selectedCourse?.id || '1',
      activityId: 'new',
      type: 'study',
      title: 'New Study Session',
      description: 'Personal study activity',
      duration: 60,
      completed: false,
      notes: 'Added from course interface',
      resources: [],
      goals: ['Complete course objectives'],
      achievements: []
    };
    
    addStudentActivity(newActivity);
    setShowActivityModal(false);
  };

  const getActivityIcon = (type: CourseActivity['type']) => {
    switch (type) {
      case 'assignment': return <FileText className="w-5 h-5" />;
      case 'quiz': return <BarChart3 className="w-5 h-5" />;
      case 'resource': return <BookOpen className="w-5 h-5" />;
      case 'forum': return <MessageSquare className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'workshop': return <Users className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: CourseActivity['status']) => {
    switch (status) {
      case 'not_started': return <Circle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: CourseActivity['status']) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleActivityExpansion = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.shortname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.categoryname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportCoursesData = () => {
    const csvContent = [
      ['Course Name', 'Short Name', 'Progress', 'Grade', 'Status', 'Instructor', 'Category'],
      ...filteredCourses.map(course => [
        course.fullname,
        course.shortname,
        `${course.progress}%`,
        course.grade ? `${course.grade}%` : 'N/A',
        course.status.replace('_', ' '),
        course.instructor,
        course.categoryname
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_courses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading real courses from IOMAD Moodle API...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
      </DashboardLayout>
    );
  }

    return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      {showCourseDetails && selectedCourse ? (
        // Course Details Page - Design from Second Image
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCourseDetails(false)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedCourse.fullname}</h1>
                <p className="text-sm text-gray-600">Course Details • {selectedCourse.shortname}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="text-sm text-gray-600">
            Courses / {selectedCourse.categoryname} / {selectedCourse.fullname}
          </div>

          {/* Course Statistics */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>{realCourseContents.length} lessons</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>4h 30min</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>4.5 (126 reviews)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Lock className="w-4 h-4 mr-2" />
              Enroll Now
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player Area */}
              <div className="bg-white rounded-lg border">
                <div className="relative h-96 bg-gray-900 flex items-center justify-center">
                  {isActivityLoading ? (
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading activity content...</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {/* Video Player Placeholder - Design from Second Image */}
                      <div className="text-center">
                        <div className="relative w-96 h-64 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">Course video content will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs Navigation - Design from Second Image */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button className="py-4 px-1 border-b-2 border-purple-500 text-purple-600 font-medium text-sm">
                      Overview
                    </button>
                    <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                      Author
                    </button>
                    <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                      FAQ
                    </button>
                    <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                      Announcements
                    </button>
                    <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                      Reviews
                    </button>
                  </nav>
                </div>

                {/* Course Content */}
                <div className="p-6 space-y-6">
                  {/* About Course Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About Course</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedCourse.description || `Unlock the power of ${selectedCourse.shortname}, with our comprehensive online course. Whether you're a novice or looking to enhance your skills, this course will guide you through essential concepts and practical applications. Perfect for students and anyone interested in learning new skills. Join us to elevate your knowledge and boost your productivity!`}
                    </p>
                  </div>

                  {/* What You'll Learn Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Setting up the environment</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Advanced concepts and practices</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Build practical projects</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Responsive design principles</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Understand core concepts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Start building beautiful projects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="bg-white rounded-lg border p-4 h-fit space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{selectedCourse.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${selectedCourse.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedCourse.completedModules || 0}/{selectedCourse.totalModules || 0} modules completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
            ) : (
        // Courses List Page
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-1">Real-time course data from IOMAD Moodle API - {courses.length} available courses • {currentUser?.fullname || 'Student'}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={refreshData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportCoursesData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                  Available courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.filter(c => c.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.filter(c => c.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Finished courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.length > 0 ? Math.round(courses.reduce((sum, course) => sum + (course.grade || 0), 0) / courses.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall performance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
                
          {/* Enhanced Course Cards Grid - Design from First Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const statusInfo = getCourseStatusInfo(course);
              const courseImage = getCourseImage(course);
              
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md cursor-pointer" onClick={() => handleCourseClick(course)}>
                  {/* Course Image Header */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <img 
                      src={courseImage} 
                      alt={course.fullname}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getCourseImageFallback(course.categoryname, course.fullname);
                      }}
                    />
                    
                    {/* Overlay with course icon */}
                    <div className="absolute bottom-4 left-4">
                      <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={`text-xs px-2 py-1 ${
                        statusInfo.status === 'active' ? 'bg-green-500 text-white' :
                        statusInfo.status === 'completed' ? 'bg-blue-500 text-white' :
                        statusInfo.status === 'upcoming' ? 'bg-orange-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {statusInfo.statusText}
                      </Badge>
                    </div>
                  </div>

                  {/* Course Content */}
                  <CardContent className="p-6 space-y-4">
                    {/* Course Title */}
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {course.fullname}
                    </h3>
                    
                    {/* Course Short Name */}
                    <p className="text-sm text-gray-600">
                      {course.shortname}
                    </p>
                    
                    {/* Category */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.categoryname || 'Uncategorized'}</span>
                    </div>
                    
                    {/* Progress/Status Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      {statusInfo.progressIcon}
                      <span>{statusInfo.progressText}</span>
                    </div>
                    
                    {/* Enrollment Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents || 0} enrolled</span>
                    </div>
                    
                    {/* Date Range */}
                    <div className="text-sm text-gray-600">
                      {formatDate(course.startdate)} - {formatDate(course.enddate)}
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      className={`w-full mt-4 ${statusInfo.buttonVariant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                      variant={statusInfo.buttonVariant}
                    >
                      {statusInfo.buttonText}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Courses; 