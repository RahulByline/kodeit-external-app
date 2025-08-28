import { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

type Props = {
  language: string;
  code: string;
  onChange: (v: string) => void;
  markers?: monaco.editor.IMarkerData[];
};

function mapLang(lang: string): string {
  switch (lang) {
    case "python": return "python";
    case "javascript": return "javascript";
    case "html": return "html";
    case "css": return "css";
    default: return "plaintext";
  }
}

export default function EditorPane({ language, code, onChange, markers = [] }: Props) {
  const monacoRef = useRef<typeof monaco | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const onMount: OnMount = (editor, monacoApi) => {
    monacoRef.current = monacoApi;
    editorRef.current = editor;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("saveCode"));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("runCode"));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, "owner", markers);
      }
    }
  }, [markers]);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Editor
        height="100%"
        width="100%"
        defaultLanguage={mapLang(language)}
        language={mapLang(language)}
        value={code}
        onChange={(v) => onChange(v ?? "")}
        theme="vs-light"
        options={{ 
          fontSize: 14, 
          minimap: { enabled: false }, 
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          roundedSelection: false,
          contextmenu: true,
          cursorStyle: "line",
          renderWhitespace: "selection",
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          wordBasedSuggestions: true,
          parameterHints: { enabled: true },
          quickSuggestions: true,
          suggestSelection: "first",
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12
          }
        }}
        onMount={onMount}
      />
    </div>
  );
}
