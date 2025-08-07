import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { moodleService } from '../services/moodleApi';

const RoleDebug = () => {
  const [username, setUsername] = useState('kodeit_admin');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDebugRoles = async () => {
    setIsLoading(true);
    try {
      console.log(`🧪 Debugging roles for username: ${username}`);
      const result = await moodleService.debugUserRoles(username);
      setDebugResult(result);
      
      if (result.success) {
        console.log('✅ Debug completed:', result);
        alert(`Debug completed! Check console for details. Detected role: ${result.detectedRole}`);
      } else {
        console.error('❌ Debug failed:', result);
        alert(`Debug failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Debug error:', error);
      alert('Debug error. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRoleAssignment = async () => {
    setIsLoading(true);
    try {
      const result = await moodleService.testRoleAssignment(2, 'companymanager');
      if (result.success) {
        alert(`✅ Role assignment test successful! Assigned ${result.role.shortname} to user 2`);
      } else {
        alert(`❌ Role assignment test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Role assignment test failed:', error);
      alert('Role assignment test failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserSearch = async () => {
    setIsLoading(true);
    try {
      await moodleService.testUserSearch();
      alert('✅ User search tests completed! Check console for detailed results.');
    } catch (error) {
      console.error('❌ User search tests failed:', error);
      alert('User search tests failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Role Debug Tool</CardTitle>
            <CardDescription>
              Debug role fetching for specific users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username to debug"
                className="flex-1"
              />
              <Button 
                onClick={handleDebugRoles}
                disabled={isLoading}
              >
                {isLoading ? 'Debugging...' : 'Debug Roles'}
              </Button>
              <Button 
                onClick={handleTestRoleAssignment}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Testing...' : 'Test Assignment'}
              </Button>
              <Button 
                onClick={handleTestUserSearch}
                disabled={isLoading}
                variant="secondary"
              >
                {isLoading ? 'Testing...' : 'Test User Search'}
              </Button>
            </div>

            {debugResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Results:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Success:</span> {debugResult.success ? 'Yes' : 'No'}
                  </div>
                  {debugResult.success && (
                    <>
                      <div>
                        <span className="font-medium">User ID:</span> {debugResult.user?.id}
                      </div>
                      <div>
                        <span className="font-medium">Username:</span> {debugResult.user?.username}
                      </div>
                      <div>
                        <span className="font-medium">Full Name:</span> {debugResult.user?.fullname}
                      </div>
                      <div>
                        <span className="font-medium">Roles Found:</span> {debugResult.roles?.length || 0}
                      </div>
                      <div>
                        <span className="font-medium">Detected Role:</span> {debugResult.detectedRole}
                      </div>
                      {debugResult.roles && debugResult.roles.length > 0 && (
                        <div>
                          <span className="font-medium">Role Details:</span>
                          <ul className="ml-4 mt-1">
                            {debugResult.roles.map((role: any, index: number) => (
                              <li key={index}>
                                {role.shortname} ({role.name})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                  {!debugResult.success && (
                    <div className="text-red-600">
                      Error: {debugResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-4">
              <p>💡 <strong>Tip:</strong> Check browser console for detailed API responses and role parsing.</p>
              <p>🔧 <strong>Test Users:</strong> Try "kodeit_admin", "alhuda_admin", or any other username from your IOMAD system.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleDebug; 