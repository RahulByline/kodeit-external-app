import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  className?: string;
  defaultSize?: string;
  minSize?: string;
  maxSize?: string;
  handle?: ReactNode;
  direction?: 'horizontal' | 'vertical';
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  className = '',
  defaultSize = '300px',
  minSize = '200px',
  maxSize = '600px',
  handle,
  direction = 'horizontal'
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const startSizeRef = useRef<number>(0);

  // Update size when defaultSize prop changes
  useEffect(() => {
    setSize(defaultSize);
  }, [defaultSize]);

  const getSizeInPixels = (sizeStr: string): number => {
    if (sizeStr.endsWith('px')) {
      return parseInt(sizeStr);
    }
    if (sizeStr.endsWith('%')) {
      const percentage = parseInt(sizeStr) / 100;
      return window.innerWidth * percentage;
    }
    return parseInt(sizeStr);
  };

  const getSizeString = (pixels: number): string => {
    // If maxSize is percentage, return percentage, otherwise return pixels
    if (maxSize.endsWith('%')) {
      const percentage = (pixels / window.innerWidth) * 100;
      return `${Math.round(percentage)}%`;
    }
    return `${pixels}px`;
  };

  const getMinSizeInPixels = (): number => {
    return getSizeInPixels(minSize);
  };

  const getMaxSizeInPixels = (): number => {
    return getSizeInPixels(maxSize);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizeRef.current = getSizeInPixels(size);
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPosRef.current;
    const newSize = startSizeRef.current + delta;

    const minSizePx = getMinSizeInPixels();
    const maxSizePx = getMaxSizeInPixels();
    
    const clampedSize = Math.max(minSizePx, Math.min(maxSizePx, newSize));
    setSize(getSizeString(clampedSize));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const panelStyle: React.CSSProperties = {
    width: direction === 'horizontal' ? size : '100%',
    height: direction === 'vertical' ? size : '100%',
    position: 'relative',
    flexShrink: 0,
    minWidth: direction === 'horizontal' ? minSize : undefined,
    maxWidth: direction === 'horizontal' ? maxSize : undefined,
  };

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: direction === 'horizontal' ? -8 : 0,
    right: direction === 'horizontal' ? undefined : 0,
    bottom: direction === 'horizontal' ? 0 : -8,
    width: direction === 'horizontal' ? 16 : '100%',
    height: direction === 'horizontal' ? '100%' : 16,
    cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
    transition: 'background-color 0.2s ease',
  };

  return (
    <div 
      ref={panelRef}
      className={`resizable-panel ${className} ${isResizing ? 'resizing' : ''}`}
      style={panelStyle}
    >
      {handle && (
        <div
          className="resize-handle-container"
          style={handleStyle}
          onMouseDown={handleMouseDown}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {handle}
        </div>
      )}
      {children}
    </div>
  );
};

export default ResizablePanel;
