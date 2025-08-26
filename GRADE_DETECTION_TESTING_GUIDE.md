# 🧪 Grade Detection Testing Guide

## 🚨 Current Issue
The dashboard is showing "Grade 11" and "High School" instead of "Grade 1" and "Early Elementary" for G1 students.

## 🔧 Debugging Steps

### Step 1: Clear All Cached Data
1. **Open Browser Console** (F12)
2. **Run the clear cache script**:
```javascript
// Copy and paste this into browser console
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

### Step 2: Check Console Logs
After clearing cache and refreshing, check the console for:
- `🎓 Determining student grade and dashboard type...`
- `🎓 Current user: [username] ID: [id]`
- `🔍 Extracting grade from: [cohort/username]`
- `✅ Valid grade found: [grade]`
- `🎯 G1-G3 STUDENT DETECTED!` (for G1 students)

### Step 3: Use Debug Buttons
If you're in development mode, you'll see debug buttons:
- **Clear Cache**: Clears all cached data
- **Force Grade 1**: Manually sets grade to 1 for testing

### Step 4: Test with Different Usernames
Try logging in with these usernames to test grade detection:
- `user1` → Should detect Grade 1
- `user2` → Should detect Grade 2  
- `user3` → Should detect Grade 3
- `student1` → Should detect Grade 1
- `student2` → Should detect Grade 2

## 🔍 Expected Behavior

### For G1 Students (user1, student1):
- **Header**: Should show "Grade 1" and "Early Elementary"
- **Console**: Should show "🎯 G1-G3 STUDENT DETECTED!"
- **Dashboard**: Should show simplified G1-G3 dashboard
- **Content**: Should be filtered for age-appropriate learning

### For G4-G7 Students:
- **Header**: Should show "Grade X" and "Upper Elementary"
- **Dashboard**: Should show intermediate dashboard

### For G8+ Students:
- **Header**: Should show "Grade X" and "High School"
- **Dashboard**: Should show full dashboard

## 🐛 Common Issues & Solutions

### Issue 1: Still showing Grade 11
**Cause**: Cached data not cleared properly
**Solution**: 
1. Clear all browser data (Ctrl+Shift+Delete)
2. Run the clear cache script
3. Refresh the page

### Issue 2: Grade not detected from username
**Cause**: Username pattern not matching
**Solution**: Check console logs to see what pattern is being matched

### Issue 3: Cohort overriding username grade
**Cause**: Cohort name contains different grade info
**Solution**: Check cohort name in console logs

## 📝 Testing Checklist

- [ ] Clear all cached data
- [ ] Login with `user1` credentials
- [ ] Check console for grade detection logs
- [ ] Verify header shows "Grade 1" and "Early Elementary"
- [ ] Verify dashboard shows G1-G3 content
- [ ] Test with other usernames (user2, user3)
- [ ] Check that content is filtered appropriately

## 🚀 Quick Fix Commands

### In Browser Console:
```javascript
// Clear cache and reload
localStorage.clear();
window.location.reload();
```

### Force Grade 1 (for testing):
```javascript
// This will force grade 1 dashboard
localStorage.setItem('force_grade_1', 'true');
window.location.reload();
```

## 📊 Debug Information

The system should log these key pieces of information:
1. **Username**: What username is being used
2. **Cohort**: What cohort (if any) is found
3. **Grade Extraction**: What grade is extracted and from where
4. **Dashboard Type**: What dashboard type is determined
5. **Content Filtering**: What content is being filtered

If you're still seeing "Grade 11" instead of "Grade 1", the issue is likely:
1. **Cached data not cleared**
2. **Username not matching expected patterns**
3. **Cohort name overriding username grade**

Try the debug buttons and check the console logs to identify the exact issue!
