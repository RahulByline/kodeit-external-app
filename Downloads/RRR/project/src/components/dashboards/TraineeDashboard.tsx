import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  BookOpen,
  Award,
  Users,
  BarChart3,
  Folder,
  Settings,
  ChevronDown,
  ChevronRight,
  Bell,
  Star,
  FileText,
  MessageSquare,
  Globe,
  UploadCloud,
  Activity,
  Target,
  User as UserIcon,
  HelpCircle,
  Smartphone,
  Clock
} from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';
import { CourseCard } from '../CourseCard';
import { apiService } from '../../services/api';
import { Course, User } from '../../types';
import clsx from 'clsx';

const sidebarStructure = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Dashboard / Home',
    children: [
      { id: 'progress', label: 'Personalized Progress Tracker' },
      { id: 'recommendations', label: 'Course Recommendations' },
      { id: 'alerts', label: 'Alerts & Notifications' }
    ]
  },
  {
    id: 'learningPathway',
    icon: BookOpen,
    label: 'My Learning Pathway',
    children: [
      { id: 'assignedPathway', label: 'My Assigned Pathway' },
      { id: 'modulesCourses', label: 'Modules & Courses' },
      { id: 'competency', label: 'Competency Development' },
      { id: 'mobileAccess', label: 'Mobile Access' }
    ]
  },
  {
    id: 'assessments',
    icon: Award,
    label: 'Assessments & Certifications',
    children: [
      { id: 'certifications', label: 'My Certifications' },
      { id: 'assessmentResults', label: 'Assessment Results' },
      { id: 'selfReflection', label: 'Self-Reflection Logs' },
      { id: 'uploadEvidence', label: 'Upload Evidence' }
    ]
  },
  {
    id: 'resources',
    icon: Folder,
    label: 'Resources & Collaboration',
    children: [
      { id: 'resourceLibrary', label: 'Shared Resource Library' },
      { id: 'plcs', label: 'Professional Learning Communities (PLCs)' },
      { id: 'contributions', label: 'My Contributions' }
    ]
  },
  {
    id: 'performance',
    icon: BarChart3,
    label: 'My Performance & Feedback',
    children: [
      { id: 'feedback', label: 'Feedback & Ratings' },
      { id: 'reviewLinkages', label: 'Performance Review Linkages' },
      { id: 'gamification', label: 'Gamification Progress' },
      { id: 'leaderboards', label: 'Leaderboards' }
    ]
  },
  {
    id: 'myTrainees',
    icon: Users,
    label: 'Trainee Directory',
    children: [] // No dropdown
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings & Support',
    children: [
      { id: 'profile', label: 'Profile Settings' },
      { id: 'language', label: 'Language Selection' },
      { id: 'help', label: 'Help & Support' },
      { id: 'accessibility', label: 'Accessibility Settings' }
    ]
  }
];

