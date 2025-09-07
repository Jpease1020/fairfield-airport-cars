import { useState, useCallback, useMemo } from 'react';

export type LoadingState = string;

export interface LoadingStatesConfig {
  initialStates?: LoadingState[];
  onStateChange?: (state: LoadingState, isLoading: boolean) => void;
}

export interface LoadingStatesReturn {
  isLoading: (state: LoadingState) => boolean;
  setLoading: (state: LoadingState, loading: boolean) => void;
  withLoading: <T>(state: LoadingState, asyncFn: () => Promise<T>) => Promise<T>;
  clearAllLoading: () => void;
  clearLoading: (state: LoadingState) => void;
  getLoadingStates: () => LoadingState[];
  hasAnyLoading: boolean;
}

export const useLoadingStates = (config: LoadingStatesConfig = {}): LoadingStatesReturn => {
  const { initialStates = [], onStateChange } = config;
  
  const [loadingStates, setLoadingStates] = useState<Set<LoadingState>>(
    new Set(initialStates)
  );

  const isLoading = useCallback((state: LoadingState): boolean => {
    return loadingStates.has(state);
  }, [loadingStates]);

  const setLoading = useCallback((state: LoadingState, loading: boolean) => {
    setLoadingStates(prev => {
      const newStates = new Set(prev);
      if (loading) {
        newStates.add(state);
      } else {
        newStates.delete(state);
      }
      
      if (onStateChange) {
        onStateChange(state, loading);
      }
      
      return newStates;
    });
  }, [onStateChange]);

  const withLoading = useCallback(async <T>(
    state: LoadingState, 
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(state, true);
    
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(state, false);
    }
  }, [setLoading]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates(new Set());
  }, []);

  const clearLoading = useCallback((state: LoadingState) => {
    setLoading(state, false);
  }, [setLoading]);

  const getLoadingStates = useCallback(() => {
    return Array.from(loadingStates);
  }, [loadingStates]);

  const hasAnyLoading = useMemo(() => {
    return loadingStates.size > 0;
  }, [loadingStates]);

  return {
    isLoading,
    setLoading,
    withLoading,
    clearAllLoading,
    clearLoading,
    getLoadingStates,
    hasAnyLoading
  };
};
