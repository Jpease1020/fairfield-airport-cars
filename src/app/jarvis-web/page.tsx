'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, LogOut, Sparkles, Key, ExternalLink, Info } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AuthState {
  isAuthenticated: boolean;
  sessionId: string | null;
  email: string | null;
  isNewUser: boolean;
}

export default function JarvisWebPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    sessionId: null,
    email: null,
    isNewUser: false
  });
  const [showLogin, setShowLogin] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const sessionId = localStorage.getItem('jarvis_session_id');
    if (sessionId) {
      validateSession(sessionId);
    }
  }, []);

  const validateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/jarvis/auth/openai?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.hasValidSession) {
        setAuthState({
          isAuthenticated: true,
          sessionId,
          email: data.email,
          isNewUser: data.isNewUser
        });
      } else {
        localStorage.removeItem('jarvis_session_id');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('jarvis_session_id');
    }
  };

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your OpenAI API key');
      return;
    }

    console.log('Starting login process...');
    setIsLoading(true);
    try {
      const response = await fetch('/api/jarvis/auth/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          openaiToken: apiKey.trim()
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        console.log('Login successful, sessionId:', data.sessionId);
        localStorage.setItem('jarvis_session_id', data.sessionId);
        setAuthState({
          isAuthenticated: true,
          sessionId: data.sessionId,
          email: data.email,
          isNewUser: data.isNewUser
        });
        setShowLogin(false);
        setApiKey('');
        
        // Add welcome message
        if (data.isNewUser) {
          addMessage("Welcome to Jarvis! I'm your AI assistant. How can I help you today?", false);
        } else {
          addMessage("Welcome back! How can I help you today?", false);
        }
      } else {
        console.error('Login failed:', data.error);
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (authState.sessionId) {
      try {
        await fetch('/api/jarvis/auth/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'logout',
            sessionId: authState.sessionId
          })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('jarvis_session_id');
    setAuthState({
      isAuthenticated: false,
      sessionId: null,
      email: null,
      isNewUser: false
    });
    setMessages([]);
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !authState.sessionId) {
      console.log('Cannot send message:', { 
        hasMessage: !!inputMessage.trim(), 
        hasSessionId: !!authState.sessionId,
        sessionId: authState.sessionId 
      });
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage(userMessage, true);
    setIsLoading(true);

    console.log('Sending message with sessionId:', authState.sessionId);

    try {
      const response = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: authState.sessionId
        })
      });

      console.log('Chat response status:', response.status);
      const data = await response.json();
      console.log('Chat response data:', data);

      if (data.error) {
        console.error('Chat error:', data.error);
        if (data.error.includes('session')) {
          // Session expired, redirect to login
          console.log('Session expired, logging out...');
          handleLogout();
          setShowLogin(true);
          addMessage("Your session has expired. Please log in again.", false);
        } else {
          addMessage(`Error: ${data.error}`, false);
        }
      } else {
        addMessage(data.response || 'I understand your message. How can I help you further?', false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('Sorry, I encountered an error. Please try again.', false);
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

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to Jarvis
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Connect your OpenAI account to start chatting with your AI assistant
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowLogin(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Sign in with OpenAI
            </Button>
            
            {showLogin && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">
                      OpenAI API Key
                    </label>
                  </div>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Your API key is stored securely and only used to connect to OpenAI
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleLogin} 
                      disabled={isLoading || !apiKey.trim()}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Connect Account
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowLogin(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Don't have an API key?{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Get one here
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
            {/* Help Section */}
            <div className="mt-6">
              <button
                className="flex items-center text-sm text-blue-700 hover:underline focus:outline-none"
                onClick={() => setShowHelp((v) => !v)}
                aria-expanded={showHelp}
              >
                <Info className="w-4 h-4 mr-1" />
                How do I get my API key?
              </button>
              {showHelp && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left text-sm space-y-4">
                  <div>
                    <strong>OpenAI (ChatGPT, GPT-4, etc.)</strong>
                    <ol className="list-decimal ml-5 mt-1 space-y-1">
                      <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenAI API Keys page</a> and log in.</li>
                      <li>Click <b>"Create new secret key"</b>.</li>
                      <li>Copy the key that appears (it starts with <code>sk-...</code>).</li>
                      <li>Paste your key into the field above.</li>
                    </ol>
                  </div>
                  <div>
                    <strong>Google Gemini</strong>
                    <ol className="list-decimal ml-5 mt-1 space-y-1">
                      <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a> and log in.</li>
                      <li>Click <b>"Create API key"</b>.</li>
                      <li>Copy the key that appears.</li>
                      <li>Paste your key into the Gemini field.</li>
                    </ol>
                  </div>

                  <div className="pt-2 border-t border-blue-100">
                    <strong>Security Reminder:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Your API key is only used to connect to the AI provider.</li>
                      <li>It is never shared with anyone else.</li>
                      <li>You can delete or regenerate your key at any time in your provider’s dashboard.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Jarvis</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  {authState.email}
                </Badge>
                {authState.isNewUser && (
                  <Badge variant="outline" className="text-xs">
                    New User
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Chat Area - Left Side */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Ask me anything and I'll help you out!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Jarvis is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Right Side */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Chat with Jarvis</h3>
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("Hello, how can you help me?")}
                  className="text-xs"
                >
                  Say Hello
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("What can you do?")}
                  className="text-xs"
                >
                  What can you do?
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 