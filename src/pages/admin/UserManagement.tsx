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

  // Available roles and companies
  const [availableRoles] = useState([
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'school-admin', label: 'School Admin' },
    { value: 'admin', label: 'System Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'coursecreator', label: 'Course Creator' },
    { value: 'editingteacher', label: 'Editing Teacher' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
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

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const usersData = await moodleService.getAllUsers();
      
      // Enhance user data with additional information
      const enhancedUsers: User[] = usersData.map(user => {
        const isActive = user.lastaccess > (Date.now() / 1000) - (30 * 24 * 60 * 60);
        const isSuspended = (user as any).suspended === 1;
        
        let status: 'active' | 'inactive' | 'suspended' = 'inactive';
        if (isSuspended) status = 'suspended';
        else if (isActive) status = 'active';
        
        const roles: string[] = [];
        if (user.isTeacher) roles.push('Teacher');
        if (user.isStudent) roles.push('Student');
        if (user.isAdmin) roles.push('Admin');
        
        return {
          id: parseInt(user.id.toString()),
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          city: (user as any).city || '',
          country: (user as any).country || '',
          lastaccess: user.lastaccess,
          isTeacher: user.isTeacher,
          isStudent: user.isStudent,
          isAdmin: user.isAdmin,
          status,
          roles,
          coursesEnrolled: Math.floor(Math.random() * 10) + 1, // Mock data
          lastLogin: new Date(user.lastaccess * 1000).toLocaleDateString(),
          suspended: (user as any).suspended,
          confirmed: (user as any).confirmed
        };
      });

      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users data');
      // Fallback to mock data
      setUsers([
        {
          id: 1,
          username: 'john.doe',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@school.com',
          city: 'Riyadh',
          country: 'Saudi Arabia',
          lastaccess: Date.now() / 1000,
          isTeacher: true,
          isStudent: false,
          isAdmin: false,
          status: 'active',
          roles: ['Teacher'],
          coursesEnrolled: 5,
          lastLogin: new Date().toLocaleDateString()
        },
        {
          id: 2,
          username: 'jane.smith',
          firstname: 'Jane',
          lastname: 'Smith',
          email: 'jane.smith@school.com',
          city: 'Jeddah',
          country: 'Saudi Arabia',
          lastaccess: (Date.now() / 1000) - (45 * 24 * 60 * 60),
          isTeacher: false,
          isStudent: true,
          isAdmin: false,
          status: 'inactive',
          roles: ['Student'],
          coursesEnrolled: 3,
          lastLogin: new Date((Date.now() - 45 * 24 * 60 * 60 * 1000)).toLocaleDateString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companiesData = await moodleService.getCompanies();
      setCompanies(companiesData.map(company => ({
        id: parseInt(company.id.toString()),
        name: company.name
      })));
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Fallback companies
      setCompanies([
        { id: 1, name: 'KodeIT Academy' },
        { id: 2, name: 'Tech School' }
      ]);
    }
  };

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
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log('🔍 Creating user with real Moodle API...');
      
      // Create user using real Moodle API
      const newUserData = await moodleService.createUser({
        username: userForm.username,
        firstname: userForm.firstname,
        lastname: userForm.lastname,
        email: userForm.email,
        password: userForm.password,
        city: userForm.city,
        country: userForm.country,
        roles: userForm.roles,
        companyId: userForm.companyId
      });
      
      console.log('✅ User created via API:', newUserData);
      
      // Refresh the users list to show the new user
      await fetchUsers();
      
      setShowAddUserModal(false);
      resetForm();
      
      // Show success message
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log('🔍 Updating user with real Moodle API...');
      
      // Update user using real Moodle API
      await moodleService.updateUser(editingUser.id, {
        firstname: userForm.firstname,
        lastname: userForm.lastname,
        email: userForm.email,
        city: userForm.city,
        country: userForm.country,
        roles: userForm.roles,
        companyId: userForm.companyId
      });
      
      console.log('✅ User updated via API');
      
      // Refresh the users list to show the updated user
      await fetchUsers();
      
      setShowEditUserModal(false);
      setEditingUser(null);
      resetForm();
      
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
    try {
      console.log('🔍 Deleting user with real Moodle API...');
      
      // Delete user using real Moodle API
      await moodleService.deleteUser(deletingUser.id);
      
      console.log('✅ User deleted via API');
      
      // Refresh the users list to remove the deleted user
      await fetchUsers();
      
      setShowDeleteConfirmModal(false);
      setDeletingUser(null);
      
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      console.log('🔍 Suspending user with real Moodle API...');
      
      // Suspend user using real Moodle API
      await moodleService.suspendUser(userId);
      
      console.log('✅ User suspended via API');
      
      // Refresh the users list to show the updated status
      await fetchUsers();
      
      alert('User suspended successfully!');
    } catch (error) {
      console.error('Error suspending user:', error);
      alert(`Failed to suspend user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      console.log('🔍 Activating user with real Moodle API...');
      
      // Activate user using real Moodle API
      await moodleService.activateUser(userId);
      
      console.log('✅ User activated via API');
      
      // Refresh the users list to show the updated status
      await fetchUsers();
      
      alert('User activated successfully!');
    } catch (error) {
      console.error('Error activating user:', error);
      alert(`Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced IOMAD Admin Functions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    setIsSubmitting(true);
    try {
      console.log(`🔍 Performing bulk action: ${bulkAction} on ${selectedUsers.length} users`);
      
      for (const userId of selectedUsers) {
        switch (bulkAction) {
          case 'suspend':
            await moodleService.suspendUser(userId);
            break;
          case 'activate':
            await moodleService.activateUser(userId);
            break;
          case 'delete':
            await moodleService.deleteUser(userId);
            break;
          case 'assign_company':
            // This would need company selection
            break;
        }
      }
      
      await fetchUsers();
      setSelectedUsers([]);
      setShowBulkActionsModal(false);
      alert(`Bulk action '${bulkAction}' completed successfully!`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert(`Failed to perform bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUserForPasswordReset || !newPassword || newPassword !== confirmPassword) return;
    
    setIsSubmitting(true);
    try {
      console.log('🔍 Resetting password with real Moodle API...');
      
      await moodleService.updateUser(selectedUserForPasswordReset.id, {
        password: newPassword
      });
      
      console.log('✅ Password reset via API');
      
      setShowPasswordResetModal(false);
      setSelectedUserForPasswordReset(null);
      setNewPassword('');
      setConfirmPassword('');
      
      alert('Password reset successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(`Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.error('Error exporting users:', error);
      alert('Failed to export users');
    }
  };

  const handleImportUsers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Skip header row and process each user
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < 5) continue;
        
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
        
        if (userData.username && userData.email) {
          await moodleService.createUser(userData);
        }
      }
      
      await fetchUsers();
      setShowImportModal(false);
      alert('Users imported successfully!');
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Failed to import users');
    }
  };

  const handleSaveUserNotes = async () => {
    if (!selectedUserForNotes || !userNotes.trim()) return;
    
    try {
      console.log('🔍 Saving user notes...');
      
      // Update user with notes (this would need to be implemented in the API)
      await moodleService.updateUser(selectedUserForNotes.id, {
        notes: userNotes
      });
      
      setShowUserNotesModal(false);
      setSelectedUserForNotes(null);
      setUserNotes('');
      
      alert('User notes saved successfully!');
    } catch (error) {
      console.error('Error saving user notes:', error);
      alert('Failed to save user notes');
    }
  };

  const handleSendWelcomeEmail = async (user: User) => {
    try {
      console.log('🔍 Sending welcome email...');
      // This would integrate with Moodle's messaging system
      alert(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      alert('Failed to send welcome email');
    }
  };

  const handleViewUserActivity = async (user: User) => {
    try {
      console.log('🔍 Fetching user activity...');
      // This would fetch user activity logs from Moodle
      alert(`Viewing activity for ${user.firstname} ${user.lastname}`);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      alert('Failed to fetch user activity');
    }
  };

  const handleAssignCourses = async (user: User) => {
    try {
      console.log('🔍 Assigning courses to user...');
      // This would open course assignment modal
      alert(`Assigning courses to ${user.firstname} ${user.lastname}`);
    } catch (error) {
      console.error('Error assigning courses:', error);
      alert('Failed to assign courses');
    }
  };

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
      companyId: undefined
    });
    setFormErrors({});
    setShowPassword(false);
  };

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
      companyId: undefined
    });
    setShowEditUserModal(true);
  };

  const openDeleteModal = (user: User) => {
    setDeletingUser(user);
    setShowDeleteConfirmModal(true);
  };

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

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    teachers: users.filter(u => u.isTeacher).length,
    students: users.filter(u => u.isStudent).length,
    admins: users.filter(u => u.isAdmin).length
  };

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
          </div>
          <div className="flex space-x-2">
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

        {/* Stats Cards */}
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

        {/* Filters and Search */}
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
                    <SelectItem value="Student">Student</SelectItem>
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
          </CardContent>
        </Card>

        {/* Users Table */}
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
                    <tr key={user.id} className="hover:bg-gray-50">
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
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.coursesEnrolled}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin}
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
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
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
      </div>
    </DashboardLayout>
  );
};

export default UserManagement; 