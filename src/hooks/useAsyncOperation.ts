import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export interface AsyncOperationOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export interface AsyncOperationReturn {
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
  error: string | null;
  isLoading: boolean;
  clearError: () => void;
  reset: () => void;
}

export const useAsyncOperation = (options: AsyncOperationOptions = {}): AsyncOperationReturn => {
  const { onSuccess, onError, showToast = true } = options;
  const [isExecuting, setIsExecuting] = useState(false);
  
  const errorHandler = useErrorHandler({
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess(null);
      }
    },
    showToast,
  });

  const execute = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    setIsExecuting(true);
    
    try {
      const result = await errorHandler.handleAsync(asyncFn);
      
      if (onSuccess && result !== undefined) {
        onSuccess(result);
      }
      
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, [errorHandler, onSuccess]);

  const reset = useCallback(() => {
    errorHandler.clearError();
    setIsExecuting(false);
  }, [errorHandler]);

  return {
    execute,
    error: errorHandler.error,
    isLoading: errorHandler.isLoading || isExecuting,
    clearError: errorHandler.clearError,
    reset,
  };
};
