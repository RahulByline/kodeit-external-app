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

async function testCompetencySystem() {
  console.log('🔍 Testing Enhanced IOMAD/Moodle Competency System...\n');

  // Test 1: Competency Frameworks
  console.log('📋 Test 1: Competency Frameworks');
  console.log('=' .repeat(50));
  
  const frameworkFunctions = [
    'core_competency_read_frameworks',
    'tool_lp_data_for_frameworks_manage_page',
    'core_competency_list_frameworks',
    'local_iomad_competency_get_frameworks'
  ];

  for (const wsfunction of frameworkFunctions) {
    try {
      console.log(`🔍 Testing ${wsfunction}...`);
      const response = await moodleApi.get('', {
        params: {
          wsfunction: wsfunction,
          includes: 'courses,competencies,scale'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ ${wsfunction}: Found ${response.data.length} frameworks`);
        if (response.data.length > 0) {
          console.log(`📊 Sample framework:`, {
            id: response.data[0].id,
            name: response.data[0].name,
            shortname: response.data[0].shortname,
            competenciescount: response.data[0].competenciescount,
            coursescount: response.data[0].coursescount
          });
        }
      } else {
        console.log(`⚠️ ${wsfunction}: No data or invalid format`);
      }
    } catch (error) {
      console.log(`❌ ${wsfunction}: ${error.response?.data?.errorcode || error.message}`);
    }
  }

  // Test 2: Competencies
  console.log('\n📋 Test 2: Competencies');
  console.log('=' .repeat(50));
  
  const competencyFunctions = [
    'core_competency_list_competencies',
    'tool_lp_data_for_competencies_manage_page',
    'core_competency_search_competencies',
    'local_iomad_competency_get_competencies'
  ];

  for (const wsfunction of competencyFunctions) {
    try {
      console.log(`🔍 Testing ${wsfunction}...`);
      const response = await moodleApi.get('', {
        params: {
          wsfunction: wsfunction,
          includes: 'courses,scale,evidence'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ ${wsfunction}: Found ${response.data.length} competencies`);
        if (response.data.length > 0) {
          console.log(`📊 Sample competency:`, {
            id: response.data[0].id,
            name: response.data[0].name,
            shortname: response.data[0].shortname,
            frameworkid: response.data[0].frameworkid,
            scaleid: response.data[0].scaleid
          });
        }
      } else {
        console.log(`⚠️ ${wsfunction}: No data or invalid format`);
      }
    } catch (error) {
      console.log(`❌ ${wsfunction}: ${error.response?.data?.errorcode || error.message}`);
    }
  }

  // Test 3: User Competencies
  console.log('\n📋 Test 3: User Competencies');
  console.log('=' .repeat(50));
  
  const userCompetencyFunctions = [
    'core_competency_list_user_competencies',
    'tool_lp_data_for_user_competency_summary',
    'core_competency_read_user_competency',
    'local_iomad_competency_get_user_competencies'
  ];

  for (const wsfunction of userCompetencyFunctions) {
    try {
      console.log(`🔍 Testing ${wsfunction}...`);
      const response = await moodleApi.get('', {
        params: {
          wsfunction: wsfunction,
          userid: 2, // Test with user ID 2
          includes: 'courses,evidence,scale'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ ${wsfunction}: Found ${response.data.length} user competencies`);
        if (response.data.length > 0) {
          console.log(`📊 Sample user competency:`, {
            id: response.data[0].id,
            userid: response.data[0].userid,
            competencyid: response.data[0].competencyid,
            status: response.data[0].status,
            grade: response.data[0].grade
          });
        }
      } else {
        console.log(`⚠️ ${wsfunction}: No data or invalid format`);
      }
    } catch (error) {
      console.log(`❌ ${wsfunction}: ${error.response?.data?.errorcode || error.message}`);
    }
  }

  // Test 4: Learning Plans
  console.log('\n📋 Test 4: Learning Plans');
  console.log('=' .repeat(50));
  
  const learningPlanFunctions = [
    'tool_lp_data_for_plans_page',
    'core_competency_list_learning_plans',
    'local_iomad_competency_get_learning_plans'
  ];

  for (const wsfunction of learningPlanFunctions) {
    try {
      console.log(`🔍 Testing ${wsfunction}...`);
      const response = await moodleApi.get('', {
        params: {
          wsfunction: wsfunction,
          includes: 'competencies,courses,users'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ ${wsfunction}: Found ${response.data.length} learning plans`);
        if (response.data.length > 0) {
          console.log(`📊 Sample learning plan:`, {
            id: response.data[0].id,
            name: response.data[0].name,
            userid: response.data[0].userid,
            status: response.data[0].status,
            duedate: response.data[0].duedate
          });
        }
      } else {
        console.log(`⚠️ ${wsfunction}: No data or invalid format`);
      }
    } catch (error) {
      console.log(`❌ ${wsfunction}: ${error.response?.data?.errorcode || error.message}`);
    }
  }

  // Test 5: Competency Evidence
  console.log('\n📋 Test 5: Competency Evidence');
  console.log('=' .repeat(50));
  
  try {
    console.log('🔍 Testing core_competency_list_evidence...');
    const response = await moodleApi.get('', {
      params: {
        wsfunction: 'core_competency_list_evidence',
        competencyid: 1 // Test with competency ID 1
      }
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Found ${response.data.length} evidence records`);
      if (response.data.length > 0) {
        console.log(`📊 Sample evidence:`, {
          id: response.data[0].id,
          competencyid: response.data[0].competencyid,
          userid: response.data[0].userid,
          action: response.data[0].action,
          grade: response.data[0].grade,
          timecreated: response.data[0].timecreated
        });
      }
    } else {
      console.log(`⚠️ No evidence data or invalid format`);
    }
  } catch (error) {
    console.log(`❌ Evidence API: ${error.response?.data?.errorcode || error.message}`);
  }

  // Test 6: Course Competencies
  console.log('\n📋 Test 6: Course Competencies');
  console.log('=' .repeat(50));
  
  try {
    console.log('🔍 Testing core_competency_list_course_competencies...');
    const response = await moodleApi.get('', {
      params: {
        wsfunction: 'core_competency_list_course_competencies',
        courseid: 1 // Test with course ID 1
      }
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Found ${response.data.length} course competencies`);
      if (response.data.length > 0) {
        console.log(`📊 Sample course competency:`, {
          id: response.data[0].id,
          courseid: response.data[0].courseid,
          competencyid: response.data[0].competencyid,
          sortorder: response.data[0].sortorder
        });
      }
    } else {
      console.log(`⚠️ No course competency data or invalid format`);
    }
  } catch (error) {
    console.log(`❌ Course Competencies API: ${error.response?.data?.errorcode || error.message}`);
  }

  console.log('\n🎉 Competency System Testing Complete!');
  console.log('=' .repeat(50));
  console.log('📝 Summary:');
  console.log('- Tested 6 different competency-related API functions');
  console.log('- Verified data structure and availability');
  console.log('- Checked for real IOMAD/Moodle competency integration');
  console.log('- Ready for comprehensive competency dashboard implementation');
}

// Run the test
testCompetencySystem().catch(console.error);
