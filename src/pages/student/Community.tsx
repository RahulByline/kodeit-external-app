import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  User,
  Award,
  TrendingUp,
  Star,
  ThumbsUp,
  MessageCircle,
  Eye,
  Hash,
  Tag,
  Users2,
  BookOpen,
  Target,
  BarChart3
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    reputation: number;
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  timestamp: string;
  isBookmarked: boolean;
  isLiked: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: number;
  maxMembers: number;
  meetingTime: string;
  nextMeeting: string;
  isJoined: boolean;
  leader: {
    name: string;
    avatar: string;
  };
}

interface CommunityStats {
  totalMembers: number;
  activeToday: number;
  totalPosts: number;
  totalGroups: number;
  topContributors: number;
}

const Community: React.FC = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    activeToday: 0,
    totalPosts: 0,
    totalGroups: 0,
    topContributors: 0
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data for community posts
  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        role: 'Student',
        reputation: 1250
      },
      title: 'Tips for mastering JavaScript arrays',
      content: 'I\'ve been working on JavaScript arrays and found some really helpful methods. Here are my top tips for working with arrays effectively...',
      category: 'Programming',
      tags: ['javascript', 'arrays', 'tips'],
      likes: 24,
      comments: 8,
      views: 156,
      timestamp: '2 hours ago',
      isBookmarked: false,
      isLiked: true
    },
    {
      id: '2',
      author: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        role: 'Student',
        reputation: 890
      },
      title: 'Study group for Advanced Mathematics - Room 302',
      content: 'Looking for study partners for the upcoming Advanced Mathematics exam. We\'ll be meeting in Room 302 every Tuesday and Thursday...',
      category: 'Study Groups',
      tags: ['mathematics', 'study-group', 'exam-prep'],
      likes: 12,
      comments: 15,
      views: 89,
      timestamp: '4 hours ago',
      isBookmarked: true,
      isLiked: false
    },
    {
      id: '3',
      author: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        role: 'Student',
        reputation: 2100
      },
      title: 'Python project ideas for beginners',
      content: 'Here are some fun Python project ideas that helped me learn programming. These projects are perfect for beginners and intermediate learners...',
      category: 'Programming',
      tags: ['python', 'projects', 'beginners'],
      likes: 31,
      comments: 12,
      views: 234,
      timestamp: '6 hours ago',
      isBookmarked: false,
      isLiked: false
    },
    {
      id: '4',
      author: {
        name: 'Alex Thompson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        role: 'Student',
        reputation: 750
      },
      title: 'Physics lab report template',
      content: 'I created a comprehensive template for physics lab reports. It includes all the sections you need and follows the standard format...',
      category: 'Resources',
      tags: ['physics', 'lab-report', 'template'],
      likes: 18,
      comments: 6,
      views: 112,
      timestamp: '1 day ago',
      isBookmarked: true,
      isLiked: true
    },
    {
      id: '5',
      author: {
        name: 'Lisa Wang',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
        role: 'Student',
        reputation: 1650
      },
      title: 'Chemistry study techniques that actually work',
      content: 'After struggling with chemistry for months, I finally found study techniques that work. Here\'s what helped me improve my grades...',
      category: 'Study Tips',
      tags: ['chemistry', 'study-techniques', 'grades'],
      likes: 27,
      comments: 9,
      views: 178,
      timestamp: '2 days ago',
      isBookmarked: false,
      isLiked: false
    }
  ];

  // Mock data for study groups
  const mockStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Advanced Mathematics Study Group',
      description: 'Weekly study sessions for Advanced Mathematics. We cover calculus, linear algebra, and differential equations.',
      subject: 'Mathematics',
      members: 8,
      maxMembers: 12,
      meetingTime: 'Tuesdays & Thursdays, 3:00 PM',
      nextMeeting: 'Tomorrow at 3:00 PM',
      isJoined: true,
      leader: {
        name: 'Dr. Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      }
    },
    {
      id: '2',
      name: 'Python Programming Club',
      description: 'Learn Python programming through hands-on projects and collaborative coding sessions.',
      subject: 'Programming',
      members: 15,
      maxMembers: 20,
      meetingTime: 'Mondays & Wednesdays, 4:00 PM',
      nextMeeting: 'Monday at 4:00 PM',
      isJoined: false,
      leader: {
        name: 'Prof. Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      }
    },
    {
      id: '3',
      name: 'Physics Lab Partners',
      description: 'Group for physics lab experiments and report writing. Share resources and help each other understand complex concepts.',
      subject: 'Physics',
      members: 6,
      maxMembers: 8,
      meetingTime: 'Fridays, 2:00 PM',
      nextMeeting: 'Friday at 2:00 PM',
      isJoined: true,
      leader: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      }
    },
    {
      id: '4',
      name: 'Chemistry Study Circle',
      description: 'Intensive chemistry study group focusing on organic chemistry and chemical reactions.',
      subject: 'Chemistry',
      members: 10,
      maxMembers: 15,
      meetingTime: 'Saturdays, 10:00 AM',
      nextMeeting: 'Saturday at 10:00 AM',
      isJoined: false,
      leader: {
        name: 'Alex Thompson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      }
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPosts(mockPosts);
      setStudyGroups(mockStudyGroups);
      setStats({
        totalMembers: 1247,
        activeToday: 89,
        totalPosts: 456,
        totalGroups: 23,
        topContributors: 45
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(groups => groups.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: !group.isJoined, members: group.isJoined ? group.members - 1 : group.members + 1 }
        : group
    ));
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'Programming', 'Study Groups', 'Resources', 'Study Tips'];

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">Connect with fellow students, join study groups, and share knowledge</p>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Today</p>
                <p className="text-lg font-semibold text-gray-900">{stats.activeToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Posts</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users2 className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Study Groups</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalGroups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Top Contributors</p>
                <p className="text-lg font-semibold text-gray-900">{stats.topContributors}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search posts, topics, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{post.author.name}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{post.author.role}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{post.timestamp}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {post.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Hash className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-1 text-sm ${
                              post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleBookmark(post.id)}
                            className={`p-2 rounded-lg ${
                              post.isBookmarked 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Study Groups */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Study Groups</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {studyGroups.map(group => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <img
                        src={group.leader.avatar}
                        alt={group.leader.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.leader.name}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {group.subject}
                      </span>
                      <span>{group.members}/{group.maxMembers} members</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {group.meetingTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Next: {group.nextMeeting}</span>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          group.isJoined
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {group.isJoined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h2>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Johnson', points: 1250, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' },
                  { name: 'Emma Davis', points: 2100, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
                  { name: 'Mike Chen', points: 890, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
                  { name: 'Lisa Wang', points: 1650, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
                  { name: 'Alex Thompson', points: 750, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
                ].map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <img
                        src={contributor.avatar}
                        alt={contributor.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-900">{contributor.name}</span>
                    </div>
                    <div className="ml-auto flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-500">{contributor.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Community;
