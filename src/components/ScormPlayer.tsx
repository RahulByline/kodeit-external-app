import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { X, Download, Play, Pause, RotateCcw, FileText, AlertCircle } from 'lucide-react';

interface ScormPlayerProps {
  packageUrl: string;
  title: string;
  onClose: () => void;
}

const ScormPlayer: React.FC<ScormPlayerProps> = ({ packageUrl, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scormContent, setScormContent] = useState<string | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadScormPackage();
  }, [packageUrl]);

  const loadScormPackage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`🔍 Loading SCORM package: ${packageUrl}`);
      
      // Download the SCORM package
      const response = await fetch(packageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download SCORM package: ${response.statusText}`);
      }
      
      const zipBlob = await response.blob();
      console.log(`✅ SCORM package downloaded: ${zipBlob.size} bytes`);
      
      // Extract the ZIP file
      await extractZipFile(zipBlob);
      
    } catch (err) {
      console.error('❌ Error loading SCORM package:', err);
      setError('Failed to load SCORM package. Please check your authentication.');
      setIsLoading(false);
    }
  };

  const extractZipFile = async (zipBlob: Blob) => {
    try {
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default;
      
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipBlob);
      
      console.log(`📦 Extracting ZIP file with ${Object.keys(zipContent.files).length} files`);
      
      const files: any[] = [];
      const htmlFiles: any[] = [];
      
      // Process all files in the ZIP
      for (const [filename, file] of Object.entries(zipContent.files)) {
        if (!file.dir) {
          const fileData = await file.async('blob');
          const fileUrl = URL.createObjectURL(fileData);
          
          const fileInfo = {
            name: filename,
            url: fileUrl,
            size: fileData.size,
            type: fileData.type || getFileType(filename)
          };
          
          files.push(fileInfo);
          
          // Look for HTML files (main SCORM content)
          if (filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')) {
            htmlFiles.push(fileInfo);
          }
        }
      }
      
      setExtractedFiles(files);
      
      // Find the main HTML file to display
      let mainFile = null;
      
      // Look for common SCORM entry points
      const entryPoints = ['index.html', 'index.htm', 'start.html', 'launch.html', 'scorm.html'];
      for (const entryPoint of entryPoints) {
        mainFile = htmlFiles.find(f => f.name.toLowerCase().includes(entryPoint.toLowerCase()));
        if (mainFile) break;
      }
      
      // If no specific entry point found, use the first HTML file
      if (!mainFile && htmlFiles.length > 0) {
        mainFile = htmlFiles[0];
      }
      
      if (mainFile) {
        console.log(`✅ Found main SCORM file: ${mainFile.name}`);
        setCurrentFile(mainFile.url);
        setScormContent(mainFile.url);
      } else {
        console.log('⚠️ No HTML files found in SCORM package');
        setError('No HTML content found in SCORM package');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Error extracting ZIP file:', err);
      setError('Failed to extract SCORM package');
      setIsLoading(false);
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'html':
      case 'htm':
        return 'text/html';
      case 'css':
        return 'text/css';
      case 'js':
        return 'application/javascript';
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  };

  const handleDownload = () => {
    // Create a temporary link to download the SCORM package
    const link = document.createElement('a');
    link.href = packageUrl;
    link.download = `${title}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(packageUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SCORM package...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load SCORM</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Package
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">SCORM Package • {extractedFiles.length} files</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-blue-600 hover:text-blue-700"
            title="Download SCORM Package"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-700"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* File Browser Sidebar */}
        {extractedFiles.length > 0 && (
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <h4 className="font-semibold text-gray-900 mb-3">Files</h4>
            <div className="space-y-1">
              {extractedFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFile(file.url);
                    setScormContent(file.url);
                  }}
                  className={`w-full text-left p-2 rounded text-sm ${
                    currentFile === file.url
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {scormContent && (
            <iframe
              ref={iframeRef}
              src={scormContent}
              className="w-full h-full border-0"
              title={`SCORM Content: ${title}`}
              allow="fullscreen; autoplay; encrypted-media; picture-in-picture; microphone; camera"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          {extractedFiles.length > 0 
            ? `SCORM package loaded with ${extractedFiles.length} files`
            : 'Loading SCORM package...'
          }
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScormPlayer;
