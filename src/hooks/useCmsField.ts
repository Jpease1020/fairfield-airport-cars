'use client';

import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

export function useCmsField(path: string, fallback = ''): string {
  const { cmsData } = useCMSData();
  return getCMSField(cmsData, path, fallback);
}


