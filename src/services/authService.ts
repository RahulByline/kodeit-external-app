import { moodleService } from './moodleApi';

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

interface LoginResponse {
  user: UserData;
  token: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      // Use Moodle authentication
      const userData = await moodleService.authenticateUser(username, password);
      
      if (userData) {
        // Store Moodle token
        localStorage.setItem('moodle_token', userData.token);
        localStorage.setItem('token', userData.token); // Keep for compatibility
        
        return {
          user: userData,
          token: userData.token
        };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  async register(userData: any): Promise<LoginResponse> {
    // For now, registration might need to be handled differently with Moodle
    // You might need to create users through Moodle admin or use a different approach
    throw new Error('Registration not implemented for Moodle integration');
  },

  async getProfile(): Promise<UserData | null> {
    try {
      const userData = await moodleService.getProfile();
      return userData;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async updateProfile(profileData: Partial<UserData>): Promise<UserData | null> {
    // Profile updates might need to be handled through Moodle web services
    // For now, return the current profile
    return await this.getProfile();
  },

  async logout(): Promise<void> {
    // Clear both tokens
    localStorage.removeItem('moodle_token');
    localStorage.removeItem('token');
  }
}; 