import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Clock,
  Settings,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  BarChart3,
  Award,
  FileText,
  Play,
  Code,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Target,
  X,
  Map,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import ScormPlayer from '../../components/ScormPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { moodleService } from '../../services/moodleApi';
import { competencyService } from '../../services/competencyService';

interface Course {
  id: string;
  fullname: string;
  shortname: string;
  summary?: string;
  categoryid: number;
  courseimage?: string;
  categoryname?: string;
  format?: string;
  startdate: number;
  enddate?: number;
  visible: number;
  type?: string;
  tags?: string[];
  lastaccess?: number;
}

interface CourseContent {
  id: number;
  name: string;
  type: string;
  visible: number;
  completion: number;
  completionstatus: number;
  completiontrack: number;
  modules: any[];
}

interface CourseSection {
  id: number;
  name: string;
  visible: number;
  summary: string;
  summaryformat: number;
  section: number;
  hiddenbynumsections?: number;
  uservisible?: number;
  availabilityinfo?: string;
  component?: string;
  itemid?: number;
  modules: CourseModule[];
}

interface CourseModule {
  id: number;
  url?: string;
  name: string;
  instance?: number;
  contextid?: number;
  description?: string;
  visible: number;
  uservisible?: number;
  availabilityinfo?: string;
  visibleoncoursepage?: number;
  modicon: string;
  modname: string;
  purpose: string;
  branded?: number;
  modplural: string;
  availability?: string;
  indent: number;
  onclick?: string;
  afterlink?: string;
  activitybadge?: {
    badgecontent?: string;
    badgestyle?: string;
    badgeurl?: string;
    badgeelementid?: string;
    badgeextraattributes?: Array<{name?: string; value?: string}>;
  };
  customdata?: string;
  noviewlink?: number;
  completion?: number;
  completiondata?: {
    state: number;
    timecompleted: number;
    overrideby: number;
    valueused: number;
    hascompletion: number;
    isautomatic: number;
    istrackeduser: number;
    uservisible: number;
    details: Array<{
      rulename: string;
      rulevalue: {
        status: number;
        description: string;
      };
    }>;
    isoverallcomplete?: number;
  };
  downloadcontent?: number;
  dates?: Array<{
    label: string;
    timestamp: number;
    relativeto?: number;
    dataid?: string;
  }>;
  groupmode?: number;
  contents?: Array<{
    type: string;
    filename: string;
    filepath: string;
    filesize: number;
    fileurl?: string;
    content?: string;
    timecreated: number;
    timemodified: number;
    sortorder: number;
    mimetype?: string;
    isexternalfile?: number;
    repositorytype?: string;
    userid: number;
    author: string;
    license: string;
    tags?: Array<{
      id: number;
      name: string;
      rawname: string;
      isstandard: number;
      tagcollid: number;
      taginstanceid: number;
      taginstancecontextid: number;
      itemid: number;
      ordering: number;
      flag: number;
      viewurl?: string;
    }>;
  }>;
  contentsinfo?: {
    filescount: number;
    filessize: number;
    lastmodified: number;
    mimetypes: string[];
    repositorytype?: string;
  };
}

interface ContentItem {
  id: number;
  name: string;
  title: string;
  link: string;
  icon: string;
  help: string;
  archetype: string;
  componentname: string;
  purpose: string;
  branded: number;
  favourite: number;
  legacyitem: number;
  recommended: number;
}

interface EnrolledUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  lastaccess: number;
  enrolled: boolean;
}

interface CourseCompetency {
  id: string;
  shortname: string;
  fullname: string;
  description: string;
  ruleoutcome: number;
  sortorder: number;
  competencyframeworkid: string;
}

interface CompetencySearchResult {
  id: string;
  shortname: string;
  fullname: string;
  description: string;
  competencyframeworkid: string;
  path: string;
}

interface CompetencyFramework {
  id: number;
  shortname: string;
  idnumber: string;
  description: string;
  descriptionformat: number;
  visible: number;
  scaleid: number;
  scaleconfiguration: string;
  contextid: number;
  taxonomies: string;
  timecreated: number;
  timemodified: number;
  usermodified: number;
  canmanage: number;
  competenciescount: number;
  contextname: string;
  contextnamenoprefix: string;
}

