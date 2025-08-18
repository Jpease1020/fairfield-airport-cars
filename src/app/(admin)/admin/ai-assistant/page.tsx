'use client';

import { useState } from 'react';
import { Container, H2, Text, Button, Stack, Box } from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { useChat } from '@/hooks/useChat';
import { Mic, MicOff, Send } from 'lucide-react';

export default function AIAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
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
            <H2 data-cms-id="admin.aiAssistant.sections.quickQuestions.title" mode={mode}>
              {getCMSField(cmsData, 'admin.aiAssistant.sections.quickQuestions.title', 'Quick Questions')}
            </H2>
            <Stack direction="horizontal" spacing="sm">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(question)}
                  data-cms-id={`admin.aiAssistant.sections.quickQuestions.question${index + 1}`}
                  interactionMode={mode}
                >
                  {question}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Chat Interface */}
          <Box variant="elevated" padding="md">
            <H2 data-cms-id="admin.aiAssistant.sections.chat.title" mode={mode}>
              {getCMSField(cmsData, 'admin.aiAssistant.sections.chat.title', 'Chat with AI Assistant')}
            </H2>
            
            {/* Messages */}
            <Box variant="elevated" padding="sm">
              {messages.length === 0 ? (
                <Text variant="muted" size="sm" data-cms-id="admin.aiAssistant.sections.chat.welcome" mode={mode}>
                  {getCMSField(cmsData, 'admin.aiAssistant.sections.chat.welcome', 'Ask me anything about bookings, business information, or customer service!')}
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
                placeholder={getCMSField(cmsData, 'admin.aiAssistant.sections.chat.inputPlaceholder', 'Ask a question...')}
              />
              <Button
                onClick={handleVoiceInput}
                variant="outline"
                size="sm"
                disabled={isListening}
                data-cms-id="admin.aiAssistant.sections.chat.voiceButton"
                interactionMode={mode}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              <Button
                onClick={handleSendMessage}
                variant="primary"
                size="sm"
                disabled={!inputValue.trim() || isLoading}
                data-cms-id="admin.aiAssistant.sections.chat.sendButton"
                interactionMode={mode}
              >
                <Send size={16} />
              </Button>
            </Stack>
          </Box>

          {/* Capabilities */}
          <Box variant="elevated" padding="md">
            <H2 data-cms-id="admin.aiAssistant.sections.capabilities.title" mode={mode}>
              {getCMSField(cmsData, 'admin.aiAssistant.sections.capabilities.title', 'What I can help with')}
            </H2>
            <Stack direction="vertical" spacing="sm">
              <Text size="sm" data-cms-id="admin.aiAssistant.sections.capabilities.bookingInfo" mode={mode}>
                {getCMSField(cmsData, 'admin.aiAssistant.sections.capabilities.bookingInfo', '📋 Booking Information - Query booking details, status, and history')}
              </Text>
              <Text size="sm" data-cms-id="admin.aiAssistant.sections.capabilities.businessInfo" mode={mode}>
                {getCMSField(cmsData, 'admin.aiAssistant.sections.capabilities.businessInfo', '💼 Business Information - Access pricing, policies, and company details')}
              </Text>
              <Text size="sm" data-cms-id="admin.aiAssistant.sections.capabilities.customerService" mode={mode}>
                {getCMSField(cmsData, 'admin.aiAssistant.sections.capabilities.customerService', '🎧 Customer Service - Help with common questions and issues')}
              </Text>
              <Text size="sm" data-cms-id="admin.aiAssistant.sections.capabilities.troubleshooting" mode={mode}>
                {getCMSField(cmsData, 'admin.aiAssistant.sections.capabilities.troubleshooting', '🔧 Troubleshooting - Assist with technical problems')}
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    
  );
} 