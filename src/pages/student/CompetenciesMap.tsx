import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Target, 
  CheckCircle, 
  Circle, 
  Clock, 
  Award,
  TrendingUp,
  BookOpen,
  Code,
  Palette,
  Calculator,
  Globe,
  Search,
  Filter,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  Star,
  Zap,
  Eye,
  BarChart3,
  Calendar,
  FileText,
  Users,
  Bookmark,
  Grid,
  List,
  X
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  progress: number;
  relatedCourses: string[];
  skills: string[];
  estimatedTime: string;
  prerequisites: string[];
  nextSteps: string[];
  frameworkid?: number;
  userid?: number;
  grade?: number;
  proficiency?: number;
  timecreated?: number;
  timemodified?: number;
}

interface CompetencyFramework {
  id: number;
  shortname: string;
  name: string;
  description: string;
  competenciescount: number;
  coursescount: number;
  taxonomies: string[];
}

interface CompetencyEvidence {
  id: string;
  competencyid: string;
  action: string;
  grade: number;
  note: string;
  timecreated: number;
  timemodified: number;
}

interface CompetencyCategory {
  name: string;
  color: string;
  competencies: Competency[];
}

const CompetenciesMap: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [competencyEvidence, setCompetencyEvidence] = useState<CompetencyEvidence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');

  useEffect(() => {
    fetchCompetenciesData();
  }, []);

  const fetchCompetenciesData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching real competency data from Moodle API...');
      
      // Fetch competency frameworks and user competencies
      const [frameworksResult, competenciesResult] = await Promise.all([
        moodleService.getCompetencyFrameworks(),
        moodleService.getUserCompetencies()
      ]);
      
      setFrameworks(frameworksResult);
      setCompetencies(competenciesResult);
      
      console.log(`✅ Loaded ${frameworksResult.length} frameworks and ${competenciesResult.length} competencies`);
    } catch (error) {
      console.error('❌ Error fetching competency data:', error);
      setError('Failed to fetch competency data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencyEvidence = async (competencyId: string) => {
    try {
      const evidence = await moodleService.getCompetencyEvidence(competencyId);
      setCompetencyEvidence(evidence);
    } catch (error) {
      console.error('❌ Error fetching competency evidence:', error);
      setCompetencyEvidence([]);
    }
  };

  const handleCompetencyClick = async (competency: Competency) => {
    setSelectedCompetency(competency);
    await fetchCompetencyEvidence(competency.id);
  };

  const filteredCompetencies = competencies.filter(competency => {
    const matchesSearch = competency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competency.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || competency.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || competency.status === filterStatus;
    const matchesCategory = selectedCategory === 'all' || competency.category === selectedCategory;
    const matchesFramework = selectedFramework === 'all' || competency.frameworkid?.toString() === selectedFramework;
    return matchesSearch && matchesLevel && matchesStatus && matchesCategory && matchesFramework;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'mastered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started': return <Circle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'mastered': return <Award className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Programming': return <Code className="w-5 h-5" />;
      case 'Design': return <Palette className="w-5 h-5" />;
      case 'Mathematics': return <Calculator className="w-5 h-5" />;
      case 'Science': return <Zap className="w-5 h-5" />;
      case 'Language': return <Globe className="w-5 h-5" />;
      case 'Arts': return <Star className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const categories = Array.from(new Set(competencies.map(c => c.category)));

  const completedCount = competencies.filter(c => c.status === 'completed' || c.status === 'mastered').length;
  const inProgressCount = competencies.filter(c => c.status === 'in_progress').length;
  const totalProgress = competencies.length > 0 ?
    Math.round((completedCount / competencies.length) * 100) : 0;

  const averageGrade = competencies.length > 0 ?
    Math.round(competencies.reduce((sum, c) => sum + (c.grade || 0), 0) / competencies.length) : 0;

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading competencies map...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competencies Map</h1>
            <p className="text-gray-600">Track your learning journey and skill development with real competency data</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Competencies</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{competencies.length}</h3>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completed</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{completedCount}</h3>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">In Progress</p>
                <h3 className="text-2xl font-bold text-yellow-600 mt-1">{inProgressCount}</h3>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Overall Progress</p>
                <h3 className="text-2xl font-bold text-purple-600 mt-1">{totalProgress}%</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Average Grade</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">{averageGrade}%</h3>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search competencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="mastered">Mastered</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Frameworks</option>
              {frameworks.map(framework => (
                <option key={framework.id} value={framework.id.toString()}>{framework.name}</option>
              ))}
            </select>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Competencies Display */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetencies.map((competency) => (
              <div 
                key={competency.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCompetencyClick(competency)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(competency.category)}
                    <span className="text-sm font-medium text-gray-600">{competency.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(competency.status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(competency.status)}`}>
                      {competency.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{competency.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{competency.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium text-gray-900">{competency.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${competency.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Level</span>
                    <span className={`px-2 py-1 rounded-full ${getLevelColor(competency.level)}`}>
                      {competency.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Grade</span>
                    <span className="text-gray-900">{competency.grade || 0}%</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-900">{competency.estimatedTime}</span>
                  </div>

                  {competency.skills.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competency.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {competency.status === 'not_started' ? 'Start Learning' :
                     competency.status === 'in_progress' ? 'Continue' : 'Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompetencies.map((competency) => (
                    <tr key={competency.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCompetencyClick(competency)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{competency.name}</div>
                          <div className="text-sm text-gray-500">{competency.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCategoryIcon(competency.category)}
                          <span className="ml-2 text-sm text-gray-900">{competency.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(competency.level)}`}>
                          {competency.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(competency.status)}
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(competency.status)}`}>
                            {competency.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${competency.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{competency.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {competency.grade || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {filteredCompetencies.map((competency) => (
              <div key={competency.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(competency.category)}
                      <span className="text-sm font-medium text-gray-600">{competency.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(competency.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(competency.status)}`}>
                        {competency.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {competency.timecreated ? new Date(competency.timecreated * 1000).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{competency.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{competency.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Progress</span>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${competency.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{competency.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Level</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(competency.level)}`}>
                        {competency.level}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Grade</span>
                    <div className="mt-1 text-sm font-medium">{competency.grade || 0}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Time</span>
                    <div className="mt-1 text-sm font-medium">{competency.estimatedTime}</div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => handleCompetencyClick(competency)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCompetencies.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No competencies found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Competency Detail Modal */}
        {selectedCompetency && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCompetency.name}</h2>
                    <p className="text-gray-600 mt-1">{selectedCompetency.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCompetency(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{selectedCompetency.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Level:</span>
                        <span className={`px-2 py-1 rounded-full ${getLevelColor(selectedCompetency.level)}`}>
                          {selectedCompetency.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedCompetency.status)}`}>
                          {selectedCompetency.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-medium">{selectedCompetency.progress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Grade:</span>
                        <span className="font-medium">{selectedCompetency.grade || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estimated Time:</span>
                        <span className="font-medium">{selectedCompetency.estimatedTime}</span>
                      </div>
                    </div>

                    {selectedCompetency.skills.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCompetency.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCompetency.relatedCourses.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Related Courses</h4>
                        <div className="space-y-2">
                          {selectedCompetency.relatedCourses.map((course, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{course}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence & Progress</h3>
                    {competencyEvidence.length > 0 ? (
                      <div className="space-y-3">
                        {competencyEvidence.map((evidence) => (
                          <div key={evidence.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">{evidence.action}</div>
                                <div className="text-sm text-gray-600">{evidence.note}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{evidence.grade}%</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(evidence.timecreated * 1000).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No evidence recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedCompetency(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {selectedCompetency.status === 'not_started' ? 'Start Learning' :
                     selectedCompetency.status === 'in_progress' ? 'Continue' : 'Review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompetenciesMap;
