import React from 'react';
import EnhancedStudentDashboard from './student/EnhancedStudentDashboard';

const TestEnhancedDashboard: React.FC = () => {
  return (
    <div>
      <h1>Test Enhanced Dashboard</h1>
      <p>This is a test page to access the enhanced dashboard directly.</p>
      <EnhancedStudentDashboard />
    </div>
  );
};

export default TestEnhancedDashboard;
