import React from 'react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import SystemSettings from '../../components/SystemSettings';
import { useAuth } from '../../context/AuthContext';

const AdminSettings: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <AdminDashboardLayout userName={currentUser?.fullname || "System Administrator"}>
      <SystemSettings userRole="admin" userName={currentUser?.fullname || "System Administrator"} />
    </AdminDashboardLayout>
  );
};

export default AdminSettings; 