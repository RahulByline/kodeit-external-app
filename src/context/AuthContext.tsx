import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface UserData {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  username: string;
  profileimageurl?: string;
  lastaccess?: number;
  role?: string;
  companyid?: number;
  token: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  userRole: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; role?: string }>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserData>) => Promise<UserData | null>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('moodle_token') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    console.log('AuthContext - Checking authentication on app start');
    console.log('AuthContext - Token exists:', !!token);
    console.log('AuthContext - Stored user exists:', !!storedUser);
    console.log('AuthContext - Token value:', token);
    console.log('AuthContext - Stored user value:', storedUser);
    
    if (token) {
      // Try to restore user from localStorage first for faster loading
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('AuthContext - Restoring user from localStorage:', userData);
          setCurrentUser(userData);
          setUserRole(userData.role || null);
          setLoading(false);
          
          // Don't make API call if we have valid stored data
          console.log('AuthContext - Using stored user data, skipping API call');
          setIsRestored(true);
          return;
        } catch (error) {
          console.error('AuthContext - Error parsing stored user:', error);
        }
      }
      
      // Then verify with API (but don't fail if API is down)
      authService.getProfile()
        .then(userData => {
          if (userData) {
            console.log('AuthContext - API verification successful:', userData);
            setCurrentUser(userData);
            setUserRole(userData.role || null);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        })
        .catch((error) => {
          console.error('AuthContext - API verification failed, but keeping stored user data:', error);
          // Don't clear authentication if API fails - keep the stored user data
          // This prevents redirects during page refresh when API might be temporarily unavailable
        })
        .finally(() => {
          setLoading(false);
          setIsRestored(true);
        });
    } else {
      console.log('AuthContext - No token found, user not authenticated');
      setLoading(false);
      setIsRestored(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string; role?: string }> => {
    try {
      console.log('AuthContext login called with username:', username);
      const response = await authService.login(username, password);
      console.log('AuthContext login response:', response);
      const { user, token } = response;
      
      console.log('AuthContext setting user:', user);
      console.log('AuthContext setting role:', user.role);
      
      localStorage.setItem('moodle_token', token);
      localStorage.setItem('token', token); // Keep for compatibility
      localStorage.setItem('currentUser', JSON.stringify(user)); // Store current user data
      setCurrentUser(user);
      setUserRole(user.role || null);
      
      return { success: true, role: user.role || null };
    } catch (error) {
      console.error('AuthContext login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const register = async (userData: any) => {
    const response = await authService.register(userData);
    setCurrentUser(response.user);
    setUserRole(response.user.role || null);
    localStorage.setItem('token', response.token);
    return response;
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('moodle_token');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser'); // Clear current user data
  };

  const updateProfile = async (profileData: Partial<UserData>): Promise<UserData | null> => {
    const updatedUser = await authService.updateProfile(profileData);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      setUserRole(updatedUser.role || null);
    }
    return updatedUser;
  };

  const value: AuthContextType = {
    currentUser,
    userRole,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 