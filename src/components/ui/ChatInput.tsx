import React, { useState, useRef } from 'react';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onVoiceInput?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isVoiceSupported?: boolean;
  maxRows?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onVoiceInput,
  disabled = false,
  placeholder = "Ask me anything...",
  isVoiceSupported = true,
  maxRows = 4
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startVoiceInput = () => {
    if (!isVoiceSupported || !('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (onVoiceInput) {
        onVoiceInput(text);
      } else {
        onChange(value + (value ? ' ' : '') + text);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, maxRows * 24);
      textarea.style.height = `${newHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <div className="chat-input-section">
      <div className="" style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--background-primary)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="chat-input"
          style={{
            flex: 1,
            minHeight: '40px',
            maxHeight: `${maxRows * 24}px`,
            resize: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            padding: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: '1.5',
            outline: 'none'
          }}
        />
        
        {isVoiceSupported && (
          <button
            className="voice-input-btn"
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={disabled}
            title={isListening ? 'Stop listening' : 'Voice input'}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: isListening ? 'var(--primary-color)' : 'var(--background-secondary)',
              color: isListening ? 'white' : 'var(--text-primary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-sm)',
              minWidth: '40px',
              height: '40px'
            }}
          >
            {isListening ? '🛑' : '🎤'}
          </button>
        )}
        
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="send-btn"
          title="Send message"
          style={{
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--primary-color)',
            borderRadius: 'var(--border-radius)',
            backgroundColor: !value.trim() || disabled ? 'var(--background-secondary)' : 'var(--primary-color)',
            color: !value.trim() || disabled ? 'var(--text-secondary)' : 'white',
            cursor: !value.trim() || disabled ? 'not-allowed' : 'pointer',
            fontSize: 'var(--font-size-sm)',
            minWidth: '40px',
            height: '40px'
          }}
        >
          📤
        </button>
      </div>
    </div>
  );
}; 