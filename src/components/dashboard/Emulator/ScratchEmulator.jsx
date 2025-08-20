import React from 'react'

export default function ScratchEmulator() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
      <iframe
        title="Scratch 3 Editor"
        src="/editor/index.html"
        style={{ width: '100%', height: '100%', border: 0 }}
        allow="cross-origin-isolated"
      />
    </div>
  )
}
