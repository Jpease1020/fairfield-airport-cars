'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '../../system/tokens/tokens';
import { Button } from '../base-components/Button';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';

// Styled voice output container with enhanced layout
const VoiceOutputContainer = styled.div.withConfig({
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

// Styled icon wrapper with enhanced styling
const IconWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSpeaking', 'hasError', 'size'].includes(prop)
})<{ 
  isSpeaking: boolean; 
  hasError: boolean;
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ isSpeaking, hasError }) => {
    if (hasError) return colors.danger[600];
    if (isSpeaking) return colors.danger[600];
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

// Styled status indicator with enhanced animations
const StatusIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSpeaking', 'hasError', 'size'].includes(prop)
})<{ 
  isSpeaking: boolean; 
  hasError: boolean;
  size: 'sm' | 'md' | 'lg';
}>`
  width: ${({ size }) => size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px'};
  height: ${({ size }) => size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px'};
  border-radius: 50%;
  background-color: ${({ isSpeaking, hasError }) => {
    if (hasError) return colors.danger[600];
    if (isSpeaking) return colors.danger[600];
    return colors.success[600];
  }};
  margin-left: ${spacing.xs};
  animation: ${({ isSpeaking, hasError }) => {
    if (hasError) return 'shake 0.5s ease-in-out';
    if (isSpeaking) return 'pulse 1s ease-in-out infinite';
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
  max-width: 200px;
  word-wrap: break-word;
`;

// Styled content wrapper
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  flex: 1;
  min-width: 0;
`;

// Styled text preview
const TextPreview = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'truncated'].includes(prop)
})<{ 
  size: 'sm' | 'md' | 'lg';
  truncated: boolean;
}>`
  color: ${colors.text.secondary};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.xs;
      case 'md': return fontSize.sm;
      case 'lg': return fontSize.md;
      default: return fontSize.sm;
    }
  }};
  line-height: 1.4;
  
  ${({ truncated }) => truncated && `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  `}
`;

export interface VoiceOutputProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  text: string;
  
  // Appearance
  variant?: 'default' | 'compact' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  
  // Behavior
  autoPlay?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  
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

export const VoiceOutput: React.FC<VoiceOutputProps> = ({ 
  // Core props
  children,
  
  // Content
  text, 
  
  // Appearance
  variant = 'default',
  size = 'md',
  
  // Behavior
  autoPlay = false,
  rate = 0.9,
  pitch = 1,
  volume = 0.8,
  
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const checkSupport = useCallback(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setIsSupported(supported);
    if (!supported) {
      const errorMsg = 'Speech synthesis not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
    }
    return supported;
  }, [onError]);

  const speak = useCallback((textToSpeak: string) => {
    if (!checkSupport() || !textToSpeak.trim()) return;

    // Stop any current speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      const errorMsg = `Speech synthesis error: ${event.error}`;
      setError(errorMsg);
      onError?.(errorMsg);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [checkSupport, rate, pitch, volume, onStart, onEnd, onError]);

  const stop = useCallback(() => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [isSpeaking, stop, speak, text]);

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && text && isSupported && !isSpeaking && !error) {
      speak(text);
    }
  }, [text, autoPlay, isSupported, isSpeaking, error, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const hasError = Boolean(error);
  const isDisabled = disabled || !text.trim() || hasError;
  const truncatedText = text.length > 50 ? text.substring(0, 50) + '...' : text;

  if (!isSupported) {
    return (
      <VoiceOutputContainer variant={variant} size={size} {...rest}>
        <Button
          variant="outline"
          size={size}
          disabled
          aria-label="Speech synthesis not supported"
        >
          <IconWrapper isSpeaking={false} hasError={true} size={size}>
            <VolumeX size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          </IconWrapper>
        </Button>
        <StatusIndicator isSpeaking={false} hasError={true} size={size} />
        <ContentWrapper>
          {children}
          <ErrorMessage size={size}>
            <AlertCircle size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
            Not supported
          </ErrorMessage>
        </ContentWrapper>
      </VoiceOutputContainer>
    );
  }

  return (
    <VoiceOutputContainer variant={variant} size={size} {...rest}>
      <Button
        variant={isSpeaking ? "danger" : hasError ? "outline" : "outline"}
        size={size}
        onClick={handleToggle}
        disabled={isDisabled}
        aria-label={ariaLabel || (isSpeaking ? 'Stop speaking' : 'Start speaking')}
        aria-describedby={ariaDescribedBy}
        aria-live="polite"
        aria-atomic="true"
      >
        <IconWrapper isSpeaking={isSpeaking} hasError={hasError} size={size}>
          <Volume2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        </IconWrapper>
      </Button>
      <StatusIndicator isSpeaking={isSpeaking} hasError={hasError} size={size} />
      <ContentWrapper>
        {children}
        {variant !== 'compact' && (
          <TextPreview size={size} truncated={text.length > 50}>
            {truncatedText}
          </TextPreview>
        )}
        {hasError && (
          <ErrorMessage size={size} role="alert">
            <AlertCircle size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
            {error}
          </ErrorMessage>
        )}
      </ContentWrapper>
    </VoiceOutputContainer>
  );
};

VoiceOutput.displayName = 'VoiceOutput'; 