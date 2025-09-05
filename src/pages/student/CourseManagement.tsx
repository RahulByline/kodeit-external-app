import React, { useState, useEffect } from 'react';
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
  Circle,
  AlertCircle,
  Star,
  Users,
  Bookmark,
  Eye,
  Edit,
  Plus,
  X,
  Video,
  File,
  Image,
  Link,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Share,
  BookOpenCheck,
  Timer,
  Target as TargetIcon,
  Zap,
  Lightbulb,
  Brain,
  Rocket,
  User,
  Search
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  categoryid: number;
  categoryname: string;
  courseimage?: string;
  overviewfiles?: any[];
  summaryfiles?: any[];
  startdate?: number;
  enddate?: number;
  visible: number;
  format: string;
  modules: any[];
  progress?: number;
  grade?: number;
  lastaccess?: number;
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
  courseId: number;
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

const CourseManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseActivities, setCourseActivities] = useState<CourseActivity[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<StudentActivity | null>(null);

  useEffect(() => {
    fetchStudentCourses();
  }, []);

  const fetchStudentCourses = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching student courses from IOMAD/Moodle API...');
      
      // Fetch real courses from IOMAD/Moodle
      const allCourses = await moodleService.getAllCourses();
      console.log(`✅ Found ${allCourses.length} total courses`);

      // Filter courses that are visible and available for students
      const availableCourses = allCourses.filter(course => 
        course.visible !== 0 && course.categoryid && course.categoryid > 0
      );

      // Add progress and grade data (simulated for now)
      const coursesWithProgress = availableCourses.map(course => ({
        ...course,
        progress: Math.floor(Math.random() * 100),
        grade: Math.floor(Math.random() * 100),
        lastaccess: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30) // Random access within 30 days
      }));

      setCourses(coursesWithProgress);
      console.log(`✅ Loaded ${coursesWithProgress.length} available courses for student`);

      // Generate sample activities for demonstration
      generateSampleActivities();
      generateSampleStudentActivities();

    } catch (error) {
      console.error('❌ Error fetching student courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleActivities = () => {
    const activityTypes: CourseActivity['type'][] = ['assignment', 'quiz', 'resource', 'forum', 'video', 'workshop'];
    const statuses: CourseActivity['status'][] = ['not_started', 'in_progress', 'completed', 'overdue'];
    
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
        courseId: 1,
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
        courseId: 1,
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
        courseId: 2,
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
    
    // Fetch course modules and activities
    try {
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
    } catch (error) {
      console.error('Error fetching course modules:', error);
    }
  };

  const addStudentActivity = (activity: Omit<StudentActivity, 'id' | 'timestamp'>) => {
    const newActivity: StudentActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setStudentActivities(prev => [newActivity, ...prev]);
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.shortname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'in_progress' && course.progress && course.progress > 0 && course.progress < 100) ||
                         (filterStatus === 'completed' && course.progress === 100) ||
                         (filterStatus === 'not_started' && course.progress === 0);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading courses...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600">Manage your enrolled courses and track your progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {viewMode === 'grid' ? <BarChart3 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span>{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Courses</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</h3>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">In Progress</p>
                <h3 className="text-2xl font-bold text-yellow-600 mt-1">
                  {courses.filter(c => c.progress && c.progress > 0 && c.progress < 100).length}
                </h3>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completed</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">
                  {courses.filter(c => c.progress === 100).length}
                </h3>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Average Grade</p>
                <h3 className="text-2xl font-bold text-purple-600 mt-1">
                  {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.grade || 0), 0) / courses.length) : 0}%
                </h3>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Courses Display */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCourseClick(course)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">{course.categoryname}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.progress === 100 ? 'bg-green-100 text-green-800' :
                      course.progress && course.progress > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.progress === 100 ? 'Completed' :
                       course.progress && course.progress > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.fullname}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.summary}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium text-gray-900">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Grade</span>
                    <span className="text-gray-900">{course.grade || 0}%</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Access</span>
                    <span className="text-gray-900">
                      {course.lastaccess ? new Date(course.lastaccess * 1000).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button 
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course);
                    }}
                  >
                    View Course Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Access</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCourseClick(course)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.fullname}</div>
                          <div className="text-sm text-gray-500">{course.shortname}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{course.categoryname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{course.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.grade || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.lastaccess ? new Date(course.lastaccess * 1000).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.fullname}</h2>
                    <p className="text-gray-600 mt-1">{selectedCourse.summary}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCourse(null)}
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
                          <span className="text-gray-500">Format:</span>
                          <span className="font-medium">{selectedCourse.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium">{selectedCourse.progress || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Grade:</span>
                          <span className="font-medium">{selectedCourse.grade || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Play className="w-4 h-4 inline mr-2" />
                          Continue Learning
                        </button>
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <BookOpenCheck className="w-4 h-4 inline mr-2" />
                          View Activities
                        </button>
                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          <BarChart3 className="w-4 h-4 inline mr-2" />
                          View Progress
                        </button>
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
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Course Activities</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Timeline-style activities */}
                        <div className="relative">
                          {/* Vertical timeline line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-500"></div>
                          
                          <div className="space-y-6">
                            {courseActivities.map((activity, index) => (
                              <div key={activity.id} className="relative flex items-start">
                                {/* Status indicator circle */}
                                <div className={`absolute left-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                  activity.status === 'completed' ? 'bg-green-500' : 
                                  activity.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                                }`}>
                                  {activity.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  ) : (
                                    <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                                      {index + 1}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Activity card */}
                                <div className="ml-12 flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start space-x-4">
                                    {/* Activity thumbnail */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                      {getActivityIcon(activity.type)}
                                    </div>
                                    
                                    {/* Activity content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900 mb-1">{activity.name}</h4>
                                          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {activity.status === 'completed' ? 'Easy' :
                                             activity.status === 'in_progress' ? 'Medium' : 'Easy'}
                                          </span>
                                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <User className="w-3 h-3" />
                                            <span>{activity.maxGrade || 50}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Activity details */}
                                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <div className="flex items-center space-x-4">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{activity.timeSpent || 15} min</span>
                                          </div>
                                          {activity.dueDate && (
                                            <span className="text-red-600">
                                              Due: {new Date(activity.dueDate).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-gray-500">
                                            Grade: {activity.grade || 0}/{activity.maxGrade || 100}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Action button */}
                                      <div className="flex justify-end">
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                          activity.status === 'completed' 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : activity.status === 'in_progress'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}>
                                          {activity.status === 'completed' ? 'Review' :
                                           activity.status === 'in_progress' ? 'Continue' : 'Start'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Student Activities */}
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">My Study Activities</h3>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setShowActivityModal(true)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Plus className="w-4 h-4 inline mr-2" />
                              Add Activity
                            </button>
                          </div>
                        </div>
                        
                        {/* Timeline-style student activities */}
                        <div className="relative">
                          {/* Vertical timeline line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-500"></div>
                          
                          <div className="space-y-6">
                            {studentActivities
                              .filter(activity => activity.courseId === selectedCourse.id)
                              .map((activity, index) => (
                                <div key={activity.id} className="relative flex items-start">
                                  {/* Status indicator circle */}
                                  <div className={`absolute left-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                    activity.completed ? 'bg-green-500' : 'bg-gray-400'
                                  }`}>
                                    {activity.completed ? (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                      <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                                        {index + 1}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Activity card */}
                                  <div className="ml-12 flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-4">
                                      {/* Activity thumbnail */}
                                      <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <TargetIcon className="w-8 h-8 text-green-600" />
                                      </div>
                                      
                                      {/* Activity content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                                            <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                                          </div>
                                          <div className="flex items-center space-x-2 ml-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                              activity.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {activity.completed ? 'Completed' : 'In Progress'}
                                            </span>
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                              <Clock className="w-3 h-3" />
                                              <span>{activity.duration}</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Activity details */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                          <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1">
                                              <Clock className="w-4 h-4" />
                                              <span>{activity.duration} minutes</span>
                                            </div>
                                            <span className="text-gray-500">
                                              {new Date(activity.timestamp).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {/* Action button */}
                                        <div className="flex justify-end">
                                          <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            activity.completed 
                                              ? 'bg-green-600 text-white hover:bg-green-700' 
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}>
                                            {activity.completed ? 'Review' : 'Continue'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
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
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="study">Study</option>
                    <option value="practice">Practice</option>
                    <option value="review">Review</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseManagement;
