import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Activity, Target, Clock, Calendar, CheckCircle, Play, FileText, Code } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

const Activities: React.FC = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading activities data
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          title: "Programming Challenge: Hello World",
          type: "assignment",
          description: "Create your first program that prints 'Hello World'",
          duration: "30 min",
          points: 50,
          status: "pending",
          dueDate: "2024-01-15",
          course: "Computer Science Fundamentals"
        },
        {
          id: 2,
          title: "Quiz: Variables and Data Types",
          type: "quiz",
          description: "Test your knowledge of programming variables",
          duration: "20 min",
          points: 30,
          status: "completed",
          dueDate: "2024-01-10",
          course: "Computer Science Fundamentals"
        },
        {
          id: 3,
          title: "Interactive Coding Exercise",
          type: "activity",
          description: "Practice coding with interactive exercises",
          duration: "45 min",
          points: 75,
          status: "overdue",
          dueDate: "2024-01-08",
          course: "Computer Science Fundamentals"
        },
        {
          id: 4,
          title: "Group Project: Simple Calculator",
          type: "project",
          description: "Work with classmates to build a calculator",
          duration: "120 min",
          points: 100,
          status: "pending",
          dueDate: "2024-01-20",
          course: "Computer Science Fundamentals"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-5 h-5" />;
      case 'quiz':
        return <Target className="w-5 h-5" />;
      case 'activity':
        return <Activity className="w-5 h-5" />;
      case 'project':
        return <Code className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-600';
      case 'quiz':
        return 'bg-purple-100 text-purple-600';
      case 'activity':
        return 'bg-green-100 text-green-600';
      case 'project':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getButtonColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'pending':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'overdue':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700';
    }
  };

  return (
    <DashboardLayout 
      userRole="student" 
      userName={currentUser?.fullname || "Student"}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activities</h1>
          <p className="text-gray-600">Complete assignments, quizzes, and interactive exercises</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{activity.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span className="font-medium text-blue-600">{activity.points} pts</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {activity.dueDate}</span>
                  </div>
                  <span className="text-sm text-gray-500">{activity.course}</span>
                </div>
                
                <button 
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonColor(activity.status)}`}
                >
                  {activity.status === 'completed' ? 'Review' : 
                   activity.status === 'overdue' ? 'Continue' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Activities;

