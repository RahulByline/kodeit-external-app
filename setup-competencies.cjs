const axios = require('axios');
require('dotenv').config();

const MOODLE_URL = process.env.MOODLE_URL || 'https://kodeit.legatoserver.com';
const MOODLE_TOKEN = process.env.VITE_MOODLE_TOKEN;

if (!MOODLE_TOKEN) {
  console.error('❌ MOODLE_TOKEN not found in environment variables');
  process.exit(1);
}

const moodleApi = axios.create({
  baseURL: `${MOODLE_URL}/webservice/rest/server.php`,
  params: {
    wstoken: MOODLE_TOKEN,
    moodlewsrestformat: 'json'
  }
});

async function setupCompetencies() {
  console.log('🔧 Setting up Basic Competency Data in IOMAD/Moodle...\n');
  console.log(`🌐 Moodle URL: ${MOODLE_URL}`);
  console.log(`🔑 Token: ${MOODLE_TOKEN.substring(0, 10)}...${MOODLE_TOKEN.substring(MOODLE_TOKEN.length - 5)}`);
  console.log('');

  // Note: This script requires admin permissions and competency features to be enabled
  console.log('⚠️  IMPORTANT: This script requires:');
  console.log('   1. Admin permissions in Moodle/IOMAD');
  console.log('   2. Competency features to be enabled');
  console.log('   3. Web service permissions for competency functions');
  console.log('');

  // Test 1: Check if competency features are available
  console.log('📋 Test 1: Checking Competency Feature Availability');
  console.log('=' .repeat(50));
  
  try {
    const response = await moodleApi.get('', {
      params: {
        wsfunction: 'core_competency_read_frameworks'
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log('✅ Competency features are available');
      console.log(`📊 Found ${response.data.length} existing frameworks`);
    } else {
      console.log('⚠️  Competency features may not be enabled');
    }
  } catch (error) {
    console.log('❌ Competency features are not available or not enabled');
    console.log('   Error:', error.response?.data?.errorcode || error.message);
    console.log('');
    console.log('🔧 Please enable competency features in Moodle admin panel first:');
    console.log('   1. Go to Site administration → Plugins → Competencies');
    console.log('   2. Enable "Competency frameworks"');
    console.log('   3. Enable "Learning plans"');
    console.log('');
    return;
  }

  // Test 2: Try to create a basic competency framework
  console.log('\n📋 Test 2: Creating Basic Competency Framework');
  console.log('=' .repeat(50));
  
  try {
    // Note: This would require the core_competency_create_framework web service
    // which may not be available in all Moodle installations
    console.log('🔍 Attempting to create a test competency framework...');
    
    // This is a placeholder - the actual API call would depend on available web services
    console.log('⚠️  Framework creation via API may not be available');
    console.log('   Please create frameworks manually in the Moodle admin panel');
    
  } catch (error) {
    console.log('❌ Could not create competency framework via API');
    console.log('   Error:', error.response?.data?.errorcode || error.message);
  }

  // Test 3: Check available web services
  console.log('\n📋 Test 3: Available Competency Web Services');
  console.log('=' .repeat(50));
  
  const competencyServices = [
    'core_competency_create_framework',
    'core_competency_create_competency',
    'core_competency_create_plan',
    'core_competency_add_competency_to_course',
    'core_competency_add_competency_to_plan'
  ];

  for (const service of competencyServices) {
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: service
        }
      });
      console.log(`✅ ${service}: Available`);
    } catch (error) {
      console.log(`❌ ${service}: Not available (${error.response?.data?.errorcode || 'Unknown error'})`);
    }
  }

  console.log('\n📋 Manual Setup Instructions');
  console.log('=' .repeat(50));
  console.log('Since API-based setup may not be available, here are manual steps:');
  console.log('');
  console.log('1. Login to Moodle Admin Panel:');
  console.log(`   ${MOODLE_URL}/admin`);
  console.log('');
  console.log('2. Enable Competency Features:');
  console.log('   - Go to Site administration → Plugins → Competencies');
  console.log('   - Enable "Competency frameworks"');
  console.log('   - Enable "Learning plans"');
  console.log('');
  console.log('3. Create Competency Frameworks:');
  console.log('   - Go to Site administration → Competencies → Competency frameworks');
  console.log('   - Click "Add new competency framework"');
  console.log('   - Create frameworks for: Programming, Design, Mathematics, Science');
  console.log('');
  console.log('4. Add Competencies:');
  console.log('   - For each framework, add competencies');
  console.log('   - Example: Block-Based Programming, Text-Based Programming, etc.');
  console.log('');
  console.log('5. Link to Courses:');
  console.log('   - Go to each course');
  console.log('   - Course administration → Competencies');
  console.log('   - Add relevant competencies');
  console.log('');
  console.log('6. Create Learning Plans:');
  console.log('   - Site administration → Competencies → Learning plans');
  console.log('   - Create templates and assign to users');
  console.log('');
  console.log('7. Test Again:');
  console.log('   node test-real-competencies.cjs');
  console.log('');

  console.log('🎯 Expected Results After Setup:');
  console.log('- Real competency frameworks in CompetenciesMap');
  console.log('- Real competencies with proper descriptions');
  console.log('- Real learning plans with progress tracking');
  console.log('- Real user competency data');
  console.log('');
  console.log('💡 The CompetenciesMap is already configured to use real data when available!');
}

setupCompetencies();
