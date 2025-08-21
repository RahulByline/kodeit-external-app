import React, { useState, useEffect } from 'react';
import { Award, Search, Plus, Star, Users, BookOpen, Calendar, MapPin, Mail, Phone, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import { moodleService } from '@/services/moodleApi';

interface MasterTrainer {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  city?: string;
  country?: string;
  specialization: string[];
  certificationDate: string;
  experienceYears: number;
  coursesTaught: number;
  studentsTrained: number;
  successRate: number;
  rating: number;
  status: 'active' | 'inactive' | 'certified';
  achievements: string[];
  lastTraining?: string;
}

const MasterTrainers: React.FC = () => {
  const [masterTrainers, setMasterTrainers] = useState<MasterTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'certified'>('all');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');

  useEffect(() => {
    fetchMasterTrainers();
  }, []);

  const fetchMasterTrainers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real master trainers from Moodle API...');
      
      // Get real master trainers data
      const realMasterTrainers = await moodleService.getRealMasterTrainers();
      
      console.log('📊 Real master trainers data fetched:', {
        trainers: realMasterTrainers.length
      });

      // Transform to component interface
      const processedTrainers: MasterTrainer[] = realMasterTrainers.map(trainer => ({
        id: trainer.id,
        username: trainer.username,
        firstname: trainer.firstname,
        lastname: trainer.lastname,
        email: trainer.email,
        city: trainer.city,
        country: trainer.country,
        specialization: trainer.specialization,
        certificationDate: trainer.certificationDate,
        experienceYears: trainer.experienceYears,
        coursesTaught: trainer.coursesTaught,
        studentsTrained: trainer.studentsTrained,
        successRate: trainer.successRate,
        rating: trainer.rating,
        status: trainer.status as 'active' | 'inactive' | 'certified',
        achievements: trainer.achievements,
        lastTraining: trainer.lastTraining
      }));

      setMasterTrainers(processedTrainers);
      console.log('✅ Master trainers processed successfully:', processedTrainers.length);
      
    } catch (error) {
      console.error('❌ Error fetching master trainers:', error);
      setError('Failed to load master trainers data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = masterTrainers.filter(trainer => {
    const matchesSearch = 
      trainer.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || trainer.status === filterStatus;
    const matchesSpecialization = filterSpecialization === 'all' || 
      trainer.specialization.includes(filterSpecialization);
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const stats = {
    total: masterTrainers.length,
    certified: masterTrainers.filter(t => t.status === 'certified').length,
    active: masterTrainers.filter(t => t.status === 'active').length,
    totalStudentsTrained: masterTrainers.reduce((sum, t) => sum + t.studentsTrained, 0),
    averageSuccessRate: Math.round(masterTrainers.reduce((sum, t) => sum + t.successRate, 0) / masterTrainers.length) || 0,
    averageRating: Math.round(masterTrainers.reduce((sum, t) => sum + t.rating, 0) / masterTrainers.length) || 0
  };

  const specializations = [
    'Programming & Development',
    'Data Science & Analytics',
    'Digital Marketing',
    'Project Management',
    'Leadership & Management',
    'STEM Education',
    'Language Teaching',
    'Creative Arts'
  ];

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName="Admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading real master trainers from Moodle API...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Master Trainers</h1>
            <p className="text-gray-600 mt-1">Real master trainers data from Moodle API - {masterTrainers.length} trainers</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Master Trainer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trainers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Certified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.certified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students Trained</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudentsTrained.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageSuccessRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
                    placeholder="Search master trainers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'certified' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('certified')}
                >
                  Certified
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Master Trainers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => (
            <Card key={trainer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {trainer.firstname} {trainer.lastname}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{trainer.email}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={trainer.status === 'certified' ? 'default' : 'secondary'}>
                      {trainer.status === 'certified' ? 'Certified' : trainer.status}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900 ml-1">{trainer.rating}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {trainer.city}, {trainer.country}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specialization.map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Experience</p>
                    <p className="font-semibold text-gray-900">{trainer.experienceYears} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Courses Taught</p>
                    <p className="font-semibold text-gray-900">{trainer.coursesTaught}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Students Trained</p>
                    <p className="font-semibold text-gray-900">{trainer.studentsTrained}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Success Rate</p>
                    <p className="font-semibold text-green-600">{trainer.successRate}%</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium text-gray-900">{trainer.successRate}%</span>
                  </div>
                  <Progress value={trainer.successRate} className="h-2" />
                </div>
                
                {trainer.achievements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Achievements:</p>
                    <div className="space-y-1">
                      {trainer.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Certified:</span>
                    <span className="text-gray-900">{trainer.certificationDate}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Last Training:</span>
                    <span className="text-gray-900">{trainer.lastTraining}</span>
                  </div>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <Button size="sm" variant="outline">
                    <Mail className="w-3 h-3 mr-1" />
                    Contact
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <BookOpen className="w-3 h-3 mr-1" />
                    View Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrainers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No master trainers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MasterTrainers; 