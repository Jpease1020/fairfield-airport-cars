import { useState, useCallback } from 'react';

export interface ErrorHandlerOptions {
  onError?: (error: string) => void;
  onSuccess?: () => void;
  showToast?: boolean;
}

export interface ErrorHandlerReturn {
  error: string | null;
  isLoading: boolean;
  handleAsync: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
  clearError: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}): ErrorHandlerReturn => {
  const { onError, onSuccess, showToast = true } = options;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsync = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await asyncFn();
      
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      // Re-throw for caller handling if needed
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onError, onSuccess]);

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    setError,
    setIsLoading,
  };
};
