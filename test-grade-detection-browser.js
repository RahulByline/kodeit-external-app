// Browser-based Grade Detection Test
// Run this in the browser console to test grade detection logic

console.log('🧪 BROWSER GRADE DETECTION TEST');
console.log('================================');

// Test the grade detection functions
const testGradeDetection = () => {
  console.log('🔍 Testing Grade Detection Functions');
  console.log('===================================');
  
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

  // Mock the functions for testing (these should match the actual implementation)
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
    
    // Test enhanced detection
    const detectedGrade = detectGradeFromMultipleSources(testCase.cohortName, testCase.username, null);
    const enhancedDashboardType = getDashboardTypeByGrade(detectedGrade || 8);
    
    const gradeCorrect = extractedGrade === testCase.expectedGrade;
    const dashboardCorrect = dashboardType === testCase.expectedDashboard;
    const enhancedCorrect = detectedGrade === testCase.expectedGrade && enhancedDashboardType === testCase.expectedDashboard;
    const testPassed = gradeCorrect && dashboardCorrect && enhancedCorrect;
    
    console.log(`   Expected Grade: ${testCase.expectedGrade}, Got: ${extractedGrade} ${gradeCorrect ? '✅' : '❌'}`);
    console.log(`   Expected Dashboard: ${testCase.expectedDashboard}, Got: ${dashboardType} ${dashboardCorrect ? '✅' : '❌'}`);
    console.log(`   Enhanced Detection: ${detectedGrade} -> ${enhancedDashboardType} ${enhancedCorrect ? '✅' : '❌'}`);
    console.log(`   Test Result: ${testPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
    
    if (testPassed) passedTests++;
  });

  console.log(`\n📈 TEST SUMMARY`);
  console.log(`===============`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
};

// Test current browser state
const testCurrentState = () => {
  console.log('\n🔍 TESTING CURRENT BROWSER STATE');
  console.log('================================');
  
  // Check localStorage
  const currentUser = localStorage.getItem('currentUser');
  const cachedCohort = localStorage.getItem('student_dashboard_studentCohort');
  
  console.log('📦 Current User:', currentUser ? JSON.parse(currentUser) : 'None');
  console.log('📦 Cached Cohort:', cachedCohort ? JSON.parse(cachedCohort) : 'None');
  
  // Test with actual data
  if (currentUser) {
    const user = JSON.parse(currentUser);
    const cohort = cachedCohort ? JSON.parse(cachedCohort) : null;
    
    console.log('\n🧪 Testing with actual user data:');
    console.log('- Username:', user.username);
    console.log('- User ID:', user.id);
    console.log('- Full name:', user.fullname);
    console.log('- Cohort name:', cohort?.name || 'None');
    
    // Mock the detection function
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
      if (cohortName) {
        const cohortGrade = extractGradeFromCohortName(cohortName);
        if (cohortGrade) return cohortGrade;
      }
      
      if (username) {
        const usernameGrade = extractGradeFromCohortName(username);
        if (usernameGrade) return usernameGrade;
      }
      
      if (userId) {
        const userIdGrade = extractGradeFromCohortName(userId);
        if (userIdGrade) return userIdGrade;
      }
      
      return null;
    };

    const detectedGrade = detectGradeFromMultipleSources(
      cohort?.name,
      user.username,
      user.id?.toString()
    );
    
    const dashboardType = getDashboardTypeByGrade(detectedGrade || 8);
    
    console.log('\n🎓 Detection Results:');
    console.log('- Detected Grade:', detectedGrade || 'None (defaulting to 8)');
    console.log('- Dashboard Type:', dashboardType);
    console.log('- Grade from Cohort:', extractGradeFromCohortName(cohort?.name || ''));
    console.log('- Grade from Username:', extractGradeFromCohortName(user.username || ''));
    console.log('- Grade from User ID:', extractGradeFromCohortName(user.id?.toString() || ''));
  }
};

// Utility functions
const clearAllCache = () => {
  console.log('🧹 Clearing all grade-related cache...');
  
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('student_dashboard_') || 
      key.startsWith('studentCohort') ||
      key.includes('cohort')
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Removed:', key);
  });
  
  console.log('✅ Cache cleared. Reload the page to test fresh detection.');
};

const forceGrade = (grade) => {
  console.log(`🧪 Forcing grade ${grade} for testing...`);
  
  // Clear existing cache
  clearAllCache();
  
  // Set test data
  const testCohort = {
    id: 'test',
    name: `Grade ${grade}`,
    idnumber: `G${grade}`,
    description: `Test cohort for grade ${grade}`
  };
  
  localStorage.setItem('student_dashboard_studentCohort', JSON.stringify(testCohort));
  console.log(`✅ Grade ${grade} test data set. Reload the page to see the effect.`);
};

// Show available commands
console.log('\n🔧 AVAILABLE COMMANDS');
console.log('====================');
console.log('testGradeDetection() - Run comprehensive grade detection tests');
console.log('testCurrentState() - Test with current browser data');
console.log('clearAllCache() - Clear all grade-related cache');
console.log('forceGrade(grade) - Force a specific grade for testing (e.g., forceGrade(1))');
console.log('');

// Auto-run basic tests
testGradeDetection();
testCurrentState();
