import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Minus,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  Clock3,
  User,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  FileText,
  CreditCard,
  DollarSign,
  Percent,
  CalendarDays,
  MapPin,
  Video,
  Headphones,
  FileImage
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
    rating: number;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  price: number;
  originalPrice?: number;
  image: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'enrolled' | 'completed' | 'dropped' | 'pending';
  certificate?: string;
  lastAccessed: string;
  nextLesson?: string;
  assignments: number;
  completedAssignments: number;
  quizzes: number;
  completedQuizzes: number;
}

interface EnrollmentStats {
  totalEnrolled: number;
  completedCourses: number;
  inProgress: number;
  averageGrade: number;
  totalHours: number;
  certificates: number;
}

const Enrollments: React.FC = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<EnrollmentStats>({
    totalEnrolled: 0,
    completedCourses: 0,
    inProgress: 0,
    averageGrade: 0,
    totalHours: 0,
    certificates: 0
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Mock data for enrolled courses
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Advanced JavaScript Programming',
      description: 'Master advanced JavaScript concepts including ES6+, async programming, and modern frameworks.',
      instructor: {
        name: 'Dr. Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        rating: 4.8
      },
      category: 'Programming',
      level: 'Advanced',
      duration: '12 weeks',
      lessons: 48,
      students: 156,
      rating: 4.7,
      price: 299,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop',
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      progress: 75,
      status: 'enrolled',
      lastAccessed: '2 hours ago',
      nextLesson: 'Async/Await Patterns',
      assignments: 12,
      completedAssignments: 9,
      quizzes: 6,
      completedQuizzes: 4
    },
    {
      id: '2',
      title: 'Data Science Fundamentals',
      description: 'Learn the fundamentals of data science including statistics, machine learning, and data visualization.',
      instructor: {
        name: 'Prof. Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        rating: 4.9
      },
      category: 'Data Science',
      level: 'Intermediate',
      duration: '16 weeks',
      lessons: 64,
      students: 234,
      rating: 4.8,
      price: 399,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      startDate: '2024-02-01',
      endDate: '2024-05-30',
      progress: 45,
      status: 'enrolled',
      lastAccessed: '1 day ago',
      nextLesson: 'Machine Learning Basics',
      assignments: 15,
      completedAssignments: 7,
      quizzes: 8,
      completedQuizzes: 4
    },
    {
      id: '3',
      title: 'Web Development Bootcamp',
      description: 'Complete web development course covering HTML, CSS, JavaScript, and modern frameworks.',
      instructor: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        rating: 4.7
      },
      category: 'Web Development',
      level: 'Beginner',
      duration: '20 weeks',
      lessons: 80,
      students: 567,
      rating: 4.6,
      price: 599,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
      startDate: '2023-09-01',
      endDate: '2024-01-15',
      progress: 100,
      status: 'completed',
      certificate: 'https://example.com/certificate.pdf',
      lastAccessed: '1 week ago',
      assignments: 20,
      completedAssignments: 20,
      quizzes: 10,
      completedQuizzes: 10
    },
    {
      id: '4',
      title: 'Python for Data Analysis',
      description: 'Learn Python programming specifically for data analysis and manipulation.',
      instructor: {
        name: 'Alex Thompson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        rating: 4.6
      },
      category: 'Programming',
      level: 'Intermediate',
      duration: '10 weeks',
      lessons: 40,
      students: 189,
      rating: 4.5,
      price: 249,
      originalPrice: 299,
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=200&fit=crop',
      startDate: '2024-03-01',
      endDate: '2024-05-15',
      progress: 20,
      status: 'enrolled',
      lastAccessed: '3 days ago',
      nextLesson: 'Pandas DataFrames',
      assignments: 8,
      completedAssignments: 2,
      quizzes: 4,
      completedQuizzes: 1
    },
    {
      id: '5',
      title: 'Mobile App Development',
      description: 'Build mobile applications using React Native and modern development practices.',
      instructor: {
        name: 'Lisa Wang',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
        rating: 4.8
      },
      category: 'Mobile Development',
      level: 'Advanced',
      duration: '14 weeks',
      lessons: 56,
      students: 98,
      rating: 4.7,
      price: 449,
      originalPrice: 549,
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop',
      startDate: '2023-11-01',
      endDate: '2024-02-15',
      progress: 100,
      status: 'completed',
      certificate: 'https://example.com/certificate2.pdf',
      lastAccessed: '2 weeks ago',
      assignments: 14,
      completedAssignments: 14,
      quizzes: 7,
      completedQuizzes: 7
    },
    {
      id: '6',
      title: 'Cybersecurity Fundamentals',
      description: 'Learn the basics of cybersecurity, ethical hacking, and network security.',
      instructor: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
        rating: 4.9
      },
      category: 'Cybersecurity',
      level: 'Beginner',
      duration: '8 weeks',
      lessons: 32,
      students: 145,
      rating: 4.8,
      price: 199,
      originalPrice: 249,
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&h=200&fit=crop',
      startDate: '2024-04-01',
      endDate: '2024-05-30',
      progress: 0,
      status: 'pending',
      lastAccessed: 'Never',
      assignments: 6,
      completedAssignments: 0,
      quizzes: 3,
      completedQuizzes: 0
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCourses(mockCourses);
      setStats({
        totalEnrolled: 6,
        completedCourses: 2,
        inProgress: 3,
        averageGrade: 87,
        totalHours: 480,
        certificates: 2
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleDropCourse = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, status: 'dropped' as const }
        : course
    ));
  };

  const handleResumeCourse = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, status: 'enrolled' as const }
        : course
    ));
  };

  const filteredCourses = courses.filter(course => {
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enrolled': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'dropped': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock3 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">My Enrollments</h1>
            <p className="text-gray-600 mt-1">Manage your course enrollments and track your learning progress</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Enroll in Course
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalEnrolled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-lg font-semibold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-lg font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Grade</p>
                <p className="text-lg font-semibold text-gray-900">{stats.averageGrade}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock3 className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Award className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-lg font-semibold text-gray-900">{stats.certificates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, instructors, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                            {getStatusIcon(course.status)}
                            <span className="ml-1 capitalize">{course.status}</span>
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{course.instructor.name}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{course.instructor.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{course.category}</span>
                          <span>•</span>
                          <span className="capitalize">{course.level}</span>
                          <span>•</span>
                          <span>{course.duration}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Last accessed: {course.lastAccessed}</span>
                          {course.nextLesson && (
                            <>
                              <span>•</span>
                              <span>Next: {course.nextLesson}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                          {expandedCourse === course.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            course.progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedCourse === course.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Course Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span>{new Date(course.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>End Date:</span>
                          <span>{new Date(course.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Lessons:</span>
                          <span>{course.lessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Enrolled Students:</span>
                          <span>{course.students}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Course Rating:</span>
                          <span className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                            {course.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Assignments & Quizzes</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Assignments:</span>
                          <span>{course.completedAssignments}/{course.assignments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quizzes:</span>
                          <span>{course.completedQuizzes}/{course.quizzes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completion Rate:</span>
                          <span>{Math.round(((course.completedAssignments + course.completedQuizzes) / (course.assignments + course.quizzes)) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                      <div className="space-y-2">
                        {course.status === 'enrolled' && (
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Continue Learning
                          </button>
                        )}
                        {course.status === 'completed' && course.certificate && (
                          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Download Certificate
                          </button>
                        )}
                        {course.status === 'dropped' && (
                          <button 
                            onClick={() => handleResumeCourse(course.id)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Resume Course
                          </button>
                        )}
                        {course.status === 'enrolled' && (
                          <button 
                            onClick={() => handleDropCourse(course.id)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Drop Course
                          </button>
                        )}
                        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Enrollments;
