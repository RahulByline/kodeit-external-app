import React, { useEffect, useRef } from "react";

interface PreviewPaneProps {
  html: string;
  css: string;
}

export default function PreviewPane({ html, css }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const doc = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
${css || ""}
</style>
</head>
<body>
${html || ""}
</body>
</html>`;

  useEffect(() => {
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = url;
    if (iframeRef.current) iframeRef.current.src = url;
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [doc]);

  return (
    <iframe
      ref={iframeRef}
      title="Preview"
      style={{ width: "100%", height: "100%", border: 0 }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
