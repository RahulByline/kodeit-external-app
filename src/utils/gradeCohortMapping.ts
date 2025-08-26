// Grade-based cohort mapping for dashboard UI selection
export interface GradeCohortMapping {
  gradeRange: string;
  dashboardType: 'G1_G3' | 'G4_G7' | 'G8_PLUS';
  description: string;
  minGrade: number;
  maxGrade: number;
}

export const GRADE_COHORT_MAPPING: GradeCohortMapping[] = [
  {
    gradeRange: 'Grade 1-3',
    dashboardType: 'G1_G3',
    description: 'Early Elementary (Ages 6-9)',
    minGrade: 1,
    maxGrade: 3
  },
  {
    gradeRange: 'Grade 4-7',
    dashboardType: 'G4_G7',
    description: 'Upper Elementary to Middle School (Ages 10-13)',
    minGrade: 4,
    maxGrade: 7
  },
  {
    gradeRange: 'Grade 8+',
    dashboardType: 'G8_PLUS',
    description: 'High School and Above (Ages 14+)',
    minGrade: 8,
    maxGrade: 12
  }
];

/**
 * Determine the appropriate dashboard type based on student's grade
 * @param grade - Student's grade level (1-12)
 * @returns Dashboard type to render
 */
export const getDashboardTypeByGrade = (grade: number): 'G1_G3' | 'G4_G7' | 'G8_PLUS' => {
  console.log('🎓 getDashboardTypeByGrade called with grade:', grade);
  
  if (!grade || grade < 1 || grade > 12) {
    console.warn('⚠️ Invalid grade provided:', grade, 'defaulting to G8_PLUS');
    return 'G8_PLUS';
  }
  
  const mapping = GRADE_COHORT_MAPPING.find(m => grade >= m.minGrade && grade <= m.maxGrade);
  const result = mapping?.dashboardType || 'G8_PLUS';
  
  console.log('🎓 Grade', grade, 'maps to dashboard type:', result);
  return result;
};

/**
 * Get grade cohort mapping information
 * @param grade - Student's grade level
 * @returns Grade cohort mapping object
 */
export const getGradeCohortInfo = (grade: number): GradeCohortMapping | null => {
  return GRADE_COHORT_MAPPING.find(m => grade >= m.minGrade && grade <= m.maxGrade) || null;
};

/**
 * Extract grade from cohort name (if cohort names contain grade information)
 * @param cohortName - Name of the cohort or username
 * @returns Grade number or null if not found
 */
export const extractGradeFromCohortName = (cohortName: string): number | null => {
  if (!cohortName) {
    console.log('❌ No cohort name provided');
    return null;
  }
  
  console.log('🔍 Extracting grade from:', cohortName);
  
  // Common patterns for grade-based cohort names
  const patterns = [
    /grade\s*(\d+)/i,
    /g(\d+)/i,
    /class\s*(\d+)/i,
    /year\s*(\d+)/i,
    /(\d+)(?:st|nd|rd|th)\s*grade/i,
    /grade\s*(\d+)/i,
    /(\d+)\s*grade/i,
    /user(\d+)/i, // For usernames like user1, user2, etc.
    /student(\d+)/i, // For usernames like student1, student2, etc.
    /(\d+)/i // Simple number pattern (fallback)
  ];

  for (const pattern of patterns) {
    const match = cohortName.match(pattern);
    if (match) {
      const grade = parseInt(match[1]);
      console.log('🔍 Pattern matched:', pattern.source, 'Grade extracted:', grade);
      if (grade >= 1 && grade <= 12) {
        console.log('✅ Valid grade found:', grade);
        return grade;
      } else {
        console.log('⚠️ Grade out of range (1-12):', grade);
      }
    }
  }

  console.log('❌ No valid grade found in:', cohortName);
  return null;
};

/**
 * Enhanced grade detection that tries multiple sources
 * @param cohortName - Cohort name
 * @param username - Username
 * @param userId - User ID
 * @returns Detected grade or null
 */
export const detectGradeFromMultipleSources = (
  cohortName?: string, 
  username?: string, 
  userId?: string
): number | null => {
  console.log('🔍 Enhanced grade detection for:', { cohortName, username, userId });
  
  // Priority 1: Try cohort name first
  if (cohortName) {
    const cohortGrade = extractGradeFromCohortName(cohortName);
    if (cohortGrade) {
      console.log('✅ Grade detected from cohort name:', cohortGrade);
      return cohortGrade;
    }
  }
  
  // Priority 2: Try username
  if (username) {
    const usernameGrade = extractGradeFromCohortName(username);
    if (usernameGrade) {
      console.log('✅ Grade detected from username:', usernameGrade);
      return usernameGrade;
    }
  }
  
  // Priority 3: Try user ID as fallback (for testing)
  if (userId) {
    const userIdGrade = extractGradeFromCohortName(userId);
    if (userIdGrade) {
      console.log('✅ Grade detected from user ID:', userIdGrade);
      return userIdGrade;
    }
  }
  
  console.log('❌ No grade detected from any source');
  return null;
};

/**
 * Clear all grade-related cached data
 */
export const clearGradeCache = (): void => {
  console.log('🧹 Clearing grade-related cache...');
  
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
    console.log('🗑️ Removed cached key:', key);
  });
  
  console.log('✅ Grade cache cleared');
};

/**
 * Debug function to log current grade detection state
 */
export const debugGradeDetection = (): void => {
  console.log('🔍 DEBUG: Current Grade Detection State');
  console.log('=====================================');
  
  // Check cached data
  const cachedCohort = localStorage.getItem('student_dashboard_studentCohort');
  const currentUser = localStorage.getItem('currentUser');
  
  console.log('📦 Cached cohort:', cachedCohort ? JSON.parse(cachedCohort) : 'None');
  console.log('👤 Current user:', currentUser ? JSON.parse(currentUser) : 'None');
  
  // Test grade extraction on cached data
  if (cachedCohort) {
    const cohort = JSON.parse(cachedCohort);
    if (cohort.name) {
      const grade = extractGradeFromCohortName(cohort.name);
      const dashboardType = getDashboardTypeByGrade(grade || 8);
      console.log('🎓 Cached cohort analysis:', {
        cohortName: cohort.name,
        extractedGrade: grade,
        dashboardType
      });
    }
  }
  
  console.log('=====================================');
};
