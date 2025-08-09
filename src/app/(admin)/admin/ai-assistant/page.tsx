'use client';
 
import { useState } from 'react';
import { Container, H2, Text, Button, Stack, Box } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';
import { useChat } from '@/hooks/useChat';
import { Mic, MicOff, Send } from 'lucide-react';

export default function AIAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  const { cmsData } = useCMSData();
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser');
      return;
    }

    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const quickQuestions = [
    "Show me today's bookings",
    "What are our current rates?",
    "How many bookings this week?",
    "What's our cancellation policy?"
  ];

  return (
    
      <Container>
        <Stack direction="vertical" spacing="lg">
          {/* Quick Actions */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.aiAssistant.quickQuestions', 'Quick Questions')}
            </H2>
            <Stack direction="horizontal" spacing="sm">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Chat Interface */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.aiAssistant.chat', 'Chat with AI Assistant')}
            </H2>
            
            {/* Messages */}
            <Box variant="elevated" padding="sm">
              {messages.length === 0 ? (
                <Text variant="muted" size="sm">
                  {getCMSField(cmsData, 'admin.aiAssistant.welcome', 'Ask me anything about bookings, business information, or customer service!')}
                </Text>
              ) : (
                <Stack direction="vertical" spacing="sm">
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      variant={message.role === 'user' ? 'elevated' : 'default'}
                      padding="sm"
                    >
                      <Text size="sm">
                        {message.content}
                      </Text>
                      <Text variant="muted" size="xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Input */}
            <Stack direction="horizontal" spacing="sm">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question..."
              />
              <Button
                onClick={handleVoiceInput}
                variant="outline"
                size="sm"
                disabled={isListening}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              <Button
                onClick={handleSendMessage}
                variant="primary"
                size="sm"
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={16} />
              </Button>
            </Stack>
          </Box>

          {/* Capabilities */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.aiAssistant.capabilities', 'What I can help with')}
            </H2>
            <Stack direction="vertical" spacing="sm">
              <Text size="sm">
                {getCMSField(cmsData, 'admin.aiAssistant.bookingInfo', '📋 Booking Information - Query booking details, status, and history')}
              </Text>
              <Text size="sm">
                {getCMSField(cmsData, 'admin.aiAssistant.businessInfo', '💼 Business Information - Access pricing, policies, and company details')}
              </Text>
              <Text size="sm">
                {getCMSField(cmsData, 'admin.aiAssistant.customerService', '🎧 Customer Service - Help with common questions and issues')}
              </Text>
              <Text size="sm">
                {getCMSField(cmsData, 'admin.aiAssistant.troubleshooting', '🔧 Troubleshooting - Assist with technical problems')}
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    
  );
} 