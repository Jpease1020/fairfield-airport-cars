'use client';

import { useEffect, ReactNode } from 'react';
import { generateCSSVariables } from '@/lib/design';

interface CMSDesignProviderProps {
  children: ReactNode;
}

export function CMSDesignProvider({ children }: CMSDesignProviderProps) {
  useEffect(() => {
    // Apply CMS design system CSS variables on mount
    const applyCMSDesign = () => {
      try {
        // Try to get CMS config (simplified approach)
        let cmsConfig = {};
        
        // Check if we have stored CMS config
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('cmsConfig');
          if (stored) {
            try {
              cmsConfig = JSON.parse(stored);
            } catch (e) {
              console.warn('Invalid stored CMS config, using defaults');
            }
          }
        }
        
        // Generate and apply CSS variables
        if (typeof window !== 'undefined') {
          const cssVars = generateCSSVariables(cmsConfig);
          const rootElement = document.documentElement;
          
          Object.entries(cssVars).forEach(([property, value]) => {
            rootElement.style.setProperty(property, String(value));
          });
          
          console.log('✅ CMS Design System applied successfully');
        }
      } catch (error) {
        console.warn('CMS design system initialization failed, using defaults:', error);
        
        // Fallback: apply defaults
        if (typeof window !== 'undefined') {
          const defaultVars = generateCSSVariables({});
          const rootElement = document.documentElement;
          Object.entries(defaultVars).forEach(([property, value]) => {
            rootElement.style.setProperty(property, String(value));
          });
        }
      }
    };

    applyCMSDesign();
  }, []);

  return <>{children}</>;
} 