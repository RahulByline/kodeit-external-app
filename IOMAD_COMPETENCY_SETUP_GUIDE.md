# IOMAD/Moodle Competency Setup Guide

## Current Status
Based on the API testing, your IOMAD/Moodle system currently has **no real competency data** configured. The CompetenciesMap is using fallback data because:

- ❌ No competency frameworks are configured
- ❌ No competencies are defined  
- ❌ No learning plans are set up
- ❌ No user competencies are assigned

## Solution: Enable Real Competency Data

### Step 1: Enable Competency Features in Moodle/IOMAD

1. **Login to Moodle Admin Panel**
   - Go to: `https://kodeit.legatoserver.com/admin`
   - Login with admin credentials

2. **Enable Competency Framework**
   - Navigate to: **Site administration** → **Plugins** → **Competencies** → **Competency frameworks**
   - Click **"Enable competency frameworks"**
   - Set **"Enable competency frameworks"** to **Yes**

3. **Enable Learning Plans**
   - Navigate to: **Site administration** → **Plugins** → **Competencies** → **Learning plans**
   - Click **"Enable learning plans"**
   - Set **"Enable learning plans"** to **Yes**

### Step 2: Create Competency Frameworks

1. **Create Programming Framework**
   - Go to: **Site administration** → **Competencies** → **Competency frameworks**
   - Click **"Add new competency framework"**
   - Name: `Programming Competency Framework`
   - Description: `Comprehensive programming skills and knowledge development`
   - Scale: Create a new scale with levels: `Not Started`, `In Progress`, `Completed`, `Mastered`, `Expert`

2. **Create Design Framework**
   - Name: `Design Competency Framework`
   - Description: `Digital design and creative skills development`

3. **Create Mathematics Framework**
   - Name: `Mathematics Competency Framework`
   - Description: `Mathematical thinking and problem-solving skills`

4. **Create Science Framework**
   - Name: `Science Competency Framework`
   - Description: `Scientific inquiry and research skills`

### Step 3: Add Competencies to Frameworks

For each framework, add competencies:

**Programming Framework Competencies:**
- Block-Based Programming (Beginner)
- Text-Based Programming (Intermediate)
- Advanced Programming (Advanced)
- Software Development (Expert)

**Design Framework Competencies:**
- Digital Design Fundamentals (Beginner)
- UI/UX Design (Intermediate)
- Advanced Design Systems (Advanced)
- Creative Direction (Expert)

**Mathematics Framework Competencies:**
- Mathematical Foundations (Beginner)
- Algebraic Thinking (Intermediate)
- Advanced Mathematics (Advanced)
- Mathematical Research (Expert)

**Science Framework Competencies:**
- Scientific Inquiry (Beginner)
- Data Analysis (Intermediate)
- Research Methods (Advanced)
- Scientific Innovation (Expert)

### Step 4: Link Competencies to Courses

1. **For each course:**
   - Go to the course
   - Navigate to: **Course administration** → **Competencies**
   - Click **"Add competencies to course"**
   - Select relevant competencies from the frameworks

### Step 5: Create Learning Plans

1. **Create Learning Plans**
   - Go to: **Site administration** → **Competencies** → **Learning plans**
   - Click **"Add new learning plan template"**
   - Create templates for each competency framework

2. **Assign Learning Plans to Users**
   - Go to: **Site administration** → **Users** → **Accounts** → **Browse list of users**
   - Select a user
   - Go to **Learning plans** tab
   - Assign appropriate learning plans

### Step 6: Test Real Data

After setting up the competencies, run the test again:

```bash
node test-real-competencies.cjs
```

You should now see:
- ✅ Frameworks Found: YES
- ✅ Competencies Found: YES
- ✅ User Competencies Found: YES
- ✅ Learning Plans Found: YES

### Step 7: Verify in CompetenciesMap

1. **Access the CompetenciesMap**
   - Go to: `/dashboard/admin/competencies`
   - The page should now display real data from IOMAD/Moodle

2. **Check for Real Data Indicators**
   - Look for competency frameworks with real names
   - Check that competencies have proper descriptions
   - Verify learning plans show real data

## Alternative: Quick Setup Script

If you want to quickly set up some test competencies via API, you can create a setup script:

```javascript
// This would create basic competency frameworks and competencies
// via Moodle API calls (requires admin permissions)
```

## Troubleshooting

### If Competency Features Are Not Available:
1. **Check Moodle Version**: Ensure you're using Moodle 3.1+ (competencies were introduced in 3.1)
2. **Check IOMAD Version**: Ensure IOMAD supports competency features
3. **Check Permissions**: Ensure your admin user has competency management permissions

### If API Calls Still Return Empty:
1. **Check Web Service Permissions**: Ensure the web service token has competency permissions
2. **Check Site Policy**: Some sites disable competency features via site policy
3. **Check Course Settings**: Ensure individual courses have competencies enabled

### If Competencies Don't Show in Frontend:
1. **Clear Cache**: Clear Moodle cache and browser cache
2. **Check JavaScript Console**: Look for any JavaScript errors
3. **Verify API Responses**: Check that API calls return expected data

## Expected Results

After proper setup, your CompetenciesMap should show:

1. **Real Competency Frameworks** from IOMAD/Moodle
2. **Real Competencies** with proper descriptions and levels
3. **Real Learning Plans** with actual due dates and progress
4. **Real User Competencies** with actual grades and evidence
5. **Real Progress Tracking** based on actual course completion

## API Functions That Should Work

Once set up, these API functions should return real data:

- `core_competency_read_frameworks`
- `core_competency_list_competencies`
- `core_competency_list_user_competencies`
- `tool_lp_data_for_plans_page`
- `core_competency_list_evidence`

## Next Steps

1. **Follow the setup guide above**
2. **Test with the provided script**
3. **Verify in the CompetenciesMap interface**
4. **Customize competencies based on your curriculum**

The CompetenciesMap is already configured to use real data when available - it just needs the competency system to be properly set up in your IOMAD/Moodle installation.
