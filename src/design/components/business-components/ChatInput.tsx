'use client';

import React, { useRef, useState } from 'react';
import { Button } from '../base-components/Button';
import { Container } from '../../layout/containers/Container';
import { Textarea } from '../base-components/forms/Textarea'; 

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
    if (value.trim() && !disabled) {
      onSend(value.trim());
      onChange('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startVoiceInput = () => {
    if (!isVoiceSupported || disabled) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          onChange(value + finalTranscript);
          onVoiceInput?.(finalTranscript);
        }
      };

      recognitionRef.current.onerror = () => {        
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    }
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
    <Container>
      <Container>
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />
        
        {isVoiceSupported && (
          <Button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={disabled}
            variant={isListening ? 'primary' : 'outline'}
            size="sm"
          >
            {isListening ? '🛑' : '🎤'}
          </Button>
        )}
        
        <Button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          variant="primary"
          size="sm"
        >
          📤
        </Button>
      </Container>
    </Container>
  );
}; 