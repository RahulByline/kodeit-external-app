// Comprehensive Grade Detection Test
// Run this in browser console to test grade detection logic

console.log('🧪 COMPREHENSIVE GRADE DETECTION TEST');
console.log('=====================================');

// Test cases for different scenarios
const testCases = [
  // G1-G3 Students (should get G1_G3 dashboard)
  { username: 'user1', cohortName: 'Grade 1', expectedGrade: 1, expectedDashboard: 'G1_G3', description: 'G1 Student' },
  { username: 'user2', cohortName: 'Grade 2', expectedGrade: 2, expectedDashboard: 'G1_G3', description: 'G2 Student' },
  { username: 'user3', cohortName: 'Grade 3', expectedGrade: 3, expectedDashboard: 'G1_G3', description: 'G3 Student' },
  { username: 'student1', cohortName: 'G1', expectedGrade: 1, expectedDashboard: 'G1_G3', description: 'G1 Student (short)' },
  
  // G4-G7 Students (should get G4_G7 dashboard)
  { username: 'user4', cohortName: 'Grade 4', expectedGrade: 4, expectedDashboard: 'G4_G7', description: 'G4 Student' },
  { username: 'user5', cohortName: 'Grade 5', expectedGrade: 5, expectedDashboard: 'G4_G7', description: 'G5 Student' },
  { username: 'user6', cohortName: 'Grade 6', expectedGrade: 6, expectedDashboard: 'G4_G7', description: 'G6 Student' },
  { username: 'user7', cohortName: 'Grade 7', expectedGrade: 7, expectedDashboard: 'G4_G7', description: 'G7 Student' },
  
  // G8+ Students (should get G8_PLUS dashboard)
  { username: 'user8', cohortName: 'Grade 8', expectedGrade: 8, expectedDashboard: 'G8_PLUS', description: 'G8 Student' },
  { username: 'user9', cohortName: 'Grade 9', expectedGrade: 9, expectedDashboard: 'G8_PLUS', description: 'G9 Student' },
  { username: 'user10', cohortName: 'Grade 10', expectedGrade: 10, expectedDashboard: 'G8_PLUS', description: 'G10 Student' },
  { username: 'user11', cohortName: 'Grade 11', expectedGrade: 11, expectedDashboard: 'G8_PLUS', description: 'G11 Student' },
  { username: 'user12', cohortName: 'Grade 12', expectedGrade: 12, expectedDashboard: 'G8_PLUS', description: 'G12 Student' },
  
  // Edge cases
  { username: 'teacher1', cohortName: 'Teachers', expectedGrade: 8, expectedDashboard: 'G8_PLUS', description: 'Teacher (no grade)' },
  { username: 'admin1', cohortName: 'Administrators', expectedGrade: 8, expectedDashboard: 'G8_PLUS', description: 'Admin (no grade)' },
];

// Import the functions (you'll need to adjust this based on your actual implementation)
// const { extractGradeFromCohortName, getDashboardTypeByGrade } = require('./src/utils/gradeCohortMapping.ts');

// Mock the functions for testing
const extractGradeFromCohortName = (cohortName) => {
  if (!cohortName) return null;
  
  const patterns = [
    /grade\s*(\d+)/i,
    /g(\d+)/i,
    /user(\d+)/i,
    /student(\d+)/i,
    /(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = cohortName.match(pattern);
    if (match) {
      const grade = parseInt(match[1]);
      if (grade >= 1 && grade <= 12) {
        return grade;
      }
    }
  }
  return null;
};

const getDashboardTypeByGrade = (grade) => {
  if (grade >= 1 && grade <= 3) return 'G1_G3';
  if (grade >= 4 && grade <= 7) return 'G4_G7';
  return 'G8_PLUS';
};

console.log('📊 TESTING GRADE DETECTION LOGIC');
console.log('================================');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`\n🧪 Test ${index + 1}: ${testCase.description}`);
  console.log(`   Username: "${testCase.username}"`);
  console.log(`   Cohort: "${testCase.cohortName}"`);
  
  // Test grade extraction from cohort name
  const extractedGrade = extractGradeFromCohortName(testCase.cohortName);
  const dashboardType = getDashboardTypeByGrade(extractedGrade || 8);
  
  const gradeCorrect = extractedGrade === testCase.expectedGrade;
  const dashboardCorrect = dashboardType === testCase.expectedDashboard;
  const testPassed = gradeCorrect && dashboardCorrect;
  
  console.log(`   Expected Grade: ${testCase.expectedGrade}, Got: ${extractedGrade} ${gradeCorrect ? '✅' : '❌'}`);
  console.log(`   Expected Dashboard: ${testCase.expectedDashboard}, Got: ${dashboardType} ${dashboardCorrect ? '✅' : '❌'}`);
  console.log(`   Test Result: ${testPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  if (testPassed) passedTests++;
});

console.log(`\n📈 TEST SUMMARY`);
console.log(`===============`);
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

// Show dashboard differences
console.log(`\n🎨 DASHBOARD DIFFERENCES`);
console.log(`========================`);

const dashboardTypes = ['G1_G3', 'G4_G7', 'G8_PLUS'];
dashboardTypes.forEach(type => {
  console.log(`\n📱 ${type} Dashboard:`);
  switch (type) {
    case 'G1_G3':
      console.log(`   - Simplified, visual interface`);
      console.log(`   - Large buttons and clear icons`);
      console.log(`   - Basic activities and games`);
      console.log(`   - No complex programming concepts`);
      console.log(`   - Age-appropriate content (6-9 years)`);
      break;
    case 'G4_G7':
      console.log(`   - Intermediate interface`);
      console.log(`   - Mixed visual and text content`);
      console.log(`   - Introduction to programming basics`);
      console.log(`   - More complex assignments`);
      console.log(`   - Age-appropriate content (10-13 years)`);
      break;
    case 'G8_PLUS':
      console.log(`   - Full-featured interface`);
      console.log(`   - Advanced programming concepts`);
      console.log(`   - Complex assignments and projects`);
      console.log(`   - Professional development tools`);
      console.log(`   - Age-appropriate content (14+ years)`);
      break;
  }
});

console.log(`\n🔍 DEBUGGING COMMANDS`);
console.log(`=====================`);
console.log(`// Check current user data:`);
console.log(`console.log('Current user:', localStorage.getItem('currentUser'));`);
console.log(`// Check cached cohort data:`);
console.log(`console.log('Cached cohort:', localStorage.getItem('student_dashboard_studentCohort'));`);
console.log(`// Clear all cache:`);
console.log(`localStorage.clear(); window.location.reload();`);
