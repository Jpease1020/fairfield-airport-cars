import React, { useRef, useEffect } from 'react';
import { ChatMessage, ChatMessageProps } from './ChatMessage';
import { Container, Span, Text } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

export interface ChatContainerProps {
  messages: ChatMessageProps['message'][];
  isLoading?: boolean;
  onVoicePlay?: (content: string) => void;
  isVoiceSupported?: boolean;
  loadingMessage?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading = false,
  onVoicePlay,
  isVoiceSupported = true,
  loadingMessage = 'Thinking...'
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <Container>
      <Stack direction="vertical" spacing="md">
        <Container>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onVoicePlay={onVoicePlay}
              isVoiceSupported={isVoiceSupported}
            />
          ))}
          
          {isLoading && (
            <Container>
              <Stack direction="horizontal" spacing="sm" align="center">
                <Span>🤖</Span>
                <Stack direction="horizontal" spacing="xs" align="center">
                  <Stack direction="horizontal" spacing="xs">
                    <Span />
                    <Span />
                    <Span />
                  </Stack>
                  <Span>
                    {loadingMessage}
                  </Span>
                </Stack>
              </Stack>
            </Container>
          )}
          
          <div ref={messagesEndRef} />
        </Container>
      </Stack>
    </Container>
  );
}; 