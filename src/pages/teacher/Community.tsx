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
  Heart,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';

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
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCommunityData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current user's company to filter data
      const currentUserCompany = await moodleService.getCurrentUserCompany();
      
      // Fetch all users for community statistics
      const users = await moodleService.getAllUsers();
      
      // Filter users by company (teacher-specific context)
      const teacherUsers = currentUserCompany 
        ? users.filter(user => user.companyid === currentUserCompany.id)
        : users;
      
      // Calculate community statistics
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const activeUsers = teacherUsers.filter(user => 
        user.lastaccess && (user.lastaccess * 1000) > thirtyDaysAgo
      );
      
      const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const newUsersThisMonth = teacherUsers.filter(user => 
        user.lastaccess && (user.lastaccess * 1000) > oneMonthAgo
      ).length;

      // Generate mock engagement data based on real user data
      const engagementData: UserEngagement[] = teacherUsers.slice(0, 20).map((user, index) => ({
        userId: user.id,
        userName: user.fullname,
        userRole: moodleService.detectUserRoleEnhanced(user.username, user, user.roles || []),
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
          title: 'Teaching Strategies Discussion',
          description: 'Shared some insights about effective teaching methods',
          user: teacherUsers[Math.floor(Math.random() * teacherUsers.length)]?.fullname || 'John Doe',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 50) + 5,
          comments: Math.floor(Math.random() * 20) + 1
        },
        {
          type: 'course_completion',
          title: 'Course Completed',
          description: 'Successfully completed "Advanced Teaching Methods" course',
          user: teacherUsers[Math.floor(Math.random() * teacherUsers.length)]?.fullname || 'Sarah Johnson',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'certification',
          title: 'New Certification',
          description: 'Earned Master Trainer certification',
          user: teacherUsers[Math.floor(Math.random() * teacherUsers.length)]?.fullname || 'Mike Davis',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'enrollment',
          title: 'New Course Enrollment',
          description: 'Enrolled in "Digital Learning Fundamentals"',
          user: teacherUsers[Math.floor(Math.random() * teacherUsers.length)]?.fullname || 'Lisa Wilson',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'comment',
          title: 'Replied to Discussion',
          description: 'Added valuable insights to the teaching strategies discussion',
          user: teacherUsers[Math.floor(Math.random() * teacherUsers.length)]?.fullname || 'David Brown',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 15) + 1
        }
      ];

      setStats({
        totalMembers: teacherUsers.length,
        activeMembers: activeUsers.length,
        newMembersThisMonth: newUsersThisMonth,
        engagementRate: teacherUsers.length > 0 ? Math.round((activeUsers.length / teacherUsers.length) * 100) : 0,
        totalPosts: engagementData.reduce((sum, user) => sum + user.postsCount, 0),
        totalComments: engagementData.reduce((sum, user) => sum + user.commentsCount, 0),
        averageResponseTime: Math.floor(Math.random() * 120) + 30, // minutes
        topContributors: engagementData.filter(user => user.engagementScore > 80).length
      });

      setUserEngagement(engagementData);
      setCommunityActivity(activityData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLastSync(new Date());

    } catch (error) {
      console.error('Error fetching community data:', error);
      setError('Failed to load community data. Using fallback data.');
      
      // Set fallback data
      setStats({
        totalMembers: 120,
        activeMembers: 95,
        newMembersThisMonth: 18,
        engagementRate: 79,
        totalPosts: 380,
        totalComments: 950,
        averageResponseTime: 42,
        topContributors: 12
      });

      setUserEngagement([
        {
          userId: '1',
          userName: 'John Smith',
          userRole: 'teacher',
          postsCount: 22,
          commentsCount: 135,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          engagementScore: 92,
          isActive: true
        },
        {
          userId: '2',
          userName: 'Sarah Johnson',
          userRole: 'teacher',
          postsCount: 16,
          commentsCount: 110,
          lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          engagementScore: 85,
          isActive: true
        }
      ]);

      setCommunityActivity([
        {
          type: 'post',
          title: 'Teaching Strategies Discussion',
          description: 'Started a new discussion about effective teaching methods',
          user: 'John Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 12,
          comments: 8
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommunityData();
  };

  const filteredUserEngagement = userEngagement.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.userRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'course_completion': return <Award className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'enrollment': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-800';
      case 'comment': return 'bg-green-100 text-green-800';
      case 'course_completion': return 'bg-purple-100 text-purple-800';
      case 'certification': return 'bg-yellow-100 text-yellow-800';
      case 'enrollment': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !refreshing) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading community data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-gray-600">Connect with fellow teachers and share insights</p>
          </div>
          <div className="flex items-center space-x-2">
            {lastSync && (
              <span className="text-sm text-gray-500">
                Last synced: {lastSync.toLocaleTimeString()}
              </span>
            )}
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newMembersThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMembers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.engagementRate}% engagement rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.totalComments} comments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Contributors</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topContributors}</div>
              <p className="text-xs text-muted-foreground">
                High engagement users
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Teacher Engagement</CardTitle>
              <CardDescription>Top community contributors and their activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="manager">Managers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredUserEngagement.slice(0, 10).map((user) => (
                    <div key={user.userId} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.userName}&background=random`} />
                        <AvatarFallback>{user.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.userName}</span>
                          <Badge variant="secondary">{user.userRole}</Badge>
                          {user.isActive && <Badge variant="default">Active</Badge>}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.postsCount} posts • {user.commentsCount} comments
                        </div>
                        <div className="text-xs text-gray-500">
                          Last activity: {new Date(user.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{user.engagementScore}%</div>
                        <Progress value={user.engagementScore} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest community interactions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communityActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{activity.title}</span>
                        {activity.likes && (
                          <Badge variant="outline" className="text-xs">
                            ❤️ {activity.likes}
                          </Badge>
                        )}
                        {activity.comments && (
                          <Badge variant="outline" className="text-xs">
                            💬 {activity.comments}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>by {activity.user}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Community;
