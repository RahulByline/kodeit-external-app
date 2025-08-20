import React, { useEffect, useRef, useState } from 'react';
import { Save, Play, Download, Upload, Trash2, Plus, FileText, Sparkles, Lightbulb } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';

// Import Blockly
import * as Blockly from 'blockly';

const BlockyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const outputIframeRef = useRef<HTMLIFrameElement>(null);
  
  const [projectName, setProjectName] = useState('My Awesome Project');
  const [projects, setProjects] = useState<Array<{ id: string; name: string; updatedAt: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Project templates for kids
  const projectTemplates = [
    {
      name: 'Hello World',
      description: 'Say hello to the world!',
      icon: '👋',
      workspace: {
        blocks: {
          languageVersion: 0,
          blocks: [
            {
              type: 'text_print',
              id: 'hello-world',
              x: 50,
              y: 50,
              fields: {
                TEXT: 'Hello, World!'
              }
            }
          ]
        }
      }
    },
    {
      name: 'Simple Math',
      description: 'Add two numbers together!',
      icon: '🧮',
      workspace: {
        blocks: {
          languageVersion: 0,
          blocks: [
            {
              type: 'text_print',
              id: 'result',
              x: 50,
              y: 50,
              fields: {
                TEXT: 'The result is: '
              },
              next: {
                block: {
                  type: 'math_arithmetic',
                  id: 'add',
                  x: 50,
                  y: 100,
                  fields: {
                    OP: 'ADD'
                  },
                  inputs: {
                    A: {
                      block: {
                        type: 'math_number',
                        id: 'num1',
                        x: 50,
                        y: 150,
                        fields: {
                          NUM: '5'
                        }
                      }
                    },
                    B: {
                      block: {
                        type: 'math_number',
                        id: 'num2',
                        x: 50,
                        y: 200,
                        fields: {
                          NUM: '3'
                        }
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  ];

  // Initialize Blockly workspace
  useEffect(() => {
    if (!blocklyDivRef.current) return;

    // Create the workspace with kid-friendly colors and blocks
    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox: {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: '🎯 Events',
            colour: '65',
            contents: [
              { kind: 'block', type: 'controls_if' },
              { kind: 'block', type: 'controls_repeat_ext' },
              { kind: 'block', type: 'controls_whileUntil' },
              { kind: 'block', type: 'controls_for' },
            ]
          },
          {
            kind: 'category',
            name: '🔢 Math',
            colour: '230',
            contents: [
              { kind: 'block', type: 'math_number' },
              { kind: 'block', type: 'math_arithmetic' },
              { kind: 'block', type: 'math_single' },
              { kind: 'block', type: 'math_random_int' },
            ]
          },
          {
            kind: 'category',
            name: '💬 Text',
            colour: '160',
            contents: [
              { kind: 'block', type: 'text' },
              { kind: 'block', type: 'text_join' },
              { kind: 'block', type: 'text_print' },
              { kind: 'block', type: 'text_length' },
            ]
          },
          {
            kind: 'category',
            name: '🔍 Logic',
            colour: '210',
            contents: [
              { kind: 'block', type: 'logic_compare' },
              { kind: 'block', type: 'logic_operation' },
              { kind: 'block', type: 'logic_negate' },
              { kind: 'block', type: 'logic_boolean' },
            ]
          },
          {
            kind: 'category',
            name: '📦 Variables',
            colour: '330',
            custom: 'VARIABLE'
          },
          {
            kind: 'category',
            name: '⚙️ Functions',
            colour: '290',
            custom: 'PROCEDURE'
          }
        ]
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: '#e0e0e0',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true,
      renderer: 'zelos',
      theme: 'classic',
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true
        },
        drag: true,
        wheel: true
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    // Load projects on mount
    loadProjects();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  // Load projects from backend
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/blockly/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Load template
  const loadTemplate = (template: any) => {
    if (!workspaceRef.current) return;

    // Clear current workspace
    workspaceRef.current.clear();
    
    // Load the template
    Blockly.serialization.workspaces.load(template.workspace, workspaceRef.current);
    
    setProjectName(template.name);
    setSelectedProjectId('');
    setShowTemplates(false);
    
    toast({
      title: 'Template Loaded! 🎉',
      description: `You're ready to start with "${template.name}"!`,
    });
  };

  // Save project
  const handleSave = async () => {
    if (!workspaceRef.current) return;

    try {
      setIsLoading(true);
      
      const workspaceJson = Blockly.serialization.workspaces.save(workspaceRef.current);
      
      const response = await fetch('/api/blockly/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          workspaceJson
        })
      });

      if (response.ok) {
        const { id } = await response.json();
        toast({
          title: 'Great Job! 🎉',
          description: 'Your project has been saved successfully!',
        });
        
        // Reload projects and set current project
        await loadProjects();
        setSelectedProjectId(id);
      } else {
        throw new Error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Oops! 😅',
        description: 'Something went wrong while saving. Try again!',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load project
  const handleLoad = async (projectId: string) => {
    if (!workspaceRef.current) return;

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/blockly/projects/${projectId}`);
      if (response.ok) {
        const project = await response.json();
        
        // Clear current workspace
        workspaceRef.current.clear();
        
        // Load the project
        Blockly.serialization.workspaces.load(project.workspaceJson, workspaceRef.current);
        
        setProjectName(project.name);
        setSelectedProjectId(project.id);
        
        toast({
          title: 'Project Loaded! 📂',
          description: `"${project.name}" is ready to edit!`,
        });
      } else {
        throw new Error('Failed to load project');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Oops! 😅',
        description: 'Could not load the project. Try again!',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run code
  const handleRun = () => {
    if (!workspaceRef.current || !outputIframeRef.current) return;

    try {
      setIsRunning(true);
      
      // Generate JavaScript code from workspace
      const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
      
      if (!code.trim()) {
        toast({
          title: 'No Code to Run! 🤔',
          description: 'Add some blocks to your workspace first!',
          variant: 'destructive',
        });
        return;
      }
      
      // Create HTML content for iframe with kid-friendly styling
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Blocky Output</title>
          <style>
            body {
              font-family: 'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #fff;
              margin: 0;
              padding: 15px;
              font-size: 16px;
              line-height: 1.6;
              min-height: 100vh;
            }
            .output {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 15px;
              padding: 20px;
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.2);
              white-space: pre-wrap;
              word-wrap: break-word;
              min-height: 200px;
            }
            .error {
              color: #ff6b6b;
              background: rgba(255, 107, 107, 0.1);
              padding: 10px;
              border-radius: 10px;
              margin: 5px 0;
            }
            .log {
              color: #51cf66;
              background: rgba(81, 207, 102, 0.1);
              padding: 10px;
              border-radius: 10px;
              margin: 5px 0;
            }
            .warn {
              color: #ffd43b;
              background: rgba(255, 212, 59, 0.1);
              padding: 10px;
              border-radius: 10px;
              margin: 5px 0;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              font-size: 24px;
              font-weight: bold;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .emoji {
              font-size: 28px;
              margin-right: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="emoji">🚀</span>Your Code is Running!
          </div>
          <div id="output" class="output">
            <div style="text-align: center; opacity: 0.7;">
              <span style="font-size: 48px;">⏳</span><br>
              Loading your awesome code...
            </div>
          </div>
          <script>
            const output = document.getElementById('output');
            
            // Override console methods with fun messages
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;
            
            console.log = function(...args) {
              originalLog.apply(console, args);
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              output.innerHTML += '<div class="log">🎉 ' + message + '</div>';
            };
            
            console.warn = function(...args) {
              originalWarn.apply(console, args);
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              output.innerHTML += '<div class="warn">⚠️ ' + message + '</div>';
            };
            
            console.error = function(...args) {
              originalError.apply(console, args);
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              output.innerHTML += '<div class="error">😅 ' + message + '</div>';
            };
            
            // Clear loading message
            output.innerHTML = '';
            
            // Run the generated code
            try {
              ${code}
            } catch (error) {
              console.error('Oops! Something went wrong: ' + error.message);
            }
          </script>
        </body>
        </html>
      `;

      // Create blob URL and set iframe source
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      
      if (outputIframeRef.current) {
        outputIframeRef.current.src = blobUrl;
      }

      // Clean up blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        setIsRunning(false);
      }, 1000);

    } catch (error) {
      console.error('Error running code:', error);
      toast({
        title: 'Oops! 😅',
        description: 'Something went wrong while running your code!',
        variant: 'destructive',
      });
      setIsRunning(false);
    }
  };

  // Delete project
  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone!')) return;

    try {
      const response = await fetch(`/api/blockly/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Project Deleted! 🗑️',
          description: 'The project has been removed successfully!',
        });
        await loadProjects();
        if (selectedProjectId === projectId) {
          setSelectedProjectId('');
          setProjectName('My Awesome Project');
        }
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Oops! 😅',
        description: 'Could not delete the project. Try again!',
        variant: 'destructive',
      });
    }
  };

  // Create new project
  const handleNewProject = () => {
    if (!workspaceRef.current) return;
    
    workspaceRef.current.clear();
    setProjectName('My Awesome Project');
    setSelectedProjectId('');
    
    toast({
      title: 'New Project! 🎨',
      description: 'Start creating something amazing!',
    });
  };

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-bold text-gray-800">Blocky Code Editor</h1>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              onClick={() => setShowTemplates(!showTemplates)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Templates
            </Button>
            
            <Button 
              onClick={handleNewProject}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
            
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="w-64"
            />
            
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
            
            <Button 
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            
            <Select value={selectedProjectId} onValueChange={handleLoad}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Load project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{project.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="ml-2 h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="absolute top-20 right-4 z-50 bg-white rounded-lg shadow-xl border p-4 w-80">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Choose a Template
            </h3>
            <div className="space-y-2">
              {projectTemplates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => loadTemplate(template)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowTemplates(false)}
              variant="outline"
              className="w-full mt-3"
            >
              Close
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr,400px] h-full">
          {/* Blockly Editor */}
          <div className="bg-white border-r shadow-sm">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">🧩</span>
                Drag blocks here to create your program
              </h3>
            </div>
            <div 
              ref={blocklyDivRef} 
              className="w-full h-full"
              style={{ minHeight: '600px' }}
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col bg-gray-50">
            <div className="p-3 border-b bg-white shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">🚀</span>
                Output Console
              </h3>
            </div>
            <div className="flex-1">
              <iframe
                ref={outputIframeRef}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title="Blocky Output"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlockyPage;
