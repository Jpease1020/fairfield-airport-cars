import { useState, useCallback } from 'react';

export interface UseSettingsOptions<T> {
  defaultSettings: T;
  persistKey?: string;
  onSave?: (settings: T) => Promise<void>;
  onLoad?: () => Promise<T>;
}

export interface UseSettingsReturn<T> {
  settings: T;
  updateSetting: <K extends keyof T>(key: K, value: T[K]) => void;
  updateSettings: (updates: Partial<T>) => void;
  resetSettings: () => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  clearMessages: () => void;
}

export function useSettings<T extends Record<string, any>>(
  options: UseSettingsOptions<T>
): UseSettingsReturn<T> {
  const { defaultSettings, persistKey, onSave, onLoad } = options;
  
  const [settings, setSettings] = useState<T>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateSetting = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((updates: Partial<T>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setError(null);
    setSuccess(null);
  }, [defaultSettings]);

  const saveSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      if (onSave) {
        await onSave(settings);
      } else if (persistKey) {
        localStorage.setItem(persistKey, JSON.stringify(settings));
      }

      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [settings, onSave, persistKey]);

  const loadSettings = useCallback(async () => {
    try {
      setError(null);

      if (onLoad) {
        const loadedSettings = await onLoad();
        setSettings(loadedSettings);
      } else if (persistKey) {
        const stored = localStorage.getItem(persistKey);
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings.');
    }
  }, [onLoad, persistKey, defaultSettings]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    saveSettings,
    loadSettings,
    isSaving,
    error,
    success,
    clearMessages
  };
} 