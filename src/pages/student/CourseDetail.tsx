import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Calendar,
  Play,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  FileText,
  Video,
  Download,
  ExternalLink,
  Star,
  BarChart3,
  Target,
  TrendingUp,
  Bookmark,
  Share2,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: string;
  fullname: string;
  shortname: string;
  summary?: string;
  categoryid: number;
  courseimage?: string;
  progress: number;
  categoryname: string;
  format: string;
  startdate: number;
  enddate?: number;
  visible: number;
  type: string;
  tags: string[];
  lastaccess?: number;
  completionStatus?: string;
  enrollmentCount?: number;
  averageGrade?: number;
  timeSpent?: number;
  certificates?: number;
  completedLessons?: number;
  totalLessons?: number;
}

interface Lesson {
  id: string;
  name: string;
  description: string;
  duration: number;
  status: 'completed' | 'in_progress' | 'not_started';
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'discussion';
  prerequisites?: string[];
  resources?: Array<{
    name: string;
    type: 'pdf' | 'video' | 'link' | 'file';
    url: string;
  }>;
}

interface Activity {
  id: string;
  name: string;
  type: 'assignment' | 'quiz' | 'forum' | 'resource' | 'workshop';
  status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
  dueDate?: number;
  grade?: number;
  maxGrade?: number;
  description?: string;
  submissionStatus?: string;
}

interface CourseStats {
  totalLessons: number;
  completedLessons: number;
  totalActivities: number;
  completedActivities: number;
  averageGrade: number;
  timeSpent: number;
  certificates: number;
  enrollmentCount: number;
}

