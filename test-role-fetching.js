const axios = require('axios');

// Test the role fetching directly
async function testRoleFetching() {
  try {
    console.log('🔍 Testing IOMAD role fetching...');
    
    // Test API connection first
    const testResponse = await axios.get('http://localhost:5173/api/test-connection');
    console.log('✅ API connection test:', testResponse.data);
    
    // Test getting all users
    const usersResponse = await axios.get('http://localhost:5173/api/users');
    console.log('✅ Users fetched:', usersResponse.data.length);
    
    // Analyze teacher count
    const teachers = usersResponse.data.filter(user => 
      user.role === 'teacher' || user.role === 'trainer' || user.isTeacher
    );
    
    console.log('📊 Teacher Analysis:');
    console.log(`Total users: ${usersResponse.data.length}`);
    console.log(`Teachers found: ${teachers.length}`);
    console.log(`Expected teachers: 4`);
    
    console.log('\n🔍 Detailed teacher breakdown:');
    teachers.forEach((teacher, index) => {
      console.log(`Teacher ${index + 1}: ${teacher.username}`);
      console.log(`  - Role: ${teacher.role}`);
      console.log(`  - IOMAD roles: [${teacher.roles?.map(r => r.shortname).join(', ') || 'none'}]`);
      console.log(`  - Name: ${teacher.firstname} ${teacher.lastname}`);
      console.log('');
    });
    
    // Show all users and their roles
    console.log('\n📋 All users and their roles:');
    usersResponse.data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - Role: ${user.role} - IOMAD roles: [${user.roles?.map(r => r.shortname).join(', ') || 'none'}]`);
    });
    
  } catch (error) {
    console.error('❌ Error testing role fetching:', error.response?.data || error.message);
  }
}

// Run the test
testRoleFetching();
