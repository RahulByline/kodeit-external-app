import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Star, 
  Clock, 
  User,
  ChevronDown,
  Play,
  FileText,
  Video,
  Image,
  Music,
  Code,
  Globe,
  Bookmark,
  Share2,
  Plus,
  BookmarkPlus,
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react';
import G8PlusLayout from '../../components/G8PlusLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';

interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  format: 'pdf' | 'epub' | 'video' | 'interactive';
  rating: number;
  downloads: number;
  pages: number;
  duration?: string;
  thumbnail: string;
  isBookmarked: boolean;
  tags: string[];
}

const mockEbooks: Ebook[] = [
  {
    id: '1',
    title: 'Introduction to Python Programming',
    author: 'Dr. Sarah Johnson',
    description: 'A comprehensive guide to Python programming fundamentals with practical examples and exercises. Perfect for beginners who want to learn programming from scratch.',
    category: 'Programming',
    format: 'pdf',
    rating: 4.8,
    downloads: 1250,
    pages: 320,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['Python', 'Programming', 'Beginner']
  },
  {
    id: '2',
    title: 'Web Development with React',
    author: 'Mike Chen',
    description: 'Learn modern web development using React.js with hands-on projects and real-world applications. Build responsive and interactive web applications.',
    category: 'Web Development',
    format: 'interactive',
    rating: 4.9,
    downloads: 890,
    pages: 450,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: true,
    tags: ['React', 'JavaScript', 'Frontend']
  },
  {
    id: '3',
    title: 'Data Science Fundamentals',
    author: 'Dr. Emily Rodriguez',
    description: 'Master the basics of data science including statistics, machine learning, and data visualization. Learn to extract insights from data.',
    category: 'Data Science',
    format: 'video',
    rating: 4.7,
    downloads: 2100,
    pages: 280,
    duration: '8h 30m',
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['Data Science', 'Statistics', 'Machine Learning']
  },
  {
    id: '4',
    title: 'Mobile App Development',
    author: 'Alex Thompson',
    description: 'Build mobile applications for iOS and Android using modern development frameworks. Create cross-platform apps with Flutter and React Native.',
    category: 'Mobile Development',
    format: 'epub',
    rating: 4.6,
    downloads: 750,
    pages: 380,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['Mobile', 'iOS', 'Android']
  },
  {
    id: '5',
    title: 'Cybersecurity Essentials',
    author: 'Prof. David Kim',
    description: 'Learn about cybersecurity principles, threats, and protection strategies for digital systems. Protect yourself and your organization from cyber attacks.',
    category: 'Cybersecurity',
    format: 'pdf',
    rating: 4.8,
    downloads: 1100,
    pages: 290,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: true,
    tags: ['Security', 'Networking', 'Protection']
  },
  {
    id: '6',
    title: 'Artificial Intelligence Basics',
    author: 'Dr. Lisa Wang',
    description: 'Explore the fundamentals of AI, machine learning algorithms, and their real-world applications. Understand how AI is transforming industries.',
    category: 'Artificial Intelligence',
    format: 'interactive',
    rating: 4.9,
    downloads: 1650,
    pages: 420,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['AI', 'Machine Learning', 'Neural Networks']
  },
  {
    id: '7',
    title: 'JavaScript Mastery Guide',
    author: 'John Smith',
    description: 'Master JavaScript from basics to advanced concepts. Learn ES6+, async programming, and modern JavaScript frameworks.',
    category: 'Programming',
    format: 'pdf',
    rating: 4.7,
    downloads: 980,
    pages: 350,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: true,
    tags: ['JavaScript', 'ES6', 'Async Programming']
  },
  {
    id: '8',
    title: 'UI/UX Design Principles',
    author: 'Sarah Wilson',
    description: 'Learn the fundamentals of user interface and user experience design. Create beautiful and functional digital products.',
    category: 'Design',
    format: 'video',
    rating: 4.6,
    downloads: 720,
    pages: 240,
    duration: '6h 15m',
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['UI Design', 'UX Design', 'Figma']
  },
  {
    id: '9',
    title: 'Database Management Systems',
    author: 'Dr. Robert Brown',
    description: 'Comprehensive guide to database design, SQL, and database management. Learn MySQL, PostgreSQL, and NoSQL databases.',
    category: 'Programming',
    format: 'interactive',
    rating: 4.5,
    downloads: 650,
    pages: 400,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['Database', 'SQL', 'MySQL']
  },
  {
    id: '10',
    title: 'Digital Marketing Strategies',
    author: 'Emma Davis',
    description: 'Learn modern digital marketing techniques including SEO, social media marketing, and content marketing strategies.',
    category: 'Business',
    format: 'epub',
    rating: 4.4,
    downloads: 580,
    pages: 280,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: true,
    tags: ['Marketing', 'SEO', 'Social Media']
  },
  {
    id: '11',
    title: 'Cloud Computing with AWS',
    author: 'Michael Johnson',
    description: 'Master Amazon Web Services and cloud computing concepts. Learn to deploy and manage applications in the cloud.',
    category: 'Programming',
    format: 'video',
    rating: 4.8,
    downloads: 1200,
    pages: 320,
    duration: '10h 45m',
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['AWS', 'Cloud Computing', 'DevOps']
  },
  {
    id: '12',
    title: 'Game Development with Unity',
    author: 'Alex Garcia',
    description: 'Create amazing games using Unity game engine. Learn C# scripting, 3D modeling, and game design principles.',
    category: 'Programming',
    format: 'interactive',
    rating: 4.7,
    downloads: 890,
    pages: 380,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: true,
    tags: ['Unity', 'Game Development', 'C#']
  }
];

