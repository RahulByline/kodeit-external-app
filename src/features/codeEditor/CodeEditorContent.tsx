import React, { useState, useEffect, useCallback } from "react";
import * as monaco from "monaco-editor";
import clsx from "clsx";
import {
  File,
  Play,
  Download,
  RefreshCw,
  Settings,
  Terminal,
  ChevronDown,
  GripVertical,
  Maximize2,
  Minimize2
} from "lucide-react";

import EditorPane from "./EditorPane";
import OutputPane from "./OutputPane";
import ErrorPane from "./ErrorPane";
import TerminalPane from "./TerminalPane";
import PreviewPane from "./PreviewPane";
import { templates } from "./templates";
import "./styles.css";
import ResizablePanel from "../../components/ResizablePanel";

type Language = "python" | "javascript" | "html-css";
type Tab = "output" | "errors" | "terminal";

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  diagnostics: monaco.editor.IMarkerData[];
}

const getFileExtension = (lang: Language): string => {
  switch (lang) {
    case "javascript": return "js";
    case "python": return "py";
    case "html-css": return "html";
    default: return "txt";
  }
};

const getLanguageLabel = (lang: Language): string => {
  switch (lang) {
    case "javascript": return "JavaScript";
    case "python": return "Python";
    case "html-css": return "HTML & CSS";
    default: return lang;
  }
};

const getLanguageIcon = (lang: Language): React.ReactElement => {
  const iconStyle = { width: '20px', height: '20px', borderRadius: '3px' };

  switch (lang) {
    case "javascript":
      return (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
          alt="JavaScript"
          style={iconStyle}
        />
      );
    case "python":
      return (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
          alt="Python"
          style={iconStyle}
        />
      );

    case "html-css":
      return (
        <div style={{ display: 'flex', gap: '2px' }}>
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
            alt="HTML"
            style={iconStyle}
          />
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
            alt="CSS"
            style={iconStyle}
          />
        </div>
      );
    default:
      return <span style={{ fontSize: '20px' }}>📄</span>;
  }
};

const getLanguageSymbol = (lang: Language): string => {
  switch (lang) {
    case "javascript": return "JS";
    case "python": return "PY";
    case "html-css": return "HTML+CSS";
    default: return (lang as string).toUpperCase();
  }
};

const getLanguageColor = (lang: Language): string => {
  // Keep language chip colors; UI chrome is controlled by CSS variables (pastel green).
  switch (lang) {
    case "javascript": return "#f7df1e";
    case "python": return "#3776ab";
    case "html-css": return "#e34f26";
    default: return "#007acc";
  }
};

