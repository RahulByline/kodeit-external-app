import React, { useState } from 'react';
import { Play, Save, Download, Upload, ArrowLeft } from 'lucide-react';
import G8PlusLayout from '../../components/G8PlusLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ScratchEmulator from '../../components/dashboard/Emulator/ScratchEmulator';

const ScratchCodeEditor: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  const handleProjectSave = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      name: `Scratch Project ${savedProjects.length + 1}`,
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

  const handleBackToEmulators = () => {
    navigate('/dashboard/student/emulators');
  };

  return (
    <G8PlusLayout userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
          </div>
        </div>

        {/* Scratch Editor */}
        <div className="h-[90vh] rounded-lg overflow-hidden border border-gray-300">
          <ScratchEmulator />
        </div>

        {/* Getting Started Guide */}
      

        {/* Saved Projects */}
        {savedProjects.length > 0 && (
          <div className="mt-8">
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
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </G8PlusLayout>
  );
};

export default ScratchCodeEditor;
