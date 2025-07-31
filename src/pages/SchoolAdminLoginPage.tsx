import React from 'react';
import BaseLoginPage from '../components/BaseLoginPage';

const SchoolAdminLoginPage: React.FC = () => {
  return (
    <BaseLoginPage
      role="school_admin"
      title="School Admin Login"
      description="Sign in to access the School Admin Dashboard"
      credentials={{
        username: "",
        password: ""
      }}
      bgColor="bg-purple-50"
      accentColor="bg-purple-600"
      redirectPath="/dashboard/school-admin"
    />
  );
};

export default SchoolAdminLoginPage; 