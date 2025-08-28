import React from 'react';
import { 
  Building,
  Info,
  CheckCircle,
  ArrowRight,
  User,
  Flame,
  Star,
  Coins
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface Exam {
  id: string;
  title: string;
  schedule: string;
  daysLeft: number;
  isNew: boolean;
}

interface ScheduleEvent {
  date: string;
  day: string;
  hasActivity: boolean;
  isDisabled: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  type: 'learning' | 'practice';
  duration: string;
  progress: number;
  total: number;
}

interface G4G7DashboardProps {
  userCourses: any[];
  courseProgress: any[];
  studentActivities: any[];
  userAssignments: any[];
}

const G4G7Dashboard: React.FC<G4G7DashboardProps> = ({
  userCourses,
  courseProgress,
  studentActivities,
  userAssignments
}) => {
  const { currentUser } = useAuth();

  const upcomingExams: Exam[] = [
    {
      id: '1',
      title: 'Build Your Own Responsive Website Course Exam',
      schedule: 'Tue, 26th Aug - 06:55pm - 08:35pm',
      daysLeft: 4,
      isNew: true
    }
  ];

  const scheduleEvents: ScheduleEvent[] = [
    { date: '20', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '21', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '22', day: 'SAT', hasActivity: true, isDisabled: false },
    { date: '23', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '24', day: 'MON', hasActivity: false, isDisabled: true },
    { date: '25', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '26', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '27', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '28', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '29', day: 'SAT', hasActivity: true, isDisabled: false },
    { date: '30', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '1', day: 'MON', hasActivity: true, isDisabled: false },
    { date: '2', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '3', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '4', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '5', day: 'FRI', hasActivity: true, isDisabled: false },
    { date: '7', day: 'SUN', hasActivity: true, isDisabled: false },
    { date: '8', day: 'MON', hasActivity: true, isDisabled: false },
    { date: '9', day: 'TUE', hasActivity: true, isDisabled: false },
    { date: '10', day: 'WED', hasActivity: true, isDisabled: false },
    { date: '11', day: 'THU', hasActivity: true, isDisabled: false },
    { date: '12', day: 'FRI', hasActivity: true, isDisabled: false }
  ];

  const learningModules: LearningModule[] = [
    { id: '1', title: 'HTML (2/8)', type: 'learning', duration: '30 Mins', progress: 2, total: 8 },
    { id: '2', title: 'HTML Elements', type: 'learning', duration: '30 Mins', progress: 0, total: 1 },
    { id: '3', title: 'MCQ Practice 2', type: 'practice', duration: '20 Mins', progress: 0, total: 1 },
    { id: '4', title: 'HTML Attributes And General', type: 'learning', duration: '15 Mins', progress: 0, total: 1 }
  ];

  return (
    <div className='bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-100'>
      <div className="mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upcoming Exams Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Exams</h2>
              <div className="space-y-4">
                {upcomingExams.map((exam, index) => (
                  <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {exam.isNew && (
                            <button className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                              New Attempt
                            </button>
                          )}
                          <Building className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{exam.schedule}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                          Attempt →
                        </button>
                        <span className="text-green-600 text-sm font-medium">{exam.daysLeft} Day to go!</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Schedule Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Schedule</h2>
                <Info className="w-5 h-5 text-purple-500" />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">Today's Schedule</p>
                
                {/* Calendar Strip */}
                <div className="relative mb-4">
                  <div className="flex space-x-2 px-8 overflow-x-auto">
                    {scheduleEvents.slice(0, 7).map((event, index) => (
                      <div key={index} className="flex flex-col items-center min-w-[40px]">
                        <span className="text-xs text-gray-500 mb-1">{event.day}</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                          event.isDisabled 
                            ? 'bg-gray-100 text-gray-400' 
                            : event.hasActivity 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          {event.date}
                        </div>
                        {event.hasActivity && !event.isDisabled && (
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Frontend Interview Kit Section */}
            <div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="mb-6">
                  <p className="text-sm opacity-90 mb-1">FRONTEND DEVELOPER</p>
                  <h2 className="text-2xl font-bold">Frontend Interview Kit</h2>
                </div>
                
                <div className="space-y-4">
                  {learningModules.map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                      <div className="flex items-center space-x-3">
                        {module.title.includes('(') ? (
                          <div className="relative">
                            <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{module.progress}/{module.total}</span>
                            </div>
                          </div>
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${module.type === 'learning' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                        )}
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              module.type === 'learning' 
                                ? 'bg-green-400/20 text-green-200' 
                                : 'bg-orange-400/20 text-orange-200'
                            }`}>
                              {module.type.toUpperCase()}
                            </span>
                            <span className="text-xs opacity-75">{module.duration}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-75" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentUser?.fullname || "Student"}</h3>
                  <p className="text-blue-600 text-sm">Daily Rank →</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Today's Progress</p>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-green-600 font-medium">Best: 2</span>
                <span className="text-orange-600 font-medium">Goal: 7</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Flame className="w-6 h-6 text-orange-500 mb-1" />
                  <span className="text-xs text-gray-600">0 Streaks</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">119.55K Points</span>
                </div>
                <div className="flex flex-col items-center">
                  <Coins className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">18,860 Coins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default G4G7Dashboard;
