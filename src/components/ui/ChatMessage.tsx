import React from 'react';
import { Button } from './button';
import { Container } from '@/components/ui';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatMessageProps {
  message: ChatMessage;
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
          <span>
            {message.role === 'assistant' ? '🤖' : '👤'}
          </span>
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