import React from 'react';

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
    <div className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
      <div className="message-bubble">
        <div className="message-header">
          <span className="message-icon">
            {message.role === 'assistant' ? '🤖' : '👤'}
          </span>
          <div className="message-content">
            {message.content}
          </div>
          {isVoiceSupported && (
            <button 
              className="message-voice-btn" 
              onClick={handleVoicePlay}
              title="Read aloud"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                padding: 'var(--spacing-xs)',
                opacity: 0.7
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              🔊
            </button>
          )}
        </div>
        <div className="message-timestamp">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}; 