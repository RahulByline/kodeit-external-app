import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SystemSettings from '../components/SystemSettings';

const StudentSettings: React.FC = () => {
  return (
    <DashboardLayout userRole="student" userName="Alex">
      <SystemSettings userRole="student" userName="Alex" />
    </DashboardLayout>
  );
};

export default StudentSettings; 