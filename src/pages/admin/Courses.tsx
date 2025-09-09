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
  Target as TargetIcon,
  ArrowLeft,
  Bell,
  Info
} from 'lucide-react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import moodleService from '../../services/moodleApi';
import CourseDetail from '../student/CourseDetail';
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
  categoryid?: number;
  startdate?: number;
  enddate?: number;
  visible?: number;
  description?: string;
  summary?: string;
  instructor?: string;
  enrolledStudents?: number;
  totalModules?: number;
  completedModules?: number;
  courseimage?: string;
  overviewfiles?: Array<{ fileurl: string; filename?: string }>;
  summaryfiles?: Array<{ fileurl: string; filename?: string }>;
}

// Helper functions
const getCourseImageFallback = (categoryname?: string, fullname?: string): string => {
  const category = categoryname?.toLowerCase() || '';
  const name = fullname?.toLowerCase() || '';

  if (category.includes('programming') || category.includes('coding') || name.includes('programming')) {
    return '/card1.webp';
  } else if (category.includes('design') || category.includes('art') || name.includes('design')) {
    return '/card2.webp';
  } else if (category.includes('business') || category.includes('management') || name.includes('business')) {
    return '/card3.webp';
  } else if (category.includes('science') || category.includes('math') || name.includes('science')) {
    return '/Innovative-ICT-Curricula.webp';
  } else if (category.includes('language') || category.includes('english') || name.includes('language')) {
    return '/home-carousal-for-teachers.webp';
  } else {
    return '/card1.webp';
  }
};

const getUnitName = (shortname: string, unitNumber: number): string => {
  const courseName = shortname.toLowerCase();
  
  if (courseName.includes('english') || courseName.includes('language')) {
    const englishUnits = [
      'Introduction',
      'Basic Vocabulary',
      'Grammar Fundamentals',
      'Reading Comprehension',
      'Writing Skills',
      'Speaking Practice',
      'Listening Exercises',
      'Advanced Topics',
      'Final Assessment'
    ];
    return englishUnits[unitNumber - 1] || `Unit ${unitNumber}`;
  } else {
    const genericUnits = [
      'Introduction',
      'Basic Concepts',
      'Core Principles',
      'Practical Applications',
      'Advanced Topics',
      'Project Work',
      'Assessment',
      'Final Review'
    ];
    return genericUnits[unitNumber - 1] || `Unit ${unitNumber}`;
  }
};

const getCertificationProvider = (course: Course): string => {
  const courseName = course.fullname?.toLowerCase() || '';
  const category = course.categoryname?.toLowerCase() || '';
  
  if (category.includes('business') || courseName.includes('business')) {
    return 'eClass';
  } else if (category.includes('safety') || courseName.includes('safety')) {
    return 'ACHS';
  } else if (category.includes('tech') || courseName.includes('programming')) {
    return 'KodeIT';
  } else if (category.includes('moodle') || courseName.includes('moodle')) {
    return 'Moodle';
  } else {
    return 'KodeIT';
  }
};

const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('english') || name.includes('language')) return 'Lang';
  if (name.includes('digital') || name.includes('foundation')) return 'Tech';
  if (name.includes('discipline') || name.includes('positive')) return 'Edu';
  if (name.includes('math') || name.includes('science')) return 'Math';
  if (name.includes('art') || name.includes('creative')) return 'Art';
  if (name.includes('business') || name.includes('management')) return 'Bus';
  if (name.includes('safety') || name.includes('health')) return 'Safe';
  if (name.includes('programming') || name.includes('coding')) return 'Code';
  return 'Course';
};

