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
  FileText,
  School,
  Award,
  TrendingUp,
  Map,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import logo from '../assets/logo.png';
import LogoutDialog from './ui/logout-dialog';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('AdminDashboardLayout - userName:', userName);
  console.log('AdminDashboardLayout - current location:', location.pathname);

  const getNavigationItems = () => {
    return [
      {
        title: 'DASHBOARD',
        items: [
          { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
          { name: 'Community', icon: Users, path: '/dashboard/admin/community' },
          { name: 'Enrollments', icon: GraduationCap, path: '/dashboard/admin/enrollments' },
        ]
      },
      {
        title: 'TEACHERS',
        items: [
          { name: 'Teachers', icon: Users, path: '/dashboard/admin/teachers' },
          { name: 'Master Trainers', icon: Award, path: '/dashboard/admin/master-trainers' },
        ]
      },
      {
        title: 'COURSES & PROGRAMS',
        items: [
          { name: 'Courses & Programs', icon: BookOpen, path: '/dashboard/admin/courses' },
          { name: 'Certifications', icon: GraduationCap, path: '/dashboard/admin/certifications' },
          { name: 'Assessments', icon: FileText, path: '/dashboard/admin/assessments' },
          { name: 'Schools', icon: School, path: '/dashboard/admin/schools' },
        ]
      },
      {
        title: 'INSIGHTS',
        items: [
          { name: 'Analytics', icon: BarChart3, path: '/dashboard/admin/analytics' },
          { name: 'Predictive Models', icon: TrendingUp, path: '/dashboard/admin/predictive' },
          { name: 'Reports', icon: FileText, path: '/dashboard/admin/reports' },
          { name: 'Competencies Map', icon: Map, path: '/dashboard/admin/competencies' },
        ]
      },
      {
        title: 'SETTINGS',
        items: [
          { name: 'System Settings', icon: Settings, path: '/dashboard/admin/settings' },
          { name: 'User Management', icon: Users, path: '/dashboard/admin/users' },
          { name: 'Cohort Navigation', icon: Users, path: '/dashboard/admin/cohort-navigation' },
        ]
      }
    ];
  };

  const navigationItems = getNavigationItems();
  console.log('🧭 Admin navigation items:', navigationItems);

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
      {/* Fixed Sidebar - Hidden on mobile */}
      <div className="fixed top-0 left-0 z-30 w-64 h-full bg-white shadow-lg overflow-y-auto hidden lg:block scrollbar-hide">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="kodeit" className="w-8 h-8" />
            <span className="text-lg font-semibold text-gray-800">kodeit</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-4 pb-16">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={itemIndex}>
                      <button
                        onClick={() => {
                          console.log('AdminDashboardLayout - Navigation clicked:', item.name, 'Path:', item.path);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content - offset by sidebar width on desktop, full width on mobile */}
      <div className="lg:ml-64 min-h-screen">
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
                        <p className="text-xs text-gray-500">Admin</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/dashboard/admin/settings');
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

        {/* Main Content Area - with proper top padding */}
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

export default AdminDashboardLayout;
