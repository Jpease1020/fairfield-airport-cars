// Client-side CMS field hook with proper SSR handling
'use client';

import { useCMSData } from '@/design/providers/CMSDataProvider';

interface UseCMSFieldOptions {
  fallback?: string;
  pageId?: string;
}

export function useCMSField(fieldId: string, options: UseCMSFieldOptions = {}) {
  const { cmsData } = useCMSData();
  const { fallback = '', pageId } = options;
  
  // Handle client-side rendering
  if (typeof window === 'undefined') {
    return fallback;
  }
  
  // Get page-specific data or global data
  const pageData = pageId ? cmsData?.[pageId] : cmsData;
  
  // Return field value or fallback
  return pageData?.[fieldId] || fallback;
}

// Hook for getting entire page data
export function usePageCMSData(pageId: string) {
  const { cmsData } = useCMSData();
  
  if (typeof window === 'undefined') {
    return {};
  }
  
  return cmsData?.[pageId] || {};
}
