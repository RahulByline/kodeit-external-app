import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Download, 
  Play, 
  Code,
  MessageSquare,
  FileText,
  Lightbulb,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Settings,
  BookOpen,
  Terminal,
  Eye,
  EyeOff,
  RotateCcw,
  Share2,
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Plus,
  HelpCircle,
  Brain,
  Rocket,
  Target
} from 'lucide-react';
import G8PlusLayout from '../../components/G8PlusLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
  explanation?: string;
  suggestions?: string[];
}

interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const mockCodeExamples: CodeExample[] = [
  {
    id: '1',
    title: 'Python Hello World',
    description: 'Basic Python program to print Hello World',
    language: 'python',
    code: `print("Hello, World!")`,
    difficulty: 'beginner',
    tags: ['Python', 'Basics', 'Print']
  },
  {
    id: '2',
    title: 'React Component',
    description: 'Simple React functional component',
    language: 'jsx',
    code: `import React from 'react';

function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

export default Welcome;`,
    difficulty: 'beginner',
    tags: ['React', 'Component', 'JSX']
  },
  {
    id: '3',
    title: 'JavaScript Array Methods',
    description: 'Common array manipulation methods',
    language: 'javascript',
    code: `const numbers = [1, 2, 3, 4, 5];

// Map
const doubled = numbers.map(num => num * 2);

// Filter
const evenNumbers = numbers.filter(num => num % 2 === 0);

// Reduce
const sum = numbers.reduce((acc, num) => acc + num, 0);

console.log(doubled); // [2, 4, 6, 8, 10]
console.log(evenNumbers); // [2, 4]
console.log(sum); // 15`,
    difficulty: 'intermediate',
    tags: ['JavaScript', 'Arrays', 'Methods']
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'How do I create a function in Python?',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    type: 'ai',
    content: 'Here\'s how to create a function in Python:',
    timestamp: new Date(Date.now() - 240000),
    code: `def greet(name):
    """This function greets the person passed in as a parameter"""
    print(f"Hello, {name}!")

# Call the function
greet("Alice")`,
    language: 'python',
    explanation: 'This creates a simple function called `greet` that takes a parameter `name` and prints a greeting. The docstring explains what the function does.',
    suggestions: ['Try adding more parameters', 'Add return values', 'Use type hints']
  },
  {
    id: '3',
    type: 'user',
    content: 'Can you explain what a loop is?',
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: '4',
    type: 'ai',
    content: 'A loop is a programming construct that repeats a block of code multiple times. Here are the main types:',
    timestamp: new Date(Date.now() - 60000),
    code: `# For loop - iterates over a sequence
for i in range(5):
    print(i)  # Prints 0, 1, 2, 3, 4

# While loop - repeats while condition is true
count = 0
while count < 3:
    print(count)
    count += 1`,
    language: 'python',
    explanation: 'For loops are used when you know how many times to repeat, while loops continue until a condition becomes false.',
    suggestions: ['Try nested loops', 'Use break and continue', 'Practice with different data types']
  }
];

const AiBuddy: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showExamples, setShowExamples] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Here\'s a helpful response to your question:',
        timestamp: new Date(),
        code: `# Example code
def example_function():
    return "Hello from AI Buddy!"`,
        language: 'python',
        explanation: 'This is an example of how the AI can provide code explanations.',
        suggestions: ['Try modifying the function', 'Add parameters', 'Test different scenarios']
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredExamples = selectedLanguage === 'all' 
    ? mockCodeExamples 
    : mockCodeExamples.filter(example => example.language === selectedLanguage);

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'python': return 'bg-blue-100 text-blue-800';
      case 'javascript': return 'bg-yellow-100 text-yellow-800';
      case 'jsx': return 'bg-cyan-100 text-cyan-800';
      case 'html': return 'bg-orange-100 text-orange-800';
      case 'css': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'debug':
        // Demo: Set up debug question
        setInputMessage('Can you help me debug this code?');
        break;
      case 'explain':
        // Demo: Set up explanation question
        setInputMessage('Can you explain how functions work in JavaScript?');
        break;
      case 'generate':
        // Demo: Set up code generation question
        setInputMessage('Generate a simple calculator function in Python');
        break;
      case 'learn':
        // Demo: Set up learning path question
        setInputMessage('What should I learn next in web development?');
        break;
      default:
        break;
    }
  };

  return (
    <G8PlusLayout userName={currentUser?.fullname || "Student"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KODEIT AI Buddy</h1>
              <p className="text-gray-600 mt-1">Get instant coding help and guidance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center space-x-2"
            >
              {darkMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{darkMode ? 'Light' : 'Dark'} Mode</span>
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Quick access to common AI assistance features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('debug')}
              >
                <Code className="w-6 h-6 mb-2" />
                <span className="text-sm">Debug Code</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('explain')}
              >
                <BookOpen className="w-6 h-6 mb-2" />
                <span className="text-sm">Explain Concept</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('generate')}
              >
                <Terminal className="w-6 h-6 mb-2" />
                <span className="text-sm">Generate Code</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleQuickAction('learn')}
              >
                <Brain className="w-6 h-6 mb-2" />
                <span className="text-sm">Learning Path</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <CardContent className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">AI Assistant</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <Button variant="ghost" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </CardContent>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-blue-500' 
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.code && (
                            <div className="mt-3">
                              <div className="rounded-lg p-3 bg-gray-50 border">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={getLanguageColor(message.language || '')}>
                                    {message.language}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(message.code || '')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                                <pre className="text-sm overflow-x-auto text-gray-800">
                                  <code>{message.code}</code>
                                </pre>
                              </div>
                            </div>
                          )}

                          {message.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{message.explanation}</p>
                            </div>
                          )}

                          {message.suggestions && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                              <ul className="space-y-1">
                                {message.suggestions.map((suggestion, index) => (
                                  <li key={index} className="text-xs text-gray-600 flex items-center">
                                    <Lightbulb className="w-3 h-3 mr-1 text-yellow-500" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.type === 'ai' && (
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is typing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <CardContent className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about coding..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Code className="w-4 h-4 mr-2" />
                    Debug Code
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explain Concept
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Terminal className="w-4 h-4 mr-2" />
                    Generate Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-purple-500" />
                    Code Examples
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExamples(!showExamples)}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              {showExamples && (
                <CardContent>
                  <div className="space-y-3">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full p-2 rounded-lg text-sm border bg-gray-50 border-gray-300 text-gray-700"
                    >
                      <option value="all">All Languages</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="jsx">JSX</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                    </select>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredExamples.map(example => (
                        <div
                          key={example.id}
                          className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            setInputMessage(`Show me an example of ${example.title.toLowerCase()}`);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium">{example.title}</h4>
                            <Badge className={getDifficultyColor(example.difficulty)}>
                              {example.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{example.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {example.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Questions Asked</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Code Examples</span>
                    <span className="text-sm font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Learning Streak</span>
                    <span className="text-sm font-medium">7 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </G8PlusLayout>
  );
};

export default AiBuddy;

