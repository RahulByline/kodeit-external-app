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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'lessons' | 'activities' | 'achievements' | 'schedule' | 'tree-view' | 'profile-settings' | 'scratch-editor' | 'ebooks' | 'ask-teacher' | 'share-class'>('dashboard');
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Real IOMAD data states
  const [realLessons, setRealLessons] = useState<any[]>([]);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [realTreeData, setRealTreeData] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  
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
        'code_editor': { minGrade: 3, maxGrade: 12 },
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
      console.log('🚀 Enhanced loading dashboard data with parallel API calls...');
      
      // Use enhanced Moodle service for parallel loading
      const dashboardData = await enhancedMoodleService.getDashboardData(currentUser.id.toString());
      
      setCourses(dashboardData.courses);
      setActivities(dashboardData.activities);
      setAssignments(dashboardData.assignments);
      
      console.log(`✅ Enhanced dashboard loaded in ${dashboardData.loadTime}ms`);
      console.log(`📊 Data: ${dashboardData.courses.length} courses, ${dashboardData.activities.length} activities, ${dashboardData.assignments.length} assignments`);
      
      } catch (error) {
      console.error('❌ Error in enhanced data loading:', error);
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

  // Fetch real IOMAD tree view data
  const fetchRealTreeViewData = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log('🔄 Fetching real IOMAD tree view data...');
      const treeData: any[] = [];
      
      // Get all user courses
      const userCourses = await enhancedMoodleService.getUserCourses(currentUser.id.toString());
      
      // Fetch detailed data for each course
      for (const course of userCourses) {
        const courseContents = await enhancedMoodleService.getCourseContents(course.id.toString());
        
        const courseLessons: any[] = [];
        let completedLessons = 0;
        let totalLessons = 0;
        
        courseContents.forEach((section: any) => {
          if (section.modules && Array.isArray(section.modules)) {
            section.modules.forEach((module: any) => {
              totalLessons++;
              if (module.completiondata?.state === 1) {
                completedLessons++;
              }
              
              courseLessons.push({
                id: module.id,
                name: module.name,
                status: module.completiondata?.state === 1 ? 'completed' : 
                       module.completiondata?.state === 2 ? 'in_progress' : 'locked',
                modname: module.modname,
                completiondata: module.completiondata
              });
            });
          }
        });
        
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        treeData.push({
          id: course.id,
          name: course.fullname || course.shortname,
          progress: progressPercentage,
          completedLessons,
          totalLessons,
          lessons: courseLessons
        });
      }
      
      console.log(`✅ Found ${treeData.length} courses for tree view from IOMAD`);
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
  };

  const handleBackToSectionView = () => {
    setSelectedActivity(null);
    setActivityDetails(null);
    setIsActivityStarted(false);
    setActivityProgress(0);
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

  // Handle activity click from section view
  const handleActivityClick = async (activity: any) => {
    console.log('🎯 Activity clicked:', activity);
    setSelectedActivity(activity);
    await fetchActivityDetails(activity);
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
  const launchScormInline = () => {
    console.log('🚀 Launching SCORM content inline');
    setIsScormLaunched(true);
    
    // Simulate SCORM content loading
    const mockScormContent = {
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
                <button class="next-btn">Continue to Next Section</button>
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
                      <button class="demo-btn">Scenario 1</button>
                      <button class="demo-btn">Scenario 2</button>
                      <button class="demo-btn">Scenario 3</button>
                    </div>
                    <div class="demo-result">
                      <p>Select a scenario to see the result.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="navigation">
                <button class="prev-btn">Previous</button>
                <button class="next-btn">Continue to Assessment</button>
              </div>
            </div>
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
                  <label><input type="radio" name="q1" value="a"> To provide basic information</label>
                  <label><input type="radio" name="q1" value="b"> To test your knowledge</label>
                  <label><input type="radio" name="q1" value="c"> To guide you through interactive learning</label>
                  <label><input type="radio" name="q1" value="d"> To complete a course requirement</label>
                </div>
                
                <h3>Question 2</h3>
                <p>Which of the following is NOT a learning objective?</p>
                <div class="options">
                  <label><input type="radio" name="q2" value="a"> Understand key concepts</label>
                  <label><input type="radio" name="q2" value="b"> Complete exercises</label>
                  <label><input type="radio" name="q2" value="c"> Take assessments</label>
                  <label><input type="radio" name="q2" value="d"> Skip all content</label>
                </div>
              </div>
              <div class="navigation">
                <button class="prev-btn">Previous</button>
                <button class="submit-btn">Submit Assessment</button>
              </div>
            </div>
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
                    <li>Score: 85%</li>
                    <li>Time Spent: 15 minutes</li>
                    <li>Status: Passed</li>
                  </ul>
                </div>
                <div class="certificate">
                  <h4>Certificate of Completion</h4>
                  <p>You have earned a certificate for completing this module.</p>
                  <button class="download-cert">Download Certificate</button>
                </div>
              </div>
              <div class="navigation">
                <button class="finish-btn">Finish Module</button>
              </div>
            </div>
          `,
          completed: true
        }
      ],
      currentPage: 1,
      totalPages: 4,
      progress: 0,
      score: 0
    };
    
    setScormContent(mockScormContent);
  };

  // Close SCORM content
  const closeScorm = () => {
    setIsScormLaunched(false);
    setScormContent(null);
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
              <h3 className="text-xl font-bold text-indigo-900 mb-4">SCORM Interactive Module</h3>
              <div className="prose max-w-none text-indigo-800" 
                   dangerouslySetInnerHTML={{ __html: fullDescription || description || 'SCORM interactive content will appear here.' }} />
            </div>
            
            {/* SCORM Package Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">SCORM Package Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Package Information</h5>
                  <div className="space-y-2 text-sm">
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion:</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium">Not Attempted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Spent:</span>
                      <span className="font-medium">0 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SCORM Launch Button */}
              <div className="text-center">
                <button 
                  onClick={launchScormInline}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-lg"
                >
                  Launch SCORM Module
                </button>
                <p className="text-sm text-gray-600 mt-2">Opens inline for optimal experience</p>
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

            {/* SCORM Instructions */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h4 className="font-semibold text-yellow-900 mb-3">How to Use SCORM Module</h4>
              <div className="space-y-2 text-yellow-800 text-sm">
                <p>• Click "Launch SCORM Module" to open the interactive content</p>
                <p>• Complete all sections and assessments within the module</p>
                <p>• Your progress and scores will be automatically tracked</p>
                <p>• Close the module window when finished to return here</p>
                <p>• Your completion status will be updated automatically</p>
              </div>
            </div>
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
                  onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
                  onClick={() => setActiveTab('courses')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === 'courses' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
                    setActiveTab('lessons');
                    await fetchRealDataForTab('lessons');
                  }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === 'lessons' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
                    setActiveTab('activities');
                    await fetchRealDataForTab('activities');
                  }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === 'activities' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
                  onClick={() => setActiveTab('achievements')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === 'achievements' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
                  onClick={() => setActiveTab('schedule')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === 'schedule' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
                      setActiveTab('tree-view');
                      await fetchRealDataForTab('tree-view');
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === 'tree-view' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
                    onClick={() => setActiveTab('profile-settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'profile-settings' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
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
              {/* Code Emulators Card */}
              {canAccessFeature('code_editor') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-600/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">Code Emulators</h4>
                      <p className="text-xs text-purple-100">Practice coding in virtual environments</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
                    </div>
          )}

              {/* E-books Card */}
              {canAccessFeature('basic_tools') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                     onClick={() => setActiveTab('ebooks')}>
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
                     onClick={() => setActiveTab('ask-teacher')}>
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

              {/* Share with Class Card */}
              {canAccessFeature('basic_tools') && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                     onClick={() => setActiveTab('share-class')}>
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
                     onClick={() => setActiveTab('scratch-editor')}>
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
        {/* Fixed Top Bar */}
        <header className="fixed top-0 left-0 lg:left-64 right-0 z-20 bg-white shadow-sm border-b border-gray-200">
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
                </div>
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
                      {/* Course Header with Old Code Styling */}
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
                          
                      {/* Loading State */}
                      {isLoadingCourseDetail && (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your learning journey...</p>
                              </div>
                              </div>
                            )}

                      {/* Course Content - Old Code Layout */}
                      {!isLoadingCourseDetail && (
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
                        
                            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-purple-600" />
                          </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
                                  <p className="text-2xl font-bold text-purple-600">{courseModules.length}</p>
                            </div>
                            </div>
                          </div>
                          
                            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                                      <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Activity className="w-6 h-6 text-green-600" />
                                </div>
              <div>
                                  <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
                                  <p className="text-2xl font-bold text-green-600">{courseModules.length + courseLessons.length}</p>
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
                        
                              {/* Section Cards */}
                              {(() => {
                                const sections = getCourseSections();
                                
                                return sections.length > 0 ? sections.map((section, sectionIndex) => (
                                  <div 
                                    key={sectionIndex} 
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                    onClick={() => handleSectionClick(section)}
                                  >
                                    <div className="flex items-center justify-between">
                                      {/* Left Section - Icon and Text */}
                                      <div className="flex items-center space-x-4">
                                        {/* Section Icon */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                          <BookOpen className="w-6 h-6 text-white" />
                </div>

                                        {/* Section Info */}
                    <div>
                                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {section.name}
                                          </h3>
                                          <p className="text-sm text-gray-600">
                                            {section.lessons.length + section.modules.length} activities
                                          </p>
                    </div>
                  </div>
                  
                                      {/* Right Section - Item Count and Arrow */}
                                      <div className="flex items-center space-x-3">
                                        {/* Item Count Badge */}
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                                          {section.lessons.length + section.modules.length} items
                                          </span>
                                        
                                        {/* Navigation Arrow */}
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        </div>
                      </div>
                                )) : (
                                  <div className="text-center py-12 text-gray-500">
                                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <h4 className="text-lg font-medium mb-2">No Course Content Available</h4>
                                    <p>Course sections and activities will appear here once they're added</p>
                    </div>
                              );
                              })()}
                        </div>
                        </div>
                          )}
              </div>
            )}

                      {/* Section Activities View */}
                      {selectedSection && (
                        console.log('🎯 Rendering section activities view for:', selectedSection.name, 'with', sectionActivities.length, 'activities'),
                <div className="space-y-6">
                      {/* Section Header */}
                          <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600" />
                        
                        {/* Section Info Overlay */}
                    <div className="absolute bottom-6 left-6 text-white">
                      <button 
                                onClick={handleBackToCourseView}
                        className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                            <span>Back to Course</span>
                      </button>
                      
                      <div className="mb-4">
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-500 mb-3">
                                  Section
                        </span>
                                <h1 className="text-3xl font-bold mb-2">{selectedSection.name}</h1>
                                <p className="text-blue-100 text-lg">{sectionActivities.length} activities available</p>
                      </div>
                      
                          {/* Section Stats */}
                      <div className="flex items-center space-x-8 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-blue-100" />
                                  <span className="text-blue-100">2-3 hours</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-100" />
                                  <span className="text-blue-100">{sectionActivities.length} activities</span>
                        </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">
                                    {sectionActivities.filter(a => a.status === 'completed').length}/{sectionActivities.length} completed
                              </span>
                      </div>
                      </div>
                    </div>
                  </div>

                          {/* Section Activities */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Section Activities</h2>
                            
                            {isLoadingSectionActivities ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-600">Loading activities...</p>
                    </div>
                                      </div>
                        ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                 {sectionActivities.map((activity, index) => (
                                   <div key={activity.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => handleActivityClick(activity)}>
                                    <div className="flex items-start space-x-3 mb-4">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                                        activity.type === 'video' ? 'bg-blue-100' :
                                        activity.type === 'quiz' ? 'bg-green-100' :
                                        activity.type === 'assignment' ? 'bg-purple-100' :
                                        activity.type === 'project' ? 'bg-orange-100' : 'bg-gray-100'
                                      }`}>
                                        {activity.type === 'video' ? (
                                          <Video className="w-5 h-5 text-blue-600" />
                                        ) : activity.type === 'quiz' ? (
                                          <FileText className="w-5 h-5 text-green-600" />
                                          ) : activity.type === 'assignment' ? (
                                          <Code className="w-5 h-5 text-purple-600" />
                                        ) : activity.type === 'project' ? (
                                          <Star className="w-5 h-5 text-orange-600" />
                                        ) : (
                                          <Play className="w-5 h-5 text-gray-600" />
                                          )}
                          </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                            {activity.name}
                                          </h4>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {activity.status === 'completed' ? 'Completed' :
                                             activity.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                          </span>
                                      </div>
                                        <p className="text-sm text-gray-600 mb-3 overflow-hidden text-ellipsis whitespace-nowrap">
                                          {activity.description}
                                        </p>
                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                          <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {activity.duration}
                                          </span>
                                          <span className="flex items-center">
                                            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                                            {activity.points} pts
                                          </span>
                                          <span className={`px-1 py-0.5 rounded text-xs ${
                                            activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                            activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {activity.difficulty}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100">
                                      <button className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                                        activity.status === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                        activity.status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                        'bg-gray-600 hover:bg-gray-700 text-white'
                                      }`}>
                                        {activity.status === 'completed' ? (
                                          <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Review</span>
                                          </>
                                        ) : activity.status === 'in_progress' ? (
                                          <>
                                            <Play className="w-4 h-4" />
                                            <span>Continue</span>
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-4 h-4" />
                                            <span>Start</span>
                                          </>
                                        )}
                      </button>
                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                                             )}

                       {/* Detailed Activity View */}
                       {selectedActivity && activityDetails && (
                    <div className="space-y-6">
                           {/* Activity Header */}
                           <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-600 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-600" />
                        
                             {/* Activity Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <button 
                                 onClick={handleBackToSectionView}
                            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                          >
                            <ArrowLeft className="w-4 h-4" />
                                 <span>Back to Section</span>
                          </button>
                          
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-500 mb-3">
                                   {activityDetails.type?.toUpperCase() || 'ACTIVITY'}
                            </span>
                                 <h1 className="text-3xl font-bold mb-2">{activityDetails.name}</h1>
                                 <p className="text-blue-100 text-lg">Real IOMAD Data</p>
                          </div>
                          
                               {/* Activity Stats */}
                          <div className="flex items-center space-x-8 mb-4">
                            <div className="flex items-center space-x-2">
                                   <Clock className="w-5 h-5 text-blue-100" />
                                   <span className="text-blue-100">{activityDetails.estimatedTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                   <Star className="w-5 h-5 text-blue-100" />
                                   <span className="text-blue-100">{activityDetails.points} points</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">
                                     {activityDetails.status === 'completed' ? 'Completed' :
                                      activityDetails.status === 'in_progress' ? 'In Progress' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                           {/* Activity Content */}
                           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
                                       <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                                       <div className="bg-gray-50 rounded-lg p-6">
                                         <p className="text-gray-700 leading-relaxed">
                                           {activityDetails.fullDescription}
                                         </p>
                                       </div>
                          </div>
                          
                                     <div>
                                       <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Objectives</h3>
                                       <div className="bg-blue-50 rounded-lg p-6">
                                         <p className="text-gray-700 leading-relaxed">
                                           {activityDetails.learningObjectives}
                                         </p>
                                        </div>
                                      </div>
                                      
                                     <div>
                                       <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                                       <div className="bg-yellow-50 rounded-lg p-6">
                                         <p className="text-gray-700 leading-relaxed">
                                           {activityDetails.requirements}
                                         </p>
                                       </div>
                                     </div>
                                          </div>

                                   {/* Right Column - Details */}
                                   <div className="space-y-6">
                                     <div>
                                       <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Details</h3>
                                       <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
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
                                           <span className={`px-2 py-1 rounded text-sm font-medium ${
                                             activityDetails.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                             activityDetails.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                             {activityDetails.difficulty}
                                          </span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-gray-600">Status:</span>
                                           <span className={`px-2 py-1 rounded text-sm font-medium ${
                                             activityDetails.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                                         <h3 className="text-xl font-bold text-gray-900 mb-4">Moodle Module Info</h3>
                                         <div className="bg-purple-50 rounded-lg p-6 space-y-4">
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
                                         <h3 className="text-xl font-bold text-gray-900 mb-4">Files & Resources</h3>
                                         <div className="bg-gray-50 rounded-lg p-6 space-y-3">
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
                                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                      Back to Section
                                    </button>
                                    <button 
                                      onClick={startActivity}
                                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                        activityDetails.status === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                        activityDetails.status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                        'bg-gray-600 hover:bg-gray-700 text-white'
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
                           {/* Activity Progress Header */}
                           <div className="relative h-32 bg-gradient-to-br from-green-400 to-blue-600 rounded-xl overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-600" />
                             
                             {/* Progress Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <button 
                                 onClick={() => setIsActivityStarted(false)}
                            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                          >
                            <ArrowLeft className="w-4 h-4" />
                                 <span>Back to Details</span>
                          </button>
                          
                          <div className="mb-4">
                                 <h1 className="text-2xl font-bold mb-2">{activityDetails.name}</h1>
                                 <p className="text-blue-100 text-lg">Activity in Progress</p>
                          </div>
                          
                               {/* Progress Bar */}
                               <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                                 <div 
                                   className="bg-white h-2 rounded-full transition-all duration-500"
                                   style={{ width: `${activityProgress}%` }}
                                 />
                            </div>
                               <p className="text-blue-100 text-sm">{activityProgress}% Complete</p>
                            </div>
                          </div>
                          
                           {/* Activity Content */}
                           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                             <div className="mb-6">
                               <div className="flex items-center justify-between">
                                 <h2 className="text-2xl font-bold text-gray-900">Activity Content</h2>
                                 <div className="flex items-center space-x-4">
                                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                     activityDetails.status === 'completed' ? 'bg-green-100 text-green-800' :
                                     activityDetails.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                     'bg-gray-100 text-gray-800'
                                   }`}>
                                     {activityDetails.status === 'completed' ? 'Completed' :
                                      activityDetails.status === 'in_progress' ? 'In Progress' : 'Active'}
                                   </span>
                                   <button 
                                     onClick={handleBackToSectionView}
                                     className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
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
                                   <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                                     Save Progress
                                   </button>
                                   <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
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
                                 <h3 className="text-lg font-semibold text-gray-900">Video Player</h3>
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
                                   <span className="px-2 py-1 bg-indigo-500 rounded text-sm">
                                     Page {scormContent.currentPage} of {scormContent.totalPages}
                                   </span>
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
                                 <p className="text-sm text-gray-600 mt-1">{scormContent.progress}% Complete</p>
                               </div>
                               
                               {/* SCORM Content */}
                               <div className="flex-1 overflow-auto p-6">
                                 <div 
                                   className="scorm-content"
                                   dangerouslySetInnerHTML={{ 
                                     __html: scormContent.pages.find((p: any) => p.id === scormContent.currentPage)?.content || '' 
                                   }}
                                 />
                               </div>
                               
                               {/* SCORM Navigation */}
                               <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                                 <div className="flex items-center space-x-4">
                                   <button 
                                     onClick={() => navigateScormPage('prev')}
                                     disabled={scormContent.currentPage === 1}
                                     className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                       scormContent.currentPage === 1 
                                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                         : 'bg-gray-600 hover:bg-gray-700 text-white'
                                     }`}
                                   >
                                     Previous
                                   </button>
                                   <button 
                                     onClick={() => navigateScormPage('next')}
                                     disabled={scormContent.currentPage === scormContent.totalPages}
                                     className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                       scormContent.currentPage === scormContent.totalPages 
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
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Detailed Lesson View */}
                      {selectedLessonForDetail && (
                    <div className="space-y-6">
                      {/* Lesson Header */}
                      <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl overflow-hidden">
                        {/* Background Image */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-20"
                          style={{ 
                            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop')` 
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600" />
                        
                        {/* Lesson Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <button 
                            onClick={() => {
                              setSelectedLessonForDetail(null);
                              // If we came from a section, go back to modules view
                              if (selectedSectionForModules) {
                                // Keep the section selected for modules view
                              } else {
                                setSelectedSectionForModules(null);
                              }
                            }}
                            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to {selectedSectionForModules ? 'Modules' : 'Course'}</span>
                                                </button>
                          
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-500 mb-3">
                              In Progress
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{selectedLessonForDetail.name}</h1>
                            <p className="text-blue-100 text-lg">{selectedLessonForDetail.description}</p>
                                              </div>
                          
                          {/* Lesson Stats */}
                          <div className="flex items-center space-x-8 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedLessonForDetail.duration}</span>
                                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{lessonActivities.length} total</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-blue-100" />
                              <span className="text-blue-100">{selectedLessonForDetail.progress}%</span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-blue-100">Lesson Progress</span>
                              <span className="text-white font-medium">{selectedLessonForDetail.progress}%</span>
                            </div>
                            <div className="w-full bg-blue-300 bg-opacity-30 rounded-full h-3">
                              <div 
                                className="bg-white h-3 rounded-full transition-all duration-300"
                                style={{ width: `${selectedLessonForDetail.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lesson Activities Section */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lesson Activities</h2>
                        
                        {isLoadingActivities ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-600">Loading activities...</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Activity Progress Indicator */}
                            <div className="flex items-center justify-center mb-8">
                              <div className="flex space-x-2">
                                {lessonActivities.map((activity, index) => (
                                  <div
                                    key={activity.id}
                                    className={`w-3 h-3 rounded-full ${
                                      activity.status === 'completed' ? 'bg-green-500' : 
                                      activity.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                                          </div>
                            </div>
                            
                            {/* Activity List (Vertical Timeline) */}
                            <div className="space-y-6">
                              {lessonActivities.map((activity, index) => (
                                <div key={activity.id} className="relative">
                                  {/* Connecting Line */}
                                  {index < lessonActivities.length - 1 && (
                                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200" />
                                  )}
                                  
                                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-3">
                                      {/* Status Indicator */}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        activity.status === 'completed' 
                                          ? 'bg-green-500' 
                                          : activity.status === 'in_progress'
                                          ? 'bg-blue-500'
                                          : 'bg-gray-400'
                                      }`}>
                                        {activity.status === 'completed' ? (
                                          <CheckCircle className="w-5 h-5 text-white" />
                                        ) : (
                                          <span className="text-white font-bold text-xs">{activity.order}</span>
                                        )}
                                      </div>
                                      
                                      {/* Activity Thumbnail */}
                                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {activity.thumbnail ? (
                                          <img 
                                            src={activity.thumbnail} 
                                            alt={activity.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${activity.thumbnail ? 'hidden' : ''}`}>
                                          {activity.type === 'quiz' ? (
                                            <FileText className="w-6 h-6 text-purple-600" />
                                          ) : activity.type === 'video' ? (
                                            <Video className="w-6 h-6 text-purple-600" />
                                          ) : activity.type === 'assignment' ? (
                                            <Code className="w-6 h-6 text-purple-600" />
                                          ) : activity.type === 'reading' ? (
                                            <BookOpen className="w-6 h-6 text-purple-600" />
                                          ) : (
                                            <Play className="w-6 h-6 text-purple-600" />
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Activity Content */}
                                      <div className="flex-1">
                                        <h5 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h5>
                                        <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                                        
                                        <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{activity.duration}</span>
                                          </div>
                                          {activity.dueDate && (
                                            <div className="text-red-500 font-medium text-xs">
                                              Due: {new Date(activity.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                          <div className="flex items-center space-x-1">
                                            <Award className="w-3 h-3" />
                                            <span>{activity.points} pts</span>
                                </div>
                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                            activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                            activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {activity.difficulty}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Action Button */}
                                      <button className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                                        activity.status === 'completed' 
                                          ? 'bg-green-600 text-white hover:bg-green-700'
                                          : activity.status === 'in_progress'
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : 'bg-purple-600 text-white hover:bg-purple-700'
                                      }`}>
                                        {activity.status === 'completed' ? 'Review' : 
                                         activity.status === 'in_progress' ? 'Continue' : 'Start'}
                                      </button>
                                    </div>
                          </div>
                        </div>
                      ))}
                    </div>
                          </>
                        )}
                  </div>
                </div>
              )}

                  {/* Lessons Tab Content */}
                  {activeTab === 'lessons' && (
                    <div className="space-y-8">
                <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Lessons</h2>
                        <p className="text-gray-600">Track your lesson progress and continue learning</p>
                      </div>

                      {isLoadingRealData ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading real lessons from IOMAD...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {realLessons.length > 0 ? realLessons.slice(0, 6).map((lesson, index) => (
                            <div key={lesson.id || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Video className="w-6 h-6 text-blue-600" />
                              </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  lesson.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {lesson.status === 'completed' ? 'Completed' :
                                   lesson.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.name}</h3>
                              <p className="text-gray-600 text-sm mb-2">{lesson.courseName}</p>
                              <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <span>Duration: {lesson.duration}</span>
                                <span>Points: {lesson.points}</span>
                          </div>
                          <button 
                                onClick={() => handleLessonClickFromCourse(lesson)}
                                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                  lesson.status === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                  lesson.status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                  'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                              >
                                {lesson.status === 'completed' ? 'Review Lesson' :
                                 lesson.status === 'in_progress' ? 'Continue Lesson' : 'Start Lesson'}
                          </button>
                        </div>
                          )) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                              <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <h4 className="text-lg font-medium mb-2">No Real Lessons Available</h4>
                              <p>Lessons from your IOMAD courses will appear here</p>
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
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                  activity.status === 'Completed' ? 'bg-green-100' : 
                                  activity.status === 'In Progress' ? 'bg-yellow-100' : 'bg-gray-100'
                                }`}>
                                  <activity.icon className={`w-6 h-6 ${
                                    activity.status === 'Completed' ? 'text-green-600' : 
                                    activity.status === 'In Progress' ? 'text-yellow-600' : 'text-gray-600'
                                  }`} />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  activity.status === 'Completed' ? 'bg-green-100 text-green-800' : 
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
                                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                  activity.status === 'Completed' ? 'bg-green-600 hover:bg-green-700 text-white' : 
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
                          <div key={index} className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border ${
                            achievement.earned ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                achievement.earned ? 'bg-yellow-100' : 'bg-gray-200'
                              }`}>
                                <achievement.icon className={`w-6 h-6 ${
                                  achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                                }`} />
                                        </div>
                              {achievement.earned && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Earned
                            </span>
                            )}
                                      </div>
                            <h3 className={`text-lg font-semibold mb-2 ${
                              achievement.earned ? 'text-gray-900' : 'text-gray-500'
                            }`}>{achievement.title}</h3>
                            <p className={`text-sm mb-4 ${
                              achievement.earned ? 'text-gray-600' : 'text-gray-400'
                            }`}>{achievement.description}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${
                                achievement.earned ? 'text-yellow-600' : 'text-gray-400'
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

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">This Week's Schedule</h3>
                            <div className="space-y-4">
                              {[
                                { day: 'Monday', time: '9:00 AM', activity: 'Python Basics - Lesson 1', type: 'Lesson' },
                                { day: 'Tuesday', time: '2:00 PM', activity: 'HTML Quiz', type: 'Quiz' },
                                { day: 'Wednesday', time: '10:00 AM', activity: 'CSS Project Due', type: 'Assignment' },
                                { day: 'Thursday', time: '3:00 PM', activity: 'JavaScript Fundamentals', type: 'Lesson' },
                                { day: 'Friday', time: '1:00 PM', activity: 'Portfolio Review', type: 'Meeting' }
                              ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{item.activity}</h4>
                                    <p className="text-sm text-gray-600">{item.day} • {item.time} • {item.type}</p>
                          </div>
                                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    View
                                  </button>
                      </div>
                    ))}
                      </div>
                  </div>
                </div>

                    <div className="space-y-6">
                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
                        <div className="space-y-3">
                              {[
                                { title: 'CSS Project', due: 'Tomorrow', priority: 'High' },
                                { title: 'JavaScript Quiz', due: '3 days', priority: 'Medium' },
                                { title: 'Portfolio Website', due: '1 week', priority: 'High' }
                              ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                                    <p className="text-sm text-gray-600">Due: {item.due}</p>
                          </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {item.priority}
                                  </span>
                          </div>
                              ))}
                        </div>
                      </div>

                          <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Goals</h3>
                            <div className="space-y-4">
                      <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Daily Study Time</span>
                                  <span className="text-sm text-gray-600">2/3 hours</span>
                            </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                          </div>
                        </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Weekly Lessons</span>
                                  <span className="text-sm text-gray-600">4/5 completed</span>
                            </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
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
                <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Learning Tree View</h2>
                        <p className="text-gray-600">Visualize your learning progress and course structure</p>
                    </div>

                      {isLoadingRealData ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading real tree view data from IOMAD...</span>
                  </div>
                      ) : (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <div className="space-y-6">
                            {realTreeData.length > 0 ? realTreeData.slice(0, 3).map((course, courseIndex) => (
                              <div key={course.id || courseIndex} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {course.name}
                                  </h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    course.progress >= 80 ? 'bg-green-100 text-green-800' :
                                    course.progress >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {course.progress}% Complete
                                  </span>
                                </div>

                                <div className="ml-11 space-y-3">
                                  {course.lessons.slice(0, 6).map((lesson: any, lessonIndex: number) => (
                                    <div key={lesson.id || lessonIndex} className="flex items-center space-x-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        lesson.status === 'completed' ? 'bg-green-100' :
                                        lesson.status === 'in_progress' ? 'bg-yellow-100' :
                                        'bg-gray-200'
                                      }`}>
                                        {lesson.status === 'completed' ? (
                                          <CheckCircle className="w-3 h-3 text-green-600" />
                                        ) : lesson.status === 'in_progress' ? (
                                          <Clock className="w-3 h-3 text-yellow-600" />
                                        ) : (
                                          <Circle className="w-3 h-3 text-gray-400" />
                                        )}
                          </div>
                                      <span className={`text-sm ${
                                        lesson.status === 'completed' ? 'text-gray-700' :
                                        lesson.status === 'in_progress' ? 'text-gray-600' :
                                        'text-gray-500'
                                      }`}>
                                        {lesson.name}
                                      </span>
                                      <span className={`text-xs ${
                                        lesson.status === 'completed' ? 'text-green-600' :
                                        lesson.status === 'in_progress' ? 'text-yellow-600' :
                                        'text-gray-400'
                                      }`}>
                                        {lesson.status === 'completed' ? 'Completed' :
                                         lesson.status === 'in_progress' ? 'In Progress' : 'Locked'}
                            </span>
                          </div>
                                  ))}
                                  {course.lessons.length > 6 && (
                                    <div className="flex items-center space-x-3">
                                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-gray-500">+{course.lessons.length - 6}</span>
                        </div>
                                      <span className="text-sm text-gray-500">More lessons...</span>
                          </div>
                                  )}
                          </div>
                        </div>
                            )) : (
                              <div className="text-center py-12 text-gray-500">
                                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h4 className="text-lg font-medium mb-2">No Real Course Data Available</h4>
                                <p>Course tree view from your IOMAD courses will appear here</p>
                      </div>
                            )}
                  </div>
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
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              message.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                                  <button className={`w-12 h-6 rounded-full transition-colors ${
                                    setting.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                      setting.enabled ? 'transform translate-x-6' : 'transform translate-x-1'
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
                                  <button className={`w-12 h-6 rounded-full transition-colors ${
                                    setting.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                      setting.enabled ? 'transform translate-x-6' : 'transform translate-x-1'
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