export const TraineeDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeMain, setActiveMain] = useState('dashboard');
  const [activeSub, setActiveSub] = useState('progress');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [traineeLoading, setTraineeLoading] = useState(false);
  const [traineeError, setTraineeError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const userCourses = await apiService.getUserCourses(user.id);
        setCourses(userCourses);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Fetch all users for trainee dashboard
  useEffect(() => {
    if (activeMain === 'myTrainees') {
      setTraineeLoading(true);
      setTraineeError(null);
      apiService.getAllUsers()
        .then(users => setAllUsers(users))
        .catch(() => setTraineeError('Failed to fetch users'))
        .finally(() => setTraineeLoading(false));
    }
  }, [activeMain]);

  // Sidebar professional styling
  const renderSidebar = () => (
    <aside className={clsx(
      'fixed md:static left-0 top-0 z-40 h-full md:h-auto w-64 md:w-64 bg-slate-800 text-white flex flex-col py-6 px-2 transition-all duration-300',
      'rounded-none',
      'min-h-screen',
      sidebarOpen ? 'block' : 'hidden md:block'
    )}>
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Trainee Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {sidebarStructure.map((item) => (
          <div key={item.id}>
            <button
              className={clsx(
                'flex items-center w-full px-3 py-2 rounded-lg transition-all text-left gap-3 font-semibold text-base group',
                activeMain === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
              onClick={() => {
                setActiveMain(item.id);
                setActiveSub(item.children[0]?.id || '');
              }}
            >
              <item.icon className={clsx('w-5 h-5 transition-transform duration-200', activeMain === item.id ? 'scale-110' : 'group-hover:scale-105')} />
              {item.label}
              {item.children.length > 0 && (
                <ChevronDown className={clsx('w-4 h-4 ml-auto transition-transform', activeMain === item.id ? 'rotate-180' : '')} />
              )}
            </button>
            {item.children.length > 0 && (
              <div className={clsx('overflow-hidden transition-all', activeMain === item.id ? 'max-h-96' : 'max-h-0') + ' pl-5'}>
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    className={clsx(
                      'flex items-center w-full px-2 py-2 rounded-md transition-all text-left text-sm font-medium my-0.5',
                      activeSub === child.id
                        ? 'bg-blue-700 text-white scale-105 shadow'
                        : 'text-slate-300 hover:bg-slate-600 hover:text-white'
                    )}
                    onClick={() => setActiveSub(child.id)}
                  >
                    <ChevronRight className="w-3 h-3 mr-1" />
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <button className="mt-8 text-xs text-slate-400 hover:text-white transition-all" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
      </button>
    </aside>
  );

  // --- Dashboard/Home Advanced UI ---
  const now = Date.now();
  const completedCount = courses.filter(c => c.progress === 100).length;
  const inProgressCount = courses.filter(c => c.progress && c.progress > 0 && c.progress < 100).length;
  const upcomingSessions = courses.filter(c => c.startdate && c.startdate * 1000 > now);

  const renderAdvancedDashboard = () => {
    // Calculate progress
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress === 100).length;
    const inProgressCourses = courses.filter(c => c.progress && c.progress > 0 && c.progress < 100).length;
    const progressPercent = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
    return (
      <div className="p-6 space-y-10">
        {/* Personalized Learning Pathway */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-500" /> Personalized Learning Pathway
          </h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div key={course.id} whileHover={{ y: -5, scale: 1.01 }} className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between min-h-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold uppercase tracking-wide">{course.type || 'Course'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 line-clamp-1">{course.fullname}</h3>
                    <p className="text-sm text-blue-100 mb-2 line-clamp-2">{course.summary ? course.summary.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No description available'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs">Progress</span>
                    <span className="text-xs font-bold">{course.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-1">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: `${course.progress ?? 0}%` }}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <div className="text-gray-500 text-lg">No courses assigned yet</div>
            </div>
          )}
        </div>
        {/* Visual Progress Tracker */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-green-500" /> Visual Progress Tracker</h2>
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="45" stroke="#10b981" strokeWidth="10" fill="none" strokeDasharray="282.6" strokeDashoffset={`${282.6 - (progressPercent / 100) * 282.6}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600">{progressPercent}%</span>
              </div>
            </div>
            <div className="text-gray-600">{completedCourses} of {totalCourses} courses completed</div>
          </div>
        </div>
        {/* Smart Course Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-6 h-6 text-yellow-500" /> Smart Course Recommendations</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <Star className="w-16 h-16 text-yellow-300 mb-4 animate-pulse" />
            <div className="text-gray-500 text-lg">AI-driven recommendations coming soon</div>
          </div>
        </motion.div>
        {/* Alerts & Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-6 h-6 text-blue-500" /> Alerts & Notifications</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <Bell className="w-16 h-16 text-blue-200 mb-4 animate-pulse" />
            <div className="text-gray-500 text-lg">No notifications.</div>
          </div>
        </motion.div>
        {/* Peer Community Access */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-purple-500" /> Peer Community Access</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <Users className="w-16 h-16 text-purple-200 mb-4 animate-pulse" />
            <div className="text-gray-500 text-lg">Communities feature coming soon</div>
          </div>
        </motion.div>
        {/* Shared Resources */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Folder className="w-6 h-6 text-blue-400" /> Shared Resources</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <Folder className="w-16 h-16 text-blue-100 mb-4 animate-pulse" />
            <div className="text-gray-500 text-lg">Resource library coming soon</div>
          </div>
        </motion.div>
        {/* Achievements & XP */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-6 h-6 text-yellow-500" /> Achievements & XP</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <Award className="w-16 h-16 text-yellow-200 mb-4 animate-pulse" />
            <div className="text-gray-500 text-lg">Gamification features coming soon</div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Trainee Directory: filter users with 'trainee' role
  const traineesOnly = allUsers.filter(user => String(user.role) === 'trainee');
  // Search filter
  const filteredTrainees = traineesOnly.filter(user =>
    user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );
  const renderTraineeDirectorySection = () => (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-400" /> Trainee Directory <span className="ml-2 text-blue-400 text-lg">({filteredTrainees.length})</span>
        </h2>
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500"
          placeholder="Search trainees by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {traineeLoading && <LoadingSpinner size="sm" />}
      {traineeError && <div className="text-red-500 mb-4">{traineeError}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Company/Department</th>
              <th className="px-4 py-2 text-left">Assigned Courses</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrainees.length > 0 ? filteredTrainees.map(user => (
              <tr key={String(user.id)} className="border-b border-gray-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all">
                <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">{user.fullname}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{user.email}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{user.company || user.department || '-'}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">-</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 dark:text-gray-300 py-8">
                  No trainees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Main content rendering
  const renderMainContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
    }
    if (error) {
      return <div className="flex justify-center items-center min-h-screen"><div className="text-red-600 text-lg">{error}</div></div>;
    }
    // Dashboard / Home
    if (activeMain === 'dashboard') {
      // Use the advanced dashboard UI
      return renderAdvancedDashboard();
    }
    // My Learning Pathway
    if (activeMain === 'learningPathway') {
      switch (activeSub) {
        case 'assignedPathway':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">My Assigned Pathway</h2><div className="text-gray-600">(Pathway data coming soon)</div></div>;
        case 'modulesCourses':
          return (
            <div className="p-6"><h2 className="text-2xl font-bold mb-4">Modules & Courses</h2>
              {/* Real data: show all courses/modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          );
        case 'competency':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Competency Development</h2><div className="text-gray-600">(Competency data coming soon)</div></div>;
        case 'mobileAccess':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Mobile Access</h2><div className="text-gray-600">(Mobile access info coming soon)</div></div>;
        default:
          return null;
      }
    }
    // Assessments & Certifications
    if (activeMain === 'assessments') {
      switch (activeSub) {
        case 'certifications':
          return (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">My Certifications</h2>
              {/* TODO: Integrate real certificate data here when API is available */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Example placeholder card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col items-center justify-center min-h-[180px]">
                  <Award className="w-10 h-10 text-yellow-500 mb-2" />
                  <div className="font-semibold text-gray-900 mb-1">No certificates found</div>
                  <div className="text-gray-500 text-sm text-center">Your earned certificates will appear here once available.</div>
                </div>
              </div>
            </div>
          );
        case 'assessmentResults':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Assessment Results</h2><div className="text-gray-600">(Assessment results coming soon)</div></div>;
        case 'selfReflection':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Self-Reflection Logs</h2><div className="text-gray-600">(Self-reflection logs coming soon)</div></div>;
        case 'uploadEvidence':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Upload Evidence</h2><div className="text-gray-600">(Evidence upload coming soon)</div></div>;
        default:
          return null;
      }
    }
    // Resources & Collaboration
    if (activeMain === 'resources') {
      switch (activeSub) {
        case 'resourceLibrary':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Shared Resource Library</h2><div className="text-gray-600">(Resource library coming soon)</div></div>;
        case 'plcs':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Professional Learning Communities (PLCs)</h2><div className="text-gray-600">(PLCs coming soon)</div></div>;
        case 'contributions':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">My Contributions</h2><div className="text-gray-600">(Contributions coming soon)</div></div>;
        default:
          return null;
      }
    }
    // My Performance & Feedback
    if (activeMain === 'performance') {
      switch (activeSub) {
        case 'feedback':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Feedback & Ratings</h2><div className="text-gray-600">(Feedback and ratings coming soon)</div></div>;
        case 'reviewLinkages':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Performance Review Linkages</h2><div className="text-gray-600">(Performance review data coming soon)</div></div>;
        case 'gamification':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Gamification Progress</h2><div className="text-gray-600">(Gamification progress coming soon)</div></div>;
        case 'leaderboards':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Leaderboards</h2><div className="text-gray-600">(Leaderboards coming soon)</div></div>;
        default:
          return null;
      }
    }
    // Trainee Directory
    if (activeMain === 'myTrainees') {
      return renderTraineeDirectorySection();
    }
    // Settings & Support
    if (activeMain === 'settings') {
      switch (activeSub) {
        case 'profile':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Profile Settings</h2><div className="text-gray-600">(Profile settings coming soon)</div></div>;
        case 'language':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Language Selection</h2><div className="text-gray-600">(Language selection coming soon)</div></div>;
        case 'help':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Help & Support</h2><div className="text-gray-600">(Help and support coming soon)</div></div>;
        case 'accessibility':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Accessibility Settings</h2><div className="text-gray-600">(Accessibility settings coming soon)</div></div>;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {renderSidebar()}
      <main className="flex-1 ml-0 md:ml-56 px-0 py-4 transition-all duration-300">
        {renderMainContent()}
      </main>
    </div>
  );
}; 