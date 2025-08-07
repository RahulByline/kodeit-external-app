import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Filter
} from 'lucide-react';
import { moodleService } from '@/services/moodleApi';
import { useAuth } from '@/context/AuthContext';

interface CalendarEvent {
  id: string | number;
  title: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'deadline';
  startDate: string;
  endDate: string;
  courseName?: string;
  description?: string;
  location?: string;
  attendees?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'overdue';
  courseId?: string;
  assignmentId?: string;
  priority?: 'low' | 'medium' | 'high';
}

const TeacherCalendar: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching teacher calendar events from IOMAD API...');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 Current user ID:', currentUser?.id);
      
      // Use the new real calendar data fetching method
      const calendarEvents = await moodleService.getTeacherCalendarEvents(currentUser?.id);
      
      console.log('📊 Calendar API Response:', {
        totalEvents: calendarEvents.length,
        eventTypes: calendarEvents.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      console.log('✅ Processed calendar events:', calendarEvents.length);
      console.log('📅 Sample events:', calendarEvents.slice(0, 3));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('❌ Error fetching calendar data:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-yellow-100 text-yellow-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'deadline': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate > now && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3);
  };

  const getHighPriorityEvents = () => {
    return events
      .filter(event => event.priority === 'high' && new Date(event.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading calendar...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Welcome {currentUser?.firstname || "Teacher"}, manage your schedule and upcoming events</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calendar</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrentDate(newDate);
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      <Home className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentDate(newDate);
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 text-sm">
                    Calendar view showing all your scheduled events, classes, and deadlines
                  </p>
                  <div className="mt-4 grid grid-cols-7 gap-1 text-xs">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 font-medium text-gray-500">{day}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                      date.setDate(date.getDate() + i - date.getDay());
                      const dayEvents = getEventsForDate(date);
                      return (
                        <div
                          key={i}
                          className={`p-2 border border-gray-200 bg-white min-h-[60px] cursor-pointer hover:bg-gray-50 ${
                            date.toDateString() === selectedDate.toDateString() ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="text-sm font-medium">{date.getDate()}</div>
                          {dayEvents.length > 0 && (
                            <div className="mt-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Next 5 scheduled events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingEvents().map((event) => (
                    <div key={event.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.startDate).toLocaleDateString()} at {formatTime(event.startDate)}
                          </p>
                          {event.courseName && (
                            <p className="text-xs text-blue-600 mt-1">{event.courseName}</p>
                          )}
                          {event.priority && (
                            <Badge className={`${getPriorityColor(event.priority)} text-xs mt-1`}>
                              {event.priority} priority
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Badge>
                          {event.priority === 'high' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getUpcomingEvents().length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* High Priority Reminders */}
            {getHighPriorityEvents().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">High Priority Reminders</CardTitle>
                  <CardDescription>Urgent deadlines and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getHighPriorityEvents().map((event) => (
                      <div key={event.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-red-800">{event.title}</h4>
                            <p className="text-xs text-red-600 mt-1">
                              {new Date(event.startDate).toLocaleDateString()} at {formatTime(event.startDate)}
                            </p>
                            {event.courseName && (
                              <p className="text-xs text-red-700 mt-1">{event.courseName}</p>
                            )}
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Events */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Events</CardTitle>
                <CardDescription>Events scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getEventsForDate(new Date()).map((event) => (
                    <div key={event.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {event.location}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {getEventsForDate(new Date()).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No events scheduled for today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Events List */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>Complete list of all scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                        {event.type === 'class' && <Users className="w-4 h-4" />}
                        {event.type === 'assignment' && <FileText className="w-4 h-4" />}
                        {event.type === 'exam' && <AlertCircle className="w-4 h-4" />}
                        {event.type === 'meeting' && <Users className="w-4 h-4" />}
                        {event.type === 'deadline' && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(event.startDate).toLocaleDateString()} at {formatTime(event.startDate)}
                        </p>
                        {event.courseName && (
                          <p className="text-xs text-blue-600">{event.courseName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                      {event.attendees && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No events found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherCalendar; 