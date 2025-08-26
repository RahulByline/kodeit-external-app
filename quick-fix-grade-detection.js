// QUICK FIX FOR GRADE DETECTION ISSUE
// Run this in browser console to immediately fix the dashboard inconsistency

console.log('🚨 QUICK FIX FOR GRADE DETECTION ISSUE');
console.log('=====================================');

// Step 1: Clear ALL cached data
console.log('🧹 Step 1: Clearing all cached data...');
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.startsWith('student_dashboard_') || 
    key.startsWith('studentCohort') ||
    key.includes('cohort') ||
    key.includes('grade') ||
    key === 'currentUser'
  )) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removed:', key);
});

console.log('✅ All cached data cleared');

// Step 2: Check current user data
console.log('\n🔍 Step 2: Checking current user data...');
const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
  const user = JSON.parse(currentUser);
  console.log('👤 Current user:', {
    username: user.username,
    id: user.id,
    fullname: user.fullname
  });
  
  // Step 3: Test grade detection
  console.log('\n🎓 Step 3: Testing grade detection...');
  
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

  // Test grade detection from username
  const usernameGrade = extractGradeFromCohortName(user.username);
  const dashboardType = getDashboardTypeByGrade(usernameGrade || 8);
  
  console.log('📊 Grade Detection Results:');
  console.log('- Username:', user.username);
  console.log('- Detected Grade:', usernameGrade || 'None (defaulting to 8)');
  console.log('- Dashboard Type:', dashboardType);
  
  // Step 4: Set correct test data based on username
  if (user.username && user.username.toLowerCase().includes('grade') || 
      user.username.match(/user\d+/) || user.username.match(/student\d+/)) {
    
    console.log('\n🎯 Step 4: Setting correct test data...');
    
    // Extract grade from username
    const grade = extractGradeFromCohortName(user.username);
    
    if (grade) {
      const testCohort = {
        id: 'test-fix',
        name: `Grade ${grade}`,
        idnumber: `G${grade}`,
        description: `Test cohort for grade ${grade} - Quick Fix`
      };
      
      localStorage.setItem('student_dashboard_studentCohort', JSON.stringify(testCohort));
      console.log(`✅ Set test cohort for Grade ${grade}`);
      console.log(`📱 Expected Dashboard: ${getDashboardTypeByGrade(grade)}`);
    }
  }
}

// Step 5: Provide next steps
console.log('\n🔄 Step 5: Next Steps');
console.log('=====================');
console.log('1. Reload the page: window.location.reload()');
console.log('2. Check that all browser windows show the same dashboard');
console.log('3. If still inconsistent, run this script in each browser window');
console.log('4. Use the debug buttons on the dashboard to test different grades');

// Step 6: Auto-reload option
console.log('\n🔄 Auto-reload in 3 seconds...');
setTimeout(() => {
  console.log('🔄 Reloading page...');
  window.location.reload();
}, 3000);

console.log('\n✅ Quick fix applied! Check the console for results.');
