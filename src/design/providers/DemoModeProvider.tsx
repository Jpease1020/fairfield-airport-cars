'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { demoModeService } from '../../lib/services/demo-mode-service';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: (enabled: boolean) => Promise<void>;
  forceReset: () => Promise<void>;
  nuclearReset: () => Promise<void>;
  isInitialized: boolean;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export { DemoModeContext };

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

interface DemoModeProviderProps {
  children: React.ReactNode;
}

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeDemoMode = async () => {
      try {
        // Get the current demo mode state
        const currentState = demoModeService.isDemoModeEnabled();
        setIsDemoMode(currentState);
        setIsInitialized(true);
      } catch (_error) {
        setIsInitialized(true);
      }
    };

    initializeDemoMode();
  }, []);

  useEffect(() => {
    // Subscribe to demo mode changes
    const handleDemoModeChange = (event: Event) => {
      const customEvent = event as { detail?: { enabled: boolean } };
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        setIsDemoMode(customEvent.detail.enabled);
      }
    };

    // Listen for custom demo mode change events
    window.addEventListener('demoModeChanged', handleDemoModeChange);
    
    return () => {
      window.removeEventListener('demoModeChanged', handleDemoModeChange);
    };
  }, []);

  const toggleDemoMode = async (enabled: boolean) => {
    try {
      await demoModeService.toggleDemoMode(enabled);
      // The state will be updated via the event listener
    } catch (_error) {
      // Silent error handling for production
    }
  };

  const forceReset = async () => {
    try {
      await demoModeService.forceReset();
      // The state will be updated via the event listener
    } catch (_error) {
      // Silent error handling for production
    }
  };

  const nuclearReset = async () => {
    try {
      await demoModeService.nuclearReset();
      // Force a page reload after nuclear reset
      window.location.reload();
    } catch (_error) {
      // Silent error handling for production
    }
  };

  const value: DemoModeContextType = {
    isDemoMode,
    toggleDemoMode,
    forceReset,
    nuclearReset,
    isInitialized,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};
