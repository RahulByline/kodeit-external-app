# IOMAD Moodle Integration Troubleshooting Guide

## 🚨 Current Status
Your application has comprehensive diagnostic tools implemented to identify and fix the remaining issues with IOMAD Moodle integration.

## 🔧 How to Use the Diagnostic Tools

### Step 1: Access the School Admin Dashboard
1. Open your application in the browser
2. Login as a school admin user
3. Navigate to the School Admin Dashboard

### Step 2: Run the Full Diagnostic
1. Look for the **"🔍 Run Full Diagnostic"** button in the "IOMAD Data Status" section
2. Click the button
3. Wait for the diagnostic to complete (this may take 30-60 seconds)
4. Review the results in the popup alert

### Step 3: Check Individual Page Diagnostics
You can also run diagnostics from specific pages:
- **Students Page**: Click "🔍 Full Diagnostic" button in the header
- **Teachers Page**: Click "🔍 Full Diagnostic" button in the header

## 📊 What the Diagnostic Tests

The diagnostic will check these 8 critical areas:

1. **API Connection** - Can the app reach your Moodle server?
2. **Authentication** - Is your login token valid?
3. **Company Detection** - Can the app find your school/company?
4. **User Fetching** - Can the app get all users from Moodle?
5. **Course Fetching** - Can the app get all courses from Moodle?
6. **Enrollment Fetching** - Can the app get enrollment data?
7. **Role Detection** - Can the app detect user roles correctly?
8. **School Admin Data** - Can the app get company-specific data?

## 🚨 Common Issues and Solutions

### Issue 1: API Connection Failed
**Symptoms**: "API Connection Failed - Moodle server not reachable"
**Solutions**:
- Check if your Moodle server is running
- Verify the API URL in `src/services/moodleApi.ts` (line 3)
- Check if the API token is correct (line 4)

### Issue 2: No Authentication Token
**Symptoms**: "No Authentication Token - Login issues"
**Solutions**:
- Log out and log back in
- Clear browser cache and cookies
- Check if the login process is working

### Issue 3: Company Detection Failed
**Symptoms**: "Company Detection Failed - School not found"
**Solutions**:
- Verify your user has a company assigned in IOMAD
- Check if the company name matches what's in Moodle
- Ensure your user role has company access

### Issue 4: No Users Found
**Symptoms**: "No Users Found - Empty user database"
**Solutions**:
- Check if users exist in your Moodle instance
- Verify the API has permission to fetch users
- Check if the user fetching API is working

### Issue 5: Role Detection Issues
**Symptoms**: "Role Detection Issues - User roles not working"
**Solutions**:
- Verify user roles are properly assigned in Moodle
- Check if the role detection logic is working
- Ensure roles have the correct permissions

### Issue 6: Company Filtering Issues
**Symptoms**: "Company Filtering Issues - School-specific data not showing"
**Solutions**:
- Verify the company ID is being passed correctly
- Check if the company filtering API calls are working
- Ensure the user belongs to the correct company

## 🔍 Manual Testing Steps

### Test 1: Basic API Connection
```javascript
// Open browser console and run:
const response = await fetch('https://kodeit.legatoserver.com/webservice/rest/server.php?wsfunction=core_webservice_get_site_info&wstoken=2eabaa23e0cf9a5442be25613c41abf5&moodlewsrestformat=json');
const data = await response.json();
console.log('API Response:', data);
```

### Test 2: Company Detection
```javascript
// In browser console:
const response = await fetch('https://kodeit.legatoserver.com/webservice/rest/server.php?wsfunction=block_iomad_company_admin_get_companies&criteria[0][key]=suspended&criteria[0][value]=0&wstoken=2eabaa23e0cf9a5442be25613c41abf5&moodlewsrestformat=json');
const data = await response.json();
console.log('Companies:', data);
```

### Test 3: User Fetching
```javascript
// In browser console:
const response = await fetch('https://kodeit.legatoserver.com/webservice/rest/server.php?wsfunction=core_user_get_users&wstoken=2eabaa23e0cf9a5442be25613c41abf5&moodlewsrestformat=json');
const data = await response.json();
console.log('Users:', data);
```

## 📋 What to Report

When you run the diagnostic, please report:

1. **Success Rate**: What percentage of tests passed?
2. **Specific Issues**: What specific error messages appeared?
3. **Console Logs**: Any error messages in the browser console
4. **API Responses**: What data is being returned from the Moodle API

## 🛠️ Quick Fixes

### If Company Detection is Failing:
The app is looking for a company named "zaki_international_school". If your company has a different name:
1. Open `src/services/moodleApi.ts`
2. Find line ~2180 (look for "zaki_international_school")
3. Update the company name to match your actual company name

### If API Token is Wrong:
1. Open `src/services/moodleApi.ts`
2. Update line 4 with your correct API token
3. Restart the development server

### If Users Aren't Showing:
1. Check if users exist in your Moodle instance
2. Verify the users have the correct roles assigned
3. Ensure the users belong to the correct company

## 🎯 Next Steps

1. **Run the Full Diagnostic** and report the results
2. **Check the browser console** for any error messages
3. **Test the manual API calls** above
4. **Report specific issues** you find

The diagnostic tools will help us identify exactly what's not working and fix it systematically.

## 📞 Need Help?

If you're still having issues after running the diagnostic:
1. Copy the diagnostic results
2. Copy any console error messages
3. Let me know what specific functionality isn't working
4. I'll help you fix the remaining issues
