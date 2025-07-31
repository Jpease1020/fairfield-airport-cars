import React from 'react';
import { Button } from '@/ui';
import { Container, Span } from '@/ui';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatMessageProps {
  message: ChatMessageData;
  onVoicePlay?: (content: string) => void;
  isVoiceSupported?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onVoicePlay,
  isVoiceSupported = true
}) => {
  const handleVoicePlay = () => {
    if (onVoicePlay) {
      onVoicePlay(message.content);
    } else if (isVoiceSupported && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.content);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Container>
      <Container>
        <Container>
          <Span>
            {message.role === 'assistant' ? '🤖' : '👤'}
          </Span>
          <Container>
            {message.content}
          </Container>
          {isVoiceSupported && (
            <Button 
              onClick={handleVoicePlay}
              variant="ghost"
              size="sm"
            >
              🔊
            </Button>
          )}
        </Container>
        <Container>
          {message.timestamp.toLocaleTimeString()}
        </Container>
      </Container>
    </Container>
  );
}; 