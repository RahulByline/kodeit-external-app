import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  MessageSquare,
  FileText,
  Calendar,
  School,
  Target,
  TrendingUp,
  Award,
  Clock,
  LogOut,
  Settings as SettingsIcon,
  Play,
  Code,
  Map,
  Activity,
  CheckCircle,
  AlertCircle,
  Share2
} from 'lucide-react';
import logo from '../assets/logo.png';
import LogoutDialog from './ui/logout-dialog';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface G8PlusLayoutProps {
  children: React.ReactNode;
  userName: string;
}

const G8PlusLayout: React.FC<G8PlusLayoutProps> = ({ children, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // G8Plus specific navigation items
  const getG8PlusNavigationItems = () => {
    return [
      {
        title: 'DASHBOARD',
        items: [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
          { name: 'Community', icon: Users, path: '/dashboard/student/community' },
          { name: 'Enrollments', icon: GraduationCap, path: '/dashboard/student/enrollments' },
        ]
      },
      {
        title: 'COURSES',
        items: [
          { name: 'My Courses', icon: BookOpen, path: '/dashboard/student/courses' },
          { name: 'Assignments', icon: FileText, path: '/dashboard/student/assignments' },
        ]
      },
      {
        title: 'PROGRESS',
        items: [
          { name: 'My Grades', icon: BarChart3, path: '/dashboard/student/grades' },
          { name: 'Progress Tracking', icon: TrendingUp, path: '/dashboard/student/progress' },
        ]
      },
      {
        title: 'RESOURCES',
        items: [
          { name: 'Calendar', icon: Calendar, path: '/dashboard/student/calendar' },
          { name: 'Messages', icon: MessageSquare, path: '/dashboard/student/messages' },
        ]
      },
      {
        title: 'SETTINGS',
        items: [
          { name: 'Profile Settings', icon: Settings, path: '/dashboard/student/settings' },
        ]
      },
      {
        title: 'QUICK ACTIONS',
        items: [
          { 
            name: 'Code Emulators', 
            icon: Code, 
            path: '/dashboard/student/code-editor',
            description: 'Practice coding in virtual environment',
            color: 'purple'
          },
          { 
            name: 'E-books', 
            icon: BookOpen, 
            path: '/dashboard/student/ebooks',
            description: 'Access digital learning materials',
            color: 'blue'
          },
          { 
            name: 'Ask Teacher', 
            icon: MessageSquare, 
            path: '/dashboard/student/ask-teacher',
            description: 'Get help from your instructor',
            color: 'green'
          },
          { 
            name: 'KODEIT AI Buddy', 
            icon: Users, 
            path: '/dashboard/student/ai-buddy',
            description: 'Get instant coding help',
            color: 'orange'
          },
          { 
            name: 'Share with Class', 
            icon: Share2, 
            path: '/dashboard/student/share',
            description: 'Collaborate with classmates',
            color: 'purple'
          },
          { 
            name: 'Scratch Editor', 
            icon: Play, 
            path: '/dashboard/student/scratch-editor',
            description: 'Create interactive stories and games',
            color: 'blue'
          }
        ]
      }
    ];
  };

  const navigationItems = getG8PlusNavigationItems();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setShowLogoutDialog(false);
      setShowProfileDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar - G8Plus Specific */}
      <div className="fixed top-0 left-0 z-30 w-64 h-full bg-white shadow-lg overflow-y-auto hidden lg:block scrollbar-hide">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="kodeit" className="w-8 h-8" />
            <span className="text-lg font-semibold text-gray-800">kodeit</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">G8+</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-3 pb-16">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="transition-all duration-300 ease-in-out">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 transition-colors duration-200">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isQuickAction = section.title === 'QUICK ACTIONS';
                  
                  // Get color classes based on item color
                  const getColorClasses = (color: string) => {
                    switch (color) {
                      case 'purple':
                        return {
                          bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
                          hover: 'hover:from-purple-100 hover:to-purple-200',
                          icon: 'text-purple-600',
                          iconBg: 'bg-purple-100'
                        };
                      case 'blue':
                        return {
                          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
                          hover: 'hover:from-blue-100 hover:to-blue-200',
                          icon: 'text-blue-600',
                          iconBg: 'bg-blue-100'
                        };
                      case 'green':
                        return {
                          bg: 'bg-gradient-to-r from-green-50 to-green-100',
                          hover: 'hover:from-green-100 hover:to-green-200',
                          icon: 'text-green-600',
                          iconBg: 'bg-green-100'
                        };
                      case 'orange':
                        return {
                          bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
                          hover: 'hover:from-orange-100 hover:to-orange-200',
                          icon: 'text-orange-600',
                          iconBg: 'bg-orange-100'
                        };
                      default:
                        return {
                          bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
                          hover: 'hover:from-gray-100 hover:to-gray-200',
                          icon: 'text-gray-600',
                          iconBg: 'bg-gray-100'
                        };
                    }
                  };
                  
                  const colorClasses = isQuickAction ? getColorClasses(item.color) : null;
                  
                  return (
                    <li key={itemIndex} className="transition-all duration-200 ease-in-out">
                      <button
                        onClick={() => {
                          console.log('G8PlusLayout - Navigation clicked:', item.name, 'Path:', item.path);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-start space-x-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        } ${isQuickAction && colorClasses ? `${colorClasses.bg} ${colorClasses.hover}` : ''}`}
                      >
                        <div className={`p-1.5 rounded-lg ${isQuickAction && colorClasses ? `${colorClasses.iconBg} shadow-sm` : ''}`}>
                          <Icon className={`w-4 h-4 transition-transform duration-200 ${isQuickAction && colorClasses ? colorClasses.icon : ''}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold transition-colors duration-200">{item.name}</div>
                          {isQuickAction && item.description && (
                            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{item.description}</div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content - G8Plus Specific Layout */}
      <div className="lg:ml-64">
        {/* Fixed Top Bar */}
        <header className="fixed top-0 z-20 bg-white shadow-sm border-b border-gray-200 left-0 lg:left-64 right-0">
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

                <button className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Report</span>
                </button>

                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{userName}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">Grade 8+ Student</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/dashboard/student/settings');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowLogoutDialog(true);
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

        {/* Main Content Area - G8Plus Specific */}
        <main className="bg-gray-50 min-h-screen pt-16 px-2 lg:px-4">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        userName={userName}
      />
    </div>
  );
};

export default G8PlusLayout;

