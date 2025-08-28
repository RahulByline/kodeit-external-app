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
  const mapping = GRADE_COHORT_MAPPING.find(m => grade >= m.minGrade && grade <= m.maxGrade);
  return mapping?.dashboardType || 'G4_G7'; // Default to G4-G7 dashboard
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
 * @param cohortName - Name of the cohort
 * @returns Grade number or null if not found
 */
export const extractGradeFromCohortName = (cohortName: string): number | null => {
  // Common patterns for grade-based cohort names
  const patterns = [
    /grade\s*(\d+)/i,
    /g(\d+)/i,
    /class\s*(\d+)/i,
    /year\s*(\d+)/i,
    /(\d+)(?:st|nd|rd|th)\s*grade/i
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
