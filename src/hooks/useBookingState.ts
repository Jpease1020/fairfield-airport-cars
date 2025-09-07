import { useState, useCallback, useMemo } from 'react';

export type BookingPhase = 'trip-details' | 'contact-info' | 'payment' | 'payment-processing';

export interface BookingPhaseConfig {
  name: BookingPhase;
  requiredFields: string[];
  canSkip?: boolean;
}

export interface BookingStateConfig {
  phases: BookingPhaseConfig[];
  initialPhase?: BookingPhase;
  onPhaseChange?: (phase: BookingPhase) => void;
}

export interface BookingStateReturn {
  currentPhase: BookingPhase;
  currentPhaseIndex: number;
  canProceed: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  goToNextPhase: () => void;
  goToPreviousPhase: () => void;
  goToPhase: (phase: BookingPhase) => void;
  validateCurrentPhase: (data: Record<string, any>) => boolean;
  getPhaseProgress: () => number;
  isLastPhase: boolean;
  isFirstPhase: boolean;
}

export const useBookingState = (config: BookingStateConfig): BookingStateReturn => {
  const { phases, initialPhase = 'trip-details', onPhaseChange } = config;
  
  const [currentPhase, setCurrentPhase] = useState<BookingPhase>(initialPhase);

  const currentPhaseIndex = useMemo(() => {
    return phases.findIndex(phase => phase.name === currentPhase);
  }, [phases, currentPhase]);

  const currentPhaseConfig = useMemo(() => {
    return phases[currentPhaseIndex];
  }, [phases, currentPhaseIndex]);

  const canGoBack = useMemo(() => {
    return currentPhaseIndex > 0;
  }, [currentPhaseIndex]);

  const canGoForward = useMemo(() => {
    return currentPhaseIndex < phases.length - 1;
  }, [currentPhaseIndex, phases.length]);

  const isLastPhase = useMemo(() => {
    return currentPhaseIndex === phases.length - 1;
  }, [currentPhaseIndex, phases.length]);

  const isFirstPhase = useMemo(() => {
    return currentPhaseIndex === 0;
  }, [currentPhaseIndex]);

  const getPhaseProgress = useCallback(() => {
    return ((currentPhaseIndex + 1) / phases.length) * 100;
  }, [currentPhaseIndex, phases.length]);

  const validateCurrentPhase = useCallback((data: Record<string, any>): boolean => {
    if (!currentPhaseConfig) return false;

    const { requiredFields } = currentPhaseConfig;
    
    return requiredFields.every(field => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '' && 
             (typeof value !== 'string' || value.trim() !== '');
    });
  }, [currentPhaseConfig]);

  const canProceed = useMemo(() => {
    // This will be set by the component using the hook
    return false;
  }, []);

  const goToPhase = useCallback((phase: BookingPhase) => {
    const phaseIndex = phases.findIndex(p => p.name === phase);
    if (phaseIndex !== -1) {
      setCurrentPhase(phase);
      if (onPhaseChange) {
        onPhaseChange(phase);
      }
    }
  }, [phases, onPhaseChange]);

  const goToNextPhase = useCallback(() => {
    if (canGoForward) {
      const nextPhase = phases[currentPhaseIndex + 1];
      goToPhase(nextPhase.name);
    }
  }, [canGoForward, phases, currentPhaseIndex, goToPhase]);

  const goToPreviousPhase = useCallback(() => {
    if (canGoBack) {
      const prevPhase = phases[currentPhaseIndex - 1];
      goToPhase(prevPhase.name);
    }
  }, [canGoBack, phases, currentPhaseIndex, goToPhase]);

  return {
    currentPhase,
    currentPhaseIndex,
    canProceed,
    canGoBack,
    canGoForward,
    goToNextPhase,
    goToPreviousPhase,
    goToPhase,
    validateCurrentPhase,
    getPhaseProgress,
    isLastPhase,
    isFirstPhase
  };
};
