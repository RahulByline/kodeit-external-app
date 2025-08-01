import React from 'react';
import BaseLoginPage from '../components/BaseLoginPage';

const SchoolAdminLoginPage: React.FC = () => {
  return (
           <BaseLoginPage
         role="school_admin"
         title="School Admin Login"
         description="Sign in to access the School Admin Dashboard (Company Manager)"
                   credentials={{
            username: "school_admin1",
            password: "password"
          }}
         bgColor="bg-purple-50"
         accentColor="bg-purple-600"
         redirectPath="/dashboard/school-admin"
       />
  );
};

export default SchoolAdminLoginPage; 