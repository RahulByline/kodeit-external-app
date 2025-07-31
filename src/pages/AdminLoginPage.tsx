import React from 'react';
import BaseLoginPage from '../components/BaseLoginPage';

const AdminLoginPage: React.FC = () => {
  return (
    <BaseLoginPage
      role="admin"
      title="Admin Login"
      description="Sign in to access the KodeIT Admin Dashboard"
      credentials={{
        username: "",
        password: ""
      }}
      bgColor="bg-red-50"
      accentColor="bg-red-600"
      redirectPath="/dashboard/admin"
    />
  );
};

export default AdminLoginPage; 