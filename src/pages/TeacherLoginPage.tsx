import React from 'react';
import BaseLoginPage from '../components/BaseLoginPage';

const TeacherLoginPage: React.FC = () => {
  return (
    <BaseLoginPage
      role="teacher"
      title="Teacher Login"
      description="Sign in to access the Teacher Dashboard"
      credentials={{
        username: "",
        password: ""
      }}
      bgColor="bg-green-50"
      accentColor="bg-green-600"
      redirectPath="/dashboard/teacher"
    />
  );
};

export default TeacherLoginPage; 