const getCategoryColor = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('english') || name.includes('language')) return 'from-purple-500 to-blue-600';
  if (name.includes('digital') || name.includes('foundation')) return 'from-blue-500 to-cyan-600';
  if (name.includes('discipline') || name.includes('positive')) return 'from-green-500 to-emerald-600';
  if (name.includes('math') || name.includes('science')) return 'from-orange-500 to-red-600';
  if (name.includes('art') || name.includes('creative')) return 'from-pink-500 to-rose-600';
  if (name.includes('business') || name.includes('management')) return 'from-indigo-500 to-purple-600';
  if (name.includes('safety') || name.includes('health')) return 'from-red-500 to-pink-600';
  if (name.includes('programming') || name.includes('coding')) return 'from-yellow-500 to-orange-600';
  return 'from-gray-500 to-slate-600';
};

const getCategoryDescription = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('english') || name.includes('language')) return 'Language learning and communication skills';
  if (name.includes('digital') || name.includes('foundation')) return 'Digital literacy and computer fundamentals';
  if (name.includes('discipline') || name.includes('positive')) return 'Positive discipline and classroom management';
  if (name.includes('math') || name.includes('science')) return 'Mathematics and scientific concepts';
  if (name.includes('art') || name.includes('creative')) return 'Creative arts and design principles';
  if (name.includes('business') || name.includes('management')) return 'Business and management skills';
  if (name.includes('safety') || name.includes('health')) return 'Health and safety protocols';
  if (name.includes('programming') || name.includes('coding')) return 'Programming and coding fundamentals';
  return 'General course content and skills';
};

