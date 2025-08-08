import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

interface BaseLoginPageProps {
  role: string;
  title: string;
  description: string;
  credentials: {
    username: string;
    password: string;
  };
  bgColor: string;
  accentColor: string;
  redirectPath: string;
}

const BaseLoginPage: React.FC<BaseLoginPageProps> = ({
  role,
  title,
  description,
  credentials,
  bgColor,
  accentColor,
  redirectPath
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        const detectedRole = result.role;
        if (detectedRole === 'admin') navigate('/dashboard/admin');
        else if (detectedRole === 'school_admin') navigate('/dashboard/school-admin');
        else if (detectedRole === 'teacher') navigate('/dashboard/teacher');
        else if (detectedRole === 'student') navigate('/dashboard/student');
        else navigate(redirectPath);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full screen layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left: full-bleed image section */}
        <div className="relative hidden lg:block">
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/login.png')" }}
            aria-label="Educational background with students and teachers"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300/30 to-orange-300/30"></div>
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to KODEIT</h1>
              <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                Access your personalized dashboard and manage your educational journey
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-orange-300/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl"></div>
        </div>
        
        {/* Right: form area */}
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#fff8f0]">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center">
              <img 
                src="/logo.png" 
                alt="KODEIT Logo" 
                className="mx-auto h-20 w-auto"
              />
            </div>
            
            {/* Brand */}
            <div className="text-center">
              {/* <div className="font-mono tracking-[0.35em] text-orange-900 text-2xl font-bold">KODEIT</div> */}
              <h2 className="mt-6 text-3xl font-bold text-orange-900">Welcome back</h2>
              <p className="mt-2 text-orange-700">
                Sign in to your account to continue
              </p>
            </div>
            
            {/* Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {/* Email */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-orange-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-orange-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="block w-full pl-10 pr-3 py-3 border border-orange-200 rounded-lg placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/70"
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-orange-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-orange-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="block w-full pl-10 pr-10 py-3 border border-orange-200 rounded-lg placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/70"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <a className="text-sm text-orange-600 hover:text-orange-800 cursor-pointer">Forget Password?</a>
                </div>
              </div>
              
              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-orange-900">
                  Remember me
                </label>
              </div>
              
              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-orange-400 text-white text-base font-semibold shadow-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>
              
              {/* Footer prompt */}
              <div className="text-center text-sm text-orange-700">
                Don't have an account yet? <span className="text-orange-600 cursor-pointer hover:underline font-medium">Sign up</span>
              </div>
              
              
            </form>
            
            {/* Back */}
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="mt-6 w-full py-3 px-4 rounded-lg border border-orange-200 text-base font-medium text-orange-700 hover:bg-orange-50 transition-colors"
            >
              Back to Dashboard Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseLoginPage;