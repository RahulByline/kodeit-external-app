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
  PieChart,
  LineChart,
  Activity,
  Globe
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface ReportStats {
  totalReports: number;
  generatedThisMonth: number;
  averageGenerationTime: number;
  mostPopularReport: string;
  totalDownloads: number;
  activeSubscriptions: number;
  reportAccuracy: number;
  dataFreshness: number;
}

interface Report {
  reportId: string;
  reportName: string;
  category: string;
  description: string;
  lastGenerated: string;
  nextScheduled: string;
  status: 'active' | 'draft' | 'archived';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  size: string;
  downloads: number;
  subscribers: number;
}

interface ReportData {
  dataId: string;
  reportName: string;
  dataType: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

const Reports: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    generatedThisMonth: 0,
    averageGenerationTime: 0,
    mostPopularReport: '',
    totalDownloads: 0,
    activeSubscriptions: 0,
    reportAccuracy: 0,
    dataFreshness: 0
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all users and courses for report data
      const [users, courses, categories] = await Promise.all([
        moodleService.getAllUsers(),
        moodleService.getAllCourses(),
        moodleService.getCourseCategories()
      ]);

      // Generate reports based on available data
      const reportsData: Report[] = [
        {
          reportId: '1',
          reportName: 'User Activity Report',
          category: 'User Analytics',
          description: 'Comprehensive analysis of user engagement and activity patterns',
          lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          format: 'pdf',
          size: '2.4 MB',
          downloads: 45,
          subscribers: 12
        },
        {
          reportId: '2',
          reportName: 'Course Performance Report',
          category: 'Course Analytics',
          description: 'Detailed analysis of course completion rates and student performance',
          lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          format: 'excel',
          size: '1.8 MB',
          downloads: 38,
          subscribers: 8
        },
        {
          reportId: '3',
          reportName: 'Certification Summary',
          category: 'Certifications',
          description: 'Overview of certification programs and completion statistics',
          lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          format: 'pdf',
          size: '1.2 MB',
          downloads: 32,
          subscribers: 15
        },
        {
          reportId: '4',
          reportName: 'Assessment Results Report',
          category: 'Assessments',
          description: 'Analysis of assessment performance and student outcomes',
          lastGenerated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          format: 'csv',
          size: '3.1 MB',
          downloads: 28,
          subscribers: 6
        },
        {
          reportId: '5',
          reportName: 'Enrollment Trends',
          category: 'Enrollments',
          description: 'Monthly enrollment trends and growth analysis',
          lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          format: 'excel',
          size: '2.7 MB',
          downloads: 41,
          subscribers: 18
        },
        {
          reportId: '6',
          reportName: 'ROI Analysis Report',
          category: 'Financial',
          description: 'Return on investment analysis for training programs',
          lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft',
          format: 'pdf',
          size: '4.2 MB',
          downloads: 15,
          subscribers: 5
        }
      ];

      // Generate report data insights
      const dataInsights: ReportData[] = [
        {
          dataId: '1',
          reportName: 'User Activity Report',
          dataType: 'Active Users',
          value: users.length,
          previousValue: Math.floor(users.length * 0.9),
          change: 10,
          trend: 'up',
          timestamp: new Date().toISOString()
        },
        {
          dataId: '2',
          reportName: 'Course Performance Report',
          dataType: 'Course Completion Rate',
          value: 78,
          previousValue: 72,
          change: 6,
          trend: 'up',
          timestamp: new Date().toISOString()
        },
        {
          dataId: '3',
          reportName: 'Certification Summary',
          dataType: 'Certifications Issued',
          value: Math.floor(users.length * 0.3),
          previousValue: Math.floor(users.length * 0.25),
          change: 5,
          trend: 'up',
          timestamp: new Date().toISOString()
        },
        {
          dataId: '4',
          reportName: 'Assessment Results Report',
          dataType: 'Average Score',
          value: 82,
          previousValue: 79,
          change: 3,
          trend: 'up',
          timestamp: new Date().toISOString()
        },
        {
          dataId: '5',
          reportName: 'Enrollment Trends',
          dataType: 'New Enrollments',
          value: Math.floor(users.length * 0.15),
          previousValue: Math.floor(users.length * 0.12),
          change: 3,
          trend: 'up',
          timestamp: new Date().toISOString()
        }
      ];

