'use client';

import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';

export function useCmsField(path: string, fallback = ''): string {
  const { cmsData } = useCMSData();
  return getCMSField(cmsData, path, fallback);
}


