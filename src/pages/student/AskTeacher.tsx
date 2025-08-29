import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  User,
  ChevronDown,
  Star,
  FileText,
  Video,
  Image,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Users,
  TrendingUp,
  Plus,
  MessageCircle,
  HelpCircle,
  Zap,
  BookmarkPlus,
  GraduationCap,
  Target,
  Award,
  Globe
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  avatar: string;
  rating: number;
  reviews: number;
  isOnline: boolean;
  responseTime: string;
  expertise: string[];
  availability: string;
  languages: string[];
  isAssigned?: boolean;
}

interface Question {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: 'pending' | 'answered' | 'resolved';
  teacherId?: string;
  teacherName?: string;
  createdAt: string;
  updatedAt: string;
  attachments: string[];
  tags: string[];
  priority?: 'low' | 'medium' | 'high';
}

const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    subject: 'Python Programming',
    avatar: '/api/placeholder/100/100',
    rating: 4.9,
    reviews: 127,
    isOnline: true,
    responseTime: 'Usually responds in 2 hours',
    expertise: ['Python', 'Data Science', 'Machine Learning'],
    availability: 'Mon-Fri, 9 AM - 6 PM',
    languages: ['English', 'Spanish'],
    isAssigned: true // This is the student's assigned teacher
  },
  {
    id: '2',
    name: 'Prof. Mike Chen',
    subject: 'Web Development',
    avatar: '/api/placeholder/100/100',
    rating: 4.8,
    reviews: 89,
    isOnline: false,
    responseTime: 'Usually responds in 4 hours',
    expertise: ['React', 'JavaScript', 'Node.js'],
    availability: 'Mon-Sat, 10 AM - 8 PM',
    languages: ['English', 'Mandarin']
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    subject: 'Data Science',
    avatar: '/api/placeholder/100/100',
    rating: 4.9,
    reviews: 156,
    isOnline: true,
    responseTime: 'Usually responds in 1 hour',
    expertise: ['Statistics', 'Machine Learning', 'R'],
    availability: 'Mon-Fri, 8 AM - 5 PM',
    languages: ['English', 'Spanish', 'Portuguese']
  },
  {
    id: '4',
    name: 'Alex Thompson',
    subject: 'Mobile Development',
    avatar: '/api/placeholder/100/100',
    rating: 4.7,
    reviews: 73,
    isOnline: true,
    responseTime: 'Usually responds in 3 hours',
    expertise: ['iOS', 'Android', 'Flutter'],
    availability: 'Mon-Sun, 11 AM - 9 PM',
    languages: ['English']
  },
  {
    id: '5',
    name: 'Prof. David Kim',
    subject: 'Cybersecurity',
    avatar: '/api/placeholder/100/100',
    rating: 4.8,
    reviews: 94,
    isOnline: false,
    responseTime: 'Usually responds in 6 hours',
    expertise: ['Network Security', 'Ethical Hacking', 'Cryptography'],
    availability: 'Mon-Fri, 9 AM - 7 PM',
    languages: ['English', 'Korean']
  }
];

const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to implement recursion in Python?',
    description: 'I\'m having trouble understanding how to write recursive functions in Python. Can someone explain with examples?',
    subject: 'Python Programming',
    status: 'answered',
    teacherId: '1',
    teacherName: 'Dr. Sarah Johnson',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T12:45:00Z',
    attachments: ['recursion_example.py'],
    tags: ['Python', 'Recursion', 'Functions'],
    priority: 'medium'
  },
  {
    id: '2',
    title: 'React hooks best practices',
    description: 'What are the best practices for using React hooks? I want to avoid common pitfalls.',
    subject: 'Web Development',
    status: 'resolved',
    teacherId: '2',
    teacherName: 'Prof. Mike Chen',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    attachments: ['hooks_example.jsx'],
    tags: ['React', 'Hooks', 'Best Practices'],
    priority: 'high'
  },
  {
    id: '3',
    title: 'Machine learning model evaluation',
    description: 'How do I properly evaluate my machine learning model? What metrics should I use?',
    subject: 'Data Science',
    status: 'pending',
    createdAt: '2024-01-16T08:45:00Z',
    updatedAt: '2024-01-16T08:45:00Z',
    attachments: ['model_results.csv'],
    tags: ['Machine Learning', 'Evaluation', 'Metrics'],
    priority: 'low'
  }
];

const subjects = [
  'All Subjects',
  'Python Programming',
  'Web Development',
  'Data Science',
  'Mobile Development',
  'Cybersecurity',
  'Artificial Intelligence',
  'Database Design',
  'UI/UX Design'
];

