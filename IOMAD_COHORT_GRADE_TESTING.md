# 🧪 IOMAD Cohort Grade Detection Testing Guide

## 🎯 Objective
Verify that the grade detection system correctly identifies students based on their IOMAD cohort data and shows the appropriate dashboard:
- **Grade 1-3 students** → G1_G3 dashboard (Early Elementary)
- **Grade 4-7 students** → G4_G7 dashboard (Upper Elementary)  
- **Grade 8+ students** → G8_PLUS dashboard (High School)

## 🚨 Current Issue to Test
You mentioned that when logging in as "Grade 11", it's still fetching the Grade 1 dashboard style. This test will verify if the system correctly:
1. Extracts grade from IOMAD cohort name
2. Determines correct dashboard type
3. Shows appropriate content filtering

## 🔧 Testing Steps

### Step 1: Clear All Cached Data
```javascript
// Run this in browser console
console.log('🧹 Clearing all cached data...');
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.startsWith('student_dashboard_') || 
    key.startsWith('sidebar_') ||
    key.startsWith('currentUser') ||
    key.startsWith('moodle_token') ||
    key.startsWith('token')
  )) {
    keysToRemove.push(key);
  }
}
keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removed:', key);
});
console.log('✅ Cleared', keysToRemove.length, 'cached items');
```

### Step 2: Test Different Grade Levels

#### Test Case 1: Grade 1 Student
1. **Login with**: `user1` or any G1 student credentials
2. **Expected Cohort**: "Grade 1" or "G1"
3. **Expected Grade Detection**: 1
4. **Expected Dashboard**: G1_G3 (Early Elementary)
5. **Expected Header**: "Grade 1" and "Early Elementary"
6. **Expected Content**: Simplified, visual, no complex programming

#### Test Case 2: Grade 11 Student
1. **Login with**: Any G11 student credentials
2. **Expected Cohort**: "Grade 11" or "G11"
3. **Expected Grade Detection**: 11
4. **Expected Dashboard**: G8_PLUS (High School)
5. **Expected Header**: "Grade 11" and "High School"
6. **Expected Content**: Full-featured, advanced programming tools

#### Test Case 3: Grade 5 Student
1. **Login with**: Any G5 student credentials
2. **Expected Cohort**: "Grade 5" or "G5"
3. **Expected Grade Detection**: 5
4. **Expected Dashboard**: G4_G7 (Upper Elementary)
5. **Expected Header**: "Grade 5" and "Upper Elementary"
6. **Expected Content**: Intermediate, basic programming concepts

### Step 3: Check Console Logs
After each login, check the browser console for these logs:

```
🎓 Determining student grade and dashboard type...
🎓 Current user: [username] ID: [id]
🎓 Fetching student cohort from API...
🎓 Student cohort found: [cohort name]
🔍 Extracting grade from: [cohort name]
✅ Valid grade found: [grade number]
🎓 Dashboard type determined: { grade: X, dashboardType: 'XXX', isG1G3: true/false }
```

### Step 4: Verify Dashboard Differences

#### G1_G3 Dashboard (Early Elementary):
- ✅ **Header**: Shows "Grade X" and "Early Elementary"
- ✅ **Content**: Simplified, visual interface
- ✅ **Features**: Large buttons, colorful icons, basic activities
- ✅ **Restrictions**: No advanced programming concepts
- ✅ **Console**: Shows "🎯 G1-G3 STUDENT DETECTED!"

#### G4_G7 Dashboard (Upper Elementary):
- ✅ **Header**: Shows "Grade X" and "Upper Elementary"
- ✅ **Content**: Intermediate interface
- ✅ **Features**: Basic programming concepts, structured learning
- ✅ **Restrictions**: No very advanced programming
- ✅ **Console**: Shows intermediate dashboard rendering

#### G8_PLUS Dashboard (High School):
- ✅ **Header**: Shows "Grade X" and "High School"
- ✅ **Content**: Full-featured interface
- ✅ **Features**: Advanced programming tools, professional development
- ✅ **Restrictions**: No content restrictions
- ✅ **Console**: Shows G8+ dashboard rendering

## 🔍 Debugging Commands

