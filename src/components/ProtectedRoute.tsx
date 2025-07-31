import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useContext(AuthContext);

  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - userRole:', userRole);
  console.log('ProtectedRoute - requiredRole:', requiredRole);
  console.log('ProtectedRoute - localStorage moodle_token:', localStorage.getItem('moodle_token'));

  // Check if user is authenticated
  if (!currentUser) {
    console.log('ProtectedRoute - No currentUser, redirecting to login');
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
    // Redirect to dashboard selection if user doesn't have the required role
    return <Navigate to="/dashboards" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  // User is authenticated and has the required role (if specified)
  return <>{children}</>;
};

export default ProtectedRoute; 