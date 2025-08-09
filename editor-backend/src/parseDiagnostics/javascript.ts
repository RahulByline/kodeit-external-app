import type { editor } from "monaco-editor";

export function parseJavaScript(stderr: string): editor.IMarkerData[] {
  const markers: editor.IMarkerData[] = [];
  const m = /:(\d+):(\d+)/.exec(stderr);
  if (m) {
    markers.push({
      message: stderr.trim(),
      startLineNumber: Number(m[1]), endLineNumber: Number(m[1]),
      startColumn: Number(m[2]), endColumn: Number(m[2]) + 1,
      severity: 8
    });
  }
  return markers;
}
