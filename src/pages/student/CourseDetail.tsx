import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FileText,
  Video,
  Download,
  ExternalLink,
  Star,
  BarChart3,
  Target,
  Bookmark,
  Share2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: string;
  fullname: string;
  shortname: string;
  summary?: string;
  description?: string;
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

interface CourseDetailProps {
  courseId?: string;
  onBack?: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId: propCourseId, onBack }) => {
  const { courseId: urlCourseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const courseId = propCourseId || urlCourseId;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId || !currentUser?.id) return;

      try {
        setLoading(true);
        setError('');

        console.log('🔄 Fetching course details for:', courseId);

        const userCourses = await moodleService.getUserCourses(currentUser.id);
        const courseData = userCourses.find(c => c.id === courseId);
        
        if (!courseData) {
          setError('Course not found or you are not enrolled');
          setLoading(false);
          return;
        }

        setCourse(courseData);
        console.log('✅ Course details loaded successfully');

      } catch (error) {
        console.error('❌ Error fetching course details:', error);
        setError('Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, currentUser?.id]);

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 text-blue-600">⏳</div>
            <span className="text-gray-600">Loading course details...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error Loading Course</span>
            </div>
            <p className="text-red-700 mb-3">{error || 'Course not found'}</p>
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Courses</span>
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">{course.fullname}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Progress: {course.progress || 0}%
            </div>
            <div className="w-32">
              <Progress value={course.progress || 0} className="h-2" />
            </div>
          </div>
        </div>

        {/* Course Banner */}
        <div className="relative h-80 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40"></div>
          
          <div className="absolute top-6 left-6">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Courses</span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                  Beginner
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-3">{course.fullname}</h1>
                
                <p className="text-white/90 text-lg max-w-2xl">
                  {course.summary || course.description || 'Learn fundamental computer skills and digital citizenship'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Statistics Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 -mt-8 relative z-10 mx-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lessons</p>
                <p className="text-lg font-semibold text-gray-900">8</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900">4 weeks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-semibold text-gray-900">{course.progress || 0}%</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-500">{course.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${course.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Course Content */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-lg border">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'instructors', label: 'Instructors' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="prose prose-sm max-w-none">
                    <h3>Course Overview</h3>
                    <p>{course.summary || course.description || 'This course provides comprehensive learning materials and activities.'}</p>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4>Course Statistics:</h4>
                      <ul className="list-none space-y-2">
                        <li>• Total Lessons: 8</li>
                        <li>• Total Activities: 24</li>
                        <li>• Progress: {course.progress || 0}%</li>
                        {course.startdate && (
                          <li>• Start Date: {new Date(course.startdate * 1000).toLocaleDateString()}</li>
                        )}
                        {course.enddate && (
                          <li>• End Date: {new Date(course.enddate * 1000).toLocaleDateString()}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Course Curriculum</h3>
                    <p className="text-gray-600">Course curriculum will be displayed here.</p>
                  </div>
                )}

                {activeTab === 'instructors' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Course Instructor</h3>
                        <p className="text-gray-600">Instructor Name</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-600">4.8 rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">
                      {course.startdate ? new Date(course.startdate * 1000).toLocaleDateString() : 'Flexible'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">8 Lessons</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-medium">{course.categoryname || 'General'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Activities</p>
                    <p className="font-medium">24+</p>
                  </div>
                </div>
                
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  {course.progress === 100 ? 'View Certificate' : 'Continue Course'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
