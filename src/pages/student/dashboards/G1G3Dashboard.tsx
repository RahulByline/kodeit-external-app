import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Target,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Share2,
  Clock,
  Play,
  CheckCircle,
  Users,
  Activity,
  User,
  MessageSquare,
  Trophy,
  Monitor,
  Zap,
  LayoutDashboard,
  Bell,
  Search,
  Code,
  LogOut,
  Video,
  Star,
  Sparkles,
  Flame,
  Heart,
  Crown,
  Rocket,
  Brain,
  ArrowRight,
  ArrowLeft,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  FileText,
  Circle,
  Award,
  Info,
  X,
  Globe
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { enhancedMoodleService } from '../../../services/enhancedMoodleApi';
import logo from '../../../assets/logo.png';
import ScratchEmulator from '../../../components/dashboard/Emulator/ScratchEmulator';

// Import the real Monaco Editor components
import EditorPane from '../../../features/codeEditor/EditorPane';
import OutputPane from '../../../features/codeEditor/OutputPane';
import PreviewPane from '../../../features/codeEditor/PreviewPane';
import { templates } from '../../../features/codeEditor/templates';
import '../../../features/codeEditor/styles.css';

interface G1G3DashboardProps {
  userCourses?: any[];
  courseProgress?: any[];
  studentActivities?: any[];
  userAssignments?: any[];
}

