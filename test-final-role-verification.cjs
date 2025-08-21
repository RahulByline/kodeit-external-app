// Final test script to verify corrected IOMAD role fetching
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

async function testFinalRoleVerification() {
  try {
    console.log('🔍 Final IOMAD Role Verification Test...');
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
    
    // Step 3: Test role detection for specific users
    console.log('\n🎭 Step 3: Testing Role Detection...');
    
    // Test with known users from the documentation
    const testUsers = [
      { username: 'kodeit_admin', expectedRole: 'admin' },
      { username: 'alhuda_admin', expectedRole: 'school_admin' },
      { username: 'teacher1', expectedRole: 'teacher' },
      { username: 'user1', expectedRole: 'student' }
    ];
    
    // IOMAD role mapping based on actual discovered roles
    const roleMapping = {
      // Admin roles - based on actual IOMAD roles
      'manager': 'admin',
      'siteadmin': 'admin',
      'coursecreator': 'admin', // Course creators are typically admins
      
      // School Admin roles - based on actual IOMAD roles
      'companymanager': 'school_admin',
      
      // Teacher roles - based on actual IOMAD roles
      'teacher': 'teacher',
      'editingteacher': 'teacher',
      
      // Student roles - default for users with no specific roles
      'student': 'student',
      'user': 'student',
      'learner': 'student',
      'guest': 'student',
    };
    
    const detectedRoles = {};
    
    for (const testUser of testUsers) {
      const user = allUsers.find(u => u.username === testUser.username);
      if (user) {
        console.log(`\n🔍 Testing role detection for: ${testUser.username}`);
        
        // Get IOMAD roles
        try {
          const response = await moodleApi.get('', {
            params: {
              wsfunction: 'local_intelliboard_get_users_roles',
              'data[courseid]': 0,
              'data[userid]': user.id.toString(),
              'data[checkparentcontexts]': 1,
            },
          });
          
          let detectedRole = 'student'; // default
          
          if (response.data && typeof response.data.data === 'string') {
            try {
              const parsed = JSON.parse(response.data.data);
              
              if (parsed && typeof parsed === 'object') {
                const roles = Object.values(parsed).map((role) => ({
                  shortname: role.shortname || role.role_shortname,
                  name: role.name || role.role_name,
                  id: role.id || role.role_id
                }));
                
                console.log(`📋 IOMAD roles for ${testUser.username}:`, roles);
                
                // Check each role with exact matching
                for (const role of roles) {
                  const roleShortname = role.shortname.toLowerCase().trim();
                  if (roleMapping[roleShortname]) {
                    detectedRole = roleMapping[roleShortname];
                    console.log(`✅ Mapped role "${roleShortname}" to "${detectedRole}"`);
                    break;
                  }
                }
              }
            } catch (parseError) {
              console.warn(`⚠️ Error parsing IOMAD roles JSON for ${testUser.username}:`, parseError);
            }
          }
          
          detectedRoles[testUser.username] = {
            expected: testUser.expectedRole,
            detected: detectedRole,
            correct: detectedRole === testUser.expectedRole
          };
          
          console.log(`📊 Role Detection Result: Expected: ${testUser.expectedRole}, Detected: ${detectedRole}, Correct: ${detectedRole === testUser.expectedRole ? '✅' : '❌'}`);
          
        } catch (error) {
          console.warn(`⚠️ Could not fetch roles for ${testUser.username}:`, error.response?.data || error.message);
          detectedRoles[testUser.username] = {
            expected: testUser.expectedRole,
            detected: 'error',
            correct: false
          };
        }
      } else {
        console.log(`⚠️ Test user ${testUser.username} not found in system`);
        detectedRoles[testUser.username] = {
          expected: testUser.expectedRole,
          detected: 'not_found',
          correct: false
        };
      }
    }
    
    // Step 4: Summary and Analysis
    console.log('\n📈 Step 4: Role Detection Summary');
    console.log('='.repeat(60));
    
    let correctCount = 0;
    let totalCount = 0;
    
    for (const [username, result] of Object.entries(detectedRoles)) {
      totalCount++;
      if (result.correct) correctCount++;
      
      console.log(`${username}:`);
      console.log(`  Expected: ${result.expected}`);
      console.log(`  Detected: ${result.detected}`);
      console.log(`  Status: ${result.correct ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log('');
    }
    
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    console.log(`📊 Overall Accuracy: ${correctCount}/${totalCount} (${accuracy}%)`);
    
    if (accuracy === 100) {
      console.log('🎉 SUCCESS: All role detections are correct!');
    } else if (accuracy >= 75) {
      console.log('✅ GOOD: Most role detections are correct!');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT: Role detection accuracy is low');
    }
    
    // Step 5: Teacher Count Verification
    console.log('\n👨‍🏫 Step 5: Teacher Count Verification');
    console.log('='.repeat(60));
    
    let teacherCount = 0;
    const teachers = [];
    
    for (const user of allUsers) {
      try {
        const response = await moodleApi.get('', {
          params: {
            wsfunction: 'local_intelliboard_get_users_roles',
            'data[courseid]': 0,
            'data[userid]': user.id.toString(),
            'data[checkparentcontexts]': 1,
          },
        });
        
        if (response.data && typeof response.data.data === 'string') {
          try {
            const parsed = JSON.parse(response.data.data);
            
            if (parsed && typeof parsed === 'object') {
              const roles = Object.values(parsed).map((role) => ({
                shortname: role.shortname || role.role_shortname,
                name: role.name || role.role_name,
                id: role.id || role.role_id
              }));
              
              // Check if user has teacher role
              for (const role of roles) {
                const roleShortname = role.shortname.toLowerCase().trim();
                if (roleMapping[roleShortname] === 'teacher') {
                  teacherCount++;
                  teachers.push({
                    username: user.username,
                    name: `${user.firstname} ${user.lastname}`,
                    roles: roles
                  });
                  break;
                }
              }
            }
          } catch (parseError) {
            // Skip users with parsing errors
          }
        }
      } catch (error) {
        // Skip users with API errors
      }
    }
    
    console.log(`📊 Teacher Count Analysis:`);
    console.log(`Expected teachers: 4`);
    console.log(`Actual teachers found: ${teacherCount}`);
    console.log(`Accuracy: ${teacherCount === 4 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    if (teachers.length > 0) {
      console.log('\n👨‍🏫 Detected Teachers:');
      teachers.forEach((teacher, index) => {
        console.log(`${index + 1}. ${teacher.username} - ${teacher.name}`);
        console.log(`   Roles: [${teacher.roles.map(r => r.shortname).join(', ')}]`);
      });
    }
    
    console.log('\n✅ Final role verification test completed!');
    
  } catch (error) {
    console.error('❌ Error in final role verification test:', error.response?.data || error.message);
  }
}

// Run the test
testFinalRoleVerification();
