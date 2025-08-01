import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SystemSettings from '../../components/SystemSettings';

const AdminSettings: React.FC = () => {
  return (
    <DashboardLayout userRole="admin" userName="System Administrator">
      <SystemSettings userRole="admin" userName="System Administrator" />
    </DashboardLayout>
  );
};

export default AdminSettings; 