const G1G3Dashboard: React.FC<G1G3DashboardProps> = ({
  userCourses: propUserCourses,
  courseProgress: propCourseProgress,
  studentActivities: propStudentActivities,
  userAssignments: propUserAssignments
}) => {
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'profile-settings' | 'scratch-editor' | 'code-editor' | 'ebooks' | 'ask-teacher' | 'share-class'>('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  
  // Course detail states
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState(false);
  
  // Lesson detail states
  const [selectedLessonForDetail, setSelectedLessonForDetail] = useState<any>(null);
  const [selectedSectionForModules, setSelectedSectionForModules] = useState<any>(null);
  const [selectedModuleForActivities, setSelectedModuleForActivities] = useState<any>(null);
  const [lessonActivities, setLessonActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  
  // Section detail states
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [sectionActivities, setSectionActivities] = useState<any[]>([]);
  const [isLoadingSectionActivities, setIsLoadingSectionActivities] = useState(false);
  const [isInActivitiesView, setIsInActivitiesView] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'course-detail' | 'section-view'>('dashboard');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Real IOMAD data states
  const [realLessons, setRealLessons] = useState<any[]>([]);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [realTreeData, setRealTreeData] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedTreeSections, setExpandedTreeSections] = useState<Set<string>>(new Set());
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  
  // Activity detail states
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityDetails, setActivityDetails] = useState<any>(null);
  const [isLoadingActivityDetails, setIsLoadingActivityDetails] = useState(false);
  const [isActivityStarted, setIsActivityStarted] = useState(false);
  const [activityProgress, setActivityProgress] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isScormLaunched, setIsScormLaunched] = useState(false);
  const [scormContent, setScormContent] = useState<any>(null);
  const [scormMeta, setScormMeta] = useState<any>(null);
  const [scormLoadingMeta, setScormLoadingMeta] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Code Editor State - Monaco Editor
  const [language, setLanguage] = useState<'python' | 'javascript' | 'html-css'>('javascript');
  const [code, setCode] = useState<string>(templates.javascript);
  const [htmlCode, setHtmlCode] = useState<string>(templates.html);
  const [cssCode, setCssCode] = useState<string>(templates.css);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const [fileName, setFileName] = useState('main.js');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeFileTab, setActiveFileTab] = useState<'html' | 'css'>('html');

  // Real upcoming lessons and activities from IOMAD
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);
  
  // Real upcoming course sessions for schedule
  const [upcomingCourseSessions, setUpcomingCourseSessions] = useState<any[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Code Editor Functions - Monaco Editor
  const runCode = () => {
    setIsRunning(true);
    // Simple JavaScript execution for demo
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => String(arg)).join(' '));
        };
        
        const safeEval = new Function(code);
        safeEval();
        
        console.log = originalConsoleLog;
        setOutput(logs.map(log => `> ${log}`).join('\n'));
      } catch (error) {
        setOutput(`> Error: ${error}`);
      }
    } else if (language === 'html-css') {
      setOutput('> HTML+CSS preview updated!');
    } else {
      setOutput(`> ${language} execution not yet implemented`);
    }
    setIsRunning(false);
  };

  const saveCode = () => {
    // Save code to localStorage
    if (language === 'html-css') {
      localStorage.setItem('codeEditor_html', htmlCode);
      localStorage.setItem('codeEditor_css', cssCode);
    } else {
      localStorage.setItem(`codeEditor_${language}`, code);
    }
    setOutput('> Code saved successfully!');
  };

  const clearCode = () => {
    if (language === 'html-css') {
      setHtmlCode(templates.html);
      setCssCode(templates.css);
    } else {
      setCode(templates[language] || '');
    }
    setOutput('> Code editor cleared!');
  };

  const clearOutput = () => {
    setOutput('');
    setErrors('');
  };

  // Helper functions for Monaco Editor
  const getLanguageIcon = (lang: string) => {
    const iconStyle = { width: '20px', height: '20px', borderRadius: '3px' };
    switch (lang) {
      case "javascript":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
            alt="JavaScript"
            style={iconStyle}
          />
        );
      case "python":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
            alt="Python"
            style={iconStyle}
          />
        );
      case "html-css":
        return (
          <div style={{ display: 'flex', gap: '2px' }}>
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
              alt="HTML"
              style={iconStyle}
            />
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
              alt="CSS"
              style={iconStyle}
            />
          </div>
        );
      default:
        return <span style={{ fontSize: '20px' }}>📄</span>;
    }
  };

  const getLanguageSymbol = (lang: string) => {
    switch (lang) {
      case "javascript": return "JS";
      case "python": return "PY";
      case "html-css": return "HTML+CSS";
      default: return (lang as string).toUpperCase();
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case "javascript": return "#f7df1e";
      case "python": return "#3776ab";
      case "html-css": return "#e34f26";
      default: return "#007acc";
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "javascript": return "JavaScript";
      case "python": return "Python";
      case "html-css": return "HTML & CSS";
      default: return lang;
    }
  };

  const handleLanguageChange = (newLanguage: 'python' | 'javascript' | 'html-css') => {
    if (newLanguage === language) return;
    
    // Save current code
    if (language === 'html-css') {
      localStorage.setItem('codeEditor_html', htmlCode);
      localStorage.setItem('codeEditor_css', cssCode);
    } else {
      localStorage.setItem(`codeEditor_${language}`, code);
    }
    
    // Load new language code
    if (newLanguage === 'html-css') {
      const savedHtml = localStorage.getItem('codeEditor_html');
      const savedCss = localStorage.getItem('codeEditor_css');
      if (savedHtml && savedHtml.trim() !== "") {
        setHtmlCode(savedHtml);
      } else {
        setHtmlCode(templates.html);
      }
      if (savedCss && savedCss.trim() !== "") {
        setCssCode(savedCss);
      } else {
        setCssCode(templates.css);
      }
      setActiveFileTab('html');
    } else {
      const savedCode = localStorage.getItem(`codeEditor_${newLanguage}`);
      if (savedCode && savedCode.trim() !== "") {
        setCode(savedCode);
      } else {
        setCode(templates[newLanguage] || `// ${getLanguageLabel(newLanguage)} Demo Code\nconsole.log("Hello, World!");`);
      }
    }
    
    setLanguage(newLanguage);
    setOutput('');
    setErrors('');
  };

  // Load saved code from localStorage when code editor tab is opened
  useEffect(() => {
    if (activeTab === 'code-editor') {
      if (language === 'html-css') {
        const savedHtml = localStorage.getItem('codeEditor_html');
        const savedCss = localStorage.getItem('codeEditor_css');
        if (savedHtml) setHtmlCode(savedHtml);
        if (savedCss) setCssCode(savedCss);
      } else {
        const savedCode = localStorage.getItem(`codeEditor_${language}`);
        if (savedCode) setCode(savedCode);
      }
    }
  }, [activeTab, language]);

  // Auto-save code as user types
  useEffect(() => {
    if (activeTab === 'code-editor') {
      const timeoutId = setTimeout(() => {
        if (language === 'html-css') {
          localStorage.setItem('codeEditor_html', htmlCode);
          localStorage.setItem('codeEditor_css', cssCode);
        } else {
          localStorage.setItem(`codeEditor_${language}`, code);
        }
      }, 1000); // Save after 1 second of no typing
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, language, code, htmlCode, cssCode]);

  // Update filename when language changes
  useEffect(() => {
    if (language === 'html-css') {
      setFileName('index.html');
    } else {
      const extension = language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt';
      setFileName(`main.${extension}`);
    }
  }, [language]);

  // Initialize Monaco Editor
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch upcoming items when dashboard loads
  useEffect(() => {
    if (activeTab === 'dashboard' && currentUser?.id) {
      fetchUpcomingItems();
    }
  }, [activeTab, currentUser?.id]);

  // Fetch upcoming course sessions when schedule tab is active
  useEffect(() => {
    if (activeTab === 'schedule' && currentUser?.id) {
      const loadScheduleData = async () => {
        setIsLoadingSchedule(true);
        const sessions = await fetchUpcomingCourseSessions();
        setUpcomingCourseSessions(sessions);
        setIsLoadingSchedule(false);
      };
      loadScheduleData();
    }
  }, [activeTab, currentUser?.id]);

  // Grade-based access control functions
  const getUserGrade = () => {
    const gradeFromProfile = currentUser?.profileimageurl?.includes('grade') ? 
      currentUser.profileimageurl.match(/grade(\d+)/i)?.[1] : null;
    
    if (gradeFromProfile) return parseInt(gradeFromProfile);
    
    const userGrade = (currentUser as any)?.grade || (currentUser as any)?.level || null;
    if (userGrade) return parseInt(userGrade);
    
    return 1;
  };

  const canAccessFeature = (feature: string, requiredGrade?: number) => {
    const userGrade = getUserGrade();
    const userRoleLevel = userRole || 'student';
    
    if (userRoleLevel === 'admin' || userRoleLevel === 'school_admin') {
      return true;
    }
    
    if (userRoleLevel === 'teacher') {
      return ['dashboard', 'courses', 'lessons', 'activities', 'achievements', 'schedule'].includes(feature);
    }
    
    if (userRoleLevel === 'student') {
      const gradeAccess = {
        'dashboard': { minGrade: 1, maxGrade: 12 },
        'courses': { minGrade: 1, maxGrade: 12 },
        'lessons': { minGrade: 1, maxGrade: 12 },
        'activities': { minGrade: 1, maxGrade: 12 },
        'achievements': { minGrade: 1, maxGrade: 12 },
        'schedule': { minGrade: 1, maxGrade: 12 },
        'code_editor': { minGrade: 1, maxGrade: 12 },
        'scratch_editor': { minGrade: 1, maxGrade: 12 },
        'advanced_courses': { minGrade: 5, maxGrade: 12 },
        'ai_features': { minGrade: 7, maxGrade: 12 },
      };
      
      const featureAccess = gradeAccess[feature as keyof typeof gradeAccess];
      if (featureAccess) {
        return userGrade >= featureAccess.minGrade && userGrade <= featureAccess.maxGrade;
      }
      
      if (requiredGrade) {
        return userGrade >= requiredGrade;
      }
      
      return true;
    }
    
    return false;
  };

    // Enhanced data fetching with parallel loading
  const fetchDashboardData = async () => {
    if (!currentUser?.id) {
      console.log('⚠️ No current user, skipping data fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsServerOffline(false);
      setServerError('');
      console.log('🚀 Enhanced loading dashboard data with parallel API calls...');

      // Use enhanced Moodle service for parallel loading
      const dashboardData = await enhancedMoodleService.getDashboardData(currentUser.id.toString());

      setCourses(dashboardData.courses);
      setActivities(dashboardData.activities);
      setAssignments(dashboardData.assignments);

      console.log(`✅ Enhanced dashboard loaded in ${dashboardData.loadTime}ms`);
      console.log(`📊 Data: ${dashboardData.courses.length} courses, ${dashboardData.activities.length} activities, ${dashboardData.assignments.length} assignments`);

    } catch (error: any) {
      console.error('❌ Error in enhanced data loading:', error);
      
      // Check if it's a server connectivity issue
      if (error.code === 'ERR_NETWORK' || error.message?.includes('refused to connect')) {
        setIsServerOffline(true);
        setServerError('Unable to connect to the server. Please check your internet connection or try again later.');
      } else {
        setServerError(error.message || 'Failed to load dashboard data');
      }
      
      // Fallback to prop data
      setCourses(propUserCourses || []);
      setActivities(propStudentActivities || []);
      setAssignments(propUserAssignments || []);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real IOMAD lessons data
  const fetchRealLessons = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD lessons data...');
      const allLessons: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch lessons from each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              if (module.modname === 'lesson' || module.modname === 'resource' || module.modname === 'url') {
                allLessons.push({
                  id: module.id,
                  name: module.name,
                  description: module.description || module.intro || 'Complete this lesson to progress in your learning.',
                  duration: module.duration || '45 min',
                  points: module.grade || 25,
                  difficulty: module.difficulty || 'Easy',
                  status: module.completiondata?.state === 1 ? 'completed' : 
                         module.completiondata?.state === 2 ? 'in_progress' : 'pending',
                  progress: module.completiondata?.progress || 0,
                  courseName: course.fullname || course.shortname,
                  courseId: course.id,
                  sectionName: section.name,
                  modname: module.modname,
                  url: module.url,
                  contents: module.contents,
                  completiondata: module.completiondata,
                  thumbnail: module.contents?.[0]?.fileurl || 
                            `https://images.unsplash.com/photo-${1500000000000 + Math.random()}?w=400&h=300&fit=crop`
                });
              }
            });
          }
        });
      }
      
      console.log(`✅ Found ${allLessons.length} real lessons from IOMAD`);
      return allLessons;
    } catch (error) {
      console.error('❌ Error fetching real lessons:', error);
      return [];
    }
  };

  // Fetch real IOMAD activities data
  const fetchRealActivities = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD activities data...');
      const allActivities: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch activities from each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              // Include all module types as activities
              let activityType = 'activity';
              let icon = Activity;
              
              switch (module.modname) {
                case 'quiz':
                  activityType = 'Quiz';
                  icon = FileText;
                  break;
                case 'assign':
                  activityType = 'Assignment';
                  icon = Code;
                  break;
                case 'resource':
                  activityType = 'Reading';
                  icon = BookOpen;
                  break;
                case 'url':
                  activityType = 'Link';
                  icon = Globe;
                  break;
                case 'forum':
                  activityType = 'Discussion';
                  icon = MessageSquare;
                  break;
                case 'lesson':
                  activityType = 'Lesson';
                  icon = Video;
                  break;
                case 'scorm':
                  activityType = 'SCORM Module';
                  icon = BarChart3;
                  break;
                default:
                  activityType = 'Activity';
                  icon = Activity;
              }
              
              allActivities.push({
                id: module.id,
                type: activityType,
                title: module.name,
                status: module.completiondata?.state === 1 ? 'Completed' : 
                       module.completiondata?.state === 2 ? 'In Progress' : 'Pending',
                points: module.grade || 25,
                icon: icon,
                courseName: course.fullname || course.shortname,
                courseId: course.id,
                sectionName: section.name,
                modname: module.modname,
                url: module.url,
                contents: module.contents,
                completiondata: module.completiondata,
                description: module.description || module.intro || `Complete this ${activityType.toLowerCase()} to progress.`,
                duration: module.duration || '30 min',
                difficulty: module.difficulty || 'Easy',
                progress: module.completiondata?.progress || 0
              });
            });
          }
        });
      }
      
      console.log(`✅ Found ${allActivities.length} real activities from IOMAD`);
      return allActivities;
    } catch (error) {
      console.error('❌ Error fetching real activities:', error);
      return [];
    }
  };

  // Fetch real IOMAD tree view data with enhanced structure and sections
  // Structure: Course > Sections > Activities (where sections are like "lessons" in Moodle)
  const fetchRealTreeViewData = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD tree view data with sections...');
      const treeData: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch detailed data for each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        const courseSections: any[] = [];
        let completedSections = 0;
        let totalSections = 0;

        // Process each section
        courseContents.forEach((section: any, sectionIndex: number) => {
          if (section.modules && Array.isArray(section.modules)) {
            const sectionActivities: any[] = [];
            let sectionCompletedCount = 0;
            let sectionTotalCount = 0;

            // Process modules in this section
            section.modules.forEach((module: any, moduleIndex: number) => {
              totalSections++;
              sectionTotalCount++;

              if (module.completiondata?.state === 1) {
                completedSections++;
                sectionCompletedCount++;
              }

              // Determine module type and create appropriate activity structure
              let moduleType = 'activity';
              let moduleIcon = '📚';
              let moduleDuration = '30 min';
              let modulePoints = 25;

              switch (module.modname) {
                case 'quiz':
                  moduleType = 'quiz';
                  moduleIcon = '🎯';
                  moduleDuration = '15 min';
                  modulePoints = 50;
                  break;
                case 'assign':
                  moduleType = 'assignment';
                  moduleIcon = '📝';
                  moduleDuration = '45 min';
                  modulePoints = 75;
                  break;
                case 'resource':
                  moduleType = 'reading';
                  moduleIcon = '📖';
                  moduleDuration = '20 min';
                  modulePoints = 25;
                  break;
                case 'url':
                  moduleType = 'link';
                  moduleIcon = '🔗';
                  moduleDuration = '10 min';
                  modulePoints = 15;
                  break;
                case 'forum':
                  moduleType = 'discussion';
                  moduleIcon = '💬';
                  moduleDuration = '30 min';
                  modulePoints = 30;
                  break;
                case 'lesson':
                  moduleType = 'lesson';
                  moduleIcon = '📺';
                  moduleDuration = '45 min';
                  modulePoints = 40;
                  break;
                case 'scorm':
                  moduleType = 'scorm';
                  moduleIcon = '📊';
                  moduleDuration = '60 min';
                  modulePoints = 100;
                  break;
                case 'video':
                  moduleType = 'video';
                  moduleIcon = '🎥';
                  moduleDuration = '25 min';
                  modulePoints = 35;
                  break;
                default:
                  moduleType = 'activity';
                  moduleIcon = '📚';
                  moduleDuration = '30 min';
                  modulePoints = 25;
              }

              // Create activity structure
              const activity = {
                id: module.id,
                name: module.name,
                type: moduleType,
                duration: module.duration || moduleDuration,
                points: module.grade || modulePoints,
                status: module.completiondata?.state === 1 ? 'completed' : 
                  module.completiondata?.state === 2 ? 'in_progress' : 'pending',
                order: moduleIndex + 1,
                icon: moduleIcon,
                modname: module.modname,
                url: module.url,
                contents: module.contents,
                completiondata: module.completiondata,
                description: module.description || module.intro || `Complete this ${moduleType} to progress.`,
                sectionName: section.name,
                sectionId: section.id || sectionIndex
              };

              sectionActivities.push(activity);
            });

            // Create section structure
            const sectionProgress = sectionTotalCount > 0 ? Math.round((sectionCompletedCount / sectionTotalCount) * 100) : 0;

            const sectionData = {
              id: section.id || `section_${sectionIndex}`,
              name: section.name || `Section ${sectionIndex + 1}`,
              type: 'section',
              summary: section.summary || '',
              activities: sectionActivities,
              activityCount: sectionActivities.length,
              completedActivities: sectionCompletedCount,
              totalActivities: sectionTotalCount,
              progress: sectionProgress,
              sectionNumber: sectionIndex + 1
            };

            courseSections.push(sectionData);
          }
        });

        const progressPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
        
        treeData.push({
          id: course.id,
          name: course.fullname || course.shortname,
          type: 'course',
          progress: progressPercentage,
          completedSections,
          totalSections,
          sections: courseSections,
          description: course.summary || course.shortname,
          category: course.categoryname || 'General',
          sectionCount: courseSections.length
        });
      }
      
      console.log(`✅ Found ${treeData.length} courses for tree view from IOMAD`);
      console.log('📊 Enhanced tree data structure with sections:', treeData);
      return treeData;
      } catch (error) {
      console.error('❌ Error fetching real tree view data:', error);
      return [];
    }
  };
  
  // Course detail functions
  const fetchCourseDetail = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      setIsLoadingCourseDetail(true);
      console.log('🔄 Fetching course detail for:', courseId);
      
      // Get course contents (modules and lessons)
      const response = await enhancedMoodleService.getCourseContents(courseId);
      
      if (response && Array.isArray(response)) {
        const modules: any[] = [];
        const lessons: any[] = [];
        
        response.forEach((section: any) => {
              if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              if (module.modname === 'lesson') {
                lessons.push({
                  ...module,
                  sectionName: section.name
                });
              } else {
                modules.push({
                  ...module,
                  sectionName: section.name
                });
                }
              });
            }
          });
          
        setCourseModules(modules);
        setCourseLessons(lessons);
        console.log(`✅ Found ${modules.length} modules and ${lessons.length} lessons`);
        }
      } catch (error) {
      console.error('❌ Error fetching course detail:', error);
    } finally {
      setIsLoadingCourseDetail(false);
    }
  };

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    setShowCourseDetail(true);
    setActiveTab('courses'); // Set active tab to courses to show the old course view
    fetchCourseDetail(course.id.toString());
  };

  const handleBackToCourses = () => {
    setShowCourseDetail(false);
    setSelectedCourse(null);
    setCourseModules([]);
    setCourseLessons([]);
    setSelectedSection(null);
    setSectionActivities([]);
  };

  const handleBackToCourseView = () => {
    setSelectedSection(null);
    setSectionActivities([]);
    setExpandedSections(new Set());
    setCurrentPage('course-detail');
  };

  const handleBackToSectionView = () => {
    setSelectedActivity(null);
    setActivityDetails(null);
    setIsActivityStarted(false);
    setActivityProgress(0);
    setIsInActivitiesView(false);
    // Stay on section view page
    setCurrentPage('section-view');
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    setSelectedSection(null);
    setSelectedActivity(null);
    setActivityDetails(null);
    setShowCourseDetail(false);
    setCurrentPage('dashboard');
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: 'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'profile-settings' | 'scratch-editor' | 'code-editor' | 'ebooks' | 'ask-teacher' | 'share-class') => {
    setActiveTab(tab);
    // Reset course detail view when changing tabs
    if (tab !== 'courses') {
      setShowCourseDetail(false);
      setSelectedCourse(null);
      setSelectedSection(null);
      setSelectedActivity(null);
      setActivityDetails(null);
      setIsActivityStarted(false);
      setIsScormLaunched(false);
      setIsVideoPlaying(false);
      setCurrentVideoUrl('');
      setScormContent(null);
      setCurrentPage('dashboard');
    }
  };



  // Course sections helper function
  const getCourseSections = () => {
    const sectionsMap = new Map();
    
    // Add lessons to sections
    courseLessons.forEach((lesson, index) => {
      const sectionName = lesson.sectionName || 'General';
      if (!sectionsMap.has(sectionName)) {
        sectionsMap.set(sectionName, { lessons: [], modules: [] });
      }
      sectionsMap.get(sectionName).lessons.push({
        ...lesson,
        displayName: `Lesson ${index + 1}: ${lesson.name}`
      });
    });
    
    // Add modules to sections
    courseModules.forEach((module, index) => {
      const sectionName = module.sectionName || 'General';
      if (!sectionsMap.has(sectionName)) {
        sectionsMap.set(sectionName, { lessons: [], modules: [] });
      }
      sectionsMap.get(sectionName).modules.push({
        ...module,
        displayName: module.name
      });
    });
    
    // Convert to array and sort
    return Array.from(sectionsMap.entries()).map(([name, content]) => ({
      name,
      ...content
    }));
  };

  // Lesson detail functions
  const handleLessonClick = (lesson: any) => {
    setSelectedLessonForDetail(lesson);
    fetchLessonActivities(lesson.id);
  };

  // Handle lesson click from course detail view
  const handleLessonClickFromCourse = (lesson: any) => {
    console.log('🎯 Lesson clicked from course view:', lesson);
    setSelectedLessonForDetail(lesson);
    fetchLessonActivities(lesson.id);
  };

  // Handle lesson click from tree view
  const handleTreeViewLessonClick = (lesson: any, course: any) => {
    console.log('🎯 Tree view lesson clicked:', lesson);
    console.log('📚 From course:', course);

    // Just show lesson info without switching tabs or using course context
    alert(`Viewing lesson: ${lesson.name}\n\nType: ${lesson.type}\nDuration: ${lesson.duration}\nActivities: ${lesson.activityCount || 0}`);
  };

  // Handle section click from tree view
  const handleTreeViewSectionClick = (section: any) => {
    console.log('🎯 Section clicked from tree view:', section);

    // Just show a modal or inline view of section activities
    // Don't switch tabs or use course context
    alert(`Viewing activities in section: ${section.name}\n\nActivities:\n${section.activities?.map((a: any) => `- ${a.name} (${a.type})`).join('\n')}`);
  };

  // Handle activity click from section view
  const handleActivityClick = async (activity: any) => {
    console.log('🎯 Activity clicked:', activity);
    setSelectedActivity(activity);
    setIsInActivitiesView(true);
    // Set the activity as started to show inline content
    setIsActivityStarted(true);
    await fetchActivityDetails(activity);
  };

  // Handle activity click from tree view
  const handleTreeViewActivityClick = async (activity: any, course: any) => {
    console.log('🎯 Tree view activity clicked:', activity);
    console.log('📚 From course:', course);

    // Just show activity info without switching tabs or using course context
    alert(`Starting activity: ${activity.name}\n\nType: ${activity.type}\nDuration: ${activity.duration}\nPoints: ${activity.points}\nStatus: ${activity.status}`);
  };

  // Fetch detailed activity information
  const fetchActivityDetails = async (activity: any) => {
    if (!activity) return;
    
    try {
      setIsLoadingActivityDetails(true);
      console.log('🔄 Fetching activity details for:', activity.name);
      
      // Get detailed information from Moodle API if available
      let detailedInfo = {
        ...activity,
        // Additional details that might be available
        fullDescription: activity.description || 'No detailed description available.',
        requirements: activity.prerequisites || 'No prerequisites required.',
        learningObjectives: activity.learningObjectives || 'Complete this activity to progress in your learning.',
        estimatedTime: activity.duration || '30 minutes',
        maxAttempts: activity.maxAttempts || 'Unlimited',
        dueDate: activity.dueDate || 'No due date set',
        submissionType: activity.submissionType || 'Online',
        gradingMethod: activity.gradingMethod || 'Automatic',
        // Moodle-specific data
        modname: activity.modname,
        url: activity.url,
        contents: activity.contents,
        completiondata: activity.completiondata,
        availabilityinfo: activity.availabilityinfo
      };

      // If it's a Moodle module, try to get more details
      if (activity.modname && selectedCourse) {
        try {
          const courseContents = await enhancedMoodleService.getCourseContents(selectedCourse.id.toString());
          const module = courseContents
            .flatMap((section: any) => section.modules || [])
            .find((mod: any) => mod.id === activity.id);
          
          if (module) {
            detailedInfo = {
              ...detailedInfo,
              fullDescription: module.description || module.intro || detailedInfo.fullDescription,
              url: module.url || detailedInfo.url,
              contents: module.contents || detailedInfo.contents,
              completiondata: module.completiondata || detailedInfo.completiondata,
              availabilityinfo: module.availabilityinfo || detailedInfo.availabilityinfo,
              // Additional Moodle-specific fields
              modname: module.modname,
              instance: module.instance,
              section: module.section,
              sectionnum: module.sectionnum,
              modules: module.modules,
              // Format content for display
              formattedContent: module.contents ? formatModuleContent(module.contents) : null
            };
          }
          } catch (error) {
          console.log('⚠️ Could not fetch additional module details:', error);
        }
      }

      console.log('✅ Activity details loaded:', detailedInfo);
      setActivityDetails(detailedInfo);
    } catch (error) {
      console.error('❌ Error fetching activity details:', error);
      setActivityDetails(activity); // Fallback to basic activity info
    } finally {
      setIsLoadingActivityDetails(false);
    }
  };

  // Format module content for display
  const formatModuleContent = (contents: any[]) => {
    return contents.map((content: any) => ({
      filename: content.filename,
      filepath: content.filepath,
      filesize: content.filesize,
      fileurl: content.fileurl,
      timecreated: content.timecreated,
      timemodified: content.timemodified,
      mimetype: content.mimetype,
      isdir: content.isdir,
      type: content.type
    }));
  };

  // Start activity and display inline
  const startActivity = () => {
    console.log('🚀 Starting activity:', activityDetails?.name);
    setIsActivityStarted(true);
    setActivityProgress(0);
    
    // Simulate progress for demonstration
    const progressInterval = setInterval(() => {
      setActivityProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  // Play video from activity
  const playVideo = (videoUrl: string) => {
    console.log('🎥 Playing video:', videoUrl);
    setCurrentVideoUrl(videoUrl);
    setIsVideoPlaying(true);
  };

  // Close video player
  const closeVideo = () => {
    setIsVideoPlaying(false);
    setCurrentVideoUrl('');
  };

  // Launch SCORM content inline
  const launchScormInline = async () => {
    console.log('🚀 Launching SCORM content inline');
    setIsScormLaunched(true);
    
    try {
      // First, check if this is a real SCORM activity from IOMAD/Moodle
      if (activityDetails?.modname === 'scorm') {
        console.log('🎯 This is a real SCORM activity from IOMAD/Moodle');
        
        // Get the SCORM launch URL from the activity
        let scormLaunchUrl = '';
        
        // Check for different possible SCORM URL patterns
        if (activityDetails?.url) {
          scormLaunchUrl = activityDetails.url;
        } else if (activityDetails?.contents && activityDetails.contents.length > 0) {
          // Look for SCORM package files
          const scormFiles = activityDetails.contents.filter((content: any) => 
            content.filename?.toLowerCase().includes('.zip') ||
            content.filename?.toLowerCase().includes('scorm') ||
            content.filename?.toLowerCase().includes('imsmanifest.xml') ||
            content.filename?.toLowerCase().includes('index.html') ||
            content.filename?.toLowerCase().includes('.html')
          );
          
          if (scormFiles.length > 0) {
            scormLaunchUrl = scormFiles[0].fileurl;
          }
        }
        
        if (scormLaunchUrl) {
          console.log('📦 Found real SCORM package URL:', scormLaunchUrl);
          
          // Create real SCORM content structure
          const realScormContent = {
            title: activityDetails?.name || 'SCORM Module',
            packageUrl: scormLaunchUrl,
            files: activityDetails.contents || [],
            currentPage: 1,
            totalPages: 1,
            progress: 0,
            score: 0,
            isRealScorm: true,
            isIomadScorm: true,
            activityId: activityDetails?.id,
            courseId: selectedCourse?.id
          };
          
          setScormContent(realScormContent);
          return;
        }
      }
      
      // Check if we have any SCORM-related content in the activity
      if (activityDetails?.contents && activityDetails.contents.length > 0) {
        // Look for SCORM package files
        const scormFiles = activityDetails.contents.filter((content: any) => 
          content.filename?.toLowerCase().includes('.zip') ||
          content.filename?.toLowerCase().includes('scorm') ||
          content.filename?.toLowerCase().includes('imsmanifest.xml') ||
          content.filename?.toLowerCase().includes('index.html') ||
          content.filename?.toLowerCase().includes('.html')
        );
        
        if (scormFiles.length > 0) {
          console.log('📦 Found SCORM package files:', scormFiles);
          
          // Create real SCORM content structure
          const realScormContent = {
            title: activityDetails?.name || 'SCORM Module',
            packageUrl: scormFiles[0].fileurl,
            files: scormFiles,
            currentPage: 1,
            totalPages: 1,
            progress: 0,
            score: 0,
            isRealScorm: true,
            isIomadScorm: false,
            activityId: activityDetails?.id,
            courseId: selectedCourse?.id
          };
          
          setScormContent(realScormContent);
          return;
        }
      }
      
      // Check if we have a real SCORM package available
      const realScormUrl = '/scorm-packages/real-scorm/index.html';
      
      // Try to load the real SCORM package
      try {
        const response = await fetch(realScormUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('📦 Found real SCORM package, using it');
          const realScormContent = {
            title: activityDetails?.name || 'KODEIT Learning Module',
            packageUrl: realScormUrl,
            files: [{ filename: 'kodeit-scorm.zip', fileurl: realScormUrl }],
            currentPage: 1,
            totalPages: 1,
            progress: 0,
            score: 0,
            isRealScorm: true,
            isIomadScorm: false,
            activityId: activityDetails?.id,
            courseId: selectedCourse?.id
          };
          
          setScormContent(realScormContent);
          return;
        }
      } catch (error) {
        console.log('⚠️ Real SCORM package not available');
      }
      
      // Fallback to enhanced mock content if no real SCORM files found
      console.log('⚠️ No real SCORM files found, using enhanced mock content');
      const enhancedMockScormContent = {
      title: activityDetails?.name || 'SCORM Module',
      pages: [
        {
          id: 1,
          title: 'Introduction',
          content: `
            <div class="scorm-page">
              <h2>Welcome to the SCORM Module</h2>
              <p>This is an interactive learning module that will guide you through the course content.</p>
              <div class="interactive-element">
                <h3>Learning Objectives</h3>
                <ul>
                  <li>Understand the key concepts</li>
                  <li>Complete interactive exercises</li>
                  <li>Take assessments to test knowledge</li>
                  <li>Track your progress</li>
                </ul>
              </div>
              <div class="navigation">
                  <button class="next-btn" onclick="window.parent.postMessage({type: 'scorm-navigate', direction: 'next'}, '*')">Continue to Next Section</button>
              </div>
            </div>
          `,
          completed: false
        },
        {
          id: 2,
          title: 'Main Content',
          content: `
            <div class="scorm-page">
              <h2>Main Learning Content</h2>
              <div class="content-section">
                <h3>Key Concepts</h3>
                <p>Here you will learn about the main concepts and principles.</p>
                <div class="interactive-demo">
                  <h4>Interactive Demonstration</h4>
                  <div class="demo-container">
                    <p>Click the buttons below to see different scenarios:</p>
                    <div class="demo-buttons">
                        <button class="demo-btn" onclick="showDemoResult('Scenario 1: Basic concepts explained with examples.')">Scenario 1</button>
                        <button class="demo-btn" onclick="showDemoResult('Scenario 2: Advanced concepts with practical applications.')">Scenario 2</button>
                        <button class="demo-btn" onclick="showDemoResult('Scenario 3: Real-world examples and case studies.')">Scenario 3</button>
                    </div>
                      <div class="demo-result" id="demo-result">
                      <p>Select a scenario to see the result.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="navigation">
                  <button class="prev-btn" onclick="window.parent.postMessage({type: 'scorm-navigate', direction: 'prev'}, '*')">Previous</button>
                  <button class="next-btn" onclick="window.parent.postMessage({type: 'scorm-navigate', direction: 'next'}, '*')">Continue to Assessment</button>
              </div>
            </div>
              <script>
                function showDemoResult(result) {
                  document.getElementById('demo-result').innerHTML = '<p>' + result + '</p>';
                }
              </script>
          `,
          completed: false
        },
        {
          id: 3,
          title: 'Assessment',
          content: `
            <div class="scorm-page">
              <h2>Knowledge Assessment</h2>
              <div class="assessment">
                <h3>Question 1</h3>
                <p>What is the primary purpose of this module?</p>
                <div class="options">
                    <label><input type="radio" name="q1" value="a" onchange="updateScore()"> To provide basic information</label>
                    <label><input type="radio" name="q1" value="b" onchange="updateScore()"> To test your knowledge</label>
                    <label><input type="radio" name="q1" value="c" onchange="updateScore()"> To guide you through interactive learning</label>
                    <label><input type="radio" name="q1" value="d" onchange="updateScore()"> To complete a course requirement</label>
                </div>
                
                <h3>Question 2</h3>
                <p>Which of the following is NOT a learning objective?</p>
                <div class="options">
                    <label><input type="radio" name="q2" value="a" onchange="updateScore()"> Understand key concepts</label>
                    <label><input type="radio" name="q2" value="b" onchange="updateScore()"> Complete exercises</label>
                    <label><input type="radio" name="q2" value="c" onchange="updateScore()"> Take assessments</label>
                    <label><input type="radio" name="q2" value="d" onchange="updateScore()"> Skip all content</label>
                </div>
              </div>
              <div class="navigation">
                  <button class="prev-btn" onclick="window.parent.postMessage({type: 'scorm-navigate', direction: 'prev'}, '*')">Previous</button>
                  <button class="submit-btn" onclick="submitAssessment()">Submit Assessment</button>
              </div>
            </div>
              <script>
                function updateScore() {
                  window.parent.postMessage({type: 'scorm-score-update', score: calculateScore()}, '*');
                }
                
                function calculateScore() {
                  let score = 0;
                  if (document.querySelector('input[name="q1"]:checked')?.value === 'c') score += 50;
                  if (document.querySelector('input[name="q2"]:checked')?.value === 'd') score += 50;
                  return score;
                }
                
                function submitAssessment() {
                  const score = calculateScore();
                  window.parent.postMessage({type: 'scorm-assessment-submit', score: score}, '*');
                }
              </script>
          `,
          completed: false
        },
        {
          id: 4,
          title: 'Completion',
          content: `
            <div class="scorm-page">
              <h2>Module Complete!</h2>
              <div class="completion-summary">
                <div class="success-icon">✅</div>
                <h3>Congratulations!</h3>
                <p>You have successfully completed the SCORM module.</p>
                <div class="results">
                  <h4>Your Results:</h4>
                  <ul>
                    <li>Completion: 100%</li>
                      <li>Score: <span id="final-score">85%</span></li>
                    <li>Time Spent: 15 minutes</li>
                    <li>Status: Passed</li>
                  </ul>
                </div>
                <div class="certificate">
                  <h4>Certificate of Completion</h4>
                  <p>You have earned a certificate for completing this module.</p>
                    <button class="download-cert" onclick="downloadCertificate()">Download Certificate</button>
                </div>
              </div>
              <div class="navigation">
                  <button class="finish-btn" onclick="window.parent.postMessage({type: 'scorm-finish'}, '*')">Finish Module</button>
              </div>
            </div>
              <script>
                function downloadCertificate() {
                  window.parent.postMessage({type: 'scorm-download-certificate'}, '*');
                }
              </script>
          `,
          completed: true
        }
      ],
      currentPage: 1,
      totalPages: 4,
      progress: 0,
        score: 0,
        isRealScorm: false
      };
      
      setScormContent(enhancedMockScormContent);
    } catch (error) {
      console.error('❌ Error launching SCORM content:', error);
      // Fallback to basic mock content
      setScormContent({
        title: 'SCORM Module',
        pages: [{
          id: 1,
          title: 'Error Loading SCORM',
          content: '<div class="scorm-page"><h2>Error Loading SCORM Content</h2><p>There was an error loading the SCORM module. Please try again or contact your instructor.</p></div>',
          completed: false
        }],
        currentPage: 1,
        totalPages: 1,
        progress: 0,
        score: 0,
        isRealScorm: false
      });
    }
  };

  // Close SCORM content
  const closeScorm = () => {
    setIsScormLaunched(false);
    setScormContent(null);
  };

  // Handle SCORM content display - enhanced for real IOMAD packages
  const showScormContent = () => {
    const container = document.getElementById('scorm-frame-container');
    if (container && scormContent) {
      const originalUrl = scormContent.packageUrl;
      
      // Check if this is a real IOMAD SCORM package
      if (scormContent.isRealScorm && scormContent.isIomadScorm) {
        console.log('🎯 Loading real IOMAD SCORM package:', originalUrl);
        
        // Create enhanced container for IOMAD SCORM
        const iomadContainer = document.createElement('div');
        iomadContainer.className = 'w-full h-full flex flex-col';
        iomadContainer.innerHTML = `
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-blue-800 font-semibold">IOMAD SCORM Package</span>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Live</span>
          </div>
          <div class="flex items-center space-x-2">
            <button id="open-original-btn" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                🔗 Open Original
            </button>
              <button id="open-new-tab-btn" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                📱 New Tab
              </button>
              <button id="reload-scorm-btn" class="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                🔄 Reload
              </button>
            </div>
          </div>
          <div class="flex-1 bg-white relative">
            <iframe
              src="${originalUrl}"
              class="w-full h-full border-0"
              title="IOMAD SCORM Content"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-presentation"
              allow="fullscreen; microphone; camera; geolocation"
              allowFullScreen
            />
            <div id="scorm-overlay" class="absolute inset-0 bg-transparent pointer-events-none"></div>
          </div>
        `;
        
        // Add event listeners for IOMAD SCORM
        const openOriginalBtn = iomadContainer.querySelector('#open-original-btn');
        const openNewTabBtn = iomadContainer.querySelector('#open-new-tab-btn');
        const reloadScormBtn = iomadContainer.querySelector('#reload-scorm-btn');
        const iframe = iomadContainer.querySelector('iframe');
        
        if (openOriginalBtn) {
          openOriginalBtn.addEventListener('click', () => {
            window.open(originalUrl, '_blank');
          });
        }
        
        if (openNewTabBtn) {
          openNewTabBtn.addEventListener('click', () => {
            const popup = window.open(originalUrl, '_blank', 'width=1200,height=800');
            if (popup) popup.focus();
          });
        }
        
        if (reloadScormBtn) {
          reloadScormBtn.addEventListener('click', () => {
            if (iframe) {
              iframe.src = iframe.src;
            }
          });
        }
        
        if (iframe) {
          iframe.addEventListener('load', () => {
            console.log('✅ IOMAD SCORM content loaded successfully');
            // Initialize SCORM API communication
            initializeScormAPI();
          });
          
          iframe.addEventListener('error', (e) => {
            console.error('❌ IOMAD SCORM iframe error:', e);
            showScormFallback();
          });
        }
        
        // Clear container and append IOMAD content
        container.innerHTML = '';
        container.appendChild(iomadContainer);
        
      } else if (scormContent.isRealScorm) {
        // Handle other real SCORM packages
        console.log('🔄 Loading real SCORM package:', originalUrl);
        
        // Try to load directly first
        const directContainer = document.createElement('div');
        directContainer.className = 'w-full h-full flex flex-col';
        directContainer.innerHTML = `
          <div class="bg-green-50 border-b border-green-200 p-3 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-green-800">Real SCORM Package</span>
            </div>
            <div class="flex items-center space-x-2">
              <button id="open-original-btn" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                🔗 Open Original
              </button>
              <button id="reload-scorm-btn" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
              🔄 Reload
            </button>
          </div>
        </div>
        <div class="flex-1 bg-white">
          <iframe
              src="${originalUrl}"
            class="w-full h-full border-0"
              title="Real SCORM Content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            allow="fullscreen"
            allowFullScreen
          />
        </div>
      `;
      
      // Add event listeners
        const openOriginalBtn = directContainer.querySelector('#open-original-btn');
        const reloadScormBtn = directContainer.querySelector('#reload-scorm-btn');
        const iframe = directContainer.querySelector('iframe');
      
      if (openOriginalBtn) {
        openOriginalBtn.addEventListener('click', () => {
          window.open(originalUrl, '_blank');
        });
      }
      
        if (reloadScormBtn) {
          reloadScormBtn.addEventListener('click', () => {
            if (iframe) {
              iframe.src = iframe.src;
            }
        });
      }
      
      if (iframe) {
        iframe.addEventListener('load', () => {
            console.log('✅ Real SCORM content loaded successfully');
        });
        
        iframe.addEventListener('error', (e) => {
            console.error('❌ Real SCORM iframe error:', e);
          showScormFallback();
        });
      }
      
        // Clear container and append direct content
      container.innerHTML = '';
        container.appendChild(directContainer);
        
      } else {
        // Fallback to proxy for cross-origin issues
        console.log('🔄 Loading SCORM content via proxy fallback');
        showScormFallback();
      }
    }
  };

  // Initialize SCORM API communication for IOMAD packages
  const initializeScormAPI = () => {
    console.log('🔧 Initializing SCORM API for IOMAD package');
    
    // Set up message listener for SCORM communication
    const handleScormMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const { type, data } = event.data;
        
        switch (type) {
          case 'scorm-progress':
            console.log('📊 SCORM Progress Update:', data);
            // Update progress in the UI
            if (scormContent) {
              setScormContent(prev => ({
                ...prev,
                progress: data.progress || prev.progress,
                score: data.score || prev.score
              }));
            }
            break;
            
          case 'scorm-complete':
            console.log('✅ SCORM Module Completed:', data);
            // Handle completion
            if (scormContent) {
              setScormContent(prev => ({
                ...prev,
                progress: 100,
                score: data.score || prev.score
              }));
            }
            break;
            
          case 'scorm-error':
            console.error('❌ SCORM Error:', data);
            break;
        }
      }
    };
    
    // Add message listener
    window.addEventListener('message', handleScormMessage);
    
    // Cleanup function
    return () => {
      window.removeEventListener('message', handleScormMessage);
    };
  };

  // Fallback method if proxy fails
  const showScormFallback = () => {
    const container = document.getElementById('scorm-frame-container');
    if (container && scormContent) {
      // Create the fallback container
      const fallbackContainer = document.createElement('div');
      fallbackContainer.className = 'w-full h-full flex flex-col';
      fallbackContainer.innerHTML = `
        <div class="bg-orange-50 border-b border-orange-200 p-3 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-sm font-medium text-orange-800">SCORM Content (Fallback)</span>
          </div>
        </div>
        <div class="flex-1 bg-gray-100 p-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div class="text-6xl mb-4">⚠️</div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">Proxy Unavailable</h3>
            <p class="text-gray-600 mb-6">
              The proxy server is not available. Please use one of the alternative methods below.
            </p>
            <div class="space-y-3">
              <button id="open-new-tab-btn" class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                🔗 Open in New Tab
              </button>
              <button id="open-popup-btn" class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                📱 Open in Popup Window
              </button>
              <button id="try-proxy-again-btn" class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                🔄 Try Proxy Again
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners
      const openNewTabBtn = fallbackContainer.querySelector('#open-new-tab-btn');
      const openPopupBtn = fallbackContainer.querySelector('#open-popup-btn');
      const tryProxyAgainBtn = fallbackContainer.querySelector('#try-proxy-again-btn');
      
      if (openNewTabBtn) {
        openNewTabBtn.addEventListener('click', () => {
          window.open(scormContent.packageUrl, '_blank');
        });
      }
      
      if (openPopupBtn) {
        openPopupBtn.addEventListener('click', () => {
          const popup = window.open(
            scormContent.packageUrl, 
            'scorm_popup', 
            'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
          );
          if (popup) {
            popup.focus();
          }
        });
      }
      
      if (tryProxyAgainBtn) {
        tryProxyAgainBtn.addEventListener('click', () => {
          showScormContent();
        });
      }
      
      // Clear container and append new content
      container.innerHTML = '';
      container.appendChild(fallbackContainer);
    }
  };

  // Fetch SCORM metadata via Moodle web services for the current activity
  const fetchScormMeta = async () => {
    if (!currentUser?.id || !selectedCourse?.id || !activityDetails) return;
    if (!scormContent?.isIomadScorm) return;
    try {
      setScormLoadingMeta(true);
      // Find SCORM instance by course and module (activityDetails.id is coursemodule id in contents)
      const scormInstance = await enhancedMoodleService.getScormInstanceByCourseModule(
        selectedCourse.id,
        activityDetails.id
      );
      if (!scormInstance) {
        setScormMeta({ error: 'SCORM instance not found for this module.' });
        setScormLoadingMeta(false);
        return;
      }
      const scormId = scormInstance.id;
      const [access, attempts, scos] = await Promise.all([
        enhancedMoodleService.getScormAccessInformation(scormId),
        enhancedMoodleService.getScormAttemptCount(scormId, currentUser.id),
        enhancedMoodleService.getScormScoes(scormId)
      ]);
      setScormMeta({ scormId, access, attempts, scos, instance: scormInstance });
    } catch (e) {
      setScormMeta({ error: 'Failed to load SCORM metadata.' });
    } finally {
      setScormLoadingMeta(false);
    }
  };

  // Navigate SCORM pages
  const navigateScormPage = (direction: 'next' | 'prev') => {
    if (!scormContent) return;
    
    const newPage = direction === 'next' 
      ? Math.min(scormContent.currentPage + 1, scormContent.totalPages)
      : Math.max(scormContent.currentPage - 1, 1);
    
    setScormContent({
      ...scormContent,
      currentPage: newPage,
      progress: Math.round((newPage / scormContent.totalPages) * 100)
    });
  };

  // Auto-load SCORM content when launched
  useEffect(() => {
    if (isScormLaunched && scormContent && scormContent.isRealScorm) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        showScormContent();
        fetchScormMeta();
      }, 100);
    }
  }, [isScormLaunched, scormContent]);

  // Handle SCORM messages from iframe content
  useEffect(() => {
    const handleScormMessage = (event: MessageEvent) => {
      if (!scormContent) return;
      
      const { type, direction, score } = event.data;
      
      switch (type) {
        case 'scorm-navigate':
          if (direction === 'next' || direction === 'prev') {
            navigateScormPage(direction);
          }
          break;
        case 'scorm-score-update':
          setScormContent({
            ...scormContent,
            score: score || 0
          });
          break;
        case 'scorm-assessment-submit':
          setScormContent({
            ...scormContent,
            score: score || 0,
            progress: 100
          });
          // Navigate to completion page
          navigateScormPage('next');
          break;
        case 'scorm-finish':
          closeScorm();
          // Update activity completion status
          if (activityDetails) {
            console.log('✅ SCORM module completed with score:', scormContent.score);
            // Here you would typically update the completion status in your backend
          }
          break;
        case 'scorm-download-certificate':
          // Generate and download certificate
          downloadCertificate();
          break;
      }
    };

    window.addEventListener('message', handleScormMessage);
    return () => window.removeEventListener('message', handleScormMessage);
  }, [scormContent, activityDetails]);

  // Download certificate function
  const downloadCertificate = () => {
    const certificateData = {
      studentName: currentUser?.fullname || currentUser?.firstname || 'Student',
      courseName: selectedCourse?.fullname || 'Course',
      moduleName: activityDetails?.name || 'SCORM Module',
      completionDate: new Date().toLocaleDateString(),
      score: scormContent?.score || 0,
      instructor: 'KODEIT Instructor'
    };

    // Create certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Completion</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
          .certificate { border: 3px solid #gold; padding: 40px; max-width: 800px; margin: 0 auto; }
          .title { font-size: 36px; color: #2c3e50; margin-bottom: 20px; }
          .subtitle { font-size: 18px; color: #7f8c8d; margin-bottom: 40px; }
          .name { font-size: 28px; color: #e74c3c; margin: 20px 0; }
          .details { font-size: 16px; color: #34495e; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="title">Certificate of Completion</div>
          <div class="subtitle">This is to certify that</div>
          <div class="name">${certificateData.studentName}</div>
          <div class="subtitle">has successfully completed</div>
          <div class="name">${certificateData.moduleName}</div>
          <div class="details">
            <p>Course: ${certificateData.courseName}</p>
            <p>Score: ${certificateData.score}%</p>
            <p>Completion Date: ${certificateData.completionDate}</p>
            <p>Instructor: ${certificateData.instructor}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${certificateData.moduleName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if file is a video
  const isVideoFile = (filename: string) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    return videoExtensions.some(ext => filename.toLowerCase().includes(ext));
  };

  // Check if file is an image
  const isImageFile = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().includes(ext));
  };

  // Check if file is a document
  const isDocumentFile = (filename: string) => {
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
    return documentExtensions.some(ext => filename.toLowerCase().includes(ext));
  };

  // Render activity content based on type
  const renderActivityContent = () => {
    if (!activityDetails) return null;

    const { modname, type, description, fullDescription, formattedContent, url } = activityDetails;

    switch (modname || type) {
      case 'video':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-900 mb-4">Video Content</h3>
              <div className="prose max-w-none text-red-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'Video content will appear here.' }} />
            </div>
            
            {formattedContent && formattedContent.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Video Files</h4>
                <div className="space-y-3">
                  {formattedContent.map((content: any, index: number) => {
                    const isVideo = isVideoFile(content.filename);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Video className="w-6 h-6 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900">{content.filename}</p>
                            <p className="text-sm text-gray-500">
                              {content.filesize ? `${Math.round(content.filesize / 1024)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isVideo && content.fileurl && (
                            <button 
                              onClick={() => playVideo(content.fileurl)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                              Play Video
                            </button>
                          )}
                          {!isVideo && content.fileurl && (
                            <button 
                              onClick={() => window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                            >
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Quiz Instructions</h3>
              <div className="prose max-w-none text-blue-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'Quiz content will appear here.' }} />
            </div>
            
            {/* Sample Quiz Questions */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Question 1</h4>
                <p className="text-gray-700 mb-4">What is the capital of France?</p>
                <div className="space-y-2">
                  {['Paris', 'London', 'Berlin', 'Madrid'].map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="q1" value={option} className="text-blue-600" />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Question 2</h4>
                <p className="text-gray-700 mb-4">Which programming language is this project built with?</p>
                <div className="space-y-2">
                  {['React', 'Vue', 'Angular', 'Svelte'].map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="q2" value={option} className="text-blue-600" />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'assign':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Assignment Details</h3>
              <div className="prose max-w-none text-purple-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'Assignment content will appear here.' }} />
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Submission</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                  <textarea 
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your assignment answer here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attach Files</label>
                  <input 
                    type="file" 
                    multiple
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'resource':
      case 'file':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">Resource Content</h3>
              <div className="prose max-w-none text-green-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'Resource content will appear here.' }} />
            </div>
            
            {formattedContent && formattedContent.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Available Files & Media</h4>
                <div className="space-y-3">
                  {formattedContent.map((content: any, index: number) => {
                    const isVideo = isVideoFile(content.filename);
                    const isImage = isImageFile(content.filename);
                    const isDocument = isDocumentFile(content.filename);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {isVideo ? (
                            <Video className="w-6 h-6 text-red-500" />
                          ) : isImage ? (
                            <FileText className="w-6 h-6 text-green-500" />
                          ) : isDocument ? (
                            <FileText className="w-6 h-6 text-blue-500" />
                          ) : (
                            <FileText className="w-6 h-6 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{content.filename}</p>
                            <p className="text-sm text-gray-500">
                              {content.filesize ? `${Math.round(content.filesize / 1024)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isVideo && content.fileurl && (
                            <button 
                              onClick={() => playVideo(content.fileurl)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Play Video
                            </button>
                          )}
                          {isImage && content.fileurl && (
                            <button 
                              onClick={() => window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              View Image
                            </button>
                          )}
                          {isDocument && content.fileurl && (
                            <button 
                              onClick={() => window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              View Document
                            </button>
                          )}
                          {!isVideo && !isImage && !isDocument && (
                            <button 
                              onClick={() => content.fileurl && window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                            >
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'url':
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-orange-900 mb-4">External Resource</h3>
              <div className="prose max-w-none text-orange-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'External resource information will appear here.' }} />
            </div>
            
            {url && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">External Link</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">URL:</p>
                  <p className="font-mono text-blue-600 break-all">{url}</p>
                  <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Open in New Tab
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'forum':
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Discussion Forum</h3>
              <div className="prose max-w-none text-indigo-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'Forum discussion will appear here.' }} />
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Discussion Topics</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Topic 1: Introduction</h5>
                  <p className="text-gray-600 text-sm mb-3">Posted by Instructor • 2 days ago</p>
                  <p className="text-gray-700">Welcome to the discussion forum. Please introduce yourself and share your thoughts on the course material.</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Topic 2: Questions & Answers</h5>
                  <p className="text-gray-600 text-sm mb-3">Posted by Student • 1 day ago</p>
                  <p className="text-gray-700">Feel free to ask questions about the course content here.</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Add New Post</h5>
                <textarea 
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your post here..."
                />
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Post Message
                </button>
              </div>
            </div>
          </div>
        );

      case 'lesson':
        return (
          <div className="space-y-6">
            <div className="bg-teal-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-teal-900 mb-4">Lesson Content</h3>
              <div className="prose max-w-none text-teal-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'Lesson content will appear here.' }} />
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Lesson Pages</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Page 1: Introduction</h5>
                  <p className="text-gray-700">This is the introduction to the lesson. Read through the content carefully.</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    Continue
                  </button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg opacity-50">
                  <h5 className="font-medium text-gray-900 mb-2">Page 2: Main Content</h5>
                  <p className="text-gray-700">This page will be unlocked after completing page 1.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'scorm':
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                SCORM Interactive Module
              </h3>
              <div className="prose max-w-none text-indigo-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'SCORM interactive content will appear here.' }} />
            </div>
            
            {/* Real IOMAD SCORM Package Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">SCORM Package Details</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  IOMAD SCORM Package
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Package Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source:</span>
                      <span className="font-medium text-blue-600">IOMAD/Moodle</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">SCORM 1.2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">Interactive Module</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Ready to Launch</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Progress Tracking</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion:</span>
                      <span className="font-medium">
                        {activityDetails.completiondata?.progress || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium whitespace-nowrap">
                        {activityDetails.completiondata?.state === 1 ? 'Completed' : 
                         activityDetails.completiondata?.state === 2 ? 'In Progress' : 'Not Attempted'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Points:</span>
                      <span className="font-medium">{activityDetails.grade || 25} pts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SCORM Package Files */}
              {formattedContent && formattedContent.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">Package Contents</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formattedContent.slice(0, 4).map((content: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{content.filename}</p>
                          <p className="text-xs text-gray-500">
                            {content.filesize ? `${Math.round(content.filesize / 1024)} KB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* SCORM Launch Options */}
              <div className="text-center space-y-4">
                <div>
                <button 
                  onClick={launchScormInline}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-lg flex items-center justify-center mx-auto space-x-2"
                >
                    <BarChart3 className="w-5 h-5" />
                    <span>Launch SCORM Module</span>
                </button>
                <p className="text-sm text-gray-600 mt-2">Opens inline for optimal experience</p>
                </div>
                
                {/* Alternative Launch Options */}
                <div className="flex items-center justify-center space-x-4">
                  <button 
                    onClick={() => {
                      if (formattedContent && formattedContent.length > 0) {
                        const scormUrl = formattedContent.find((c: any) => 
                          c.filename?.toLowerCase().includes('index.html') || 
                          c.filename?.toLowerCase().includes('scorm')
                        )?.fileurl;
                        if (scormUrl) window.open(scormUrl, '_blank');
                      }
                    }}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors text-sm"
                  >
                    🔗 Open in New Tab
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (formattedContent && formattedContent.length > 0) {
                        const scormUrl = formattedContent.find((c: any) => 
                          c.filename?.toLowerCase().includes('index.html') || 
                          c.filename?.toLowerCase().includes('scorm')
                        )?.fileurl;
                        if (scormUrl) {
                          const popup = window.open(scormUrl, '_blank', 'width=1200,height=800');
                          if (popup) popup.focus();
                        }
                      }
                    }}
                    className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors text-sm"
                  >
                    📱 Open in Popup
                  </button>
                </div>
              </div>
            </div>

            {/* SCORM Resources */}
            {formattedContent && formattedContent.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">SCORM Package Files</h4>
                <div className="space-y-3">
                  {formattedContent.map((content: any, index: number) => {
                    const isVideo = isVideoFile(content.filename);
                    const isImage = isImageFile(content.filename);
                    const isDocument = isDocumentFile(content.filename);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {isVideo ? (
                            <Video className="w-6 h-6 text-red-500" />
                          ) : isImage ? (
                            <FileText className="w-6 h-6 text-green-500" />
                          ) : isDocument ? (
                            <FileText className="w-6 h-6 text-blue-500" />
                          ) : (
                            <FileText className="w-6 h-6 text-indigo-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{content.filename}</p>
                            <p className="text-sm text-gray-500">
                              {content.filesize ? `${Math.round(content.filesize / 1024)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isVideo && content.fileurl && (
                            <button 
                              onClick={() => playVideo(content.fileurl)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Play Video
                            </button>
                          )}
                          {isImage && content.fileurl && (
                            <button 
                              onClick={() => window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              View Image
                            </button>
                          )}
                          {isDocument && content.fileurl && (
                            <button 
                              onClick={() => window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              View Document
                            </button>
                          )}
                          {!isVideo && !isImage && !isDocument && (
                            <button 
                              onClick={() => content.fileurl && window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
                            >
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            
            
            {/* SCORM Features */}
            
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Content</h3>
              <div className="prose max-w-none text-gray-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'Activity content will appear here.' }} />
            </div>
            
            {formattedContent && formattedContent.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Related Files & Media</h4>
                <div className="space-y-3">
                  {formattedContent.map((content: any, index: number) => {
                    const isVideo = isVideoFile(content.filename);
                    const isImage = isImageFile(content.filename);
                    const isDocument = isDocumentFile(content.filename);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {isVideo ? (
                            <Video className="w-6 h-6 text-red-500" />
                          ) : isImage ? (
                            <FileText className="w-6 h-6 text-green-500" />
                          ) : isDocument ? (
                            <FileText className="w-6 h-6 text-blue-500" />
                          ) : (
                            <FileText className="w-6 h-6 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{content.filename}</p>
                            <p className="text-sm text-gray-500">
                              {content.filesize ? `${Math.round(content.filesize / 1024)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isVideo && content.fileurl && (
                            <button 
                              onClick={() => playVideo(content.fileurl)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Play Video
                            </button>
                          )}
                          {isImage && content.fileurl && (
                            <button 
                              onClick={() => window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              View Image
                            </button>
                          )}
                          {isDocument && content.fileurl && (
                            <button 
                              onClick={() => window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              View Document
                            </button>
                          )}
                          {!isVideo && !isImage && !isDocument && (
                            <button 
                              onClick={() => content.fileurl && window.open(content.fileurl, '_blank')}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                            >
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  // Handle section click from course detail view
  const handleSectionClick = (section: any) => {
    console.log('🎯 Section clicked:', section);
    const sectionId = section.name;
    
    // Set the selected section to show activities
    setSelectedSection(section);
    
    // Reset activity view state
    setSelectedActivity(null);
    setActivityDetails(null);
    setIsActivityStarted(false);
    setActivityProgress(0);
    setIsScormLaunched(false);
    setIsVideoPlaying(false);
    setCurrentVideoUrl('');
    setScormContent(null);
    setIsInActivitiesView(false);
    
    // Navigate to section view page
    setCurrentPage('section-view');
    
    // Fetch real activities for this section
    fetchSectionActivities(section.name);
  };

  const fetchSectionActivities = async (sectionName: string) => {
    if (!sectionName || !selectedCourse) return;
    
    try {
      setIsLoadingSectionActivities(true);
      console.log('🔄 Fetching real section activities for:', sectionName, 'in course:', selectedCourse.id);
      
      // Fetch real course contents from Moodle API
      const courseContents = await enhancedMoodleService.getCourseContents(selectedCourse.id.toString());
      console.log('📦 Course contents from API:', courseContents);
      
      // Find the specific section by name
      const targetSection = courseContents.find((section: any) => 
        section.name === sectionName || 
        section.summary?.includes(sectionName) ||
        section.section === sectionName
      );
      
      if (targetSection && targetSection.modules) {
        console.log('🎯 Found section:', targetSection.name, 'with modules:', targetSection.modules);
        
        // Transform Moodle modules into activity format
        const realActivities = targetSection.modules.map((module: any, index: number) => {
          // Determine activity type based on Moodle module type
          let activityType = 'video';
          let icon = Video;
          
              switch (module.modname) {
                case 'quiz':
              activityType = 'quiz';
              icon = FileText;
                  break;
                case 'assign':
              activityType = 'assignment';
              icon = Code;
            break;
          case 'resource':
              activityType = 'reading';
              icon = BookOpen;
              break;
            case 'url':
              activityType = 'link';
              icon = Globe;
              break;
            case 'forum':
              activityType = 'discussion';
              icon = MessageSquare;
            break;
          default:
              activityType = 'activity';
              icon = Activity;
          }
          
          // Determine status based on completion info
          let status = 'pending';
          if (module.completiondata?.state === 1) {
            status = 'completed';
          } else if (module.completiondata?.state === 2) {
            status = 'in_progress';
          }
          
          return {
            id: module.id?.toString() || `module_${index}`,
            name: module.name || 'Untitled Activity',
            type: activityType,
            description: module.description || module.intro || 'Complete this activity to progress in your learning.',
            duration: module.duration || '30 min',
            points: module.grade || 25,
            difficulty: module.difficulty || 'Easy',
            status: status,
            progress: module.completiondata?.progress || 0,
            order: index + 1,
            thumbnail: module.contents?.[0]?.fileurl || 
                      `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=300&fit=crop`,
            prerequisites: null,
            // Additional Moodle-specific data
            modname: module.modname,
            url: module.url,
            contents: module.contents,
            completiondata: module.completiondata,
            availabilityinfo: module.availabilityinfo
          };
        });
        
        console.log('✅ Transformed activities:', realActivities);
        console.log('📊 Activity details:');
        realActivities.forEach((activity, index) => {
          console.log(`  ${index + 1}. ${activity.name} (${activity.type}) - ${activity.status}`);
        });
        setSectionActivities(realActivities);
      } else {
        console.log('⚠️ Section not found or no modules available');
        
        // Try to get activities from current course data
        const currentSection = getCourseSections().find(s => s.name === sectionName);
        if (currentSection) {
          console.log('🔄 Using current course data for section:', currentSection);
          const combinedActivities = [
            ...currentSection.lessons.map((lesson: any, index: number) => ({
              id: lesson.id || `lesson_${index}`,
              name: lesson.name || lesson.displayName,
              type: 'video',
              description: lesson.description || 'Complete this lesson to progress in your learning.',
              duration: lesson.duration || '45 min',
              points: lesson.grade || 25,
              difficulty: lesson.difficulty || 'Easy',
              status: lesson.completiondata?.state === 1 ? 'completed' : 
                     lesson.completiondata?.state === 2 ? 'in_progress' : 'pending',
              progress: lesson.completiondata?.progress || 0,
              order: index + 1,
              thumbnail: lesson.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=300&fit=crop`,
              prerequisites: null,
              modname: lesson.modname,
              url: lesson.url,
              contents: lesson.contents,
              completiondata: lesson.completiondata
            })),
            ...currentSection.modules.map((module: any, index: number) => ({
              id: module.id || `module_${index}`,
              name: module.name || module.displayName,
              type: module.modname === 'quiz' ? 'quiz' : 
                    module.modname === 'assign' ? 'assignment' : 
                    module.modname === 'resource' ? 'reading' : 'activity',
              description: module.description || module.intro || 'Complete this activity to progress.',
              duration: module.duration || '30 min',
              points: module.grade || 20,
              difficulty: module.difficulty || 'Easy',
              status: module.completiondata?.state === 1 ? 'completed' : 
                     module.completiondata?.state === 2 ? 'in_progress' : 'pending',
              progress: module.completiondata?.progress || 0,
              order: index + 1,
              thumbnail: module.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=300&fit=crop`,
              prerequisites: null,
              modname: module.modname,
              url: module.url,
              contents: module.contents,
              completiondata: module.completiondata
            }))
          ];
          console.log('✅ Using combined activities from current data:', combinedActivities);
          setSectionActivities(combinedActivities);
        } else {
          // Fallback to sample data if section not found
          const fallbackActivities = [
            {
              id: `${sectionName}_activity_1`,
              name: `${sectionName} - Main Activity`,
              type: 'video',
              description: `Complete the main activity for ${sectionName}`,
              duration: '45 min',
              points: 25,
                      difficulty: 'Easy',
              status: 'pending',
              progress: 0,
                      order: 1,
              thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
              prerequisites: null
            }
          ];
          setSectionActivities(fallbackActivities);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching section activities:', error);
      // Fallback to sample data on error
      const errorActivities = [
        {
          id: `${sectionName}_error_1`,
          name: `${sectionName} - Activity`,
          type: 'video',
          description: 'Activity content will be loaded when available',
          duration: '30 min',
          points: 20,
                      difficulty: 'Easy',
          status: 'pending',
          progress: 0,
                      order: 1,
          thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
          prerequisites: null
        }
      ];
      setSectionActivities(errorActivities);
    } finally {
      setIsLoadingSectionActivities(false);
    }
  };

  const fetchLessonActivities = async (lessonId: string) => {
    if (!lessonId) return;
    
    try {
      setIsLoadingActivities(true);
      console.log('🔄 Fetching lesson activities for:', lessonId);
      
      // Generate sample activities for the lesson
      const sampleActivities = [
        {
          id: `${lessonId}_quiz`,
          name: 'Lesson Quiz',
                  type: 'quiz',
          description: 'Test your knowledge about this lesson',
                duration: '15 min',
                points: 30,
                  difficulty: 'Easy',
                  status: Math.random() > 0.6 ? 'completed' : Math.random() > 0.3 ? 'in_progress' : 'pending',
                  dueDate: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  progress: Math.floor(Math.random() * 100),
                      order: 1,
          thumbnail: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop'
                },
                {
          id: `${lessonId}_video`,
          name: 'Lesson Video',
                  type: 'video',
          description: 'Watch an interactive video about this lesson',
          duration: '20 min',
          points: 25,
                  difficulty: 'Easy',
                  status: Math.random() > 0.7 ? 'completed' : 'pending',
                  progress: Math.floor(Math.random() * 100),
                      order: 2,
          thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
        },
        {
          id: `${lessonId}_assignment`,
          name: 'Lesson Assignment',
          type: 'assignment',
          description: 'Complete the assignment for this lesson',
          duration: '45 min',
          points: 50,
                  difficulty: 'Medium',
                  status: Math.random() > 0.8 ? 'completed' : Math.random() > 0.4 ? 'overdue' : 'pending',
                  dueDate: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  progress: Math.floor(Math.random() * 100),
                      order: 3,
          thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
        }
      ];
      
      setLessonActivities(sampleActivities);
      console.log(`✅ Found ${sampleActivities.length} activities for lesson`);
    } catch (error) {
      console.error('❌ Error fetching lesson activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [currentUser?.id]);



  // Fetch real IOMAD data when specific tabs are accessed
  const fetchRealDataForTab = async (tab: string) => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoadingRealData(true);
      console.log(`🔄 Fetching real IOMAD data for tab: ${tab}`);
      
      switch (tab) {
        case 'lessons':
          const lessons = await fetchRealLessons();
          setRealLessons(lessons);
          break;
        case 'activities':
          const activities = await fetchRealActivities();
          setRealActivities(activities);
          break;
        case 'tree-view':
          const treeData = await fetchRealTreeViewData();
          setRealTreeData(treeData);
          break;
      }
    } catch (error) {
      console.error(`❌ Error fetching real data for ${tab}:`, error);
    } finally {
      setIsLoadingRealData(false);
    }
  };

  // Fetch real upcoming lessons and activities
  const fetchUpcomingItems = async () => {
    setIsLoadingUpcoming(true);
    try {
      // Get upcoming lessons from course sections
      const sections = getCourseSections();
      const allLessons: any[] = [];
      const allActivities: any[] = [];

      sections.forEach(section => {
        // Add lessons that are not completed
        if (section.lessons) {
          section.lessons.forEach((lesson: any) => {
            if (lesson.completiondata?.state !== 1) { // Not completed
              allLessons.push({
                id: lesson.id,
                title: lesson.name || lesson.displayName,
                course: section.name,
                date: new Date().toISOString().split('T')[0], // Today's date as placeholder
                time: "09:00 AM", // Placeholder time
                duration: lesson.duration || "45 min",
                type: "Video Lesson",
                status: lesson.completiondata?.state === 2 ? "in_progress" : "upcoming",
                lesson: lesson,
                section: section
              });
            }
          });
        }

        // Add activities that are not completed
        if (section.modules) {
          section.modules.forEach((module: any) => {
            if (module.completiondata?.state !== 1) { // Not completed
              allActivities.push({
                id: module.id,
                title: module.name || module.displayName,
                course: section.name,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
                dueTime: "11:59 PM",
                type: module.modname === 'quiz' ? 'Quiz' : module.modname === 'assign' ? 'Assignment' : 'Activity',
                points: module.grade || 20,
                status: module.completiondata?.state === 2 ? "in_progress" : "pending",
                module: module,
                section: section
              });
            }
          });
        }
      });

      // Sort by priority: in_progress first, then upcoming/pending
      const sortedLessons = allLessons.sort((a, b) => {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
        return 0;
      });

      const sortedActivities = allActivities.sort((a, b) => {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
        return 0;
      });

      // Take top 3 for each
      setUpcomingLessons(sortedLessons.slice(0, 3));
      setUpcomingActivities(sortedActivities.slice(0, 3));

    } catch (error) {
      console.error('Error fetching upcoming items:', error);
      // Fallback to empty arrays
      setUpcomingLessons([]);
      setUpcomingActivities([]);
    } finally {
      setIsLoadingUpcoming(false);
    }
  };

  // Fetch real upcoming course sessions for schedule
  const fetchUpcomingCourseSessions = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real upcoming course sessions for schedule...');
      const upcomingSessions: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch upcoming sessions from each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              // Only include incomplete items as upcoming sessions
              if (module.completiondata?.state !== 1) {
                const sessionDate = new Date();
                // Add some days to simulate upcoming schedule
                sessionDate.setDate(sessionDate.getDate() + Math.floor(Math.random() * 7) + 1);
                
                upcomingSessions.push({
                  id: module.id,
                  title: module.name,
                  course: course.fullname || course.shortname,
                  section: section.name,
                  type: module.modname === 'quiz' ? 'Quiz' : 
                        module.modname === 'assign' ? 'Assignment' : 
                        module.modname === 'lesson' ? 'Lesson' : 
                        module.modname === 'resource' ? 'Reading' : 'Activity',
                  date: sessionDate,
                  day: sessionDate.toLocaleDateString('en-US', { weekday: 'long' }),
                  time: `${Math.floor(Math.random() * 12) + 9}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
                  duration: module.duration || '45 min',
                  status: module.completiondata?.state === 2 ? 'in_progress' : 'upcoming',
                  priority: module.modname === 'assign' ? 'High' : 
                           module.modname === 'quiz' ? 'Medium' : 'Low',
                  points: module.grade || 25,
                  module: module,
                  courseId: course.id,
                  sectionId: section.id
                });
              }
            });
          }
        });
      }
      
      // Sort by date and priority
      const sortedSessions = upcomingSessions.sort((a, b) => {
        // First by date
        if (a.date.getTime() !== b.date.getTime()) {
          return a.date.getTime() - b.date.getTime();
        }
        // Then by priority (High > Medium > Low)
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      console.log(`✅ Found ${sortedSessions.length} upcoming course sessions`);
      return sortedSessions.slice(0, 10); // Return top 10 upcoming sessions
    } catch (error) {
      console.error('❌ Error fetching upcoming course sessions:', error);
      return [];
    }
  };

  // Calculate statistics
  const totalCourses = courses.length || propUserCourses?.length || 0;
  const completedLessons = activities.filter(activity => activity.status === 'completed').length || propStudentActivities?.filter(activity => activity.status === 'completed').length || 0;
  const totalPoints = assignments.reduce((sum, assignment) => sum + (assignment.grade || 0), 0) || propUserAssignments?.reduce((sum, assignment) => sum + (assignment.grade || 0), 0) || 0;
  const weeklyGoal = Math.min(5, Math.floor(completedLessons / 2) + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .scorm-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        
        .scorm-content h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .scorm-content h3 {
          color: #374151;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
        }
        
        .scorm-content h4 {
          color: #4b5563;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
        
        .scorm-content p {
          margin-bottom: 1rem;
        }
        
        .scorm-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .scorm-content li {
          margin-bottom: 0.5rem;
        }
        
        .scorm-content .interactive-element {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        
        .scorm-content .content-section {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        
        .scorm-content .interactive-demo {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        
        .scorm-content .demo-container {
          margin-top: 1rem;
        }
        
        .scorm-content .demo-buttons {
          display: flex;
          gap: 0.5rem;
          margin: 1rem 0;
          flex-wrap: wrap;
        }
        
        .scorm-content .demo-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        .scorm-content .demo-btn:hover {
          background: #2563eb;
        }
        
        .scorm-content .demo-result {
          background: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .scorm-content .assessment {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        
        .scorm-content .options {
          margin: 1rem 0;
        }
        
        .scorm-content .options label {
          display: block;
          margin-bottom: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
        }
        
        .scorm-content .options label:hover {
          background: #f3f4f6;
        }
        
        .scorm-content .options input[type="radio"] {
          margin-right: 0.5rem;
        }
        
        .scorm-content .completion-summary {
          text-align: center;
          background: #ecfdf5;
          border: 1px solid #10b981;
          border-radius: 0.5rem;
          padding: 2rem;
          margin: 1rem 0;
        }
        
        .scorm-content .success-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .scorm-content .results {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
          text-align: left;
        }
        
        .scorm-content .results ul {
          list-style: none;
          padding: 0;
        }
        
        .scorm-content .results li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .scorm-content .results li:last-child {
          border-bottom: none;
        }
        
        .scorm-content .certificate {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        
        .scorm-content .download-cert {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
          transition: background-color 0.2s;
        }
        
        .scorm-content .download-cert:hover {
          background: #059669;
        }
        
        .scorm-content .navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .scorm-content .next-btn,
        .scorm-content .prev-btn,
        .scorm-content .submit-btn,
        .scorm-content .finish-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .scorm-content .next-btn:hover,
        .scorm-content .prev-btn:hover,
        .scorm-content .submit-btn:hover,
        .scorm-content .finish-btn:hover {
          background: #2563eb;
        }
        
        .scorm-content .prev-btn {
          background: #6b7280;
        }
        
        .scorm-content .prev-btn:hover {
          background: #4b5563;
        }
        
        .scorm-content .submit-btn,
        .scorm-content .finish-btn {
          background: #10b981;
        }
        
        .scorm-content .submit-btn:hover,
        .scorm-content .finish-btn:hover {
          background: #059669;
        }
      `}</style>
      {/* Enhanced Fixed Sidebar */}
      <div className="fixed top-0 left-0 z-30 w-64 h-full bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 overflow-y-auto hidden lg:block scrollbar-hide">
        {/* Enhanced Logo */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <img src={logo} alt="kodeit" className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">KodeIt</span>
              <p className="text-xs text-blue-100">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="p-4 space-y-6 pb-20">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              DASHBOARD
            </h3>
            <ul className="space-y-2">
              {canAccessFeature('dashboard') && (
                <li>
                <button 
                  onClick={() => handleTabChange('dashboard')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                </li>
              )}
              {canAccessFeature('courses') && (
                <li>
                <button 
                  onClick={() => handleTabChange('courses')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'courses' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Courses</span>
                </button>
                </li>
              )}
              {canAccessFeature('lessons') && (
                <li>
                <button 
                  onClick={async () => {
                    handleTabChange('lessons');
                    await fetchRealDataForTab('lessons');
                  }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'lessons' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                    <Video className="w-4 h-4" />
                    <span>Lessons</span>
                </button>
                </li>
              )}
                            {canAccessFeature('activities') && (
                <li>
                <button 
                  onClick={async () => {
                    handleTabChange('activities');
                    await fetchRealDataForTab('activities');
                  }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'activities' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                    <Activity className="w-4 h-4" />
                  <span>Activities</span>
                </button>
                </li>
              )}
          {canAccessFeature('achievements') && (
                <li>
                <button 
                  onClick={() => handleTabChange('achievements')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'achievements' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                    <Trophy className="w-4 h-4" />
                  <span>Achievements</span>
                </button>
                </li>
              )}
                {canAccessFeature('schedule') && (
                  <li>
                <button 
                  onClick={() => handleTabChange('schedule')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'schedule' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                  </li>
                )}
              </ul>
            </div>

          {/* Additional Navigation Sections */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              TOOLS & RESOURCES
            </h3>
            <ul className="space-y-2">
              {canAccessFeature('tree-view') && (
                <li>
                  <button 
                    onClick={async () => {
                      handleTabChange('tree-view');
                      await fetchRealDataForTab('tree-view');
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'tree-view' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Tree View</span>
                  </button>
                </li>
              )}

            </ul>
          </div>

                    <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              SETTINGS & PROFILE
              </h3>
            <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => handleTabChange('profile-settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'profile-settings' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                  >
                    <Settings className="w-4 h-4" />
                  <span>Settings</span>
                  </button>
                </li>
              </ul>
          </div>

          {/* Enhanced Quick Actions Section */}
                    <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              QUICK ACTIONS
              </h3>
            <div className="space-y-3">
              

              {/* E-books Card */}
              {canAccessFeature('basic_tools') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                     onClick={() => handleTabChange('ebooks')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-600/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">E-books</h4>
                      <p className="text-xs text-blue-100">Access digital learning materials</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
                </div>
              )}

              {/* Ask Teacher Card */}
              {canAccessFeature('basic_tools') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                     onClick={() => handleTabChange('ask-teacher')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">Ask Teacher</h4>
                      <p className="text-xs text-green-100">Get help from your instructor</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
                </div>
              )}

              {/* KODEIT AI Buddy Card */}
              {canAccessFeature('ai_features') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-600/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">KODEIT AI Buddy</h4>
                      <p className="text-xs text-orange-100">Get instant coding help</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
                </div>
              )}

              {/* Code Editor Card */}
              {canAccessFeature('code_editor') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                     onClick={() => handleTabChange('code-editor')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-600/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">Code Editor</h4>
                      <p className="text-xs text-indigo-100">Write and run JavaScript code</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
                </div>
              )}

              {/* Share with Class Card */}
              {canAccessFeature('basic_tools') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                     onClick={() => handleTabChange('share-class')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-600/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-white" />
          </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">Share with Class</h4>
                      <p className="text-xs text-pink-100">Collaborate with classmates</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
                </div>
              )}

              {/* Scratch Editor Card */}
              {canAccessFeature('scratch_editor') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                     onClick={() => handleTabChange('scratch-editor')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-600/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">Scratch Editor</h4>
                      <p className="text-xs text-indigo-100">Create interactive projects</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
                    </div>
          )}

            </div>
          </div>
        </nav>
                  </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Server Error Banner */}
        {isServerOffline && (
          <div className="fixed top-0 left-0 lg:left-64 right-0 z-30 bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-800 font-medium">Server Connection Issue</span>
                <span className="text-red-600 text-sm">{serverError}</span>
              </div>
              <button 
                onClick={() => {
                  setIsServerOffline(false);
                  setServerError('');
                  fetchDashboardData();
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}
        
        {/* Page Navigation Header */}
        {currentPage !== 'dashboard' && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={currentPage === 'section-view' ? handleBackToCourseView : handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>
                                                  {currentPage === 'section-view' ? 'Back to Course' : 'Back to Dashboard'}
                </span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <span className="text-sm text-gray-500">
                {currentPage === 'course-detail' ? 'Course Details' : 
                 currentPage === 'section-view' ? `Section: ${selectedSection?.name || ''}` : 'Dashboard'}
              </span>
            </div>
          </div>
        )}
        
        {/* Fixed Top Bar */}
        <header className={`fixed ${isServerOffline ? 'top-12' : 'top-0'} left-0 lg:left-64 right-0 z-20 bg-white shadow-sm border-b border-gray-200`}>
          <div className="px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses, teachers, or resources..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Server Status Indicator */}
                {isServerOffline && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Server Offline</span>
                  </div>
                )}
                
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                <div className="relative">
                <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                      Grade {getUserGrade()} {userRole === 'admin' ? 'Admin' : userRole === 'teacher' ? 'Teacher' : 'Student'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          Grade {getUserGrade()} {userRole === 'admin' ? 'Admin' : userRole === 'teacher' ? 'Teacher' : 'Student'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentUser?.fullname || currentUser?.firstname || 'User'}
                        </p>
            </div>
                <button 
                  onClick={() => {
                          setShowProfileDropdown(false);
                          localStorage.removeItem('authToken');
                          localStorage.removeItem('userData');
                          window.location.href = '/login/student';
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                </button>
              </div>
                  )}
            </div>
          </div>
        </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="bg-gray-50 min-h-screen pt-32 my-10 p-4 lg:p-6">
          <div className="max-w-full mx-auto">
            <div className="mt-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your enhanced learning dashboard...</p>
                    <p className="text-sm text-gray-500 mt-2">This should take just a few seconds</p>
                  </div>
                </div>
              )}

              {/* Content when not loading */}
              {!isLoading && (
                <>
                  {/* Page-based Navigation System */}
                  {currentPage === 'dashboard' && (
                <>
                  {/* Dashboard Tab Content */}
                  {activeTab === 'dashboard' && (
                    <>
                      {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Courses Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-600/20"></div>
                    <div className="relative p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-100">Active Courses</p>
                            <p className="text-3xl font-bold">{totalCourses}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100 text-sm">This semester</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <span className="text-sm font-medium">4.8/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  </div>

                    {/* Activities Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-600/20"></div>
                    <div className="relative p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-emerald-100">Lessons Completed</p>
                            <p className="text-3xl font-bold">{completedLessons}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-100 text-sm">This week</span>
                        <div className="flex items-center space-x-1">
                          <Flame className="w-4 h-4 text-orange-300 fill-current" />
                          <span className="text-sm font-medium">On fire!</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full"></div>
                  </div>

                    {/* Points Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-red-600/20"></div>
                    <div className="relative p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-100">Total Points</p>
                            <p className="text-3xl font-bold">{totalPoints}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-100 text-sm">Earned this month</span>
                        <div className="flex items-center space-x-1">
                          <Crown className="w-4 h-4 text-yellow-300 fill-current" />
                          <span className="text-sm font-medium">Top 10%</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  </div>

                    {/* Goal Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-600/20"></div>
                    <div className="relative p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-100">Weekly Goal</p>
                            <p className="text-3xl font-bold">{weeklyGoal}/5</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-100 text-sm">Target: 5 lessons</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-pink-300 fill-current" />
                          <span className="text-sm font-medium">80%</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(weeklyGoal / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full"></div>
                  </div>
                </div>

                

                {/* Enhanced My Courses Section */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">My Learning Journey</h2>
                      <p className="text-gray-600">Continue where you left off and discover new skills</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Live Learning</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {(courses.length > 0 ? courses : propUserCourses || []).slice(0, 3).map((course, index) => (
                            <div key={course.id || index} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                        {/* Course Header with Enhanced Design */}
                        <div className="relative h-48 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center">
                              <BookOpen className="w-16 h-16 text-white opacity-80" />
                            </div>
                          
                          {/* Floating Elements */}
                          <div className="absolute top-4 left-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                                    Beginner
                            </span>
                          </div>
                          
                          <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          
                          {/* Progress Overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                      <span className="text-sm font-bold text-gray-900">75%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: '75%' }}
                                ></div>
                              </div>
                                    <p className="text-xs text-gray-600 mt-1">15/20 lessons completed</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Course Content */}
                        <div className="p-6">
                          <div className="mb-4">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {course.fullname || course.name || `Course ${index + 1}`}
                                  </h3>
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {course.summary || course.shortname || `Description for Course ${index + 1}`}
                                  </p>
                          </div>
                          
                          {/* Course Stats */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-gray-600">6 weeks</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">24 students</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700">4.8</span>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <button 
                                  onClick={() => handleCourseClick(course)}
                            className="group/btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span>Continue Learning</span>
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                        
                        {/* Hover Effect Border */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 transition-colors pointer-events-none"></div>
                      </div>
                    ))}
                  </div>

                        {/* Upcoming Lessons Section */}
      {/* IOMAD Calendar Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Calendar Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-blue-600" />
                           Learning Calendar
                        </h3>
                        <button 
                          onClick={() => setActiveTab('schedule')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Full
                        </button>
                      </div>
                      
                      {/* Mini Calendar */}
                      <div className="mb-4">
                        {/* Month Header */}
                        <div className="text-center mb-3">
                          <h4 className="text-lg font-bold text-purple-600">
                            {new Date().toLocaleDateString('en-US', { month: 'long' })}
                          </h4>
                          <p className="text-sm text-gray-600">{new Date().getFullYear()}</p>
                        </div>
                        
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <div key={day} className={`p-2 font-bold rounded-lg ${
                              index === 0 ? 'bg-red-100 text-red-600' : 
                              index === 6 ? 'bg-blue-100 text-blue-600' : 
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 35 }, (_, i) => {
                            const date = new Date();
                            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                            const startDate = new Date(firstDay);
                            startDate.setDate(startDate.getDate() - firstDay.getDay());
                            const currentDate = new Date(startDate);
                            currentDate.setDate(startDate.getDate() + i);
                            
                            const isToday = currentDate.toDateString() === new Date().toDateString();
                            const isCurrentMonth = currentDate.getMonth() === date.getMonth();
                            const hasEvents = upcomingCourseSessions.some(session => {
                              const sessionDate = new Date(session.date);
                              return sessionDate.toDateString() === currentDate.toDateString();
                            });
                            
                            return (
                              <div 
                                key={i} 
                                className={`p-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-110 ${
                                  isToday 
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold shadow-lg' 
                                    : hasEvents 
                                    ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold' 
                                    : isCurrentMonth 
                                    ? 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-700 hover:from-blue-100 hover:to-indigo-200' 
                                    : 'bg-gray-50 text-gray-400'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-sm font-bold">{currentDate.getDate()}</div>
                                  {hasEvents && (
                                    <div className="flex justify-center mt-1">
                                      <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Today's Events */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-600" />
                          Today's Learning Activities
                        </h4>
                        {(() => {
                          const today = new Date().toDateString();
                          const todaysEvents = upcomingCourseSessions.filter(session => {
                            const sessionDate = new Date(session.date);
                            return sessionDate.toDateString() === today;
                          }).slice(0, 3);
                          
                          if (todaysEvents.length === 0) {
                            return (
                              <div className="text-center py-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-dashed border-yellow-300">
                                <Target className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                                <p className="text-sm font-medium text-yellow-800">No activities today!</p>
                                <p className="text-xs text-yellow-600 mt-1">Time to explore new lessons!</p>
                              </div>
                            );
                          }
                          
                          return todaysEvents.map(session => (
                            <div key={session.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
                                <p className="text-xs text-gray-600">{session.time} • {session.type}</p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Upcoming Lessons & Activities */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Upcoming Lessons Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          Upcoming Lessons
                        </h3>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View All
                        </button>
                      </div>
                      
                      {isLoadingUpcoming ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading lessons...</span>
                        </div>
                      ) : upcomingLessons.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingLessons.slice(0, 3).map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{lesson.title}</h4>
                                  <p className="text-xs text-gray-600">{lesson.course}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{lesson.date}</div>
                                <div className="text-xs text-gray-600">{lesson.time} • {lesson.duration}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={`text-xs px-2 py-1 rounded-full ${
                                    lesson.status === 'in_progress' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    {lesson.status === 'in_progress' ? 'In Progress' : lesson.type}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No upcoming lessons available</p>
                          <p className="text-xs text-gray-400 mt-1">Complete current lessons to see new ones</p>
                        </div>
                      )}
                    </div>

                    {/* Upcoming Activities Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-600" />
                          Upcoming Activities
                        </h3>
                        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                          View All
                        </button>
                      </div>
                      
                      {isLoadingUpcoming ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          <span className="ml-3 text-gray-600">Loading activities...</span>
                        </div>
                      ) : upcomingActivities.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingActivities.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <Target className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                                  <p className="text-xs text-gray-600">{activity.course}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{activity.date}</div>
                                <div className="text-xs text-gray-600">{activity.time} • {activity.duration}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={`text-xs px-2 py-1 rounded-full ${
                                    activity.status === 'in_progress' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-green-50 text-green-600'
                                  }`}>
                                    {activity.status === 'in_progress' ? 'In Progress' : activity.type}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No upcoming activities available</p>
                          <p className="text-xs text-gray-400 mt-1">Complete current activities to see new ones</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                        {/* Upcoming Activities Section */}
      
                </div>
                              </>
                            )}
                              </>
                            )}

                  {/* Courses Tab Content */}
                  {activeTab === 'courses' && !showCourseDetail && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                    <div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h2>
                          <p className="text-gray-600">All your enrolled courses and learning progress</p>
                    </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                          <Plus className="w-4 h-4 inline mr-2" />
                          Enroll in Course
                          </button>
                  </div>
                  
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(courses.length > 0 ? courses : propUserCourses || []).map((course, index) => (
                          <div key={course.id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer" onClick={() => handleCourseClick(course)}>
                            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <BookOpen className="w-16 h-16 text-white opacity-80" />
                              <div className="absolute top-4 right-4">
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  {course.difficulty || 'Beginner'}
                          </span>
                          </div>
                              </div>
                      <div className="p-6">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {course.fullname || course.name || `Course ${index + 1}`}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4">
                                {course.summary || course.shortname || `Description for Course ${index + 1}`}
                              </p>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>6 weeks</span>
                                  <span>24 students</span>
                              </div>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium ml-1">4.8</span>
                              </div>
                          </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: '75%' }}
                                ></div>
                              </div>
                        <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">75% Complete</span>
                                                      <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCourseClick(course);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Continue Learning
                          </button>
                            </div>
                          </div>
                        </div>
                  ))}
                          </div>
                            </div>
                          )}


                  {/* Course Detail View - Old Code Style */}
                  {activeTab === 'courses' && showCourseDetail && selectedCourse && (
                    <div className="space-y-8">
                      {/* Course Header with Old Code Styling - Only show when no section is selected */}
                      {!selectedSection && (
                      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
                        <div className="flex items-center space-x-4 mb-6">
                      <button 
                            onClick={handleBackToCourses}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">
                              {selectedCourse.fullname || selectedCourse.name}
                            </h2>
                            <p className="text-blue-100">
                              {selectedCourse.summary || selectedCourse.shortname}
                            </p>
                    </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="w-4 h-4 text-yellow-300 fill-current" />
                              <span className="text-sm font-medium">4.8</span>
                    </div>
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                              75% Complete
                            </span>
                  </div>
                          </div>
                          
                        {/* Enhanced Progress Bar */}
                        <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: '75%' }}
                          ></div>
                            </div>
                        <p className="text-blue-100 text-sm">15/20 lessons completed • 3 assignments pending</p>
                          </div>
                      )}
                          
                      {/* Loading State */}
                      {isLoadingCourseDetail && (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your learning journey...</p>
                              </div>
                              </div>
                            )}

                      {/* Course Content - Only show when no section is selected */}
                      {!isLoadingCourseDetail && !selectedSection && (
                        <div className="space-y-8">
                          {/* Course Overview Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Video className="w-6 h-6 text-blue-600" />
                              </div>
                    <div>
                                  <h3 className="text-lg font-semibold text-gray-900">Lessons</h3>
                                  <p className="text-2xl font-bold text-blue-600">{courseLessons.length}</p>
                            </div>
                          </div>
                        </div>
                        
                            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-purple-600" />
                          </div>
                                <div>
                                  <h3 className="text-base font-semibold text-gray-900">Modules</h3>
                                  <p className="text-xl font-bold text-purple-600">{courseModules.length}</p>
                            </div>
                            </div>
                          </div>
                          
                            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                                      <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Activity className="w-5 h-5 text-green-600" />
                                </div>
              <div>
                                  <h3 className="text-base font-semibold text-gray-900">Activities</h3>
                                  <p className="text-xl font-bold text-green-600">{courseModules.length + courseLessons.length}</p>
                                </div>
                                </div>
                            </div>
                          </div>
                          
                                                      {/* Course Sections - Horizontal Rectangular Cards */}
                            <div className="space-y-4">
                              {/* Expand All Button */}
                              <div className="flex justify-end">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                                  Expand all
                          </button>
                        </div>
                        
                              {/* Enhanced Section Cards */}
                              {(() => {
                                const sections = getCourseSections();
                                
                                return sections.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {sections.map((section, sectionIndex) => (
                                  <div 
                                    key={sectionIndex} 
                                      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer"
                                    onClick={() => handleSectionClick(section)}
                                  >
                                        {/* Section Header with Gradient Background */}
                                      <div className="relative h-20 overflow-hidden">
                                        <div className={`absolute inset-0 ${sectionIndex % 4 === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                            sectionIndex % 4 === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                                            sectionIndex % 4 === 2 ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                                            'bg-gradient-to-br from-orange-500 to-red-600'
                                          }`} />
                                          
                                          {/* Section Icon Overlay */}
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                            <BookOpen className="w-8 h-8 text-white/80 mx-auto mb-1" />
                                              <span className="text-white/90 text-xs font-medium">Section {sectionIndex + 1}</span>
                                            </div>
                </div>

                                          {/* Section Number Badge */}
                                          <div className="absolute top-2 left-2">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-black/20 backdrop-blur-sm">
                                              {sectionIndex + 1}
                                            </span>
                                          </div>
                                          
                                          {/* Activity Count Badge */}
                                          <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-white/20 backdrop-blur-sm">
                                              {section.lessons.length + section.modules.length}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Section Content */}
                                      <div className="p-3">
                                        <div className="mb-2">
                                          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                            {section.name}
                                          </h3>
                                          <p className="text-xs text-gray-600 leading-relaxed">
                                              {section.description || `Complete all activities in this section to progress.`}
                                          </p>
                  </div>
                  
                                          {/* Section Stats */}
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                              <div className="text-center">
                                              <div className="text-sm font-bold text-blue-600">
                                                  {section.lessons.length}
                                                </div>
                                                <div className="text-xs text-gray-500">Lessons</div>
                                              </div>
                                              <div className="text-center">
                                              <div className="text-sm font-bold text-purple-600">
                                                  {section.modules.length}
                                                </div>
                                                <div className="text-xs text-gray-500">Modules</div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Action Button */}
                                        <button 
                                          className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-medium rounded-md transition-all duration-300 transform group-hover:scale-105 shadow-sm"
                                          onClick={() => handleSectionClick(section)}
                                        >
                                          <div className="flex items-center justify-center space-x-1">
                                              <BookOpen className="w-3 h-3" />
                                              <span>Explore</span>
                                              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                                          </button>
                        </div>
                      </div>
                                    ))}
                                  </div>
                                ) : (
                                <div className="text-center py-12 text-gray-500">
                                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-10 h-10 text-gray-300" />
                                    </div>
                                  <h4 className="text-lg font-medium mb-2 text-gray-700">No Course Content Available</h4>
                                  <p className="text-gray-500 max-w-md mx-auto text-sm">
                                      Course sections and activities will appear here once they're added to your course.
                                    </p>
                    </div>
                              );
                              })()}
                        </div>
                        </div>
                          )}
              </div>
            )}

                      {/* Section Activities View */}
                      {selectedSection && !selectedActivity && (
                        console.log('🎯 Rendering section activities view for:', selectedSection.name, 'with', sectionActivities.length, 'activities'),
                <div className="space-y-6">
                  
                                             {/* Enhanced Section Header */}
                           <div className="relative h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl overflow-hidden shadow-lg">
                            {/* Back to Course Button - Outside Container */}
                      <button 
                                onClick={handleBackToCourseView}
                      className="absolute top-6 left-6 flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all duration-300 group bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-200 shadow-md"
                      >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Course</span>
                      </button>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700" />
                            
                            <div className="absolute inset-0 bg-opacity-10 bg-white" />
                        
                        
                    
                    {/* Section Info Overlay - Inside Container */}
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      
                      
                          {/* Enhanced Section Stats */}
                      <div className="grid grid-cols-3 gap-2">
                      <div className="mb-3">
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm mb-2 border border-white/30">
                                  <BookOpen className="w-4 h-4 inline mr-2" />Section Overview
                        </span>
                                <h1 className="text-xl font-bold mb-2 text-white drop-shadow-lg break-words overflow-visible">
                                  <Rocket className="w-5 h-5 inline mr-2" />
                                  {selectedSection.name}
                                </h1>
                                 <p className="text-blue-100 text-sm font-medium"><Star className="w-4 h-4 inline mr-2" />{sectionActivities.length} activities available</p>
                        </div>
                        <div className="text-center p-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                          <span className="text-lg text-blue-100 mx-auto mb-1 block">🎯</span>
                                  <div className="text-base font-bold text-white">{sectionActivities.length}</div>
                                  <div className="text-blue-100 text-xs">Activities</div>
                        </div>
                            <div className="text-center p-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                                              <Trophy className="w-4 h-4 text-blue-100 mx-auto mb-1 block" />
                              <div className="text-base font-bold text-white">
                                    {sectionActivities.filter(a => a.status === 'completed').length}/{sectionActivities.length}
                              </div>
                                  <div className="text-blue-100 text-xs">Completed</div>
                      </div>
                      </div>
                    </div>
                  </div>

                          {/* Section Content - Modules & Activities */}
                          <div className="space-y-8">
                            
                            {/* Modules Section */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border-2 border-blue-200 p-6">
                              <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"><Rocket className="w-8 h-8 inline mr-3" />Learning Adventures!</h2>
                                  <p className="text-sm text-blue-700 font-medium"><Star className="w-4 h-4 inline mr-2" />Discover amazing new things to learn!</p>
                                </div>
                              </div>
                            
                            {isLoadingSectionActivities ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                  <div className="relative">
                                                                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <Target className="w-8 h-8 text-white" />
                                  </div>
                                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                  <p className="text-blue-700 text-lg font-semibold"><Activity className="w-5 h-5 inline mr-2" />Loading your adventures...</p>
                                  <p className="text-blue-600 text-sm">Get ready for some fun learning!</p>
                    </div>
                                      </div>
                        ) : (
                                <div className="relative">
                                  {/* Timeline Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 rounded-full"></div>
                                  
                                  {/* Modules List */}
                                  <div className="space-y-6">
                                    {sectionActivities
                                      .filter(activity => 
                                        activity.modname === 'scorm' || 
                                        activity.type === 'video' || 
                                        activity.type === 'reading'
                                      )
                                      .map((activity, index) => (
                                      <div key={activity.id} className="relative flex items-start space-x-6 group">
                                        
                                        {/* Timeline Indicator */}
                                        <div className="relative z-10 flex-shrink-0">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-all duration-300 ${activity.status === 'completed'
                                              ? 'bg-gradient-to-br from-green-400 to-emerald-600 animate-pulse' 
                                              : activity.status === 'in_progress'
                                              ? 'bg-gradient-to-br from-blue-400 to-cyan-600 animate-bounce'
                                              : 'bg-gradient-to-br from-purple-400 to-pink-600 hover:animate-pulse'
                                          }`}>
                                            {activity.status === 'completed' ? (
                                              <CheckCircle className="w-6 h-6 text-white" />
                                            ) : activity.status === 'in_progress' ? (
                                              <Rocket className="w-6 h-6 text-white" />
                                            ) : (
                                              <Star className="w-6 h-6 text-white" />
                                          )}
                          </div>
                                        </div>
                                        
                                        {/* Module Card */}
                                        <div className="flex-1 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 overflow-hidden group-hover:border-purple-400 group-hover:scale-105 transform">
                                          <div className="flex">
                                            {/* Module Thumbnail */}
                                            <div className="w-28 h-24 flex-shrink-0 overflow-hidden">
                                              {activity.thumbnail ? (
                                                <img 
                                                  src={activity.thumbnail} 
                                                  alt={activity.name}
                                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=300&fit=crop`;
                                                  }}
                                                />
                                              ) : (
                                              <div className={`w-full h-full flex items-center justify-center ${activity.modname === 'scorm' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                                                  activity.type === 'video' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                                  activity.type === 'reading' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                                                  'bg-gradient-to-br from-purple-500 to-pink-600'
                                                }`}>
                                                  {activity.modname === 'scorm' ? (
                                                    <Globe className="w-8 h-8 text-white" />
                                                  ) : activity.type === 'video' ? (
                                                    <Video className="w-8 h-8 text-white" />
                                                  ) : activity.type === 'reading' ? (
                                                    <BookOpen className="w-8 h-8 text-white" />
                                                  ) : (
                                                    <Target className="w-8 h-8 text-white" />
                                                  )}
                                      </div>
                                              )}
                                            </div>
                                            
                                            {/* Module Content */}
                                            <div className="flex-1 p-4">
                                              <div className="mb-3">
                                                                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-2">
                                                  <Target className="w-5 h-5 inline mr-2" />{activity.name}
                                                </h3>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                  {activity.description || <><Star className="w-4 h-4 inline mr-1" />Complete this awesome module to unlock new skills!</>}
                                                </p>
                                              </div>
                                              
                                              {/* Module Details */}
                                              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                                <div className="flex items-center space-x-4">
                                                  <span className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span className="font-medium text-blue-800">{activity.duration || '30 min'}</span>
                                          </span>
                                                  {activity.dueDate && (
                                                    <span className="bg-orange-100 px-2 py-1 rounded-full font-medium text-orange-800">
                                                      <Calendar className="w-4 h-4 inline mr-1" />Due: {activity.dueDate}
                                          </span>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Difficulty & Points */}
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${activity.difficulty === 'Easy' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' :
                                                      activity.difficulty === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' : 
                                                      'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md'
                                                    }`}>
                                                    {activity.difficulty === 'Easy' ? <CheckCircle className="w-4 h-4 inline mr-1" /> : activity.difficulty === 'Medium' ? <Circle className="w-4 h-4 inline mr-1" /> : <X className="w-4 h-4 inline mr-1" />}{activity.difficulty}
                                          </span>
                                                  <span className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-md">
                                                    <Star className="w-4 h-4 mr-1" />
                                                    {activity.points || 25} pts
                                          </span>
                                        </div>
                                                
                                                {/* Action Button */}
                                                <button 
                                                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${activity.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' :
                                                      activity.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white' :
                                                      'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                                                  }`}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleActivityClick(activity);
                                                  }}
                                                >
                                                  {activity.status === 'completed' ? 'Review' :
                                                   activity.status === 'in_progress' ? 'Continue' : 
                                                   'Start'}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Activities Section */}
                            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-lg border-2 border-green-200 p-6">
                              <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                                  <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"><Target className="w-8 h-8 inline mr-3" />Fun Activities!</h2>
                                  <p className="text-sm text-green-700 font-medium"><Activity className="w-4 h-4 inline mr-2" />Interactive games, quizzes, and creative projects!</p>
                                </div>
                              </div>
                              
                              {isLoadingSectionActivities ? (
                                <div className="flex items-center justify-center py-12">
                                  <div className="text-center">
                                    <div className="relative">
                                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <Target className="w-8 h-8 text-white" />
                                      </div>
                                      <div className="absolute inset-0 w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-green-700 text-lg font-semibold"><Activity className="w-5 h-5 inline mr-2" />Loading your fun activities...</p>
                                    <p className="text-green-600 text-sm">Get ready for some exciting challenges!</p>
                                  </div>
                                </div>
                                                            ) : (
                                <div className="relative">
                                  {/* Timeline Line */}
                                  <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-teal-500 to-blue-500 rounded-full"></div>
                                  
                                  {/* Activities List */}
                                  <div className="space-y-6">
                                    {sectionActivities
                                      .filter(activity => 
                                        activity.type === 'quiz' || 
                                        activity.type === 'assignment' || 
                                        activity.type === 'discussion' ||
                                        activity.type === 'project'
                                      )
                                      .map((activity, index) => (
                                      <div key={activity.id} className="relative flex items-start space-x-6 group">
                                        
                                        {/* Timeline Indicator */}
                                        <div className="relative z-10 flex-shrink-0">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-all duration-300 ${activity.status === 'completed'
                                              ? 'bg-gradient-to-br from-green-400 to-emerald-600 animate-pulse' 
                                              : activity.status === 'in_progress'
                                              ? 'bg-gradient-to-br from-blue-400 to-cyan-600 animate-bounce'
                                              : 'bg-gradient-to-br from-purple-400 to-pink-600 hover:animate-pulse'
                                      }`}>
                                        {activity.status === 'completed' ? (
                                              <Trophy className="w-6 h-6" />
                                            ) : activity.status === 'in_progress' ? (
                                              <Rocket className="w-6 h-6" />
                                            ) : (
                                              <Target className="w-6 h-6" />
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Activity Card */}
                                        <div className="flex-1 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 overflow-hidden group-hover:border-teal-400 group-hover:scale-105 transform">
                                          <div className="flex">
                                            {/* Activity Thumbnail */}
                                            <div className="w-28 h-24 flex-shrink-0 overflow-hidden">
                                              {activity.thumbnail ? (
                                                <img 
                                                  src={activity.thumbnail} 
                                                  alt={activity.name}
                                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=300&fit=crop`;
                                                  }}
                                                />
                                              ) : (
                                              <div className={`w-full h-full flex items-center justify-center ${activity.type === 'quiz' ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                                                  activity.type === 'assignment' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                                                  activity.type === 'discussion' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                                  activity.type === 'project' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                                                  'bg-gradient-to-br from-gray-500 to-gray-600'
                                                }`}>
                                                  {activity.type === 'quiz' ? (
                                                    <FileText className="w-8 h-8 text-white" />
                                                  ) : activity.type === 'assignment' ? (
                                                    <Monitor className="w-8 h-8 text-white" />
                                                  ) : activity.type === 'discussion' ? (
                                                    <MessageSquare className="w-8 h-8 text-white" />
                                                  ) : activity.type === 'project' ? (
                                                    <Star className="w-8 h-8 text-white" />
                                                  ) : (
                                                    <Target className="w-8 h-8 text-white" />
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            
                                            {/* Activity Content */}
                                            <div className="flex-1 p-4">
                                              <div className="mb-3">
                                                                                                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors mb-2">
                                                    <Target className="w-5 h-5 inline mr-2" />{activity.name}
                                                </h3>
                                                  <p className="text-sm text-gray-700 leading-relaxed">
                                                    {activity.description || <><Star className="w-4 h-4 inline mr-2" />Complete this exciting activity to unlock new achievements!</>}
                                                </p>
                                              </div>
                                              
                                              {/* Activity Details */}
                                              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                                <div className="flex items-center space-x-4">
                                                  <span className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span className="font-medium text-green-800">{activity.duration || '30 min'}</span>
                                                  </span>
                                                  {activity.dueDate && (
                                                    <span className="bg-orange-100 px-2 py-1 rounded-full font-medium text-orange-800">
                                                      <Calendar className="w-4 h-4 inline mr-1" />Due: {activity.dueDate}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Difficulty & Points */}
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${activity.difficulty === 'Easy' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' :
                                                      activity.difficulty === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' : 
                                                      'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md'
                                                    }`}>
                                                    {activity.difficulty === 'Easy' ? <CheckCircle className="w-4 h-4 inline mr-1" /> : activity.difficulty === 'Medium' ? <Circle className="w-4 h-4 inline mr-1" /> : <X className="w-4 h-4 inline mr-1" />}{activity.difficulty}
                                                  </span>
                                                  <span className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-md">
                                                    <Star className="w-4 h-4 mr-1" />
                                                    {activity.points || 25} pts
                                                  </span>
                                                </div>
                                                
                                                {/* Action Button */}
                                                <button 
                                                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${activity.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' :
                                                      activity.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white' :
                                                      'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white'
                                                  }`}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleActivityClick(activity);
                                                  }}
                                                >
                                                  {                                        activity.status === 'completed' ? 'Review' :
                                                   activity.status === 'in_progress' ? 'Continue' : 
                                                   'Start'}
                      </button>
                                              </div>
                                            </div>
                                          </div>
                    </div>
                                </div>
                              ))}
                                  </div>
                            </div>
                          )}
                            </div>
                        </div>
                      </div>
                                             )}

                       {/* Detailed Activity View */}
                        {selectedActivity && activityDetails && !isActivityStarted && (
                    <div className="space-y-6">
                            {/* Back Button - Only show when in activities view */}
                            {isInActivitiesView && (
                              <div className="flex justify-start mb-4">
                                <button 
                                  onClick={handleBackToSectionView}
                                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 hover:text-gray-900 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md border border-gray-200"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                  <span>Back to Section</span>
                                </button>
                              </div>
                            )}
                            
                           {/* Activity Header */}
                            <div className="relative h-64 bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 rounded-2xl overflow-visible shadow-lg border border-green-100">
                             <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-teal-200 to-blue-200" />
                        
                             {/* Activity Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <button 
                                 onClick={handleBackToSectionView}
                                 className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors mb-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-white/50"
                          >
                                 <ArrowLeft className="w-4 h-2" />
                                 <span>Back to Section</span>
                          </button>
                          
                          <div className="mb-4">
                                 <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 mb-3 shadow-sm border border-orange-200">
                                   <Target className="w-4 h-4 inline mr-2" />{activityDetails.type?.toUpperCase() || 'ACTIVITY'}
                            </span>
                                 <h1 className="text-3xl font-bold mb-2 text-gray-800 break-words overflow-visible leading-tight">
                                   <Rocket className="w-6 h-6 inline mr-2" />
                                   {activityDetails.name}
                                 </h1>
                                 <p className="text-gray-700 text-lg"><Star className="w-4 h-4 inline mr-2" />Real IOMAD Adventure!</p>
                          </div>
                          
                               {/* Activity Stats */}
                          <div className="flex items-center space-x-8 mb-4">
                                 <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-white/50">
                                   <Clock className="w-5 h-5 text-gray-700" />
                                   <span className="text-gray-700 font-medium">{activityDetails.estimatedTime}</span>
                            </div>
                                 <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-white/50">
                                   <Star className="w-5 h-5 text-gray-700" />
                                   <span className="text-gray-700 font-medium">{activityDetails.points} points</span>
                            </div>
                                 <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-white/50">
                                   <span className="text-xl text-gray-700">
                                     {activityDetails.status === 'completed' ? '' :
                                      activityDetails.status === 'in_progress' ? <Rocket className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                                   </span>
                                   <span className="text-gray-700 font-medium">
                                     {activityDetails.status === 'completed' ? 'Completed' :
                                      activityDetails.status === 'in_progress' ? 'In Progress' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                           {/* Activity Content */}
                           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 overflow-visible">
                             {isLoadingActivityDetails ? (
                               <div className="flex items-center justify-center py-12">
                                 <div className="text-center">
                                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                   <p className="text-gray-600">Loading activity details...</p>
                          </div>
                        </div>
                             ) : (
                               <div className="space-y-8">
                                 {/* Activity Overview */}
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                   {/* Left Column - Description */}
                                   <div className="space-y-6">
                                     <div>
                                       <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                         <BookOpen className="w-5 h-5 mr-2" />
                                         What You'll Learn
                                       </h3>
                                       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 overflow-visible">
                                         <p className="text-gray-700 leading-relaxed">
                                           {activityDetails.fullDescription}
                                         </p>
                                       </div>
                          </div>
                          
                                     <div>
                                       <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                         <Target className="w-5 h-5 mr-2" />
                                         Learning Goals
                                       </h3>
                                       <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 overflow-visible">
                                         <p className="text-gray-700 leading-relaxed">
                                           {activityDetails.learningObjectives}
                                         </p>
                                        </div>
                                      </div>
                                      
                                     <div>
                                       <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                         <Settings className="w-5 h-5 mr-2" />
                                         What You Need
                                       </h3>
                                       <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 overflow-visible">
                                         <p className="text-gray-700 leading-relaxed">
                                           {activityDetails.requirements}
                                         </p>
                                       </div>
                                     </div>
                                          </div>

                                   {/* Right Column - Details */}
                                   <div className="space-y-6">
                                     <div>
                                       <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                         <FileText className="w-5 h-5 mr-2" />
                                         Activity Info
                                       </h3>
                                       <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 space-y-4 overflow-visible">
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Type:</span>
                                           <span className="font-medium text-gray-900">{activityDetails.type}</span>
                                          </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Duration:</span>
                                           <span className="font-medium text-gray-900">{activityDetails.estimatedTime}</span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Points:</span>
                                           <span className="font-medium text-gray-900">{activityDetails.points}</span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Difficulty:</span>
                                      <span className={`px-2 py-1 rounded text-sm font-medium ${activityDetails.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                             activityDetails.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                             {activityDetails.difficulty}
                                          </span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Status:</span>
                                      <span className={`px-2 py-1 rounded text-sm font-medium ${activityDetails.status === 'completed' ? 'bg-green-100 text-green-800' :
                                             activityDetails.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                             'bg-gray-100 text-gray-800'
                                           }`}>
                                             {activityDetails.status === 'completed' ? 'Completed' :
                                              activityDetails.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                           </span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Max Attempts:</span>
                                           <span className="font-medium text-gray-900">{activityDetails.maxAttempts}</span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Due Date:</span>
                                           <span className="font-medium text-gray-900">{activityDetails.dueDate}</span>
                                         </div>
                                        </div>
                                      </div>
                                      
                                     {/* Moodle Module Info */}
                                     {activityDetails.modname && (
                                       <div>
                                         <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                           <span className="mr-2">🌐</span>
                                           Moodle Adventure
                                         </h3>
                                         <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 space-y-4">
                                           <div className="flex justify-between items-center">
                                             <span className="text-gray-600">Module Type:</span>
                                             <span className="font-medium text-gray-900">{activityDetails.modname}</span>
                                        </div>
                                           {activityDetails.url && (
                                             <div className="flex justify-between items-center">
                                               <span className="text-gray-600">URL:</span>
                                               <a href={activityDetails.url} target="_blank" rel="noopener noreferrer" 
                                                  className="font-medium text-blue-600 hover:text-blue-800 underline">
                                                 Open Activity
                                               </a>
                                        </div>
                                           )}
                                           {activityDetails.availabilityinfo && (
                                             <div>
                                               <span className="text-gray-600 block mb-2">Availability:</span>
                                               <p className="text-sm text-gray-700">{activityDetails.availabilityinfo}</p>
                                      </div>
                                           )}
                                         </div>
                                    </div>
                          )}

                                     {/* Module Contents */}
                                     {activityDetails.formattedContent && activityDetails.formattedContent.length > 0 && (
                                       <div>
                                         <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                           <span className="mr-2">📁</span>
                                           Files & Resources
                                         </h3>
                                         <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 space-y-3">
                                           {activityDetails.formattedContent.map((content: any, index: number) => (
                                             <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                                               <div className="flex items-center space-x-3">
                                                 <FileText className="w-5 h-5 text-gray-500" />
                                                 <div>
                                                   <p className="font-medium text-gray-900">{content.filename}</p>
                                                   <p className="text-sm text-gray-500">
                                                     {content.filesize ? `${Math.round(content.filesize / 1024)} KB` : 'Unknown size'}
                                                   </p>
                        </div>
                      </div>
                                               {content.fileurl && (
                                                 <a href={content.fileurl} target="_blank" rel="noopener noreferrer"
                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                                                   Download
                                                 </a>
                                               )}
                    </div>
                                           ))}
                                         </div>
                                       </div>
                                     )}
                                   </div>
                                 </div>

                                                                   {/* Action Buttons */}
                                  <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
                                    <button 
                                      onClick={handleBackToSectionView}
                                       className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                       <ArrowLeft className="w-4 h-4 inline mr-2" />Back to Section
                                    </button>
                                    <button 
                                      onClick={startActivity}
                                       className={`px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${activityDetails.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' :
                                           activityDetails.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white' :
                                           'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                                      }`}
                                    >
                                      {activityDetails.status === 'completed' ? 'Review Activity' :
                                       activityDetails.status === 'in_progress' ? 'Continue Activity' : 'Start Activity'}
                                    </button>
                                  </div>
                               </div>
                             )}
                           </div>
                         </div>
                       )}

                       {/* Inline Activity Content View */}
                       {selectedActivity && activityDetails && isActivityStarted && (
                    <div className="space-y-6">
                           {/* Back Button - Only show when in activities view */}
                           {isInActivitiesView && (
                             <div className="flex justify-start mb-4">
                               <button 
                                 onClick={handleBackToSectionView}
                                 className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 hover:text-gray-900 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md border border-gray-200"
                               >
                                 <ArrowLeft className="w-4 h-4" />
                                 <span>Back to Section</span>
                               </button>
                             </div>
                           )}
                           
                           {/* Activity Progress Header */}
                           <div className="relative h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-xl overflow-hidden border border-green-100">
                             <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200" />
                             
                             {/* Progress Info Overlay */}
                             <div className="absolute bottom-6 left-6 right-6 text-white">
                          <button 
                                 onClick={() => setIsActivityStarted(false)}
                                 className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors mb-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-white/50"
                          >
                            <ArrowLeft className="w-4 h-4" />
                                 <span>Back to Details</span>
                          </button>
                          
                          <div className="">
                                 <h1 className="text-2xl font-bold mb-2 text-gray-800 break-words overflow-visible leading-tight">
                                   <Rocket className="w-5 h-5 inline mr-2" />
                                   {activityDetails.name}
                                 </h1>
                                 <p className="text-gray-700 text-lg"><Star className="w-4 h-4 inline mr-2" />Activity in Progress</p>
                          </div>
                          
                               {/* Progress Bar */}
                               <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                                 <div 
                                   className="bg-blue-300 h-2 rounded-full transition-all duration-500"
                                   style={{ width: `${activityProgress}%` }}
                                 />
                            </div>
                               <p className="text-gray-700 text-sm font-medium">{activityProgress}% Complete</p>
                            </div>
                          </div>
                          
                           {/* Activity Content */}
                           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 overflow-visible">
                             <div className="mb-6">
                               <div className="flex items-center justify-between">
                                 <h2 className="text-2xl font-bold text-gray-900">Activity Content</h2>
                                 <div className="flex items-center space-x-3">
                                   <span className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activityDetails.status === 'completed' ? 'bg-green-100 text-green-800' :
                                     activityDetails.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                     'bg-gray-100 text-gray-800'
                                   }`}>
                                     {activityDetails.status === 'completed' ? 'Completed' :
                                      activityDetails.status === 'in_progress' ? 'In Progress' : 'Active'}
                                   </span>
                                   <button 
                                     onClick={handleBackToSectionView}
                                     className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-colors whitespace-nowrap min-w-fit border border-gray-200"
                                   >
                                     Exit Activity
                                   </button>
                          </div>
                        </div>
                      </div>

                             {/* Render Activity Content Based on Type */}
                             {renderActivityContent()}

                             {/* Activity Footer */}
                             <div className="mt-8 pt-6 border-t border-gray-200">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-4">
                                   <span className="text-sm text-gray-600">
                                     Time spent: {Math.floor(activityProgress / 10)} minutes
                                   </span>
                                   <span className="text-sm text-gray-600">
                                     Points: {activityDetails.points}
                                   </span>
                            </div>
                                 <div className="flex items-center space-x-3">
                                   <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-colors border border-gray-200">
                                     Save Progress
                                   </button>
                                   <button className="px-4 py-2 bg-green-300 hover:bg-green-400 text-green-800 hover:text-green-900 rounded-lg font-medium transition-colors border border-green-200">
                                     Complete Activity
                                   </button>
                          </div>
                              </div>
                            </div>
                           </div>
                         </div>
                       )}

                       {/* Video Player Modal */}
                       {isVideoPlaying && currentVideoUrl && (
                         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                           <div className="relative w-full max-w-4xl mx-4">
                             <div className="bg-white rounded-lg overflow-hidden">
                               {/* Video Player Header */}
                               <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
                                 <div className="flex items-center space-x-4">
                                 <h3 className="text-lg font-semibold text-gray-900">Video Player</h3>
                                   {isInActivitiesView && (
                                     <button 
                                       onClick={handleBackToSectionView}
                                       className="px-3 py-1 bg-blue-200 text-blue-800 rounded text-sm hover:bg-blue-300 transition-colors border border-blue-300"
                                     >
                                       <ArrowLeft className="w-4 h-4 inline mr-2" />Back to Section
                                     </button>
                                   )}
                                 </div>
                                 <button 
                                   onClick={closeVideo}
                                   className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                 >
                                   <X className="w-5 h-5 text-gray-600" />
                                 </button>
                                      </div>
                                      
                               {/* Video Player */}
                               <div className="relative">
                                 <video 
                                   className="w-full h-auto max-h-96"
                                   controls
                                   autoPlay
                                   src={currentVideoUrl}
                                            onError={(e) => {
                                     console.error('Video playback error:', e);
                                     alert('Video playback failed. Please try again or contact support.');
                                   }}
                                 >
                                   Your browser does not support the video tag.
                                 </video>
                                      </div>
                                      
                               {/* Video Controls */}
                               <div className="p-4 bg-gray-50">
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center space-x-4">
                                     <button 
                                       onClick={() => {
                                         const video = document.querySelector('video');
                                         if (video) video.currentTime = 0;
                                       }}
                                       className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                     >
                                       Restart
                                     </button>
                                     <button 
                                       onClick={() => {
                                         const video = document.querySelector('video');
                                         if (video) {
                                           if (video.paused) video.play();
                                           else video.pause();
                                         }
                                       }}
                                       className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                     >
                                       Play/Pause
                                     </button>
                                          </div>
                                   <button 
                                     onClick={closeVideo}
                                     className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                   >
                                     Close Video
                                      </button>
                                                  </div>
                                                  </div>
                                                </div>
                            </div>
                      </div>
                       )}

                       {/* Inline SCORM Viewer */}
                       {isScormLaunched && scormContent && (
                         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                           <div className="relative w-full max-w-6xl mx-4 h-5/6">
                             <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
                               {/* SCORM Header */}
                               <div className="flex items-center justify-between p-4 bg-indigo-600 text-white border-b">
                                 <div className="flex items-center space-x-4">
                                   <h3 className="text-lg font-semibold">{scormContent.title}</h3>
                                   {!scormContent.isRealScorm && (
                                   <span className="px-2 py-1 bg-indigo-500 rounded text-sm">
                                     Page {scormContent.currentPage} of {scormContent.totalPages}
                                   </span>
                                   )}
                                   {scormContent.isRealScorm && (
                                <span className={`px-2 py-1 rounded text-sm ${scormContent.isIomadScorm
                                         ? 'bg-blue-500' 
                                         : 'bg-green-500'
                                     }`}>
                                       {scormContent.isIomadScorm 
                                         ? 'IOMAD/Moodle SCORM' 
                                         : 'Real SCORM Package'
                                       }
                                     </span>
                                   )}
                                   {isInActivitiesView && (
                                     <button 
                                       onClick={handleBackToSectionView}
                                       className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
                                     >
                                       <ArrowLeft className="w-4 h-4 inline mr-2" />Back to Section
                                     </button>
                                   )}
                                 </div>
                                 <button 
                                   onClick={closeScorm}
                                   className="p-2 hover:bg-indigo-500 rounded-lg transition-colors"
                                 >
                                   <X className="w-5 h-5" />
                                 </button>
                               </div>
                               
                               {/* Progress Bar */}
                               <div className="bg-gray-100 px-4 py-2">
                                 <div className="w-full bg-gray-200 rounded-full h-2">
                                   <div 
                                     className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                     style={{ width: `${scormContent.progress}%` }}
                                   />
                                 </div>
                                 <div className="flex justify-between items-center mt-1">
                                   <p className="text-sm text-gray-600">{scormContent.progress}% Complete</p>
                                   {scormContent.score > 0 && (
                                     <p className="text-sm text-green-600 font-medium">Score: {scormContent.score}%</p>
                                   )}
                                 </div>
                               </div>
                               
                               {/* SCORM Content */}
                               <div className="flex-1 overflow-auto">
                                                                    {scormContent.isRealScorm ? (
                                     // Real SCORM Package Viewer
                                     <div className="h-full">
                                       {/* Cross-Origin Frame Handler */}
                                       <div id="scorm-frame-container" className="w-full h-full">
                                         {/* Content will be loaded by showScormContent() function */}
                                       </div>
                                     </div>
                                 ) : (
                                   // Enhanced Mock SCORM Content
                                   <div className="p-6">
                                 <div 
                                   className="scorm-content"
                                   dangerouslySetInnerHTML={{ 
                                     __html: scormContent.pages.find((p: any) => p.id === scormContent.currentPage)?.content || '' 
                                   }}
                                 />
                                   </div>
                                 )}
                               </div>
                               
                               {/* SCORM Navigation - Only for mock content */}
                               {!scormContent.isRealScorm && (
                               <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                                 <div className="flex items-center space-x-4">
                                   <button 
                                     onClick={() => navigateScormPage('prev')}
                                     disabled={scormContent.currentPage === 1}
                                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${scormContent.currentPage === 1
                                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                         : 'bg-gray-600 hover:bg-gray-700 text-white'
                                     }`}
                                   >
                                     Previous
                                   </button>
                                   <button 
                                     onClick={() => navigateScormPage('next')}
                                     disabled={scormContent.currentPage === scormContent.totalPages}
                                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${scormContent.currentPage === scormContent.totalPages
                                         ? 'bg-green-600 hover:bg-green-700 text-white' 
                                         : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                     }`}
                                   >
                                     {scormContent.currentPage === scormContent.totalPages ? 'Finish Module' : 'Next'}
                                   </button>
                                 </div>
                                 <div className="flex items-center space-x-4">
                                   <span className="text-sm text-gray-600">
                                     Time: 15 minutes
                                   </span>
                                   <button 
                                     onClick={closeScorm}
                                     className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                   >
                                     Exit Module
                                   </button>
                                 </div>
                               </div>
                               )}
                               
                                                               {/* Real SCORM Controls */}
                                {scormContent.isRealScorm && (
                                  <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                                    <div className="flex items-center space-x-4">
                                      <span className="text-sm text-gray-600">
                                        {scormContent.isIomadScorm 
                                          ? 'IOMAD/Moodle SCORM Package Loaded'
                                          : 'SCORM Package Loaded'
                                        }
                                      </span>
                                      {scormContent.activityId && (
                                        <span className="text-xs text-gray-500">
                                          Activity ID: {scormContent.activityId}
                                        </span>
                                      )}
                                      {scormContent.isIomadScorm && (
                                        <span className="text-xs text-gray-500">
                                          {scormLoadingMeta ? 'Loading details…' : (scormMeta?.attempts !== undefined ? `Attempts: ${scormMeta.attempts}` : '')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <button 
                                        onClick={() => window.open(scormContent.packageUrl, '_blank')}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                      >
                                        Open in New Tab
                                      </button>
                                      <button 
                                        onClick={closeScorm}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                      >
                                        Close Module
                                      </button>
                                    </div>
                                  </div>
                                )}
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Detailed Lesson View */}
                      

                  {/* Lessons Tab Content */}
                  {activeTab === 'lessons' && (
                    <div className="space-y-8">
                          <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Sections</h2>
                        <p className="text-gray-600">Browse lessons organized by course sections</p>
                      </div>

                      {isLoadingRealData ? (
                          <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading course sections from IOMAD...</span>
                          </div>
                        ) : (
                            <div className="space-y-6">
                          {getCourseSections().map((section, sectionIndex) => (
                            <div key={section.id || sectionIndex} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                              {/* Section Header */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <BookOpen className="w-5 h-5 text-blue-600" />
                                      </div>
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                                      <p className="text-sm text-gray-600">{section.description || 'Course section'}</p>
                                        </div>
                                      </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">
                                      {section.lessons?.length || 0} lessons
                                          </div>
                                    <div className="text-xs text-gray-500">
                                      {section.modules?.length || 0} activities
                                    </div>
                                </div>
                                        </div>
                                      </div>
                                      
                              {/* Section Content */}
                              <div className="p-6">
                                {/* Lessons in this section */}
                                {section.lessons && section.lessons.length > 0 && (
                                  <div className="mb-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                                      <Video className="w-4 h-4 text-blue-600" />
                                      Lessons
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {section.lessons.map((lesson, lessonIndex) => (
                                        <div key={lesson.id || lessonIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium text-gray-900 text-sm">{lesson.name || lesson.displayName}</h5>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              lesson.completiondata?.state === 1 ? 'bg-green-100 text-green-800' :
                                              lesson.completiondata?.state === 2 ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {lesson.completiondata?.state === 1 ? 'Completed' :
                                               lesson.completiondata?.state === 2 ? 'In Progress' : 'Pending'}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-600 mb-3">{lesson.description || 'Complete this lesson to progress'}</p>
                                          <button 
                                            onClick={() => handleLessonClickFromCourse(lesson)}
                                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                                              lesson.completiondata?.state === 1 ? 'bg-green-600 hover:bg-green-700 text-white' :
                                              lesson.completiondata?.state === 2 ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                              'bg-gray-600 hover:bg-gray-700 text-white'
                                            }`}
                                          >
                                            {lesson.completiondata?.state === 1 ? 'Review Lesson' :
                                             lesson.completiondata?.state === 2 ? 'Continue Lesson' : 'Start Lesson'}
                                      </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

                                {/* Activities in this section */}
                                {section.modules && section.modules.length > 0 && (
                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                                      <Target className="w-4 h-4 text-green-600" />
                                      Activities
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {section.modules.map((module, moduleIndex) => (
                                        <div key={module.id || moduleIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium text-gray-900 text-sm">{module.name || module.displayName}</h5>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              module.completiondata?.state === 1 ? 'bg-green-100 text-green-800' :
                                              module.completiondata?.state === 2 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                              {module.completiondata?.state === 1 ? 'Completed' :
                                               module.completiondata?.state === 2 ? 'In Progress' : 'Pending'}
                                </span>
                              </div>
                                          <p className="text-xs text-gray-600 mb-2">{module.description || module.intro || 'Complete this activity'}</p>
                                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>{module.modname === 'quiz' ? 'Quiz' : module.modname === 'assign' ? 'Assignment' : 'Activity'}</span>
                                            <span>{module.grade || 20} points</span>
                          </div>
                          <button 
                                            onClick={() => handleLessonClickFromCourse({
                                              id: module.id,
                                              name: module.name,
                                              description: module.description || module.intro,
                                              duration: module.duration || '30 min',
                                              progress: module.completiondata?.progress || 0,
                                              status: module.completiondata?.state === 1 ? 'completed' : 
                                                     module.completiondata?.state === 2 ? 'in_progress' : 'pending'
                                            })}
                                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                                              module.completiondata?.state === 1 ? 'bg-green-600 hover:bg-green-700 text-white' :
                                              module.completiondata?.state === 2 ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                  'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                              >
                                            {module.completiondata?.state === 1 ? 'Review Activity' :
                                             module.completiondata?.state === 2 ? 'Continue Activity' : 'Start Activity'}
                          </button>
                        </div>
                                      ))}
                                    </div>
                                      </div>
                          )}

                                {/* No content message */}
                                {(!section.lessons || section.lessons.length === 0) && (!section.modules || section.modules.length === 0) && (
                                  <div className="text-center py-8 text-gray-500">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">No lessons or activities in this section yet</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* No sections message */}
                          {getCourseSections().length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <h4 className="text-lg font-medium mb-2">No Course Sections Available</h4>
                              <p>Course sections from your IOMAD courses will appear here</p>
                            </div>
                          )}
                        </div>
                      )}
                            </div>
                  )}

                  {/* Activities Tab Content */}
                  {activeTab === 'activities' && (
                    <div className="space-y-8">
                                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Activities</h2>
                        <p className="text-gray-600">Complete assignments, quizzes, and interactive activities</p>
                                      </div>

                      {isLoadingRealData ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading real activities from IOMAD...</span>
                                  </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {realActivities.length > 0 ? realActivities.slice(0, 6).map((activity, index) => (
                            <div key={activity.id || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${activity.status === 'Completed' ? 'bg-green-100' :
                                  activity.status === 'In Progress' ? 'bg-yellow-100' : 'bg-gray-100'
                                }`}>
                                  <activity.icon className={`w-6 h-6 ${activity.status === 'Completed' ? 'text-green-600' :
                                    activity.status === 'In Progress' ? 'text-yellow-600' : 'text-gray-600'
                                  }`} />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {activity.status}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">{activity.courseName}</p>
                              <p className="text-gray-600 text-sm mb-4">{activity.type} • {activity.points} points</p>
                                  <button 
                                onClick={() => handleLessonClickFromCourse({
                                  id: activity.id,
                                  name: activity.title,
                                  description: `${activity.type} • ${activity.points} points`,
                                  duration: activity.duration,
                                  progress: activity.progress,
                                  status: activity.status === 'Completed' ? 'completed' : 
                                         activity.status === 'In Progress' ? 'in_progress' : 'pending'
                                })}
                                className={`w-full py-2 rounded-lg font-medium transition-colors ${activity.status === 'Completed' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                  activity.status === 'In Progress' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                              >
                                {activity.status === 'Completed' ? 'View Results' : 
                                 activity.status === 'In Progress' ? 'Continue' : 'Start Activity'}
                                  </button>
                                </div>
                          )) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <h4 className="text-lg font-medium mb-2">No Real Activities Available</h4>
                              <p>Activities from your IOMAD courses will appear here</p>
                            </div>
                                            )}
                                          </div>
                      )}
                                  </div>
                                )}

                  {/* Achievements Tab Content */}
                  {activeTab === 'achievements' && (
                    <div className="space-y-8">
                                          <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Achievements</h2>
                        <p className="text-gray-600">Celebrate your learning milestones and accomplishments</p>
                                          </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: 'First Steps', description: 'Complete your first lesson', icon: Trophy, earned: true, points: 50 },
                          { title: 'Quiz Master', description: 'Score 100% on 5 quizzes', icon: Star, earned: true, points: 100 },
                          { title: 'Code Warrior', description: 'Complete 10 coding projects', icon: Code, earned: false, points: 200 },
                          { title: 'Perfect Attendance', description: 'Attend 30 consecutive days', icon: Calendar, earned: true, points: 75 },
                          { title: 'Helpful Student', description: 'Help 5 classmates', icon: Users, earned: false, points: 150 },
                          { title: 'Early Bird', description: 'Complete lessons before deadline', icon: Clock, earned: true, points: 80 }
                        ].map((achievement, index) => (
                          <div key={index} className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border ${achievement.earned ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-200'
                              }`}>
                                <achievement.icon className={`w-6 h-6 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                                }`} />
                                        </div>
                              {achievement.earned && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Earned
                            </span>
                            )}
                                      </div>
                            <h3 className={`text-lg font-semibold mb-2 ${achievement.earned ? 'text-gray-900' : 'text-gray-500'
                            }`}>{achievement.title}</h3>
                            <p className={`text-sm mb-4 ${achievement.earned ? 'text-gray-600' : 'text-gray-400'
                            }`}>{achievement.description}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                              }`}>{achievement.points} points</span>
                              {achievement.earned && (
                                <span className="text-green-600 text-sm font-medium">✓ Unlocked</span>
                              )}
                                            </div>
                              </div>
                            ))}
                              </div>
                          </div>
                        )}

                  {/* Schedule Tab Content */}
                  {activeTab === 'schedule' && (
                    <div className="space-y-8">
                <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h2>
                        <p className="text-gray-600">Plan your learning journey and track upcoming activities</p>
                          </div>

                      {/* Compact IOMAD Calendar View - Matching Reference Image */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
                            <div className="flex items-center gap-2">
                              <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                                <option>All courses</option>
                                {courses.map(course => (
                                  <option key={course.id} value={course.id}>
                                    {course.fullname || course.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            New event
                          </button>
                        </div>
                        
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-4">
                          <button 
                            onClick={() => {
                              const newDate = new Date(currentMonth);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setCurrentMonth(newDate);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            {new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1).toLocaleDateString('en-US', { month: 'long' })}
                          </button>
                          <h4 className="text-base font-semibold text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </h4>
                          <button 
                            onClick={() => {
                              const newDate = new Date(currentMonth);
                              newDate.setMonth(newDate.getMonth() + 1);
                              setCurrentMonth(newDate);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            {new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).toLocaleDateString('en-US', { month: 'long' })}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Compact Calendar Grid */}
                        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
                          {/* Day Headers */}
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 bg-gray-50">
                              {day}
                            </div>
                          ))}
                          
                          {/* Calendar Days */}
                          {Array.from({ length: 42 }, (_, i) => {
                            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                            const startDate = new Date(firstDay);
                            startDate.setDate(startDate.getDate() - firstDay.getDay());
                            const currentDate = new Date(startDate);
                            currentDate.setDate(startDate.getDate() + i);
                            
                            const isToday = currentDate.toDateString() === new Date().toDateString();
                            const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
                            
                            // Fetch real IOMAD activities for this date
                            const dayActivities = upcomingCourseSessions.filter(session => {
                              const sessionDate = new Date(session.date);
                              return sessionDate.toDateString() === currentDate.toDateString();
                            });
                            
                            return (
                              <div 
                                key={i} 
                                className={`min-h-[80px] p-1 bg-white ${
                                  isToday ? 'bg-blue-50' : ''
                                } ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
                              >
                                {/* Date Number */}
                                <div className={`text-xs font-medium mb-1 ${
                                  isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                  {currentDate.getDate()}
                                </div>
                                
                                {/* IOMAD Activities - Display like reference image */}
                                {dayActivities.slice(0, 3).map((activity, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-center gap-1 mb-1"
                                  >
                                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs text-gray-700 truncate leading-tight">
                                      {activity.title.length > 20 ? activity.title.substring(0, 20) + '...' : activity.title}
                                    </span>
                                  </div>
                                ))}
                                
                                {/* Show more indicator if there are more activities */}
                                {dayActivities.length > 3 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{dayActivities.length - 3} more
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Calendar Footer */}
                        <div className="mt-4 flex items-center gap-4 text-sm text-blue-600">
                          <button className="hover:text-blue-700">Full calendar</button>
                          <button className="hover:text-blue-700">Import or export calendars</button>
                        </div>
                          </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Course Sessions</h3>
                            
                            {isLoadingSchedule ? (
                              <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Loading your course schedule...</span>
                              </div>
                            ) : upcomingCourseSessions.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingCourseSessions.slice(0, 5).map((session) => (
                                  <div key={session.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                      session.status === 'in_progress' ? 'bg-yellow-100' : 'bg-blue-100'
                                    }`}>
                                      <Calendar className={`w-6 h-6 ${
                                        session.status === 'in_progress' ? 'text-yellow-600' : 'text-blue-600'
                                      }`} />
                          </div>
                                  <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 text-sm">{session.title}</h4>
                                      <p className="text-xs text-gray-600 mb-1">{session.course} • {session.section}</p>
                                      <p className="text-sm text-gray-600">{session.day} • {session.time} • {session.type}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          session.status === 'in_progress' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-blue-50 text-blue-600'
                                        }`}>
                                          {session.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                                        </span>
                                        <span className="text-xs text-gray-500">{session.duration}</span>
                                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                          {session.points} pts
                                        </span>
                          </div>
                                    </div>
                                    <button 
                                      onClick={() => handleLessonClickFromCourse({
                                        id: session.module.id,
                                        name: session.title,
                                        description: session.module.description || `Complete this ${session.type.toLowerCase()}`,
                                        duration: session.duration,
                                        progress: session.module.completiondata?.progress || 0,
                                        status: session.status
                                      })}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                      Start
                                  </button>
                      </div>
                    ))}
                      </div>
                            ) : (
                              <div className="text-center py-12 text-gray-500">
                                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h4 className="text-lg font-medium mb-2">No Upcoming Sessions</h4>
                                <p className="text-sm">Complete current activities to see new upcoming sessions</p>
                              </div>
                            )}
                  </div>
                </div>

                    <div className="space-y-6">
                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
                            
                            {isLoadingSchedule ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                                <span className="ml-2 text-gray-600">Loading...</span>
                              </div>
                            ) : upcomingCourseSessions.filter(s => s.type === 'Assignment' || s.type === 'Quiz').length > 0 ? (
                        <div className="space-y-3">
                                {upcomingCourseSessions
                                  .filter(s => s.type === 'Assignment' || s.type === 'Quiz')
                                  .slice(0, 3)
                                  .map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                                        <h4 className="font-medium text-gray-900 text-sm">{session.title}</h4>
                                        <p className="text-xs text-gray-600 mb-1">{session.course}</p>
                                        <p className="text-sm text-gray-600">Due: {session.day}</p>
                          </div>
                                      <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          session.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                          session.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {session.priority}
                                  </span>
                                        <div className="text-xs text-orange-600 mt-1">{session.points} pts</div>
                                      </div>
                          </div>
                              ))}
                        </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No upcoming deadlines</p>
                                <p className="text-xs text-gray-400">All assignments and quizzes are completed!</p>
                              </div>
                            )}
                      </div>

                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Progress</h3>
                            <div className="space-y-4">
                      <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Course Progress</span>
                                  <span className="text-sm text-gray-600">
                                    {upcomingCourseSessions.filter(s => s.status === 'in_progress').length} in progress
                                  </span>
                            </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.min(100, (upcomingCourseSessions.filter(s => s.status === 'in_progress').length / Math.max(upcomingCourseSessions.length, 1)) * 100)}%` 
                                    }}
                                  ></div>
                          </div>
                        </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Upcoming Sessions</span>
                                  <span className="text-sm text-gray-600">{upcomingCourseSessions.length} scheduled</span>
                            </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.min(100, (upcomingCourseSessions.filter(s => s.type === 'Assignment' || s.type === 'Quiz').length / Math.max(upcomingCourseSessions.length, 1)) * 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Total Points Available:</span>
                                  <span className="font-medium text-gray-900">
                                    {upcomingCourseSessions.reduce((sum, s) => sum + (s.points || 0), 0)} pts
                                  </span>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                  {/* Tree View Tab Content */}
                  {activeTab === 'tree-view' && (
                    <div className="space-y-8">
                      {/* Enhanced Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                              <BookOpen className="w-8 h-8" />
                            </div>
                            <div>
                              <h2 className="text-3xl font-bold mb-2">Learning Path Explorer</h2>
                              <p className="text-blue-100 text-lg">Discover and navigate through your learning journey</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{realTreeData.length}</div>
                            <div className="text-blue-100">Active Courses</div>
                          </div>
                        </div>
                      </div>

                      {isLoadingRealData ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="text-center max-w-md">
                            <div className="relative">
                              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Your Learning Path</h3>
                            <p className="text-gray-600 mb-6">Fetching your IOMAD courses and activities...</p>
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                              <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Real IOMAD Tree Data - Enhanced Structure */}
                          {(realTreeData.length > 0 ? realTreeData : []).map((course, courseIndex) => (
                            <div key={course.id || courseIndex} className="group">
                              {/* Enhanced Course Card */}
                              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                {/* Course Header with Gradient */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <button
                                        onClick={() => {
                                          const courseId = course.id || courseIndex.toString();
                                          const newExpandedCourses = new Set(expandedCourses);
                                          if (newExpandedCourses.has(courseId)) {
                                            newExpandedCourses.delete(courseId);
                                          } else {
                                            newExpandedCourses.add(courseId);
                                          }
                                          setExpandedCourses(newExpandedCourses);
                                        }}
                                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                                      >
                                        <ChevronDown className={`w-5 h-5 text-blue-600 transition-all duration-300 ${expandedCourses.has(course.id || courseIndex.toString()) ? 'rotate-0' : '-rotate-90'}`} />
                                      </button>
                                      
                                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <BookOpen className="w-8 h-8 text-white" />
                                      </div>
                                      
                                      <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                          {course.name}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                          <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>{course.completedSections}/{course.totalSections} sections</span>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span>{course.progress}% complete</span>
                                          </div>
                                        </div>
                                        {course.description && (
                                          <p className="text-sm text-gray-500 mt-2">
                                            {course.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {/* Progress Circle */}
                                      <div className="relative w-16 h-16">
                                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                          <path className="text-gray-200" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                          <path className="text-blue-600" stroke="currentColor" strokeWidth="3" strokeDasharray={`${course.progress}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                                        </div>
                                      </div>
                                      
                                      <button
                                        onClick={() => alert(`Viewing course: ${course.name}\n\nSections: ${course.sections?.length || 0}\nProgress: ${course.progress}%`)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                      >
                                        View Course
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Enhanced Course Content - Expanded */}
                                {expandedCourses.has(course.id || courseIndex.toString()) && (
                                  <div className="p-6 bg-gray-50/50">
                                    <div className="space-y-4">
                                      {course.sections.map((section, sectionIndex) => (
                                        <div key={section.id || sectionIndex} className="group/section">
                                          {/* Enhanced Section Card */}
                                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
                                            <div className="p-4">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                  <button
                                                    onClick={() => {
                                                      const sectionId = section.id || `${course.id}-${sectionIndex}`;
                                                      const newExpandedTreeSections = new Set(expandedTreeSections);
                                                      if (newExpandedTreeSections.has(sectionId)) {
                                                        newExpandedTreeSections.delete(sectionId);
                                                      } else {
                                                        newExpandedTreeSections.add(sectionId);
                                                      }
                                                      setExpandedTreeSections(newExpandedTreeSections);
                                                    }}
                                                    className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-green-100 transition-all duration-200"
                                                  >
                                                    <ChevronDown className={`w-4 h-4 text-green-600 transition-all duration-300 ${expandedTreeSections.has(section.id || `${course.id}-${sectionIndex}`) ? 'rotate-0' : '-rotate-90'}`} />
                                                  </button>
                                                  
                                                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                                                    <BookOpen className="w-6 h-6 text-white" />
                                                  </div>
                                                  
                                                  <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                                      {section.name}
                                                    </h4>
                                                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                                                      <div className="flex items-center space-x-1">
                                                        <Activity className="w-4 h-4 text-green-500" />
                                                        <span>{section.activityCount} activities</span>
                                                      </div>
                                                      <div className="flex items-center space-x-1">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span>{section.progress}% complete</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                <button
                                                  onClick={() => handleTreeViewSectionClick(section)}
                                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                >
                                                  View Section
                                                </button>
                                              </div>
                                            </div>

                                            {/* Enhanced Section Activities - Expanded */}
                                            {expandedTreeSections.has(section.id || `${course.id}-${sectionIndex}`) && section.activities && (
                                              <div className="border-t border-gray-100 bg-gray-50/30">
                                                <div className="p-4 space-y-3">
                                                  {(section.activities as any[]).map((activity: any, activityIndex: number) => (
                                                    <div key={activity.id || activityIndex} className="group/activity bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                          {/* Enhanced Activity Badge */}
                                                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${activity.status === 'completed'
                                                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                                                              : 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
                                                            }`}>
                                                            {activity.status === 'completed' ? (
                                                              <CheckCircle className="w-6 h-6" />
                                                            ) : (
                                                              <span className="text-sm font-bold">{activity.order}</span>
                                                            )}
                                                          </div>

                                                          {/* Enhanced Activity Icon */}
                                                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                                            <span className="text-xl">{activity.icon}</span>
                                                          </div>

                                                          {/* Enhanced Activity Details */}
                                                          <div className="flex-1">
                                                            <h5 className="text-base font-semibold text-gray-900 mb-1">
                                                              {activity.name}
                                                            </h5>
                                                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                                              <span className="flex items-center space-x-1">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                <span>{activity.type}</span>
                                                              </span>
                                                              <span className="flex items-center space-x-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{activity.duration}</span>
                                                              </span>
                                                              <span className="flex items-center space-x-1">
                                                                <Star className="w-3 h-3 text-yellow-500" />
                                                                <span>{activity.points} pts</span>
                                                              </span>
                                                            </div>
                                                          </div>
                                                        </div>

                                                        {/* Enhanced Start Button */}
                                                        <button
                                                          onClick={() => handleTreeViewActivityClick(activity, course)}
                                                          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                        >
                                                          Start
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Enhanced Fallback for when no real data is available */}
                          {realTreeData.length === 0 && (
                            <div className="text-center py-16">
                              <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                  <BarChart3 className="w-12 h-12 text-gray-400" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">No IOMAD Courses Available</h4>
                                <p className="text-gray-600 mb-6">Your enrolled courses from IOMAD/Moodle will appear here once loaded</p>
                                <button
                                  onClick={() => fetchRealDataForTab('tree-view')}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                  Refresh Data
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}




                  {/* Scratch Editor Tab Content */}
                  {activeTab === 'scratch-editor' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Scratch Code Editor</h2>
                        <p className="text-gray-600">Create interactive stories, games, and animations with Scratch</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="h-[calc(100vh-200px)]">
                          <ScratchEmulator />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Code Editor Tab Content - Real Monaco Editor */}
                  {activeTab === 'code-editor' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Code Editor</h2>
                        <p className="text-gray-600">Write, test, and run your code with Monaco Editor - Professional development environment</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="h-[calc(100vh-200px)]">
                          {/* Real Monaco Editor Integration */}
                          <div className="vscode-editor h-full">
                            {/* Code Editor Header */}
                            <div className="vscode-header bg-gray-800 text-white p-3 border-b border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                  <span className="text-sm font-medium">{fileName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <select 
                                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value as any)}
                                  >
                                  <option value="javascript">JavaScript</option>
                                  <option value="python">Python</option>
                                    <option value="html-css">HTML & CSS</option>
                                </select>
                                  <button 
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    onClick={runCode}
                                    disabled={isRunning}
                                  >
                                    {isRunning ? 'Running...' : '▶ Run'}
                                </button>
                                  <button 
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    onClick={saveCode}
                                  >
                                    💾 Save
                                </button>
                                </div>
                              </div>
                            </div>

                            {/* Code Editor Area */}
                            <div className="flex-1 bg-gray-900 h-[calc(100%-60px)]">
                              {language === 'html-css' ? (
                                <div className="h-full">
                                  <div className="flex border-b border-gray-700">
                                    <button 
                                      className={`px-4 py-2 text-sm ${activeFileTab === 'html' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                                      onClick={() => setActiveFileTab('html')}
                                    >
                                      HTML
                                    </button>
                                    <button 
                                      className={`px-4 py-2 text-sm ${activeFileTab === 'css' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                                      onClick={() => setActiveFileTab('css')}
                                    >
                                      CSS
                                    </button>
                                  </div>
                                  <EditorPane
                                    language={activeFileTab === 'html' ? 'html' : 'css'}
                                    code={activeFileTab === 'html' ? htmlCode : cssCode}
                                    onChange={activeFileTab === 'html' ? setHtmlCode : setCssCode}
                                    markers={[]}
                                  />
                                </div>
                              ) : (
                                <EditorPane
                                  language={language}
                                  code={code}
                                  onChange={setCode}
                                  markers={[]}
                                />
                              )}
                            </div>

                            {/* Output Console */}
                            <div className="bg-gray-800 p-4 border-t border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-300">Output Console</span>
                                <button 
                                  className="text-xs text-gray-400 hover:text-white transition-colors"
                                  onClick={clearOutput}
                                >
                                  Clear
                                </button>
                              </div>
                              <div className="bg-black rounded p-3 max-h-32 overflow-y-auto">
                                {language === 'html-css' ? (
                                  <PreviewPane html={htmlCode} css={cssCode} />
                                ) : (
                                  <OutputPane 
                                    output={output} 
                                    isWaitingForInput={false}
                                    inputValue=""
                                    onInputChange={() => {}}
                                    onInputSubmit={() => {}}
                                    status=""
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Ask Teacher Tab Content */}
                  {activeTab === 'ask-teacher' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Ask Your Teacher</h2>
                        <p className="text-gray-600">Get help and support from your teachers</p>
                      </div>
                  
                  {/* Quick Questions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'I need help with my assignment',
                        'Can you explain this concept?',
                        'I want to discuss my progress',
                        'Help with technical issues'
                      ].map((question, index) => (
                        <button 
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700">{question}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input 
                          type="text" 
                          placeholder="What's your question about?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea 
                          rows={4}
                          placeholder="Describe your question or concern..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Send Message
                        </button>
                        <button 
                          type="button"
                          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Save Draft
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Recent Messages */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
                    <div className="space-y-3">
                      {[
                        {
                          id: '1',
                          subject: 'Help with Python assignment',
                          teacher: 'Ms. Johnson',
                          date: '2 hours ago',
                          status: 'replied'
                        },
                        {
                          id: '2',
                          subject: 'Question about Scratch project',
                          teacher: 'Mr. Smith',
                          date: '1 day ago',
                          status: 'pending'
                        },
                        {
                          id: '3',
                          subject: 'Technical issue with code editor',
                          teacher: 'Dr. Chen',
                          date: '3 days ago',
                          status: 'replied'
                        }
                      ].map((message) => (
                        <div key={message.id} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{message.subject}</h4>
                              <p className="text-sm text-gray-500">To: {message.teacher} • {message.date}</p>
                            </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${message.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {message.status === 'replied' ? 'Replied' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

                  {/* Share with Class Tab Content */}
                  {activeTab === 'share-class' && (
                    <div className="space-y-8">
                <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Share with Class</h2>
                        <p className="text-gray-600">Share your work and collaborate with classmates</p>
                      </div>
                  
                  {/* Share Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[
                      {
                        title: 'Share Project',
                        description: 'Share your Scratch or coding projects with classmates',
                        icon: Code,
                        color: 'blue'
                      },
                      {
                        title: 'Share Achievement',
                        description: 'Celebrate your completed assignments and milestones',
                        icon: Award,
                        color: 'green'
                      },
                      {
                        title: 'Share Resource',
                        description: 'Share helpful links, books, or study materials',
                        icon: BookOpen,
                        color: 'purple'
                      },
                      {
                        title: 'Ask for Help',
                        description: 'Ask classmates for help with difficult topics',
                        icon: MessageSquare,
                        color: 'orange'
                      },
                      {
                        title: 'Study Group',
                        description: 'Create or join study groups for collaborative learning',
                        icon: Users,
                        color: 'pink'
                      },
                      {
                        title: 'Feedback Request',
                        description: 'Ask for feedback on your work from peers',
                        icon: TrendingUp,
                        color: 'indigo'
                      }
                    ].map((option, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className={`w-12 h-12 bg-${option.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                          <option.icon className={`w-6 h-6 text-${option.color}-600`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                        <p className="text-gray-600 text-sm">{option.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Shares */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Class Shares</h3>
                    <div className="space-y-4">
                      {[
                        {
                          id: '1',
                          type: 'Project',
                          title: 'My Scratch Game - Space Adventure',
                          author: 'Alex Johnson',
                          time: '2 hours ago',
                          likes: 12,
                          comments: 5
                        },
                        {
                          id: '2',
                          type: 'Achievement',
                          title: 'Completed Python Basics Course!',
                          author: 'Sarah Chen',
                          time: '1 day ago',
                          likes: 18,
                          comments: 8
                        },
                        {
                          id: '3',
                          type: 'Resource',
                          title: 'Great tutorial for HTML beginners',
                          author: 'Mike Wilson',
                          time: '2 days ago',
                          likes: 9,
                          comments: 3
                        }
                      ].map((share) => (
                        <div key={share.id} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Share2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">{share.author}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">{share.time}</span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">{share.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{share.likes} likes</span>
                                <span>{share.comments} comments</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            )}

                  {/* E-books Tab Content */}
                  {activeTab === 'ebooks' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">E-Books Library</h2>
                        <p className="text-gray-600">Access digital learning materials and resources</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Sample E-books */}
                        {[
                          {
                            id: '1',
                            title: 'Introduction to Computer Science',
                            author: 'Dr. Sarah Johnson',
                            cover: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=300&h=400&fit=crop',
                            category: 'Computer Science',
                            pages: 245,
                            rating: 4.5,
                            downloads: 1234
                          },
                          {
                            id: '2',
                            title: 'Digital Literacy for Beginners',
                            author: 'Prof. Michael Chen',
                            cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
                            category: 'Digital Skills',
                            pages: 180,
                            rating: 4.2,
                            downloads: 987
                          },
                          {
                            id: '3',
                            title: 'Programming Fundamentals',
                            author: 'Dr. Emily Rodriguez',
                            cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=400&fit=crop',
                            category: 'Programming',
                            pages: 320,
                            rating: 4.8,
                            downloads: 2156
                          },
                          {
                            id: '4',
                            title: 'Web Development Basics',
                            author: 'Prof. David Kim',
                            cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=400&fit=crop',
                            category: 'Web Development',
                            pages: 280,
                            rating: 4.6,
                            downloads: 1678
                          },
                          {
                            id: '5',
                            title: 'Data Science for Kids',
                            author: 'Dr. Lisa Wang',
                            cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop',
                            category: 'Data Science',
                            pages: 195,
                            rating: 4.3,
                            downloads: 892
                          },
                          {
                            id: '6',
                            title: 'Creative Coding with Scratch',
                            author: 'Prof. James Wilson',
                            cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&h=400&fit=crop',
                            category: 'Creative Coding',
                            pages: 220,
                            rating: 4.7,
                            downloads: 1345
                          }
                        ].map((book) => (
                          <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                              <img 
                                src={book.cover} 
                                alt={book.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center hidden">
                                <BookOpen className="w-12 h-12 text-white opacity-80" />
                              </div>
                              <div className="absolute top-3 right-3">
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  {book.rating} ★
                                </span>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
                              <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <span>{book.category}</span>
                                <span>{book.pages} pages</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{book.downloads} downloads</span>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                  Read Now
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  

                  {/* Profile Settings Tab Content */}
                  {activeTab === 'profile-settings' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
                        <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={currentUser?.fullname || ''} />
          </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={currentUser?.email || ''} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Grade 1</option>
                                <option>Grade 2</option>
                                <option>Grade 3</option>
                                <option>Grade 4</option>
                                <option>Grade 5</option>
                                <option>Grade 6</option>
                              </select>
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                              Save Changes
                            </button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                            <div className="space-y-3">
                              {[
                                { label: 'Email Notifications', enabled: true },
                                { label: 'Push Notifications', enabled: true },
                                { label: 'Assignment Reminders', enabled: true },
                                { label: 'Course Updates', enabled: false }
                              ].map((setting, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                                  <button className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${setting.enabled ? 'transform translate-x-6' : 'transform translate-x-1'
                                    }`}></div>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                            <div className="space-y-3">
                              {[
                                { label: 'Show Profile to Class', enabled: true },
                                { label: 'Allow Messages', enabled: true },
                                { label: 'Share Progress', enabled: false }
                              ].map((setting, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                                  <button className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${setting.enabled ? 'transform translate-x-6' : 'transform translate-x-1'
                                    }`}></div>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default G1G3Dashboard;