const CodeEditorContent: React.FC = () => {
  const [language, setLanguage] = useState<Language>("html-css");
  const [code, setCode] = useState<string>(templates.javascript);
  const [htmlCode, setHtmlCode] = useState<string>(templates.html);
  const [cssCode, setCssCode] = useState<string>(templates.css);
  const [activeTab, setActiveTab] = useState<Tab>("output");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState("");
  const [diagnostics, setDiagnostics] = useState<monaco.editor.IMarkerData[]>([]);
  const [fileName, setFileName] = useState("main.js");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [stdinValue, setStdinValue] = useState("");
  const [executionStatus, setExecutionStatus] = useState("");
  const [activeFileTab, setActiveFileTab] = useState<"html" | "css">("html");

  // Load template and update filename when language changes
  useEffect(() => {
    if (language === "html-css") {
      // Load HTML and CSS from localStorage
      const savedHtml = localStorage.getItem(`codeEditor_html`);
      if (savedHtml && savedHtml.trim() !== "") {
        setHtmlCode(savedHtml);
      } else {
        setHtmlCode(templates.html);
      }
      
      const savedCss = localStorage.getItem(`codeEditor_css`);
      if (savedCss && savedCss.trim() !== "") {
        setCssCode(savedCss);
      } else {
        setCssCode(templates.css);
      }
      
      setFileName("index.html");
    } else {
      const savedCode = localStorage.getItem(`codeEditor_${language}`);
      if (savedCode && savedCode.trim() !== "") {
        setCode(savedCode);
      } else {
        setCode(templates[language] || `// ${getLanguageLabel(language)} Demo Code\nconsole.log("Hello, World!");`);
      }
      
      const extension = getFileExtension(language);
      const newFileName = `main.${extension}`;
      setFileName(newFileName);
    }

    const timer = setTimeout(() => setIsInitialized(true), 500);
    return () => clearTimeout(timer);
  }, [language]);

  // Save code to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`codeEditor_${language}`, code);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [code, language]);

  // Save HTML and CSS to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`codeEditor_html`, htmlCode);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [htmlCode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`codeEditor_css`, cssCode);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [cssCode]);

  const handleLanguageChange = useCallback((newLanguage: Language) => {
    const currentCode = code.trim();
    const currentTemplate = templates[language].trim();
    const savedCode = localStorage.getItem(`codeEditor_${language}`)?.trim();
    const hasUnsavedChanges = currentCode !== currentTemplate && currentCode !== savedCode;

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        `You have unsaved changes in ${getLanguageLabel(language)}. Do you want to switch to ${getLanguageLabel(newLanguage)} and lose your changes?`
      );
      if (!confirmed) return;
    }

    setOutput("");
    setErrors("");
    setDiagnostics([]);
    setLanguage(newLanguage);
  }, [code, language]);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput("");
    setErrors("");
    setDiagnostics([]);
    setActiveTab("output");
    setIsWaitingForInput(false);
    setInputValue("");
    setExecutionStatus("");

    // For HTML & CSS, just refresh the preview
    if (language === "html-css") {
      setOutput("Preview refreshed");
      setIsRunning(false);
      return;
    }

    try {
      console.log('🚀 Running code with interactive execution...');
      console.log('📝 Request payload:', { language, source: code, stdin: stdinValue });
      const response = await fetch(`https://kodeit-lms-backend.bylinelms.com/api/run-interactive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          source: code,
          stdin: stdinValue
        })
      });
      
      const result = await response.json();
    
      if (result.error) {
        setErrors(`Error: ${result.error}`);
        setActiveTab("errors");
      } else {
        // Check if waiting for input
        if (result.waitingForInput) {
          setIsWaitingForInput(true);
          setExecutionId(result.executionId);
          setOutput(result.stdout || "");
          setActiveTab("output");
          setExecutionStatus("Waiting for input...");
          return; // Don't set isRunning to false yet
        }
        
        // Check if there are compilation or runtime errors
        if (result.stderr && result.stderr.trim()) {
          setErrors(result.stderr.trim());
          setActiveTab("errors");
          
          // Parse errors for diagnostics (for supported languages)
          if (language === "python") {
            const errorDiagnostics = parseErrors(result.stderr, language);
            setDiagnostics(errorDiagnostics);
          }
        } else {
          const finalOut = result.stdout?.trim() || "No output";
          setOutput(finalOut);
          setActiveTab("output");
          
          // Set execution status
          const meta = `Status: ${result?.status?.description || 'OK'} | Time: ${result?.time ?? 'n/a'}`;
          setExecutionStatus(meta);
        }
      }
    } catch (error: any) {
      console.error('Code execution error:', error);
      const errorMessage = error.message || "Failed to run code";
      setErrors(`Error: ${errorMessage}`);
      setActiveTab("errors");
    } finally {
      setIsRunning(false);
    }
  }, [language, code, stdinValue, isRunning]);

  const saveCode = useCallback(() => {
    try {
      let contentToSave = code;
      let fileNameToSave = fileName;
      
      // For HTML & CSS, save the currently active file or both files
      if (language === "html-css") {
        if (activeFileTab === "html") {
          // Save only HTML file
          const htmlBlob = new Blob([htmlCode], { type: 'text/html' });
          const htmlUrl = URL.createObjectURL(htmlBlob);
          const htmlLink = document.createElement('a');
          htmlLink.href = htmlUrl;
          htmlLink.download = "main.html";
          document.body.appendChild(htmlLink);
          htmlLink.click();
          document.body.removeChild(htmlLink);
          URL.revokeObjectURL(htmlUrl);

          const successMessage = `✅ Downloaded: main.html`;
          const toast = document.createElement('div');
          toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>${successMessage}</span>
            </div>
          `;
          toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #a7f3d0, #86efac);
            color: #064e3b;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -2px rgba(0,0,0,.04);
            z-index: 9999;
            transform: translateX(400px);
            transition: all .4s cubic-bezier(.4,0,.2,1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(6, 78, 59, .08);
          `;
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 100);
          setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => { document.body.removeChild(toast); }, 300);
          }, 3000);
          return;
        } else if (activeFileTab === "css") {
          // Save only CSS file
          const cssBlob = new Blob([cssCode], { type: 'text/css' });
          const cssUrl = URL.createObjectURL(cssBlob);
          const cssLink = document.createElement('a');
          cssLink.href = cssUrl;
          cssLink.download = "main.css";
          document.body.appendChild(cssLink);
          cssLink.click();
          document.body.removeChild(cssLink);
          URL.revokeObjectURL(cssUrl);

          const successMessage = `✅ Downloaded: main.css`;
          const toast = document.createElement('div');
          toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>${successMessage}</span>
            </div>
          `;
          toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #a7f3d0, #86efac);
            color: #064e3b;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -2px rgba(0,0,0,.04);
            z-index: 9999;
            transform: translateX(400px);
            transition: all .4s cubic-bezier(.4,0,.2,1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(6, 78, 59, .08);
          `;
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 100);
          setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => { document.body.removeChild(toast); }, 300);
          }, 3000);
          return;
        }
      }
      
      const blob = new Blob([contentToSave], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileNameToSave;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const successMessage = `✅ Downloaded: ${fileNameToSave}`;
      const toast = document.createElement('div');
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>${successMessage}</span>
        </div>
      `;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #a7f3d0, #86efac);
        color: #064e3b;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -2px rgba(0,0,0,.04);
        z-index: 9999;
        transform: translateX(400px);
        transition: all .4s cubic-bezier(.4,0,.2,1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(6, 78, 59, .08);
      `;
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 100);
      setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => { document.body.removeChild(toast); }, 300);
      }, 3000);
    } catch (error: any) {
      alert(`Failed to download file: ${error.message}`);
    }
  }, [code, fileName, language, htmlCode, cssCode]);

  const handleErrorClick = useCallback((line: number, column: number) => {
    console.log(`Jump to line ${line}, column ${column}`);
  }, []);

  const toggleOutputExpansion = useCallback(() => {
    setIsOutputExpanded(!isOutputExpanded);
  }, [isOutputExpanded]);

  const sendInput = useCallback(async (input: string) => {
    if (!executionId || !isWaitingForInput) return;
    
    try {
      console.log('📝 Sending input:', input);
      
      // Check if the input contains multiple values (separated by newlines)
      const inputs = input.split('\n').filter(i => i.trim() !== '');
      
      if (inputs.length > 1) {
        // Multiple inputs provided, use the multiple input endpoint
        console.log('📝 Sending multiple inputs:', inputs);
        const response = await fetch(`https://kodeit-lms-backend.bylinelms.com/api/input-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            executionId,
            inputs: inputs
          })
        });
        
        const result = await response.json();
        
        if (result.error) {
          setErrors(`Error: ${result.error}`);
          setActiveTab("errors");
          setIsWaitingForInput(false);
          setIsRunning(false);
        } else {
          // Execution completed
          setIsWaitingForInput(false);
          setExecutionId(null);
          setInputValue("");
          setIsRunning(false);
          
          if (result.stderr && result.stderr.trim()) {
            setErrors(result.stderr.trim());
            setActiveTab("errors");
          } else {
            const finalOut = result.stdout?.trim() || "No output";
            setOutput(prev => prev + finalOut);
            setActiveTab("output");
            setExecutionStatus("Completed");
          }
        }
      } else {
        // Single input, use the regular input endpoint
        const response = await fetch(`https://kodeit-lms-backend.bylinelms.com/api/input`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            executionId,
            input: input,
            isLastInput: false
          })
        });
        
        const result = await response.json();
        
        if (result.error) {
          setErrors(`Error: ${result.error}`);
          setActiveTab("errors");
          setIsWaitingForInput(false);
          setIsRunning(false);
        } else if (result.waitingForInput) {
          // Still waiting for more input
          setOutput(prev => prev + (result.stdout || ""));
          setInputValue("");
          console.log('📝 Still waiting for more input...');
        } else {
          // Execution completed
          setIsWaitingForInput(false);
          setExecutionId(null);
          setInputValue("");
          setIsRunning(false);
          
          if (result.stderr && result.stderr.trim()) {
            setErrors(result.stderr.trim());
            setActiveTab("errors");
          } else {
            const finalOut = result.stdout?.trim() || "No output";
            setOutput(prev => prev + finalOut);
            setActiveTab("output");
            setExecutionStatus("Completed");
          }
        }
      }
    } catch (error: any) {
      console.error('Input error:', error);
      setErrors(`Error sending input: ${error.message}`);
      setActiveTab("errors");
      setIsWaitingForInput(false);
      setIsRunning(false);
    }
  }, [executionId, isWaitingForInput]);

  // Parse error messages to extract line numbers and create diagnostics
  const parseErrors = useCallback((errorOutput: string, lang: Language): monaco.editor.IMarkerData[] => {
    const diagnostics: monaco.editor.IMarkerData[] = [];
    const lines = errorOutput.split('\n');
    
    for (const line of lines) {
      let match: RegExpMatchArray | null = null;
      
      if (lang === "python") {
        // Python error format: File "main.py", line X, in <module>
        match = line.match(/File ".*", line (\d+)/);
      }
      
      if (match) {
        const lineNumber = parseInt(match[1]);
        const column = 1;
        
        diagnostics.push({
          message: line.trim(),
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column + 1
        });
      }
    }
    
    return diagnostics;
  }, []);

  // keyboard shortcuts (custom events are dispatched elsewhere in app)
  useEffect(() => {
    const handleRunCode = () => runCode();
    const handleSaveCode = () => saveCode();
    document.addEventListener("runCode", handleRunCode);
    document.addEventListener("saveCode", handleSaveCode);
    return () => {
      document.removeEventListener("runCode", handleRunCode);
      document.removeEventListener("saveCode", handleSaveCode);
    };
  }, [runCode, saveCode]);

  // close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.language-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="vscode-editor">
      {/* Header */}
      <div className="vscode-header">
        <div className="vscode-title">
          <div className="language-header">
            <div className="language-icon">{getLanguageIcon(language)}</div>
            <span
              className="language-symbol"
              style={{ backgroundColor: getLanguageColor(language) }}
            >
              {getLanguageSymbol(language)}
            </span>
            <span className="language-name">{getLanguageLabel(language)} Compiler</span>
          </div>
        </div>
        <div className="vscode-actions">
          <div className="status-indicators">
            <div
              className={`status-dot ${isInitialized ? "ready" : "loading"}`}
              title={isInitialized ? "Editor Ready" : "Loading..."}
            ></div>
            {isRunning && (
              <div className="activity-indicator" title="Code Running">
                <div className="pulse"></div>
              </div>
            )}
          </div>
          <button className="vscode-btn" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
          </button>
          <button className="vscode-btn">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="vscode-layout">
        {/* Main Content */}
        <div className="vscode-main vscode-main-fullwidth">
          {/* Tab Bar */}
          <div className="vscode-tabs">
            {language === "html-css" ? (
              <>
                <div 
                  className={`tab-item ${activeFileTab === "html" ? "active" : ""}`}
                  onClick={() => setActiveFileTab("html")}
                >
                  <File size={14} />
                  <span>main.html</span>
                  <button 
                    className="tab-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Don't allow closing the last tab
                    }}
                  >
                    ×
                  </button>
                </div>
                <div 
                  className={`tab-item ${activeFileTab === "css" ? "active" : ""}`}
                  onClick={() => setActiveFileTab("css")}
                >
                  <File size={14} />
                  <span>main.css</span>
                  <button 
                    className="tab-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Don't allow closing the last tab
                    }}
                  >
                    ×
                  </button>
                </div>
              </>
            ) : (
              <div className="tab-item active">
                <File size={14} />
                <span>{fileName}</span>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="vscode-toolbar">
            <div className="toolbar-left">
              <div className="language-dropdown">
                <button
                  className="language-selector-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="selected-language">
                    <div className="language-icon-small">{getLanguageIcon(language)}</div>
                    <span className="language-symbol-small" style={{ backgroundColor: getLanguageColor(language) }}>
                      {getLanguageSymbol(language)}
                    </span>
                    <span>{getLanguageLabel(language)}</span>
                  </div>
                  <ChevronDown size={16} className={clsx("dropdown-chevron", { open: isDropdownOpen })} />
                </button>

                {isDropdownOpen && (
                  <div className="language-dropdown-menu">
                    {(["javascript", "python", "html-css"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        className={clsx("language-option", { active: lang === language })}
                        onClick={() => {
                          handleLanguageChange(lang);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="language-icon-small">{getLanguageIcon(lang)}</div>
                        <span className="language-symbol-small" style={{ backgroundColor: getLanguageColor(lang) }}>
                          {getLanguageSymbol(lang)}
                        </span>
                        <span>{getLanguageLabel(lang)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="toolbar-center">
              <button
                className="run-btn"
                onClick={runCode}
                disabled={isRunning}
              >
                <Play size={16} />
                {isRunning ? "Running..." : "Run"}
              </button>

              <button
                className="download-btn"
                onClick={saveCode}
                title={`Download ${language === "html-css" ? (activeFileTab === "html" ? "main.html" : "main.css") : fileName}`}
              >
                <Download size={16} />
                Download {language === "html-css" ? (activeFileTab === "html" ? "HTML" : "CSS") : ""}
              </button>

              <button
                className="demo-btn"
                onClick={() => {
                  if (window.confirm(`Reset to ${getLanguageLabel(language)} demo code? This will discard current changes.`)) {
                    if (language === "html-css") {
                      setHtmlCode(templates.html);
                      setCssCode(templates.css);
                      setActiveFileTab("html"); // Reset to HTML tab
                    } else {
                      setCode(templates[language]);
                    }
                    setOutput("");
                    setErrors("");
                    setDiagnostics([]);
                  }
                }}
                title={`Load ${getLanguageLabel(language)} demo code`}
              >
                <RefreshCw size={16} />
                Demo
              </button>
            </div>

            <div className="toolbar-right">
              <span className="shortcuts-hint">
                Ctrl+Enter to run • Ctrl+S to download
              </span>
            </div>
          </div>

          {/* Editor + Output */}
          <div className="editor-layout">
            {language === "html-css" ? (
              <div className="editor-container">
                <EditorPane
                  language={activeFileTab === "html" ? "html" : "css"}
                  code={activeFileTab === "html" ? htmlCode : cssCode}
                  onChange={activeFileTab === "html" ? setHtmlCode : setCssCode}
                  markers={[]}
                />
              </div>
            ) : (
              <div className="editor-container">
                <EditorPane
                  language={language}
                  code={code}
                  onChange={setCode}
                  markers={diagnostics}
                />
              </div>
            )}

            <ResizablePanel
              className={`output-container ${isOutputExpanded ? 'expanded' : ''}`}
              defaultSize={isOutputExpanded ? "90%" : "400px"}
              minSize="200px"
              maxSize="90%"
              handle={<GripVertical className="resize-handle" />}
            >
              <div className="output-tabs">
                <div className="output-tabs-left">
                  <div
                    className={clsx("output-tab", { active: activeTab === "output" })}
                    onClick={() => setActiveTab("output")}
                  >
                    Output
                  </div>
                  <div
                    className={clsx("output-tab", { active: activeTab === "errors" })}
                    onClick={() => setActiveTab("errors")}
                  >
                    Errors {diagnostics.length > 0 && `(${diagnostics.length})`}
                  </div>
                  <div
                    className={clsx("output-tab", "terminal-toggle", { active: isTerminalOpen })}
                    onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  >
                    <Terminal size={14} />
                    Terminal
                  </div>
                </div>

                <div className="tab-actions">
                  <button
                    className="expand-btn"
                    onClick={toggleOutputExpansion}
                    title={isOutputExpanded ? "Collapse Output" : "Expand Output"}
                  >
                    {isOutputExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <div className="resize-indicator">
                    <GripVertical size={12} />
                  </div>
                  <button
                    className="clear-btn"
                    onClick={() => {
                      setOutput("");
                      setErrors("");
                      setDiagnostics([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="output-content">
                {activeTab === "output" && (
                  <>
                    {language === "html-css" ? (
                      <div className="preview-container">
                        <div className="preview-header">
                          <span>Live Preview (HTML + CSS)</span>
                        </div>
                        <div className="preview-body">
                          <PreviewPane html={htmlCode} css={cssCode} />
                        </div>
                        <div className="preview-status">
                          {output}
                        </div>
                      </div>
                    ) : (
                      <OutputPane 
                        output={output} 
                        isWaitingForInput={isWaitingForInput}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        onInputSubmit={sendInput}
                        status={executionStatus}
                      />
                    )}
                  </>
                )}
                {activeTab === "errors" && (
                  <>
                    {diagnostics.length > 0 ? (
                      <ErrorPane errors={diagnostics} onErrorClick={handleErrorClick} />
                    ) : (
                      <div className="errorsList">
                        <div className="item">
                          <div style={{ fontWeight: "bold", color: "#d32f2f" }}>
                            Execution Error
                          </div>
                          <div style={{ marginTop: "4px", whiteSpace: "pre-wrap" }}>
                            {errors}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ResizablePanel>
          </div>
        </div>
      </div>

      {/* Bottom Terminal */}
      {isTerminalOpen && (
        <div className="horizontal-terminal">
          <div className="terminal-header">
            <div className="terminal-title">
              <Terminal size={16} />
              <span>Terminal</span>
            </div>
            <button
              className="terminal-close-btn"
              onClick={() => setIsTerminalOpen(false)}
              title="Close Terminal"
            >
              ×
            </button>
          </div>
          <div className="terminal-content">
            <TerminalPane isActive={isTerminalOpen} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditorContent;
