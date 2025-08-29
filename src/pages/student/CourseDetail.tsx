import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Play,
  BookOpen,
  Clock,
  Calendar,
  Users,
  Award,
  Star,
  Globe,
  Zap,
  FileText,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Target,
  BarChart3,
  MessageSquare,
  Video,
  Edit,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Info,
  GraduationCap,
  User,
  Timer,
  Bookmark,
  Share2,
  X,
  Monitor,
  Smartphone,
  Laptop,
  FolderOpen,
  List,
  Grid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { moodleService } from '@/services/moodleApi';
import { useAuth } from '@/context/AuthContext';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
}

interface CourseActivity {
  id: string;
  name: string;
  type: 'video' | 'reading' | 'quiz' | 'interactive' | 'assignment';
  status: 'completed' | 'in_progress' | 'not_started';
  duration?: string;
  description?: string;
  dueDate?: number;
  grade?: number;
  maxGrade?: number;
  attempts?: number;
  maxAttempts?: number;
  sectionName?: string;
  details?: any; // Added for detailed activity view
  content?: any[]; // Added for detailed activity view
  htmlContent?: string; // Added for detailed activity view
}

interface CourseSection {
  id: string;
  name: string;
  activities: CourseActivity[];
  completedActivities: number;
  totalActivities: number;
  isExpanded: boolean;
}

