// Test script for grade detection logic
const { extractGradeFromCohortName, getDashboardTypeByGrade } = require('./src/utils/gradeCohortMapping.ts');

// Test cases for G1-G3 students
const testCases = [
  { input: 'Grade 1', expected: 1, dashboardType: 'G1_G3' },
  { input: 'Grade 2', expected: 2, dashboardType: 'G1_G3' },
  { input: 'Grade 3', expected: 3, dashboardType: 'G1_G3' },
  { input: 'G1', expected: 1, dashboardType: 'G1_G3' },
  { input: 'G2', expected: 2, dashboardType: 'G1_G3' },
  { input: 'G3', expected: 3, dashboardType: 'G1_G3' },
  { input: 'user1', expected: 1, dashboardType: 'G1_G3' },
  { input: 'user2', expected: 2, dashboardType: 'G1_G3' },
  { input: 'user3', expected: 3, dashboardType: 'G1_G3' },
  { input: 'student1', expected: 1, dashboardType: 'G1_G3' },
  { input: 'student2', expected: 2, dashboardType: 'G1_G3' },
  { input: 'student3', expected: 3, dashboardType: 'G1_G3' },
];

console.log('🧪 Testing Grade Detection for G1-G3 Students');
console.log('============================================');

testCases.forEach((testCase, index) => {
  const extractedGrade = extractGradeFromCohortName(testCase.input);
  const dashboardType = getDashboardTypeByGrade(extractedGrade || 8);
  
  const passed = extractedGrade === testCase.expected && dashboardType === testCase.dashboardType;
  
  console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'}`);
  console.log(`  Input: "${testCase.input}"`);
  console.log(`  Expected Grade: ${testCase.expected}, Got: ${extractedGrade}`);
  console.log(`  Expected Dashboard: ${testCase.dashboardType}, Got: ${dashboardType}`);
  console.log('');
});

console.log('🎯 G1-G3 Dashboard Features:');
console.log('- Simplified, age-appropriate content');
console.log('- Filtered out complex programming concepts');
console.log('- Visual, interactive learning materials');
console.log('- Grade-specific navigation and activities');
