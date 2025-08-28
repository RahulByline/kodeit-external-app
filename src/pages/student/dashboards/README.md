# Student Dashboard Components

This directory contains the separated dashboard components for different grade levels in the KODEIT platform.

## Structure

```
src/pages/student/dashboards/
├── G1G3Dashboard.tsx      # Dashboard for Grades 1-3
├── G4G7Dashboard.tsx      # Dashboard for Grades 4-7  
├── G8PlusDashboard.tsx    # Dashboard for Grades 8+
├── index.ts              # Export file for easy importing
└── README.md             # This documentation file
```

## Components

### G1G3Dashboard.tsx
- **Target Audience**: Students in Grades 1-3
- **Features**: 
  - Simplified, colorful interface
  - Tab-based navigation (Dashboard, Courses, Lessons, Activities, Achievements, Schedule)
  - Quick tools sidebar
  - Progress tracking with visual indicators
  - Age-appropriate content and interactions

### G4G7Dashboard.tsx
- **Target Audience**: Students in Grades 4-7
- **Features**:
  - Intermediate complexity interface
  - Exam-focused layout
  - Schedule management
  - Learning modules with progress tracking
  - Achievement system

### G8PlusDashboard.tsx
- **Target Audience**: Students in Grades 8+
- **Features**:
  - Advanced dashboard with comprehensive data
  - Real-time course progress
  - Detailed activity tracking
  - Programming tools integration
  - Professional-grade interface

## Usage

The main `StudentDashboard.tsx` component automatically determines which dashboard to render based on the student's grade level:

```typescript
import { G1G3Dashboard, G4G7Dashboard, G8PlusDashboard } from './student/dashboards';

// The main component handles the logic
const renderGradeBasedDashboard = () => {
  const dashboardProps = {
    userCourses,
    courseProgress,
    studentActivities,
    userAssignments
  };

  switch (dashboardType) {
    case 'G1_G3':
      return <G1G3Dashboard {...dashboardProps} />;
    case 'G4_G7':
      return <G4G7Dashboard {...dashboardProps} />;
    case 'G8_PLUS':
    default:
      return <G8PlusDashboard {...dashboardProps} />;
  }
};
```

## Benefits of Separation

1. **Maintainability**: Each dashboard can be developed and maintained independently
2. **Code Clarity**: Easier to understand and debug specific grade-level functionality
3. **Merge Conflicts**: Reduced conflicts when multiple developers work on different dashboards
4. **Performance**: Smaller bundle sizes when only loading the required dashboard
5. **Scalability**: Easy to add new grade-specific features without affecting other dashboards

## Data Flow

All dashboards receive the same data props:
- `userCourses`: Array of enrolled courses
- `courseProgress`: Course completion data
- `studentActivities`: Student activity tracking
- `userAssignments`: Assignment data

Each dashboard processes and displays this data according to its target audience's needs.

## Adding New Features

To add a new feature to a specific grade level:

1. Identify the target dashboard component
2. Add the feature to that component only
3. Test with the appropriate grade level
4. Update this documentation if needed

## Grade Level Determination

The grade level is determined by:
1. Extracting grade from cohort name
2. Using grade mapping utilities
3. Defaulting to G8+ if no grade is found

See `src/utils/gradeCohortMapping.ts` for the mapping logic.
