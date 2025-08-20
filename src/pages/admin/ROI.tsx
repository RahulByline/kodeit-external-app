import React, { useState, useEffect } from 'react';
import { 
  Target, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BookOpen, 
  Award,
  Search,
  Filter,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  PieChart
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface ROIMetric {
  id: string;
  name: string;
  category: 'course' | 'program' | 'certification' | 'training';
  investment: number;
  returns: number;
  roi: number;
  period: string;
  status: 'profitable' | 'breakeven' | 'loss';
  students: number;
  completionRate: number;
}

interface ROITrend {
  month: string;
  investment: number;
  returns: number;
  roi: number;
  students: number;
}

const ROI: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<ROIMetric[]>([]);
  const [trends, setTrends] = useState<ROITrend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchROIData();
  }, []);

  const fetchROIData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching ROI data from Moodle API...');
      
      // Get real data from Moodle API with proper error handling
      let users: any[] = [];
      let courses: any[] = [];
      
      try {
        const [usersResult, coursesResult] = await Promise.all([
          moodleService.getAllUsers(),
          moodleService.getAllCourses()
        ]);
        
        users = Array.isArray(usersResult) ? usersResult : [];
        courses = Array.isArray(coursesResult) ? coursesResult : [];
      } catch (apiError) {
        console.error('❌ Failed to fetch data from IOMAD API:', apiError);
        users = [];
        courses = [];
      }

      // Generate ROI metrics from real course data (or empty if no data)
      const realMetrics: ROIMetric[] = courses.slice(0, 8).map((course, index) => {
        // Use basic estimation for ROI calculations based on course enrollment
        const enrollmentCount = (course as any).enrollmentCount || (course as any).enrolledusercount || 0;
        const estimatedInvestment = enrollmentCount * 500; // $500 per student investment
        const estimatedReturns = enrollmentCount * 750; // $750 per student return
        const roi = estimatedInvestment > 0 ? ((estimatedReturns - estimatedInvestment) / estimatedInvestment) * 100 : 0;
        const status = roi > 0 ? 'profitable' : roi === 0 ? 'breakeven' : 'loss';
        
        return {
          id: String(course.id || index + 1),
          name: course.fullname || `Course ${index + 1}`,
          category: 'course' as any,
          investment: estimatedInvestment,
          returns: estimatedReturns,
          roi: Math.round(roi * 100) / 100,
          period: 'Last 12 months',
          status,
          students: enrollmentCount,
          completionRate: (course as any).completionrate || 75
        };
      });

      // Generate basic trends based on real data (empty if no courses)
      const realTrends: ROITrend[] = courses.length > 0 ? Array.from({ length: 12 }, (_, index) => {
        const month = new Date(2024, index, 1).toLocaleDateString('en-US', { month: 'short' });
        const totalStudents = users.filter(u => u.role === 'student').length;
        const monthlyStudents = Math.ceil(totalStudents / 12);
        const investment = monthlyStudents * 500;
        const returns = monthlyStudents * 750;
        const roi = investment > 0 ? ((returns - investment) / investment) * 100 : 0;
        
        return {
          month,
          investment,
          returns,
          roi: Math.round(roi * 100) / 100,
          students: monthlyStudents
        };
      }) : [];

      setMetrics(realMetrics);
      setTrends(realTrends);

      console.log(`✅ Processed ${realMetrics.length} ROI metrics and ${realTrends.length} trend data points`);
    } catch (error) {
      console.error('❌ Error fetching ROI data:', error);
      setError('Failed to fetch ROI data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'profitable':
        return 'bg-green-100 text-green-800';
      case 'breakeven':
        return 'bg-yellow-100 text-yellow-800';
      case 'loss':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getROIColor = (roi: number) => {
    if (roi > 0) return 'text-green-600';
    if (roi === 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalInvestment = metrics.reduce((sum, m) => sum + m.investment, 0);
  const totalReturns = metrics.reduce((sum, m) => sum + m.returns, 0);
  const overallROI = totalInvestment > 0 ? ((totalReturns - totalInvestment) / totalInvestment) * 100 : 0;
  const totalStudents = metrics.reduce((sum, m) => sum + m.students, 0);

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin User"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading ROI analysis...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin User"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ROI Analysis</h1>
            <p className="text-gray-600 mt-1">Return on investment analysis for educational programs and courses</p>
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

        {/* ROI Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Investment</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">${totalInvestment.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <DollarSign className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 text-sm font-medium">All programs</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Returns</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">${totalReturns.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">Revenue generated</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Overall ROI</p>
                <h3 className={`text-2xl font-bold mt-1 ${getROIColor(overallROI)}`}>{Math.round(overallROI * 100) / 100}%</h3>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 text-sm font-medium">Net profit margin</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalStudents.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 text-sm font-medium">Enrolled</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ROI Metrics by Program */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">ROI by Program</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="course">Courses</option>
                  <option value="program">Programs</option>
                  <option value="certification">Certifications</option>
                  <option value="training">Training</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMetrics.length > 0 ? (
                filteredMetrics.map((metric) => (
                  <div key={metric.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{metric.category}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Investment:</span> ${metric.investment.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Returns:</span> ${metric.returns.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Students:</span> {metric.students}
                      </div>
                      <div>
                        <span className="font-medium">Completion:</span> {metric.completionRate}%
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                        <div 
                          className={`h-2 rounded-full ${metric.roi > 0 ? 'bg-green-600' : metric.roi === 0 ? 'bg-yellow-600' : 'bg-red-600'}`}
                          style={{ width: `${Math.min(Math.abs(metric.roi), 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${getROIColor(metric.roi)}`}>
                        {metric.roi}% ROI
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No programs found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* ROI Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">ROI Trends (12 Months)</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trends.length > 0 ? (
                trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{trend.month}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{trend.students} students</p>
                        <p className="text-xs text-gray-500">${trend.investment.toLocaleString()} invested</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${getROIColor(trend.roi)}`}>
                          {trend.roi}% ROI
                        </span>
                        <span className="text-xs text-gray-500">
                          ${trend.returns.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Returns</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No trend data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROI Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">ROI Insights</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.filter(m => m.status === 'profitable').length}</div>
              <div className="text-sm text-gray-600">Profitable Programs</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(metrics.reduce((sum, m) => sum + m.completionRate, 0) / metrics.length)}%</div>
              <div className="text-sm text-gray-600">Avg Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${Math.round((totalReturns - totalInvestment) / 1000)}k</div>
              <div className="text-sm text-gray-600">Net Profit</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{Math.round(totalStudents / metrics.length)}</div>
              <div className="text-sm text-gray-600">Avg Students per Program</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ROI;
