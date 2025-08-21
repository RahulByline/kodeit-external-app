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

async function testCourseImages() {
  console.log('🔍 Testing Course Image Fetching...\n');

  try {
    // Test 1: Get basic course list
    console.log('📋 Test 1: Basic Course List');
    console.log('=' .repeat(50));
    
    const basicResponse = await moodleApi.get('', {
      params: {
        wsfunction: 'core_course_get_courses'
      }
    });

    if (basicResponse.data && Array.isArray(basicResponse.data)) {
      console.log(`✅ Found ${basicResponse.data.length} courses`);
      
      // Show first 3 courses
      basicResponse.data.slice(0, 3).forEach((course, index) => {
        console.log(`📚 Course ${index + 1}: "${course.fullname}"`);
        console.log(`   ID: ${course.id}`);
        console.log(`   Category: ${course.categoryname || 'Unknown'}`);
        console.log(`   Course Image: ${course.courseimage || 'None'}`);
        console.log(`   Overview Files: ${course.overviewfiles ? course.overviewfiles.length : 0}`);
        console.log(`   Summary Files: ${course.summaryfiles ? course.summaryfiles.length : 0}`);
        console.log('');
      });
    } else {
      console.log('❌ No courses found or invalid format');
    }

    // Test 2: Get detailed course information
    console.log('📋 Test 2: Detailed Course Information');
    console.log('=' .repeat(50));
    
    if (basicResponse.data && basicResponse.data.length > 0) {
      const firstCourse = basicResponse.data[0];
      console.log(`🔍 Getting detailed info for course: "${firstCourse.fullname}"`);
      
      const detailedResponse = await moodleApi.get('', {
        params: {
          wsfunction: 'core_course_get_courses_by_field',
          field: 'id',
          value: firstCourse.id.toString()
        }
      });

      if (detailedResponse.data && detailedResponse.data.courses && detailedResponse.data.courses.length > 0) {
        const detailedCourse = detailedResponse.data.courses[0];
        console.log('✅ Detailed course data:');
        console.log(`   ID: ${detailedCourse.id}`);
        console.log(`   Full Name: ${detailedCourse.fullname}`);
        console.log(`   Short Name: ${detailedCourse.shortname}`);
        console.log(`   Category: ${detailedCourse.categoryname || 'Unknown'}`);
        console.log(`   Course Image: ${detailedCourse.courseimage || 'None'}`);
        console.log(`   Overview Files: ${detailedCourse.overviewfiles ? detailedCourse.overviewfiles.length : 0}`);
        if (detailedCourse.overviewfiles && detailedCourse.overviewfiles.length > 0) {
          console.log(`   First Overview File URL: ${detailedCourse.overviewfiles[0].fileurl}`);
        }
        console.log(`   Summary Files: ${detailedCourse.summaryfiles ? detailedCourse.summaryfiles.length : 0}`);
        if (detailedCourse.summaryfiles && detailedCourse.summaryfiles.length > 0) {
          console.log(`   First Summary File URL: ${detailedCourse.summaryfiles[0].fileurl}`);
        }
      } else {
        console.log('❌ Could not fetch detailed course information');
      }
    }

    // Test 3: Test image URL validation
    console.log('\n📋 Test 3: Image URL Validation');
    console.log('=' .repeat(50));
    
    const testUrls = [
      'https://kodeit.legatoserver.com/webservice/pluginfile.php/123/course/overviewfiles/image.jpg',
      'https://kodeit.legatoserver.com/pluginfile.php/123/course/overviewfiles/image.jpg',
      '/card1.webp',
      'https://example.com/image.jpg',
      undefined,
      null
    ];

    testUrls.forEach((url, index) => {
      const validatedUrl = validateImageUrl(url);
      console.log(`Test ${index + 1}: "${url}" -> "${validatedUrl}"`);
    });

  } catch (error) {
    console.error('❌ Error testing course images:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

function validateImageUrl(url) {
  if (!url) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // For Moodle URLs, prefer the regular pluginfile.php over webservice/pluginfile.php
    if (url.includes('webservice/pluginfile.php')) {
      // Convert webservice URL to regular pluginfile URL
      const regularUrl = url.replace('webservice/pluginfile.php', 'pluginfile.php');
      console.log(`🔄 Converting webservice URL to regular URL: ${url} -> ${regularUrl}`);
      return regularUrl;
    }
    return url;
  }
  
  // If it's a relative path, make it absolute
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a Moodle file URL, ensure it has the token
  if (url.includes('webservice/rest/server.php')) {
    return url;
  }
  
  // Default fallback
  return '/placeholder.svg';
}

testCourseImages();
