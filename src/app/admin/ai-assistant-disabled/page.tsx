'use client';

import { useState, useRef, useEffect } from 'react';

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
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">Get help with your car service business</p>
      </div>

      <div className="standard-content">
        <div className="ai-assistant-layout">
          {/* Chat Interface */}
          <div className="chat-section">
            <div className="chat-container">
              <div className="chat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-header">
                        <span className="message-icon">
                          {message.role === 'assistant' ? '🤖' : '👤'}
                        </span>
                        <div className="message-content">
                          {message.content}
                        </div>
                        <button className="message-voice-btn" title="Read aloud">
                          🔊
                        </button>
                      </div>
                      <div className="message-timestamp">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-message assistant-message">
                    <div className="message-bubble loading">
                      <div className="message-header">
                        <span className="message-icon">🤖</span>
                        <div className="typing-indicator">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-text">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-section">
                <div className="chat-input-container">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your business..."
                    disabled={isLoading}
                    className="chat-input"
                    rows={1}
                  />
                  <button
                    className="voice-input-btn"
                    disabled={isLoading}
                    title="Voice input"
                  >
                    🎤
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="send-btn"
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="ai-sidebar">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="card-icon">❓</span>
                  Quick Questions
                </h3>
              </div>
              <div className="card-body">
                <div className="quick-questions">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="quick-question-btn"
                      onClick={() => setInput(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="card-icon">⚙️</span>
                  What I Can Help With
                </h3>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => window.location.href = '/admin/ai-assistant/settings'}
                >
                  Settings
                </button>
              </div>
              <div className="card-body">
                <div className="help-topics">
                  <div className="help-topic">
                    <span className="help-topic-icon">📅</span>
                    <span>Booking management</span>
                  </div>
                  <div className="help-topic">
                    <span className="help-topic-icon">💬</span>
                    <span>Customer communication</span>
                  </div>
                  <div className="help-topic">
                    <span className="help-topic-icon">💰</span>
                    <span>Payment & pricing</span>
                  </div>
                  <div className="help-topic">
                    <span className="help-topic-icon">🤖</span>
                    <span>Website content</span>
                  </div>
                  <div className="help-topic">
                    <span className="help-topic-icon">⚙️</span>
                    <span>Technical questions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage; 