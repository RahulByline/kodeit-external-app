const axios = require('axios');

// Moodle API Configuration
const API_BASE_URL = 'https://kodeit.legatoserver.com/webservice/rest/server.php';
const API_TOKEN = '2eabaa23e0cf9a5442be25613c41abf5';

// Create axios instance for Moodle API
const moodleApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include Moodle token
moodleApi.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    wstoken: API_TOKEN,
    moodlewsrestformat: 'json',
  };
  return config;
});

async function testGetAllCourses() {
  try {
    console.log('🔄 Testing getAllCourses API...');
    
    // First, test basic site info
    console.log('📡 Step 1: Testing site info...');
    const siteInfoResponse = await moodleApi.get('', {
      params: {
        wsfunction: 'core_webservice_get_site_info',
      },
    });
    console.log('✅ Site info successful:', siteInfoResponse.data);

    // Test getAllCourses
    console.log('📚 Step 2: Testing getAllCourses...');
    const coursesResponse = await moodleApi.get('', {
      params: {
        wsfunction: 'core_course_get_courses',
      },
    });

    if (coursesResponse.data && Array.isArray(coursesResponse.data)) {
      const courses = coursesResponse.data.filter(course => course.visible !== 0);
      console.log(`✅ getAllCourses successful: Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        console.log('📋 First course sample:', {
          id: courses[0].id,
          fullname: courses[0].fullname,
          shortname: courses[0].shortname,
          visible: courses[0].visible,
          categoryid: courses[0].categoryid
        });
      }
      
      // Test detailed course fetch for first course
      if (courses.length > 0) {
        console.log('🔍 Step 3: Testing detailed course fetch...');
        const detailedResponse = await moodleApi.get('', {
          params: {
            wsfunction: 'core_course_get_courses_by_field',
            field: 'id',
            value: courses[0].id.toString()
          },
        });

        if (detailedResponse.data && detailedResponse.data.courses && detailedResponse.data.courses.length > 0) {
          const detailedCourse = detailedResponse.data.courses[0];
          console.log('✅ Detailed course fetch successful:', {
            id: detailedCourse.id,
            fullname: detailedCourse.fullname,
            courseimage: detailedCourse.courseimage,
            overviewfiles: detailedCourse.overviewfiles?.length || 0,
            summaryfiles: detailedCourse.summaryfiles?.length || 0
          });
        } else {
          console.log('⚠️ Detailed course fetch returned no data');
        }
      }
    } else {
      console.log('⚠️ getAllCourses returned unexpected data format:', coursesResponse.data);
    }

  } catch (error) {
    console.error('❌ Error testing getAllCourses:', error.response?.data || error.message);
  }
}

// Run the test
testGetAllCourses();
