# 🔧 IOMAD Grade Detection Debug Guide

## 🚨 Problem
When logging in as "Grade 11" student, it's still showing Grade 1 dashboard instead of G8+ dashboard.

## 🔍 Quick Debug Steps

### Step 1: Clear All Cached Data
```javascript
// Run this in browser console
console.log('🧹 Clearing all cached data...');
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.startsWith('student_dashboard_') || 
    key.startsWith('currentUser') ||
    key.startsWith('moodle_token')
  )) {
    keysToRemove.push(key);
  }
}
keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removed:', key);
});
console.log('✅ Cleared', keysToRemove.length, 'cached items');
window.location.reload();
```

### Step 2: Check Console Logs
After clearing cache and logging in, check the browser console for these logs:

**Expected logs for Grade 11 student:**
```
🎓 Determining student grade and dashboard type...
🎓 Current user: [username] ID: [id]
🎓 Fetching student cohort from IOMAD API...
📚 Found X cohorts, checking for user...
📚 Available cohorts: [{id: 1, name: "Grade 11", idnumber: "G11"}, ...]
🔍 Checking cohort: Grade 11 (ID: 1)
👥 Cohort members: [123, 456, 789]
✅ Student found in cohort: Grade 11
🎓 Grade extracted from cohort name: 11
🎓 Dashboard type determined: {grade: 11, dashboardType: 'G8_PLUS'}
```

### Step 3: Test Grade Extraction
```javascript
// Test if grade extraction is working
const testGrade = (cohortName) => {
  const patterns = [/grade\s*(\d+)/i, /g(\d+)/i, /user(\d+)/i, /student(\d+)/i, /(\d+)/i];
  for (const pattern of patterns) {
    const match = cohortName.match(pattern);
    if (match) {
      const grade = parseInt(match[1]);
      if (grade >= 1 && grade <= 12) return grade;
    }
  }
  return null;
};

console.log('Grade 11 test:', testGrade('Grade 11')); // Should return 11
console.log('Grade 1 test:', testGrade('Grade 1'));   // Should return 1
```

## 🐛 Common Issues & Solutions

### Issue 1: Still showing wrong dashboard after clearing cache
**Solution:**
1. Check if the cohort name in IOMAD actually contains "Grade 11"
2. Verify the student is properly assigned to the cohort
3. Check network tab for API responses

### Issue 2: Grade extraction not working
**Solution:**
1. Check the exact cohort name format in IOMAD
2. Update the patterns in `extractGradeFromCohortName` function
3. Test with the debug script

### Issue 3: API not returning cohort data
**Solution:**
1. Check if the user has proper permissions
2. Verify the IOMAD API is working
3. Check network tab for errors

## 📊 Expected Results

| Cohort Name in IOMAD | Expected Grade | Expected Dashboard | Expected Header |
|---------------------|----------------|-------------------|-----------------|
| "Grade 1"           | 1              | G1_G3            | Grade 1, Early Elementary |
| "Grade 11"          | 11             | G8_PLUS          | Grade 11, High School |
| "G1"                | 1              | G1_G3            | Grade 1, Early Elementary |
| "G11"               | 11             | G8_PLUS          | Grade 11, High School |

## 🔧 Manual Testing

### Test Grade 11 Dashboard
```javascript
// Force Grade 11 for testing
localStorage.setItem('student_dashboard_studentGrade', '11');
localStorage.setItem('student_dashboard_dashboardType', 'G8_PLUS');
localStorage.setItem('student_dashboard_studentCohort', JSON.stringify({
  id: 1,
  name: 'Grade 11',
  idnumber: 'G11'
}));
window.location.reload();
```

### Test Grade 1 Dashboard
```javascript
// Force Grade 1 for testing
localStorage.setItem('student_dashboard_studentGrade', '1');
localStorage.setItem('student_dashboard_dashboardType', 'G1_G3');
localStorage.setItem('student_dashboard_studentCohort', JSON.stringify({
  id: 2,
  name: 'Grade 1',
  idnumber: 'G1'
}));
window.location.reload();
```

## 📝 Debug Checklist

- [ ] Clear all cached data
- [ ] Login with Grade 11 student credentials
- [ ] Check console logs for cohort detection
- [ ] Verify grade extraction is working (should return 11)
- [ ] Confirm dashboard type is G8_PLUS
- [ ] Check header shows "Grade 11" and "High School"
- [ ] Verify content is appropriate for high school level

## 🚀 Quick Fix Commands

```javascript
// Complete reset and test
localStorage.clear();
console.log('Cache cleared, please login again');

// Check current state
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser') || '{}'));
console.log('Cached cohort:', JSON.parse(localStorage.getItem('student_dashboard_studentCohort') || '{}'));
console.log('Detected grade:', localStorage.getItem('student_dashboard_studentGrade'));
console.log('Dashboard type:', localStorage.getItem('student_dashboard_dashboardType'));
```

## 📞 If Still Not Working

1. **Check IOMAD cohort setup** - Ensure cohorts are named correctly
2. **Verify API permissions** - Make sure the API can access cohort data
3. **Test with different usernames** - Try user11, student11, etc.
4. **Check network requests** - Look for API errors in browser dev tools
5. **Contact support** - If all else fails, there might be an IOMAD configuration issue

The key is to ensure that:
1. ✅ The cohort name in IOMAD contains the grade information
2. ✅ The student is properly assigned to the cohort
3. ✅ The API is returning the correct cohort data
4. ✅ The grade extraction logic is working correctly
5. ✅ No cached data is interfering with fresh detection
