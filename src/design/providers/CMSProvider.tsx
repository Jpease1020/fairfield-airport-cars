'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Simple cache to avoid repeated Firebase calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedCMSData: { data: any; ts: number } | null = null;

interface CMSContextType {
  cmsData: any;
  loading: boolean;
  error: string | null;
  updateField: (fieldPath: string, value: string) => Promise<void>;
  refresh: () => Promise<void>;
  reloadPage: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}

interface CMSProviderProps {
  children: React.ReactNode;
}

export function CMSProvider({ children }: CMSProviderProps) {
  const [cmsData, setCmsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllCMSData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cachedCMSData && (Date.now() - cachedCMSData.ts) < CACHE_DURATION) {
        setCmsData(cachedCMSData.data);
        setLoading(false);
        return;
      }

      // Load all CMS data for the entire app
      const response = await fetch('/api/admin/cms/pages?page=all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allCMSData = await response.json();
      
      // Cache the result
      cachedCMSData = { data: allCMSData, ts: Date.now() };
      
      setCmsData(allCMSData);
    } catch (err) {
      // Failed to load CMS data
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

      // Clear cache to force fresh load
      cachedCMSData = null;
      
      // Reload the page to get fresh data
      window.location.reload();
      
    } catch (err) {
      setError('Failed to update field');
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    // Clear cache and reload
    cachedCMSData = null;
    await loadAllCMSData();
  }, [loadAllCMSData]);

  const reloadPage = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    loadAllCMSData();
  }, [loadAllCMSData]);

  const value: CMSContextType = {
    cmsData,
    loading,
    error,
    updateField,
    refresh,
    reloadPage
  };

  return (
    <CMSContext.Provider value={value}>
      {children}
    </CMSContext.Provider>
  );
}
