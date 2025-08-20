import React from 'react';
import { useChat } from '../context/ChatContext';
import TextSelectionPopup from './TextSelectionPopup';

const TextSelectionPopupWrapper: React.FC = () => {
  const { isOpen, sendMessageToOllama } = useChat();

  const handleAskAboutText = async (selectedText: string) => {
    try {
      await sendMessageToOllama(selectedText);
    } catch (error) {
      console.error('Error asking about selected text:', error);
    }
  };

  return (
    <TextSelectionPopup
      onAskAboutText={handleAskAboutText}
      isChatOpen={isOpen}
    />
  );
};

export default TextSelectionPopupWrapper;
