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
  X,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Folder,
  FolderOpen
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { competencyService, CompetencyFramework, Competency } from '../../services/competencyService';

const CompetenciesMap: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<CompetencyFramework | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [frameworkCompetencies, setFrameworkCompetencies] = useState<Competency[]>([]);

  // Form states for creating/editing competencies
  const [formData, setFormData] = useState({
    shortname: '',
    idnumber: '',
    description: '',
    competencyframeworkid: 0,
    parentid: 0,
    sortorder: 0
  });

  // Tree view states
  interface TreeNode {
    id: number;
    shortname: string;
    description: string;
    idnumber: string;
    competencyframeworkid: number;
    parentid: number;
    sortorder: number;
    children: TreeNode[];
    expanded: boolean;
    level: number;
  }

  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);

  useEffect(() => {
    fetchCompetenciesData();
  }, []);

  // Rebuild tree structure whenever framework competencies change
  useEffect(() => {
    if (frameworkCompetencies.length > 0) {
      buildTreeStructure(frameworkCompetencies);
    } else {
      setTreeData([]);
    }
  }, [frameworkCompetencies]);

  const fetchCompetenciesData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching competency data from Moodle API...');
      
      // Test API connection first
      const isConnected = await competencyService.testConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to competency API. Please check your Moodle configuration.');
      }

      // Fetch all frameworks and competencies
      const { frameworks: fetchedFrameworks, competencies: fetchedCompetencies } = 
        await competencyService.getAllFrameworksWithCompetencies();
      
      setFrameworks(fetchedFrameworks);
      setCompetencies(fetchedCompetencies);
      
      // Build tree structure
      buildTreeStructure(fetchedCompetencies);
      
      console.log(`✅ Loaded ${fetchedFrameworks.length} frameworks and ${fetchedCompetencies.length} competencies`);
      
    } catch (error) {
      console.error('❌ Error fetching competency data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch competency data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical tree structure from flat competencies array
  const buildTreeStructure = (competencies: Competency[]) => {
    const competencyMap: { [key: number]: TreeNode } = {};
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    competencies.forEach(comp => {
      const node: TreeNode = {
        id: comp.id,
        shortname: comp.shortname,
        description: comp.description,
        idnumber: comp.idnumber,
        competencyframeworkid: comp.competencyframeworkid,
        parentid: comp.parentid,
        sortorder: comp.sortorder,
        children: [],
        expanded: expandedNodes.has(comp.id),
        level: 0
      };
      competencyMap[comp.id] = node;
    });

    // Second pass: build parent-child relationships
    competencies.forEach(comp => {
      const node = competencyMap[comp.id];
      if (!node) return;

      if (comp.parentid === 0) {
        // Root node
        rootNodes.push(node);
      } else {
        // Child node
        const parent = competencyMap[comp.parentid];
        if (parent) {
          parent.children.push(node);
          node.level = parent.level + 1;
        } else {
          // Parent not found, treat as root
          rootNodes.push(node);
        }
      }
    });

    // Sort nodes by sortorder
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => a.sortorder - b.sortorder).map(node => ({
        ...node,
        children: sortNodes(node.children)
      }));
    };

    setTreeData(sortNodes(rootNodes));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCompetenciesData();
    setRefreshing(false);
  };

  // Tree view functions
  const toggleNode = (nodeId: number) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
      } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
    
    // Update tree data with new expanded state
    const updateNodeExpansion = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => ({
        ...node,
        expanded: newExpandedNodes.has(node.id),
        children: updateNodeExpansion(node.children)
      }));
    };
    setTreeData(updateNodeExpansion(treeData));
  };

  const handleDragStart = (e: React.DragEvent, node: TreeNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetNode: TreeNode) => {
    e.preventDefault();
    
    if (!draggedNode || draggedNode.id === targetNode.id) {
      return;
    }

    // Here you would implement the logic to update the parent-child relationship
    // and call the API to update the competency's parentid
    console.log(`Moving ${draggedNode.shortname} to be child of ${targetNode.shortname}`);
    
    // TODO: Implement API call to update competency parent
    // await competencyService.updateCompetency(draggedNode.id, { parentid: targetNode.id });
    
    setDraggedNode(null);
  };

  const handleFrameworkSelect = async (framework: CompetencyFramework) => {
    setSelectedFramework(framework);
    setExpandedNodes(new Set()); // Clear expanded nodes when switching frameworks
    setSelectedCompetency(null); // Clear selected competency
    try {
      const competencies = await competencyService.getCompetenciesByFramework(framework.id);
      setFrameworkCompetencies(competencies);
      console.log(`✅ Loaded ${competencies.length} competencies for framework: ${framework.shortname}`);
    } catch (error) {
      console.error('❌ Error fetching framework competencies:', error);
      setError('Failed to fetch competencies for selected framework.');
    }
  };

  const handleShowAllCompetencies = async () => {
    setSelectedFramework(null);
    setExpandedNodes(new Set()); // Clear expanded nodes
    setSelectedCompetency(null); // Clear selected competency
    try {
      // Get all competencies from all frameworks
      const { competencies: allCompetencies } = await competencyService.getAllFrameworksWithCompetencies();
      setFrameworkCompetencies(allCompetencies);
      console.log(`✅ Loaded ${allCompetencies.length} competencies from all frameworks`);
    } catch (error) {
      console.error('❌ Error fetching all competencies:', error);
      setError('Failed to fetch all competencies.');
    }
  };

  const handleCompetencyClick = async (competency: Competency) => {
    setSelectedCompetency(competency);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If no search term, show all competencies
      await fetchCompetenciesData();
        return;
      }
      
      try {
      setLoading(true);
      const searchResults = await competencyService.searchCompetencies(
        searchTerm, 
        selectedFramework?.id
      );
      setCompetencies(searchResults);
      console.log(`✅ Found ${searchResults.length} competencies matching "${searchTerm}"`);
    } catch (error) {
      console.error('❌ Error searching competencies:', error);
      setError('Failed to search competencies.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompetency = () => {
    setFormData({
      shortname: '',
      idnumber: '',
      description: '',
      competencyframeworkid: selectedFramework?.id || 0,
      parentid: 0,
      sortorder: 0
    });
    setShowCreateModal(true);
  };

  const handleEditCompetency = (competency: Competency) => {
    setEditingCompetency(competency);
    setFormData({
      shortname: competency.shortname,
      idnumber: competency.idnumber,
      description: competency.description,
      competencyframeworkid: competency.competencyframeworkid,
      parentid: competency.parentid,
      sortorder: competency.sortorder
    });
    setShowEditModal(true);
  };

  const handleDeleteCompetency = async (competency: Competency) => {
    if (window.confirm(`Are you sure you want to delete the competency "${competency.shortname}"?`)) {
      try {
        // Note: Delete functionality would need to be implemented in the service
        console.log('🗑️ Delete competency:', competency.shortname);
        // await competencyService.deleteCompetency(competency.id);
        await handleRefresh();
    } catch (error) {
        console.error('❌ Error deleting competency:', error);
        setError('Failed to delete competency.');
      }
    }
  };

  const filteredCompetencies = frameworkCompetencies.filter(competency => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      competency.shortname.toLowerCase().includes(searchLower) ||
      competency.description.toLowerCase().includes(searchLower) ||
      competency.idnumber.toLowerCase().includes(searchLower)
    );
  });

  const getCompetencyIcon = (competency: Competency) => {
    const name = competency.shortname.toLowerCase();
    if (name.includes('digital') || name.includes('tech')) return <Code className="w-5 h-5" />;
    if (name.includes('design') || name.includes('creative')) return <Palette className="w-5 h-5" />;
    if (name.includes('math') || name.includes('calculate')) return <Calculator className="w-5 h-5" />;
    if (name.includes('language') || name.includes('communication')) return <Globe className="w-5 h-5" />;
    if (name.includes('science') || name.includes('research')) return <Zap className="w-5 h-5" />;
    if (name.includes('art') || name.includes('creative')) return <Star className="w-5 h-5" />;
    return <BookOpen className="w-5 h-5" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    const cleanText = stripHtmlTags(text);
    return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading competencies...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Tree Node Component
  const TreeNodeComponent: React.FC<{ node: TreeNode }> = ({ node }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div className="select-none">
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer group ${
            selectedCompetency?.id === node.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${node.level * 20 + 12}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node)}
          onClick={() => setSelectedCompetency(node as any)}
        >
          {/* Drag Handle */}
          <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          {/* Node Icon */}
          <div className="mr-3">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <Folder className="w-4 h-4 text-blue-600" />
              )
            ) : (
              <Target className="w-4 h-4 text-gray-500" />
            )}
          </div>

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {node.shortname}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {truncateText(node.description, 60)}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCompetency(node as any);
                    setShowEditModal(true);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCompetency(node as any);
                  }}
                  className="p-1 hover:bg-red-100 rounded text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => (
              <TreeNodeComponent key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin"}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Competencies Map</h1>
              <p className="text-gray-600">Manage competency frameworks and competencies</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button 
                onClick={handleCreateCompetency}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Competency</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Framework Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Competency Framework</h2>
                <p className="text-gray-600 mt-1">Choose a framework to view its competencies and statistics</p>
              </div>
              <div className="text-sm text-gray-500">
                {frameworks.length} frameworks available
              </div>
            </div>

            {/* Framework Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frameworks.map((framework) => (
                <div 
                  key={framework.id} 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedFramework?.id === framework.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                  onClick={() => handleFrameworkSelect(framework)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{framework.shortname}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      framework.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {framework.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{truncateText(framework.description, 80)}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-medium">{framework.competenciescount} competencies</span>
                    <span>{formatDate(framework.timecreated)}</span>
                  </div>
                  {selectedFramework?.id === framework.id && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center text-blue-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Selected
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Show All Option */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleShowAllCompetencies}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedFramework === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Show All Competencies from All Frameworks
              </button>
            </div>
          </div>

          {/* Statistics and Content - Only show after framework selection */}
          {selectedFramework && (
            <>
              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Selected Framework</p>
                      <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">
                        {selectedFramework.shortname}
                      </h3>
                    </div>
                    <Map className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Competencies</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{frameworkCompetencies.length}</h3>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Root Competencies</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{treeData.length}</h3>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Filtered Results</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{filteredCompetencies.length}</h3>
                    </div>
                    <Filter className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Search and Filters - Only show after framework selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={`Search competencies in ${selectedFramework.shortname}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Competencies Tree View - Only show after framework selection */}
          {selectedFramework && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Competencies Hierarchy</h2>
                    <p className="text-sm text-blue-600 mt-1">
                      Showing competencies from: <span className="font-medium">{selectedFramework.shortname}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {treeData.length} root competencies
                    </span>
                    <button 
                      onClick={() => {
                        // Expand all nodes
                        const allNodeIds = new Set<number>();
                        const collectNodeIds = (nodes: TreeNode[]) => {
                          nodes.forEach(node => {
                            allNodeIds.add(node.id);
                            collectNodeIds(node.children);
                          });
                        };
                        collectNodeIds(treeData);
                        setExpandedNodes(allNodeIds);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Expand All
                    </button>
                    <button 
                      onClick={() => setExpandedNodes(new Set())}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>
              </div>
          
              <div className="p-4">
                {treeData.length > 0 ? (
                  <div className="space-y-1">
                    {treeData.map((node) => (
                      <TreeNodeComponent key={node.id} node={node} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No competencies found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Create a new competency to get started.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Welcome Message - Show when no framework is selected */}
          {!selectedFramework && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Competencies Map</h3>
                <p className="text-gray-600 mb-4">
                  Select a competency framework above to view its competencies, statistics, and hierarchical structure.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    View competency hierarchies
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Analyze framework statistics
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Search and filter competencies
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Competency Detail Modal */}
        {selectedCompetency && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCompetency.shortname}</h2>
                    <p className="text-gray-600 mt-1">{stripHtmlTags(selectedCompetency.description)}</p>
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
                        <span className="text-gray-500">ID:</span>
                        <span className="font-medium">{selectedCompetency.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Short Name:</span>
                        <span className="font-medium">{selectedCompetency.shortname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ID Number:</span>
                        <span className="font-medium">{selectedCompetency.idnumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Framework ID:</span>
                        <span className="font-medium">{selectedCompetency.competencyframeworkid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Parent ID:</span>
                        <span className="font-medium">{selectedCompetency.parentid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sort Order:</span>
                        <span className="font-medium">{selectedCompetency.sortorder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Scale ID:</span>
                        <span className="font-medium">{selectedCompetency.scaleid}</span>
                    </div>
                        </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                      <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium">{formatDate(selectedCompetency.timecreated)}</span>
                              </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Modified:</span>
                        <span className="font-medium">{formatDate(selectedCompetency.timemodified)}</span>
                                </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">User Modified:</span>
                        <span className="font-medium">{selectedCompetency.usermodified}</span>
                              </div>
                            </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Path</h4>
                      <p className="text-sm text-gray-600">{selectedCompetency.path}</p>
                          </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Rule Configuration</h4>
                      <p className="text-sm text-gray-600">
                        Type: {selectedCompetency.ruletype} | Outcome: {selectedCompetency.ruleoutcome}
                      </p>
                      </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedCompetency(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                <button
                  onClick={() => {
                      setSelectedCompetency(null);
                      handleEditCompetency(selectedCompetency);
                  }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Edit Competency
                </button>
              </div>
                      </div>
                      </div>
                      </div>
                    )}

        {/* Create/Edit Modal Placeholder */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showCreateModal ? 'Create New Competency' : 'Edit Competency'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Name
                  </label>
                  <input
                    type="text"
                    value={formData.shortname}
                    onChange={(e) => setFormData({...formData, shortname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.idnumber}
                    onChange={(e) => setFormData({...formData, idnumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingCompetency(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement create/update functionality
                    console.log('Save competency:', formData);
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingCompetency(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showCreateModal ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompetenciesMap;