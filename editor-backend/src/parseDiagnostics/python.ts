import type { editor } from "monaco-editor";

export function parsePython(stderr: string): editor.IMarkerData[] {
  const markers: editor.IMarkerData[] = [];
  // Example: "  File "main.py", line 3, in <module>\n    x =\n        ^\nSyntaxError: invalid syntax"
  const fileMatch = /File ".*", line (\d+)/.exec(stderr);
  if (fileMatch) {
    const line = Number(fileMatch[1]) || 1;
    markers.push({
      message: stderr.split("\n").slice(-1)[0] || "Error",
      startLineNumber: line, endLineNumber: line, startColumn: 1, endColumn: 200,
      severity: 8 // MarkerSeverity.Error
    });
  }
  return markers;
}
