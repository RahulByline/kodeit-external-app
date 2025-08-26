import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, TrendingUp, Clock, CheckCircle, Circle, Play } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

const CurrentLessons: React.FC = () => {
  const { currentUser } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading lessons data
    setTimeout(() => {
      setLessons([
        {
          id: 1,
          title: "Introduction to Programming",
          description: "Learn the basics of programming concepts",
          duration: "45 min",
          progress: 75,
          status: "continue",
          course: "Computer Science Fundamentals"
        },
        {
          id: 2,
          title: "Variables and Data Types",
          description: "Understanding different types of data in programming",
          duration: "30 min",
          progress: 100,
          status: "completed",
          course: "Computer Science Fundamentals"
        },
        {
          id: 3,
          title: "Control Structures",
          description: "Learn about loops and conditional statements",
          duration: "60 min",
          progress: 0,
          status: "locked",
          course: "Computer Science Fundamentals"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'continue':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'locked':
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'continue':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <DashboardLayout 
      userRole="student" 
      userName={currentUser?.fullname || "Student"}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Lessons</h1>
          <p className="text-gray-600">Track your progress through active lessons and assignments</p>
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
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lesson.status)}`}>
                    {lesson.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{lesson.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        lesson.status === 'completed' ? 'bg-green-600' : 
                        lesson.status === 'locked' ? 'bg-gray-400' : 'bg-blue-600'
                      }`} 
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                  </div>
                  <span className="text-sm text-gray-500">{lesson.course}</span>
                </div>
                
                <button 
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    lesson.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                    lesson.status === 'continue' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                    lesson.status === 'locked' ? 'bg-gray-100 text-gray-700 cursor-not-allowed' :
                    'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={lesson.status === 'locked'}
                >
                  {lesson.status === 'completed' ? 'Review Lesson' : 
                   lesson.status === 'continue' ? 'Continue Lesson' : 
                   lesson.status === 'locked' ? 'Locked' : 'Start Lesson'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CurrentLessons;

