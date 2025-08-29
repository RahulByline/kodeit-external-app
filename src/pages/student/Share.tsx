import React, { useState } from 'react';
import { 
  Share2, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  User,
  ChevronDown,
  Star,
  FileText,
  Video,
  Image,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  Download,
  Copy,
  Link,
  Settings,
  Plus,
  Grid,
  List,
  Tag,
  Globe,
  Lock,
  Unlock,
  FolderOpen,
  MessageSquare,
  Zap,
  Code
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';

interface SharedItem {
  id: string;
  title: string;
  description: string;
  type: 'code' | 'document' | 'project' | 'resource';
  author: {
    name: string;
    avatar: string;
    grade: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  views: number;
  downloads: number;
  tags: string[];
  isPublic: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  thumbnail?: string;
  fileSize?: string;
  language?: string;
}

interface Classmate {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  isOnline: boolean;
  lastActive: string;
  sharedItems: number;
  followers: number;
  following: number;
  isFollowing: boolean;
}

const mockSharedItems: SharedItem[] = [
  {
    id: '1',
    title: 'Python Calculator Project',
    description: 'A simple calculator built with Python using tkinter GUI. Includes basic arithmetic operations and a clean interface.',
    type: 'project',
    author: {
      name: 'Alex Johnson',
      avatar: '/api/placeholder/100/100',
      grade: 'Grade 10'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    likes: 24,
    comments: 8,
    views: 156,
    downloads: 12,
    tags: ['Python', 'GUI', 'Calculator', 'Tkinter'],
    isPublic: true,
    isLiked: true,
    isBookmarked: false,
    language: 'Python',
    fileSize: '2.3 MB'
  },
  {
    id: '2',
    title: 'React Todo App Tutorial',
    description: 'Step-by-step guide to building a todo app with React hooks. Perfect for beginners learning React.',
    type: 'document',
    author: {
      name: 'Sarah Chen',
      avatar: '/api/placeholder/100/100',
      grade: 'Grade 11'
    },
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    likes: 18,
    comments: 5,
    views: 89,
    downloads: 7,
    tags: ['React', 'JavaScript', 'Tutorial', 'Hooks'],
    isPublic: true,
    isLiked: false,
    isBookmarked: true,
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    title: 'CSS Grid Layout Examples',
    description: 'Collection of CSS Grid examples for responsive layouts. Includes common patterns and best practices.',
    type: 'resource',
    author: {
      name: 'Mike Rodriguez',
      avatar: '/api/placeholder/100/100',
      grade: 'Grade 9'
    },
    createdAt: '2024-01-13T12:15:00Z',
    updatedAt: '2024-01-14T11:45:00Z',
    likes: 31,
    comments: 12,
    views: 234,
    downloads: 19,
    tags: ['CSS', 'Grid', 'Layout', 'Responsive'],
    isPublic: true,
    isLiked: true,
    isBookmarked: false,
    language: 'CSS',
    fileSize: '3.1 MB'
  },
  {
    id: '4',
    title: 'JavaScript Array Methods Cheat Sheet',
    description: 'Quick reference guide for JavaScript array methods with examples and use cases.',
    type: 'document',
    author: {
      name: 'Emily Wang',
      avatar: '/api/placeholder/100/100',
      grade: 'Grade 10'
    },
    createdAt: '2024-01-12T08:20:00Z',
    updatedAt: '2024-01-13T15:10:00Z',
    likes: 42,
    comments: 15,
    views: 312,
    downloads: 28,
    tags: ['JavaScript', 'Arrays', 'Cheat Sheet', 'Reference'],
    isPublic: true,
    isLiked: false,
    isBookmarked: true,
    language: 'JavaScript',
    fileSize: '856 KB'
  },
  {
    id: '5',
    title: 'Data Science Project: Weather Analysis',
    description: 'Python project analyzing weather data using pandas and matplotlib. Includes data visualization and insights.',
    type: 'project',
    author: {
      name: 'David Kim',
      avatar: '/api/placeholder/100/100',
      grade: 'Grade 12'
    },
    createdAt: '2024-01-11T14:30:00Z',
    updatedAt: '2024-01-12T10:15:00Z',
    likes: 56,
    comments: 23,
    views: 445,
    downloads: 34,
    tags: ['Python', 'Data Science', 'Pandas', 'Matplotlib'],
    isPublic: true,
    isLiked: true,
    isBookmarked: false,
    language: 'Python',
    fileSize: '5.2 MB'
  }
];

const mockClassmates: Classmate[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: '/api/placeholder/100/100',
    grade: 'Grade 10',
    isOnline: true,
    lastActive: '2 minutes ago',
    sharedItems: 15,
    followers: 23,
    following: 18,
    isFollowing: true
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: '/api/placeholder/100/100',
    grade: 'Grade 11',
    isOnline: false,
    lastActive: '1 hour ago',
    sharedItems: 8,
    followers: 31,
    following: 25,
    isFollowing: false
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    avatar: '/api/placeholder/100/100',
    grade: 'Grade 9',
    isOnline: true,
    lastActive: '5 minutes ago',
    sharedItems: 12,
    followers: 19,
    following: 22,
    isFollowing: true
  },
  {
    id: '4',
    name: 'Emily Wang',
    avatar: '/api/placeholder/100/100',
    grade: 'Grade 10',
    isOnline: false,
    lastActive: '3 hours ago',
    sharedItems: 6,
    followers: 27,
    following: 15,
    isFollowing: false
  },
  {
    id: '5',
    name: 'David Kim',
    avatar: '/api/placeholder/100/100',
    grade: 'Grade 12',
    isOnline: true,
    lastActive: 'Just now',
    sharedItems: 21,
    followers: 45,
    following: 38,
    isFollowing: true
  }
];

const Share: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'shared' | 'classmates'>('shared');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);

  const filteredItems = mockSharedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      case 'views':
        return b.views - a.views;
      case 'downloads':
        return b.downloads - a.downloads;
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'project': return <BookOpen className="w-4 h-4" />;
      case 'resource': return <Link className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-blue-100 text-blue-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'resource': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleLike = (itemId: string) => {
    // In a real app, this would update the backend
    console.log('Liked item:', itemId);
  };

  const handleBookmark = (itemId: string) => {
    // In a real app, this would update the backend
    console.log('Bookmarked item:', itemId);
  };

  const handleShare = (itemId: string) => {
    // In a real app, this would open a share dialog
    console.log('Share item:', itemId);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'share-project':
        setShowShareModal(true);
        break;
      case 'class-discussion':
        setShowDiscussionModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Share with Class</h1>
            <p className="text-gray-600 mt-1">Collaborate and share resources with your classmates</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Share Something</span>
            </Button>
          </div>
        </div>

        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Collaborate and share your work with classmates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('share-project')}
              >
                <FolderOpen className="w-6 h-6 mb-2" />
                <span className="text-sm">Share Project</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('class-discussion')}
              >
                <MessageSquare className="w-6 h-6 mb-2" />
                <span className="text-sm">Class Discussion</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardContent className="p-1">
            <div className="flex">
              <Button
                variant={activeTab === 'shared' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('shared')}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Shared Resources</span>
                </div>
              </Button>
              <Button
                variant={activeTab === 'classmates' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('classmates')}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Classmates</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={activeTab === 'shared' ? 'Search shared resources...' : 'Search classmates...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                {activeTab === 'shared' && (
                  <>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="code">Code</option>
                      <option value="document">Document</option>
                      <option value="project">Project</option>
                      <option value="resource">Resource</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="views">Most Viewed</option>
                      <option value="downloads">Most Downloaded</option>
                    </select>

                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={selectedView === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedView('grid')}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedView === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedView('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === 'shared' ? (
          <div>
            {selectedView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header */}
                    <CardContent className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(item.type)}>
                            {getTypeIcon(item.type)}
                            <span className="ml-1">{item.type}</span>
                          </Badge>
                          {item.isPublic ? (
                            <Globe className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>

                      {/* Author */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.author.name}</p>
                          <p className="text-xs text-gray-500">{item.author.grade}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{item.views}</span>
                          </div>
                          <div className="flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            <span>{item.downloads}</span>
                          </div>
                        </div>
                        <span>{formatDate(item.updatedAt)}</span>
                      </div>
                    </CardContent>

                    {/* Actions */}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(item.id)}
                            className={item.isLiked ? 'text-red-600' : ''}
                          >
                            <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm">{item.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{item.comments}</span>
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(item.id)}
                            className={item.isBookmarked ? 'text-blue-600' : ''}
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(item.id)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedItems.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                              <Badge className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{item.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              <span>{item.author.name}</span>
                              <span>•</span>
                              <span>{item.author.grade}</span>
                            </div>
                            <span>•</span>
                            <span>{formatDate(item.updatedAt)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLike(item.id)}
                                  className={item.isLiked ? 'text-red-600' : ''}
                                >
                                  <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                                  <span className="text-sm">{item.likes}</span>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-sm">{item.comments}</span>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                  <span className="text-sm">{item.views}</span>
                                </Button>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBookmark(item.id)}
                                  className={item.isBookmarked ? 'text-blue-600' : ''}
                                >
                                  <BookOpen className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(item.id)}
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockClassmates.map(classmate => (
              <Card key={classmate.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          classmate.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{classmate.name}</h3>
                        <p className="text-sm text-gray-600">{classmate.grade}</p>
                        <p className="text-xs text-gray-500">{classmate.lastActive}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shared Items</span>
                      <span className="font-medium">{classmate.sharedItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Followers</span>
                      <span className="font-medium">{classmate.followers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Following</span>
                      <span className="font-medium">{classmate.following}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={classmate.isFollowing ? 'outline' : 'default'}
                      className="flex-1"
                    >
                      {classmate.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {activeTab === 'shared' && sortedItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shared resources found</h3>
              <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'classmates' && mockClassmates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classmates found</h3>
              <p className="text-gray-600">Connect with your classmates to see their shared resources.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Share Project Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Share2 className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Share Project</h3>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowShareModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Share your latest project with the class</p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Project title..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  placeholder="Project description..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button className="w-full">
                  Share Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Discussion Modal */}
      {showDiscussionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Class Discussion</h3>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowDiscussionModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Join ongoing class discussions</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <h4 className="font-medium">Python Project Help</h4>
                    <p className="text-sm text-gray-600">Getting started with Python programming</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <h4 className="font-medium">Web Development Tips</h4>
                    <p className="text-sm text-gray-600">Best practices for modern web development</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <h4 className="font-medium">Study Group Formation</h4>
                    <p className="text-sm text-gray-600">Organizing study sessions for upcoming exams</p>
                  </div>
                </div>
                <Button className="w-full">
                  Join Discussion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Share;

