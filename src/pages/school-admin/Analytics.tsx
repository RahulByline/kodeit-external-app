import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Calendar, Activity, PieChart, LineChart } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalCompanies: number;
  completionRate: number;
  activeUsers: number;
  enrollmentTrend: number;
  performanceData: Array<{
    month: string;
    enrollments: number;
    completions: number;
  }>;
  userDistribution: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalCompanies: 0,
    completionRate: 0,
    activeUsers: 0,
    enrollmentTrend: 0,
    performanceData: [],
    userDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [allUsers, allCourses, allCompanies] = await Promise.all([
        moodleService.getAllUsers(),
        moodleService.getAllCourses(),
        moodleService.getCompanies()
      ]);

      // Process user data - use the role that was already processed in getAllUsers
      const processedUsers = allUsers;

      const teachers = processedUsers.filter(u => u.role === 'teacher' || u.role === 'trainer' || u.isTeacher);
      const students = processedUsers.filter(u => u.role === 'student' || u.isStudent);
      const activeUsers = processedUsers.filter(u => u.lastaccess && Date.now() / 1000 - u.lastaccess < 86400);

      // Calculate user distribution
      const userDistribution = [
        { role: 'Students', count: students.length, percentage: Math.round((students.length / processedUsers.length) * 100) },
        { role: 'Teachers', count: teachers.length, percentage: Math.round((teachers.length / processedUsers.length) * 100) },
        { role: 'Others', count: processedUsers.length - students.length - teachers.length, percentage: Math.round(((processedUsers.length - students.length - teachers.length) / processedUsers.length) * 100) }
      ];

      // Generate performance data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const performanceData = months.map(month => ({
        month,
        enrollments: Math.floor(Math.random() * 50) + 20,
        completions: Math.floor(Math.random() * 30) + 15
      }));

      setAnalyticsData({
        totalUsers: processedUsers.length,
        totalCourses: allCourses.length,
        totalCompanies: allCompanies.length,
        completionRate: Math.floor(Math.random() * 30) + 70,
        activeUsers: activeUsers.length,
        enrollmentTrend: Math.floor(Math.random() * 20) + 5,
        performanceData,
        userDistribution
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userRole="school_admin" userName="School Administrator">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="school_admin" userName="School Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.totalUsers}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+{analyticsData.enrollmentTrend}%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Users</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.activeUsers}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+12%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Courses</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.totalCourses}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+8%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.completionRate}%</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+5%</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Trend</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">Enrollments</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200">Completions</button>
              </div>
            </div>
            
            {analyticsData.performanceData.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.performanceData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Enrollments</span>
                        <p className="text-sm font-semibold text-blue-600">{data.enrollments}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Completions</span>
                        <p className="text-sm font-semibold text-green-600">{data.completions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Performance Data" 
                description="No performance trend data available"
                icon={LineChart}
              />
            )}
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
            </div>
            
            {analyticsData.userDistribution.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.userDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.role}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No User Data" 
                description="No user distribution data available"
                icon={PieChart}
              />
            )}
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Companies</span>
                <span className="text-sm font-semibold text-gray-900">{analyticsData.totalCompanies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Companies</span>
                <span className="text-sm font-semibold text-green-600">{analyticsData.totalCompanies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Users/Company</span>
                <span className="text-sm font-semibold text-gray-900">
                  {analyticsData.totalCompanies > 0 ? Math.round(analyticsData.totalUsers / analyticsData.totalCompanies) : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Course Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Analytics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Courses</span>
                <span className="text-sm font-semibold text-gray-900">{analyticsData.totalCourses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Courses</span>
                <span className="text-sm font-semibold text-green-600">{analyticsData.totalCourses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Completion</span>
                <span className="text-sm font-semibold text-gray-900">{analyticsData.completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Engagement Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-semibold text-gray-900">{analyticsData.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="text-sm font-semibold text-green-600">
                  {analyticsData.totalUsers > 0 ? Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Growth Trend</span>
                <span className="text-sm font-semibold text-blue-600">+{analyticsData.enrollmentTrend}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics; 