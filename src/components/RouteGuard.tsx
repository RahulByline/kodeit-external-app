import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't redirect while auth is loading
    if (loading) {
      console.log('RouteGuard - Auth is loading, waiting...');
      return;
    }

    const path = location.pathname;
    
    // If we're on a dashboard route and user is not authenticated, 
    // check if we have stored user data in localStorage
    if (path.startsWith('/dashboard/') && !currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('moodle_token') || localStorage.getItem('token');
      
      console.log('RouteGuard - Dashboard route without currentUser');
      console.log('RouteGuard - Stored user exists:', !!storedUser);
      console.log('RouteGuard - Token exists:', !!token);
      console.log('RouteGuard - Current path:', path);
      console.log('RouteGuard - Stored user value:', storedUser);
      console.log('RouteGuard - Token value:', token);
      
      if (storedUser && token) {
        console.log('RouteGuard - Found stored user data, waiting for AuthContext to restore...');
        // Don't redirect - let the AuthContext handle the restoration
        return;
      }
      
      // For development testing - allow access to student dashboard even without auth
      if (path.startsWith('/dashboard/student/')) {
        console.log('RouteGuard - Allowing student dashboard access for testing');
        console.log('RouteGuard - This should prevent redirect to login');
        return;
      }
      
      // If we're on any student dashboard route, allow access (for development)
      if (path.startsWith('/dashboard/student')) {
        console.log('RouteGuard - Allowing student dashboard access (including main dashboard)');
        return;
      }
    }
    
    // Debug logging
    console.log('RouteGuard - currentUser:', currentUser);
    console.log('RouteGuard - currentUser.role:', currentUser?.role);
    console.log('RouteGuard - path:', path);
    console.log('RouteGuard - loading:', loading);
    
    // If user is on a non-existent route, redirect to home
    const validRoutes = [
      '/',
      '/login',
      '/login/admin',
      '/login/school-admin', 
      '/login/teacher',
      '/login/student',
      '/debug/roles'
    ];

    // Add dashboard routes if user is authenticated
    if (currentUser) {
      console.log('RouteGuard - Adding dashboard routes for role:', currentUser.role);
      const subRoutes = getDashboardSubRoutes(currentUser.role);
      console.log('RouteGuard - Sub routes:', subRoutes);
      
      validRoutes.push(
        '/dashboard/admin',
        '/dashboard/school-admin', 
        '/dashboard/teacher',
        '/dashboard/student',
        ...subRoutes
      );
    }

    // Check if current path starts with any valid route
    const isValidRoute = validRoutes.some(route => 
      path === route || path.startsWith(route + '/')
    );

    console.log('RouteGuard - Valid routes:', validRoutes);
    console.log('RouteGuard - Is valid route:', isValidRoute);

    if (!isValidRoute) {
      console.log('RouteGuard - Invalid route detected, redirecting...');
      // If user is authenticated, redirect to their dashboard
      if (currentUser) {
        const dashboardPath = getDashboardPath(currentUser.role);
        console.log('RouteGuard - Redirecting authenticated user to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
      } else {
        // Check if we have stored user data before redirecting to home
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('moodle_token') || localStorage.getItem('token');
        
        if (storedUser && token) {
          console.log('RouteGuard - Found stored user data, not redirecting to home');
          return;
        }
        
        // If not authenticated, redirect to home
        console.log('RouteGuard - Redirecting unauthenticated user to home');
        navigate('/', { replace: true });
      }
    } else {
      console.log('RouteGuard - Route is valid, no redirect needed');
    }
      }, [location.pathname, currentUser, loading, navigate]);

  return null; // This component doesn't render anything
};

const getDashboardPath = (role: string | undefined | null) => {
  // Handle cases where role is undefined, null, or not a string
  if (!role || typeof role !== 'string') {
    console.warn('RouteGuard: Invalid role provided to getDashboardPath:', role);
    return '/';
  }
  
  switch (role) {
    case 'admin': return '/dashboard/admin';
    case 'school_admin': return '/dashboard/school-admin';
    case 'teacher': return '/dashboard/teacher';
    case 'student': return '/dashboard/student';
    default: return '/';
  }
};

const getDashboardSubRoutes = (role: string | undefined | null) => {
  // Handle cases where role is undefined, null, or not a string
  if (!role || typeof role !== 'string') {
    console.warn('RouteGuard: Invalid role provided to getDashboardSubRoutes:', role);
    return [];
  }
  
  const baseRoutes = ['/dashboard/' + role.replace('_', '-')];
  
  switch (role) {
    case 'admin':
      return [
        ...baseRoutes,
        '/dashboard/admin/teachers',
        '/dashboard/admin/master-trainers',
        '/dashboard/admin/courses',
        '/dashboard/admin/schools',
        '/dashboard/admin/analytics',
        '/dashboard/admin/users',
        '/dashboard/admin/settings'
      ];
    case 'school_admin':
      return [
        ...baseRoutes,
        '/dashboard/school-admin/teachers',
        '/dashboard/school-admin/students',
        '/dashboard/school-admin/courses',
        '/dashboard/school-admin/certifications',
        '/dashboard/school-admin/assessments',
        '/dashboard/school-admin/analytics',
        '/dashboard/school-admin/reports',
        '/dashboard/school-admin/users',
        '/dashboard/school-admin/school-management',
        '/dashboard/school-admin/settings'
      ];
    case 'teacher':
      return [
        ...baseRoutes,
        '/dashboard/teacher/analytics',
        '/dashboard/teacher/assessments',
        '/dashboard/teacher/assignments',
        '/dashboard/teacher/calendar',
        '/dashboard/teacher/courses',
        '/dashboard/teacher/reports',
        '/dashboard/teacher/students',
        '/dashboard/teacher/groups',
        '/dashboard/teacher/settings'
      ];
    case 'student':
      return [
        ...baseRoutes,
        '/dashboard/student/assessments',
        '/dashboard/student/assignments',
        '/dashboard/student/calendar',
        '/dashboard/student/courses',
        '/dashboard/student/grades',
        '/dashboard/student/messages',
        '/dashboard/student/progress',
        '/dashboard/student/emulators',
        '/dashboard/student/code-editor',
        '/dashboard/student/settings',
        '/dashboard/student/community',
        '/dashboard/student/enrollments',
        '/dashboard/student/emulators/blocky'
      ];
    default:
      return [];
  }
};

export default RouteGuard;
