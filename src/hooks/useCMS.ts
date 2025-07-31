'use client';

import { useState, useEffect } from 'react';
import { CMSConfiguration } from '@/types/cms';

export function useCMS() {
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCMS = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/cms/pages');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const cmsConfig = await response.json();
        setConfig(cmsConfig);
      } catch (err) {
        console.error('Failed to load CMS:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadCMS();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/cms/pages');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const cmsConfig = await response.json();
      setConfig(cmsConfig);
    } catch (err) {
      console.error('Failed to refresh CMS:', err);
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
    content: config?.pages?.home || null,
    loading,
    error
  };
}

export function useHelpPageContent() {
  const { config, loading, error } = useCMS();
  return {
    content: config?.pages?.help || null,
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