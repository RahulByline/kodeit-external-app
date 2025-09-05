import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, RotateCcw, Download, Upload, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface Language {
  name: string;
  version: string;
  extension: string;
  label: string;
}

interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  signal: string | null;
  executionTime: number;
  memory: number;
}

// Default code templates for each language
const CODE_TEMPLATES = {
  python: `# Welcome to Python!
print("Hello, World!")

# Try some basic operations
name = input("What's your name? ")
print(f"Nice to meet you, {name}!")

# Simple calculation
a = 10
b = 5
print(f"{a} + {b} = {a + b}")`,

  javascript: `// Welcome to JavaScript!
console.log("Hello, World!");

// Try some basic operations
const name = "Developer";
console.log(\`Hello, \${name}!\`);

// Simple calculation
const a = 10;
const b = 5;
console.log(\`\${a} + \${b} = \${a + b}\`);

// Array operations
const numbers = [1, 2, 3, 4, 5];
console.log("Numbers:", numbers);
console.log("Sum:", numbers.reduce((sum, num) => sum + num, 0));`,


};

const Compiler: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>(CODE_TEMPLATES.python);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [error, setError] = useState<string>('');
  const editorRef = useRef<any>(null);

  // Load supported languages on component mount
  useEffect(() => {
    loadLanguages();
  }, []);

  // Update code when language changes
  useEffect(() => {
    setCode(CODE_TEMPLATES[selectedLanguage as keyof typeof CODE_TEMPLATES] || '');
    setResult(null);
    setError('');
  }, [selectedLanguage]);

  const loadLanguages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/compiler/languages');
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to load languages:', error);
      setError('Failed to load supported languages');
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to run');
      return;
    }

    setIsRunning(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/compiler/run', {
        language: selectedLanguage,
        code: code
      });

      setResult(response.data);
    } catch (error: any) {
      console.error('Code execution error:', error);
      setError(error.response?.data?.error || 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    setCode(CODE_TEMPLATES[selectedLanguage as keyof typeof CODE_TEMPLATES] || '');
    setResult(null);
    setError('');
  };

  const handleDownloadCode = () => {
    const extension = languages.find(lang => lang.name === selectedLanguage)?.extension || 'txt';
    const fileName = `code.${extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  const handleBackToEmulators = () => {
    navigate('/dashboard/student/emulators');
  };

  const getLanguageIcon = (lang: string) => {
    const iconStyle = { width: '16px', height: '16px', borderRadius: '2px' };
    
    switch (lang) {
      case 'python':
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
            alt="Python"
            style={iconStyle}
          />
        );
      case 'javascript':
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
            alt="JavaScript"
            style={iconStyle}
          />
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToEmulators}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Emulators</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compiler</h1>
              <p className="text-gray-600">Write, compile, and run code with Piston API</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Powered by Piston API
            </Badge>
            
          </div>
        </div>

        {/* Main Editor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - Code Editor */}
          <Card className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Code Editor</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.name} value={lang.name}>
                          <div className="flex items-center space-x-2">
                            {getLanguageIcon(lang.name)}
                            <span>{lang.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Editor Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isRunning ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Running...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Run Code</span>
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleResetCode}
                    disabled={isRunning}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCode}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept=".py,.js,.c,.cpp,.java,.txt"
                      onChange={handleUploadCode}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <Editor
                height="100%"
                defaultLanguage="python"
                language={selectedLanguage}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </CardContent>
          </Card>

          {/* Right Side - Terminal Output */}
          <Card className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Terminal Output</CardTitle>
              {result && (
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant={result.exitCode === 0 ? "default" : "destructive"}>
                    Exit Code: {result.exitCode}
                  </Badge>
                  <span className="text-gray-600">
                    Time: {result.executionTime}ms
                  </span>
                  {result.memory && (
                    <span className="text-gray-600">
                      Memory: {result.memory}KB
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <div className="h-full bg-black text-green-400 font-mono text-sm p-4 overflow-auto">
                {error && (
                  <div className="text-red-400 mb-4">
                    <div className="font-bold">Error:</div>
                    <div>{error}</div>
                  </div>
                )}
                
                {result && (
                  <>
                    {result.stdout && (
                      <div className="mb-4">
                        <div className="text-blue-400 font-bold mb-1">stdout:</div>
                        <div className="whitespace-pre-wrap">{result.stdout}</div>
                      </div>
                    )}
                    
                    {result.stderr && (
                      <div className="mb-4">
                        <div className="text-red-400 font-bold mb-1">stderr:</div>
                        <div className="whitespace-pre-wrap text-red-300">{result.stderr}</div>
                      </div>
                    )}
                    
                    {result.signal && (
                      <div className="text-yellow-400">
                        <div className="font-bold">Signal:</div>
                        <div>{result.signal}</div>
                      </div>
                    )}
                  </>
                )}
                
                {!result && !error && !isRunning && (
                  <div className="text-gray-500">
                    <div>Ready to run code...</div>
                    <div className="text-xs mt-2">
                      Select a language and click "Run Code" to execute your program.
                    </div>
                  </div>
                )}
                
                {isRunning && (
                  <div className="text-yellow-400">
                    <div className="animate-pulse">Executing code...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">1. Choose Language</h4>
                <p className="text-sm text-gray-600">
                  Select from Python, JavaScript, C, C++, or Java from the dropdown menu.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">2. Write Code</h4>
                <p className="text-sm text-gray-600">
                  Use the Monaco Editor to write your code with syntax highlighting and autocomplete.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">3. Run & Debug</h4>
                <p className="text-sm text-gray-600">
                  Click "Run Code" to execute your program and see the output in the terminal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Compiler;