interface Competency {
  id: number;
  shortname: string;
  idnumber: string;
  description: string;
  descriptionformat: number;
  sortorder: number;
  parentid: number;
  path: string;
  ruleoutcome: number;
  ruletype: string;
  ruleconfig: string;
  scaleid: number;
  scaleconfiguration: string;
  competencyframeworkid: number;
  timecreated: number;
  timemodified: number;
  usermodified: number;
  children?: Competency[];
}

interface AdminCourseDetailProps {
  courseId: string;
  onBack: () => void;
}

const AdminCourseDetail: React.FC<AdminCourseDetailProps> = ({ courseId, onBack }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseContents, setCourseContents] = useState<CourseContent[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [courseCompetencies, setCourseCompetencies] = useState<CourseCompetency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Competency mapping states - NEW APPROACH
  const [showAddCompetency, setShowAddCompetency] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<CompetencyFramework | null>(null);
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>([]);
  const [frameworkCompetencies, setFrameworkCompetencies] = useState<Competency[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);
  const [mappingCompetency, setMappingCompetency] = useState(false);
  const [expandedCompetencies, setExpandedCompetencies] = useState<Set<string>>(new Set());
  const [selectedCompetencies, setSelectedCompetencies] = useState<Set<number>>(new Set());
  const [addingCompetencies, setAddingCompetencies] = useState(false);
  
  // Detailed course contents states
  const [detailedCourseContents, setDetailedCourseContents] = useState<CourseSection[]>([]);
  const [loadingDetailedContents, setLoadingDetailedContents] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  
  // SCORM viewer states
  const [showScormViewer, setShowScormViewer] = useState(false);
  const [scormViewerUrl, setScormViewerUrl] = useState('');
  const [scormActivityName, setScormActivityName] = useState('');
  const [scormModuleId, setScormModuleId] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scormLoading, setScormLoading] = useState(false);
  const [scormError, setScormError] = useState('');

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

  // NEW: Load frameworks when component mounts
  useEffect(() => {
    if (activeTab === 'competencies') {
      loadFrameworks();
    }
  }, [activeTab]);

  // NEW: Load detailed contents when contents tab is active
  useEffect(() => {
    if (activeTab === 'contents') {
      loadDetailedCourseContents();
    }
  }, [activeTab, courseId]);

  // NEW: Load competencies when framework is selected
  useEffect(() => {
    if (selectedFramework) {
      loadFrameworkCompetencies(selectedFramework.id);
      // Clear previous selections when framework changes
      setSelectedCompetencies(new Set());
    }
  }, [selectedFramework]);

  // NEW: Clear selections when add competency section is closed
  useEffect(() => {
    if (!showAddCompetency) {
      setSelectedCompetencies(new Set());
      setSelectedFramework(null);
    }
  }, [showAddCompetency]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Load course basic information
      const courseData = await moodleService.getCourseDetails(courseId);
      setCourse(courseData);

      // Load course contents, enrolled users, and competencies in parallel
      const [contents, users, competencies] = await Promise.all([
        moodleService.getCourseContents(courseId).catch(() => []),
        moodleService.getEnrolledUsers(courseId).catch(() => []),
        moodleService.listCourseCompetencies(courseId).catch(() => [])
      ]);

      setCourseContents(contents);
      setEnrolledUsers(users);
      setCourseCompetencies(competencies);

    } catch (error) {
      console.error('Error loading course details:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = () => {
    // TODO: Implement course editing functionality
    console.log('Edit course:', courseId);
  };

  const handleDeleteCourse = () => {
    // TODO: Implement course deletion functionality
    console.log('Delete course:', courseId);
  };

  const handleManageUsers = () => {
    // TODO: Navigate to user management for this course
    console.log('Manage users for course:', courseId);
  };

  const handleViewAnalytics = () => {
    // TODO: Navigate to course analytics
    console.log('View analytics for course:', courseId);
  };

  // NEW: Load all available frameworks
  const loadFrameworks = async () => {
    try {
      setLoadingFrameworks(true);
      const frameworksData = await competencyService.listFrameworks();
      setFrameworks(frameworksData);
    } catch (error) {
      console.error('Error loading frameworks:', error);
      setError('Failed to load competency frameworks');
    } finally {
      setLoadingFrameworks(false);
    }
  };

  // NEW: Load competencies for selected framework
  const loadFrameworkCompetencies = async (frameworkId: number) => {
    try {
      setLoadingCompetencies(true);
      const competenciesData = await competencyService.getCompetenciesByFramework(frameworkId);
      
      // Build hierarchical structure
      const competencyMap: { [key: number]: Competency } = {};
      const rootCompetencies: Competency[] = [];

      // First pass: create all competency objects
      competenciesData.forEach(comp => {
        competencyMap[comp.id] = { ...comp, children: [] };
      });

      // Second pass: build hierarchy
      competenciesData.forEach(comp => {
        const competency = competencyMap[comp.id];
        if (comp.parentid && competencyMap[comp.parentid]) {
          const parent = competencyMap[comp.parentid];
          parent.children!.push(competency);
        } else {
          rootCompetencies.push(competency);
        }
      });

      setFrameworkCompetencies(rootCompetencies);
    } catch (error) {
      console.error('Error loading framework competencies:', error);
      setError('Failed to load competencies for selected framework');
    } finally {
      setLoadingCompetencies(false);
    }
  };

  // NEW: Toggle competency expansion
  const toggleCompetencyExpansion = (competencyId: number) => {
    const newExpanded = new Set(expandedCompetencies);
    if (newExpanded.has(competencyId.toString())) {
      newExpanded.delete(competencyId.toString());
    } else {
      newExpanded.add(competencyId.toString());
    }
    setExpandedCompetencies(newExpanded);
  };

  // NEW: Check if competency is already mapped to course
  const isCompetencyMapped = (competencyId: number) => {
    return courseCompetencies.some(comp => comp.id === competencyId.toString());
  };

  // NEW: Toggle competency selection
  const toggleCompetencySelection = (competencyId: number) => {
    const newSelected = new Set(selectedCompetencies);
    if (newSelected.has(competencyId)) {
      newSelected.delete(competencyId);
    } else {
      newSelected.add(competencyId);
    }
    setSelectedCompetencies(newSelected);
  };

  // NEW: Select all competencies in the current framework
  const selectAllCompetencies = () => {
    const allCompetencyIds = new Set<number>();
    
    const collectAllIds = (competencies: Competency[]) => {
      competencies.forEach(comp => {
        if (!isCompetencyMapped(comp.id)) {
          allCompetencyIds.add(comp.id);
        }
        if (comp.children && comp.children.length > 0) {
          collectAllIds(comp.children);
        }
      });
    };
    
    collectAllIds(frameworkCompetencies);
    setSelectedCompetencies(allCompetencyIds);
  };

  // NEW: Deselect all competencies
  const deselectAllCompetencies = () => {
    setSelectedCompetencies(new Set());
  };

  // NEW: Load detailed course contents
  const loadDetailedCourseContents = async () => {
    try {
      setLoadingDetailedContents(true);
      const contents = await moodleService.getDetailedCourseContents(courseId);
      setDetailedCourseContents(contents);
    } catch (error) {
      console.error('Error loading detailed course contents:', error);
      setError('Failed to load detailed course contents');
    } finally {
      setLoadingDetailedContents(false);
    }
  };

  // NEW: Toggle section expansion
  const toggleSectionExpansion = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // NEW: Get activity icon based on module type
  const getActivityIcon = (modname: string) => {
    switch (modname) {
      case 'assign':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <CheckCircle className="w-4 h-4" />;
      case 'forum':
        return <MessageSquare className="w-4 h-4" />;
      case 'resource':
      case 'file':
        return <Download className="w-4 h-4" />;
      case 'url':
        return <Share2 className="w-4 h-4" />;
      case 'page':
        return <BookOpen className="w-4 h-4" />;
      case 'lesson':
        return <Play className="w-4 h-4" />;
      case 'scorm':
        return <Code className="w-4 h-4" />;
      case 'choice':
        return <Award className="w-4 h-4" />;
      case 'feedback':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // NEW: Get activity color based on module type
  const getActivityColor = (modname: string) => {
    switch (modname) {
      case 'assign':
        return 'bg-orange-100 text-orange-600';
      case 'quiz':
        return 'bg-green-100 text-green-600';
      case 'forum':
        return 'bg-blue-100 text-blue-600';
      case 'resource':
      case 'file':
        return 'bg-purple-100 text-purple-600';
      case 'url':
        return 'bg-cyan-100 text-cyan-600';
      case 'page':
        return 'bg-indigo-100 text-indigo-600';
      case 'lesson':
        return 'bg-pink-100 text-pink-600';
      case 'scorm':
        return 'bg-gray-100 text-gray-600';
      case 'choice':
        return 'bg-yellow-100 text-yellow-600';
      case 'feedback':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // NEW: Handle SCORM activity viewing
  const handleViewScormActivity = async (module: CourseModule) => {
    try {
      console.log(`🔍 Opening SCORM activity: ${module.name} (ID: ${module.id})`);
      setScormLoading(true);
      setScormError('');
      
      // Get the SCORM content URL that can be embedded in iframe
      const contentUrl = await moodleService.getScormContentUrl(courseId, module.id.toString());
      
      // Set the SCORM viewer state
      setScormViewerUrl(contentUrl);
      setScormActivityName(module.name);
      setScormModuleId(module.id.toString());
      setShowScormViewer(true);
      setIsFullscreen(false);
      setScormLoading(false);
      
      console.log(`✅ SCORM viewer opened for: ${module.name}`);
    } catch (error) {
      console.error('❌ Error opening SCORM activity:', error);
      setScormLoading(false);
      setScormError('Failed to load SCORM activity. Please check your authentication or try again.');
      setError('Failed to open SCORM activity. Please try again.');
    }
  };

  // NEW: Close SCORM viewer
  const closeScormViewer = () => {
    setShowScormViewer(false);
    setScormViewerUrl('');
    setScormActivityName('');
    setScormModuleId('');
    setIsFullscreen(false);
    setScormLoading(false);
    setScormError('');
  };

  // NEW: Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // NEW: Batch add selected competencies to course
  const handleBatchAddCompetencies = async () => {
    if (selectedCompetencies.size === 0) {
      setError('Please select at least one competency to add');
      return;
    }

    try {
      setAddingCompetencies(true);
      setError('');
      
      const competencyIds = Array.from(selectedCompetencies);
      let successCount = 0;
      let errorCount = 0;

      // Add competencies one by one
      for (const competencyId of competencyIds) {
        try {
          const result = await moodleService.addCompetencyToCourse(courseId, competencyId.toString());
          if (result.success) {
            successCount++;
            console.log(`✅ Added competency ${competencyId} to course`);
          } else {
            errorCount++;
            console.error(`❌ Failed to add competency ${competencyId}:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error adding competency ${competencyId}:`, error);
        }
      }

      // Reload course competencies
      const updatedCompetencies = await moodleService.listCourseCompetencies(courseId);
      setCourseCompetencies(updatedCompetencies);
      
      // Clear selections
      setSelectedCompetencies(new Set());
      setShowAddCompetency(false);
      
      // Show results
      if (successCount > 0) {
        console.log(`✅ Successfully added ${successCount} competencies to course`);
      }
      if (errorCount > 0) {
        setError(`Failed to add ${errorCount} competencies. Check console for details.`);
      }
      
    } catch (error) {
      console.error('Error in batch add competencies:', error);
      setError('Failed to add selected competencies to course');
    } finally {
      setAddingCompetencies(false);
    }
  };

  // NEW: Render competency tree recursively
  const renderCompetencyTree = (competency: Competency, depth: number = 0) => {
    const isExpanded = expandedCompetencies.has(competency.id.toString());
    const hasChildren = competency.children && competency.children.length > 0;
    const isMapped = isCompetencyMapped(competency.id);
    const isSelected = selectedCompetencies.has(competency.id);

    return (
      <div key={competency.id} className="mb-2">
        <div 
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 ${
            isMapped ? 'bg-green-50 border border-green-200' : ''
          } ${isSelected ? 'bg-blue-50 border border-blue-200' : ''}`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleCompetencyExpansion(competency.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6"></div>
          )}
          
          {/* Checkbox for selection */}
          {!isMapped && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleCompetencySelection(competency.id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">{competency.shortname}</span>
              {isMapped && (
                <Badge className="bg-green-100 text-green-800 text-xs">Mapped</Badge>
              )}
              {isSelected && !isMapped && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">Selected</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 ml-6">{competency.idnumber}</p>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {competency.children!.map(child => renderCompetencyTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleAddCompetencyToCourse = async (competencyId: string) => {
    try {
      setMappingCompetency(true);
      const result = await moodleService.addCompetencyToCourse(courseId, competencyId);
      
      if (result.success) {
        // Reload course competencies
        const updatedCompetencies = await moodleService.listCourseCompetencies(courseId);
        setCourseCompetencies(updatedCompetencies);
        
        // Clear selection
        setShowAddCompetency(false);
        
        console.log('✅ Competency added to course successfully');
      } else {
        console.error('❌ Failed to add competency:', result.error);
        setError(result.error || 'Failed to add competency to course');
      }
    } catch (error) {
      console.error('Error adding competency to course:', error);
      setError('Failed to add competency to course');
    } finally {
      setMappingCompetency(false);
    }
  };

  const handleRemoveCompetencyFromCourse = async (competencyId: string) => {
    try {
      const result = await moodleService.removeCompetencyFromCourse(courseId, competencyId);
      
      if (result.success) {
        // Reload course competencies
        const updatedCompetencies = await moodleService.listCourseCompetencies(courseId);
        setCourseCompetencies(updatedCompetencies);
        
        console.log('✅ Competency removed from course successfully');
      } else {
        console.error('❌ Failed to remove competency:', result.error);
        setError(result.error || 'Failed to remove competency from course');
      }
    } catch (error) {
      console.error('Error removing competency from course:', error);
      setError('Failed to remove competency from course');
    }
  };

  const getCourseStatus = () => {
    if (!course) return 'Unknown';
    if (course.visible === 0) return 'Hidden';
    if (course.enddate && course.enddate < Date.now() / 1000) return 'Completed';
    if (course.startdate > Date.now() / 1000) return 'Not Started';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-yellow-100 text-yellow-800';
      case 'Hidden': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-700">{error || 'Course not found'}</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" size="sm" className="hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{course.fullname}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="font-medium">ID:</span>
                    <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{course.id}</span>
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium">Code:</span>
                    <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{course.shortname}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={`${getStatusColor(getCourseStatus())} px-3 py-1 text-sm font-medium`}>
                {getCourseStatus()}
              </Badge>
              <div className="flex items-center space-x-2">
                <Button onClick={handleEditCourse} variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Course
                </Button>
                <Button onClick={handleDeleteCourse} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Enrolled Students</p>
                <p className="text-3xl font-bold text-gray-900">{enrolledUsers.length}</p>
                <p className="text-xs text-green-600 mt-1">Active learners</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Course Modules</p>
                <p className="text-3xl font-bold text-gray-900">{courseContents.length}</p>
                <p className="text-xs text-blue-600 mt-1">Learning sections</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Duration</p>
                <p className="text-3xl font-bold text-gray-900">
                  {course.enddate ? 
                    Math.ceil((course.enddate - course.startdate) / (60 * 60 * 24)) : 
                    '∞'
                  }
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {course.enddate ? 'days' : 'Ongoing'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                <p className="text-lg font-bold text-gray-900 truncate">{course.categoryname || 'Uncategorized'}</p>
                <p className="text-xs text-orange-600 mt-1">Course type</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Course Details Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="h-auto bg-transparent p-0 w-full justify-start">
                <TabsTrigger 
                  value="overview" 
                  className="px-6 py-4 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="contents" 
                  className="px-6 py-4 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Course Contents
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="px-6 py-4 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Enrolled Users
                </TabsTrigger>
                <TabsTrigger 
                  value="competencies" 
                  className="px-6 py-4 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Competencies
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="px-6 py-4 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Course Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 block mb-1">Course Name</label>
                          <p className="text-gray-900 font-medium">{course.fullname}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 block mb-1">Short Name</label>
                          <p className="text-gray-900 font-mono bg-white px-3 py-1 rounded border">{course.shortname}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Start Date</label>
                            <p className="text-gray-900">
                              {new Date(course.startdate * 1000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {course.enddate && (
                            <div>
                              <label className="text-sm font-medium text-gray-600 block mb-1">End Date</label>
                              <p className="text-gray-900">
                                {new Date(course.enddate * 1000).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Format</label>
                            <Badge variant="outline" className="capitalize">
                              {course.format || 'Standard'}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Status</label>
                            <Badge className={course.visible ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                              {course.visible ? 'Visible' : 'Hidden'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Course Description
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      {course.summary ? (
                        <div 
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: course.summary }}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No description available</p>
                          <p className="text-sm text-gray-400 mt-1">Add a description to help students understand this course</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contents" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Course Contents</h3>
                    <p className="text-gray-600">All sections and activities in this course</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadDetailedCourseContents}
                      disabled={loadingDetailedContents}
                      className="hover:bg-blue-50"
                    >
                      {loadingDetailedContents ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </div>

                {loadingDetailedContents ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                      <span className="text-gray-600">Loading detailed course contents...</span>
                    </div>
                  </div>
                ) : detailedCourseContents.length > 0 ? (
                  <div className="space-y-4">
                    {detailedCourseContents.map((section) => {
                      const isExpanded = expandedSections.has(section.id);
                      const hasModules = section.modules && section.modules.length > 0;
                      
                      return (
                        <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Section Header */}
                          <div 
                            className="p-6 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSectionExpansion(section.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {section.name || `Section ${section.section}`}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Section {section.section} • {section.modules?.length || 0} activities
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {hasModules && (
                                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                    {isExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-600" />
                                    )}
                                  </button>
                                )}
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Section Summary */}
                            {section.summary && (
                              <div className="mt-3 ml-13">
                                <div 
                                  className="text-sm text-gray-600 prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: section.summary }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Section Activities */}
                          {hasModules && isExpanded && (
                            <div className="border-t border-gray-200 bg-gray-50">
                              <div className="p-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-3">
                                  Activities & Resources ({section.modules.length})
                                </h5>
                                <div className="space-y-2">
                                  {section.modules.map((module) => (
                                    <div 
                                      key={module.id} 
                                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                                    >
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(module.modname)}`}>
                                        {getActivityIcon(module.modname)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                          <h6 className="text-sm font-medium text-gray-900 truncate">
                                            {module.name}
                                          </h6>
                                          {module.visible === 0 && (
                                            <Badge className="bg-gray-100 text-gray-600 text-xs">Hidden</Badge>
                                          )}
                                          {module.completiondata?.hascompletion === 1 && (
                                            <Badge className="bg-green-100 text-green-600 text-xs">Completion</Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 capitalize">
                                          {module.modplural} • ID: {module.id}
                                        </p>
                                        {module.description && (
                                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {module.description.replace(/<[^>]*>/g, '')}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {module.url && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-blue-600 hover:text-blue-700"
                                            onClick={() => {
                                              if (module.modname === 'scorm') {
                                                handleViewScormActivity(module);
                                              } else {
                                                window.open(module.url, '_blank');
                                              }
                                            }}
                                            title={module.modname === 'scorm' ? 'View SCORM Package' : 'View Activity'}
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
                                          <Target className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No course contents found</h3>
                    <p className="text-gray-600 mb-4">This course doesn't have any sections or activities yet</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Section
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="users" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Enrolled Users</h3>
                    <p className="text-gray-600">{enrolledUsers.length} users enrolled in this course</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" className="hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export List
                    </Button>
                    <Button onClick={handleManageUsers} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                  </div>
                </div>

                {enrolledUsers.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Access</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {enrolledUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {user.firstname[0]}{user.lastname[0]}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {user.lastaccess ? 
                                    new Date(user.lastaccess * 1000).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) : 
                                    <span className="text-gray-400">Never</span>
                                  }
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                                  </div>
                                  <span className="text-sm text-gray-600">65%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled users</h3>
                    <p className="text-gray-600 mb-4">Students will appear here once they enroll in this course</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      Invite Students
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="competencies" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Course Competencies</h3>
                    <p className="text-gray-600">{courseCompetencies.length} competencies mapped to this course</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-gray-50"
                      onClick={() => setShowAddCompetency(!showAddCompetency)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {showAddCompetency ? 'Cancel' : 'Add Competency'}
                    </Button>
                  </div>
                </div>

                {/* Add Competency Section - NEW DESIGN */}
                {showAddCompetency && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-600" />
                      Add New Competency
                    </h4>
                    
                    {/* Step 1: Select Framework */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Step 1: Select Competency Framework
                        </label>
                        {loadingFrameworks ? (
                          <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                            <span className="text-gray-600">Loading frameworks...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {frameworks.map((framework) => (
                              <div
                                key={framework.id}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                  selectedFramework?.id === framework.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                onClick={() => setSelectedFramework(framework)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                    <Folder className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{framework.shortname}</h5>
                                    <p className="text-sm text-gray-600">{framework.idnumber}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Step 2: Select Competencies from Framework */}
                      {selectedFramework && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Step 2: Select Competencies from "{selectedFramework.shortname}"
                            </label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                {selectedCompetencies.size} selected
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllCompetencies}
                                disabled={loadingCompetencies}
                                className="text-xs"
                              >
                                Select All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={deselectAllCompetencies}
                                disabled={loadingCompetencies}
                                className="text-xs"
                              >
                                Deselect All
                              </Button>
                            </div>
                          </div>
                          
                          {loadingCompetencies ? (
                            <div className="flex items-center justify-center py-8">
                              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                              <span className="text-gray-600">Loading competencies...</span>
                            </div>
                          ) : (
                            <div className="bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                              {frameworkCompetencies.length > 0 ? (
                                <div className="p-4">
                                  {frameworkCompetencies.map((competency) => (
                                    <div key={competency.id} className="mb-2">
                                      {renderCompetencyTree(competency, 0)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p>No competencies found in this framework</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Batch Add Button */}
                          {selectedCompetencies.size > 0 && (
                            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Target className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {selectedCompetencies.size} competencies selected
                                </span>
                              </div>
                              <Button
                                onClick={handleBatchAddCompetencies}
                                disabled={addingCompetencies}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {addingCompetencies ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Selected to Course
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Competencies */}
                {courseCompetencies.length > 0 ? (
                  <div className="space-y-4">
                    {courseCompetencies.map((competency) => (
                      <div key={competency.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <Target className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{competency.fullname}</h4>
                              <p className="text-sm text-gray-600">{competency.shortname}</p>
                              {competency.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {competency.description.replace(/<[^>]*>/g, '')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="capitalize">
                              {competency.ruleoutcome === 1 ? 'Pass' : competency.ruleoutcome === 0 ? 'Fail' : 'Not Set'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCompetencyFromCourse(competency.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No competencies mapped</h3>
                    <p className="text-gray-600 mb-4">Add competencies to define learning outcomes for this course</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAddCompetency(true)}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Map Competencies
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Course Analytics</h3>
                    <p className="text-gray-600">Performance metrics and insights for this course</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" className="hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button onClick={handleViewAnalytics} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </div>
                </div>

                {/* Analytics Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Completion Rate</h4>
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">78%</div>
                    <div className="text-sm text-gray-600">Average completion rate</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Engagement</h4>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">4.2h</div>
                    <div className="text-sm text-gray-600">Average time spent</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Satisfaction</h4>
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">4.8/5</div>
                    <div className="text-sm text-gray-600">Student rating</div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      We're working on comprehensive analytics including detailed performance metrics, 
                      engagement tracking, and predictive insights.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        Completion tracking
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        Engagement metrics
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                        Predictive insights
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* SCORM Viewer Modal */}
      {showScormViewer && (
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
          <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6 max-w-6xl'}`}>
            <ScormPlayer
              packageUrl={scormViewerUrl}
              title={scormActivityName}
              onClose={closeScormViewer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseDetail;
