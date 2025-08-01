'use client';

import React, { ReactNode } from 'react';

interface CMSDesignProviderProps {
  children: ReactNode;
}

export function CMSDesignProvider({ children }: CMSDesignProviderProps) {
  React.useEffect(() => {
    const loadCMSConfig = async () => {
      try {
        // Check if we have stored CMS config
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('cmsConfig');
          if (stored) {
            try {
              const config = JSON.parse(stored);
            } catch {
              //console.warn('Invalid stored CMS config, using defaults');
            }
          }
        }
      } catch (error) {
        //console.warn('CMS design system initialization failed, using defaults:', error);
      }
    };

    loadCMSConfig();
  }, []);

  return <>{children}</>;
} 