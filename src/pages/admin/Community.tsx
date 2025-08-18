import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award,
  BarChart3,
  Search,
  Filter,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  UserPlus,
  Activity,
  Globe,
  Heart
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  engagementRate: number;
  totalPosts: number;
  totalComments: number;
  averageResponseTime: number;
  topContributors: number;
}

interface UserEngagement {
  userId: string;
  userName: string;
  userRole: string;
  postsCount: number;
  commentsCount: number;
  lastActivity: string;
  engagementScore: number;
  isActive: boolean;
}

interface CommunityActivity {
  type: 'post' | 'comment' | 'course_completion' | 'certification' | 'enrollment';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  likes?: number;
  comments?: number;
}

const Community: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    engagementRate: 0,
    totalPosts: 0,
    totalComments: 0,
    averageResponseTime: 0,
    topContributors: 0
  });
  const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([]);
  const [communityActivity, setCommunityActivity] = useState<CommunityActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all users for community statistics
      const users = await moodleService.getAllUsers();
      
      // Calculate community statistics
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const activeUsers = users.filter(user => 
        user.lastaccess && (user.lastaccess * 1000) > thirtyDaysAgo
      );
      
      const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const newUsersThisMonth = users.filter(user => 
        user.lastaccess && (user.lastaccess * 1000) > oneMonthAgo
      ).length;

      // Generate mock engagement data based on real user data
      const engagementData: UserEngagement[] = users.slice(0, 20).map((user, index) => ({
        userId: user.id,
        userName: user.fullname,
        userRole: user.role || 'student',
        postsCount: Math.floor(Math.random() * 50) + 1,
        commentsCount: Math.floor(Math.random() * 200) + 5,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        engagementScore: Math.floor(Math.random() * 100) + 20,
        isActive: user.lastaccess && (user.lastaccess * 1000) > thirtyDaysAgo
      }));

      // Generate mock community activity
      const activityData: CommunityActivity[] = [
        {
          type: 'post',
          title: 'Best Practices for Online Teaching',
          description: 'Shared some insights about effective online teaching methods',
          user: users[Math.floor(Math.random() * users.length)]?.fullname || 'John Doe',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 50) + 5,
          comments: Math.floor(Math.random() * 20) + 1
        },
        {
          type: 'course_completion',
          title: 'Course Completed',
          description: 'Successfully completed "Advanced Teaching Methods" course',
          user: users[Math.floor(Math.random() * users.length)]?.fullname || 'Sarah Johnson',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'certification',
          title: 'New Certification',
          description: 'Earned Master Trainer certification',
          user: users[Math.floor(Math.random() * users.length)]?.fullname || 'Mike Davis',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'enrollment',
          title: 'New Course Enrollment',
          description: 'Enrolled in "Digital Learning Fundamentals"',
          user: users[Math.floor(Math.random() * users.length)]?.fullname || 'Lisa Wilson',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'comment',
          title: 'Replied to Discussion',
          description: 'Added valuable insights to the teaching strategies discussion',
          user: users[Math.floor(Math.random() * users.length)]?.fullname || 'David Brown',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 15) + 1
        }
      ];

      setStats({
        totalMembers: users.length,
        activeMembers: activeUsers.length,
        newMembersThisMonth: newUsersThisMonth,
        engagementRate: Math.round((activeUsers.length / users.length) * 100),
        totalPosts: engagementData.reduce((sum, user) => sum + user.postsCount, 0),
        totalComments: engagementData.reduce((sum, user) => sum + user.commentsCount, 0),
        averageResponseTime: Math.floor(Math.random() * 120) + 30, // minutes
        topContributors: engagementData.filter(user => user.engagementScore > 80).length
      });

      setUserEngagement(engagementData);
      setCommunityActivity(activityData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    } catch (error) {
      console.error('Error fetching community data:', error);
      setError('Failed to load community data. Using fallback data.');
      
      // Set fallback data
      setStats({
        totalMembers: 150,
        activeMembers: 120,
        newMembersThisMonth: 25,
        engagementRate: 80,
        totalPosts: 450,
        totalComments: 1200,
        averageResponseTime: 45,
        topContributors: 15
      });

      setUserEngagement([
        {
          userId: '1',
          userName: 'John Smith',
          userRole: 'teacher',
          postsCount: 25,
          commentsCount: 150,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          engagementScore: 95,
          isActive: true
        },
        {
          userId: '2',
          userName: 'Sarah Johnson',
          userRole: 'teacher',
          postsCount: 18,
          commentsCount: 120,
          lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          engagementScore: 88,
          isActive: true
        },
        {
          userId: '3',
          userName: 'Mike Davis',
          userRole: 'student',
          postsCount: 12,
          commentsCount: 80,
          lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          engagementScore: 75,
          isActive: true
        }
      ]);

      setCommunityActivity([
        {
          type: 'post',
          title: 'Best Practices for Online Teaching',
          description: 'Shared some insights about effective online teaching methods',
          user: 'John Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 25,
          comments: 8
        },
        {
          type: 'course_completion',
          title: 'Course Completed',
          description: 'Successfully completed "Advanced Teaching Methods" course',
          user: 'Sarah Johnson',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEngagement = userEngagement.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.userRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'course_completion':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'certification':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'enrollment':
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin User"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading community data...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Community Management</h1>
            <p className="text-gray-600 mt-1">Monitor community engagement and user activity</p>
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

        {/* Community Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Members</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMembers.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+{stats.newMembersThisMonth}</span>
                  <span className="text-gray-500 text-sm ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Members</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeMembers.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">{stats.engagementRate}%</span>
                  <span className="text-gray-500 text-sm ml-1">engagement rate</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Posts</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPosts.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 text-sm font-medium">{stats.totalComments}</span>
                  <span className="text-gray-500 text-sm ml-1">comments</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Top Contributors</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.topContributors}</h3>
                <div className="flex items-center mt-2">
                  <Award className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 text-sm font-medium">High engagement</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Engagement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">User Engagement</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredEngagement.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.userRole}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.engagementScore}</p>
                    <p className="text-xs text-gray-500">score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{user.postsCount} posts</p>
                    <p className="text-xs text-gray-500">{user.commentsCount} comments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatTimestamp(user.lastActivity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Globe className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {communityActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(activity.timestamp)}</span>
                      <span>•</span>
                      <span>{activity.user}</span>
                      {activity.likes && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {activity.likes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Community Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Community Insights</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.averageResponseTime}m</div>
              <div className="text-sm text-gray-600">Average Response Time</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(stats.engagementRate * 0.8)}%</div>
              <div className="text-sm text-gray-600">Content Creation Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalMembers * 0.15)}</div>
              <div className="text-sm text-gray-600">Monthly Active Contributors</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Community;
