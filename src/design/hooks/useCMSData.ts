'use client';

import { useState, useEffect, useCallback } from 'react';

// Simple cache per-page to avoid repeated Firebase calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cachedCMSDataByPage: Record<string, { data: any; ts: number }> = {};

function derivePageIdFromPath(pathname: string): string {
  const clean = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) return 'home';
  const [first, ...rest] = clean.split('/');
  if (first === 'booking' && rest.length > 0) return 'booking';
  if (first === 'book') return 'booking';
  if (first === 'payments' && rest[0] === 'pay-balance') return 'payments';
  return first;
}

export function useCMSData() {
  const [cmsData, setCmsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCMSConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const pageId = derivePageIdFromPath(pathname);

      // Check cache for this page first
      const cacheEntry = cachedCMSDataByPage[pageId];
      if (cacheEntry && (Date.now() - cacheEntry.ts) < CACHE_DURATION) {
        setCmsData(cacheEntry.data);
        setLoading(false);
        return;
      }

      // Try to load from Firebase
      const response = await fetch(`/api/admin/cms/pages?page=${encodeURIComponent(pageId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const cmsConfig = await response.json();
      
      // Cache the result for this page
      cachedCMSDataByPage[pageId] = { data: cmsConfig, ts: Date.now() };
      
      setCmsData(cmsConfig);
    } catch (err) {
      setError('Failed to load content');
      setCmsData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = useCallback(async (fieldPath: string, value: string) => {
    try {
      // Update in Firebase
      const response = await fetch('/api/admin/cms/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fieldPath, value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update field: ${response.status}`);
      }

      // Clear cache for current page to force fresh load
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const pageId = derivePageIdFromPath(pathname);
      delete cachedCMSDataByPage[pageId];
      
      // Reload the page to get fresh data
      window.location.reload();
      
    } catch (err) {
      setError('Failed to update field');
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    // Clear cache for current page and reload
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const pageId = derivePageIdFromPath(pathname);
    delete cachedCMSDataByPage[pageId];
    await loadCMSConfig();
  }, [loadCMSConfig]);

  const reloadPage = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    loadCMSConfig();
  }, [loadCMSConfig]);

  return {
    cmsData,
    loading,
    error,
    updateField,
    refresh,
    reloadPage
  };
}

// Helper function to get field value from CMS data
export function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  // Try direct path first
  const directParts = fieldPath.split('.');
  let value = resolvePath(cmsData, directParts);

  // Fallback: if not found and the path is not already under pages.*, try pages.<first>...
  if (value === undefined && directParts[0] !== 'pages') {
    const fallbackParts = ['pages', ...directParts];
    value = resolvePath(cmsData, fallbackParts);
  }

  return typeof value === 'string' ? (value as string) : defaultValue;
}
