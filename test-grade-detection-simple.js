// Simple Grade Detection Test
// This script tests the core grade detection logic

console.log('🧪 SIMPLE GRADE DETECTION TEST');
console.log('==============================');

// Mock the grade detection functions (copy from gradeCohortMapping.ts)
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

const detectGradeFromMultipleSources = (cohortName, username, userId) => {
  // Priority 1: Try cohort name first
  if (cohortName) {
    const cohortGrade = extractGradeFromCohortName(cohortName);
    if (cohortGrade) return cohortGrade;
  }
  
  // Priority 2: Try username
  if (username) {
    const usernameGrade = extractGradeFromCohortName(username);
    if (usernameGrade) return usernameGrade;
  }
  
  // Priority 3: Try user ID as fallback
  if (userId) {
    const userIdGrade = extractGradeFromCohortName(userId);
    if (userIdGrade) return userIdGrade;
  }
  
  return null;
};

// Test cases
const testCases = [
  { input: 'Grade 1', expected: 1, dashboard: 'G1_G3', description: 'Grade 1 from cohort' },
  { input: 'user1', expected: 1, dashboard: 'G1_G3', description: 'Grade 1 from username' },
  { input: 'student2', expected: 2, dashboard: 'G1_G3', description: 'Grade 2 from username' },
  { input: 'Grade 4', expected: 4, dashboard: 'G4_G7', description: 'Grade 4 from cohort' },
  { input: 'user7', expected: 7, dashboard: 'G4_G7', description: 'Grade 7 from username' },
  { input: 'Grade 8', expected: 8, dashboard: 'G8_PLUS', description: 'Grade 8 from cohort' },
  { input: 'user11', expected: 11, dashboard: 'G8_PLUS', description: 'Grade 11 from username' },
  { input: 'Teachers', expected: null, dashboard: 'G8_PLUS', description: 'No grade in cohort' },
];

console.log('📊 Testing Grade Detection Logic');
console.log('================================');

let passed = 0;
let total = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`\n🧪 Test ${index + 1}: ${testCase.description}`);
  console.log(`   Input: "${testCase.input}"`);
  
  const extractedGrade = extractGradeFromCohortName(testCase.input);
  const dashboardType = getDashboardTypeByGrade(extractedGrade || 8);
  
  const gradeCorrect = extractedGrade === testCase.expected;
  const dashboardCorrect = dashboardType === testCase.dashboard;
  const testPassed = gradeCorrect && dashboardCorrect;
  
  console.log(`   Expected Grade: ${testCase.expected}, Got: ${extractedGrade} ${gradeCorrect ? '✅' : '❌'}`);
  console.log(`   Expected Dashboard: ${testCase.dashboard}, Got: ${dashboardType} ${dashboardCorrect ? '✅' : '❌'}`);
  console.log(`   Test Result: ${testPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  if (testPassed) passed++;
});

console.log(`\n📈 SUMMARY`);
console.log(`==========`);
console.log(`Total Tests: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${total - passed}`);
console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

// Test enhanced detection
console.log(`\n🔍 Testing Enhanced Detection`);
console.log(`============================`);

const enhancedTests = [
  { cohort: 'Grade 1', username: 'user2', userId: '3', expected: 1, description: 'Should prioritize cohort over username' },
  { cohort: 'Teachers', username: 'user4', userId: '5', expected: 4, description: 'Should use username when cohort has no grade' },
  { cohort: 'Admins', username: 'admin1', userId: '6', expected: 6, description: 'Should use user ID when others have no grade' },
  { cohort: 'Grade 11', username: 'user1', userId: '2', expected: 11, description: 'Should prioritize cohort over others' },
];

enhancedTests.forEach((testCase, index) => {
  console.log(`\n🧪 Enhanced Test ${index + 1}: ${testCase.description}`);
  
  const detectedGrade = detectGradeFromMultipleSources(
    testCase.cohort,
    testCase.username,
    testCase.userId
  );
  
  const testPassed = detectedGrade === testCase.expected;
  
  console.log(`   Cohort: "${testCase.cohort}", Username: "${testCase.username}", User ID: "${testCase.userId}"`);
  console.log(`   Expected: ${testCase.expected}, Got: ${detectedGrade} ${testPassed ? '✅' : '❌'}`);
});

console.log(`\n✅ Grade Detection Test Complete!`);
console.log(`\nTo test in browser:`);
console.log(`1. Copy test-grade-detection-browser.js content`);
console.log(`2. Paste in browser console`);
console.log(`3. Run testGradeDetection()`);
