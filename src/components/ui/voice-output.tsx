'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceOutputProps {
  text: string;
  disabled?: boolean;
  autoPlay?: boolean;
}

export const VoiceOutput = ({ text, disabled = false, autoPlay = false }: VoiceOutputProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const checkSupport = () => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setIsSupported(supported);
    return supported;
  };

  const speak = useCallback((textToSpeak: string) => {
    if (!checkSupport() || !textToSpeak.trim()) return;

    // Stop any current speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && text && isSupported && !isSpeaking) {
      speak(text);
    }
  }, [text, autoPlay, isSupported, isSpeaking, speak]);

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
      >
        <VolumeX />
      </Button>
    );
  }

  return (
    <Button
      variant={isSpeaking ? "destructive" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={disabled || !text.trim()}
    >
      {isSpeaking ? <Volume2 /> : <Volume2 />}
    </Button>
  );
}; 