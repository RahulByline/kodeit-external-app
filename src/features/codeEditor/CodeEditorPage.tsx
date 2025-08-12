import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as monaco from "monaco-editor";
import clsx from "clsx";
import DashboardLayout from "../../components/DashboardLayout";
import {
  File,
  Play,
  Download,
  RefreshCw,
  Settings,
  Terminal,
  ChevronDown
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import EditorPane from "./EditorPane";
import OutputPane from "./OutputPane";
import ErrorPane from "./ErrorPane";
import TerminalPane from "./TerminalPane";
import { templates } from "./templates";
import "./styles.css";

type Language = "python" | "javascript" | "c" | "cpp" | "java";
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
    case "c": return "c";
    case "cpp": return "cpp";
    case "java": return "java";
    default: return "txt";
  }
};

const getLanguageLabel = (lang: Language): string => {
  switch (lang) {
    case "javascript": return "JavaScript";
    case "python": return "Python";
    case "c": return "C";
    case "cpp": return "C++";
    case "java": return "Java";
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
    case "c":
      return (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"
          alt="C"
          style={iconStyle}
        />
      );
    case "cpp":
      return (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"
          alt="C++"
          style={iconStyle}
        />
      );
    case "java":
      return (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"
          alt="Java"
          style={iconStyle}
        />
      );
    default:
      return <span style={{ fontSize: '20px' }}>📄</span>;
  }
};

const getLanguageSymbol = (lang: Language): string => {
  switch (lang) {
    case "javascript": return "JS";
    case "python": return "PY";
    case "c": return "C";
    case "cpp": return "C++";
    case "java": return "JAVA";
    default: return (lang as string).toUpperCase();
  }
};

const getLanguageColor = (lang: Language): string => {
  // Keep language chip colors; UI chrome is controlled by CSS variables (pastel green).
  switch (lang) {
    case "javascript": return "#f7df1e";
    case "python": return "#3776ab";
    case "c": return "#00599c";
    case "cpp": return "#00599c";
    case "java": return "#ed8b00";
    default: return "#007acc";
  }
};

const CodeEditorPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState<string>(templates.javascript);
  const [activeTab, setActiveTab] = useState<Tab>("output");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState("");
  const [diagnostics, setDiagnostics] = useState<monaco.editor.IMarkerData[]>([]);
  const [fileName, setFileName] = useState("main.js");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Load template and update filename when language changes
  useEffect(() => {
    const savedCode = localStorage.getItem(`codeEditor_${language}`);
    if (savedCode && savedCode.trim() !== "") {
      setCode(savedCode);
    } else {
      setCode(templates[language] || `// ${getLanguageLabel(language)} Demo Code\nconsole.log("Hello, World!");`);
    }
    const extension = getFileExtension(language);
    const newFileName = language === "java" ? "Main.java" : `main.${extension}`;
    setFileName(newFileName);

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

    try {
      console.log('🚀 Running code with local execution...');
      const response = await fetch(`${import.meta.env.VITE_RUN_PROXY_URL || "http://localhost:5000"}/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code
        })
      });
      
      const result = await response.json();
      
      if (result.error) {
        setErrors(`Error: ${result.error}`);
        setActiveTab("errors");
      } else {
        const finalOut = result.stderr?.trim() || result.stdout?.trim() || "No output";
        setOutput(finalOut);
        setActiveTab("output");
      }
    } catch (error: any) {
      console.error('Code execution error:', error);
      const errorMessage = error.message || "Failed to run code";
      setErrors(`Error: ${errorMessage}`);
      setActiveTab("errors");
    } finally {
      setIsRunning(false);
    }
  }, [language, code, isRunning]);

  const saveCode = useCallback(() => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const successMessage = `✅ Downloaded: ${fileName}`;
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
  }, [code, fileName]);

  const handleErrorClick = useCallback((line: number, column: number) => {
    console.log(`Jump to line ${line}, column ${column}`);
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
    <DashboardLayout userRole="student" userName={currentUser?.fullname || "Student"}>
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
                <div className="tab-item active">
                  <File size={14} />
                  <span>{fileName}</span>
                </div>
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
                        {(["javascript", "python", "c", "cpp", "java"] as Language[]).map((lang) => (
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
                    title={`Download ${fileName}`}
                  >
                    <Download size={16} />
                    Download
                  </button>

                  <button
                    className="demo-btn"
                    onClick={() => {
                      if (window.confirm(`Reset to ${getLanguageLabel(language)} demo code? This will discard current changes.`)) {
                        setCode(templates[language]);
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
                <div className="editor-container">
                  <EditorPane
                    language={language}
                    code={code}
                    onChange={setCode}
                    markers={diagnostics}
                  />
                </div>

                <div className="output-container">
                  <div className="output-tabs">
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

                    <div className="tab-actions">
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
                    {activeTab === "output" && <OutputPane output={output} />}
                    {activeTab === "errors" && (
                      <ErrorPane errors={diagnostics} onErrorClick={handleErrorClick} />
                    )}
                  </div>
                </div>
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
    </DashboardLayout>
  );
};

export default CodeEditorPage;
