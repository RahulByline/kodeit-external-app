import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  BookOpen,
  Users,
  Folder,
  BarChart3,
  UploadCloud
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Course } from '../../types';

const sidebarItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard / Home' },
  { id: 'learning', icon: BookOpen, label: 'My Learning & Certification' },
  { id: 'sessions', icon: Users, label: 'My Training Sessions' },
  { id: 'resources', icon: Folder, label: 'Resources & Collaboration' },
  { id: 'performance', icon: BarChart3, label: 'Performance & Feedback' },
  { id: 'uploads', icon: UploadCloud, label: 'Uploads & Documentation' }
];

export const TrainerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Real data state for Dashboard/Home
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSection === 'dashboard' && user?.id) {
      setLoading(true);
      setError(null);
      apiService.getUserCourses(user.id)
        .then(setCourses)
        .catch((err) => setError(err.message || 'Failed to fetch courses'))
        .finally(() => setLoading(false));
    }
  }, [activeSection, user?.id]);

  const [learningLoading, setLearningLoading] = useState(false);
  const [learningError, setLearningError] = useState<string | null>(null);
  const [learningCourses, setLearningCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (activeSection === 'learning' && user?.id) {
      setLearningLoading(true);
      setLearningError(null);
      apiService.getUserCourses(user.id)
        .then(setLearningCourses)
        .catch((err) => setLearningError(err.message || 'Failed to fetch courses'))
        .finally(() => setLearningLoading(false));
    }
  }, [activeSection, user?.id]);

  // My Training Sessions state
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Course[]>([]);

  useEffect(() => {
    if (activeSection === 'sessions' && user?.id) {
      setSessionsLoading(true);
      setSessionsError(null);
      apiService.getUserCourses(user.id)
        .then(setSessions)
        .catch((err) => setSessionsError(err.message || 'Failed to fetch sessions'))
        .finally(() => setSessionsLoading(false));
    }
  }, [activeSection, user?.id]);

  const renderDashboardSection = () => {
    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!courses.length) return <div className="p-6 text-gray-600">No courses found.</div>;

    // Progress tracker: show all courses with progress
    return (
      <div className="p-6 space-y-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard / Home</h2>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Your Progress Tracker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-2">
                  {course.courseimage ? (
                    <img src={course.courseimage} alt={course.fullname} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-green-500" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 line-clamp-1">{course.fullname}</div>
                    <div className="text-xs text-gray-500">{course.type || 'Course'}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{course.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${course.progress ?? 0}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Upcoming assignments/sessions: courses with start date in the future */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Upcoming Training Assignments</h3>
          <div className="space-y-2">
            {courses.filter(c => c.startdate && c.startdate * 1000 > Date.now()).length === 0 && (
              <div className="text-gray-500 text-sm">No upcoming assignments.</div>
            )}
            {courses.filter(c => c.startdate && c.startdate * 1000 > Date.now()).map((course) => (
              <div key={course.id} className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-4">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">{course.fullname}</div>
                  <div className="text-xs text-gray-600">Starts: {course.startdate ? new Date(course.startdate * 1000).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Placeholders for recommendations and alerts */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <h4 className="font-semibold mb-1">Course Recommendations</h4>
            <div className="text-gray-500 text-sm">(AI-driven recommendations coming soon)</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <h4 className="font-semibold mb-1">Alerts & Notifications</h4>
            <div className="text-gray-500 text-sm">(Reminders and alerts coming soon)</div>
          </div>
        </div>
      </div>
    );
  };

  const renderLearningSection = () => {
    if (learningLoading) return <div className="p-6">Loading...</div>;
    if (learningError) return <div className="p-6 text-red-600">{learningError}</div>;
    if (!learningCourses.length) return <div className="p-6 text-gray-600">No learning pathway courses found.</div>;

    return (
      <div className="p-6 space-y-8">
        <h2 className="text-2xl font-bold mb-4">My Learning & Certification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningCourses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  {course.courseimage ? (
                    <img
                      src={course.courseimage}
                      alt={course.fullname}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-white opacity-80" />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-white bg-opacity-90 text-xs font-medium rounded-full">
                      {course.format || 'Course'}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.fullname}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.summary ? course.summary.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No description available'}
                </p>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{course.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${course.progress ?? 0}%` }}
                  ></div>
                </div>
                {/* Certification status placeholder */}
                <div className="text-xs text-blue-600 font-medium">
                  {course.progress === 100 ? 'Certified' : 'In Progress'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderSessionsSection = () => {
    if (sessionsLoading) return <div className="p-6">Loading...</div>;
    if (sessionsError) return <div className="p-6 text-red-600">{sessionsError}</div>;
    if (!sessions.length) return <div className="p-6 text-gray-600">No training sessions found.</div>;

    const now = Date.now();
    const upcoming = sessions.filter(s => s.startdate && s.startdate * 1000 > now);
    const history = sessions.filter(s => s.startdate && s.startdate * 1000 <= now);

    return (
      <div className="p-6 space-y-8">
        <h2 className="text-2xl font-bold mb-4">My Training Sessions</h2>
        <div>
          <h3 className="text-lg font-semibold mb-2">Upcoming Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.length === 0 && <div className="text-gray-500 text-sm">No upcoming sessions.</div>}
            {upcoming.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-semibold text-gray-900 line-clamp-1">{session.fullname}</div>
                      <div className="text-xs text-gray-500">{session.type || 'Session'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Starts: {session.startdate ? new Date(session.startdate * 1000).toLocaleString() : 'N/A'}</div>
                  <div className="text-xs text-gray-600 mb-1">Attendees: {session.enrollmentCount ?? '-'}</div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{session.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${session.progress ?? 0}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Session History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.length === 0 && <div className="text-gray-500 text-sm">No past sessions.</div>}
            {history.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-900 line-clamp-1">{session.fullname}</div>
                      <div className="text-xs text-gray-500">{session.type || 'Session'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Date: {session.startdate ? new Date(session.startdate * 1000).toLocaleString() : 'N/A'}</div>
                  <div className="text-xs text-gray-600 mb-1">Attendees: {session.enrollmentCount ?? '-'}</div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{session.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${session.progress ?? 0}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Resources & Collaboration (placeholder UI, real data if available)
  const renderResourcesSection = () => (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Resources & Collaboration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Shared Resource Library</h3>
            <p className="text-sm text-gray-600 mb-3">Access lesson plans, templates, presentations, and more.</p>
          </div>
          <button className="mt-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Go to Library</button>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Learning Communities (PLCs)</h3>
            <p className="text-sm text-gray-600 mb-3">Join subject or role-based groups for discussion and resource sharing.</p>
          </div>
          <button className="mt-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">View PLCs</button>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Trainer Resource Folder</h3>
            <p className="text-sm text-gray-600 mb-3">Access curated toolkits and resources tailored for trainers.</p>
          </div>
          <button className="mt-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">Open Folder</button>
        </motion.div>
      </div>
    </div>
  );

  // Performance & Feedback (real data if available, otherwise placeholder)
  const [perfLoading, setPerfLoading] = useState(false);
  const [perfError, setPerfError] = useState<string | null>(null);
  const [perfCourses, setPerfCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (activeSection === 'performance' && user?.id) {
      setPerfLoading(true);
      setPerfError(null);
      apiService.getUserCourses(user.id)
        .then(setPerfCourses)
        .catch((err) => setPerfError(err.message || 'Failed to fetch performance data'))
        .finally(() => setPerfLoading(false));
    }
  }, [activeSection, user?.id]);

  const renderPerformanceSection = () => {
    if (perfLoading) return <div className="p-6">Loading...</div>;
    if (perfError) return <div className="p-6 text-red-600">{perfError}</div>;
    if (!perfCourses.length) return <div className="p-6 text-gray-600">No performance data found.</div>;

    return (
      <div className="p-6 space-y-8">
        <h2 className="text-2xl font-bold mb-4">Performance & Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perfCourses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="font-semibold text-gray-900 line-clamp-1">{course.fullname}</div>
                    <div className="text-xs text-gray-500">{course.type || 'Course'}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">Rating: {course.rating ?? 'N/A'}</div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{course.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${course.progress ?? 0}%` }}
                  ></div>
                </div>
                {/* Feedback placeholder */}
                <div className="text-xs text-gray-600 mt-2">Feedback: (summary coming soon)</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Uploads & Documentation (placeholder UI, real data if available)
  const renderUploadsSection = () => (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Uploads & Documentation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Submit Evidence</h3>
            <p className="text-sm text-gray-600 mb-3">Upload observation data, forms, or lesson delivery videos.</p>
          </div>
          <button className="mt-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Upload File</button>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Assignment/Project Submission</h3>
            <p className="text-sm text-gray-600 mb-3">Submit assignments or projects for certification.</p>
          </div>
          <button className="mt-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Submit Assignment</button>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Uploaded Files</h3>
            <p className="text-sm text-gray-600 mb-3">View your previously uploaded documentation.</p>
          </div>
          <button className="mt-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">View Files</button>
        </motion.div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardSection();
      case 'learning':
        return renderLearningSection();
      case 'sessions':
        return renderSessionsSection();
      case 'resources':
        return renderResourcesSection();
      case 'performance':
        return renderPerformanceSection();
      case 'uploads':
        return renderUploadsSection();
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-green-700">Trainer Dashboard</h1>
          <div className="text-sm text-gray-500 mt-1">Welcome, {user?.firstname || 'Trainer'}</div>
        </div>
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors text-left gap-3 font-medium ${activeSection === item.id ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1">
        {renderSection()}
      </main>
    </div>
  );
};