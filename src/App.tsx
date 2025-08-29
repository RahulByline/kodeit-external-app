import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ChatProvider } from "./context/ChatContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MyAIBuddy from "./components/MyAIBuddy";
import TextSelectionPopupWrapper from "./components/TextSelectionPopupWrapper";

import RouteGuard from "./components/RouteGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Optimized loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Error component for lazy loading failures
const LazyErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to load component</h2>
      <p className="text-gray-600 mb-4">There was an error loading this page.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);

// Core pages - loaded immediately
import Index from "./pages/Index";

// Login pages - lazy loaded
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const SchoolAdminLoginPage = lazy(() => import("./pages/SchoolAdminLoginPage"));
const TeacherLoginPage = lazy(() => import("./pages/TeacherLoginPage"));
const StudentLoginPage = lazy(() => import("./pages/StudentLoginPage"));

// Dashboard pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SchoolAdminDashboard = lazy(() => import("./pages/SchoolAdminDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));

// Admin pages - lazy loaded
const AdminTeachers = lazy(() => import("./pages/admin/Teachers"));
const AdminStudents = lazy(() => import("./pages/admin/Students"));
const MasterTrainers = lazy(() => import("./pages/admin/MasterTrainers"));
const AdminCourses = lazy(() => import("./pages/admin/Courses"));
const AdminCertifications = lazy(() => import("./pages/admin/Certifications"));
const AdminAssessments = lazy(() => import("./pages/admin/Assessments"));
const Schools = lazy(() => import("./pages/admin/Schools"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminPredictive = lazy(() => import("./pages/admin/Predictive"));

const AdminReports = lazy(() => import("./pages/admin/Reports"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminCommunity = lazy(() => import("./pages/admin/Community"));
const AdminEnrollments = lazy(() => import("./pages/admin/Enrollments"));
const CompetenciesMap = lazy(() => import("./pages/admin/CompetenciesMap"));
const CohortNavigationSettings = lazy(() => import("./pages/admin/CohortNavigationSettings"));

// School Admin pages - lazy loaded
const SchoolAdminTeachers = lazy(() => import("./pages/school-admin/Teachers"));
const Students = lazy(() => import("./pages/school-admin/Students"));
const SchoolAdminCourses = lazy(() => import("./pages/school-admin/Courses"));
const SchoolAdminAnalytics = lazy(() => import("./pages/school-admin/Analytics"));
const Certifications = lazy(() => import("./pages/school-admin/Certifications"));
const Assessments = lazy(() => import("./pages/school-admin/Assessments"));
const Reports = lazy(() => import("./pages/school-admin/Reports"));
const SchoolAdminUsers = lazy(() => import("./pages/school-admin/Users"));
const SchoolManagement = lazy(() => import("./pages/school-admin/SchoolManagement"));
const SchoolAdminCommunity = lazy(() => import("./pages/school-admin/Community"));
const SchoolAdminEnrollments = lazy(() => import("./pages/school-admin/Enrollments"));

// Teacher pages - lazy loaded
const TeacherAnalytics = lazy(() => import("./pages/teacher/Analytics"));
const TeacherAssessments = lazy(() => import("./pages/teacher/Assessments"));
const TeacherAssignments = lazy(() => import("./pages/teacher/Assignments"));
const TeacherCalendar = lazy(() => import("./pages/teacher/Calendar"));
const TeacherCourses = lazy(() => import("./pages/teacher/Courses"));
const TeacherReports = lazy(() => import("./pages/teacher/Reports"));
const TeacherStudents = lazy(() => import("./pages/teacher/Students"));
const TeacherGroups = lazy(() => import("./pages/teacher/Groups"));

// Student pages - lazy loaded
const StudentAssessments = lazy(() => import("./pages/student/Assessments"));
const StudentAssignments = lazy(() => import("./pages/student/Assignments"));
const StudentCalendar = lazy(() => import("./pages/student/Calendar"));
const StudentCourses = lazy(() => import("./pages/student/Courses"));
const StudentGrades = lazy(() => import("./pages/student/Grades"));
const StudentMessages = lazy(() => import("./pages/student/Messages"));
const StudentProgress = lazy(() => import("./pages/student/Progress"));
const StudentCommunity = lazy(() => import("./pages/student/Community"));
const StudentEnrollments = lazy(() => import("./pages/student/Enrollments"));
const StudentEbooks = lazy(() => import("./pages/student/Ebooks"));
const StudentAskTeacher = lazy(() => import("./pages/student/AskTeacher"));
const StudentAiBuddy = lazy(() => import("./pages/student/AiBuddy"));
const StudentShare = lazy(() => import("./pages/student/Share"));
const Emulators = lazy(() => import("./pages/student/Emulators"));
const CodeEditor = lazy(() => import("./features/codeEditor/CodeEditorPage"));
const Compiler = lazy(() => import("./pages/student/Compiler"));
const ScratchEditor = lazy(() => import("./pages/ScratchEditor"));
const ScratchCodeEditor = lazy(() => import("./pages/student/ScratchCodeEditor"));

// Settings pages - lazy loaded
const SchoolAdminSettings = lazy(() => import("./pages/SchoolAdminSettings"));
const TeacherSettings = lazy(() => import("./pages/TeacherSettings"));
const StudentSettings = lazy(() => import("./pages/StudentSettings"));
const RoleDebug = lazy(() => import("./pages/RoleDebug"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DashboardSelection = lazy(() => import("./pages/DashboardSelection"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // This state helps prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <ThemeProvider>
                <ChatProvider>
                  <BrowserRouter>
                    <RouteGuard />
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                      <MyAIBuddy />
                      <TextSelectionPopupWrapper />
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/debug/roles" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <RoleDebug />
                  </Suspense>
                } />
                <Route path="/dashboards" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <DashboardSelection />
                  </Suspense>
                } />
                <Route path="/login" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <LoginPage />
                  </Suspense>
                } />
                <Route path="/login/admin" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminLoginPage />
                  </Suspense>
                } />
                <Route path="/login/school-admin" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SchoolAdminLoginPage />
                  </Suspense>
                } />
                <Route path="/login/teacher" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <TeacherLoginPage />
                  </Suspense>
                } />
                <Route path="/login/student" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <StudentLoginPage />
                  </Suspense>
                } />
                
                {/* Protected Dashboard Routes */}
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SchoolAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherDashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentDashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                {/* Protected Admin Dashboard Routes */}
                <Route path="/dashboard/admin/teachers" element={
                  <ProtectedRoute requiredRole="admin">
                    <ErrorBoundary fallback={<LazyErrorFallback error={new Error("Failed to load Teachers")} />}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminTeachers />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/students" element={
                  <ProtectedRoute requiredRole="admin">
                    <ErrorBoundary fallback={<LazyErrorFallback error={new Error("Failed to load Students")} />}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminStudents />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/master-trainers" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <MasterTrainers />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/courses" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminCourses />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/certifications" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminCertifications />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/assessments" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminAssessments />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/schools" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Schools />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/analytics" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminAnalytics />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/predictive" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminPredictive />
                    </Suspense>
                  </ProtectedRoute>
                } />

                <Route path="/dashboard/admin/reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminReports />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <UserManagement />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminSettings />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/community" element={
                  <ProtectedRoute requiredRole="admin">
                    <ErrorBoundary fallback={<LazyErrorFallback error={new Error("Failed to load Community")} />}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminCommunity />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/enrollments" element={
                  <ProtectedRoute requiredRole="admin">
                    <ErrorBoundary fallback={<LazyErrorFallback error={new Error("Failed to load Enrollments")} />}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminEnrollments />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                
                {/* School Admin Routes */}
                <Route path="/dashboard/school-admin/teachers" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SchoolAdminTeachers />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/students" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Students />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/courses" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SchoolAdminCourses />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/certifications" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Certifications />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/assessments" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Assessments />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/analytics" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SchoolAdminAnalytics />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/reports" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Reports />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/users" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SchoolAdminUsers />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/school-management" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SchoolManagement />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/community" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <ErrorBoundary fallback={<LazyErrorFallback error={new Error("Failed to load Community")} />}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <SchoolAdminCommunity />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/enrollments" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <ErrorBoundary fallback={<LazyErrorFallback error={new Error("Failed to load Enrollments")} />}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <SchoolAdminEnrollments />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                
                {/* Settings Routes */}
                <Route path="/dashboard/school-admin/settings" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SchoolAdminSettings />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/settings" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherSettings />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/settings" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentSettings />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                {/* Teacher Section Routes */}
                <Route path="/dashboard/teacher/analytics" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherAnalytics />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/assessments" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherAssessments />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/assignments" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherAssignments />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/calendar" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherCalendar />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/courses" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherCourses />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/reports" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherReports />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/students" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherStudents />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/groups" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherGroups />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                {/* Student Section Routes */}
                <Route path="/dashboard/student/assessments" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentAssessments />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/assignments" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentAssignments />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/calendar" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentCalendar />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/courses" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentCourses />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/grades" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentGrades />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/messages" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentMessages />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/progress" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentProgress />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/competencies" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <CompetenciesMap />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/cohort-navigation" element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <CohortNavigationSettings />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/emulators" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Emulators />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/code-editor" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <CodeEditor />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/compiler" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Compiler />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/scratch-editor" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <ScratchCodeEditor />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/community" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentCommunity />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/enrollments" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentEnrollments />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/ebooks" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentEbooks />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/ask-teacher" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentAskTeacher />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/ai-buddy" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentAiBuddy />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/share" element={
                  <ProtectedRoute requiredRole="student">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentShare />
                    </Suspense>
                  </ProtectedRoute>
                } />
                {/* Scratch Editor Route */}
                <Route path="/editor" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ScratchEditor />
                  </Suspense>
                } />
                
                {/* Debug Routes */}
                <Route path="/debug/roles" element={<RoleDebug />} />
                
                {/* 404 Not Found Route - Must be last */}
                <Route path="*" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFound />
                  </Suspense>
                } />
                                </Routes>
                </div>
              </BrowserRouter>
                    </ChatProvider>
              </ThemeProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
};

export default App;
