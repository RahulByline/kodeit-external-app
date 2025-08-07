import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SystemSettings from '../components/SystemSettings';
import { useAuth } from '../context/AuthContext';

const StudentSettings: React.FC = () => {
  const { currentUser } = useAuth();
  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <SystemSettings userRole="student" userName={currentUser?.fullname || "Student"} />
    </DashboardLayout>
  );
};

export default StudentSettings; 