import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { moodleService } from '../services/moodleApi';
import G1G3Dashboard from '../pages/student/dashboards/G1G3Dashboard';
import G4G7Dashboard from '../pages/student/dashboards/G4G7Dashboard';
import G8PlusDashboard from '../pages/student/dashboards/G8PlusDashboard';

interface StudentDashboardRouterProps {
  // Add any props that might be needed for the dashboards
}

// Helper function to extract grade from user profile
const extractGradeFromProfile = (user: any): 'g1-g3' | 'g4-g7' | 'g8-plus' | null => {
  if (!user) return null;
  
  const fullname = (user.fullname || '').toLowerCase();
  const firstname = (user.firstname || '').toLowerCase();
  const lastname = (user.lastname || '').toLowerCase();
  const email = (user.email || '').toLowerCase();
  
  // Check for grade indicators in profile fields
  const profileText = `${fullname} ${firstname} ${lastname} ${email}`;
  
  console.log('🔍 Checking profile for grade indicators:', profileText);
  
  // Check for G1-G3 indicators (using word boundaries to avoid false matches)
  if (/\b(g[1-3]|grade\s*[1-3]|grade\s*one|grade\s*two|grade\s*three|primary\s*[1-3]|elementary\s*[1-3])\b/i.test(profileText)) {
    return 'g1-g3';
  }
  
  // Check for G4-G7 indicators (using word boundaries to avoid false matches)
  if (/\b(g[4-7]|grade\s*[4-7]|grade\s*four|grade\s*five|grade\s*six|grade\s*seven|middle\s*school|intermediate)\b/i.test(profileText)) {
    return 'g4-g7';
  }
  
  // Check for G8+ indicators (using word boundaries to avoid false matches)
  if (/\b(g(8|9|10|11|12)|grade\s*(8|9|10|11|12)|grade\s*(eight|nine|ten|eleven|twelve)|high\s*school|secondary|senior)\b/i.test(profileText)) {
    return 'g8-plus';
  }
  
  return null;
};

const StudentDashboardRouter: React.FC<StudentDashboardRouterProps> = () => {
  const { currentUser } = useAuth();
  const [dashboardType, setDashboardType] = useState<'loading' | 'g1-g3' | 'g4-g7' | 'g8-plus'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const determineDashboard = async () => {
      if (!currentUser?.id) {
        setError('User not found');
        return;
      }

      try {
        console.log('🎓 Determining dashboard type for user:', currentUser.id);
        console.log('🎓 User profile:', { 
          id: currentUser.id, 
          fullname: currentUser.fullname, 
          firstname: currentUser.firstname,
          lastname: currentUser.lastname,
          email: currentUser.email 
        });
        
        // Get student's cohort
        const cohort = await moodleService.getStudentCohort(currentUser.id.toString());
        console.log('🎓 Student cohort:', cohort);

        if (cohort) {
          const cohortName = cohort.name.toLowerCase();
          console.log('🎓 Cohort name:', cohortName);
          console.log('🎓 Full cohort object:', cohort);

          // More precise pattern matching for cohort names (using word boundaries to avoid false matches)
          const isG1G3 = /\b(g[1-3]|grade\s*[1-3]|grade\s*one|grade\s*two|grade\s*three|primary\s*[1-3]|elementary\s*[1-3])\b/i.test(cohortName);
          const isG4G7 = /\b(g[4-7]|grade\s*[4-7]|grade\s*four|grade\s*five|grade\s*six|grade\s*seven|middle\s*school|intermediate)\b/i.test(cohortName);
          const isG8Plus = /\b(g(8|9|10|11|12)|grade\s*(8|9|10|11|12)|grade\s*(eight|nine|ten|eleven|twelve)|high\s*school|secondary|senior)\b/i.test(cohortName);

          console.log('🎓 Pattern matching results:', { isG1G3, isG4G7, isG8Plus });

          if (isG1G3) {
            setDashboardType('g1-g3');
            console.log('✅ Routing to G1-G3 Dashboard');
          } else if (isG4G7) {
            setDashboardType('g4-g7');
            console.log('✅ Routing to G4-G7 Dashboard');
          } else if (isG8Plus) {
            setDashboardType('g8-plus');
            console.log('✅ Routing to G8+ Dashboard');
          } else {
            // Try to extract grade from user profile as fallback
            console.log('⚠️ Cohort pattern didn\'t match, trying profile fallback...');
            const profileGrade = extractGradeFromProfile(currentUser);
            if (profileGrade) {
              setDashboardType(profileGrade);
              console.log(`✅ Fallback: Routing to ${profileGrade} Dashboard based on profile`);
            } else {
              // Default to G8+ dashboard if no grade can be determined
              setDashboardType('g8-plus');
              console.log('⚠️ No grade found in profile, defaulting to G8+ Dashboard');
              console.log('⚠️ Cohort name that didn\'t match:', cohortName);
            }
          }
        } else {
          // No cohort found, try profile fallback
          console.log('⚠️ No cohort found, trying profile fallback...');
          const profileGrade = extractGradeFromProfile(currentUser);
          if (profileGrade) {
            setDashboardType(profileGrade);
            console.log(`✅ Fallback: Routing to ${profileGrade} Dashboard based on profile`);
          } else {
            // Default to G8+ dashboard
            setDashboardType('g8-plus');
            console.log('⚠️ No grade found in profile, defaulting to G8+ Dashboard');
          }
        }
      } catch (error) {
        console.error('❌ Error determining dashboard type:', error);
        setError('Failed to determine dashboard type');
        // Default to G8+ dashboard on error
        setDashboardType('g8-plus');
      }
    };

    determineDashboard();
  }, [currentUser?.id]);

  // Loading state
  if (dashboardType === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Determining your grade level...</p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-500">User ID: {currentUser?.id}</p>
            <p className="text-xs text-gray-500">Name: {currentUser?.fullname}</p>
            <p className="text-xs text-gray-500">Check browser console for detailed logs</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on cohort
  switch (dashboardType) {
    case 'g1-g3':
      return <G1G3Dashboard />;
    case 'g4-g7':
      return <G4G7Dashboard />;
    case 'g8-plus':
      return (
        <G8PlusDashboard 
          stats={{
            enrolledCourses: 0,
            completedAssignments: 0,
            pendingAssignments: 0,
            averageGrade: 0,
            totalActivities: 0,
            activeStudents: 0
          }}
          userCourses={[]}
          courseProgress={[]}
          studentActivities={[]}
          recentActivities={[]}
          userAssignments={[]}
          loadingStates={{
            stats: false,
            courseProgress: false,
            studentActivities: false,
            recentActivities: false,
            userCourses: false,
            userAssignments: false,
            profile: false
          }}
        />
      );
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unknown Dashboard Type</h2>
            <p className="text-gray-600">Please contact support.</p>
          </div>
        </div>
      );
  }
};

export default StudentDashboardRouter;
