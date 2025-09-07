import { useState, useCallback, useEffect } from 'react';

export interface LocalStorageOptions<T> {
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  syncAcrossTabs?: boolean;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoaded: boolean;
  error: string | null;
}

export const useLocalStorage = <T>(
  key: string,
  options: LocalStorageOptions<T>
): UseLocalStorageReturn<T> => {
  const {
    defaultValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true
  } = options;

  const [value, setValueState] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load value from localStorage on mount
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        const parsedValue = deserialize(storedValue);
        setValueState(parsedValue);
      }
      setIsLoaded(true);
    } catch (err) {
      console.error(`Error loading localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to load from localStorage');
      setIsLoaded(true);
    }
  }, [key, deserialize]);

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsedValue = deserialize(e.newValue);
          setValueState(parsedValue);
        } catch (err) {
          console.error(`Error syncing localStorage key "${key}":`, err);
          setError(err instanceof Error ? err.message : 'Failed to sync from localStorage');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, syncAcrossTabs]);

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;
      
      const serializedValue = serialize(valueToStore);
      localStorage.setItem(key, serializedValue);
      setValueState(valueToStore);
      setError(null);
    } catch (err) {
      console.error(`Error setting localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to save to localStorage');
    }
  }, [key, serialize, value]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValueState(defaultValue);
      setError(null);
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to remove from localStorage');
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue,
    removeValue,
    isLoaded,
    error
  };
};