const Courses: React.FC = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'subcategories' | 'courses'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    courseCount: number;
    icon: string;
    color: string;
    description: string;
    categoryId?: number;
    parent?: number;
    sortorder?: number;
    visible?: number;
    timemodified?: number;
    subcategories?: Array<{
      id: string;
      name: string;
      courseCount: number;
      icon: string;
      color: string;
      description: string;
      categoryId?: number;
      parent?: number;
      sortorder?: number;
      visible?: number;
      timemodified?: number;
    }>;
  }>>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching categories and course counts (optimized)...');

      // Fetch categories first - this is much faster
      await fetchCategoriesOnly();
      
      // Don't load detailed course data yet - only when category is clicked
      setCourses([]);
      console.log('✅ Categories loaded, course details will load on demand');

    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesOnly = async () => {
    try {
      console.log('🔍 Fetching categories from Moodle API...');
      
      // Fetch all categories
      const allCategories = await moodleService.getCategories();
      console.log('📊 All categories fetched:', allCategories.length);
      
      // Fetch course counts for each category (single API call per category)
      const categoriesWithCounts = await Promise.all(allCategories.map(async (category) => {
        try {
          const courseCount = await moodleService.getCategoryCourseCount(category.id);
          return {
            id: category.id.toString(),
            name: category.name,
            courseCount,
            icon: 'BookOpen',
            color: 'blue',
            description: category.description || 'General course content and skills',
            categoryId: category.id,
            parent: category.parent,
            sortorder: category.sortorder,
            visible: category.visible,
            timemodified: category.timemodified
          };
        } catch (error) {
          console.warn(`Failed to get course count for category ${category.id}:`, error);
          return {
            id: category.id.toString(),
            name: category.name,
            courseCount: 0,
            icon: 'BookOpen',
            color: 'blue',
            description: category.description || 'General course content and skills',
            categoryId: category.id,
            parent: category.parent,
            sortorder: category.sortorder,
            visible: category.visible,
            timemodified: category.timemodified
          };
        }
      }));

      // Organize categories into parent-child structure first
      const organizedCategories = organizeCategories(categoriesWithCounts);
      
      // Then filter to show only categories that have courses OR have subcategories with courses
      const visibleCategories = organizedCategories.filter(category => {
        // Show if category has courses directly
        if (category.courseCount > 0) return true;
        
        // Show if category has subcategories with courses
        if (category.subcategories && category.subcategories.length > 0) {
          const hasSubcategoriesWithCourses = category.subcategories.some(sub => sub.courseCount > 0);
          return hasSubcategoriesWithCourses;
        }
        
        return false;
      });
      
      setCategories(visibleCategories);
      console.log('✅ Categories organized:', visibleCategories.length);
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  };

  const organizeCategories = (categories: any[]) => {
    // Find root categories (parent = 0 or no parent)
    const rootCategories = categories.filter(cat => !cat.parent || cat.parent === 0);
    
    // Find subcategories
    const subcategories = categories.filter(cat => cat.parent && cat.parent !== 0);
    
    // Organize subcategories under their parents
    const organized = rootCategories.map(root => {
      const children = subcategories.filter(sub => sub.parent === root.categoryId);
      
      // Calculate total course count including subcategories
      const totalCourseCount = root.courseCount + children.reduce((sum, child) => sum + child.courseCount, 0);
      
      return {
        ...root,
        courseCount: totalCourseCount, // Update with total count including subcategories
        subcategories: children.length > 0 ? children : undefined
      };
    });
    
    return organized;
  };

  const handleCourseClick = async (course: Course) => {
    // For admin view, no need to load progress data
    setSelectedCourseForDetail(course);
    setShowCourseDetail(true);
  };

  const loadCourseProgress = async (course: Course): Promise<Course> => {
    try {
      console.log(`🔍 Loading progress for course ${course.id}...`);
      
      // Load completion data and course contents
      const [courseCompletion, courseContents] = await Promise.all([
        moodleService.getCourseCompletion(course.id).catch(error => {
          console.warn(`⚠️ Could not get completion data for course ${course.id}:`, error.message);
          return null; // Return null if not enrolled or other error
        }),
        moodleService.getCourseContents(course.id).catch(error => {
          console.warn(`⚠️ Could not get course contents for course ${course.id}:`, error.message);
          return null; // Return null if error
        })
      ]);

      // Calculate real progress and statistics
      const totalModules = courseContents?.length || 0;
      const completedModules = courseCompletion?.completionstatus?.completed || 0;
      const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
      
      // Determine real status
      let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
      if (progress === 100) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in_progress';
      }

      // If user is not enrolled, show appropriate status
      if (!courseCompletion) {
        status = 'not_started';
        console.log(`📝 User not enrolled in course ${course.id}, showing as not started`);
      }

      return {
        ...course,
        progress,
        grade: courseCompletion?.completionstatus?.grade || 0,
        status,
        totalModules,
        completedModules,
        enrolledStudents: courseCompletion?.completionstatus?.enrolledusercount || 0
      };
    } catch (error) {
      console.error(`❌ Error loading progress for course ${course.id}:`, error);
      return course; // Return original course if progress loading fails
    }
  };

  const handleCategoryClick = async (categoryId: string) => {
    console.log('🎯 Category clicked:', categoryId);
    const selectedCat = categories.find(cat => cat.id === categoryId);
    console.log('📋 Selected category:', selectedCat);
    
    setSelectedCategory(categoryId);
    
    if (selectedCat?.subcategories && selectedCat.subcategories.length > 0) {
      console.log('📂 Category has subcategories, navigating to subcategories view');
      setViewMode('subcategories');
    } else {
      console.log('📚 Category has no subcategories, loading courses directly');
      await loadCoursesForCategory(selectedCat!.categoryId!);
      setViewMode('courses');
    }
  };

  const loadCoursesForCategory = async (categoryId: number) => {
    let processedCourses: Course[] = [];
    
    try {
      setLoading(true);
      console.log(`🔍 Loading courses for category ${categoryId}...`);
      
      // Fetch courses for this specific category
      const categoryCourses = await moodleService.getCoursesByCategory(categoryId);
      console.log(`📊 Found ${categoryCourses.length} courses in category ${categoryId}`);
      
      // Process courses with basic information (no detailed completion data yet)
      processedCourses = categoryCourses.map(course => ({
        id: course.id,
        fullname: course.fullname,
        shortname: course.shortname,
        progress: 0, // Will load on demand
        grade: 0,
        lastAccess: course.startdate,
        completionDate: course.enddate,
        status: 'not_started' as const,
        categoryname: course.categoryname || 'General',
        categoryid: course.categoryid,
        startdate: course.startdate,
        enddate: course.enddate,
        visible: course.visible,
        description: course.summary || '',
        instructor: (course as any).instructor || '',
        enrolledStudents: 0, // Will load on demand
        totalModules: 0, // Will load on demand
        completedModules: 0,
        courseimage: course.courseimage,
        overviewfiles: (course as any).overviewfiles,
        summaryfiles: (course as any).summaryfiles
      }));
      
      setCourses(processedCourses);
      console.log('✅ Courses loaded for category:', processedCourses.length);
      
    } catch (error) {
      console.error('❌ Error loading courses for category:', error);
      setError('Failed to load courses for this category.');
    } finally {
      setLoading(false);
    }
    
    // Progress loading removed for admin view - not needed for course management
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleSubcategoryClick = async (subcategoryId: string) => {
    console.log('🎯 Subcategory clicked:', subcategoryId);
    const selectedCat = categories.find(cat => cat.id === selectedCategory);
    const selectedSubcat = selectedCat?.subcategories?.find(sub => sub.id === subcategoryId);
    console.log('📋 Selected subcategory:', selectedSubcat);
    
    setSelectedSubcategory(subcategoryId);
    
    // Load courses for this subcategory
    if (selectedSubcat?.categoryId) {
      await loadCoursesForCategory(selectedSubcat.categoryId);
    }
    
    setViewMode('courses');
  };

  const fetchRealCategories = async (enrolledCourses: Course[]) => {
    try {
      console.log('🔄 Fetching real categories from IOMAD Moodle API...');
      
      const realCategories = await moodleService.getCourseCategories();
      
      if (realCategories && Array.isArray(realCategories)) {
        console.log('✅ Real categories fetched:', realCategories.length);
        
        // Build hierarchical structure: Categories → Subcategories → Courses
        const allCategories = realCategories.map((category: any) => {
          // Count how many enrolled courses are in this category
          const categoryCourses = enrolledCourses.filter(course => 
            course.categoryid === category.id || 
            course.categoryname === category.name
          );
          
          return {
            id: category.id.toString(),
            name: category.name || category.fullname || 'Unnamed Category',
            courseCount: categoryCourses.length,
            icon: getCategoryIcon(category.name || category.fullname || ''),
            color: getCategoryColor(category.name || category.fullname || ''),
            description: category.description || getCategoryDescription(category.name || category.fullname || ''),
            // Additional real category data
            categoryId: category.id,
            parent: category.parent,
            sortorder: category.sortorder,
            visible: category.visible,
            timemodified: category.timemodified
          };
        });
        
        // Separate main categories (parent = 0) and subcategories (parent > 0)
        const mainCategories = allCategories.filter(cat => !cat.parent || cat.parent === 0);
        const subcategories = allCategories.filter(cat => cat.parent && cat.parent > 0);
        
        // Attach subcategories to their parent categories
        const hierarchicalCategories = mainCategories.map(mainCat => {
          const categorySubcategories = subcategories.filter(sub => sub.parent === mainCat.categoryId);
          
          // Calculate total course count including subcategories
          const totalCourseCount = categorySubcategories.reduce((sum, sub) => sum + sub.courseCount, 0) + mainCat.courseCount;
          
          return {
            ...mainCat,
            courseCount: totalCourseCount,
            subcategories: categorySubcategories
          };
        }).filter(category => category.courseCount > 0); // Only show categories with enrolled courses
        
        setCategories(hierarchicalCategories);
        console.log('✅ Hierarchical categories processed:', hierarchicalCategories.length);
        console.log('📊 Structure:', hierarchicalCategories.map(cat => ({
          name: cat.name,
          courseCount: cat.courseCount,
          subcategories: cat.subcategories?.length || 0
        })));
      } else {
        console.log('⚠️ No real categories found, using fallback');
        // Fallback to course-based categories if API fails
        const categoryMap = new Map<string, { count: number; courses: Course[] }>();
        
        enrolledCourses.forEach(course => {
          const categoryName = course.categoryname || 'General';
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, { count: 0, courses: [] });
          }
          categoryMap.get(categoryName)!.count++;
          categoryMap.get(categoryName)!.courses.push(course);
        });
        
        const fallbackCategories = Array.from(categoryMap.entries()).map(([name, data]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          courseCount: data.count,
          icon: getCategoryIcon(name),
          color: getCategoryColor(name),
          description: getCategoryDescription(name),
          subcategories: []
        }));
        
        setCategories(fallbackCategories);
        console.log('✅ Fallback categories processed:', fallbackCategories.length);
      }
    } catch (error) {
      console.error('❌ Error fetching real categories:', error);
      
      // Fallback to course-based categories
      const categoryMap = new Map<string, { count: number; courses: Course[] }>();
      
      enrolledCourses.forEach(course => {
        const categoryName = course.categoryname || 'General';
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { count: 0, courses: [] });
        }
        categoryMap.get(categoryName)!.count++;
        categoryMap.get(categoryName)!.courses.push(course);
      });
      
      const fallbackCategories = Array.from(categoryMap.entries()).map(([name, data]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        courseCount: data.count,
        icon: getCategoryIcon(name),
        color: getCategoryColor(name),
        description: getCategoryDescription(name),
        subcategories: []
      }));
      
      setCategories(fallbackCategories);
      console.log('✅ Fallback categories processed:', fallbackCategories.length);
    }
  };

  // Filter courses based on search term and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.shortname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.categoryname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    
    // Add category filtering when in courses view
    let matchesCategory = true;
    if (viewMode === 'courses' && selectedCategory) {
      const selectedCat = categories.find(cat => cat.id === selectedCategory);
      if (selectedCat) {
        if (selectedSubcategory) {
          // Filter by subcategory
          const selectedSubcat = selectedCat.subcategories?.find(sub => sub.id === selectedSubcategory);
          if (selectedSubcat) {
            const matchesById = course.categoryid === selectedSubcat.categoryId;
            const matchesByName = course.categoryname === selectedSubcat.name;
            matchesCategory = matchesById || matchesByName;
          }
        } else {
          // Filter by main category (including all subcategories)
          const matchesById = course.categoryid === selectedCat.categoryId;
          const matchesByName = course.categoryname === selectedCat.name;
          const matchesSubcategory = selectedCat.subcategories?.some(sub => 
            course.categoryid === sub.categoryId || course.categoryname === sub.name
          );
          matchesCategory = matchesById || matchesByName || matchesSubcategory;
        }
        
        // Debug logging for first few courses
        if (courses.indexOf(course) < 3) {
          console.log(`🔍 Course "${course.fullname}":`, {
            courseCategoryId: course.categoryid,
            courseCategoryName: course.categoryname,
            selectedCategoryId: selectedCat.categoryId,
            selectedCategoryName: selectedCat.name,
            selectedSubcategory,
            matchesCategory
          });
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const currentCategoryCourses = filteredCourses;

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
    a.download = `admin_courses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminDashboardLayout userName={currentUser?.fullname || "Admin"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
  return (
      <AdminDashboardLayout userName={currentUser?.fullname || "Admin"}>
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
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout userName={currentUser?.fullname || "Admin"}>
      {showCourseDetail && selectedCourseForDetail ? (
        <CourseDetail
          courseId={selectedCourseForDetail.id}
          onBack={() => {
            setShowCourseDetail(false);
            setSelectedCourseForDetail(null);
          }}
        />
      ) : (
        <div className="p-6 space-y-6">
        {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses & Programs</h1>
              <p className="text-gray-600 mt-1">Manage all courses and educational programs</p>
          </div>
                        <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={exportCoursesData}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
        </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
              </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setRefreshing(true);
                fetchCourses().finally(() => setRefreshing(false));
              }}
              variant="outline"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            </div>

          {/* Navigation Breadcrumb */}
          {viewMode !== 'categories' && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={handleBackToCategories}
                className="hover:text-blue-600 hover:underline"
              >
                Categories
              </button>
              {viewMode === 'subcategories' && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{categories.find(cat => cat.id === selectedCategory)?.name}</span>
                </>
              )}
              {viewMode === 'courses' && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{categories.find(cat => cat.id === selectedCategory)?.name}</span>
                  {selectedSubcategory && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span>
                        {categories
                          .find(cat => cat.id === selectedCategory)
                          ?.subcategories?.find(sub => sub.id === selectedSubcategory)?.name}
                      </span>
                    </>
                  )}
                </>
              )}
          </div>
          )}

          {/* Categories Grid */}
          {viewMode === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {/* Category Header */}
                  <div className="relative h-32 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Category Icon */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center border-4 border-white">
                        <div className={`w-8 h-8 bg-gradient-to-br ${category.color} rounded-md flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{category.icon}</span>
              </div>
            </div>
          </div>
              </div>

                  {/* Category Content */}
                  <CardContent className="pt-8 pb-4">
                    <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                      {category.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {category.description}
                    </p>
            <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {category.courseCount} course{category.courseCount !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Subcategories View */}
          {viewMode === 'subcategories' && (
            <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBackToCategories}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Categories</span>
                  </Button>
              <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {categories.find(cat => cat.id === selectedCategory)?.name} - Subcategories
                    </h2>
                    <p className="text-sm text-gray-600">Select a subcategory to view courses</p>
            </div>
          </div>
        </div>

              {/* Subcategory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.find(cat => cat.id === selectedCategory)?.subcategories?.map((subcategory) => (
                  <Card 
                    key={subcategory.id} 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-700 text-white"
                    onClick={() => handleSubcategoryClick(subcategory.id)}
                  >
                    {/* Subcategory Header */}
                    <div className="relative h-40 bg-gradient-to-br from-gray-700 to-gray-800">
                      {/* Abstract Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${subcategory.color} rounded-full blur-lg`}></div>
                        <div className={`absolute bottom-3 right-3 w-16 h-16 bg-gradient-to-tl ${subcategory.color} rounded-full blur-md`}></div>
                </div>

                      {/* Subcategory Icon */}
                      <div className="absolute top-3 left-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${subcategory.color} rounded-lg shadow-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">{subcategory.icon}</span>
                  </div>
                  </div>

                      {/* Course Count Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/20 text-white border-0 text-xs px-2 py-1">
                          {subcategory.courseCount} Courses
                        </Badge>
                  </div>

                      {/* Subcategory Name */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-bold text-white mb-1">{subcategory.name}</h3>
                        <p className="text-xs text-gray-300 line-clamp-2">{subcategory.description}</p>
                  </div>
                </div>

                    {/* Subcategory Footer */}
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">View courses</span>
                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                    </CardContent>
                  </Card>
            ))}
              </div>
          </div>
        )}

          {/* Courses View Header */}
          {viewMode === 'courses' && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (selectedSubcategory) {
                      // Go back to subcategories
                      setSelectedSubcategory('');
                      setViewMode('subcategories');
                    } else {
                      // Go back to categories
                      handleBackToCategories();
                    }
                  }}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{selectedSubcategory ? 'Back to Subcategories' : 'Back to Categories'}</span>
                </Button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedSubcategory 
                      ? categories
                          .find(cat => cat.id === selectedCategory)
                          ?.subcategories?.find(sub => sub.id === selectedSubcategory)?.name
                      : categories.find(cat => cat.id === selectedCategory)?.name
                    } - Courses
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentCategoryCourses.length} course{currentCategoryCourses.length !== 1 ? 's' : ''} available
                  </p>
                </div>
            </div>
          </div>
        )}

          {/* Enhanced Courses Grid */}
          {viewMode === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategoryCourses.map((course) => {
              // Get course image with real data
              const courseImage = course.courseimage ||
                course.overviewfiles?.[0]?.fileurl ||
                getCourseImageFallback(course.categoryname, course.fullname);

              // Calculate course dates
              const startDate = course.startdate ? new Date(course.startdate * 1000) : null;
              const endDate = course.enddate ? new Date(course.enddate * 1000) : null;

              // Get current unit/progress info based on real data
              const currentUnit = course.totalModules && course.progress > 0 
                ? Math.min(Math.ceil(course.progress / 100 * course.totalModules), course.totalModules) 
                : course.progress > 0 ? 1 : 0;
              const unitName = currentUnit > 0 ? getUnitName(course.shortname, currentUnit) : 'Not Started';

              // Determine course status and badges based on real data only
              const isNew = course.startdate && (Date.now() / 1000 - course.startdate) < 30 * 24 * 60 * 60; // 30 days
              const isMandatory = course.categoryname?.toLowerCase().includes('obligatorio') ||
                course.categoryname?.toLowerCase().includes('mandatory') ||
                course.categoryname?.toLowerCase().includes('required');

              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group cursor-pointer" onClick={() => handleCourseClick(course)}>
                  {/* Course Image Header */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <img
                      src={courseImage}
                      alt={course.fullname}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getCourseImageFallback(course.categoryname, course.fullname);
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {isMandatory && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 text-xs px-2 py-1">
                          Obligatorio
                        </Badge>
                      )}
                    
              </div>

                    {/* Course Icon Overlay */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center border-4 border-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        </div>
                      </div>
                    </div>

                  {/* Course Content */}
                  <CardContent className="pt-8 pb-4">
                    {/* Date Range */}
                    {(startDate || endDate) && (
                      <div className="text-xs text-gray-500 mb-2">
                        {startDate && `Inicia ${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        {startDate && endDate && ' | '}
                        {endDate && `Finaliza ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </div>
                    )}

                    {/* Course Title */}
                    <CardTitle className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {course.fullname}
                    </CardTitle>

                    {/* Course Status - Hidden for Admin View */}
                     {/* Progress Info removed for admin view - not relevant for course management */}

                    {/* Course Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description || course.summary || ''}
                    </p>

                    {/* Extra Information */}
                     <div className="space-y-2 mb-4">
                       <div className="flex items-center space-x-2 text-sm">
                         <Info className="w-4 h-4 text-blue-600" />
                         <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                           Course Information
                         </span>
                                </div>
                       <div className="flex items-center space-x-2 text-sm">
                         <Award className="w-4 h-4 text-green-600" />
                         <span className="text-gray-600">
                           Certified by {getCertificationProvider(course)}
                                  </span>
                                </div>
                       {course.enrolledStudents > 0 && (
                         <div className="flex items-center space-x-2 text-sm">
                           <Users className="w-4 h-4 text-purple-600" />
                           <span className="text-gray-600">
                             {course.enrolledStudents} students enrolled
                                  </span>
                         </div>
                                )}
                              </div>

                    {/* Progress Bar - Hidden for Admin View */}
                     {/* Progress bar removed for admin view - not relevant for course management */}

                    {/* Action Button */}
                     <Button 
                       className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                       onClick={(e) => { e.stopPropagation(); handleCourseClick(course); }}
                     >
                       {course.status === 'completed' ? 'View Certificate' : 
                        course.status === 'in_progress' ? 'Continue' : 'Start'} 
                       <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                     </Button>
                  </CardContent>
                </Card>
              );
            })}
                    </div>
          )}

          {viewMode === 'courses' && currentCategoryCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
      )}
    </AdminDashboardLayout>
  );
};

export default Courses; 
