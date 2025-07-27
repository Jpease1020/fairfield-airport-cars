import React, { useRef, useEffect } from 'react';
import { ChatMessage, ChatMessageProps } from './ChatMessage';

export interface ChatContainerProps {
  messages: ChatMessageProps['message'][];
  isLoading?: boolean;
  onVoicePlay?: (content: string) => void;
  isVoiceSupported?: boolean;
  loadingMessage?: string;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading = false,
  onVoicePlay,
  isVoiceSupported = true,
  loadingMessage = 'Thinking...',
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className={`chat-container ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--background-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius)',
      overflow: 'hidden'
    }}>
      <div className="chat-messages" style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)'
      }}>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onVoicePlay={onVoicePlay}
            isVoiceSupported={isVoiceSupported}
          />
        ))}
        
        {isLoading && (
          <div className="chat-message assistant-message">
            <div  style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)',
              maxWidth: '80%'
            }}>
              <div  style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)'
              }}>
                <span >🤖</span>
                <div  style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '2px'
                  }}>
                    <span  style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite ease-in-out',
                      animationDelay: '0ms'
                    }}></span>
                    <span  style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite ease-in-out',
                      animationDelay: '200ms'
                    }}></span>
                    <span  style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite ease-in-out',
                      animationDelay: '400ms'
                    }}></span>
                  </div>
                  <span  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    marginLeft: 'var(--spacing-xs)'
                  }}>
                    {loadingMessage}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}; 