import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building,
  Info,
  CheckCircle,
  Check,
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
  Circle,
  Minus,
  Plus as PlusIcon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { enhancedMoodleService } from '../../../services/enhancedMoodleApi';
import { authService } from '../../../services/authService';
import logo from '../../../assets/logo.png';
import ScratchEmulator from '../../../components/dashboard/Emulator/ScratchEmulator';
import CodeEditorContent from '../../../features/codeEditor/CodeEditorContent';
import LogoutDialog from '../../../components/ui/logout-dialog';

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

// Helper function to get the best available course image
const getBestCourseImage = (course: any): string => {
  // Priority order: courseimage -> imageurl -> overviewfiles -> fallback
  if (course.courseimage && course.courseimage.trim() !== '') {
    console.log(`🖼️ Using courseimage for course ${course.fullname}:`, course.courseimage);
    return course.courseimage;
  }
  
  if (course.imageurl && course.imageurl.trim() !== '') {
    console.log(`🖼️ Using imageurl for course ${course.fullname}:`, course.imageurl);
    return course.imageurl;
  }
  
  if (course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
    const imageFile = course.overviewfiles.find((file: any) => 
      file.mimetype && file.mimetype.startsWith('image/')
    );
    if (imageFile && imageFile.fileurl) {
      console.log(`🖼️ Using overviewfiles image for course ${course.fullname}:`, imageFile.fileurl);
      return imageFile.fileurl;
    }
  }
  
  // Fallback to category-based image
  const fallbackImage = getCourseImageFallback(course.categoryname, course.fullname);
  console.log(`🖼️ Using fallback image for course ${course.fullname}:`, fallbackImage);
  return fallbackImage;
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

// Helper function to get the best available lesson image
const getBestLessonImage = (lesson: any): string => {
  // Priority order: image -> imageurl -> overviewfiles -> introfiles -> fallback
  if (lesson.image && lesson.image.trim() !== '') {
    console.log(`🖼️ Using lesson image for ${lesson.name}:`, lesson.image);
    return lesson.image;
  }
  
  if (lesson.imageurl && lesson.imageurl.trim() !== '') {
    console.log(`🖼️ Using lesson imageurl for ${lesson.name}:`, lesson.imageurl);
    return lesson.imageurl;
  }
  
  if (lesson.overviewfiles && Array.isArray(lesson.overviewfiles) && lesson.overviewfiles.length > 0) {
    const imageFile = lesson.overviewfiles.find((file: any) => 
      file.mimetype && file.mimetype.startsWith('image/')
    );
    if (imageFile && imageFile.fileurl) {
      console.log(`🖼️ Using lesson overviewfiles image for ${lesson.name}:`, imageFile.fileurl);
      return imageFile.fileurl;
    }
  }
  
  if (lesson.lessonDetails?.introfiles && Array.isArray(lesson.lessonDetails.introfiles) && lesson.lessonDetails.introfiles.length > 0) {
    const imageFile = lesson.lessonDetails.introfiles.find((file: any) => 
      file.mimetype && file.mimetype.startsWith('image/')
    );
    if (imageFile && imageFile.fileurl) {
      console.log(`🖼️ Using lesson introfiles image for ${lesson.name}:`, imageFile.fileurl);
      return imageFile.fileurl;
    }
  }
  
  // Fallback to activity type-based image
  const fallbackImage = getActivityImage(lesson.moduleType);
  console.log(`🖼️ Using fallback image for lesson ${lesson.name}:`, fallbackImage);
  return fallbackImage;
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
      image: getBestCourseImage(course)
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

// Tree view component for hierarchical course display
interface CourseTreeItemProps {
  course: any;
  courseIndex: number;
  onActivityClick: (activity: any) => void;
  onStartActivity: (activity: any) => void;
}

// Handle starting an activity
const handleStartActivity = (activity: any) => {
  console.log('🚀 Starting activity:', activity.name || activity.title);
  
  try {
    // Handle different activity types
    if (activity.url) {
      // If activity has a direct URL, open it in a new tab
      console.log('📖 Opening activity URL:', activity.url);
      window.open(activity.url, '_blank', 'noopener,noreferrer');
    } else if (activity.modname && activity.id) {
      // For activities without direct URLs, try to construct the URL
      // This is common for Moodle activities that need to be accessed through the course
      const activityUrl = `https://kodeit.ae/mod/${activity.modname}/view.php?id=${activity.id}`;
      console.log('🔗 Constructed activity URL:', activityUrl);
      window.open(activityUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: try to open the course page
      if (activity.courseId) {
        const courseUrl = `https://kodeit.ae/course/view.php?id=${activity.courseId}`;
        console.log('🔗 Opening course page:', courseUrl);
        window.open(courseUrl, '_blank', 'noopener,noreferrer');
      } else {
        console.log('⚠️ No URL or course ID available for activity');
      }
    }
    
    // Show success message
    console.log('✅ Activity opened successfully');
    
  } catch (error) {
    console.error('❌ Error opening activity:', error);
    // Final fallback: try to open the course page
    if (activity.courseId) {
      const courseUrl = `https://kodeit.ae/course/view.php?id=${activity.courseId}`;
      window.open(courseUrl, '_blank', 'noopener,noreferrer');
    }
  }
};

const CourseTreeItem: React.FC<CourseTreeItemProps> = ({ course, courseIndex, onActivityClick, onStartActivity }) => {
  const [expandedCourse, setExpandedCourse] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const toggleCourse = () => {
    setExpandedCourse(!expandedCourse);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleActivity = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const handleItemClick = (itemId: string, item: any) => {
    setSelectedItem(itemId);
    if (item.type === 'activity') {
      onActivityClick(item);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative group">
      {/* Root Course Level - Enhanced styling */}
      <div 
        className={`relative bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl p-6 mb-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
          selectedItem === `course-${course.id}` ? 'ring-4 ring-pink-300 shadow-2xl scale-[1.02]' : 'hover:shadow-lg'
        }`}
        onClick={() => handleItemClick(`course-${course.id}`, course)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Course Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCourse();
              }}
              className={`w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center hover:bg-pink-300 transition-all duration-200 transform hover:scale-110 ${
                expandedCourse ? 'bg-pink-300' : ''
              }`}
            >
              {expandedCourse ? (
                <Minus className="w-4 h-4 text-pink-700" />
              ) : (
                <PlusIcon className="w-4 h-4 text-pink-700" />
              )}
            </button>
            <div>
              <h3 className="text-pink-800 font-bold text-xl">{course.name}</h3>
              <p className="text-pink-600 text-sm">{course.categoryname || 'General Course'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-pink-600 font-medium">{course.sectionCount} sections</div>
              <div className="text-xs text-pink-500">{course.activityCount || 0} activities</div>
            </div>
            <ChevronDown className={`w-5 h-5 text-pink-600 transition-transform duration-300 ${expandedCourse ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-pink-700">Course Progress</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-pink-800">{course.progress || 0}%</span>
              <div className="text-xs text-pink-600">
                ({course.completedActivities || 0}/{course.activityCount || 0} activities)
              </div>
            </div>
          </div>
          <div className="w-full bg-pink-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-700 ease-out ${getProgressColor(course.progress || 0)} relative`}
              style={{ width: `${course.progress || 0}%` }}
            >
              {/* Progress bar shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-pink-600">
            <span>{course.completedSections || 0} of {course.totalSections || 0} sections completed</span>
            <span>{course.inProgressActivities || 0} in progress</span>
          </div>
        </div>

        {/* Status and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('completed')}`}>
              {getStatusIcon('completed')}
              <span>Active</span>
            </div>
            <div className="text-sm text-pink-600">
              {course.completedSections || 0} of {course.totalSections || 0} sections completed
          </div>
          </div>
          <div className="text-xs text-pink-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Sections Level - Enhanced styling with animations */}
      {expandedCourse && course.sections && course.sections.map((section: any, sectionIndex: number) => (
        <div key={section.id} className="relative ml-8 animate-in slide-in-from-top-2 duration-300">
          {/* Enhanced connecting line */}
          <div className="absolute left-0 top-0 w-1 h-8 bg-gradient-to-b from-green-400 to-green-300 rounded-full"></div>
          
          <div 
            className={`relative bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg ${
              selectedItem === `section-${section.id}` ? 'ring-2 ring-green-400 shadow-xl scale-[1.01]' : 'hover:shadow-md'
            }`}
            onClick={() => handleItemClick(`section-${section.id}`, section)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(section.id);
                  }}
                  className={`w-6 h-6 bg-green-200 rounded-full flex items-center justify-center hover:bg-green-300 transition-all duration-200 transform hover:scale-110 ${
                    expandedSections.has(section.id) ? 'bg-green-300' : ''
                  }`}
                >
                  {expandedSections.has(section.id) ? (
                    <Minus className="w-3 h-3 text-green-700" />
                  ) : (
                    <PlusIcon className="w-3 h-3 text-green-700" />
                  )}
                </button>
                <div>
                  <h4 className="text-green-800 font-semibold text-lg">{section.name}</h4>
                  <p className="text-green-600 text-sm">Section {sectionIndex + 1}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-green-700 font-medium">{section.activityCount} activities</div>
                  <div className="text-xs text-green-600">{section.progress || 0}% complete</div>
              </div>
                <ChevronDown className={`w-4 h-4 text-green-600 transition-transform duration-300 ${expandedSections.has(section.id) ? 'rotate-180' : ''}`} />
            </div>
          </div>

            {/* Enhanced Section Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-700">Section Progress</span>
                <span className="text-xs font-bold text-green-800">{section.progress || 0}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${getProgressColor(section.progress || 0)} relative`}
                  style={{ width: `${section.progress || 0}%` }}
                >
                  {/* Progress bar shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-green-600">
                <span>{section.completedActivities || 0} of {section.totalActivities || 0} completed</span>
                <span>{section.inProgressActivities || 0} in progress</span>
              </div>
            </div>

            {/* Section Status */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('completed')}`}>
                {getStatusIcon('completed')}
                <span>Active Section</span>
              </div>
              <div className="text-xs text-green-600">
                {section.completedActivities || 0} of {section.totalActivities || 0} completed
              </div>
            </div>
          </div>

          {/* Activities Level - Enhanced styling */}
          {expandedSections.has(section.id) && section.activities && section.activities.map((activity: any, activityIndex: number) => (
            <div key={activity.id} className="relative ml-8 animate-in slide-in-from-top-2 duration-300">
              {/* Enhanced connecting line */}
              <div className="absolute left-0 top-0 w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-300 rounded-full"></div>
              
              <div 
                className={`relative bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md ${
                  selectedItem === `activity-${activity.id}` ? 'ring-2 ring-blue-400 shadow-lg scale-[1.01] bg-blue-100' : 'hover:shadow-sm'
                }`}
                onClick={() => handleItemClick(`activity-${activity.id}`, activity)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActivity(activity.id);
                      }}
                      className={`w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center hover:bg-blue-300 transition-all duration-200 transform hover:scale-110 ${
                        expandedActivities.has(activity.id) ? 'bg-blue-300' : ''
                      }`}
                    >
                      {expandedActivities.has(activity.id) ? (
                        <Minus className="w-3 h-3 text-blue-700" />
                      ) : (
                        <PlusIcon className="w-3 h-3 text-blue-700" />
                      )}
                    </button>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {React.createElement(activity.icon, { className: "w-4 h-4 text-blue-600" })}
                    </div>
                    <div>
                      <h5 className="text-blue-800 font-semibold">{activity.name}</h5>
                      <p className="text-blue-600 text-sm">{activity.type || 'Activity'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusIcon(activity.status)}
                      <span>
                        {activity.status === 'completed' ? 'Completed' : 
                         activity.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {/* Activity Progress Bar */}
                {activity.progress > 0 && (
                  <div className="ml-11 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-700">Activity Progress</span>
                      <span className="text-xs font-bold text-blue-800">{activity.progress}%</span>
              </div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${getProgressColor(activity.progress)} relative`}
                        style={{ width: `${activity.progress}%` }}
                      >
                        {/* Progress bar shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Description */}
                {activity.description && (
                  <div className="ml-11 mb-2">
                    <p className="text-sm text-blue-700 line-clamp-2">{activity.description}</p>
                  </div>
                )}

                {/* Activity Actions */}
                <div className="ml-11 flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartActivity(activity);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activity.status === 'completed' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : activity.status === 'in_progress'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {activity.status === 'completed' ? 'Review' : 
                     activity.status === 'in_progress' ? 'Continue' : 'Start Activity'}
                  </button>
                  <span className="text-xs text-blue-600">
                    {activity.duration || 'No time limit'}
                  </span>
                  {activity.points > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      {activity.points} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Activity Details Level - Enhanced styling */}
              {expandedActivities.has(activity.id) && (
                <div className="relative ml-8 animate-in slide-in-from-top-2 duration-300">
                  {/* Enhanced connecting line */}
                  <div className="absolute left-0 top-0 w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-300 rounded-full"></div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 mb-3">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">
                          <Activity className="w-3 h-3 text-purple-700" />
                        </div>
                        <h6 className="text-purple-800 font-semibold">Activity Details</h6>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-purple-700 leading-relaxed">{activity.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                        <div className="flex items-center space-x-4 text-xs text-purple-600">
                          <span>Type: {activity.type || 'Activity'}</span>
                          <span>Duration: {activity.duration || 'No limit'}</span>
                          <span>Status: {activity.status || 'Pending'}</span>
                        </div>
                      <button
                        onClick={() => onStartActivity(activity)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors transform hover:scale-105"
                      >
                          Launch Activity
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Calendar view component for schedule
interface CalendarViewProps {
  currentMonth: Date;
  scheduleData: any[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  currentMonth, 
  scheduleData, 
  selectedDate, 
  onDateSelect 
}) => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return scheduleData.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-16"></div>;
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const events = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={day}
              className={`h-16 border border-gray-200 rounded-lg p-1 cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-blue-100 border-blue-300' : 
                isToday ? 'bg-yellow-50 border-yellow-300' : 
                'hover:bg-gray-50'
              }`}
              onClick={() => onDateSelect(date)}
            >
              <div className="flex flex-col h-full">
                <div className={`text-sm font-medium ${
                  isSelected ? 'text-blue-900' : 
                  isToday ? 'text-yellow-800' : 'text-gray-900'
                }`}>
                  {day}
                </div>
                <div className="flex-1 flex flex-wrap gap-1 mt-1">
                  {events.slice(0, 2).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`w-1.5 h-1.5 rounded-full ${
                        event.priority === 'high' ? 'bg-red-500' : 
                        event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      title={event.title}
                    ></div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-gray-500">+{events.length - 2}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to get next 7 days for dashboard calendar
const getNext7Days = (): Date[] => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  
  return days;
};

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'scratch-editor' | 'code-editor' | 'ebooks' | 'ask-teacher' | 'share-class' | 'competencies' | 'grades' | 'badges' | 'settings'>('dashboard');
  const [codeEditorTab, setCodeEditorTab] = useState<'output' | 'errors' | 'terminal'>('output');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for dropdown management
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  
  // Mock notification data
  const notifications = [
    {
      id: 1,
      title: 'New Assignment Posted',
      message: 'Introduction to Programming - Assignment 3 is now available',
      time: '2 hours ago',
      type: 'assignment',
      isRead: false
    },
    {
      id: 2,
      title: 'Course Update',
      message: 'Web Development course has new content added',
      time: '1 day ago',
      type: 'course',
      isRead: false
    },
    {
      id: 3,
      title: 'Grade Posted',
      message: 'Your quiz score for Python Basics has been posted',
      time: '2 days ago',
      type: 'grade',
      isRead: true
    }
  ];
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Core data state (fetched internally)
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  
  // Activity filtering state
  const [selectedActivityType, setSelectedActivityType] = useState<string | null>(null);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  
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
  const [realSections, setRealSections] = useState<any[]>([]);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [realTreeData, setRealTreeData] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedTreeSections, setExpandedTreeSections] = useState<Set<string>>(new Set());

  // Tree view specific states
  const [treeViewData, setTreeViewData] = useState<any[]>([]);
  const [isLoadingTreeView, setIsLoadingTreeView] = useState(false);
  const [expandedTreeItems, setExpandedTreeItems] = useState<Set<string>>(new Set());
  const [selectedTreeItem, setSelectedTreeItem] = useState<string | null>(null);

  // Grades specific states
  const [gradesData, setGradesData] = useState<any[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [gradeStatistics, setGradeStatistics] = useState<any>(null);

  // Schedule specific states
  const [realScheduleData, setRealScheduleData] = useState<any[]>([]);
  const [isLoadingRealSchedule, setIsLoadingRealSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Profile and Settings states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC'
  });

  // Resource Activities states
  const [resourceActivities, setResourceActivities] = useState<any[]>([]);
  const [isLoadingResourceActivities, setIsLoadingResourceActivities] = useState(false);

  // Real upcoming lessons and activities from IOMAD
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);
  
  // Real upcoming course sessions for schedule
  const [upcomingCourseSessions, setUpcomingCourseSessions] = useState<any[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);


  // Competency system states
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [userCompetencies, setUserCompetencies] = useState<any[]>([]);
  const [competencyProgress, setCompetencyProgress] = useState<any[]>([]);
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<any>(null);
  const [showCompetencyDetail, setShowCompetencyDetail] = useState(false);

  // Badges system states
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [showBadgeDetail, setShowBadgeDetail] = useState(false);

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
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isViewingActivityInline, setIsViewingActivityInline] = useState(false);
  const [isLoadingActivityData, setIsLoadingActivityData] = useState(false);

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
  const handleTabChange = useCallback((tab: 'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'scratch-editor' | 'code-editor' | 'ebooks' | 'ask-teacher' | 'share-class' | 'competencies' | 'grades' | 'badges' | 'settings') => {
    setActiveTab(tab);
    // Reset course detail view when changing tabs
    if (tab !== 'courses') {
      setShowCourseDetail(false);
      setSelectedCourse(null);
      setSelectedSection(null);
      setCurrentPage('dashboard');
    }
    // Reset activity filtering when changing tabs
    if (tab !== 'activities') {
      setSelectedActivityType(null);
      setFilteredActivities([]);
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

  // Logout handler
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

  // Handle route changes to set active tab
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/settings')) {
      setActiveTab('settings');
    } else if (path.includes('/courses')) {
      setActiveTab('courses');
    } else if (path.includes('/lessons')) {
      setActiveTab('lessons');
    } else if (path.includes('/activities')) {
      setActiveTab('activities');
    } else if (path.includes('/achievements')) {
      setActiveTab('achievements');
    } else if (path.includes('/schedule')) {
      setActiveTab('schedule');
    } else if (path.includes('/tree-view')) {
      setActiveTab('tree-view');
    } else if (path.includes('/scratch-editor')) {
      setActiveTab('scratch-editor');
    } else if (path.includes('/code-editor')) {
      setActiveTab('code-editor');
    } else if (path.includes('/ebooks')) {
      setActiveTab('ebooks');
    } else if (path.includes('/ask-teacher')) {
      setActiveTab('ask-teacher');
    } else if (path.includes('/share-class')) {
      setActiveTab('share-class');
    } else if (path.includes('/competencies')) {
      setActiveTab('competencies');
    } else if (path.includes('/grades')) {
      setActiveTab('grades');
    } else if (path.includes('/badges')) {
      setActiveTab('badges');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  // Create an enhanced activity interface when direct fetch fails
  const createEnhancedActivityInterface = useCallback((activity: any) => {
    const activityType = activity.modname || 'activity';
    const activityName = activity.name || activity.title || 'Untitled Activity';
    
    // Create different interfaces based on activity type
    if (activityType === 'quiz') {
      return `
        <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${activityName}</h2>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">QUIZ ACTIVITY</p>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Quiz Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
              <div><strong>Type:</strong> Quiz</div>
              <div><strong>ID:</strong> ${activity.id || 'N/A'}</div>
              <div><strong>Course:</strong> ${activity.courseName || 'N/A'}</div>
              <div><strong>Section:</strong> ${activity.sectionName || 'N/A'}</div>
            </div>
          </div>
          
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Quiz Content</h3>
            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px 0;">
              This quiz is ready to be taken. The questions and answers will be loaded from the learning management system.
            </p>
            <div style="background: #e6fffa; border: 1px solid #81e6d9; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
              <p style="color: #234e52; margin: 0; font-size: 14px;">
                <strong>Note:</strong> Quiz content will be available when you start the quiz.
              </p>
            </div>
            <button onclick="window.startRealActivity('${activity.id}', '${activity.modname}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
              Start Quiz
            </button>
          </div>
        </div>
      `;
    } else if (activityType === 'assignment') {
      return `
        <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${activityName}</h2>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">ASSIGNMENT ACTIVITY</p>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Assignment Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
              <div><strong>Type:</strong> Assignment</div>
              <div><strong>ID:</strong> ${activity.id || 'N/A'}</div>
              <div><strong>Course:</strong> ${activity.courseName || 'N/A'}</div>
              <div><strong>Section:</strong> ${activity.sectionName || 'N/A'}</div>
            </div>
          </div>
          
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Assignment Content</h3>
            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px 0;">
              This assignment is ready to be completed. The instructions and submission area will be loaded from the learning management system.
            </p>
            <div style="background: #e6fffa; border: 1px solid #81e6d9; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
              <p style="color: #234e52; margin: 0; font-size: 14px;">
                <strong>Note:</strong> Assignment details will be available when you open the assignment.
              </p>
            </div>
            <button onclick="window.startRealActivity('${activity.id}', '${activity.modname}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
              Open Assignment
            </button>
          </div>
        </div>
      `;
    } else {
      // Default activity interface
      return `
        <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${activityName}</h2>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">${activityType.toUpperCase()} ACTIVITY</p>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Activity Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
              <div><strong>Type:</strong> ${activityType}</div>
              <div><strong>ID:</strong> ${activity.id || 'N/A'}</div>
              <div><strong>Course:</strong> ${activity.courseName || 'N/A'}</div>
              <div><strong>Section:</strong> ${activity.sectionName || 'N/A'}</div>
            </div>
          </div>
          
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Activity Content</h3>
            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px 0;">
              This activity is ready to be completed. The content will be loaded directly from the learning management system.
            </p>
            <div style="background: #e6fffa; border: 1px solid #81e6d9; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
              <p style="color: #234e52; margin: 0; font-size: 14px;">
                <strong>Note:</strong> Activity content will be available when you start the activity.
              </p>
            </div>
            <button onclick="window.startRealActivity('${activity.id}', '${activity.modname}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
              Start Activity
            </button>
          </div>
        </div>
      `;
    }
  }, []);

  // Handle starting an activity using IOMAD Moodle API
  const handleStartActivityModal = useCallback(async (activity: any) => {
    console.log('🚀 Starting activity inline via IOMAD Moodle API:', activity.name || activity.title);
    
    try {
      // Set loading state
      setIsViewingActivityInline(true);
      setIsLoadingActivityData(true);
      
      // Determine activity type - handle undefined cases
      const activityType = activity.modname || activity.type || 'activity';
      const activityId = activity.id || activity.coursemodule;
      
      console.log('🔍 Activity data:', {
        name: activity.name || activity.title,
        modname: activity.modname,
        type: activity.type,
        id: activity.id,
        coursemodule: activity.coursemodule,
        determinedType: activityType,
        determinedId: activityId
      });
      
      if (activityId) {
        let activityContent = '';
        
        // Use appropriate IOMAD Moodle API method based on activity type
        switch (activityType) {
          case 'quiz':
            console.log('📊 Fetching quiz data from IOMAD Moodle API...');
            try {
              const quizData = await enhancedMoodleService.getQuizData(activityId.toString());
              
              activityContent = `
                <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${quizData.name || activity.name || 'Quiz'}</h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">QUIZ ACTIVITY</p>
                  </div>
                  
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Quiz Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                      <div><strong>Name:</strong> ${quizData.name || 'N/A'}</div>
                      <div><strong>ID:</strong> ${activityId}</div>
                      <div><strong>Time Limit:</strong> ${quizData.timelimit ? Math.round(quizData.timelimit / 60) + ' minutes' : 'No limit'}</div>
                      <div><strong>Attempts:</strong> ${quizData.attempts || 'Unlimited'}</div>
                    </div>
                  </div>
                  
                  <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Quiz Description</h3>
                    <div style="color: #4a5568; line-height: 1.6; margin-bottom: 16px;">
                      ${quizData.intro || 'This quiz is ready to be taken. Click the button below to start.'}
                    </div>
                    <button onclick="window.startQuizAttempt('${activityId}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
                      Start Quiz
                    </button>
                  </div>
                </div>
              `;
            } catch (error) {
              console.log('⚠️ Quiz API failed, using fallback interface');
              activityContent = createEnhancedActivityInterface(activity);
            }
            break;
            
          case 'assignment':
            console.log('📝 Fetching assignment data from IOMAD Moodle API...');
            try {
              const assignmentData = await enhancedMoodleService.getAssignmentData(activityId.toString());
              
              activityContent = `
                <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${assignmentData.name || activity.name || 'Assignment'}</h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">ASSIGNMENT ACTIVITY</p>
                  </div>
                  
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Assignment Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                      <div><strong>Name:</strong> ${assignmentData.name || 'N/A'}</div>
                      <div><strong>ID:</strong> ${activityId}</div>
                      <div><strong>Due Date:</strong> ${assignmentData.duedate ? new Date(assignmentData.duedate * 1000).toLocaleDateString() : 'No due date'}</div>
                      <div><strong>Max Attempts:</strong> ${assignmentData.maxattempts || 'Unlimited'}</div>
                    </div>
                  </div>
                  
                  <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Assignment Description</h3>
                    <div style="color: #4a5568; line-height: 1.6; margin-bottom: 16px;">
                      ${assignmentData.intro || 'This assignment is ready to be completed. Click the button below to open it.'}
                    </div>
                    <button onclick="window.openAssignment('${activityId}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
                      Open Assignment
                    </button>
                  </div>
                </div>
              `;
            } catch (error) {
              console.log('⚠️ Assignment API failed, using fallback interface');
              activityContent = createEnhancedActivityInterface(activity);
            }
            break;
            
          case 'scorm':
            console.log('📦 Fetching SCORM data from IOMAD Moodle API...');
            try {
              const scormData = await enhancedMoodleService.getScormContentInfo(activityId.toString());
              
              activityContent = `
                <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${scormData.name || activity.name || 'SCORM Package'}</h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">SCORM ACTIVITY</p>
                  </div>
                  
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">SCORM Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                      <div><strong>Name:</strong> ${scormData.name || 'N/A'}</div>
                      <div><strong>ID:</strong> ${activityId}</div>
                      <div><strong>Version:</strong> ${scormData.version || 'N/A'}</div>
                      <div><strong>Max Attempts:</strong> ${scormData.maxattempt || 'Unlimited'}</div>
                    </div>
                  </div>
                  
                  <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">SCORM Content</h3>
                    <div style="color: #4a5568; line-height: 1.6; margin-bottom: 16px;">
                      ${scormData.intro || 'This SCORM package is ready to be launched. Click the button below to start.'}
                    </div>
                    <button onclick="window.launchScorm('${activityId}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
                      Launch SCORM
                    </button>
                  </div>
                </div>
              `;
            } catch (error) {
              console.log('⚠️ SCORM API failed, using fallback interface');
              activityContent = createEnhancedActivityInterface(activity);
            }
            break;
            
          default:
            console.log('📄 Creating generic activity interface for type:', activityType);
            activityContent = createEnhancedActivityInterface(activity);
            break;
        }
        
        // Update the selected activity with content
        const updatedActivity = {
          ...activity,
          directContent: activityContent,
          useDirectContent: true,
          isFallbackInterface: false
        };
        
        setSelectedActivity(updatedActivity);
        setIsLoadingActivityData(false);
        
        console.log('✅ Activity content loaded successfully via IOMAD Moodle API');
        
      } else {
        console.log('⚠️ No activity ID available');
        setIsLoadingActivityData(false);
      }
      
    } catch (error) {
      console.error('❌ Error loading activity content via IOMAD Moodle API:', error);
      setIsLoadingActivityData(false);
      
      // Show error message
      alert('Unable to load activity content from IOMAD Moodle. Please try again or contact support.');
    }
  }, [createEnhancedActivityInterface]);

  // Clean and process activity content
  const cleanActivityContent = useCallback((htmlContent: string, baseUrl: string) => {
    // Remove script tags that might cause issues
    htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Fix relative URLs to absolute URLs
    htmlContent = htmlContent.replace(/(src|href)="\/([^"]+)"/g, `$1="${baseUrl.replace(/\/[^\/]*$/, '')}/$2"`);
    htmlContent = htmlContent.replace(/(src|href)="\.\/([^"]+)"/g, `$1="${baseUrl.replace(/\/[^\/]*$/, '')}/$2"`);
    htmlContent = htmlContent.replace(/(src|href)="\.\.\/([^"]+)"/g, `$1="${baseUrl.replace(/\/[^\/]*$/, '').replace(/\/[^\/]*$/, '')}/$2"`);
    
    // Fix form actions to point to the correct URL
    htmlContent = htmlContent.replace(/<form([^>]*)action="([^"]*)"([^>]*)>/gi, (match, before, action, after) => {
      if (action.startsWith('/')) {
        const baseDomain = baseUrl.replace(/\/[^\/]*$/, '');
        return `<form${before}action="${baseDomain}${action}"${after}>`;
      }
      return match;
    });
    
    // Add some basic styling to make content look better
    htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        ${htmlContent}
      </div>
    `;
    
    return htmlContent;
  }, []);

  // Create a fallback activity interface when direct fetch fails
  const createActivityInterface = useCallback((activity: any) => {
    const activityType = activity.modname || 'activity';
    const activityName = activity.name || activity.title || 'Untitled Activity';
    
    return `
      <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${activityName}</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">${activityType.toUpperCase()} Activity</p>
        </div>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Activity Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
            <div><strong>Type:</strong> ${activityType}</div>
            <div><strong>ID:</strong> ${activity.id || 'N/A'}</div>
            <div><strong>Course:</strong> ${activity.courseName || 'N/A'}</div>
            <div><strong>Section:</strong> ${activity.sectionName || 'N/A'}</div>
          </div>
        </div>
        
        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Activity Content</h3>
          <p style="color: #4a5568; line-height: 1.6; margin: 0;">
            This activity is ready to be completed. The content will be loaded directly from the learning management system.
          </p>
        </div>
        
        <div style="background: #e6fffa; border: 1px solid #81e6d9; border-radius: 8px; padding: 16px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 8px; height: 8px; background: #38b2ac; border-radius: 50%; margin-right: 8px;"></div>
            <strong style="color: #234e52;">Activity Status: Ready</strong>
          </div>
          <p style="color: #234e52; margin: 0; font-size: 14px;">
            You can now interact with this activity. All progress will be automatically saved.
          </p>
        </div>
      </div>
    `;
  }, []);

  // Function to start real activity content using IOMAD Moodle API (available globally)
  const startRealActivity = useCallback(async (activityId: string, activityType: string) => {
    console.log('🚀 Starting real activity content via IOMAD Moodle API:', activityId, activityType);
    
    try {
      setIsLoadingActivityData(true);
      
      let activityContent = '';
      
      // Use appropriate IOMAD Moodle API method based on activity type
      switch (activityType) {
        case 'quiz':
          console.log('📊 Fetching quiz data from IOMAD Moodle API...');
          const quizData = await enhancedMoodleService.getQuizData(activityId);
          const quizQuestions = await enhancedMoodleService.getQuizQuestions(activityId);
          
          activityContent = `
            <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${quizData.name || 'Quiz'}</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">QUIZ ACTIVITY</p>
              </div>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Quiz Information</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                  <div><strong>Name:</strong> ${quizData.name || 'N/A'}</div>
                  <div><strong>ID:</strong> ${activityId}</div>
                  <div><strong>Time Limit:</strong> ${quizData.timelimit ? Math.round(quizData.timelimit / 60) + ' minutes' : 'No limit'}</div>
                  <div><strong>Attempts:</strong> ${quizData.attempts || 'Unlimited'}</div>
                </div>
              </div>
              
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Quiz Description</h3>
                <div style="color: #4a5568; line-height: 1.6; margin-bottom: 16px;">
                  ${quizData.intro || 'This quiz is ready to be taken. Click the button below to start.'}
                </div>
                <button onclick="window.startQuizAttempt('${activityId}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  Start Quiz
                </button>
              </div>
            </div>
          `;
          break;
          
        case 'assignment':
          console.log('📝 Fetching assignment data from IOMAD Moodle API...');
          const assignmentData = await enhancedMoodleService.getAssignmentData(activityId);
          
          activityContent = `
            <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${assignmentData.name || 'Assignment'}</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">ASSIGNMENT ACTIVITY</p>
              </div>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Assignment Information</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                  <div><strong>Name:</strong> ${assignmentData.name || 'N/A'}</div>
                  <div><strong>ID:</strong> ${activityId}</div>
                  <div><strong>Due Date:</strong> ${assignmentData.duedate ? new Date(assignmentData.duedate * 1000).toLocaleDateString() : 'No due date'}</div>
                  <div><strong>Max Attempts:</strong> ${assignmentData.maxattempts || 'Unlimited'}</div>
                </div>
              </div>
              
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">Assignment Description</h3>
                <div style="color: #4a5568; line-height: 1.6; margin-bottom: 16px;">
                  ${assignmentData.intro || 'This assignment is ready to be completed. Click the button below to open it.'}
                </div>
                <button onclick="window.openAssignment('${activityId}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  Open Assignment
                </button>
              </div>
            </div>
          `;
          break;
          
        case 'scorm':
          console.log('📦 Fetching SCORM data from IOMAD Moodle API...');
          const scormData = await enhancedMoodleService.getScormContentInfo(activityId);
          const scormLaunch = await enhancedMoodleService.launchScormContent(activityId, currentUser?.id?.toString());
          
          activityContent = `
            <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">${scormData.name || 'SCORM Package'}</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">SCORM ACTIVITY</p>
              </div>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">SCORM Information</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                  <div><strong>Name:</strong> ${scormData.name || 'N/A'}</div>
                  <div><strong>ID:</strong> ${activityId}</div>
                  <div><strong>Version:</strong> ${scormData.version || 'N/A'}</div>
                  <div><strong>Max Attempts:</strong> ${scormData.maxattempt || 'Unlimited'}</div>
                </div>
              </div>
              
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px;">SCORM Content</h3>
                <div style="color: #4a5568; line-height: 1.6; margin-bottom: 16px;">
                  ${scormData.intro || 'This SCORM package is ready to be launched. Click the button below to start.'}
                </div>
                <button onclick="window.launchScorm('${activityId}')" style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  Launch SCORM
                </button>
              </div>
            </div>
          `;
          break;
          
        default:
          console.log('📄 Fetching generic activity data from IOMAD Moodle API...');
          // For other activity types, create a generic interface
          activityContent = createEnhancedActivityInterface({ id: activityId, modname: activityType, name: 'Activity' });
          break;
      }
      
      // Update the selected activity with real content
      setSelectedActivity(prev => ({
        ...prev,
        directContent: activityContent,
        useDirectContent: true,
        isFallbackInterface: false
      }));
      
      setIsLoadingActivityData(false);
      console.log('✅ Real activity content loaded successfully via IOMAD Moodle API');
      
    } catch (error) {
      console.error('❌ Error loading real activity content via IOMAD Moodle API:', error);
      setIsLoadingActivityData(false);
      
      // Show error message
      alert('Unable to load activity content from IOMAD Moodle. Please try again or contact support.');
    }
  }, [cleanActivityContent, createEnhancedActivityInterface, currentUser?.id]);

  // Make startRealActivity available globally
  useEffect(() => {
    (window as any).startRealActivity = startRealActivity;
    return () => {
      delete (window as any).startRealActivity;
    };
  }, [startRealActivity]);


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
      const [dashboardData, realLessonsData, realSectionsData, realActivitiesData, realTreeData, realScheduleData, userProfileData, resourceActivitiesData, realGradesData, realCompetenciesData, realBadgesData] = await Promise.all([
        enhancedMoodleService.getDashboardData(currentUser.id.toString()),
          fetchRealLessons(),
          fetchRealSections(),
          fetchRealActivities(),
          fetchRealTreeViewData(),
          fetchRealScheduleData(),
          fetchUserProfile(),
          fetchResourceActivities(),
          fetchRealGrades(),
          fetchRealCompetencies(),
          fetchRealBadges()
        ]);

      // Set main dashboard data
      setCourses(dashboardData.courses);
      setActivities(dashboardData.activities);
      setAssignments(dashboardData.assignments);
      
      // Set additional IOMAD data
        setRealLessons(realLessonsData);
        setRealSections(realSectionsData);
        setRealActivities(realActivitiesData);
        setRealTreeData(realTreeData);
        setGradesData(realGradesData);
        setCompetencies(realCompetenciesData);
        setBadges(realBadgesData);

      console.log(`✅ G4G7 Dashboard loaded successfully:`);
      console.log(`📊 Courses: ${dashboardData.courses.length}, Activities: ${dashboardData.activities.length}, Assignments: ${dashboardData.assignments.length}`);
      console.log(`📚 Real Data: ${realLessonsData.length} lessons, ${realSectionsData.length} sections, ${realActivitiesData.length} activities, ${realTreeData.length} tree items`);

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
      setGradesData([]);
      setCompetencies([]);
      setBadges([]);
    } finally {
              setIsLoading(false);
    }
  };

  // Fetch real IOMAD lessons data with images
  const fetchRealLessons = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD lessons data with images...');
      const allLessons: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch lessons from each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach(async (module: any) => {
              if (module.modname === 'lesson' || module.modname === 'resource' || module.modname === 'url') {
                // Try to get lesson details with images
                let lessonImage = null;
                let lessonDetails = null;
                
                try {
                  // For lessons, try to get detailed information
                  if (module.modname === 'lesson') {
                    lessonDetails = await enhancedMoodleService.getLessonDetails(module.id.toString());
                    lessonImage = lessonDetails?.imageurl || lessonDetails?.overviewfiles?.[0]?.fileurl;
                  }
                  
                  // For resources and URLs, check for attached files
                  if (module.contents && Array.isArray(module.contents)) {
                    const imageFile = module.contents.find((content: any) => 
                      content.mimetype && content.mimetype.startsWith('image/')
                    );
                    if (imageFile && imageFile.fileurl) {
                      lessonImage = imageFile.fileurl;
                    }
                  }
                } catch (error) {
                  console.warn(`⚠️ Could not fetch image for lesson ${module.id}:`, error);
                }
                
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
                  added: module.added,
                  // Image information
                  image: lessonImage,
                  imageurl: lessonImage,
                  overviewfiles: module.contents || [],
                  // Additional lesson details
                  lessonDetails: lessonDetails,
                  lastAccessed: module.lastAccessed,
                  timeSpent: module.timeSpent || 0
                });
              }
            });
          }
        });
      }
      
      console.log(`✅ Fetched ${allLessons.length} real lessons with images from IOMAD`);
      return allLessons;
      } catch (error) {
      console.error('❌ Error fetching real lessons:', error);
      return [];
    }
  };

  // Fetch real IOMAD course sections data
  const fetchRealSections = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real course sections from IOMAD...');
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      const allSections: any[] = [];
      
      for (const course of userCourses) {
        try {
          const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
          
          for (const section of courseContents) {
            if (section.name && section.name.trim() !== '') {
              // Calculate section progress based on module completions
              const totalModules = section.modules ? section.modules.length : 0;
              const completedModules = section.modules ? section.modules.filter((module: any) => 
                module.completiondata && module.completiondata.state === 1
              ).length : 0;
              const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
              
              // Get section status
              let status = 'not-started';
              if (progress === 100) {
                status = 'completed';
              } else if (progress > 0) {
                status = 'in-progress';
              }
              
              // Get section image from first module or course
              let sectionImage = '';
              if (section.modules && section.modules.length > 0) {
                const firstModule = section.modules[0];
                if (firstModule.imageurl) {
                  sectionImage = firstModule.imageurl;
                } else if (firstModule.overviewfiles && firstModule.overviewfiles.length > 0) {
                  const imageFile = firstModule.overviewfiles.find((file: any) => 
                    file.mimetype && file.mimetype.startsWith('image/')
                  );
                  if (imageFile && imageFile.fileurl) {
                    sectionImage = imageFile.fileurl;
                  }
                }
              }
              
              // Fallback to course image
              if (!sectionImage) {
                sectionImage = getBestCourseImage(course);
              }
              
              allSections.push({
                id: section.id,
                name: section.name,
                courseId: course.id,
                courseTitle: course.fullname,
                summary: section.summary || '',
                progress: progress,
                status: status,
                totalModules: totalModules,
                completedModules: completedModules,
                image: sectionImage,
                lastAccessed: section.lastaccess ? new Date(section.lastaccess * 1000).toISOString() : undefined,
                timeSpent: section.timespent || 0,
                visible: section.visible !== 0
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️ Could not fetch sections for course ${course.id}:`, error);
        }
      }
      
      console.log(`✅ Fetched ${allSections.length} real course sections from IOMAD`);
      return allSections;
    } catch (error) {
      console.error('❌ Error fetching real sections:', error);
      return [];
    }
  };

  // Fetch real IOMAD grades data
  const fetchRealGrades = async () => {
    if (!currentUser?.id) return [];
    
    try {
      setIsLoadingGrades(true);
      console.log('🔄 Fetching real IOMAD grades data...');
      const allGrades: any[] = [];
      
      // Try to get all grades at once first (more efficient for IOMAD)
      let allUserGrades = await enhancedMoodleService.getAllUserGrades(currentUser.id.toString());
      
      if (allUserGrades.length > 0) {
        console.log(`✅ Found ${allUserGrades.length} grades using getAllUserGrades method`);
        // Process the all-user grades data
        allUserGrades.forEach((grade: any) => {
          const gradeValue = grade.grade || grade.rawgrade || grade.finalgrade || 0;
          const maxGrade = grade.grademax || grade.grademax || 100;
          const itemName = grade.itemname || grade.name || 'Assignment';
          const itemType = grade.itemtype || grade.itemmodule || 'assignment';
          const feedback = grade.feedback || grade.feedbacktext || '';
          const timeModified = grade.timemodified || grade.gradedate || Date.now() / 1000;
          const grader = grade.grader || grade.gradername || 'System';
          const category = grade.category || grade.categoryname || 'General';
          const weight = grade.weight || grade.aggregationcoef || 0;

          allGrades.push({
            id: grade.id || `grade_${grade.itemid || grade.iteminstance}`,
            courseId: grade.courseid || grade.course,
            courseName: grade.coursename || 'Unknown Course',
            courseImage: '/card1.webp', // Default image
            itemName: itemName,
            itemType: itemType,
            grade: gradeValue,
            maxGrade: maxGrade,
            percentage: gradeValue ? Math.round((gradeValue / maxGrade) * 100) : 0,
            feedback: feedback,
            timeModified: new Date(timeModified * 1000),
            grader: grader,
            isPassed: gradeValue && maxGrade ? (gradeValue / maxGrade) >= 0.6 : false,
            letterGrade: getLetterGrade(gradeValue, maxGrade),
            category: category,
            weight: weight,
            rawGrade: grade.rawgrade || gradeValue,
            finalGrade: grade.finalgrade || gradeValue,
            gradeDate: grade.gradedate ? new Date(grade.gradedate * 1000) : new Date(),
            gradeStatus: grade.status || 'graded',
            gradeScale: grade.gradescale || null,
            gradeItemId: grade.itemid || grade.iteminstance,
            gradeItemModule: grade.itemmodule || itemType,
            gradeItemInstance: grade.iteminstance || grade.itemid
          });
        });
      } else {
        // Fallback: Get all user courses and fetch grades from each course
        console.log('📊 Fallback: Fetching grades per course...');
        const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
        
        // Fetch grades from each course
        for (const course of userCourses) {
        try {
          // Get course grades
          const courseGrades = await enhancedMoodleService.getCourseGrades(course.id.toString(), currentUser.id.toString());
          
          if (courseGrades && Array.isArray(courseGrades)) {
            courseGrades.forEach((grade: any) => {
              // Handle different grade data formats from different API methods
              const gradeValue = grade.grade || grade.rawgrade || grade.finalgrade || 0;
              const maxGrade = grade.grademax || grade.grademax || 100;
              const itemName = grade.itemname || grade.name || 'Assignment';
              const itemType = grade.itemtype || grade.itemmodule || 'assignment';
              const feedback = grade.feedback || grade.feedbacktext || '';
              const timeModified = grade.timemodified || grade.gradedate || Date.now() / 1000;
              const grader = grade.grader || grade.gradername || 'System';
              const category = grade.category || grade.categoryname || 'General';
              const weight = grade.weight || grade.aggregationcoef || 0;

              allGrades.push({
                id: grade.id || `${course.id}_${grade.itemid || grade.iteminstance}`,
                courseId: course.id,
                courseName: course.fullname || course.shortname,
                courseImage: getBestCourseImage(course),
                itemName: itemName,
                itemType: itemType,
                grade: gradeValue,
                maxGrade: maxGrade,
                percentage: gradeValue ? Math.round((gradeValue / maxGrade) * 100) : 0,
                feedback: feedback,
                timeModified: new Date(timeModified * 1000),
                grader: grader,
                isPassed: gradeValue && maxGrade ? (gradeValue / maxGrade) >= 0.6 : false,
                letterGrade: getLetterGrade(gradeValue, maxGrade),
                category: category,
                weight: weight,
                // Additional IOMAD specific fields
                rawGrade: grade.rawgrade || gradeValue,
                finalGrade: grade.finalgrade || gradeValue,
                gradeDate: grade.gradedate ? new Date(grade.gradedate * 1000) : new Date(),
                gradeStatus: grade.status || 'graded',
                gradeScale: grade.gradescale || null,
                gradeItemId: grade.itemid || grade.iteminstance,
                gradeItemModule: grade.itemmodule || itemType,
                gradeItemInstance: grade.iteminstance || grade.itemid
              });
            });
          }
        } catch (error) {
          console.warn(`⚠️ Could not fetch grades for course ${course.id}:`, error);
        }
      }
      }
      
      // Calculate grade statistics
      const statistics = calculateGradeStatistics(allGrades);
      setGradeStatistics(statistics);
      
      console.log(`✅ Fetched ${allGrades.length} real grades from IOMAD`);
      return allGrades;
    } catch (error) {
      console.error('❌ Error fetching real grades:', error);
      return [];
    } finally {
      setIsLoadingGrades(false);
    }
  };

  // Helper function to get letter grade
  const getLetterGrade = (grade: number, maxGrade: number): string => {
    if (!grade || !maxGrade) return 'N/A';
    const percentage = (grade / maxGrade) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  // Helper function to calculate grade statistics
  const calculateGradeStatistics = (grades: any[]) => {
    if (grades.length === 0) {
      return {
        totalGrades: 0,
        averageGrade: 0,
        averagePercentage: 0,
        passedCount: 0,
        failedCount: 0,
        passRate: 0,
        gradeDistribution: {},
        courseStats: {}
      };
    }

    const totalGrades = grades.length;
    const totalPoints = grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
    const totalMaxPoints = grades.reduce((sum, grade) => sum + (grade.maxGrade || 100), 0);
    const averageGrade = totalMaxPoints > 0 ? totalPoints / totalMaxPoints : 0;
    const averagePercentage = Math.round(averageGrade * 100);
    
    const passedCount = grades.filter(grade => grade.isPassed).length;
    const failedCount = totalGrades - passedCount;
    const passRate = Math.round((passedCount / totalGrades) * 100);

    // Grade distribution
    const gradeDistribution = grades.reduce((dist, grade) => {
      const letter = grade.letterGrade;
      dist[letter] = (dist[letter] || 0) + 1;
      return dist;
    }, {} as any);

    // Course statistics
    const courseStats = grades.reduce((stats, grade) => {
      const courseId = grade.courseId;
      if (!stats[courseId]) {
        stats[courseId] = {
          courseName: grade.courseName,
          totalGrades: 0,
          averageGrade: 0,
          passedCount: 0,
          grades: []
        };
      }
      stats[courseId].totalGrades++;
      stats[courseId].grades.push(grade);
      if (grade.isPassed) stats[courseId].passedCount++;
      return stats;
    }, {} as any);

    // Calculate course averages
    Object.keys(courseStats).forEach(courseId => {
      const course = courseStats[courseId];
      const courseTotal = course.grades.reduce((sum: number, grade: any) => sum + (grade.grade || 0), 0);
      const courseMax = course.grades.reduce((sum: number, grade: any) => sum + (grade.maxGrade || 100), 0);
      course.averageGrade = courseMax > 0 ? Math.round((courseTotal / courseMax) * 100) : 0;
    });

    return {
      totalGrades,
      averageGrade: Math.round(averageGrade * 100),
      averagePercentage,
      passedCount,
      failedCount,
      passRate,
      gradeDistribution,
      courseStats
    };
  };

  // Fetch real IOMAD competencies data - ONLY REAL DATA, NO FALLBACKS
  const fetchRealCompetencies = async () => {
    if (!currentUser?.id) return [];
    
    try {
      setIsLoadingCompetencies(true);
      console.log('🔄 Fetching ONLY real IOMAD competencies data (no fallbacks)...');
      
      // Try to get real competencies directly from Moodle API
      let realCompetencies: any[] = [];
      let realUserCompetencies: any[] = [];
      
      // Method 1: Try multiple competency API endpoints to get real data
      console.log('🔍 Attempting to fetch real competencies using multiple API endpoints...');
      
      // Try different competency API functions
      const competencyApiFunctions = [
        { name: 'core_competency_list_competencies', params: { filters: JSON.stringify([{ column: 'competencyframeworkid', value: 1 }]) } },
        { name: 'core_competency_search_competencies', params: { query: '' } },
        { name: 'tool_lp_data_for_competencies_manage_page', params: { competencyframeworkid: 1, search: '' } }
      ];
      
      // Try bulk competency APIs first
      for (const apiFunction of competencyApiFunctions) {
        try {
          console.log(`🔍 Trying ${apiFunction.name}...`);
          const response = await fetch('/api/moodle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              wsfunction: apiFunction.name,
              ...Object.fromEntries(Object.entries(apiFunction.params).map(([key, value]) => [key, String(value)]))
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && (Array.isArray(data) || data.competencies)) {
              const competencies = Array.isArray(data) ? data : data.competencies;
              if (competencies && competencies.length > 0) {
                console.log(`✅ Found ${competencies.length} competencies using ${apiFunction.name}`);
                for (const comp of competencies) {
                  if (comp.id && comp.shortname) {
                    realCompetencies.push({
                      id: comp.id,
                      shortname: comp.shortname,
                      name: comp.shortname,
                      description: comp.description || comp.shortname,
                      category: comp.competencyframeworkid ? `Framework ${comp.competencyframeworkid}` : 'General',
                      level: 'intermediate',
                      status: 'not_started',
                      progress: 0,
                      totalActivities: 0,
                      completedActivities: 0,
                      lastUpdated: new Date().toISOString(),
                      nextSteps: [],
                      frameworkId: comp.competencyframeworkid,
                      grade: 0,
                      proficiency: 0,
                      timeCreated: comp.timecreated,
                      timeModified: comp.timemodified,
                      visible: comp.visible !== 0,
                      courses: [],
                      courseCount: 0,
                      competencyCode: comp.idnumber || comp.shortname,
                      scaleId: comp.scaleid,
                      scaleConfiguration: comp.scaleconfiguration,
                      parentId: comp.parentid,
                      path: comp.path,
                      sortOrder: comp.sortorder,
                      userCompetencyId: null,
                      userGrade: 0,
                      userProficiency: 0,
                      userStatus: 'not_started',
                      userTimeCreated: null,
                      userTimeModified: null,
                      userUserId: null,
                      userCompetencyIdValue: null,
                      userGradeName: null,
                      userProficiencyName: null
                    });
                  }
                }
                break; // If we found competencies, stop trying other bulk APIs
              }
            }
          }
        } catch (error) {
          console.log(`⚠️ ${apiFunction.name} failed:`, error.message);
        }
      }
      
      // Method 2: If no bulk data found, try individual competency fetching
      if (realCompetencies.length === 0) {
        console.log('🔍 No bulk competencies found, trying individual competency fetching...');
        for (let i = 1; i <= 20; i++) {
          try {
            // Direct API call to Moodle
            const response = await fetch('/api/moodle', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                wsfunction: 'core_competency_read_competency',
                id: i.toString()
              })
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.id && data.shortname) {
              console.log(`✅ Found real competency ${i}: ${data.shortname}`);
              realCompetencies.push({
                id: data.id,
                shortname: data.shortname,
                name: data.shortname,
                description: data.description || data.shortname,
                category: data.competencyframeworkid ? `Framework ${data.competencyframeworkid}` : 'General',
                level: 'intermediate',
                status: 'not_started',
                progress: 0,
                totalActivities: 0,
                completedActivities: 0,
                lastUpdated: new Date().toISOString(),
                nextSteps: [],
                frameworkId: data.competencyframeworkid,
                grade: 0,
                proficiency: 0,
                timeCreated: data.timecreated,
                timeModified: data.timemodified,
                visible: data.visible !== 0,
                courses: [],
                courseCount: 0,
                competencyCode: data.idnumber || data.shortname,
                scaleId: data.scaleid,
                scaleConfiguration: data.scaleconfiguration,
                parentId: data.parentid,
                path: data.path,
                sortOrder: data.sortorder,
                // User-specific data (will be filled if user competency found)
                userCompetencyId: null,
                userGrade: 0,
                userProficiency: 0,
                userStatus: 'not_started',
                userTimeCreated: null,
                userTimeModified: null,
                userUserId: null,
                userCompetencyIdValue: null,
                userGradeName: null,
                userProficiencyName: null
              });
            }
          } catch (error) {
            // Continue trying other competency IDs
            if (i > 5 && realCompetencies.length === 0) {
              console.log(`⚠️ No real competencies found after ${i} attempts`);
              break;
            }
          }
        }
      }
      
      // Method 3: Try to get user competencies using core_competency_read_user_competency
      if (realCompetencies.length > 0) {
        console.log('🔍 Attempting to fetch real user competencies...');
        for (const competency of realCompetencies) {
          try {
            const userResponse = await fetch('/api/moodle', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                wsfunction: 'core_competency_read_user_competency',
                userid: currentUser.id.toString(),
                competencyid: competency.id.toString()
              })
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData && userData.id) {
                console.log(`✅ Found real user competency for ${competency.name}`);
                realUserCompetencies.push({
                  id: userData.id,
                  competencyid: competency.id,
                  userid: currentUser.id.toString(),
                  status: userData.status || 'not_started',
                  grade: userData.grade || 0,
                  proficiency: userData.proficiency || 0,
                  timecreated: userData.timecreated,
                  timemodified: userData.timemodified,
                  gradename: userData.gradename,
                  proficiencyname: userData.proficiencyname
                });
              }
            }
          } catch (error) {
            // Continue with other competencies
          }
        }
      }
      
      // Process and combine the real competency data
      const processedCompetencies = realCompetencies.map((competency: any) => {
        // Find user-specific data for this competency
        const userCompetency = realUserCompetencies.find((uc: any) => 
          uc.competencyid === competency.id
        );
        
        // Update competency with user data if found
        if (userCompetency) {
          competency.userCompetencyId = userCompetency.id;
          competency.userGrade = userCompetency.grade;
          competency.userProficiency = userCompetency.proficiency;
          competency.userStatus = userCompetency.status;
          competency.userTimeCreated = userCompetency.timecreated;
          competency.userTimeModified = userCompetency.timemodified;
          competency.userUserId = userCompetency.userid;
          competency.userCompetencyIdValue = userCompetency.competencyid;
          competency.userGradeName = userCompetency.gradename;
          competency.userProficiencyName = userCompetency.proficiencyname;
          
          // Update progress and status based on user data
          competency.progress = userCompetency.proficiency || 0;
          competency.status = userCompetency.status || 'not_started';
        }
        
        return competency;
      });

      if (processedCompetencies.length > 0) {
        console.log(`✅ Successfully fetched ${processedCompetencies.length} REAL competencies from IOMAD Moodle API`);
        console.log(`📊 User competencies found: ${realUserCompetencies.length}`);
        return processedCompetencies;
      } else {
        console.log('⚠️ No real competencies found in IOMAD Moodle system');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching real competencies:', error);
      return [];
    } finally {
      setIsLoadingCompetencies(false);
    }
  };

  // Fetch real IOMAD badges data using specific Moodle badge APIs
  const fetchRealBadges = async () => {
    if (!currentUser?.id) return [];
    
    try {
      setIsLoadingBadges(true);
      console.log('🔄 Fetching ONLY real IOMAD badges data using specific Moodle APIs...');
      console.log('🔍 Current user ID:', currentUser.id);

      let realBadges: any[] = [];
      let realUserBadges: any[] = [];

      // Method 1: Get user badges using core_badges_get_user_badges (most comprehensive)
      console.log('🔍 Method 1: Fetching user badges with core_badges_get_user_badges...');
      try {
        const response = await fetch('/api/moodle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            wsfunction: 'core_badges_get_user_badges',
            userid: currentUser.id.toString(),
            courseid: '0', // All courses
            page: '0',
            perpage: '50',
            search: '',
            onlypublic: '1'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📋 core_badges_get_user_badges response:', data);
          
          if (data && data.badges && Array.isArray(data.badges)) {
            for (const badge of data.badges) {
              if (badge.id && badge.name) {
                realBadges.push({
                  id: badge.id,
                  name: badge.name,
                  description: badge.description || 'No description available',
                  image: badge.badgeurl || badge.image || '/default-badge.png',
                  dateIssued: badge.dateissued ? new Date(badge.dateissued * 1000).toISOString() : null,
                  issuer: badge.issuername || 'System',
                  courseId: badge.courseid || null,
                  courseName: badge.courseName || null,
                  status: badge.status || 'active',
                  badgeStatus: 'awarded',
                  uniqueHash: badge.uniquehash || null,
                  recipientId: badge.recipientid || currentUser.id,
                  recipientName: badge.recipientfullname || currentUser.fullname,
                  version: badge.version || '1.0',
                  language: badge.language || 'en',
                  visible: badge.visible !== 0,
                  type: badge.type || 1,
                  timeCreated: badge.timecreated ? new Date(badge.timecreated * 1000).toISOString() : null,
                  timeModified: badge.timemodified ? new Date(badge.timemodified * 1000).toISOString() : null,
                  // Additional fields from the API
                  expiredate: badge.expiredate ? new Date(badge.expiredate * 1000).toISOString() : null,
                  expireperiod: badge.expireperiod || null,
                  message: badge.message || null,
                  messagesubject: badge.messagesubject || null,
                  attachment: badge.attachment || 0,
                  notification: badge.notification || 0,
                  nextcron: badge.nextcron || null,
                  issuedid: badge.issuedid || null,
                  dateexpire: badge.dateexpire ? new Date(badge.dateexpire * 1000).toISOString() : null,
                  email: badge.email || null,
                  imageauthorname: badge.imageauthorname || null,
                  imageauthoremail: badge.imageauthoremail || null,
                  imageauthorurl: badge.imageauthorurl || null,
                  imagecaption: badge.imagecaption || null,
                  endorsement: badge.endorsement || null,
                  alignment: badge.alignment || [],
                  relatedbadges: badge.relatedbadges || []
                });
              }
            }
            console.log(`✅ Found ${realBadges.length} user badges using core_badges_get_user_badges`);
          }
        }
      } catch (error) {
        console.log('⚠️ core_badges_get_user_badges failed:', error);
      }

      // Method 2: Get individual badges using core_badges_get_badge
      if (realBadges.length === 0) {
        console.log('🔍 Method 2: Fetching individual badges with core_badges_get_badge...');
        for (let i = 1; i <= 20; i++) {
          try {
            const response = await fetch('/api/moodle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                wsfunction: 'core_badges_get_badge',
                id: i.toString()
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log(`📋 core_badges_get_badge (ID: ${i}) response:`, data);
              
              if (data && data.badge && data.badge.id) {
                const badge = data.badge;
                realBadges.push({
                  id: badge.id,
                  name: badge.name,
                  description: badge.description || 'No description available',
                  image: badge.image || '/default-badge.png',
                  dateIssued: null,
                  issuer: badge.issuer || 'System',
                  courseId: null,
                  courseName: null,
                  status: 'active',
                  badgeStatus: 'available',
                  uniqueHash: null,
                  recipientId: null,
                  recipientName: null,
                  version: '1.0',
                  language: 'en',
                  visible: true,
                  type: 1,
                  timeCreated: null,
                  timeModified: null,
                  // Additional fields from the API
                  hostedUrl: badge.hostedUrl || null,
                  criteriaUrl: badge.criteriaUrl || null,
                  criteriaNarrative: badge.criteriaNarrative || null,
                  alignment: badge.alignment || []
                });
                console.log(`✅ Found individual badge: ${badge.name}`);
              }
            }
          } catch (error) {
            // Continue trying other badge IDs
            if (i > 10 && realBadges.length === 0) {
              console.log(`⚠️ No badges found after trying ${i} badge IDs`);
              break;
            }
          }
        }
      }

      // Method 3: Try to get badges by course
      if (realBadges.length === 0) {
        console.log('🔍 Method 3: Fetching badges by course...');
        try {
          const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
          for (const course of userCourses.slice(0, 5)) { // Check first 5 courses
            try {
              const response = await fetch('/api/moodle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                  wsfunction: 'core_badges_get_user_badges',
                  userid: currentUser.id.toString(),
                  courseid: course.id.toString(),
                  page: '0',
                  perpage: '20',
                  search: '',
                  onlypublic: '1'
                })
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data && data.badges && Array.isArray(data.badges)) {
                  for (const badge of data.badges) {
                    if (badge.id && badge.name) {
                      realBadges.push({
                        id: badge.id,
                        name: badge.name,
                        description: badge.description || 'No description available',
                        image: badge.badgeurl || badge.image || '/default-badge.png',
                        dateIssued: badge.dateissued ? new Date(badge.dateissued * 1000).toISOString() : null,
                        issuer: badge.issuername || 'System',
                        courseId: badge.courseid || course.id,
                        courseName: badge.courseName || course.fullname,
                        status: badge.status || 'active',
                        badgeStatus: 'awarded',
                        uniqueHash: badge.uniquehash || null,
                        recipientId: badge.recipientid || currentUser.id,
                        recipientName: badge.recipientfullname || currentUser.fullname,
                        version: badge.version || '1.0',
                        language: badge.language || 'en',
                        visible: badge.visible !== 0,
                        type: badge.type || 1,
                        timeCreated: badge.timecreated ? new Date(badge.timecreated * 1000).toISOString() : null,
                        timeModified: badge.timemodified ? new Date(badge.timemodified * 1000).toISOString() : null
                      });
                    }
                  }
                  console.log(`✅ Found ${data.badges.length} badges for course ${course.fullname}`);
                }
              }
            } catch (error) {
              console.log(`⚠️ Error fetching badges for course ${course.fullname}:`, error.message);
            }
          }
        } catch (error) {
          console.log('⚠️ Error in course badge search:', error.message);
        }
      }

      // Method 4: Try to get badge data from course contents (fallback)
      if (realBadges.length === 0) {
        console.log('🔍 Method 4: Searching for badge modules in course contents...');
        try {
          const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
          for (const course of userCourses.slice(0, 3)) { // Check first 3 courses
            try {
              const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
              for (const section of courseContents) {
                if (section.modules && Array.isArray(section.modules)) {
                  for (const module of section.modules) {
                    if (module.modname === 'badge' || module.name?.toLowerCase().includes('badge')) {
                      console.log(`🎯 Found potential badge module in course ${course.fullname}:`, module);
                      realBadges.push({
                        id: module.id,
                        name: module.name || 'Course Badge',
                        description: module.description || 'Complete this course to earn this badge',
                        image: module.imageurl || '/default-badge.png',
                        dateIssued: null,
                        issuer: course.fullname || 'Course',
                        courseId: course.id,
                        courseName: course.fullname,
                        status: 'active',
                        badgeStatus: 'available',
                        uniqueHash: null,
                        recipientId: null,
                        recipientName: null,
                        version: '1.0',
                        language: 'en',
                        visible: module.visible !== 0,
                        type: 1,
                        timeCreated: null,
                        timeModified: null
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.log(`⚠️ Error checking course ${course.fullname} for badges:`, error.message);
            }
          }
        } catch (error) {
          console.log('⚠️ Error in course contents badge search:', error.message);
        }
      }

      console.log(`📊 Final badge results: ${realBadges.length} badges found`);
      if (realBadges.length === 0) {
        console.log('❌ No real badge data found from any API endpoint');
        console.log('💡 This could mean:');
        console.log('   - Badge functionality is not enabled in your Moodle system');
        console.log('   - No badges have been created yet');
        console.log('   - Badge APIs are not available in your Moodle version');
        console.log('   - You need to complete courses/activities to earn badges');
        return [];
      }

      return realBadges;
    } catch (error) {
      console.error('❌ Error fetching real badges:', error);
      return [];
    } finally {
      setIsLoadingBadges(false);
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
      setIsLoadingTreeView(true);
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
            let sectionInProgressCount = 0;

            // Process modules in this section
            section.modules.forEach((module: any, moduleIndex: number) => {
              sectionTotalCount++;
              
              // Check completion status with more detailed tracking
              const completionState = module.completiondata?.state;
              const completionProgress = module.completiondata?.progress || 0;
              
              if (completionState === 1) {
                sectionCompletedCount++;
              } else if (completionState === 2 || completionProgress > 0) {
                sectionInProgressCount++;
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
                status: completionState === 1 ? 'completed' : 
                       completionState === 2 || completionProgress > 0 ? 'in_progress' : 'pending',
                progress: completionProgress,
                order: moduleIndex + 1,
                icon: moduleIcon,
                modname: module.modname,
                url: module.url,
                contents: module.contents,
                completiondata: module.completiondata,
                description: module.description || module.intro || `Complete this ${moduleType} to progress.`,
                sectionName: section.name,
                sectionId: section.id || sectionIndex,
                duration: module.duration || 'No time limit',
                difficulty: module.difficulty || 'Easy',
                dueDate: module.dueDate,
                points: module.points || 0,
                lastAccessed: module.lastAccessed,
                timeSpent: module.timeSpent || 0,
                visible: module.visible !== 0
              };

              sectionActivities.push(activity);
            });

            // Create section structure with enhanced progress data
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
              inProgressActivities: sectionInProgressCount,
              progress: sectionProgress,
              sectionNumber: sectionIndex + 1,
              lastAccessed: section.lastAccessed,
              timeSpent: section.timeSpent || 0
            };

            courseSections.push(sectionData);
          }
        });

        // Calculate course progress based on activities, not sections
        let totalCourseActivities = 0;
        let completedCourseActivities = 0;
        let inProgressCourseActivities = 0;
        
        courseSections.forEach(section => {
          totalCourseActivities += section.totalActivities;
          completedCourseActivities += section.completedActivities;
          inProgressCourseActivities += section.inProgressActivities;
          
          // Count completed sections (sections with 100% progress)
          if (section.progress === 100) {
            completedSections++;
          }
          totalSections++;
        });

        // Create course structure with enhanced progress data
        const courseProgress = totalCourseActivities > 0 ? Math.round((completedCourseActivities / totalCourseActivities) * 100) : 0;
        const courseData = {
          id: course.id,
          name: course.fullname || course.shortname,
          type: 'course',
          summary: course.summary || '',
          sections: courseSections,
          sectionCount: courseSections.length,
          completedSections: completedSections,
          totalSections: totalSections,
          activityCount: totalCourseActivities,
          completedActivities: completedCourseActivities,
          inProgressActivities: inProgressCourseActivities,
          progress: courseProgress,
          courseImage: getBestCourseImage(course),
          categoryname: course.categoryname,
          lastAccessed: (course as any).lastAccess ? new Date((course as any).lastAccess * 1000) : new Date(),
          enrollmentDate: course.startdate ? new Date(course.startdate * 1000) : new Date(),
          timeSpent: (course as any).timeSpent || 0
        };

        treeData.push(courseData);
      }
      
      console.log(`✅ Fetched ${treeData.length} courses with sections from IOMAD`);
      setTreeViewData(treeData);
      return treeData;
      } catch (error) {
      console.error('❌ Error fetching real tree view data:', error);
      setTreeViewData([]);
      return [];
    } finally {
      setIsLoadingTreeView(false);
    }
  };

  // Fetch real schedule data from IOMAD
  const fetchRealScheduleData = async () => {
    if (!currentUser?.id) return [];
    
    try {
      setIsLoadingRealSchedule(true);
      console.log('🔄 Fetching real schedule data from IOMAD...');
      const scheduleData: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch detailed data for each course to get schedule information
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        // Process each section for schedule events
        courseContents.forEach((section: any, sectionIndex: number) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any, moduleIndex: number) => {
              // Create schedule events for different module types
              if (module.modname === 'lesson' || module.modname === 'quiz' || module.modname === 'assign') {
                const eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30)); // Random date within next 30 days
                
                const scheduleEvent = {
                  id: module.id,
                  title: module.name,
                  type: module.modname,
                  courseName: course.fullname || course.shortname,
                  courseId: course.id,
                  date: eventDate,
                  time: `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
                  duration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
                  status: module.completiondata?.state === 1 ? 'completed' : 
                         module.completiondata?.state === 2 ? 'in_progress' : 'upcoming',
                  description: module.description || module.intro || `Complete this ${module.modname} activity.`,
                  url: module.url,
                  sectionName: section.name,
                  isRecurring: false,
                  priority: module.modname === 'quiz' ? 'high' : module.modname === 'assign' ? 'medium' : 'low'
                };
                
                scheduleData.push(scheduleEvent);
              }
            });
          }
        });
      }
      
      // Sort by date
      scheduleData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      console.log(`✅ Fetched ${scheduleData.length} schedule events from IOMAD`);
      setRealScheduleData(scheduleData);
      return scheduleData;
    } catch (error) {
      console.error('❌ Error fetching real schedule data:', error);
      setRealScheduleData([]);
      return [];
    } finally {
      setIsLoadingRealSchedule(false);
    }
  };

  // Fetch user profile data from IOMAD
  const fetchUserProfile = async () => {
    if (!currentUser?.id) return null;
    
    try {
      setIsLoadingProfile(true);
      console.log('🔄 Fetching user profile data from IOMAD...');
      
      // Get user courses for additional context
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      const profile = {
        id: currentUser.id,
        username: currentUser.username,
        fullname: currentUser.fullname,
        email: currentUser.email,
        firstname: currentUser.firstname,
        lastname: currentUser.lastname,
        profileImage: currentUser.profileimageurl || '/placeholder.svg',
        city: 'Not specified',
        country: 'Not specified',
        timezone: 'UTC',
        lastAccess: new Date(),
        totalCourses: userCourses.length,
        completedCourses: userCourses.filter(c => c.progress === 100).length,
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
        description: 'No description available',
        interests: [],
        skills: []
      };
      
      console.log('✅ User profile data fetched successfully');
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setUserProfile(null);
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  };


  // Fetch ALL activities from IOMAD course sections (including resources and URLs)
  const fetchResourceActivities = async () => {
    if (!currentUser?.id) return [];
    
    try {
      setIsLoadingResourceActivities(true);
      console.log('🔄 Fetching ALL activities from IOMAD course sections...');
      const allActivitiesList: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch ALL activities from each course section
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              // Include ALL activities (including resources, URLs, and all other types)
              if (module.modname) {
                // Determine activity type and icon for ALL module types
                let activityType = 'Activity';
                let activityIcon = Activity;
                
                if (module.modname === 'lesson') {
                  activityType = 'Lesson';
                  activityIcon = BookOpen;
                } else if (module.modname === 'quiz') {
                  activityType = 'Quiz';
                  activityIcon = FileText;
                } else if (module.modname === 'assign') {
                  activityType = 'Assignment';
                  activityIcon = Code;
                } else if (module.modname === 'forum') {
                  activityType = 'Discussion';
                  activityIcon = Users;
                } else if (module.modname === 'scorm') {
                  activityType = 'SCORM';
                  activityIcon = BookOpen;
                } else if (module.modname === 'workshop') {
                  activityType = 'Workshop';
                  activityIcon = Target;
                } else if (module.modname === 'choice') {
                  activityType = 'Choice';
                  activityIcon = CheckCircle;
                } else if (module.modname === 'feedback') {
                  activityType = 'Feedback';
                  activityIcon = MessageSquare;
                } else if (module.modname === 'resource') {
                  activityType = 'Resource';
                  activityIcon = FileText;
                } else if (module.modname === 'url') {
                  activityType = 'URL Link';
                  activityIcon = ExternalLink;
                } else if (module.modname === 'page') {
                  activityType = 'Page';
                  activityIcon = FileText;
                } else if (module.modname === 'book') {
                  activityType = 'Book';
                  activityIcon = BookOpen;
                } else if (module.modname === 'folder') {
                  activityType = 'Folder';
                  activityIcon = FileText;
                } else if (module.modname === 'glossary') {
                  activityType = 'Glossary';
                  activityIcon = BookOpen;
                } else if (module.modname === 'wiki') {
                  activityType = 'Wiki';
                  activityIcon = FileText;
                } else if (module.modname === 'chat') {
                  activityType = 'Chat';
                  activityIcon = MessageSquare;
                } else if (module.modname === 'survey') {
                  activityType = 'Survey';
                  activityIcon = CheckCircle;
                } else if (module.modname === 'database') {
                  activityType = 'Database';
                  activityIcon = FileText;
                } else if (module.modname === 'hvp') {
                  activityType = 'Interactive Content';
                  activityIcon = Play;
                } else if (module.modname === 'lti') {
                  activityType = 'External Tool';
                  activityIcon = ExternalLink;
                } else {
                  // For any other module types, use the modname as type
                  activityType = module.modname.charAt(0).toUpperCase() + module.modname.slice(1);
                  activityIcon = Activity;
                }

                const sectionActivity = {
                  id: module.id,
                  name: module.name,
                  type: activityType,
                  courseName: course.fullname || course.shortname,
                  courseId: course.id,
                  description: module.description || module.intro || `Complete this ${activityType} to progress in your learning.`,
                  status: module.completiondata?.state === 1 ? 'completed' : 
                         module.completiondata?.state === 2 ? 'in_progress' : 'pending',
                  progress: module.completiondata?.progress || 0,
                  url: module.url,
                  contents: module.contents,
                  completiondata: module.completiondata,
                  sectionName: section.name,
                  sectionId: section.id,
                  modname: module.modname,
                  timeCreated: module.timecreated ? new Date(module.timecreated * 1000) : new Date(),
                  timeModified: module.timemodified ? new Date(module.timemodified * 1000) : new Date(),
                  icon: activityIcon,
                  dueDate: module.duedate ? new Date(module.duedate * 1000) : null,
                  grade: module.grade || 0,
                  maxGrade: module.grademax || 100,
                  attempts: module.attempts || 0,
                  maxAttempts: module.maxattempts || 1,
                  visible: module.visible !== 0,
                  completion: module.completion,
                  added: module.added,
                  // Additional properties for different activity types
                  fileSize: module.contents?.[0]?.filesize || 0,
                  fileType: module.contents?.[0]?.mimetype || 'unknown',
                  fileName: module.contents?.[0]?.filename || module.name,
                  // For resources and URLs
                  isResource: module.modname === 'resource' || module.modname === 'url',
                  // For interactive activities
                  isInteractive: ['quiz', 'assign', 'lesson', 'forum', 'workshop', 'choice', 'feedback', 'scorm'].includes(module.modname)
                };
                
                allActivitiesList.push(sectionActivity);
              }
            });
          }
        });
      }
      
      console.log(`✅ Fetched ${allActivitiesList.length} activities from IOMAD course sections`);
      console.log(`📊 Activity breakdown:`, {
        total: allActivitiesList.length,
        byType: allActivitiesList.reduce((acc, activity) => {
          acc[activity.type] = (acc[activity.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byCourse: allActivitiesList.reduce((acc, activity) => {
          acc[activity.courseName] = (acc[activity.courseName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      setResourceActivities(allActivitiesList);
      return allActivitiesList;
    } catch (error) {
      console.error('❌ Error fetching section activities:', error);
      setResourceActivities([]);
      return [];
    } finally {
      setIsLoadingResourceActivities(false);
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
    setIsViewingActivityInline(false);
  };

  // Close inline activity view
  const closeInlineActivity = () => {
    setIsViewingActivityInline(false);
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
        image: getBestCourseImage(course),
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
      image: getBestLessonImage(lesson)
    }));
  }, [realLessons]);

  const displaySections = useMemo(() => {
    return realSections.map((section: any) => ({
      id: section.id.toString(),
      title: section.name,
      courseId: section.courseId,
      courseTitle: section.courseTitle,
      summary: section.summary || '',
      progress: section.progress || 0,
      status: section.status || 'not-started',
      totalModules: section.totalModules || 0,
      completedModules: section.completedModules || 0,
      image: section.image || getBestCourseImage({ fullname: section.courseTitle }),
      lastAccessed: section.lastAccessed,
      timeSpent: section.timeSpent || 0,
      visible: section.visible !== false
    }));
  }, [realSections]);

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

  // Handle activity type filtering
  const handleActivityTypeClick = useCallback((type: string) => {
    const filtered = displayActivities.filter(activity => {
      if (type === 'other') {
        return activity.type !== 'quiz' && activity.type !== 'assignment' && activity.type !== 'project';
      }
      return activity.type === type;
    });
    
    setSelectedActivityType(type);
    setFilteredActivities(filtered);
    console.log(`${type} activities:`, filtered);
  }, [displayActivities]);
  
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
      <div className="w-full space-y-6">
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
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Course Sections</h2>
          </div>
          
          {isLoadingCourseDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading sections...</span>
            </div>
          ) : courseSections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sections Available</h3>
              <p className="text-gray-600">This course doesn't have any sections yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseSections.map((section, index) => (
                <div 
                  key={section.id || index}
                  className="group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer hover:border-blue-300 hover:bg-white"
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {section.sectionNumber || index + 1}
                          </span>
                        </div>
                        {section.progress === 100 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        section.progress === 100 ? 'bg-green-100 text-green-600' :
                        section.progress > 0 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {section.progress === 100 ? 'Completed' :
                         section.progress > 0 ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {section.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{section.totalModules || 0} activities</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">{section.totalLessons || 0} lessons</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-bold text-gray-800">{section.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${section.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {section.completedActivities || 0}/{section.totalActivities || 0} completed
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
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
      <div className="w-full space-y-6">
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
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Section Activities</h2>
          </div>
          
          {isLoadingSectionActivities ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading activities...</span>
            </div>
          ) : sectionActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Activities Available</h3>
              <p className="text-gray-600">This section doesn't have any activities yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sectionActivities.map((activity, index) => (
                <div key={activity.id || index} className="relative">
                  {/* Connecting Line */}
                  {index < sectionActivities.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-300 z-0"></div>
                  )}
                  
                  {/* Activity Card */}
                  <div 
                    className="relative z-10 group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Status Marker */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}>
                          {activity.status === 'completed' ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Activity Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg overflow-hidden">
                          <img 
                            src={getActivityImage(activity.type)} 
                            alt={activity.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop';
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                              {activity.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {activity.description}
                            </p>
                            
                            {/* Activity Details */}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{getActivityDuration(activity.type)}</span>
                              </span>
                              {activity.dueDate && activity.dueDate !== 'No due date' && (
                                <span>Due: {activity.dueDate}</span>
                              )}
                            </div>
                            
                            {/* Difficulty and Points */}
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                activity.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {activity.difficulty === 'easy' ? 'Easy' :
                                 activity.difficulty === 'medium' ? 'Medium' : 'Hard'}
                              </span>
                              <span className="flex items-center space-x-1 text-xs text-gray-500">
                                <Award className="w-3 h-3" />
                                <span>{activity.points || 50}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <div className="flex-shrink-0 ml-4">
                            <button 
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                activity.status === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                activity.status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                'bg-gray-600 hover:bg-gray-700 text-white'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivityClick(activity);
                              }}
                            >
                              {activity.status === 'completed' ? 'Review' :
                               activity.status === 'in_progress' ? 'Continue' : 'Start'}
                            </button>
                          </div>
                        </div>
                      </div>
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
    <div className="min-h-screen">
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
      <div className="fixed top-0 left-0 z-30 w-64 h-full bg-gradient-to-b from-white via-blue-50 to-indigo-50 shadow-xl border-r border-blue-200 overflow-y-auto hidden lg:block scrollbar-hide">
        {/* Enhanced Logo */}
        <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <img src={logo} alt="Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">G4G7 Dashboard</h1>
              <p className="text-blue-100 text-xs">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="p-4 space-y-6 pb-16">
          <div>
            <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
              DASHBOARD
            </h3>
            <ul className="space-y-2">
              <li>
              <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
              </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('courses')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'courses' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Courses</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('lessons')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'competencies' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Competencies</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('grades')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'grades' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Grades</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('badges')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'badges' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Badges</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('schedule')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'schedule' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'settings' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg' : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
        </div>

          {/* Tools & Resources Section */}
          <div>
            <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
              TOOLS & RESOURCES
            </h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleTabChange('tree-view')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'tree-view' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Tree View</span>
                </button>
              </li>
            </ul>
      </div>


          {/* Quick Actions Section */}
          <div>
            <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
              QUICK ACTIONS
            </h3>
            <div className="space-y-4">
              
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


        {/* Settings Section */}
        <div className="relative">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-colors w-full"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">Settings</p>
              <p className="text-xs text-gray-500">Manage your account</p>
            </div>
                </button>
        </div>
      </div>

      {/* Main Content */}

      <div className="lg:ml-64 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

        {/* Header with Notifications and Profile */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'courses' && 'My Courses'}
                {activeTab === 'lessons' && 'Lessons'}
                {activeTab === 'activities' && 'Activities'}
                {activeTab === 'achievements' && 'Achievements'}
                {activeTab === 'schedule' && 'Schedule'}
                {activeTab === 'grades' && 'Grades & Performance'}
                {activeTab === 'badges' && 'Badges & Achievements'}
                {activeTab === 'tree-view' && 'Course Structure'}
                {activeTab === 'competencies' && 'Competencies'}
                {activeTab === 'scratch-editor' && 'Scratch Editor'}
                {activeTab === 'code-editor' && 'Code Editor'}
                {activeTab === 'ebooks' && 'E-Books'}
                {activeTab === 'ask-teacher' && 'Ask Teacher'}
                {activeTab === 'share-class' && 'Share with Class'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                </button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'assignment' ? 'bg-blue-500' :
                              notification.type === 'course' ? 'bg-green-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
          </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {currentUser?.fullname || currentUser?.username || 'Student'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.fullname || currentUser?.username || 'Student'}
                      </p>
                      <p className="text-xs text-gray-500">Student</p>
                    </div>
                    
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setActiveTab('settings');
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
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
        {activeTab === 'dashboard' && (
          <div className="space-y-6 ml-8 mr-8">
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
          <div className="w-full">
            {renderCourseDetailView()}
          </div>
        ) : currentPage === 'section-view' ? (
          <div className="w-full">
            {renderSectionDetailView()}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 ml-8 mr-8">
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
                            target.src = getCourseImageFallback(course.category, course.title);
                            console.log(`🖼️ Image failed to load for course ${course.title}, using fallback`);
                          }}
                          onLoad={() => {
                            console.log(`🖼️ Image loaded successfully for course ${course.title}`);
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Current Lessons</h2>
                    <p className="text-gray-600 mt-1">Continue your learning journey</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-xl transition-all duration-200">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                
                {isLoading ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Sections...</h3>
                    <p className="text-gray-600">Fetching your course sections from the server.</p>
                  </div>
                ) : displaySections.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sections Found</h3>
                    <p className="text-gray-600 mb-4">Start a course to see your sections here or there was an issue loading your sections.</p>
                    <button 
                      onClick={refreshData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                </div>
                              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {displaySections.slice(0, 6).map((section) => (
                     <div 
                       key={section.id} 
                       className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-blue-200"
                       onClick={() => handleSectionClick(section)}
                     >
                      <div className="relative">
                        <img 
                          src={section.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
                          alt={section.title}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getBestCourseImage({ fullname: section.courseTitle });
                            console.log(`🖼️ Image failed to load for section ${section.title}, using fallback`);
                          }}
                          onLoad={() => {
                            console.log(`🖼️ Image loaded successfully for section ${section.title}`);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        {section.status === 'completed' && (
                          <div className="absolute top-4 left-4">
                            <div className="bg-green-500 text-white px-3 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg">
                              <Check className="w-4 h-4" />
                              <span>Completed</span>
                            </div>
                          </div>
                        )}
                      </div>
                        
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-700 transition-colors line-clamp-2">{section.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{section.courseTitle}</p>
                          
                        <div className="flex items-center space-x-2 mb-4">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 font-medium">{section.completedModules}/{section.totalModules} modules</span>
                        </div>
                          
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-gray-900">{section.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${section.progress}%` }}
                            ></div>
                          </div>
                        </div>
                          
                        <button 
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSectionClick(section);
                          }}
                        >
                          {section.status === 'completed' ? 'Review Section' : section.status === 'in-progress' ? 'Continue Section' : 'Start Section'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Activities Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Activities</h2>
                    <p className="text-gray-600 mt-1">Complete your assignments and tasks</p>
                  </div>
                </div>
                <button className="text-green-600 hover:text-green-700 font-semibold flex items-center space-x-2 bg-green-50 hover:bg-green-100 px-6 py-3 rounded-xl transition-all duration-200">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                
                {isLoading ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <RefreshCw className="w-8 h-8 text-green-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Activities...</h3>
                    <p className="text-gray-600">Fetching your activity data from the server.</p>
                  </div>
                ) : displayActivities.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
                    <p className="text-gray-600 mb-4">You're all caught up! No pending activities or there was an issue loading your activities.</p>
                    <button 
                      onClick={refreshData}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                </div>
              ) : (
                <div className="space-y-8">
                   {/* Activity Type Boxes */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {/* Quiz Box */}
                     <div 
                       className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 cursor-pointer"
                       onClick={() => handleActivityTypeClick('quiz')}
                     >
                       <div className="text-center">
                         <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                           <FileText className="w-8 h-8 text-white" />
                         </div>
                         <h3 className="font-bold text-gray-900 text-lg mb-2">Quizzes</h3>
                         <p className="text-gray-600 text-sm font-medium">
                           {displayActivities.filter(a => a.type === 'quiz').length} Available
                         </p>
                       </div>
                     </div>

                     {/* Assignment Box */}
                     <div 
                       className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 transition-all duration-300 cursor-pointer"
                       onClick={() => handleActivityTypeClick('assignment')}
                     >
                       <div className="text-center">
                         <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                           <Code className="w-8 h-8 text-white" />
                         </div>
                         <h3 className="font-bold text-gray-900 text-lg mb-2">Assignments</h3>
                         <p className="text-gray-600 text-sm font-medium">
                           {displayActivities.filter(a => a.type === 'assignment').length} Available
                         </p>
                       </div>
                     </div>

                     {/* Project Box */}
                     <div 
                       className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 cursor-pointer"
                       onClick={() => handleActivityTypeClick('project')}
                     >
                       <div className="text-center">
                         <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                           <Target className="w-8 h-8 text-white" />
                         </div>
                         <h3 className="font-bold text-gray-900 text-lg mb-2">Projects</h3>
                         <p className="text-gray-600 text-sm font-medium">
                           {displayActivities.filter(a => a.type === 'project').length} Available
                         </p>
                       </div>
                     </div>

                     {/* Other Activities Box */}
                     <div 
                       className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-sky-200 transition-all duration-300 cursor-pointer"
                       onClick={() => handleActivityTypeClick('other')}
                     >
                       <div className="text-center">
                         <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                           <Users className="w-8 h-8 text-white" />
                         </div>
                         <h3 className="font-bold text-gray-900 text-lg mb-2">Others</h3>
                         <p className="text-gray-600 text-sm font-medium">
                           {displayActivities.filter(a => a.type !== 'quiz' && a.type !== 'assignment' && a.type !== 'project').length} Available
                         </p>
                       </div>
                     </div>
                   </div>

                   {/* Recent Activities List */}
                   <div>
                     <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                       <Activity className="w-6 h-6 text-green-600 mr-3" />
                       Recent Activities
                     </h4>
                     <div className="space-y-4">
                       {displayActivities.slice(0, 5).map((activity) => (
                       <div 
                         key={activity.id} 
                           className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-green-200"
                         onClick={() => handleActivityClick(activity)}
                       >
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                                 activity.type === 'quiz' ? 'bg-gradient-to-br from-violet-500 to-violet-600' :
                                 activity.type === 'assignment' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                                 activity.type === 'project' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                                 'bg-gradient-to-br from-sky-500 to-sky-600'
                               }`}>
                                 {activity.type === 'quiz' ? <FileText className="w-7 h-7 text-white" /> :
                                  activity.type === 'assignment' ? <Code className="w-7 h-7 text-white" /> :
                                  activity.type === 'project' ? <Target className="w-7 h-7 text-white" /> :
                                  <Users className="w-7 h-7 text-white" />}
                           </div>
                               {activity.status === 'submitted' && (
                                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                   <Check className="w-3 h-3 text-white" />
                                 </div>
                               )}
                             </div>
                              
                          <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-green-700 transition-colors">{activity.title}</h3>
                              <p className="text-gray-600 mb-3 font-medium">{activity.courseTitle}</p>
                              <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getActivityStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getDifficultyColor(activity.difficulty)}`}>
                                {activity.difficulty}
                              </span>
                                <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-1.5 rounded-full">{activity.points} pts</span>
                            </div>
                          </div>
                        </div>
                            
                                                 <div className="text-right">
                             <div className="text-sm text-gray-600 mb-2 font-semibold">Due in {activity.timeRemaining}</div>
                                                        <button 
                                 className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Your Schedule</h3>
                <Info className="w-4 h-4 text-purple-500" />
              </div>
                <button
                  onClick={() => handleTabChange('schedule')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View Full Calendar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">Next 7 Days</p>
                
                {/* Calendar Strip */}
                <div className="relative mb-4">
                <div className="flex space-x-2 px-4 overflow-x-auto">
                    {getNext7Days().map((date, index) => {
                      const dayEvents = realScheduleData.filter(event => 
                        event.date.toDateString() === date.toDateString()
                      );
                      const isToday = date.toDateString() === new Date().toDateString();
                      const hasEvents = dayEvents.length > 0;
                      
                      return (
                      <div key={index} className="flex flex-col items-center min-w-[40px]">
                          <span className="text-xs text-gray-500 mb-1">
                            {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                          </span>
                          <div 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 cursor-pointer ${
                              isToday
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                                : hasEvents 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => {
                              setSelectedDate(date);
                              handleTabChange('schedule');
                            }}
                            title={hasEvents ? `${dayEvents.length} event(s)` : 'No events'}
                          >
                            {date.getDate()}
                        </div>
                          {hasEvents && (
                            <div className="flex space-x-1 mt-1">
                              {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    event.priority === 'high' ? 'bg-red-500' : 
                                    event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                ></div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-xs text-gray-500">+{dayEvents.length - 3}</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Today's Events Summary */}
                {realScheduleData.filter(event => 
                  event.date.toDateString() === new Date().toDateString()
                ).length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Today's Events</h4>
                    <div className="space-y-2">
                      {realScheduleData.filter(event => 
                        event.date.toDateString() === new Date().toDateString()
                      ).slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            event.priority === 'high' ? 'bg-red-500' : 
                            event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-sm text-blue-800">{event.title}</span>
                          <span className="text-xs text-blue-600">{event.time}</span>
                      </div>
                    ))}
                      {realScheduleData.filter(event => 
                        event.date.toDateString() === new Date().toDateString()
                      ).length > 3 && (
                        <button
                          onClick={() => handleTabChange('schedule')}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View {realScheduleData.filter(event => 
                            event.date.toDateString() === new Date().toDateString()
                          ).length - 3} more events
                        </button>
                      )}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
        )}

          {/* Courses Tab Content */}
          {activeTab === 'courses' && (
            <div className="space-y-6 ml-8 mr-8">
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
                <div className="w-full">
                  {renderCourseDetailView()}
                </div>
              ) : currentPage === 'section-view' ? (
                <div className="w-full">
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
                            target.src = getCourseImageFallback(course.category, course.title);
                            console.log(`🖼️ Image failed to load for course ${course.title}, using fallback`);
                          }}
                          onLoad={() => {
                            console.log(`🖼️ Image loaded successfully for course ${course.title}`);
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
            <div className="space-y-6 ml-8 mr-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Course Sections</h1>
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
                {displaySections.map((section) => (
                  <div 
                    key={section.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                    onClick={() => handleSectionClick(section)}
                  >
                    <div className="relative">
                      <img 
                        src={section.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'} 
                        alt={section.title}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getBestCourseImage({ fullname: section.courseTitle });
                          console.log(`🖼️ Image failed to load for section ${section.title}, using fallback`);
                        }}
                        onLoad={() => {
                          console.log(`🖼️ Image loaded successfully for section ${section.title}`);
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{section.courseTitle}</p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <BookOpen className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-500">{section.completedModules}/{section.totalModules} modules</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${section.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSectionClick(section);
                        }}
                      >
                        {section.status === 'completed' ? 'Review Section' : section.status === 'in-progress' ? 'Continue Section' : 'Start Section'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Tab Content - Enhanced UI with Light Colors */}
          {activeTab === 'activities' && (
            <div className="space-y-6 ml-8 mr-8">
              {/* Enhanced Header with Light Colors */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                      <Activity className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-cyan-800">Course Section Activities</h1>
                      <p className="text-cyan-600 mt-1">View and access all activities from your course sections</p>
                    </div>
                  </div>
                  <button
                    onClick={refreshData}
                    disabled={isLoadingResourceActivities}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingResourceActivities ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
              
              {isLoadingResourceActivities ? (
                <div className="bg-white rounded-2xl shadow-lg border border-cyan-200 p-12">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-cyan-800 mb-2">Loading Activities</h3>
                      <p className="text-cyan-600">Fetching your course activities and resources...</p>
                    </div>
                  </div>
                </div>
              ) : resourceActivities.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-cyan-200 overflow-hidden">
                  {/* Enhanced Activities Header */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-cyan-800 mb-2">
                          Found {resourceActivities.length} Activities
                        </h3>
                        <p className="text-cyan-600">
                          These are all the activities, resources, and materials from your course sections
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-cyan-600">{resourceActivities.length}</div>
                        <div className="text-sm text-cyan-500">Total Activities</div>
                      </div>
                    </div>
                    
                    {/* Enhanced Activity Type Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Object.entries(
                        resourceActivities.reduce((acc, activity) => {
                          acc[activity.type] = (acc[activity.type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => (
                        <div key={type} className="bg-white/60 backdrop-blur-sm border border-cyan-200 rounded-xl p-3 text-center hover:bg-white/80 transition-all duration-200">
                          <div className="text-lg font-bold text-cyan-700">{count as number}</div>
                          <div className="text-xs text-cyan-600 font-medium">{type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                {/* Enhanced Activities List */}
                <div className="p-6 space-y-4">
                    {resourceActivities.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className="group bg-gradient-to-r from-white to-cyan-50/30 border border-cyan-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all duration-300 cursor-pointer transform hover:scale-[1.01]"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                            activity.type === 'Quiz' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                            activity.type === 'Assignment' ? 'bg-gradient-to-br from-orange-100 to-orange-200' :
                            activity.type === 'Lesson' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                            activity.type === 'Discussion' ? 'bg-gradient-to-br from-green-100 to-green-200' :
                            activity.type === 'SCORM' ? 'bg-gradient-to-br from-indigo-100 to-indigo-200' :
                            activity.type === 'Workshop' ? 'bg-gradient-to-br from-pink-100 to-pink-200' :
                            activity.type === 'Resource' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' :
                            activity.type === 'URL Link' ? 'bg-gradient-to-br from-cyan-100 to-cyan-200' :
                            activity.type === 'Page' ? 'bg-gradient-to-br from-teal-100 to-teal-200' :
                            activity.type === 'Book' ? 'bg-gradient-to-br from-amber-100 to-amber-200' :
                            activity.type === 'Folder' ? 'bg-gradient-to-br from-slate-100 to-slate-200' :
                            activity.type === 'Glossary' ? 'bg-gradient-to-br from-violet-100 to-violet-200' :
                            activity.type === 'Wiki' ? 'bg-gradient-to-br from-rose-100 to-rose-200' :
                            activity.type === 'Chat' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' :
                            activity.type === 'Survey' ? 'bg-gradient-to-br from-lime-100 to-lime-200' :
                            activity.type === 'Database' ? 'bg-gradient-to-br from-sky-100 to-sky-200' :
                            activity.type === 'Interactive Content' ? 'bg-gradient-to-br from-fuchsia-100 to-fuchsia-200' :
                            activity.type === 'External Tool' ? 'bg-gradient-to-br from-stone-100 to-stone-200' :
                            'bg-gradient-to-br from-gray-100 to-gray-200'
                          }`}>
                            {React.createElement(activity.icon, { 
                              className: `w-6 h-6 ${
                                activity.type === 'Quiz' ? 'text-purple-600' :
                                activity.type === 'Assignment' ? 'text-orange-600' :
                                activity.type === 'Lesson' ? 'text-blue-600' :
                                activity.type === 'Discussion' ? 'text-green-600' :
                                activity.type === 'SCORM' ? 'text-indigo-600' :
                                activity.type === 'Workshop' ? 'text-pink-600' :
                                activity.type === 'Resource' ? 'text-yellow-600' :
                                activity.type === 'URL Link' ? 'text-cyan-600' :
                                activity.type === 'Page' ? 'text-teal-600' :
                                activity.type === 'Book' ? 'text-amber-600' :
                                activity.type === 'Folder' ? 'text-slate-600' :
                                activity.type === 'Glossary' ? 'text-violet-600' :
                                activity.type === 'Wiki' ? 'text-rose-600' :
                                activity.type === 'Chat' ? 'text-emerald-600' :
                                activity.type === 'Survey' ? 'text-lime-600' :
                                activity.type === 'Database' ? 'text-sky-600' :
                                activity.type === 'Interactive Content' ? 'text-fuchsia-600' :
                                activity.type === 'External Tool' ? 'text-stone-600' :
                                'text-gray-600'
                              }`
                            })}
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="font-bold text-cyan-800 text-lg mb-2 group-hover:text-cyan-900 transition-colors">{activity.name}</h3>
                            <p className="text-sm text-cyan-600 mb-3 font-medium">{activity.courseName}</p>
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                activity.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
                                activity.status === 'in_progress' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' :
                                'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                              }`}>
                              {activity.status}
                            </span>
                              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full border border-cyan-200">{activity.type}</span>
                              {activity.grade > 0 && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                  Grade: {activity.grade}/{activity.maxGrade}
                            </span>
                              )}
                              {activity.attempts > 0 && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                                  Attempts: {activity.attempts}/{activity.maxAttempts}
                                </span>
                              )}
                              {activity.fileSize > 0 && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                                  Size: {(activity.fileSize / 1024 / 1024).toFixed(1)} MB
                                </span>
                              )}
                              {activity.isResource && (
                                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full border border-cyan-200">Resource</span>
                              )}
                              {activity.isInteractive && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">Interactive</span>
                              )}
                          </div>
                            {activity.description && (
                              <p className="text-sm text-cyan-700 mt-2 line-clamp-2 leading-relaxed">
                                {activity.description}
                              </p>
                            )}
                            {activity.dueDate && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-700 font-medium flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Due: {activity.dueDate.toLocaleDateString()}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end space-y-3">
                          <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-medium border border-cyan-200">
                            {activity.sectionName}
                          </div>
                        <button 
                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                              activity.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' :
                              activity.status === 'in_progress' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white' :
                              'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                              if (activity.status === 'completed' || activity.status === 'in_progress') {
                                // For completed/in-progress activities, try API first, then direct link
                                handleStartActivityModal(activity);
                              } else {
                                // For new activities, show modal first
                            handleActivityClick(activity);
                              }
                          }}
                        >
                            {activity.status === 'completed' ? 'Review' :
                             activity.status === 'in_progress' ? 'Continue' : 
                             activity.isResource ? 'Open' : 'Start'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-cyan-200 p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10 text-cyan-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-cyan-800 mb-3">No Activities Available</h3>
                  <p className="text-cyan-600 mb-6 max-w-md mx-auto">
                    You don't have any activities available at the moment. Check back later or contact your instructor.
                  </p>
                  <button
                    onClick={refreshData}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Refresh Activities
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Other tabs content can be added here */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 ml-8 mr-8">
              <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">Achievements feature will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6 ml-8 mr-8">
              <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
              </div>
            </div>

              {isLoadingRealSchedule ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading schedule...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Calendar View */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
                      <CalendarView 
                        currentMonth={currentMonth}
                        scheduleData={realScheduleData}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                      />
                    </div>
                  </div>

                  {/* Upcoming Events */}
            <div className="space-y-6">
                    {/* Selected Date Events */}
                    {selectedDate && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Events for {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        {realScheduleData.filter(event => 
                          event.date.toDateString() === selectedDate.toDateString()
                        ).length > 0 ? (
                          <div className="space-y-3">
                            {realScheduleData.filter(event => 
                              event.date.toDateString() === selectedDate.toDateString()
                            ).map((event) => (
                              <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{event.courseName}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">{event.time}</span>
              </div>
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">{event.duration} min</span>
                                      </div>
                                    </div>
                                    {event.description && (
                                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end space-y-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                      event.priority === 'high' ? 'bg-red-500' : 
                                      event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                      event.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {event.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 text-sm">No events scheduled for this date</p>
                          </div>
                        )}
            </div>
          )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                      {realScheduleData.length > 0 ? (
                        <div className="space-y-3">
                          {realScheduleData.slice(0, 5).map((event) => (
                            <div key={event.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{event.courseName}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {event.date.toLocaleDateString()} at {event.time}
                                    </span>
                                  </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${
                                  event.priority === 'high' ? 'bg-red-500' : 
                                  event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 text-sm">No upcoming events</p>
                        </div>
                      )}
                    </div>

                    {/* Today's Schedule */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                      {realScheduleData.filter(event => 
                        event.date.toDateString() === new Date().toDateString()
                      ).length > 0 ? (
                        <div className="space-y-3">
                          {realScheduleData.filter(event => 
                            event.date.toDateString() === new Date().toDateString()
                          ).map((event) => (
                            <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  event.status === 'completed' ? 'bg-green-500' : 
                                  event.status === 'in_progress' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}></div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                                  <p className="text-xs text-gray-600">{event.time}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  event.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 text-sm">No events today</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grades Section */}
          {activeTab === 'grades' && (
            <div className="space-y-6 ml-8 mr-8">
              {/* Grades Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Grades & Performance</h2>
                    <p className="text-purple-100">Track your academic progress and achievements</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium">{gradesData.length} Grades</span>
                    </div>
                    <button
                      onClick={refreshData}
                      disabled={isLoadingGrades}
                      className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-5 h-5 ${isLoadingGrades ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingGrades ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Grades</h3>
                  <p className="text-gray-600">Fetching your academic performance data...</p>
                </div>
              ) : gradesData.length > 0 ? (
                <div className="space-y-6">
                  {/* Grade Statistics */}
                  {gradeStatistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Average Grade</p>
                            <p className="text-2xl font-bold text-purple-600">{gradeStatistics.averagePercentage}%</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                            <p className="text-2xl font-bold text-green-600">{gradeStatistics.passRate}%</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Grades</p>
                            <p className="text-2xl font-bold text-blue-600">{gradeStatistics.totalGrades}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Passed</p>
                            <p className="text-2xl font-bold text-emerald-600">{gradeStatistics.passedCount}</p>
                          </div>
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grade Distribution Chart */}
                  {gradeStatistics && Object.keys(gradeStatistics.gradeDistribution).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(gradeStatistics.gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2 ${
                              grade === 'A+' || grade === 'A' ? 'bg-green-500' :
                              grade === 'A-' || grade === 'B+' ? 'bg-blue-500' :
                              grade === 'B' || grade === 'B-' ? 'bg-yellow-500' :
                              grade === 'C+' || grade === 'C' ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}>
                              {grade}
                            </div>
                            <p className="text-sm font-medium text-gray-900">{count as number}</p>
                            <p className="text-xs text-gray-500">grades</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Performance */}
                  {gradeStatistics && Object.keys(gradeStatistics.courseStats).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
                      <div className="space-y-4">
                        {Object.entries(gradeStatistics.courseStats).map(([courseId, course]: [string, any]) => (
                          <div key={courseId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{course.averageGrade}% Average</span>
                                <span>{course.passedCount}/{course.totalGrades} Passed</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${course.averageGrade}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Grades */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Grades</h3>
                    <div className="space-y-4">
                      {gradesData.map((grade) => (
                        <div key={grade.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={grade.courseImage} 
                                  alt={grade.courseName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getCourseImageFallback(grade.courseName, grade.courseName);
                                  }}
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{grade.itemName}</h4>
                                <p className="text-sm text-gray-600">{grade.courseName}</p>
                                <p className="text-xs text-gray-500">{grade.itemType} • {grade.timeModified.toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                grade.percentage >= 90 ? 'text-green-600' :
                                grade.percentage >= 80 ? 'text-blue-600' :
                                grade.percentage >= 70 ? 'text-yellow-600' :
                                grade.percentage >= 60 ? 'text-orange-600' :
                                'text-red-600'
                              }`}>
                                {grade.percentage}%
                              </div>
                              <div className="text-sm text-gray-600">
                                {grade.grade}/{grade.maxGrade} • {grade.letterGrade}
                              </div>
                              <div className={`text-xs font-medium ${
                                grade.isPassed ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {grade.isPassed ? 'Passed' : 'Failed'}
                              </div>
                            </div>
                          </div>
                          {grade.feedback && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{grade.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grades Available</h3>
                  <p className="text-gray-600 mb-4">You don't have any grades yet. Complete some assignments to see your progress here.</p>
                  <button
                    onClick={refreshData}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Refresh Grades
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tree-view' && (
            <div className="space-y-6 ml-8 mr-8">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Course Structure</h1>
                      <p className="text-blue-100">Explore your learning path with interactive tree view</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium">{treeViewData.length} Courses</span>
                    </div>
                    <button
                      onClick={refreshData}
                      disabled={isLoadingTreeView}
                      className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-5 h-5 ${isLoadingTreeView ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Tree View Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {isLoadingTreeView ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Course Structure</h3>
                      <p className="text-gray-600">Fetching your courses and activities...</p>
                    </div>
                  </div>
                ) : treeViewData.length > 0 ? (
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Your Learning Path</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                          <span>Courses</span>
                          <div className="w-3 h-3 bg-green-400 rounded-full ml-4"></div>
                          <span>Sections</span>
                          <div className="w-3 h-3 bg-blue-400 rounded-full ml-4"></div>
                          <span>Activities</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                    {treeViewData.map((course, courseIndex) => (
                      <CourseTreeItem 
                        key={course.id} 
                        course={course} 
                        courseIndex={courseIndex}
                        onActivityClick={handleActivityClick}
                        onStartActivity={handleStartActivityModal}
                      />
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BarChart3 className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Courses Available</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You don't have any courses assigned yet. Contact your instructor to get started with your learning journey.
                    </p>
                    <button
                      onClick={refreshData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Refresh Courses
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Scratch Editor Tab Content */}
          {activeTab === 'scratch-editor' && (
            <div className="space-y-6 ml-8 mr-8">
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
            <div className="space-y-6 ml-8 mr-8">
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
            <div className="space-y-6 ml-8 mr-8">
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
            <div className="space-y-6 ml-8 mr-8">
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
            <div className="space-y-6 ml-8 mr-8">
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
            <div className="space-y-6 ml-8 mr-8">
              {/* Competencies Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Learning Competencies</h2>
                    <p className="text-blue-100">Track your progress across different learning competencies and skills</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium">{competencies.length} Competencies</span>
                    </div>
                <button
                      onClick={refreshData}
                  disabled={isLoadingCompetencies}
                      className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors disabled:opacity-50"
                >
                      <RefreshCw className={`w-5 h-5 ${isLoadingCompetencies ? 'animate-spin' : ''}`} />
                </button>
                  </div>
                </div>
              </div>
              
              {/* Loading State */}
              {isLoadingCompetencies ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Competencies</h3>
                  <p className="text-gray-600">Fetching your competency progress data...</p>
                </div>
              ) : competencies.length > 0 ? (
                <div className="space-y-6">
                  {/* Competency Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Competencies</p>
                          <p className="text-2xl font-bold text-blue-600">{competencies.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                </div>
                
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-green-600">
                            {competencies.filter(c => c.status === 'completed' || c.progress === 100).length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">In Progress</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {competencies.filter(c => c.status === 'in_progress' || (c.progress > 0 && c.progress < 100)).length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Progress</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {competencies.length > 0 ? Math.round(competencies.reduce((sum, c) => sum + c.progress, 0) / competencies.length) : 0}%
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competency Categories */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from(new Set(competencies.map(c => c.category))).map((category) => {
                        const categoryCompetencies = competencies.filter(c => c.category === category);
                        const categoryProgress = categoryCompetencies.length > 0 
                          ? Math.round(categoryCompetencies.reduce((sum, c) => sum + c.progress, 0) / categoryCompetencies.length)
                          : 0;
                        
                        return (
                          <div key={category} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{category}</h4>
                              <span className="text-sm text-gray-600">{categoryCompetencies.length} competencies</span>
                    </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${categoryProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600">{categoryProgress}% average progress</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Individual Competencies */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Competencies</h3>
                    <div className="space-y-4">
                      {competencies.map((competency) => (
                        <div key={competency.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-600" />
                    </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{competency.name}</h4>
                                <p className="text-sm text-gray-600">{competency.category}</p>
                                <p className="text-xs text-gray-500">
                                  {competency.completedActivities}/{competency.totalActivities} activities completed
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                competency.progress >= 90 ? 'text-green-600' :
                                competency.progress >= 70 ? 'text-blue-600' :
                                competency.progress >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {competency.progress}%
                              </div>
                              <div className={`text-xs font-medium ${
                                competency.status === 'completed' ? 'text-green-600' :
                                competency.status === 'in_progress' ? 'text-blue-600' :
                                'text-gray-600'
                              }`}>
                                {competency.status === 'completed' ? 'Completed' :
                                 competency.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                              </div>
                    </div>
                  </div>
                  
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                competency.progress >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                competency.progress >= 70 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                competency.progress >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-red-500 to-red-600'
                              }`}
                              style={{ width: `${competency.progress}%` }}
                            ></div>
                    </div>
                          
                          {competency.description && (
                            <p className="text-sm text-gray-700 mb-2">{competency.description}</p>
                          )}
                          
                          {competency.courseCount > 0 && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <BookOpen className="w-3 h-3" />
                              <span>{competency.courseCount} related courses</span>
                    </div>
                          )}
                  </div>
                      ))}
                </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Competencies Available</h3>
                  <p className="text-gray-600 mb-4">You don't have any competencies assigned yet. Contact your instructor to get started.</p>
                  <button
                    onClick={refreshData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Refresh Competencies
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Badges Tab Content */}
          {activeTab === 'badges' && (
            <div className="space-y-6 ml-8 mr-8">
              {/* Badges Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Badges & Achievements</h2>
                    <p className="text-yellow-100">Track your achievements and earned badges from courses and activities</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium">{badges.length} Badges</span>
                    </div>
                    <button
                      onClick={refreshData}
                      disabled={isLoadingBadges}
                      className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-5 h-5 ${isLoadingBadges ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={async () => {
                        console.log('🔍 Running badge diagnostic...');
                        try {
                          const response = await fetch('/api/moodle', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                              wsfunction: 'core_webservice_get_site_info'
                            })
                          });
                          const data = await response.json();
                          console.log('📋 Full site info:', data);
                          console.log('🔍 Badge-related functions:', data.functions ? Object.keys(data.functions).filter(f => f.toLowerCase().includes('badge')) : 'No functions');
                        } catch (error) {
                          console.error('❌ Diagnostic failed:', error);
                        }
                      }}
                      className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                      title="Run Badge Diagnostic"
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingBadges ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Badges</h3>
                  <p className="text-gray-600">Fetching your badge achievements data...</p>
                </div>
              ) : badges.length > 0 ? (
                <div className="space-y-6">
                  {/* Badge Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Badges</p>
                          <p className="text-2xl font-bold text-yellow-600">{badges.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Awarded</p>
                          <p className="text-2xl font-bold text-green-600">
                            {badges.filter(b => b.isAwarded).length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Available</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {badges.filter(b => !b.isAwarded).length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {badges.length > 0 ? Math.round((badges.filter(b => b.isAwarded).length / badges.length) * 100) : 0}%
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Awarded Badges */}
                  {badges.filter(b => b.isAwarded).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Awarded Badges</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {badges.filter(b => b.isAwarded).map((badge) => (
                          <div key={badge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                                {badge.imageurl ? (
                                  <img 
                                    src={badge.imageurl} 
                                    alt={badge.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <Trophy className={`w-8 h-8 text-yellow-600 ${badge.imageurl ? 'hidden' : ''}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{badge.name}</h4>
                                <p className="text-sm text-gray-600">{badge.issuer}</p>
                                {badge.awardedDate && (
                                  <p className="text-xs text-gray-500">
                                    Awarded: {new Date(badge.awardedDate * 1000).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            {badge.description && (
                              <p className="text-sm text-gray-700 mb-3">{badge.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Awarded
                              </span>
                              {badge.courseid > 0 && (
                                <span className="text-xs text-gray-500">Course Badge</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Badges */}
                  {badges.filter(b => !b.isAwarded).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Available Badges</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {badges.filter(b => !b.isAwarded).map((badge) => (
                          <div key={badge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow opacity-75">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                {badge.imageurl ? (
                                  <img 
                                    src={badge.imageurl} 
                                    alt={badge.name}
                                    className="w-12 h-12 rounded-lg object-cover grayscale"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <Trophy className={`w-8 h-8 text-gray-400 ${badge.imageurl ? 'hidden' : ''}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{badge.name}</h4>
                                <p className="text-sm text-gray-600">{badge.issuer}</p>
                                {badge.criteria && (
                                  <p className="text-xs text-gray-500">Criteria: {badge.criteria}</p>
                                )}
                              </div>
                            </div>
                            {badge.description && (
                              <p className="text-sm text-gray-700 mb-3">{badge.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Available
                              </span>
                              {badge.courseid > 0 && (
                                <span className="text-xs text-gray-500">Course Badge</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Badges List */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Badges</h3>
                    <div className="space-y-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                badge.isAwarded 
                                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100' 
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
                              }`}>
                                {badge.imageurl ? (
                                  <img 
                                    src={badge.imageurl} 
                                    alt={badge.name}
                                    className={`w-8 h-8 rounded-lg object-cover ${!badge.isAwarded ? 'grayscale' : ''}`}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <Trophy className={`w-6 h-6 ${badge.isAwarded ? 'text-yellow-600' : 'text-gray-400'} ${badge.imageurl ? 'hidden' : ''}`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{badge.name}</h4>
                                <p className="text-sm text-gray-600">{badge.issuer}</p>
                                {badge.description && (
                                  <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                badge.isAwarded 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {badge.isAwarded ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Awarded
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Available
                                  </>
                                )}
                              </div>
                              {badge.awardedDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(badge.awardedDate * 1000).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Badges Found</h3>
                  <div className="text-gray-600 mb-6 space-y-2">
                    <p>This could mean:</p>
                    <ul className="text-sm text-left max-w-md mx-auto space-y-1">
                      <li>• Badge functionality is not enabled in your Moodle system</li>
                      <li>• No badges have been created yet</li>
                      <li>• Badge APIs are not available in your Moodle version</li>
                      <li>• You need to complete courses/activities to earn badges</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-4">
                      Check the browser console for detailed diagnostic information.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={refreshData}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Refresh Badges
                    </button>
                    <button
                      onClick={async () => {
                        console.log('🔍 Running badge diagnostic...');
                        try {
                          const response = await fetch('/api/moodle', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                              wsfunction: 'core_webservice_get_site_info'
                            })
                          });
                          const data = await response.json();
                          console.log('📋 Full site info:', data);
                          console.log('🔍 Badge-related functions:', data.functions ? Object.keys(data.functions).filter(f => f.toLowerCase().includes('badge')) : 'No functions');
                          alert('Check browser console for diagnostic results');
                        } catch (error) {
                          console.error('❌ Diagnostic failed:', error);
                          alert('Diagnostic failed - check console for details');
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Run Diagnostic
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Section */}
          {activeTab === 'settings' && (
            <div className="space-y-6 ml-8 mr-8">
              {/* Settings Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Settings & Profile</h2>
                    <p className="text-blue-100">Manage your account and preferences</p>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading profile...</span>
                  </div>
                ) : userProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={userProfile.fullname}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={userProfile.email}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          value={userProfile.username}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={`${userProfile.city}, ${userProfile.country}`}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <input
                          type="text"
                          value={userProfile.timezone}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <input
                          type="text"
                          value={userProfile.joinDate.toLocaleDateString()}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Unable to load profile information</p>
                  </div>
                )}
              </div>

              {/* Learning Statistics */}
              {userProfile && (
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{userProfile.totalCourses}</div>
                      <div className="text-sm text-gray-600">Total Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{userProfile.completedCourses}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {userProfile.totalCourses > 0 ? Math.round((userProfile.completedCourses / userProfile.totalCourses) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                      <p className="text-xs text-gray-600">Receive email updates about your courses</p>
                    </div>
                    <button
                      onClick={() => setUserPreferences(prev => ({ ...prev, emailUpdates: !prev.emailUpdates }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        userPreferences.emailUpdates ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          userPreferences.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                      <p className="text-xs text-gray-600">Receive notifications for important updates</p>
                    </div>
                    <button
                      onClick={() => setUserPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        userPreferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          userPreferences.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Dark Mode</label>
                      <p className="text-xs text-gray-600">Switch to dark theme</p>
                    </div>
                    <button
                      onClick={() => setUserPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        userPreferences.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          userPreferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Language and Timezone */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={userPreferences.language}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={userPreferences.timezone}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Sign Out</label>
                      <p className="text-xs text-gray-600">Sign out of your account</p>
                    </div>
                    <button
                      onClick={() => setShowLogoutDialog(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // Save preferences
                    console.log('Saving preferences:', userPreferences);
                    // You can add API call here to save preferences
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

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
                {isViewingActivityInline ? (
                  /* Inline Activity View */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedActivity.name || selectedActivity.title}</h2>
                        <p className="text-gray-600">{selectedActivity.courseName || selectedActivity.courseTitle}</p>
                      </div>
                      <button 
                        onClick={closeInlineActivity}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Back to Details
                      </button>
                    </div>
                    
                    {isLoadingActivityData ? (
                      /* Loading State */
                      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Activity</h3>
                        <p className="text-gray-600">Fetching activity content directly from the learning system...</p>
                        <div className="mt-4 bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            🎯 Your activity will open directly in this dashboard - no proxy server needed!
                          </p>
                        </div>
                      </div>
                    ) : selectedActivity.apiData ? (
                      /* API Data Display */
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Content</h3>
                          <div className="text-sm text-gray-600 mb-4">
                            Type: {selectedActivity.apiData.type || selectedActivity.type} | 
                            Status: {selectedActivity.apiData.status || selectedActivity.status}
                          </div>
                        </div>
                        
                        {/* Render different activity types based on API data */}
                        {selectedActivity.apiData.type === 'quiz' && (
                          <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-semibold text-blue-900 mb-2">Quiz: {selectedActivity.apiData.title}</h4>
                              <p className="text-blue-800 mb-3">{selectedActivity.apiData.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-blue-700">
                                <span>Questions: {selectedActivity.apiData.questions?.length || 0}</span>
                                <span>Time Limit: {selectedActivity.apiData.timeLimit || 'No limit'}</span>
                                <span>Attempts: {selectedActivity.apiData.attempts || 'Unlimited'}</span>
                              </div>
                            </div>
                            {selectedActivity.apiData.questions?.map((question: any, index: number) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900 mb-2">Question {index + 1}</h5>
                                <p className="text-gray-700 mb-3">{question.text}</p>
                                <div className="space-y-2">
                                  {question.options?.map((option: any, optIndex: number) => (
                                    <label key={optIndex} className="flex items-center space-x-2">
                                      <input type="radio" name={`question_${index}`} className="text-blue-600" />
                                      <span className="text-gray-700">{option.text}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                              Submit Quiz
                            </button>
                          </div>
                        )}
                        
                        {selectedActivity.apiData.type === 'assignment' && (
                          <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <h4 className="font-semibold text-orange-900 mb-2">Assignment: {selectedActivity.apiData.title}</h4>
                              <p className="text-orange-800 mb-3">{selectedActivity.apiData.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-orange-700">
                                <span>Due: {selectedActivity.apiData.dueDate || 'No due date'}</span>
                                <span>Points: {selectedActivity.apiData.points || 0}</span>
                                <span>Submissions: {selectedActivity.apiData.submissions || 0}</span>
                              </div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-2">Instructions</h5>
                              <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: selectedActivity.apiData.instructions || 'No instructions provided.' }} />
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                                <input type="file" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
                                <textarea 
                                  rows={4} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="Add any comments about your submission..."
                                />
                              </div>
                              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                Submit Assignment
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {selectedActivity.apiData.type === 'lesson' && (
                          <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-semibold text-green-900 mb-2">Lesson: {selectedActivity.apiData.title}</h4>
                              <p className="text-green-800 mb-3">{selectedActivity.apiData.description}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                              <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: selectedActivity.apiData.content || 'No content available.' }} />
                            </div>
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                              Mark as Complete
                            </button>
                          </div>
                        )}
                        
                        {/* Generic activity display for other types */}
                        {!['quiz', 'assignment', 'lesson'].includes(selectedActivity.apiData.type) && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{selectedActivity.apiData.title}</h4>
                              <p className="text-gray-700 mb-3">{selectedActivity.apiData.description}</p>
                              <div className="text-sm text-gray-600">
                                Type: {selectedActivity.apiData.type} | 
                                Status: {selectedActivity.apiData.status}
                              </div>
                            </div>
                            {selectedActivity.apiData.content && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: selectedActivity.apiData.content }} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : selectedActivity.useDirectContent && selectedActivity.directContent ? (
                      /* Direct Content Display */
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-semibold text-lg">{selectedActivity.name || selectedActivity.title}</h3>
                              <p className="text-blue-100 text-sm">{selectedActivity.courseName || selectedActivity.courseTitle}</p>
                            </div>
                            <button 
                              onClick={closeInlineActivity}
                              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full max-h-[600px] overflow-y-auto">
                          <style dangerouslySetInnerHTML={{
                            __html: `
                              .activity-content {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                              }
                              .activity-content h1, .activity-content h2, .activity-content h3 {
                                color: #2d3748;
                                margin-bottom: 12px;
                              }
                              .activity-content p {
                                color: #4a5568;
                                line-height: 1.6;
                                margin-bottom: 12px;
                              }
                              .activity-content a {
                                color: #3182ce;
                                text-decoration: underline;
                              }
                              .activity-content a:hover {
                                color: #2c5282;
                              }
                              .activity-content button, .activity-content input[type="submit"] {
                                background: #3182ce;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                              }
                              .activity-content button:hover, .activity-content input[type="submit"]:hover {
                                background: #2c5282;
                              }
                            `
                          }} />
                          <div 
                            dangerouslySetInnerHTML={{ __html: selectedActivity.directContent }}
                            className="activity-content"
                          />
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 text-center">
                            {selectedActivity.isFallbackInterface ? 
                              '✅ Activity interface loaded. Content will be available when connected to the learning system.' :
                              '✅ Activity content loaded successfully. You can interact with it directly above.'
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Error State */
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Activity Not Found</h3>
                        <p className="text-yellow-700 mb-4">
                          The activity URL could not be found. This might be because:
                        </p>
                        <ul className="text-yellow-700 text-sm mb-4 text-left max-w-md mx-auto">
                          <li>• The activity ID is incorrect</li>
                          <li>• The activity has been moved or deleted</li>
                          <li>• You don't have access to this activity</li>
                        </ul>
                        <div className="space-y-2">
                          <button 
                            onClick={() => {
                              // Try to reload the activity
                              if (selectedActivity.activityUrl || selectedActivity.directContent) {
                                window.location.reload();
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors mr-2"
                          >
                            Retry Loading
                          </button>
                          <button 
                            onClick={closeInlineActivity}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Back to Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Activity Details View */
                  <div>
                <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedActivity.name || selectedActivity.title}</h2>
                      <p className="text-gray-600 text-lg">{selectedActivity.courseName || selectedActivity.courseTitle}</p>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-semibold text-gray-900">{selectedActivity.type || 'Activity'}</p>
                      </div>
                    </div>
                  </div>
                
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-semibold text-gray-900 capitalize">{selectedActivity.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Details */}
                <div className="space-y-4 mb-6">
                      {selectedActivity.description && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                          <p className="text-gray-600">{selectedActivity.description}</p>
                        </div>
                      )}
                      
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Type</span>
                    <span className="text-sm text-gray-900 capitalize">{selectedActivity.type}</span>
                  </div>
                      
                      {selectedActivity.sectionName && (
                  <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Section</span>
                          <span className="text-sm text-gray-900">{selectedActivity.sectionName}</span>
                  </div>
                      )}
                      
                      {selectedActivity.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Due Date</span>
                          <span className="text-sm text-gray-900">
                            {selectedActivity.dueDate instanceof Date ? 
                              selectedActivity.dueDate.toLocaleDateString() : 
                              selectedActivity.dueDate}
                          </span>
                  </div>
                      )}
                </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                      {selectedActivity.status === 'completed' ? (
                        <button 
                          onClick={() => handleStartActivityModal(selectedActivity)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                    <CheckCircle className="w-5 h-5" />
                          <span>Review Activity</span>
                  </button>
                      ) : selectedActivity.status === 'in-progress' ? (
                        <button 
                          onClick={() => handleStartActivityModal(selectedActivity)}
                          className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <Play className="w-5 h-5" />
                          <span>Continue Activity</span>
                  </button>
                ) : (
                        <button 
                          onClick={() => handleStartActivityModal(selectedActivity)}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                        >
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Settings & Profile</h2>
                      <p className="text-sm text-gray-600">Manage your account and preferences</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                {/* Profile Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Loading profile...</span>
                    </div>
                  ) : userProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={userProfile.fullname}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={userProfile.email}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            value={userProfile.username}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={`${userProfile.city}, ${userProfile.country}`}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                          <input
                            type="text"
                            value={userProfile.timezone}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                          <input
                            type="text"
                            value={userProfile.joinDate.toLocaleDateString()}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Unable to load profile information</p>
                    </div>
                  )}
                </div>

                {/* Learning Statistics */}
                {userProfile && (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{userProfile.totalCourses}</div>
                        <div className="text-sm text-gray-600">Total Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{userProfile.completedCourses}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {userProfile.totalCourses > 0 ? Math.round((userProfile.completedCourses / userProfile.totalCourses) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                        <p className="text-xs text-gray-600">Receive email updates about your courses</p>
                      </div>
                      <button
                        onClick={() => setUserPreferences(prev => ({ ...prev, emailUpdates: !prev.emailUpdates }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          userPreferences.emailUpdates ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            userPreferences.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                        <p className="text-xs text-gray-600">Receive notifications for important updates</p>
                      </div>
                      <button
                        onClick={() => setUserPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          userPreferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            userPreferences.notifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Dark Mode</label>
                        <p className="text-xs text-gray-600">Switch to dark theme</p>
                      </div>
                      <button
                        onClick={() => setUserPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          userPreferences.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            userPreferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Language and Timezone */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select
                        value={userPreferences.language}
                        onChange={(e) => setUserPreferences(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select
                        value={userPreferences.timezone}
                        onChange={(e) => setUserPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Sign Out</label>
                        <p className="text-xs text-gray-600">Sign out of your account</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowSettingsModal(false);
                          setShowLogoutDialog(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-3xl">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Save preferences
                      console.log('Saving preferences:', userPreferences);
                      setShowSettingsModal(false);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Dialog */}
        <LogoutDialog
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
          onConfirm={handleLogout}
          userName={currentUser?.fullname || currentUser?.username || 'Student'}
        />
      </div>
    </div>
  );
});

// Add display name for debugging
G4G7Dashboard.displayName = 'G4G7Dashboard';

export default G4G7Dashboard;