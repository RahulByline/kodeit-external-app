import React from 'react';
import BaseLoginPage from '../components/BaseLoginPage';

const StudentLoginPage: React.FC = () => {
  return (
    <BaseLoginPage
      role="student"
      title="Student Login"
      description="Sign in to access the Student Dashboard"
      credentials={{
        username: "",
        password: ""
      }}
      bgColor="bg-blue-50"
      accentColor="bg-blue-600"
      redirectPath="/dashboard/student"
    />
  );
};

export default StudentLoginPage; 