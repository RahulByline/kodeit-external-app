import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  Clock,
  Play,
  CheckCircle,
  Star,
  Trophy,
  Users,
  Activity,
  ArrowRight,
  MessageSquare,
  Plus,
  Filter,
  Search,
  MapPin,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import EnhancedDashboardLayout from '../../components/EnhancedDashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import EnhancedDashboardNavigation from '../../components/EnhancedDashboardNavigation';
import { Switch } from '../../components/ui/switch';

interface Course {
  id: string;
  name: string;
  description: string;
  progress: number;
  instructor: string;
  image: string;
  category: string;
  duration: string;
  lessons: number;
  status: 'active' | 'completed' | 'upcoming';
}

interface Lesson {
  id: string;
  title: string;
  course: string;
  type: 'video' | 'quiz' | 'assignment' | 'project';
  duration: string;
  status: 'completed' | 'in_progress' | 'not_started';
  dueDate?: string;
  grade?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
  category: string;
  dateEarned?: string;
}

interface Schedule {
  id: string;
  title: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting';
  date: string;
  time: string;
  duration: string;
  course: string;
  instructor: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const EnhancedStudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnhancedMode, setIsEnhancedMode] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from your existing services
      const [allCourses, courseEnrollments] = await Promise.all([
        moodleService.getAllCourses(),
        moodleService.getCourseEnrollments()
      ]);

      // Transform data to match demo structure
      const transformedCourses: Course[] = (allCourses || []).slice(0, 6).map((course: any, index: number) => ({
        id: course.id?.toString() || index.toString(),
        name: course.fullname || `Course ${index + 1}`,
        description: course.summary || 'Learn essential skills and concepts',
        progress: Math.floor(Math.random() * 100),
        instructor: 'Dr. Sarah Johnson',
        image: course.courseimage || '/placeholder-course.jpg',
        category: course.categoryname || 'Programming',
        duration: '8 weeks',
        lessons: Math.floor(Math.random() * 20) + 10,
        status: ['active', 'completed', 'upcoming'][Math.floor(Math.random() * 3)] as 'active' | 'completed' | 'upcoming'
      }));

      const mockLessons: Lesson[] = [
        {
          id: '1',
          title: 'Introduction to Programming Concepts',
          course: 'Computer Science Fundamentals',
          type: 'video',
          duration: '45 min',
          status: 'completed',
          grade: 95
        },
        {
          id: '2',
          title: 'Variables and Data Types Quiz',
          course: 'Computer Science Fundamentals',
          type: 'quiz',
          duration: '30 min',
          status: 'in_progress',
          dueDate: '2024-01-15'
        },
        {
          id: '3',
          title: 'Building Your First Program',
          course: 'Computer Science Fundamentals',
          type: 'project',
          duration: '2 hours',
          status: 'not_started',
          dueDate: '2024-01-20'
        },
        {
          id: '4',
          title: 'Mathematics: Algebra Basics',
          course: 'Advanced Mathematics',
          type: 'video',
          duration: '60 min',
          status: 'completed',
          grade: 88
        },
        {
          id: '5',
          title: 'Science Lab: Chemical Reactions',
          course: 'Chemistry Fundamentals',
          type: 'assignment',
          duration: '90 min',
          status: 'in_progress',
          dueDate: '2024-01-18'
        }
      ];

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          earned: true,
          progress: 1,
          maxProgress: 1,
          category: 'Learning',
          dateEarned: '2024-01-10'
        },
        {
          id: '2',
          title: 'Perfect Score',
          description: 'Get 100% on any quiz',
          icon: '⭐',
          earned: true,
          progress: 1,
          maxProgress: 1,
          category: 'Academic',
          dateEarned: '2024-01-12'
        },
        {
          id: '3',
          title: 'Course Master',
          description: 'Complete 5 courses',
          icon: '🏆',
          earned: false,
          progress: 3,
          maxProgress: 5,
          category: 'Milestone'
        },
        {
          id: '4',
          title: 'Consistent Learner',
          description: 'Study for 7 consecutive days',
          icon: '🔥',
          earned: false,
          progress: 4,
          maxProgress: 7,
          category: 'Habit'
        },
        {
          id: '5',
          title: 'Helpful Student',
          description: 'Help 10 other students',
          icon: '🤝',
          earned: false,
          progress: 2,
          maxProgress: 10,
          category: 'Community'
        }
      ];

      const mockSchedule: Schedule[] = [
        {
          id: '1',
          title: 'Computer Science Class',
          type: 'class',
          date: '2024-01-15',
          time: '09:00 AM',
          duration: '60 min',
          course: 'Computer Science Fundamentals',
          instructor: 'Dr. Sarah Johnson',
          location: 'Room 201',
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Mathematics Quiz',
          type: 'exam',
          date: '2024-01-16',
          time: '02:00 PM',
          duration: '45 min',
          course: 'Advanced Mathematics',
          instructor: 'Prof. Michael Chen',
          location: 'Room 105',
          status: 'upcoming'
        },
        {
          id: '3',
          title: 'Science Lab Session',
          type: 'class',
          date: '2024-01-17',
          time: '10:30 AM',
          duration: '90 min',
          course: 'Chemistry Fundamentals',
          instructor: 'Dr. Emily Rodriguez',
          location: 'Lab 3',
          status: 'upcoming'
        },
        {
          id: '4',
          title: 'Project Submission',
          type: 'assignment',
          date: '2024-01-18',
          time: '11:59 PM',
          duration: 'N/A',
          course: 'Computer Science Fundamentals',
          instructor: 'Dr. Sarah Johnson',
          location: 'Online',
          status: 'upcoming'
        }
      ];

      setCourses(transformedCourses);
      setLessons(mockLessons);
      setAchievements(mockAchievements);
      setSchedule(mockSchedule);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'upcoming': return 'bg-purple-100 text-purple-800';
      case 'ongoing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'project': return <BarChart3 className="w-4 h-4" />;
      case 'class': return <Users className="w-4 h-4" />;
      case 'exam': return <Target className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {currentUser?.fullname || 'Student'}! 👋
            </h1>
            <p className="text-blue-100">
              Ready to continue your learning journey? You have {lessons.filter(l => l.status === 'in_progress').length} active lessons.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{new Date().getDate()}</div>
            <div className="text-blue-100">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{lessons.filter(l => l.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold">24.5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Current Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.instructor}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={course.progress} className="w-20" />
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Upcoming Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedule.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                  <div className="p-1 bg-blue-100 rounded">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time} • {item.course}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <p className="font-medium text-sm">{achievement.title}</p>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Courses</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Enroll in Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute top-4 right-4">
                <Badge className={getStatusColor(course.status)}>
                  {course.status}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-90">{course.category}</p>
                <p className="text-xs opacity-75">{course.duration}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{course.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{course.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{course.instructor}</span>
                </div>
                <span className="text-sm text-gray-500">{course.lessons} lessons</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="w-full" />
              </div>

              <Button className="w-full mt-4" variant="outline">
                Continue Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLessons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Current Lessons & Activities</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(lesson.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <p className="text-sm text-gray-600">{lesson.course}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {lesson.duration}
                      </span>
                      {lesson.grade && (
                        <span className="text-xs text-green-600 font-medium">
                          Grade: {lesson.grade}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(lesson.status)}>
                    {lesson.status.replace('_', ' ')}
                  </Badge>
                  {lesson.dueDate && (
                    <span className="text-xs text-gray-500">
                      Due: {lesson.dueDate}
                    </span>
                  )}
                  <Button size="sm" variant="outline">
                    {lesson.status === 'completed' ? 'Review' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <div className="text-sm text-gray-600">
          {achievements.filter(a => a.earned).length} of {achievements.length} earned
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={`overflow-hidden ${achievement.earned ? 'ring-2 ring-yellow-400' : ''}`}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">{achievement.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
              
              {achievement.earned ? (
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Earned
                  </Badge>
                  {achievement.dateEarned && (
                    <p className="text-xs text-gray-500">
                      Earned on {achievement.dateEarned}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                  <Badge variant="outline" className="text-gray-500">
                    In Progress
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.course}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {item.time} • {item.duration}
                        </span>
                        <span className="text-xs text-gray-500">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {item.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{schedule.length}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {schedule.filter(s => s.status === 'upcoming').length}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {schedule.filter(s => s.type === 'class').length}
                  </div>
                  <div className="text-sm text-gray-600">Classes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <EnhancedDashboardLayout userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EnhancedDashboardLayout>
    );
  }

  // Toggle between regular and enhanced dashboard
  const handleToggleDashboard = () => {
    setIsEnhancedMode(!isEnhancedMode);
  };

  // If not in enhanced mode, show a simple message with toggle
  if (!isEnhancedMode) {
    return (
      <EnhancedDashboardLayout userName={currentUser?.fullname || "Student"}>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Regular Dashboard</h1>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Enhanced Mode</span>
                  <Switch
                    checked={isEnhancedMode}
                    onCheckedChange={handleToggleDashboard}
                  />
                </div>
              </div>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Regular Dashboard View</h2>
                <p className="text-gray-500 mb-6">This is the standard dashboard view. Toggle the switch above to see the enhanced dashboard.</p>
                <Button onClick={handleToggleDashboard} className="bg-blue-600 hover:bg-blue-700">
                  <ToggleRight className="w-4 h-4 mr-2" />
                  Switch to Enhanced Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </EnhancedDashboardLayout>
    );
  }

  return (
    <EnhancedDashboardLayout userName={currentUser?.fullname || "Student"}>
      <div className="min-h-screen bg-gray-50">
        {/* Toggle Button */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Dashboard Mode:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Regular</span>
                  <Switch
                    checked={isEnhancedMode}
                    onCheckedChange={handleToggleDashboard}
                  />
                  <span className="text-sm text-blue-600 font-medium">Enhanced</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Enhanced dashboard with modern UI and features
              </div>
            </div>
          </div>
        </div>

        <EnhancedDashboardNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'lessons' && renderLessons()}
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'schedule' && renderSchedule()}
        </div>
      </div>
    </EnhancedDashboardLayout>
  );
};

export default EnhancedStudentDashboard;
