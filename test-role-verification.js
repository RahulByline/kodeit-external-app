// Test script to verify IOMAD role fetching
// This script will help us understand why we're getting 7 teachers instead of 4

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

async function testIOMADRoleFetching() {
  try {
    console.log('🔍 Testing IOMAD role fetching directly...');
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
    
    // Step 3: Get roles for each user
    console.log('\n🎭 Step 3: Fetching roles for each user...');
    const usersWithRoles = [];
    
    for (const user of allUsers) {
      try {
        console.log(`🔍 Fetching roles for user: ${user.username} (ID: ${user.id})`);
        
        const rolesResponse = await moodleApi.get('', {
          params: {
            wsfunction: 'core_role_assignments',
            'userid': user.id
          }
        });
        
        let roles = [];
        if (rolesResponse.data && rolesResponse.data.assignments) {
          roles = rolesResponse.data.assignments.map(assignment => ({
            shortname: assignment.role.shortname,
            name: assignment.role.name,
            contextlevel: assignment.contextlevel
          }));
        }
        
        usersWithRoles.push({
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          roles: roles
        });
        
        console.log(`  📋 Roles: [${roles.map(r => r.shortname).join(', ')}]`);
        
      } catch (error) {
        console.warn(`⚠️ Could not fetch roles for user ${user.username}:`, error.response?.data || error.message);
        usersWithRoles.push({
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          roles: []
        });
      }
    }
    
    // Step 4: Analyze roles and categorize users
    console.log('\n📊 Step 4: Analyzing user roles...');
    
    // Define role mappings (exact matches only)
    const roleMapping = {
      // Admin roles
      'manager': 'admin',
      'admin': 'admin',
      'administrator': 'admin',
      'siteadmin': 'admin',
      'superadmin': 'admin',
      
      // School Admin roles
      'companymanager': 'school_admin',
      'school_admin': 'school_admin',
      'company_manager': 'school_admin',
      'companydepartmentmanager': 'school_admin',
      'principal': 'school_admin',
      'cluster_admin': 'school_admin',
      
      // Teacher roles
      'teacher': 'teacher',
      'editingteacher': 'teacher',
      'trainer': 'teacher',
      'instructor': 'teacher',
      'coursecreator': 'teacher',
      'companycourseeditor': 'teacher',
      'companycoursenoneditingteacher': 'teacher',
      
      // Student roles
      'student': 'student',
      'user': 'student',
      'learner': 'student',
      'guest': 'student',
      'companycoursestudent': 'student',
    };
    
    const categorizedUsers = usersWithRoles.map(user => {
      let detectedRole = 'student'; // default
      
      // Check each role with exact matching
      for (const role of user.roles) {
        const roleShortname = role.shortname.toLowerCase().trim();
        if (roleMapping[roleShortname]) {
          detectedRole = roleMapping[roleShortname];
          break;
        }
      }
      
      return {
        ...user,
        detectedRole: detectedRole
      };
    });
    
    // Step 5: Count by role
    const roleCounts = {};
    const teachers = [];
    const students = [];
    const admins = [];
    const schoolAdmins = [];
    
    categorizedUsers.forEach(user => {
      roleCounts[user.detectedRole] = (roleCounts[user.detectedRole] || 0) + 1;
      
      if (user.detectedRole === 'teacher') {
        teachers.push(user);
      } else if (user.detectedRole === 'student') {
        students.push(user);
      } else if (user.detectedRole === 'admin') {
        admins.push(user);
      } else if (user.detectedRole === 'school_admin') {
        schoolAdmins.push(user);
      }
    });
    
    // Step 6: Display results
    console.log('\n📈 Step 5: Results Summary');
    console.log('='.repeat(50));
    console.log(`Total users: ${categorizedUsers.length}`);
    console.log(`Role distribution:`, roleCounts);
    console.log(`Expected teachers: 4`);
    console.log(`Actual teachers: ${teachers.length}`);
    
    if (teachers.length !== 4) {
      console.log('\n⚠️ ISSUE DETECTED: Teacher count mismatch!');
      console.log('Expected: 4 teachers');
      console.log('Found:', teachers.length, 'teachers');
    } else {
      console.log('\n✅ SUCCESS: Teacher count is correct!');
    }
    
    // Step 7: Detailed teacher analysis
    console.log('\n🔍 Step 6: Detailed Teacher Analysis');
    console.log('='.repeat(50));
    teachers.forEach((teacher, index) => {
      console.log(`\nTeacher ${index + 1}: ${teacher.username}`);
      console.log(`  Name: ${teacher.firstname} ${teacher.lastname}`);
      console.log(`  Email: ${teacher.email}`);
      console.log(`  IOMAD Roles: [${teacher.roles.map(r => r.shortname).join(', ')}]`);
      console.log(`  Detected Role: ${teacher.detectedRole}`);
    });
    
    // Step 8: Show all users for debugging
    console.log('\n📋 Step 7: All Users with Roles');
    console.log('='.repeat(50));
    categorizedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.firstname} ${user.lastname}`);
      console.log(`   Roles: [${user.roles.map(r => r.shortname).join(', ')}]`);
      console.log(`   Detected: ${user.detectedRole}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error in test:', error.response?.data || error.message);
  }
}

// Run the test
testIOMADRoleFetching();