      // Calculate overall statistics
      const totalReports = reportsData.length;
      const generatedThisMonth = reportsData.filter(r => 
        new Date(r.lastGenerated).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length;
      const totalDownloads = reportsData.reduce((sum, r) => sum + r.downloads, 0);
      const activeSubscriptions = reportsData.reduce((sum, r) => sum + r.subscribers, 0);
      const mostPopularReport = reportsData.reduce((prev, current) => 
        prev.downloads > current.downloads ? prev : current
      ).reportName;

      setStats({
        totalReports,
        generatedThisMonth,
        averageGenerationTime: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        mostPopularReport,
        totalDownloads,
        activeSubscriptions,
        reportAccuracy: 98,
        dataFreshness: 95
      });

      setReports(reportsData);
      setReportData(dataInsights);

    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data. Using fallback data.');
      
      // Set fallback data
      setStats({
        totalReports: 6,
        generatedThisMonth: 4,
        averageGenerationTime: 25,
        mostPopularReport: 'User Activity Report',
        totalDownloads: 199,
        activeSubscriptions: 64,
        reportAccuracy: 98,
        dataFreshness: 95
      });

      setReports([
        {
          reportId: '1',
          reportName: 'User Activity Report',
          category: 'User Analytics',
          description: 'Comprehensive analysis of user engagement and activity patterns',
          lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          format: 'pdf',
          size: '2.4 MB',
          downloads: 45,
          subscribers: 12
        }
      ]);

      setReportData([
        {
          dataId: '1',
          reportName: 'User Activity Report',
          dataType: 'Active Users',
          value: 150,
          previousValue: 135,
          change: 15,
          trend: 'up',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'excel':
        return <BarChart3 className="w-4 h-4 text-green-500" />;
      case 'csv':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin User"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading report data...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive reports and data insights</p>
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

        {/* Report Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Reports</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReports.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+{stats.generatedThisMonth}</span>
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
                <p className="text-gray-500 text-sm font-medium">Total Downloads</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDownloads.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <Download className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">{stats.activeSubscriptions}</span>
                  <span className="text-gray-500 text-sm ml-1">active subscribers</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Report Accuracy</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.reportAccuracy}%</h3>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 text-sm font-medium">{stats.dataFreshness}%</span>
                  <span className="text-gray-500 text-sm ml-1">data freshness</span>
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
                <p className="text-gray-500 text-sm font-medium">Avg Generation Time</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.averageGenerationTime}m</h3>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 text-sm font-medium">Most Popular</span>
                  <span className="text-gray-500 text-sm ml-1">: {stats.mostPopularReport}</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search reports..."
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
                  <option value="User Analytics">User Analytics</option>
                  <option value="Course Analytics">Course Analytics</option>
                  <option value="Certifications">Certifications</option>
                  <option value="Assessments">Assessments</option>
                  <option value="Enrollments">Enrollments</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredReports.map((report, index) => (
                <div key={report.reportId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {getFormatIcon(report.format)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{report.reportName}</h3>
                        <p className="text-xs text-gray-500">{report.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3">{report.description}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{report.size}</span>
                    <span>{report.downloads} downloads</span>
                    <span>{report.subscribers} subscribers</span>
                    <span>Next: {formatDate(report.nextScheduled)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Generate
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Report Insights</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reportData.map((data, index) => (
                <div key={data.dataId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{data.reportName}</h3>
                      <p className="text-xs text-gray-500">{data.dataType}</p>
                    </div>
                    {getTrendIcon(data.trend)}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{data.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{data.previousValue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Previous</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${data.change > 0 ? 'text-green-600' : data.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {data.change > 0 ? '+' : ''}{data.change}%
                      </p>
                      <p className="text-xs text-gray-500">Change</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Report Analytics</h2>
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-gray-400" />
              <LineChart className="w-5 h-5 text-gray-400" />
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round(stats.totalDownloads / stats.totalReports)}</div>
              <div className="text-sm text-gray-600">Avg Downloads per Report</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(stats.activeSubscriptions / stats.totalReports)}</div>
              <div className="text-sm text-gray-600">Avg Subscribers per Report</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round((stats.generatedThisMonth / stats.totalReports) * 100)}%</div>
              <div className="text-sm text-gray-600">Reports Generated This Month</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{Math.round((stats.totalDownloads / (stats.totalReports * 50)) * 100)}%</div>
              <div className="text-sm text-gray-600">Download Rate</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports; 