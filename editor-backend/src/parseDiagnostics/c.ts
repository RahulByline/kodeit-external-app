import type { editor } from "monaco-editor";

export function parseC(stderr: string): editor.IMarkerData[] {
  const markers: editor.IMarkerData[] = [];
  // gcc format: main.c:3:5: error: ...
  const re = /main\.c:(\d+):(\d+):\s*(fatal error|error|warning):\s*(.+)/g;
  let m;
  while ((m = re.exec(stderr)) !== null) {
    markers.push({
      message: m[4],
      startLineNumber: Number(m[1]),
      endLineNumber: Number(m[1]),
      startColumn: Number(m[2]),
      endColumn: Number(m[2]) + 1,
      severity: /warning/.test(m[3]) ? 4 : 8
    });
  }
  return markers;
}