const categories = [
  'All',
  'Programming',
  'Web Development',
  'Data Science',
  'Mobile Development',
  'Cybersecurity',
  'Artificial Intelligence',
  'Design',
  'Business'
];

const formats = [
  { value: 'all', label: 'All Formats', icon: FileText },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'epub', label: 'EPUB', icon: BookOpen },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'interactive', label: 'Interactive', icon: Code }
];

const Ebooks: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Ebook[]>([]);
  const [bookmarkedEbooks, setBookmarkedEbooks] = useState<Ebook[]>([]);

  const filteredEbooks = mockEbooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ebook.category === selectedCategory;
    const matchesFormat = selectedFormat === 'all' || ebook.format === selectedFormat;
    
    return matchesSearch && matchesCategory && matchesFormat;
  });

  const sortedEbooks = [...filteredEbooks].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'epub': return <BookOpen className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'interactive': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf': return 'bg-red-100 text-red-600';
      case 'epub': return 'bg-blue-100 text-blue-600';
      case 'video': return 'bg-purple-100 text-purple-600';
      case 'interactive': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'recent':
        // Demo: Show recently viewed books
        setRecentlyViewed(mockEbooks.slice(0, 3));
        break;
      case 'bookmarked':
        // Demo: Show bookmarked books
        setBookmarkedEbooks(mockEbooks.filter(book => book.isBookmarked));
        break;
      case 'trending':
        // Demo: Show trending books
        setSortBy('popular');
        break;
      case 'new':
        // Demo: Show newest books
        setSortBy('newest');
        break;
      default:
        break;
    }
  };

  return (
    <G8PlusLayout userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">E-books Library</h1>
            <p className="text-gray-600 mt-1">Access digital learning materials and resources</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4" />
              <span>My Library</span>
            </Button>
          </div>
        </div>

        {/* Featured E-books Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>Featured E-books</span>
            </CardTitle>
            <CardDescription>Handpicked recommendations for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockEbooks.slice(0, 3).map(ebook => (
                <div key={ebook.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{ebook.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{ebook.author}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-600">{ebook.rating}</span>
                        </div>
                        <Badge className={`text-xs ${getFormatColor(ebook.format)}`}>
                          {ebook.format.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Quick access to popular e-book features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => handleQuickAction('recent')}
              >
                <Clock className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-sm">Recently Viewed</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col hover:bg-green-50 hover:border-green-200 transition-colors"
                onClick={() => handleQuickAction('bookmarked')}
              >
                <BookmarkPlus className="w-6 h-6 mb-2 text-green-600" />
                <span className="text-sm">My Bookmarks</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col hover:bg-orange-50 hover:border-orange-200 transition-colors"
                onClick={() => handleQuickAction('trending')}
              >
                <TrendingUp className="w-6 h-6 mb-2 text-orange-600" />
                <span className="text-sm">Trending Books</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col hover:bg-purple-50 hover:border-purple-200 transition-colors"
                onClick={() => handleQuickAction('new')}
              >
                <Plus className="w-6 h-6 mb-2 text-purple-600" />
                <span className="text-sm">New Releases</span>
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
                    placeholder="Search e-books, authors, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Formats */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {formats.map(format => (
                        <option key={format.value} value={format.value}>{format.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics and Results Count */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockEbooks.length}</div>
              <div className="text-sm text-gray-600">Total E-books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockEbooks.filter(book => book.isBookmarked).length}</div>
              <div className="text-sm text-gray-600">Bookmarked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mockEbooks.reduce((sum, book) => sum + book.downloads, 0).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
          </div>
          <p className="text-gray-600">
            Showing {sortedEbooks.length} of {mockEbooks.length} e-books
          </p>
        </div>

        {/* E-books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEbooks.map(ebook => (
            <Card key={ebook.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-blue-500" />
                </div>
                <div className="absolute top-3 right-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`p-2 rounded-full ${ebook.isBookmarked ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400'} hover:bg-blue-100 hover:text-blue-600 transition-colors`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className={`${getFormatColor(ebook.format)}`}>
                    {getFormatIcon(ebook.format)}
                    <span className="ml-1">{ebook.format.toUpperCase()}</span>
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{ebook.title}</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ebook.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <User className="w-4 h-4 mr-1" />
                  <span>{ebook.author}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{ebook.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      <span>{ebook.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{ebook.pages} pages</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {ebook.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button className="flex-1" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Read Now
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedEbooks.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No e-books found</h3>
              <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </G8PlusLayout>
  );
};

export default Ebooks;

