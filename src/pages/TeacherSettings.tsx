import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SystemSettings from '../components/SystemSettings';
import { useAuth } from '../context/AuthContext';

const TeacherSettings: React.FC = () => {
  const { currentUser } = useAuth();
  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.fullname || "Teacher"}>
      <SystemSettings userRole="teacher" userName={currentUser?.fullname || "Teacher"} />
    </DashboardLayout>
  );
};

export default TeacherSettings; 