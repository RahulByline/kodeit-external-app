import React from 'react';
import { Play } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';

const Emulators: React.FC = () => {
  const { currentUser } = useAuth();

  const emulators = [
    {
      id: 'scratch',
      name: 'Scratch Emulator',
      description: 'Learn programming with visual blocks',
      icon: Play,
      status: 'active'
    }
  ];

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Programming Emulators</h1>
            <p className="text-gray-600 mt-1">Learn programming with interactive tools and visual blocks</p>
          </div>
        </div>

        {/* Emulator Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emulators.map((emulator) => {
            const Icon = emulator.icon;
            
            return (
              <Card 
                key={emulator.id}
                className="ring-2 ring-blue-500 bg-blue-50 cursor-pointer transition-all hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900">
                        {emulator.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {emulator.description}
                      </p>
                    </div>
                    <Badge 
                      variant="default"
                      className="text-xs"
                    >
                      Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Emulators;