### Check Current Status:
```javascript
// Check current user data
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser') || '{}'));

// Check cached cohort data
console.log('Cached cohort:', JSON.parse(localStorage.getItem('student_dashboard_studentCohort') || '{}'));

// Check detected grade and dashboard type
console.log('Detected grade:', localStorage.getItem('student_dashboard_studentGrade'));
console.log('Dashboard type:', localStorage.getItem('student_dashboard_dashboardType'));
```

### Force Specific Grade (for testing):
```javascript
// Force Grade 1
localStorage.setItem('force_grade_1', 'true');
window.location.reload();

// Force Grade 11
localStorage.setItem('force_grade_11', 'true');
window.location.reload();
```

### Test Grade Extraction Logic:
```javascript
// Test the grade extraction function
const testGradeExtraction = (cohortName) => {
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

// Test different cohort names
console.log('Grade 1:', testGradeExtraction('Grade 1'));
console.log('Grade 11:', testGradeExtraction('Grade 11'));
console.log('G1:', testGradeExtraction('G1'));
console.log('G11:', testGradeExtraction('G11'));
```

## 📊 Expected Results Matrix

| Cohort Name | Expected Grade | Expected Dashboard | Expected Header |
|-------------|----------------|-------------------|-----------------|
| "Grade 1"   | 1              | G1_G3            | Grade 1, Early Elementary |
| "Grade 2"   | 2              | G1_G3            | Grade 2, Early Elementary |
| "Grade 3"   | 3              | G1_G3            | Grade 3, Early Elementary |
| "Grade 4"   | 4              | G4_G7            | Grade 4, Upper Elementary |
| "Grade 5"   | 5              | G4_G7            | Grade 5, Upper Elementary |
| "Grade 6"   | 6              | G4_G7            | Grade 6, Upper Elementary |
| "Grade 7"   | 7              | G4_G7            | Grade 7, Upper Elementary |
| "Grade 8"   | 8              | G8_PLUS          | Grade 8, High School |
| "Grade 9"   | 9              | G8_PLUS          | Grade 9, High School |
| "Grade 10"  | 10             | G8_PLUS          | Grade 10, High School |
| "Grade 11"  | 11             | G8_PLUS          | Grade 11, High School |
| "Grade 12"  | 12             | G8_PLUS          | Grade 12, High School |

## 🐛 Troubleshooting

### Issue: Still showing wrong dashboard
**Possible Causes:**
1. **Cached data not cleared** - Run the clear cache script
2. **Cohort name not matching patterns** - Check console logs for cohort name
3. **Grade extraction logic failing** - Test the extraction function
4. **Dashboard type not updating** - Check if state is properly updated

### Issue: Grade 11 showing G1 dashboard
**Debug Steps:**
1. Check console logs for cohort name extraction
2. Verify grade extraction is working correctly
3. Check if dashboard type is being set properly
4. Ensure no cached data is interfering

### Issue: No cohort found
**Debug Steps:**
1. Check if user is properly assigned to a cohort in IOMAD
2. Verify API calls are working
3. Check network tab for API responses
4. Use fallback username-based grade detection

## ✅ Success Criteria

The test is successful if:
1. ✅ Grade 1 students see G1_G3 dashboard with "Early Elementary" header
2. ✅ Grade 11 students see G8_PLUS dashboard with "High School" header
3. ✅ Content is appropriately filtered for each grade level
4. ✅ Console logs show correct grade detection
5. ✅ No cached data interferes with fresh detection

## 📝 Test Report Template

```
Test Date: [Date]
Tester: [Name]

Test Results:
- Grade 1 Student: [PASS/FAIL] - Dashboard: [G1_G3/G4_G7/G8_PLUS]
- Grade 5 Student: [PASS/FAIL] - Dashboard: [G1_G3/G4_G7/G8_PLUS]  
- Grade 11 Student: [PASS/FAIL] - Dashboard: [G1_G3/G4_G7/G8_PLUS]

Issues Found:
[Describe any issues]

Console Logs:
[Paste relevant console logs]
```

This comprehensive testing will verify that the IOMAD cohort-based grade detection is working correctly and that Grade 11 students get the appropriate G8+ dashboard, not the G1 dashboard.
