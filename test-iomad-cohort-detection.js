// IOMAD Cohort Grade Detection Test Script
// Run this in browser console to debug grade detection issues

console.log('🧪 IOMAD COHORT GRADE DETECTION TEST');
console.log('=====================================');

// Test the grade extraction function
const testGradeExtraction = (cohortName) => {
  console.log(`🔍 Testing grade extraction for: "${cohortName}"`);
  
  const patterns = [
    /grade\s*(\d+)/i,
    /g(\d+)/i,
    /user(\d+)/i,
    /student(\d+)/i,
    /(\d+)/i
  ];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = cohortName.match(pattern);
    if (match) {
      const grade = parseInt(match[1]);
      console.log(`✅ Pattern ${i + 1} matched: ${pattern.source} -> Grade: ${grade}`);
      if (grade >= 1 && grade <= 12) {
        console.log(`✅ Valid grade found: ${grade}`);
        return grade;
      } else {
        console.log(`❌ Grade ${grade} is outside valid range (1-12)`);
      }
    } else {
      console.log(`❌ Pattern ${i + 1} did not match: ${pattern.source}`);
    }
  }
  console.log(`❌ No valid grade found in: "${cohortName}"`);
  return null;
};

// Test dashboard type determination
const testDashboardType = (grade) => {
  console.log(`🎓 Testing dashboard type for grade: ${grade}`);
  
  let dashboardType;
  if (grade >= 1 && grade <= 3) {
    dashboardType = 'G1_G3';
  } else if (grade >= 4 && grade <= 7) {
    dashboardType = 'G4_G7';
  } else {
    dashboardType = 'G8_PLUS';
  }
  
  console.log(`✅ Dashboard type determined: ${dashboardType}`);
  return dashboardType;
};

// Test cases for different cohort names
const testCases = [
  'Grade 1',
  'Grade 11',
  'G1',
  'G11',
  'user1',
  'user11',
  'student1',
  'student11',
  'Class 1',
  'Class 11',
  'Year 1',
  'Year 11',
  '1st Grade',
  '11th Grade',
  'Teachers',
  'Administrators',
  'No Grade Info'
];

console.log('📊 TESTING GRADE EXTRACTION');
console.log('============================');

testCases.forEach((cohortName, index) => {
  console.log(`\n🧪 Test ${index + 1}: "${cohortName}"`);
  const grade = testGradeExtraction(cohortName);
  if (grade) {
    const dashboardType = testDashboardType(grade);
    console.log(`📱 Expected Dashboard: ${dashboardType}`);
  }
  console.log('─'.repeat(50));
});

// Check current browser state
console.log('\n🔍 CURRENT BROWSER STATE');
console.log('========================');

// Check localStorage for cached data
console.log('\n📦 LocalStorage Cache:');
const cacheKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.startsWith('student_dashboard_') ||
    key.startsWith('currentUser') ||
    key.startsWith('moodle_token')
  )) {
    cacheKeys.push(key);
    try {
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, value ? JSON.parse(value) : 'null');
    } catch (e) {
      console.log(`  ${key}: [Error parsing JSON]`);
    }
  }
}

if (cacheKeys.length === 0) {
  console.log('  No cached data found');
}

// Check if we're in a React component context
console.log('\n🎯 React Context:');
if (typeof window !== 'undefined' && window.React) {
  console.log('  React is available');
} else {
  console.log('  React not detected in global scope');
}

// Debug commands for manual testing
console.log('\n🔧 DEBUG COMMANDS');
console.log('==================');

console.log(`
// Test specific cohort name:
testGradeExtraction('Grade 11');

// Clear all cached data:
localStorage.clear();

// Check current user:
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser') || '{}'));

// Check cached cohort:
console.log('Cached cohort:', JSON.parse(localStorage.getItem('student_dashboard_studentCohort') || '{}'));

// Force specific grade (for testing):
localStorage.setItem('student_dashboard_studentGrade', '11');
localStorage.setItem('student_dashboard_dashboardType', 'G8_PLUS');
window.location.reload();
`);

// Expected behavior summary
console.log('\n📋 EXPECTED BEHAVIOR SUMMARY');
console.log('=============================');

console.log(`
✅ Grade 1-3 students should see G1_G3 dashboard (Early Elementary)
✅ Grade 4-7 students should see G4_G7 dashboard (Upper Elementary)  
✅ Grade 8+ students should see G8_PLUS dashboard (High School)

🔍 Debugging Steps:
1. Check console logs for cohort detection
2. Verify grade extraction is working
3. Confirm dashboard type is set correctly
4. Check if cached data is interfering

🐛 Common Issues:
- Cached data not cleared
- Cohort name doesn't match patterns
- API not returning correct cohort
- Grade extraction failing
`);

console.log('\n✅ Test script completed. Check the console output above for debugging information.');
