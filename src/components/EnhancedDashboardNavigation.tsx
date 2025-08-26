import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Activity, 
  Award, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

interface EnhancedDashboardNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const EnhancedDashboardNavigation: React.FC<EnhancedDashboardNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview of your learning progress'
    },
    {
      id: 'courses',
      name: 'My Courses',
      icon: BookOpen,
      description: 'Manage your enrolled courses'
    },
    {
      id: 'lessons',
      name: 'Current Lessons',
      icon: Activity,
      description: 'Active lessons and activities'
    },
    {
      id: 'achievements',
      name: 'Achievements',
      icon: Award,
      description: 'Track your accomplishments'
    },
    {
      id: 'schedule',
      name: 'Schedules',
      icon: Calendar,
      description: 'View your class schedule'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardNavigation;
