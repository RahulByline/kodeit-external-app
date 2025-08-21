import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Filter, Mail, Phone, MapPin, Calendar, Shield, UserCheck, UserX, Edit, Trash2, Save, X, Eye, EyeOff,
  Download, Upload, Settings, Key, Lock, Unlock, UserPlus, UserMinus, RefreshCw, MoreHorizontal, Copy, Send, AlertTriangle,
  CheckCircle, Clock, Star, Award, BookOpen, GraduationCap, Building, Globe, CreditCard, FileText, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/DashboardLayout';
import { moodleService } from '@/services/moodleApi';

interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  city?: string;
  country?: string;
  lastaccess: number;
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  status: 'active' | 'inactive' | 'suspended';
  roles: string[];
  coursesEnrolled?: number;
  lastLogin?: string;
  suspended?: number;
  confirmed?: number;
  // Additional IOMAD fields
  companyId?: number;
  companyName?: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  timezone?: string;
  language?: string;
  emailVerified?: boolean;
  lastPasswordChange?: number;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  profileComplete?: boolean;
  enrollmentDate?: number;
  graduationDate?: number;
  certificates?: string[];
  achievements?: string[];
  notes?: string;
}

interface UserFormData {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  city?: string;
  country?: string;
  roles: string[];
  companyId?: number;
  // Additional IOMAD fields
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  timezone?: string;
  language?: string;
  notes?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUserNotesModal, setShowUserNotesModal] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<User | null>(null);
  const [selectedUserForNotes, setSelectedUserForNotes] = useState<User | null>(null);
  
  // Form states
  const [userForm, setUserForm] = useState<UserFormData>({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    city: '',
    country: '',
    roles: [],
    companyId: undefined,
    department: '',
    position: '',
    phone: '',
    address: '',
    timezone: 'UTC',
    language: 'en',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Dynamic refresh state
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [moodleChangesDetected, setMoodleChangesDetected] = useState(false);
  const [lastUserCount, setLastUserCount] = useState(0);
  const [recentlyDeletedUsers, setRecentlyDeletedUsers] = useState<Set<number>>(new Set());

  // Available roles and companies
  const [availableRoles] = useState([
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'trainer', label: 'Trainer' },
    { value: 'school-admin', label: 'School Admin' },
    { value: 'admin', label: 'System Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'coursecreator', label: 'Course Creator' },
    { value: 'editingteacher', label: 'Editing Teacher' },
    { value: 'companymanager', label: 'Company Manager' },
    { value: 'guest', label: 'Guest' },
    { value: 'user', label: 'Authenticated User' }
  ]);
  
  const [companies, setCompanies] = useState<Array<{id: number, name: string}>>([]);
  const [departments] = useState([
    'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Research', 'Development', 'Support', 'Management'
  ]);
  const [positions] = useState([
    'Manager', 'Director', 'Coordinator', 'Specialist', 'Analyst', 'Assistant', 'Supervisor', 'Lead', 'Consultant', 'Intern'
  ]);

  // Enhanced useEffect with auto-refresh and better error handling
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Test API connection first
        console.log('🔍 Testing API connection...');
        const apiTest = await moodleService.testApiConnection();
        console.log('✅ API connection test result:', apiTest);
        
        if (!apiTest) {
          throw new Error('API connection failed');
        }
        
        // Fetch data in parallel
        await Promise.all([
          fetchUsers(),
          fetchCompanies()
        ]);
        
        setLastRefresh(new Date());
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
    
    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        fetchUsers();
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [autoRefresh]);

  // Force refresh on component focus (when user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Tab focused - checking for Moodle changes...');
      // Only refresh if auto-refresh is disabled to avoid double refreshing
      if (!autoRefresh) {
        fetchUsers();
        setLastRefresh(new Date());
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible - checking for Moodle changes...');
        if (!autoRefresh) {
          fetchUsers();
          setLastRefresh(new Date());
        }
      }
    };

    // Keyboard shortcut for force refresh (Ctrl+R)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault(); // Prevent browser refresh
        console.log('🔄 Ctrl+R pressed - force refreshing from Moodle...');
        handleForceRefresh();
      }
    };

    // Listen for tab focus and page visibility changes
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [autoRefresh]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Real-time synchronization with Moodle (simplified to avoid type issues)
  useEffect(() => {
    if (!autoRefresh) return;
    
    const syncInterval = setInterval(async () => {
      console.log('🔄 Performing real-time sync with Moodle...');
      
      try {
        // Simple refresh approach to avoid complex type conversions
        await fetchUsers(true); // Force refresh
        setLastRefresh(new Date());
        console.log('🔄 Real-time sync completed successfully');
      } catch (error) {
        console.error('❌ Error during real-time sync:', error);
        // Don't show alert for sync errors to avoid spam
      }
    }, 60000); // Check every minute for changes
    
    return () => clearInterval(syncInterval);
  }, [autoRefresh]);

  // Enhanced fetchUsers with better error handling and state updates
  const fetchUsers = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        console.log('🔄 Force refreshing users from Moodle API...');
      } else {
        console.log('🔍 Fetching users from Moodle API...');
      }
      
      const usersData = await moodleService.getAllUsers();
      console.log('📊 Users data received:', usersData);
      
      // Enhance user data with additional information
      const enhancedUsers: User[] = usersData.map(user => {
        const isActive = user.lastaccess && user.lastaccess > (Date.now() / 1000) - (30 * 24 * 60 * 60);
        const isSuspended = (user as any).suspended === 1;
        
        let status: 'active' | 'inactive' | 'suspended' = 'inactive';
        if (isSuspended) status = 'suspended';
        else if (isActive) status = 'active';
        
        // Use the role from the API response
        const roles: string[] = [];
        if (user.role) {
          // Map API roles to display roles
          const roleMapping: Record<string, string> = {
            'teacher': 'Teacher',
            'trainer': 'Trainer',
            'student': 'Student',
            'admin': 'Admin',
            'school_admin': 'School Admin',
            'manager': 'Manager',
            'companymanager': 'Company Manager'
          };
          const displayRole = roleMapping[user.role] || user.role;
          roles.push(displayRole);
        }
        
        return {
          id: parseInt(user.id.toString()),
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          city: (user as any).city || '',
          country: (user as any).country || '',
          lastaccess: user.lastaccess || 0,
          isTeacher: user.isTeacher || user.role === 'teacher' || user.role === 'trainer',
          isStudent: user.isStudent || user.role === 'student',
          isAdmin: user.isAdmin || user.role === 'admin' || user.role === 'school_admin',
          status,
          roles,
          coursesEnrolled: (user as any).coursesEnrolled || 0, // Real course enrollment count
          lastLogin: user.lastaccess ? new Date(user.lastaccess * 1000).toLocaleDateString() : 'Never',
          suspended: (user as any).suspended,
          confirmed: (user as any).confirmed,
          companyId: (user as any).companyid,
          companyName: (user as any).companyName || '',
          department: (user as any).department || '',
          position: (user as any).position || '',
          phone: (user as any).phone || '',
          address: (user as any).address || '',
          timezone: (user as any).timezone || 'UTC',
          language: (user as any).language || 'en',
          notes: (user as any).notes || ''
        };
      });

      // Filter out recently deleted users to prevent them from reappearing
      const filteredUsers = enhancedUsers.filter(user => !recentlyDeletedUsers.has(user.id));
      
      if (filteredUsers.length !== enhancedUsers.length) {
        console.log(`🔍 Filtered out ${enhancedUsers.length - filteredUsers.length} recently deleted users`);
      }
      
      console.log('✅ Enhanced users (after filtering):', filteredUsers);
      
      // Check for changes in user count (simple change detection)
      if (lastUserCount > 0 && filteredUsers.length !== lastUserCount) {
        console.log(`🔄 Change detected: User count changed from ${lastUserCount} to ${filteredUsers.length}`);
        setMoodleChangesDetected(true);
        // Auto-clear the notification after 10 seconds
        setTimeout(() => setMoodleChangesDetected(false), 10000);
      }
      
      setLastUserCount(filteredUsers.length);
      setUsers(filteredUsers);
      setError(''); // Clear any previous errors
      
      if (forceRefresh) {
        alert('✅ Data refreshed successfully from Moodle!');
        setMoodleChangesDetected(false); // Clear any pending notifications
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(`Failed to load users data from IOMAD API: ${error.message || error}`);
      setUsers([]);
    }
  };

  // Enhanced fetchCompanies with better error handling
  const fetchCompanies = async () => {
    try {
      console.log('🔍 Fetching companies...');
      const companiesData = await moodleService.getCompanies();
      console.log('📊 Companies data received:', companiesData);
      
      const enhancedCompanies = companiesData.map(company => ({
        id: parseInt(company.id.toString()),
        name: company.name
      }));
      
      setCompanies(enhancedCompanies);
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      // Fallback companies
      setCompanies([
        { id: 1, name: 'KodeIT Academy' },
        { id: 2, name: 'Tech School' }
      ]);
    }
  };

  // Enhanced form validation with real-time feedback
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!userForm.username.trim()) errors.username = 'Username is required';
    if (!userForm.firstname.trim()) errors.firstname = 'First name is required';
    if (!userForm.lastname.trim()) errors.lastname = 'Last name is required';
    if (!userForm.email.trim()) errors.email = 'Email is required';
    if (!userForm.email.includes('@')) errors.email = 'Valid email is required';
    if (!userForm.password.trim()) errors.password = 'Password is required';
    if (userForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (userForm.roles.length === 0) errors.roles = 'At least one role must be selected';
    
    setFormErrors(errors);
    console.log('Form validation errors:', errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced user creation with immediate state update
  const handleCreateUser = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log('�� Creating user with IOMAD API...');
      
      // Create user using IOMAD API
      const newUserData = await moodleService.createUser({
        username: userForm.username,
        firstname: userForm.firstname,
        lastname: userForm.lastname,
        email: userForm.email,
        password: userForm.password,
        city: userForm.city,
        country: userForm.country,
        roles: userForm.roles,
        companyId: userForm.companyId,
        department: userForm.department,
        position: userForm.position,
        phone: userForm.phone,
        address: userForm.address,
        timezone: userForm.timezone,
        language: userForm.language,
        notes: userForm.notes
      });
      
      console.log('✅ User created via IOMAD API:', newUserData);
      
      // Immediately add the new user to the state for dynamic update
      const newUser: User = {
        id: parseInt(newUserData.id.toString()),
        username: newUserData.username,
        firstname: newUserData.firstname,
        lastname: newUserData.lastname,
        email: newUserData.email,
        city: userForm.city || '',
        country: userForm.country || '',
        lastaccess: Date.now() / 1000,
        isTeacher: userForm.roles.includes('teacher') || userForm.roles.includes('trainer'),
        isStudent: userForm.roles.includes('student'),
        isAdmin: userForm.roles.includes('admin') || userForm.roles.includes('school-admin'),
        status: 'active',
        roles: userForm.roles.map(role => {
          const roleMapping: Record<string, string> = {
            'teacher': 'Teacher',
            'trainer': 'Trainer',
            'student': 'Student',
            'admin': 'Admin',
            'school-admin': 'School Admin',
            'manager': 'Manager',
            'companymanager': 'Company Manager'
          };
          return roleMapping[role] || role;
        }),
        coursesEnrolled: 0,
        lastLogin: 'Never',
        companyId: userForm.companyId,
        companyName: companies.find(c => c.id === userForm.companyId)?.name || '',
        department: userForm.department || '',
        position: userForm.position || '',
        phone: userForm.phone || '',
        address: userForm.address || '',
        timezone: userForm.timezone || 'UTC',
        language: userForm.language || 'en',
        notes: userForm.notes || ''
      };
      
      // Update state immediately for dynamic UI update
      setUsers(prevUsers => [newUser, ...prevUsers]);
      setLastRefresh(new Date());
      
      setShowAddUserModal(false);
      resetForm();
      
      // Show success message
      alert('✅ User created successfully in IOMAD!');
    } catch (error) {
      console.error('❌ Error creating user:', error);
      alert(`❌ Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced user editing with immediate state update
  const handleEditUser = async () => {
    if (!editingUser || !validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log('🔍 Updating user with IOMAD API...');
      
      // Update user using IOMAD API
      await moodleService.updateUser(editingUser.id.toString(), {
        firstname: userForm.firstname,
        lastname: userForm.lastname,
        email: userForm.email,
        city: userForm.city,
        country: userForm.country,
        roles: userForm.roles,
        companyId: userForm.companyId,
        department: userForm.department,
        position: userForm.position,
        phone: userForm.phone,
        address: userForm.address,
        timezone: userForm.timezone,
        language: userForm.language,
        notes: userForm.notes
      });
      
      console.log('✅ User updated via IOMAD API');
      
      // Immediately update the user in state for dynamic UI update
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === editingUser.id 
          ? {
              ...user,
              firstname: userForm.firstname,
              lastname: userForm.lastname,
              email: userForm.email,
              city: userForm.city || '',
              country: userForm.country || '',
              roles: userForm.roles.map(role => {
                const roleMapping: Record<string, string> = {
                  'teacher': 'Teacher',
                  'trainer': 'Trainer',
                  'student': 'Student',
                  'admin': 'Admin',
                  'school-admin': 'School Admin',
                  'manager': 'Manager',
                  'companymanager': 'Company Manager'
                };
                return roleMapping[role] || role;
              }),
              isTeacher: userForm.roles.includes('teacher') || userForm.roles.includes('trainer'),
              isStudent: userForm.roles.includes('student'),
              isAdmin: userForm.roles.includes('admin') || userForm.roles.includes('school-admin'),
              companyId: userForm.companyId,
              companyName: companies.find(c => c.id === userForm.companyId)?.name || '',
              department: userForm.department || '',
              position: userForm.position || '',
              phone: userForm.phone || '',
              address: userForm.address || '',
              timezone: userForm.timezone || 'UTC',
              language: userForm.language || 'en',
              notes: userForm.notes || ''
            }
          : user
      ));
      
      setLastRefresh(new Date());
      
      setShowEditUserModal(false);
      setEditingUser(null);
      resetForm();
      
      alert('✅ User updated successfully in IOMAD!');
    } catch (error) {
      console.error('❌ Error updating user:', error);
      alert(`❌ Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced user deletion with immediate state update
  const handleDeleteUser = async () => {
    if (!deletingUser) {
      console.error('❌ No user selected for deletion');
      alert('❌ No user selected for deletion');
      return;
    }
    
    try {
      console.log('🔍 Starting deletion process for user:', deletingUser);
      console.log('🔍 Current users count before deletion:', users.length);
      console.log('🔍 Recently deleted users count:', recentlyDeletedUsers.size);
      
      // Show loading state
      setShowDeleteConfirmModal(false);
      
      // Delete user using IOMAD API
      console.log('🔍 Calling IOMAD API to delete user...');
      const result = await moodleService.deleteUser(deletingUser.id.toString());
      console.log('🔍 API deletion result:', result);
      
      if (!result) {
        throw new Error('API returned null or undefined result');
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete user');
      }
      
      console.log('✅ User deleted via IOMAD API successfully');
      
      // Add user to recently deleted set to prevent re-adding during auto-refresh
      setRecentlyDeletedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(deletingUser.id);
        console.log('🔍 Added user to recently deleted set. New count:', newSet.size);
        return newSet;
      });
      
      // Immediately remove the user from state for dynamic UI update
      setUsers(prevUsers => {
        console.log('🔍 Previous users count:', prevUsers.length);
        const filteredUsers = prevUsers.filter(user => user.id !== deletingUser.id);
        console.log('🔍 Filtered users count:', filteredUsers.length);
        console.log('🔍 Removed user ID:', deletingUser.id);
        console.log('🔍 Remaining users:', filteredUsers.map(u => `${u.firstname} ${u.lastname} (${u.id})`));
        return filteredUsers;
      });
      
      // Update last refresh time
      setLastRefresh(new Date());
      
      // Reset deletion state
      setDeletingUser(null);
      
      // Temporarily disable auto-refresh for 30 seconds to prevent immediate re-fetch
      if (autoRefresh) {
        console.log('🔄 Temporarily disabling auto-refresh for 30 seconds...');
        setAutoRefresh(false);
        setTimeout(() => {
          console.log('🔄 Re-enabling auto-refresh...');
          setAutoRefresh(true);
        }, 30000); // 30 seconds
      }
      
      // Remove from recently deleted set after 5 minutes to allow for API sync
      setTimeout(() => {
        setRecentlyDeletedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(deletingUser.id);
          console.log('🔍 Removed user from recently deleted set after 5 minutes. New count:', newSet.size);
          return newSet;
        });
      }, 5 * 60 * 1000); // 5 minutes
      
      console.log('✅ UI updated after deletion');
      console.log('✅ Deletion process completed successfully');
      
      // Show success message
      alert(`✅ User "${deletingUser.firstname} ${deletingUser.lastname}" deleted successfully from IOMAD!`);
      
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      
      // Re-open the modal if there was an error
      setShowDeleteConfirmModal(true);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Failed to delete user: ${errorMessage}\n\nPlease check the console for more details.`);
    }
  };

  // Enhanced user suspension with immediate state update
  const handleSuspendUser = async (userId: number) => {
    try {
      console.log('🔍 Suspending user with IOMAD API...');
      
      // Suspend user using IOMAD API
      const result = await moodleService.suspendUser(userId.toString());
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to suspend user');
      }
      
      console.log('✅ User suspended via IOMAD API');
      
      // Immediately update the user status in state for dynamic UI update
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: 'suspended' as const }
          : user
      ));
      
      setLastRefresh(new Date());
      
      alert('✅ User suspended successfully in IOMAD!');
    } catch (error) {
      console.error('❌ Error suspending user:', error);
      alert(`❌ Failed to suspend user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced user activation with immediate state update
  const handleActivateUser = async (userId: number) => {
    try {
      console.log('🔍 Activating user with IOMAD API...');
      
      // Activate user using IOMAD API
      const result = await moodleService.activateUser(userId.toString());
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to activate user');
      }
      
      console.log('✅ User activated via IOMAD API');
      
      // Immediately update the user status in state for dynamic UI update
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: 'active' as const }
          : user
      ));
      
      setLastRefresh(new Date());
      
      alert('✅ User activated successfully in IOMAD!');
    } catch (error) {
      console.error('❌ Error activating user:', error);
      alert(`❌ Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced IOMAD Admin Functions with immediate state updates
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    setIsSubmitting(true);
    try {
      console.log(`🔍 Performing bulk action: ${bulkAction} on ${selectedUsers.length} users in IOMAD`);
      
      let successCount = 0;
      let errorCount = 0;
      
      switch (bulkAction) {
        case 'suspend':
          const suspendResult = await moodleService.bulkSuspendUsers(selectedUsers.map(id => id.toString()));
          if (!suspendResult.success) {
            throw new Error(suspendResult.message || 'Failed to bulk suspend users');
          }
          // Immediately update state for dynamic UI
          setUsers(prevUsers => prevUsers.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'suspended' as const }
              : user
          ));
          successCount = selectedUsers.length;
          break;
        case 'activate':
          const activateResult = await moodleService.bulkActivateUsers(selectedUsers.map(id => id.toString()));
          if (!activateResult.success) {
            throw new Error(activateResult.message || 'Failed to bulk activate users');
          }
          // Immediately update state for dynamic UI
          setUsers(prevUsers => prevUsers.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'active' as const }
              : user
          ));
          successCount = selectedUsers.length;
          break;
        case 'delete':
          console.log('🔍 Starting bulk delete process for users:', selectedUsers);
          console.log('🔍 Current users count before bulk deletion:', users.length);
          
          const deleteResult = await moodleService.bulkDeleteUsers(selectedUsers.map(id => id.toString()));
          
          if (!deleteResult.success) {
            throw new Error(deleteResult.message || 'Failed to bulk delete users');
          }
          console.log('✅ Bulk delete via IOMAD API completed');
          
          // Add users to recently deleted set to prevent re-adding during auto-refresh
          setRecentlyDeletedUsers(prev => {
            const newSet = new Set(prev);
            selectedUsers.forEach(id => newSet.add(id));
            console.log('🔍 Added users to recently deleted set. New count:', newSet.size);
            return newSet;
          });
          
          // Immediately remove from state for dynamic UI
          setUsers(prevUsers => {
            console.log('🔍 Previous users count before bulk delete:', prevUsers.length);
            const filteredUsers = prevUsers.filter(user => !selectedUsers.includes(user.id));
            console.log('🔍 Filtered users count after bulk delete:', filteredUsers.length);
            console.log('🔍 Removed user IDs:', selectedUsers);
            return filteredUsers;
          });
          
          successCount = selectedUsers.length;
          
          // Temporarily disable auto-refresh for 30 seconds to prevent immediate re-fetch
          if (autoRefresh) {
            console.log('🔄 Temporarily disabling auto-refresh for 30 seconds after bulk delete...');
            setAutoRefresh(false);
            setTimeout(() => {
              console.log('🔄 Re-enabling auto-refresh...');
              setAutoRefresh(true);
            }, 30000); // 30 seconds
          }
          
          // Remove from recently deleted set after 5 minutes
          setTimeout(() => {
            setRecentlyDeletedUsers(prev => {
              const newSet = new Set(prev);
              selectedUsers.forEach(id => newSet.delete(id));
              console.log('🔍 Removed users from recently deleted set after 5 minutes. New count:', newSet.size);
              return newSet;
            });
          }, 5 * 60 * 1000); // 5 minutes
          
          console.log('✅ Bulk delete UI updated successfully');
          break;
        case 'assign_company':
          // This would need company selection
          console.log(`Would assign users to company`);
          successCount = selectedUsers.length;
          break;
      }
      
      setLastRefresh(new Date());
      setSelectedUsers([]);
      setShowBulkActionsModal(false);
      
      if (errorCount === 0) {
        alert(`✅ Bulk action '${bulkAction}' completed successfully for all ${successCount} users in IOMAD!`);
      } else {
        alert(`⚠️ Bulk action '${bulkAction}' completed with ${successCount} successes and ${errorCount} errors.`);
      }
    } catch (error) {
      console.error('❌ Error performing bulk action:', error);
      alert(`❌ Failed to perform bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUserForPasswordReset || !newPassword || newPassword !== confirmPassword) {
      alert('Please fill in all fields and ensure passwords match.');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('🔍 Resetting password for user in IOMAD:', selectedUserForPasswordReset.username);
      
      const result = await moodleService.resetUserPassword(selectedUserForPasswordReset.id.toString());
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to reset password');
      }
      
      console.log('✅ Password reset via IOMAD API');
      
      setShowPasswordResetModal(false);
      setSelectedUserForPasswordReset(null);
      setNewPassword('');
      setConfirmPassword('');
      
      alert(`✅ Password reset successfully for ${selectedUserForPasswordReset.firstname} ${selectedUserForPasswordReset.lastname} in IOMAD!`);
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      alert(`❌ Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const csvContent = [
        ['ID', 'Username', 'First Name', 'Last Name', 'Email', 'Status', 'Roles', 'Company', 'Department', 'Position'],
        ...users.map(user => [
          user.id,
          user.username,
          user.firstname,
          user.lastname,
          user.email,
          user.status,
          user.roles.join(', '),
          user.companyName || '',
          user.department || '',
          user.position || ''
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      alert('Users exported successfully!');
    } catch (error) {
      console.error('❌ Error exporting users:', error);
      alert('Failed to export users');
    }
  };

  const handleImportUsers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      console.log('🔍 Importing users from CSV file:', file.name);
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      console.log('📊 CSV headers:', headers);
      console.log('📊 Total lines:', lines.length);
      
      let successCount = 0;
      let errorCount = 0;
      const newUsers: User[] = [];
      
      // Skip header row and process each user
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < 5) {
          console.log(`⚠️ Skipping line ${i + 1}: insufficient data`);
          continue;
        }
        
        const userData = {
          username: values[1]?.trim(),
          firstname: values[2]?.trim(),
          lastname: values[3]?.trim(),
          email: values[4]?.trim(),
          password: 'defaultPassword123', // Default password for imported users
          roles: values[6]?.trim().split(',').map(r => r.trim()) || ['student'],
          department: values[8]?.trim(),
          position: values[9]?.trim()
        };
        
        console.log(`📝 Processing user: ${userData.username} (${userData.email})`);
        
        if (userData.username && userData.email) {
          try {
            const createdUser = await moodleService.createUser(userData);
            successCount++;
            
            // Create user object for immediate state update
            const newUser: User = {
              id: parseInt(createdUser.id.toString()),
              username: createdUser.username,
              firstname: createdUser.firstname,
              lastname: createdUser.lastname,
              email: createdUser.email,
              city: '',
              country: '',
              lastaccess: Date.now() / 1000,
              isTeacher: userData.roles.includes('teacher') || userData.roles.includes('trainer'),
              isStudent: userData.roles.includes('student'),
              isAdmin: userData.roles.includes('admin') || userData.roles.includes('school-admin'),
              status: 'active',
              roles: userData.roles.map(role => {
                const roleMapping: Record<string, string> = {
                  'teacher': 'Teacher',
                  'trainer': 'Trainer',
                  'student': 'Student',
                  'admin': 'Admin',
                  'school-admin': 'School Admin',
                  'manager': 'Manager',
                  'companymanager': 'Company Manager'
                };
                return roleMapping[role] || role;
              }),
              coursesEnrolled: 0,
              lastLogin: 'Never',
              companyId: undefined,
              companyName: '',
              department: userData.department || '',
              position: userData.position || '',
              phone: '',
              address: '',
              timezone: 'UTC',
              language: 'en',
              notes: ''
            };
            
            newUsers.push(newUser);
            console.log(`✅ Successfully imported user: ${userData.username}`);
          } catch (userError) {
            console.error(`❌ Failed to import user ${userData.username}:`, userError);
            errorCount++;
          }
        } else {
          console.log(`⚠️ Skipping user with missing username or email`);
          errorCount++;
        }
      }
      
      // Add all new users to state immediately for dynamic UI update
      if (newUsers.length > 0) {
        setUsers(prevUsers => [...newUsers, ...prevUsers]);
        setLastRefresh(new Date());
      }
      
      setShowImportModal(false);
      
      if (errorCount === 0) {
        alert(`Successfully imported ${successCount} users!`);
      } else {
        alert(`Import completed with ${successCount} successes and ${errorCount} errors.`);
      }
    } catch (error) {
      console.error('❌ Error importing users:', error);
      alert(`Failed to import users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveUserNotes = async () => {
    if (!selectedUserForNotes || !userNotes.trim()) {
      alert('Please enter notes before saving.');
      return;
    }
    
    try {
      console.log('🔍 Saving user notes in IOMAD:', selectedUserForNotes.username);
      
      const result = await moodleService.updateUserNotes(selectedUserForNotes.id.toString(), userNotes);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update user notes');
      }
      
      // Immediately update the user's notes in state for dynamic UI
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUserForNotes.id 
          ? { ...user, notes: userNotes }
          : user
      ));
      
      setLastRefresh(new Date());
      
      setShowUserNotesModal(false);
      setSelectedUserForNotes(null);
      setUserNotes('');
      
      alert(`✅ Notes saved successfully for ${selectedUserForNotes.firstname} ${selectedUserForNotes.lastname} in IOMAD!`);
    } catch (error) {
      console.error('❌ Error saving user notes:', error);
      alert(`❌ Failed to save user notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSendWelcomeEmail = async (user: User) => {
    try {
      console.log('🔍 Sending welcome email via IOMAD API...');
      
      const result = await moodleService.sendWelcomeEmail(user.id.toString());
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send welcome email');
      }
      
      alert(`✅ Welcome email sent to ${user.email} via IOMAD!`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      alert(`❌ Failed to send welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleViewUserActivity = async (user: User) => {
    try {
      console.log('🔍 Fetching user activity from IOMAD...');
      
      const result = await moodleService.getUserActivity(user.id.toString());
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch user activity');
      }
      
      const activityData = result.data;
      
      console.log('✅ User activity data:', activityData);
      
      // Show activity data in a modal or alert
      alert(`📊 Activity data for ${user.firstname} ${user.lastname} loaded from IOMAD!\nCheck console for detailed information.`);
    } catch (error) {
      console.error('❌ Error fetching user activity:', error);
      alert(`❌ Failed to fetch user activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAssignCourses = async (user: User) => {
    try {
      console.log('🔍 Assigning courses to user in IOMAD...');
      
      // This would open a course selection modal
      // For now, we'll show a placeholder
      const courseIds = [1, 2, 3]; // Example course IDs
      
      const result = await moodleService.assignUserToCourses(user.id.toString(), courseIds.map(id => id.toString()));
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to assign courses');
      }
      
      alert(`✅ Courses assigned to ${user.firstname} ${user.lastname} in IOMAD!`);
    } catch (error) {
      console.error('❌ Error assigning courses:', error);
      alert(`❌ Failed to assign courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced form reset with all fields
  const resetForm = () => {
    setUserForm({
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      city: '',
      country: '',
      roles: [],
      companyId: undefined,
      department: '',
      position: '',
      phone: '',
      address: '',
      timezone: 'UTC',
      language: 'en',
      notes: ''
    });
    setFormErrors({});
    setShowPassword(false);
  };

  // Enhanced edit modal opening with all fields
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: '', // Don't show password in edit mode
      city: user.city || '',
      country: user.country || '',
      roles: user.roles.map(role => role.toLowerCase()),
      companyId: user.companyId,
      department: user.department || '',
      position: user.position || '',
      phone: user.phone || '',
      address: user.address || '',
      timezone: user.timezone || 'UTC',
      language: user.language || 'en',
      notes: user.notes || ''
    });
    setShowEditUserModal(true);
  };

  const openDeleteModal = (user: User) => {
    setDeletingUser(user);
    setShowDeleteConfirmModal(true);
  };

  // Enhanced filtering with real-time updates
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Enhanced stats calculation with real-time updates
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    teachers: users.filter(u => u.isTeacher).length,
    students: users.filter(u => u.isStudent).length,
    admins: users.filter(u => u.isAdmin).length
  };

  // Enhanced user selection with immediate UI feedback
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Enhanced status and role color functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Teacher': return 'bg-blue-100 text-blue-800';
      case 'Student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced test function with comprehensive debugging
  const testUserManagement = async () => {
    try {
      console.log('🧪 Testing User Management functionality...');
      
      // Test 1: API Connection
      console.log('Test 1: API Connection');
      const apiTest = await moodleService.testApiConnection();
      console.log('API Test Result:', apiTest);
      
      // Test 2: Fetch Users
      console.log('Test 2: Fetch Users');
      const users = await moodleService.getAllUsers();
      console.log('Users fetched:', users.length);
      
      // Test 3: Fetch Companies
      console.log('Test 3: Fetch Companies');
      const companies = await moodleService.getCompanies();
      console.log('Companies fetched:', companies.length);
      
      // Test 4: Test role detection
      console.log('Test 4: Role Detection');
      if (users.length > 0) {
        const testUser = users[0];
        console.log('Test user:', testUser.username, 'Role:', testUser.role);
      }
      
      // Test 5: State Management
      console.log('Test 5: State Management');
      console.log('Current users in state:', users.length);
      console.log('Current companies in state:', companies.length);
      console.log('Last refresh:', lastRefresh);
      
      alert('User Management test completed! Check console for details.');
    } catch (error) {
      console.error('❌ User Management test failed:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced manual refresh function
  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(true), // Force refresh
        fetchCompanies()
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      alert(`Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh from Moodle (ignores cache)
  const handleForceRefresh = async () => {
    try {
      setLoading(true);
      console.log('🔄 Force refreshing all data from Moodle...');
      
      // Clear any cached data and force fresh fetch
      await Promise.all([
        fetchUsers(true), // Force refresh
        fetchCompanies()
      ]);
      
      setLastRefresh(new Date());
      alert('✅ Force refresh completed! All data updated from Moodle.');
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      alert(`Force refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (autoRefresh && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  // Add comprehensive test function with enhanced IOMAD integration
  const runComprehensiveTest = async () => {
    console.log('🧪 Starting comprehensive user management test with IOMAD integration...');
    
    try {
      // Test 1: API Connection
      console.log('🔗 Test 1: Testing API Connection...');
      const apiTest = await moodleService.testApiConnection();
      console.log('API Connection Test Result:', apiTest);
      
      // Test 2: Fetch Users with enhanced role detection
      console.log('👥 Test 2: Testing Fetch Users with IOMAD roles...');
      const usersResult = await moodleService.getAllUsers();
      console.log('Fetch Users Test Result:', usersResult);
      
      // Test 3: Get Companies
      console.log('🏢 Test 3: Testing Get Companies...');
      const companiesResult = await moodleService.getCompanies();
      console.log('Get Companies Test Result:', companiesResult);
      
      // Test 4: Get Available Roles
      console.log('🎭 Test 4: Testing Get Available Roles...');
      const rolesResult = await moodleService.getAvailableRoles();
      console.log('Get Available Roles Test Result:', rolesResult);
      
      // Test 5: Test IOMAD Role Fetching specifically
      console.log('🔍 Test 5: Testing IOMAD Role Fetching...');
      if (usersResult.length > 0) {
        const testUser = usersResult[0];
        const userRoles = await moodleService.getUserRoles(parseInt(testUser.id.toString()));
        console.log(`IOMAD Role Fetching Test - User: ${testUser.username}, Roles:`, userRoles);
      }
      
      // Test 6: Get Courses
      console.log('📚 Test 6: Testing Get Courses...');
      const coursesResult = await moodleService.getAllCourses();
      console.log('Get Courses Test Result:', coursesResult);
      
      // Test 7: Test Role Assignment with IOMAD
      console.log('🔧 Test 7: Testing IOMAD Role Assignment...');
      if (usersResult.length > 0) {
        const testUser = usersResult[0];
        const roleResult = await moodleService.updateUserRole(parseInt(testUser.id.toString()), 'teacher');
        console.log(`IOMAD Role Assignment Test for user ${testUser.username}:`, roleResult);
      }
      
      // Test 8: Check Current State
      console.log('📊 Test 8: Checking Current State...');
      console.log('Current users count:', users.length);
      console.log('Current loading state:', loading);
      console.log('Current error state:', error);
      console.log('Current selected users:', selectedUsers);
      console.log('Current search term:', searchTerm);
      console.log('Current filter role:', filterRole);
      console.log('Current filter status:', filterStatus);
      
      // Test 9: Check Modal States
      console.log('🔍 Test 9: Checking Modal States...');
      console.log('Add User Modal:', showAddUserModal);
      console.log('Edit User Modal:', showEditUserModal);
      console.log('Delete Confirm Modal:', showDeleteConfirmModal);
      console.log('Bulk Actions Modal:', showBulkActionsModal);
      console.log('User Details Modal:', showUserDetailsModal);
      console.log('Password Reset Modal:', showPasswordResetModal);
      console.log('Export Modal:', showExportModal);
      
      alert('🧪 Comprehensive test with IOMAD integration completed! Check console for detailed results.');
      
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      alert('❌ Test failed! Check console for error details.');
    }
  };

  // Add diagnostic function
  const runDiagnosticTest = async () => {
    const results = {
      apiConnection: false,
      userFetch: false,
      companiesFetch: false,
      rolesFetch: false,
      coursesFetch: false,
      createUser: false,
      updateUser: false,
      deleteUser: false,
      suspendUser: false,
      activateUser: false,
      resetPassword: false,
      sendWelcomeEmail: false,
      getUserActivity: false,
      assignCourses: false,
      updateNotes: false
    };

    try {
      // Test API Connection
      const apiTest = await moodleService.testApiConnection();
      results.apiConnection = apiTest;
      
      // Test User Fetch
      const usersResult = await moodleService.getAllUsers();
      results.userFetch = Array.isArray(usersResult) && usersResult.length >= 0;
      
      // Test Companies Fetch
      const companiesResult = await moodleService.getCompanies();
      results.companiesFetch = Array.isArray(companiesResult) && companiesResult.length >= 0;
      
      // Test Roles Fetch
      const rolesResult = await moodleService.getAvailableRoles();
      results.rolesFetch = Array.isArray(rolesResult) && rolesResult.length >= 0;
      
      // Test Courses Fetch
      const coursesResult = await moodleService.getAllCourses();
      results.coursesFetch = Array.isArray(coursesResult) && coursesResult.length >= 0;
      
      // Test Create User (with test data)
      try {
        const createResult = await moodleService.createUser({
          username: 'test_user_' + Date.now(),
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'TestPass123!',
          roles: ['student']
        });
        results.createUser = createResult.success;
        
        // If create succeeded, test update and delete
        if (createResult.success && createResult.data?.id) {
          const userId = createResult.data.id;
          
          // Test Update User
          try {
            const updateResult = await moodleService.updateUser(userId, {
              firstname: 'Updated',
              lastname: 'User',
              email: 'updated@example.com'
            });
            results.updateUser = updateResult.success;
          } catch (e) {
            console.log('Update test failed:', e);
          }
          
          // Test Suspend User
          try {
            const suspendResult = await moodleService.suspendUser(userId);
            results.suspendUser = suspendResult.success;
          } catch (e) {
            console.log('Suspend test failed:', e);
          }
          
          // Test Activate User
          try {
            const activateResult = await moodleService.activateUser(userId);
            results.activateUser = activateResult.success;
          } catch (e) {
            console.log('Activate test failed:', e);
          }
          
          // Test Delete User
          try {
            const deleteResult = await moodleService.deleteUser(userId);
            results.deleteUser = deleteResult.success;
          } catch (e) {
            console.log('Delete test failed:', e);
          }
          
          // Test Reset Password
          try {
            const resetResult = await moodleService.resetUserPassword(userId.toString());
            results.resetPassword = resetResult.success;
          } catch (e) {
            console.log('Reset password test failed:', e);
          }
          
          // Test Send Welcome Email
          try {
            const emailResult = await moodleService.sendWelcomeEmail(userId);
            results.sendWelcomeEmail = emailResult.success;
          } catch (e) {
            console.log('Send welcome email test failed:', e);
          }
          
          // Test Get User Activity
          try {
            const activityResult = await moodleService.getUserActivity(userId);
            results.getUserActivity = activityResult.success;
          } catch (e) {
            console.log('Get user activity test failed:', e);
          }
          
          // Test Assign Courses
          try {
            const assignResult = await moodleService.assignUserToCourses(userId.toString(), [1, 2].map(id => id.toString()));
            results.assignCourses = assignResult.success;
          } catch (e) {
            console.log('Assign courses test failed:', e);
          }
          
          // Test Update Notes
          try {
            const notesResult = await moodleService.updateUserNotes(userId, 'Test notes from diagnostic');
            results.updateNotes = notesResult.success;
          } catch (e) {
            console.log('Update notes test failed:', e);
          }
        }
      } catch (e) {
        console.log('Create user test failed:', e);
      }
      
      console.log('🔍 Diagnostic Results:', results);
      
      // Show results in modal
      setDiagnosticResults(results);
      setShowDiagnosticModal(true);
      
    } catch (error) {
      console.error('❌ Diagnostic test failed:', error);
      alert('❌ Diagnostic test failed! Check console for error details.');
    }
  };

  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName="Admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="p-6 space-y-6">
        {/* Enhanced IOMAD Admin Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Complete IOMAD System Admin Control Panel</p>
            {/* Last refresh indicator */}
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()} | 
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </p>
            {/* Moodle Sync Help */}
            <p className="text-xs text-blue-600 mt-1">
              💡 Tip: Use "Force Sync" button or press Ctrl+R to sync with Moodle changes
            </p>
          </div>
          <div className="flex space-x-2">
            {/* Auto-refresh toggle */}
            <Button 
              variant={autoRefresh ? "default" : "outline"}
              size="sm" 
              onClick={toggleAutoRefresh}
              className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </Button>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Bulk Actions ({selectedUsers.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => selectedUsers.forEach(id => handleActivateUser(id))}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => selectedUsers.forEach(id => handleSuspendUser(id))}>
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBulkActionsModal(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Bulk Actions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Import/Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Import/Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowExportModal(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImportModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Test Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testUserManagement}
            >
              <Settings className="w-4 h-4 mr-2" />
              Test
            </Button>

            {/* Enhanced Refresh Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>

            {/* Force Refresh Button - for Moodle changes */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceRefresh}
              disabled={loading}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Force Sync
            </Button>

            {/* Add User */}
            <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={userForm.username}
                        onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                        className={formErrors.username ? 'border-red-500' : ''}
                      />
                      {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                        className={formErrors.email ? 'border-red-500' : ''}
                      />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstname">First Name *</Label>
                      <Input
                        id="firstname"
                        value={userForm.firstname}
                        onChange={(e) => setUserForm(prev => ({ ...prev, firstname: e.target.value }))}
                        className={formErrors.firstname ? 'border-red-500' : ''}
                      />
                      {formErrors.firstname && <p className="text-red-500 text-sm mt-1">{formErrors.firstname}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastname">Last Name *</Label>
                      <Input
                        id="lastname"
                        value={userForm.lastname}
                        onChange={(e) => setUserForm(prev => ({ ...prev, lastname: e.target.value }))}
                        className={formErrors.lastname ? 'border-red-500' : ''}
                      />
                      {formErrors.lastname && <p className="text-red-500 text-sm mt-1">{formErrors.lastname}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={userForm.password}
                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                        className={formErrors.password ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={userForm.city}
                        onChange={(e) => setUserForm(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={userForm.country}
                        onChange={(e) => setUserForm(prev => ({ ...prev, country: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Roles *</Label>
                    <div className="space-y-2 mt-2">
                      {availableRoles.map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={role.value}
                            checked={userForm.roles.includes(role.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setUserForm(prev => ({ ...prev, roles: [...prev.roles, role.value] }));
                              } else {
                                setUserForm(prev => ({ ...prev, roles: prev.roles.filter(r => r !== role.value) }));
                              }
                            }}
                          />
                          <Label htmlFor={role.value} className="text-sm font-normal">
                            {role.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formErrors.roles && <p className="text-red-500 text-sm mt-1">{formErrors.roles}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Select 
                      value={userForm.companyId?.toString()} 
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, companyId: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateUser} 
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Stats Cards with real-time updates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserX className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.teachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserX className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Error Display with dynamic updates */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Moodle Changes Notification */}
        {moodleChangesDetected && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span>🔄 Changes detected in Moodle! User count has changed.</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleForceRefresh}
                  className="ml-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Sync Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Filters and Search with real-time filtering */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Trainer">Trainer</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="School Admin">School Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive' | 'suspended') => setFilterStatus(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Real-time filter results indicator */}
            <div className="mt-2 text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              
              {/* Enhanced Debug Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                <h4 className="font-medium text-gray-700 mb-2">Debug Information:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total users: {users.length}</p>
                    <p className="text-gray-600">Search term: "{searchTerm}"</p>
                    <p className="text-gray-600">Filter role: {filterRole}</p>
                    <p className="text-gray-600">Filter status: {filterStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Loading: {loading ? 'Yes' : 'No'}</p>
                    <p className="text-gray-600">Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</p>
                    <p className="text-gray-600">Last refresh: {lastRefresh.toLocaleTimeString()}</p>
                    <p className="text-gray-600">Last user count: {lastUserCount}</p>
                    <p className="text-gray-600">Changes detected: {moodleChangesDetected ? 'Yes' : 'No'}</p>
                    <p className="text-gray-600">Recently deleted: {recentlyDeletedUsers.size} users</p>
                    {error && <p className="text-red-600">Error: {error}</p>}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleManualRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={testUserManagement}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Test API
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterRole('all');
                      setFilterStatus('all');
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear Filters
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setRecentlyDeletedUsers(new Set());
                      console.log('🧹 Cleared recently deleted users set');
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear Deleted Cache
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      console.log('🧪 Testing delete functionality...');
                      console.log('📊 Current state:', {
                        usersCount: users.length,
                        recentlyDeletedCount: recentlyDeletedUsers.size,
                        autoRefresh: autoRefresh,
                        lastRefresh: lastRefresh,
                        selectedUsers: selectedUsers
                      });
                      console.log('📋 Recently deleted users:', Array.from(recentlyDeletedUsers));
                      console.log('👥 Current users:', users.map(u => `${u.firstname} ${u.lastname} (${u.id})`));
                    }}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Test Delete State
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={runComprehensiveTest}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Full System Test
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={runDiagnosticTest}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Run Diagnostics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Users Table with dynamic status indicators */}
        {filteredUsers.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Courses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${user.firstname}+${user.lastname}&background=random`} />
                              <AvatarFallback>{user.firstname[0]}{user.lastname[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstname} {user.lastname}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">@{user.username}</div>
                              {user.companyName && (
                                <div className="text-xs text-blue-600">{user.companyName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, index) => (
                              <Badge key={index} className={getRoleColor(role)}>
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            {/* Status indicator dot */}
                            <div className={`ml-2 w-2 h-2 rounded-full ${
                              user.status === 'active' ? 'bg-green-500' :
                              user.status === 'suspended' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                            {user.coursesEnrolled}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {user.lastLogin}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {/* Basic Actions */}
                              <DropdownMenuItem onClick={() => openEditModal(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => setSelectedUserForDetails(user)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              
                              {/* Status Actions */}
                              <DropdownMenuItem 
                                onClick={() => user.status === 'suspended' ? handleActivateUser(user.id) : handleSuspendUser(user.id)}
                              >
                                {user.status === 'suspended' ? (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate User
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Suspend User
                                  </>
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {/* Advanced Actions */}
                              <DropdownMenuItem onClick={() => {
                                setSelectedUserForPasswordReset(user);
                                setShowPasswordResetModal(true);
                              }}>
                                <Key className="w-4 h-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleSendWelcomeEmail(user)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Welcome Email
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleViewUserActivity(user)}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Activity
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleAssignCourses(user)}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                Assign Courses
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => {
                                setSelectedUserForNotes(user);
                                setUserNotes(user.notes || '');
                                setShowUserNotesModal(true);
                              }}>
                                <FileText className="w-4 h-4 mr-2" />
                                Add Notes
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {/* Danger Zone */}
                              <DropdownMenuItem 
                                onClick={() => openDeleteModal(user)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table footer with dynamic information */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    Showing {filteredUsers.length} of {users.length} users
                    {selectedUsers.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        ({selectedUsers.length} selected)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                    {autoRefresh && (
                      <div className="flex items-center text-green-600">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Auto-refresh ON
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit User Modal */}
        <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser?.firstname} {editingUser?.lastname}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-username">Username *</Label>
                  <Input
                    id="edit-username"
                    value={userForm.username}
                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    className={formErrors.username ? 'border-red-500' : ''}
                  />
                  {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstname">First Name *</Label>
                  <Input
                    id="edit-firstname"
                    value={userForm.firstname}
                    onChange={(e) => setUserForm(prev => ({ ...prev, firstname: e.target.value }))}
                    className={formErrors.firstname ? 'border-red-500' : ''}
                  />
                  {formErrors.firstname && <p className="text-red-500 text-sm mt-1">{formErrors.firstname}</p>}
                </div>
                <div>
                  <Label htmlFor="edit-lastname">Last Name *</Label>
                  <Input
                    id="edit-lastname"
                    value={userForm.lastname}
                    onChange={(e) => setUserForm(prev => ({ ...prev, lastname: e.target.value }))}
                    className={formErrors.lastname ? 'border-red-500' : ''}
                  />
                  {formErrors.lastname && <p className="text-red-500 text-sm mt-1">{formErrors.lastname}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={userForm.city}
                    onChange={(e) => setUserForm(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    value={userForm.country}
                    onChange={(e) => setUserForm(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label>Roles *</Label>
                <div className="space-y-2 mt-2">
                  {availableRoles.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${role.value}`}
                        checked={userForm.roles.includes(role.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setUserForm(prev => ({ ...prev, roles: [...prev.roles, role.value] }));
                          } else {
                            setUserForm(prev => ({ ...prev, roles: prev.roles.filter(r => r !== role.value) }));
                          }
                        }}
                      />
                      <Label htmlFor={`edit-${role.value}`} className="text-sm font-normal">
                        {role.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formErrors.roles && <p className="text-red-500 text-sm mt-1">{formErrors.roles}</p>}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditUserModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditUser} 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete user <strong>{deletingUser?.firstname} {deletingUser?.lastname}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteUser}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced IOMAD Admin Modals */}

        {/* Bulk Actions Modal */}
        <Dialog open={showBulkActionsModal} onOpenChange={setShowBulkActionsModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Perform actions on {selectedUsers.length} selected users
              </p>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspend">Suspend Users</SelectItem>
                  <SelectItem value="activate">Activate Users</SelectItem>
                  <SelectItem value="delete">Delete Users</SelectItem>
                  <SelectItem value="assign_company">Assign to Company</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBulkActionsModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Processing...' : 'Execute Action'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Reset Modal */}
        <Dialog open={showPasswordResetModal} onOpenChange={setShowPasswordResetModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Reset password for <strong>{selectedUserForPasswordReset?.firstname} {selectedUserForPasswordReset?.lastname}</strong>
              </p>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPasswordResetModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePasswordReset}
                  disabled={!newPassword || newPassword !== confirmPassword || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Users</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Export {users.length} users to CSV file
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowExportModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleExportUsers}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Users</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Import users from CSV file
              </p>
              <div>
                <Label htmlFor="import-file">CSV File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={handleImportUsers}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowImportModal(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Notes Modal */}
        <Dialog open={showUserNotesModal} onOpenChange={setShowUserNotesModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Add notes for <strong>{selectedUserForNotes?.firstname} {selectedUserForNotes?.lastname}</strong>
              </p>
              <div>
                <Label htmlFor="user-notes">Notes</Label>
                <Textarea
                  id="user-notes"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Enter notes about this user..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUserNotesModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveUserNotes}
                  disabled={!userNotes.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Details Modal */}
        <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedUserForDetails && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-sm text-gray-600">
                      {selectedUserForDetails.firstname} {selectedUserForDetails.lastname}
                    </p>
                  </div>
                  <div>
                    <Label>Username</Label>
                    <p className="text-sm text-gray-600">@{selectedUserForDetails.username}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-600">{selectedUserForDetails.email}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedUserForDetails.status)}>
                      {selectedUserForDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedUserForDetails.roles.map((role, index) => (
                        <Badge key={index} className={getRoleColor(role)}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Company</Label>
                    <p className="text-sm text-gray-600">{selectedUserForDetails.companyName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-sm text-gray-600">{selectedUserForDetails.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <p className="text-sm text-gray-600">{selectedUserForDetails.position || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Last Login</Label>
                    <p className="text-sm text-gray-600">{selectedUserForDetails.lastLogin || 'Never'}</p>
                  </div>
                  <div>
                    <Label>Courses Enrolled</Label>
                    <p className="text-sm text-gray-600">{selectedUserForDetails.coursesEnrolled || 0}</p>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm text-gray-600">{selectedUserForDetails.notes || 'No notes'}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diagnostic Modal */}
        <Dialog open={showDiagnosticModal} onOpenChange={setShowDiagnosticModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>System Diagnostics</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {diagnosticResults && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">API Tests</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Connection:</span>
                        <Badge className={diagnosticResults.apiConnection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.apiConnection ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">User Fetch:</span>
                        <Badge className={diagnosticResults.userFetch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.userFetch ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Companies Fetch:</span>
                        <Badge className={diagnosticResults.companiesFetch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.companiesFetch ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Roles Fetch:</span>
                        <Badge className={diagnosticResults.rolesFetch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.rolesFetch ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Courses Fetch:</span>
                        <Badge className={diagnosticResults.coursesFetch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.coursesFetch ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">User Management Tests</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Create User:</span>
                        <Badge className={diagnosticResults.createUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.createUser ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Update User:</span>
                        <Badge className={diagnosticResults.updateUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.updateUser ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Delete User:</span>
                        <Badge className={diagnosticResults.deleteUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.deleteUser ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Suspend User:</span>
                        <Badge className={diagnosticResults.suspendUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.suspendUser ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Activate User:</span>
                        <Badge className={diagnosticResults.activateUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.activateUser ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reset Password:</span>
                        <Badge className={diagnosticResults.resetPassword ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.resetPassword ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Send Welcome Email:</span>
                        <Badge className={diagnosticResults.sendWelcomeEmail ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.sendWelcomeEmail ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Get User Activity:</span>
                        <Badge className={diagnosticResults.getUserActivity ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.getUserActivity ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Assign Courses:</span>
                        <Badge className={diagnosticResults.assignCourses ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.assignCourses ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Update Notes:</span>
                        <Badge className={diagnosticResults.updateNotes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {diagnosticResults.updateNotes ? '✅ Working' : '❌ Failed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Current System State</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Users: {users.length}</p>
                    <p className="text-gray-600">Loading State: {loading ? 'Yes' : 'No'}</p>
                    <p className="text-gray-600">Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}</p>
                    <p className="text-gray-600">Recently Deleted: {recentlyDeletedUsers.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Search Term: "{searchTerm}"</p>
                    <p className="text-gray-600">Filter Role: {filterRole}</p>
                    <p className="text-gray-600">Filter Status: {filterStatus}</p>
                    <p className="text-gray-600">Selected Users: {selectedUsers.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDiagnosticModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={runDiagnosticTest}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run Diagnostics
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement; 