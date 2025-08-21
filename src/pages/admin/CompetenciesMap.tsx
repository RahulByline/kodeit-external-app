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

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  categoryid: number;
  categoryname: string;
  courseimage?: string;
  overviewfiles?: any[];
  summaryfiles?: any[];
  startdate?: number;
  enddate?: number;
  visible: number;
  format: string;
  modules: any[];
  competencies?: string[];
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
  const [showLearningPlans, setShowLearningPlans] = useState(false);
  const [learningPlans, setLearningPlans] = useState<any[]>([]);
  
  // Real courses functionality
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourses, setShowCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseCompetencies, setCourseCompetencies] = useState<Competency[]>([]);
  
  // Grading functionality
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingCompetency, setGradingCompetency] = useState<Competency | null>(null);
  const [gradeValue, setGradeValue] = useState(0);
  const [gradeNote, setGradeNote] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [competencyScales, setCompetencyScales] = useState<any[]>([]);
  const [selectedScale, setSelectedScale] = useState<any>(null);
  
  // Learning plan grading functionality
  const [showPlanGradingModal, setShowPlanGradingModal] = useState(false);
  const [planGradingCompetency, setPlanGradingCompetency] = useState<Competency | null>(null);
  const [planGradingPlan, setPlanGradingPlan] = useState<any>(null);
  const [planGradeValue, setPlanGradeValue] = useState(0);
  const [planGradeNote, setPlanGradeNote] = useState('');
  const [planGradingLoading, setPlanGradingLoading] = useState(false);

  useEffect(() => {
    fetchCompetenciesData();
    fetchCompetencyScales();
    fetchRealCourses();
  }, []);

  const fetchCompetencyScales = async () => {
    try {
      const scales = await moodleService.getCompetencyScales();
      setCompetencyScales(scales);
      if (scales.length > 0) {
        setSelectedScale(scales[0]);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load competency scales:', error);
    }
  };

  const fetchRealCourses = async () => {
    try {
      console.log('🔍 Fetching real courses from IOMAD/Moodle API...');
      const coursesData = await moodleService.getAllCourses();
      console.log(`✅ Real courses loaded: ${coursesData.length}`);
      
      // Transform courses to include competency information
      const transformedCourses = coursesData.map((course: any) => ({
        ...course,
        competencies: [], // Will be populated when linking competencies
        categoryname: course.categoryname || 'General'
      }));
      
      setCourses(transformedCourses);
    } catch (error) {
      console.warn('⚠️ Failed to load real courses:', error);
      setCourses([]);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    // Generate competencies for this course
    const courseCompetencies = moodleService.generateCourseCompetencies(course, course.id);
    setCourseCompetencies(courseCompetencies);
  };

  const linkCompetencyToCourse = (competencyId: string, courseId: number) => {
    const courseName = courses.find(c => c.id === courseId)?.fullname || '';
    
    setCompetencies(prev => prev.map(comp => {
      if (comp.id === competencyId) {
        const newRelatedCourses = [...comp.relatedCourses];
        if (!newRelatedCourses.includes(courseName)) {
          newRelatedCourses.push(courseName);
        }
        return { ...comp, relatedCourses: newRelatedCourses };
      }
      return comp;
    }));
    
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const newCompetencies = [...(course.competencies || [])];
        if (!newCompetencies.includes(competencyId)) {
          newCompetencies.push(competencyId);
        }
        return { ...course, competencies: newCompetencies };
      }
      return course;
    }));
    
    console.log(`✅ Linked competency "${competencies.find(c => c.id === competencyId)?.name}" to course "${courseName}"`);
  };

  const handleGradeCompetency = async () => {
    if (!gradingCompetency || !currentUser) return;

    setGradingLoading(true);
    try {
      const result = await moodleService.gradeCompetency(
        currentUser.id || currentUser.userid,
        parseInt(gradingCompetency.id.replace('comp_', '')),
        gradeValue,
        gradeNote
      );

      if (result.success) {
        // Update the competency in the list
        setCompetencies(prev => prev.map(comp => 
          comp.id === gradingCompetency.id 
            ? { ...comp, grade: gradeValue, timemodified: Math.floor(Date.now() / 1000) }
            : comp
        ));
        
        // Close modal and reset
        setShowGradingModal(false);
        setGradingCompetency(null);
        setGradeValue(0);
        setGradeNote('');
        
        // Show success message
        alert('Competency graded successfully!');
      } else {
        alert(`Failed to grade competency: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error grading competency:', error);
      alert('Failed to grade competency. Please try again.');
    } finally {
      setGradingLoading(false);
    }
  };

  const openGradingModal = (competency: Competency) => {
    setGradingCompetency(competency);
    setGradeValue(competency.grade || 0);
    setGradeNote('');
    setShowGradingModal(true);
  };

  const openPlanGradingModal = (competency: Competency, plan: any) => {
    setPlanGradingCompetency(competency);
    setPlanGradingPlan(plan);
    setPlanGradeValue(competency.grade || 0);
    setPlanGradeNote('');
    setShowPlanGradingModal(true);
  };

  const handleGradeCompetencyInPlan = async () => {
    if (!planGradingCompetency || !planGradingPlan) return;

    setPlanGradingLoading(true);
    try {
      const result = await moodleService.gradeCompetencyInPlan(
        planGradingPlan.id,
        parseInt(planGradingCompetency.id.replace('comp_', '')),
        planGradeValue,
        planGradeNote
      );

      if (result.success) {
        // Update the competency in the list
        setCompetencies(prev => prev.map(comp => 
          comp.id === planGradingCompetency.id 
            ? { ...comp, grade: planGradeValue, timemodified: Math.floor(Date.now() / 1000) }
            : comp
        ));
        
        // Close modal and reset
        setShowPlanGradingModal(false);
        setPlanGradingCompetency(null);
        setPlanGradingPlan(null);
        setPlanGradeValue(0);
        setPlanGradeNote('');
        
        // Show success message
        alert('Competency graded in plan successfully!');
      } else {
        alert(`Failed to grade competency in plan: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error grading competency in plan:', error);
      alert('Failed to grade competency in plan. Please try again.');
    } finally {
      setPlanGradingLoading(false);
    }
  };

  const fetchCompetenciesData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching comprehensive competency data from IOMAD/Moodle API...');
      
      // Fetch comprehensive competency data with error handling for each call
      let frameworksResult = [];
      let competenciesResult = [];
      let learningPlansResult = [];

      try {
        frameworksResult = await moodleService.getCompetencyFrameworksWithCompetencies();
        console.log(`✅ Frameworks loaded: ${frameworksResult.length}`);
      } catch (error) {
        console.warn('⚠️ Failed to load frameworks, using fallback:', error);
        frameworksResult = [];
      }

      try {
        // Try to get user competencies first
        competenciesResult = await moodleService.getUserCompetencies();
        console.log(`✅ User competencies loaded: ${competenciesResult.length}`);
        
        // If no user competencies, try to list all competencies
        if (competenciesResult.length === 0) {
          console.log('🔄 No user competencies found, trying to list all competencies...');
          const allCompetencies = await moodleService.listCompetencies();
          if (allCompetencies.length > 0) {
            // Transform the raw competency data to match our interface
            competenciesResult = allCompetencies.map((comp: any, index: number) => ({
              id: `comp_${comp.id || index + 1}`,
              name: comp.shortname || comp.name || `Competency ${index + 1}`,
              category: 'General',
              description: comp.description || 'No description available',
              level: 'intermediate' as const,
              status: 'not_started' as const,
              progress: 0,
              relatedCourses: [],
              skills: [],
              estimatedTime: '2-4 weeks',
              prerequisites: [],
              nextSteps: [],
              frameworkid: comp.competencyframeworkid,
              grade: 0,
              proficiency: 0,
              timecreated: comp.timecreated,
              timemodified: comp.timemodified
            }));
            console.log(`✅ Transformed ${competenciesResult.length} competencies from list`);
          }
        }
        
        // Link competencies to real courses if we have both
        if (competenciesResult.length > 0) {
          console.log('🔗 Linking competencies to real courses...');
          const allCourses = await moodleService.getAllCourses();
          
          competenciesResult = competenciesResult.map(comp => {
            // Link competencies to real courses based on keywords
            const linkedCourses = allCourses
              .filter(course => {
                const courseKeywords = `${course.fullname} ${course.shortname} ${course.summary || ''}`.toLowerCase();
                const compKeywords = `${comp.name}`.toLowerCase();
                return courseKeywords.includes(compKeywords) || 
                       courseKeywords.includes('digital') || 
                       courseKeywords.includes('assessment') ||
                       courseKeywords.includes('discipline');
              })
              .map(course => course.fullname);
            
            return {
              ...comp,
              relatedCourses: linkedCourses
            };
          });
          
          console.log(`✅ Linked ${competenciesResult.length} competencies to courses`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load competencies, using fallback:', error);
        competenciesResult = [];
      }

      try {
        learningPlansResult = await moodleService.getCompetencyLearningPlans();
        console.log(`✅ Learning plans loaded: ${learningPlansResult.length}`);
      } catch (error) {
        console.warn('⚠️ Failed to load learning plans, using fallback:', error);
        learningPlansResult = [];
      }
      
      // Only use real data - no mock data fallback
      if (frameworksResult.length === 0 && competenciesResult.length === 0 && learningPlansResult.length === 0) {
        console.log('⚠️ No real data available from IOMAD/Moodle API');
        setError('No competency data found. Please ensure competency features are enabled in your IOMAD/Moodle instance.');
        setLoading(false);
        return;
      }
      
      setFrameworks(frameworksResult);
      setCompetencies(competenciesResult);
      setLearningPlans(learningPlansResult);
      
      console.log(`✅ Final data loaded: ${frameworksResult.length} frameworks, ${competenciesResult.length} competencies, and ${learningPlansResult.length} learning plans`);
      console.log('📊 Competency Data Summary:', {
        frameworks: frameworksResult.length,
        competencies: competenciesResult.length,
        learningPlans: learningPlansResult.length,
        categories: Array.from(new Set(competenciesResult.map(c => c.category))).length,
        levels: Array.from(new Set(competenciesResult.map(c => c.level))),
        statuses: Array.from(new Set(competenciesResult.map(c => c.status)))
      });
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
      <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin"}>
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
    <DashboardLayout userRole="admin" userName={currentUser?.fullname || "Admin"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competencies Map</h1>
            <p className="text-gray-600">Track your learning journey and skill development with real competency data</p>
          </div>
                     <div className="flex items-center space-x-3">
             <button 
               onClick={() => setShowLearningPlans(!showLearningPlans)}
               className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
             >
               <BookOpen className="w-4 h-4" />
               <span>{showLearningPlans ? 'Hide' : 'Show'} Learning Plans</span>
             </button>
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

         {/* Learning Plans Section */}
         {showLearningPlans && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900">Learning Plans</h2>
               <span className="text-sm text-gray-500">{learningPlans.length} plans available</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {learningPlans.map((plan) => (
                 <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                     <span className={`px-2 py-1 text-xs rounded-full ${
                       plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                     }`}>
                       {plan.status}
                     </span>
                   </div>
                   <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                   <div className="flex justify-between text-sm text-gray-500">
                     <span>{plan.competenciescount} competencies</span>
                     <span>{plan.coursescount} courses</span>
                   </div>
                   <div className="mt-3 pt-3 border-t border-gray-100">
                     <div className="flex justify-between text-xs text-gray-500">
                       <span>Due: {new Date(plan.duedate * 1000).toLocaleDateString()}</span>
                       <span>Created: {new Date(plan.timecreated * 1000).toLocaleDateString()}</span>
                     </div>
                   </div>
                   
                   {/* Plan Competencies with Grading */}
                   <div className="mt-4 pt-3 border-t border-gray-100">
                     <h4 className="text-sm font-medium text-gray-900 mb-2">Plan Competencies</h4>
                     <div className="space-y-2">
                       {competencies
                         .filter(comp => comp.frameworkid === plan.templateid)
                         .slice(0, 3) // Show first 3 competencies
                         .map((competency) => (
                           <div key={competency.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                             <div className="flex-1">
                               <p className="text-xs font-medium text-gray-900">{competency.name}</p>
                               <p className="text-xs text-gray-500">{competency.status}</p>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-xs text-gray-500">
                                 Grade: {competency.grade || 0}
                               </span>
                               <button
                                 onClick={() => openPlanGradingModal(competency, plan)}
                                 className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                               >
                                 Grade
                               </button>
                             </div>
                           </div>
                         ))}
                       {competencies.filter(comp => comp.frameworkid === plan.templateid).length > 3 && (
                         <p className="text-xs text-gray-500 text-center">
                           +{competencies.filter(comp => comp.frameworkid === plan.templateid).length - 3} more competencies
                         </p>
                       )}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Real Courses Section */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-900">Real Courses from IOMAD/Moodle</h2>
             <div className="flex items-center space-x-3">
               <button 
                 onClick={() => setShowCourses(!showCourses)}
                 className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
               >
                 <BookOpen className="w-4 h-4" />
                 <span>{showCourses ? 'Hide' : 'Show'} Courses ({courses.length})</span>
               </button>
             </div>
           </div>
           
           {/* Debug: Show competency-course links */}
           <div className="mb-4 p-4 bg-blue-50 rounded-lg">
             <h3 className="text-sm font-semibold text-blue-900 mb-2">🔗 Competency-Course Links Status:</h3>
             <div className="text-xs text-blue-800">
               <p>✅ Found {competencies.length} competencies</p>
               <p>✅ Found {courses.length} courses</p>
               <p>🔗 Competencies with linked courses: {competencies.filter(c => c.relatedCourses && c.relatedCourses.length > 0).length}</p>
               <p>📊 Total competency-course links: {competencies.reduce((total, c) => total + (c.relatedCourses?.length || 0), 0)}</p>
             </div>
             
             {/* Show actual competency-course mappings */}
             <div className="mt-3 pt-3 border-t border-blue-200">
               <h4 className="text-xs font-semibold text-blue-900 mb-2">📋 Competency-Course Mappings:</h4>
               <div className="space-y-1">
                 {competencies.map((comp, index) => (
                   <div key={comp.id} className="text-xs">
                     <span className="font-medium text-blue-900">"{comp.name}"</span>
                     {comp.relatedCourses && comp.relatedCourses.length > 0 ? (
                       <span className="text-blue-700"> → {comp.relatedCourses.join(', ')}</span>
                     ) : (
                       <span className="text-red-600"> → No courses linked</span>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           </div>
           
           {showCourses && (
             <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {courses.map((course) => (
                   <div 
                     key={course.id} 
                     className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => handleCourseClick(course)}
                   >
                     <div className="flex items-center justify-between mb-3">
                       <h3 className="font-semibold text-gray-900 text-sm">{course.fullname}</h3>
                       <span className={`px-2 py-1 text-xs rounded-full ${
                         course.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                       }`}>
                         {course.visible ? 'Active' : 'Hidden'}
                       </span>
                     </div>
                     <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.summary}</p>
                     <div className="flex justify-between text-xs text-gray-500">
                       <span>ID: {course.id}</span>
                       <span>{course.format}</span>
                     </div>
                     <div className="mt-2 pt-2 border-t border-gray-100">
                       <div className="flex justify-between text-xs text-gray-500">
                         <span>Category: {course.categoryname}</span>
                         <span>{course.competencies?.length || 0} competencies</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               
               {courses.length === 0 && (
                 <div className="text-center py-8">
                   <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-500">No courses found. Please check your IOMAD/Moodle connection.</p>
                 </div>
               )}
             </div>
           )}
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

                  {competency.relatedCourses && competency.relatedCourses.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Linked Courses:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competency.relatedCourses.slice(0, 2).map((courseName, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {courseName}
                          </span>
                        ))}
                        {competency.relatedCourses.length > 2 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            +{competency.relatedCourses.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompetencyClick(competency);
                      }}
                    >
                      {competency.status === 'not_started' ? 'Start Learning' :
                       competency.status === 'in_progress' ? 'Continue' : 'Review'}
                    </button>
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGradingModal(competency);
                      }}
                    >
                      Grade
                    </button>
                    <button 
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCourses(true);
                      }}
                    >
                      Link Course
                    </button>
                  </div>
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
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompetencyClick(competency);
                            }}
                          >
                            View Details
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGradingModal(competency);
                            }}
                          >
                            Grade
                          </button>
                        </div>
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

                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => handleCompetencyClick(competency)}
                  >
                    View Details
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={() => openGradingModal(competency)}
                  >
                    Grade
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

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{selectedCourse.fullname}</h3>
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    setCourseCompetencies([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course ID:</span>
                        <span className="font-medium">{selectedCourse.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Short Name:</span>
                        <span className="font-medium">{selectedCourse.shortname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedCourse.categoryname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">{selectedCourse.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${selectedCourse.visible ? 'text-green-600' : 'text-gray-600'}`}>
                          {selectedCourse.visible ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Course Summary</h4>
                    <p className="text-sm text-gray-600">{selectedCourse.summary}</p>
                  </div>
                </div>
                
                {/* Course Competencies */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Course Competencies</h4>
                    {courseCompetencies.length > 0 ? (
                      <div className="space-y-2">
                        {courseCompetencies.map((competency) => (
                          <div key={competency.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{competency.name}</p>
                              <p className="text-xs text-gray-500">{competency.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(competency.status)}`}>
                                {competency.status}
                              </span>
                              <button
                                onClick={() => linkCompetencyToCourse(competency.id, selectedCourse.id)}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                Link
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No competencies generated for this course yet.</p>
                        <button
                          onClick={() => {
                            const newCompetencies = moodleService.generateCourseCompetencies(selectedCourse, selectedCourse.id);
                            setCourseCompetencies(newCompetencies);
                          }}
                          className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Generate Competencies
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Link to Existing Competencies</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {competencies.slice(0, 5).map((competency) => (
                        <div key={competency.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{competency.name}</p>
                            <p className="text-xs text-gray-500">{competency.category}</p>
                          </div>
                          <button
                            onClick={() => linkCompetencyToCourse(competency.id, selectedCourse.id)}
                            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                          >
                            Link
                          </button>
                        </div>
                      ))}
                      {competencies.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{competencies.length - 5} more competencies available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    setCourseCompetencies([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grading Modal */}
        {showGradingModal && gradingCompetency && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Grade Competency: {gradingCompetency.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={gradeNote}
                    onChange={(e) => setGradeNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a note about this grade..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowGradingModal(false);
                    setGradingCompetency(null);
                    setGradeValue(0);
                    setGradeNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeCompetency}
                  disabled={gradingLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {gradingLoading ? 'Grading...' : 'Submit Grade'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan Grading Modal */}
        {showPlanGradingModal && planGradingCompetency && planGradingPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Grade Competency in Plan: {planGradingCompetency.name}
              </h3>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Plan:</strong> {planGradingPlan.name}
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={planGradeValue}
                    onChange={(e) => setPlanGradeValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={planGradeNote}
                    onChange={(e) => setPlanGradeNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a note about this grade..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPlanGradingModal(false);
                    setPlanGradingCompetency(null);
                    setPlanGradingPlan(null);
                    setPlanGradeValue(0);
                    setPlanGradeNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeCompetencyInPlan}
                  disabled={planGradingLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {planGradingLoading ? 'Grading...' : 'Submit Grade'}
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
