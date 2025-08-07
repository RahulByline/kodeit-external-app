import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus,
  BookOpen,
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';
import { useAuth } from '@/context/AuthContext';

interface MoodleGroup {
  id: string;
  name: string;
  description?: string;
  courseid: string;
  members?: {
    id: string;
    fullname: string;
    email: string;
  }[];
}

interface Course {
  id: string;
  fullname: string;
  shortname: string;
}

const TeacherGroups: React.FC = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<MoodleGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    courseId: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const fetchGroupsData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching groups data from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      // Fetch teacher's courses and groups
      const [teacherCourses] = await Promise.all([
        moodleService.getTeacherCourses(currentUser?.id)
      ]);

      setCourses(teacherCourses);

      // Fetch groups for each course
      const groupsPromises = teacherCourses.map(async (course) => {
        try {
          const groups = await moodleService.getCourseGroupsWithMembers(course.id);
          return groups.map((group: any) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            courseid: course.id,
            members: group.members || []
          }));
        } catch (error) {
          console.error(`❌ Error fetching groups for course ${course.id}:`, error);
          return [];
        }
      });

      const allGroups = await Promise.all(groupsPromises);
      const flatGroups = allGroups.flat();
      setGroups(flatGroups);

      console.log('📊 Groups data fetched:', {
        courses: teacherCourses.length,
        groups: flatGroups.length
      });

    } catch (error) {
      console.error('❌ Error fetching groups data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      if (!newGroupData.courseId || !newGroupData.name) {
        alert('Please fill in all required fields');
        return;
      }

      console.log('🔄 Creating new group:', newGroupData);
      
      const result = await moodleService.createCourseGroup(
        newGroupData.courseId,
        newGroupData.name,
        newGroupData.description
      );

      console.log('✅ Group created:', result);
      
      // Refresh groups data
      await fetchGroupsData();
      
      // Reset form
      setNewGroupData({ courseId: '', name: '', description: '' });
      setShowCreateForm(false);
      
    } catch (error) {
      console.error('❌ Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleAddMembersToGroup = async (groupId: string, userIds: string[]) => {
    try {
      console.log('🔄 Adding members to group:', groupId, userIds);
      
      const result = await moodleService.addUsersToGroup(groupId, userIds);
      
      console.log('✅ Members added:', result);
      
      // Refresh groups data
      await fetchGroupsData();
      
    } catch (error) {
      console.error('❌ Error adding members to group:', error);
      alert('Failed to add members to group. Please try again.');
    }
  };

  const handleEnrollUsersInCourse = async (courseId: string, userIds: string[]) => {
    try {
      console.log('🔄 Enrolling users in course:', courseId, userIds);
      
      const result = await moodleService.enrollUsersInCourse(courseId, userIds);
      
      console.log('✅ Users enrolled:', result);
      
      // Refresh groups data
      await fetchGroupsData();
      
    } catch (error) {
      console.error('❌ Error enrolling users in course:', error);
      alert('Failed to enroll users in course. Please try again.');
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || group.courseid === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.fullname || courseId;
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading groups...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
            <p className="text-gray-600 mt-1">Welcome {currentUser?.firstname || "Teacher"}, manage course groups and members</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.shortname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Groups</CardTitle>
            <CardDescription>Manage groups and their members across your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredGroups.length > 0 ? (
              <div className="space-y-6">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 inline mr-1" />
                            {getCourseName(group.courseid)}
                          </span>
                          <span className="text-sm text-gray-600">
                            <Users className="w-4 h-4 inline mr-1" />
                            {group.members?.length || 0} members
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add Members
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Group Members */}
                    {group.members && group.members.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700 text-sm">Group Members:</h4>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {group.members.map((member) => (
                            <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-green-600">
                                  {member.fullname.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{member.fullname}</p>
                                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No members in this group</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No groups found</p>
                <p className="text-sm text-gray-400 mt-2">Create your first group to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Group Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <Select value={newGroupData.courseId} onValueChange={(value) => setNewGroupData({...newGroupData, courseId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.shortname} - {course.fullname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <Input
                    value={newGroupData.name}
                    onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <Textarea
                    value={newGroupData.description}
                    onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherGroups; 