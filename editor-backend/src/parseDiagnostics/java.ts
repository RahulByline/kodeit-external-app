import type { editor } from "monaco-editor";

export function parseJava(stderr: string): editor.IMarkerData[] {
  const markers: editor.IMarkerData[] = [];
  // javac: Main.java:5: error: ...
  const re = /Main\.java:(\d+):\s*error:\s*(.+)/g;
  let m;
  while ((m = re.exec(stderr)) !== null) {
    markers.push({
      message: m[2],
      startLineNumber: Number(m[1]),
      endLineNumber: Number(m[1]),
      startColumn: 1, endColumn: 200,
      severity: 8
    });
  }
  return markers;
}
