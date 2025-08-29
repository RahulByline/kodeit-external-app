import React, { useState } from 'react';
import { Play, Code, Save, Download, Upload } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Emulators: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedEmulator, setSelectedEmulator] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  const emulators = [
    {
      id: 'code-editor',
      name: 'Code Editor',
      description: 'Write and run code in multiple programming languages',
      icon: Code,
      status: 'active',
      url: '/dashboard/student/code-editor'
    },
    {
      id: 'compiler',
      name: 'Compiler',
      description: 'Advanced code compilation with Piston API',
      icon: Settings,
      status: 'active',
      url: '/dashboard/student/compiler'
    },
    {
      id: 'scratch-editor',
      name: 'Scratch Code Editor',
      description: 'Learn programming with visual blocks',
      icon: Play,
      status: 'active',
      url: '/dashboard/student/scratch-editor'
    }
  ];

  const handleProjectSave = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      name: `Project ${savedProjects.length + 1}`,
      data: projectData,
      timestamp: new Date().toISOString()
    };
    setSavedProjects([...savedProjects, newProject]);
    
    // Save to localStorage
    localStorage.setItem('scratch-projects', JSON.stringify([...savedProjects, newProject]));
  };

  const handleProjectLoad = (project: any) => {
    // This would be handled by the ScratchEditor component
    console.log('Loading project:', project);
  };

  const handleBackToSelection = () => {
    setSelectedEmulator(null);
  };

  if (selectedEmulator === 'scratch') {
    return (
      <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scratch Programming</h1>
              <p className="text-gray-600 mt-1">Create interactive stories, games, and animations with visual programming blocks</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Load Project
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Scratch Editor */}
          <div className="h-[calc(100vh-200px)]">
            <ScratchEditor onProjectSave={handleProjectSave} />
          </div>

          {/* Saved Projects */}
          {savedProjects.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {savedProjects.map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(project.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleProjectLoad(project)}
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

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
              <Link to={emulator.url || '#'}>
                <Card 
                  key={emulator.id}
                  className="ring-2 ring-blue-500 bg-blue-50 cursor-pointer transition-all hover:shadow-md hover:ring-blue-600"
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
            </Link>
            );
          })}
        </div>

        {/* Getting Started Guide */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Scratch Programming
                </CardTitle>
                <CardDescription>
                  Learn the basics of visual programming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Drag and drop blocks to create scripts</li>
                  <li>• Use motion blocks to move sprites</li>
                  <li>• Add looks blocks for visual effects</li>
                  <li>• Control blocks for program flow</li>
                  <li>• Event blocks to respond to user input</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Save Your Work
                </CardTitle>
                <CardDescription>
                  Keep your projects safe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Click the Save button to store your project</li>
                  <li>• Projects are saved locally in your browser</li>
                  <li>• You can load saved projects anytime</li>
                  <li>• Export projects to share with others</li>
                  <li>• All your work is automatically backed up</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Emulators;
