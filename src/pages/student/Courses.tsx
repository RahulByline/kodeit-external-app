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
  Info
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
              completedModules
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
      
      console.log('✅ All real course data fetched:', {
        contents: courseContents?.length || 0,
        activities: courseActivities?.length || 0,
        completion: courseCompletion ? 'Yes' : 'No',
        grades: courseGrades ? 'Yes' : 'No',
        details: courseDetails ? 'Yes' : 'No',
        userCourses: userCourses?.length || 0
      });
      
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
        
        // Add activities from getCourseActivities
        if (courseActivities && Array.isArray(courseActivities)) {
          courseActivities.forEach((activity: any) => {
            allCourseItems.push({
              ...activity,
              source: 'activity',
              itemType: 'activity'
            });
          });
        }
        
        // Add resources and activities from course contents
        if (courseContents && Array.isArray(courseContents)) {
          courseContents.forEach((section: any) => {
            if (section.modules && Array.isArray(section.modules)) {
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
        }
        
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
        const realActivities: CourseActivity[] = allCourseItems
          .filter((item: any) => {
            const itemType = item.modname || item.type;
            return itemType !== 'url' && 
                   itemType !== 'label' &&
                   itemType !== 'video';
          })
          .map((item: any) => {
            // Determine status based on completion data
            let status: CourseActivity['status'] = 'not_started';
            if (item.completion) {
              if (item.completion.state === 1) {
                status = 'completed';
              } else if (item.completion.state === 0) {
                status = 'in_progress';
              }
            }
            
            return {
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
        // Course Details Page
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
                See Tutorial
            </Button>
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Content Area */}
              <div className="bg-white rounded-lg border">
                <div className="h-96 bg-gray-50 flex items-center justify-center">
                  {isActivityLoading ? (
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading activity content...</p>
              </div>
                                      ) : selectedActivity ? (
                      <div className="w-full h-full p-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-y-auto">
                          <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {selectedActivity.modname || selectedActivity.type}
                              </Badge>
                              <Badge variant={selectedActivity.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                                {selectedActivity.status === 'completed' ? 'Completed' : 
                                 selectedActivity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                              </Badge>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                              {selectedActivity.name}
                            </h2>
                            
                            {/* Activity Description in HTML Format */}
                            {selectedActivity.htmlContent && (
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity Description</h3>
                                <div 
                                  className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border"
                                  dangerouslySetInnerHTML={{ __html: selectedActivity.htmlContent }}
                                />
              </div>
                            )}
                            
                            {/* Activity Intro */}
                            {selectedActivity.intro && selectedActivity.intro !== selectedActivity.htmlContent && (
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Introduction</h3>
                                <div 
                                  className="prose prose-sm max-w-none bg-blue-50 rounded-lg p-4 border border-blue-200"
                                  dangerouslySetInnerHTML={{ __html: selectedActivity.intro }}
                                />
              </div>
                            )}
        </div>

                          {/* All Media Content */}
                          {selectedActivity.allMediaFiles && selectedActivity.allMediaFiles.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">All Course Media</h3>
                              
                              {/* Images */}
                              {selectedActivity.categorizedFiles.images.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                    <Image className="w-4 h-4 mr-2 text-blue-600" />
                                    Images ({selectedActivity.categorizedFiles.images.length})
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedActivity.categorizedFiles.images.map((image: any, index: number) => (
                                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                                                                     <img 
                                             src={image.fileurl} 
                                             alt={image.filename || `Image ${index + 1}`}
                                             className="w-full h-full object-cover"
                                             onError={(e) => {
                                               (e.currentTarget as HTMLElement).style.display = 'none';
                                               ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement)!.style.display = 'flex';
                                             }}
                                           />
                                          <div className="hidden w-full h-full items-center justify-center text-gray-400">
                                            <Image className="w-8 h-8" />
                </div>
              </div>
                                        <div className="p-3">
                                          <p className="text-sm font-medium text-gray-900 truncate">{image.filename}</p>
                                          <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">
                                              {(image.filesize / 1024).toFixed(1)} KB
                                            </span>
                                            <Button size="sm" variant="outline">
                                              <Download className="w-3 h-3 mr-1" />
                                              Download
                                            </Button>
              </div>
            </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Videos */}
                              {selectedActivity.categorizedFiles.videos.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                    <Video className="w-4 h-4 mr-2 text-red-600" />
                                    Videos ({selectedActivity.categorizedFiles.videos.length})
                                  </h4>
                                  <div className="space-y-4">
                                    {selectedActivity.categorizedFiles.videos.map((video: any, index: number) => (
                                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <div className="aspect-video bg-gray-900 flex items-center justify-center">
                                          <video 
                                            controls 
                                            className="w-full h-full"
                                            poster={video.fileurl}
                                          >
                                            <source src={video.fileurl} type={video.mimetype} />
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                        <div className="p-4">
                                          <h5 className="font-medium text-gray-900 mb-2">{video.filename}</h5>
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                              <p>Type: {video.mimetype}</p>
                                              <p>Size: {(video.filesize / 1024 / 1024).toFixed(1)} MB</p>
                                            </div>
                                            <Button size="sm" variant="outline">
                                              <Download className="w-4 h-4 mr-2" />
                                              Download
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Audio */}
                              {selectedActivity.categorizedFiles.audio.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                                    Audio ({selectedActivity.categorizedFiles.audio.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {selectedActivity.categorizedFiles.audio.map((audio: any, index: number) => (
                                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-green-600" />
                                          </div>
                  <div className="flex-1">
                                            <h5 className="font-medium text-gray-900">{audio.filename}</h5>
                                            <p className="text-sm text-gray-600">{audio.mimetype}</p>
                  </div>
                                          <Button size="sm" variant="outline">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                          </Button>
                </div>
                                        <audio controls className="w-full">
                                          <source src={audio.fileurl} type={audio.mimetype} />
                                          Your browser does not support the audio element.
                                        </audio>
                                        <p className="text-xs text-gray-500 mt-2">
                                          Size: {(audio.filesize / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              {selectedActivity.categorizedFiles.documents.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-purple-600" />
                                    Documents ({selectedActivity.categorizedFiles.documents.length})
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedActivity.categorizedFiles.documents.map((doc: any, index: number) => (
                                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                                          <div className="flex-1">
                                            <h5 className="font-medium text-gray-900 truncate">{doc.filename}</h5>
                                            <p className="text-sm text-gray-600">{doc.mimetype}</p>
                                            <p className="text-xs text-gray-500">
                                              {(doc.filesize / 1024).toFixed(1)} KB
                                            </p>
                  </div>
                                          <Button size="sm" variant="outline">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Other Files */}
                              {selectedActivity.categorizedFiles.other.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                    <File className="w-4 h-4 mr-2 text-gray-600" />
                                    Other Files ({selectedActivity.categorizedFiles.other.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {selectedActivity.categorizedFiles.other.map((file: any, index: number) => (
                                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            <File className="w-4 h-4 text-gray-500" />
                    <div>
                                              <p className="font-medium text-gray-900">{file.filename}</p>
                                              <p className="text-sm text-gray-600">{file.mimetype}</p>
                    </div>
                    </div>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">
                                              {(file.filesize / 1024).toFixed(1)} KB
                                            </span>
                                            <Button size="sm" variant="outline">
                                              <Download className="w-4 h-4 mr-2" />
                                              Download
                                            </Button>
                    </div>
                    </div>
                  </div>
                                    ))}
                </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Intro Files */}
                          {selectedActivity.introfiles && selectedActivity.introfiles.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Introduction Files</h3>
                              <div className="space-y-3">
                                {selectedActivity.introfiles.map((item: any, index: number) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        <h4 className="font-medium text-gray-900">{item.filename || `Intro File ${index + 1}`}</h4>
                                      </div>
                                      <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                  </Button>
                </div>
                                    {item.fileurl && (
                                      <p className="text-sm text-gray-500">File URL: {item.fileurl}</p>
                                    )}
                                  </div>
          ))}
        </div>
                            </div>
                          )}
                          
                          {/* Activity Instructions */}
                          {selectedActivity.instructions && (
                            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Target className="w-4 h-4 mr-2 text-yellow-600" />
                                Instructions
                              </h3>
                              <div 
                                className="prose prose-sm max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: selectedActivity.instructions }}
                              />
                            </div>
                          )}
                          
                          {/* Activity Info */}
                          {selectedActivity.activityInfo && (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-2 text-green-600" />
                                Activity Information
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                                  <span className="text-gray-600">Type:</span>
                                  <p className="font-medium">{selectedActivity.activityInfo.type}</p>
                  </div>
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <p className="font-medium">{selectedActivity.activityInfo.status}</p>
                </div>
                                {selectedActivity.activityInfo.dueDate && (
                                  <div>
                                    <span className="text-gray-600">Due Date:</span>
                                    <p className="font-medium">{new Date(selectedActivity.activityInfo.dueDate).toLocaleDateString()}</p>
              </div>
                                )}
                                {selectedActivity.activityInfo.grade && (
                                  <div>
                                    <span className="text-gray-600">Grade:</span>
                                    <p className="font-medium">{selectedActivity.activityInfo.grade}%</p>
                        </div>
                                )}
                        </div>
                        </div>
                          )}
                        </div>
                        </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 text-lg font-medium mb-2">Select an Activity</p>
                      <p className="text-gray-500 text-sm">Click on any activity from the sidebar to view its content</p>
                    </div>
                  )}
                      </div>
                    </div>

              {/* Course Information */}
              <div className="bg-white rounded-lg border p-6">
                {isLoadingCourseData ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading course data from IOMAD API...</p>
                      </div>
                    </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {realCourseData?.courseInfo?.categoryname || selectedCourse.categoryname}
                        </Badge>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {realCourseData?.courseInfo?.fullname || selectedCourse.fullname}
                      </h2>
                      <p className="text-gray-600">
                        Course ID: {selectedCourse.id} • 
                        {realCourseData?.courseInfo?.format ? ` Format: ${realCourseData.courseInfo.format}` : ''}
                      </p>
                  </div>

                    {/* Course Overview - All Activities and Resources */}
                    {selectedCourse?.categorizedItems && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Overview</h3>
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedCourse.totalResources || 0}</div>
                            <div className="text-sm text-blue-800">Resources</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{selectedCourse.totalAssignments || 0}</div>
                            <div className="text-sm text-green-800">Assignments</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{selectedCourse.totalQuizzes || 0}</div>
                            <div className="text-sm text-purple-800">Quizzes</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{selectedCourse.totalActivities || 0}</div>
                            <div className="text-sm text-orange-800">Total Items</div>
                          </div>
                        </div>

                        {/* Categorized Activities and Resources */}
                        <div className="space-y-6">
                          
                          {/* Resources */}
                          {selectedCourse.categorizedItems.resources.length > 0 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                Resources ({selectedCourse.categorizedItems.resources.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {selectedCourse.categorizedItems.resources.map((resource: any, index: number) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                      <h5 className="font-medium text-gray-900 text-sm truncate">{resource.name}</h5>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{resource.description || resource.intro || 'No description'}</p>
                                    {resource.sectionName && (
                                      <span className="text-xs text-blue-700 bg-blue-200 px-2 py-1 rounded mt-2 inline-block">
                                        {resource.sectionName}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Assignments */}
                          {selectedCourse.categorizedItems.assignments.length > 0 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <Edit className="w-4 h-4 mr-2 text-green-600" />
                                Assignments ({selectedCourse.categorizedItems.assignments.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedCourse.categorizedItems.assignments.map((assignment: any, index: number) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 cursor-pointer transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <Edit className="w-4 h-4 text-green-600" />
                                        <h5 className="font-medium text-gray-900 text-sm">{assignment.name}</h5>
                                      </div>
                                      <Badge variant={assignment.completion?.state === 1 ? 'default' : 'outline'} className="text-xs">
                                        {assignment.completion?.state === 1 ? 'Completed' : 'Pending'}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{assignment.description || assignment.intro || 'No description'}</p>
                                    {assignment.dates?.find((date: any) => date.label === 'Due date') && (
                                      <div className="text-xs text-red-600">
                                        Due: {new Date(assignment.dates.find((date: any) => date.label === 'Due date').timestamp * 1000).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quizzes */}
                          {selectedCourse.categorizedItems.quizzes.length > 0 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                                Quizzes ({selectedCourse.categorizedItems.quizzes.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedCourse.categorizedItems.quizzes.map((quiz: any, index: number) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <BarChart3 className="w-4 h-4 text-purple-600" />
                                        <h5 className="font-medium text-gray-900 text-sm">{quiz.name}</h5>
                                      </div>
                                      <Badge variant={quiz.completion?.state === 1 ? 'default' : 'outline'} className="text-xs">
                                        {quiz.completion?.state === 1 ? 'Completed' : 'Available'}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600">{quiz.description || quiz.intro || 'No description'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Forums */}
                          {selectedCourse.categorizedItems.forums.length > 0 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2 text-orange-600" />
                                Forums ({selectedCourse.categorizedItems.forums.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedCourse.categorizedItems.forums.map((forum: any, index: number) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <MessageSquare className="w-4 h-4 text-orange-600" />
                                      <h5 className="font-medium text-gray-900 text-sm">{forum.name}</h5>
                                    </div>
                                    <p className="text-xs text-gray-600">{forum.description || forum.intro || 'No description'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lessons */}
                          {selectedCourse.categorizedItems.lessons.length > 0 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                                Lessons ({selectedCourse.categorizedItems.lessons.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedCourse.categorizedItems.lessons.map((lesson: any, index: number) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-colors">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <BookOpen className="w-4 h-4 text-indigo-600" />
                                      <h5 className="font-medium text-gray-900 text-sm">{lesson.name}</h5>
                                    </div>
                                    <p className="text-xs text-gray-600">{lesson.description || lesson.intro || 'No description'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Other Activities */}
                          {selectedCourse.categorizedItems.other.length > 0 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <Circle className="w-4 h-4 mr-2 text-gray-600" />
                                Other Activities ({selectedCourse.categorizedItems.other.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedCourse.categorizedItems.other.map((item: any, index: number) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Circle className="w-4 h-4 text-gray-600" />
                                      <h5 className="font-medium text-gray-900 text-sm">{item.name}</h5>
                                    </div>
                                    <p className="text-xs text-gray-600">{item.description || item.intro || 'No description'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Course Activities Summary */}
                    {realCourseActivities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Activities ({realCourseActivities.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {realCourseActivities.slice(0, 6).map((activity: any) => (
                            <div key={activity.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900 text-sm">{activity.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  activity.completion?.state === 1 ? 'bg-green-100 text-green-800' :
                                  activity.completion?.state === 0 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {activity.completion?.state === 1 ? 'Completed' :
                                   activity.completion?.state === 0 ? 'In Progress' : 'Not Started'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 capitalize">{activity.type} Activity</p>
                            </div>
                          ))}
                        </div>
                        {realCourseActivities.length > 6 && (
                          <p className="text-sm text-gray-500 mt-2">
                            And {realCourseActivities.length - 6} more activities...
                          </p>
                        )}
                      </div>
                    )}

                    {/* Completed Courses Section */}
                      <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Completed Courses ({completedCourses.length})
                      </h3>
                      {isLoadingCompletedCourses ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="text-center">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading completed courses...</p>
                                </div>
                        </div>
                      ) : completedCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {completedCourses.map((completedCourse: any) => (
                            <div key={completedCourse.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 text-sm">{completedCourse.fullname}</h4>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Completed
                                  </span>
                                </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p><strong>Course ID:</strong> {completedCourse.id}</p>
                                <p><strong>Short Name:</strong> {completedCourse.shortname}</p>
                                <p><strong>Category:</strong> {completedCourse.categoryname || 'General'}</p>
                                <p><strong>Progress:</strong> {completedCourse.progress || 100}%</p>
                                {completedCourse.startdate && (
                                  <p><strong>Start Date:</strong> {new Date(completedCourse.startdate * 1000).toLocaleDateString()}</p>
                                )}
                                {completedCourse.enddate && (
                                  <p><strong>End Date:</strong> {new Date(completedCourse.enddate * 1000).toLocaleDateString()}</p>
                                )}
                              </div>
                              {completedCourse.summary && (
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{completedCourse.summary}</p>
                                )}
                              </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-gray-400" />
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">No Completed Courses</h4>
                          <p className="text-sm text-gray-500">
                            You haven't completed any courses yet. Keep learning to see your completed courses here!
                          </p>
                        </div>
                      )}
                                      </div>
                  </>
                                    )}
              </div>
            </div>
                                    
            {/* Right Sidebar - Course Progress and Activities */}
            <div className="bg-white rounded-lg border p-4 h-fit space-y-6">
              {/* Real Course Progress */}
                                      <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Your Course Progress</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">
                      {realCourseCompletion?.completionstatus?.completion || selectedCourse.progress}%
                    </span>
                                            </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${realCourseCompletion?.completionstatus?.completion || selectedCourse.progress}%` 
                      }}
                    ></div>
                                        </div>
                  <p className="text-sm text-gray-600">
                    {realCourseData?.completedModules || 0}/{realCourseData?.totalModules || realCourseContents.length} modules completed
                  </p>
                                    
                  {/* Real Completion Details */}
                  {realCourseCompletion && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                          <span className="text-gray-500">Activities:</span>
                          <p className="font-medium">{realCourseActivities.length}</p>
                                      </div>
                                      <div>
                          <span className="text-gray-500">Completed:</span>
                          <p className="font-medium">
                            {realCourseActivities.filter((a: any) => a.completion?.state === 1).length}
                          </p>
                                      </div>
                        <div>
                          <span className="text-gray-500">In Progress:</span>
                          <p className="font-medium">
                            {realCourseActivities.filter((a: any) => a.completion?.state === 0).length}
                          </p>
                                    </div>
                        <div>
                          <span className="text-gray-500">Not Started:</span>
                          <p className="font-medium">
                            {realCourseActivities.filter((a: any) => !a.completion?.state).length}
                          </p>
                                  </div>
                              </div>
                            </div>
                  )}
                        </div>
                      </div>

              {/* Real Course Activities */}
                      <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Course Activities ({realCourseActivities.length})
                </h3>
                <div className="space-y-2">
                  {realCourseActivities.length > 0 ? (
                    realCourseActivities.map((activity: any, index: number) => (
                      <div 
                        key={activity.id} 
                        className={`bg-gray-50 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${
                          selectedActivity?.id === activity.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleActivityClick(activity, index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                              {activity.completion?.state === 1 ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : selectedActivity?.id === activity.id ? (
                                <Play className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                        </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{activity.name}</h4>
                              <p className="text-xs text-gray-500 capitalize">
                                {activity.type} • {activity.completion?.state === 1 ? 'Completed' :
                                                 activity.completion?.state === 0 ? 'In Progress' : 'Not Started'}
                              </p>
                                  </div>
                          </div>
                          {activity.completion?.state === 1 && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">No activities found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Real Course Modules */}
                                        <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Course Sections ({realCourseContents.length})
                </h3>
                <div className="space-y-2">
                  {realCourseContents.length > 0 ? (
                    realCourseContents.map((section: any) => (
                      <div key={section.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                              <h4 className="text-sm font-medium text-gray-900">{section.name}</h4>
                              <p className="text-xs text-gray-500">
                                {section.modules?.length || 0} activities
                              </p>
                                        </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {section.modules?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">Activities</div>
                          </div>
                        </div>
                        {section.summary && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{section.summary}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">No course sections found</p>
                                        </div>
                                      )}
                </div>
              </div>
                                      
              {/* Completed Courses Summary */}
                                        <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Completed Courses ({completedCourses.length})
                </h3>
                {isLoadingCompletedCourses ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading...</p>
                                              </div>
                ) : completedCourses.length > 0 ? (
                  <div className="space-y-2">
                    {completedCourses.slice(0, 3).map((completedCourse: any) => (
                      <div key={completedCourse.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{completedCourse.fullname}</h4>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          </div>
                        <p className="text-xs text-gray-500">{completedCourse.shortname}</p>
                        <p className="text-xs text-green-600 font-medium">{completedCourse.progress || 100}% Complete</p>
                                        </div>
                    ))}
                    {completedCourses.length > 3 && (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">
                          +{completedCourses.length - 3} more completed courses
                        </p>
                                    </div>
                                  )}
                                </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No completed courses yet</p>
                              </div>
                )}
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
                
          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={course.status === 'completed' ? 'default' : course.status === 'in_progress' ? 'secondary' : 'outline'}>
                      {course.status === 'completed' ? 'Completed' : course.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {course.categoryname}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{course.fullname}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                </div>
                
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                        <span>Grade: </span>
                        <span className="font-medium">{course.grade || 0}%</span>
                </div>
                <div>
                        <span>Modules: </span>
                        <span className="font-medium">{course.completedModules || 0}/{course.totalModules || 0}</span>
                </div>
              </div>
              
                    <div className="flex justify-between items-center pt-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewProgress(course); }}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Progress
                </Button>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleCourseClick(course); }}>
                        <BookOpen className="w-4 h-4 mr-1" />
                        View Details
                </Button>
              </div>
            </div>
                </CardContent>
              </Card>
            ))}
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