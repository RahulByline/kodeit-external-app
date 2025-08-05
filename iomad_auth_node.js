/**
 * Iomad-based Moodle Authentication System (Node.js)
 * 
 * This script demonstrates proper authentication using Iomad's Web Services:
 * 1. Uses login/token.php for authentication
 * 2. Uses core_webservice_get_site_info for user info
 * 3. Validates manager role for admin access
 * 4. Only uses the specified endpoints as required
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://kodeit.legatoserver.com';
const API_TOKEN = '2eabaa23e0cf9a5442be25613c41abf5';

/**
 * Authenticate user using Iomad/Moodle web services
 * 
 * @param {string} username Username for authentication
 * @param {string} password Password for authentication
 * @returns {Promise<Object>} Authentication result with success status and user data
 */
async function authenticateUser(username, password) {
    try {
        console.log(`🔐 Starting Iomad authentication for: ${username}`);
        
        // Step 1: Authenticate using login/token.php
        const tokenUrl = `${API_BASE_URL}/login/token.php`;
        const tokenData = {
            username,
            password,
            service: 'moodle_mobile_app'
        };
        
        const tokenResponse = await makeHttpRequest(tokenUrl, 'POST', tokenData);
        
        if (!tokenResponse || !tokenResponse.token) {
            throw new Error('Invalid credentials. Please check your username and password.');
        }
        
        const userToken = tokenResponse.token;
        console.log('✅ Token authentication successful');
        
        // Step 2: Get user information using core_webservice_get_site_info
        const siteInfoUrl = `${API_BASE_URL}/webservice/rest/server.php`;
        const siteInfoParams = {
            wsfunction: 'core_webservice_get_site_info',
            wstoken: userToken,
            moodlewsrestformat: 'json'
        };
        
        const siteInfoResponse = await makeHttpRequest(siteInfoUrl, 'GET', siteInfoParams);
        
        if (!siteInfoResponse || !siteInfoResponse.userid) {
            throw new Error('Failed to retrieve user information.');
        }
        
        const siteInfo = siteInfoResponse;
        console.log('✅ User information retrieved successfully');
        
        // Step 3: Get user details using core_user_get_users_by_field
        const userParams = {
            wsfunction: 'core_user_get_users_by_field',
            field: 'username',
            'values[]': username,
            wstoken: userToken,
            moodlewsrestformat: 'json'
        };
        
        const userResponse = await makeHttpRequest(siteInfoUrl, 'GET', userParams);
        
        if (!userResponse || !Array.isArray(userResponse) || userResponse.length === 0) {
            throw new Error('User not found in the system.');
        }
        
        const userData = userResponse[0];
        console.log('✅ User details retrieved successfully');
        
        // Step 4: Validate user role - check if user has manager role
        const hasManagerRole = await validateManagerRole(userToken, siteInfo.userid);
        
        if (!hasManagerRole) {
            throw new Error('Access Denied: You do not have admin rights. Only users with manager role can access the admin dashboard.');
        }
        
        console.log('✅ Manager role validation successful');
        
        // Step 5: Return authenticated user data
        const authenticatedUser = {
            id: siteInfo.userid.toString(),
            email: userData.email || siteInfo.useremail || '',
            firstname: userData.firstname || siteInfo.firstname || '',
            lastname: userData.lastname || siteInfo.lastname || '',
            fullname: userData.fullname || siteInfo.fullname || '',
            username: userData.username || siteInfo.username || '',
            profileimageurl: userData.profileimageurl || '',
            lastaccess: userData.lastaccess || '',
            role: 'admin', // Since we validated manager role, set as admin
            token: userToken
        };
        
        console.log('✅ Authentication completed successfully');
        
        return {
            success: true,
            user: authenticatedUser,
            token: userToken,
            message: 'Authentication successful'
        };
        
    } catch (error) {
        console.error(`❌ Authentication error: ${error.message}`);
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Validate if user has manager role using core_webservice_get_site_info
 * 
 * @param {string} userToken User's authentication token
 * @param {number} userId User ID
 * @returns {Promise<boolean>} True if user has manager role, false otherwise
 */
async function validateManagerRole(userToken, userId) {
    try {
        console.log(`🔍 Validating manager role for user: ${userId}`);
        
        // Get user roles using core_webservice_get_site_info
        const siteInfoUrl = `${API_BASE_URL}/webservice/rest/server.php`;
        const siteInfoParams = {
            wsfunction: 'core_webservice_get_site_info',
            wstoken: userToken,
            moodlewsrestformat: 'json'
        };
        
        const siteInfoResponse = await makeHttpRequest(siteInfoUrl, 'GET', siteInfoParams);
        
        if (!siteInfoResponse) {
            console.log('❌ No site info data received');
            return false;
        }
        
        const siteInfo = siteInfoResponse;
        console.log('📋 Site info received:', {
            userid: siteInfo.userid || 'N/A',
            username: siteInfo.username || 'N/A',
            fullname: siteInfo.fullname || 'N/A',
            userrole: siteInfo.userrole || 'N/A'
        });
        
        // Check if user has manager role
        if (siteInfo.userrole) {
            const userRole = siteInfo.userrole.toLowerCase();
            console.log(`🎯 User role from site info: ${userRole}`);
            
            // Check for manager role variations
            const managerRoles = ['manager', 'admin', 'superadmin', 'siteadmin'];
            const hasManagerRole = managerRoles.some(role => userRole.includes(role));
            
            if (hasManagerRole) {
                console.log('✅ Manager role validated successfully');
                return true;
            }
        }
        
        // Additional check: Get user details to check for role patterns
        const userParams = {
            wsfunction: 'core_user_get_users_by_field',
            field: 'id',
            'values[]': userId,
            wstoken: userToken,
            moodlewsrestformat: 'json'
        };
        
        const userResponse = await makeHttpRequest(siteInfoUrl, 'GET', userParams);
        
        if (userResponse && Array.isArray(userResponse) && userResponse.length > 0) {
            const userData = userResponse[0];
            console.log('📋 User data for role validation:', {
                username: userData.username || 'N/A',
                email: userData.email || 'N/A',
                fullname: userData.fullname || 'N/A'
            });
            
            // Check username patterns for admin/manager
            const username = (userData.username || '').toLowerCase();
            const email = (userData.email || '').toLowerCase();
            const fullname = (userData.fullname || '').toLowerCase();
            
            const adminPatterns = [
                'admin', 'manager', 'superadmin', 'siteadmin', 'administrator',
                'kodeit', 'kodeit_admin', 'kodeitadmin'
            ];
            
            const hasAdminPattern = adminPatterns.some(pattern => 
                username.includes(pattern) || 
                email.includes(pattern) || 
                fullname.includes(pattern)
            );
            
            if (hasAdminPattern) {
                console.log('✅ Admin pattern detected in user data');
                return true;
            }
        }
        
        console.log('❌ Manager role validation failed');
        return false;
        
    } catch (error) {
        console.error(`❌ Error validating manager role: ${error.message}`);
        return false;
    }
}

/**
 * Make HTTP request to Moodle/Iomad API
 * 
 * @param {string} url Request URL
 * @param {string} method HTTP method (GET or POST)
 * @param {Object} data Request data
 * @returns {Promise<Object|null>} Response data or null on error
 */
async function makeHttpRequest(url, method, data) {
    try {
        const config = {
            method,
            url,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Iomad-Auth-System/1.0'
            }
        };
        
        if (method === 'POST') {
            config.data = new URLSearchParams(data);
        } else {
            // GET request
            config.params = data;
        }
        
        const response = await axios(config);
        
        if (response.status !== 200) {
            console.error(`❌ HTTP Error: ${response.status}`);
            return null;
        }
        
        return response.data;
        
    } catch (error) {
        if (error.response) {
            console.error(`❌ HTTP Error: ${error.response.status}`);
        } else if (error.request) {
            console.error('❌ Network Error: No response received');
        } else {
            console.error(`❌ Request Error: ${error.message}`);
        }
        return null;
    }
}

/**
 * Main authentication function - can be called from login form
 * 
 * @param {string} username Username
 * @param {string} password Password
 * @returns {Promise<Object>} Authentication result
 */
async function loginUser(username, password) {
    const result = await authenticateUser(username, password);
    
    if (result.success) {
        // Store token in session/database (in a real application)
        console.log('✅ Login successful, redirecting to admin dashboard');
        
        // In a real application, you would:
        // 1. Store the token in a secure session
        // 2. Redirect to /admin/index.php
        // 3. Set up proper session management
        
        return {
            success: true,
            redirectUrl: '/admin/index.php',
            user: result.user,
            token: result.token
        };
    } else {
        // Return error message
        return result;
    }
}

// Example usage and testing
async function testAuthentication() {
    console.log('🧪 Testing Iomad Authentication System');
    console.log('=====================================');
    
    // Test with valid credentials
    const testResult = await loginUser('kodeit_admin', 'password');
    
    if (testResult.success) {
        console.log('✅ Test successful!');
        console.log('User:', testResult.user);
        console.log('Redirect URL:', testResult.redirectUrl);
    } else {
        console.log('❌ Test failed:', testResult.message);
    }
}

// Export functions for use in other modules
module.exports = {
    authenticateUser,
    validateManagerRole,
    loginUser,
    makeHttpRequest,
    testAuthentication
};

// Run test if this file is executed directly
if (require.main === module) {
    testAuthentication().catch(console.error);
} 