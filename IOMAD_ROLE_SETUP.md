# IOMAD Role Setup Guide

## How Role Assignment Works

Your application now uses **IOMAD roles** as the primary method for role assignment, not username patterns.

### Role Detection Priority:

1. **IOMAD Roles** (Primary) ✅
   - Fetches actual roles from IOMAD using `local_intelliboard_get_users_roles`
   - Maps IOMAD role names to your app roles
   - This is the **preferred method**

2. **Known Users** (Fallback) ⚠️
   - Only for specific known users like `school_admin1`
   - Not based on username patterns

3. **Default** (Last Resort) ❌
   - Falls back to 'student' if no IOMAD role is found

## Required IOMAD Role Setup

### For Teachers:
Users need these IOMAD roles:
- `teacher`
- `editingteacher` 
- `trainer`
- `coursecreator`

### For Students:
Users need these IOMAD roles:
- `student`
- `guest`
- `user`

### For School Admins:
Users need these IOMAD roles:
- `school_admin`
- `manager`
- `principal`
- `companymanager`
- `company_manager`
- `cluster_admin`

### For System Admins:
Users need these IOMAD roles:
- `admin`
- `superadmin`
- `siteadmin`

## Testing Your Setup

1. **Open the application** and go to the home page
2. **Check browser console** - it will automatically test IOMAD roles
3. **Click "Test IOMAD Roles"** button to see all users and their roles
4. **Look for console output** showing:
   - How many users have each role
   - Sample users for each role
   - Any users without proper IOMAD roles

## Common Issues

### Issue: "No IOMAD roles found"
**Solution:** Users need to be assigned proper roles in IOMAD admin panel

### Issue: "Unknown IOMAD role"
**Solution:** Add the new role to the `rolePriority` mapping in `moodleApi.ts`

### Issue: Users defaulting to 'student'
**Solution:** Assign proper IOMAD roles to users in the IOMAD system

## Expected Console Output

When working correctly, you should see:
```
🔍 Testing IOMAD roles on page load...
📊 All Users with Roles:
1. John Teacher (teacher1)
   ID: 2
   Role: teacher
   IOMAD Roles: [{shortname: "teacher", name: "Teacher"}]
   Email: teacher@example.com
---
📈 Role Statistics:
Teachers: 5
Students: 25
Admins: 2
```

## Next Steps

1. **Check your IOMAD admin panel** and assign proper roles to users
2. **Test with different users** to ensure role detection works
3. **Monitor console output** to see which users have proper roles
4. **Update role mappings** if you have custom IOMAD roles

## Role Mapping Reference

| IOMAD Role | App Role | Description |
|------------|----------|-------------|
| teacher | teacher | Standard teacher |
| editingteacher | teacher | Course editing teacher |
| trainer | trainer | Training instructor |
| coursecreator | teacher | Course creator |
| student | student | Regular student |
| guest | student | Guest user |
| user | student | Basic user |
| school_admin | school_admin | School administrator |
| manager | school_admin | Company manager |
| principal | school_admin | School principal |
| companymanager | school_admin | Company manager |
| admin | admin | System administrator |
| superadmin | admin | Super administrator |
| siteadmin | admin | Site administrator | 