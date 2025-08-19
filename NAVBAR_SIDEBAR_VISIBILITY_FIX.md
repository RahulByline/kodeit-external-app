# Navbar and Sidebar Visibility Fix for Community and Enrollments Pages

## Issue Description
The user reported that when opening the Community and Enrollments pages in other dashboards (teacher and student), the navigation bar and sidebar were not visible/working.

## Root Cause Analysis
The issue was identified in the `DashboardLayout` component interface:

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'school_admin' | 'teacher' | 'student';
  userName: string;  // This prop was required but missing!
}
```

All the newly created Community and Enrollments pages were only passing the `userRole` prop but missing the required `userName` prop, causing the component to fail to render properly.

## Files Fixed

### 1. Teacher Dashboard Pages
- **File**: `src/pages/teacher/Community.tsx`
- **Fix**: Added `userName={currentUser?.fullname || "Teacher"}` prop to both DashboardLayout instances

- **File**: `src/pages/teacher/Enrollments.tsx`
- **Fix**: Added `userName={currentUser?.fullname || "Teacher"}` prop to both DashboardLayout instances

### 2. Student Dashboard Pages
- **File**: `src/pages/student/Community.tsx`
- **Fix**: Added `userName={currentUser?.fullname || "Student"}` prop to both DashboardLayout instances

- **File**: `src/pages/student/Enrollments.tsx`
- **Fix**: Added `userName={currentUser?.fullname || "Student"}` prop to both DashboardLayout instances

### 3. School Admin Dashboard Pages
- **File**: `src/pages/school-admin/Community.tsx`
- **Fix**: 
  - Added `userName={currentUser?.fullname || "School Admin"}` prop to both DashboardLayout instances
  - Fixed `userRole="school-admin"` to `userRole="school_admin"` for consistency

- **File**: `src/pages/school-admin/Enrollments.tsx`
- **Fix**: 
  - Added `userName={currentUser?.fullname || "School Admin"}` prop to both DashboardLayout instances
  - Fixed `userRole="school-admin"` to `userRole="school_admin"` for consistency

## Changes Made

### Before (Broken):
```typescript
<DashboardLayout userRole="teacher">
  {/* content */}
</DashboardLayout>
```

### After (Fixed):
```typescript
<DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
  {/* content */}
</DashboardLayout>
```

## Technical Details

1. **useAuth Context**: All pages already import and use the `useAuth` context to get `currentUser`
2. **Fallback Values**: Used appropriate fallback values for each role:
   - Teacher: `"Teacher"`
   - Student: `"Student"`
   - School Admin: `"School Admin"`
3. **Consistency**: Ensured all pages use the correct `userRole` values that match the DashboardLayout interface

## Testing Instructions

1. Navigate to the teacher dashboard and open the Community page
2. Verify that the navigation bar and sidebar are visible
3. Navigate to the teacher dashboard and open the Enrollments page
4. Verify that the navigation bar and sidebar are visible
5. Repeat the same tests for student dashboard
6. Repeat the same tests for school admin dashboard
7. Verify that all navigation links in the sidebar work correctly
8. Verify that the user profile dropdown in the top bar works correctly

## Result
The navigation bar and sidebar should now be fully visible and functional on all Community and Enrollments pages across all dashboards (teacher, student, and school admin).

## Related Files
- `src/components/DashboardLayout.tsx` - The layout component that requires both props
- `src/context/AuthContext.tsx` - Provides the currentUser data
- All Community and Enrollments pages in teacher, student, and school-admin directories
