'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage, ChatMessageData } from './ChatMessage';
import { Container } from '@/design/layout/containers/Container';
import { Span } from '@/design/components/base-components/text/Span';
import { Text } from '@/design/components/base-components/text/Text';
import { Stack } from '@/design/layout/framing/Stack';

export interface ChatContainerProps {
  messages: ChatMessageData[];
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
    <Container variant="default" padding="md">
      <Stack direction="vertical" spacing="md">
        <Container variant="content">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onVoicePlay={onVoicePlay}
              isVoiceSupported={isVoiceSupported}
            />
          ))}
          
          {isLoading && (
            <Container variant="default" padding="sm">
              <Stack direction="horizontal" spacing="sm" align="center">
                <Span>🤖</Span>
                <Stack direction="horizontal" spacing="xs" align="center">
                  <Stack direction="horizontal" spacing="xs">
                    <Span>•</Span>
                    <Span>•</Span>
                    <Span>•</Span>
                  </Stack>
                  <Text size="sm">
                    {loadingMessage}
                  </Text>
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