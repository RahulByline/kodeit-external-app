import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  source?: string;
  language?: string;
  structured?: {
    title?: string;
    keyPoints?: string[];
    tips?: string[];
    sources?: string[];
    images?: string[];
  };
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  addMessageToChat: (role: 'user' | 'bot', content: string) => void;
  updateLastAiMessage: (content: string) => void;
  setIsOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  sendMessageToOllama: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add a message to the chat
  const addMessageToChat = useCallback((role: 'user' | 'bot', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: role,
      timestamp: new Date().toISOString(),
      source: role === 'bot' ? 'My AI Buddy (Kodeit)' : undefined,
      language: 'en',
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Update the last AI message (for streaming)
  const updateLastAiMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      
      if (lastMessage && lastMessage.sender === 'bot') {
        lastMessage.content = content;
      }
      
      return newMessages;
    });
  }, []);

  // Send message to Ollama API
  const sendMessageToOllama = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessageToChat('user', content);

    // Create a temporary bot message for streaming
    const tempBotMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      source: 'My AI Buddy (Kodeit)',
      language: 'en',
    };

    setMessages(prev => [...prev, tempBotMessage]);
    setIsLoading(true);

    try {
      // Send to Ollama API
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          messages: [{ role: 'user', content }],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                
                if (data.message && data.message.content) {
                  accumulatedContent += data.message.content;
                  updateLastAiMessage(accumulatedContent);
                }
              } catch (parseError) {
                console.error('Error parsing Ollama response:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Finalize the message with structured content parsing
      const finalMessage = {
        ...tempBotMessage,
        content: accumulatedContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => prev.map(msg => 
        msg.id === tempBotMessage.id ? finalMessage : msg
      ));

    } catch (error) {
      console.error('Error sending message to Ollama:', error);
      
      // Update the bot message with error
      setMessages(prev => prev.map(msg => 
        msg.id === tempBotMessage.id 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error. Please try again.',
              timestamp: new Date().toISOString()
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [addMessageToChat, updateLastAiMessage]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: ChatContextType = {
    messages,
    isLoading,
    isOpen,
    addMessageToChat,
    updateLastAiMessage,
    setIsOpen,
    setIsLoading,
    sendMessageToOllama,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
