import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle,
  BarChart3,
  Search,
  Filter,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  Star,
  Target,
  Award,
  XCircle,
  Clock as ClockIcon
} from 'lucide-react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface AssessmentStats {
  totalAssessments: number;
  activeAssessments: number;
  completedAssessments: number;
  averageScore: number;
  passRate: number;
  newAssessmentsThisMonth: number;
  totalParticipants: number;
  averageCompletionTime: number;
}

interface Assessment {
  assessmentId: string;
  assessmentName: string;
  courseName: string;
  category: string;
  totalQuestions: number;
  timeLimit: number; // in minutes
  totalParticipants: number;
  completedParticipants: number;
  averageScore: number;
  passRate: number;
  lastTaken: string;
  status: 'active' | 'draft' | 'archived';
}

interface AssessmentResult {
  resultId: string;
  studentName: string;
  assessmentName: string;
  courseName: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'passed' | 'failed' | 'in_progress';
  timeTaken: number; // in minutes
  completedAt: string;
  attempts: number;
}

const Assessments: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AssessmentStats>({
    totalAssessments: 0,
    activeAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
    passRate: 0,
    newAssessmentsThisMonth: 0,
    totalParticipants: 0,
    averageCompletionTime: 0
  });
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch real assessment data from Moodle API
      const [realAssessments, users, courses, categories] = await Promise.all([
        moodleService.getRealAssessments(),
        moodleService.getAllUsers(),
        moodleService.getAllCourses(),
        moodleService.getCourseCategories()
      ]);

      console.log('📊 Real assessments data fetched:', {
        assessments: realAssessments.length,
        users: users.length,
        courses: courses.length,
        categories: categories.length
      });

      // Process real assessments
      const assessmentsData: Assessment[] = realAssessments.map(assessment => {
        const course = courses.find(c => c.id === assessment.courseId);
        const category = categories.find(cat => cat.id === course?.categoryid)?.name || 'General';
        
        return {
          assessmentId: assessment.id.toString(),
          assessmentName: assessment.name,
          courseName: assessment.courseName || course?.fullname || 'Unknown Course',
          category,
          type: assessment.type === 'quiz' ? 'quiz' : 
                assessment.type === 'assign' ? 'assignment' : 
                assessment.type === 'workshop' ? 'workshop' : 'survey',
          status: assessment.visible ? 'active' : 'inactive',
          totalParticipants: 0, // Will be calculated from results
          completedParticipants: 0, // Will be calculated from results
          averageScore: 0, // Will be calculated from results
          passRate: 0, // Will be calculated from results
          totalQuestions: 0, // Not available in basic module data
          timeLimit: assessment.timeLimit || 0,
          lastTaken: new Date(assessment.timemodified * 1000).toISOString(),
          createdAt: new Date(assessment.timecreated * 1000).toISOString()
        };
      });

      // Get assessment results for each assessment
      const resultsData: AssessmentResult[] = [];
      
      for (const assessment of realAssessments) {
        try {
          let assessmentResults = [];
          
          if (assessment.type === 'quiz') {
            assessmentResults = await moodleService.getAssessmentResults(assessment.id.toString());
          } else if (assessment.type === 'assign') {
            assessmentResults = await moodleService.getAssignmentSubmissions(assessment.id.toString());
          }

          // Process results
          assessmentResults.forEach((result, index) => {
            const user = users.find(u => u.id === result.userid);
            const score = result.sumgrades || 0;
            const maxScore = 100; // Default max score
            const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
            const status = percentage >= 70 ? 'passed' : 'failed';
            
            resultsData.push({
              resultId: `RESULT-${assessment.id}-${index + 1}`,
              studentName: user?.fullname || 'Unknown Student',
              assessmentName: assessment.name,
              courseName: assessment.courseName,
              score,
              maxScore,
              percentage,
              status,
              timeTaken: result.timefinish && result.timestart ? 
                (result.timefinish - result.timestart) / 60 : 0, // Convert to minutes
              completedAt: result.timefinish ? 
                new Date(result.timefinish * 1000).toISOString() : 
                new Date().toISOString(),
              attempts: result.attempt || 1
            });
          });
        } catch (error) {
          console.warn(`Failed to get results for assessment ${assessment.id}:`, error);
        }
      }

      // Calculate overall statistics from real data
      const totalAssessments = assessmentsData.length;
      const activeAssessments = assessmentsData.filter(a => a.status === 'active').length;
      const completedAssessments = resultsData.length;
      const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const newAssessmentsThisMonth = assessmentsData.filter(a => 
        new Date(a.lastTaken).getTime() > oneMonthAgo
      ).length;

      const totalParticipants = resultsData.length;
      const averageScore = totalParticipants > 0 ? 
        Math.round(resultsData.reduce((sum, r) => sum + r.percentage, 0) / totalParticipants) : 0;
      const passRate = totalParticipants > 0 ? 
        Math.round((resultsData.filter(r => r.status === 'passed').length / totalParticipants) * 100) : 0;

      // Update assessment data with calculated statistics
      assessmentsData.forEach(assessment => {
        const assessmentResults = resultsData.filter(r => r.assessmentName === assessment.assessmentName);
        assessment.totalParticipants = assessmentResults.length;
        assessment.completedParticipants = assessmentResults.length;
        assessment.averageScore = assessmentResults.length > 0 ? 
          Math.round(assessmentResults.reduce((sum, r) => sum + r.percentage, 0) / assessmentResults.length) : 0;
        assessment.passRate = assessmentResults.length > 0 ? 
          Math.round((assessmentResults.filter(r => r.status === 'passed').length / assessmentResults.length) * 100) : 0;
      });

      setStats({
        totalAssessments,
        activeAssessments,
        completedAssessments,
        newAssessmentsThisMonth,
        totalParticipants,
        averageScore,
        passRate,
        averageCompletionTime: 45 // Default value since not available in API
      });

      setAssessments(assessmentsData);
      setAssessmentResults(resultsData);

    } catch (error) {
      console.error('Error fetching assessment data:', error);
      setError('Failed to fetch assessment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = assessmentResults.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.assessmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || result.courseName === filterCourse;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <AdminDashboardLayout userName={currentUser?.fullname || "Admin User"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading assessment data...</span>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout userName={currentUser?.fullname || "Admin User"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
            <p className="text-gray-600 mt-1">Track assessments, quiz results, and student performance</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Assessment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Assessments</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAssessments.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+{stats.newAssessmentsThisMonth}</span>
                  <span className="text-gray-500 text-sm ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Assessments</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeAssessments.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">{Math.round((stats.activeAssessments / stats.totalAssessments) * 100)}%</span>
                  <span className="text-gray-500 text-sm ml-1">of total</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Average Score</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.averageScore}%</h3>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 text-sm font-medium">{stats.passRate}%</span>
                  <span className="text-gray-500 text-sm ml-1">pass rate</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Participants</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalParticipants.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 text-sm font-medium">{stats.averageCompletionTime}m</span>
                  <span className="text-gray-500 text-sm ml-1">avg time</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assessment Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Assessment Overview</h2>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {assessments.map((assessment, index) => (
                <div key={assessment.assessmentId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{assessment.assessmentName}</h3>
                      <p className="text-xs text-gray-500">{assessment.courseName} • {assessment.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assessment.status === 'active' ? 'bg-green-100 text-green-800' :
                      assessment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assessment.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span>{assessment.totalQuestions} questions</span>
                    <span>{assessment.timeLimit}m time limit</span>
                    <span>{assessment.completedParticipants}/{assessment.totalParticipants} completed</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${assessment.passRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Pass rate: {assessment.passRate}%</p>
                    <p className={`text-xs font-medium ${getScoreColor(assessment.averageScore)}`}>
                      Avg score: {assessment.averageScore}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Results</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students or assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Results</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredResults.slice(0, 10).map((result, index) => (
                <div key={result.resultId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.studentName}</p>
                      <p className="text-xs text-gray-500">{result.assessmentName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                      <span className={`text-sm font-semibold ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {result.score}/{result.maxScore} • {result.timeTaken}m • {result.attempts} attempts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assessment Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Assessment Insights</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.completedAssessments}</div>
              <div className="text-sm text-gray-600">Completed Assessments</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(stats.averageCompletionTime / 60 * 10) / 10}</div>
              <div className="text-sm text-gray-600">Avg Hours to Complete</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalParticipants / stats.totalAssessments)}</div>
              <div className="text-sm text-gray-600">Avg Participants per Assessment</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{Math.round((stats.passRate / 100) * stats.completedAssessments)}</div>
              <div className="text-sm text-gray-600">Successful Completions</div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default Assessments; 