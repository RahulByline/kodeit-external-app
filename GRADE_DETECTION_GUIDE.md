# Grade-Based Dashboard Filtering System

## Overview

The grade-based dashboard filtering system automatically detects a student's grade level and renders an appropriate dashboard interface based on their age and learning level. The system supports three dashboard types:

- **G1_G3**: Early Elementary (Grades 1-3, Ages 6-9)
- **G4_G7**: Upper Elementary to Middle School (Grades 4-7, Ages 10-13)  
- **G8_PLUS**: High School and Above (Grades 8-12, Ages 14+)

## How It Works

### 1. Grade Detection Logic

The system uses multiple sources to detect a student's grade:

1. **Cohort Name** (Primary): Extracts grade from IOMAD cohort names
2. **Username** (Secondary): Extracts grade from usernames like "user1", "student2"
3. **User ID** (Fallback): Extracts grade from user IDs for testing

### 2. Supported Patterns

The system recognizes these patterns in cohort names and usernames:

```
Grade 1, Grade 2, Grade 3...     → Grade 1, 2, 3...
G1, G2, G3...                    → Grade 1, 2, 3...
user1, user2, user3...           → Grade 1, 2, 3...
student1, student2, student3...  → Grade 1, 2, 3...
1, 2, 3...                       → Grade 1, 2, 3...
```

### 3. Dashboard Mapping

| Grade Range | Dashboard Type | Description |
|-------------|----------------|-------------|
| 1-3 | G1_G3 | Simplified, visual interface for early elementary |
| 4-7 | G4_G7 | Intermediate interface for middle school |
| 8-12 | G8_PLUS | Full-featured interface for high school |

## Implementation Details

### Core Files

- `src/utils/gradeCohortMapping.ts` - Grade detection utilities
- `src/pages/StudentDashboard.tsx` - Main dashboard component
- `src/services/moodleApi.ts` - IOMAD API integration

### Key Functions

```typescript
// Extract grade from cohort name
extractGradeFromCohortName(cohortName: string): number | null

// Determine dashboard type from grade
getDashboardTypeByGrade(grade: number): 'G1_G3' | 'G4_G7' | 'G8_PLUS'

// Enhanced detection from multiple sources
detectGradeFromMultipleSources(cohortName?, username?, userId?): number | null

// Clear cached grade data
clearGradeCache(): void

// Debug current state
debugGradeDetection(): void
```

## Testing and Debugging

### Browser Console Testing

Copy and paste the contents of `test-grade-detection-browser.js` into your browser console to test the grade detection system.

Available commands:
```javascript
testGradeDetection()    // Run comprehensive tests
testCurrentState()      // Test with current browser data
clearAllCache()         // Clear all grade-related cache
forceGrade(grade)       // Force a specific grade for testing
```

### Debug Buttons

In development mode, the dashboard includes debug buttons:

- **Clear Cache**: Removes all cached grade data
- **Force Grade 1**: Forces G1_G3 dashboard for testing
- **Debug Grade**: Logs current grade detection state

### Manual Testing

1. **Test Grade 1 Student**:
   ```javascript
   forceGrade(1);
   // Reload page to see G1_G3 dashboard
   ```

2. **Test Grade 11 Student**:
   ```javascript
   forceGrade(11);
   // Reload page to see G8_PLUS dashboard
   ```

3. **Clear Cache and Test Fresh**:
   ```javascript
   clearAllCache();
   // Reload page for fresh detection
   ```

## Troubleshooting

### Common Issues

1. **Wrong Dashboard Showing**
   - Clear cache: `clearAllCache()` then reload
   - Check console logs for grade detection details
   - Verify cohort name contains grade information

2. **Grade Not Detected**
   - Ensure cohort name follows supported patterns
   - Check username format (user1, student2, etc.)
   - Verify IOMAD API is returning correct cohort data

3. **Cached Data Issues**
   - Use debug button "Clear Cache"
   - Or run `clearAllCache()` in console
   - Reload page for fresh detection

### Debug Information

The system logs detailed information to the console:

```
🎓 Determining student grade and dashboard type...
🎓 Current user: user1 ID: 1
🔍 Extracting grade from: Grade 1
✅ Valid grade found: 1
🎓 Grade 1 maps to dashboard type: G1_G3
🎯 G1-G3 STUDENT DETECTED! Rendering simplified dashboard
```

### Cache Keys

The system caches grade-related data in localStorage:

- `student_dashboard_studentCohort` - Cached cohort data
- `student_dashboard_studentCohort_${userId}` - User-specific cohort cache
- `currentUser` - Current user information

## Dashboard Differences

### G1_G3 Dashboard (Grades 1-3)
- Simplified, visual interface
- Large buttons and clear icons
- Basic activities and games
- No complex programming concepts
- Age-appropriate content (6-9 years)

### G4_G7 Dashboard (Grades 4-7)
- Intermediate interface
- Mixed visual and text content
- Introduction to programming basics
- More complex assignments
- Age-appropriate content (10-13 years)

### G8_PLUS Dashboard (Grades 8+)
- Full-featured interface
- Advanced programming concepts
- Complex assignments and projects
- Professional development tools
- Age-appropriate content (14+ years)

## Content Filtering

Each dashboard type filters content based on complexity:

```typescript
const filterContentByGrade = (content, contentType) => {
  switch (dashboardType) {
    case 'G1_G3':
      // Filter out advanced keywords
      return content.filter(item => !hasAdvancedContent(item));
    case 'G4_G7':
      // Filter out very advanced content
      return content.filter(item => !hasVeryAdvancedContent(item));
    case 'G8_PLUS':
      // Show all content
      return content;
  }
};
```

## API Integration

The system integrates with IOMAD/Moodle API:

```typescript
// Fetch student cohort
const cohort = await moodleService.getStudentCohort(userId);

// Get cohort members
const members = await moodleService.getCohortMembers(cohortId);
```

## Best Practices

1. **Cohort Naming**: Use clear grade indicators in cohort names
2. **Testing**: Always test with different grade levels
3. **Caching**: Clear cache when testing grade changes
4. **Logging**: Monitor console logs for detection issues
5. **Fallbacks**: System defaults to G8_PLUS if no grade detected

## Future Enhancements

- Support for custom grade ranges
- Dynamic content filtering based on student performance
- Integration with learning analytics
- Parent/teacher override capabilities
- Multi-language grade detection
