import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Monitor, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface TuxPaintEmulatorProps {
  className?: string;
}

const TuxPaintEmulator: React.FC<TuxPaintEmulatorProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
    setIsConnected(true);
    setIsError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIsError(true);
    setIsConnected(false);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const iframe = document.getElementById('tuxpaint-iframe') as HTMLIFrameElement;
    if (iframe) {
      if (!isFullscreen) {
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Handle refresh
  const refreshEmulator = () => {
    setIsLoading(true);
    setIsError(false);
    const iframe = document.getElementById('tuxpaint-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  // Handle play/pause (reload iframe)
  const togglePlayPause = () => {
    refreshEmulator();
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Tux Paint Emulator</h1>
            <p className="text-sm text-gray-600">Interactive drawing application for students</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          {isConnected && (
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          )}
          
          <button
            onClick={togglePlayPause}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Emulator"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Emulator Container */}
      <div className="relative bg-gray-900 min-h-[600px]">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Starting Tux Paint...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while the emulator loads</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Connection Failed</h3>
              <p className="text-gray-400 text-sm mb-4">
                Unable to connect to Tux Paint emulator. Please ensure the Docker container is running.
              </p>
              <div className="space-y-2 text-left text-xs text-gray-500 bg-gray-800 p-4 rounded-lg">
                <p><strong>Troubleshooting:</strong></p>
                <p>1. Check if Docker container is running: <code className="bg-gray-700 px-1 rounded">docker ps</code></p>
                <p>2. Start container: <code className="bg-gray-700 px-1 rounded">docker start tuxpaint-emulator</code></p>
                <p>3. Verify port 6080 is accessible: <code className="bg-gray-700 px-1 rounded">http://localhost:6080</code></p>
              </div>
              <button
                onClick={refreshEmulator}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Tux Paint iframe */}
        <iframe
          id="tuxpaint-iframe"
          src="http://localhost:6080"
          className="w-full h-[600px] border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Tux Paint Emulator"
          allow="fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Status: {isConnected ? 'Connected' : isError ? 'Error' : 'Connecting...'}</span>
            <span>Port: 6080</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Powered by noVNC</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TuxPaintEmulator;

