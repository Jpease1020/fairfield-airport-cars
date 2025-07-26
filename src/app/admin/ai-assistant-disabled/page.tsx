'use client';

import { useState, useMemo } from 'react';
import { 
  AdminPageWrapper,
  InfoCard,
  ActionButtonGroup,
  HelpCard,
  ChatContainer,
  ChatInput,
  ToastProvider,
  useToast,
  GridSection
} from '@/components/ui';
import { useChat } from '@/hooks/useChat';
import { useBrowserFeatures } from '@/hooks/useBrowserFeatures';

function AIAssistantContent() {
  const { addToast } = useToast();
  const { features } = useBrowserFeatures();
  const [input, setInput] = useState('');

  // Initialize chat with welcome message
  const initialMessages = useMemo(() => [{
    id: '1',
    role: 'assistant' as const,
    content: "Hi Gregg! I'm your AI assistant. I can help you with:\n\n• Managing bookings and customers\n• Updating your website content\n• Understanding your business data\n• Troubleshooting technical issues\n• Setting up payments and communications\n\nWhat would you like to know?",
    timestamp: new Date()
  }], []);

  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    apiEndpoint: '/api/ai-assistant',
    initialMessages,
    onError: (error) => addToast('error', `Connection error: ${error}`)
  });

  // Handle message sending and clear input
  const handleSendMessage = async (messageText: string) => {
    await sendMessage(messageText);
    setInput(''); // Clear input after sending
  };

  // Quick questions data
  const quickQuestions = useMemo(() => [
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
  ], []);

  // Convert questions to ActionButtonGroup format
  const quickQuestionButtons = useMemo(() => 
    quickQuestions.map(question => ({
      label: question,
      onClick: () => setInput(question),
      variant: 'outline' as const,
      size: 'sm' as const
    })), [quickQuestions]
  );

  // Help topics data
  const helpTopics = useMemo(() => [
    {
      icon: '📅',
      title: 'Booking Management',
      description: 'View, edit, and manage customer bookings and schedules'
    },
    {
      icon: '💬',
      title: 'Customer Communication',
      description: 'Send messages, confirmations, and updates to customers'
    },
    {
      icon: '💰',
      title: 'Payment & Pricing',
      description: 'Configure rates, process payments, and track earnings'
    },
    {
      icon: '🤖',
      title: 'Website Content',
      description: 'Update your site content, pages, and business information'
    },
    {
      icon: '⚙️',
      title: 'Technical Questions',
      description: 'Get help with app features, troubleshooting, and setup'
    }
  ], []);

  // Header actions
  const headerActions = useMemo(() => [
    {
      label: 'Clear Chat',
      onClick: (): void => {
        if (confirm('Clear all messages?')) {
          clearMessages();
          addToast('info', 'Chat cleared');
        }
      },
      variant: 'outline' as const
    },
    {
      label: 'Settings',
      onClick: (): void => {
        window.location.href = '/admin/ai-assistant-disabled/settings';
      },
      variant: 'primary' as const
    }
  ], [clearMessages, addToast]);

  // Voice play handler
  const handleVoicePlay = (content: string) => {
    if (features.voiceOutput && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
      addToast('info', 'Playing message...');
    } else {
      addToast('warning', 'Voice output not supported in your browser');
    }
  };

  return (
    <AdminPageWrapper
      title="AI Assistant"
      subtitle="Get help with your car service business"
      actions={headerActions}
      loading={false}
      error={null}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--spacing-lg)',
        height: '70vh',
        minHeight: '500px'
      }}>
        {/* Main Chat Interface */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            onVoicePlay={handleVoicePlay}
            isVoiceSupported={features.voiceOutput}
            loadingMessage="Thinking..."
          />
          
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask me anything about your business..."
            isVoiceSupported={features.voiceInput}
            maxRows={4}
          />
        </div>

        {/* Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          height: '100%',
          overflowY: 'auto'
        }}>
          {/* Quick Questions */}
          <InfoCard
            title="Quick Questions"
            icon="❓"
            subtitle="Click any question to ask it"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xs)',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <ActionButtonGroup 
                buttons={quickQuestionButtons}
                orientation="vertical"
                spacing="xs"
              />
            </div>
          </InfoCard>

          {/* What I Can Help With */}
          <InfoCard
            title="What I Can Help With"
            icon="⚙️"
            subtitle="Areas where I can assist you"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)'
            }}>
              {helpTopics.map((topic, index) => (
                <HelpCard
                  key={index}
                  icon={topic.icon}
                  title={topic.title}
                  description={topic.description}
                />
              ))}
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Browser Support Info */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="Browser Features"
          icon="🌐"
          subtitle="Your browser's AI assistant capabilities"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <div style={{ 
              padding: 'var(--spacing-sm)',
              backgroundColor: features.voiceInput ? '#dcfce7' : '#fee2e2',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}>
              🎤 Voice Input: {features.voiceInput ? '✅ Supported' : '❌ Not Available'}
            </div>
            <div style={{ 
              padding: 'var(--spacing-sm)',
              backgroundColor: features.voiceOutput ? '#dcfce7' : '#fee2e2',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}>
              🔊 Voice Output: {features.voiceOutput ? '✅ Supported' : '❌ Not Available'}
            </div>
          </div>
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
}

export default function AIAssistantPage() {
  return (
    <ToastProvider>
      <AIAssistantContent />
    </ToastProvider>
  );
} 