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
import DashboardLayout from '@/components/DashboardLayout';
import { moodleService } from '@/services/moodleApi';

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
  // Additional fields for enhanced display
  currentUnit?: string;
  progress?: number;
  certification?: string;
  isNew?: boolean;
  isMandatory?: boolean;
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
      progressText: `Estás en: Unidad ${Math.floor(Math.random() * 10) + 1} '${getRandomUnitName()}'`,
      progressIcon: <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />,
      buttonText: 'Continuar >',
      buttonVariant: 'default' as const
    };
  } else if (isUpcoming) {
    return {
      status: 'upcoming' as const,
      statusText: 'Upcoming',
      progressText: `Tu curso iniciará el ${formatDate(course.startdate)}`,
      progressIcon: <Calendar className="w-4 h-4 text-orange-600" />,
      buttonText: 'Información del curso >',
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

// Get random unit name for demo purposes
const getRandomUnitName = (): string => {
  const units = [
    'Retorno empresarial',
    'Fundamentos básicos',
    'Aplicaciones prácticas',
    'Evaluación continua',
    'Proyecto final',
    'Análisis avanzado',
    'Implementación',
    'Optimización'
  ];
  return units[Math.floor(Math.random() * units.length)];
};

// Get certification provider
const getCertificationProvider = (course: Course): string => {
  const category = course.categoryname?.toLowerCase() || '';
  const courseName = course.fullname.toLowerCase();
  
  if (category.includes('business') || courseName.includes('business')) {
    return 'Certificado por ACHS';
  }
  if (category.includes('technology') || courseName.includes('technology')) {
    return 'Certificado por eClass';
  }
  if (category.includes('education') || courseName.includes('education')) {
    return 'Certificado por eClass';
  }
  
  return 'Certificado por eClass'; // Default
};

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [coursesData, categoriesData, usersData] = await Promise.all([
        moodleService.getAllCourses(),
        moodleService.getCourseCategories(),
        moodleService.getAllUsers()
      ]);
      
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
          overviewfiles: course.overviewfiles,
          summaryfiles: course.summaryfiles
        });
        
        // Check if courseimage is a default Moodle image (course.svg)
        const isDefaultMoodleImage = courseImage && (
          courseImage.includes('course.svg') || 
          courseImage.includes('generated/course.svg') ||
          courseImage.includes('default-course-image')
        );
        
        if (courseImage && !isDefaultMoodleImage) {
          console.log(`✅ Using courseimage for "${course.fullname}": ${courseImage}`);
        } else if (course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
          courseImage = course.overviewfiles[0].fileurl;
          console.log(`⚠️ Using overviewfiles for "${course.fullname}": ${courseImage}`);
        } else if (course.summaryfiles && Array.isArray(course.summaryfiles) && course.summaryfiles.length > 0) {
          courseImage = course.summaryfiles[0].fileurl;
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
          // Add enhanced fields for the new card design
          currentUnit: getRandomUnitName(),
          progress: Math.floor(Math.random() * 100) + 1,
          certification: getCertificationProvider({ categoryname: category?.name, fullname: course.fullname } as Course),
          isNew: Math.random() > 0.7, // 30% chance of being new
          isMandatory: Math.random() > 0.5, // 50% chance of being mandatory
          // Use the real course image we just processed
          courseimage: courseImage,
          // Ensure image fields are included
          overviewfiles: course.overviewfiles || [],
          summaryfiles: course.summaryfiles || []
        } as Course;
      });

      setCourses(enhancedCourses);
      setCategories(categoriesData);
      
      console.log('✅ Admin courses data loaded successfully with real images');
      console.log('📊 Course Statistics:', {
        totalCourses: enhancedCourses.length,
        coursesWithRealImages: enhancedCourses.filter(c => c.courseimage && !c.courseimage.includes('card')).length,
        coursesWithFallbackImages: enhancedCourses.filter(c => c.courseimage && c.courseimage.includes('card')).length
      });
      
      // Log detailed image information for debugging (SAME AS SCHOOL DASHBOARD)
      enhancedCourses.forEach(course => {
        const isRealImage = course.courseimage && !course.courseimage.includes('card');
        console.log(`📸 Course "${course.fullname}": ${isRealImage ? '✅ Real Image' : '🔄 Fallback Image'} - ${course.courseimage}`);
      });
      
    } catch (error) {
      console.error('Error fetching courses from IOMAD API:', error);
      setError(`Failed to load courses data from IOMAD API: ${error.message || error}`);
      setCourses([]);
      setCategories([]);
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
      <DashboardLayout userRole="admin" userName="Admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses & Programs</h1>
            <p className="text-gray-600 mt-1">Manage all courses and educational programs</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
            <Button 
              onClick={() => {
                console.log('🔍 Debugging admin course images...');
                let realImageCount = 0;
                let fallbackImageCount = 0;
                
                courses.forEach(course => {
                  console.log(`📚 Course: "${course.fullname}"`);
                  console.log(`  - Course Image URL: ${course.courseimage}`);
                  console.log(`  - Is Real Moodle Image: ${course.courseimage && course.courseimage.includes('kodeit.legatoserver.com') ? '✅ YES' : '❌ NO'}`);
                  console.log(`  - Category: ${course.categoryname}`);
                  console.log(`  - Fallback: ${getCourseImageFallback(course.categoryname, course.fullname)}`);
                  console.log(`  - Overview Files: ${course.overviewfiles ? course.overviewfiles.length : 0}`);
                  console.log(`  - Summary Files: ${course.summaryfiles ? course.summaryfiles.length : 0}`);
                  
                  if (course.courseimage && course.courseimage.includes('kodeit.legatoserver.com')) {
                    realImageCount++;
                    console.log(`  - ✅ REAL MOODLE IMAGE DETECTED`);
                  } else {
                    fallbackImageCount++;
                    console.log(`  - ⚠️ Using fallback image`);
                  }
                  
                  if (course.overviewfiles && course.overviewfiles.length > 0) {
                    console.log(`  - Overview Files URLs:`, course.overviewfiles.map(f => f.fileurl));
                  }
                  if (course.summaryfiles && course.summaryfiles.length > 0) {
                    console.log(`  - Summary Files URLs:`, course.summaryfiles.map(f => f.fileurl));
                  }
                });
                
                console.log(`📊 ADMIN SUMMARY: ${realImageCount} real images, ${fallbackImageCount} fallback images out of ${courses.length} total courses`);
                alert(`Debugged ${courses.length} admin course images:\n✅ ${realImageCount} real Moodle images\n⚠️ ${fallbackImageCount} fallback images\n\nCheck console for detailed information.`);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Debug Images
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
                    
                    {/* Image source indicator */}
                    {courseImage && !courseImage.includes('card') && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                          Real Image
                        </Badge>
                      </div>
                    )}
                  
                  {/* Overlay with course icon */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  
                  {/* Status Labels */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {course.isMandatory && (
                      <Badge className="bg-yellow-500 text-black text-xs px-2 py-1">
                        Obligatorio
                      </Badge>
                    )}
                    {course.isNew && (
                      <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Course Content */}
                <CardContent className="p-6 space-y-4">
                  {/* Date Range */}
                  <div className="text-sm text-gray-600">
                    Inicia {formatDate(course.startdate)} | Finaliza {formatDate(course.enddate)}
                  </div>
                  
                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {course.fullname}
                  </h3>
                  
                  {/* Progress/Status Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {statusInfo.progressIcon}
                    <span>{statusInfo.progressText}</span>
                  </div>
                  
                  {/* Course Links */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        Información del curso
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">
                        {course.certification}
                      </span>
                    </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses; 