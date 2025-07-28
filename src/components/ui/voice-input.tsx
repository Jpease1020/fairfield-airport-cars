'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';

// Styled voice input container with enhanced layout
const VoiceInputContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop)
})<{
  variant: 'default' | 'compact' | 'inline';
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  ${({ variant }) => {
    switch (variant) {
      case 'compact':
        return `gap: ${spacing.xs};`;
      case 'inline':
        return `display: inline-flex;`;
      default:
        return '';
    }
  }}
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `gap: ${spacing.xs};`;
      case 'lg':
        return `gap: ${spacing.md};`;
      default:
        return '';
    }
  }}
`;

// Styled error message with enhanced styling
const ErrorMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{ size: 'sm' | 'md' | 'lg' }>`
  color: ${colors.danger[600]};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.xs;
      case 'md': return fontSize.sm;
      case 'lg': return fontSize.md;
      default: return fontSize.sm;
    }
  }};
  margin-left: ${spacing.sm};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  max-width: 250px;
  word-wrap: break-word;
`;

// Styled icon wrapper with enhanced styling
const IconWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isListening', 'isProcessing', 'hasError', 'size'].includes(prop)
})<{ 
  isListening: boolean; 
  isProcessing: boolean;
  hasError: boolean;
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ isListening, isProcessing, hasError }) => {
    if (hasError) return colors.danger[600];
    if (isProcessing) return colors.text.secondary;
    if (isListening) return colors.danger[600];
    return colors.text.primary;
  }};
  transition: ${transitions.default};
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
`;

// Styled loading spinner with enhanced animation
const LoadingSpinner = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{ size: 'sm' | 'md' | 'lg' }>`
  animation: spin 1s linear infinite;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Styled status indicator
const StatusIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isListening', 'isProcessing', 'hasError', 'size'].includes(prop)
})<{ 
  isListening: boolean; 
  isProcessing: boolean;
  hasError: boolean;
  size: 'sm' | 'md' | 'lg';
}>`
  width: ${({ size }) => size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px'};
  height: ${({ size }) => size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px'};
  border-radius: 50%;
  background-color: ${({ isListening, isProcessing, hasError }) => {
    if (hasError) return colors.danger[600];
    if (isProcessing) return colors.warning[600];
    if (isListening) return colors.danger[600];
    return colors.success[600];
  }};
  margin-left: ${spacing.xs};
  animation: ${({ isListening, isProcessing, hasError }) => {
    if (hasError) return 'shake 0.5s ease-in-out';
    if (isListening) return 'pulse 1s ease-in-out infinite';
    if (isProcessing) return 'pulse 0.5s ease-in-out infinite';
    return 'none';
  }};
  
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }
`;

// Styled content wrapper
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  flex: 1;
  min-width: 0;
`;

export interface VoiceInputProps {
  // Core props
  children?: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'compact' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  
  // Behavior
  onTranscript: (text: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  
  // States
  disabled?: boolean;
  
  // Events
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // Rest props
  [key: string]: any;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  // Core props
  children,
  
  // Appearance
  variant = 'default',
  size = 'md',
  
  // Behavior
  onTranscript, 
  language = 'en-US',
  continuous = false,
  interimResults = false,
  
  // States
  disabled = false,
  
  // Events
  onStart,
  onEnd,
  onError,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  
  // Rest props
  ...rest
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const checkSupport = useCallback(() => {
    const supported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;
    if (!supported) {
      const errorMsg = 'Voice recognition not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
    }
    return supported;
  }, [onError]);

  const initializeRecognition = useCallback(() => {
    if (!checkSupport()) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
      onStart?.();
    };

    recognitionRef.current.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      onTranscript(transcript);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognitionRef.current.onerror = (event: { error: string }) => {
      console.error('Speech recognition error:', event.error);
      const errorMsg = `Voice recognition error: ${event.error}`;
      setError(errorMsg);
      onError?.(errorMsg);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      onEnd?.();
    };
  }, [checkSupport, continuous, interimResults, language, onTranscript, onStart, onEnd, onError]);

  useEffect(() => {
    initializeRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initializeRecognition]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && !disabled && !error) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition', err);
        const errorMsg = 'Failed to start voice recognition';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    }
  }, [isListening, disabled, error, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const handleToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  const isSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;
  const hasError = Boolean(error);
  const isDisabled = disabled || hasError || !isSupported;
  const isActive = isListening || isProcessing;

  if (!isSupported) {
    return (
      <VoiceInputContainer variant={variant} size={size} {...rest}>
        <Button
          variant="outline"
          size={size}
          disabled
          aria-label="Voice recognition not supported"
        >
          <IconWrapper isListening={false} isProcessing={false} hasError={true} size={size}>
            <MicOff size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          </IconWrapper>
        </Button>
        <StatusIndicator isListening={false} isProcessing={false} hasError={true} size={size} />
        <ContentWrapper>
          {children}
          <ErrorMessage size={size}>
            <AlertCircle size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
            Not supported
          </ErrorMessage>
        </ContentWrapper>
      </VoiceInputContainer>
    );
  }

  return (
    <VoiceInputContainer variant={variant} size={size} {...rest}>
      <Button
        variant={isActive ? "danger" : hasError ? "outline" : "outline"}
        size={size}
        onClick={handleToggle}
        disabled={isDisabled}
        aria-label={ariaLabel || (isListening ? 'Stop listening' : 'Start listening')}
        aria-describedby={ariaDescribedBy}
        aria-live="polite"
        aria-atomic="true"
      >
        <IconWrapper isListening={isListening} isProcessing={isProcessing} hasError={hasError} size={size}>
          {isProcessing ? (
            <LoadingSpinner size={size}>
              <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            </LoadingSpinner>
          ) : isListening ? (
            <Mic size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          ) : (
            <Mic size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          )}
        </IconWrapper>
      </Button>
      <StatusIndicator isListening={isListening} isProcessing={isProcessing} hasError={hasError} size={size} />
      <ContentWrapper>
        {children}
        {hasError && (
          <ErrorMessage size={size} role="alert">
            <AlertCircle size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
            {error}
          </ErrorMessage>
        )}
      </ContentWrapper>
    </VoiceInputContainer>
  );
};

VoiceInput.displayName = 'VoiceInput'; 