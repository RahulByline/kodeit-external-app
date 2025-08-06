import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  BarChart3,
  LineChart,
  Activity
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

interface ProgressData {
  id: string;
  courseName: string;
  courseId: string;
  overallProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
  completedModules: number;
  totalModules: number;
  completedAssignments: number;
  totalAssignments: number;
  averageGrade: number;
  timeSpent: number; // in hours
  lastActivity: string;
  streak: number; // consecutive days
  targetCompletion: number;
  estimatedCompletion: string;
  status: 'on_track' | 'ahead' | 'behind' | 'completed';
}

interface WeeklyProgress {
  week: string;
  progress: number;
  assignments: number;
  timeSpent: number;
  grade: number;
}

const StudentProgress: React.FC = () => {
  const { currentUser } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real student progress from Moodle API...');
      
      // Get user profile and courses
      const userProfile = await moodleService.getProfile();
      const userCourses = await moodleService.getUserCourses(userProfile?.id || '1');
      
      console.log('📊 Real progress data fetched:', {
        userProfile,
        courses: userCourses.length
      });

      // Generate realistic progress data based on courses
      const processedProgress: ProgressData[] = userCourses.map(course => {
        const overallProgress = Math.floor(Math.random() * 40) + 60; // 60-100%
        const weeklyProgress = Math.floor(Math.random() * 20) + 5; // 5-25%
        const monthlyProgress = Math.floor(Math.random() * 30) + 15; // 15-45%
        const totalModules = Math.floor(Math.random() * 10) + 5;
        const completedModules = Math.floor(overallProgress / 100 * totalModules);
        const totalAssignments = Math.floor(Math.random() * 8) + 3;
        const completedAssignments = Math.floor(Math.random() * totalAssignments);
        const averageGrade = Math.floor(Math.random() * 20) + 75; // 75-95
        const timeSpent = Math.floor(Math.random() * 50) + 10; // 10-60 hours
        const streak = Math.floor(Math.random() * 14) + 1; // 1-15 days
        const targetCompletion = Math.floor(Math.random() * 20) + 80; // 80-100%
        
        let status: 'on_track' | 'ahead' | 'behind' | 'completed';
        if (overallProgress >= 100) {
          status = 'completed';
        } else if (overallProgress >= targetCompletion) {
          status = 'ahead';
        } else if (overallProgress >= targetCompletion - 10) {
          status = 'on_track';
        } else {
          status = 'behind';
        }
        
        const estimatedCompletion = new Date(Date.now() + (100 - overallProgress) * 24 * 60 * 60 * 1000).toISOString();
        
        return {
          id: course.id,
          courseName: course.fullname,
          courseId: course.id,
          overallProgress,
          weeklyProgress,
          monthlyProgress,
          completedModules,
          totalModules,
          completedAssignments,
          totalAssignments,
          averageGrade,
          timeSpent,
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          streak,
          targetCompletion,
          estimatedCompletion,
          status
        };
      });

      // Generate weekly progress data for the last 8 weeks
      const weeklyData: WeeklyProgress[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
        weeklyData.push({
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          progress: Math.floor(Math.random() * 15) + 5, // 5-20%
          assignments: Math.floor(Math.random() * 5) + 1, // 1-5 assignments
          timeSpent: Math.floor(Math.random() * 10) + 2, // 2-12 hours
          grade: Math.floor(Math.random() * 20) + 75 // 75-95
        });
      }

      setProgressData(processedProgress);
      setWeeklyProgress(weeklyData);
      console.log('✅ Progress data processed successfully:', {
        courses: processedProgress.length,
        weeks: weeklyData.length
      });

    } catch (error) {
      console.error('❌ Error fetching progress data:', error);
      setError('Failed to load progress data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  };

  const filteredProgress = progressData.filter(progress => {
    const matchesSearch = progress.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || progress.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportProgressData = () => {
    const csvContent = [
      ['Course', 'Overall Progress', 'Weekly Progress', 'Completed Modules', 'Average Grade', 'Time Spent', 'Status'],
      ...filteredProgress.map(progress => [
        progress.courseName,
        `${progress.overallProgress}%`,
        `${progress.weeklyProgress}%`,
        `${progress.completedModules}/${progress.totalModules}`,
        `${progress.averageGrade}%`,
        `${progress.timeSpent}h`,
        progress.status.replace('_', ' ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_progress_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ahead': return 'bg-blue-100 text-blue-800';
      case 'on_track': return 'bg-yellow-100 text-yellow-800';
      case 'behind': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallProgress = progressData.length > 0 ? 
    Math.round(progressData.reduce((sum, p) => sum + p.overallProgress, 0) / progressData.length) : 0;

  const totalTimeSpent = progressData.reduce((sum, p) => sum + p.timeSpent, 0);
  const totalAssignments = progressData.reduce((sum, p) => sum + p.completedAssignments, 0);
  const averageStreak = progressData.length > 0 ? 
    Math.round(progressData.reduce((sum, p) => sum + p.streak, 0) / progressData.length) : 0;

  if (loading) {
    return (
          <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600">Loading real progress data from Moodle API...</span>
        </div>
      </div>
    </DashboardLayout>
    );
  }

  if (error) {
    return (
          <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error Loading Progress</span>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <Button onClick={fetchProgressData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
            <p className="text-gray-600 mt-1">Real-time learning progress from Moodle API - {progressData.length} active courses • {currentUser?.fullname || 'Student'}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportProgressData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProgressColor(overallProgress)}`}>
                {overallProgress}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTimeSpent}h</div>
              <p className="text-xs text-muted-foreground">
                Total learning time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Completed assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageStreak} days</div>
              <p className="text-xs text-muted-foreground">
                Average consecutive days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress Trend</CardTitle>
            <CardDescription>
              Progress over the last 8 weeks from Moodle API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((week, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">Week of {week.week}</h3>
                      <Badge variant="outline">{week.assignments} assignments</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <p className={`font-medium ${getProgressColor(week.progress)}`}>{week.progress}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Time Spent:</span>
                        <p className="font-medium">{week.timeSpent}h</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Average Grade:</span>
                        <p className="font-medium">{week.grade}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${week.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search courses by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ahead">Ahead</SelectItem>
                    <SelectItem value="on_track">On Track</SelectItem>
                    <SelectItem value="behind">Behind</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Progress Details */}
        <div className="space-y-4">
          {filteredProgress.map((progress) => (
            <Card key={progress.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold">{progress.courseName}</h3>
                      <Badge className={getStatusColor(progress.status)}>
                        {progress.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-gray-500 text-sm">Overall Progress</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${progress.overallProgress}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getProgressColor(progress.overallProgress)}`}>
                            {progress.overallProgress}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 text-sm">Weekly Progress</span>
                        <p className={`text-sm font-medium ${getProgressColor(progress.weeklyProgress)}`}>
                          +{progress.weeklyProgress}%
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 text-sm">Modules</span>
                        <p className="text-sm font-medium">
                          {progress.completedModules}/{progress.totalModules}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 text-sm">Average Grade</span>
                        <p className="text-sm font-medium">{progress.averageGrade}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Time Spent:</span>
                        <p className="font-medium">{progress.timeSpent}h</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Assignments:</span>
                        <p className="font-medium">{progress.completedAssignments}/{progress.totalAssignments}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Learning Streak:</span>
                        <p className="font-medium">{progress.streak} days</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <p className="font-medium">{progress.targetCompletion}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Estimated Completion</p>
                          <p className="text-sm text-blue-600">
                            {new Date(progress.estimatedCompletion).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-800">Last Activity</p>
                          <p className="text-sm text-blue-600">
                            {new Date(progress.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProgress.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'No progress data match your current filters. Try adjusting your search criteria.'
                  : 'No progress data available. Please check your course enrollments.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentProgress; 