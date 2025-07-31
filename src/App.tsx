import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Teachers from "./pages/admin/Teachers";
import MasterTrainers from "./pages/admin/MasterTrainers";
import Courses from "./pages/admin/Courses";
import Schools from "./pages/admin/Schools";
import Analytics from "./pages/admin/Analytics";
import UserManagement from "./pages/admin/UserManagement";

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
              <Routes>
                <Route path="/" element={<Index />} />
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
                    <Teachers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/master-trainers" element={
                  <ProtectedRoute requiredRole="admin">
                    <MasterTrainers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/courses" element={
                  <ProtectedRoute requiredRole="admin">
                    <Courses />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/schools" element={
                  <ProtectedRoute requiredRole="admin">
                    <Schools />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/analytics" element={
                  <ProtectedRoute requiredRole="admin">
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                } />
                
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
