'use client';

import { useState, useEffect } from 'react';

interface UsePageDataReturn {
  data: any;
  loading: boolean;
  error: string | null;
  updateField: (fieldPath: string, value: string) => Promise<void>;
}

export function usePageData(pageId: string): UsePageDataReturn {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[usePageData] Fetching data for page: ${pageId}`);
        const response = await fetch(`/api/admin/cms/pages?page=${pageId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const pageData = await response.json();
        console.log(`[usePageData] Data received for ${pageId}:`, pageData);
        setData(pageData);
      } catch (err) {
        console.error('Failed to load page data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [pageId]);

  // Update field function
  const updateField = async (fieldPath: string, value: string) => {
    try {
      console.log('Updating field:', fieldPath, '=', value);
      
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

      console.log('Field updated successfully, reloading data...');
      
      // Reload the data to get fresh content
      const refreshResponse = await fetch(`/api/admin/cms/pages?page=${pageId}`);
      if (refreshResponse.ok) {
        const freshData = await refreshResponse.json();
        setData(freshData);
      }
      
    } catch (err) {
      console.error('Failed to update field:', err);
      throw err;
    }
  };

  return { data, loading, error, updateField };
}
