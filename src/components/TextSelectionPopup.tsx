import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import './TextSelectionPopup.css';

interface TextSelectionPopupProps {
  onAskAboutText: (selectedText: string) => void;
  isChatOpen: boolean;
}

interface PopupPosition {
  x: number;
  y: number;
  visible: boolean;
}

const TextSelectionPopup: React.FC<TextSelectionPopupProps> = ({ 
  onAskAboutText, 
  isChatOpen 
}) => {
  const [position, setPosition] = useState<PopupPosition>({ x: 0, y: 0, visible: false });
  const [selectedText, setSelectedText] = useState<string>('');
  const popupRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selection && selectedText && selectedText.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate popup position
      const popupX = rect.left + (rect.width / 2);
      const popupY = rect.top - 50; // Position above the selection
      
      // Ensure popup doesn't go off-screen
      const adjustedX = Math.max(10, Math.min(popupX, window.innerWidth - 200));
      const adjustedY = Math.max(10, popupY);
      
      setPosition({
        x: adjustedX,
        y: adjustedY,
        visible: true
      });
      setSelectedText(selectedText);
    } else {
      setPosition(prev => ({ ...prev, visible: false }));
      setSelectedText('');
    }
  }, []);

  // Handle clicks outside the popup
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setPosition(prev => ({ ...prev, visible: false }));
      setSelectedText('');
    }
  }, []);

  // Handle popup click
  const handlePopupClick = useCallback(() => {
    if (selectedText) {
      onAskAboutText(selectedText);
      setPosition(prev => ({ ...prev, visible: false }));
      setSelectedText('');
      
      // Clear the text selection
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
    }
  }, [selectedText, onAskAboutText]);

  // Handle keyboard events (Escape to hide)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setPosition(prev => ({ ...prev, visible: false }));
      setSelectedText('');
    }
  }, []);

  // Debounced selection handler
  const debouncedSelectionHandler = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      handleTextSelection();
    }, 100);
  }, [handleTextSelection]);

  // Set up event listeners
  useEffect(() => {
    // Don't show popup if chat is open
    if (isChatOpen) {
      setPosition(prev => ({ ...prev, visible: false }));
      return;
    }

    document.addEventListener('mouseup', debouncedSelectionHandler);
    document.addEventListener('keyup', debouncedSelectionHandler);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseup', debouncedSelectionHandler);
      document.removeEventListener('keyup', debouncedSelectionHandler);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSelectionHandler, handleClickOutside, handleKeyDown, isChatOpen]);

  // Hide popup when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setPosition(prev => ({ ...prev, visible: false }));
      setSelectedText('');
    }
  }, [isChatOpen]);

  if (!position.visible || !selectedText) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="text-selection-popup"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
      onClick={handlePopupClick}
    >
      <div className="popup-content">
        <MessageCircle className="popup-icon" size={16} />
        <span className="popup-text">Ask My AI Buddy About It</span>
      </div>
    </div>
  );
};

export default TextSelectionPopup;
