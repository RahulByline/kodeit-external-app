import React, { useEffect, useRef, useState } from 'react';
import ScratchBlocks from './ScratchBlocks';

// Dynamic import for Scratch VM to avoid bundling issues
let VM: any = null;
interface ScratchEditorProps {
  projectId?: string;
  onProjectSave?: (projectData: any) => void;
}

const ScratchEditor: React.FC<ScratchEditorProps> = ({ 
  projectId, 
  onProjectSave 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vmRef = useRef<any | null>(null);
  const renderRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    const initializeScratch = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const canvas = canvasRef.current;
        if (!canvas) return;
        // Dynamically load Scratch VM
        if (!VM) {
          const scratchVM = await import('scratch-vm');
          VM = scratchVM.default;
        }
        // Initialize Scratch VM
        const vm = new VM();
        vmRef.current = vm;

        // Import Scratch renderer dynamically
        const ScratchRender = await import('scratch-render');
        const renderer = new ScratchRender.default(canvas);
        renderRef.current = renderer;

        // Connect VM to renderer
        vm.attachRenderer(renderer);

        // Set up VM event listeners
        vm.on('PROJECT_LOADED', () => {
          console.log('Project loaded successfully');
          setIsLoading(false);
        });

        vm.on('RUNTIME_DISPOSED', () => {
          console.log('Runtime disposed');
        });

        // Load default project
        try {
          // Create a simple default project
          const defaultProject = {
            targets: [
              {
                isStage: true,
                name: 'Stage',
                variables: {},
                lists: {},
                broadcasts: {},
                blocks: {},
                comments: {},
                currentCostume: 0,
                costumes: [
                  {
                    name: 'backdrop1',
                    md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
                    assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
                    dataFormat: 'svg',
                    rotationCenterX: 240,
                    rotationCenterY: 180
                  }
                ],
                sounds: [],
                volume: 100,
                layerOrder: 0
              },
              {
                isStage: false,
                name: 'Sprite1',
                variables: {},
                lists: {},
                broadcasts: {},
                blocks: {},
                comments: {},
                currentCostume: 0,
                costumes: [
                  {
                    name: 'costume1',
                    md5ext: 'bcf454acf82e4504149f7ffe07081dbc.svg',
                    assetId: 'bcf454acf82e4504149f7ffe07081dbc',
                    dataFormat: 'svg',
                    rotationCenterX: 48,
                    rotationCenterY: 50
                  }
                ],
                sounds: [],
                volume: 100,
                layerOrder: 1,
                x: 0,
                y: 0,
                size: 100,
                direction: 90,
                draggable: false,
                rotationStyle: 'all around',
                visible: true
              }
            ],
            monitors: [],
            extensions: [],
            meta: {
              semver: '3.0.0',
              vm: '1.0.0'
            }
          };

          await vm.loadProject(defaultProject);
          vm.start();
          setProjectData(defaultProject);
        } catch (projectError) {
          console.error('Error loading default project:', projectError);
          // Fallback to empty project
          vm.clear();
          vm.start();
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Scratch:', err);
        setError('Failed to initialize Scratch editor. Some features may not work properly.');
        setIsLoading(false);
      }
    };

    initializeScratch();

    // Cleanup on unmount
    return () => {
      if (vmRef.current) {
        vmRef.current.quit();
      }
      if (renderRef.current) {
        renderRef.current.destroy();
      }
    };
  }, []);

  const moveSprite = (steps: number) => {
    if (vmRef.current) {
      const targets = vmRef.current.runtime.targets;
      const sprite = targets.find((target: any) => !target.isStage);
      if (sprite) {
        const currentX = sprite.x;
        const currentY = sprite.y;
        const direction = sprite.direction;
        
        const radians = (direction - 90) * Math.PI / 180;
        const newX = currentX + steps * Math.cos(radians);
        const newY = currentY + steps * Math.sin(radians);
        
        sprite.setXY(newX, newY);
      }
    }
  };

  const turnSprite = (degrees: number) => {
    if (vmRef.current) {
      const targets = vmRef.current.runtime.targets;
      const sprite = targets.find((target: any) => !target.isStage);
      if (sprite) {
        sprite.setDirection(sprite.direction + degrees);
      }
    }
  };

  const handleGreenFlag = () => {
    if (vmRef.current) {
      setIsRunning(true);
      vmRef.current.greenFlag();
    }
  };

  const handleStopAll = () => {
    if (vmRef.current) {
      setIsRunning(false);
      vmRef.current.stopAll();
    }
  };

  const handleSaveProject = async () => {
    if (vmRef.current && onProjectSave) {
      try {
        const serializedProject = await vmRef.current.saveProjectSb3();
        const projectData = {
          data: serializedProject,
          timestamp: new Date().toISOString(),
          format: 'sb3'
        };
        onProjectSave(projectData);
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <div className="text-red-500">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading Scratch Editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleGreenFlag}
            disabled={isRunning}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
          >
            ▶️ Start
          </button>
          <button 
            onClick={handleStopAll}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            ⏹️ Stop
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSaveProject}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            💾 Save
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Blocks Area */}
        <div className="w-1/2 border-r bg-gray-50">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Programming Blocks</h3>
              <p className="text-sm text-gray-600">Drag blocks to create your program</p>
            </div>
            <div className="flex-1">
              <ScratchBlocks 
                vmInstance={vmRef.current}
                onCodeChange={(code) => {
                  console.log('Blocks code changed:', code);
                }}
              />
            </div>
          </div>
        </div>

        {/* Stage Area */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 bg-white"
                width="480"
                height="360"
              />
              {vmRef.current && (
                <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                  Scratch VM: Ready | Status: {isRunning ? 'Running' : 'Stopped'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchEditor;