interface PopularCourse {
  id: string;
  name: string;
  icon: string;
  rating: number;
  price: string;
  category: string;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const { currentUser } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [courseContents, setCourseContents] = useState<any[]>([]);
  const [courseActivities, setCourseActivities] = useState<any[]>([]);
  const [courseCompletion, setCourseCompletion] = useState<any>(null);
  const [courseGrades, setCourseGrades] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('curriculum');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['1'])); // Default expand first section
  const [selectedActivity, setSelectedActivity] = useState<CourseActivity | null>(null);
  const [activityDetails, setActivityDetails] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  
  // Course sections and activities
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
  
  // New state for lesson/activity navigation
  const [selectedLesson, setSelectedLesson] = useState<CourseSection | null>(null);
  const [viewMode, setViewMode] = useState<'lessons' | 'activities'>('lessons');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching detailed course data for course ID:', courseId);
      
      // Fetch all course data in parallel
      const [
        courseDetails,
        contents,
        activities,
        completion,
        grades,
        userCourses
      ] = await Promise.all([
        moodleService.getCourseDetails(courseId),
        moodleService.getCourseContents(courseId),
        moodleService.getCourseActivities(courseId),
        moodleService.getCourseCompletion(courseId),
        moodleService.getCourseGrades(courseId),
        moodleService.getUserCourses(currentUser?.id || '1')
      ]);
      
      console.log('✅ Course data fetched:', {
        details: courseDetails ? 'Yes' : 'No',
        contents: contents?.length || 0,
        activities: activities?.length || 0,
        completion: completion ? 'Yes' : 'No',
        grades: grades ? 'Yes' : 'No',
        userCourses: userCourses?.length || 0
      });
      
      setCourse(courseDetails);
      setCourseContents(contents || []);
      setCourseActivities(activities || []);
      setCourseCompletion(completion);
      setCourseGrades(grades);
      
      // Process course sections and activities
      if (contents && contents.length > 0) {
        const processedSections: CourseSection[] = contents.map((section: any, index: number) => {
          const sectionActivities: CourseActivity[] = (section.modules || []).map((module: any) => {
            // Determine activity type based on modname
            let activityType: CourseActivity['type'] = 'reading';
            switch (module.modname) {
              case 'assign': activityType = 'assignment'; break;
              case 'quiz': activityType = 'quiz'; break;
              case 'url': 
              case 'resource': 
              case 'page': activityType = 'reading'; break;
              case 'lesson': 
              case 'scorm': 
              case 'h5pactivity': activityType = 'interactive'; break;
              default: activityType = 'reading';
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
            
            return {
              id: module.id.toString(),
              name: module.name || 'Unnamed Activity',
              type: activityType,
              status: status,
              duration: module.duration || '5-10 min',
              description: module.description || module.intro || 'Course activity',
              dueDate: module.dates?.find((date: any) => date.label === 'Due date')?.timestamp,
              grade: module.completion?.value || 0,
              maxGrade: 100,
              attempts: module.completion?.attempts || 0,
              maxAttempts: 3,
              sectionName: section.name
            };
          });
          
          const completedActivities = sectionActivities.filter(activity => activity.status === 'completed').length;
          
          return {
            id: section.id.toString(),
            name: section.name || `Lesson ${index + 1}`,
            activities: sectionActivities,
            completedActivities,
            totalActivities: sectionActivities.length,
            isExpanded: index === 0 // Expand first section by default
          };
        });
        
        setCourseSections(processedSections);
        console.log(`✅ Processed ${processedSections.length} course sections with activities`);
      }
      
      // Generate popular courses from user courses
      if (userCourses && userCourses.length > 0) {
                 const popularCoursesData: PopularCourse[] = userCourses
           .filter((userCourse: any) => userCourse.id !== courseId)
           .slice(0, 2)
           .map((userCourse: any) => ({
             id: userCourse.id,
             name: userCourse.fullname,
             icon: getCourseIcon(userCourse.shortname),
             rating: 4.8, // Fixed rating instead of random
             price: `(${userCourse.progress || 0}% Complete)`,
             category: userCourse.categoryname || 'General'
           }));
        
        setPopularCourses(popularCoursesData);
      }
      
    } catch (error) {
      console.error('❌ Error fetching course details:', error);
      setError('Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCourseIcon = (shortname: string): string => {
    // Use real course data to determine icon
    const courseName = shortname.toLowerCase();
    
    if (courseName.includes('english') || courseName.includes('language')) {
      return 'Lang';
    } else if (courseName.includes('digital') || courseName.includes('foundation')) {
      return 'Tech';
    } else if (courseName.includes('discipline') || courseName.includes('positive')) {
      return 'Edu';
    } else if (courseName.includes('math') || courseName.includes('science')) {
      return 'Math';
    } else if (courseName.includes('art') || courseName.includes('creative')) {
      return 'Art';
    } else if (courseName.includes('business') || courseName.includes('management')) {
      return 'Bus';
    } else {
      return 'Course';
    }
  };

  const getActivityIcon = (type: CourseActivity['type'], className: string = "w-4 h-4") => {
    switch (type) {
      case 'video': return <Play className={className} />;
      case 'reading': return <FileText className={className} />;
      case 'quiz': return <BarChart3 className={className} />;
      case 'interactive': return <Target className={className} />;
      case 'assignment': return <Edit className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const getStatusIcon = (status: CourseActivity['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Circle className="w-4 h-4 text-yellow-600" />;
      case 'not_started': return <Circle className="w-4 h-4 text-gray-400" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CourseActivity['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      case 'not_started': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleLessonClick = (lesson: CourseSection) => {
    setSelectedLesson(lesson);
    setViewMode('activities');
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setViewMode('lessons');
  };

  const handleActivityClick = async (activity: CourseActivity) => {
    console.log('🎯 Activity clicked:', activity.name);
    setSelectedActivity(activity);
    setLoadingActivity(true);
    
    try {
      // Fetch detailed activity information
      const activityDetails = await moodleService.getCourseContents(courseId);
      
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
      setLoadingActivity(false);
    }
  };

  const handleDownloadMaterials = (activity: CourseActivity) => {
    if (activity.details?.contents && activity.details.contents.length > 0) {
      activity.details.contents.forEach((content: any) => {
        if (content.fileurl) {
          const link = document.createElement('a');
          link.href = content.fileurl;
          link.download = content.filename || 'material';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    }
  };

  const handleLaunchActivity = (activity: CourseActivity) => {
    if (activity.details?.url) {
      // Open activity in new tab
      window.open(activity.details.url, '_blank');
    } else if (activity.details?.contents && activity.details.contents.length > 0) {
      // For file-based activities, open the first file
      const firstContent = activity.details.contents[0];
      if (firstContent.fileurl) {
        window.open(firstContent.fileurl, '_blank');
      }
    } else {
      // Fallback: show activity content in modal
      console.log('Launching activity:', activity.name);
      // You can add more specific handling here based on activity type
    }
  };

  const getActivityButtonText = (activity: CourseActivity) => {
    switch (activity.status) {
      case 'completed': return 'View';
      case 'in_progress': return 'Resume';
      case 'not_started': return 'Start';
      default: return 'Start';
    }
  };

  const getActivityButtonVariant = (activity: CourseActivity) => {
    switch (activity.status) {
      case 'completed': return 'outline' as const;
      case 'in_progress': return 'default' as const;
      case 'not_started': return 'default' as const;
      default: return 'default' as const;
    }
  };

     if (loading) {
     return (
       <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
         <div className="flex items-center justify-center min-h-[400px]">
           <div className="flex items-center space-x-2">
             <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
             <span className="text-gray-600">Loading course details...</span>
           </div>
         </div>
       </DashboardLayout>
     );
   }

     if (error) {
     return (
       <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
         <div className="flex items-center justify-center min-h-[400px] p-6">
           <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
             <div className="flex items-center space-x-2 text-red-800 mb-2">
               <Info className="w-5 h-5" />
               <span className="font-medium">Error Loading Course</span>
             </div>
             <p className="text-red-700 mb-3">{error}</p>
             <Button onClick={fetchCourseDetails} variant="outline" size="sm">
               <RefreshCw className="w-4 h-4 mr-2" />
               Try Again
             </Button>
           </div>
         </div>
       </DashboardLayout>
     );
   }

     if (!course) {
     return (
       <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
         <div className="flex items-center justify-center min-h-[400px]">
           <div className="text-center py-12">
             <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
             <p className="text-gray-500">The requested course could not be found.</p>
             <Button onClick={onBack} className="mt-4">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back to Courses
             </Button>
           </div>
         </div>
       </DashboardLayout>
     );
   }

  // Calculate course statistics
  const totalActivities = courseSections.reduce((sum, section) => sum + section.totalActivities, 0);
  const completedActivities = courseSections.reduce((sum, section) => sum + section.completedActivities, 0);
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
  
  // Get course image
  const courseImage = course.courseimage || 
                     course.overviewfiles?.[0]?.fileurl || 
                     '/card1.webp';

    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
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
          {/* Background Image - Bookshelf style */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Crect width='4' height='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          {/* Back to Courses Link */}
          <div className="absolute top-6 left-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Courses</span>
            </button>
          </div>

          {/* Course Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Difficulty Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                  Beginner
                </div>
                
                {/* Course Title */}
                <h1 className="text-4xl font-bold text-white mb-3">{course.fullname}</h1>
                
                {/* Course Description */}
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
                <p className="text-lg font-semibold text-gray-900">{courseSections.length}</p>
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
                <p className="text-lg font-semibold text-gray-900">{progress}%</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

                 {/* Main Content */}
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
           {/* Left Column - Course Content */}
           <div className="xl:col-span-3 space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg border">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'overview', label: 'Overview' },
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

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'curriculum' && (
                  <div className="space-y-6">
                    {/* Breadcrumb Navigation */}
                    {viewMode === 'activities' && selectedLesson && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                        <button
                          onClick={handleBackToLessons}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Lessons</span>
                        </button>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{selectedLesson.name}</span>
                      </div>
                    )}

                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {viewMode === 'lessons' ? 'Course Lessons' : `${selectedLesson?.name} - Activities`}
                      </h2>
                      
                      {viewMode === 'activities' && selectedLesson && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-sm">
                            {selectedLesson.completedActivities}/{selectedLesson.totalActivities} Completed
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Lessons View */}
                    {viewMode === 'lessons' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courseSections.map((section, sectionIndex) => (
                          <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                            {/* Lesson Thumbnail */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                              {/* Lesson Progress Badge */}
                              <div className="absolute top-3 right-3">
                                <Badge className={`${
                                  section.completedActivities === section.totalActivities 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {section.completedActivities}/{section.totalActivities}
                                </Badge>
                              </div>
                              
                              {/* Lesson Icon */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <FolderOpen className="w-16 h-16 text-blue-500 mx-auto mb-2" />
                                  <div className="text-sm text-gray-600">Lesson {sectionIndex + 1}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Lesson Details */}
                            <div className="p-4">
                              {/* Lesson Title */}
                              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                                {section.name}
                              </h3>
                              
                              {/* Lesson Description */}
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {section.totalActivities} activities • {section.completedActivities} completed
                              </p>
                              
                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>{section.totalActivities > 0 ? Math.round((section.completedActivities / section.totalActivities) * 100) : 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${section.totalActivities > 0 ? (section.completedActivities / section.totalActivities) * 100 : 0}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Action Button */}
                              <button
                                onClick={() => handleLessonClick(section)}
                                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                                  section.completedActivities === section.totalActivities
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {section.completedActivities === section.totalActivities ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Review Lesson
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Open Lesson
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Activities View */}
                    {viewMode === 'activities' && selectedLesson && (
                      <div className="space-y-4">
                        {/* Activities List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedLesson.activities.map((activity, activityIndex) => (
                            <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                              {/* Activity Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {getActivityIcon(activity.type, "w-5 h-5 text-blue-600")}
                                  <Badge variant="outline" className="text-xs">
                                    {activity.type}
                                  </Badge>
                                </div>
                                {getStatusIcon(activity.status)}
                              </div>
                              
                              {/* Activity Title */}
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {activity.name}
                              </h4>
                              
                              {/* Activity Description */}
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {activity.description || `Activity ${activityIndex + 1}`}
                              </p>
                              
                              {/* Activity Details */}
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.duration || '5-10 min'}</span>
                                </div>
                                <span>#{activityIndex + 1}</span>
                              </div>
                              
                              {/* Action Button */}
                              <button
                                onClick={() => handleActivityClick(activity)}
                                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                                  activity.status === 'completed'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : activity.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {getActivityButtonText(activity)}
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Empty State */}
                        {selectedLesson.activities.length === 0 && (
                          <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities</h3>
                            <p className="text-gray-500">This lesson doesn't have any activities yet.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'overview' && (
                  <div className="prose prose-sm max-w-none">
                    <h3>Course Overview</h3>
                    <p>{course.summary || course.description || 'This course provides comprehensive learning materials and activities.'}</p>
                    
                    {courseSections.length > 0 && (
                      <>
                        <h4>Course Structure:</h4>
                        <ul>
                          {courseSections.map((section, index) => (
                            <li key={section.id}>
                              <strong>{section.name}</strong> - {section.totalActivities} activities
                              {section.completedActivities > 0 && (
                                <span className="text-green-600"> ({section.completedActivities} completed)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    
                    {totalActivities > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4>Course Statistics:</h4>
                        <ul className="list-none space-y-2">
                          <li>• Total Lessons: {courseSections.length}</li>
                          <li>• Total Activities: {totalActivities}</li>
                          <li>• Completed Activities: {completedActivities}</li>
                          <li>• Progress: {progress}%</li>
                          {course.startdate && (
                            <li>• Start Date: {new Date(course.startdate * 1000).toLocaleDateString()}</li>
                          )}
                          {course.enddate && (
                            <li>• End Date: {new Date(course.enddate * 1000).toLocaleDateString()}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'instructors' && (
                  <div className="space-y-4">
                                         <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                       <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                         <User className="w-8 h-8 text-blue-600" />
                       </div>
                                             <div>
                         <h3 className="font-semibold text-gray-900">Course Instructor</h3>
                         <p className="text-gray-600">{course.instructor || 'Instructor'}</p>
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
            {/* Course Details */}
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
                     <p className="font-medium">{courseSections.length} Lessons</p>
                   </div>
                 </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Language</p>
                    <p className="font-medium">English</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-medium">Intermediate</p>
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
                    <p className="font-medium">{totalActivities}+</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-gray-500" />
                                     <div>
                     <p className="text-sm text-gray-600">Enrolled</p>
                     <p className="font-medium">{course.enrolledusercount || course.enrolledStudents || '0'} students</p>
                   </div>
                </div>
                
                                 <div className="flex items-center space-x-3">
                   <GraduationCap className="w-4 h-4 text-gray-500" />
                   <div>
                     <p className="text-sm text-gray-600">Certification</p>
                     <p className="font-medium">Yes</p>
                   </div>
                 </div>
                
                                 <Button className="w-full bg-purple-600 hover:bg-purple-700">
                   {course.progress === 100 ? 'View Certificate' : 'Continue Course'}
                 </Button>
              </CardContent>
            </Card>

            {/* Popular Courses */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <CardTitle className="text-lg">Popular Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularCourses.map((popularCourse) => (
                  <div key={popularCourse.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-700">{popularCourse.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{popularCourse.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-600">{popularCourse.rating}</span>
                        <span className="text-xs text-gray-500">{popularCourse.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Detail Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedActivity.name}</h2>
                  <Button variant="outline" size="sm" onClick={() => setSelectedActivity(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {loadingActivity ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{selectedActivity.type}</Badge>
                      <Badge variant={selectedActivity.status === 'completed' ? 'default' : 'outline'}>
                        {selectedActivity.status === 'completed' ? 'Completed' : 
                         selectedActivity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                    
                    {selectedActivity.description && (
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: selectedActivity.description }} />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {selectedActivity.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedActivity.duration}</span>
                        </div>
                      )}
                      {selectedActivity.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(selectedActivity.dueDate * 1000).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {selectedActivity.details?.contents && selectedActivity.details.contents.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadMaterials(selectedActivity)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Materials
                        </Button>
                      )}
                      <Button size="sm" onClick={() => handleLaunchActivity(selectedActivity)}>
                        <Play className="w-4 h-4 mr-2" />
                        {getActivityButtonText(selectedActivity)}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
                 )}
       </div>
     </DashboardLayout>
   );
 };

export default CourseDetail;