import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Loader2, X, CheckCircle, Lightbulb, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import './MyAIBuddy.css';

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

interface ChatResponse {
  response: string;
  timestamp: string;
  source: string;
  language: string;
  conversationId: string;
}

const MyAIBuddy: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

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

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
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

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'start') {
                  // Update the bot message with source info
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempBotMessage.id 
                      ? { ...msg, source: data.source, language: data.language }
                      : msg
                  ));
                                 } else if (data.type === 'chunk') {
                   // Append chunk to the current bot message
                   setMessages(prev => prev.map(msg => 
                     msg.id === tempBotMessage.id 
                       ? { ...msg, content: msg.content + data.content }
                       : msg
                   ));
                   
                   // Auto-scroll to bottom as content streams
                   setTimeout(() => {
                     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                   }, 100);
                                 } else if (data.type === 'end') {
                   // Finalize the bot message with structured content
                   console.log('Final response:', data.response);
                   const structured = parseStructuredContent(data.response);
                   console.log('Parsed structured content:', structured);
                   
                   setMessages(prev => prev.map(msg => 
                     msg.id === tempBotMessage.id 
                       ? { 
                           ...msg, 
                           content: data.response,
                           timestamp: data.timestamp,
                           source: data.source,
                           language: data.language,
                           structured: structured
                         }
                       : msg
                   ));
                } else if (data.type === 'error') {
                  // Handle error
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempBotMessage.id 
                      ? { 
                          ...msg, 
                          content: 'Sorry, I encountered an error. Please try again.',
                          timestamp: new Date().toISOString()
                        }
                      : msg
                  ));
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Parse structured content from bot responses
  const parseStructuredContent = (content: string) => {
    console.log('Parsing content:', content);
    const structured: any = {};
    
    // Extract title (lines starting with 📖)
    const titleMatch = content.match(/📖\s*(.+)/);
    if (titleMatch) {
      structured.title = titleMatch[1];
      console.log('Found title:', structured.title);
    }
    
    // Extract key points (lines starting with ✅)
    const keyPoints = content.match(/✅\s*(.+)/g);
    if (keyPoints) {
      structured.keyPoints = keyPoints.map(point => point.replace('✅ ', ''));
      console.log('Found key points:', structured.keyPoints);
    }
    
    // Extract tips (lines starting with 🧠)
    const tips = content.match(/🧠\s*(.+)/g);
    if (tips) {
      structured.tips = tips.map(tip => tip.replace('🧠 ', ''));
      console.log('Found tips:', structured.tips);
    }
    
    // Extract sources (lines starting with 📎)
    const sources = content.match(/📎\s*(.+)/g);
    if (sources) {
      structured.sources = sources.map(source => source.replace('📎 ', ''));
      console.log('Found sources:', structured.sources);
    }
    
    // Extract images (lines containing <img src="...">)
    const images = content.match(/<img src="([^"]+)"[^>]*>/g);
    if (images) {
      structured.images = images.map(img => {
        const srcMatch = img.match(/src="([^"]+)"/);
        return srcMatch ? srcMatch[1] : '';
      }).filter(Boolean);
      console.log('Found images:', structured.images);
    }
    
    console.log('Final structured object:', structured);
    return structured;
  };

    // Render structured bot message
  const renderStructuredMessage = (message: Message) => {
    if (message.sender !== 'bot') {
      return (
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      );
    }

    // If we have structured content, render it
    if (message.structured) {
      const { title, keyPoints, tips, sources, images } = message.structured;

      return (
        <div className="space-y-4">
          {/* Title */}
          {title && (
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
          )}
          
          {/* Images */}
          {images && images.length > 0 && (
            <div className="space-y-2">
              {images.map((src, index) => (
                <img 
                  key={index}
                  src={src} 
                  alt="Response image"
                  className="rounded-lg max-w-full h-auto shadow-sm response-image hover-lift"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Key Points */}
          {keyPoints && keyPoints.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Key Points</span>
              </div>
              <ul className="space-y-1 pl-6">
                {keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2 key-point">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="space-y-2 tips-section">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Tips & Insights</span>
              </div>
              <ul className="space-y-1 pl-6">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2 key-point">
                    <span className="text-yellow-500 mt-1">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Sources */}
          {sources && sources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Sources</span>
              </div>
              <ul className="space-y-1 pl-6">
                {sources.map((source, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                    <span className="text-gray-400 mt-1">📎</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // If no structured content, show regular text
    return (
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    );
  };

  return (
    <>
             {/* Floating Chat Button */}
       {!isOpen && (
         <Button
           onClick={() => setIsOpen(true)}
           className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50 p-2"
           size="icon"
         >
           <img 
             src="/Robot.gif" 
             alt="AI Buddy Robot" 
             className="h-10 w-10 rounded-full object-cover"
           />
         </Button>
       )}

                       {/* Chat Window */}
        {isOpen && (
          <div className="fixed bottom-20 right-6 w-[800px] h-[700px] z-50 chat-window chat-container">
            <Card className="h-full shadow-2xl border-0 bg-white dark:bg-gray-900 enhanced-shadow">
                         <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
               <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                             <div className="p-2 bg-white/20 rounded-full">
                               <img 
                                 src="/Robot.gif" 
                                 alt="AI Buddy Robot" 
                                 className="h-8 w-8 rounded-full object-cover"
                               />
                             </div>
                             <div className="pl-2">
                               <CardTitle className="text-xl font-semibold flex items-center">
                                 <img 
                                   src="/Robot.gif" 
                                   alt="Robot" 
                                   className="h-6 w-6 mr-2 rounded-full object-cover"
                                 />
                                 My AI Buddy
                               </CardTitle>
                               <p className="text-sm text-blue-100 mt-1">Powered by Koedit</p>
                             </div>
                           </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

                         <CardContent className="p-0 h-full flex flex-col">
               {/* Messages Area */}
               <ScrollArea className="flex-1 p-4 custom-scrollbar smooth-scroll">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <img 
                      src="/Robot.gif" 
                      alt="AI Buddy Robot" 
                      className="h-16 w-16 mb-4 rounded-full object-cover"
                    />
                    <h3 className="text-lg font-semibold mb-2">Welcome to My AI Buddy!</h3>
                    <p className="text-sm">Ask me anything and I'll help you out.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                                                 <div
                           className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 hover:shadow-xl message-bubble hover-lift ${
                             message.sender === 'user'
                               ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                               : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700'
                           }`}
                         >
                           <div className="flex items-start space-x-3">
                             {message.sender === 'bot' && (
                               <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                                 <img 
                                   src="/Robot.gif" 
                                   alt="AI Buddy Robot" 
                                   className="h-6 w-6 rounded-full object-cover"
                                 />
                               </div>
                             )}
                             <div className="flex-1 space-y-3">
                               {message.sender === 'bot' ? (
                                 <div className="structured-section">
                                   {renderStructuredMessage(message)}
                                 </div>
                               ) : (
                                 <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                               )}
                               <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                 <span className="text-xs opacity-70">
                                   {formatTime(message.timestamp)}
                                 </span>
                                 {message.source && (
                                   <Badge variant="secondary" className="text-xs">
                                     {message.source}
                                   </Badge>
                                 )}
                               </div>
                             </div>
                             {message.sender === 'user' && (
                               <div className="p-2 bg-blue-200 rounded-full flex-shrink-0">
                                 <User className="h-5 w-5 text-blue-700" />
                               </div>
                             )}
                           </div>
                         </div>
                      </div>
                    ))}
                    
                                         {isLoading && (
                       <div className="flex justify-start">
                         <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl rounded-bl-md px-6 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                           <div className="flex items-center space-x-3">
                             <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                               <img 
                                 src="/Robot.gif" 
                                 alt="AI Buddy Robot" 
                                 className="h-6 w-6 rounded-full object-cover"
                               />
                             </div>
                             <div className="flex items-center space-x-2">
                               <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                               <span className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center">
                                 <img 
                                   src="/Robot.gif" 
                                   alt="Robot" 
                                   className="h-4 w-4 mr-1 rounded-full object-cover"
                                 />
                                 Typing...
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default MyAIBuddy; 