const priorities = [
  { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' }
];

const AskTeacher: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [activeTab, setActiveTab] = useState<'assigned' | 'teachers' | 'questions'>('assigned');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [onlineTeachers, setOnlineTeachers] = useState<Teacher[]>([]);
  
  // Question form state
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDescription, setQuestionDescription] = useState('');
  const [questionSubject, setQuestionSubject] = useState('');
  const [questionPriority, setQuestionPriority] = useState('medium');
  const [questionTags, setQuestionTags] = useState('');

  // Get assigned teacher
  const assignedTeacher = mockTeachers.find(teacher => teacher.isAssigned);

  const filteredTeachers = mockTeachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All Subjects' || teacher.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const filteredQuestions = mockQuestions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All Subjects' || question.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'answered': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'answered': return <MessageSquare className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'recent':
        setRecentQuestions(mockQuestions.slice(0, 2));
        setActiveTab('questions');
        break;
      case 'online':
        setOnlineTeachers(mockTeachers.filter(teacher => teacher.isOnline));
        setActiveTab('teachers');
        break;
      case 'new':
        if (assignedTeacher) {
          setSelectedTeacher(assignedTeacher);
          setShowQuestionForm(true);
        } else {
          setShowQuestionForm(true);
        }
        break;
      case 'help':
        setSelectedSubject('All Subjects');
        break;
      default:
        break;
    }
  };

  const handleSubmitQuestion = () => {
    if (!questionTitle || !questionDescription || !questionSubject) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, this would submit to the backend
    console.log('Submitting question:', {
      title: questionTitle,
      description: questionDescription,
      subject: questionSubject,
      priority: questionPriority,
      tags: questionTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      teacherId: selectedTeacher?.id
    });

    // Reset form
    setQuestionTitle('');
    setQuestionDescription('');
    setQuestionSubject('');
    setQuestionPriority('medium');
    setQuestionTags('');
    setShowQuestionForm(false);
    setSelectedTeacher(null);
  };

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ask Teacher</h1>
            <p className="text-gray-600 mt-1">Get help from your instructors and experts</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              className="flex items-center space-x-2"
              onClick={() => {
                if (assignedTeacher) {
                  setSelectedTeacher(assignedTeacher);
                  setShowQuestionForm(true);
                } else {
                  setShowQuestionForm(true);
                }
              }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask My Teacher</span>
            </Button>
          </div>
        </div>

        {/* Assigned Teacher Section */}
        {assignedTeacher && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>My Assigned Teacher</span>
                <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
              </CardTitle>
              <CardDescription>Your dedicated instructor for personalized support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{assignedTeacher.name}</h3>
                    <p className="text-gray-600">{assignedTeacher.subject}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(assignedTeacher.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{assignedTeacher.rating} ({assignedTeacher.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-1 ${assignedTeacher.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span>{assignedTeacher.isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{assignedTeacher.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    className="flex items-center space-x-2"
                    onClick={() => {
                      setSelectedTeacher(assignedTeacher);
                      setShowQuestionForm(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ask Question</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedTeacher(assignedTeacher);
                      setShowChat(true);
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Quick access to common teacher interaction features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('recent')}
              >
                <MessageCircle className="w-6 h-6 mb-2" />
                <span className="text-sm">Recent Questions</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('online')}
              >
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Online Teachers</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('new')}
              >
                <Plus className="w-6 h-6 mb-2" />
                <span className="text-sm">Ask New Question</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('help')}
              >
                <HelpCircle className="w-6 h-6 mb-2" />
                <span className="text-sm">Help Topics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardContent className="p-1">
            <div className="flex">
              <Button
                variant={activeTab === 'assigned' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('assigned')}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>My Teacher</span>
                </div>
              </Button>
              <Button
                variant={activeTab === 'teachers' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('teachers')}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>All Teachers</span>
                </div>
              </Button>
              <Button
                variant={activeTab === 'questions' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('questions')}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>My Questions</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={activeTab === 'assigned' ? 'Search your teacher...' : activeTab === 'teachers' ? 'Search teachers or subjects...' : 'Search your questions...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === 'assigned' && assignedTeacher ? (
          <div className="space-y-6">
            {/* Teacher Details Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">{assignedTeacher.name}</h3>
                      <p className="text-lg text-gray-600">{assignedTeacher.subject}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < Math.floor(assignedTeacher.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{assignedTeacher.rating} ({assignedTeacher.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${assignedTeacher.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {assignedTeacher.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {assignedTeacher.expertise.map(skill => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{assignedTeacher.availability}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{assignedTeacher.responseTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        <span>Languages: {assignedTeacher.languages.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <Button 
                    className="flex items-center space-x-2"
                    onClick={() => {
                      setSelectedTeacher(assignedTeacher);
                      setShowQuestionForm(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ask a Question</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedTeacher(assignedTeacher);
                      setShowChat(true);
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Start Chat</span>
                  </Button>
                  <Button variant="ghost">
                    <Award className="w-4 h-4" />
                    <span>View Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Questions with Assigned Teacher */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Questions to {assignedTeacher.name}</CardTitle>
                <CardDescription>Your recent interactions with your assigned teacher</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockQuestions.filter(q => q.teacherId === assignedTeacher.id).map(question => (
                    <div key={question.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{question.title}</h4>
                          <Badge className={getStatusColor(question.status)}>
                            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                          </Badge>
                          <Badge className={getPriorityColor(question.priority || 'medium')}>
                            {question.priority?.charAt(0).toUpperCase() + question.priority?.slice(1)} Priority
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{question.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatDate(question.createdAt)}</span>
                          <span>•</span>
                          <span>{question.subject}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'teachers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => (
              <Card key={teacher.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <CardContent className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                        <p className="text-sm text-gray-600">{teacher.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${teacher.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">{teacher.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(teacher.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{teacher.rating}</span>
                    <span className="text-sm text-gray-500">({teacher.reviews} reviews)</span>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{teacher.responseTime}</span>
                  </div>

                  {/* Expertise */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {teacher.expertise.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{teacher.availability}</span>
                  </div>
                </CardContent>

                {/* Actions */}
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setShowQuestionForm(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask Question
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                        <Badge className={getStatusColor(question.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(question.status)}
                            <span>{question.status.charAt(0).toUpperCase() + question.status.slice(1)}</span>
                          </div>
                        </Badge>
                        {question.priority && (
                          <Badge className={getPriorityColor(question.priority)}>
                            {question.priority.charAt(0).toUpperCase() + question.priority.slice(1)} Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{question.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>{question.subject}</span>
                        <span>•</span>
                        <span>{formatDate(question.createdAt)}</span>
                        {question.teacherName && (
                          <>
                            <span>•</span>
                            <span>Answered by {question.teacherName}</span>
                          </>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Attachments */}
                      {question.attachments.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                          <Paperclip className="w-4 h-4" />
                          <span>{question.attachments.length} attachment(s)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                      {question.status === 'answered' && (
                        <Button variant="ghost" size="sm">
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {activeTab === 'assigned' && !assignedTeacher && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned teacher</h3>
              <p className="text-gray-600">You don't have an assigned teacher yet. Contact your administrator to get assigned to a teacher.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'teachers' && filteredTeachers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600">Try adjusting your search or filters to find available teachers.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'questions' && filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">You haven't asked any questions yet. Start by asking a teacher for help!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ask a Question</h3>
                    {selectedTeacher && (
                      <p className="text-sm text-gray-600">To {selectedTeacher.name} - {selectedTeacher.subject}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setSelectedTeacher(null);
                    setQuestionTitle('');
                    setQuestionDescription('');
                    setQuestionSubject('');
                    setQuestionPriority('medium');
                    setQuestionTags('');
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Question Form */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="Brief description of your question..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={questionSubject}
                  onChange={(e) => setQuestionSubject(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a subject</option>
                  {subjects.slice(1).map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={questionPriority}
                  onChange={(e) => setQuestionPriority(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Description *
                </label>
                <textarea
                  value={questionDescription}
                  onChange={(e) => setQuestionDescription(e.target.value)}
                  placeholder="Provide detailed information about your question..."
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={questionTags}
                  onChange={(e) => setQuestionTags(e.target.value)}
                  placeholder="e.g., Python, Recursion, Functions"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach Files
                </Button>
                <Button variant="ghost" size="sm">
                  <Image className="w-4 h-4 mr-2" />
                  Add Screenshot
                </Button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setSelectedTeacher(null);
                    setQuestionTitle('');
                    setQuestionDescription('');
                    setQuestionSubject('');
                    setQuestionPriority('medium');
                    setQuestionTags('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitQuestion}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTeacher.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTeacher.subject}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => setShowChat(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-6 h-96 overflow-y-auto">
              <div className="text-center text-gray-500 text-sm">
                Start a conversation with {selectedTeacher.name}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AskTeacher;

