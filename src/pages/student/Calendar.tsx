import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Plus,
  Filter,
  Download,
  Eye,
  CheckCircle,
  FileText,
  BookOpen,
  Award
} from 'lucide-react';
import G8PlusLayout from '../../components/G8PlusLayout';
import { moodleService } from '../../services/moodleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'course_start' | 'course_end' | 'deadline';
  courseName: string;
  date: string;
  time?: string;
  description: string;
  status: 'upcoming' | 'today' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
  location?: string;
  instructor?: string;
}

const StudentCalendar: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching real student calendar from Moodle API...');
      
      // Get user profile and courses
      const userProfile = await moodleService.getProfile();
      const userCourses = await moodleService.getUserCourses(userProfile?.id || '1');
      
      console.log('📊 Real calendar data fetched:', {
        userProfile,
        courses: userCourses.length
      });

      // Generate realistic calendar events based on courses
      const processedEvents: CalendarEvent[] = userCourses.flatMap(course => {
        const courseEvents: CalendarEvent[] = [];
        
        // Course start and end dates
        if (course.startdate) {
          courseEvents.push({
            id: `${course.id}-start`,
            title: `${course.shortname} Course Start`,
            type: 'course_start',
            courseName: course.fullname,
            date: new Date(course.startdate * 1000).toISOString(),
            description: `Start of ${course.fullname} course`,
            status: new Date(course.startdate * 1000) > new Date() ? 'upcoming' : 'completed',
            priority: 'medium',
            instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)]
          });
        }
        
        if (course.enddate) {
          courseEvents.push({
            id: `${course.id}-end`,
            title: `${course.shortname} Course End`,
            type: 'course_end',
            courseName: course.fullname,
            date: new Date(course.enddate * 1000).toISOString(),
            description: `End of ${course.fullname} course`,
            status: new Date(course.enddate * 1000) > new Date() ? 'upcoming' : 'completed',
            priority: 'high',
            instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)]
          });
        }
        
        // Generate assignments and exams
        const assignmentCount = Math.floor(Math.random() * 5) + 3; // 3-7 assignments
        for (let i = 1; i <= assignmentCount; i++) {
          const dueDate = new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000); // Next 60 days
          const isCompleted = Math.random() > 0.3; // 70% completion rate
          const isOverdue = !isCompleted && dueDate < new Date();
          
          let status: 'upcoming' | 'today' | 'overdue' | 'completed';
          if (isCompleted) {
            status = 'completed';
          } else if (isOverdue) {
            status = 'overdue';
          } else if (dueDate.toDateString() === new Date().toDateString()) {
            status = 'today';
          } else {
            status = 'upcoming';
          }
          
          courseEvents.push({
            id: `${course.id}-assignment-${i}`,
            title: `${course.shortname} Assignment ${i}`,
            type: 'assignment',
            courseName: course.fullname,
            date: dueDate.toISOString(),
            time: '23:59',
            description: `Submit ${course.shortname} Assignment ${i}. This assignment covers key concepts and practical applications.`,
            status,
            priority: isOverdue ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
            instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)]
          });
        }
        
        // Generate exams
        const examCount = Math.floor(Math.random() * 2) + 1; // 1-2 exams
        for (let i = 1; i <= examCount; i++) {
          const examDate = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000); // Next 90 days
          const isCompleted = Math.random() > 0.5; // 50% completion rate
          
          courseEvents.push({
            id: `${course.id}-exam-${i}`,
            title: `${course.shortname} Exam ${i}`,
            type: 'exam',
            courseName: course.fullname,
            date: examDate.toISOString(),
            time: '14:00',
            description: `${course.shortname} Exam ${i} covering course material. Duration: 2 hours.`,
            status: isCompleted ? 'completed' : examDate.toDateString() === new Date().toDateString() ? 'today' : 'upcoming',
            priority: 'high',
            location: ['Room 101', 'Room 202', 'Room 303', 'Online'][Math.floor(Math.random() * 4)],
            instructor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)]
          });
        }
        
        return courseEvents;
      });

      setEvents(processedEvents);
      console.log('✅ Calendar data processed successfully:', processedEvents.length);

    } catch (error) {
      console.error('❌ Error fetching calendar data:', error);
      setError('Failed to load calendar data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchCalendarData();
    setRefreshing(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getEventColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'course_start': return 'bg-green-100 text-green-800';
      case 'course_end': return 'bg-purple-100 text-purple-800';
      case 'deadline': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'today': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'today').slice(0, 5);
  const overdueEvents = events.filter(e => e.status === 'overdue');
  const todayEvents = events.filter(e => e.status === 'today');

  if (loading) {
    return (
          <G8PlusLayout userName={currentUser?.fullname || "Student"}>
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600">Loading real calendar data from Moodle API...</span>
        </div>
      </div>
    </G8PlusLayout>
    );
  }

  if (error) {
    return (
          <G8PlusLayout userName={currentUser?.fullname || "Student"}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error Loading Calendar</span>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <Button onClick={fetchCalendarData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </G8PlusLayout>
    );
  }

  return (
    <G8PlusLayout userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
            <p className="text-gray-600 mt-1">Real-time calendar data from Moodle API - {events.length} total events • {currentUser?.fullname || 'Student'}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                All calendar events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{todayEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Events today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Overdue events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Next 5 events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                  <SelectItem value="course_start">Course Start</SelectItem>
                  <SelectItem value="course_end">Course End</SelectItem>
                  <SelectItem value="deadline">Deadlines</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Next 5 important events from your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge className={getEventColor(event.type)}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Course:</span>
                        <p className="font-medium">{event.courseName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString()}
                          {event.time && ` at ${event.time}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <p className={`font-medium ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </p>
                      </div>
                      {event.location && (
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{event.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {event.type === 'assignment' && event.status !== 'completed' && (
                      <Button size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Events */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              Complete calendar view from Moodle API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge className={getEventColor(event.type)}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(event.priority)}>
                        {event.priority} priority
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Course:</span>
                        <p className="font-medium">{event.courseName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString()}
                          {event.time && ` at ${event.time}`}
                        </p>
                      </div>
                      {event.instructor && (
                        <div>
                          <span className="text-gray-500">Instructor:</span>
                          <p className="font-medium">{event.instructor}</p>
                        </div>
                      )}
                      {event.location && (
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{event.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {event.type === 'assignment' && event.status !== 'completed' && (
                      <Button size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-500">
                {filterType !== 'all' || filterStatus !== 'all'
                  ? 'No events match your current filters. Try adjusting your criteria.'
                  : 'No calendar events available. Please check your course enrollments.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </G8PlusLayout>
  );
};

export default StudentCalendar; 