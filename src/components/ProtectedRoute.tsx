import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useContext(AuthContext);

  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - userRole:', userRole);
  console.log('ProtectedRoute - requiredRole:', requiredRole);
  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - localStorage moodle_token:', localStorage.getItem('moodle_token'));

  // If still loading, show loading state
  if (loading) {
    console.log('ProtectedRoute - Still loading, showing loading state');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!currentUser) {
    // Check if we have stored user data (for page refresh scenarios)
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('moodle_token') || localStorage.getItem('token');
    
    console.log('ProtectedRoute - No currentUser, checking stored data');
    console.log('ProtectedRoute - Stored user exists:', !!storedUser);
    console.log('ProtectedRoute - Token exists:', !!token);
    
    if (storedUser && token) {
      console.log('ProtectedRoute - Found stored user data, allowing access temporarily');
      return <>{children}</>;
    }
    
    console.log('ProtectedRoute - No stored user data, redirecting to login');
    // Redirect to role-specific login page
    if (requiredRole === 'admin') {
      console.log('ProtectedRoute - Redirecting to /login/admin');
      return <Navigate to="/login/admin" replace />;
    } else if (requiredRole === 'school_admin') {
      console.log('ProtectedRoute - Redirecting to /login/school-admin');
      return <Navigate to="/login/school-admin" replace />;
    } else if (requiredRole === 'teacher') {
      console.log('ProtectedRoute - Redirecting to /login/teacher');
      return <Navigate to="/login/teacher" replace />;
    } else if (requiredRole === 'student') {
      console.log('ProtectedRoute - Redirecting to /login/student');
      return <Navigate to="/login/student" replace />;
    } else {
      console.log('ProtectedRoute - Redirecting to /login');
      return <Navigate to="/login" replace />;
    }
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && userRole !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch. Required:', requiredRole, 'User has:', userRole);
    console.log('ProtectedRoute - Current user data:', currentUser);
    
    // For debugging: if user has no role but is authenticated, default to student for student routes
    if (requiredRole === 'student' && (!userRole || userRole === '')) {
      console.log('ProtectedRoute - User has no role, but accessing student route. Allowing access.');
      return <>{children}</>;
    }
    
    // Redirect to dashboard selection if user doesn't have the required role
    return <Navigate to="/dashboards" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  // User is authenticated and has the required role (if specified)
  return <>{children}</>;
};

export default ProtectedRoute; 