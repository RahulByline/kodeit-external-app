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
import DashboardLayout from '../../components/DashboardLayout';
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
    description: 'A comprehensive guide to Python programming fundamentals with practical examples and exercises.',
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
    description: 'Learn modern web development using React.js with hands-on projects and real-world applications.',
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
    description: 'Master the basics of data science including statistics, machine learning, and data visualization.',
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
    description: 'Build mobile applications for iOS and Android using modern development frameworks.',
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
    description: 'Learn about cybersecurity principles, threats, and protection strategies for digital systems.',
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
    description: 'Explore the fundamentals of AI, machine learning algorithms, and their real-world applications.',
    category: 'Artificial Intelligence',
    format: 'interactive',
    rating: 4.9,
    downloads: 1650,
    pages: 420,
    thumbnail: '/api/placeholder/300/200',
    isBookmarked: false,
    tags: ['AI', 'Machine Learning', 'Neural Networks']
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
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
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
                className="h-20 flex-col"
                onClick={() => handleQuickAction('recent')}
              >
                <Clock className="w-6 h-6 mb-2" />
                <span className="text-sm">Recently Viewed</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('bookmarked')}
              >
                <BookmarkPlus className="w-6 h-6 mb-2" />
                <span className="text-sm">My Bookmarks</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('trending')}
              >
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="text-sm">Trending Books</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('new')}
              >
                <Plus className="w-6 h-6 mb-2" />
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

        {/* Results Count */}
        <div className="flex items-center justify-between">
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
    </DashboardLayout>
  );
};

export default Ebooks;

