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
  X
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
  
  // Course sections and activities
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
  
  // Activity states
  const [selectedActivity, setSelectedActivity] = useState<CourseActivity | null>(null);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

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
            name: section.name || `Section ${index + 1}`,
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

  const getActivityIcon = (type: CourseActivity['type']) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'reading': return <FileText className="w-4 h-4" />;
      case 'quiz': return <BarChart3 className="w-4 h-4" />;
      case 'interactive': return <Target className="w-4 h-4" />;
      case 'assignment': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
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

  const handleActivityClick = async (activity: CourseActivity) => {
    console.log('🎯 Activity clicked:', activity.name);
    setSelectedActivity(activity);
    setIsActivityLoading(true);
    
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
      setIsActivityLoading(false);
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
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="flex items-center space-x-2">
           <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
           <span className="text-gray-600">Loading course details...</span>
         </div>
       </div>
     );
   }

     if (error) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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
     );
   }

     if (!course) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
     <div className="min-h-screen bg-gray-50">
       {/* Full Screen Header */}
       <div className="bg-white border-b border-gray-200 px-6 py-4">
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
       </div>

       <div className="p-6 space-y-6">
        {/* Course Banner */}
        <div className="relative h-64 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg overflow-hidden">
          {/* Background Image */}
          <img 
            src={courseImage} 
            alt={course.fullname}
            className="w-full h-full object-cover opacity-20"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {/* Overlay Text */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center">
            <div className="container mx-auto px-6">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-4">{course.fullname}</h1>
                <div className="flex items-center space-x-6 text-sm">
                                     <div className="flex items-center space-x-2">
                     <User className="w-4 h-4" />
                     <span>Instructor: {course.instructor || 'Instructor'}</span>
                   </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                                     <div className="flex items-center space-x-2">
                     <Clock className="w-4 h-4" />
                     <span>{course.totalModules || totalActivities} Lessons</span>
                   </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalActivities} Lessons</span>
                  </div>
                                     <div className="flex items-center space-x-2">
                     <span className="text-green-400 font-semibold">{course.progress || 0}% Complete</span>
                   </div>
                </div>
              </div>
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
                    { id: 'instructors', label: 'Instructors' },
                    { id: 'reviews', label: 'Reviews' }
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
                  <div className="space-y-4">
                    {courseSections.map((section, index) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg">
                        {/* Section Header */}
                        <div 
                          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleSectionExpansion(section.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-gray-900">{section.name}</h3>
                              <span className="text-sm text-gray-600">
                                {section.completedActivities}/{section.totalActivities} Activities Completed
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(section.completedActivities / section.totalActivities) * 100} 
                                className="w-20 h-2"
                              />
                              {expandedSections.has(section.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section Activities */}
                        {expandedSections.has(section.id) && (
                          <div className="p-4 space-y-3">
                            {section.activities.map((activity) => (
                              <div key={activity.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    activity.status === 'completed' ? 'bg-green-100' :
                                    activity.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                                  }`}>
                                    {getActivityIcon(activity.type)}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                      <span className="capitalize">{activity.type}</span>
                                      {activity.duration && (
                                        <>
                                          <span>•</span>
                                          <span>{activity.duration}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className={`flex items-center space-x-1 ${getStatusColor(activity.status)}`}>
                                    {getStatusIcon(activity.status)}
                                    <span className="text-sm capitalize">
                                      {activity.status === 'completed' ? 'Completed' :
                                       activity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant={getActivityButtonVariant(activity)}
                                  size="sm"
                                  onClick={() => handleActivityClick(activity)}
                                >
                                  {getActivityButtonText(activity)}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
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

                {activeTab === 'reviews' && (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500">Be the first to review this course!</p>
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
                     <p className="font-medium">{course.totalModules || totalActivities} Lessons</p>
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
                    <p className="text-sm text-gray-600">Lectures</p>
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
                
                {isActivityLoading ? (
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
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Materials
                      </Button>
                      <Button size="sm">
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
     </div>
   );
 };

export default CourseDetail;
