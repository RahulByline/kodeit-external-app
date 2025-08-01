import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SystemSettings from '../components/SystemSettings';

const TeacherSettings: React.FC = () => {
  return (
    <DashboardLayout userRole="teacher" userName="Mr. Johnson">
      <SystemSettings userRole="teacher" userName="Mr. Johnson" />
    </DashboardLayout>
  );
};

export default TeacherSettings; 