interface CourseDetailProps {
  courseId?: string;
  onBack?: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId: propCourseId, onBack }) => {
  const { courseId: urlCourseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Use prop courseId if provided, otherwise use URL parameter
  const courseId = propCourseId || urlCourseId;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Fetch course details
  const fetchCourseDetails = useCallback(async () => {
    if (!courseId || !currentUser?.id) return;

    try {
      setLoading(true);
      setError('');

      console.log('🔄 Fetching course details for:', courseId);

      // Fetch course information
      const userCourses = await moodleService.getUserCourses(currentUser.id);
      const courseData = userCourses.find(c => c.id === courseId);
      
      if (!courseData) {
        setError('Course not found or you are not enrolled');
        setLoading(false);
        return;
      }

      setCourse(courseData);

      // Fetch course activities
      const courseActivities = await moodleService.getCourseActivities(courseId);
      
      // Process activities
      const processedActivities: Activity[] = courseActivities.map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        type: activity.modname as Activity['type'],
        status: activity.completionstate === 1 ? 'completed' : 
                activity.completionstate === 2 ? 'in_progress' : 'not_started',
        dueDate: activity.duedate ? activity.duedate * 1000 : undefined,
        grade: activity.grade,
        maxGrade: activity.grademax || 100,
        description: activity.description,
        submissionStatus: activity.submissionstatus
      }));

      setActivities(processedActivities);

      // Generate mock lessons based on course structure
      const mockLessons: Lesson[] = generateMockLessons(courseData);
      setLessons(mockLessons);

      // Calculate stats
      const courseStats: CourseStats = {
        totalLessons: mockLessons.length,
        completedLessons: mockLessons.filter(l => l.status === 'completed').length,
        totalActivities: processedActivities.length,
        completedActivities: processedActivities.filter(a => a.status === 'completed').length,
        averageGrade: courseData.averageGrade || 85,
        timeSpent: courseData.timeSpent || 0,
        certificates: courseData.certificates || 0,
        enrollmentCount: courseData.enrollmentCount || 0
      };

      setStats(courseStats);

      console.log('✅ Course details loaded successfully');

    } catch (error) {
      console.error('❌ Error fetching course details:', error);
      setError('Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [courseId, currentUser?.id]);

  // Generate mock lessons based on course structure
  const generateMockLessons = (courseData: Course): Lesson[] => {
    const lessonTypes: Lesson['type'][] = ['video', 'reading', 'quiz', 'assignment', 'discussion'];
    const lessonNames = [
      'Introduction to Course',
      'Basic Concepts',
      'Core Principles',
      'Practical Applications',
      'Advanced Topics',
      'Project Work',
      'Assessment Preparation',
      'Final Review'
    ];

    return lessonNames.map((name, index) => ({
      id: `lesson-${index + 1}`,
      name,
      description: `This lesson covers ${name.toLowerCase()} in ${courseData.fullname}`,
      duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
      status: index < Math.floor(courseData.progress / 12.5) ? 'completed' : 
              index === Math.floor(courseData.progress / 12.5) ? 'in_progress' : 'not_started',
      type: lessonTypes[index % lessonTypes.length],
      prerequisites: index > 0 ? [`lesson-${index}`] : undefined,
      resources: [
        {
          name: 'Lesson Materials',
          type: 'pdf' as const,
          url: '#'
        },
        {
          name: 'Video Lecture',
          type: 'video' as const,
          url: '#'
        }
      ]
    }));
  };

  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsLessonModalOpen(true);
  };

  // Close lesson modal
  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setSelectedLesson(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'quiz': return <BarChart3 className="w-4 h-4" />;
      case 'forum': return <Users className="w-4 h-4" />;
      case 'resource': return <BookOpen className="w-4 h-4" />;
      case 'workshop': return <Target className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get lesson icon
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'quiz': return <BarChart3 className="w-4 h-4" />;
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'discussion': return <Users className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Course Overview Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
              <p className="text-gray-600 mb-4">{error || 'The requested course could not be found.'}</p>
              <Button onClick={() => navigate('/dashboard/student')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Courses</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{course.fullname}</h1>
                <p className="text-sm text-gray-500">{course.shortname}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Course Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-white text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-2" />
                    <h3 className="text-xl font-semibold">{course.fullname}</h3>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">
                      {course.summary || 'This course provides comprehensive learning materials and practical exercises to help you master the subject matter.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.startdate ? formatDate(course.startdate * 1000) : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {stats?.enrollmentCount || 0} students enrolled
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="lessons">Lessons</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Progress</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Award className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Grade</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {course.averageGrade || 85}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats?.totalLessons || 0}</div>
                        <div className="text-sm text-gray-600">Total Lessons</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats?.completedLessons || 0}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats?.totalActivities || 0}</div>
                        <div className="text-sm text-gray-600">Activities</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lessons" className="space-y-4">
                    <div className="space-y-3">
                      {lessons.map((lesson) => (
                        <Card 
                          key={lesson.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleLessonClick(lesson)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  {getLessonIcon(lesson.type)}
                                </div>
                                <div>
                                  <h4 className="font-medium">{lesson.name}</h4>
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatDuration(lesson.duration)}
                                    </span>
                                    <Badge className={getStatusColor(lesson.status)}>
                                      {lesson.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Play className="w-4 h-4 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activities" className="space-y-4">
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <Card key={activity.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  {getActivityIcon(activity.type)}
                                </div>
                                <div>
                                  <h4 className="font-medium">{activity.name}</h4>
                                  <p className="text-sm text-gray-600">{activity.description}</p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {activity.dueDate && (
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Due: {formatDate(activity.dueDate)}
                                      </span>
                                    )}
                                    {activity.grade && (
                                      <span className="text-xs text-gray-500">
                                        Grade: {activity.grade}/{activity.maxGrade}
                                      </span>
                                    )}
                                    <Badge className={getStatusColor(activity.status)}>
                                      {activity.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stats?.completedLessons || 0}</div>
                    <div className="text-xs text-gray-600">Lessons Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats?.completedActivities || 0}</div>
                    <div className="text-xs text-gray-600">Activities Done</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Materials
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Certificate
                </Button>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm font-medium">{course.categoryname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Format</span>
                  <span className="text-sm font-medium">{course.format}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-medium">{course.type}</span>
                </div>
                {course.tags && course.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lesson Detail Modal */}
      {isLessonModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedLesson.name}</h2>
                <Button variant="ghost" size="sm" onClick={closeLessonModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{selectedLesson.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Duration: {formatDuration(selectedLesson.duration)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getLessonIcon(selectedLesson.type)}
                    <span className="text-sm text-gray-600 capitalize">
                      {selectedLesson.type}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Resources</h3>
                  <div className="space-y-2">
                    {selectedLesson.resources?.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        {resource.type === 'pdf' && <FileText className="w-4 h-4 text-red-500" />}
                        {resource.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                        <span className="text-sm">{resource.name}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Lesson
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Bookmark
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
