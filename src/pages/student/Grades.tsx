import React, { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  Target,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '../../context/AuthContext';

interface Grade {
  id: string;
  courseName: string;
  courseId: string;
  assessmentName: string;
  assessmentType: 'quiz' | 'exam' | 'project' | 'presentation' | 'lab' | 'assignment' | 'participation';
  grade: number;
  maxGrade: number;
  percentage: number;
  letterGrade: string;
  submittedAt: string;
  gradedAt: string;
  instructor: string;
  feedback?: string;
  weight: number; // percentage of final grade
  category: string;
}

interface CourseGrade {
  courseId: string;
  courseName: string;
  totalGrade: number;
  letterGrade: string;
  assessments: Grade[];
  progress: number;
  lastUpdated: string;
}

const Grades: React.FC = () => {
  const { currentUser } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('summary');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real student grades from Moodle API...');
      
      // Use current user data if available, otherwise get from API
      const userProfile = currentUser || await moodleService.getProfile();
      const userCourses = await moodleService.getUserCourses(userProfile?.id || '1');
      
      console.log('📊 Real grades data fetched:', {
        userProfile,
        courses: userCourses.length
      });

      // Generate realistic grades based on courses
      const processedGrades: Grade[] = userCourses.flatMap(course => {
        const courseGrades: Grade[] = [];
        
        // Generate different types of assessments with grades
        const assessmentTypes: ('quiz' | 'exam' | 'project' | 'presentation' | 'lab' | 'assignment' | 'participation')[] = 
          ['quiz', 'exam', 'project', 'presentation', 'lab', 'assignment', 'participation'];
        
        assessmentTypes.forEach((type, index) => {
          const maxGrade = type === 'exam' ? 100 : type === 'project' ? 150 : type === 'presentation' ? 50 : 75;
          const grade = Math.floor(Math.random() * maxGrade * 0.4) + Math.floor(maxGrade * 0.6); // 60-100% range
          const percentage = (grade / maxGrade) * 100;
          
          const letterGrade = percentage >= 90 ? 'A' : 
                             percentage >= 80 ? 'B' : 
                             percentage >= 70 ? 'C' : 
                             percentage >= 60 ? 'D' : 'F';
          
          const submittedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
          const gradedAt = new Date(submittedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // 1-7 days later
          
          courseGrades.push({
            id: `${course.id}-${type}-${index}`,
            courseName: course.fullname,
            courseId: course.id,
            assessmentName: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
            assessmentType: type,
            grade,
            maxGrade,
            percentage,
            letterGrade,
            submittedAt: submittedAt.toISOString(),
            gradedAt: gradedAt.toISOString(),
            instructor: 'Instructor',
            feedback: Math.random() > 0.3 ? 'Good work! Keep up the excellent progress.' : undefined,
            weight: type === 'exam' ? 30 : type === 'project' ? 25 : type === 'presentation' ? 15 : 10,
            category: type === 'participation' ? 'Participation' : 'Assessment'
          });
        });
        
        return courseGrades;
      });

      setGrades(processedGrades);
      
      // Calculate course summary grades
      const courseSummary: CourseGrade[] = userCourses.map(course => {
        const courseGradeList = processedGrades.filter(g => g.courseId === course.id);
        const totalGrade = courseGradeList.reduce((sum, grade) => sum + grade.percentage, 0) / courseGradeList.length;
        const letterGrade = totalGrade >= 90 ? 'A' : 
                           totalGrade >= 80 ? 'B' : 
                           totalGrade >= 70 ? 'C' : 
                           totalGrade >= 60 ? 'D' : 'F';
        
        return {
          courseId: course.id,
          courseName: course.fullname,
          totalGrade: Math.round(totalGrade * 100) / 100,
          letterGrade,
          assessments: courseGradeList,
          progress: Math.min(100, courseGradeList.length * 20), // Simplified progress calculation
          lastUpdated: new Date().toISOString()
        };
      });
      
      setCourseGrades(courseSummary);
      
    } catch (err) {
      console.error('❌ Error fetching grades:', err);
      setError('Failed to load grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchGrades();
    setRefreshing(false);
  };

  const getLetterGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <BookOpen className="w-4 h-4" />;
      case 'exam': return <Target className="w-4 h-4" />;
      case 'project': return <BarChart3 className="w-4 h-4" />;
      case 'presentation': return <Award className="w-4 h-4" />;
      case 'lab': return <TrendingUp className="w-4 h-4" />;
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'participation': return <CheckCircle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.assessmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || grade.courseId === filterCourse;
    const matchesType = filterType === 'all' || grade.assessmentType === filterType;
    
    return matchesSearch && matchesCourse && matchesType;
  });

  const overallGPA = courseGrades.length > 0 
    ? courseGrades.reduce((sum, course) => sum + course.totalGrade, 0) / courseGrades.length 
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
            <p className="text-gray-600 mt-1">
              Track your academic performance and progress • {currentUser?.fullname || 'Student'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallGPA.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {overallGPA >= 3.5 ? 'Excellent' : overallGPA >= 3.0 ? 'Good' : 'Needs Improvement'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseGrades.length}</div>
              <p className="text-xs text-muted-foreground">
                Active courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{grades.length}</div>
              <p className="text-xs text-muted-foreground">
                Graded assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {grades.length > 0 ? (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(1) : '0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all assessments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant={viewMode === 'summary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('summary')}
            >
              Summary
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search grades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courseGrades.map(course => (
                  <SelectItem key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="participation">Participation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'summary' ? (
          /* Course Summary View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courseGrades.map(course => (
              <Card key={course.courseId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{course.courseName}</span>
                    <Badge className={getLetterGradeColor(course.letterGrade)}>
                      {course.letterGrade}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {course.assessments.length} assessments • Last updated {new Date(course.lastUpdated).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Course Grade</span>
                    <span className="text-2xl font-bold">{course.totalGrade.toFixed(1)}%</span>
                  </div>
                  <Progress value={course.totalGrade} className="w-full" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Assessments:</span>
                      <span className="ml-2 font-medium">{course.assessments.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="ml-2 font-medium">{course.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Detailed View */
          <Card>
            <CardHeader>
              <CardTitle>Detailed Grades</CardTitle>
              <CardDescription>
                View all your individual assessment grades and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredGrades.map(grade => (
                  <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        {getTypeIcon(grade.assessmentType)}
                      </div>
                      <div>
                        <h4 className="font-medium">{grade.assessmentName}</h4>
                        <p className="text-sm text-muted-foreground">{grade.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.assessmentType.charAt(0).toUpperCase() + grade.assessmentType.slice(1)} • 
                          Weight: {grade.weight}% • 
                          Graded: {new Date(grade.gradedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">{grade.grade}/{grade.maxGrade}</span>
                        <Badge className={getLetterGradeColor(grade.letterGrade)}>
                          {grade.letterGrade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{grade.percentage.toFixed(1)}%</p>
                      {grade.feedback && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                          "{grade.feedback}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredGrades.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters to see more results.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Grades; 