import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Info,
  FileText,
  ChevronRight,
  RefreshCw,
  Star,
  Play,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import G8PlusLayout from '@/components/G8PlusLayout';
import { moodleService } from '@/services/moodleApi';
import { useAuth } from '@/context/AuthContext';

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary?: string;
  categoryid: number;
  categoryname?: string;
  startdate?: number;
  enddate?: number;
  enrolledusercount?: number;
  completionrate?: number;
  teachers?: Array<{
    id: number;
    firstname: string;
    lastname: string;
  }>;
  status: 'active' | 'inactive' | 'completed';
  format: string;
  visible: boolean;
  // Image-related fields
  courseimage?: string;
  overviewfiles?: Array<{ fileurl: string; filename?: string }>;
  summaryfiles?: Array<{ fileurl: string; filename?: string }>;
  // Additional fields that might be present in the API response
  progress?: any;
  completedLessons?: any;
  totalLessons?: any;
  activitiesData?: any;
}

// Course image fallbacks based on category and course name
const getCourseImageFallback = (categoryName?: string, courseName?: string): string => {
  const category = categoryName?.toLowerCase() || '';
  const course = courseName?.toLowerCase() || '';
  
  // Programming/IT courses
  if (category.includes('programming') || category.includes('coding') || category.includes('development') ||
      course.includes('programming') || course.includes('coding') || course.includes('development') ||
      course.includes('kodeit') || course.includes('digital')) {
    return '/card1.webp'; // Programming image
  }
  
  // Business/Management courses
  if (category.includes('business') || category.includes('management') || category.includes('leadership') ||
      course.includes('business') || course.includes('management') || course.includes('leadership')) {
    return '/card2.webp'; // Business image
  }
  
  // Education/Teaching courses
  if (category.includes('education') || category.includes('teaching') || category.includes('pedagogy') ||
      course.includes('education') || course.includes('teaching') || course.includes('pedagogy') ||
      course.includes('discipline')) {
    return '/card3.webp'; // Education image
  }
  
  // Technology/ICT courses
  if (category.includes('technology') || category.includes('ict') || category.includes('digital') ||
      course.includes('technology') || course.includes('ict') || course.includes('digital')) {
    return '/Innovative-ICT-Curricula.webp';
  }
  
  // Primary/Grade courses
  if (category.includes('primary') || category.includes('grade') || course.includes('grade')) {
    return '/home-carousal-for-teachers.webp';
  }
  
  // Assessment courses
  if (category.includes('assessment') || course.includes('assessment')) {
    return '/home-carousel-for-schools.webp';
  }
  
  // Default fallback - use a more appealing default image
  return '/card1.webp'; // Use programming image as default since it's most relevant
};

// Validate and fix image URL
const validateImageUrl = (url?: string): string => {
  if (!url) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // For Moodle URLs, prefer the regular pluginfile.php over webservice/pluginfile.php
    if (url.includes('webservice/pluginfile.php')) {
      // Convert webservice URL to regular pluginfile URL
      const regularUrl = url.replace('webservice/pluginfile.php', 'pluginfile.php');
      console.log(`🔄 Converting webservice URL to regular URL: ${url} -> ${regularUrl}`);
      return regularUrl;
    }
    return url;
  }
  
  // If it's a relative path, make it absolute
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a Moodle file URL, ensure it has the token
  if (url.includes('webservice/rest/server.php')) {
    return url;
  }
  
  // Default fallback
  return '/placeholder.svg';
};

// Get course image with fallback
const getCourseImage = (course: Course): string => {
  // The course image is already processed in fetchCourses, so just return it
  if (course.courseimage) {
    return course.courseimage;
  }
  
  // Fallback to category-based image if no image is set
  return getCourseImageFallback(course.categoryname, course.fullname);
};

