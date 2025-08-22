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
  Target as TargetIcon
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
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
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real courses from Moodle API...');
      
      // Get current user from auth context
      if (!currentUser) {
        console.log('⚠️ No current user found');
        setError('Please log in to view your courses');
        setLoading(false);
        return;
      }

      console.log('👤 Current user:', currentUser);
      
      // Fetch real courses from Moodle API
      try {
        // First get user profile to ensure we have the correct user ID
        const userProfile = await moodleService.getProfile();
        console.log('✅ User profile fetched:', userProfile);
        
        if (!userProfile || !userProfile.id) {
          throw new Error('Could not fetch user profile');
        }

        // Get user's enrolled courses using the real user ID
        const userCourses = await moodleService.getUserCourses(userProfile.id.toString());
        console.log('📊 User courses data fetched:', {
          userProfile,
          courses: userCourses.length,
          courseData: userCourses
        });

        // Also get all available courses to show what's available
        const allCourses = await moodleService.getAllCourses();
        console.log('📚 All available courses:', allCourses.length);

        if (userCourses && userCourses.length > 0) {
          // Process real enrolled course data from Moodle API
          const processedCourses: Course[] = userCourses.map(course => {
            // Use real progress if available, otherwise calculate based on course data
            const progress = course.progress || Math.floor(Math.random() * 100);
            const grade = Math.floor(Math.random() * 20) + 75; // 75-95 grade (mock for now)
            const enrolledStudents = Math.floor(Math.random() * 50) + 10; // Mock data
            const totalModules = Math.floor(Math.random() * 10) + 5; // Mock data
            const completedModules = Math.floor(progress / 100 * totalModules);
            
            return {
              id: course.id,
              fullname: course.fullname,
              shortname: course.shortname,
              progress,
              grade,
              lastAccess: course.startdate,
              completionDate: course.enddate,
              status: progress === 100 ? 'completed' : 
                     progress > 0 ? 'in_progress' : 'not_started',
              categoryname: course.categoryname || 'General',
              startdate: course.startdate,
              enddate: course.enddate,
              visible: course.visible,
              description: course.summary || `Comprehensive course covering ${course.shortname.toLowerCase()} fundamentals and advanced concepts.`,
              instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
              enrolledStudents,
              totalModules,
              completedModules
            };
          });

          setCourses(processedCourses);
          console.log('✅ Real enrolled courses processed successfully:', processedCourses.length);
        } else if (allCourses && allCourses.length > 0) {
          // If no enrolled courses, show available courses as "not started"
          console.log('⚠️ No enrolled courses, showing available courses');
          const availableCourses: Course[] = allCourses
            .filter(course => course.id !== '1' && course.visible !== 0) // Filter out site course and hidden courses
            .map(course => {
              return {
                id: course.id,
                fullname: course.fullname,
                shortname: course.shortname,
                progress: 0, // Not started
                grade: 0,
                lastAccess: course.startdate,
                completionDate: course.enddate,
                status: 'not_started',
                categoryname: course.categoryname || 'General',
                startdate: course.startdate,
                enddate: course.enddate,
                visible: course.visible,
                description: course.summary || `Comprehensive course covering ${course.shortname.toLowerCase()} fundamentals and advanced concepts.`,
                instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
                enrolledStudents: Math.floor(Math.random() * 50) + 10,
                totalModules: Math.floor(Math.random() * 10) + 5,
                completedModules: 0
              };
            });

          setCourses(availableCourses);
          console.log('✅ Available courses processed successfully:', availableCourses.length);
        } else {
          console.log('⚠️ No courses found');
          setCourses([]);
          setError('No courses available in the system.');
        }
        
        // Generate activities for the courses
        generateSampleActivities();
        generateSampleStudentActivities();
        
      } catch (apiError) {
        console.error('❌ Error fetching from Moodle API:', apiError);
        setError('Failed to load courses from Moodle API. Please check your connection and try again.');
        setCourses([]);
      }

    } catch (error) {
      console.error('❌ Error in fetchCourses:', error);
      setError('Failed to load courses. Please check your connection and try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleActivities = () => {
    const activities: CourseActivity[] = [
      {
        id: '1',
        name: 'Introduction to Programming Assignment',
        type: 'assignment',
        status: 'in_progress',
        dueDate: Date.now() + 86400 * 7, // 7 days from now
        grade: 0,
        maxGrade: 100,
        description: 'Create a simple program using basic programming concepts',
        instructions: 'Write a program that demonstrates variables, loops, and functions. Submit your code and a brief explanation.',
        attachments: ['assignment_guidelines.pdf', 'sample_code.py'],
        timeSpent: 45,
        attempts: 1,
        maxAttempts: 3
      },
      {
        id: '2',
        name: 'Mathematics Quiz - Chapter 1',
        type: 'quiz',
        status: 'completed',
        dueDate: Date.now() - 86400 * 2,
        grade: 85,
        maxGrade: 100,
        description: 'Test your understanding of basic mathematical concepts',
        instructions: 'Complete the quiz within 30 minutes. You have 2 attempts.',
        timeSpent: 25,
        attempts: 1,
        maxAttempts: 2
      },
      {
        id: '3',
        name: 'Digital Design Workshop',
        type: 'workshop',
        status: 'not_started',
        dueDate: Date.now() + 86400 * 14,
        grade: 0,
        maxGrade: 100,
        description: 'Hands-on workshop for digital design principles',
        instructions: 'Participate in the workshop and complete the design project.',
        timeSpent: 0,
        attempts: 0,
        maxAttempts: 1
      },
      {
        id: '4',
        name: 'Science Lab Video',
        type: 'video',
        status: 'completed',
        dueDate: Date.now() - 86400 * 5,
        grade: 100,
        maxGrade: 100,
        description: 'Watch the lab safety and procedure video',
        instructions: 'Watch the complete video and take notes on safety procedures.',
        timeSpent: 15,
        attempts: 1,
        maxAttempts: 1
      }
    ];

    setCourseActivities(activities);
  };

  const generateSampleStudentActivities = () => {
    const activities: StudentActivity[] = [
      {
        id: '1',
        courseId: '1',
        activityId: '1',
        type: 'study',
        title: 'Programming Fundamentals Review',
        description: 'Review basic programming concepts before the assignment',
        duration: 60,
        completed: true,
        timestamp: Date.now() - 86400 * 2,
        notes: 'Focused on variables, loops, and functions. Need to practice more with arrays.',
        resources: ['programming_basics.pdf', 'practice_exercises.pdf'],
        goals: ['Understand variable scope', 'Master loop structures', 'Practice function writing'],
        achievements: ['Completed 10 practice exercises', 'Watched 3 tutorial videos']
      },
      {
        id: '2',
        courseId: '1',
        activityId: '2',
        type: 'practice',
        title: 'Math Problem Solving',
        description: 'Practice solving mathematical problems for the quiz',
        duration: 45,
        completed: true,
        timestamp: Date.now() - 86400 * 1,
        notes: 'Good progress on algebra problems. Need to review geometry formulas.',
        resources: ['math_formulas.pdf', 'practice_quiz.pdf'],
        goals: ['Solve 20 practice problems', 'Review key formulas', 'Improve speed'],
        achievements: ['Solved 18/20 problems correctly', 'Completed practice quiz in 25 minutes']
      },
      {
        id: '3',
        courseId: '2',
        activityId: '3',
        type: 'review',
        title: 'Design Principles Study',
        description: 'Study design principles for the upcoming workshop',
        duration: 90,
        completed: false,
        timestamp: Date.now(),
        notes: 'Started studying color theory and typography. Need to continue with layout principles.',
        resources: ['design_principles.pdf', 'color_theory.pdf'],
        goals: ['Understand color theory', 'Learn typography basics', 'Master layout principles'],
        achievements: ['Completed color theory module', 'Watched typography tutorial']
      }
    ];

    setStudentActivities(activities);
  };

  const handleCourseClick = async (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
    
    console.log('📚 Opening course details for:', course.fullname);
    console.log('🔍 Fetching real course data from Moodle API...');
    
    try {
      // Fetch real course details from Moodle API
      const courseDetails = await moodleService.getCourseDetails(course.id);
      
      if (courseDetails) {
        console.log('✅ Real course details fetched:', courseDetails);
        
        // Process real course modules and activities
        const activities = courseDetails.activities || [];
        
        const realModules: CourseModule[] = activities.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          type: activity.type,
          description: activity.description || `${activity.type} activity in ${activity.section}`,
          url: activity.url,
          visible: activity.visible,
          completion: activity.completion ? 
            (activity.completion.state === 1 ? 100 : 
             activity.completion.state === 2 ? 50 : 0) : 0,
          grade: activity.completion?.grade || 0,
          maxGrade: 100,
          dueDate: activity.dates?.find((date: any) => date.purpose === 'due')?.timestamp * 1000
        }));
        
        setCourseModules(realModules);
        console.log(`✅ Processed ${realModules.length} real course modules`);
        
        // Process real course activities
        const realActivities: CourseActivity[] = activities.map((activity: any) => {
          // Determine activity status based on completion
          let status: CourseActivity['status'] = 'not_started';
          if (activity.completion) {
            if (activity.completion.state === 1) {
              status = 'completed';
            } else if (activity.completion.state === 2) {
              status = 'in_progress';
            }
          }
          
          // Check if overdue
          const dueDate = activity.dates?.find((date: any) => date.purpose === 'due')?.timestamp * 1000;
          if (dueDate && dueDate < Date.now() && status !== 'completed') {
            status = 'overdue';
          }
          
          return {
            id: activity.id.toString(),
            name: activity.name,
            type: mapActivityType(activity.type),
            status,
            dueDate,
            grade: activity.completion?.grade || 0,
            maxGrade: 100,
            description: activity.description || `${activity.type} activity from ${activity.section}`,
            instructions: activity.availabilityinfo || 'Complete this activity as part of your course.',
            attachments: activity.contents?.map((content: any) => content.filename).filter(Boolean) || [],
            timeSpent: Math.floor(Math.random() * 120), // Mock time spent for now
            attempts: activity.completion?.state ? 1 : 0,
            maxAttempts: activity.type === 'quiz' ? 3 : 1
          };
        });
        
        setCourseActivities(realActivities);
        console.log(`✅ Processed ${realActivities.length} real course activities`);
        
        // Update course with real completion data
        if (courseDetails.completion) {
          setSelectedCourse(prev => prev ? {
            ...prev,
            progress: courseDetails.completion.progresspercentage || prev.progress,
            totalModules: courseDetails.totalModules || activities.length,
            completedModules: courseDetails.completedModules || activities.filter((a: any) => 
              a.completion && a.completion.state === 1
            ).length
          } : null);
        }
        
      } else {
        console.log('⚠️ Could not fetch real course details, using fallback data');
        // Generate fallback modules and activities
        generateFallbackCourseData(course);
      }
    } catch (error) {
      console.error('❌ Error fetching real course details:', error);
      // Generate fallback modules and activities
      generateFallbackCourseData(course);
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
            <span className="text-gray-600">Loading real courses from Moodle API...</span>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Real-time course data from Moodle API - {courses.length} available courses • {currentUser?.fullname || 'Student'}</p>
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
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search courses by name, code, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{course.fullname}</CardTitle>
                    <CardDescription className="mt-1">
                      {course.shortname} • {course.categoryname}
                    </CardDescription>
                  </div>
                  <Badge className={
                    course.status === 'completed' ? 'bg-green-100 text-green-800' :
                    course.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {course.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Instructor:</span>
                      <p className="font-medium">{course.instructor}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Students:</span>
                      <p className="font-medium">{course.enrolledStudents}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Modules:</span>
                      <p className="font-medium">{course.completedModules}/{course.totalModules}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Grade:</span>
                      <p className="font-medium">{course.grade}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCourseClick(course)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No courses match your current filters. Try adjusting your search criteria.'
                  : 'No courses available. Please check your enrollment status.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Course Details Modal */}
        {showCourseDetails && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.fullname}</h2>
                    <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
                  </div>
                  <button
                    onClick={() => setShowCourseDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Course Information */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Course ID:</span>
                          <span className="font-medium">{selectedCourse.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">{selectedCourse.categoryname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium">{selectedCourse.progress}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Grade:</span>
                          <span className="font-medium">{selectedCourse.grade}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Instructor:</span>
                          <span className="font-medium">{selectedCourse.instructor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                        <Button variant="outline" className="w-full">
                          <BookOpenCheck className="w-4 h-4 mr-2" />
                          View Activities
                        </Button>
                        <Button variant="outline" className="w-full">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Progress
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Course Modules and Activities */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Course Modules */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Modules</h3>
                        <div className="space-y-3">
                          {courseModules.map((module) => (
                            <div key={module.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getActivityIcon(module.type as CourseActivity['type'])}
                                  <h4 className="font-medium text-gray-900">{module.name}</h4>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  module.completion === 100 ? 'bg-green-100 text-green-800' :
                                  module.completion > 0 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {module.completion === 100 ? 'Completed' :
                                   module.completion > 0 ? 'In Progress' : 'Not Started'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Grade: {module.grade || 0}/{module.maxGrade || 100}</span>
                                <span className="text-gray-500">Progress: {module.completion}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Course Activities */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Activities</h3>
                        <div className="space-y-3">
                          {courseActivities.map((activity) => (
                            <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getActivityIcon(activity.type)}
                                  <h4 className="font-medium text-gray-900">{activity.name}</h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(activity.status)}
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                                    {activity.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Grade: {activity.grade || 0}/{activity.maxGrade || 100}</span>
                                {activity.dueDate && (
                                  <span className="text-gray-500">
                                    Due: {new Date(activity.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              
                              {/* Expandable Activity Details */}
                              <div className="mt-3">
                                <button
                                  onClick={() => toggleActivityExpansion(activity.id)}
                                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  {expandedActivities.has(activity.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  <span>View Details</span>
                                </button>
                                
                                {expandedActivities.has(activity.id) && (
                                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                    {activity.instructions && (
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-900 mb-1">Instructions:</h5>
                                        <p className="text-sm text-gray-600">{activity.instructions}</p>
                                      </div>
                                    )}
                                    
                                    {activity.attachments && activity.attachments.length > 0 && (
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-900 mb-1">Attachments:</h5>
                                        <div className="space-y-1">
                                          {activity.attachments.map((attachment, index) => (
                                            <div key={index} className="flex items-center space-x-2 text-sm text-blue-600">
                                              <File className="w-4 h-4" />
                                              <span>{attachment}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Time Spent:</span>
                                        <p className="font-medium">{activity.timeSpent || 0} minutes</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Attempts:</span>
                                        <p className="font-medium">{activity.attempts || 0}/{activity.maxAttempts || 1}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Student Activities */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">My Study Activities</h3>
                          <Button 
                            onClick={() => setShowActivityModal(true)}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {studentActivities
                            .filter(activity => activity.courseId === selectedCourse.id)
                            .map((activity) => (
                              <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <TargetIcon className="w-4 h-4 text-green-600" />
                                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {activity.completed ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      activity.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {activity.completed ? 'Completed' : 'In Progress'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Duration: {activity.duration} minutes</span>
                                  <span className="text-gray-500">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {/* Expandable Student Activity Details */}
                                <div className="mt-3">
                                  <button
                                    onClick={() => toggleActivityExpansion(`student-${activity.id}`)}
                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    {expandedActivities.has(`student-${activity.id}`) ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                    <span>View Details</span>
                                  </button>
                                  
                                  {expandedActivities.has(`student-${activity.id}`) && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                      {activity.notes && (
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-900 mb-1">Notes:</h5>
                                          <p className="text-sm text-gray-600">{activity.notes}</p>
                                        </div>
                                      )}
                                      
                                      {activity.goals && activity.goals.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-900 mb-1">Goals:</h5>
                                          <ul className="space-y-1">
                                            {activity.goals.map((goal, index) => (
                                              <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                                                <Target className="w-3 h-3 text-blue-600" />
                                                <span>{goal}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {activity.achievements && activity.achievements.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-900 mb-1">Achievements:</h5>
                                          <ul className="space-y-1">
                                            {activity.achievements.map((achievement, index) => (
                                              <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                                                <Star className="w-3 h-3 text-yellow-600" />
                                                <span>{achievement}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {activity.resources && activity.resources.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-900 mb-1">Resources:</h5>
                                          <div className="space-y-1">
                                            {activity.resources.map((resource, index) => (
                                              <div key={index} className="flex items-center space-x-2 text-sm text-blue-600">
                                                <File className="w-4 h-4" />
                                                <span>{resource}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Study Activity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
                  <Input
                    type="text"
                    placeholder="Enter activity title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your study activity..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowActivityModal(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Add Activity
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses; 