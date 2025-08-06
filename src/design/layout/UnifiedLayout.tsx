'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SimpleLayout } from './SimpleLayout';

interface UnifiedLayoutProps {
  children: React.ReactNode;
}

/**
 * UnifiedLayout - Automatically detects route type and applies appropriate layout
 * 
 * Route detection logic:
 * - /admin/* -> admin layout
 * - /(customer)/* -> customer layout  
 * - /(public)/* -> public layout
 * - /login, /register, etc. -> public layout
 * 
 * This eliminates the need for individual layout wrappers on each page.
 */
export function UnifiedLayout({ children }: UnifiedLayoutProps) {
  const pathname = usePathname();
  
  // Determine layout variant based on route
  const getLayoutVariant = (): 'public' | 'customer' | 'admin' => {
    if (pathname.startsWith('/admin')) {
      return 'admin';
    }
    
    if (pathname.startsWith('/book') || 
        pathname.startsWith('/portal') || 
        pathname.startsWith('/manage') || 
        pathname.startsWith('/status') || 
        pathname.startsWith('/tracking') || 
        pathname.startsWith('/payments') || 
        pathname.startsWith('/profile') || 
        pathname.startsWith('/feedback') || 
        pathname.startsWith('/booking')) {
      return 'customer';
    }
    
    // Default to public for landing pages, login, etc.
    return 'public';
  };

  const variant = getLayoutVariant();

  return (
    <SimpleLayout variant={variant}>
      {children}
    </SimpleLayout>
  );
} 