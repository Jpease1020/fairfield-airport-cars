'use client';

import { useState, useRef, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  MessageSquare,
  HelpCircle,
  Settings,
  Calendar,
  DollarSign
} from 'lucide-react';
import { VoiceInput } from '@/components/ui/voice-input';
import { VoiceOutput } from '@/components/ui/voice-output';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi Gregg! I'm your AI assistant. I can help you with:\n\n• Managing bookings and customers\n• Updating your website content\n• Understanding your business data\n• Troubleshooting technical issues\n• Setting up payments and communications\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again or contact your developer for assistance.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(input);
  };

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
    sendMessage(transcript);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I update my business information?",
    "What bookings do I have today?",
    "How do I send a message to a customer?",
    "How do I change my pricing?",
    "What if a customer wants to cancel?",
    "How do payments work?",
    "How is this app built?",
    "Is my customer data secure?",
    "How does the database work?",
    "What if something isn't working?"
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="AI Assistant" 
        subtitle="Get help with your car service business"
      />
      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="whitespace-pre-wrap flex-1">{message.content}</div>
                          {message.role === 'assistant' && (
                            <VoiceOutput 
                              text={message.content} 
                              disabled={isLoading}
                              className="flex-shrink-0"
                            />
                          )}
                          {message.role === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your business..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <VoiceInput
                      onTranscript={handleVoiceInput}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Help */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Quick Questions
                </h3>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    What I Can Help With
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/admin/ai-assistant/settings'}
                  >
                    Settings
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Booking management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Customer communication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Payment & pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>Website content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Technical questions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default AIAssistantPage; 