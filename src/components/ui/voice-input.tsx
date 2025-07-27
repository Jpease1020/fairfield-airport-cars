'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Container, Span } from '@/components/ui';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput = ({ onTranscript, disabled = false }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
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
        setError(`Voice recognition error: ${event.error}`);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };
    } else {
      setError('Voice recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !disabled) {
      try {
        recognitionRef.current.start();
      } catch {
        console.error('Failed to start speech recognition');
        setError('Failed to start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const isSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
      >
        <MicOff />
      </Button>
    );
  }

  return (
    <Container>
      <Button
        variant="outline"
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isListening ? (
          <Mic className="h-4 w-4 text-red-500" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      {error && (
        <Span>{error}</Span>
      )}
    </Container>
  );
}; 