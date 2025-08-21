// Test script to verify enhanced IOMAD role fetching and user management
const axios = require('axios');

// IOMAD API configuration
const API_BASE_URL = 'https://kodeit.legatoserver.com/webservice/rest/server.php';
const API_TOKEN = '2eabaa23e0cf9a5442be25613c41abf5';

// Create axios instance for IOMAD API
const moodleApi = axios.create({
  baseURL: API_BASE_URL,
  params: {
    wstoken: API_TOKEN,
    moodlewsrestformat: 'json'
  }
});

async function testEnhancedRoleFetching() {
  try {
    console.log('🔍 Testing Enhanced IOMAD Role Fetching...');
    console.log('🌐 API URL:', API_BASE_URL);
    console.log('🔑 Token:', API_TOKEN ? 'Available' : 'Missing');
    
    // Step 1: Test API connection
    console.log('\n📡 Step 1: Testing API connection...');
    try {
      const siteInfo = await moodleApi.get('', {
        params: {
          wsfunction: 'core_webservice_get_site_info'
        }
      });
      console.log('✅ API connection successful:', siteInfo.data.sitename);
    } catch (error) {
      console.error('❌ API connection failed:', error.response?.data || error.message);
      return;
    }
    
    // Step 2: Get all users
    console.log('\n👥 Step 2: Fetching all users...');
    let allUsers = [];
    
    try {
      const usersResponse = await moodleApi.get('', {
        params: {
          wsfunction: 'core_user_get_users',
          'criteria[0][key]': 'suspended',
          'criteria[0][value]': '0'
        }
      });
      
      if (usersResponse.data && usersResponse.data.users) {
        allUsers = usersResponse.data.users;
        console.log(`✅ Found ${allUsers.length} users (suspended = 0)`);
      }
    } catch (error) {
      console.log('⚠️ Suspended criteria failed, trying without criteria...');
      try {
        const usersResponse = await moodleApi.get('', {
          params: {
            wsfunction: 'core_user_get_users'
          }
        });
        
        if (usersResponse.data && usersResponse.data.users) {
          allUsers = usersResponse.data.users;
          console.log(`✅ Found ${allUsers.length} users (no criteria)`);
        }
      } catch (error2) {
        console.error('❌ Failed to fetch users:', error2.response?.data || error2.message);
        return;
      }
    }
    
    // Step 3: Test enhanced role fetching for specific users
    console.log('\n🎭 Step 3: Testing Enhanced Role Fetching...');
    
    // Test with known users from the documentation
    const testUsers = [
      { username: 'kodeit_admin', expectedRole: 'admin' },
      { username: 'alhuda_admin', expectedRole: 'admin' },
      { username: 'teacher1', expectedRole: 'teacher' },
      { username: 'user1', expectedRole: 'student' }
    ];
    
    for (const testUser of testUsers) {
      const user = allUsers.find(u => u.username === testUser.username);
      if (user) {
        console.log(`\n🔍 Testing enhanced role fetching for: ${testUser.username}`);
        
        // Test Approach 1: IOMAD-specific role function
        try {
          console.log(`📡 Trying IOMAD role function for user ${user.username}...`);
          const response = await moodleApi.get('', {
            params: {
              wsfunction: 'local_intelliboard_get_users_roles',
              'data[courseid]': 0,
              'data[userid]': user.id.toString(),
              'data[checkparentcontexts]': 1,
            },
          });
          
          console.log(`📋 IOMAD roles response for ${user.username}:`, response.data);
          
          if (response.data && typeof response.data.data === 'string') {
            try {
              const parsed = JSON.parse(response.data.data);
              console.log(`📋 Parsed IOMAD roles for ${user.username}:`, parsed);
              
              if (parsed && typeof parsed === 'object') {
                const roles = Object.values(parsed).map((role) => ({
                  shortname: role.shortname || role.role_shortname,
                  name: role.name || role.role_name,
                  id: role.id || role.role_id
                }));
                console.log(`✅ Found ${roles.length} IOMAD roles for ${user.username}:`, roles);
              }
            } catch (parseError) {
              console.warn(`⚠️ Error parsing IOMAD roles JSON for ${user.username}:`, parseError);
            }
          }
        } catch (error) {
          console.warn(`⚠️ IOMAD role function failed for ${user.username}:`, error.response?.data || error.message);
        }
        
        // Test Approach 2: Core role assignments
        try {
          console.log(`📡 Trying core_role_assignments for ${user.username}...`);
          const response = await moodleApi.get('', {
            params: {
              wsfunction: 'core_role_assignments',
              'userid': user.id.toString(),
              'contextlevel': 'system'
            },
          });
          
          console.log(`📋 Core role assignments for ${user.username}:`, response.data);
          
          if (response.data && response.data.assignments && Array.isArray(response.data.assignments)) {
                         const roles = response.data.assignments.map((assignment) => ({
               shortname: assignment.role?.shortname,
               name: assignment.role?.name,
               id: assignment.role?.id
             })).filter(role => role.shortname);
            
            console.log(`✅ Found ${roles.length} core roles for ${user.username}:`, roles);
          }
        } catch (error) {
          console.warn(`⚠️ Core role assignments failed for ${user.username}:`, error.response?.data || error.message);
        }
        
        // Test Approach 3: User courses approach
        try {
          console.log(`📡 Trying user courses approach for ${user.username}...`);
          const response = await moodleApi.get('', {
            params: {
              wsfunction: 'core_enrol_get_users_courses',
              'userid': user.id.toString()
            },
          });
          
          console.log(`📋 User courses for ${user.username}:`, response.data);
          
          if (response.data && Array.isArray(response.data)) {
            console.log(`✅ Found ${response.data.length} courses for ${user.username}`);
            
            // Get roles from each course
            for (const course of response.data.slice(0, 2)) { // Test first 2 courses only
              try {
                const courseRolesResponse = await moodleApi.get('', {
                  params: {
                    wsfunction: 'core_role_assignments',
                    'userid': user.id.toString(),
                    'contextlevel': 'course',
                    'instanceid': course.id
                  },
                });
                
                if (courseRolesResponse.data && courseRolesResponse.data.assignments) {
                                     const courseRoles = courseRolesResponse.data.assignments.map((assignment) => ({
                     shortname: assignment.role?.shortname,
                     name: assignment.role?.name,
                     id: assignment.role?.id
                   })).filter(role => role.shortname);
                  
                  console.log(`📋 Course roles for ${user.username} in course ${course.id}:`, courseRoles);
                }
              } catch (courseError) {
                console.warn(`⚠️ Could not get roles for course ${course.id}:`, courseError.response?.data || courseError.message);
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️ User courses approach failed for ${user.username}:`, error.response?.data || error.message);
        }
      } else {
        console.log(`⚠️ Test user ${testUser.username} not found in system`);
      }
    }
    
    // Step 4: Test available roles
    console.log('\n🎭 Step 4: Testing Available Roles...');
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_role_get_roles'
        }
      });
      
      console.log(`✅ Found ${response.data?.length || 0} available roles:`, response.data);
      
      // Show role mapping
      const roleMapping = {
        'admin': ['manager', 'admin', 'administrator'],
        'school_admin': ['companymanager', 'school_admin', 'company_manager'],
        'teacher': ['teacher', 'editingteacher', 'trainer', 'instructor'],
        'student': ['student', 'user', 'learner']
      };
      
      console.log('\n📋 Role Mapping Analysis:');
      for (const [appRole, iomadRoles] of Object.entries(roleMapping)) {
                 const foundRoles = response.data?.filter((role) => 
           iomadRoles.includes(role.shortname)
         ) || [];
        console.log(`${appRole}: ${foundRoles.length} matches found`);
                 foundRoles.forEach((role) => {
           console.log(`  - ${role.shortname} (ID: ${role.id})`);
         });
      }
      
    } catch (error) {
      console.error('❌ Error fetching available roles:', error.response?.data || error.message);
    }
    
    // Step 5: Test role assignment (if we have a test user)
    console.log('\n🔧 Step 5: Testing Role Assignment...');
    const testUser = allUsers.find(u => u.username === 'user1');
    if (testUser) {
      try {
        console.log(`🔧 Testing role assignment for user: ${testUser.username}`);
        
        // First, get available roles
        const rolesResponse = await moodleApi.get('', {
          params: {
            wsfunction: 'core_role_get_roles'
          }
        });
        
                 const teacherRole = rolesResponse.data?.find((role) => 
           ['teacher', 'editingteacher', 'trainer', 'instructor'].includes(role.shortname)
         );
        
        if (teacherRole) {
          console.log(`✅ Found teacher role: ${teacherRole.shortname} (ID: ${teacherRole.id})`);
          
          // Test role assignment
          const assignResponse = await moodleApi.get('', {
            params: {
              wsfunction: 'core_role_assign_roles',
              'assignments[0][roleid]': teacherRole.id.toString(),
              'assignments[0][userid]': testUser.id.toString(),
              'assignments[0][contextlevel]': 'system',
              'assignments[0][instanceid]': '1'
            }
          });
          
          console.log(`✅ Role assignment response:`, assignResponse.data);
          
          // Verify the assignment
          const verifyResponse = await moodleApi.get('', {
            params: {
              wsfunction: 'core_role_assignments',
              'userid': testUser.id.toString(),
              'contextlevel': 'system'
            },
          });
          
          console.log(`✅ Verification response:`, verifyResponse.data);
          
        } else {
          console.log('⚠️ No teacher role found in available roles');
        }
        
      } catch (error) {
        console.error(`❌ Error testing role assignment:`, error.response?.data || error.message);
      }
    }
    
    console.log('\n✅ Enhanced role fetching test completed!');
    
  } catch (error) {
    console.error('❌ Error in enhanced role fetching test:', error.response?.data || error.message);
  }
}

// Run the test
testEnhancedRoleFetching();
