import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Edit, Trash2, Mail, Phone, MapPin, Calendar, Award, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { moodleService } from '../../services/moodleApi';

interface Teacher {
  id: string;
  username: string;
  fullname: string;
  email: string;
  lastaccess?: number;
  role: string;
  courses?: number;
  students?: number;
  performance?: number;
  assignedCourses?: any[];
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching teachers using enhanced school data...');
      
      // Use enhanced school data fetching
      const schoolData = await moodleService.getSchoolDataEnhanced();
      console.log('📊 Enhanced school data:', schoolData);
      
      if (!schoolData.company) {
        console.error('❌ No company found');
        setTeachers([]);
        setLoading(false);
        return;
      }
      
      // Transform the data to match the component's expected format
      const teacherUsers = schoolData.teachers.map(teacher => ({
        id: teacher.id,
        username: teacher.username,
        fullname: teacher.fullname,
        email: teacher.email,
        lastaccess: teacher.lastaccess,
        role: teacher.role,
        courses: teacher.courses || 0,
        students: teacher.students || 0,
        performance: teacher.performance || 0,
        assignedCourses: teacher.assignedCourses || []
      }));

      console.log(`✅ Found ${teacherUsers.length} teachers for company ${schoolData.company.name}`);
      setTeachers(teacherUsers);
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || teacher.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const EmptyState = () => (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
      <p className="text-gray-500">No teacher data available from Moodle/Iomad API</p>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userRole="school_admin" userName="School Administrator">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading teachers...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="school_admin" userName="School Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">School Teachers Management</h1>
            <p className="text-gray-600 mt-1">Manage and monitor teachers in your school</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={async () => {
                try {
                  console.log('🧪 Starting comprehensive debug test for teachers...');
                  
                  // Test 0: Basic API connection
                  console.log('🧪 Test 0: Testing basic API connection...');
                  try {
                    const siteInfoResponse = await moodleService.testApiConnection();
                    console.log('✅ API connection test completed');
                  } catch (error) {
                    console.error('❌ API connection failed:', error);
                  }
                  
                  // Test 0.5: Check current user data
                  console.log('🧪 Test 0.5: Checking current user data...');
                  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                  console.log('📋 Current user from localStorage:', currentUser);
                  
                  // Test 1: Get current user company
                  const currentUserCompany = await moodleService.getCurrentUserCompany();
                  console.log('🏢 Current user company:', currentUserCompany);
                  
                  if (!currentUserCompany) {
                    alert('No company found for current user');
                    return;
                  }
                  
                  // Test 2: Get all users
                  console.log('🧪 Test 2: Getting all users...');
                  const allUsers = await moodleService.getAllUsers();
                  console.log(`✅ Total users: ${allUsers.length}`);
                  
                  // Test 3: Get company users
                  console.log('🧪 Test 3: Getting company users...');
                  const companyUsers = await moodleService.getUsersByCompany(currentUserCompany.id);
                  console.log(`✅ Company users: ${companyUsers.length}`, companyUsers);
                  
                  // Test 4: Get teachers
                  console.log('🧪 Test 4: Getting teachers...');
                  const teachers = await moodleService.getTeachersByCompany(currentUserCompany.id);
                  console.log(`✅ Teachers: ${teachers.length}`, teachers);
                  
                  // Test 5: Get real teacher data
                  console.log('🧪 Test 5: Getting real teacher data...');
                  const realTeacherData = await moodleService.getRealTeacherDataByCompany(currentUserCompany.id);
                  console.log(`✅ Real teacher data: ${realTeacherData.length}`, realTeacherData);
                  
                  alert(`Debug test completed! Check console for details.\nCompany: ${currentUserCompany.name}\nTotal Users: ${allUsers.length}\nCompany Users: ${companyUsers.length}\nTeachers: ${teachers.length}\nReal Teacher Data: ${realTeacherData.length}`);
                  
                } catch (error) {
                  console.error('Debug test failed:', error);
                  alert(`Debug test failed: ${error.message}`);
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>Debug API</span>
            </button>
            
            <button 
              onClick={async () => {
                console.log('🔍 Running full diagnostic for Teachers page...');
                const diagnostic = await moodleService.runFullDiagnostic();
                console.log('Full diagnostic result:', diagnostic);
                
                // Show results in an alert for easy viewing
                const summary = diagnostic.summary;
                const issues = diagnostic.results.specificIssues;
                let message = `Teachers Page Diagnostic:\n\nTests Passed: ${summary.passedTests}/${summary.totalTests}\nSuccess Rate: ${summary.successRate}%\n\n`;
                
                if (issues.length > 0) {
                  message += 'Issues Found:\n';
                  issues.forEach((issue, index) => {
                    message += `${index + 1}. ${issue}\n`;
                  });
                } else {
                  message += '✅ All tests passed!';
                }
                
                alert(message);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <span>Full Diagnostic</span>
            </button>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Teachers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{teachers.length}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Teachers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {teachers.filter(t => t.lastaccess && Date.now() / 1000 - t.lastaccess < 86400).length}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Courses</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {teachers.reduce((sum, t) => sum + (t.courses || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg Performance</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + (t.performance || 0), 0) / teachers.length) : 0}%
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="teacher">Teacher</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredTeachers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{teacher.fullname.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{teacher.fullname}</div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          teacher.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {teacher.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.courses}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.students}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${teacher.performance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{teacher.performance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.lastaccess ? new Date(teacher.lastaccess * 1000).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Teachers; 