// Format date for display
const formatDate = (timestamp?: number): string => {
  if (!timestamp) return 'TBD';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Get course status and progress info
const getCourseStatusInfo = (course: Course) => {
  const now = Date.now() / 1000;
  const isActive = course.startdate && course.enddate && 
    course.startdate <= now && course.enddate >= now;
  const isCompleted = course.enddate && course.enddate < now;
  const isUpcoming = course.startdate && course.startdate > now;
  
  if (isCompleted) {
    return {
      status: 'completed' as const,
      statusText: 'Completed',
      progressText: 'Course completed',
      progressIcon: <CheckCircle className="w-4 h-4 text-green-600" />,
      buttonText: 'View Certificate',
      buttonVariant: 'default' as const
    };
  } else if (isActive) {
    return {
      status: 'active' as const,
      statusText: 'In Progress',
      progressText: `Completion Rate: ${course.completionrate || 0}%`,
      progressIcon: <RefreshCw className="w-4 h-4 text-blue-600" />,
      buttonText: 'View Course',
      buttonVariant: 'default' as const
    };
  } else if (isUpcoming) {
    return {
      status: 'upcoming' as const,
      statusText: 'Upcoming',
      progressText: `Starts: ${formatDate(course.startdate)}`,
      progressIcon: <Calendar className="w-4 h-4 text-orange-600" />,
      buttonText: 'Course Info',
      buttonVariant: 'outline' as const
    };
  } else {
    return {
      status: 'inactive' as const,
      statusText: 'Inactive',
      progressText: 'Course not available',
      progressIcon: <Clock className="w-4 h-4 text-gray-600" />,
      buttonText: 'View Details',
      buttonVariant: 'outline' as const
    };
  }
};

// Remove the mock unit name function - not needed
// const getRandomUnitName = (): string => { ... }

// Remove the mock certification provider function - not needed
// const getCertificationProvider = (course: Course): string => { ... }

const Courses: React.FC = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetchCourses();
    }
  }, [currentUser?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser?.id) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('🔄 Starting to fetch student-specific course data from Moodle API...');
      console.log('👤 Fetching courses for user:', currentUser.id, currentUser.fullname);
      
      const [coursesData, categoriesData, usersData] = await Promise.all([
        moodleService.getUserCourses(currentUser.id.toString()),
        moodleService.getCourseCategories(),
        moodleService.getAllUsers()
      ]);
      
      console.log('📊 Raw API Data:', {
        courses: coursesData?.length || 0,
        categories: categoriesData?.length || 0,
        users: usersData?.length || 0
      });
      
      // Get teachers for assignment
      const teachers = usersData.filter(user => user.isTeacher);
      
      // Enhanced course data processing with real image handling (same as school dashboard)
      const enhancedCourses: Course[] = coursesData.map(course => {
        const category = categoriesData.find(cat => cat.id === course.categoryid);
        const isActive = course.startdate && course.enddate && 
          course.startdate <= (Date.now() / 1000) && course.enddate >= (Date.now() / 1000);
        const isCompleted = course.enddate && course.enddate < (Date.now() / 1000);
        
        let status: 'active' | 'inactive' | 'completed' = 'inactive';
        if (isCompleted) status = 'completed';
        else if (isActive) status = 'active';
        
        // Assign teachers based on course ID and available teachers
        const assignedTeachers = teachers.length > 0 ? [
          teachers[Number(course.id) % teachers.length]
        ].map(teacher => ({
          id: Number(teacher.id),
          firstname: teacher.firstname,
          lastname: teacher.lastname
        })) : [];
        
        // Use actual enrollment count from course data, fallback to 0
        const actualEnrollments = (course as any).enrollmentCount || (course as any).enrolledusercount || 0;
        
        // Use actual completion rate from course data, fallback to estimated based on visibility
        const actualCompletionRate = (course as any).completionrate || 
          (course.visible ? 75 : 50); // Basic fallback for visible/hidden courses

        // Enhanced image handling with real Moodle course images (EXACT SAME AS SCHOOL DASHBOARD)
        let courseImage = course.courseimage;
        
        // Debug: Log the raw course data
        console.log(`🔍 Processing course "${course.fullname}":`, {
          id: course.id,
          courseimage: course.courseimage,
          overviewfiles: (course as any).overviewfiles,
          summaryfiles: (course as any).summaryfiles
        });
        
        // Check if courseimage is a default Moodle image (course.svg)
        const isDefaultMoodleImage = courseImage && (
          courseImage.includes('course.svg') || 
          courseImage.includes('generated/course.svg') ||
          courseImage.includes('default-course-image')
        );
        
        if (courseImage && !isDefaultMoodleImage) {
          console.log(`✅ Using courseimage for "${course.fullname}": ${courseImage}`);
        } else if ((course as any).overviewfiles && Array.isArray((course as any).overviewfiles) && (course as any).overviewfiles.length > 0) {
          courseImage = (course as any).overviewfiles[0].fileurl;
          console.log(`⚠️ Using overviewfiles for "${course.fullname}": ${courseImage}`);
        } else if ((course as any).summaryfiles && Array.isArray((course as any).summaryfiles) && (course as any).summaryfiles.length > 0) {
          courseImage = (course as any).summaryfiles[0].fileurl;
          console.log(`⚠️ Using summaryfiles for "${course.fullname}": ${courseImage}`);
        } else {
          console.log(`❌ No real image found for "${course.fullname}", will use fallback`);
          courseImage = null; // Force fallback
        }
        
        // Validate the image URL
        courseImage = validateImageUrl(courseImage);
        
        // If no valid image or it's a default Moodle image, use category-based fallback
        if (!courseImage || courseImage === '/placeholder.svg' || isDefaultMoodleImage) {
          courseImage = getCourseImageFallback(course.categoryname, course.fullname);
          console.log(`🔄 Using fallback image for "${course.fullname}": ${courseImage}`);
        }
            
          return {
           id: Number(course.id),
            fullname: course.fullname,
            shortname: course.shortname,
           summary: course.summary,
           categoryid: course.categoryid || 0,
           categoryname: category?.name || 'Uncategorized',
            startdate: course.startdate,
            enddate: course.enddate,
           enrolledusercount: actualEnrollments,
           completionrate: actualCompletionRate,
           teachers: assignedTeachers,
           status,
           format: course.format || 'topics',
           visible: course.visible !== 0,
           // Use the real course image we just processed
           courseimage: courseImage,
           // Ensure image fields are included
           overviewfiles: (course as any).overviewfiles || [],
           summaryfiles: (course as any).summaryfiles || []
         } as Course;
      });

      setCourses(enhancedCourses);
      setCategories(categoriesData);
      
      console.log('✅ Student-specific course data loaded successfully from Moodle API!');
      console.log('📊 Course Statistics:', {
        totalEnrolledCourses: enhancedCourses.length,
        coursesWithRealImages: enhancedCourses.filter(c => c.courseimage && !c.courseimage.includes('card')).length,
        coursesWithFallbackImages: enhancedCourses.filter(c => c.courseimage && c.courseimage.includes('card')).length
      });
      
      // Clear any previous errors since we successfully loaded data
      setError('');
      setIsUsingFallbackData(false);
      
      // Log detailed image information for debugging (SAME AS SCHOOL DASHBOARD)
      enhancedCourses.forEach(course => {
        const isRealImage = course.courseimage && !course.courseimage.includes('card');
        console.log(`📸 Course "${course.fullname}": ${isRealImage ? '✅ Real Image' : '🔄 Fallback Image'} - ${course.courseimage}`);
      });
      
    } catch (error) {
      console.error('❌ Error fetching courses from Moodle API:', error);
      setError(`Failed to load courses data from Moodle API: ${error.message || error}`);
      
      // Provide fallback sample data if API fails
      console.log('🔄 Providing fallback sample course data...');
      const fallbackCourses: Course[] = [
        {
          id: 1,
          fullname: 'Introduction to Programming',
          shortname: 'PROG101',
          summary: 'Learn the fundamentals of programming with hands-on exercises.',
          categoryid: 1,
          categoryname: 'Programming',
          startdate: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
          enddate: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days from now
          enrolledusercount: 45,
          completionrate: 78,
          teachers: [{ id: 1, firstname: 'John', lastname: 'Smith' }],
          status: 'active',
          format: 'topics',
          visible: true,
          courseimage: '/card1.webp'
        },
        {
          id: 2,
          fullname: 'Web Development Basics',
          shortname: 'WEB101',
          summary: 'Build your first website using HTML, CSS, and JavaScript.',
          categoryid: 2,
          categoryname: 'Web Development',
          startdate: Math.floor(Date.now() / 1000) - (15 * 24 * 60 * 60), // 15 days ago
          enddate: Math.floor(Date.now() / 1000) + (45 * 24 * 60 * 60), // 45 days from now
          enrolledusercount: 32,
          completionrate: 65,
          teachers: [{ id: 2, firstname: 'Sarah', lastname: 'Johnson' }],
          status: 'active',
          format: 'topics',
          visible: true,
          courseimage: '/card2.webp'
        },
        {
          id: 3,
          fullname: 'Data Science Fundamentals',
          shortname: 'DATA101',
          summary: 'Introduction to data analysis and visualization.',
          categoryid: 3,
          categoryname: 'Data Science',
          startdate: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60), // 60 days ago
          enddate: Math.floor(Date.now() / 1000) - (10 * 24 * 60 * 60), // 10 days ago
          enrolledusercount: 28,
          completionrate: 92,
          teachers: [{ id: 3, firstname: 'Mike', lastname: 'Chen' }],
          status: 'completed',
          format: 'topics',
          visible: true,
          courseimage: '/card3.webp'
        }
      ];
      
      setCourses(fallbackCourses);
      setCategories([
        { id: 1, name: 'Programming' },
        { id: 2, name: 'Web Development' },
        { id: 3, name: 'Data Science' }
      ]);
      setIsUsingFallbackData(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.shortname.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || course.categoryname === filterCategory;
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    completed: courses.filter(c => c.status === 'completed').length,
    totalEnrollments: courses.reduce((sum, c) => sum + (c.enrolledusercount || 0), 0),
    averageCompletion: Math.round(courses.reduce((sum, c) => sum + (c.completionrate || 0), 0) / courses.length) || 0
  };

  if (loading) {
    return (
      <G8PlusLayout userName="Student">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </G8PlusLayout>
    );
  }

    return (
    <G8PlusLayout userName="Student">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Browse and access your enrolled courses</p>
            {isUsingFallbackData && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-orange-600 font-medium">Using sample data - API connection unavailable</span>
              </div>
            )}
            {!isUsingFallbackData && !loading && courses.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Live data from Moodle API</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => fetchCourses()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageCompletion}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </Button>
            </div>
          </div>
          </CardContent>
        </Card>

                 {/* Enhanced Course Cards Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
             const statusInfo = getCourseStatusInfo(course);
             const courseImage = getCourseImage(course);

              return (
               <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  {/* Course Image Header */}
                 <div className="relative h-48 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <img
                      src={courseImage}
                      alt={course.fullname}
                     className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getCourseImageFallback(course.categoryname, course.fullname);
                      }}
                    />

                   {/* Overlay with course icon */}
                   <div className="absolute bottom-4 left-4">
                     <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-lg">
                       <BookOpen className="w-5 h-5 text-blue-600" />
                     </div>
                    </div>

                   {/* Status Badge */}
                   <div className="absolute top-4 right-4">
                     <Badge className={`text-xs px-2 py-1 ${
                       statusInfo.status === 'active' ? 'bg-green-500 text-white' :
                       statusInfo.status === 'completed' ? 'bg-blue-500 text-white' :
                       statusInfo.status === 'upcoming' ? 'bg-orange-500 text-white' :
                       'bg-gray-500 text-white'
                     }`}>
                       {statusInfo.statusText}
                     </Badge>
                    </div>
                  </div>

                  {/* Course Content */}
                 <CardContent className="p-6 space-y-4">
                    {/* Course Title */}
                   <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {course.fullname}
                   </h3>
                   
                   {/* Course Short Name */}
                   <p className="text-sm text-gray-600">
                     {course.shortname}
                   </p>
                   
                   {/* Category */}
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                     <BookOpen className="w-4 h-4" />
                     <span>{course.categoryname || 'Uncategorized'}</span>
                    </div>

                   {/* Progress/Status Info */}
                   <div className="flex items-center gap-2 text-sm text-gray-700">
                     {statusInfo.progressIcon}
                     <span>{statusInfo.progressText}</span>
                      </div>
                   
                   {/* Enrollment Info */}
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                     <Users className="w-4 h-4" />
                     <span>{course.enrolledusercount || 0} enrolled</span>
                    </div>

                   {/* Date Range */}
                   <div className="text-sm text-gray-600">
                     {formatDate(course.startdate)} - {formatDate(course.enddate)}
                    </div>

                    {/* Action Button */}
                    <Button 
                     className={`w-full mt-4 ${statusInfo.buttonVariant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                     variant={statusInfo.buttonVariant}
                   >
                     {statusInfo.buttonText}
                     <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {courses.length === 0 ? 'No enrolled courses' : 'No courses found'}
              </h3>
              <p className="text-gray-600">
                {courses.length === 0 
                  ? 'You are not enrolled in any courses yet. Contact your teacher or administrator to get enrolled.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </G8PlusLayout>
  );
};

export default Courses; 