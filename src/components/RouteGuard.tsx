import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    // Don't redirect while auth is loading
    if (isLoading) return;

    const path = location.pathname;
    
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
      validRoutes.push(
        '/dashboard/admin',
        '/dashboard/school-admin', 
        '/dashboard/teacher',
        '/dashboard/student',
        ...getDashboardSubRoutes(currentUser.role)
      );
    }

    // Check if current path starts with any valid route
    const isValidRoute = validRoutes.some(route => 
      path === route || path.startsWith(route + '/')
    );

    if (!isValidRoute) {
      // If user is authenticated, redirect to their dashboard
      if (currentUser) {
        const dashboardPath = getDashboardPath(currentUser.role);
        navigate(dashboardPath, { replace: true });
      } else {
        // If not authenticated, redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, currentUser, isLoading, navigate]);

  return null; // This component doesn't render anything
};

const getDashboardPath = (role: string) => {
  switch (role) {
    case 'admin': return '/dashboard/admin';
    case 'school_admin': return '/dashboard/school-admin';
    case 'teacher': return '/dashboard/teacher';
    case 'student': return '/dashboard/student';
    default: return '/';
  }
};

const getDashboardSubRoutes = (role: string) => {
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
        '/dashboard/student/settings'
      ];
    default:
      return [];
  }
};

export default RouteGuard;
