import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SystemSettings from '../../components/SystemSettings';
import { useAuth } from '../../context/AuthContext';

const AdminSettings: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <DashboardLayout userRole="admin" userName={currentUser?.fullname || "System Administrator"}>
      <SystemSettings userRole="admin" userName={currentUser?.fullname || "System Administrator"} />
    </DashboardLayout>
  );
};

export default AdminSettings; 