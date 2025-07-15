import { useState, useEffect } from 'react';
import { cmsService } from '@/lib/cms-service';
import { CMSConfiguration } from '@/types/cms';

export function useCMS() {
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = cmsService.subscribeToCMSUpdates((cmsConfig) => {
      setConfig(cmsConfig);
      setLoading(false);
      setError(null);
    });

    // Initial load
    const loadCMS = async () => {
      try {
        setLoading(true);
        setError(null);
        const cmsConfig = await cmsService.getCMSConfiguration();
        setConfig(cmsConfig);
      } catch {
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadCMS();

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const cmsConfig = await cmsService.getCMSConfiguration();
      setConfig(cmsConfig);
    } catch {
      setError('Failed to refresh content');
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    refresh
  };
}

// Specific hooks for different content types
export function useHomePageContent() {
  const { config, loading, error } = useCMS();
  return {
    content: config?.pages.home || null,
    loading,
    error
  };
}

export function useHelpPageContent() {
  const { config, loading, error } = useCMS();
  return {
    content: config?.pages.help || null,
    loading,
    error
  };
}

export function useBusinessSettings() {
  const { config, loading, error } = useCMS();
  return {
    settings: config?.business || null,
    loading,
    error
  };
}

export function usePricingSettings() {
  const { config, loading, error } = useCMS();
  return {
    settings: config?.pricing || null,
    loading,
    error
  };
} 