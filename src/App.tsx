import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MyAIBuddy from "./components/MyAIBuddy";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import SchoolAdminLoginPage from "./pages/SchoolAdminLoginPage";
import TeacherLoginPage from "./pages/TeacherLoginPage";
import StudentLoginPage from "./pages/StudentLoginPage";
import DashboardSelection from "./pages/DashboardSelection";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminTeachers from "./pages/admin/Teachers";
import MasterTrainers from "./pages/admin/MasterTrainers";
import AdminCourses from "./pages/admin/Courses";
import Schools from "./pages/admin/Schools";
import AdminAnalytics from "./pages/admin/Analytics";
import UserManagement from "./pages/admin/UserManagement";
import AdminSettings from "./pages/admin/Settings";
import Community from "./pages/admin/Community";
import Enrollments from "./pages/admin/Enrollments";
import SchoolCommunity from "./pages/school-admin/Community";
import SchoolEnrollments from "./pages/school-admin/Enrollments";
import TeacherCommunity from "./pages/teacher/Community";
import TeacherEnrollments from "./pages/teacher/Enrollments";
import StudentCommunity from "./pages/student/Community";
import StudentEnrollments from "./pages/student/Enrollments";
import AdminCertifications from "./pages/admin/Certifications";
import AdminAssessments from "./pages/admin/Assessments";
import AdminReports from "./pages/admin/Reports";
import Predictive from "./pages/admin/Predictive";
import ROI from "./pages/admin/ROI";

// School Admin pages
import SchoolAdminTeachers from "./pages/school-admin/Teachers";
import Students from "./pages/school-admin/Students";
import SchoolAdminCourses from "./pages/school-admin/Courses";
import SchoolAdminAnalytics from "./pages/school-admin/Analytics";
import Certifications from "./pages/school-admin/Certifications";
import Assessments from "./pages/school-admin/Assessments";
import Reports from "./pages/school-admin/Reports";
import SchoolAdminUsers from "./pages/school-admin/Users";
import SchoolManagement from "./pages/school-admin/SchoolManagement";

// Teacher pages
import TeacherAnalytics from "./pages/teacher/Analytics";
import TeacherAssessments from "./pages/teacher/Assessments";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherCalendar from "./pages/teacher/Calendar";
import TeacherCourses from "./pages/teacher/Courses";
import TeacherReports from "./pages/teacher/Reports";
import TeacherStudents from "./pages/teacher/Students";
import TeacherGroups from "./pages/teacher/Groups";

// Student pages
import StudentAssessments from "./pages/student/Assessments";
import StudentAssignments from "./pages/student/Assignments";
import StudentCalendar from "./pages/student/Calendar";
import StudentCourses from "./pages/student/Courses";
import StudentGrades from "./pages/student/Grades";
import StudentMessages from "./pages/student/Messages";
import StudentProgress from "./pages/student/Progress";

// Settings pages
import SchoolAdminSettings from "./pages/SchoolAdminSettings";
import TeacherSettings from "./pages/TeacherSettings";
import StudentSettings from "./pages/StudentSettings";
import RoleDebug from "./pages/RoleDebug";

const queryClient = new QueryClient();

const App = () => {
  // This state helps prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 text-gray-800">
              <MyAIBuddy />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/debug/roles" element={<RoleDebug />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/admin" element={<AdminLoginPage />} />
                <Route path="/login/school-admin" element={<SchoolAdminLoginPage />} />
                <Route path="/login/teacher" element={<TeacherLoginPage />} />
                <Route path="/login/student" element={<StudentLoginPage />} />
                <Route path="/dashboards" element={<DashboardSelection />} />
                
                {/* Protected Dashboard Routes */}
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolAdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Protected Admin Dashboard Routes */}
                <Route path="/dashboard/admin/teachers" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminTeachers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/master-trainers" element={
                  <ProtectedRoute requiredRole="admin">
                    <MasterTrainers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/courses" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCourses />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/schools" element={
                  <ProtectedRoute requiredRole="admin">
                    <Schools />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/analytics" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/community" element={
                  <ProtectedRoute requiredRole="admin">
                    <Community />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/enrollments" element={
                  <ProtectedRoute requiredRole="admin">
                    <Enrollments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/certifications" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCertifications />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/assessments" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAssessments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReports />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/predictive" element={
                  <ProtectedRoute requiredRole="admin">
                    <Predictive />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/roi" element={
                  <ProtectedRoute requiredRole="admin">
                    <ROI />
                  </ProtectedRoute>
                } />
                
                {/* Missing Admin Routes */}
                <Route path="/dashboard/admin/enrollments" element={
                  <ProtectedRoute requiredRole="admin">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">Enrollment Management</h1>
                      <p className="text-gray-600">Enrollment management features coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* School Admin Routes */}
                <Route path="/dashboard/school-admin/teachers" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolAdminTeachers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/students" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Students />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/courses" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolAdminCourses />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/certifications" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Certifications />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/assessments" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Assessments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/analytics" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolAdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/reports" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/users" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolAdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/school-management" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolManagement />
                  </ProtectedRoute>
                } />
                
                {/* Missing School Admin Routes */}
                <Route path="/dashboard/school-admin/community" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolCommunity />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/school-admin/enrollments" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolEnrollments />
                  </ProtectedRoute>
                } />
                
                {/* Settings Routes */}
                <Route path="/dashboard/school-admin/settings" element={
                  <ProtectedRoute requiredRole="school_admin">
                    <SchoolAdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/settings" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/enrollments" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherEnrollments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/settings" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/enrollments" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentEnrollments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/community" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentCommunity />
                  </ProtectedRoute>
                } />
                
                {/* Teacher Section Routes */}
                <Route path="/dashboard/teacher/analytics" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/assessments" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherAssessments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/assignments" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherAssignments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/calendar" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherCalendar />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/courses" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherCourses />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/reports" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherReports />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/students" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherStudents />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/community" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherCommunity />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/performance" element={
                  <ProtectedRoute requiredRole="teacher">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">Performance Analytics</h1>
                      <p className="text-gray-600">Performance analytics features coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher/groups" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherGroups />
                  </ProtectedRoute>
                } />
                
                {/* Student Section Routes */}
                <Route path="/dashboard/student/assessments" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentAssessments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/assignments" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentAssignments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/calendar" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentCalendar />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/courses" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentCourses />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/grades" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentGrades />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/messages" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentMessages />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student/progress" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProgress />
                  </ProtectedRoute>
                } />
                
                {/* Debug Routes */}
                <Route path="/debug/roles" element={<RoleDebug />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
